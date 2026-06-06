import http from 'node:http';
import { URL, fileURLToPath } from 'node:url';
import { verifyToken } from '@clerk/backend';
import {
  createId,
  createSession,
  demoUserId,
  feedAds,
  getUserFromToken,
  groups,
  hashNewPassword,
  landlordProperties as seedLandlordProperties,
  lifecycleTasks as seedLifecycleTasks,
  maintenanceRequests as seedMaintenanceRequests,
  marketIntroductions as seedMarketIntroductions,
  matches as seedMatches,
  matchMessages as seedMatchMessages,
  microProducts,
  operatorPortfolioSignals as seedOperatorPortfolioSignals,
  partnerOffers,
  posts as seedPosts,
  postTypes,
  professionalProfiles as seedProfessionalProfiles,
  publicProfile,
  readDb,
  reportReasons,
  referrals as seedReferrals,
  rentRecords as seedRentRecords,
  residentProfiles as seedResidentProfiles,
  reputationEvents as seedReputationEvents,
  reviews as seedReviews,
  roleOptions,
  dealWatchlist as seedDealWatchlist,
  tenantDemandSignals as seedTenantDemandSignals,
  updateDb,
  usefulNotifications as seedUsefulNotifications,
  viewings as seedViewings,
  verifyPassword,
} from './db.js';

const port = Number(process.env.PORT || process.env.RENTEAZY_API_PORT || 8787);

function isConnectionAbort(error) {
  return error?.code === 'ECONNRESET' || error?.message === 'aborted';
}

function send(res, status, body) {
  if (res.destroyed || res.writableEnded) return;
  const payload = JSON.stringify(body);
  try {
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    });
    res.end(payload);
  } catch (error) {
    if (!isConnectionAbort(error)) throw error;
  }
}

