import { mkdtemp, rm, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

let createRentEazyApiServer;
let dbFile;
let tmpDir;
let server;
let baseUrl;

async function listen(server) {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

async function request(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  return { response, json };
}

async function register(overrides = {}) {
  const { response, json } = await request('/api/auth/register', {
    method: 'POST',
    body: {
      email: `user-${randomUUID()}@example.com`,
      password: 'Password123!',
      name: 'Backend Test User',
      role: 'Tenant',
      ...overrides,
    },
  });
  expect(response.status).toBe(201);
  return json;
}

describe('RentEazy app API', () => {
  beforeAll(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'renteazy-api-'));
    dbFile = join(tmpDir, 'db.json');
    process.env.RENTEAZY_DB_FILE = dbFile;
    ({ createRentEazyApiServer } = await import('../server/index.js'));
  });

  beforeEach(async () => {
    await unlink(dbFile).catch(() => {});
    server = createRentEazyApiServer();
    baseUrl = await listen(server);
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    delete process.env.RENTEAZY_DB_FILE;
  });

  it('bootstraps complete app state for the frontend contract', async () => {
    const { response, json } = await request('/api/bootstrap');
    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      user: null,
      profile: expect.any(Object),
      posts: expect.any(Array),
      groups: expect.any(Array),
      partnerOffers: expect.any(Array),
      matches: expect.any(Array),
      matchMessages: expect.any(Array),
      microProducts: expect.any(Array),
      postTypes: expect.arrayContaining(['Property', 'Room', 'Looking', 'Investor Brief']),
      reportReasons: expect.arrayContaining(['Scam/fraud', 'Fake listing', 'Misleading investment claim']),
      usageLimit: { limitType: 'daily_swipes', period: 'day' },
    });
    expect(json.profile).toMatchObject({ id: 'preview-visitor', name: 'Guest preview' });
    expect(json.profile.name).not.toBe('RentEazy member');
    expect(json.likedIds).toEqual([]);
    expect(json.savedIds).toEqual([]);
    expect(json.matches).toEqual([]);
    expect(json.matchMessages).toEqual([]);
    expect(json.notifications).toEqual([]);
    expect(json.reputationProfile).toMatchObject({ userId: 'preview-visitor', score: 0 });
    expect(json.microProducts.some((product) => product.amount < 1)).toBe(true);
  });

  it('does not let anonymous preview traffic mutate demo account data', async () => {
    const created = await request('/api/posts', {
      method: 'POST',
      body: {
        postType: 'Question',
        title: 'Anonymous post should not persist',
        body: 'Preview visitors can browse but cannot create account history.',
      },
    });
    expect(created.response.status).toBe(401);
    expect(created.json).toMatchObject({ error: 'auth_required' });

    const swipe = await request('/api/swipes', {
      method: 'POST',
      body: { targetId: 'anonymous-card', targetType: 'listing', action: 'like', score: 90 },
    });
    expect(swipe.response.status).toBe(401);
    expect(swipe.json).toMatchObject({ error: 'auth_required' });

    const state = await request('/api/bootstrap');
    expect(state.json.matches).toEqual([]);
    expect(state.json.profile.name).toBe('Guest preview');
  });

  it('registers users, stores role profile, answers match questions, and returns profile strength inputs', async () => {
    const auth = await register({ role: 'Investor' });
    const profilePatch = await request('/api/profile', {
      method: 'PATCH',
      token: auth.token,
      body: { role: 'Investor', area: 'Manchester', budget: '£250k-£450k', lookingFor: 'Clean-number briefs' },
    });
    expect(profilePatch.response.status).toBe(200);
    expect(profilePatch.json.role).toBe('Investor');

    const answers = await request('/api/answers', {
      method: 'PATCH',
      token: auth.token,
      body: { answers: { 'investor-strategy': 'Buy-to-let', 'tenant-areas': 'Manchester' } },
    });
    expect(answers.response.status).toBe(200);
    expect(answers.json.answers).toMatchObject({ 'investor-strategy': 'Buy-to-let' });

    const state = await request('/api/bootstrap', { token: auth.token });
    expect(state.json.profile).toMatchObject({ role: 'Investor', area: 'Manchester' });
    expect(state.json.answers).toMatchObject({ 'investor-strategy': 'Buy-to-let' });
    expect(state.json.questions.length).toBeGreaterThan(0);
  });

  it('creates real feed posts with media and supports engagement, share reward, report, and moderation queue', async () => {
    const auth = await register();
    const created = await request('/api/posts', {
      method: 'POST',
      token: auth.token,
      body: {
        postType: 'Room',
        title: 'Test room with real media set',
        body: 'A clear room post with consistent listing photos for backend contract testing.',
        area: 'Stratford',
        budget: '£925 pcm',
        tags: ['Room', 'Viewing'],
        media: [
          { url: '/pexels/room-1.jpg', type: 'image', name: 'room' },
          { url: '/pexels/kitchen-1.jpg', type: 'image', name: 'kitchen' },
        ],
      },
    });
    expect(created.response.status).toBe(201);
    expect(created.json.media).toHaveLength(2);

    const likeState = await request(`/api/posts/${created.json.id}/like`, { method: 'POST', token: auth.token });
    expect(likeState.response.status).toBe(200);
    expect(likeState.json.likedIds).toContain(created.json.id);

    const saveState = await request(`/api/posts/${created.json.id}/save`, { method: 'POST', token: auth.token });
    expect(saveState.json.savedIds).toContain(created.json.id);

    const shareState = await request(`/api/posts/${created.json.id}/share`, {
      method: 'POST',
      token: auth.token,
      body: { channel: 'native', trackingUrl: `https://renteazy.co.uk/share/${created.json.id}` },
    });
    expect(shareState.json.shares[0]).toMatchObject({ postId: created.json.id, rewardGranted: true });
    expect(shareState.json.usageLimit.allowance).toBeGreaterThan(8);

    const commentState = await request(`/api/posts/${created.json.id}/comment`, {
      method: 'POST',
      token: auth.token,
      body: { body: 'Can I view this tomorrow?' },
    });
    expect(commentState.json.comments[0]).toMatchObject({ postId: created.json.id, body: 'Can I view this tomorrow?' });

    const reportState = await request(`/api/posts/${created.json.id}/report`, {
      method: 'POST',
      token: auth.token,
      body: { reason: 'Fake listing', details: 'Test report' },
    });
    expect(reportState.json.reports[0]).toMatchObject({ targetId: created.json.id, reason: 'Fake listing', status: 'open' });

    const anonymousModeration = await request('/api/admin/moderation');
    expect(anonymousModeration.response.status).toBe(401);
    expect(anonymousModeration.json).toMatchObject({ error: 'auth_required' });

    const nonAdminModeration = await request('/api/admin/moderation', { token: auth.token });
    expect(nonAdminModeration.response.status).toBe(403);
    expect(nonAdminModeration.json).toMatchObject({ error: 'admin_required' });

    process.env.RENTEAZY_ADMIN_EMAILS = auth.user.email;
    const moderation = await request('/api/admin/moderation', { token: auth.token });
    delete process.env.RENTEAZY_ADMIN_EMAILS;
    expect(moderation.response.status).toBe(200);
    expect(moderation.json.reports.some((report) => report.targetId === created.json.id)).toBe(true);
  });

  it('enforces daily swipe limits while opening matches for positive swipes', async () => {
    const auth = await register();
    let lastState;
    for (let i = 0; i < 8; i += 1) {
      const swipe = await request('/api/swipes', {
        method: 'POST',
        token: auth.token,
        body: { targetId: `card-${i}`, targetType: 'listing', action: i === 0 ? 'like' : 'pass', score: 80 },
      });
      expect(swipe.response.status).toBe(200);
      lastState = swipe.json;
    }
    expect(lastState.usageLimit.used).toBe(8);
    expect(lastState.matches.length).toBeGreaterThan(0);

    const rejected = await request('/api/swipes', {
      method: 'POST',
      token: auth.token,
      body: { targetId: 'card-over-limit', targetType: 'listing', action: 'pass', score: 50 },
    });
    expect(rejected.response.status).toBe(429);
    expect(rejected.json.error).toBe('daily_swipes_used');
  });

  it('keeps regular match messaging free and stored inside RentEazy', async () => {
    const auth = await register();
    const state = await request('/api/swipes', {
      method: 'POST',
      token: auth.token,
      body: { targetId: 'message-test-card', targetType: 'listing', action: 'like', score: 86 },
    });
    const matchId = state.json.matches[0].id;
    const sent = await request(`/api/matches/${matchId}/messages`, {
      method: 'POST',
      token: auth.token,
      body: { body: 'Free in-app text message, no paid messaging provider.' },
    });
    expect(sent.response.status).toBe(201);
    expect(sent.json.matchMessages[0]).toMatchObject({
      matchId,
      body: 'Free in-app text message, no paid messaging provider.',
    });
    expect(JSON.stringify(sent.json.matchMessages[0])).not.toMatch(/telnyx|convocore/i);
  });

  it('supports groups, useful products, and entitlement records without fake scarcity', async () => {
    const auth = await register({ role: 'Landlord' });
    const createdGroup = await request('/api/groups', {
      method: 'POST',
      token: auth.token,
      body: {
        name: 'Backend Test Landlords',
        groupType: 'Role network',
        area: 'London',
        description: 'A practical test group for local landlord signals.',
      },
    });
    expect(createdGroup.response.status).toBe(201);
    expect(createdGroup.json.groups[0]).toMatchObject({ name: 'Backend Test Landlords', visibility: 'open' });
    expect(createdGroup.json.groupMemberships.some((membership) => membership.groupId === createdGroup.json.groups[0].id)).toBe(true);

    const joinableGroup = createdGroup.json.groups.find((group) => group.id !== createdGroup.json.groups[0].id);
    const joined = await request(`/api/groups/${joinableGroup.id}/join`, { method: 'POST', token: auth.token });
    expect(joined.response.status).toBe(200);
    expect(joined.json.groupMemberships.some((membership) => membership.groupId === joinableGroup.id)).toBe(true);

    const purchase = await request('/api/purchases', {
      method: 'POST',
      token: auth.token,
      body: { productId: 'extra-swipes-10' },
    });
    expect(purchase.response.status).toBe(201);
    expect(purchase.json.purchases[0]).toMatchObject({ sku: 'swipes_10_009', amount: 0.09, provider: 'renteazy-local' });
    expect(purchase.json.usageLimit.allowance).toBeGreaterThan(8);
  });
});
