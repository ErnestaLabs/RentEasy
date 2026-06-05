import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../server/v1/app';
import { InMemoryGraphRepository } from '../server/v1/repository';
import { MemoryCache } from '../server/v1/cache';

describe('RentEazy v1 backend contract', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = buildApp({ repository: new InMemoryGraphRepository(), cache: new MemoryCache() });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns real city stats or null without fabricating missing cities', async () => {
    const london = await app.inject({ method: 'GET', url: '/api/v1/context/city-stats?city=London' });
    expect(london.statusCode).toBe(200);
    expect(london.json()).toMatchObject({ city: 'London', activeListings: expect.any(Number), matchesThisWeek: expect.any(Number) });

    const missing = await app.inject({ method: 'GET', url: '/api/v1/context/city-stats?city=Atlantis' });
    expect(missing.statusCode).toBe(200);
    expect(missing.body).toBe('null');
  });

  it('privacy-filters activity feed and never exposes ids or exact addresses', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/activity/feed?city=London&limit=10' });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.totalInLastHour).toBeGreaterThanOrEqual(3);
    expect(body.events.length).toBeGreaterThan(0);
    expect(body.events[0]).toEqual({
      id: expect.any(String),
      type: expect.stringMatching(/profile_created|listing_added|match_made/),
      firstName: expect.any(String),
      area: expect.stringMatching(/^[A-Z]{1,2}\d{1,2}$/),
      timestamp: expect.any(String),
      city: 'London',
    });
    expect(JSON.stringify(body.events)).not.toMatch(/userId|landlordId|postcode|@/);
  });

  it('creates anonymous sessions with cold-start seeds', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/session/init',
      payload: { anonymousId: 'anon-1', referralSource: 'landing', device: 'mobile', city: 'London' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      sessionId: expect.stringMatching(/^session-/),
      coldStartSeed: { signalCount: 0, coldStartStage: 0, seedCity: 'London' },
      expiresAt: expect.any(String),
    });
  });

  it('validates signal payloads and writes accepted signals asynchronously', async () => {
    const session = await app.inject({
      method: 'POST',
      url: '/api/v1/session/init',
      payload: { anonymousId: 'anon-signals', referralSource: 'landing', device: 'mobile', city: 'London' },
    });
    const sessionId = session.json().sessionId;
    const accepted = await app.inject({
      method: 'POST',
      url: '/api/v1/signals',
      payload: {
        sessionId,
        signals: [{
          type: 'dwell',
          entityId: 'listing-1',
          entityType: 'listing',
          value: 3.4,
          context: { timeOfDay: 13, device: 'mobile', sessionDepth: 4, location: 'London' },
          timestamp: Date.now(),
        }],
      },
    });
    expect(accepted.statusCode).toBe(200);
    expect(accepted.json()).toEqual({ received: 1, sessionEmbeddingUpdated: false });

    const rejected = await app.inject({
      method: 'POST',
      url: '/api/v1/signals',
      payload: { sessionId, signals: [{ type: 'bad' }] },
    });
    expect(rejected.statusCode).toBe(400);
    expect(rejected.headers['content-type']).toContain('application/problem+json');
  });

  it('rate-limits by signal count, not just request count', async () => {
    const session = await app.inject({
      method: 'POST',
      url: '/api/v1/session/init',
      payload: { anonymousId: 'anon-rate-limit', referralSource: 'landing', device: 'mobile', city: 'London' },
    });
    const sessionId = session.json().sessionId;
    const signals = Array.from({ length: 100 }, (_, index) => ({
      type: 'dwell',
      entityId: `listing-${index + 1}`,
      entityType: 'listing',
      value: 1,
      context: { timeOfDay: 13, device: 'mobile', sessionDepth: index + 1, location: 'London' },
      timestamp: Date.now(),
    }));
    const accepted = await app.inject({ method: 'POST', url: '/api/v1/signals', payload: { sessionId, signals } });
    expect(accepted.statusCode).toBe(200);

    const rejected = await app.inject({
      method: 'POST',
      url: '/api/v1/signals',
      payload: { sessionId, signals: [signals[0]] },
    });
    expect(rejected.statusCode).toBe(429);
    expect(rejected.headers['content-type']).toContain('application/problem+json');
  });

  it('signs up with role only, links the session, and allows authenticated session linking', async () => {
    const session = await app.inject({
      method: 'POST',
      url: '/api/v1/session/init',
      payload: { anonymousId: 'anon-signup', referralSource: 'landing', device: 'desktop', city: 'Manchester' },
    });
    const signup = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/signup',
      payload: { role: 'tenant', email: 'maya@example.com', sessionId: session.json().sessionId },
    });
    expect(signup.statusCode).toBe(200);
    const body = signup.json();
    expect(body).toMatchObject({
      userId: expect.stringMatching(/^user-/),
      token: expect.any(String),
      refreshToken: expect.any(String),
      onboardingStep: 'role_profile',
    });

    const linked = await app.inject({
      method: 'POST',
      url: '/api/v1/session/link',
      headers: { authorization: `Bearer ${body.token}` },
      payload: { sessionId: session.json().sessionId },
    });
    expect(linked.statusCode).toBe(200);
    expect(linked.json()).toMatchObject({ merged: true, signalsTransferred: expect.any(Number) });
  });

  it('returns ranked feed listings with card specs under the expected contract shape', async () => {
    const session = await app.inject({
      method: 'POST',
      url: '/api/v1/session/init',
      payload: { anonymousId: 'anon-feed', referralSource: 'landing', device: 'mobile', city: 'London' },
    });
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/feed/ranked',
      payload: {
        sessionId: session.json().sessionId,
        filters: { city: 'London', priceMax: 1800 },
        page: 1,
        limit: 5,
      },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.listings).toHaveLength(5);
    expect(body.listings[0]).toMatchObject({
      listingId: expect.any(String),
      score: expect.any(Number),
      cardSpec: {
        listingId: expect.any(String),
        sessionId: session.json().sessionId,
        fieldOrder: expect.any(Array),
        ctaText: expect.any(String),
        whyThisForYou: expect.any(String),
      },
      listing: {
        id: expect.any(String),
        location: { district: expect.any(String), city: 'London' },
      },
    });
    expect(body.personalisedAt).toEqual(expect.any(String));
  });

  it('refreshes a single deterministic card render spec', async () => {
    const session = await app.inject({
      method: 'POST',
      url: '/api/v1/session/init',
      payload: { anonymousId: 'anon-card', referralSource: 'landing', device: 'mobile', city: 'London' },
    });
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/feed/card-spec',
      payload: { sessionId: session.json().sessionId, listingId: 'listing-1' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      listingId: 'listing-1',
      sessionId: session.json().sessionId,
      primaryCTA: expect.stringMatching(/match|save|enquire|schedule-viewing/),
      score: expect.any(Number),
    });
  });
});
