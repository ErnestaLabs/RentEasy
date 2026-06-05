import type { CardRenderSpec, ListingRecord, RankedListing, SignalInput, UserEmbeddingSeed } from './types';

const positiveTypes = new Set(['dwell', 'swipe_right', 'expand', 'explicit']);
const negativeTypes = new Set(['swipe_left', 'skip', 'hide']);

export function rankListings(input: {
  listings: ListingRecord[];
  embedding: UserEmbeddingSeed;
  recentSignals: SignalInput[];
  sessionId: string;
  userId?: string;
  page: number;
  limit: number;
}): { listings: RankedListing[]; total: number; nextPage: number | null; feedHeadline: string } {
  const scored = input.listings.map((listing) => {
    const score = scoreListing(listing, input.embedding, input.recentSignals);
    return {
      listingId: listing.id,
      score,
      listing,
      cardSpec: createCardRenderSpec({
        listing,
        embedding: input.embedding,
        recentSignals: input.recentSignals,
        sessionId: input.sessionId,
        userId: input.userId,
        score,
      }),
    };
  }).sort((a, b) => b.score - a.score);

  const diversified = injectDiversity(scored);
  const start = (input.page - 1) * input.limit;
  const pageRows = diversified.slice(start, start + input.limit);
  return {
    listings: pageRows,
    total: diversified.length,
    nextPage: start + input.limit < diversified.length ? input.page + 1 : null,
    feedHeadline: headlineFor(input.embedding),
  };
}

export function createCardRenderSpec(input: {
  listing: ListingRecord;
  embedding: UserEmbeddingSeed;
  recentSignals: SignalInput[];
  sessionId: string;
  userId?: string;
  score?: number;
}): CardRenderSpec {
  const { listing, embedding, recentSignals } = input;
  const expandedTransport = recentSignals.filter((signal) => signal.type === 'expand' && /transport|commute|station/i.test(signal.entityId)).length;
  const billsInterest = recentSignals.filter((signal) => signal.value > 0 && /bills/i.test(signal.entityId)).length;
  const ignoredLandlord = recentSignals.filter((signal) => negativeTypes.has(signal.type) && /landlord/i.test(signal.entityId)).length;
  const fieldOrder: CardRenderSpec['fieldOrder'] = ['price', 'location', 'bills', 'transport', 'roommates', 'landlord'];

  if (billsInterest >= 3) moveFirst(fieldOrder, 'bills');
  if (expandedTransport >= 2) moveFirst(fieldOrder, 'transport');
  if (ignoredLandlord >= 2) moveLast(fieldOrder, 'landlord');

  const primaryPhotoIndex = pickPhotoIndex(listing, embedding);
  const urgency = embedding.urgencyScore > 0.7 ? 'high' : embedding.urgencyScore < 0.4 ? 'low' : 'standard';
  const revisiting = recentSignals.some((signal) => signal.entityId === listing.id && signal.type === 'dwell');
  const ctaText = revisiting
    ? 'Back again? Ready to enquire?'
    : embedding.coldStartStage <= 1
      ? 'Send your interest'
      : embedding.urgencyScore < 0.4
        ? 'Add to shortlist'
        : embedding.urgencyScore > 0.7
          ? 'Act now - high demand area'
          : 'Match with this landlord';

  return {
    listingId: listing.id,
    userId: input.userId,
    sessionId: input.sessionId,
    fieldOrder,
    highlightedFeatures: listing.features.slice(0, 3),
    suppressedFields: ignoredLandlord >= 2 ? ['landlord'] : [],
    primaryPhotoIndex,
    photoCount: listing.photos.length,
    primaryCTA: embedding.urgencyScore < 0.4 ? 'save' : 'match',
    ctaUrgency: urgency,
    ctaText,
    socialProofType: listing.landlordResponseRate > 0.85 ? 'landlord-response-time' : listing.viewCount > 120 ? 'views-today' : 'match-count',
    whyThisForYou: whyThisForYou(listing, embedding),
    showReputation: listing.reputationScore >= 70,
    reputationWeight: listing.reputationScore >= 85 ? 'prominent' : 'subtle',
    score: Math.round(input.score ?? scoreListing(listing, embedding, recentSignals)),
  };
}

