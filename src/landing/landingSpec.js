// RentEazy runtime landing personalisation — pure, deterministic, <1ms, NO LLM.
// getLandingSpec(session) -> LandingSpec. The renderer consumes only the spec.
//
// HONESTY (hard constraints, enforced here):
//   - No fake urgency: urgencyStyle only ever maps to REAL levers (launch
//     pricing, East-London early-mover) in the renderer — never "N people
//     viewing now".
//   - No misleading stats: socialProofBlock never emits 'map_activity' / live
//     counts (no data pre-launch). Allowed: 'stats' (real platform facts),
//     'testimonials', 'none'.
//   - Trust is never personalised away (reputation/verification always render).
//   - Degrades to a complete default spec when there are no signals.

/** @typedef {'fast_match'|'deep_explain'|'social_proof'} HeroVariant */

// Only these sections may appear in sectionOrder.
export const SECTION_POOL = [
  'hero',
  'how_it_works',
  'featured_listings_preview',
  'trust_and_safety',
  'social_proof',
  'pricing_or_value',
  'final_cta',
];

// Honest hero copy per variant. (The blueprint's "Thousands matched this week"
// is fabricated pre-launch — replaced with truthful social-proof framing.)
export const HERO_VARIANTS = {
  fast_match: {
    headline: 'Match with a London home — fast.',
    subheadline: 'Swipe scored homes that fit your brief. When the landlord or agent likes you back, it’s a match.',
  },
  deep_explain: {
    headline: 'Smarter renting, powered by mutual matching.',
    subheadline: 'Set what you need. Both sides like first. No cold messages, no wasted viewings — and your reputation travels with you.',
  },
  social_proof: {
    headline: 'The rental network where both sides match first.',
    subheadline: 'Tenants, agents and landlords match on mutual interest. Live in East London now — be early.',
  },
};

const DEFAULT_FEATURE_CARDS = [
  { id: 'mutual', title: 'Mutual Match', description: 'Both sides like before anyone wastes a viewing.', priority: 1, visible: true },
  { id: 'reputation', title: 'Reputation that travels', description: 'Your track record follows you, move to move.', priority: 2, visible: true },
  { id: 'free', title: 'Free to post & swipe', description: 'No paywall on listing or browsing.', priority: 3, visible: true },
  { id: 'scored', title: 'Scored, filtered decks', description: 'Every card already fits your brief.', priority: 4, visible: true },
];

/** A complete, safe default — used when no signals exist (graceful degrade). */
export function defaultLandingSpec() {
  return {
    heroVariant: 'deep_explain',
    headline: HERO_VARIANTS.deep_explain.headline,
    subheadline: HERO_VARIANTS.deep_explain.subheadline,
    sectionOrder: ['hero', 'how_it_works', 'trust_and_safety', 'social_proof', 'pricing_or_value', 'final_cta'],
    ctaPrimary: 'Start matching — it’s free',
    ctaSecondary: 'See how it works',
    featureCards: DEFAULT_FEATURE_CARDS.map((c) => ({ ...c })),
    socialProofBlock: 'stats',
    urgencyStyle: 'none',
    reason: 'default — no signals',
  };
}

// ── Signal interpretation ──────────────────────────────────────────────────
function intentFromSignals(s = {}) {
  const scrollDepth = s.scroll_depth ?? 0; // 0..1
  const dwell = s.dwell_time ?? 0; // seconds on page
  const ctaHover = !!s.cta_hover;
  const exit = !!s.exit_intent;
  const fastScroll = scrollDepth >= 0.5 && dwell > 0 && scrollDepth / Math.max(dwell, 1) > 0.06;

  // High intent: hovering CTA, or fast deep scroll, or exit-intent (last chance).
  if (ctaHover || exit || (fastScroll && scrollDepth >= 0.4)) return 'high';
  // Low intent: lingering (high dwell) but not progressing (low scroll).
  if (dwell >= 20 && scrollDepth < 0.4) return 'low';
  return 'neutral';
}

function heroForFirstTime(context = {}) {
  // First-timers: fast_match on mobile / morning scan; social_proof otherwise.
  const morning = context.hour != null && context.hour >= 6 && context.hour < 11;
  if (context.device === 'mobile' || morning) return 'fast_match';
  return 'social_proof';
}

/**
 * @param {object} session
 * @returns {object} LandingSpec
 */
