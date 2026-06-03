import { describe, it, expect } from 'vitest';
import { getLandingSpec, defaultLandingSpec, SECTION_POOL } from '../src/landing/landingSpec.js';
import { getRoleContent } from '../src/landing/roleContent.js';

const isSubsetOfPool = (order) => order.every((k) => SECTION_POOL.includes(k));
const hasUniqueKeys = (order) => new Set(order).size === order.length;

describe('getLandingSpec — graceful degradation (hard constraint)', () => {
  it('returns the default spec when no session is provided', () => {
    expect(getLandingSpec(undefined)).toEqual(defaultLandingSpec());
  });
  it('returns the default spec for an empty session (no signals)', () => {
    expect(getLandingSpec({})).toEqual(defaultLandingSpec());
  });
  it('default spec is valid and non-urgent', () => {
    const s = defaultLandingSpec();
    expect(isSubsetOfPool(s.sectionOrder)).toBe(true);
    expect(s.sectionOrder[0]).toBe('hero');
    expect(s.sectionOrder).toContain('final_cta');
    expect(s.urgencyStyle).toBe('none');
    expect(s.socialProofBlock).not.toBe('map_activity');
  });
});

describe('Rule 1 — first-time visitor', () => {
  it('shows at most 3 sections, hero first', () => {
    const s = getLandingSpec({ isReturning: false, context: { device: 'desktop', hour: 21 } });
    expect(s.sectionOrder.length).toBeLessThanOrEqual(3);
    expect(s.sectionOrder[0]).toBe('hero');
    expect(s.sectionOrder).toContain('final_cta');
  });
  it('hero is fast_match or social_proof (no deep_explain on first touch)', () => {
    const s = getLandingSpec({ isReturning: false, context: { device: 'desktop', hour: 21 } });
    expect(['fast_match', 'social_proof']).toContain(s.heroVariant);
  });
  it('mobile / morning first-timers get fast_match', () => {
    expect(getLandingSpec({ isReturning: false, context: { device: 'mobile', hour: 14 } }).heroVariant).toBe('fast_match');
    expect(getLandingSpec({ isReturning: false, context: { device: 'desktop', hour: 8 } }).heroVariant).toBe('fast_match');
  });
});

describe('Rule 2 — returning visitor', () => {
  it('surfaces the last interacted section right after the hero', () => {
    const s = getLandingSpec({ isReturning: true, lastInteractedSection: 'social_proof' });
    expect(s.sectionOrder[0]).toBe('hero');
    expect(s.sectionOrder[1]).toBe('social_proof');
  });
  it('moves value up for visitors who previously scrolled deep', () => {
    const s = getLandingSpec({ isReturning: true, prevScrollDepth: 0.8 });
    expect(s.sectionOrder.indexOf('pricing_or_value')).toBeLessThanOrEqual(2);
  });
});

describe('Rule 3 — high intent (cta hover / fast deep scroll / exit)', () => {
  it('turns on real urgency and pushes the CTA up, dropping heavy explanation', () => {
    const s = getLandingSpec({ isReturning: true, signals: { cta_hover: true } });
    expect(s.urgencyStyle).toBe('strong');
    expect(s.sectionOrder[1]).toBe('final_cta');
    expect(s.sectionOrder).not.toContain('how_it_works');
    expect(s.ctaPrimary).toMatch(/free/i);
  });
  it('exit intent also escalates urgency', () => {
    expect(getLandingSpec({ isReturning: true, signals: { exit_intent: true } }).urgencyStyle).toBe('strong');
  });
});

describe('Rule 4 — low intent (slow browsing)', () => {
  it('goes explanation-first with more social proof, no urgency', () => {
    const s = getLandingSpec({ isReturning: true, signals: { dwell_time: 30, scroll_depth: 0.2 } });
    expect(s.heroVariant).toBe('deep_explain');
    expect(s.urgencyStyle).toBe('none');
    expect(s.sectionOrder).toContain('how_it_works');
    expect(s.socialProofBlock).toBe('testimonials');
  });
});

describe('Hard constraints hold across many inputs', () => {
  const sessions = [
    undefined, {}, { isReturning: false }, { isReturning: true },
    { isReturning: false, context: { device: 'mobile', hour: 7 } },
    { isReturning: true, signals: { cta_hover: true, scroll_depth: 0.9, dwell_time: 5 } },
    { isReturning: true, signals: { dwell_time: 40, scroll_depth: 0.1 } },
    { isReturning: true, lastInteractedSection: 'pricing_or_value', prevScrollDepth: 0.7 },
    { isReturning: false, profile: 'landlord', signals: { exit_intent: true } },
  ];
  it('sectionOrder is always a unique subset of the pool, starts with hero, includes final_cta', () => {
    for (const sess of sessions) {
      const s = getLandingSpec(sess);
      expect(isSubsetOfPool(s.sectionOrder)).toBe(true);
      expect(hasUniqueKeys(s.sectionOrder)).toBe(true);
      expect(s.sectionOrder[0]).toBe('hero');
      expect(s.sectionOrder).toContain('final_cta');
    }
  });
  it('never emits fabricated live-activity social proof', () => {
    for (const sess of sessions) {
      expect(getLandingSpec(sess).socialProofBlock).not.toBe('map_activity');
    }
  });
  it('headline + subheadline always match the chosen role + hero variant', () => {
    for (const sess of sessions) {
      const s = getLandingSpec(sess);
      const hero = getRoleContent(s.role).hero[s.heroVariant];
      expect(s.headline).toBe(hero.headline);
      expect(s.subheadline).toBe(hero.sub);
    }
  });
  it('spec carries role-specific content (problem/dream/mechanism)', () => {
    const s = getLandingSpec({ isReturning: true, profile: 'landlord' });
    expect(s.role).toBe('landlord');
    expect(s.content.problem.heading).toMatch(/47 enquiries/i);
    expect(Array.isArray(s.content.mechanism)).toBe(true);
  });
});

describe('Profile nudges feature priority (never trust/constraints)', () => {
  it('landlord/investor surfaces reputation first', () => {
    const s = getLandingSpec({ isReturning: true, profile: 'landlord' });
    expect(s.featureCards[0].id).toBe('reputation');
  });
  it('feature cards are always sorted by priority', () => {
    const s = getLandingSpec({ isReturning: true });
    const prio = s.featureCards.map((c) => c.priority);
    expect(prio).toEqual([...prio].sort((a, b) => a - b));
  });
});

describe('Performance — must be well under 100ms (no LLM path)', () => {
  it('1000 spec generations complete in < 100ms total', () => {
    const t0 = performance.now();
    for (let i = 0; i < 1000; i++) {
      getLandingSpec({ isReturning: i % 2 === 0, signals: { scroll_depth: (i % 10) / 10, dwell_time: i % 50, cta_hover: i % 3 === 0 }, context: { device: i % 2 ? 'mobile' : 'desktop', hour: i % 24 } });
    }
    expect(performance.now() - t0).toBeLessThan(100);
  });
});
