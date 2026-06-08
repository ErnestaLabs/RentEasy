import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const args = new Set(process.argv.slice(2));
const requireBuild = args.has('--require-build');
const requireProductionEnv = args.has('--require-production-env');

const checks = [];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function read(path) {
  return readFile(path, 'utf8');
}

async function check(name, fn) {
  try {
    const detail = await fn();
    checks.push({ name, ok: true, detail });
  } catch (error) {
    checks.push({ name, ok: false, detail: error.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requireEnv(name) {
  assert(Boolean(process.env[name]), `${name} is not set`);
}

function assertUrlEnv(name) {
  requireEnv(name);
  const value = process.env[name];
  const url = new URL(value);
  assert(url.protocol === 'https:' || url.hostname === '127.0.0.1' || url.hostname === 'localhost', `${name} must be HTTPS outside localhost`);
  return url.origin;
}

await check('package launch scripts', async () => {
  const pkg = JSON.parse(await read('package.json'));
  assert(pkg.scripts?.start === 'node server/index.js', 'start must run the Node API');
  assert(pkg.scripts?.build === 'vite build', 'build must run Vite');
  assert(pkg.scripts?.['launch:smoke'] === 'node scripts/launch-smoke.mjs', 'launch:smoke script missing');
  assert(pkg.scripts?.['launch:doctor'] === 'node scripts/launch-doctor.mjs', 'launch:doctor script missing');
  return 'start, build, launch:doctor, launch:smoke present';
});

await check('required launch files', async () => {
  const required = [
    'server/index.js',
    'scripts/launch-smoke.mjs',
    'scripts/launch-doctor.mjs',
    'docs/LAUNCH_PRD.md',
    'netlify.toml',
    'railway.json',
    '.env.example',
  ];
  for (const path of required) {
    assert(await exists(path), `${path} is missing`);
  }
  return `${required.length} files present`;
});

await check('environment example documents production runtime', async () => {
  const envExample = await read('.env.example');
  for (const name of ['VITE_RENTEAZY_API_URL', 'CLERK_SECRET_KEY', 'RENTEAZY_ADMIN_EMAILS', 'PORT']) {
    assert(envExample.split(/\r?\n/).some((line) => line.startsWith(`${name}=`) || line.startsWith(`# ${name}=`)), `.env.example missing ${name}`);
  }
  return 'frontend API, Clerk, admin, and port envs documented';
});

await check('Railway API service deploys the Node server', async () => {
  const railway = JSON.parse(await read('railway.json'));
  assert(railway.build?.builder === 'NIXPACKS', 'Railway should use Nixpacks for the Node app');
  assert(railway.deploy?.startCommand === 'npm start', 'Railway startCommand must run npm start');
  assert(railway.deploy?.healthcheckPath === '/api/health', 'Railway healthcheck must hit /api/health');
  assert(railway.deploy?.restartPolicyType === 'ON_FAILURE', 'Railway restart policy should recover failed API processes');
  return 'Nixpacks, npm start, /api/health healthcheck present';
});

await check('Netlify static host cannot swallow API calls', async () => {
  const netlify = await read('netlify.toml');
  assert(/from = "\/api\/\*"\s+to = "\/404\.html"\s+status = 404/s.test(netlify), 'Netlify must 404 /api/* before SPA fallback');
  assert(!/from = "\/api\/\*"\s+to = "\/index\.html"/s.test(netlify), 'Netlify must not rewrite /api/* to index.html');
  assert(/from = "\/\*"\s+to = "\/index\.html"\s+status = 200/s.test(netlify), 'Netlify SPA fallback missing');
  return '/api/* guard and SPA fallback present';
});

await check('public launch assets exist', async () => {
  const required = [
    'public/audio/in-it-kadant.mp3',
    'public/pexels',
    'public/open-peeps',
  ];
  for (const path of required) {
    assert(await exists(path), `${path} is missing`);
  }
  return 'audio, Pexels media, and Open Peeps assets present';
});

await check('source launch language stays clean', async () => {
  const sourceFiles = ['src/App.jsx', 'server/db.js'];
  const patterns = [
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
  for (const file of sourceFiles) {
    const source = await read(file);
    for (const pattern of patterns) {
      assert(!pattern.test(source), `${file} contains forbidden launch term ${pattern}`);
    }
  }
  return `${sourceFiles.length} source files checked`;
});

if (requireBuild) {
  await check('production build artifacts exist', async () => {
    assert(await exists('dist/index.html'), 'dist/index.html is missing; run npm run build first');
    const assets = await readdir(join('dist', 'assets'));
    assert(assets.some((name) => name.endsWith('.js')), 'dist/assets has no JS bundle');
    assert(assets.some((name) => name.endsWith('.css')), 'dist/assets has no CSS bundle');
    return `${assets.length} dist assets found`;
  });
}

if (requireProductionEnv) {
  await check('production environment is set', async () => {
    const appOrigin = assertUrlEnv('RENTEAZY_APP_URL');
    const apiOrigin = assertUrlEnv('RENTEAZY_API_URL');
    requireEnv('CLERK_SECRET_KEY');
    requireEnv('RENTEAZY_ADMIN_EMAILS');
    assert(appOrigin !== apiOrigin, 'app and API origins should be deployed separately for this launch contract');
    return `${appOrigin} -> ${apiOrigin}`;
  });
}

for (const result of checks) {
  const prefix = result.ok ? 'PASS' : 'FAIL';
  const stream = result.ok ? console.log : console.error;
  stream(`${prefix} ${result.name}${result.detail ? `: ${result.detail}` : ''}`);
}

const failed = checks.filter((item) => !item.ok);
if (failed.length) {
  console.error(`Launch doctor failed: ${failed.length}/${checks.length} checks failed.`);
  process.exit(1);
}

console.log(`Launch doctor passed: ${checks.length}/${checks.length} checks passed.`);
