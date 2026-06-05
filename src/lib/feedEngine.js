export const FEED_SCORE_WEIGHTS = {
  criteriaMatch: 0.3,
  behavioralSimilarity: 0.25,
  trustCompatibility: 0.15,
  engagementVelocity: 0.15,
  recency: 0.1,
  explorationBonus: 0.05,
};

const systemHeroImages = [
  '/pexels/images/stratford-room.jpg',
  '/pexels/images/feed-flat-1.jpg',
  '/pexels/images/feed-room-1.jpg',
  '/pexels/images/greenwich-viewings.jpg',
  '/pexels/images/bow-landlord-flat.jpg',
  '/pexels/images/northwest-investor.jpg',
  '/pexels/images/operator-west-london.jpg',
  '/pexels/images/leeds-student-house.jpg',
  '/pexels/images/canary-area-insight.jpg',
  '/pexels/images/feed-moving.jpg',
  '/pexels/images/feed-balcony-1.jpg',
  '/pexels/images/feed-kitchen-1.jpg',
  '/pexels/images/feed-house-1.jpg',
  '/pexels/images/feed-office-agent.jpg',
  '/pexels/images/referencing-question.jpg',
  '/pexels/images/shoreditch-short-stay.jpg',
  '/pexels/images/perk-storage.jpg',
  '/pexels/images/perk-broadband.jpg',
];

const adjacentAreas = {
  Bow: ['Stratford', 'Hackney', 'Canary Wharf'],
  Hackney: ['Bow', 'Stratford', 'Shoreditch'],
  Stratford: ['Bow', 'Hackney', 'Greenwich'],
  Clapham: ['Brixton', 'Balham', 'Stockwell'],
  Greenwich: ['Canary Wharf', 'Stratford', 'Deptford'],
  Manchester: ['Liverpool', 'Leeds'],
  Liverpool: ['Manchester', 'Leeds'],
  Leeds: ['Manchester', 'Liverpool'],
};

export function roleRelevantPostTypes(role = '') {
  const map = {
    Tenant: ['Property', 'Room', 'Looking', 'House Buddy', 'Short-Term Stay', 'Serviced Accommodation', 'Advice', 'Question', 'Area Insight', 'Availability'],
    'House Buddy': ['Room', 'House Buddy', 'Looking', 'Property', 'Advice', 'Question', 'Area Insight'],
    Landlord: ['Looking', 'House Buddy', 'Landlord Opportunity', 'Agent Update', 'Operator Offer', 'Investor Brief', 'Advice', 'Area Insight'],
    'Individual Agent': ['Looking', 'House Buddy', 'Property', 'Room', 'Landlord Opportunity', 'Agent Update', 'Area Insight', 'Availability'],
    'Agency / Business': ['Looking', 'House Buddy', 'Property', 'Room', 'Landlord Opportunity', 'Agent Update', 'Operator Offer', 'Area Insight'],
    Operator: ['Landlord Opportunity', 'Property', 'Serviced Accommodation', 'Operator Offer', 'Investor Brief', 'Sourcer Deal', 'Area Insight'],
    Sourcer: ['Investor Brief', 'Sourcer Deal', 'Landlord Opportunity', 'Operator Offer', 'Area Insight'],
    Investor: ['Sourcer Deal', 'Investor Brief', 'Landlord Opportunity', 'Operator Offer', 'Area Insight'],
    'Short-Term Guest': ['Short-Term Stay', 'Serviced Accommodation', 'Availability', 'Advice', 'Question', 'Area Insight'],
    'Short-Term Host': ['Short-Term Stay', 'Serviced Accommodation', 'Operator Offer', 'Landlord Opportunity', 'Area Insight', 'Availability'],
  };
  return map[role] || ['Property', 'Room', 'Looking', 'House Buddy', 'Short-Term Stay', 'Landlord Opportunity', 'Investor Brief', 'Sourcer Deal', 'Advice', 'Question', 'Area Insight'];
}

