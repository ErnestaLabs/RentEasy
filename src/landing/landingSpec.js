// RentEazy runtime landing personalisation — pure, deterministic, <1ms, NO LLM.
// getLandingSpec(session) -> LandingSpec. The renderer consumes only the spec.
// Role-aware: the spec carries the chosen role's content (hero/problem/dream/
// mechanism/proof) so the BODY changes per role, not just the hero.
//
// HONESTY (hard constraints): no fake urgency, no fabricated live stats
// (socialProofBlock never 'map_activity'), trust never personalised away,
// degrade to a complete default when there are no signals.

import { getRoleContent } from './roleContent.js';

/** @typedef {'fast_match'|'deep_explain'|'social_proof'} HeroVariant */

// Only these sections may appear in sectionOrder (VSL arc + value beats).
export const SECTION_POOL = [
  'hero',
  'problem',
  'dream',
  'vsl',
  'how_it_works',
  'featured_listings_preview',
  'trust_and_safety',
  'social_proof',
  'pricing_or_value',
  'final_cta',
];

const FULL_ARC = ['hero', 'problem', 'dream', 'vsl', 'how_it_works', 'featured_listings_preview', 'trust_and_safety', 'social_proof', 'pricing_or_value', 'final_cta'];

const DEFAULT_FEATURE_CARDS = [
  { id: 'mutual', title: 'Mutual Match', description: 'Both sides like before anyone wastes a viewing.', priority: 1, visible: true },
  { id: 'reputation', title: 'Reputation that travels', description: 'Your track record follows you, move to move.', priority: 2, visible: true },
  { id: 'free', title: 'Free to post & swipe', description: 'No paywall on listing or browsing.', priority: 3, visible: true },
  { id: 'scored', title: 'Scored, filtered decks', description: 'Every card already fits your brief.', priority: 4, visible: true },
];

function applyRole(spec, role, variant) {
  const rc = getRoleContent(role);
  const hero = rc.hero[variant] || rc.hero.deep_explain;
  spec.role = role;
  spec.content = rc;
  spec.headline = hero.headline;
  spec.subheadline = hero.sub;
  spec.ctaPrimary = rc.cta;
  return spec;
}

/** A complete, safe default — used when no signals exist (graceful degrade). */
export function defaultLandingSpec() {
  const spec = {
    heroVariant: 'deep_explain',
    headline: '',
    subheadline: '',
    sectionOrder: FULL_ARC.slice(),
    ctaPrimary: '',
    ctaSecondary: 'See how it works',
    featureCards: DEFAULT_FEATURE_CARDS.map((c) => ({ ...c })),
    socialProofBlock: 'stats',
    urgencyStyle: 'none',
    reason: 'default — no signals',
  };
  return applyRole(spec, 'tenant', 'deep_explain');
}

// ── Signal interpretation ──────────────────────────────────────────────────
function intentFromSignals(s = {}) {
  const scrollDepth = s.scroll_depth ?? 0;
  const dwell = s.dwell_time ?? 0;
  const ctaHover = !!s.cta_hover;
  const exit = !!s.exit_intent;
  const fastScroll = scrollDepth >= 0.5 && dwell > 0 && scrollDepth / Math.max(dwell, 1) > 0.06;
  if (ctaHover || exit || (fastScroll && scrollDepth >= 0.4)) return 'high';
  if (dwell >= 20 && scrollDepth < 0.4) return 'low';
  return 'neutral';
}

function heroForFirstTime(context = {}) {
  const morning = context.hour != null && context.hour >= 6 && context.hour < 11;
  if (context.device === 'mobile' || morning) return 'fast_match';
  return 'social_proof';
}

/**
 * @param {object} session
 * @returns {object} LandingSpec
 */
export function getLandingSpec(session) {
  if (!session || (!session.signals && !session.context && !session.profile && !session.isReturning)) {
    return defaultLandingSpec();
  }

  const signals = session.signals || {};
  const context = session.context || {};
  const role = session.profile || 'tenant';
  const intent = intentFromSignals(signals);
  const spec = defaultLandingSpec();
  let variant = 'deep_explain';

  // ── Rule 1: First-time visitor — minimal, strong CTA above fold
  if (!session.isReturning) {
    variant = heroForFirstTime(context);
    spec.sectionOrder = ['hero', 'social_proof', 'final_cta'];
    spec.socialProofBlock = 'stats';
    spec.urgencyStyle = 'none';
    spec.reason = `first-time · hero=${variant}`;
  } else {
    // ── Rule 2: Returning — reorder by prior scroll depth, surface last interacted
    variant = 'deep_explain';
    let order = FULL_ARC.slice();
    const last = session.lastInteractedSection;
    if (last && SECTION_POOL.includes(last) && last !== 'hero') {
      order = ['hero', last, ...order.filter((k) => k !== 'hero' && k !== last)];
    }
    if ((session.prevScrollDepth ?? 0) > 0.6) {
      order = order.filter((k) => k !== 'pricing_or_value');
      order.splice(2, 0, 'pricing_or_value');
    }
    spec.sectionOrder = order;
    spec.reason = `returning · last=${last || 'none'} · prevScroll=${session.prevScrollDepth ?? 0}`;
  }

  // ── Rule 3: High intent — urgency (REAL), reduce explanation, push CTA up
  if (intent === 'high') {
    variant = session.isReturning ? variant : 'fast_match';
    spec.urgencyStyle = 'strong';
    spec.sectionOrder = ['hero', 'final_cta', ...spec.sectionOrder.filter((k) => !['hero', 'final_cta', 'how_it_works', 'problem', 'dream'].includes(k))];
    spec.reason += ' · intent=high';
  }

  // ── Rule 4: Low intent — explanation+emotion first, more proof, slower
  if (intent === 'low') {
    variant = 'deep_explain';
    spec.urgencyStyle = 'none';
    spec.sectionOrder = ['hero', 'problem', 'dream', 'how_it_works', 'trust_and_safety', 'social_proof', 'featured_listings_preview', 'pricing_or_value', 'final_cta'];
    spec.socialProofBlock = 'testimonials';
    spec.reason += ' · intent=low';
  }

  spec.heroVariant = variant;
  applyRole(spec, role, variant);
  if (intent === 'high') spec.ctaPrimary = 'Claim your spot — free';

  // Profile nudges feature-card priority (never trust/constraints).
  if (role === 'landlord' || role === 'investor') {
    spec.featureCards = spec.featureCards.map((c) =>
      c.id === 'reputation' ? { ...c, priority: 0 } : c
    );
  }
  spec.featureCards = spec.featureCards.slice().sort((a, b) => a.priority - b.priority);

  // ── Invariants ─────────────────────────────────────────────────────────────
  spec.sectionOrder = spec.sectionOrder.filter((k, i, arr) => SECTION_POOL.includes(k) && arr.indexOf(k) === i);
  if (spec.sectionOrder[0] !== 'hero') spec.sectionOrder = ['hero', ...spec.sectionOrder.filter((k) => k !== 'hero')];
  if (!spec.sectionOrder.includes('final_cta')) spec.sectionOrder.push('final_cta');
  if (spec.socialProofBlock === 'map_activity') spec.socialProofBlock = 'stats';

  return spec;
}
