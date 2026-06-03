// Genuinely per-role landing content (VSL emotional arc: hook → problem →
// dream → mechanism → proof). This is what makes a landlord's page actually
// different from a tenant's — not just the hero. Honest: problem framing is
// real pain; dream is framed as the experience, not as fabricated RentEazy
// metrics; proof uses real platform facts only.

export const ROLE_CONTENT = {
  tenant: {
    label: 'Renters & buddies',
    accent: '#2670a8',
    hero: {
      fast_match: { headline: 'Match with a London home — fast.', sub: 'Swipe homes scored to your brief. When the landlord or agent likes you back, it’s a match.' },
      deep_explain: { headline: 'The rental search that finally works for you.', sub: 'No more applications into the void. Set what you need, swipe what fits, and match on mutual interest.' },
      social_proof: { headline: 'Stop applying. Start matching.', sub: 'Tenants, agents and landlords match first — then talk. Live in East London now.' },
    },
    problem: {
      heading: 'You’re not bad at this. The system is broken.',
      lines: ['You send 20 messages. They echo in a black hole — not even a “no”.', 'You refresh the portals every morning — same listings, already gone.', 'No way to know if you’re even a strong applicant before you waste the trip.'],
    },
    dream: {
      heading: 'Imagine opening an app to three places that actually fit.',
      sub: 'The landlord already knows you’re serious. You already know the place suits you. One viewing. You like it, they like you, you take it. That’s matching — direct, with no chasing someone who never calls back.',
    },
    mechanism: ['Create your free profile — no premium wall, and your reputation travels with you', 'Swipe scored homes that fit your brief', 'Match when both sides like → viewing flow begins'],
    proof: 'stats',
    cta: 'Start matching — it’s free',
    ctaHref: '/signup?source=gen_tenant&profile=tenant',
  },

  landlord: {
    label: 'Landlords & agents',
    accent: '#2f7d32',
    hero: {
      fast_match: { headline: 'Fill your property with the right tenant — fast.', sub: 'See people who already match your place, with budgets and move dates set. Not whoever messaged first.' },
      deep_explain: { headline: 'Stop refilling. Start matching the right tenant.', sub: 'Pre-matched tenants with confirmed budgets and move dates — and a reputation that wins your next instruction.' },
      social_proof: { headline: 'Tenants who already want your property.', sub: 'No portal noise, no unqualified blasts. Both sides match on genuine interest. Live in East London now.' },
    },
    problem: {
      heading: 'List on a portal. Get 47 enquiries. Fill it anyway, eventually.',
      lines: ['You speak to a handful. Some ghost after the viewing. One fails referencing.', 'Every empty week is real money out of your pocket — more than a year of platform fees.', 'And with Section 21 gone, the wrong tenant is a 12–18 month problem you can’t undo.'],
    },
    dream: {
      heading: 'See the tenant before you ever pick up the phone.',
      sub: 'Budget set. Move date set. Genuinely interested in your property. You match with people you’d actually want — and you choose who gets the keys, not whoever shouted loudest first.',
    },
    mechanism: ['List your property — free', 'Receive matched tenants with budgets & move dates set', 'Match → meet the right person → fill faster'],
    proof: 'stats',
    cta: 'List your property — free',
    ctaHref: '/signup?source=gen_landlord&profile=landlord',
  },

  investor: {
    label: 'Investors, operators & sourcers',
    accent: '#092243',
    hero: {
      fast_match: { headline: 'Deals matched by strategy — before the portals.', sub: 'Off-market opportunities and credible sourcers, matched to your criteria.' },
      deep_explain: { headline: 'See the numbers before the deal hits Rightmove.', sub: 'Match by strategy with sourcers and operators in a market that remembers who actually delivers.' },
      social_proof: { headline: 'The deals never hit the portals. See them first.', sub: 'Match by strategy with sourcers whose reputation and track record sit on every profile — see who delivers before you commit.' },
    },
    problem: {
      heading: 'The best deals never reach the portals.',
      lines: ['By the time you see them, they’re already under offer.', 'Your sourcer network is three people on WhatsApp — and half make claims they can’t back.', 'No way to verify who’s compliant, who’s credible, who actually delivers.'],
    },
    dream: {
      heading: 'Deal flow that finds you — by strategy, with the numbers attached.',
      sub: 'BTL, HMO, SA — matched to your criteria, with sourcers and operators whose track record and reputation are visible before you ever message. See who actually delivers — before you’re the one who got burned.',
    },
    mechanism: ['Set your criteria & strategy — free', 'Discover matched deals and credible sourcers', 'Build relationships with people who deliver'],
    proof: 'stats',
    cta: 'Build your investor profile — free',
    ctaHref: '/signup?source=gen_investor&profile=investor',
  },
};

export function getRoleContent(role) {
  return ROLE_CONTENT[role] || ROLE_CONTENT.tenant;
}
