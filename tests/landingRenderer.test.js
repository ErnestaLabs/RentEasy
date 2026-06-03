import { describe, it, expect } from 'vitest';
import LandingRenderer from '../src/landing/LandingRenderer.jsx';
import PersonalisedLanding from '../src/landing/PersonalisedLanding.jsx';
import { useLandingSpec } from '../src/landing/useLandingSpec.js';

// Smoke test: the renderer + hook + wrapper must parse, transform (JSX), and
// resolve their imports. (Behaviour of the pure engine is covered in
// landingSpec.test.js; full DOM rendering needs jsdom which isn't in this env.)
describe('landing renderer modules compile + export', () => {
  it('LandingRenderer is a component', () => {
    expect(typeof LandingRenderer).toBe('function');
  });
  it('PersonalisedLanding is a component', () => {
    expect(typeof PersonalisedLanding).toBe('function');
  });
  it('useLandingSpec is a hook', () => {
    expect(typeof useLandingSpec).toBe('function');
  });
});
