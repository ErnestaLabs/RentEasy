import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile = process.env.RENTEAZY_DB_FILE || join(__dirname, 'data', 'renteazy-db.json');
const dataDir = dirname(dataFile);

export const demoUserId = 'demo-user';

export const roleOptions = [
  'Tenant',
  'House Buddy',
  'Landlord',
  'Individual Agent',
  'Agency / Business',
  'Short-Term Guest',
  'Short-Term Host',
  'Operator',
  'Sourcer',
  'Investor',
];

export const postTypes = [
  'Property',
  'Room',
  'Looking',
  'House Buddy',
  'Short-Term Stay',
  'Serviced Accommodation',
  'Operator Offer',
  'Landlord Opportunity',
  'Investor Brief',
  'Sourcer Deal',
  'Agent Update',
  'Landlord Update',
  'Advice',
  'Question',
  'Area Insight',
  'Success Story',
  'Availability',
  'General',
];

export const reportReasons = [
  'Scam/fraud',
  'Fake listing',
  'Misleading price',
  'Harassment',
  'Discrimination',
  'Spam',
  'Adult/sexual content',
  'Illegal content',
  'Impersonation',
  'Misleading investment claim',
  'Other',
];

const nowIso = () => new Date().toISOString();
const inHours = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

export function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, encoded) {
  if (!encoded || !encoded.includes(':')) return false;
  const [salt, hash] = encoded.split(':');
  return hashPassword(password, salt).split(':')[1] === hash;
}

export const microProducts = [
  { id: 'extra-swipes-10', sku: 'swipes_10_009', name: '10 extra swipes', description: 'Keep swiping today.', category: 'Extra swipes', price: '£0.09', amount: 0.09, currency: 'GBP', quantity: 10, durationMinutes: null, userRoleEligibility: roleOptions, isActive: true },
  { id: 'extra-swipes-25', sku: 'swipes_25_019', name: '25 extra swipes', description: 'A longer swipe run for today.', category: 'Extra swipes', price: '£0.19', amount: 0.19, currency: 'GBP', quantity: 25, durationMinutes: null, userRoleEligibility: roleOptions, isActive: true },
  { id: 'reveal-like-1', sku: 'reveal_1_009', name: 'Reveal 1 like', description: 'Reveal one real like when likes exist.', category: 'Reveal likes', price: '£0.09', amount: 0.09, currency: 'GBP', quantity: 1, durationMinutes: null, userRoleEligibility: roleOptions, isActive: true },
  { id: 'superlike-1', sku: 'superlike_1_019', name: '1 Superlike', description: 'Send one stronger signal.', category: 'Superlikes', price: '£0.19', amount: 0.19, currency: 'GBP', quantity: 1, durationMinutes: null, userRoleEligibility: roleOptions, isActive: true },
  { id: 'rewind-1', sku: 'rewind_1_009', name: '1 rewind', description: 'Undo one accidental pass.', category: 'Rewinds', price: '£0.09', amount: 0.09, currency: 'GBP', quantity: 1, durationMinutes: null, userRoleEligibility: roleOptions, isActive: true },
  { id: 'mini-boost-15', sku: 'boost_15_029', name: '15-minute boost', description: 'Give one post a small visibility bump.', category: 'Mini Boost', price: '£0.29', amount: 0.29, currency: 'GBP', quantity: 1, durationMinutes: 15, userRoleEligibility: roleOptions, isActive: true },
  { id: 'post-bump-small', sku: 'post_bump_029', name: 'Small post bump', description: 'Bump a useful post while it is warm.', category: 'Post Boost', price: '£0.29', amount: 0.29, currency: 'GBP', quantity: 1, durationMinutes: 60, userRoleEligibility: roleOptions, isActive: true },
  { id: 'profile-polish', sku: 'profile_polish_049', name: 'Profile polish', description: 'Improve wording and match clarity.', category: 'Profile', price: '£0.49', amount: 0.49, currency: 'GBP', quantity: 1, durationMinutes: null, userRoleEligibility: roleOptions, isActive: true },
  { id: 'sponsored-post-starter', sku: 'sponsored_post_099', name: 'Sponsored post starter', description: 'Start a labelled sponsored Feed placement.', category: 'Business starter', price: '£0.99', amount: 0.99, currency: 'GBP', quantity: 1, durationMinutes: 60, userRoleEligibility: roleOptions, isActive: true },
  { id: 'area-spotlight-starter', sku: 'area_spotlight_099', name: 'Area spotlight starter', description: 'Test a small local visibility push.', category: 'Business starter', price: '£0.99', amount: 0.99, currency: 'GBP', quantity: 1, durationMinutes: 60, userRoleEligibility: roleOptions, isActive: true },
  { id: 'protect-basic', sku: 'protect_basic_099', name: 'Protect Basic', description: 'Keep match and viewing records.', category: 'Protect', price: '£0.99/mo', amount: 0.99, currency: 'GBP', quantity: 1, durationMinutes: null, userRoleEligibility: roleOptions, isActive: true },
  { id: 'credits-100', sku: 'credits_100_099', name: '100 credits', description: 'Use credits for tiny actions with clear prices.', category: 'Credits', price: '£0.99', amount: 0.99, currency: 'GBP', quantity: 100, durationMinutes: null, userRoleEligibility: roleOptions, isActive: true },
];

