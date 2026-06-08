import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('launch runtime contract', () => {
  it('has a production API start script', async () => {
    const pkg = JSON.parse(await readFile('package.json', 'utf8'));

    expect(pkg.scripts.start).toBe('node server/index.js');
    expect(pkg.scripts['launch:doctor']).toBe('node scripts/launch-doctor.mjs');
    expect(pkg.scripts['launch:smoke']).toBe('node scripts/launch-smoke.mjs');
  });

  it('documents the frontend API origin and admin allowlist env vars', async () => {
    const envExample = await readFile('.env.example', 'utf8');

    expect(envExample).toContain('VITE_RENTEAZY_API_URL=');
    expect(envExample).toContain('RENTEAZY_ADMIN_EMAILS=');
    expect(envExample).toContain('PORT=');
  });

  it('ships Railway API deployment config for the Node backend', async () => {
    const railway = JSON.parse(await readFile('railway.json', 'utf8'));

    expect(railway.build.builder).toBe('NIXPACKS');
    expect(railway.deploy.startCommand).toBe('npm start');
    expect(railway.deploy.healthcheckPath).toBe('/api/health');
    expect(railway.deploy.restartPolicyType).toBe('ON_FAILURE');
  });

  it('keeps Netlify as a static frontend host rather than pretending to host the API', async () => {
    const netlify = await readFile('netlify.toml', 'utf8');

    expect(netlify).toContain('publish = "dist"');
    expect(netlify).toMatch(/from = "\/api\/\*"\s+to = "\/404\.html"\s+status = 404/s);
    expect(netlify).not.toMatch(/from = "\/api\/\*"\s+to = "\/index\.html"/s);
  });

  it('uses product language for backend connection state in the app shell', async () => {
    const app = await readFile('src/App.jsx', 'utf8');

    expect(app).toContain('Live data');
    expect(app).toContain('Preview data');
    expect(app).not.toMatch(/API connected|API checking/i);
  });

  it('ships a production smoke script for deployed app/API verification', async () => {
    const smoke = await readFile('scripts/launch-smoke.mjs', 'utf8');

    expect(smoke).toContain('RENTEAZY_APP_URL');
    expect(smoke).toContain('RENTEAZY_API_URL');
    expect(smoke).toContain('/api/health');
    expect(smoke).toContain('/api/bootstrap');
    expect(smoke).toContain('/app/feed');
    expect(smoke).toContain('static host api guard');
  });

  it('ships a pre-deploy doctor for local launch readiness checks', async () => {
    const doctor = await readFile('scripts/launch-doctor.mjs', 'utf8');

    expect(doctor).toContain('require-build');
    expect(doctor).toContain('require-production-env');
    expect(doctor).toContain('Netlify static host cannot swallow API calls');
    expect(doctor).toContain('Railway API service deploys the Node server');
    expect(doctor).toContain('production build artifacts exist');
    expect(doctor).toContain('source launch language stays clean');
  });

  it('ships a Claude/Codex launch handoff for landing and deploy', async () => {
    const handoff = await readFile('docs/LAUNCH_HANDOFF.md', 'utf8');

    expect(handoff).toContain('Claude UI Lane');
    expect(handoff).toContain('Codex Backend Contract');
    expect(handoff).toContain('npm run launch:doctor -- --require-build');
    expect(handoff).toContain('npm run launch:smoke');
    expect(handoff).toContain('GitHub CLI is not authenticated');
  });
});