export function postTextIncludes(post, signal) {
  if (!signal) return false;
  const needle = String(signal).toLowerCase();
  const haystack = [post.title, post.body, post.area, post.budget, ...(post.tags || [])].join(' ').toLowerCase();
  return needle.split(/[,\s/]+/).filter((part) => part.length > 2).some((part) => haystack.includes(part));
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function extractNumbers(text = '') {
  return String(text).replace(/,/g, '').match(/\d+/g)?.map(Number) || [];
}

function hasBudgetOverlap(postBudget, userBudget) {
  const postNumbers = extractNumbers(postBudget);
  const userNumbers = extractNumbers(userBudget);
  if (!postNumbers.length || !userNumbers.length) return false;
  const postLow = Math.min(...postNumbers);
  const postHigh = Math.max(...postNumbers);
  const userLow = Math.min(...userNumbers);
  const userHigh = Math.max(...userNumbers);
  return postLow <= userHigh * 1.08 && postHigh >= userLow * 0.82;
}

function ageHours(post, now = Date.now()) {
  const parsed = new Date(post.createdAt).getTime();
  if (Number.isNaN(parsed)) return 168;
  return Math.max(0, (now - parsed) / 3600000);
}

function deriveAreaSignals(profile = {}, answers = {}) {
  return [profile.area, answers['tenant-areas'], answers['buddy-areas'], answers['investor-areas']]
    .filter(Boolean)
    .flatMap((signal) => String(signal).split(/[,/]+/).map((part) => part.trim()).filter(Boolean));
}

function deriveBudgetSignals(profile = {}, answers = {}) {
  return [profile.budget, answers['tenant-budget'], answers['buddy-budget'], answers['investor-budget']].filter(Boolean);
}

export function buildNegativeSuppression(signals = [], now = Date.now()) {
  const suppression = new Map();
  signals.forEach((signal) => {
    const postId = signal.postId || signal.targetId;
    if (!postId) return;
    const created = new Date(signal.createdAt || now).getTime();
    const metadata = signal.metadata || {};
    let days = 0;
    let strength = 0;
    let reason = '';

    if (signal.type === 'not_interested' || signal.eventType === 'feed_not_interested') {
      days = 30;
      strength = 1;
      reason = 'Not interested';
    } else if ((signal.type === 'swipe' || signal.eventType === 'feed_swipe') && metadata.direction === 'left' && Number(metadata.speedMs || 9999) <= 900) {
      days = 14;
      strength = 1;
      reason = 'Fast pass';
    } else if (signal.type === 'immediate_exit' || signal.eventType === 'feed_immediate_exit') {
      days = 3;
      strength = 0.35;
      reason = 'Quick exit';
    }

    if (!days) return;
    const expiresAt = created + days * 24 * 60 * 60 * 1000;
    if (expiresAt <= now) return;
    const existing = suppression.get(postId);
    if (!existing || existing.strength < strength) suppression.set(postId, { strength, reason, expiresAt });
  });
  return suppression;
}

function scoreCriteria(post, { profile = {}, answers = {} }) {
  const relevantTypes = roleRelevantPostTypes(profile.role);
  const areaSignals = deriveAreaSignals(profile, answers);
  const budgetSignals = deriveBudgetSignals(profile, answers);
  let score = 22;
  const reasons = [];

  if (relevantTypes.includes(post.postType)) {
    score += 32;
    reasons.push('Criteria: role fit');
  }
  if (areaSignals.some((signal) => postTextIncludes(post, signal))) {
    score += 24;
    reasons.push('Criteria: area fit');
  }
  if (budgetSignals.some((signal) => hasBudgetOverlap(post.budget, signal) || postTextIncludes(post, signal))) {
    score += 22;
    reasons.push('Criteria: budget fit');
  }
  return { score: clamp(score), reasons };
}

function scoreBehavior(post, { behavioralEvents = [], feedSignals = [], likedIds = [], savedIds = [], followedIds = [] }) {
  const signals = [...behavioralEvents, ...feedSignals];
  const positiveTypes = new Set(signals.filter((event) => ['post_liked', 'post_saved', 'post_shared', 'feed_match', 'feed_save', 'feed_expand', 'feed_dwell'].includes(event.eventType || event.type)).map((event) => event.metadata?.postType).filter(Boolean));
  const positiveAreas = new Set(signals.filter((event) => ['feed_match', 'feed_save', 'feed_dwell'].includes(event.eventType || event.type)).map((event) => event.metadata?.area).filter(Boolean));
  let score = 35;
  const reasons = [];

  if (likedIds.includes(post.id) || savedIds.includes(post.id)) {
    score += 18;
    reasons.push('Behaviour: saved or liked');
  }
  if (followedIds.includes(post.authorId)) {
    score += 18;
    reasons.push('Behaviour: followed source');
  }
  if (positiveTypes.has(post.postType)) {
    score += 18;
    reasons.push('Behaviour: similar content');
  }
  if (positiveAreas.has(post.area)) {
    score += 11;
    reasons.push('Behaviour: area interest');
  }
  return { score: clamp(score), reasons };
}

function scoreTrust(post) {
  let score = 48;
  const reasons = [];
  if (['Agent', 'Landlord', 'Short-Term Host', 'Operator', 'Sourcer'].includes(post.authorType)) {
    score += 18;
    reasons.push('Trust: source type visible');
  }
  if ((post.tags || []).some((tag) => /documents|viewing|bills|numbers|reporting|verified|compliant/i.test(tag))) {
    score += 16;
    reasons.push('Trust: practical detail');
  }
  if (post.sponsoredStatus) {
    score += 6;
    reasons.push('Trust: labelled promotion');
  }
  return { score: clamp(score), reasons };
}

function scoreEngagementVelocity(post, { comments = [] }) {
  const liveComments = comments.filter((comment) => comment.postId === post.id).length;
  const interactions = Number(post.likeCount || 0) + Number(post.saveCount || 0) + Number(post.commentCount || 0) + liveComments + Number(post.shareCount || 0);
  const hours = Math.max(1, ageHours(post));
  const velocity = interactions / Math.sqrt(hours);
  const score = clamp(35 + velocity * 18 + Math.min(22, interactions * 3));
  return { score, reasons: interactions ? ['Velocity: active post'] : [] };
}

function scoreRecency(post) {
  const hours = ageHours(post);
  if (hours <= 24) return { score: 100, reasons: ['Fresh'] };
  if (hours <= 72) return { score: 78, reasons: ['Recent'] };
  if (hours <= 168) return { score: 58, reasons: [] };
  return { score: 34, reasons: ['Older signal'] };
}

function classifyExploration(post, { profile = {}, answers = {} }) {
  const relevantTypes = roleRelevantPostTypes(profile.role);
  const areaSignals = deriveAreaSignals(profile, answers);
  const budgetSignals = deriveBudgetSignals(profile, answers);
  const areaFit = areaSignals.some((signal) => postTextIncludes(post, signal));
  const adjacentFit = areaSignals.some((signal) => (adjacentAreas[signal] || []).some((area) => postTextIncludes(post, area)));
  const typeFit = relevantTypes.includes(post.postType);
  const budgetFit = budgetSignals.some((signal) => hasBudgetOverlap(post.budget, signal) || postTextIncludes(post, signal));

  if (!areaFit && adjacentFit) return { isExploration: true, reason: 'Adjacent area' };
  if (typeFit && !budgetFit && budgetSignals.length) return { isExploration: true, reason: 'Budget stretch' };
  if (!typeFit && areaFit) return { isExploration: true, reason: 'Different property type' };
  if (!typeFit && !areaFit) return { isExploration: true, reason: 'Wildcard' };
  return { isExploration: false, reason: '' };
}

export function scoreFeedCard(post, context = {}) {
  const criteria = scoreCriteria(post, context);
  const behavior = scoreBehavior(post, context);
  const trust = scoreTrust(post);
  const engagement = scoreEngagementVelocity(post, context);
  const recency = scoreRecency(post);
  const exploration = classifyExploration(post, context);
  const explorationScore = exploration.isExploration ? 100 : 0;
  const score = Math.round(
    criteria.score * FEED_SCORE_WEIGHTS.criteriaMatch +
    behavior.score * FEED_SCORE_WEIGHTS.behavioralSimilarity +
    trust.score * FEED_SCORE_WEIGHTS.trustCompatibility +
    engagement.score * FEED_SCORE_WEIGHTS.engagementVelocity +
    recency.score * FEED_SCORE_WEIGHTS.recency +
    explorationScore * FEED_SCORE_WEIGHTS.explorationBonus
  );
  const objective = ['Question', 'Advice', 'Area Insight'].includes(post.postType)
    ? 'Progress'
    : engagement.score >= 55 || context.followedIds?.includes(post.authorId)
      ? 'Social proof'
      : 'Discovery';

  return {
    postId: post.id,
    score: clamp(score),
    objective,
    band: score >= 72 ? 'high' : score >= 48 ? 'medium' : 'near',
    isExploration: exploration.isExploration,
    explorationReason: exploration.reason,
    reasons: [...new Set([...criteria.reasons, ...behavior.reasons, ...trust.reasons, ...engagement.reasons, ...recency.reasons])].slice(0, 6),
    negativeSignals: [],
    components: {
      criteriaMatch: Math.round(criteria.score),
      behavioralSimilarity: Math.round(behavior.score),
      trustCompatibility: Math.round(trust.score),
      engagementVelocity: Math.round(engagement.score),
      recency: Math.round(recency.score),
      explorationBonus: explorationScore,
    },
    calculatedAt: new Date().toISOString(),
  };
}

function groupByBand(scored) {
  const high = [];
  const medium = [];
  const exploration = [];
  const near = [];
  scored.forEach((item) => {
    if (item.ranking.isExploration) exploration.push(item);
    else if (item.ranking.band === 'high') high.push(item);
    else if (item.ranking.band === 'medium') medium.push(item);
    else near.push(item);
  });
  return { high, medium, exploration, near };
}

function nextNonRepeating(pool, used, lastAuthor, recentAreas, recentTypes) {
  if (!pool.length) return null;
  const index = pool.findIndex((item) => {
    const authorOk = item.post.authorId !== lastAuthor || pool.length === 1;
    const areaOk = !recentAreas.slice(-2).includes(item.post.area) || pool.length < 3;
    const typeOk = recentTypes.slice(-2).filter((type) => type === item.post.postType).length < 2;
    return authorOk && areaOk && typeOk && !used.has(item.post.id);
  });
  const selectedIndex = index >= 0 ? index : pool.findIndex((item) => !used.has(item.post.id));
  return selectedIndex >= 0 ? pool[selectedIndex] : null;
}

function makeContinuityCard(kind, index, context = {}) {
  const area = deriveAreaSignals(context.profile, context.answers)[0] || 'your area';
  const templates = {
    near_match: ['Near match', `Homes and rooms close to ${area}`, 'A nearby card can teach RentEazy what to show next.', 'Near match'],
    area_intelligence: ['Area pulse', `${area} market movement`, 'Fresh local patterns keep discovery useful between listings.', 'Area insight'],
    community_market: ['Local signal', 'What renters nearby are asking', 'Questions, saves, and viewing posts help tune the next card.', 'Community signal'],
    adjacent_geography: ['Adjacent area', `Worth checking near ${area}`, 'Nearby areas can reveal better value without widening too far.', 'Exploration'],
  };
  const [postType, title, body, tag] = templates[kind] || templates.near_match;
  return {
    post: {
      id: `feed-continuity-${kind}-${index}`,
      authorId: 'renteazy-feed-engine',
      authorType: 'RentEazy',
      authorName: 'RentEazy Feed',
      postType,
      title,
      body,
      media: [],
      area,
      budget: 'Signal card',
      tags: [tag, 'Keeps Feed moving'],
      visibility: 'public',
      sponsoredStatus: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likeCount: 0,
      commentCount: 0,
      saveCount: 0,
      shareCount: 0,
      systemCard: true,
    },
    ranking: {
      postId: `feed-continuity-${kind}-${index}`,
      score: 54,
      objective: kind === 'area_intelligence' ? 'Progress' : 'Discovery',
      band: 'near',
      isExploration: kind === 'adjacent_geography',
      explorationReason: kind === 'adjacent_geography' ? 'Adjacent geography' : '',
      reasons: ['Infinite Feed state', 'Keeps discovery moving'],
      negativeSignals: [],
      components: {},
      calculatedAt: new Date().toISOString(),
    },
    streamKind: kind,
  };
}

function composeFeed(scored, context, minItems = 36) {
  const { high, medium, exploration, near } = groupByBand(scored);
  const ordered = [];
  const used = new Set();
  const recentAreas = [];
  const recentTypes = [];
  let highIndex = 0;
  let mediumIndex = 0;
  let explorationIndex = 0;
  let nearIndex = 0;
  const pattern = ['high', 'medium', 'high', 'near', 'exploration'];

  while (ordered.length < Math.min(minItems, scored.length)) {
    const slot = pattern[ordered.length % pattern.length];
    let pool = slot === 'exploration' ? exploration : slot === 'medium' ? medium : slot === 'near' ? near : high;
    if (!pool.length) pool = slot === 'exploration' ? near : slot === 'high' ? medium : high;
    if (!pool.length) pool = scored;
    let candidate = nextNonRepeating(pool, used, ordered.at(-1)?.post.authorId, recentAreas, recentTypes);
    if (!candidate && pool !== scored) {
      candidate = nextNonRepeating(scored, used, ordered.at(-1)?.post.authorId, recentAreas, recentTypes);
    }
    if (!candidate) break;
    used.add(candidate.post.id);
    recentAreas.push(candidate.post.area);
    recentTypes.push(candidate.post.postType);
    ordered.push({
      ...candidate,
      rewardSpike: ordered.length > 0 && ordered.length % 6 === 0 && candidate.ranking.band === 'high',
      slotType: slot,
      sequence: ordered.length,
    });
    highIndex += slot === 'high' ? 1 : 0;
    mediumIndex += slot === 'medium' ? 1 : 0;
    explorationIndex += slot === 'exploration' ? 1 : 0;
    nearIndex += slot === 'near' ? 1 : 0;
  }

  return ordered.map((item, index) => ({
    ...item,
    streamId: `${item.post.id}-${index}`,
    card: createFeedCardSchema(item.post, item.ranking, index),
  }));
}

export function buildRentEazyFeed({ posts = [], profile = {}, answers = {}, followedIds = [], likedIds = [], savedIds = [], hiddenPostIds = [], comments = [], behavioralEvents = [], feedSignals = [], activeFeedTab = 'For You', minItems = 36 } = {}) {
  const suppression = buildNegativeSuppression([...behavioralEvents, ...feedSignals]);
  const tabFiltered = posts.filter((post) => {
    if (hiddenPostIds.includes(post.id)) return false;
    const suppressionRule = suppression.get(post.id);
    if (suppressionRule?.strength >= 1) return false;
    if (activeFeedTab === 'For You') return true;
    if (activeFeedTab === 'Following') return followedIds.includes(post.authorId);
    if (activeFeedTab === 'Properties') return ['Property', 'Room', 'Serviced Accommodation'].includes(post.postType);
    if (activeFeedTab === 'Short-Term') return ['Short-Term Stay', 'Serviced Accommodation', 'Availability'].includes(post.postType);
    if (activeFeedTab === 'House Buddies') return post.postType === 'House Buddy';
    if (activeFeedTab === 'Advice') return ['Advice', 'Question', 'Area Insight', 'Success Story'].includes(post.postType);
    return post.postType.toLowerCase().includes(activeFeedTab.toLowerCase().replace(/s$/, '')) || post.authorType.toLowerCase().includes(activeFeedTab.toLowerCase().replace(/s$/, ''));
  });
  const context = { profile, answers, followedIds, likedIds, savedIds, comments, behavioralEvents, feedSignals };
  const scored = tabFiltered.map((post) => {
    const ranking = scoreFeedCard(post, context);
    const suppressionRule = suppression.get(post.id);
    if (suppressionRule?.strength) {
      ranking.score = Math.max(1, Math.round(ranking.score * (1 - suppressionRule.strength)));
      ranking.negativeSignals = [suppressionRule.reason];
    }
    return { post, ranking };
  }).sort((a, b) => b.ranking.score - a.ranking.score);

  const items = composeFeed(scored, context, minItems);
  const explorationCount = items.filter((item) => item.ranking.isExploration).length;
  const highCount = items.filter((item) => item.ranking.band === 'high').length;
  const state = scored.length === 0
    ? 'continuity'
    : highCount ? 'reward_stream' : explorationCount ? 'near_match_stream' : 'market_intelligence_stream';

  return {
    items,
    state,
    rankingById: new Map(items.map((item) => [item.post.id, item.ranking])),
    diagnostics: {
      totalItems: items.length,
      explorationRatio: items.length ? explorationCount / items.length : 0,
      exploitationRatio: items.length ? (items.length - explorationCount) / items.length : 0,
      state,
    },
  };
}

export function createFeedCardSchema(post, ranking = {}, index = 0) {
  const imageIndex = Math.abs(Array.from(String(post.id || index)).reduce((sum, char) => sum + char.charCodeAt(0), 0)) % systemHeroImages.length;
  const beds = /studio/i.test(`${post.title} ${post.body}`) ? 'Studio' : /two-bed|2 bed|two bed/i.test(`${post.title} ${post.body}`) ? '2 bed' : /one-bed|1 bed|one bed/i.test(`${post.title} ${post.body}`) ? '1 bed' : post.postType === 'Room' ? 'Room' : 'Flexible';
  const baths = post.postType === 'Room' ? 'Shared bath' : 'Bath info pending';
  const trustSignal = post.sponsoredStatus ? `${post.sponsoredStatus} · labelled` : post.authorType ? `${post.authorType} source` : 'Visible source';
  const standout = post.tags?.[0] || ranking.reasons?.[0] || 'Relevant rental signal';
  const reasons = ranking.reasons || [];
  const fieldOrder = ['price', 'location', 'match', 'trust'];
  if (reasons.some((reason) => /area/i.test(reason))) fieldOrder.unshift('location');
  if (reasons.some((reason) => /budget/i.test(reason))) fieldOrder.unshift('price');
  if (reasons.some((reason) => /trust|source|detail/i.test(reason))) fieldOrder.push('trust');
  const orderedFields = [...new Set(fieldOrder)].slice(0, 4);
  const primaryCTA = ranking.band === 'high' ? 'match' : ranking.isExploration ? 'save' : 'comment';
  const ctaText = primaryCTA === 'match' ? 'I’m interested' : primaryCTA === 'save' ? 'Save this' : 'Join the conversation';
  const whyThisForYou = ranking.isExploration
    ? `A nearby ${post.postType || 'rental'} signal to widen discovery without flooding your Feed.`
    : reasons.find((reason) => /area|budget|role|behaviour|trust/i.test(reason)) || standout;
  return {
    id: post.id,
    heroImage: post.media?.[0] || systemHeroImages[imageIndex],
    matchPercent: Math.round(ranking.score || 50),
    price: post.budget || 'Price signal pending',
    area: post.area || 'Area signal pending',
    bedsBaths: `${beds} · ${baths}`,
    trustSignal,
    standout,
    explorationLabel: ranking.isExploration ? `Exploration: ${ranking.explorationReason || 'controlled deviation'}` : '',
    fieldOrder: orderedFields,
    primaryCTA,
    ctaText,
    whyThisForYou,
    actions: ['pass', 'match'],
  };
}

export function createFeedSignal({ type, post, metadata = {} }) {
  return {
    id: `feed-signal-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    eventType: `feed_${type}`,
    targetType: 'feed_card',
    targetId: post?.id || '',
    postId: post?.id || '',
    metadata: {
      postType: post?.postType,
      authorId: post?.authorId,
      area: post?.area,
      ...metadata,
    },
    createdAt: new Date().toISOString(),
  };
}
