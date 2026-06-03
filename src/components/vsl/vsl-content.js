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
    // Target inner monologue: "it's 1am, I'm still on Rightmove, this place was gone before I even saw it"
    hookWords: ['Still', 'refreshing', 'Rightmove', 'at', '1am?'],
    hookSubline: 'You already know the answer isn\'t on there.',

    // Act 2 — IDENTIFY: pain cards that name the exact feeling
    painCards: [
      { title: '"Already let, sorry"', sub: 'Listed 4 hrs ago. Gone before your message sent.' },
      { title: '22 messages sent', sub: 'Zero replies. Zero. Not one.' },
      { title: '6 viewings booked', sub: 'Landlord ghosted 4. No-show for the other 2.' },
      { title: '"Still looking"', sub: 'You\'ve said it so many times you hate the words.' },
    ],
    identityLine: 'The flat you want doesn\'t wait.',
    identityAccent: 'doesn\'t wait',

    // Act 3 — AGITATE: visceral cost lines
    agitateLines: [
      'Every morning you check — still nothing right.',
      'Every viewing you rush to is already gone.',
      'The market moves. You\'re always one day late.',
    ],
    anguishLine: 'Rightmove wasn\'t built for you. It was built for volume.',
    anguishAccent: 'volume',

    // Act 4 — BRIDGE: the pivot moment
    bridgeLine: 'What if the right place found you?',
    bridgeAccent: 'found you',
    bridgeSub: 'Not 300 listings. The ones where the landlord already likes your profile.',

    // Act 5 — REVEAL
    revealLabel: 'FOR TENANTS',
    revealTagline: 'Post once. Match with landlords who already want you.',

    // Act 6 — PROOF hook
    proofHook: 'Both sides like first. Then you talk.',

    // Act 7 — CLOSE: hard close on the consequence
    identityFrame: 'Stop searching. Start matching.',
    identityAccentWord: 'matching',
    ctaLabel: 'Find your match — it\'s free',
    consequenceLine: 'Rightmove isn\'t going anywhere. Neither is the queue behind you.',
  },

  landlord: {
    // Act 1 — INTERRUPT: the void month is bleeding money
    hookWords: ['How', 'many', 'void', 'weeks', 'this', 'year?'],
    hookSubline: 'Every empty week is rent you\'ll never get back.',

    // Act 2 — IDENTIFY: landlord inner monologue
    painCards: [
      { title: '3 no-shows this week', sub: 'Tuesday. Thursday. Saturday. All confirmed. None showed.' },
      { title: 'Budget nowhere near', sub: 'They asked about the flat. Can\'t afford it. Time wasted.' },
      { title: '47 enquiries', sub: '3 might be serious. Good luck finding which 3.' },
      { title: 'Void: week 3', sub: 'You do the maths. £600, £1200, £1800... still counting.' },
    ],
    identityLine: 'You want the right tenant. Not the loudest one.',
    identityAccent: 'right tenant',

    // Act 3 — AGITATE
    agitateLines: [
      'Every no-show is an afternoon you can\'t get back.',
      'Every unqualified enquiry is noise hiding the signal.',
      'Every void week is money that evaporates quietly.',
    ],
    anguishLine: 'Portals sell your listing to everyone. Then leave you to sort the mess.',
    anguishAccent: 'leave you to sort the mess',

    // Act 4 — BRIDGE
    bridgeLine: 'What if the right tenant came to you — already verified?',
    bridgeAccent: 'already verified',
    bridgeSub: 'Budget confirmed. Move date aligned. Both sides serious before first contact.',

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
    hookWords: ['Under', 'offer', 'before', 'you', 'saw', 'it?'],
    hookSubline: 'Real demand data beats portal averages. Every time.',

    // Act 2 — IDENTIFY: investor pain
    painCards: [
      { title: 'Yield estimate', sub: 'Based on data from 6 months ago. Markets moved.' },
      { title: 'Demand? Unclear.', sub: 'How many real tenants want this specific flat right now?' },
      { title: 'Tenant quality', sub: 'You can\'t verify until it\'s too late to walk away.' },
      { title: 'WhatsApp sourcer', sub: '"Deal of the decade." You\'ve heard it before.' },
    ],
    identityLine: 'You need live demand signals — not portfolio averages.',
    identityAccent: 'live demand signals',

    // Act 3 — AGITATE
    agitateLines: [
      'Every acquisition decision built on stale data carries hidden risk.',
      'Every tenant you can\'t vet eats into your net yield.',
      'Every deal you missed had a buyer who moved faster.',
    ],
    anguishLine: 'Portals were built for retail tenants. Your portfolio is not retail.',
    anguishAccent: 'not retail',

    // Act 4 — BRIDGE
    bridgeLine: 'What if you could see real tenant demand before you commit?',
    bridgeAccent: 'before you commit',
    bridgeSub: 'Verified profiles. Mutual match data. East London — live now.',

    // Act 5 — REVEAL
    revealLabel: 'FOR INVESTORS',
    revealTagline: 'See live demand. Build your edge.',

    // Act 6 — PROOF
    proofHook: 'Mutual match means both sides are qualified.',

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
  { count: 2,  label: 'sides like first',      sub: 'Mutual match — both opt in' },
];

export const PLATFORM_FEATURES = [
  'Free to post. Free to swipe.',
  'Mutual match — both sides like first.',
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
      'Both sides like first — then talk',
      'Context and fit before hello',
      '9 match criteria filter bad fits out',
      'Reputation protects both sides',
    ],
  },
};

/** Role-specific card data for Act 5 swipe demo */
export const CARD_DATA_BY_TYPE = {
  tenant: {
    image:      '/images/match-flat.jpg',
    matchScore: 94,
    title:      'Hackney 2-bed',
    location:   'London Fields, E8',
    price:      '£2,200 pcm',
    tags:       ['Bills incl.', 'Pets OK', 'Available now'],
    repScore:   '4.9',
  },
  landlord: {
    image:      '/images/match-demo-03.jpg',
    matchScore: 91,
    title:      'Priya S. · Young Professional',
    location:   'Seeking Hackney / Bow, E3',
    price:      'Budget £2,000 pcm',
    tags:       ['Verified', 'Long-term', 'No pets'],
    repScore:   '4.8',
  },
  agent: {
    image:      '/images/match-demo-05.jpg',
    matchScore: 96,
    title:      'Jordan & Alex · Couple',
    location:   'Seeking Stratford / Forest Gate',
    price:      'Budget £2,400 pcm',
    tags:       ['Pre-qualified', 'Long-term', 'Verified'],
    repScore:   '5.0',
  },
  investor: {
    image:      '/images/match-flat-2.jpg',
    matchScore: 88,
    title:      'Stratford 1-bed',
    location:   'Stratford, E15 · 5.8% yield est.',
    price:      '£1,650 pcm',
    tags:       ['High demand', 'Near Crossrail', 'Verified'],
    repScore:   null,
  },
};

export default CONTENT;