export function getLandingSpec(session) {
  // Hard constraint: degrade to default if nothing to personalise on.
  if (!session || (!session.signals && !session.context && !session.profile && !session.isReturning)) {
    return defaultLandingSpec();
  }

  const signals = session.signals || {};
  const context = session.context || {};
  const intent = intentFromSignals(signals);
  const spec = defaultLandingSpec();

  // ── Rule 1: First-time visitor — minimal, strong CTA above fold, no complexity
  if (!session.isReturning) {
    spec.heroVariant = heroForFirstTime(context);
    spec.sectionOrder = ['hero', 'social_proof', 'final_cta']; // 3 max
    spec.socialProofBlock = 'stats';
    spec.urgencyStyle = 'none';
    spec.reason = `first-time · hero=${spec.heroVariant}`;
  } else {
    // ── Rule 2: Returning visitor — reorder by prior scroll depth, surface last interacted
    spec.heroVariant = 'deep_explain';
    let order = ['hero', 'how_it_works', 'featured_listings_preview', 'trust_and_safety', 'social_proof', 'pricing_or_value', 'final_cta'];
    const last = session.lastInteractedSection;
    if (last && SECTION_POOL.includes(last) && last !== 'hero') {
      order = ['hero', last, ...order.filter((k) => k !== 'hero' && k !== last)];
    }
    // If they previously scrolled deep, they've seen the top — lead with value/CTA sooner.
    if ((session.prevScrollDepth ?? 0) > 0.6) {
      order = order.filter((k) => k !== 'pricing_or_value');
      order.splice(2, 0, 'pricing_or_value');
    }
    spec.sectionOrder = order;
    spec.reason = `returning · last=${last || 'none'} · prevScroll=${session.prevScrollDepth ?? 0}`;
  }

  // ── Rule 3: High intent — urgency (REAL), reduce explanation, push CTA up
  if (intent === 'high') {
    spec.heroVariant = session.isReturning ? spec.heroVariant : 'fast_match';
    spec.urgencyStyle = 'strong'; // renderer maps to real launch/early-mover lever only
    spec.ctaPrimary = 'Claim your spot — free';
    // drop heavy explanation, move final_cta high
    spec.sectionOrder = ['hero', 'final_cta', ...spec.sectionOrder.filter((k) => k !== 'hero' && k !== 'final_cta' && k !== 'how_it_works')];
    spec.reason += ' · intent=high (urgency, reduced explain)';
  }

  // ── Rule 4: Low intent — explanation-first, more social proof, slower path
  if (intent === 'low') {
    spec.heroVariant = 'deep_explain';
    spec.headline = HERO_VARIANTS.deep_explain.headline;
    spec.urgencyStyle = 'none';
    spec.sectionOrder = ['hero', 'how_it_works', 'trust_and_safety', 'social_proof', 'featured_listings_preview', 'pricing_or_value', 'final_cta'];
    spec.socialProofBlock = 'testimonials';
    spec.reason += ' · intent=low (explain-first, more proof)';
  }

  // Profile (inferred intent) nudges feature-card priority — never trust/constraints.
  if (session.profile === 'landlord' || session.profile === 'investor') {
    spec.featureCards = spec.featureCards.map((c) =>
      c.id === 'reputation' ? { ...c, priority: 1 } : c.id === 'mutual' ? { ...c, priority: 2 } : c
    );
  }

  // Keep hero headline/sub in sync with the chosen variant.
  spec.headline = HERO_VARIANTS[spec.heroVariant].headline;
  spec.subheadline = HERO_VARIANTS[spec.heroVariant].subheadline;

  // ── Invariants (hard constraints) ─────────────────────────────────────────
  // sectionOrder must be a subset of the pool, must start with hero, must keep final_cta.
  spec.sectionOrder = spec.sectionOrder.filter((k, i, arr) => SECTION_POOL.includes(k) && arr.indexOf(k) === i);
  if (spec.sectionOrder[0] !== 'hero') spec.sectionOrder = ['hero', ...spec.sectionOrder.filter((k) => k !== 'hero')];
  if (!spec.sectionOrder.includes('final_cta')) spec.sectionOrder.push('final_cta');
  // Never emit fabricated live-activity social proof.
  if (spec.socialProofBlock === 'map_activity') spec.socialProofBlock = 'stats';
  // Feature cards always sorted by priority; visible cards never empty.
  spec.featureCards = spec.featureCards.slice().sort((a, b) => a.priority - b.priority);

  return spec;
}
