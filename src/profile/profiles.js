// Profile model for the "land → pick who you are → get YOUR landing" flow.
// Each profile maps to: the VSL variant (userType), hero framing, primary CTA,
// and which existing section anchors matter most for that audience.
// Starting deep on `tenant`; the others are functional and ready to deepen.

export const PROFILE_ORDER = ['tenant', 'landlord', 'investor'];

export const PROFILES = {
  tenant: {
    key: 'tenant',
    vslUserType: 'tenant',
    label: 'Renter or buddy',
    blurb: 'Find a home — or someone to share one with.',
    icon: 'solar:user-rounded-bold',
    accent: '#2670a8',
    iconBg: '#edf7ff',
    iconBorder: '#cde7f8',
    hero: {
      eyebrow: 'FOR RENTERS & HOUSE BUDDIES',
      // headline is rendered as: "Your next {rotating} could" + pill "like you first."
      // For tenants we narrow the rotating set to what they actually swipe.
      rotating: ['room', 'flat', 'home', 'studio', 'house', 'buddy', 'share', 'match'],
      sub: 'Stop applying to listings that are already gone. Swipe scored homes that fit your brief — and match when a landlord or agent likes you back.',
      cta: 'Start matching — it’s free',
      ctaHref: '/signup?source=hero_tenant&profile=tenant&offer=match24h',
      secondary: { label: 'Browse the Feed', href: '#feed' },
    },
    // section anchors to surface first for this profile
    emphasis: ['match', 'vsl', 'how-it-works', 'swipe-ui', 'why-switch', 'be-early', 'pricing', 'faq'],
  },

  landlord: {
    key: 'landlord',
    vslUserType: 'landlord',
    label: 'Landlord or agent',
    blurb: 'Fill a property with the right tenant, fast.',
    icon: 'solar:buildings-bold',
    accent: '#2f7d32',
    iconBg: '#edf8ee',
    iconBorder: '#d5ecd7',
    hero: {
      eyebrow: 'FOR LANDLORDS & AGENTS',
      rotating: ['tenant', 'renter', 'buddy', 'agent', 'match'],
      sub: 'Stop wading through unqualified enquiries. See vetted, ready tenants who match your property — and build a reputation that wins your next instruction.',
      cta: 'List your property — free',
      ctaHref: '/signup?source=hero_landlord&profile=landlord&offer=match24h',
      secondary: { label: 'For agents & landlords', href: '#partners' },
    },
    emphasis: ['match', 'partners', 'vsl', 'why-switch', 'marketplace', 'be-early', 'pricing', 'faq'],
  },

  investor: {
    key: 'investor',
    vslUserType: 'investor',
    label: 'Investor, operator or sourcer',
    blurb: 'Deal flow and demand signals, matched by strategy.',
    icon: 'solar:graph-up-bold',
    accent: '#092243',
    iconBg: 'rgba(9,34,67,0.06)',
    iconBorder: 'rgba(9,34,67,0.12)',
    hero: {
      eyebrow: 'FOR OPERATORS, INVESTORS & SOURCERS',
      rotating: ['deal', 'sourcer', 'investor', 'operator', 'match'],
      sub: 'Stop chasing stale deals in WhatsApp groups. Match by strategy with a market that remembers who actually delivers.',
      cta: 'Build your investor profile — free',
      ctaHref: '/signup?source=hero_investor&profile=investor&offer=match24h',
      secondary: { label: 'Explore opportunities', href: '#marketplace' },
    },
    emphasis: ['match', 'marketplace', 'vsl', 'why-switch', 'be-early', 'pricing', 'faq'],
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
