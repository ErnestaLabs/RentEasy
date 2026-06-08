import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Source-invariant tests: cheap, fast, no browser. They lock in decisions and
// bug fixes so a future edit can't silently regress them.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(resolve(root, p), 'utf8');

const app = read('src/App.jsx');
const css = read('src/index.css');
const main = read('src/main.jsx');
const vsl = read('src/components/vsl/VSLPlayer.jsx');
const serverDb = read('server/db.js');

describe('icon styling regression (React 18 + custom elements)', () => {
  it('never uses className on the <iconify-icon> custom element', () => {
    // React 18 does not map className -> class on custom elements, so Tailwind
    // classes get dropped. Every icon must use class=. Guards the FAQ rotate +
    // hero/CTA icon sizing bug.
    const offenders = app.match(/<iconify-icon[^>]*className=/g) || [];
    expect(offenders).toEqual([]);
  });
});

describe('performance', () => {
  it('code-splits the Remotion VSL behind React.lazy', () => {
    expect(app).toMatch(/React\.lazy\(\(\)\s*=>\s*import\(\s*['"]@\/components\/vsl\/VSLPlayer['"]\s*\)\)/);
  });

  it('renders the lazy VSL inside a Suspense boundary (avoids crash + reserves space)', () => {
    expect(app).toMatch(/<React\.Suspense/);
  });
});

describe('privacy + load: self-hosted fonts (no Google CDN)', () => {
  it('does not pull fonts from the Google Fonts CDN', () => {
    expect(css).not.toMatch(/fonts\.googleapis\.com/);
  });

  it('imports fonts from @fontsource', () => {
    expect(main).toMatch(/@fontsource/);
  });
});

describe('accessibility', () => {
  it('honours prefers-reduced-motion in CSS', () => {
    expect(css).toMatch(/prefers-reduced-motion/);
  });

  it('configures Framer Motion to follow the user reduced-motion setting', () => {
    expect(main).toMatch(/reducedMotion=["']user["']/);
  });
});

describe('brand-safe registry usage', () => {
  it('overrides the BorderBeam default purple with brand colours on the VSL', () => {
    // The component ships orange->purple (AI-slop palette). We must pass brand
    // green/blue explicitly.
    expect(vsl).toMatch(/colorFrom=/);
    expect(vsl).not.toMatch(/#9c40ff/); // the component's default purple
  });
});

describe('launch copy contract', () => {
  it('does not expose fake generic member or demo-card language in app/API seeds', () => {
    const publicSources = `${app}\n${serverDb}`;
    expect(publicSources).not.toMatch(/RentEazy member/i);
    expect(publicSources).not.toMatch(/demo member/i);
    expect(publicSources).not.toMatch(/demo card/i);
    expect(publicSources).not.toMatch(/upsell/i);
  });
});
