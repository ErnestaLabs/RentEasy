const appOrigin = process.env.RENTEAZY_APP_URL || process.env.LAUNCH_APP_URL;
const apiOrigin = process.env.RENTEAZY_API_URL || process.env.VITE_RENTEAZY_API_URL;

const appRoutes = ['/app/feed', '/app/swipe', '/app/post', '/app/profile', '/app/likes', '/app/billing'];
const forbiddenTerms = [
  /Mastodon/i,
  /Duolicious/i,
  /Postiz/i,
  /Fediverse/i,
  /ActivityPub/i,
  /RentEazy member/i,
  /demo member/i,
  /demo card/i,
  /upsell/i,
  /API connected/i,
  /API checking/i,
];

function normalizeOrigin(value, label) {
  if (!value) throw new Error(`${label} is required`);
  const url = new URL(value);
  return url.origin;
}

function urlFor(origin, path) {
  return new URL(path, origin).toString();
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function getText(url) {
  const response = await fetchWithTimeout(url);
  const text = await response.text();
  return { response, text };
}

async function getJson(url) {
  const { response, text } = await getText(url);
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}: ${text.slice(0, 160)}`);
  }
  if (!contentType.includes('application/json')) {
    throw new Error(`${url} did not return JSON. content-type=${contentType}`);
  }
  return JSON.parse(text);
}

function assertNoForbiddenTerms(label, value) {
  for (const pattern of forbiddenTerms) {
    if (pattern.test(value)) {
      throw new Error(`${label} contains forbidden launch term: ${pattern}`);
    }
  }
}

function assertBootstrapShape(state) {
  if (!state || typeof state !== 'object') throw new Error('/api/bootstrap did not return an object');
  if (state.user !== null) throw new Error('/api/bootstrap anonymous response should have user: null');
  if (!state.profile || typeof state.profile !== 'object') throw new Error('/api/bootstrap missing profile');
  if (!Array.isArray(state.posts)) throw new Error('/api/bootstrap missing posts array');
  if (!Array.isArray(state.groups)) throw new Error('/api/bootstrap missing groups array');
  if (!Array.isArray(state.microProducts)) throw new Error('/api/bootstrap missing microProducts array');
  assertNoForbiddenTerms('/api/bootstrap', JSON.stringify({
    profile: state.profile,
    matches: state.matches,
    matchMessages: state.matchMessages,
  }));
}

const results = [];

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
  } catch (error) {
    results.push({ name, ok: false, error: error.message });
  }
}

const app = normalizeOrigin(appOrigin, 'RENTEAZY_APP_URL or LAUNCH_APP_URL');
const api = normalizeOrigin(apiOrigin, 'RENTEAZY_API_URL or VITE_RENTEAZY_API_URL');

await check('api health', async () => {
  const health = await getJson(urlFor(api, '/api/health'));
  if (health.ok !== true) throw new Error('/api/health did not report ok: true');
});

await check('api bootstrap', async () => {
  const state = await getJson(urlFor(api, '/api/bootstrap'));
  assertBootstrapShape(state);
});

for (const route of appRoutes) {
  await check(`app route ${route}`, async () => {
    const { response, text } = await getText(urlFor(app, route));
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) throw new Error(`${route} returned ${response.status}`);
    if (!contentType.includes('text/html')) throw new Error(`${route} did not return HTML. content-type=${contentType}`);
    if (!text.includes('id="root"')) throw new Error(`${route} HTML is missing the Vite root node`);
    assertNoForbiddenTerms(route, text);
  });
}

await check('static host api guard', async () => {
  const { response, text } = await getText(urlFor(app, '/api/bootstrap'));
  const contentType = response.headers.get('content-type') || '';
  if (response.status === 200 && contentType.includes('text/html')) {
    throw new Error('frontend host rewrites /api/bootstrap to the SPA; set VITE_RENTEAZY_API_URL and keep /api/* guarded');
  }
  assertNoForbiddenTerms('frontend /api/bootstrap response', text);
});

for (const result of results) {
  if (result.ok) {
    console.log(`PASS ${result.name}`);
  } else {
    console.error(`FAIL ${result.name}: ${result.error}`);
  }
}

const failed = results.filter((result) => !result.ok);
if (failed.length) {
  console.error(`Launch smoke failed: ${failed.length}/${results.length} checks failed.`);
  process.exit(1);
}

console.log(`Launch smoke passed: ${results.length}/${results.length} checks passed.`);
