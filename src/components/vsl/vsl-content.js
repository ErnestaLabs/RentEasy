/**
 * VSL content map — parameterised by userType.
 *
 * HARD RULE: No fabricated metrics/traction numbers.
 * Pain depictions are villain framing, not RentEazy stats.
 * Platform facts (9 match types, free, mutual match, reputation travels) are real.
 */

export const CONTENT = {
  tenant: {
    // Act 1 — INTERRUPT: word-by-word hook on pure black
    // Target inner monologue: "it's 1am, I'm still on SpareRoom, that room was gone before I even messaged"
    // SpareRoom is the UK's #1 rooms/flatshare platform — far more resonant for
    // renters than Rightmove (which is agent/whole-property led).
    hookWords: ['Still', 'refreshing', 'SpareRoom', 'at', '1am?'],
    hookSubline: 'Your messages just echo in a black hole.',

    // Act 2 — IDENTIFY: pain cards in renters' OWN words (verbatim from Reddit VoC)
    painCards: [
      { title: '"Already let, sorry"', sub: 'Listed 4 hrs ago. Gone before you messaged.' },
      { title: 'Messages into a black hole', sub: '20+ sent. Not even a "no" comes back.' },
      { title: 'Worse than dating', sub: 'At least there, someone turns you down.' },
      { title: '"Get premium or forget it"', sub: 'Pay up — or say goodbye to a decent room.' },
    ],
    identityLine: 'The place you want doesn\'t wait.',
    identityAccent: 'doesn\'t wait',

    // Act 3 — AGITATE: their exact spiral — ending on the real, unsaid fear
    agitateLines: [
      'You refresh at 7am. Same rooms. Already gone.',
      'You earn well — still asked for a guarantor, or a year upfront.',
      'You did everything right. It still doesn\'t matter.',
    ],
    anguishLine: 'SpareRoom rewards whoever messages first — not whoever fits.',
    anguishAccent: 'not whoever fits',

    // Act 4 — BRIDGE: the pivot moment
    bridgeLine: 'What if the right place found you?',
    bridgeAccent: 'found you',
    bridgeSub: 'Not 300 listings. The room where they already want you — and your reputation arrives before you do.',

    // Act 5 — REVEAL
    revealLabel: 'FOR TENANTS',
    revealTagline: 'Post once. Match with landlords who already want you.',

    // Act 6 — PROOF hook
    proofHook: 'You match only when both like. Then you talk.',

    // Act 7 — CLOSE: hard close on the consequence
    identityFrame: 'Stop searching. Start matching.',
    identityAccentWord: 'matching',
    ctaLabel: 'Find your match — it\'s free',
    consequenceLine: 'SpareRoom isn\'t going anywhere. Neither is the queue in front of you.',
  },

  landlord: {
    // Act 1 — INTERRUPT: the void month is bleeding money
    hookWords: ['How', 'many', 'void', 'weeks', 'this', 'year?'],
    hookSubline: 'Every empty week is rent you\'ll never get back.',

    // Act 2 — IDENTIFY: landlord inner monologue
    painCards: [
      { title: '30 viewings booked. 1 showed.', sub: 'The rest confirmed — then ghosted.' },
      { title: 'Like Facebook Marketplace', sub: 'Ghosters, or a sob story with bad credit.' },
      { title: '"They don\'t care who they put in"', sub: 'That\'s your agent. On 10% + VAT.' },
      { title: '47 enquiries today', sub: 'Maybe 3 are real. Good luck finding them.' },
    ],
    identityLine: 'You want the right tenant. Not the loudest one.',
    identityAccent: 'right tenant',

    // Act 3 — AGITATE: ending on the real fear — a bad tenant is now unrecoverable
    agitateLines: [
      'Every no-show is an afternoon you can\'t get back.',
      'Every unqualified enquiry is noise hiding the signal.',
      'And with Section 21 gone, the wrong one stays for a year.',
    ],
    anguishLine: 'Portals sell your listing to everyone. Then leave you to sort the mess.',
    anguishAccent: 'leave you to sort the mess',

    // Act 4 — BRIDGE
    bridgeLine: 'What if the right tenant came to you — already verified?',
    bridgeAccent: 'already verified',
    bridgeSub: 'Budget confirmed. Move date set. And you choose who gets the keys — not whoever shouted first.',

    // Act 5 — REVEAL
    revealLabel: 'FOR LANDLORDS',
    revealTagline: 'List free. Match with tenants who already fit.',

    // Act 6 — PROOF
    proofHook: 'Your listing works while you sleep.',

    // Act 7 — CLOSE
    identityFrame: 'Stop advertising. Start matching.',
    identityAccentWord: 'matching',
    ctaLabel: 'List your property — free',
    consequenceLine: 'Rightmove charges per listing. Here you post free. Forever.',
  },

  investor: {
    // Act 1 — INTERRUPT: the deal was under offer before they saw it
    hookWords: ['Another', '"off-market', 'gem"?'],
    hookSubline: 'You can\'t tell who\'s real until it\'s too late.',

    // Act 2 — IDENTIFY: the real investor pain is SOURCER TRUST (verbatim VoC)
    painCards: [
      { title: 'Numbers that don\'t stack up', sub: 'Most "deals" don\'t survive real diligence.' },
      { title: 'Real operator, or course grad?', sub: 'No barrier to entry. You can\'t tell.' },
      { title: '"Off-market gem"', sub: 'A WhatsApp blast. Soon deleted. Full of adverts.' },
      { title: 'You find out too late', sub: 'After the deposit. After the contract.' },
    ],
    identityLine: 'You can\'t tell a real operator from a course graduate.',
    identityAccent: 'course graduate',

    // Act 3 — AGITATE
    agitateLines: [
      'Every "deal" is inflated numbers — until you\'ve transacted.',
      'Your sourcer network is three names on WhatsApp.',
      'And nothing tells you who actually delivers.',
    ],
    anguishLine: 'Hype sells the deal. Nobody shows you the track record.',
    anguishAccent: 'the track record',

    // Act 4 — BRIDGE
    bridgeLine: 'What if trust came before the deal — not after?',
    bridgeAccent: 'before the deal',
    bridgeSub: 'Completed deals, track record, Companies House, redress registration — proof on every profile. See who delivers before you ever message.',

    // Act 5 — REVEAL
    revealLabel: 'FOR INVESTORS',
    revealTagline: 'See the track record. Then make the call.',

    // Act 6 — PROOF
    proofHook: 'Reputation is earned with proof. The more they prove, the more you trust.',

    // Act 7 — CLOSE
    identityFrame: 'Stop estimating. Start matching.',
    identityAccentWord: 'matching',
    ctaLabel: 'Build your investor profile — free',
    consequenceLine: 'First movers see the data. Everyone else sees the news article about it.',
  },

  agent: {
    // Act 1 — INTERRUPT: the unqualified lead carousel
    hookWords: ['Another', 'unqualified', 'lead.', 'Again.'],
    hookSubline: 'Your time is the most expensive thing in the deal.',

    // Act 2 — IDENTIFY: agent pain cards
    painCards: [
      { title: 'No-show #3 this week', sub: 'Confirmed Tuesday. Ghosted. You rescheduled twice.' },
      { title: 'Landlord gone quiet', sub: 'After 6 viewings arranged. No feedback. No instruction.' },
      { title: 'Unqualified referral', sub: 'Budget £800 under. Why was this sent to you?' },
      { title: 'Duplicate listing', sub: 'Same flat, same photos, three different agents, three prices.' },
    ],
    identityLine: 'You built your reputation one good match at a time.',
    identityAccent: 'reputation',

    // Act 3 — AGITATE
    agitateLines: [
      'Every unqualified lead wastes your time and your vendor\'s trust.',
      'Every no-show viewing chips away at your credibility.',
      'Every ghosted landlord is an instruction you\'ll never recover.',
    ],
    anguishLine: 'Portals sell eyeballs. Your reputation is worth more than eyeballs.',
    anguishAccent: 'worth more',

    // Act 4 — BRIDGE
    bridgeLine: 'What if verified, matched demand came directly to you?',
    bridgeAccent: 'verified, matched demand',
    bridgeSub: 'Budget confirmed. Reputation visible. Both sides serious before hello.',

    // Act 5 — REVEAL
    revealLabel: 'FOR AGENTS',
    revealTagline: 'Get verified tenant demand. Build your rep.',

    // Act 6 — PROOF
    proofHook: 'Your reputation travels with every match you make.',

    // Act 7 — CLOSE
    identityFrame: 'Stop chasing. Start matching.',
    identityAccentWord: 'matching',
    ctaLabel: 'Get verified demand — free',
    consequenceLine: 'Rightmove sells leads. Here, matches are earned — not bought.',
  },
};

