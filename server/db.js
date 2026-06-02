import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');
const dataFile = join(dataDir, 'renteazy-db.json');

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

export const questions = [
  { id: 'tenant-budget', roleType: 'Tenant', category: 'Budget', prompt: 'What budget should RentEazy match you around?', answerType: 'text', options: [], weight: 18, isRequired: true, isAdvanced: false, createdAt: nowIso() },
  { id: 'tenant-areas', roleType: 'Tenant', category: 'Area', prompt: 'Which areas should appear first?', answerType: 'text', options: [], weight: 18, isRequired: true, isAdvanced: false, createdAt: nowIso() },
  { id: 'tenant-move-date', roleType: 'Tenant', category: 'Timing', prompt: 'When do you want to move?', answerType: 'choice', options: ['ASAP', '2-4 weeks', '1-2 months', 'Flexible'], weight: 14, isRequired: true, isAdvanced: false, createdAt: nowIso() },
  { id: 'buddy-home-style', roleType: 'House Buddy', category: 'Lifestyle', prompt: 'What home style fits you best?', answerType: 'choice', options: ['Quiet', 'Balanced', 'Social', 'Lively'], weight: 14, isRequired: true, isAdvanced: false, createdAt: nowIso() },
  { id: 'landlord-route', roleType: 'Landlord', category: 'Goal', prompt: 'Who are you looking for?', answerType: 'choice', options: ['Tenant', 'Agent', 'Operator', 'Investor'], weight: 14, isRequired: true, isAdvanced: false, createdAt: nowIso() },
  { id: 'investor-strategy', roleType: 'Investor', category: 'Strategy', prompt: 'Which strategy should RentEazy match?', answerType: 'choice', options: ['Buy-to-let', 'Serviced accommodation', 'Rent-to-rent', 'Mixed'], weight: 16, isRequired: true, isAdvanced: false, createdAt: nowIso() },
];

const posts = [
  ['post-stratford-room', 'agent-eastline', 'Agent', 'Eastline Rooms', 'Room', 'Double room near Stratford station', 'Bright furnished room in a clean flatshare. Best for someone moving within the next few weeks and wanting a quick viewing slot.', ['/images/match-room.jpg'], 'Stratford', '£925 pcm', ['Bills included', 'Zone 2/3', 'Viewing slots'], null],
  ['post-looking-hackney', 'tenant-amelia', 'Tenant', 'Amelia R.', 'Looking', 'Looking for a calm room in Hackney or Bow', 'Budget up to £1,050. Hybrid worker, tidy, ready to view this week. Open to buddying up for the right two-bed.', [], 'Hackney / Bow', 'Up to £1,050 pcm', ['Ready to view', 'Buddy-up possible', 'Hybrid worker'], null],
  ['post-short-stay-shoreditch', 'host-urbanstay', 'Short-Term Host', 'UrbanStay East', 'Short-Term Stay', 'Flexible Shoreditch stay for relocations', 'Furnished studio available for short stays while you search properly. Weekly pricing, fast Wi-Fi, and flexible checkout.', ['/images/match-demo-16.jpg'], 'Shoreditch', 'From £89/night', ['Flexible stay', 'Relocation', 'Furnished'], 'Boosted'],
  ['post-operator-west-london', 'operator-neststay', 'Operator', 'NestStay Operations', 'Operator Offer', 'West London operator looking for compliant stock', 'Management and co-hosting routes available for landlords with furnished homes near transport. Clear handover process and monthly reporting.', ['/images/match-demo-18.jpg'], 'West London', 'Management / co-hosting', ['Operator', 'Co-hosting', 'Monthly reporting'], 'Sponsored'],
  ['post-sourcer-deal-leeds', 'sourcer-yorkshire', 'Sourcer', 'Yorkshire Deal Desk', 'Sourcer Deal', 'Leeds student-house brief for active investors', 'Looking for investors interested in student lets around Headingley and Hyde Park. Numbers-first summaries only, no return guarantees.', ['/images/match-demo-20.jpg'], 'Leeds', 'Investor brief', ['Sourcer', 'Student lets', 'Numbers first'], null],
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
      role: 'Tenant',
      area: 'East London',
      budget: 'Up to £1,100 pcm',
      moveDate: 'Within 6 weeks',
      lookingFor: 'Room or buddy-up',
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
    notifications: [],
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
