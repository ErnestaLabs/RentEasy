import crypto from 'node:crypto';
import type { ActivityEvent, ListingRecord, SessionRecord, SignalInput, StoredSignal, UserEmbedding, UserEmbeddingSeed, UserRole } from './types';

const now = () => Date.now();
const iso = (time = now()) => new Date(time).toISOString();
const daysAgo = (days: number) => iso(now() - days * 24 * 60 * 60 * 1000);
const inHours = (hours: number) => iso(now() + hours * 60 * 60 * 1000);
const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

const cityDistricts: Record<string, string[]> = {
  London: ['SE1', 'E15', 'E8', 'SW4', 'N1', 'W6', 'NW1', 'E3'],
  Manchester: ['M1', 'M4', 'M14', 'M20', 'M50', 'M15'],
  Birmingham: ['B1', 'B3', 'B13', 'B16', 'B18', 'B29'],
};

const firstNames = ['Maya', 'Ollie', 'Priya', 'Sam', 'Nadia', 'Theo', 'Aisha', 'Ben', 'Imani', 'Leo'];
const propertyTypes = ['Room', 'Studio', 'Flat', 'House share', 'Short-term stay'];
const featureSets = [
  ['bills included', 'near station', 'furnished'],
  ['balcony', 'fast broadband', 'bike storage'],
  ['pet friendly', 'parking', 'garden'],
  ['en-suite', 'co-working nearby', 'newly refurbished'],
  ['short let', 'cleaning available', 'flexible dates'],
];

export interface GraphRepository {
  getCityStats(city: string): Promise<{ city: string; matchesThisWeek: number; activeListings: number; avgDaysToMatch: number; lastUpdated: string } | null>;
  getActivity(city: string, limit: number): Promise<{ events: ActivityEvent[]; totalInLastHour: number }>;
  getListings(city: string, count: number): Promise<ListingRecord[]>;
  findListing(listingId: string): Promise<ListingRecord | null>;
  rankCandidates(filters: { city: string; priceMin?: number; priceMax?: number; propertyType?: string[]; zones?: number[]; features?: string[] }): Promise<ListingRecord[]>;
  createSession(input: { anonymousId: string; referralSource: string; device: string; city?: string }): Promise<SessionRecord>;
  getSession(sessionId: string): Promise<SessionRecord | null>;
  linkSession(sessionId: string, userId: string): Promise<{ merged: boolean; signalsTransferred: number }>;
  createUser(input: { role: UserRole; email: string; sessionId: string }): Promise<{ userId: string; onboardingStep: string }>;
  appendSignals(sessionId: string, userId: string | undefined, signals: SignalInput[]): Promise<StoredSignal[]>;
  getRecentSignals(sessionId: string, limit: number): Promise<StoredSignal[]>;
  getEmbedding(userId: string | undefined, sessionId: string): Promise<UserEmbeddingSeed>;
  updateSessionEmbedding(sessionId: string, signals: StoredSignal[]): Promise<boolean>;
}

export class InMemoryGraphRepository implements GraphRepository {
  private listings: ListingRecord[];
  private sessions = new Map<string, SessionRecord>();
  private users = new Map<string, { userId: string; role: UserRole; email: string; createdAt: string }>();
  private signalsBySession = new Map<string, StoredSignal[]>();
  private embeddings = new Map<string, UserEmbeddingSeed>();
  private activity: ActivityEvent[];

  constructor(seedListings = createSeedListings()) {
    this.listings = seedListings;
    this.activity = createActivity(seedListings);
  }

  async getCityStats(city: string) {
    const listings = this.listings.filter((listing) => sameCity(listing.location.city, city));
    if (!listings.length) return null;
    const oneWeekAgo = now() - 7 * 24 * 60 * 60 * 1000;
    const matchesThisWeek = listings.reduce((sum, listing) => sum + (Date.parse(listing.createdAt) >= oneWeekAgo ? Math.max(1, Math.round(listing.matchCount / 4)) : 0), 0);
    return {
      city: normaliseCity(city),
      matchesThisWeek,
      activeListings: listings.length,
      avgDaysToMatch: Math.max(1, Math.round(listings.reduce((sum, listing) => sum + Math.max(2, 18 - listing.reputationScore / 8), 0) / listings.length)),
      lastUpdated: iso(),
    };
  }

  async getActivity(city: string, limit: number) {
    const events = this.activity
      .filter((event) => sameCity(event.city, city))
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
    const oneHourAgo = now() - 60 * 60 * 1000;
    const totalInLastHour = events.filter((event) => Date.parse(event.timestamp) >= oneHourAgo).length;
    return {
      events: totalInLastHour < 3 ? [] : events.slice(0, limit),
      totalInLastHour,
    };
  }