/** Real platform facts for Act 6. No invented user or traction numbers. */
export const PLATFORM_FACTS = [
  { count: 9,  label: 'match types',          sub: 'Budget, area, move date & 6 more' },
  { count: 18, label: 'ways to post',          sub: 'Flexible for any landlord or agent' },
  { count: 0,  label: 'cost to join',          sub: 'Free to post. Free to swipe. Always.' },
  { count: 2,  label: 'sides must match',      sub: 'Mutual — never one-sided' },
];

export const PLATFORM_FEATURES = [
  'Free to post. Free to swipe.',
  'Mutual match — a match needs both sides.',
  '9 match types: budget, area, move date & more.',
  '18 ways to post a listing.',
  'Reputation travels with every match.',
  'Live in East London — growing now.',
];

/** Role-specific listing UI fragments shown in Act 2 background */
export const LISTING_FRAGMENTS_BY_TYPE = {
  tenant: [
    { title: 'Hackney 2-bed · £2,400pcm', sub: 'Listed 2 hrs ago · 38 enquiries', x: '62%', y: '28%', r:  2, ef: 28 },
    { title: 'Inbox: 22 unread',           sub: 'Landlord last seen 9 days ago',   x: '3%',  y: '28%', r: -2, ef: 48 },
  ],
  landlord: [
    { title: '47 new enquiries today',     sub: '3 match your criteria. Maybe.',   x: '62%', y: '28%', r:  2, ef: 28 },
    { title: 'Void: Week 3',               sub: '£1,950 pcm · £5,850 lost so far', x: '3%',  y: '28%', r: -2, ef: 48 },
  ],
  agent: [
    { title: 'Lead from portal',           sub: 'Budget £800 short. Again.',       x: '62%', y: '28%', r:  2, ef: 28 },
    { title: 'Viewing #3 no-show',         sub: 'Confirmed. Ghosted. No reply.',   x: '3%',  y: '28%', r: -2, ef: 48 },
  ],
  investor: [
    { title: 'Yield estimate: 4.2%',       sub: 'Based on Q3 2024 data. Stale.',   x: '62%', y: '28%', r:  2, ef: 28 },
    { title: 'WhatsApp deal alert',        sub: '"Off-market gem." No, it isn\'t.', x: '3%',  y: '28%', r: -2, ef: 48 },
  ],
};

