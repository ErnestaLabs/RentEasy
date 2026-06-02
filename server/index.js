import http from 'node:http';
import { URL } from 'node:url';
import {
  createId,
  createSession,
  demoUserId,
  getUserFromToken,
  hashNewPassword,
  microProducts,
  postTypes,
  publicProfile,
  readDb,
  reportReasons,
  roleOptions,
  updateDb,
  verifyPassword,
} from './db.js';

const port = Number(process.env.PORT || process.env.RENTEAZY_API_PORT || 8787);

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  });
  res.end(payload);
}

function notFound(res) {
  send(res, 404, { error: 'not_found' });
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

function authToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

async function currentUser(req, db) {
  return getUserFromToken(db, authToken(req)) || db.users.find((user) => user.id === demoUserId);
}

function compactState(db, userId = demoUserId) {
  const profile = publicProfile(db, userId);
  const likedIds = db.reactions.filter((item) => item.userId === userId && item.type === 'like').map((item) => item.postId);
  const savedIds = db.savedPosts.filter((item) => item.userId === userId).map((item) => item.postId);
  const followedIds = db.follows.filter((item) => item.followerId === userId).map((item) => item.followingId);
  const hiddenPostIds = db.hiddenPosts.filter((item) => item.userId === userId).map((item) => item.postId);
  const usageLimit = db.usageLimits.find((item) => item.userId === userId && item.limitType === 'daily_swipes');
  const wallet = db.wallets.find((item) => item.userId === userId);
  const appStreak = db.appStreaks.find((item) => item.userId === userId);
  const answers = Object.fromEntries(db.answers.filter((item) => item.userId === userId).map((item) => [item.questionId, item.value]));

  return {
    user: db.users.find((user) => user.id === userId),
    profile,
    posts: db.posts,
    likedIds,
    savedIds,
    followedIds,
    hiddenPostIds,
    comments: db.comments,
    shares: db.shares.filter((item) => item.userId === userId),
    reports: db.reports,
    answers,
    questions: db.questions,
    usageLimit,
    entitlements: db.entitlements.filter((item) => item.userId === userId),
    purchases: db.purchases.filter((item) => item.userId === userId),
    boosts: db.boostCampaigns.filter((item) => item.purchaserId === userId),
    wallet,
    appStreak,
    microProducts,
    postTypes,
    reportReasons,
    roleOptions,
  };
}

function ensureDailyLimit(db, userId) {
  let limit = db.usageLimits.find((item) => item.userId === userId && item.limitType === 'daily_swipes');
  if (!limit) {
    limit = {
      id: createId('limit'),
      userId,
      limitType: 'daily_swipes',
      period: 'day',
      used: 0,
      allowance: 8,
      resetsAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    };
    db.usageLimits.push(limit);
  }
  if (new Date(limit.resetsAt).getTime() <= Date.now()) {
    limit.used = 0;
    limit.resetsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  }
  return limit;
}

function addNotification(db, userId, type, title, body) {
  db.notifications.push({ id: createId('notification'), userId, type, title, body, read: false, createdAt: new Date().toISOString() });
}

const routes = {
  async 'GET /api/health'(_req, res) {
    const db = await readDb();
    send(res, 200, { ok: true, version: db.meta?.version || 1, updatedAt: db.meta?.updatedAt });
  },

  async 'GET /api/bootstrap'(req, res) {
    const db = await readDb();
    const user = await currentUser(req, db);
    ensureDailyLimit(db, user.id);
    send(res, 200, compactState(db, user.id));
  },

  async 'POST /api/auth/register'(req, res) {
    const body = await readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const name = String(body.name || 'RentEazy member').trim();
    const role = roleOptions.includes(body.role) ? body.role : 'Tenant';
    if (!email || password.length < 8) return send(res, 400, { error: 'email_and_password_required' });

    const result = await updateDb((db) => {
      if (db.users.some((user) => user.email === email)) return { error: 'email_exists' };
      const user = { id: createId('user'), email, passwordHash: hashNewPassword(password), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      db.users.push(user);
      db.profiles.push({ id: user.id, userId: user.id, name, role, area: '', budget: '', moveDate: '', lookingFor: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      db.wallets.push({ id: createId('wallet'), userId: user.id, balance: 0, updatedAt: new Date().toISOString() });
      ensureDailyLimit(db, user.id);
      const session = createSession(db, user.id);
      addNotification(db, user.id, 'welcome', 'Welcome to RentEazy', 'Your daily swipes are ready.');
      return { user, token: session.token, state: compactState(db, user.id) };
    });
    if (result.error) return send(res, 409, result);
    send(res, 201, result);
  },

  async 'POST /api/auth/login'(req, res) {
    const body = await readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const result = await updateDb((db) => {
      const user = db.users.find((item) => item.email === email);
      if (!user || !verifyPassword(password, user.passwordHash)) return { error: 'invalid_login' };
      const session = createSession(db, user.id);
      ensureDailyLimit(db, user.id);
      return { user, token: session.token, state: compactState(db, user.id) };
    });
    if (result.error) return send(res, 401, result);
    send(res, 200, result);
  },

  async 'PATCH /api/profile'(req, res) {
    const body = await readBody(req);
    const result = await updateDb(async (db) => {
      const user = await currentUser(req, db);
      const profile = publicProfile(db, user.id);
      Object.assign(profile, {
        name: body.name ?? profile.name,
        role: roleOptions.includes(body.role) ? body.role : profile.role,
        area: body.area ?? profile.area,
        budget: body.budget ?? profile.budget,
        moveDate: body.moveDate ?? profile.moveDate,
        lookingFor: body.lookingFor ?? profile.lookingFor,
        updatedAt: new Date().toISOString(),
      });
      return profile;
    });
    send(res, 200, result);
  },

  async 'PATCH /api/answers'(req, res) {
    const body = await readBody(req);
    const result = await updateDb(async (db) => {
      const user = await currentUser(req, db);
      for (const [questionId, value] of Object.entries(body.answers || {})) {
        let answer = db.answers.find((item) => item.userId === user.id && item.questionId === questionId);
        if (!answer) {
          answer = { id: createId('answer'), userId: user.id, questionId, value, visibility: 'private', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          db.answers.push(answer);
        } else {
          answer.value = value;
          answer.updatedAt = new Date().toISOString();
        }
      }
      return compactState(db, user.id).answers;
    });
    send(res, 200, { answers: result });
  },

  async 'POST /api/posts'(req, res) {
    const body = await readBody(req);
    const result = await updateDb(async (db) => {
      const user = await currentUser(req, db);
      const profile = publicProfile(db, user.id);
      const post = {
        id: createId('post'),
        authorId: user.id,
        authorType: profile.role,
        authorName: profile.name,
        postType: postTypes.includes(body.postType) ? body.postType : 'General',
        title: String(body.title || '').trim(),
        body: String(body.body || '').trim(),
        media: Array.isArray(body.media) ? body.media : [],
        area: String(body.area || '').trim(),
        budget: String(body.budget || '').trim(),
        tags: Array.isArray(body.tags) ? body.tags.slice(0, 8) : [],
        visibility: body.visibility || 'public',
        sponsoredStatus: body.sponsoredStatus || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
        saveCount: 0,
        shareCount: 0,
      };
      if (!post.title || !post.body) return { error: 'title_and_body_required' };
      db.posts.unshift(post);
      addNotification(db, user.id, 'post_created', 'Your post is live', 'Share it externally for 5 extra swipes today.');
      return post;
    });
    if (result.error) return send(res, 400, result);
    send(res, 201, result);
  },
};

async function handleDynamic(req, res, method, pathname) {
  const db = await readDb();
  const user = await currentUser(req, db);
  const postMatch = pathname.match(/^\/api\/posts\/([^/]+)\/(like|save|share|comment|report|boost|hide)$/);

  if (method === 'POST' && postMatch) {
    const [, postId, action] = postMatch;
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      const writeUser = await currentUser(req, writeableDb);
      const post = writeableDb.posts.find((item) => item.id === postId);
      if (!post) return { error: 'post_not_found' };

      if (action === 'like') {
        const existing = writeableDb.reactions.find((item) => item.userId === writeUser.id && item.postId === postId && item.type === 'like');
        if (existing) writeableDb.reactions = writeableDb.reactions.filter((item) => item !== existing);
        else writeableDb.reactions.push({ id: createId('reaction'), postId, userId: writeUser.id, type: 'like', createdAt: new Date().toISOString() });
      }
      if (action === 'save') {
        const existing = writeableDb.savedPosts.find((item) => item.userId === writeUser.id && item.postId === postId);
        if (existing) writeableDb.savedPosts = writeableDb.savedPosts.filter((item) => item !== existing);
        else writeableDb.savedPosts.push({ id: createId('saved'), postId, userId: writeUser.id, createdAt: new Date().toISOString() });
      }
      if (action === 'share') {
        const share = { id: createId('share'), postId, userId: writeUser.id, channel: body.channel || 'copy', trackingUrl: body.trackingUrl || `/share/post/${postId}`, rewardGranted: true, createdAt: new Date().toISOString() };
        writeableDb.shares.unshift(share);
        post.shareCount += 1;
        ensureDailyLimit(writeableDb, writeUser.id).allowance += 5;
      }
      if (action === 'comment') {
        const comment = { id: createId('comment'), postId, authorId: writeUser.id, authorName: publicProfile(writeableDb, writeUser.id).name, body: String(body.body || '').trim(), createdAt: new Date().toISOString() };
        if (!comment.body) return { error: 'comment_required' };
        writeableDb.comments.unshift(comment);
      }
      if (action === 'report') {
        const report = { id: createId('report'), reporterId: writeUser.id, targetType: 'post', targetId: postId, reason: reportReasons.includes(body.reason) ? body.reason : 'Other', details: body.details || '', status: 'open', createdAt: new Date().toISOString() };
        writeableDb.reports.unshift(report);
      }
      if (action === 'boost') {
        const product = microProducts.find((item) => item.id === (body.productId || 'post-bump-small')) || microProducts.find((item) => item.id === 'post-bump-small');
        const boost = { id: createId('boost'), purchaserId: writeUser.id, targetType: 'post', targetId: postId, boostType: product.category, startsAt: new Date().toISOString(), endsAt: new Date(Date.now() + (product.durationMinutes || 60) * 60000).toISOString(), impressions: 0, clicks: 0, likes: 0, saves: 0, matches: 0, status: 'active' };
        writeableDb.boostCampaigns.unshift(boost);
      }
      if (action === 'hide') {
        writeableDb.hiddenPosts.push({ id: createId('hidden'), userId: writeUser.id, postId, createdAt: new Date().toISOString() });
      }

      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, 400, result);
    return send(res, 200, result);
  }

  if (method === 'POST' && pathname === '/api/follows') {
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      const writeUser = await currentUser(req, writeableDb);
      const followingId = String(body.followingId || '');
      const existing = writeableDb.follows.find((item) => item.followerId === writeUser.id && item.followingId === followingId);
      if (existing) writeableDb.follows = writeableDb.follows.filter((item) => item !== existing);
      else writeableDb.follows.push({ id: createId('follow'), followerId: writeUser.id, followingId, followingType: body.followingType || 'account', createdAt: new Date().toISOString() });
      return compactState(writeableDb, writeUser.id);
    });
    return send(res, 200, result);
  }

  if (method === 'POST' && pathname === '/api/swipes') {
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      const writeUser = await currentUser(req, writeableDb);
      const limit = ensureDailyLimit(writeableDb, writeUser.id);
      if (limit.used >= limit.allowance) return { error: 'daily_swipes_used', limit };
      limit.used += 1;
      writeableDb.matchScores.unshift({ id: createId('match-score'), viewerId: writeUser.id, targetId: body.targetId || 'unknown', targetType: body.targetType || 'card', score: body.score || 70, reasonBadges: body.reasonBadges || ['Area fit'], missingInfo: [], dealBreakerConflict: false, calculatedAt: new Date().toISOString() });
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, 429, result);
    return send(res, 200, result);
  }

  if (method === 'POST' && pathname === '/api/purchases') {
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      const writeUser = await currentUser(req, writeableDb);
      const product = microProducts.find((item) => item.id === body.productId || item.sku === body.sku);
      if (!product) return { error: 'product_not_found' };
      const purchase = { id: createId('purchase'), userId: writeUser.id, sku: product.sku, amount: product.amount, currency: product.currency, status: 'preview_scaffold', provider: 'frontend-preview', createdAt: new Date().toISOString() };
      writeableDb.purchases.unshift(purchase);
      if (product.category === 'Extra swipes') ensureDailyLimit(writeableDb, writeUser.id).allowance += product.quantity;
      else if (product.category === 'Credits') {
        const wallet = writeableDb.wallets.find((item) => item.userId === writeUser.id);
        wallet.balance += product.quantity;
        wallet.updatedAt = new Date().toISOString();
      } else {
        writeableDb.entitlements.unshift({ id: createId('entitlement'), userId: writeUser.id, entitlementType: product.category, source: product.sku, quantityRemaining: product.quantity, expiresAt: null, createdAt: new Date().toISOString() });
      }
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, 400, result);
    return send(res, 200, result);
  }

  if (method === 'GET' && pathname === '/api/admin/moderation') {
    return send(res, 200, { reports: db.reports, hiddenPosts: db.hiddenPosts, sponsoredPosts: db.posts.filter((post) => post.sponsoredStatus) });
  }

  return notFound(res);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
    const url = new URL(req.url, `http://${req.headers.host}`);
    const key = `${req.method} ${url.pathname}`;
    if (routes[key]) return routes[key](req, res);
    return handleDynamic(req, res, req.method, url.pathname);
  } catch (error) {
    console.error(error);
    send(res, 500, { error: 'server_error', message: error.message });
  }
});

server.listen(port, () => {
  console.log(`RentEazy API listening on http://127.0.0.1:${port}`);
});