function notFound(res) {
  send(res, 404, { error: 'not_found' });
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

function authToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

function localEmailFromClerkId(clerkId) {
  return `${String(clerkId).replace(/[^a-z0-9_-]/gi, '').toLowerCase()}@clerk.renteazy.local`;
}

async function clerkUserFromToken(db, token) {
  if (!token || !process.env.CLERK_SECRET_KEY) return null;

  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    const clerkId = payload.sub;
    if (!clerkId) return null;
    const userId = `clerk-${String(clerkId).replace(/[^a-z0-9_-]/gi, '')}`;
    let user = db.users.find((item) => item.clerkId === clerkId || item.id === userId);
    if (!user) {
      user = {
        id: userId,
        clerkId,
        email: payload.email || localEmailFromClerkId(clerkId),
        passwordHash: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.users.push(user);
    } else if (!user.clerkId) {
      user.clerkId = clerkId;
      user.updatedAt = new Date().toISOString();
    }

    let profile = db.profiles.find((item) => item.userId === user.id || item.id === user.id);
    if (!profile) {
      profile = {
        id: user.id,
        userId: user.id,
        name: payload.name || payload.email || 'RentEazy member',
        role: '',
        area: '',
        budget: '',
        moveDate: '',
        lookingFor: '',
        avatarVariant: 'standing',
        avatarIndex: 0,
        avatarBg: 'mist',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.profiles.push(profile);
    }
    if (!db.wallets.some((item) => item.userId === user.id)) {
      db.wallets.push({ id: createId('wallet'), userId: user.id, balance: 0, updatedAt: new Date().toISOString() });
    }
    ensureDailyLimit(db, user.id);
    return user;
  } catch {
    return null;
  }
}

async function currentUser(req, db) {
  const token = authToken(req);
  return getUserFromToken(db, token) || await clerkUserFromToken(db, token) || null;
}

function compactState(db, userId = demoUserId) {
  ensureCollections(db);
  ensureLifecycleForUser(db, userId);
  const profile = publicProfile(db, userId);
  const userMatches = db.matches.filter((item) => item.participantIds.includes(userId));
  const userMatchIds = userMatches.map((item) => item.id);
  const likedIds = db.reactions.filter((item) => item.userId === userId && item.type === 'like').map((item) => item.postId);
  const savedIds = db.savedPosts.filter((item) => item.userId === userId).map((item) => item.postId);
  const followedIds = db.follows.filter((item) => item.followerId === userId).map((item) => item.followingId);
  const hiddenPostIds = db.hiddenPosts.filter((item) => item.userId === userId).map((item) => item.postId);
  const usageLimit = db.usageLimits.find((item) => item.userId === userId && item.limitType === 'daily_swipes');
  const wallet = db.wallets.find((item) => item.userId === userId);
  const appStreak = db.appStreaks.find((item) => item.userId === userId);
  const answers = Object.fromEntries(db.answers.filter((item) => item.userId === userId).map((item) => [item.questionId, item.value]));
  const feedRankings = rankFeedPosts(db, userId, { profile, answers, followedIds, likedIds, savedIds, hiddenPostIds });
  const recommendationInsights = buildRecommendationInsights(db, userId, { profile, answers, feedRankings });

  return {
    user: db.users.find((user) => user.id === userId),
    profile,
    posts: db.posts,
    likedIds,
    savedIds,
    followedIds,
    hiddenPostIds,
    comments: db.comments,
    shares: db.shares.filter((item) => item.userId === userId),
    reports: db.reports,
    answers,
    questions: db.questions,
    usageLimit,
    entitlements: db.entitlements.filter((item) => item.userId === userId),
    purchases: db.purchases.filter((item) => item.userId === userId),
    boosts: db.boostCampaigns.filter((item) => item.purchaserId === userId),
    wallet,
    appStreak,
    groups: db.groups,
    groupMemberships: db.groupMemberships.filter((item) => item.userId === userId),
    partnerOffers: db.partnerOffers,
    feedAds: db.feedAds,
    feedRankings,
    recommendationInsights,
    behavioralEvents: db.behavioralEvents.filter((item) => item.userId === userId).slice(0, 100),
    matches: userMatches,
    matchMessages: db.matchMessages.filter((item) => userMatchIds.includes(item.matchId)),
    viewings: db.viewings.filter((item) => item.participantIds.includes(userId)),
    reviews: db.reviews.filter((item) => item.reviewerId === userId || item.revieweeId === userId),
    reputationProfile: calculateReputationProfile(db, userId),
    lifecycleTasks: db.lifecycleTasks.filter((item) => item.userId === userId),
    referrals: db.referrals.filter((item) => item.userId === userId),
    residentProfiles: db.residentProfiles.filter((item) => item.userId === userId),
    maintenanceRequests: db.maintenanceRequests.filter((item) => item.userId === userId),
    rentRecords: db.rentRecords.filter((item) => item.userId === userId),
    landlordProperties: db.landlordProperties.filter((item) => item.ownerId === userId || item.ownerId === demoUserId),
    professionalProfiles: db.professionalProfiles.filter((item) => item.userId === userId || item.userId === demoUserId || ['sourcer-yorkshire'].includes(item.userId)),
    tenantDemandSignals: db.tenantDemandSignals,
    dealWatchlist: db.dealWatchlist.filter((item) => item.userId === userId || item.userId === demoUserId),
    operatorPortfolioSignals: db.operatorPortfolioSignals.filter((item) => item.operatorId === userId || item.operatorId === demoUserId),
    marketIntroductions: db.marketIntroductions.filter((item) => item.userId === userId || item.userId === demoUserId),
    notifications: db.notifications.filter((item) => item.userId === userId).slice(0, 20),
    microProducts,
    postTypes,
    reportReasons,
    roleOptions,
  };
}

function publicPreviewState(db) {
  ensureCollections(db);
  const profile = {
    id: 'preview-visitor',
    userId: 'preview-visitor',
    name: 'Guest preview',
    role: '',
    area: '',
    budget: '',
    moveDate: '',
    lookingFor: '',
    avatarVariant: 'standing',
    avatarIndex: 1,
    avatarBg: 'mist',
  };
  const answers = {};
  const feedRankings = rankFeedPosts(db, profile.id, {
    profile,
    answers,
    followedIds: [],
    likedIds: [],
    savedIds: [],
    hiddenPostIds: [],
  });
  const recommendationInsights = buildRecommendationInsights(db, profile.id, { profile, answers, feedRankings });
  return {
    user: null,
    profile,
    posts: db.posts,
    likedIds: [],
    savedIds: [],
    followedIds: [],
    hiddenPostIds: [],
    comments: [],
    shares: [],
    reports: [],
    answers,
    questions: db.questions,
    usageLimit: {
      id: 'daily-swipes-preview',
      userId: profile.id,
      limitType: 'daily_swipes',
      period: 'day',
      used: 0,
      allowance: 0,
      resetsAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    },
    entitlements: [],
    purchases: [],
    boosts: [],
    wallet: { id: 'wallet-preview', userId: profile.id, balance: 0, updatedAt: new Date().toISOString() },
    appStreak: { id: 'streak-preview', userId: profile.id, streakType: 'daily_app_open', count: 0, lastActivityAt: null },
    groups: db.groups,
    groupMemberships: [],
    partnerOffers: db.partnerOffers,
    feedAds: db.feedAds,
    feedRankings,
    recommendationInsights,
    behavioralEvents: [],
    matches: [],
    matchMessages: [],
    viewings: [],
    reviews: [],
    reputationProfile: {
      userId: profile.id,
      score: 0,
      tier: 'Not started',
      completedEvents: [],
      missingFields: ['Create an account', 'Choose a role', 'Answer match questions'],
      suggestions: ['Create a free account to start building real RentEazy reputation.'],
      updatedAt: new Date().toISOString(),
    },
    lifecycleTasks: [],
    referrals: [],
    residentProfiles: [],
    maintenanceRequests: [],
    rentRecords: [],
    landlordProperties: [],
    professionalProfiles: [],
    tenantDemandSignals: db.tenantDemandSignals,
    dealWatchlist: [],
    operatorPortfolioSignals: [],
    marketIntroductions: [],
    notifications: [],
    microProducts,
    postTypes,
    reportReasons,
    roleOptions,
  };
}

function errorStatus(result, fallbackStatus) {
  return result?.error === 'auth_required' ? 401 : fallbackStatus;
}

function buildRecommendationInsights(db, userId, context = {}) {
  const profile = context.profile || publicProfile(db, userId);
  const answers = context.answers || {};
  const feedRankings = context.feedRankings || rankFeedPosts(db, userId, { profile, answers });
  const events = db.behavioralEvents.filter((event) => event.userId === userId);
  const eventCounts = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {});
  const objectiveCounts = feedRankings.reduce((acc, ranking) => {
    acc[ranking.objective] = (acc[ranking.objective] || 0) + 1;
    return acc;
  }, {});
  const reasonCounts = feedRankings.flatMap((ranking) => ranking.reasons || []).reduce((acc, reason) => {
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {});
  const topReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([reason]) => reason);
  const likedSwipes = events.filter((event) => event.eventType === 'swipe_action' && ['like', 'superlike'].includes(event.metadata?.action));
  const passedSwipes = events.filter((event) => event.eventType === 'swipe_action' && event.metadata?.action === 'pass');
  const answeredCount = Object.values(answers).filter((value) => String(value || '').trim()).length;
  const relevantOffers = db.partnerOffers
    .filter((offer) => !offer.eligibleRoles?.length || offer.eligibleRoles.includes(profile.role) || !profile.role)
    .slice(0, 4)
    .map((offer) => ({
      offerId: offer.id,
      title: offer.title,
      reason: offer.lifecycleTrigger === 'moving_soon' || offer.lifecycleTrigger === 'tenancy_started'
        ? 'Useful around move timing'
        : offer.eligibleRoles?.includes(profile.role)
          ? `${profile.role} fit`
          : 'Relevant rental-market perk',
    }));
  const nextActions = [
    answeredCount < 3 && { id: 'answer-questions', label: 'Answer 3 questions', targetPath: '/app/profile', reason: 'Improves matching and Feed rank explanations' },
    likedSwipes.length + passedSwipes.length < 3 && { id: 'swipe-more', label: 'Swipe 3 cards', targetPath: '/app/swipe', reason: 'Teaches the deck what to show next' },
    !eventCounts.post_created && { id: 'post-signal', label: 'Create a useful post', targetPath: '/app/post', reason: 'Adds inventory and improves the network' },
    !eventCounts.group_joined && { id: 'join-group', label: 'Join one group', targetPath: '/app/feed', reason: 'Adds community and local-trust signals' },
  ].filter(Boolean).slice(0, 3);

  return {
    learnedSignals: {
      role: profile.role || 'General',
      area: profile.area || answers['tenant-areas'] || answers['buddy-areas'] || answers['investor-areas'] || '',
      answeredQuestions: answeredCount,
      likedSwipes: likedSwipes.length,
      passedSwipes: passedSwipes.length,
      feedInteractions: (eventCounts.post_liked || 0) + (eventCounts.post_saved || 0) + (eventCounts.post_shared || 0) + (eventCounts.post_commented || 0),
      perkOpens: eventCounts.partner_offer_opened || 0,
    },
    feedMix: {
      discovery: objectiveCounts.Discovery || 0,
      progress: objectiveCounts.Progress || 0,
      socialProof: objectiveCounts['Social proof'] || 0,
      topReasons,
    },
    swipeDeck: {
      likedCount: likedSwipes.length,
      passedCount: passedSwipes.length,
      prioritySignals: likedSwipes.length ? ['Show more cards like recent likes', 'Keep suitability above paid visibility'] : ['Collect first swipe signals'],
      suppressedSignals: passedSwipes.length ? ['Reduce cards similar to recent passes'] : [],
    },
    perkRecommendations: relevantOffers,
    nextActions,
    updatedAt: new Date().toISOString(),
  };
}

function roleRelevantPostTypes(role) {
  const map = {
    Tenant: ['Property', 'Room', 'Looking', 'House Buddy', 'Short-Term Stay', 'Serviced Accommodation', 'Advice', 'Question', 'Area Insight', 'Availability'],
    'House Buddy': ['Room', 'House Buddy', 'Looking', 'Property', 'Advice', 'Question', 'Area Insight'],
    Landlord: ['Looking', 'House Buddy', 'Landlord Opportunity', 'Agent Update', 'Operator Offer', 'Investor Brief', 'Advice', 'Area Insight'],
    'Individual Agent': ['Looking', 'House Buddy', 'Property', 'Room', 'Landlord Opportunity', 'Agent Update', 'Area Insight', 'Availability'],
    'Agency / Business': ['Looking', 'House Buddy', 'Property', 'Room', 'Landlord Opportunity', 'Agent Update', 'Operator Offer', 'Area Insight'],
    Operator: ['Landlord Opportunity', 'Property', 'Serviced Accommodation', 'Operator Offer', 'Investor Brief', 'Sourcer Deal', 'Area Insight'],
    Sourcer: ['Investor Brief', 'Sourcer Deal', 'Landlord Opportunity', 'Operator Offer', 'Area Insight'],
    Investor: ['Sourcer Deal', 'Investor Brief', 'Landlord Opportunity', 'Operator Offer', 'Area Insight'],
    'Short-Term Guest': ['Short-Term Stay', 'Serviced Accommodation', 'Availability', 'Advice', 'Question', 'Area Insight'],
    'Short-Term Host': ['Short-Term Stay', 'Serviced Accommodation', 'Operator Offer', 'Landlord Opportunity', 'Area Insight', 'Availability'],
  };
  return map[role] || ['Property', 'Room', 'Looking', 'House Buddy', 'Short-Term Stay', 'Landlord Opportunity', 'Investor Brief', 'Sourcer Deal', 'Advice', 'Question', 'Area Insight'];
}

function postMatchesText(post, text) {
  if (!text) return false;
  const needle = String(text).toLowerCase();
  const haystack = [post.title, post.body, post.area, post.budget, ...(post.tags || [])].join(' ').toLowerCase();
  return needle.split(/[,\s/]+/).filter(Boolean).some((part) => part.length > 2 && haystack.includes(part));
}

function rankFeedPosts(db, userId, context = {}) {
  const profile = context.profile || publicProfile(db, userId);
  const answers = context.answers || Object.fromEntries(db.answers.filter((item) => item.userId === userId).map((item) => [item.questionId, item.value]));
  const followedIds = context.followedIds || db.follows.filter((item) => item.followerId === userId).map((item) => item.followingId);
  const likedIds = context.likedIds || db.reactions.filter((item) => item.userId === userId && item.type === 'like').map((item) => item.postId);
  const savedIds = context.savedIds || db.savedPosts.filter((item) => item.userId === userId).map((item) => item.postId);
  const hiddenPostIds = context.hiddenPostIds || db.hiddenPosts.filter((item) => item.userId === userId).map((item) => item.postId);
  const roleTypes = roleRelevantPostTypes(profile.role);
  const areaSignals = [profile.area, answers['tenant-areas'], answers['buddy-areas'], answers['investor-areas']].filter(Boolean);
  const budgetSignals = [profile.budget, answers['tenant-budget'], answers['buddy-budget'], answers['investor-budget']].filter(Boolean);
  const interactedTypes = db.behavioralEvents
    .filter((event) => event.userId === userId && ['post_liked', 'post_saved', 'post_shared', 'post_commented'].includes(event.eventType))
    .map((event) => db.posts.find((post) => post.id === event.targetId)?.postType)
    .filter(Boolean);

  return db.posts.map((post) => {
    const reasons = [];
    const negativeSignals = [];
    let score = 38;

    if (roleTypes.includes(post.postType)) {
      score += 22;
      reasons.push('Role fit');
    }
    if (areaSignals.some((signal) => postMatchesText(post, signal))) {
      score += 14;
      reasons.push('Area fit');
    }
    if (budgetSignals.some((signal) => postMatchesText(post, signal))) {
      score += 10;
      reasons.push('Budget signal');
    }
    if (followedIds.includes(post.authorId)) {
      score += 12;
      reasons.push('Followed source');
    }
    if (interactedTypes.includes(post.postType)) {
      score += 8;
      reasons.push('Based on your activity');
    }
    const socialProof = Number(post.likeCount || 0) + Number(post.saveCount || 0) + Number(post.commentCount || 0) + Number(post.shareCount || 0);
    if (socialProof > 0) {
      score += Math.min(10, socialProof * 2);
      reasons.push('Social proof');
    }
    const ageHours = Math.max(0, (Date.now() - new Date(post.createdAt).getTime()) / 3600000);
    if (ageHours < 24) {
      score += 7;
      reasons.push('Fresh');
    } else if (ageHours > 168) {
      score -= 5;
      negativeSignals.push('Older post');
    }
    if (post.sponsoredStatus) {
      score += 3;
      reasons.push(`${post.sponsoredStatus} and labelled`);
    }
    if (hiddenPostIds.includes(post.id)) {
      score = 0;
      negativeSignals.push('Hidden by you');
    }
    if (likedIds.includes(post.id) || savedIds.includes(post.id)) {
      score += 5;
      reasons.push('Saved or liked by you');
    }

    const objective = post.postType === 'Question' || post.postType === 'Advice' || post.postType === 'Area Insight'
      ? 'Progress'
      : socialProof > 0 || followedIds.includes(post.authorId)
        ? 'Social proof'
        : 'Discovery';

    return {
      postId: post.id,
      score: Math.max(0, Math.min(100, Math.round(score))),
      objective,
      reasons: [...new Set(reasons)].slice(0, 5),
      negativeSignals,
      matchedSignals: {
        role: profile.role || 'General',
        area: areaSignals.filter((signal) => postMatchesText(post, signal)).slice(0, 2),
        budget: budgetSignals.filter((signal) => postMatchesText(post, signal)).slice(0, 2),
      },
      calculatedAt: new Date().toISOString(),
    };
  }).sort((a, b) => b.score - a.score);
}

function ensureCollections(db) {
  db.groups ||= groups;
  db.groupMemberships ||= [];
  db.partnerOffers ||= partnerOffers;
  db.feedAds ||= feedAds;
  db.behavioralEvents ||= [];
  db.posts ||= [];
  db.hiddenPosts ||= [];
  db.notifications ||= [];
  db.residentProfiles ||= [];
  db.maintenanceRequests ||= [];
  db.rentRecords ||= [];
  db.landlordProperties ||= [];
  db.professionalProfiles ||= [];
  db.tenantDemandSignals ||= [];
  db.dealWatchlist ||= [];
  db.operatorPortfolioSignals ||= [];
  db.marketIntroductions ||= [];
  db.reports ||= [];
  db.comments ||= [];
  db.follows ||= [];
  db.reactions ||= [];
  db.savedPosts ||= [];
  db.shares ||= [];
  db.matchScores ||= [];
  db.matches ||= [];
  db.matchMessages ||= [];
  db.viewings ||= [];
  db.reviews ||= [];
  db.reputationEvents ||= [];
  db.lifecycleTasks ||= [];
  db.referrals ||= [];
  db.entitlements ||= [];
  db.purchases ||= [];
  db.boostCampaigns ||= [];
  db.wallets ||= [];
  db.appStreaks ||= [];
  db.answers ||= [];
  db.usageLimits ||= [];
  const existingPostIds = new Set((db.posts || []).map((post) => post.id));
  const missingSeedPosts = seedPosts.filter((post) => !existingPostIds.has(post.id));
  if (missingSeedPosts.length) db.posts.push(...missingSeedPosts);
  const existingMatchIds = new Set(db.matches.map((item) => item.id));
  const missingMatches = seedMatches.filter((item) => !existingMatchIds.has(item.id));
  if (missingMatches.length) db.matches.push(...missingMatches);
  const existingMessageIds = new Set(db.matchMessages.map((item) => item.id));
  const missingMessages = seedMatchMessages.filter((item) => !existingMessageIds.has(item.id));
  if (missingMessages.length) db.matchMessages.push(...missingMessages);
  const existingViewingIds = new Set(db.viewings.map((item) => item.id));
  const missingViewings = seedViewings.filter((item) => !existingViewingIds.has(item.id));
  if (missingViewings.length) db.viewings.push(...missingViewings);
  const existingReviewIds = new Set(db.reviews.map((item) => item.id));
  const missingReviews = seedReviews.filter((item) => !existingReviewIds.has(item.id));
  if (missingReviews.length) db.reviews.push(...missingReviews);
  const existingReputationIds = new Set(db.reputationEvents.map((item) => item.id));
  const missingReputationEvents = seedReputationEvents.filter((item) => !existingReputationIds.has(item.id));
  if (missingReputationEvents.length) db.reputationEvents.push(...missingReputationEvents);
  const existingLifecycleTaskIds = new Set(db.lifecycleTasks.map((item) => item.id));
  const missingLifecycleTasks = seedLifecycleTasks.filter((item) => !existingLifecycleTaskIds.has(item.id));
  if (missingLifecycleTasks.length) db.lifecycleTasks.push(...missingLifecycleTasks);
  const existingReferralIds = new Set(db.referrals.map((item) => item.id));
  const missingReferrals = seedReferrals.filter((item) => !existingReferralIds.has(item.id));
  if (missingReferrals.length) db.referrals.push(...missingReferrals);
  const existingResidentIds = new Set(db.residentProfiles.map((item) => item.id));
  const missingResidentProfiles = seedResidentProfiles.filter((item) => !existingResidentIds.has(item.id));
  if (missingResidentProfiles.length) db.residentProfiles.push(...missingResidentProfiles);
  const existingMaintenanceIds = new Set(db.maintenanceRequests.map((item) => item.id));
  const missingMaintenanceRequests = seedMaintenanceRequests.filter((item) => !existingMaintenanceIds.has(item.id));
  if (missingMaintenanceRequests.length) db.maintenanceRequests.push(...missingMaintenanceRequests);
  const existingRentRecordIds = new Set(db.rentRecords.map((item) => item.id));
  const missingRentRecords = seedRentRecords.filter((item) => !existingRentRecordIds.has(item.id));
  if (missingRentRecords.length) db.rentRecords.push(...missingRentRecords);
  const existingPropertyIds = new Set(db.landlordProperties.map((item) => item.id));
  const missingLandlordProperties = seedLandlordProperties.filter((item) => !existingPropertyIds.has(item.id));
  if (missingLandlordProperties.length) db.landlordProperties.push(...missingLandlordProperties);
  const existingProfessionalIds = new Set(db.professionalProfiles.map((item) => item.id));
  const missingProfessionalProfiles = seedProfessionalProfiles.filter((item) => !existingProfessionalIds.has(item.id));
  if (missingProfessionalProfiles.length) db.professionalProfiles.push(...missingProfessionalProfiles);
  const existingDemandSignalIds = new Set(db.tenantDemandSignals.map((item) => item.id));
  const missingDemandSignals = seedTenantDemandSignals.filter((item) => !existingDemandSignalIds.has(item.id));
  if (missingDemandSignals.length) db.tenantDemandSignals.push(...missingDemandSignals);
  const existingWatchIds = new Set(db.dealWatchlist.map((item) => item.id));
  const missingWatchItems = seedDealWatchlist.filter((item) => !existingWatchIds.has(item.id));
  if (missingWatchItems.length) db.dealWatchlist.push(...missingWatchItems);
  const existingOperatorSignalIds = new Set(db.operatorPortfolioSignals.map((item) => item.id));
  const missingOperatorSignals = seedOperatorPortfolioSignals.filter((item) => !existingOperatorSignalIds.has(item.id));
  if (missingOperatorSignals.length) db.operatorPortfolioSignals.push(...missingOperatorSignals);
  const existingIntroductionIds = new Set(db.marketIntroductions.map((item) => item.id));
  const missingIntroductions = seedMarketIntroductions.filter((item) => !existingIntroductionIds.has(item.id));
  if (missingIntroductions.length) db.marketIntroductions.push(...missingIntroductions);
  const existingNotificationIds = new Set(db.notifications.map((item) => item.id));
  const missingNotifications = seedUsefulNotifications.filter((item) => !existingNotificationIds.has(item.id));
  if (missingNotifications.length) db.notifications.push(...missingNotifications);
  if (!db.groupMemberships.some((item) => item.userId === demoUserId)) {
    db.groupMemberships.push({ id: 'membership-demo-east-london', groupId: 'group-east-london-renters', userId: demoUserId, role: 'member', createdAt: new Date().toISOString() });
  }
  return db;
}

function ensureLifecycleForUser(db, userId) {
  if (db.lifecycleTasks.some((item) => item.userId === userId)) return;
  const createdAt = new Date().toISOString();
  db.lifecycleTasks.push(...seedLifecycleTasks.map((item) => ({
    ...item,
    id: createId('task'),
    userId,
    createdAt,
    completedAt: null,
  })));
}

function calculateReputationProfile(db, userId) {
  const profile = publicProfile(db, userId);
  const answeredCount = db.answers.filter((item) => item.userId === userId && String(item.value || '').trim()).length;
  const postCount = db.posts.filter((item) => item.authorId === userId).length;
  const commentCount = db.comments.filter((item) => item.authorId === userId).length;
  const matchCount = db.matches.filter((item) => item.participantIds.includes(userId)).length;
  const viewingCount = db.viewings.filter((item) => item.participantIds.includes(userId)).length;
  const reviewCount = db.reviews.filter((item) => item.revieweeId === userId).length;
  const reportPenalty = db.reports.filter((item) => item.reporterId !== userId && item.targetId === userId).length * 8;
  const eventPoints = db.reputationEvents.filter((item) => item.userId === userId).reduce((sum, event) => sum + Number(event.points || 0), 0);
  const profileFields = [profile.name, profile.role, profile.area, profile.budget, profile.moveDate, profile.lookingFor];
  const profilePoints = profileFields.filter((value) => String(value || '').trim()).length * 5;
  const score = Math.max(0, Math.min(100, 35 + profilePoints + answeredCount * 4 + postCount * 3 + commentCount * 2 + matchCount * 8 + viewingCount * 7 + reviewCount * 10 + eventPoints - reportPenalty));
  const tier = score >= 85 ? 'Gold' : score >= 70 ? 'Silver' : score >= 55 ? 'Bronze' : 'Starter';
  const badges = [
    profile.role ? `${profile.role} profile` : 'Role needed',
    matchCount ? 'Mutual match history' : 'No matches yet',
    viewingCount ? 'Viewing record' : 'Viewing record empty',
    answeredCount >= 3 ? 'Match questions answered' : 'More match info needed',
  ];
  return {
    userId,
    score,
    tier,
    badges,
    completedFields: profileFields.filter((value) => String(value || '').trim()).length,
    missingFields: ['role', 'area', 'budget', 'moveDate', 'lookingFor'].filter((field) => !String(profile[field] || '').trim()),
    components: {
      profilePoints,
      answeredCount,
      postCount,
      commentCount,
      matchCount,
      viewingCount,
      reviewCount,
      eventPoints,
      reportPenalty,
    },
    updatedAt: new Date().toISOString(),
  };
}

function addReputationEvent(db, userId, eventType, points, source) {
  db.reputationEvents.unshift({ id: createId('rrs'), userId, eventType, points, source, createdAt: new Date().toISOString() });
}

function createOrUpdateMatch(db, userId, body, action) {
  const targetId = body.targetId || 'stratford-1-bed';
  const subjectTitle = body.subjectTitle || body.title || 'RentEazy match';
  const counterpartId = body.counterpartId || body.authorId || `counterpart-${targetId}`;
  const existing = db.matches.find((item) => item.participantIds.includes(userId) && (item.subjectId === targetId || item.participantIds.includes(counterpartId)));
  if (existing) {
    existing.status = 'matched';
    existing.updatedAt = new Date().toISOString();
    existing.score = Math.max(existing.score || 0, Number(body.score || 78));
    return existing;
  }
  const match = {
    id: createId('match'),
    participantIds: [userId, counterpartId],
    participantNames: [publicProfile(db, userId).name, body.counterpartName || body.authorName || 'RentEazy member'],
    participantTypes: [publicProfile(db, userId).role || 'Member', body.counterpartType || body.authorType || body.type || 'Member'],
    subjectType: body.targetType || 'swipe_card',
    subjectId: targetId,
    subjectTitle,
    status: 'matched',
    score: Number(body.score || 78),
    reasonBadges: Array.isArray(body.reasonBadges) && body.reasonBadges.length ? body.reasonBadges : ['Area fit', 'Budget fit', action === 'superlike' ? 'Priority signal' : 'Mutual interest'],
    missingInfo: body.missingInfo || ['Confirm availability'],
    openedBy: action === 'superlike' ? 'superlike' : 'mutual_interest',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.matches.unshift(match);
  db.matchMessages.unshift({
    id: createId('message'),
    matchId: match.id,
    authorId: counterpartId,
    authorName: match.participantNames[1],
    body: 'Mutual match opened. Keep messages, viewing windows, and next steps inside RentEazy.',
    createdAt: new Date().toISOString(),
  });
  addReputationEvent(db, userId, 'mutual_match', action === 'superlike' ? 14 : 10, match.id);
  return match;
}

function ensureDailyLimit(db, userId) {
  let limit = db.usageLimits.find((item) => item.userId === userId && item.limitType === 'daily_swipes');
  if (!limit) {
    limit = {
      id: createId('limit'),
      userId,
      limitType: 'daily_swipes',
      period: 'day',
      used: 0,
      allowance: 8,
      resetsAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    };
    db.usageLimits.push(limit);
  }
  if (new Date(limit.resetsAt).getTime() <= Date.now()) {
    limit.used = 0;
    limit.resetsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  }
  return limit;
}

function addNotification(db, userId, type, title, body) {
  db.notifications.push({ id: createId('notification'), userId, type, title, body, read: false, createdAt: new Date().toISOString() });
}

function isBoostProduct(product) {
  return ['Mini Boost', 'Post Boost', 'Business starter'].includes(product.category);
}

function createBoostCampaign(userId, product, targetType = 'profile', targetId = userId) {
  const durationMinutes = product.durationMinutes || 60;
  return {
    id: createId('boost'),
    purchaserId: userId,
    targetType,
    targetId,
    boostType: product.category,
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + durationMinutes * 60000).toISOString(),
    impressions: 0,
    clicks: 0,
    likes: 0,
    saves: 0,
    matches: 0,
    status: 'active',
  };
}

const routes = {
  async 'GET /api/health'(_req, res) {
    const db = await readDb();
    send(res, 200, { ok: true, version: db.meta?.version || 1, updatedAt: db.meta?.updatedAt });
  },

  async 'GET /api/bootstrap'(req, res) {
    const state = await updateDb(async (db) => {
      ensureCollections(db);
      const user = await currentUser(req, db);
      if (!user) return publicPreviewState(db);
      ensureDailyLimit(db, user.id);
      return compactState(db, user.id);
    });
    send(res, 200, state);
  },

  async 'POST /api/auth/register'(req, res) {
    const body = await readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const name = String(body.name || 'RentEazy member').trim();
    const role = roleOptions.includes(body.role) ? body.role : '';
    if (!email || password.length < 8) return send(res, 400, { error: 'email_and_password_required' });

    const result = await updateDb((db) => {
      ensureCollections(db);
      if (db.users.some((user) => user.email === email)) return { error: 'email_exists' };
      const user = { id: createId('user'), email, passwordHash: hashNewPassword(password), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      db.users.push(user);
      db.profiles.push({ id: user.id, userId: user.id, name, role, area: '', budget: '', moveDate: '', lookingFor: '', avatarVariant: 'standing', avatarIndex: 0, avatarBg: 'mist', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      db.wallets.push({ id: createId('wallet'), userId: user.id, balance: 0, updatedAt: new Date().toISOString() });
      ensureDailyLimit(db, user.id);
      const session = createSession(db, user.id);
      addNotification(db, user.id, 'welcome', 'Welcome to RentEazy', 'Your daily swipes are ready.');
      return { user, token: session.token, state: compactState(db, user.id) };
    });
    if (result.error) return send(res, 409, result);
    send(res, 201, result);
  },

  async 'POST /api/auth/login'(req, res) {
    const body = await readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const result = await updateDb((db) => {
      const user = db.users.find((item) => item.email === email);
      if (!user || !verifyPassword(password, user.passwordHash)) return { error: 'invalid_login' };
      const session = createSession(db, user.id);
      ensureDailyLimit(db, user.id);
      return { user, token: session.token, state: compactState(db, user.id) };
    });
    if (result.error) return send(res, 401, result);
    send(res, 200, result);
  },

  async 'PATCH /api/profile'(req, res) {
    const body = await readBody(req);
    const result = await updateDb(async (db) => {
      const user = await currentUser(req, db);
      if (!user) return { error: 'auth_required' };
      const profile = publicProfile(db, user.id);
      Object.assign(profile, {
        name: body.name ?? profile.name,
        role: roleOptions.includes(body.role) ? body.role : profile.role,
        area: body.area ?? profile.area,
        budget: body.budget ?? profile.budget,
        moveDate: body.moveDate ?? profile.moveDate,
        lookingFor: body.lookingFor ?? profile.lookingFor,
        avatarVariant: ['bust', 'standing', 'sitting'].includes(body.avatarVariant) ? body.avatarVariant : profile.avatarVariant,
        avatarIndex: Number.isFinite(Number(body.avatarIndex)) ? Math.max(0, Math.floor(Number(body.avatarIndex))) : profile.avatarIndex,
        avatarBg: ['mist', 'green', 'navy', 'sun', 'blush'].includes(body.avatarBg) ? body.avatarBg : profile.avatarBg,
        updatedAt: new Date().toISOString(),
      });
      return profile;
    });
    if (result.error === 'auth_required') return send(res, 401, result);
    send(res, 200, result);
  },

  async 'PATCH /api/answers'(req, res) {
    const body = await readBody(req);
    const result = await updateDb(async (db) => {
      const user = await currentUser(req, db);
      if (!user) return { error: 'auth_required' };
      for (const [questionId, value] of Object.entries(body.answers || {})) {
        let answer = db.answers.find((item) => item.userId === user.id && item.questionId === questionId);
        if (!answer) {
          answer = { id: createId('answer'), userId: user.id, questionId, value, visibility: 'private', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          db.answers.push(answer);
        } else {
          answer.value = value;
          answer.updatedAt = new Date().toISOString();
        }
      }
      return compactState(db, user.id).answers;
    });
    if (result.error === 'auth_required') return send(res, 401, result);
    send(res, 200, { answers: result });
  },

  async 'POST /api/posts'(req, res) {
    const body = await readBody(req);
    const result = await updateDb(async (db) => {
      ensureCollections(db);
      const user = await currentUser(req, db);
      if (!user) return { error: 'auth_required' };
      const profile = publicProfile(db, user.id);
      const post = {
        id: createId('post'),
        authorId: user.id,
        authorType: profile.role || 'Member',
        authorName: profile.name,
        postType: postTypes.includes(body.postType) ? body.postType : 'General',
        title: String(body.title || '').trim(),
        body: String(body.body || '').trim(),
        media: Array.isArray(body.media) ? body.media : [],
        area: String(body.area || '').trim(),
        budget: String(body.budget || '').trim(),
        tags: Array.isArray(body.tags) ? body.tags.slice(0, 8) : [],
        visibility: body.visibility || 'public',
        sponsoredStatus: body.sponsoredStatus || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
        saveCount: 0,
        shareCount: 0,
      };
      if (!post.title || !post.body) return { error: 'title_and_body_required' };
      db.posts.unshift(post);
      db.behavioralEvents.unshift({ id: createId('event'), userId: user.id, eventType: 'post_created', targetType: 'post', targetId: post.id, metadata: { postType: post.postType, area: post.area }, createdAt: new Date().toISOString() });
      addNotification(db, user.id, 'post_created', 'Your post is live', 'Share it externally for 5 extra swipes today.');
      return post;
    });
    if (result.error === 'auth_required') return send(res, 401, result);
    if (result.error) return send(res, errorStatus(result, 400), result);
    send(res, 201, result);
  },
};

async function handleDynamic(req, res, method, pathname) {
  const db = await readDb();
  const postMatch = pathname.match(/^\/api\/posts\/([^/]+)\/(like|save|share|comment|report|boost|hide)$/);

  if (method === 'POST' && postMatch) {
    const [, postId, action] = postMatch;
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const post = writeableDb.posts.find((item) => item.id === postId);
      if (!post) return { error: 'post_not_found' };

      if (action === 'like') {
        const existing = writeableDb.reactions.find((item) => item.userId === writeUser.id && item.postId === postId && item.type === 'like');
        if (existing) writeableDb.reactions = writeableDb.reactions.filter((item) => item !== existing);
        else writeableDb.reactions.push({ id: createId('reaction'), postId, userId: writeUser.id, type: 'like', createdAt: new Date().toISOString() });
        writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: existing ? 'post_unliked' : 'post_liked', targetType: 'post', targetId: postId, metadata: { postType: post.postType }, createdAt: new Date().toISOString() });
      }
      if (action === 'save') {
        const existing = writeableDb.savedPosts.find((item) => item.userId === writeUser.id && item.postId === postId);
        if (existing) writeableDb.savedPosts = writeableDb.savedPosts.filter((item) => item !== existing);
        else writeableDb.savedPosts.push({ id: createId('saved'), postId, userId: writeUser.id, createdAt: new Date().toISOString() });
        writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: existing ? 'post_unsaved' : 'post_saved', targetType: 'post', targetId: postId, metadata: { postType: post.postType }, createdAt: new Date().toISOString() });
      }
      if (action === 'share') {
        const share = { id: createId('share'), postId, userId: writeUser.id, channel: body.channel || 'copy', trackingUrl: body.trackingUrl || `/share/post/${postId}`, rewardGranted: true, createdAt: new Date().toISOString() };
        writeableDb.shares.unshift(share);
        post.shareCount += 1;
        ensureDailyLimit(writeableDb, writeUser.id).allowance += 5;
        writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'post_shared', targetType: 'post', targetId: postId, metadata: { channel: share.channel, rewardGranted: true }, createdAt: new Date().toISOString() });
      }
      if (action === 'comment') {
        const comment = { id: createId('comment'), postId, authorId: writeUser.id, authorName: publicProfile(writeableDb, writeUser.id).name, body: String(body.body || '').trim(), createdAt: new Date().toISOString() };
        if (!comment.body) return { error: 'comment_required' };
        writeableDb.comments.unshift(comment);
        writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'post_commented', targetType: 'post', targetId: postId, metadata: {}, createdAt: new Date().toISOString() });
      }
      if (action === 'report') {
        const report = { id: createId('report'), reporterId: writeUser.id, targetType: 'post', targetId: postId, reason: reportReasons.includes(body.reason) ? body.reason : 'Other', details: body.details || '', status: 'open', createdAt: new Date().toISOString() };
        writeableDb.reports.unshift(report);
        writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'post_reported', targetType: 'post', targetId: postId, metadata: { reason: report.reason }, createdAt: new Date().toISOString() });
      }
      if (action === 'boost') {
        const product = microProducts.find((item) => item.id === (body.productId || 'post-bump-small')) || microProducts.find((item) => item.id === 'post-bump-small');
        writeableDb.boostCampaigns.unshift(createBoostCampaign(writeUser.id, product, 'post', postId));
        writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'post_boost_started', targetType: 'post', targetId: postId, metadata: { productId: product.id }, createdAt: new Date().toISOString() });
      }
      if (action === 'hide') {
        writeableDb.hiddenPosts.push({ id: createId('hidden'), userId: writeUser.id, postId, createdAt: new Date().toISOString() });
      }

      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 400), result);
    return send(res, 200, result);
  }

  if (method === 'POST' && pathname === '/api/follows') {
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const followingId = String(body.followingId || '');
      const existing = writeableDb.follows.find((item) => item.followerId === writeUser.id && item.followingId === followingId);
      if (existing) writeableDb.follows = writeableDb.follows.filter((item) => item !== existing);
      else writeableDb.follows.push({ id: createId('follow'), followerId: writeUser.id, followingId, followingType: body.followingType || 'account', createdAt: new Date().toISOString() });
      writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: existing ? 'unfollowed' : 'followed', targetType: body.followingType || 'account', targetId: followingId, metadata: {}, createdAt: new Date().toISOString() });
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 400), result);
    return send(res, 200, result);
  }

  if (method === 'POST' && pathname === '/api/swipes') {
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const limit = ensureDailyLimit(writeableDb, writeUser.id);
      if (limit.used >= limit.allowance) return { error: 'daily_swipes_used', limit };
      limit.used += 1;
      writeableDb.matchScores.unshift({ id: createId('match-score'), viewerId: writeUser.id, targetId: body.targetId || 'unknown', targetType: body.targetType || 'card', score: body.score || 70, reasonBadges: body.reasonBadges || ['Area fit'], missingInfo: [], dealBreakerConflict: false, calculatedAt: new Date().toISOString() });
      writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'swipe_action', targetType: body.targetType || 'card', targetId: body.targetId || 'unknown', metadata: { action: body.action }, createdAt: new Date().toISOString() });
      if (['like', 'superlike'].includes(body.action)) {
        const match = createOrUpdateMatch(writeableDb, writeUser.id, body, body.action);
        writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'match_opened', targetType: 'match', targetId: match.id, metadata: { score: match.score, action: body.action }, createdAt: new Date().toISOString() });
        addNotification(writeableDb, writeUser.id, 'match_opened', 'New RentEazy match', `${match.subjectTitle} is ready for chat and viewing coordination.`);
      }
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 429), result);
    return send(res, 200, result);
  }

  const matchMessageMatch = pathname.match(/^\/api\/matches\/([^/]+)\/messages$/);
  if (method === 'POST' && matchMessageMatch) {
    const [, matchId] = matchMessageMatch;
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const match = writeableDb.matches.find((item) => item.id === matchId && item.participantIds.includes(writeUser.id));
      if (!match) return { error: 'match_not_found' };
      const profile = publicProfile(writeableDb, writeUser.id);
      const message = { id: createId('message'), matchId, authorId: writeUser.id, authorName: profile.name, body: String(body.body || '').trim(), createdAt: new Date().toISOString() };
      if (!message.body) return { error: 'message_required' };
      writeableDb.matchMessages.unshift(message);
      match.updatedAt = new Date().toISOString();
      writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'match_message_sent', targetType: 'match', targetId: matchId, metadata: {}, createdAt: new Date().toISOString() });
      addReputationEvent(writeableDb, writeUser.id, 'match_message_sent', 3, message.id);
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 400), result);
    return send(res, 201, result);
  }

  const matchViewingMatch = pathname.match(/^\/api\/matches\/([^/]+)\/viewings$/);
  if (method === 'POST' && matchViewingMatch) {
    const [, matchId] = matchViewingMatch;
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const match = writeableDb.matches.find((item) => item.id === matchId && item.participantIds.includes(writeUser.id));
      if (!match) return { error: 'match_not_found' };
      const viewing = {
        id: createId('viewing'),
        matchId,
        requesterId: writeUser.id,
        participantIds: match.participantIds,
        subjectTitle: match.subjectTitle,
        scheduledFor: body.scheduledFor || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'requested',
        mode: body.mode || 'In-person',
        location: body.location || '',
        notes: String(body.notes || '').trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      writeableDb.viewings.unshift(viewing);
      match.status = 'viewing_requested';
      match.updatedAt = new Date().toISOString();
      writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'viewing_requested', targetType: 'viewing', targetId: viewing.id, metadata: { matchId }, createdAt: new Date().toISOString() });
      addReputationEvent(writeableDb, writeUser.id, 'viewing_requested', 8, viewing.id);
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 400), result);
    return send(res, 201, result);
  }

  const matchReviewMatch = pathname.match(/^\/api\/matches\/([^/]+)\/reviews$/);
  if (method === 'POST' && matchReviewMatch) {
    const [, matchId] = matchReviewMatch;
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const match = writeableDb.matches.find((item) => item.id === matchId && item.participantIds.includes(writeUser.id));
      if (!match) return { error: 'match_not_found' };
      const revieweeId = body.revieweeId || match.participantIds.find((id) => id !== writeUser.id) || match.participantIds[0];
      const review = {
        id: createId('review'),
        matchId,
        reviewerId: writeUser.id,
        revieweeId,
        rating: Math.max(1, Math.min(5, Number(body.rating || 5))),
        tags: Array.isArray(body.tags) ? body.tags.slice(0, 6) : ['Responsive'],
        body: String(body.body || '').trim(),
        visibility: 'double_blind_until_both_submit',
        status: 'submitted',
        createdAt: new Date().toISOString(),
      };
      writeableDb.reviews.unshift(review);
      writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'review_submitted', targetType: 'match', targetId: matchId, metadata: { rating: review.rating }, createdAt: new Date().toISOString() });
      addReputationEvent(writeableDb, revieweeId, 'review_received', review.rating >= 4 ? 12 : 4, review.id);
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 400), result);
    return send(res, 201, result);
  }

  if (method === 'POST' && pathname === '/api/purchases') {
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const product = microProducts.find((item) => item.id === body.productId || item.sku === body.sku);
      if (!product) return { error: 'product_not_found' };
      const purchase = { id: createId('purchase'), userId: writeUser.id, sku: product.sku, amount: product.amount, currency: product.currency, status: 'recorded', provider: 'renteazy-local', createdAt: new Date().toISOString() };
      writeableDb.purchases.unshift(purchase);
      if (product.category === 'Extra swipes') ensureDailyLimit(writeableDb, writeUser.id).allowance += product.quantity;
      else if (product.category === 'Credits') {
        const wallet = writeableDb.wallets.find((item) => item.userId === writeUser.id);
        wallet.balance += product.quantity;
        wallet.updatedAt = new Date().toISOString();
      } else if (isBoostProduct(product)) {
        writeableDb.boostCampaigns.unshift(createBoostCampaign(writeUser.id, product, body.targetType || 'profile', body.targetId || writeUser.id));
      } else {
        writeableDb.entitlements.unshift({ id: createId('entitlement'), userId: writeUser.id, entitlementType: product.category, source: product.sku, quantityRemaining: product.quantity, expiresAt: null, createdAt: new Date().toISOString() });
      }
      writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'purchase_recorded', targetType: 'micro_product', targetId: product.id, metadata: { sku: product.sku, amount: product.amount }, createdAt: new Date().toISOString() });
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 400), result);
    return send(res, 201, result);
  }

  if (method === 'POST' && pathname === '/api/groups') {
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const profile = publicProfile(writeableDb, writeUser.id);
      const group = {
        id: createId('group'),
        name: String(body.name || '').trim(),
        groupType: String(body.groupType || 'Community').trim(),
        area: String(body.area || profile.area || 'UK').trim(),
        description: String(body.description || '').trim(),
        visibility: 'open',
        memberCount: 1,
        postCount: 0,
        roles: Array.isArray(body.roles) && body.roles.length ? body.roles : [profile.role || 'General'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!group.name || !group.description) return { error: 'group_name_and_description_required' };
      writeableDb.groups.unshift(group);
      writeableDb.groupMemberships.unshift({ id: createId('membership'), groupId: group.id, userId: writeUser.id, role: 'owner', createdAt: new Date().toISOString() });
      writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'group_created', targetType: 'group', targetId: group.id, metadata: { groupType: group.groupType, area: group.area }, createdAt: new Date().toISOString() });
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 400), result);
    return send(res, 201, result);
  }

  const groupJoinMatch = pathname.match(/^\/api\/groups\/([^/]+)\/join$/);
  if (method === 'POST' && groupJoinMatch) {
    const [, groupId] = groupJoinMatch;
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const group = writeableDb.groups.find((item) => item.id === groupId);
      if (!group) return { error: 'group_not_found' };
      const existing = writeableDb.groupMemberships.find((item) => item.groupId === groupId && item.userId === writeUser.id);
      if (existing) {
        writeableDb.groupMemberships = writeableDb.groupMemberships.filter((item) => item !== existing);
        group.memberCount = Math.max(0, group.memberCount - 1);
      } else {
        writeableDb.groupMemberships.unshift({ id: createId('membership'), groupId, userId: writeUser.id, role: 'member', createdAt: new Date().toISOString() });
        group.memberCount += 1;
      }
      writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: existing ? 'group_left' : 'group_joined', targetType: 'group', targetId: groupId, metadata: { groupType: group.groupType, area: group.area }, createdAt: new Date().toISOString() });
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 404), result);
    return send(res, 200, result);
  }

  const lifecycleTaskCompleteMatch = pathname.match(/^\/api\/lifecycle-tasks\/([^/]+)\/complete$/);
  if (method === 'POST' && lifecycleTaskCompleteMatch) {
    const [, taskId] = lifecycleTaskCompleteMatch;
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      ensureLifecycleForUser(writeableDb, writeUser.id);
      const task = writeableDb.lifecycleTasks.find((item) => item.id === taskId && (item.userId === writeUser.id || item.userId === demoUserId));
      if (!task) return { error: 'task_not_found' };
      const now = new Date().toISOString();
      if (task.userId === demoUserId && writeUser.id !== demoUserId) {
        writeableDb.lifecycleTasks.unshift({ ...task, id: createId('task'), userId: writeUser.id, status: 'completed', completedAt: now, updatedAt: now });
      } else {
        task.status = 'completed';
        task.completedAt = now;
        task.updatedAt = now;
      }
      writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'lifecycle_task_completed', targetType: 'lifecycle_task', targetId: taskId, metadata: { cadence: task.cadence, roleType: task.roleType, reward: task.reward }, createdAt: now });
      addReputationEvent(writeableDb, writeUser.id, 'lifecycle_task_completed', 3, taskId);
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 404), result);
    return send(res, 200, result);
  }

  if (method === 'POST' && pathname === '/api/referrals') {
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const inviteType = String(body.inviteType || 'Rental connection').trim();
      const target = String(body.target || '').trim();
      const referral = {
        id: createId('referral'),
        userId: writeUser.id,
        inviteType,
        target: target || `A ${inviteType.toLowerCase()} contact`,
        status: 'ready_to_share',
        reward: '5 extra swipes after first accepted invite',
        trackingUrl: `https://renteazy.co.uk/join?ref=${encodeURIComponent(writeUser.id)}&invite=${encodeURIComponent(inviteType.toLowerCase().replace(/\s+/g, '-'))}`,
        createdAt: new Date().toISOString(),
        acceptedAt: null,
      };
      writeableDb.referrals.unshift(referral);
      writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'referral_created', targetType: 'referral', targetId: referral.id, metadata: { inviteType }, createdAt: referral.createdAt });
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 400), result);
    return send(res, 201, result);
  }

  if (method === 'POST' && pathname === '/api/resident/maintenance') {
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const residentProfile = writeableDb.residentProfiles.find((item) => item.userId === writeUser.id) || writeableDb.residentProfiles.find((item) => item.userId === demoUserId);
      const request = {
        id: createId('maintenance'),
        userId: writeUser.id,
        residentProfileId: residentProfile?.id || '',
        title: String(body.title || '').trim(),
        category: String(body.category || 'Repair').trim(),
        priority: String(body.priority || 'Normal').trim(),
        status: 'logged',
        notes: String(body.notes || '').trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!request.title) return { error: 'maintenance_title_required' };
      writeableDb.maintenanceRequests.unshift(request);
      writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'maintenance_logged', targetType: 'maintenance_request', targetId: request.id, metadata: { category: request.category, priority: request.priority }, createdAt: request.createdAt });
      addReputationEvent(writeableDb, writeUser.id, 'resident_record_logged', 4, request.id);
      addNotification(writeableDb, writeUser.id, 'resident_record', 'Maintenance request saved.', 'Your timestamped record is now part of Resident Mode.');
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 400), result);
    return send(res, 201, result);
  }

  if (method === 'POST' && pathname === '/api/resident/rent-records') {
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const residentProfile = writeableDb.residentProfiles.find((item) => item.userId === writeUser.id) || writeableDb.residentProfiles.find((item) => item.userId === demoUserId);
      const record = {
        id: createId('rent-record'),
        userId: writeUser.id,
        residentProfileId: residentProfile?.id || '',
        month: String(body.month || new Date().toISOString().slice(0, 7)),
        amount: Number(body.amount || 0),
        currency: 'GBP',
        status: String(body.status || 'recorded_on_time'),
        verificationStatus: 'self_recorded',
        reputationPoints: 5,
        createdAt: new Date().toISOString(),
      };
      if (!record.amount) return { error: 'rent_amount_required' };
      writeableDb.rentRecords.unshift(record);
      writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'rent_record_logged', targetType: 'rent_record', targetId: record.id, metadata: { month: record.month, status: record.status }, createdAt: record.createdAt });
      addReputationEvent(writeableDb, writeUser.id, 'rent_record_logged', 5, record.id);
      addNotification(writeableDb, writeUser.id, 'reputation_progress', 'Rent record saved.', 'Verified records can strengthen future RentEazy references.');
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 400), result);
    return send(res, 201, result);
  }

  if (method === 'POST' && pathname === '/api/landlord/properties') {
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const property = {
        id: createId('property'),
        ownerId: writeUser.id,
        title: String(body.title || '').trim(),
        area: String(body.area || '').trim(),
        propertyType: String(body.propertyType || 'Property').trim(),
        status: String(body.status || 'pipeline').trim(),
        expectedRent: Number(body.expectedRent || 0),
        currency: 'GBP',
        vacancyRisk: 'Unknown',
        benchmarkNote: 'Benchmark will improve as more local RentEazy signals arrive.',
        tenantDemandCount: 0,
        operatorInterestCount: 0,
        agentInterestCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!property.title || !property.area) return { error: 'property_title_and_area_required' };
      writeableDb.landlordProperties.unshift(property);
      writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'landlord_property_added', targetType: 'landlord_property', targetId: property.id, metadata: { area: property.area, propertyType: property.propertyType }, createdAt: property.createdAt });
      addNotification(writeableDb, writeUser.id, 'landlord_pipeline', 'Property pipeline created.', 'RentEazy can now show tenant, agent, operator, and investor demand around it.');
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 400), result);
    return send(res, 201, result);
  }

  const demandShortlistMatch = pathname.match(/^\/api\/landlord\/demand\/([^/]+)\/shortlist$/);
  if (method === 'POST' && demandShortlistMatch) {
    const [, demandId] = demandShortlistMatch;
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const signal = writeableDb.tenantDemandSignals.find((item) => item.id === demandId);
      if (!signal) return { error: 'tenant_demand_not_found' };
      const now = new Date().toISOString();
      const targetId = String(body.targetId || signal.matchedPropertyIds?.[0] || '').trim();
      const existing = writeableDb.marketIntroductions.find((item) => item.userId === writeUser.id && item.sourceId === signal.id && item.targetId === targetId);
      if (existing) {
        existing.status = 'shortlisted';
        existing.updatedAt = now;
      } else {
        writeableDb.marketIntroductions.unshift({
          id: createId('intro'),
          userId: writeUser.id,
          sourceType: 'tenant_demand',
          sourceId: signal.id,
          targetType: targetId ? 'landlord_property' : 'demand_pipeline',
          targetId,
          status: 'shortlisted',
          reason: String(body.reason || `${signal.displayName} matches ${signal.area} demand and timing.`),
          createdAt: now,
          updatedAt: now,
        });
      }
      signal.status = 'shortlisted';
      signal.updatedAt = now;
      writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'tenant_demand_shortlisted', targetType: 'tenant_demand', targetId: signal.id, metadata: { area: signal.area, roleType: signal.roleType, targetId }, createdAt: now });
      addReputationEvent(writeableDb, writeUser.id, 'market_introduction_shortlisted', 3, signal.id);
      addNotification(writeableDb, writeUser.id, 'landlord_pipeline', 'Demand shortlisted.', 'This signal is now part of your RentEazy property pipeline.');
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 404), result);
    return send(res, 200, result);
  }

  if (method === 'POST' && pathname === '/api/deals/watchlist') {
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const dealPostId = String(body.dealPostId || '').trim();
      const dealPost = writeableDb.posts.find((item) => item.id === dealPostId);
      if (!dealPost) return { error: 'deal_post_not_found' };
      const now = new Date().toISOString();
      const existing = writeableDb.dealWatchlist.find((item) => item.userId === writeUser.id && item.dealPostId === dealPostId);
      if (existing) {
        existing.status = 'watching';
        existing.updatedAt = now;
      } else {
        writeableDb.dealWatchlist.unshift({
          id: createId('watch'),
          userId: writeUser.id,
          dealPostId,
          dealType: dealPost.postType,
          area: dealPost.area,
          strategy: String(body.strategy || dealPost.tags?.join(', ') || 'Rental-market opportunity'),
          status: 'watching',
          score: Number(body.score || 70),
          reasonBadges: Array.isArray(body.reasonBadges) ? body.reasonBadges.slice(0, 4) : ['Relevant role', 'Fresh signal'],
          notes: String(body.notes || `Watch ${dealPost.title} and track next steps.`),
          createdAt: now,
          updatedAt: now,
        });
      }
      writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'deal_added_to_watchlist', targetType: 'post', targetId: dealPostId, metadata: { postType: dealPost.postType, area: dealPost.area }, createdAt: now });
      addNotification(writeableDb, writeUser.id, 'deal_watchlist', 'Deal added to watchlist.', 'RentEazy will keep this deal signal in your professional pipeline.');
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 404), result);
    return send(res, 201, result);
  }

  const dealStatusMatch = pathname.match(/^\/api\/deals\/watchlist\/([^/]+)\/status$/);
  if ((method === 'POST' || method === 'PATCH') && dealStatusMatch) {
    const [, watchId] = dealStatusMatch;
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const watchItem = writeableDb.dealWatchlist.find((item) => item.id === watchId && (item.userId === writeUser.id || item.userId === demoUserId));
      if (!watchItem) return { error: 'watch_item_not_found' };
      const now = new Date().toISOString();
      watchItem.status = String(body.status || 'reviewing').trim();
      watchItem.updatedAt = now;
      writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'deal_watch_status_updated', targetType: 'deal_watch', targetId: watchItem.id, metadata: { status: watchItem.status, dealPostId: watchItem.dealPostId }, createdAt: now });
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 404), result);
    return send(res, 200, result);
  }

  if (method === 'POST' && pathname === '/api/operator/signals') {
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const area = String(body.area || '').trim();
      if (!area) return { error: 'operator_area_required' };
      const now = new Date().toISOString();
      const signal = {
        id: createId('operator-signal'),
        operatorId: writeUser.id,
        area,
        propertyType: String(body.propertyType || 'Mixed property types').trim(),
        model: String(body.model || 'Management').trim(),
        unitsTracked: Number(body.unitsTracked || 0),
        occupancySignal: String(body.occupancySignal || 'New operator signal').trim(),
        landlordDemandCount: Number(body.landlordDemandCount || 0),
        investorBriefCount: Number(body.investorBriefCount || 0),
        complianceStatus: String(body.complianceStatus || 'Ready to verify').trim(),
        nextAction: String(body.nextAction || 'Connect suitable landlords, investors, and sourcers.').trim(),
        createdAt: now,
        updatedAt: now,
      };
      writeableDb.operatorPortfolioSignals.unshift(signal);
      writeableDb.behavioralEvents.unshift({ id: createId('event'), userId: writeUser.id, eventType: 'operator_signal_added', targetType: 'operator_signal', targetId: signal.id, metadata: { area: signal.area, model: signal.model }, createdAt: now });
      addReputationEvent(writeableDb, writeUser.id, 'operator_signal_added', 3, signal.id);
      addNotification(writeableDb, writeUser.id, 'operator_signal', 'Operator signal saved.', 'Your areas and model can now improve matching across the Feed.');
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 400), result);
    return send(res, 201, result);
  }

  const notificationReadMatch = pathname.match(/^\/api\/notifications\/([^/]+)\/read$/);
  if (method === 'POST' && notificationReadMatch) {
    const [, notificationId] = notificationReadMatch;
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      const notification = writeableDb.notifications.find((item) => item.id === notificationId && item.userId === writeUser.id);
      if (!notification) return { error: 'notification_not_found' };
      notification.read = true;
      notification.readAt = new Date().toISOString();
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 404), result);
    return send(res, 200, result);
  }

  if (method === 'POST' && pathname === '/api/events') {
    const body = await readBody(req);
    const result = await updateDb(async (writeableDb) => {
      ensureCollections(writeableDb);
      const writeUser = await currentUser(req, writeableDb);
      if (!writeUser) return { error: 'auth_required' };
      writeableDb.behavioralEvents.unshift({
        id: createId('event'),
        userId: writeUser.id,
        eventType: String(body.eventType || 'unknown'),
        targetType: String(body.targetType || 'app'),
        targetId: String(body.targetId || ''),
        metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : {},
        createdAt: new Date().toISOString(),
      });
      return compactState(writeableDb, writeUser.id);
    });
    if (result.error) return send(res, errorStatus(result, 400), result);
    return send(res, 201, result);
  }

  if (method === 'GET' && pathname === '/api/admin/moderation') {
    return send(res, 200, { reports: db.reports, hiddenPosts: db.hiddenPosts, sponsoredPosts: db.posts.filter((post) => post.sponsoredStatus) });
  }

  return notFound(res);
}

export function createRentEazyApiServer() {
  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
      const url = new URL(req.url, `http://${req.headers.host}`);
      const key = `${req.method} ${url.pathname}`;
      if (routes[key]) return routes[key](req, res);
      return handleDynamic(req, res, req.method, url.pathname);
    } catch (error) {
      if (isConnectionAbort(error) || req.destroyed || res.destroyed) return;
      console.error(error);
      send(res, 500, { error: 'server_error', message: error.message });
    }
  });

  server.on('clientError', (error, socket) => {
    if (isConnectionAbort(error)) return;
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });

  return server;
}

process.on('unhandledRejection', (error) => {
  if (isConnectionAbort(error)) return;
  console.error(error);
});

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const server = createRentEazyApiServer();
  server.listen(port, () => {
    console.log(`RentEazy API listening on http://127.0.0.1:${port}`);
  });
}