  async getListings(city: string, count: number) {
    const cityListings = this.listings.filter((listing) => sameCity(listing.location.city, city)).slice(0, count);
    if (cityListings.length >= Math.min(3, count)) return cityListings;
    const fallback = this.listings.filter((listing) => !sameCity(listing.location.city, city)).slice(0, count - cityListings.length);
    return [...cityListings, ...fallback].slice(0, count);
  }

  async findListing(listingId: string) {
    return this.listings.find((listing) => listing.id === listingId) || null;
  }

  async rankCandidates(filters: { city: string; priceMin?: number; priceMax?: number; propertyType?: string[]; zones?: number[]; features?: string[] }) {
    return this.listings.filter((listing) => {
      if (!sameCity(listing.location.city, filters.city)) return false;
      if (filters.priceMin !== undefined && listing.price < filters.priceMin) return false;
      if (filters.priceMax !== undefined && listing.price > filters.priceMax) return false;
      if (filters.propertyType?.length && !filters.propertyType.includes(listing.propertyType)) return false;
      if (filters.zones?.length && listing.location.zone && !filters.zones.includes(listing.location.zone)) return false;
      if (filters.features?.length && !filters.features.some((feature) => listing.features.includes(feature))) return false;
      return true;
    });
  }

  async createSession(input: { anonymousId: string; referralSource: string; device: string; city?: string }) {
    const existing = [...this.sessions.values()].find((session) => session.anonymousId === input.anonymousId && Date.parse(session.expiresAt) > now());
    if (existing) return existing;
    const sessionId = id('session');
    const coldStartSeed = this.createColdStartSeed('anonymous', input.city);
    const session: SessionRecord = {
      sessionId,
      anonymousId: input.anonymousId,
      referralSource: input.referralSource,
      device: input.device,
      city: input.city,
      coldStartSeed,
      expiresAt: inHours(24 * 14),
      createdAt: iso(),
    };
    this.sessions.set(sessionId, session);
    this.embeddings.set(sessionId, coldStartSeed);
    return session;
  }

  async getSession(sessionId: string) {
    return this.sessions.get(sessionId) || null;
  }

  async linkSession(sessionId: string, userId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return { merged: false, signalsTransferred: 0 };
    session.userId = userId;
    const signalsTransferred = this.signalsBySession.get(sessionId)?.length || 0;
    const sessionEmbedding = this.embeddings.get(sessionId);
    if (sessionEmbedding) this.embeddings.set(userId, { ...sessionEmbedding, userId });
    return { merged: true, signalsTransferred };
  }

  async createUser(input: { role: UserRole; email: string; sessionId: string }) {
    const userId = id('user');
    this.users.set(userId, { userId, role: input.role, email: input.email, createdAt: iso() });
    const seed = this.createColdStartSeed(input.role, this.sessions.get(input.sessionId)?.city);
    this.embeddings.set(userId, { ...seed, userId });
    await this.linkSession(input.sessionId, userId);
    this.activity.unshift({
      id: id('activity'),
      type: 'profile_created',
      firstName: input.email.split('@')[0].split(/[._-]/)[0].slice(0, 16) || 'Member',
      area: this.sessions.get(input.sessionId)?.city ? 'City' : 'UK',
      timestamp: iso(),
      city: this.sessions.get(input.sessionId)?.city || 'London',
    });
    return { userId, onboardingStep: 'role_profile' };
  }

  async appendSignals(sessionId: string, userId: string | undefined, signals: SignalInput[]) {
    const stored = signals.map((signal) => ({ ...signal, id: id('signal'), sessionId, userId, receivedAt: now() }));
    const current = this.signalsBySession.get(sessionId) || [];
    this.signalsBySession.set(sessionId, [...current, ...stored].slice(-500));
    return stored;
  }

  async getRecentSignals(sessionId: string, limit: number) {
    return (this.signalsBySession.get(sessionId) || []).slice(-limit);
  }

  async getEmbedding(userId: string | undefined, sessionId: string) {
    return (userId && this.embeddings.get(userId)) || this.embeddings.get(sessionId) || this.createColdStartSeed('anonymous');
  }

