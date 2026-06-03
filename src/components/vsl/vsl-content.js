/**
 * VSL content map — parameterised by userType.
 * Only the user-facing copy varies; the emotional arc (7 acts) is identical.
 * Default: 'tenant'.
 *
 * HARD RULE: No fabricated metrics. All numbers are real platform facts.
 */

export const CONTENT = {
  tenant: {
    // Act 1 — INTERRUPT: hook words assembled word-by-word on black
    hookWords: ['Still', 'chasing', 'ghosts', 'on', 'Rightmove?'],
    // Act 2 — IDENTIFY: staccato pain cards
    painCards: [
      { title: 'Listed 4 hours ago', sub: 'Already let, sorry' },
      { title: '22 messages sent', sub: 'Zero replies' },
      { title: '47 new listings', sub: '0 actually fit your budget' },
      { title: 'Viewed 6 times', sub: 'Landlord ghosted' },
    ],
    identityLine: 'You know the market is moving.',
    identityAccent: 'know',
    // Act 3 — AGITATE: cost lines
    agitateLines: [
      'Every day without a place costs you.',
      'Every no-show viewing wastes your time.',
      'Every unanswered message erodes your confidence.',
    ],
    anguishLine: 'The portal was built for volume — not for you.',
    anguishAccent: 'volume',
    // Act 4 — BRIDGE: tone shift
    bridgeLine: 'What if the right place came to you?',
    bridgeAccent: 'right place',
    bridgeSub: 'Not 47 listings. The ones that already fit.',
    // Act 5 — REVEAL identity
    revealLabel: 'TENANT',
    revealTagline: 'Post once. Get matched.',
    // Act 6 — proof hook
    proofHook: 'Your profile does the swiping.',
    // Act 7 — CLOSE
    identityFrame: 'Stop searching. Start matching.',
    identityAccentWord: 'matching',
    ctaLabel: 'Start matching — it\'s free',
    consequenceLine: 'Rightmove isn\'t going anywhere. Neither is the queue.',
  },

  landlord: {
    hookWords: ['Still', 'waiting', 'for', 'the', 'right', 'tenant?'],
    painCards: [
      { title: '3 no-show viewings', sub: 'This week alone' },
      { title: 'Budget nowhere near', sub: 'Unqualified applicant' },
      { title: 'Posted 3 weeks ago', sub: 'Still no serious interest' },
      { title: '1 intro request', sub: 'Agent not yet matched' },
    ],
    identityLine: 'You want the flat filled — with the right person.',
    identityAccent: 'right person',
    agitateLines: [
      'Every empty week is lost rent.',
      'Every no-show viewing is a wasted afternoon.',
      'Every vague applicant delays the tenancy.',
    ],
    anguishLine: 'Portals optimise for clicks — not for your property.',
    anguishAccent: 'clicks',
    bridgeLine: 'What if the right tenant came to you?',
    bridgeAccent: 'right tenant',
    bridgeSub: 'Matched on budget, area, move date — before first contact.',
    revealLabel: 'LANDLORD',
    revealTagline: 'List free. Match directly.',
    proofHook: 'Your listing works while you sleep.',
    identityFrame: 'Stop advertising. Start matching.',
    identityAccentWord: 'matching',
    ctaLabel: 'List your property — free',
    consequenceLine: 'Rightmove charges per listing. Here it\'s free to post.',
  },

  investor: {
    hookWords: ['Still', 'guessing', 'rental', 'demand?'],
    painCards: [
      { title: 'Yield estimates', sub: 'Based on stale data' },
      { title: 'Demand unclear', sub: 'Portal data is months old' },
      { title: 'Tenant quality?', sub: 'Hard to verify until too late' },
      { title: 'Letting agent fees', sub: 'No visibility on process' },
    ],
    identityLine: 'You need real demand signals — not averages.',
    identityAccent: 'real demand',
    agitateLines: [
      'Every portfolio decision based on stale data carries risk.',
      'Every tenant you can\'t vet eats into your yield.',
      'Every opaque agent relationship reduces your leverage.',
    ],
    anguishLine: 'Portals were built for retail tenants — not for your portfolio.',
    anguishAccent: 'retail tenants',
    bridgeLine: 'What if you could see live demand before you commit?',
    bridgeAccent: 'live demand',
    bridgeSub: 'Verified tenant profiles. Real match signals. Pre-launch edge.',
    revealLabel: 'INVESTOR',
    revealTagline: 'Build your profile. See real demand.',
    proofHook: 'Mutual match means both sides are serious.',
    identityFrame: 'Stop estimating. Start matching.',
    identityAccentWord: 'matching',
    ctaLabel: 'Build your investor profile — free',
    consequenceLine: 'First movers see the data others won\'t have later.',
  },

  agent: {
    hookWords: ['Still', 'chasing', 'unqualified', 'leads?'],
    painCards: [
      { title: 'Budget nowhere near', sub: 'Wasted referral' },
      { title: 'Landlord ghosted', sub: 'After 6 viewings arranged' },
      { title: 'No-show viewing', sub: 'Third this week' },
      { title: 'Duplicate listings', sub: 'Same flat, 3× price' },
    ],
    identityLine: 'You built your reputation one good match at a time.',
    identityAccent: 'reputation',
    agitateLines: [
      'Every unqualified lead wastes your time and your client\'s.',
      'Every no-show viewing damages your agency\'s credibility.',
      'Every ghosted landlord relationship is a lost instruction.',
    ],
    anguishLine: 'Portals sell eyeballs — your time is worth more than that.',
    anguishAccent: 'eyeballs',
    bridgeLine: 'What if verified tenant demand came to you?',
    bridgeAccent: 'verified tenant demand',
    bridgeSub: 'Matched profiles. Reputation visible. Both sides serious.',
    revealLabel: 'AGENT',
    revealTagline: 'Get verified demand. Build your rep.',
    proofHook: 'Your reputation travels with every match.',
    identityFrame: 'Stop chasing. Start matching.',
    identityAccentWord: 'matching',
    ctaLabel: 'Get verified tenant demand — free',
    consequenceLine: 'Rightmove sells leads. Here, matches are earned — not bought.',
  },
};

/** Real platform facts for Act 6. No invented user/traction numbers. */
export const PLATFORM_FACTS = [
  { count: 9,  label: 'match types',         sub: 'Matched on what actually matters' },
  { count: 18, label: 'ways to post',         sub: 'Flexible for any landlord or agent' },
  { count: 0,  label: 'fee to post',          sub: 'Free to post. Free to swipe. Always.' },
  { count: 2,  label: 'sides must like first',sub: 'Mutual match — both sides opt in' },
];

export const PLATFORM_FEATURES = [
  'Free to post. Free to swipe.',
  'Mutual match — both sides like first.',
  '9 match types — budget, area, move date & more.',
  '18 ways to post a listing.',
  'Reputation that travels with you.',
  'Live in East London — growing now.',
];

/** Honest before/after contrast for Act 5 split-screen */
export const BEFORE_AFTER = {
  before: {
    label: 'PORTALS',
    points: [
      'You post into the void',
      'Unqualified enquiries flood in',
      'No context before contact',
      'Ghosting is the norm',
    ],
  },
  after: {
    label: 'RENTEAZY',
    points: [
      'Both sides match first',
      'Context before first contact',
      '9 match criteria — only good fits show',
      'Reputation protects everyone',
    ],
  },
};

export default CONTENT;
