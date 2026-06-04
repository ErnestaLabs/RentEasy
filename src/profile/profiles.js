// Profile model for the "land → pick who you are → get YOUR landing" flow.
// Positioning is derived from the Role-Based Landing blueprint (JTBD, real pain
// language, emotional transformation, tone). HONESTY RULE: no fabricated live
// data (review counts, "X matching now", trust scores, void calculators with
// fake numbers). Those `dynamic` hooks are declared but gated off until real
// data exists — the brand sells on "no fake scarcity".

export const PROFILE_ORDER = ['tenant', 'landlord', 'investor'];

export const PROFILES = {
  tenant: {
    key: 'tenant',
    vslUserType: 'tenant',
    label: 'Renter or buddy',
    blurb: 'Find a home — or someone to share one with.',
    icon: 'solar:user-rounded-bold',
    peep: '/images/peeps/peep-standing-1.svg',
    accent: '#2670a8',
    iconBg: '#edf7ff',
    iconBorder: '#cde7f8',
    // JTBD: from powerless searcher → confident person in control of the process.
    hero: {
      eyebrow: 'FOR RENTERS & HOUSE BUDDIES',
      rotating: ['room', 'flat', 'home', 'studio', 'house', 'buddy', 'share', 'match'],
      heroShort: 'Stop shouting into the void. Match first — then only talk to people who already want you. Free to post, free to swipe — no premium wall.',
      sub: 'Searching is exhausting — applications ignored, viewings gone before you can book. RentEazy flips it: swipe homes scored to your brief, and match when the landlord or agent likes you back. No more shouting into the void.',
      cta: 'Start matching — it’s free',
      ctaHref: '/signup?source=hero_tenant&profile=tenant&offer=match24h',
      secondary: { label: 'Browse the Feed', href: '#feed' },
    },
    emphasis: ['match', 'vsl', 'how-it-works', 'swipe-ui', 'why-switch', 'be-early', 'pricing', 'faq'],
    // Honest positioning copy (safe to render now)
    trustWords: ['verified', 'all-in monthly cost', 'real reviews', 'your match score', 'responds within'],
    avoidWords: ['exclusive', 'act now', "don't miss out", 'premium listings', 'upgrade to see more'],
    // Declared hooks that need REAL data before they can render (gated off now)
    dynamicHooks: ['live demand count', 'review counts', 'response-time stats', 'all-in cost calc'],
  },

  landlord: {
    key: 'landlord',
    vslUserType: 'landlord',
    label: 'Landlord or agent',
    blurb: 'Fill a property with the right tenant, fast.',
    icon: 'solar:buildings-bold',
    peep: '/images/peeps/peep-standing-7.svg',
    accent: '#2f7d32',
    iconBg: '#edf8ee',
    iconBorder: '#d5ecd7',
    // JTBD: fill the void fast, with a tenant you can actually trust. Core driver: fear/safety + void cost.
    hero: {
      eyebrow: 'FOR LANDLORDS & AGENTS',
      // What a LANDLORD matches with — a tenant who likes them back. Never
      // 'buddy'/'agent' (tenant-side words that read as a cross-wired bug).
      rotating: ['tenant', 'renter', 'professional', 'household', 'resident', 'match'],
      heroShort: 'See tenants who already want your property — budgets and move dates set. You choose who gets the keys, not whoever shouted loudest.',
      sub: 'Every empty week costs you — and the wrong tenant costs more. See people who already match your property, with budgets and move dates set, and fill the void with someone you trust, not whoever messaged first.',
      cta: 'List your property — free',
      ctaHref: '/signup?source=hero_landlord&profile=landlord&offer=match24h',
      secondary: { label: 'For agents & landlords', href: '#partners' },
    },
    emphasis: ['match', 'partners', 'vsl', 'why-switch', 'marketplace', 'be-early', 'pricing', 'faq'],
    trustWords: ['pre-qualified', 'budget confirmed', 'move date set', 'reputation', 'mutual match'],
    avoidWords: ['thousands of tenants', 'guaranteed tenant', 'easy', 'unlimited leads', 'better than Rightmove'],
    dynamicHooks: ['void cost calculator', 'tenant trust score', 'days-to-let benchmark', 'live demand count'],
  },

  investor: {
    key: 'investor',
    vslUserType: 'investor',
    label: 'Investor, operator or sourcer',
    blurb: 'Deal flow and demand signals, matched by strategy.',
    icon: 'solar:graph-up-bold',
    peep: '/images/peeps/peep-standing-19.svg',
    accent: '#092243',
    iconBg: 'rgba(9,34,67,0.06)',
    iconBorder: 'rgba(9,34,67,0.12)',
    // JTBD: see deals early, match by strategy, work with credible/compliant people. Driver: insider access + data.
    hero: {
      eyebrow: 'FOR OPERATORS, INVESTORS & SOURCERS',
      rotating: ['deal', 'sourcer', 'operator', 'opportunity', 'match'],
      heroShort: 'See the track record before the deal — not after you’ve been burned. Match with sourcers and deals by strategy.',
      sub: 'Stop chasing stale deals in WhatsApp groups. Match by strategy with sourcers and operators in a market that remembers who actually delivers — and see the numbers before the deal hits the portals.',
      cta: 'Build your investor profile — free',
      ctaHref: '/signup?source=hero_investor&profile=investor&offer=match24h',
      secondary: { label: 'Explore opportunities', href: '#marketplace' },
    },
    emphasis: ['match', 'marketplace', 'vsl', 'why-switch', 'be-early', 'pricing', 'faq'],
    trustWords: ['match by strategy', 'verified yield', 'compliance-checked sourcer', 'track record', 'reputation'],
    avoidWords: ['high returns', 'guaranteed yields', 'no experience required', 'exclusive deals'],
    dynamicHooks: ['off-market deal velocity', 'sourcer compliance badges', 'yield benchmarks', 'live investor appetite'],
  },
};

export const DEFAULT_PROFILE = 'tenant';

export function getProfile(key) {
  return PROFILES[key] || PROFILES[DEFAULT_PROFILE];
}

const STORAGE_KEY = 'renteazy-profile';

// Resolve the active profile from URL (?as=tenant) or localStorage. Returns null
// when the visitor hasn't chosen yet (so the chooser gate can show).
export function resolveInitialProfile() {
  if (typeof window === 'undefined') return null;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('as');
    if (fromUrl && PROFILES[fromUrl]) {
      window.localStorage.setItem(STORAGE_KEY, fromUrl);
      return fromUrl;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && PROFILES[stored]) return stored;
  } catch (_) {}
  return null;
}

export function persistProfile(key) {
  if (typeof window === 'undefined' || !PROFILES[key]) return;
  try { window.localStorage.setItem(STORAGE_KEY, key); } catch (_) {}
}