  async updateSessionEmbedding(sessionId: string, signals: StoredSignal[]) {
    const current = this.embeddings.get(sessionId) || this.createColdStartSeed('anonymous');
    const positive = signals.filter((signal) => ['dwell', 'swipe_right', 'expand', 'save', 'explicit'].includes(signal.type) && signal.value >= 0);
    const negative = signals.filter((signal) => ['swipe_left', 'skip', 'hide'].includes(signal.type) || signal.value < 0);
    const featureAffinity = { ...current.featureAffinity };
    for (const signal of positive) featureAffinity[signal.entityType] = (featureAffinity[signal.entityType] || 0) + 0.04;
    for (const signal of negative) featureAffinity[signal.entityType] = Math.max(0, (featureAffinity[signal.entityType] || 0) - 0.05);
    const signalCount = current.signalCount + signals.length;
    const coldStartStage = signalCount >= 100 ? 3 : signalCount >= 20 ? 2 : signalCount >= 3 ? 1 : 0;
    this.embeddings.set(sessionId, { ...current, featureAffinity, signalCount, coldStartStage, lastUpdated: now() });
    return true;
  }

  private createColdStartSeed(role: UserRole | 'anonymous', city = 'London'): UserEmbeddingSeed {
    const base: UserEmbedding = {
      userId: id('seed'),
      locationAffinity: { [normaliseCity(city)]: 0.7 },
      commuteToleranceMinutes: role === 'tenant' ? 35 : 50,
      zonePreference: [1, 2, 3],
      priceAffinity: role === 'investor' ? { min: 200000, max: 550000, sweet: 350000 } : { min: 700, max: 1800, sweet: 1150 },
      propertyTypeAffinity: role === 'operator' ? { 'Short-term stay': 0.5, Flat: 0.35 } : { Room: 0.4, Flat: 0.35, Studio: 0.25 },
      featureAffinity: { 'bills included': 0.4, 'near station': 0.35, furnished: 0.3 },
      housemateTypeAffinity: { balanced: 0.5 },
      sessionFrequency: 0,
      avgSessionDepth: 0,
      responseRate: 0.5,
      urgencyScore: role === 'tenant' ? 0.55 : 0.35,
      lastUpdated: now(),
      signalCount: 0,
      coldStartStage: 0,
    };
    return { ...base, seedRole: role, seedCity: city };
  }
}

export function createSeedListings(): ListingRecord[] {
  const listings: ListingRecord[] = [];
  const cities = Object.keys(cityDistricts);
  for (let i = 0; i < 50; i += 1) {
    const city = cities[i % cities.length];
    const district = cityDistricts[city][i % cityDistricts[city].length];
    const propertyType = propertyTypes[i % propertyTypes.length];
    const pricePeriod = propertyType === 'Room' || propertyType === 'House share' ? 'week' : 'month';
    const price = pricePeriod === 'week' ? 170 + (i % 8) * 18 : 850 + (i % 12) * 95;
    listings.push({
      id: `listing-${i + 1}`,
      title: `${propertyType} in ${district}`,
      price,
      pricePeriod,
      billsIncluded: i % 3 !== 0,
      location: {
        postcode: `${district} ${1 + (i % 9)}AA`,
        district,
        city,
        zone: city === 'London' ? 1 + (i % 4) : undefined,
        lat: 51.5 + (i % 8) / 100,
        lng: -0.1 - (i % 7) / 100,
      },
      propertyType,
      bedrooms: propertyType === 'Room' || propertyType === 'Studio' ? 1 : 1 + (i % 4),
      availableFrom: iso(now() + (i % 28) * 24 * 60 * 60 * 1000),
      features: featureSets[i % featureSets.length],
      photos: [`/demo/listings/${(i % 10) + 1}.jpg`, `/demo/listings/${((i + 3) % 10) + 1}.jpg`],
      landlordId: `landlord-${1 + (i % 12)}`,
      landlordFirstName: firstNames[i % firstNames.length],
      landlordResponseRate: 0.62 + (i % 30) / 100,
      reputationScore: 58 + (i % 38),
      createdAt: daysAgo(i % 20),
      matchCount: 2 + (i % 18),
      viewCount: 20 + i * 7,
    });
  }
  return listings;
}

function createActivity(listings: ListingRecord[]): ActivityEvent[] {
  const fresh = listings.slice(0, 10).map((listing, index) => ({
    id: id('activity'),
    type: 'listing_added' as const,
    firstName: listing.landlordFirstName,
    area: listing.location.district,
    timestamp: iso(now() - index * 8 * 60 * 1000),
    city: listing.location.city,
  }));
  return [
    ...fresh,
    { id: id('activity'), type: 'match_made', firstName: 'Maya', area: 'SE1', timestamp: iso(now() - 18 * 60 * 1000), city: 'London' },
    { id: id('activity'), type: 'profile_created', firstName: 'Sam', area: 'E15', timestamp: iso(now() - 28 * 60 * 1000), city: 'London' },
  ];
}

function sameCity(a: string, b: string) {
  return normaliseCity(a) === normaliseCity(b);
}

function normaliseCity(city = 'London') {
  return city.trim().replace(/\b\w/g, (char) => char.toUpperCase());
}

