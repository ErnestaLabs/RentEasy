export type UserRole = 'tenant' | 'landlord' | 'investor' | 'agent' | 'sourcer' | 'operator';

export interface UserEmbedding {
  userId: string;
  locationAffinity: Record<string, number>;
  commuteToleranceMinutes: number;
  zonePreference: number[];
  priceAffinity: { min: number; max: number; sweet: number };
  propertyTypeAffinity: Record<string, number>;
  featureAffinity: Record<string, number>;
  housemateTypeAffinity: Record<string, number>;
  sessionFrequency: number;
  avgSessionDepth: number;
  responseRate: number;
  urgencyScore: number;
  lastUpdated: number;
  signalCount: number;
  coldStartStage: 0 | 1 | 2 | 3;
}

export interface ListingEmbedding {
  listingId: string;
  geohash: string;
  zoneScore: number;
  transitScore: number;
  priceNormalised: number;
  propertyType: string;
  bedroomCount: number;
  features: string[];
  featureVector: number[];
  landlordResponseRate: number;
  reputationScore: number;
  daysOnPlatform: number;
  avgDwellTime: number;
  swipeRightRate: number;
  matchRate: number;
}

export interface CardRenderSpec {
  listingId: string;
  userId?: string;
  sessionId: string;
  fieldOrder: Array<'price' | 'location' | 'bills' | 'roommates' | 'transport' | 'landlord'>;
  highlightedFeatures: string[];
  suppressedFields: string[];
  primaryPhotoIndex: number;
  photoCount: number;
  primaryCTA: 'match' | 'save' | 'enquire' | 'schedule-viewing';
  ctaUrgency: 'standard' | 'high' | 'low';
  ctaText: string;
  socialProofType: 'match-count' | 'views-today' | 'similar-users' | 'landlord-response-time';
  whyThisForYou: string;
  showReputation: boolean;
  reputationWeight: 'prominent' | 'subtle';
  score: number;
}

export interface ListingRecord {
  id: string;
  title: string;
  price: number;
  pricePeriod: 'week' | 'month';
  billsIncluded: boolean;
  location: {
    postcode: string;
    district: string;
    city: string;
    zone?: number;
    lat: number;
    lng: number;
  };
  propertyType: string;
  bedrooms: number;
  availableFrom: string;
  features: string[];
  photos: string[];
  landlordId: string;
  landlordFirstName: string;
  landlordResponseRate: number;
  reputationScore: number;
  createdAt: string;
  matchCount: number;
  viewCount: number;
}

export interface UserEmbeddingSeed extends UserEmbedding {
  seedRole: UserRole | 'anonymous';
  seedCity?: string;
}

export interface SignalInput {
  type: 'dwell' | 'swipe_right' | 'swipe_left' | 'expand' | 'skip' | 'search' | 'hide' | 'explicit';
  entityId: string;
  entityType: 'listing' | 'profile' | 'opportunity' | 'agent';
  value: number;
  context: {
    timeOfDay: number;
    device: 'mobile' | 'tablet' | 'desktop';
    location?: string;
    sessionDepth: number;
  };
  timestamp: number;
}

export interface StoredSignal extends SignalInput {
  id: string;
  sessionId: string;
  userId?: string;
  receivedAt: number;
}

export interface SessionRecord {
  sessionId: string;
  anonymousId: string;
  userId?: string;
  referralSource: string;
  device: string;
  city?: string;
  coldStartSeed: UserEmbeddingSeed;
  expiresAt: string;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  type: 'profile_created' | 'listing_added' | 'match_made';
  firstName: string;
  area: string;
  timestamp: string;
  city: string;
}

export interface RankedListing {
  listingId: string;
  score: number;
  cardSpec: CardRenderSpec;
  listing: ListingRecord;
}