export function scoreListing(listing: ListingRecord, embedding: UserEmbeddingSeed, recentSignals: SignalInput[]) {
  const price = priceScore(listing, embedding);
  const location = embedding.locationAffinity[listing.location.city] || embedding.locationAffinity[listing.location.district] || 0.25;
  const type = embedding.propertyTypeAffinity[listing.propertyType] || 0.25;
  const features = listing.features.reduce((sum, feature) => sum + (embedding.featureAffinity[feature] || 0), 0) / Math.max(1, listing.features.length);
  const trust = (listing.reputationScore / 100) * 0.7 + listing.landlordResponseRate * 0.3;
  const engagement = Math.min(1, (listing.matchCount / 20) * 0.55 + (listing.viewCount / 250) * 0.45);
  const signalDelta = signalBoost(listing, recentSignals);
  return clamp((price * 20 + location * 20 + type * 15 + features * 15 + trust * 15 + engagement * 10 + signalDelta * 5) * 1.1, 1, 100);
}

function priceScore(listing: ListingRecord, embedding: UserEmbeddingSeed) {
  const { min, max, sweet } = embedding.priceAffinity;
  if (listing.price < min || listing.price > max) return 0.25;
  const distance = Math.abs(listing.price - sweet);
  const range = Math.max(1, max - min);
  return clamp(1 - distance / range, 0.35, 1);
}

function signalBoost(listing: ListingRecord, signals: SignalInput[]) {
  let boost = 0;
  for (const signal of signals) {
    const related = signal.entityId === listing.id || listing.features.some((feature) => signal.entityId.toLowerCase().includes(feature.toLowerCase()));
    if (!related) continue;
    if (positiveTypes.has(signal.type)) boost += 0.2;
    if (negativeTypes.has(signal.type)) boost -= 0.35;
  }
  return clamp(boost, -1, 1);
}

function injectDiversity(rows: RankedListing[]) {
  const output: RankedListing[] = [];
  const queue = [...rows];
  while (queue.length) {
    const last = output.at(-1);
    const pickIndex = queue.findIndex((row, index) => index === 0 || (row.listing.landlordId !== last?.listing.landlordId && row.listing.location.district !== last?.listing.location.district));
    const [pick] = queue.splice(Math.max(0, pickIndex), 1);
    output.push(pick);
  }
  return output.map((row, index) => index > 0 && index % 5 === 0 ? { ...row, score: Math.max(1, row.score - 2) } : row);
}

function whyThisForYou(listing: ListingRecord, embedding: UserEmbeddingSeed) {
  const topFeature = listing.features.find((feature) => (embedding.featureAffinity[feature] || 0) > 0.25) || listing.features[0];
  if (listing.billsIncluded && topFeature === 'bills included') return `Bills-included ${listing.propertyType.toLowerCase()} in your preferred ${listing.location.district} area`;
  if (listing.landlordResponseRate > 0.85) return `Fast-responding landlord within your budget in ${listing.location.district}`;
  return `${topFeature} option in ${listing.location.district}, matched to your current signals`;
}

function pickPhotoIndex(listing: ListingRecord, embedding: UserEmbeddingSeed) {
  if (embedding.featureAffinity.garden && listing.features.includes('garden')) return Math.min(1, listing.photos.length - 1);
  return 0;
}

function headlineFor(embedding: UserEmbeddingSeed) {
  if (embedding.coldStartStage === 0) return 'Strong starting points for your rental search';
  if (embedding.urgencyScore > 0.7) return 'High-fit options ready to act on';
  return 'Updated around your latest signals';
}

function moveFirst<T>(items: T[], item: T) {
  const index = items.indexOf(item);
  if (index > 0) items.unshift(...items.splice(index, 1));
}

function moveLast<T>(items: T[], item: T) {
  const index = items.indexOf(item);
  if (index >= 0) items.push(...items.splice(index, 1));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

