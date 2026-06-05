import Fastify, { type FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import cors from '@fastify/cors';
import { ZodError } from 'zod';
import { bearerToken, signAccessToken, signRefreshToken, verifyAccessToken } from './auth';
import { createCache, type CacheClient } from './cache';
import { problem, sendProblem, validationProblem } from './problem';
import { createCardRenderSpec, rankListings } from './personalisation';
import { InMemoryGraphRepository, type GraphRepository } from './repository';
import {
  activityQuerySchema,
  cardSpecBodySchema,
  cityQuerySchema,
  demoListingsQuerySchema,
  feedRankedBodySchema,
  sessionInitBodySchema,
  sessionLinkBodySchema,
  signalsBodySchema,
  signupBodySchema,
} from './schemas';
import type { StoredSignal } from './types';

export interface AppDeps {
  repository?: GraphRepository;
  cache?: CacheClient;
}

export function buildApp(deps: AppDeps = {}): FastifyInstance {
  const repository = deps.repository || new InMemoryGraphRepository();
  const cache = deps.cache || createCache();
  const app = Fastify({
    logger: process.env.NODE_ENV === 'test' ? false : {
      level: process.env.LOG_LEVEL || 'info',
    },
    genReqId: () => crypto.randomUUID(),
  });

  app.register(cors, { origin: true });

  app.addHook('onRequest', async (request) => {
    request.headers['x-request-start'] = String(Date.now());
  });

  app.addHook('onSend', async (request, reply, payload) => {
    const started = Number(request.headers['x-request-start'] || Date.now());
    const duration = Date.now() - started;
    reply.header('Server-Timing', `app;dur=${duration}`);
    reply.header('X-Response-Time-Ms', String(duration));
    return payload;
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) return sendProblem(reply, validationProblem(error));
    app.log.error(error);
    return sendProblem(reply, problem(500, 'Internal server error', 'Unexpected backend failure.'));
  });

  app.get('/health', async () => ({ ok: true, service: 'renteazy-v1', time: new Date().toISOString() }));
  app.get('/metrics', async () => '# HELP renteazy_backend_up Backend availability\n# TYPE renteazy_backend_up gauge\nrenteazy_backend_up 1\n');

  app.get('/api/v1/context/city-stats', async (request, reply) => {
    const query = cityQuerySchema.parse(request.query);
    const cacheKey = `city-stats:${query.city.toLowerCase()}`;
    const cached = await cache.getJson(cacheKey);
    if (cached) return cached;
    const stats = await repository.getCityStats(query.city);
    if (!stats) return reply.code(200).send(null);
    await cache.setJson(cacheKey, stats, 300);
    return stats;
  });

  app.get('/api/v1/activity/feed', async (request) => {
    const query = activityQuerySchema.parse(request.query);
    const cacheKey = `activity:${query.city.toLowerCase()}:${query.limit}`;
    const cached = await cache.getJson(cacheKey);
    if (cached) return cached;
    const payload = await repository.getActivity(query.city, query.limit);
    await cache.setJson(cacheKey, payload, 30);
    return payload;
  });

  app.get('/api/v1/listings/demo', async (request) => {
    const query = demoListingsQuerySchema.parse(request.query);
    return { listings: await repository.getListings(query.city, query.count) };
  });

  app.post('/api/v1/session/init', async (request) => {
    const body = sessionInitBodySchema.parse(request.body);
    const session = await repository.createSession(body);
    return {
      sessionId: session.sessionId,
      coldStartSeed: session.coldStartSeed,
      expiresAt: session.expiresAt,
    };
  });

  app.post('/api/v1/session/link', async (request, reply) => {
    const auth = requireAuth(request.headers.authorization);
    if (!auth) return sendProblem(reply, problem(401, 'Unauthorized', 'A valid JWT is required.'));
    const body = sessionLinkBodySchema.parse(request.body);
    return repository.linkSession(body.sessionId, auth.userId);
  });

  app.post('/api/v1/auth/signup', async (request) => {
    const body = signupBodySchema.parse(request.body);
    const user = await repository.createUser(body);
    return {
      userId: user.userId,
      token: signAccessToken(user.userId),
      refreshToken: signRefreshToken(user.userId),
      onboardingStep: user.onboardingStep,
    };
  });

  app.post('/api/v1/signals', async (request, reply) => {
    const body = signalsBodySchema.parse(request.body);
    const count = await cache.incrByWithTtl(`rate:signals:${body.sessionId}`, body.signals.length, 60);
    if (count > 100) return sendProblem(reply, problem(429, 'Too many requests', 'Signal rate limit exceeded for this session.'));
    const stored = await repository.appendSignals(body.sessionId, body.userId, body.signals);
    for (const signal of stored) await cache.rpushJson(`signals:${body.sessionId}`, signal);
    void processSignals(repository, body.sessionId);
    return { received: stored.length, sessionEmbeddingUpdated: Boolean(body.userId) };
  });

  app.post('/api/v1/feed/ranked', async (request) => {
    const body = feedRankedBodySchema.parse(request.body);
    const auth = verifyAccessToken(bearerToken(request.headers.authorization));
    const userId = body.userId || auth?.userId;
    const [embedding, recentSignals, candidates] = await Promise.all([
      repository.getEmbedding(userId, body.sessionId),
      repository.getRecentSignals(body.sessionId, 20),
      repository.rankCandidates(body.filters),
    ]);
    return {
      ...rankListings({
        listings: candidates.slice(0, 200),
        embedding,
        recentSignals,
        sessionId: body.sessionId,
        userId,
        page: body.page,
        limit: body.limit,
      }),
      personalisedAt: new Date().toISOString(),
    };
  });

  app.post('/api/v1/feed/card-spec', async (request, reply) => {
    const body = cardSpecBodySchema.parse(request.body);
    const auth = verifyAccessToken(bearerToken(request.headers.authorization));
    const userId = body.userId || auth?.userId;
    const listing = await repository.findListing(body.listingId);
    if (!listing) return sendProblem(reply, problem(404, 'Listing not found', 'No listing exists for the supplied listingId.'));
    const [embedding, recentSignals] = await Promise.all([
      repository.getEmbedding(userId, body.sessionId),
      repository.getRecentSignals(body.sessionId, 20),
    ]);
    return createCardRenderSpec({ listing, embedding, recentSignals, sessionId: body.sessionId, userId });
  });

  app.addHook('onClose', async () => {
    await cache.close();
  });

  return app;
}

async function processSignals(repository: GraphRepository, sessionId: string) {
  const signals = await repository.getRecentSignals(sessionId, 20);
  await repository.updateSessionEmbedding(sessionId, signals);
}

function requireAuth(header: string | undefined) {
  return verifyAccessToken(bearerToken(header));
}