export const groups = [
  {
    id: 'group-east-london-renters',
    name: 'East London Renters',
    groupType: 'Area community',
    area: 'East London',
    description: 'Rooms, viewings, local questions, moving tips, and honest rental-market updates around Stratford, Bow, Hackney, and nearby areas.',
    visibility: 'open',
    memberCount: 128,
    postCount: 42,
    roles: ['Tenant', 'House Buddy', 'Landlord', 'Individual Agent'],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'group-london-landlords',
    name: 'London Landlords',
    groupType: 'Role network',
    area: 'London',
    description: 'Tenant demand, agent routes, operator requests, compliance reminders, maintenance referrals, and local market signals.',
    visibility: 'open',
    memberCount: 84,
    postCount: 31,
    roles: ['Landlord', 'Individual Agent', 'Agency / Business', 'Operator'],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'group-operator-hosts',
    name: 'Operators & Short-Stay Hosts',
    groupType: 'Professional circle',
    area: 'UK',
    description: 'Serviced stays, co-hosting, relocation demand, landlord conversations, and operational best practice.',
    visibility: 'open',
    memberCount: 57,
    postCount: 18,
    roles: ['Operator', 'Short-Term Host', 'Short-Term Guest', 'Landlord'],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'group-investor-sourcer-deals',
    name: 'Investor & Sourcer Deal Room',
    groupType: 'Deal community',
    area: 'UK',
    description: 'Numbers-first briefs, sourcing requests, operator demand, and investor criteria without return guarantees.',
    visibility: 'open',
    memberCount: 66,
    postCount: 24,
    roles: ['Investor', 'Sourcer', 'Operator', 'Landlord'],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

export const partnerOffers = [
  {
    id: 'perk-broadband-move',
    title: 'Broadband setup for move-in',
    partnerName: 'Move-ready broadband partner',
    category: 'Broadband',
    description: 'Compare move-in broadband options when a tenancy or short stay becomes likely.',
    cta: 'View options',
    eligibleRoles: ['Tenant', 'House Buddy', 'Short-Term Guest'],
    lifecycleTrigger: 'tenancy_started',
    trustLevel: 'verified_partner',
    reward: 'Useful near move-in',
    sponsoredStatus: 'Partner',
    createdAt: nowIso(),
  },
  {
    id: 'perk-storage',
    title: 'Storage while you move',
    partnerName: 'Local storage partner',
    category: 'Storage',
    description: 'Short-term storage options for users between homes, rooms, and stays.',
    cta: 'Check storage',
    eligibleRoles: ['Tenant', 'House Buddy', 'Short-Term Guest'],
    lifecycleTrigger: 'moving_soon',
    trustLevel: 'verified_partner',
    reward: 'Helpful during move window',
    sponsoredStatus: 'Partner',
    createdAt: nowIso(),
  },
  {
    id: 'perk-landlord-insurance',
    title: 'Landlord insurance check',
    partnerName: 'Property insurance partner',
    category: 'Insurance',
    description: 'Insurance options for landlords listing or preparing to let a property.',
    cta: 'Review cover',
    eligibleRoles: ['Landlord', 'Agency / Business', 'Operator'],
    lifecycleTrigger: 'property_listed',
    trustLevel: 'verified_partner',
    reward: 'Relevant before tenancy',
    sponsoredStatus: 'Partner',
    createdAt: nowIso(),
  },
  {
    id: 'perk-operator-saas',
    title: 'Portfolio tools for operators',
    partnerName: 'Property operations partner',
    category: 'Property SaaS',
    description: 'Tools for occupancy, guest operations, reporting, and handover workflows.',
    cta: 'Explore tools',
    eligibleRoles: ['Operator', 'Short-Term Host', 'Agency / Business'],
    lifecycleTrigger: 'portfolio_growth',
    trustLevel: 'verified_partner',
    reward: 'Useful after several units',
    sponsoredStatus: 'Partner',
    createdAt: nowIso(),
  },
  {
    id: 'perk-investor-finance',
    title: 'Finance conversation for investors',
    partnerName: 'Property finance partner',
    category: 'Mortgage broker',
    description: 'Speak to a property finance specialist when your investor criteria and target area are clear.',
    cta: 'Start conversation',
    eligibleRoles: ['Investor', 'Sourcer', 'Landlord'],
    lifecycleTrigger: 'deal_interest',
    trustLevel: 'verified_partner',
    reward: 'Useful when numbers are ready',
    sponsoredStatus: 'Partner',
    createdAt: nowIso(),
  },
];

export const feedAds = [
  {
    id: 'ad-moving-clean',
    advertiserName: 'Move-clean partner',
    title: 'End-of-tenancy and move-in cleaning',
    body: 'Book cleaning help around your move date. Shown to people actively moving or preparing a property.',
    category: 'Cleaning',
    sponsoredStatus: 'Sponsored',
    eligibleRoles: ['Tenant', 'House Buddy', 'Landlord', 'Operator', 'Short-Term Host'],
    targetingSignals: ['move date', 'availability', 'property listed'],
    frequencyCapPerDay: 2,
    impressionCount: 0,
    clickCount: 0,
    createdAt: nowIso(),
  },
  {
    id: 'ad-landlord-photos',
    advertiserName: 'Property photography partner',
    title: 'Better listing photos before you post',
    body: 'A practical service for landlords, agents, operators, and hosts preparing a real listing.',
    category: 'Property photography',
    sponsoredStatus: 'Promoted',
    eligibleRoles: ['Landlord', 'Individual Agent', 'Agency / Business', 'Operator', 'Short-Term Host'],
    targetingSignals: ['new listing', 'low media count', 'business profile'],
    frequencyCapPerDay: 2,
    impressionCount: 0,
    clickCount: 0,
    createdAt: nowIso(),
  },
];

export const questions = [
  { id: 'tenant-budget', roleType: 'Tenant', category: 'Budget', prompt: 'What budget should RentEazy match you around?', answerType: 'text', options: [], weight: 18, isRequired: true, isAdvanced: false, createdAt: nowIso() },
  { id: 'tenant-areas', roleType: 'Tenant', category: 'Area', prompt: 'Which areas should appear first?', answerType: 'text', options: [], weight: 18, isRequired: true, isAdvanced: false, createdAt: nowIso() },
  { id: 'tenant-move-date', roleType: 'Tenant', category: 'Timing', prompt: 'When do you want to move?', answerType: 'choice', options: ['ASAP', '2-4 weeks', '1-2 months', 'Flexible'], weight: 14, isRequired: true, isAdvanced: false, createdAt: nowIso() },
  { id: 'buddy-home-style', roleType: 'House Buddy', category: 'Lifestyle', prompt: 'What home style fits you best?', answerType: 'choice', options: ['Quiet', 'Balanced', 'Social', 'Lively'], weight: 14, isRequired: true, isAdvanced: false, createdAt: nowIso() },
  { id: 'landlord-route', roleType: 'Landlord', category: 'Goal', prompt: 'Who are you looking for?', answerType: 'choice', options: ['Tenant', 'Agent', 'Operator', 'Investor'], weight: 14, isRequired: true, isAdvanced: false, createdAt: nowIso() },
  { id: 'investor-strategy', roleType: 'Investor', category: 'Strategy', prompt: 'Which strategy should RentEazy match?', answerType: 'choice', options: ['Buy-to-let', 'Serviced accommodation', 'Rent-to-rent', 'Mixed'], weight: 16, isRequired: true, isAdvanced: false, createdAt: nowIso() },
];

export const posts = [
  ['post-stratford-room', 'agent-eastline', 'Agent', 'Eastline Rooms', 'Room', 'Double room near Stratford station', 'Bright furnished room in a clean flatshare. Best for someone moving within the next few weeks and wanting a quick viewing slot.', ['/images/match-room.jpg'], 'Stratford', '£925 pcm', ['Bills included', 'Zone 2/3', 'Viewing slots'], null],
  ['post-looking-hackney', 'tenant-amelia', 'Tenant', 'Amelia R.', 'Looking', 'Looking for a calm room in Hackney or Bow', 'Budget up to £1,050. Hybrid worker, tidy, ready to view this week. Open to buddying up for the right two-bed.', [], 'Hackney / Bow', 'Up to £1,050 pcm', ['Ready to view', 'Buddy-up possible', 'Hybrid worker'], null],
  ['post-buddy-clapham', 'buddy-nadia', 'House Buddy', 'Nadia K.', 'House Buddy', 'Buddy-up for a two-bed in Clapham', 'Looking for one person to team up with for a tidy two-bed. I can move from mid-July and prefer somewhere close to Northern line.', ['/images/match-tenant.jpg'], 'Clapham', '£1,100 each', ['Mid-July', 'Two-bed search', 'Northern line'], null],
  ['post-landlord-bow', 'landlord-sam', 'Landlord', 'Sam P.', 'Landlord Opportunity', 'Bow landlord open to tenant or agent route', 'One-bed flat coming up. I am open to a direct tenant match or speaking with a local agent who already has a suitable renter.', ['/images/match-demo-06.jpg'], 'Bow', '£1,650 pcm guide', ['Direct possible', 'Agent intro', 'Available soon'], null],
  ['post-investor-northwest', 'sourcer-nw', 'Sourcer', 'North West Deals', 'Investor Brief', 'Investor looking for Manchester/Liverpool options', 'Budget £250k-£450k. Interested in buy-to-let and serviced options with clean numbers and clear area reasoning.', [], 'Manchester / Liverpool', '£250k-£450k', ['Investor brief', 'Sourcer wanted', 'Numbers first'], 'Promoted'],
  ['post-area-insight-canary', 'agent-lena', 'Agent', 'Lena from Dockside', 'Area Insight', 'Canary Wharf rooms are moving fastest under £1,000', 'If you are looking around Canary Wharf, rooms with bills included under £1,000 are moving quickly. Have your move date and viewing times ready.', [], 'Canary Wharf', 'Under £1,000 rooms', ['Area insight', 'Room search', 'Viewing tip'], null],
  ['post-agent-update-viewings', 'agent-riverline', 'Agent', 'Riverline Homes', 'Agent Update', 'Saturday viewing slots open in Greenwich', 'Three rooms and one studio have Saturday viewings available. Best for renters with documents ready and flexible move timing.', ['/images/match-demo-04.jpg'], 'Greenwich', 'Rooms from £890 pcm', ['Viewing slots', 'Documents ready', 'Greenwich'], null],
  ['post-short-stay-shoreditch', 'host-urbanstay', 'Short-Term Host', 'UrbanStay East', 'Short-Term Stay', 'Flexible Shoreditch stay for relocations', 'Furnished studio available for short stays while you search properly. Weekly pricing, fast Wi-Fi, and flexible checkout.', ['/images/match-demo-16.jpg'], 'Shoreditch', 'From £89/night', ['Flexible stay', 'Relocation', 'Furnished'], 'Boosted'],
  ['post-operator-west-london', 'operator-neststay', 'Operator', 'NestStay Operations', 'Operator Offer', 'West London operator looking for compliant stock', 'Management and co-hosting routes available for landlords with furnished homes near transport. Clear handover process and monthly reporting.', ['/images/match-demo-18.jpg'], 'West London', 'Management / co-hosting', ['Operator', 'Co-hosting', 'Monthly reporting'], 'Sponsored'],
  ['post-sourcer-deal-leeds', 'sourcer-yorkshire', 'Sourcer', 'Yorkshire Deal Desk', 'Sourcer Deal', 'Leeds student-house brief for active investors', 'Looking for investors interested in student lets around Headingley and Hyde Park. Numbers-first summaries only, no return guarantees.', ['/images/match-demo-20.jpg'], 'Leeds', 'Investor brief', ['Sourcer', 'Student lets', 'Numbers first'], null],
  ['post-question-referencing', 'tenant-maya', 'Tenant', 'Maya T.', 'Question', 'What should I prepare before a same-day viewing?', 'I have a viewing this evening and want to be ready without oversharing. What documents or questions usually help?', [], 'London', 'Advice needed', ['Question', 'Viewing', 'Referencing'], null],
  ['post-availability-manchester', 'host-citystay', 'Short-Term Host', 'CityStay Manchester', 'Availability', 'Relocation stay open from Monday', 'Furnished one-bed available weekly for relocations while you search longer-term. Bills included and flexible extension possible.', ['/images/match-demo-16.jpg'], 'Manchester', '£620/week', ['Availability', 'Relocation', 'Bills included'], 'Promoted'],
].map(([id, authorId, authorType, authorName, postType, title, body, media, area, budget, tags, sponsoredStatus], index) => ({
  id,
  authorId,
  authorType,
  authorName,
  postType,
  title,
  body,
  media,
  area,
  budget,
  tags,
  visibility: 'public',
  sponsoredStatus,
  createdAt: new Date(Date.now() - index * 3600000).toISOString(),
  updatedAt: new Date(Date.now() - index * 3600000).toISOString(),
  likeCount: 0,
  commentCount: 0,
  saveCount: 0,
  shareCount: 0,
}));

export const matches = [
  {
    id: 'match-demo-stratford',
    participantIds: [demoUserId, 'agent-eastline'],
    participantNames: ['RentEazy member', 'Eastline Rooms'],
    participantTypes: ['Member', 'Agent'],
    subjectType: 'post',
    subjectId: 'post-stratford-room',
    subjectTitle: 'Double room near Stratford station',
    status: 'matched',
    score: 88,
    reasonBadges: ['Budget fit', 'Area fit', 'Viewing slots', 'No deal-breaker conflict'],
    missingInfo: ['Confirm move date'],
    openedBy: 'mutual_interest',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

export const matchMessages = [
  {
    id: 'message-demo-stratford-1',
    matchId: 'match-demo-stratford',
    authorId: 'agent-eastline',
    authorName: 'Eastline Rooms',
    body: 'This room is still available. If the area and budget fit, send a viewing window and we can keep the conversation inside RentEazy.',
    createdAt: nowIso(),
  },
];

export const viewings = [
  {
    id: 'viewing-demo-stratford',
    matchId: 'match-demo-stratford',
    requesterId: demoUserId,
    participantIds: [demoUserId, 'agent-eastline'],
    subjectTitle: 'Double room near Stratford station',
    scheduledFor: inHours(30),
    status: 'requested',
    mode: 'In-person',
    location: 'Stratford',
    notes: 'Bring availability and basic referencing questions.',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

export const reviews = [];

export const reputationEvents = [
  { id: 'rrs-demo-profile', userId: demoUserId, eventType: 'profile_started', points: 8, source: 'profile', createdAt: nowIso() },
  { id: 'rrs-demo-match', userId: demoUserId, eventType: 'mutual_match', points: 12, source: 'match-demo-stratford', createdAt: nowIso() },
  { id: 'rrs-demo-viewing', userId: demoUserId, eventType: 'viewing_requested', points: 10, source: 'viewing-demo-stratford', createdAt: nowIso() },
];

export const lifecycleTasks = [
  {
    id: 'task-today-better-matches',
    userId: demoUserId,
    roleType: 'General',
    cadence: 'today',
    title: 'Answer 3 match questions',
    body: 'Improve ranking, match explanations, and which cards appear first.',
    actionLabel: 'Improve matches',
    targetPath: '/app/profile',
    reward: 'Better match score',
    status: 'open',
    createdAt: nowIso(),
    dueAt: inHours(8),
    completedAt: null,
  },
  {
    id: 'task-today-swipe-deck',
    userId: demoUserId,
    roleType: 'General',
    cadence: 'today',
    title: 'Use today’s swipe allowance',
    body: 'Each pass, like, and Superlike teaches RentEazy what fits.',
    actionLabel: 'Open Swipe',
    targetPath: '/app/swipe',
    reward: 'Better daily picks',
    status: 'open',
    createdAt: nowIso(),
    dueAt: inHours(12),
    completedAt: null,
  },
  {
    id: 'task-week-post-market-signal',
    userId: demoUserId,
    roleType: 'General',
    cadence: 'week',
    title: 'Post a useful market signal',
    body: 'A question, availability update, brief, deal, or area insight gives the network more live inventory.',
    actionLabel: 'Create post',
    targetPath: '/app/post',
    reward: 'Feed reach signal',
    status: 'open',
    createdAt: nowIso(),
    dueAt: inHours(72),
    completedAt: null,
  },
  {
    id: 'task-long-reputation-asset',
    userId: demoUserId,
    roleType: 'General',
    cadence: 'long',
    title: 'Build your portable rental reputation',
    body: 'Matches, viewings, reviews, and helpful participation compound into your RentEazy Reputation Score.',
    actionLabel: 'View profile',
    targetPath: '/app/profile',
    reward: 'Reputation growth',
    status: 'open',
    createdAt: nowIso(),
    dueAt: inHours(240),
    completedAt: null,
  },
  {
    id: 'task-landlord-demand',
    userId: demoUserId,
    roleType: 'Landlord',
    cadence: 'today',
    title: 'Check tenant demand near your property',
    body: 'See looking posts, viewing-ready tenants, agent routes, operator offers, and investor interest.',
    actionLabel: 'Open Feed',
    targetPath: '/app/feed',
    reward: 'Demand signal',
    status: 'open',
    createdAt: nowIso(),
    dueAt: inHours(10),
    completedAt: null,
  },
  {
    id: 'task-professional-pipeline',
    userId: demoUserId,
    roleType: 'Individual Agent',
    cadence: 'today',
    title: 'Check viewing-ready demand',
    body: 'Keep response speed high and move suitable people into matched viewing flow.',
    actionLabel: 'Open matches',
    targetPath: '/app/likes',
    reward: 'Response reputation',
    status: 'open',
    createdAt: nowIso(),
    dueAt: inHours(6),
    completedAt: null,
  },
  {
    id: 'task-investor-deal-room',
    userId: demoUserId,
    roleType: 'Investor',
    cadence: 'week',
    title: 'Follow deal and operator signals',
    body: 'Investor briefs, sourcer posts, operator demand, and area insight become better as your criteria gets clearer.',
    actionLabel: 'Open groups',
    targetPath: '/app/feed',
    reward: 'Deal intelligence',
    status: 'open',
    createdAt: nowIso(),
    dueAt: inHours(48),
    completedAt: null,
  },
];

export const referrals = [
  {
    id: 'referral-demo-buddy',
    userId: demoUserId,
    inviteType: 'House Buddy',
    target: 'A future flatmate',
    status: 'ready_to_share',
    reward: '5 extra swipes after first accepted invite',
    trackingUrl: 'https://renteazy.co.uk/join?ref=demo-user&invite=buddy',
    createdAt: nowIso(),
    acceptedAt: null,
  },
];

export const residentProfiles = [
  {
    id: 'resident-demo-current-home',
    userId: demoUserId,
    status: 'active_resident',
    homeLabel: 'Stratford room search record',
    area: 'Stratford',
    tenancyStart: inHours(-24 * 21),
    leaseEndsAt: inHours(24 * 260),
    landlordOrAgentName: 'Eastline Rooms',
    reputationImpact: 'Active resident records can support future references when verified.',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

export const maintenanceRequests = [
  {
    id: 'maintenance-demo-window',
    userId: demoUserId,
    residentProfileId: 'resident-demo-current-home',
    title: 'Window handle needs attention',
    category: 'Repair',
    priority: 'Normal',
    status: 'logged',
    notes: 'Logged as an example resident-mode record. Keep updates timestamped inside RentEazy.',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

export const rentRecords = [
  {
    id: 'rent-record-demo-june',
    userId: demoUserId,
    residentProfileId: 'resident-demo-current-home',
    month: '2026-06',
    amount: 925,
    currency: 'GBP',
    status: 'recorded_on_time',
    verificationStatus: 'self_recorded',
    reputationPoints: 5,
    createdAt: nowIso(),
  },
];

export const landlordProperties = [
  {
    id: 'property-demo-bow',
    ownerId: demoUserId,
    title: 'Bow one-bed opportunity',
    area: 'Bow',
    propertyType: 'One-bed flat',
    status: 'pipeline',
    expectedRent: 1650,
    currency: 'GBP',
    vacancyRisk: 'Medium',
    benchmarkNote: 'Similar one-beds in the Feed are clustering around the mid-£1,600s.',
    tenantDemandCount: 18,
    operatorInterestCount: 4,
    agentInterestCount: 3,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'property-demo-stratford-room',
    ownerId: 'landlord-sam',
    title: 'Stratford room pipeline',
    area: 'Stratford',
    propertyType: 'Room',
    status: 'listed',
    expectedRent: 925,
    currency: 'GBP',
    vacancyRisk: 'Low',
    benchmarkNote: 'Bills-included rooms under £1,000 are moving quickly.',
    tenantDemandCount: 31,
    operatorInterestCount: 1,
    agentInterestCount: 5,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

export const professionalProfiles = [
  {
    id: 'pro-demo-agent',
    userId: demoUserId,
    roleType: 'Individual Agent',
    displayName: 'RentEazy demo professional',
    areas: ['Stratford', 'Bow', 'Greenwich'],
    responseRate: 92,
    responseTimeHours: 3,
    verifiedDeals: 2,
    followerCount: 24,
    pipelineCount: 6,
    reputationTier: 'Silver',
    leaderboardRank: 8,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'pro-demo-sourcer',
    userId: 'sourcer-yorkshire',
    roleType: 'Sourcer',
    displayName: 'Yorkshire Deal Desk',
    areas: ['Leeds', 'Manchester'],
    responseRate: 88,
    responseTimeHours: 5,
    verifiedDeals: 4,
    followerCount: 63,
    pipelineCount: 9,
    reputationTier: 'Gold',
    leaderboardRank: 3,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

export const tenantDemandSignals = [
  {
    id: 'demand-amelia-hackney',
    sourcePostId: 'post-looking-hackney',
    roleType: 'Tenant',
    displayName: 'Amelia R.',
    area: 'Hackney / Bow',
    budget: 'Up to £1,050 pcm',
    moveDate: 'This month',
    propertyInterest: 'Room or buddy-up two-bed',
    strength: 86,
    status: 'new',
    reasonBadges: ['Budget fit', 'Move date fit', 'Ready to view'],
    matchedPropertyIds: ['property-demo-bow'],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'demand-nadia-clapham',
    sourcePostId: 'post-buddy-clapham',
    roleType: 'House Buddy',
    displayName: 'Nadia K.',
    area: 'Clapham',
    budget: '£1,100 each',
    moveDate: 'Mid-July',
    propertyInterest: 'Two-bed buddy-up',
    strength: 78,
    status: 'new',
    reasonBadges: ['Lifestyle fit', 'Area fit', 'No deal-breaker conflict'],
    matchedPropertyIds: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'demand-greenwich-ready',
    sourcePostId: 'post-agent-update-viewings',
    roleType: 'Tenant demand',
    displayName: 'Greenwich viewing pool',
    area: 'Greenwich',
    budget: 'Rooms from £890 pcm',
    moveDate: 'Flexible',
    propertyInterest: 'Rooms and studios',
    strength: 72,
    status: 'market_signal',
    reasonBadges: ['Documents ready', 'Viewing availability', 'Area demand'],
    matchedPropertyIds: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

export const dealWatchlist = [
  {
    id: 'watch-demo-northwest',
    userId: demoUserId,
    dealPostId: 'post-investor-northwest',
    dealType: 'Investor Brief',
    area: 'Manchester / Liverpool',
    strategy: 'Buy-to-let and serviced options',
    status: 'watching',
    score: 82,
    reasonBadges: ['Investor criteria fit', 'Numbers first', 'Sourcer route'],
    notes: 'Track sourcer responses and clean-number opportunities.',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

export const operatorPortfolioSignals = [
  {
    id: 'operator-signal-west-london',
    operatorId: demoUserId,
    area: 'West London',
    propertyType: 'Family houses and flats',
    model: 'Management / co-hosting',
    unitsTracked: 8,
    occupancySignal: 'Strong weekday demand',
    landlordDemandCount: 6,
    investorBriefCount: 3,
    complianceStatus: 'Ready to verify',
    nextAction: 'Publish operator requirements for landlords and investors.',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

export const marketIntroductions = [
  {
    id: 'intro-demo-amelia-bow',
    userId: demoUserId,
    sourceType: 'tenant_demand',
    sourceId: 'demand-amelia-hackney',
    targetType: 'landlord_property',
    targetId: 'property-demo-bow',
    status: 'shortlisted',
    reason: 'Budget, move timing, and area fit the Bow pipeline.',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

export const usefulNotifications = [
  {
    id: 'notification-demo-swipes',
    userId: demoUserId,
    type: 'daily_swipes_ready',
    title: 'Your daily swipes are ready.',
    body: 'Use them to improve today’s matching signals.',
    read: false,
    createdAt: nowIso(),
  },
  {
    id: 'notification-demo-viewing',
    userId: demoUserId,
    type: 'viewing_window',
    title: 'Viewing record ready to update.',
    body: 'Add notes after the viewing so the match history stays useful.',
    read: false,
    createdAt: nowIso(),
  },
  {
    id: 'notification-demo-market',
    userId: demoUserId,
    type: 'market_signal',
    title: 'New activity in your rental world.',
    body: 'Fresh posts, groups, and perks are available in the Feed.',
    read: true,
    createdAt: nowIso(),
  },
];

export function createInitialDb() {
  const passwordHash = hashPassword('Password123!');
  return {
    meta: { version: 1, createdAt: nowIso(), updatedAt: nowIso() },
    users: [{
      id: demoUserId,
      email: 'demo@renteazy.co.uk',
      passwordHash,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }],
    sessions: [],
    profiles: [{
      id: demoUserId,
      userId: demoUserId,
      name: 'RentEazy member',
      role: '',
      area: '',
      budget: '',
      moveDate: '',
      lookingFor: '',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }],
    posts,
    comments: [],
    follows: [],
    reactions: [],
    savedPosts: [],
    shares: [],
    reports: [],
    hiddenPosts: [],
    matches,
    matchMessages,
    viewings,
    reviews,
    reputationEvents,
    questions,
    answers: [],
    matchScores: [],
    profileStrengths: [],
    microProducts,
    entitlements: [],
    usageLimits: [{
      id: 'daily-swipes-demo-user',
      userId: demoUserId,
      limitType: 'daily_swipes',
      period: 'day',
      used: 0,
      allowance: 8,
      resetsAt: inHours(20),
    }],
    wallets: [{ id: 'wallet-demo-user', userId: demoUserId, balance: 0, updatedAt: nowIso() }],
    purchases: [],
    boostCampaigns: [],
    appStreaks: [{ id: 'streak-demo-user', userId: demoUserId, streakType: 'daily_app_open', count: 1, lastActivityAt: nowIso() }],
    notifications: usefulNotifications,
    groups,
    groupMemberships: [{ id: 'membership-demo-east-london', groupId: 'group-east-london-renters', userId: demoUserId, role: 'member', createdAt: nowIso() }],
    partnerOffers,
    feedAds,
    behavioralEvents: [],
    lifecycleTasks,
    referrals,
    residentProfiles,
    maintenanceRequests,
    rentRecords,
    landlordProperties,
    professionalProfiles,
    tenantDemandSignals,
    dealWatchlist,
    operatorPortfolioSignals,
    marketIntroductions,
  };
}

let writeQueue = Promise.resolve();

export async function readDb() {
  await mkdir(dataDir, { recursive: true });
  try {
    const raw = await readFile(dataFile, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const db = createInitialDb();
    await writeDb(db);
    return db;
  }
}

export async function writeDb(db) {
  db.meta = { ...(db.meta || {}), updatedAt: nowIso() };
  await mkdir(dataDir, { recursive: true });
  writeQueue = writeQueue.then(() => writeFile(dataFile, JSON.stringify(db, null, 2)));
  await writeQueue;
  return db;
}

export async function updateDb(mutator) {
  const db = await readDb();
  const result = await mutator(db);
  await writeDb(db);
  return result;
}

export function publicProfile(db, userId = demoUserId) {
  return db.profiles.find((profile) => profile.userId === userId || profile.id === userId) || db.profiles[0];
}

export function createSession(db, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const session = { id: createId('session'), userId, token, createdAt: nowIso(), expiresAt: inHours(24 * 30) };
  db.sessions.push(session);
  return session;
}

export function getUserFromToken(db, token) {
  if (!token) return null;
  const session = db.sessions.find((item) => item.token === token && new Date(item.expiresAt).getTime() > Date.now());
  if (!session) return null;
  return db.users.find((user) => user.id === session.userId) || null;
}

export function hashNewPassword(password) {
  return hashPassword(password);
}
