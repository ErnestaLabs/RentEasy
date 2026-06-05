import { describe, expect, it } from 'vitest';
import {
  buildNegativeSuppression,
  buildRentEazyFeed,
  createFeedCardSchema,
  scoreFeedCard,
} from './feedEngine.js';

const basePosts = [
  {
    id: 'room-bow',
    authorId: 'agent-a',
    authorType: 'Agent',
    authorName: 'Agent A',
    postType: 'Room',
    title: 'Room in Bow',
    body: 'Bills included room ready this week.',
    media: [],
    area: 'Bow',
    budget: '£950 pcm',
    tags: ['Bills included', 'Viewing slots'],
    createdAt: new Date().toISOString(),
    likeCount: 3,
    saveCount: 2,
    commentCount: 1,
    shareCount: 1,
  },
  {
    id: 'room-stratford',
    authorId: 'agent-b',
    authorType: 'Agent',
    authorName: 'Agent B',
    postType: 'Room',
    title: 'Room in Stratford',
    body: 'Clean room near transport.',
    media: [],
    area: 'Stratford',
    budget: '£990 pcm',
    tags: ['Zone 2/3'],
    createdAt: new Date().toISOString(),
    likeCount: 1,
    saveCount: 1,
    commentCount: 0,
    shareCount: 0,
  },
  {
    id: 'shoreditch-stay',
    authorId: 'host-a',
    authorType: 'Short-Term Host',
    authorName: 'Host A',
    postType: 'Short-Term Stay',
    title: 'Flexible Shoreditch studio',
    body: 'Weekly furnished relocation stay.',
    media: [],
    area: 'Shoreditch',
    budget: '£89/night',
    tags: ['Relocation'],
    createdAt: new Date().toISOString(),
    likeCount: 0,
    saveCount: 0,
    commentCount: 0,
    shareCount: 0,
  },
  {
    id: 'leeds-deal',
    authorId: 'sourcer-a',
    authorType: 'Sourcer',
    authorName: 'Sourcer A',
    postType: 'Sourcer Deal',
    title: 'Leeds investor brief',
    body: 'Student lets and numbers first.',
    media: [],
    area: 'Leeds',
    budget: 'Investor brief',
    tags: ['Numbers first'],
    createdAt: new Date().toISOString(),
    likeCount: 0,
    saveCount: 0,
    commentCount: 0,
    shareCount: 0,
  },
  {
    id: 'canary-insight',
    authorId: 'agent-c',
    authorType: 'Agent',
    authorName: 'Agent C',
    postType: 'Area Insight',
    title: 'Canary Wharf market movement',
    body: 'Rooms under £1,000 are moving quickly.',
    media: [],
    area: 'Canary Wharf',
    budget: 'Under £1,000',
    tags: ['Area insight'],
    createdAt: new Date().toISOString(),
    likeCount: 0,
    saveCount: 0,
    commentCount: 0,
    shareCount: 0,
  },
];

const context = {
  profile: { role: 'Tenant', area: 'Bow', budget: '£1,000 pcm' },
  answers: {},
  followedIds: [],
  likedIds: [],
  savedIds: [],
  hiddenPostIds: [],
  comments: [],
  behavioralEvents: [],
  feedSignals: [],
};

describe('feedEngine', () => {
  it('uses the required weighted scoring components', () => {
    const ranking = scoreFeedCard(basePosts[0], context);
    expect(ranking.components).toEqual(expect.objectContaining({
      criteriaMatch: expect.any(Number),
      behavioralSimilarity: expect.any(Number),
      trustCompatibility: expect.any(Number),
      engagementVelocity: expect.any(Number),
      recency: expect.any(Number),
      explorationBonus: expect.any(Number),
    }));
    expect(ranking.score).toBeGreaterThan(70);
  });

  it('orders real posts without padding the stream with synthetic cards', () => {
    const feed = buildRentEazyFeed({ ...context, posts: basePosts, minItems: 25 });
    expect(feed.items).toHaveLength(basePosts.length);
    expect(feed.items.every((item) => !item.post.systemCard)).toBe(true);
    const explorationItems = feed.items.filter((item) => item.ranking.isExploration);
    expect(explorationItems.length).toBeGreaterThanOrEqual(1);
    expect(explorationItems[0].card.explorationLabel).toContain('Exploration:');
    expect(feed.diagnostics.explorationRatio).toBeGreaterThan(0);
  });

  it('does not fabricate public feed cards when no posts match', () => {
    const feed = buildRentEazyFeed({ ...context, posts: [], minItems: 12 });
    expect(feed.items).toHaveLength(0);
    expect(feed.state).toBe('continuity');
  });

  it('hard suppresses fast left swipes for the suppression window', () => {
    const suppression = buildNegativeSuppression([{
      type: 'swipe',
      postId: 'room-bow',
      metadata: { direction: 'left', speedMs: 320 },
      createdAt: new Date().toISOString(),
    }]);
    expect(suppression.get('room-bow')).toEqual(expect.objectContaining({ strength: 1, reason: 'Fast pass' }));
    const feed = buildRentEazyFeed({
      ...context,
      posts: basePosts,
      feedSignals: [{
        type: 'swipe',
        postId: 'room-bow',
        metadata: { direction: 'left', speedMs: 320 },
        createdAt: new Date().toISOString(),
      }],
      minItems: 8,
    });
    expect(feed.items.some((item) => item.post.id === 'room-bow')).toBe(false);
  });

  it('produces the fixed feed card rendering schema', () => {
    const ranking = scoreFeedCard(basePosts[0], context);
    const card = createFeedCardSchema(basePosts[0], ranking, 0);
    expect(card).toEqual(expect.objectContaining({
      heroImage: expect.stringContaining('/images/'),
      matchPercent: expect.any(Number),
      price: '£950 pcm',
      area: 'Bow',
      bedsBaths: expect.stringContaining('Room'),
      trustSignal: expect.stringContaining('Agent'),
      standout: 'Bills included',
      actions: ['pass', 'match'],
    }));
  });
});