/** Honest before/after contrast for Act 5 split-screen */
export const BEFORE_AFTER = {
  before: {
    label: 'PORTALS',
    points: [
      'Post into the void — hope for the best',
      'Unqualified flood of enquiries',
      'No context before first contact',
      'Ghosting is the norm',
    ],
  },
  after: {
    label: 'RENTEAZY',
    points: [
      'Match only when both like — then talk',
      'Context and fit before hello',
      '9 match criteria filter bad fits out',
      'Reputation protects both sides',
    ],
  },
};

/**
 * Role-specific card data for the Act 5 swipe demo.
 *
 * CRITICAL: the swipe card must depict what THAT role actually swipes:
 *   - tenant  → a HOME (property photo)
 *   - landlord/agent → a TENANT (a real person photo)
 *   - investor → a DEAL (property photo)
 * Only two real people photos exist: match-tenant.jpg (man), match-agent.jpg
 * (woman). Every match-flat / match-room file is an interior. Labels MUST match
 * the photo (no tenant name over a room).
 *
 * counterImage = the OTHER matched party shown in the "It's a match" pop, so the
 * two avatars are logically correct (person ↔ home), never a random stranger.
 * matchLine = honest, sequential copy: you liked, they liked back. A match only
 * exists because BOTH chose — never "both liked first".
 */
export const CARD_DATA_BY_TYPE = {
  // Tenant swipes a room in a flatshare (SpareRoom territory); matches when the
  // existing flatmates pick them back.
  tenant: {
    image:        '/images/match-room-2.jpg', // a real bedroom
    counterImage: '/images/match-agent.jpg',  // a flatmate, a person
    matchScore:   94,
    title:        'Double room',
    location:     'In a 3-bed flatshare · London Fields, E8',
    price:        '£1,050 pcm',
    tags:         ['Bills incl.', 'Furnished', 'Pro flatmates'],
    repScore:     '4.9',
    matchLine:    'You liked the room. The flatmates picked you back.',
  },
  // Landlord swipes a tenant (a person); matches when the tenant wants the place.
  landlord: {
    image:        '/images/match-agent.jpg',  // a real person (tenant)
    counterImage: '/images/match-flat.jpg',   // their property
    matchScore:   91,
    title:        'Priya S. · Tenant',
    location:     'Seeking Hackney / Bow, E3',
    price:        'Budget £2,000 pcm',
    tags:         ['Verified', 'Move-ready', 'Long-term'],
    repScore:     '4.8',
    matchLine:    'You liked them. They want your place.',
  },
  // Agent swipes a qualified tenant lead; matches on mutual interest.
  agent: {
    image:        '/images/match-tenant.jpg', // a real person (tenant lead)
    counterImage: '/images/match-flat-3.jpg', // the instruction / property
    matchScore:   96,
    title:        'Jordan M. · Tenant',
    location:     'Seeking Stratford / Forest Gate',
    price:        'Budget £2,400 pcm',
    tags:         ['Pre-qualified', 'Verified', 'Long-term'],
    repScore:     '5.0',
    matchLine:    'Verified lead. Mutual interest confirmed.',
  },
  // Investor swipes a deal; matches when a verified sourcer is behind it.
  investor: {
    image:        '/images/match-flat-2.jpg', // the deal (property)
    counterImage: '/images/match-tenant.jpg', // the sourcer, a person
    matchScore:   88,
    title:        'Stratford 1-bed',
    location:     'Stratford, E15 · 5.8% yield est.',
    price:        '£1,650 pcm',
    tags:         ['High demand', 'Near Crossrail', 'Verified'],
    repScore:     null,
    matchLine:    'Deal matched. The sourcer is verified.',
  },
};

export default CONTENT;
