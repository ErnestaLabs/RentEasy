import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('launch runtime contract', () => {
  it('has a production API start script', async () => {
    const pkg = JSON.parse(await readFile('package.json', 'utf8'));

    expect(pkg.scripts.start).toBe('node server/index.js');
  });

  it('documents the frontend API origin and admin allowlist env vars', async () => {
    const envExample = await readFile('.env.example', 'utf8');

    expect(envExample).toContain('VITE_RENTEAZY_API_URL=');
    expect(envExample).toContain('RENTEAZY_ADMIN_EMAILS=');
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
});
