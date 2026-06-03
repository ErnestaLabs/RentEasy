import React, { useEffect, useMemo, useRef, useState } from 'react';
import "iconify-icon";
import { motion } from 'framer-motion';
import { PricingTable, SignIn, SignInButton, SignUp, SignUpButton, UserButton, useAuth, useUser } from '@clerk/react';
import IPhoneMockup from '@/components/ui/iphone-mockup';
import Marquee from '@/components/ui/marquee';
import { NumberTicker } from '@/components/ui/number-ticker';
import { BorderBeam } from '@/components/ui/border-beam';
import RentEazyVoiceAgent from '@/components/voice/RentEazyVoiceAgent';
// Code-split the VSL: Remotion is ~400KB and sits below the fold, so it must
// not block the hero paint. Loads lazily when the user scrolls toward it.
const VSLPlayer = React.lazy(() => import('@/components/vsl/VSLPlayer'));
import { ArrowDownLeft, ArrowUp, BadgeCheck, Bell, Bookmark, CalendarCheck, Camera, Check, Compass, Copy, Flag, Flame, Gift, Heart, Home, MapPin, Megaphone, MessageCircle, PlusCircle, RotateCcw, Search, Send, Share2, ShieldCheck, Sparkles, Star, UserPlus, UserRound, Users } from 'lucide-react';

const defaultRotatingHeroWords = ['tenant', 'agent', 'room', 'home', 'flat', 'landlord', 'match', 'place'];
const localSocialAppUrl = 'http://localhost:3002';
const productionSocialAppUrl = 'https://renteazy.co.uk';

function resolveSocialAppUrl() {
  const configuredUrl = import.meta.env.VITE_RENTEAZY_APP_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return localSocialAppUrl;
  }

  return productionSocialAppUrl;
}

const appFeedUrl = '/app/feed';
const socialAppUrl = appFeedUrl;
const socialSignupUrl = '/signup';
const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
let clerkTokenProvider = null;

function setClerkTokenProvider(provider) {
  clerkTokenProvider = provider;
}

const clerkAppearance = {
  variables: {
    colorPrimary: '#2f7d32',
    colorBackground: '#ffffff',
    colorText: '#0f172a',
    colorInputBackground: '#ffffff',
    borderRadius: '1rem',
    fontFamily: 'Inter, sans-serif',
  },
  elements: {
    cardBox: 'shadow-none border-0',
    card: 'shadow-none border-0 p-0',
    headerTitle: 'text-slate-950',
    headerSubtitle: 'text-slate-500',
    formButtonPrimary: 'bg-[#2f7d32] hover:bg-[#276b2b]',
    footerActionLink: 'text-[#2f7d32]',
  },
};

const navLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Feed', href: '#feed' },
  { label: 'Matching', href: '#marketplace' },
  { label: 'Swipe', href: '#swipe-ui' },
  { label: 'Pricing', href: '#pricing' },
];

const profileFields = [
  'Budget',
  'Preferred areas',
  'Move date',
  'Property type',
  'Room needs',
  'Pets',
  'Viewing availability',
  'Must-haves',
];

const demoVisuals = [
  ['#0b2a4a', '#4db23f', 'solar:home-smile-bold'],
  ['#16466f', '#8fd0ff', 'solar:bed-bold'],
  ['#11375f', '#55b85a', 'solar:buildings-bold'],
  ['#23314f', '#75c7f0', 'solar:sofa-bold'],
  ['#0f3b35', '#95d66f', 'solar:key-bold'],
  ['#17304d', '#5ba7f2', 'solar:city-bold'],
  ['#1d3658', '#58c177', 'solar:bedside-table-3-bold'],
  ['#0c2d4d', '#7fd6ff', 'solar:home-wifi-bold'],
  ['#233646', '#88d36f', 'solar:lamp-bold'],
  ['#12385f', '#5ec58a', 'solar:map-point-wave-bold'],
  ['#17324f', '#92ccff', 'solar:bed-bold'],
  ['#15364a', '#5bbd8b', 'solar:waterdrops-bold'],
  ['#0d3148', '#8ccfff', 'solar:garage-bold'],
  ['#1b2f55', '#68d391', 'solar:buildings-3-bold'],
  ['#27324f', '#a3d86d', 'solar:chair-2-bold'],
  ['#0c344b', '#57b7ff', 'solar:home-bold'],
  ['#183451', '#5fd18d', 'solar:users-group-rounded-bold'],
  ['#102e52', '#83c5ff', 'solar:buildings-bold'],
  ['#213551', '#8adf80', 'solar:bed-bold'],
  ['#26314f', '#6ec4ff', 'solar:sofa-bold'],
  ['#0e3a42', '#7bd774', 'solar:user-plus-rounded-bold'],
  ['#17305a', '#61c4ff', 'solar:users-group-two-rounded-bold'],
  ['#243550', '#9bd383', 'solar:notebook-bookmark-bold'],
  ['#10324e', '#65d199', 'solar:user-heart-bold'],
  ['#25324c', '#85ccff', 'solar:pet-bold'],
  ['#15384f', '#7bd57c', 'solar:bed-bold'],
  ['#1d3458', '#5dbbff', 'solar:buildings-2-bold'],
  ['#16364b', '#90d66b', 'solar:bedside-table-2-bold'],
  ['#213658', '#6ac8ff', 'solar:home-2-bold'],
  ['#12364f', '#82d57a', 'solar:garage-bold'],
];

const demoImageSources = [
  '/images/match-flat.jpg',
  '/images/match-room.jpg',
  '/images/match-flat-2.jpg',
  '/images/match-room-2.jpg',
  '/images/match-demo-01.jpg',
  '/images/match-flat-3.jpg',
  '/images/match-demo-02.jpg',
  '/images/match-flat-4.jpg',
  '/images/match-demo-03.jpg',
  '/images/match-demo-04.jpg',
  '/images/match-demo-05.jpg',
  '/images/canary-wharf-studio-kitchen.jpg',
  '/images/match-demo-06.jpg',
  '/images/match-demo-07.jpg',
  '/images/match-demo-08.jpg',
  '/images/match-demo-09.jpg',
  '/images/match-demo-10.jpg',
  '/images/match-demo-11.jpg',
  '/images/match-demo-12.jpg',
  '/images/match-demo-13.jpg',
  '/images/match-tenant.jpg',
  '/images/match-agent.jpg',
  '/images/match-demo-14.jpg',
  '/images/match-demo-15.jpg',
  '/images/match-demo-16.jpg',
  '/images/match-demo-17.jpg',
  '/images/match-demo-18.jpg',
  '/images/match-demo-19.jpg',
  '/images/match-demo-20.jpg',
  '/images/match-demo-21.jpg',
];

const demoImagePositions = [
  '74% center',
  'center',
  '48% center',
  'center',
  '58% center',
  'center',
  '42% center',
  '62% center',
  '55% center',
  '48% center',
  '56% center',
  'center',
  '45% center',
  '60% center',
  '50% center',
  '54% center',
  '58% center',
  '46% center',
  '52% center',
  '56% center',
  'center top',
  'center top',
  'center top',
  'center top',
  'center top',
  '52% center',
  '56% center',
  '48% center',
  '50% center',
  '55% center',
];

const demoCardData = [
  ['stratford-1-bed', 'flat', 'Stratford 1-bed', 'Stratford', '£1,650 pcm', 88, 'Available 12 June', '8 min walk to station', ['Budget fit', 'No red flags', 'Viewing slots']],
  ['canary-wharf-room', 'room', 'Canary Wharf room', 'Canary Wharf', '£940 pcm', 91, 'Available now', 'Bills included, riverside share', ['Bills fit', 'Commute fit', 'Room ready']],
  ['wembley-studio', 'studio', 'Wembley studio', 'Wembley', '£1,390 pcm', 84, 'New build', 'Gym access and concierge', ['Studio', 'New build', 'Budget fit']],
  ['camden-flatshare', 'room', 'Camden flatshare', 'Camden', '£1,050 pcm', 86, 'Ensuite', 'Two flatmates, Northern line', ['Ensuite', 'Buddy fit', 'North London']],
  ['shoreditch-loft-room', 'room', 'Shoreditch loft room', 'Shoreditch', '£1,120 pcm', 89, 'Loft room', 'Creative share near Old Street', ['Loft', 'Area fit', 'Social']],
  ['greenwich-riverside-flat', 'flat', 'Greenwich riverside flat', 'Greenwich', '£1,720 pcm', 90, 'New today', 'Balcony, 2 min to DLR', ['Balcony', 'Commute fit', 'River view']],
  ['brixton-double-room', 'room', 'Brixton double room', 'Brixton', '£875 pcm', 83, 'Move next week', 'Double room near Victoria line', ['Budget win', 'Tube close', 'Room fit']],
  ['hackney-2-bed', 'flat', 'Hackney 2-bed', 'Hackney', '£2,150 pcm', 92, 'Viewing Friday', 'Bright split-level home', ['2-bed', 'Viewing slot', 'Area exact']],
  ['ealing-studio', 'studio', 'Ealing studio', 'Ealing', '£1,310 pcm', 85, 'Available July', 'Elizabeth line nearby', ['Studio', 'Commute fit', 'Good value']],
  ['clapham-garden-flat', 'flat', 'Clapham garden flat', 'Clapham', '£1,880 pcm', 87, 'Garden', 'Private patio, common nearby', ['Garden', 'Pet maybe', 'South West']],
  ['islington-room', 'room', 'Islington room', 'Islington', '£980 pcm', 91, 'Bills included', 'Quiet house, Angel nearby', ['Quiet home', 'Bills fit', 'Area fit']],
  ['canada-water-1-bed', 'flat', 'Canada Water 1-bed', 'Canada Water', '£1,760 pcm', 89, 'Available now', 'Jubilee line, modern block', ['Commute fit', 'Modern', 'Budget fit']],
  ['bethnal-green-studio', 'studio', 'Bethnal Green studio', 'Bethnal Green', '£1,540 pcm', 84, 'Fresh listing', 'Bills separate, furnished', ['Studio', 'Furnished', 'Move date fit']],
  ['elephant-castle-flat', 'flat', 'Elephant & Castle flat', 'Elephant & Castle', '£1,820 pcm', 88, 'High floor', 'City views, fast commute', ['High floor', 'Fast commute', 'Managed']],
  ['hammersmith-room', 'room', 'Hammersmith room', 'Hammersmith', '£990 pcm', 82, 'Flexible move', 'Riverside share, Zone 2', ['Flexible', 'Room fit', 'Zone 2']],
  ['croydon-2-bed', 'house', 'Croydon 2-bed', 'Croydon', '£1,550 pcm', 86, 'Family fit', 'Garden and parking', ['Garden', 'Parking', 'Good value']],
  ['deptford-house-share', 'house', 'Deptford house share', 'Deptford', '£820 pcm', 90, 'Room open', 'Four-bed house, social kitchen', ['House share', 'Budget win', 'Social']],
  ['finsbury-park-flat', 'flat', 'Finsbury Park flat', 'Finsbury Park', '£1,690 pcm', 87, 'Verified source', 'Piccadilly line, furnished', ['Verified', 'Furnished', 'Commute fit']],
  ['bow-landlord-opportunity', 'landlord', 'Bow landlord opportunity', 'East London', 'Tenant or operator wanted', 85, 'Flexible instruction', 'Owner open to direct or agent route', ['Landlord card', 'Operator possible', 'Agent option']],
  ['shepherds-bush-studio', 'studio', "Shepherd's Bush studio", "Shepherd's Bush", '£1,470 pcm', 83, 'Available soon', 'Westfield nearby, furnished', ['Studio', 'West London', 'Furnished']],
  ['find-house-buddy', 'buddy', 'Find a house buddy', 'East London', '£950 budget', 92, 'Buddy ready', 'Clean, quiet, move in July', ['Buddy match', 'Quiet home', 'July move']],
  ['east-london-buddy-up', 'buddy', 'East London buddy-up', 'Hackney / Bow', '£1,050 budget', 89, 'Pair search', 'Looking for 2-bed together', ['Buddy-up', '2-bed need', 'Area match']],
  ['student-flatmate-match', 'buddy', 'Student flatmate match', 'Bloomsbury', '£850 budget', 86, 'Student profile', 'Needs room near UCL', ['Student', 'Room search', 'Budget fit']],
  ['professional-house-buddy', 'buddy', 'Professional house buddy', 'Zone 2', '£1,100 budget', 91, 'Ready to view', 'Hybrid worker, quiet home', ['Professional', 'Quiet home', 'Ready now']],
  ['shoreditch-short-stay', 'short stay', 'Shoreditch short stay', 'Shoreditch', '£89/night', 88, '3-night minimum', 'Flexible furnished stay near Old Street', ['Short-term', 'Bills included', 'Flexible']],
  ['manchester-serviced-stay', 'short stay', 'Manchester serviced stay', 'Manchester', '£620/week', 87, 'Available this month', 'Corporate and relocation stays', ['Serviced', 'Weekly price', 'Flexible stay']],
  ['birmingham-jq-flat', 'flat', 'Birmingham Jewellery Quarter flat', 'Birmingham', '£1,050 pcm', 84, 'New today', 'Warehouse-style 1-bed', ['Warehouse style', 'Central', 'Budget fit']],
  ['operator-offer-west-london', 'operator', 'West London operator offer', 'West London', 'Management or co-hosting', 90, 'Taking landlord intros', 'Serviced accommodation operator', ['Operator', 'Host support', 'Track record']],
  ['leeds-student-house', 'house', 'Leeds student house', 'Leeds', '£625 pcm', 86, 'Student house', 'Four-bed near Headingley', ['Student', 'House share', 'Good value']],
  ['investor-sourcer-brief', 'investor', 'Investor brief: North West', 'Manchester / Liverpool', '£250k-£450k budget', 89, 'Sourcer wanted', 'Buy-to-let and serviced options', ['Investor brief', 'Sourcer match', 'Strategy fit']],
];

const heroSwipeCards = demoCardData.map(([id, type, title, location, price, matchScore, availability, detailLine, badges], index) => {
  const [from, to, icon] = demoVisuals[index % demoVisuals.length];
  return {
    id,
    type,
    title,
    location,
    price,
    matchScore,
    availability,
    detailLine,
    badges,
    imageSrc: demoImageSources[index],
    imageAlt: `${title} demo card`,
    imagePosition: demoImagePositions[index] || (type === 'buddy' ? 'center top' : 'center'),
    visual: { from, to, icon, index },
  };
});

const accounts = [
  {
    icon: 'solar:user-rounded-linear',
    title: 'Tenants and buddies',
    text: 'Create a profile for a room, flat, home, short-term stay, or buddy match, with budget, areas, move date, must-haves, and viewing availability.',
    items: ['Swipe homes, rooms, stays', 'Match house buddies', 'See reputation behind offers', 'Request viewing'],
  },
  {
    icon: 'solar:buildings-linear',
    title: 'Letting agents',
    text: 'Create an agency profile, add homes and rooms, match tenants, buddy groups, landlords, and properties, then move the right people into viewing flow.',
    items: ['Swipe tenants and landlords', 'Add properties free', 'Boost suitable listings', 'Paid seats for staff'],
  },
  {
    icon: 'solar:home-smile-linear',
    title: 'Private landlords',
    text: 'Create a landlord profile, add homes or rooms, match tenants, buddy groups, and agents, then choose whether to progress directly or through an agent.',
    items: ['Swipe tenants, buddies, agents', 'Invite people to view', 'Request agent intro', 'Boost suitable listings'],
  },
];

const discoveryModes = [
  { role: 'Tenants and buddies', modes: ['Homes', 'Rooms', 'Buddies', 'Short-term stays', 'Liked You', 'Viewing Invites'] },
  { role: 'Agents', modes: ['Tenants', 'Buddy groups', 'Landlords', 'Properties', 'Liked You', 'Matches', 'Viewing Ready'] },
  { role: 'Landlords', modes: ['Tenants', 'Buddy groups', 'Agents', 'Liked You', 'Matches', 'Homes', 'Rooms'] },
];

const filters = [
  { role: 'Tenant filters', items: ['Area', 'Budget', 'Bedrooms', 'Availability', 'Pets', 'Bills', 'Source type', 'Match score'] },
  { role: 'Agent filters', items: ['Budget', 'Move date', 'Tenant type', 'Guarantor', 'Pets', 'Urgency', 'Profile strength', 'Superlike'] },
  { role: 'Landlord filters', items: ['Tenant budget', 'Move date', 'Pets', 'Household size', 'Agent coverage', 'Agent rating', 'Match score', 'Response rating'] },
];

const swipeCards = [
  {
    role: 'Tenant viewing property',
    title: 'Stratford 1-bed',
    details: ['£1,650 pcm', '88% match', 'Available 12 June', '8 min walk to station'],
    badges: ['Budget fit', 'No red flags', 'Viewing slots this week'],
    buttons: ['Pass', 'Like', 'Superlike'],
  },
  {
    role: 'Agent viewing tenant',
    title: 'Tenant brief #2841',
    details: ['Budget: £1,650-£1,900 pcm', 'Move date: Within 30 days', 'Area: Stratford / Canary Wharf', 'Profile strength: 86%'],
    badges: ['Viewing-ready', 'Budget confirmed', 'Strong fit'],
    buttons: ['Pass', 'Like', 'Invite to View'],
  },
  {
    role: 'Landlord viewing agent',
    title: 'East London Lettings Team',
    details: ['Areas: Stratford, Canary Wharf, Bow', 'Response rating: 4.8', 'Tenant demand: High'],
    badges: ['Area match', 'Paid seat', 'Verified'],
    buttons: ['Pass', 'Like', 'Request Intro'],
  },
];

const matchTypes = [
  'Tenant ↔ Property',
  'Tenant ↔ Buddy',
  'Tenant ↔ Short-Term Stay',
  'Landlord ↔ Tenant',
  'Landlord ↔ Agent',
  'Agent ↔ Landlord',
  'Operator ↔ Landlord',
  'Sourcer ↔ Investor',
  'Investor ↔ Opportunity',
];

// Icon + colour per role so every match-type pair renders as a real visual,
// not an empty text pill.
const matchRoleIcon = {
  Tenant: ['solar:user-rounded-bold', '#93c5fd'],
  Property: ['solar:home-smile-bold', '#9bd383'],
  Buddy: ['solar:users-group-rounded-bold', '#93c5fd'],
  'Short-Term Stay': ['solar:bed-bold', '#5bc4ff'],
  Landlord: ['solar:key-bold', '#fbbf24'],
  Agent: ['solar:buildings-bold', '#9bd383'],
  Operator: ['solar:case-round-bold', '#9bd383'],
  Sourcer: ['solar:magnifer-bold', '#93c5fd'],
  Investor: ['solar:graph-up-bold', '#9bd383'],
  Opportunity: ['solar:buildings-2-bold', '#5bc4ff'],
};

const paidMechanics = [
  {
    title: 'Boost',
    text: 'Lift a suitable listing inside relevant decks. Reach people already looking — not random traffic.',
    icon: 'solar:rocket-linear',
  },
  {
    title: 'Superlikes',
    text: 'Send a stronger signal when a match is too good to leave to chance.',
    icon: 'solar:star-fall-linear',
  },
  {
    title: 'Who Liked You',
    text: 'See real interest instead of guessing. Know who is already ready to talk.',
    icon: 'solar:eye-linear',
  },
  {
    title: 'Priority',
    text: 'Stronger filters, daily picks, and better visibility for the profiles and listings that fit.',
    icon: 'solar:ranking-linear',
  },
  {
    title: 'Protect',
    text: 'A neutral timestamped record of matches, viewings, and agreed terms. Keep the process clear.',
    icon: 'solar:shield-check-linear',
  },
];

const productLadder = [
  {
    name: 'Individual Yearly',
    price: '£69.99 first year',
    note: 'Then £99.99/year',
    desc: 'Best value for serious movers. Lock in before the price rises.',
    cta: 'Get Yearly Launch Price',
    href: '#pricing',
    featured: true,
    features: ['About 19p/day first year', 'Save £44.89 vs monthly', 'See who liked you', 'Advanced filters', 'Daily picks', 'Superlikes included', 'Better visibility', 'Profile/listing insights'],
  },
  {
    name: 'Individual Monthly',
    price: '£4.99 first month',
    note: 'Then £9.99/month',
    desc: 'For tenants, buddies, landlords, and solo agents.',
    cta: 'Start for £4.99',
    href: '#match',
    features: ['See who liked you', 'Swipe-based matching', 'Advanced filters', 'Daily picks', 'Superlikes included', 'Better visibility', 'Match scores', 'Profile/listing insights'],
  },
  {
    name: 'Free Feed',
    price: '£0',
    desc: 'For everyone. Start here.',
    cta: 'Join Free',
    href: socialSignupUrl,
    features: ['Create profile', 'Browse Feed', 'Post to Feed', 'Basic swipes', 'Basic likes', 'Blurred Who Liked You', 'Basic filters', 'Follow and save'],
  },
  {
    name: 'Business Yearly Seats',
    price: '£69.99 first year per seat',
    note: 'Then £99.99/year per seat',
    desc: 'Volume discounts for larger teams.',
    cta: 'Get Team Yearly',
    href: '#pricing',
    features: ['Yearly seat access', 'Shared business profile', 'Team seat management', 'Advanced filters', 'Superlikes included', 'Boost access', 'Volume discounts'],
  },
  {
    name: 'Agency / Business Monthly',
    price: '£4.99 first month per seat',
    note: 'Then £9.99/month per seat',
    desc: 'For agencies, teams, and multi-seat operators.',
    cta: 'Add Seats',
    href: '#partners',
    features: ['Staff seats', 'Shared business profile', 'Advanced filters', 'Who liked you', 'Screened demand', 'Landlord/property discovery', 'Superlikes included', 'Boost access', 'Profile/listing insights'],
  },
  {
    name: 'Protect',
    price: 'From £0.99/month',
    note: 'Protect Plus at £2.99/month',
    desc: 'For everyone.',
    cta: 'Add Protect',
    href: '#pricing',
    features: ['Neutral timestamped record', 'Match/viewing history', 'Agreed terms trail', 'Dispute notes', 'Basic export', 'Protect Plus option'],
  },
];

const volumeDiscounts = [
  { title: 'Monthly seats', rows: ['5+ seats: 5% off', '20+ seats: 10% off', '50+ seats: 15% off', '100+ seats: 20% off'] },
  { title: 'Yearly seats', rows: ['5+ seats: 10% off', '20+ seats: 15% off', '50+ seats: 20% off', '100+ seats: 30% off'] },
];

const conciergeFeatures = [
  'Manual brief review',
  'Suitable option vetting',
  'Viewing scheduling',
  'Offer and negotiation support',
  'Representation support by request',
  'Tailored quote',
];

const faqs = [
  {
    q: 'Who can use RentEazy?',
    a: 'Tenants, buddies, landlords, solo agents, agencies, and teams can all create profiles. The point is simple: everyone can find the people, homes, rooms, and partners they need.',
    icon: 'solar:users-group-rounded-linear',
  },
  {
    q: 'Can everyone swipe?',
    a: 'Yes. Tenants and buddies can swipe homes, rooms, short-term stays, and house buddy profiles. Agent and landlord reputation appears behind the property or offer. Landlords can swipe tenants, buddy groups, agents, and operator offers. Agents can swipe tenants, landlords, and suitable property opportunities.',
    icon: 'solar:slider-horizontal-linear',
  },
  {
    q: 'Is RentEazy like swiping for rentals?',
    a: 'Yes. RentEazy Match lets people review suitable homes, rooms, stays, buddy profiles, tenants, agent services, landlord opportunities, and investment/operator opportunities one at a time, then save what fits and pass what does not.',
    icon: 'solar:smartphone-linear',
  },
  {
    q: 'Can landlords and agents like tenants first?',
    a: 'Yes. Landlords and agents can like suitable tenant or buddy-group profiles first, just as tenants and buddies can like homes, rooms, stays, and buddy profiles first.',
    icon: 'solar:hand-heart-linear',
  },
  {
    q: 'What happens when both sides match?',
    a: 'A match means both sides are interested enough to progress. It does not guarantee a tenancy, viewing, or approval. Final approval still depends on referencing, affordability, availability, landlord or agent decision, and contract terms.',
    icon: 'solar:link-round-angle-linear',
  },
  {
    q: 'Can I use filters?',
    a: 'Yes. RentEazy uses filters and match scoring so each profile can narrow the deck by budget, area, move date, property type, household needs, availability, and suitability.',
    icon: 'solar:tuning-2-linear',
  },
  {
    q: 'What are Superlikes?',
    a: 'Superlikes are stronger signals than normal likes. They help someone highlight a home, room, stay, buddy profile, tenant, service offer, or opportunity they are especially interested in.',
    icon: 'solar:star-linear',
  },
  {
    q: 'What is Boost?',
    a: 'Boost increases visibility to suitable matches only. It does not override match quality, profile fit, or final decisions.',
    icon: 'solar:rocket-linear',
  },
  {
    q: 'Are profiles fully referenced?',
    a: 'Not unless a separate referencing process is completed. RentEazy can collect useful profile details such as budgets, move dates, requirements, and viewing availability to improve match quality.',
    icon: 'solar:shield-check-linear',
  },
  {
    q: 'Can paid landlords or agents override suitability?',
    a: 'No. Paid boosts, profiles, and seats improve visibility only when there is a genuine fit. They do not override match quality, suitability, or final tenancy decisions.',
    icon: 'solar:verified-check-linear',
  },
  {
    q: 'Is RentEazy a letting agency?',
    a: 'No. RentEazy is not a traditional letting agency. We do not own, manage, or guarantee properties. We help people, landlords, agents, agencies, and teams find better-fit matches.',
    icon: 'solar:info-circle-linear',
  },
  {
    q: 'Who counts as an individual?',
    a: 'Tenants, buddies, landlords, individual agents, and solo agents use individual pricing. Individual plans are paid per profile.',
    icon: 'solar:user-id-linear',
  },
  {
    q: 'How are agencies and businesses charged?',
    a: 'A business or agency profile can start free. Paid agency and business access is charged per staff seat, using the same base price as individual profiles.',
    icon: 'solar:case-round-linear',
  },
  {
    q: 'Do teams get volume discounts?',
    a: 'Yes. Larger teams get automatic seat discounts. Monthly discounts start at 5 seats, and yearly discounts are higher.',
    icon: 'solar:tag-price-linear',
  },
];

const feedTabs = [
  'For You',
  'Properties',
  'Looking',
  'House Buddies',
  'Short-Term',
  'Agents',
  'Landlords',
  'Operators',
  'Sourcers',
  'Investors',
  'Advice',
  'Groups',
  'Perks',
  'Following',
];

const postTypes = [
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

const reportReasons = [
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

const roleOptions = [
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

const microProducts = [
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

const currentUser = {
  id: 'demo-user',
  name: 'RentEazy member',
  role: '',
};

const defaultUsageLimit = {
  id: 'daily-swipes-demo-user',
  userId: currentUser.id,
  limitType: 'daily_swipes',
  period: 'day',
  used: 0,
  allowance: 8,
  resetsAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
};

const defaultAppStreak = {
  id: 'streak-demo-user',
  userId: currentUser.id,
  streakType: 'daily_app_open',
  count: 1,
  lastActivityAt: new Date().toISOString(),
};

const defaultAppProfile = {
  id: currentUser.id,
  name: currentUser.name,
  role: currentUser.role,
  area: '',
  budget: '',
  moveDate: '',
  lookingFor: '',
};

const matchingQuestions = {
  Tenant: [
    { id: 'tenant-budget', category: 'Budget', prompt: 'What budget should RentEazy match you around?', answerType: 'text', weight: 18, isRequired: true, isAdvanced: false, options: [] },
    { id: 'tenant-areas', category: 'Area', prompt: 'Which areas should appear first?', answerType: 'text', weight: 18, isRequired: true, isAdvanced: false, options: [] },
    { id: 'tenant-move-date', category: 'Timing', prompt: 'When do you want to move?', answerType: 'choice', weight: 14, isRequired: true, isAdvanced: false, options: ['ASAP', '2-4 weeks', '1-2 months', 'Flexible'] },
    { id: 'tenant-must-haves', category: 'Fit', prompt: 'What are your must-haves?', answerType: 'text', weight: 12, isRequired: false, isAdvanced: false, options: [] },
    { id: 'tenant-deal-breakers', category: 'Fit', prompt: 'Any deal-breakers?', answerType: 'text', weight: 12, isRequired: false, isAdvanced: true, options: [] },
  ],
  'House Buddy': [
    { id: 'buddy-budget', category: 'Budget', prompt: 'What is your comfortable monthly budget?', answerType: 'text', weight: 18, isRequired: true, isAdvanced: false, options: [] },
    { id: 'buddy-areas', category: 'Area', prompt: 'Where would you team up for a home?', answerType: 'text', weight: 16, isRequired: true, isAdvanced: false, options: [] },
    { id: 'buddy-home-style', category: 'Lifestyle', prompt: 'What home style fits you best?', answerType: 'choice', weight: 14, isRequired: true, isAdvanced: false, options: ['Quiet', 'Balanced', 'Social', 'Lively'] },
    { id: 'buddy-cleanliness', category: 'Lifestyle', prompt: 'How should shared spaces be kept?', answerType: 'choice', weight: 12, isRequired: false, isAdvanced: false, options: ['Very tidy', 'Tidy', 'Relaxed'] },
  ],
  Landlord: [
    { id: 'landlord-property', category: 'Property', prompt: 'What type of property are you working with?', answerType: 'text', weight: 18, isRequired: true, isAdvanced: false, options: [] },
    { id: 'landlord-area', category: 'Area', prompt: 'Where is it?', answerType: 'text', weight: 16, isRequired: true, isAdvanced: false, options: [] },
    { id: 'landlord-route', category: 'Goal', prompt: 'Who are you looking for?', answerType: 'choice', weight: 14, isRequired: true, isAdvanced: false, options: ['Tenant', 'Agent', 'Operator', 'Investor'] },
    { id: 'landlord-viewings', category: 'Availability', prompt: 'When can viewings happen?', answerType: 'text', weight: 10, isRequired: false, isAdvanced: false, options: [] },
  ],
  Investor: [
    { id: 'investor-budget', category: 'Budget', prompt: 'What is your investment budget range?', answerType: 'text', weight: 18, isRequired: true, isAdvanced: false, options: [] },
    { id: 'investor-strategy', category: 'Strategy', prompt: 'Which strategy should RentEazy match?', answerType: 'choice', weight: 16, isRequired: true, isAdvanced: false, options: ['Buy-to-let', 'Serviced accommodation', 'Rent-to-rent', 'Mixed'] },
    { id: 'investor-areas', category: 'Area', prompt: 'Which target areas matter?', answerType: 'text', weight: 14, isRequired: true, isAdvanced: false, options: [] },
    { id: 'investor-timeline', category: 'Timing', prompt: 'When are you ready to move?', answerType: 'choice', weight: 10, isRequired: false, isAdvanced: false, options: ['Now', 'This quarter', 'This year', 'Researching'] },
  ],
  General: [
    { id: 'general-goal', category: 'Goal', prompt: 'What are you trying to do on RentEazy?', answerType: 'text', weight: 18, isRequired: true, isAdvanced: false, options: [] },
    { id: 'general-area', category: 'Area', prompt: 'Which area should RentEazy prioritise?', answerType: 'text', weight: 14, isRequired: true, isAdvanced: false, options: [] },
    { id: 'general-timing', category: 'Timing', prompt: 'What timing matters?', answerType: 'text', weight: 10, isRequired: false, isAdvanced: false, options: [] },
  ],
};

const seededFeedPosts = [
  {
    id: 'post-stratford-room',
    authorId: 'agent-eastline',
    authorType: 'Agent',
    authorName: 'Eastline Rooms',
    postType: 'Room',
    title: 'Double room near Stratford station',
    body: 'Bright furnished room in a clean flatshare. Best for someone moving within the next few weeks and wanting a quick viewing slot.',
    media: ['/images/match-room.jpg'],
    area: 'Stratford',
    budget: '£925 pcm',
    tags: ['Bills included', 'Zone 2/3', 'Viewing slots'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-01T11:15:00.000Z',
    updatedAt: '2026-06-01T11:15:00.000Z',
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    shareCount: 0,
  },
  {
    id: 'post-looking-hackney',
    authorId: 'tenant-amelia',
    authorType: 'Tenant',
    authorName: 'Amelia R.',
    postType: 'Looking',
    title: 'Looking for a calm room in Hackney or Bow',
    body: 'Budget up to £1,050. Hybrid worker, tidy, ready to view this week. Open to buddying up for the right two-bed.',
    media: [],
    area: 'Hackney / Bow',
    budget: 'Up to £1,050 pcm',
    tags: ['Ready to view', 'Buddy-up possible', 'Hybrid worker'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-01T09:40:00.000Z',
    updatedAt: '2026-06-01T09:40:00.000Z',
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    shareCount: 0,
  },
  {
    id: 'post-buddy-clapham',
    authorId: 'buddy-nadia',
    authorType: 'House Buddy',
    authorName: 'Nadia K.',
    postType: 'House Buddy',
    title: 'Buddy-up for a two-bed in Clapham',
    body: 'Looking for one person to team up with for a tidy two-bed. I can move from mid-July and prefer somewhere close to Northern line.',
    media: ['/images/match-tenant.jpg'],
    area: 'Clapham',
    budget: '£1,100 each',
    tags: ['Mid-July', 'Two-bed search', 'Northern line'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-05-31T17:25:00.000Z',
    updatedAt: '2026-05-31T17:25:00.000Z',
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    shareCount: 0,
  },
  {
    id: 'post-short-stay-shoreditch',
    authorId: 'host-urbanstay',
    authorType: 'Short-Term Host',
    authorName: 'UrbanStay East',
    postType: 'Short-Term Stay',
    title: 'Flexible Shoreditch stay for relocations',
    body: 'Furnished studio available for short stays while you search properly. Weekly pricing, fast Wi-Fi, and flexible checkout.',
    media: ['/images/match-demo-16.jpg'],
    area: 'Shoreditch',
    budget: 'From £89/night',
    tags: ['Flexible stay', 'Relocation', 'Furnished'],
    visibility: 'public',
    sponsoredStatus: 'Boosted',
    createdAt: '2026-05-31T14:05:00.000Z',
    updatedAt: '2026-05-31T14:05:00.000Z',
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    shareCount: 0,
  },
  {
    id: 'post-landlord-bow',
    authorId: 'landlord-sam',
    authorType: 'Landlord',
    authorName: 'Sam P.',
    postType: 'Landlord Opportunity',
    title: 'Bow landlord open to tenant or agent route',
    body: 'One-bed flat coming up. I am open to a direct tenant match or speaking with a local agent who already has a suitable renter.',
    media: ['/images/match-demo-06.jpg'],
    area: 'Bow',
    budget: '£1,650 pcm guide',
    tags: ['Direct possible', 'Agent intro', 'Available soon'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-05-30T19:30:00.000Z',
    updatedAt: '2026-05-30T19:30:00.000Z',
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    shareCount: 0,
  },
  {
    id: 'post-investor-northwest',
    authorId: 'sourcer-nw',
    authorType: 'Sourcer',
    authorName: 'North West Deals',
    postType: 'Investor Brief',
    title: 'Investor looking for Manchester/Liverpool options',
    body: 'Budget £250k-£450k. Interested in buy-to-let and serviced options with clean numbers and clear area reasoning.',
    media: [],
    area: 'Manchester / Liverpool',
    budget: '£250k-£450k',
    tags: ['Investor brief', 'Sourcer wanted', 'Numbers first'],
    visibility: 'public',
    sponsoredStatus: 'Promoted',
    createdAt: '2026-05-30T12:10:00.000Z',
    updatedAt: '2026-05-30T12:10:00.000Z',
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    shareCount: 0,
  },
  {
    id: 'post-area-insight-canary',
    authorId: 'agent-lena',
    authorType: 'Agent',
    authorName: 'Lena from Dockside',
    postType: 'Area Insight',
    title: 'Canary Wharf rooms are moving fastest under £1,000',
    body: 'If you are looking around Canary Wharf, rooms with bills included under £1,000 are moving quickly. Have your move date and viewing times ready.',
    media: [],
    area: 'Canary Wharf',
    budget: 'Under £1,000 rooms',
    tags: ['Area insight', 'Room search', 'Viewing tip'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-05-29T16:45:00.000Z',
    updatedAt: '2026-05-29T16:45:00.000Z',
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    shareCount: 0,
  },
  {
    id: 'post-agent-update-viewings',
    authorId: 'agent-riverline',
    authorType: 'Agent',
    authorName: 'Riverline Homes',
    postType: 'Agent Update',
    title: 'Saturday viewing slots open in Greenwich',
    body: 'Three rooms and one studio have Saturday viewings available. Best for renters with documents ready and flexible move timing.',
    media: ['/images/match-demo-04.jpg'],
    area: 'Greenwich',
    budget: 'Rooms from £890 pcm',
    tags: ['Viewing slots', 'Documents ready', 'Greenwich'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-05-29T10:20:00.000Z',
    updatedAt: '2026-05-29T10:20:00.000Z',
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    shareCount: 0,
  },
  {
    id: 'post-operator-west-london',
    authorId: 'operator-neststay',
    authorType: 'Operator',
    authorName: 'NestStay Operations',
    postType: 'Operator Offer',
    title: 'West London operator looking for compliant stock',
    body: 'Management and co-hosting routes available for landlords with furnished homes near transport. Clear handover process and monthly reporting.',
    media: ['/images/match-demo-18.jpg'],
    area: 'West London',
    budget: 'Management / co-hosting',
    tags: ['Operator', 'Co-hosting', 'Monthly reporting'],
    visibility: 'public',
    sponsoredStatus: 'Sponsored',
    createdAt: '2026-05-28T18:10:00.000Z',
    updatedAt: '2026-05-28T18:10:00.000Z',
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    shareCount: 0,
  },
  {
    id: 'post-sourcer-deal-leeds',
    authorId: 'sourcer-yorkshire',
    authorType: 'Sourcer',
    authorName: 'Yorkshire Deal Desk',
    postType: 'Sourcer Deal',
    title: 'Leeds student-house brief for active investors',
    body: 'Looking for investors interested in student lets around Headingley and Hyde Park. Numbers-first summaries only, no return guarantees.',
    media: ['/images/match-demo-20.jpg'],
    area: 'Leeds',
    budget: 'Investor brief',
    tags: ['Sourcer', 'Student lets', 'Numbers first'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-05-28T12:05:00.000Z',
    updatedAt: '2026-05-28T12:05:00.000Z',
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    shareCount: 0,
  },
  {
    id: 'post-question-referencing',
    authorId: 'tenant-maya',
    authorType: 'Tenant',
    authorName: 'Maya T.',
    postType: 'Question',
    title: 'What should I prepare before a same-day viewing?',
    body: 'I have a viewing this evening and want to be ready without oversharing. What documents or questions usually help?',
    media: [],
    area: 'London',
    budget: 'Advice needed',
    tags: ['Question', 'Viewing', 'Referencing'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-05-27T17:35:00.000Z',
    updatedAt: '2026-05-27T17:35:00.000Z',
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    shareCount: 0,
  },
  {
    id: 'post-availability-manchester',
    authorId: 'host-citystay',
    authorType: 'Short-Term Host',
    authorName: 'CityStay Manchester',
    postType: 'Availability',
    title: 'Relocation stay open from Monday',
    body: 'Furnished one-bed available weekly for relocations while you search longer-term. Bills included and flexible extension possible.',
    media: ['/images/match-demo-16.jpg'],
    area: 'Manchester',
    budget: '£620/week',
    tags: ['Availability', 'Relocation', 'Bills included'],
    visibility: 'public',
    sponsoredStatus: 'Promoted',
    createdAt: '2026-05-27T09:55:00.000Z',
    updatedAt: '2026-05-27T09:55:00.000Z',
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    shareCount: 0,
  },
];

const seededGroups = [
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
    createdAt: '2026-06-01T08:00:00.000Z',
    updatedAt: '2026-06-01T08:00:00.000Z',
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
    createdAt: '2026-06-01T08:10:00.000Z',
    updatedAt: '2026-06-01T08:10:00.000Z',
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
    createdAt: '2026-06-01T08:20:00.000Z',
    updatedAt: '2026-06-01T08:20:00.000Z',
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
    createdAt: '2026-06-01T08:30:00.000Z',
    updatedAt: '2026-06-01T08:30:00.000Z',
  },
];

const seededPartnerOffers = [
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
    createdAt: '2026-06-01T08:40:00.000Z',
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
    createdAt: '2026-06-01T08:50:00.000Z',
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
    createdAt: '2026-06-01T09:00:00.000Z',
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
    createdAt: '2026-06-01T09:10:00.000Z',
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
    createdAt: '2026-06-01T09:20:00.000Z',
  },
];

const seededFeedAds = [
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
    createdAt: '2026-06-01T09:30:00.000Z',
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
    createdAt: '2026-06-01T09:40:00.000Z',
  },
];

const seededMatches = [
  {
    id: 'match-demo-stratford',
    participantIds: [currentUser.id, 'agent-eastline'],
    participantNames: [currentUser.name, 'Eastline Rooms'],
    participantTypes: ['Member', 'Agent'],
    subjectType: 'post',
    subjectId: 'post-stratford-room',
    subjectTitle: 'Double room near Stratford station',
    status: 'matched',
    score: 88,
    reasonBadges: ['Budget fit', 'Area fit', 'Viewing slots', 'No deal-breaker conflict'],
    missingInfo: ['Confirm move date'],
    openedBy: 'mutual_interest',
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
  },
];

const seededMatchMessages = [
  {
    id: 'message-demo-stratford-1',
    matchId: 'match-demo-stratford',
    authorId: 'agent-eastline',
    authorName: 'Eastline Rooms',
    body: 'This room is still available. If the area and budget fit, send a viewing window and we can keep the conversation inside RentEazy.',
    createdAt: '2026-06-01T10:04:00.000Z',
  },
];

const seededViewings = [
  {
    id: 'viewing-demo-stratford',
    matchId: 'match-demo-stratford',
    requesterId: currentUser.id,
    participantIds: [currentUser.id, 'agent-eastline'],
    subjectTitle: 'Double room near Stratford station',
    scheduledFor: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString(),
    status: 'requested',
    mode: 'In-person',
    location: 'Stratford',
    notes: 'Bring availability and basic referencing questions.',
    createdAt: '2026-06-01T10:08:00.000Z',
    updatedAt: '2026-06-01T10:08:00.000Z',
  },
];

const defaultReputationProfile = {
  userId: currentUser.id,
  score: 65,
  tier: 'Bronze',
  badges: ['Role needed', 'Mutual match history', 'Viewing record', 'More match info needed'],
  completedFields: 1,
  missingFields: ['role', 'area', 'budget', 'moveDate', 'lookingFor'],
  components: {
    profilePoints: 5,
    answeredCount: 0,
    postCount: 0,
    commentCount: 0,
    matchCount: 1,
    viewingCount: 1,
    reviewCount: 0,
    eventPoints: 30,
    reportPenalty: 0,
  },
  updatedAt: new Date().toISOString(),
};

const roleMarketLanes = {
  General: [
    ['Supply', 'Properties, rooms, stays, and availability', 'Properties'],
    ['Demand', 'Looking posts, briefs, and active searches', 'Looking'],
    ['Services', 'Agents, operators, hosts, and business updates', 'Agents'],
    ['Capital and deals', 'Investor briefs, sourcer deals, and opportunities', 'Investors'],
  ],
  Tenant: [
    ['Places and rooms', 'Homes, rooms, flatshares, and stays', 'Properties'],
    ['People to team with', 'Looking posts and buddy-up opportunities', 'Looking'],
    ['Short-term options', 'Flexible stays while plans settle', 'Short-Term'],
    ['Market guidance', 'Viewing, referencing, and area help', 'Advice'],
  ],
  'House Buddy': [
    ['Buddy-ups', 'People ready to team up', 'House Buddies'],
    ['Rooms', 'Rooms that fit shared living', 'Properties'],
    ['Looking posts', 'Searches you can join', 'Looking'],
    ['Advice', 'Flatmate and viewing guidance', 'Advice'],
  ],
  Landlord: [
    ['Tenant demand', 'People looking in your area', 'Looking'],
    ['Agent updates', 'Local agents with active renters', 'Agents'],
    ['Operator offers', 'Managed, co-hosting, and stay options', 'Operators'],
    ['Investor interest', 'Buyers and operators watching your area', 'Investors'],
  ],
  'Individual Agent': [
    ['Tenant demand', 'Active renters and looking posts', 'Looking'],
    ['Landlord opportunities', 'Owners open to help', 'Landlords'],
    ['Area insight', 'Useful local updates to post', 'Advice'],
    ['Sponsored reach', 'Promote useful posts where relevant', 'Agents'],
  ],
  'Agency / Business': [
    ['Tenant demand', 'Active renters and looking posts', 'Looking'],
    ['Landlord opportunities', 'Owners open to instructions', 'Landlords'],
    ['Sponsored reach', 'Promoted posts and listing visibility', 'Agents'],
    ['Team signals', 'Saves, follows, and post traction', 'Following'],
  ],
  Operator: [
    ['Landlord opportunities', 'Owners open to managed routes', 'Landlords'],
    ['Properties', 'Homes and stays with operator fit', 'Properties'],
    ['Investor briefs', 'Capital looking for operators', 'Investors'],
    ['Sourcer deals', 'Pipeline from deal sources', 'Sourcers'],
  ],
  Sourcer: [
    ['Investor briefs', 'Buyers looking for clean deals', 'Investors'],
    ['Operator briefs', 'Operators needing stock', 'Operators'],
    ['Landlord opportunities', 'Owners open to routes', 'Landlords'],
    ['Deal posts', 'Post structured opportunities', 'Sourcers'],
  ],
  Investor: [
    ['Sourcer deals', 'Deal sources and local briefs', 'Sourcers'],
    ['Operator offers', 'Operators with track record fields', 'Operators'],
    ['Landlord/property opportunities', 'Owners and stock signals', 'Landlords'],
    ['Area insight', 'Rental market context', 'Advice'],
  ],
  'Short-Term Guest': [
    ['Short-term stays', 'Flexible furnished options', 'Short-Term'],
    ['Area insight', 'Move and relocation guidance', 'Advice'],
    ['Availability', 'Fresh stay openings', 'Short-Term'],
    ['Properties', 'Longer-term options if plans change', 'Properties'],
  ],
  'Short-Term Host': [
    ['Guest demand', 'Relocation and stay searches', 'Looking'],
    ['Operator updates', 'Operational support and co-hosting', 'Operators'],
    ['Availability posts', 'Keep stay openings visible', 'Short-Term'],
    ['Sponsored reach', 'Promote relevant stays', 'Short-Term'],
  ],
};

function EasyPeazyMark({ footer = false }) {
  return (
    <span
      className={`mt-0.5 block font-['JetBrains_Mono',monospace] font-semibold leading-none tracking-[0.18em] ${
        footer ? 'text-[0.68rem]' : 'text-[0.48rem]'
      }`}
      aria-hidden="true"
    >
      <span className="text-[#52a832]">EASY</span>
      <span className="text-[#092243]">PEAZY</span>
    </span>
  );
}

function BrandLogo({ footer = false }) {
  return (
    <a href="/" className="inline-flex shrink-0 flex-col items-center" aria-label="RentEazy">
      <img
        src={footer ? '/images/renteazy-main-logo-transparent.png' : '/images/renteazy-main-logo-transparent-nav.png'}
        alt="RentEazy"
        className={footer ? 'h-20 w-auto object-contain' : 'h-10 w-auto object-contain'}
      />
      {footer && <EasyPeazyMark footer />}
    </a>
  );
}

function RotatingHeroWord({ words = defaultRotatingHeroWords, intervalMs = 2000, className = '' }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIndex((current) => (current + 1) % words.length);
    }, intervalMs);

    return () => window.clearTimeout(timeout);
  }, [index, intervalMs, words]);

  return (
    <span
      aria-hidden="true"
      className={`inline align-baseline ${className}`}
    >
      <span key={words[index]} className="hero-rotating-word inline align-baseline whitespace-nowrap">
        {words[index]}
      </span>
    </span>
  );
}

function CheckItem({ children, light = false }) {
  return (
    <span className={`inline-flex items-center gap-2 text-sm ${light ? 'text-white/82' : 'text-slate-600'}`}>
      <iconify-icon icon="solar:check-circle-linear" class={light ? 'text-[#9bd383]' : 'text-[#2f7d32]'}></iconify-icon>
      {children}
    </span>
  );
}

const liveActivity = [
  { icon: 'solar:home-smile-bold', color: '#2670a8', text: 'New room posted in Hackney', sub: '2 min ago' },
  { icon: 'solar:user-rounded-bold', color: '#2f7d32', text: 'Tenant matched in Stratford', sub: 'just now' },
  { icon: 'solar:buildings-bold', color: '#2670a8', text: 'Agent listed 2 properties in E3', sub: '4 min ago' },
  { icon: 'solar:heart-bold', color: '#2f7d32', text: 'Mutual match in Canary Wharf', sub: '1 min ago' },
  { icon: 'solar:home-wifi-bold', color: '#2670a8', text: 'Landlord connected with agent', sub: '6 min ago' },
  { icon: 'solar:user-plus-rounded-bold', color: '#2f7d32', text: 'House buddy found in Clapham', sub: '3 min ago' },
];

function LiveActivityTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % liveActivity.length);
        setVisible(true);
      }, 280);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const item = liveActivity[idx];
  return (
    <div className="mt-4 inline-flex items-center gap-2.5 rounded-full bg-white/72 border border-white px-3.5 py-2 shadow-[0_4px_14px_-8px_rgba(15,23,42,0.18),inset_0_1px_0_white]" style={{ transition: 'opacity 0.28s ease', opacity: visible ? 1 : 0 }}>
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-55" style={{ backgroundColor: item.color }}></span>
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></span>
      </span>
      <iconify-icon icon={item.icon} style={{ color: item.color }} class="text-sm shrink-0"></iconify-icon>
      <span className="text-xs text-slate-700 font-medium">{item.text}</span>
      <span className="text-xs text-slate-400 shrink-0">{item.sub}</span>
    </div>
  );
}

function StickyMobileCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('match');
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-60 md:hidden transition-transform duration-300 ${show ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="bg-white/95 border-t border-slate-200 backdrop-blur-xl px-4 py-3 shadow-[0_-8px_24px_-8px_rgba(15,23,42,0.18)]">
        <a
          href="/signup?source=sticky_mobile&offer=match24h"
          className="flex w-full items-center justify-center gap-2.5 rounded-full bg-linear-to-b from-[#52a832] to-[#2f7d32] border border-[#25672a] px-6 py-3.5 text-sm font-medium text-white shadow-[0_6px_18px_rgba(47,125,50,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] active:scale-95 transition-transform"
        >
          Start Matching — it's free
          <iconify-icon icon="solar:arrow-right-linear" class="text-lg"></iconify-icon>
        </a>
        <p className="mt-1.5 text-center text-[10px] text-slate-400">No card required · Free to post</p>
      </div>
    </div>
  );
}

function DemoCardVisual({ card, dimmed = false, quiet = false }) {
  const typeLabel = card.type.charAt(0).toUpperCase() + card.type.slice(1);

  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-slate-200 ${dimmed ? 'opacity-55' : ''}`}
      style={{
        backgroundImage: `linear-gradient(to top, rgba(6,24,47,0.9) 0%, rgba(6,24,47,0.18) 42%, rgba(6,24,47,0.02) 100%), url("${card.imageSrc}")`,
        backgroundPosition: card.imagePosition,
        backgroundSize: 'cover',
      }}
    >
      <img
        src={card.imageSrc}
        alt={card.imageAlt}
        className="absolute inset-0 h-full w-full object-cover opacity-0"
        style={{ objectPosition: card.imagePosition }}
        loading="eager"
        draggable="false"
      />
      {!quiet && (
        <>
          <div className="absolute left-5 right-5 top-5 z-10 flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/92 backdrop-blur-sm px-3 py-1 text-xs font-medium text-[#092243] shadow-[0_8px_18px_-12px_rgba(15,23,42,0.35)]">{card.matchScore}% match</span>
            <span className="rounded-full bg-white/18 backdrop-blur-sm border border-white/35 px-3 py-1 text-xs text-white">{typeLabel}</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 pb-24 pt-28 text-white">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-normal tracking-tight">{card.title}</h2>
                <p className="mt-1 text-sm text-white/82">{card.location} · {card.price}</p>
                <p className="mt-1 text-sm text-white/72">{card.availability} · {card.detailLine}</p>
              </div>
              <span className="shrink-0 rounded-2xl bg-white/16 border border-white/22 px-3 py-2 text-center text-sm">{card.visual.index + 1}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {card.badges.map((badge) => <span key={badge} className="rounded-full bg-white/16 border border-white/20 px-3 py-1 text-[11px] text-white/86">{badge}</span>)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InteractiveMatchCard({ canSwipe = true, onSwipeAction = () => {}, onBlocked = () => {} }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeCount, setSwipeCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [feedback, setFeedback] = useState('Try the swipe deck');
  const [modal, setModal] = useState(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const card = heroSwipeCards[activeIndex];
  const nextCard = heroSwipeCards[(activeIndex + 1) % heroSwipeCards.length];
  const totalCards = heroSwipeCards.length;
  const progress = ((activeIndex + 1) / totalCards) * 100;

  const showTrial = (kind, nextSwipeCount) => {
    if (kind === 'superlike') {
      setModal({
        title: 'Get seen sooner.',
        text: 'Superlikes push you higher in suitable match decks. Try the real Match experience free for 24 hours.',
      });
      return;
    }
    if (nextSwipeCount > 0 && nextSwipeCount % totalCards === 0) {
      setModal({
        title: "You finished today's starter deck.",
        text: 'Your real matches are waiting. Create a free account and unlock your RentEazy Match deck for 24 hours.',
      });
      return;
    }
    if (kind === 'like' && likeCount === 0) {
      setModal({
        title: 'Nice match.',
        text: 'Create a free account and unlock your real RentEazy Match deck for 24 hours.',
      });
      return;
    }
    if (nextSwipeCount > 0 && nextSwipeCount % 5 === 0) {
      setModal({
        title: "You're getting the idea.",
        text: 'Want your real matches? Create a free account and try RentEazy Match free for 24 hours.',
      });
    }
  };

  const swipe = (action) => {
    if (!canSwipe) {
      setFeedback('Daily swipes used');
      onBlocked();
      return;
    }
    const direction = action === 'pass' ? -1 : 1;
    const y = action === 'superlike' ? -420 : 0;
    const nextSwipeCount = swipeCount + 1;
    setIsDragging(false);
    setDragX(direction * 420);
    setDragY(y);

    if (action === 'pass') {
      setFeedback('Showing fewer like this');
    } else if (action === 'superlike') {
      setFeedback('Superlike used');
      setLikeCount((count) => count + 1);
    } else {
      setFeedback('More like this');
      setLikeCount((count) => count + 1);
    }

    setSwipeCount(nextSwipeCount);
    onSwipeAction(action, card);
    showTrial(action, nextSwipeCount);

    window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % heroSwipeCards.length);
      setDragX(0);
      setDragY(0);
    }, 220);
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse') return;
    startXRef.current = event.clientX;
    startYRef.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;
    setDragX(Math.max(-150, Math.min(150, event.clientX - startXRef.current)));
    setDragY(Math.max(-120, Math.min(80, event.clientY - startYRef.current)));
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    if (dragY < -70) {
      swipe('superlike');
      return;
    }
    if (Math.abs(dragX) > 64) {
      swipe(dragX > 0 ? 'like' : 'pass');
      return;
    }
    setIsDragging(false);
    setDragX(0);
    setDragY(0);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      swipe('pass');
    }
    if (event.key === 'ArrowRight' || event.key === 'Enter') {
      swipe('like');
    }
    if (event.key === 'ArrowUp') {
      swipe('superlike');
    }
  };

  return (
    <div className="relative rounded-[1.7rem] bg-white border border-slate-200 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.42),inset_0_1px_0_white] overflow-hidden">
      {modal && (
        <div className="absolute inset-x-4 top-4 z-30 rounded-3xl bg-white/96 backdrop-blur-sm border border-white p-5 shadow-[0_24px_52px_-28px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-normal tracking-tight text-slate-950">{modal.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{modal.text}</p>
            </div>
            <button type="button" aria-label="Keep swiping" onClick={() => setModal(null)} className="h-9 w-9 shrink-0 rounded-full border border-slate-200 bg-white text-slate-500">
              <iconify-icon icon="solar:close-circle-linear" class="text-xl"></iconify-icon>
            </button>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <a href="/signup?trial=match24h&source=landing_swipe" className="inline-flex items-center justify-center rounded-full bg-[#2f7d32] px-5 py-3 text-sm text-white">Try Match free for 24 hours</a>
            <button type="button" onClick={() => setModal(null)} className="inline-flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 px-5 py-3 text-sm text-slate-600">Keep swiping</button>
          </div>
        </div>
      )}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4 pb-4">
          <div>
            <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">TRY THE SWIPE DECK</p>
            <p className="mt-1 text-sm text-slate-500">Pass what does not fit. Like what does. Superlike to get seen sooner.</p>
          </div>
          <div className="rounded-full bg-[#edf7ff] border border-[#cde7f8] px-3 py-1 text-xs text-[#154f79]">{activeIndex + 1} / {totalCards}</div>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-4">
          <div className="h-full rounded-full bg-linear-to-r from-[#2f7d32] to-[#2670a8]" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="relative h-126 sm:h-136 lg:h-120 xl:h-128 overflow-visible">
          <div className="absolute inset-4 rounded-4xl bg-white border border-slate-200 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.35)] rotate-3 scale-[0.96] overflow-hidden">
            <DemoCardVisual card={nextCard} dimmed />
          </div>
          <div className="absolute inset-2 rounded-4xl bg-white border border-slate-200 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.35)] -rotate-2 scale-[0.98] overflow-hidden"></div>
          <article
            key={card.title}
            role="button"
            tabIndex={0}
            aria-label={`Swipe card: ${card.title}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={handleKeyDown}
            className={`hero-swipe-card absolute inset-0 rounded-4xl bg-white border border-slate-200 overflow-hidden shadow-[0_28px_58px_-30px_rgba(15,23,42,0.66),inset_0_1px_0_white] ${isDragging ? 'cursor-grabbing' : 'cursor-default'}`}
            style={{ transform: `translate(${dragX}px, ${dragY}px) rotate(${dragX / 22}deg)` }}
          >
            <DemoCardVisual card={card} />
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity ${Math.abs(dragX) > 28 || dragY < -50 ? 'opacity-100' : 'opacity-0'}`}>
              <span className={`rounded-full px-6 py-3 text-sm font-semibold text-white shadow-xl ${dragY < -50 ? 'bg-[#092243]' : dragX >= 0 ? 'bg-[#2f7d32]' : 'bg-[#ef4444]'}`}>
                {dragY < -50 ? 'SUPERLIKE' : dragX >= 0 ? 'LIKE' : 'PASS'}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-4">
              <button type="button" aria-label="Pass" onClick={(event) => { event.stopPropagation(); swipe('pass'); }} className="h-14 w-14 rounded-full bg-white/94 backdrop-blur-sm border border-white text-[#ef4444] shadow-[0_16px_30px_-18px_rgba(0,0,0,0.55),inset_0_1px_0_white]">
                <iconify-icon icon="solar:close-circle-bold" class="text-3xl"></iconify-icon>
              </button>
              <button type="button" aria-label="Superlike" onClick={(event) => { event.stopPropagation(); swipe('superlike'); }} className="h-16 w-16 rounded-full bg-[#092243]/96 backdrop-blur-sm border border-white/20 text-white shadow-[0_18px_34px_-18px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.2)]">
                <iconify-icon icon="solar:star-bold" class="text-3xl"></iconify-icon>
              </button>
              <button type="button" aria-label="Like" onClick={(event) => { event.stopPropagation(); swipe('like'); }} className="h-14 w-14 rounded-full bg-[#2f7d32]/96 backdrop-blur-sm border border-white/20 text-white shadow-[0_16px_30px_-18px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.25)]">
                <iconify-icon icon="solar:heart-bold" class="text-3xl"></iconify-icon>
              </button>
            </div>
          </article>
        </div>
      </div>
      <div className="mx-4 sm:mx-5 mb-5 flex items-center justify-between gap-4 rounded-2xl bg-[#edf7ff] border border-[#cde7f8] p-3 text-sm">
        <span className="text-[#154f79]">{feedback}</span>
        <span className="text-slate-500">{likeCount} liked</span>
      </div>
      <p className="mx-4 sm:mx-5 mb-5 text-center text-xs text-slate-400">Limited free swipes refresh daily. Answer quick questions to improve this deck.</p>
      <div className="mx-4 sm:mx-5 mb-5 flex justify-center gap-1.5" aria-hidden="true">
        {heroSwipeCards.slice(0, 12).map((item, index) => <span key={item.id} className={`h-1.5 rounded-full transition-all ${index === activeIndex % 12 ? 'w-6 bg-[#2f7d32]' : 'w-1.5 bg-slate-300'}`}></span>)}
      </div>
    </div>
  );
}

function HeroSwipeDeck() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [feedback, setFeedback] = useState('Live rental deck');
  const [turnCount, setTurnCount] = useState(0);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const card = heroSwipeCards[activeIndex];
  const nextCard = heroSwipeCards[(activeIndex + 1) % heroSwipeCards.length];

  const moveNext = (action) => {
    if (showSignupPrompt) return;
    const direction = action === 'pass' ? -1 : 1;
    const nextTurnCount = turnCount + 1;
    setIsDragging(false);
    setDragX(direction * 420);
    setDragY(action === 'superlike' ? -420 : 0);
    setFeedback(action === 'pass' ? 'Showing fewer like this' : action === 'superlike' ? 'Priority signal sent' : 'Saved to your likes');
    setTurnCount(nextTurnCount);

    window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % heroSwipeCards.length);
      setDragX(0);
      setDragY(0);
      if (nextTurnCount >= 3) {
        setFeedback('Create a free account');
        setShowSignupPrompt(true);
      }
    }, 220);
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse') return;
    startXRef.current = event.clientX;
    startYRef.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;
    setDragX(Math.max(-150, Math.min(150, event.clientX - startXRef.current)));
    setDragY(Math.max(-120, Math.min(80, event.clientY - startYRef.current)));
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    if (dragY < -70) {
      moveNext('superlike');
      return;
    }
    if (Math.abs(dragX) > 64) {
      moveNext(dragX > 0 ? 'like' : 'pass');
      return;
    }
    setIsDragging(false);
    setDragX(0);
    setDragY(0);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') moveNext('pass');
    if (event.key === 'ArrowRight' || event.key === 'Enter') moveNext('like');
    if (event.key === 'ArrowUp') moveNext('superlike');
  };

  return (
    <div className="relative mx-auto flex w-full justify-center">
      <div className="absolute top-6 h-128 w-[20rem] rounded-[3rem] bg-linear-to-br from-[#cfe9fb]/70 via-white/35 to-[#dff4e2]/65 blur-2xl"></div>
      <IPhoneMockup
        model="15-pro"
        color="space-black"
        safeArea={false}
        screenBg="#07090d"
        showHomeIndicator
        className="hero-phone-mockup"
        shadow="0 34px 80px -42px rgba(15,23,42,0.82), 0 18px 34px -22px rgba(0,0,0,0.62)"
        frameStyle={{ border: '1px solid rgba(255,255,255,0.12)' }}
      >
        <div className="relative h-full w-full overflow-hidden bg-[#07090d]">
          <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 pt-4 text-white">
            <span className="text-sm font-medium">14:31</span>
            <div className="flex items-center gap-2 text-white">
              <span className="h-3 w-4 rounded-xs border border-white"></span>
              <span className="h-3 w-3 rounded-full bg-white"></span>
              <span className="rounded-sm bg-[#dff85d] px-1.5 text-xs font-semibold text-[#07110b]">92</span>
            </div>
          </div>

          <div className="absolute inset-x-6 top-[4.4rem] z-30 rounded-3xl bg-black/42 p-4 text-white ring-1 ring-white/14 shadow-[0_18px_42px_-24px_rgba(0,0,0,0.62)] backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Rental match</p>
                <p className="mt-1 text-xs text-white">{feedback}</p>
              </div>
              <span className="rounded-full bg-white/16 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/14">{showSignupPrompt ? '3 / 3' : `${turnCount} / 3`}</span>
            </div>
          </div>

          <div className="absolute inset-2 rounded-[2.35rem] bg-white/10 opacity-70 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.8)] rotate-2 overflow-hidden">
            <DemoCardVisual card={nextCard} dimmed quiet />
          </div>

          <article
            key={card.id}
            role="button"
            tabIndex={0}
            aria-label={`Swipe rental card: ${card.title}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={handleKeyDown}
            className={`hero-swipe-card absolute inset-0 rounded-[2.6rem] bg-slate-900 overflow-hidden shadow-[0_28px_58px_-28px_rgba(0,0,0,0.8)] ${isDragging ? 'cursor-grabbing' : 'cursor-default'}`}
            style={{ transform: `translate(${dragX}px, ${dragY}px) rotate(${dragX / 22}deg)` }}
          >
            <DemoCardVisual card={card} quiet />
            <div className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity ${Math.abs(dragX) > 28 || dragY < -50 ? 'opacity-100' : 'opacity-0'}`}>
              <span className={`rounded-full px-6 py-3 text-sm font-semibold text-white shadow-xl ${dragY < -50 ? 'bg-[#092243]' : dragX >= 0 ? 'bg-[#2f7d32]' : 'bg-[#ff255f]'}`}>
                {dragY < -50 ? 'SUPERLIKE' : dragX >= 0 ? 'LIKE' : 'PASS'}
              </span>
            </div>
          </article>

          {showSignupPrompt && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/58 px-6 text-center backdrop-blur-xs">
              <div className="rounded-4xl bg-white p-6 text-[#092243] shadow-[0_26px_60px_-30px_rgba(0,0,0,0.8)]">
                <p className="text-2xl font-semibold tracking-tight">Ready for your real matches?</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">Create a free account. After signup, unlock RentEazy Match free for 24 hours.</p>
                <div className="mt-5 flex flex-col gap-2">
                  <a href="/signup?source=hero_swipe_demo&offer=match24h" className="inline-flex items-center justify-center rounded-full bg-[#2f7d32] px-5 py-3 text-sm text-white">Create free account</a>
                  <button type="button" onClick={() => { setShowSignupPrompt(false); setTurnCount(0); setFeedback('Live rental deck'); }} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600">Keep swiping</button>
                </div>
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 z-30 px-5 pb-7 pt-16 bg-linear-to-t from-black via-black/82 to-transparent">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#10866f] px-3 py-1 text-xs font-medium text-white">
                  <MapPin className="h-4 w-4" />
                  Nearby
                </div>
                <h2 className="truncate text-4xl font-normal tracking-normal text-white">{card.title}</h2>
                <p className="mt-1 flex items-center gap-2 text-base text-white"><MapPin className="h-5 w-5" />{card.location} · {card.price}</p>
                <p className="mt-1 text-sm text-white">{card.availability} · {card.detailLine}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#2c9cff] p-3 text-white shadow-[0_0_0_3px_rgba(255,255,255,0.86)]">
                <Camera className="h-5 w-5" />
              </span>
            </div>

            <div className="grid grid-cols-5 items-center gap-3">
              <button type="button" aria-label="Rewind" className="flex h-12 items-center justify-center rounded-full bg-white/8 border border-white/10 text-slate-400"><RotateCcw className="h-6 w-6" /></button>
              <button type="button" aria-label="Pass" onClick={() => moveNext('pass')} className="flex h-16 items-center justify-center rounded-full bg-white/10 border border-white/10 text-[#ff5a73] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"><ArrowDownLeft className="h-9 w-9 stroke-[2.8]" /></button>
              <button type="button" aria-label="Superlike" onClick={() => moveNext('superlike')} className="flex h-12 items-center justify-center rounded-full bg-white/8 border border-white/10 text-[#2c9cff]"><ArrowUp className="h-6 w-6 stroke-[2.8]" /></button>
              <button type="button" aria-label="Like" onClick={() => moveNext('like')} className="flex h-16 items-center justify-center rounded-full bg-white/10 border border-white/10 text-[#84d64b] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"><Check className="h-10 w-10 stroke-3" /></button>
              <a href="#feed" aria-label="Share" className="flex h-12 items-center justify-center rounded-full bg-white/8 border border-white/10 text-[#2c9cff]"><Send className="h-6 w-6 fill-current" /></a>
            </div>

            <div className="mt-5 grid grid-cols-5 rounded-full bg-black/46 p-1.5 text-white ring-1 ring-white/10 backdrop-blur-md">
              {[
                [Flame, 'Swipe'],
                [Compass, 'Explore'],
                [BadgeCheck, 'Likes'],
                [MessageCircle, 'Chat'],
                [UserRound, 'Profile'],
              ].map(([Icon, label], index) => (
                <a key={label} href={index === 0 ? '#match' : '#feed'} className={`flex min-w-0 flex-col items-center gap-1 rounded-full px-1.5 py-2 text-[0.68rem] ${index === 0 ? 'bg-white/16 text-white' : ''}`}>
                  <Icon className="h-5 w-5" />
                  <span className="truncate">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </IPhoneMockup>
    </div>
  );
}

function getStoredJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

const apiBaseUrl = import.meta.env.VITE_RENTEAZY_API_URL || (
  typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://127.0.0.1:8787'
    : ''
);

async function apiRequest(path, { method = 'GET', body } = {}) {
  let token = '';
  if (clerkTokenProvider) {
    try {
      token = await clerkTokenProvider();
    } catch {
      token = '';
    }
  }
  if (!token) token = getStoredJson('renteazy-api-token', '');
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'api_error');
    error.data = data;
    throw error;
  }
  return data;
}

function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => getStoredJson(key, fallback));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Local demo state is best-effort.
    }
  }, [key, value]);

  return [value, setValue];
}

function createPostId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `post-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

function getTrackingUrl(postId, channel = 'copy') {
  const origin = typeof window === 'undefined' ? 'https://renteazy.co.uk' : window.location.origin;
  return `${origin}/share/post/${postId}?r=${currentUser.id}&c=${encodeURIComponent(channel)}`;
}

function createShareCaption(post) {
  const budget = post.budget ? ` ${post.budget}.` : '';
  const area = post.area ? ` in ${post.area}` : '';
  return `${post.title}${area}.${budget} See it on RentEazy:`;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.position = 'absolute';
  input.style.left = '-9999px';
  document.body.appendChild(input);
  input.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(input);
  return ok;
}

function getQuestionsForRole(role) {
  return matchingQuestions[role] || matchingQuestions.General;
}

function calculateProfileStrength(profile, answers) {
  const questions = getQuestionsForRole(profile.role);
  const answeredQuestions = questions.filter((question) => {
    const value = answers[question.id];
    return typeof value === 'string' ? value.trim() : Boolean(value);
  });
  const completedFields = [
    profile.name,
    profile.role,
    profile.area,
    profile.budget,
    profile.moveDate,
    profile.lookingFor,
  ].filter((value) => String(value || '').trim()).length;
  const fieldScore = Math.round((completedFields / 6) * 35);
  const questionWeight = questions.reduce((total, question) => total + question.weight, 0) || 1;
  const answerScore = Math.round((answeredQuestions.reduce((total, question) => total + question.weight, 0) / questionWeight) * 65);
  const score = Math.min(100, fieldScore + answerScore);
  const missingFields = [
    ['area', 'Preferred area'],
    ['budget', 'Budget'],
    ['moveDate', 'Move timing'],
    ['lookingFor', 'What you need'],
  ].filter(([key]) => !String(profile[key] || '').trim()).map(([, label]) => label);
  const missingQuestions = questions.filter((question) => !answeredQuestions.includes(question)).slice(0, 3).map((question) => question.category);

  return {
    score,
    completedFields,
    missingFields,
    suggestions: [...missingFields, ...missingQuestions].slice(0, 4),
  };
}

function getMatchSummary(profile, answers) {
  const strength = calculateProfileStrength(profile, answers);
  const badges = [];
  if (profile.budget || answers['tenant-budget'] || answers['buddy-budget'] || answers['investor-budget']) badges.push('Budget fit');
  if (profile.area || answers['tenant-areas'] || answers['buddy-areas'] || answers['investor-areas']) badges.push('Area fit');
  if (profile.moveDate || answers['tenant-move-date']) badges.push('Move date fit');
  if (profile.role === 'House Buddy' && (answers['buddy-home-style'] || answers['buddy-cleanliness'])) badges.push('Lifestyle fit');
  if (profile.role === 'Investor' && answers['investor-strategy']) badges.push('Investor criteria fit');
  if (badges.length < 3) badges.push('More info needed');

  return {
    score: Math.max(42, Math.min(96, strength.score + 18)),
    badges: badges.slice(0, 4),
    missingInfo: strength.suggestions,
  };
}

function getRoleMarketLanes(role) {
  return roleMarketLanes[role] || roleMarketLanes.General;
}

function displayRole(role) {
  return roleOptions.includes(role) ? role : 'Choose role';
}

function ClerkSessionBridge({ setProfile }) {
  const { getToken, isSignedIn, userId } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isSignedIn) {
      setClerkTokenProvider(null);
      return undefined;
    }

    setClerkTokenProvider(() => getToken());
    return () => setClerkTokenProvider(null);
  }, [getToken, isSignedIn, userId]);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    const savedRole = getStoredJson('renteazy-signup-role', '');
    const displayName = user.fullName || user.primaryEmailAddress?.emailAddress || 'RentEazy member';
    setProfile((current) => ({
      ...current,
      id: current.id?.startsWith('clerk-') ? current.id : `clerk-${user.id}`,
      name: current.name && current.name !== currentUser.name ? current.name : displayName,
      role: current.role || savedRole,
      clerkUserId: user.id,
      updatedAt: new Date().toISOString(),
    }));
  }, [isSignedIn, setProfile, user]);

  return null;
}

function ClerkAccountControls() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return (
      <>
        <a href="/app/billing" className="hidden rounded-full bg-[#092243] px-3 py-1.5 text-xs text-white sm:inline-flex">Billing</a>
        <UserButton afterSignOutUrl="/signup" />
      </>
    );
  }

  return (
    <>
      <SignInButton mode="modal" fallbackRedirectUrl="/app/feed">
        <button type="button" className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 sm:inline-flex">Sign in</button>
      </SignInButton>
      <SignUpButton mode="modal" fallbackRedirectUrl="/app/feed">
        <button type="button" className="rounded-full bg-[#2f7d32] px-3 py-1.5 text-xs text-white">Create account</button>
      </SignUpButton>
    </>
  );
}

function ClerkSignupBridge() {
  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') return 'sign-up';
    return new URLSearchParams(window.location.search).get('mode') === 'sign-in' ? 'sign-in' : 'sign-up';
  });
  const [role, setRole] = useStoredState('renteazy-signup-role', '');

  return (
    <div className="min-h-screen bg-[#eef5f2] px-5 py-6 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <BrandLogo />
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="rounded-[2rem] bg-[#092243] p-6 text-white shadow-[0_28px_70px_-46px_rgba(9,34,67,0.95)]">
            <p className="font-['JetBrains_Mono',monospace] text-xs text-[#8fd0ff]">RENTEAZY ACCOUNT</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-tight md:text-6xl">Open the market, then pick your lane.</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/68">Create a free account, land in the Feed, post for free, swipe daily, and improve matches as you answer useful rental-market questions.</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {['Feed', 'Swipe', 'Post', 'Match'].map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 px-4 py-3 text-sm ring-1 ring-white/10">{item} ready</div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white bg-white p-4 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.45),inset_0_1px_0_white] sm:p-6">
            <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1 text-sm">
              {[
                ['sign-up', 'Create account'],
                ['sign-in', 'Sign in'],
              ].map(([value, label]) => (
                <button key={value} type="button" onClick={() => setMode(value)} className={`rounded-full px-4 py-2 ${mode === value ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>
                  {label}
                </button>
              ))}
            </div>
            {mode === 'sign-up' && (
              <label className="mt-5 block text-sm text-slate-600">
                What brings you to RentEazy?
                <select value={role} onChange={(event) => setRole(event.target.value)} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-hidden focus:border-[#2f7d32]">
                  <option value="" disabled>Choose your role</option>
                  {roleOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            )}
            <div className="mt-5">
              {mode === 'sign-up' ? (
                <SignUp
                  appearance={clerkAppearance}
                  routing="hash"
                  signInUrl="/signup?mode=sign-in"
                  forceRedirectUrl="/app/feed"
                  fallbackRedirectUrl="/app/feed"
                />
              ) : (
                <SignIn
                  appearance={clerkAppearance}
                  routing="hash"
                  signUpUrl="/signup"
                  forceRedirectUrl="/app/feed"
                  fallbackRedirectUrl="/app/feed"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignupBridge() {
  if (clerkEnabled) return <ClerkSignupBridge />;

  const [mode, setMode] = useState('register');
  const [name, setName] = useStoredState('renteazy-signup-name', '');
  const [email, setEmail] = useStoredState('renteazy-signup-email', '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useStoredState('renteazy-signup-role', '');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setStatus('submitting');
    setError('');

    try {
      const path = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const response = await apiRequest(path, {
        method: 'POST',
        body: mode === 'register' ? { name, email, password, role } : { email, password },
      });
      if (response.token) {
        window.localStorage.setItem('renteazy-api-token', JSON.stringify(response.token));
      }
      if (response.state?.profile) {
        window.localStorage.setItem('renteazy-app-profile', JSON.stringify(response.state.profile));
      }
      window.location.assign(appFeedUrl);
    } catch (authError) {
      setStatus('idle');
      setError(authError.data?.error === 'email_exists'
        ? 'That email already has a RentEazy account. Sign in instead.'
        : authError.data?.error === 'invalid_login'
          ? 'Email or password is not right.'
          : 'Enter a valid email and a password with at least 8 characters.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8fb] px-5 py-6 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <BrandLogo />
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">FREE ACCOUNT</p>
            <h1 className="mt-4 text-4xl font-normal tracking-tight text-slate-950 md:text-6xl">Join RentEazy and start with the Free Feed.</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">Create your account, post what you need, browse what people have, and start using RentEazy today.</p>
            <div className="mt-6 rounded-3xl border border-[#d5ecd7] bg-[#edf8ee] p-5 text-sm leading-7 text-[#215d27]">
              After signup you land straight in the Feed with free posting, daily swipes, Share Everywhere, and basic matching.
            </div>
          </div>
          <div className="rounded-4xl border border-white bg-white/82 p-6 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
            <form onSubmit={submit}>
              <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1 text-sm">
                {[
                  ['register', 'Create account'],
                  ['login', 'Sign in'],
                ].map(([value, label]) => (
                  <button key={value} type="button" onClick={() => { setMode(value); setError(''); }} className={`rounded-full px-4 py-2 ${mode === value ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>
                    {label}
                  </button>
                ))}
              </div>
              <h2 className="mt-6 text-2xl font-normal tracking-tight text-slate-950">{mode === 'register' ? 'Create your free account' : 'Sign in to RentEazy'}</h2>
              {mode === 'register' && (
                <>
                  <label className="mt-6 block text-sm text-slate-600">
                  Name
                    <input value={name} onChange={(event) => setName(event.target.value)} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-hidden focus:border-[#2f7d32]" placeholder="Your name" />
                  </label>
                  <label className="mt-4 block text-sm text-slate-600">
                    What brings you to RentEazy?
                    <select value={role} onChange={(event) => setRole(event.target.value)} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-hidden focus:border-[#2f7d32]">
                      <option value="" disabled>Choose your role</option>
                      {roleOptions.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </label>
                </>
              )}
              <label className={mode === 'register' ? 'mt-4 block text-sm text-slate-600' : 'mt-6 block text-sm text-slate-600'}>
                Email
                <input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-hidden focus:border-[#2f7d32]" placeholder="you@example.com" />
              </label>
              <label className="mt-4 block text-sm text-slate-600">
                Password
                <input value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} type="password" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-hidden focus:border-[#2f7d32]" placeholder="At least 8 characters" />
              </label>
              {error && <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              <button disabled={status === 'submitting'} className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#2f7d32] px-5 py-3 text-sm text-white disabled:opacity-60">
                {status === 'submitting' ? 'Opening RentEazy...' : mode === 'register' ? 'Create account and open Feed' : 'Sign in and open Feed'}
              </button>
              <a href={appFeedUrl} className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600">Browse Feed first</a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComposerPanel({ onCreatePost, compact = false, profile = currentUser }) {
  const [postType, setPostType] = useState('Looking');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [area, setArea] = useState('');
  const [budget, setBudget] = useState('');
  const [tags, setTags] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (!cleanTitle || !cleanBody) return;

    onCreatePost({
      id: createPostId(),
      authorId: profile.id || currentUser.id,
      authorType: profile.role || currentUser.role || 'Member',
      authorName: profile.name || currentUser.name,
      postType,
      title: cleanTitle,
      body: cleanBody,
      media: [],
      area: area.trim(),
      budget: budget.trim(),
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 6),
      visibility: 'public',
      sponsoredStatus: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likeCount: 0,
      commentCount: 0,
      saveCount: 0,
      shareCount: 0,
    });

    setTitle('');
    setBody('');
    setArea('');
    setBudget('');
    setTags('');
  };

  return (
    <form onSubmit={submit} className="rounded-[1.75rem] border border-white bg-white/86 p-4 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white] md:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#edf8ee] text-[#2f7d32]">
          <UserRound className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-sm font-medium text-slate-950">What are you looking for, offering, or sharing?</p>
          <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={compact ? 3 : 4} placeholder="What are you looking for, offering, or sharing?" className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-hidden focus:border-[#2f7d32] focus:bg-white" />
          <p className="mt-2 text-xs leading-5 text-slate-500">Post a listing, search, question, update, deal, stay, or useful rental-market insight.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Post title" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-hidden focus:border-[#2f7d32]" />
        <select value={postType} onChange={(event) => setPostType(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-hidden focus:border-[#2f7d32]">
          {postTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
        <input value={area} onChange={(event) => setArea(event.target.value)} placeholder="Area" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-hidden focus:border-[#2f7d32]" />
        <input value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="Budget or price" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-hidden focus:border-[#2f7d32]" />
      </div>
      <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Tags, separated by commas" className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-hidden focus:border-[#2f7d32]" />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['Public', 'Add media', 'Boost option'].map((item) => <span key={item} className="rounded-full bg-[#edf7ff] px-3 py-1 text-xs text-[#154f79]">{item}</span>)}
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2f7d32] px-5 py-3 text-sm text-white">
          <PlusCircle className="h-4 w-4" />
          Post free
        </button>
      </div>
    </form>
  );
}

function ShareEverywhereModal({ post, onClose, onShared }) {
  const [copied, setCopied] = useState('');
  if (!post) return null;

  const link = getTrackingUrl(post.id);
  const caption = `${createShareCaption(post)} ${link}`;

  const handleCopy = async (kind, text) => {
    await copyText(text);
    setCopied(kind);
    onShared(post.id, kind);
  };

  const nativeShare = async () => {
    if (!navigator.share) return;
    await navigator.share({ title: post.title, text: createShareCaption(post), url: link });
    setCopied('shared');
    onShared(post.id, 'native');
  };

  return (
    <div className="fixed inset-0 z-80 flex items-end justify-center bg-[#06182f]/58 p-4 backdrop-blur-xs sm:items-center">
      <div className="w-full max-w-lg rounded-4xl border border-white bg-white p-5 shadow-[0_30px_90px_-45px_rgba(0,0,0,0.65)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">SHARE EVERYWHERE</p>
            <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">Want more people to see this?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Share your post and get 5 extra swipes today.</p>
          </div>
          <button type="button" onClick={onClose} className="h-10 w-10 rounded-full border border-slate-200 text-slate-500">×</button>
        </div>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Suggested caption</p>
          <p className="mt-2 text-sm leading-6 text-slate-800">{caption}</p>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Tracking link</p>
          <p className="mt-2 break-all text-sm text-[#154f79]">{link}</p>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <button type="button" onClick={() => handleCopy('caption', caption)} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#092243] px-4 py-3 text-sm text-white"><Copy className="h-4 w-4" />Copy caption</button>
          <button type="button" onClick={() => handleCopy('link', link)} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"><Copy className="h-4 w-4" />Copy link</button>
          <button type="button" disabled={!navigator.share} onClick={nativeShare} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2f7d32] px-4 py-3 text-sm text-white disabled:opacity-45"><Share2 className="h-4 w-4" />Share</button>
        </div>
        {copied && <p className="mt-4 rounded-2xl bg-[#edf8ee] px-4 py-3 text-sm text-[#215d27]">Share tracked. Reward added: 5 extra swipes today.</p>}
      </div>
    </div>
  );
}

function ReportModal({ post, onClose, onReport }) {
  const [reason, setReason] = useState(reportReasons[0]);
  const [details, setDetails] = useState('');
  if (!post) return null;

  const submit = (event) => {
    event.preventDefault();
    onReport({
      id: createPostId(),
      reporterId: currentUser.id,
      targetType: 'post',
      targetId: post.id,
      reason,
      details,
      status: 'open',
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-80 flex items-end justify-center bg-[#06182f]/58 p-4 backdrop-blur-xs sm:items-center">
      <form onSubmit={submit} className="w-full max-w-lg rounded-4xl border border-white bg-white p-5 shadow-[0_30px_90px_-45px_rgba(0,0,0,0.65)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-['JetBrains_Mono',monospace] text-xs text-[#ef4444]">REPORT</p>
            <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">Report this post</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Reports are saved for review. Use this when something looks unsafe, fake, or misleading.</p>
          </div>
          <button type="button" onClick={onClose} className="h-10 w-10 rounded-full border border-slate-200 text-slate-500">×</button>
        </div>
        <select value={reason} onChange={(event) => setReason(event.target.value)} className="mt-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-hidden focus:border-[#ef4444]">
          {reportReasons.map((item) => <option key={item}>{item}</option>)}
        </select>
        <textarea value={details} onChange={(event) => setDetails(event.target.value)} rows={4} placeholder="Add details if useful" className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-hidden focus:border-[#ef4444]" />
        <button className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#ef4444] px-5 py-3 text-sm text-white">Submit report</button>
      </form>
    </div>
  );
}

function CommentModal({ post, comments, onClose, onComment }) {
  const [body, setBody] = useState('');
  if (!post) return null;

  const submit = (event) => {
    event.preventDefault();
    const cleanBody = body.trim();
    if (!cleanBody) return;
    onComment(post.id, cleanBody);
    setBody('');
  };

  return (
    <div className="fixed inset-0 z-80 flex items-end justify-center bg-[#06182f]/58 p-4 backdrop-blur-xs sm:items-center">
      <div className="w-full max-w-lg rounded-4xl border border-white bg-white p-5 shadow-[0_30px_90px_-45px_rgba(0,0,0,0.65)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">COMMENTS</p>
            <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">{post.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="h-10 w-10 rounded-full border border-slate-200 text-slate-500">×</button>
        </div>
        <div className="mt-5 max-h-64 space-y-3 overflow-y-auto">
          {comments.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No comments yet. Start the useful conversation.</p>}
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-950">{comment.body}</p>
              <p className="mt-2 text-xs text-slate-400">{comment.authorName} · {new Date(comment.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          ))}
        </div>
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input value={body} onChange={(event) => setBody(event.target.value)} placeholder="Add a useful reply" className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-hidden focus:border-[#2f7d32]" />
          <button className="inline-flex items-center justify-center rounded-full bg-[#2f7d32] px-4 py-3 text-sm text-white">Post</button>
        </form>
      </div>
    </div>
  );
}

function ProfileStrengthCard({ profile, answers }) {
  const strength = calculateProfileStrength(profile, answers);

  return (
    <div className="rounded-[1.75rem] border border-white bg-white/86 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">MATCH PROFILE</p>
          <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">{strength.score}% ready</h2>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#edf8ee] text-lg text-[#215d27]">{strength.score}</div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-linear-to-r from-[#2f7d32] to-[#2670a8]" style={{ width: `${strength.score}%` }}></div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">Answer a few more questions to improve your matches.</p>
      {strength.suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {strength.suggestions.map((item) => <span key={item} className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-500">{item}</span>)}
        </div>
      )}
    </div>
  );
}

function ProgressiveQuestionsPanel({ profile, answers, setAnswers }) {
  const questions = getQuestionsForRole(profile.role);
  const unanswered = questions.filter((question) => !String(answers[question.id] || '').trim());
  const visibleQuestions = (unanswered.length ? unanswered : questions).slice(0, 3);

  const updateAnswer = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  return (
    <div className="rounded-[1.75rem] border border-[#d5ecd7] bg-[#edf8ee] p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)]">
      <p className="font-['JetBrains_Mono',monospace] text-xs text-[#215d27]">BETTER MATCHES</p>
      <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">Want better matches?</h2>
      <p className="mt-2 text-sm leading-6 text-[#215d27]">Answer 3 quick questions.</p>
      <div className="mt-4 space-y-3">
        {visibleQuestions.map((question) => (
          <label key={question.id} className="block text-sm text-[#215d27]">
            {question.prompt}
            {question.answerType === 'choice' ? (
              <select value={answers[question.id] || ''} onChange={(event) => updateAnswer(question.id, event.target.value)} className="mt-2 w-full rounded-2xl border border-[#c6e5c9] bg-white px-4 py-3 text-sm text-slate-900 outline-hidden focus:border-[#2f7d32]">
                <option value="">Choose one</option>
                {question.options.map((option) => <option key={option}>{option}</option>)}
              </select>
            ) : (
              <input value={answers[question.id] || ''} onChange={(event) => updateAnswer(question.id, event.target.value)} className="mt-2 w-full rounded-2xl border border-[#c6e5c9] bg-white px-4 py-3 text-sm text-slate-900 outline-hidden focus:border-[#2f7d32]" placeholder={question.category} />
            )}
          </label>
        ))}
      </div>
      <button type="button" className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#2f7d32] px-5 py-3 text-sm text-white">Improve my matches</button>
    </div>
  );
}

function ProfileEditor({ profile, setProfile, answers, setAnswers }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <div className="rounded-4xl border border-white bg-white/86 p-6 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
        <h1 className="text-4xl font-normal tracking-tight text-slate-950">Profile</h1>
        <p className="mt-3 text-slate-600">This is your match profile. It syncs with your RentEazy account.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-slate-600">Name<input value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-hidden focus:border-[#2f7d32]" /></label>
          <label className="text-sm text-slate-600">Role<select value={profile.role || ''} onChange={(event) => setProfile((current) => ({ ...current, role: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-hidden focus:border-[#2f7d32]"><option value="" disabled>Choose your role</option>{roleOptions.map((role) => <option key={role}>{role}</option>)}</select></label>
          <label className="text-sm text-slate-600">Preferred area<input value={profile.area} onChange={(event) => setProfile((current) => ({ ...current, area: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-hidden focus:border-[#2f7d32]" /></label>
          <label className="text-sm text-slate-600">Budget<input value={profile.budget} onChange={(event) => setProfile((current) => ({ ...current, budget: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-hidden focus:border-[#2f7d32]" /></label>
          <label className="text-sm text-slate-600">Move timing<input value={profile.moveDate} onChange={(event) => setProfile((current) => ({ ...current, moveDate: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-hidden focus:border-[#2f7d32]" /></label>
          <label className="text-sm text-slate-600">What you need<input value={profile.lookingFor} onChange={(event) => setProfile((current) => ({ ...current, lookingFor: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-hidden focus:border-[#2f7d32]" /></label>
        </div>
      </div>
      <div className="space-y-4">
        <ProfileStrengthCard profile={profile} answers={answers} />
        <ProgressiveQuestionsPanel profile={profile} answers={answers} setAnswers={setAnswers} />
      </div>
    </div>
  );
}

function MatchSummaryStrip({ profile, answers }) {
  const match = getMatchSummary(profile, answers);

  return (
    <div className="rounded-[1.6rem] border border-[#bfe8cb] bg-[#f4fff5] p-4 shadow-[0_18px_38px_-30px_rgba(21,93,39,0.42)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#123d22]">{match.score}% match readiness</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {match.badges.map((badge) => <span key={badge} className="rounded-full bg-white px-3 py-1 text-xs text-[#1f6b35] ring-1 ring-[#cfeeda]">{badge}</span>)}
          </div>
        </div>
        <a href="/app/profile" className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#092243] px-4 py-3 text-sm text-white shadow-[0_12px_24px_-18px_rgba(9,34,67,0.75)]">Improve my matches</a>
      </div>
    </div>
  );
}

function DailySwipePanel({ usageLimit, onBuyMore }) {
  const remaining = Math.max(0, usageLimit.allowance - usageLimit.used);
  const resetTime = new Date(usageLimit.resetsAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="overflow-hidden rounded-[1.6rem] bg-[#092243] p-4 text-white shadow-[0_22px_52px_-34px_rgba(9,34,67,0.95)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#8fd0ff]">DAILY SWIPES</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{remaining} left today</p>
          <p className="mt-1 text-sm text-white/68">Reset at {resetTime}</p>
        </div>
        <button type="button" onClick={() => onBuyMore('extra-swipes-10')} className="shrink-0 rounded-full bg-[#8bdc65] px-4 py-3 text-sm font-semibold text-[#092243]">+10 for 9p</button>
      </div>
    </div>
  );
}

function DailyPicksPanel({ picks }) {
  return (
    <div className="rounded-3xl border border-white bg-white/86 p-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">DAILY PICKS</p>
          <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">Fresh cards for today</h2>
        </div>
        <span className="rounded-full bg-[#edf8ee] px-3 py-1 text-xs text-[#215d27]">{picks.length} picks</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {picks.map((pick) => (
          <div key={pick.id} className="overflow-hidden rounded-2xl bg-slate-50">
            <img src={pick.imageSrc} alt="" className="h-28 w-full object-cover" style={{ objectPosition: pick.imagePosition }} />
            <div className="p-3">
              <p className="truncate text-sm font-medium text-slate-950">{pick.title}</p>
              <p className="mt-1 text-xs text-slate-500">{pick.location} · {pick.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MissionPanel({ posts, shares, likedIds, savedIds, answers, onSelectProduct }) {
  const answeredCount = Object.values(answers).filter((value) => String(value || '').trim()).length;
  const missions = [
    { id: 'open', label: 'Open RentEazy today', done: true },
    { id: 'post', label: 'Post once', done: posts.some((post) => post.authorId === currentUser.id || post.authorId === 'demo-user') },
    { id: 'save', label: 'Save or like 1 useful post', done: likedIds.length + savedIds.length > 0 },
    { id: 'questions', label: 'Answer 3 match questions', done: answeredCount >= 3 },
    { id: 'share', label: 'Share one post externally', done: shares.length > 0 },
  ];
  const completed = missions.filter((mission) => mission.done).length;

  return (
    <div className="rounded-3xl border border-white bg-white/86 p-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.45)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">TODAY</p>
          <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">{completed} / {missions.length} launch loops</h2>
          <p className="mt-1 text-sm text-slate-500">Useful actions unlock better matching and more reach.</p>
        </div>
        <button type="button" onClick={() => onSelectProduct('extra-swipes-10')} className="shrink-0 rounded-full bg-[#edf8ee] px-3 py-1 text-xs text-[#215d27]">+ swipes</button>
      </div>
      <div className="mt-4 space-y-2">
        {missions.map((mission) => (
          <div key={mission.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
            <span className={mission.done ? 'text-slate-950' : 'text-slate-500'}>{mission.label}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs ${mission.done ? 'bg-[#edf8ee] text-[#215d27]' : 'bg-white text-slate-400'}`}>{mission.done ? 'Done' : 'Open'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppPulseStrip({ wallet, purchases, boosts, reports, shares }) {
  const items = [
    ['Activity', shares.length ? `${shares.length} shares` : 'Ready'],
    ['Ads', boosts.length ? `${boosts.length} boosts` : 'Ready'],
    ['Trust', reports.length ? `${reports.length} reports` : 'Clear'],
    ['Credits', `${wallet.balance}`],
    ['Shop', purchases.length ? `${purchases.length} buys` : 'Ready'],
  ];

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-full border border-[#cfe9fb] bg-white px-4 py-2 shadow-[0_12px_26px_-24px_rgba(15,23,42,0.45)]">
            <p className="text-xs text-slate-500"><span className="font-semibold text-slate-950">{value}</span> {label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialHomeHeader({ profile, usageLimit, groups, memberships, posts, onSelectTab }) {
  const remaining = Math.max(0, usageLimit.allowance - usageLimit.used);
  const joinedCount = memberships.length;
  const roleLabel = displayRole(profile.role);
  const popularAreas = [...new Set(posts.map((post) => post.area).filter(Boolean))].slice(0, 3);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white bg-white/92 shadow-[0_22px_54px_-38px_rgba(15,23,42,0.48),inset_0_1px_0_white]">
      <div className="bg-linear-to-br from-[#092243] via-[#123f63] to-[#2f7d32] p-5 text-white sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-white/68">Home</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">What’s happening in your rental world?</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">Browse people, places, posts, groups, deals, stays, and useful local updates in one calm Feed.</p>
          </div>
          <a href="/app/profile" className="shrink-0 rounded-full bg-white/14 px-3 py-2 text-xs text-white ring-1 ring-white/16">{roleLabel}</a>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            [remaining, 'Swipes today'],
            [joinedCount, 'Groups joined'],
            [posts.length, 'Live posts'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-white/12 px-3 py-3 ring-1 ring-white/12">
              <p className="text-xl font-semibold">{value}</p>
              <p className="mt-1 text-[0.68rem] text-white/58">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <a href="/app/post" className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-slate-50 px-4 py-3 text-left text-sm text-slate-500 ring-1 ring-slate-100">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf8ee] text-[#2f7d32]"><UserRound className="h-4 w-4" /></span>
          <span className="truncate">Post a listing, question, update, deal, stay, or local tip</span>
        </a>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => onSelectTab('Groups')} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"><Users className="h-4 w-4" />Groups</button>
          <a href="/app/swipe" className="inline-flex items-center gap-2 rounded-full bg-[#2f7d32] px-4 py-3 text-sm text-white"><Flame className="h-4 w-4" />Swipe</a>
        </div>
      </div>
      {popularAreas.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-4">
          {popularAreas.map((area) => (
            <button key={area} type="button" onClick={() => onSelectTab('For You')} className="rounded-full bg-[#edf7ff] px-3 py-1.5 text-xs text-[#154f79]">{area}</button>
          ))}
        </div>
      )}
    </section>
  );
}

function SocialStoryRail({ posts, groups, onSelectTab }) {
  const stories = [
    { id: 'for-you', title: 'For You', body: 'Best market signals', icon: Sparkles, tab: 'For You', tone: 'bg-[#092243] text-white' },
    { id: 'groups', title: 'Groups', body: `${groups.length} open`, icon: Users, tab: 'Groups', tone: 'bg-[#edf8ee] text-[#215d27]' },
    { id: 'properties', title: 'Properties', body: `${posts.filter((post) => ['Property', 'Room', 'Serviced Accommodation'].includes(post.postType)).length} posts`, icon: Home, tab: 'Properties', tone: 'bg-[#edf7ff] text-[#154f79]' },
    { id: 'deals', title: 'Deals', body: 'Investors + sourcers', icon: BadgeCheck, tab: 'Investors', tone: 'bg-[#fff7ed] text-[#9a3412]' },
    { id: 'perks', title: 'Perks', body: 'Useful partners', icon: Gift, tab: 'Perks', tone: 'bg-white text-slate-700' },
  ];

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max gap-3">
        {stories.map(({ id, title, body, icon: Icon, tab, tone }) => (
          <button key={id} type="button" onClick={() => onSelectTab(tab)} className={`w-32 rounded-[1.35rem] border border-white p-4 text-left shadow-[0_14px_34px_-30px_rgba(15,23,42,0.48)] ${tone}`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/18 ring-1 ring-current/10"><Icon className="h-5 w-5" /></span>
            <span className="mt-5 block text-sm font-semibold">{title}</span>
            <span className="mt-1 block text-xs opacity-70">{body}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function GroupsPanel({ groups, memberships, onJoinGroup, onCreateGroup, compact = false }) {
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: '', groupType: 'Area community', area: '', description: '' });
  const memberGroupIds = memberships.map((item) => item.groupId);
  const visibleGroups = compact ? groups.slice(0, 3) : groups;

  const submit = (event) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.description.trim()) return;
    onCreateGroup(draft);
    setDraft({ name: '', groupType: 'Area community', area: '', description: '' });
    setCreating(false);
  };

  return (
    <section className="rounded-[1.75rem] border border-white bg-white/92 p-4 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">GROUPS</p>
          <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">Find your rental people</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Area communities, role networks, and deal rooms keep the Feed alive between searches.</p>
        </div>
        <button type="button" onClick={() => setCreating((value) => !value)} className="shrink-0 rounded-full bg-[#092243] px-4 py-2 text-sm text-white">Create group</button>
      </div>
      {creating && (
        <form onSubmit={submit} className="mt-4 grid gap-3 rounded-3xl bg-slate-50 p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Group name" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-hidden focus:border-[#2f7d32]" />
            <select value={draft.groupType} onChange={(event) => setDraft((current) => ({ ...current, groupType: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-hidden focus:border-[#2f7d32]">
              {['Area community', 'Role network', 'Professional circle', 'Deal community'].map((type) => <option key={type}>{type}</option>)}
            </select>
          </div>
          <input value={draft.area} onChange={(event) => setDraft((current) => ({ ...current, area: event.target.value }))} placeholder="Area or market" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-hidden focus:border-[#2f7d32]" />
          <textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="What should people use this group for?" className="resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-hidden focus:border-[#2f7d32]" />
          <button className="rounded-full bg-[#2f7d32] px-5 py-3 text-sm text-white">Create open group</button>
        </form>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {visibleGroups.map((group) => {
          const joined = memberGroupIds.includes(group.id);
          return (
            <article key={group.id} className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[#2670a8]">{group.groupType} · {group.area}</p>
                  <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">{group.name}</h3>
                </div>
                <span className="shrink-0 rounded-full bg-[#edf8ee] px-3 py-1 text-xs text-[#215d27]">{group.visibility}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{group.description}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">{group.memberCount} members · {group.postCount} posts</p>
                <button type="button" onClick={() => onJoinGroup(group.id)} className={`rounded-full px-4 py-2 text-sm ${joined ? 'bg-[#edf8ee] text-[#215d27]' : 'bg-[#092243] text-white'}`}>{joined ? 'Joined' : 'Join'}</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PerksRail({ partnerOffers, profile, onOpenOffer, compact = false }) {
  const role = profile.role || 'General';
  const matching = partnerOffers.filter((offer) => offer.eligibleRoles?.includes(role));
  const offers = (matching.length ? matching : partnerOffers).slice(0, compact ? 3 : partnerOffers.length);

  return (
    <section className="rounded-[1.75rem] border border-white bg-white/92 p-4 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">PERKS</p>
          <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">Useful when the timing is right</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Partner offers appear when they fit the move, listing, stay, deal, or portfolio moment.</p>
        </div>
        <Gift className="mt-1 h-5 w-5 text-[#2f7d32]" />
      </div>
      <div className="mt-4 grid gap-3">
        {offers.map((offer) => (
          <button key={offer.id} type="button" onClick={() => onOpenOffer(offer)} className="rounded-3xl border border-slate-200 bg-white p-4 text-left transition hover:border-[#2f7d32]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-[#2670a8]">{offer.category} · {offer.sponsoredStatus}</p>
                <h3 className="mt-1 text-base font-semibold text-slate-950">{offer.title}</h3>
              </div>
              <span className="shrink-0 rounded-full bg-[#edf8ee] px-3 py-1 text-xs text-[#215d27]">{offer.cta}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{offer.description}</p>
            <p className="mt-2 text-xs text-slate-400">{offer.reward}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function NativeAdCard({ ad, onOpen, onHide, onReport }) {
  if (!ad) return null;

  return (
    <article className="rounded-[1.75rem] border border-[#fed7aa] bg-[#fffaf2] p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs text-[#9a3412]">{ad.sponsoredStatus}</span>
            <span className="text-xs text-[#9a3412]/70">{ad.category}</span>
          </div>
          <h2 className="mt-3 text-2xl font-normal tracking-tight text-slate-950">{ad.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{ad.advertiserName}</p>
        </div>
        <Megaphone className="h-5 w-5 shrink-0 text-[#9a3412]" />
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-700">{ad.body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(ad.targetingSignals || []).map((signal) => <span key={signal} className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">{signal}</span>)}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onOpen(ad)} className="rounded-full bg-[#092243] px-4 py-2 text-sm text-white">Open offer</button>
        <button type="button" onClick={() => onHide(ad.id)} className="rounded-full bg-white px-4 py-2 text-sm text-slate-600">Hide</button>
        <button type="button" onClick={() => onReport({ id: ad.id, title: ad.title, postType: ad.category, sponsoredStatus: ad.sponsoredStatus })} className="rounded-full bg-white px-4 py-2 text-sm text-slate-600">Report</button>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#9a3412]">Labelled and capped. Paid visibility does not change trust or suitability.</p>
    </article>
  );
}

function AppHeroPanel({ profile, usageLimit, posts, shares, onPost }) {
  const remaining = Math.max(0, usageLimit.allowance - usageLimit.used);
  const livePosts = posts.length;
  const topPost = posts.find((post) => post.media?.[0]) || posts[0];

  return (
    <section className="overflow-hidden rounded-[2rem] bg-[#0b2a4a] text-white shadow-[0_30px_80px_-46px_rgba(9,34,67,0.95)]">
      <div className="grid gap-0 md:grid-cols-[1fr_18rem]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/12 px-3 py-1 text-xs text-white/82 ring-1 ring-white/12">Whole rental market</span>
            <span className="rounded-full bg-white/12 px-3 py-1 text-xs text-white/82 ring-1 ring-white/12">{roleOptions.length} roles connected</span>
            <span className="rounded-full bg-[#8bdc65] px-3 py-1 text-xs font-semibold text-[#092243]">{remaining} swipes left</span>
          </div>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-[0.95] tracking-tight sm:text-5xl">The rental market, live.</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">Demand, supply, services, stays, deals, capital, local insight, and trusted activity in one Feed.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/app/post" onClick={onPost} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#092243]">
              <PlusCircle className="h-4 w-4" />
              Post free
            </a>
            <a href="/app/swipe" className="inline-flex items-center gap-2 rounded-full bg-[#8bdc65] px-5 py-3 text-sm font-semibold text-[#092243]">
              <Flame className="h-4 w-4" />
              Swipe today
            </a>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-2 text-center">
            {[
              [livePosts, 'Live posts'],
              [shares.length, 'Shares'],
              [roleOptions.length, 'Roles'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/10">
                <p className="truncate text-lg font-semibold">{value}</p>
                <p className="mt-0.5 text-[0.68rem] text-white/55">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-56 overflow-hidden bg-[#154f79] md:min-h-full">
          {topPost?.media?.[0] ? (
            <img src={topPost.media[0]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-92" />
          ) : (
            <div className="absolute inset-0 bg-[#154f79]" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-[#06182f]/78 via-[#06182f]/12 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 rounded-3xl bg-white/92 p-4 text-[#092243] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.8)]">
            <p className="text-xs font-semibold text-[#2f7d32]">{topPost?.postType || 'Feed'}</p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold">{topPost?.title || 'Your Feed is ready'}</p>
            <p className="mt-1 text-xs text-slate-500">{topPost?.area || 'RentEazy network'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarketCommandPanel({ profile, usageLimit, posts, shares, answers, onSelectTab }) {
  const remaining = Math.max(0, usageLimit.allowance - usageLimit.used);
  const match = getMatchSummary(profile, answers);
  const quickLanes = [
    ['Properties', 'Homes, rooms, stays'],
    ['Looking', 'Demand and briefs'],
    ['Operators', 'Hosts and operators'],
    ['Investors', 'Capital and deals'],
  ];

  return (
    <section className="rounded-[1.75rem] border border-white bg-white/92 p-4 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">MARKET COMMAND</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{displayRole(profile.role)}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">Pick a lane, post a signal, or swipe the market.</p>
          </div>
          <a href="/app/profile" className="shrink-0 rounded-full bg-[#edf7ff] px-3 py-2 text-xs text-[#154f79]">Role</a>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            [remaining, 'Swipes'],
            [posts.length, 'Posts'],
            [shares.length, 'Shares'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-slate-50 px-3 py-3">
              <p className="text-lg font-semibold text-slate-950">{value}</p>
              <p className="mt-0.5 text-[0.68rem] text-slate-500">{label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-[#f4fff5] p-3 ring-1 ring-[#cfeeda]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#123d22]">{match.score}% match readiness</p>
              <p className="mt-1 truncate text-xs text-[#1f6b35]">{match.badges.join(' · ')}</p>
            </div>
            <a href="/app/profile" className="shrink-0 rounded-full bg-[#092243] px-3 py-2 text-xs text-white">Improve</a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {quickLanes.map(([tab, body]) => (
            <button key={tab} type="button" onClick={() => onSelectTab(tab)} className="rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-[#2f7d32]">
              <span className="block text-sm font-medium text-slate-950">{tab}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{body}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ActivityInbox({ usageLimit, posts, shares, reports, boosts, profile }) {
  const remaining = Math.max(0, usageLimit.allowance - usageLimit.used);
  const latestOwnPost = posts.find((post) => post.authorId === currentUser.id || post.authorName === profile.name);
  const items = [
    { id: 'swipes-ready', title: 'Your daily swipes are ready.', body: `${remaining} swipes left today.`, tone: 'green' },
    { id: 'profile-match', title: 'Better matches are available.', body: 'Answer 3 quick questions to improve your match explanations.', tone: 'blue' },
    latestOwnPost ? { id: 'post-traction', title: 'Your latest post is live.', body: 'Share it externally for 5 extra swipes today.', tone: 'green' } : { id: 'first-post', title: 'Post something useful.', body: 'A listing, search, question, deal, stay, or area insight starts your activity loop.', tone: 'blue' },
    shares.length ? { id: 'share-reward', title: 'Share reward tracked.', body: `${shares.length} share intent${shares.length === 1 ? '' : 's'} saved.`, tone: 'green' } : { id: 'share-open', title: 'Share Everywhere is ready.', body: 'Copy a caption, use a tracking link, and reward the share.', tone: 'blue' },
    boosts.length ? { id: 'boost-active', title: 'Boost campaign active.', body: `${boosts.length} boost record${boosts.length === 1 ? '' : 's'} on this account.`, tone: 'green' } : { id: 'boost-ready', title: 'Boosts start from 29p.', body: 'Visibility is paid; trust still comes from behaviour.', tone: 'blue' },
    reports.length ? { id: 'reports', title: 'Reports queued.', body: `${reports.length} report${reports.length === 1 ? '' : 's'} awaiting review.`, tone: 'red' } : { id: 'safety', title: 'Safety queue is quiet.', body: 'Report buttons work on normal and sponsored posts.', tone: 'blue' },
  ];

  return (
    <div className="rounded-3xl border border-white bg-white/86 p-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.45)]">
      <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">ACTIVITY</p>
      <div className="mt-4 space-y-2">
        {items.slice(0, 4).map((item) => (
          <div key={item.id} className="rounded-2xl bg-slate-50 px-3 py-3">
            <p className="text-sm font-medium text-slate-950">{item.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleLanesPanel({ profile, onSelectTab }) {
  const lanes = getRoleMarketLanes(profile.role);

  return (
    <div className="rounded-3xl border border-white bg-white/86 p-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">MARKET LANES</p>
          <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">Whole-market Feed</h2>
          <p className="mt-1 text-sm text-slate-500">Role-aware, but never one-sided.</p>
        </div>
        <a href="/app/profile" className="rounded-full bg-[#edf7ff] px-3 py-1 text-xs text-[#154f79]">Change role</a>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {roleMarketLanes.General.map(([title, body, tab]) => (
          <button key={`general-${title}`} type="button" onClick={() => onSelectTab(tab)} className="rounded-2xl bg-[#092243] p-3 text-left text-white shadow-[0_14px_30px_-24px_rgba(9,34,67,0.9)]">
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-xs leading-5 text-white/62">{body}</p>
          </button>
        ))}
        {lanes.map(([title, body, tab]) => (
          <button key={title} type="button" onClick={() => onSelectTab(tab)} className="rounded-2xl border border-slate-200 bg-white p-3 text-left hover:border-[#2f7d32]">
            <p className="text-sm font-medium text-slate-950">{title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{body}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function TractionPanel({ posts, likedIds, savedIds, shares, comments, onBoost }) {
  const ownPosts = posts.filter((post) => post.authorId === currentUser.id || post.authorName === currentUser.name);
  const traction = {
    posts: ownPosts.length,
    likes: likedIds.length,
    saves: savedIds.length,
    shares: shares.length,
    comments: comments.length,
  };

  return (
    <div className="rounded-3xl border border-white bg-white/86 p-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">TRACTION</p>
          <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">Your signals</h2>
        </div>
        <button type="button" onClick={() => onBoost('post-bump-small')} className="rounded-full bg-[#092243] px-4 py-2 text-sm text-white">Boost from 29p</button>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
        {Object.entries(traction).map(([key, value]) => (
          <div key={key} className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xl text-slate-950">{value}</p>
            <p className="capitalize text-slate-500">{key}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdsInventoryPanel({ onBoost }) {
  const inventory = [
    ['Sponsored Feed posts', 'Labelled sponsored posts inside the free Feed.'],
    ['Boosted swipe cards', 'Relevant cards can get extra visibility without changing suitability.'],
    ['Area spotlight starter', 'A small business starter route for local reach.'],
  ];

  return (
    <div className="rounded-3xl border border-[#d5ecd7] bg-[#edf8ee] p-4 text-[#215d27] shadow-[0_14px_34px_-28px_rgba(15,23,42,0.35)]">
      <p className="font-['JetBrains_Mono',monospace] text-xs">RENTEAZY ADS</p>
      <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">Reach rental intent</h2>
      <div className="mt-4 space-y-2">
        {inventory.map(([title, body]) => (
          <div key={title} className="rounded-2xl bg-white/72 p-3">
            <p className="text-sm font-medium text-slate-950">{title}</p>
            <p className="mt-1 text-xs leading-5 text-[#215d27]">{body}</p>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onBoost('sponsored-post-starter')} className="mt-4 inline-flex w-full justify-center rounded-full bg-[#2f7d32] px-5 py-3 text-sm text-white">Sponsored starter for 99p</button>
    </div>
  );
}

function ReputationScoreCard({ reputationProfile }) {
  const profile = reputationProfile || defaultReputationProfile;
  const components = profile.components || {};

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white/92 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <div className="bg-[#092243] p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-['JetBrains_Mono',monospace] text-xs text-[#8fd0ff]">RENTEAZY REPUTATION SCORE</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight">{profile.score}</h2>
            <p className="mt-1 text-sm text-white/68">{profile.tier} tier · built from behaviour, not payment</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/14">
            <ShieldCheck className="h-7 w-7 text-[#8bdc65]" />
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/12">
          <div className="h-full rounded-full bg-linear-to-r from-[#8bdc65] to-[#8fd0ff]" style={{ width: `${profile.score}%` }}></div>
        </div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {[
            [components.matchCount || 0, 'Matches'],
            [components.viewingCount || 0, 'Viewings'],
            [components.reviewCount || 0, 'Reviews'],
            [components.answeredCount || 0, 'Answers'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-3 text-center">
              <p className="text-xl text-slate-950">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(profile.badges || []).map((badge) => <span key={badge} className="rounded-full bg-[#edf7ff] px-3 py-1 text-xs text-[#154f79]">{badge}</span>)}
        </div>
        {profile.missingFields?.length > 0 && (
          <p className="mt-4 text-sm leading-6 text-slate-600">Improve this by adding: {profile.missingFields.join(', ')}.</p>
        )}
      </div>
    </section>
  );
}

function MatchPipelinePanel({ matches, messages, viewings, reviews, onSendMessage, onRequestViewing, onSubmitReview }) {
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id || '');
  const [messageBody, setMessageBody] = useState('');
  const [viewingAt, setViewingAt] = useState(() => new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [viewingNotes, setViewingNotes] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [rating, setRating] = useState(5);
  const selectedMatch = matches.find((match) => match.id === selectedMatchId) || matches[0];
  const matchMessages = selectedMatch ? messages.filter((message) => message.matchId === selectedMatch.id).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) : [];
  const matchViewings = selectedMatch ? viewings.filter((viewing) => viewing.matchId === selectedMatch.id) : [];
  const matchReviews = selectedMatch ? reviews.filter((review) => review.matchId === selectedMatch.id) : [];

  useEffect(() => {
    if (!selectedMatchId && matches[0]?.id) setSelectedMatchId(matches[0].id);
  }, [matches, selectedMatchId]);

  if (!matches.length) {
    return (
      <section className="rounded-[1.75rem] border border-white bg-white/92 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
        <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">MATCH PIPELINE</p>
        <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">No mutual matches yet</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Like or Superlike a suitable swipe card. Chat opens only after a mutual match.</p>
        <a href="/app/swipe" className="mt-4 inline-flex rounded-full bg-[#2f7d32] px-5 py-3 text-sm text-white">Open Swipe</a>
      </section>
    );
  }

  const submitMessage = (event) => {
    event.preventDefault();
    const clean = messageBody.trim();
    if (!clean || !selectedMatch) return;
    onSendMessage(selectedMatch.id, clean);
    setMessageBody('');
  };

  const submitViewing = (event) => {
    event.preventDefault();
    if (!selectedMatch) return;
    onRequestViewing(selectedMatch.id, {
      scheduledFor: new Date(viewingAt).toISOString(),
      mode: 'In-person',
      location: selectedMatch.subjectTitle,
      notes: viewingNotes.trim(),
    });
    setViewingNotes('');
  };

  const submitReview = (event) => {
    event.preventDefault();
    if (!selectedMatch) return;
    onSubmitReview(selectedMatch.id, {
      rating,
      tags: rating >= 4 ? ['Responsive', 'Useful interaction'] : ['Needs follow-up'],
      body: reviewBody.trim(),
    });
    setReviewBody('');
  };

  return (
    <section className="rounded-[1.75rem] border border-white bg-white/92 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">MATCH PIPELINE</p>
          <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">Match → Chat → Viewing → Review</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Messages open only after mutual interest. Viewings and feedback build reputation.</p>
        </div>
        <span className="rounded-full bg-[#edf8ee] px-3 py-1 text-xs text-[#215d27]">{matches.length} active</span>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {matches.map((match) => (
          <button key={match.id} type="button" onClick={() => setSelectedMatchId(match.id)} className={`min-w-56 rounded-2xl border p-3 text-left ${selectedMatch?.id === match.id ? 'border-[#2f7d32] bg-[#edf8ee]' : 'border-slate-200 bg-white'}`}>
            <p className="truncate text-sm font-medium text-slate-950">{match.subjectTitle}</p>
            <p className="mt-1 text-xs text-slate-500">{match.score}% fit · {match.status.replace(/_/g, ' ')}</p>
          </button>
        ))}
      </div>
      {selectedMatch && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_18rem]">
          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="flex flex-wrap gap-2">
              {selectedMatch.reasonBadges.map((badge) => <span key={badge} className="rounded-full bg-white px-3 py-1 text-xs text-slate-600">{badge}</span>)}
            </div>
            <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
              {matchMessages.map((message) => (
                <div key={message.id} className={`rounded-2xl p-3 ${message.authorId === currentUser.id ? 'bg-[#edf8ee]' : 'bg-white'}`}>
                  <p className="text-sm leading-6 text-slate-800">{message.body}</p>
                  <p className="mt-1 text-xs text-slate-400">{message.authorName} · {new Date(message.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ))}
            </div>
            <form onSubmit={submitMessage} className="mt-4 flex gap-2">
              <input value={messageBody} onChange={(event) => setMessageBody(event.target.value)} placeholder="Write a match message" className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-hidden focus:border-[#2f7d32]" />
              <button className="rounded-full bg-[#2f7d32] px-4 py-3 text-sm text-white"><Send className="h-4 w-4" /></button>
            </form>
          </div>
          <div className="space-y-3">
            <form onSubmit={submitViewing} className="rounded-3xl border border-[#d5ecd7] bg-[#edf8ee] p-4">
              <div className="flex items-center gap-2 text-[#215d27]"><CalendarCheck className="h-4 w-4" /><p className="text-sm font-medium">Request viewing</p></div>
              <input type="datetime-local" value={viewingAt} onChange={(event) => setViewingAt(event.target.value)} className="mt-3 w-full rounded-2xl border border-[#c6e5c9] bg-white px-3 py-2 text-sm text-slate-900" />
              <textarea value={viewingNotes} onChange={(event) => setViewingNotes(event.target.value)} rows={2} placeholder="Windows, questions, notes" className="mt-2 w-full resize-none rounded-2xl border border-[#c6e5c9] bg-white px-3 py-2 text-sm text-slate-900" />
              <button className="mt-3 w-full rounded-full bg-[#2f7d32] px-4 py-2 text-sm text-white">Request</button>
              {matchViewings.length > 0 && <p className="mt-2 text-xs leading-5 text-[#215d27]">{matchViewings.length} viewing record{matchViewings.length === 1 ? '' : 's'} saved.</p>}
            </form>
            <form onSubmit={submitReview} className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-[#154f79]"><Star className="h-4 w-4" /><p className="text-sm font-medium">Double-sided review</p></div>
              <select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
                {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
              </select>
              <textarea value={reviewBody} onChange={(event) => setReviewBody(event.target.value)} rows={2} placeholder="Private until both sides submit" className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
              <button className="mt-3 w-full rounded-full bg-[#092243] px-4 py-2 text-sm text-white">Submit feedback</button>
              {matchReviews.length > 0 && <p className="mt-2 text-xs text-slate-500">{matchReviews.length} review submitted.</p>}
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function TrustReputationPanel({ reports, comments, profile }) {
  const verifiedActions = comments.filter((comment) => comment.authorId === profile.id || comment.authorId === currentUser.id).length;

  return (
    <div className="rounded-3xl border border-white bg-white/86 p-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.45)]">
      <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">REPUTATION</p>
      <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">Trust is behavioural</h2>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xl text-slate-950">{verifiedActions}</p><p className="text-slate-500">Useful replies</p></div>
        <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xl text-slate-950">{reports.length}</p><p className="text-slate-500">Reports</p></div>
        <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xl text-slate-950">0</p><p className="text-slate-500">Verified feedback</p></div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">Paid visibility does not change trust, fit, referencing, approval, or reputation.</p>
    </div>
  );
}

function MiniShopPanel({ onSelectProduct, compact = false }) {
  const products = compact ? microProducts.slice(0, 4) : microProducts;

  return (
    <div className="rounded-[1.75rem] border border-white bg-white/86 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">MINI SHOP</p>
      <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">Tiny upgrades</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Most boosts and actions are under £1. Credits keep tiny actions simple and transparent.</p>
      <div className="mt-4 grid gap-2">
        {products.map((product) => (
          <button key={product.id} type="button" onClick={() => onSelectProduct(product.id)} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left hover:border-[#2f7d32]">
            <span>
              <span className="block text-sm font-medium text-slate-950">{product.name}</span>
              <span className="block text-xs text-slate-500">{product.description}</span>
            </span>
            <span className="shrink-0 rounded-full bg-[#edf8ee] px-3 py-1 text-xs text-[#215d27]">{product.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ClerkBillingSurface() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return (
      <div className="rounded-[1.75rem] border border-[#d5ecd7] bg-[#edf8ee] p-5 text-[#215d27]">
        <p className="font-['JetBrains_Mono',monospace] text-xs">BILLING</p>
        <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">Sign in to manage plans.</h2>
        <p className="mt-2 text-sm leading-6">Plans, seats, upgrades, and billing are handled securely inside your RentEazy account.</p>
        <SignInButton mode="modal" fallbackRedirectUrl="/app/billing">
          <button type="button" className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#2f7d32] px-5 py-3 text-sm text-white">Sign in</button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white bg-white p-3 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <PricingTable appearance={clerkAppearance} />
    </div>
  );
}

function BillingPanel({ onSelectProduct, purchases, boosts, wallet }) {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2rem] bg-[#092243] p-6 text-white shadow-[0_28px_70px_-46px_rgba(9,34,67,0.95)]">
        <p className="font-['JetBrains_Mono',monospace] text-xs text-[#8fd0ff]">BILLING</p>
        <h1 className="mt-3 text-4xl font-semibold leading-[0.96] tracking-tight">Plans, boosts, credits, and Protect.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">Free users create liquidity. Paid users remove friction. Businesses pay for labelled reach. Paid visibility never replaces suitability or trust.</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {[
            [`${wallet.balance}`, 'Credits'],
            [`${purchases.length}`, 'Purchases'],
            [`${boosts.length}`, 'Boosts'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-2xl font-semibold">{value}</p>
              <p className="mt-1 text-xs text-white/55">{label}</p>
            </div>
          ))}
        </div>
      </section>
      {clerkEnabled ? (
        <ClerkBillingSurface />
      ) : (
        <div className="rounded-[1.75rem] border border-[#fed7aa] bg-[#fff7ed] p-5 text-[#9a3412]">
          <p className="font-['JetBrains_Mono',monospace] text-xs">BILLING SETUP</p>
          <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">Billing is ready to connect.</h2>
          <p className="mt-2 text-sm leading-6">Add the account and billing keys for launch. The local mini shop remains available for development until live billing products are configured.</p>
        </div>
      )}
      <MiniShopPanel onSelectProduct={onSelectProduct} />
    </div>
  );
}

function MicroUpsellModal({ product, onClose, onConfirm, billingEnabled = false }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-90 flex items-end justify-center bg-[#06182f]/58 p-4 backdrop-blur-xs sm:items-center">
      <div className="w-full max-w-md rounded-4xl border border-white bg-white p-5 shadow-[0_30px_90px_-45px_rgba(0,0,0,0.65)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">{product.category.toUpperCase()}</p>
            <h2 className="mt-2 text-3xl font-normal tracking-tight text-slate-950">{product.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{product.description}</p>
          </div>
          <button type="button" onClick={onClose} className="h-10 w-10 rounded-full border border-slate-200 text-slate-500">×</button>
        </div>
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Price</p>
          <p className="mt-1 text-3xl font-normal text-slate-950">{product.price}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">Costs are shown plainly and not hidden behind credits.</p>
        </div>
        {billingEnabled ? (
          <a href={`/app/billing?sku=${encodeURIComponent(product.sku)}`} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#2f7d32] px-5 py-3 text-sm text-white">Open billing</a>
        ) : (
          <button type="button" onClick={() => onConfirm(product)} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#2f7d32] px-5 py-3 text-sm text-white">Add to local account</button>
        )}
      </div>
    </div>
  );
}

function BoostPerformanceCard({ boosts, onBoost }) {
  const activeBoosts = boosts.filter((boost) => boost.status === 'active');
  const totals = boosts.reduce((acc, boost) => ({
    impressions: acc.impressions + boost.impressions,
    clicks: acc.clicks + boost.clicks,
    likes: acc.likes + boost.likes,
    saves: acc.saves + boost.saves,
    matches: acc.matches + boost.matches,
  }), { impressions: 0, clicks: 0, likes: 0, saves: 0, matches: 0 });

  return (
    <div className="rounded-[1.75rem] border border-white bg-white/86 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">BOOSTS</p>
      <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">{activeBoosts.length} active</h2>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {Object.entries(totals).map(([key, value]) => (
          <div key={key} className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xl text-slate-950">{value}</p>
            <p className="capitalize text-slate-500">{key}</p>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onBoost('post-bump-small')} className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#092243] px-5 py-3 text-sm text-white">Boost post from 29p</button>
    </div>
  );
}

function ModerationQueueCard({ reports }) {
  return (
    <div className="rounded-[1.75rem] border border-white bg-white/86 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <p className="font-['JetBrains_Mono',monospace] text-xs text-[#ef4444]">MODERATION</p>
      <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">{reports.length} reports</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Reports are queued for review. Sponsored posts use the same report flow.</p>
    </div>
  );
}

function FeedPostCard({ post, liked, saved, followed, commentCount, onLike, onSave, onFollow, onShare, onComment, onBoost, onHide, onReport }) {
  const image = post.media?.[0];

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-white bg-white/88 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      {image && <img src={image} alt="" className="h-56 w-full object-cover" loading="lazy" />}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#edf7ff] px-3 py-1 text-xs text-[#154f79]">{post.postType}</span>
              {post.sponsoredStatus && <span className="rounded-full bg-[#fff7ed] px-3 py-1 text-xs text-[#9a3412]">{post.sponsoredStatus}</span>}
              <span className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
            </div>
            <h2 className="mt-3 text-2xl font-normal tracking-tight text-slate-950">{post.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{post.authorName} · {post.authorType}</p>
          </div>
          <button type="button" onClick={() => onFollow(post.authorId)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs ${followed ? 'bg-[#edf8ee] text-[#215d27]' : 'border border-slate-200 bg-white text-slate-600'}`}>
            <UserPlus className="h-3.5 w-3.5" />
            {followed ? 'Following' : 'Follow'}
          </button>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-700">{post.body}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
          {post.area && <span className="rounded-2xl bg-slate-50 px-3 py-2"><MapPin className="mr-1 inline h-4 w-4 text-[#2670a8]" />{post.area}</span>}
          {post.budget && <span className="rounded-2xl bg-slate-50 px-3 py-2">{post.budget}</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">{tag}</span>)}
        </div>
        <div className="mt-5 grid grid-cols-6 gap-1 rounded-2xl bg-slate-50 p-1.5">
          <button type="button" onClick={() => onLike(post.id)} className={`rounded-xl px-2 py-2 text-xs ${liked ? 'bg-[#edf8ee] text-[#215d27]' : 'text-slate-600'}`}><Heart className={`mx-auto h-4 w-4 ${liked ? 'fill-current' : ''}`} />{post.likeCount + (liked ? 1 : 0)}</button>
          <button type="button" onClick={() => onComment(post)} className="rounded-xl px-2 py-2 text-xs text-slate-600"><MessageCircle className="mx-auto h-4 w-4" />{commentCount}</button>
          <button type="button" onClick={() => onSave(post.id)} className={`rounded-xl px-2 py-2 text-xs ${saved ? 'bg-[#edf7ff] text-[#154f79]' : 'text-slate-600'}`}><Bookmark className={`mx-auto h-4 w-4 ${saved ? 'fill-current' : ''}`} />{post.saveCount + (saved ? 1 : 0)}</button>
          <button type="button" onClick={() => onShare(post)} className="rounded-xl px-2 py-2 text-xs text-slate-600"><Share2 className="mx-auto h-4 w-4" />{post.shareCount}</button>
          <button type="button" onClick={() => onBoost(post)} className="rounded-xl px-2 py-2 text-xs text-slate-600"><ArrowUp className="mx-auto h-4 w-4" />Boost</button>
          <button type="button" onClick={() => onReport(post)} className="rounded-xl px-2 py-2 text-xs text-slate-600"><Flag className="mx-auto h-4 w-4" />Report</button>
        </div>
        {post.sponsoredStatus && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-[#fed7aa] bg-[#fff7ed] px-3 py-2 text-xs text-[#9a3412]">
            <span>{post.sponsoredStatus} content is labelled and reportable.</span>
            <button type="button" onClick={() => onHide(post.id)} className="rounded-full bg-white px-3 py-1">Hide ad</button>
          </div>
        )}
      </div>
    </article>
  );
}

function RentEazyAppShell() {
  const path = typeof window === 'undefined' ? '/app/feed' : window.location.pathname;
  const routeTab = path.includes('/billing') ? 'Billing' : path.includes('/post') ? 'Post' : path.includes('/likes') ? 'Likes' : path.includes('/profile') ? 'Profile' : path.includes('/swipe') ? 'Swipe' : 'Feed';
  const [activeFeedTab, setActiveFeedTab] = useStoredState('renteazy-feed-tab', 'For You');
  const [posts, setPosts] = useStoredState('renteazy-feed-posts', seededFeedPosts);
  const [likedIds, setLikedIds] = useStoredState('renteazy-liked-posts', []);
  const [savedIds, setSavedIds] = useStoredState('renteazy-saved-posts', []);
  const [followedIds, setFollowedIds] = useStoredState('renteazy-followed-authors', []);
  const [shares, setShares] = useStoredState('renteazy-post-shares', []);
  const [reports, setReports] = useStoredState('renteazy-reports', []);
  const [comments, setComments] = useStoredState('renteazy-post-comments', []);
  const [hiddenPostIds, setHiddenPostIds] = useStoredState('renteazy-hidden-posts', []);
  const [profile, setProfile] = useStoredState('renteazy-app-profile', defaultAppProfile);
  const [answers, setAnswers] = useStoredState('renteazy-match-answers', {});
  const [usageLimit, setUsageLimit] = useStoredState('renteazy-daily-swipes', defaultUsageLimit);
  const [entitlements, setEntitlements] = useStoredState('renteazy-entitlements', []);
  const [purchases, setPurchases] = useStoredState('renteazy-purchases', []);
  const [boosts, setBoosts] = useStoredState('renteazy-boost-campaigns', []);
  const [appStreak, setAppStreak] = useStoredState('renteazy-app-streak', defaultAppStreak);
  const [wallet, setWallet] = useStoredState('renteazy-wallet', { id: 'wallet-demo-user', userId: currentUser.id, balance: 0, updatedAt: new Date().toISOString() });
  const [groups, setGroups] = useStoredState('renteazy-groups', seededGroups);
  const [groupMemberships, setGroupMemberships] = useStoredState('renteazy-group-memberships', [{ id: 'membership-demo-east-london', groupId: 'group-east-london-renters', userId: currentUser.id, role: 'member', createdAt: new Date().toISOString() }]);
  const [partnerOffers, setPartnerOffers] = useStoredState('renteazy-partner-offers', seededPartnerOffers);
  const [feedAds, setFeedAds] = useStoredState('renteazy-feed-ads', seededFeedAds);
  const [behavioralEvents, setBehavioralEvents] = useStoredState('renteazy-behavioral-events', []);
  const [hiddenAdIds, setHiddenAdIds] = useStoredState('renteazy-hidden-ads', []);
  const [matches, setMatches] = useStoredState('renteazy-matches', seededMatches);
  const [matchMessages, setMatchMessages] = useStoredState('renteazy-match-messages', seededMatchMessages);
  const [viewings, setViewings] = useStoredState('renteazy-viewings', seededViewings);
  const [reviews, setReviews] = useStoredState('renteazy-reviews', []);
  const [reputationProfile, setReputationProfile] = useStoredState('renteazy-reputation-profile', defaultReputationProfile);
  const [openedOfferId, setOpenedOfferId] = useState('');
  const [sharePost, setSharePost] = useState(null);
  const [reportPost, setReportPost] = useState(null);
  const [commentPost, setCommentPost] = useState(null);
  const [upsellProductId, setUpsellProductId] = useState(null);
  const [dismissedUpsells, setDismissedUpsells] = useState([]);
  const [newPost, setNewPost] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const profileSyncRef = useRef('');
  const answersSyncRef = useRef('');
  const remainingSwipes = Math.max(0, usageLimit.allowance - usageLimit.used);
  const activeUpsellProduct = microProducts.find((product) => product.id === upsellProductId);
  const dailyPicks = heroSwipeCards.slice(0, 3);

  const applyApiState = (state) => {
    if (!state) return;
    if (state.posts) setPosts(state.posts);
    if (state.likedIds) setLikedIds(state.likedIds);
    if (state.savedIds) setSavedIds(state.savedIds);
    if (state.followedIds) setFollowedIds(state.followedIds);
    if (state.hiddenPostIds) setHiddenPostIds(state.hiddenPostIds);
    if (state.comments) setComments(state.comments);
    if (state.shares) setShares(state.shares);
    if (state.reports) setReports(state.reports);
    if (state.profile) setProfile(state.profile);
    if (state.answers) setAnswers(state.answers);
    if (state.usageLimit) setUsageLimit(state.usageLimit);
    if (state.entitlements) setEntitlements(state.entitlements);
    if (state.purchases) setPurchases(state.purchases);
    if (state.boosts) setBoosts(state.boosts);
    if (state.wallet) setWallet(state.wallet);
    if (state.appStreak) setAppStreak(state.appStreak);
    if (state.groups) setGroups(state.groups);
    if (state.groupMemberships) setGroupMemberships(state.groupMemberships);
    if (state.partnerOffers) setPartnerOffers(state.partnerOffers);
    if (state.feedAds) setFeedAds(state.feedAds);
    if (state.behavioralEvents) setBehavioralEvents(state.behavioralEvents);
    if (state.matches) setMatches(state.matches);
    if (state.matchMessages) setMatchMessages(state.matchMessages);
    if (state.viewings) setViewings(state.viewings);
    if (state.reviews) setReviews(state.reviews);
    if (state.reputationProfile) setReputationProfile(state.reputationProfile);
  };

  const syncApiState = async (promise) => {
    try {
      const state = await promise;
      applyApiState(state.state || state);
      setBackendStatus('connected');
      return state;
    } catch (error) {
      setBackendStatus('offline');
      return null;
    }
  };

  useEffect(() => {
    syncApiState(apiRequest('/api/bootstrap'));
  }, []);

  useEffect(() => {
    if (backendStatus !== 'connected') return;
    const editableProfile = {
      name: profile.name,
      role: profile.role,
      area: profile.area,
      budget: profile.budget,
      moveDate: profile.moveDate,
      lookingFor: profile.lookingFor,
    };
    const payload = JSON.stringify(editableProfile);
    if (profileSyncRef.current === payload) return;
    profileSyncRef.current = payload;
    const timer = window.setTimeout(() => {
      syncApiState(apiRequest('/api/profile', { method: 'PATCH', body: editableProfile }));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [backendStatus, profile]);

  useEffect(() => {
    if (backendStatus !== 'connected') return;
    const payload = JSON.stringify(answers);
    if (answersSyncRef.current === payload) return;
    answersSyncRef.current = payload;
    const timer = window.setTimeout(() => {
      syncApiState(apiRequest('/api/answers', { method: 'PATCH', body: { answers } }));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [answers, backendStatus]);

  useEffect(() => {
    const now = Date.now();
    if (new Date(usageLimit.resetsAt).getTime() <= now) {
      setUsageLimit((current) => ({
        ...current,
        used: 0,
        resetsAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      }));
    }
  }, [setUsageLimit, usageLimit.resetsAt]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const last = String(appStreak.lastActivityAt || '').slice(0, 10);
    if (today !== last) {
      setAppStreak((current) => ({
        ...current,
        count: current.count + 1,
        lastActivityAt: new Date().toISOString(),
      }));
    }
  }, [appStreak.lastActivityAt, setAppStreak]);

  const addPost = async (post) => {
    setPosts((current) => [post, ...current]);
    setNewPost(post);
    setSharePost(post);
    const savedPost = await syncApiState(apiRequest('/api/posts', { method: 'POST', body: post }));
    if (savedPost?.id) {
      setNewPost(savedPost);
      setSharePost(savedPost);
    }
  };

  const openUpsell = (productId) => {
    if (dismissedUpsells.includes(productId)) return;
    setUpsellProductId(productId);
  };

  const closeUpsell = () => {
    if (upsellProductId) setDismissedUpsells((current) => [...new Set([...current, upsellProductId])]);
    setUpsellProductId(null);
  };

  const toggleId = (setter, id) => {
    setter((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const trackBehaviorEvent = (eventType, targetType = 'app', targetId = '', metadata = {}) => {
    const event = {
      id: createPostId(),
      userId: profile.id || currentUser.id,
      eventType,
      targetType,
      targetId,
      metadata,
      createdAt: new Date().toISOString(),
    };
    setBehavioralEvents((current) => [event, ...current].slice(0, 100));
    syncApiState(apiRequest('/api/events', { method: 'POST', body: event }));
    return event;
  };

  const joinGroup = (groupId) => {
    const existing = groupMemberships.find((item) => item.groupId === groupId);
    if (existing) {
      setGroupMemberships((current) => current.filter((item) => item.groupId !== groupId));
      setGroups((current) => current.map((group) => group.id === groupId ? { ...group, memberCount: Math.max(0, group.memberCount - 1) } : group));
    } else {
      setGroupMemberships((current) => [{ id: createPostId(), groupId, userId: profile.id || currentUser.id, role: 'member', createdAt: new Date().toISOString() }, ...current]);
      setGroups((current) => current.map((group) => group.id === groupId ? { ...group, memberCount: group.memberCount + 1 } : group));
    }
    syncApiState(apiRequest(`/api/groups/${groupId}/join`, { method: 'POST' }));
  };

  const createGroup = (draft) => {
    const group = {
      id: createPostId(),
      name: draft.name.trim(),
      groupType: draft.groupType,
      area: draft.area.trim() || profile.area || 'UK',
      description: draft.description.trim(),
      visibility: 'open',
      memberCount: 1,
      postCount: 0,
      roles: profile.role ? [profile.role] : ['General'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setGroups((current) => [group, ...current]);
    setGroupMemberships((current) => [{ id: createPostId(), groupId: group.id, userId: profile.id || currentUser.id, role: 'owner', createdAt: new Date().toISOString() }, ...current]);
    syncApiState(apiRequest('/api/groups', { method: 'POST', body: group }));
  };

  const openPartnerOffer = (offer) => {
    setOpenedOfferId(offer.id);
    trackBehaviorEvent('partner_offer_opened', 'partner_offer', offer.id, { category: offer.category, lifecycleTrigger: offer.lifecycleTrigger });
  };

  const openNativeAd = (ad) => {
    trackBehaviorEvent('native_ad_opened', 'feed_ad', ad.id, { category: ad.category, sponsoredStatus: ad.sponsoredStatus });
  };

  const hideNativeAd = (adId) => {
    setHiddenAdIds((current) => [...new Set([...current, adId])]);
    trackBehaviorEvent('native_ad_hidden', 'feed_ad', adId);
  };

  const reportNativeAd = (ad) => {
    const report = {
      id: createPostId(),
      reporterId: currentUser.id,
      targetType: 'feed_ad',
      targetId: ad.id,
      reason: 'Other',
      details: `${ad.sponsoredStatus || 'Sponsored'} card reported from Feed`,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    setReports((current) => [report, ...current]);
    trackBehaviorEvent('native_ad_reported', 'feed_ad', ad.id, { category: ad.category });
  };

  const trackShare = (postId, channel) => {
    const record = {
      id: createPostId(),
      postId,
      userId: currentUser.id,
      channel,
      trackingUrl: getTrackingUrl(postId, channel),
      rewardGranted: true,
      createdAt: new Date().toISOString(),
    };
    setShares((current) => [record, ...current]);
    setPosts((current) => current.map((post) => post.id === postId ? { ...post, shareCount: post.shareCount + 1 } : post));
    setUsageLimit((current) => ({ ...current, allowance: current.allowance + 5 }));
    syncApiState(apiRequest(`/api/posts/${postId}/share`, { method: 'POST', body: record }));
  };

  const addComment = (postId, body) => {
    const comment = {
      id: createPostId(),
      postId,
      authorId: profile.id || currentUser.id,
      authorName: profile.name || currentUser.name,
      body,
      createdAt: new Date().toISOString(),
    };
    setComments((current) => [comment, ...current]);
    syncApiState(apiRequest(`/api/posts/${postId}/comment`, { method: 'POST', body: comment }));
  };

  const handleSwipeAction = (action, card = {}) => {
    setUsageLimit((current) => ({ ...current, used: Math.min(current.allowance, current.used + 1) }));
    if (action === 'superlike') openUpsell('superlike-1');
    syncApiState(apiRequest('/api/swipes', {
      method: 'POST',
      body: {
        action,
        targetType: 'swipe_card',
        targetId: card.id,
        subjectTitle: card.title,
        score: card.matchScore,
        reasonBadges: card.badges,
        missingInfo: ['Confirm viewing availability'],
        counterpartId: `source-${card.id || 'card'}`,
        counterpartName: card.type === 'room' || card.type === 'flat' || card.type === 'studio' ? 'Listing source' : 'RentEazy member',
        counterpartType: card.type || 'Member',
      },
    }));
  };

  const sendMatchMessage = (matchId, body) => {
    const message = {
      id: createPostId(),
      matchId,
      authorId: profile.id || currentUser.id,
      authorName: profile.name || currentUser.name,
      body,
      createdAt: new Date().toISOString(),
    };
    setMatchMessages((current) => [message, ...current]);
    syncApiState(apiRequest(`/api/matches/${matchId}/messages`, { method: 'POST', body: message }));
  };

  const requestViewing = (matchId, payload) => {
    const match = matches.find((item) => item.id === matchId);
    const viewing = {
      id: createPostId(),
      matchId,
      requesterId: profile.id || currentUser.id,
      participantIds: match?.participantIds || [profile.id || currentUser.id],
      subjectTitle: match?.subjectTitle || 'RentEazy match',
      scheduledFor: payload.scheduledFor,
      status: 'requested',
      mode: payload.mode,
      location: payload.location,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setViewings((current) => [viewing, ...current]);
    setMatches((current) => current.map((item) => item.id === matchId ? { ...item, status: 'viewing_requested', updatedAt: new Date().toISOString() } : item));
    syncApiState(apiRequest(`/api/matches/${matchId}/viewings`, { method: 'POST', body: viewing }));
  };

  const submitMatchReview = (matchId, payload) => {
    const match = matches.find((item) => item.id === matchId);
    const review = {
      id: createPostId(),
      matchId,
      reviewerId: profile.id || currentUser.id,
      revieweeId: match?.participantIds?.find((id) => id !== (profile.id || currentUser.id)) || match?.participantIds?.[0] || '',
      rating: payload.rating,
      tags: payload.tags,
      body: payload.body,
      visibility: 'double_blind_until_both_submit',
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };
    setReviews((current) => [review, ...current]);
    syncApiState(apiRequest(`/api/matches/${matchId}/reviews`, { method: 'POST', body: review }));
  };

  const confirmMicroProduct = (product) => {
    const purchase = {
      id: createPostId(),
      userId: profile.id || currentUser.id,
      sku: product.sku,
      amount: product.amount,
      currency: product.currency,
      status: 'recorded',
      provider: 'renteazy-local',
      createdAt: new Date().toISOString(),
    };
    setPurchases((current) => [purchase, ...current]);

    if (product.category === 'Extra swipes') {
      setUsageLimit((current) => ({ ...current, allowance: current.allowance + product.quantity }));
    } else if (product.category === 'Credits') {
      setWallet((current) => ({ ...current, balance: current.balance + product.quantity, updatedAt: new Date().toISOString() }));
    } else if (product.category.includes('Boost') || product.category === 'Mini Boost' || product.category === 'Business starter') {
      setBoosts((current) => [{
        id: createPostId(),
        purchaserId: profile.id || currentUser.id,
        targetType: 'post',
        targetId: posts[0]?.id || 'draft-post',
        boostType: product.category,
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + (product.durationMinutes || 60) * 60 * 1000).toISOString(),
        impressions: 0,
        clicks: 0,
        likes: 0,
        saves: 0,
        matches: 0,
        status: 'active',
      }, ...current]);
    } else {
      setEntitlements((current) => [{
        id: createPostId(),
        userId: profile.id || currentUser.id,
        entitlementType: product.category,
        source: product.sku,
        quantityRemaining: product.quantity,
        expiresAt: null,
        createdAt: new Date().toISOString(),
      }, ...current]);
    }

    setUpsellProductId(null);
    syncApiState(apiRequest('/api/purchases', { method: 'POST', body: { productId: product.id, sku: product.sku } }));
  };

  const toggleLike = (postId) => {
    toggleId(setLikedIds, postId);
    syncApiState(apiRequest(`/api/posts/${postId}/like`, { method: 'POST' }));
  };

  const toggleSave = (postId) => {
    toggleId(setSavedIds, postId);
    syncApiState(apiRequest(`/api/posts/${postId}/save`, { method: 'POST' }));
  };

  const toggleFollow = (followingId) => {
    toggleId(setFollowedIds, followingId);
    syncApiState(apiRequest('/api/follows', { method: 'POST', body: { followingId } }));
  };

  const hidePost = (postId) => {
    setHiddenPostIds((current) => [...new Set([...current, postId])]);
    syncApiState(apiRequest(`/api/posts/${postId}/hide`, { method: 'POST' }));
  };

  const boostPost = (postId, productId = 'post-bump-small') => {
    openUpsell(productId);
    syncApiState(apiRequest(`/api/posts/${postId}/boost`, { method: 'POST', body: { productId } }));
  };

  const submitReport = (report) => {
    setReports((current) => [report, ...current]);
    syncApiState(apiRequest(`/api/posts/${report.targetId}/report`, { method: 'POST', body: report }));
  };

  const filteredPosts = posts.filter((post) => {
    if (hiddenPostIds.includes(post.id)) return false;
    if (activeFeedTab === 'Groups' || activeFeedTab === 'Perks') return false;
    if (activeFeedTab === 'For You') return true;
    if (activeFeedTab === 'Following') return followedIds.includes(post.authorId);
    if (activeFeedTab === 'Properties') return ['Property', 'Room', 'Serviced Accommodation'].includes(post.postType);
    if (activeFeedTab === 'Short-Term') return ['Short-Term Stay', 'Serviced Accommodation'].includes(post.postType);
    if (activeFeedTab === 'House Buddies') return post.postType === 'House Buddy';
    if (activeFeedTab === 'Advice') return ['Advice', 'Question', 'Area Insight', 'Success Story'].includes(post.postType);
    return post.postType.toLowerCase().includes(activeFeedTab.toLowerCase().replace(/s$/, '')) || post.authorType.toLowerCase().includes(activeFeedTab.toLowerCase().replace(/s$/, ''));
  });

  const navItems = [
    ['Feed', '/app/feed', Home],
    ['Swipe', '/app/swipe', Flame],
    ['Likes', '/app/likes', Heart],
    ['Post', '/app/post', PlusCircle],
    ['Profile', '/app/profile', UserRound],
  ];

  return (
    <div className="min-h-screen bg-[#eef5f2] pb-24 text-slate-900 antialiased">
      {clerkEnabled && <ClerkSessionBridge setProfile={setProfile} />}
      {(sharePost || (routeTab === 'Post' && newPost)) && (
        <ShareEverywhereModal post={sharePost || newPost} onClose={() => setSharePost(null)} onShared={trackShare} />
      )}
      {reportPost && <ReportModal post={reportPost} onClose={() => setReportPost(null)} onReport={submitReport} />}
      {commentPost && <CommentModal post={commentPost} comments={comments.filter((comment) => comment.postId === commentPost.id)} onClose={() => setCommentPost(null)} onComment={addComment} />}
      <MicroUpsellModal product={activeUpsellProduct} onClose={closeUpsell} onConfirm={confirmMicroProduct} billingEnabled={clerkEnabled} />
      <header className="sticky top-0 z-40 border-b border-white/70 bg-[#eef5f2]/88 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <BrandLogo />
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map(([label, href, Icon]) => (
              <a key={label} href={href} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ${routeTab === label ? 'bg-[#092243] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Icon className="h-4 w-4" />
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="/app/profile" className="hidden rounded-full bg-[#edf7ff] px-3 py-1.5 text-xs text-[#154f79] sm:inline-flex">{displayRole(profile.role)}</a>
            <span className={`hidden rounded-full px-3 py-1.5 text-xs sm:inline-flex ${backendStatus === 'connected' ? 'bg-[#edf8ee] text-[#215d27]' : backendStatus === 'checking' ? 'bg-[#edf7ff] text-[#154f79]' : 'bg-[#fff7ed] text-[#9a3412]'}`}>{backendStatus === 'connected' ? 'API connected' : backendStatus === 'checking' ? 'API checking' : 'Offline mode'}</span>
            <span className="hidden rounded-full bg-[#edf8ee] px-3 py-1.5 text-xs text-[#215d27] sm:inline-flex">5 extra swipes available after sharing</span>
            {clerkEnabled ? <ClerkAccountControls /> : <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"><Bell className="h-4 w-4" /></button>}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-5 lg:grid-cols-[1fr_20rem]">
        <section className="min-w-0">
          {routeTab === 'Feed' && (
            <>
              <div className="mb-4">
                <SocialHomeHeader profile={profile} usageLimit={usageLimit} groups={groups} memberships={groupMemberships} posts={posts} onSelectTab={setActiveFeedTab} />
              </div>
              <div className="mb-4">
                <SocialStoryRail posts={posts} groups={groups} onSelectTab={setActiveFeedTab} />
              </div>
              <div className="mb-4 overflow-x-auto pb-1">
                <div className="flex min-w-max gap-2">
                  {feedTabs.map((tab) => (
                    <button key={tab} onClick={() => setActiveFeedTab(tab)} className={`rounded-full px-4 py-2 text-sm ${activeFeedTab === tab ? 'bg-[#092243] text-white' : 'border border-slate-200 bg-white text-slate-600'}`}>{tab}</button>
                  ))}
                </div>
              </div>
              {activeFeedTab !== 'Groups' && activeFeedTab !== 'Perks' && <ComposerPanel onCreatePost={addPost} compact profile={profile} />}
              {newPost && (
                <div className="mt-4 rounded-3xl border border-[#d5ecd7] bg-[#edf8ee] p-4">
                  <p className="text-sm font-medium text-[#215d27]">Want more people to see this?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => setSharePost(newPost)} className="rounded-full bg-[#2f7d32] px-4 py-2 text-sm text-white">Share Everywhere</button>
                    <button onClick={() => openUpsell('post-bump-small')} className="rounded-full bg-[#092243] px-4 py-2 text-sm text-white">Boost post from 29p</button>
                  </div>
                </div>
              )}
              {openedOfferId && (
                <div className="mt-4 rounded-3xl border border-[#d5ecd7] bg-[#edf8ee] px-4 py-3 text-sm text-[#215d27]">
                  Perk opened. RentEazy records the signal so future offers can be more relevant.
                </div>
              )}
              <div className="mt-5 space-y-4">
                {activeFeedTab === 'Groups' ? (
                  <GroupsPanel groups={groups} memberships={groupMemberships} onJoinGroup={joinGroup} onCreateGroup={createGroup} />
                ) : activeFeedTab === 'Perks' ? (
                  <PerksRail partnerOffers={partnerOffers} profile={profile} onOpenOffer={openPartnerOffer} />
                ) : (
                  filteredPosts.map((post, index) => (
                    <React.Fragment key={post.id}>
                      <FeedPostCard
                        post={post}
                        liked={likedIds.includes(post.id)}
                        saved={savedIds.includes(post.id)}
                        followed={followedIds.includes(post.authorId)}
                        commentCount={post.commentCount + comments.filter((comment) => comment.postId === post.id).length}
                        onLike={toggleLike}
                        onSave={toggleSave}
                        onFollow={toggleFollow}
                        onShare={setSharePost}
                        onComment={setCommentPost}
                        onBoost={(post) => boostPost(post.id)}
                        onHide={hidePost}
                        onReport={setReportPost}
                      />
                      {index === 0 && (
                        <GroupsPanel groups={groups} memberships={groupMemberships} onJoinGroup={joinGroup} onCreateGroup={createGroup} compact />
                      )}
                      {index === 1 && (
                        <div className="space-y-4">
                          <DailySwipePanel usageLimit={usageLimit} onBuyMore={openUpsell} />
                          <MissionPanel posts={posts} shares={shares} likedIds={likedIds} savedIds={savedIds} answers={answers} onSelectProduct={openUpsell} />
                          <DailyPicksPanel picks={dailyPicks} />
                        </div>
                      )}
                      {index === 2 && feedAds.filter((ad) => !hiddenAdIds.includes(ad.id))[0] && (
                        <NativeAdCard ad={feedAds.filter((ad) => !hiddenAdIds.includes(ad.id))[0]} onOpen={openNativeAd} onHide={hideNativeAd} onReport={reportNativeAd} />
                      )}
                      {index === 3 && (
                        <PerksRail partnerOffers={partnerOffers} profile={profile} onOpenOffer={openPartnerOffer} compact />
                      )}
                      {index === 4 && (
                        <div className="space-y-4">
                          <RoleLanesPanel profile={profile} onSelectTab={setActiveFeedTab} />
                          <TractionPanel posts={posts} likedIds={likedIds} savedIds={savedIds} shares={shares} comments={comments} onBoost={openUpsell} />
                        </div>
                      )}
                    </React.Fragment>
                  ))
                )}
                {filteredPosts.length === 0 && activeFeedTab !== 'Groups' && activeFeedTab !== 'Perks' && (
                  <div className="rounded-[1.75rem] border border-white bg-white/86 p-6 text-center shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
                    <p className="text-2xl font-normal tracking-tight text-slate-950">Your Feed is ready.</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Follow people, browse categories, or post what you are looking for.</p>
                    <a href="/app/post" className="mt-5 inline-flex rounded-full bg-[#2f7d32] px-5 py-3 text-sm text-white">Create Post</a>
                  </div>
                )}
              </div>
            </>
          )}

          {routeTab === 'Post' && (
            <div className="space-y-5">
              <AppPulseStrip wallet={wallet} purchases={purchases} boosts={boosts} reports={reports} shares={shares} />
              <div>
                <h1 className="text-4xl font-normal tracking-tight text-slate-950">Create a free post</h1>
                <p className="mt-3 text-slate-600">Post what you need, what you have, or what you know.</p>
              </div>
              <ComposerPanel onCreatePost={addPost} profile={profile} />
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-[#d5ecd7] bg-[#edf8ee] p-4 text-sm leading-6 text-[#215d27]">
                  After posting, Share Everywhere rewards the user with 5 extra swipes today. Useful posts can be boosted from 29p.
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => openUpsell('post-bump-small')} className="rounded-full bg-[#092243] px-4 py-2 text-sm text-white">Boost post from 29p</button>
                    <button type="button" onClick={() => openUpsell('profile-polish')} className="rounded-full bg-[#2f7d32] px-4 py-2 text-sm text-white">Listing polish for 49p</button>
                  </div>
                </div>
                <MiniShopPanel onSelectProduct={openUpsell} compact />
                <AdsInventoryPanel onBoost={openUpsell} />
                <ActivityInbox usageLimit={usageLimit} posts={posts} shares={shares} reports={reports} boosts={boosts} profile={profile} />
              </div>
            </div>
          )}

          {routeTab === 'Swipe' && (
            <div>
              <div className="mb-5">
                <AppPulseStrip wallet={wallet} purchases={purchases} boosts={boosts} reports={reports} shares={shares} />
              </div>
              <h1 className="text-4xl font-normal tracking-tight text-slate-950">Swipe</h1>
              <p className="mt-3 text-slate-600">Swipe through suitable homes, rooms, stays, and people one card at a time.</p>
              <div className="mt-5"><MatchSummaryStrip profile={profile} answers={answers} /></div>
              <div className="mt-5"><DailySwipePanel usageLimit={usageLimit} onBuyMore={openUpsell} /></div>
              <div className="mt-5"><InteractiveMatchCard canSwipe={remainingSwipes > 0} onSwipeAction={handleSwipeAction} onBlocked={() => openUpsell('extra-swipes-10')} /></div>
              <div className="mt-5">
                <MatchPipelinePanel matches={matches} messages={matchMessages} viewings={viewings} reviews={reviews} onSendMessage={sendMatchMessage} onRequestViewing={requestViewing} onSubmitReview={submitMatchReview} />
              </div>
              <div className="mt-5 rounded-3xl border border-[#d5ecd7] bg-[#edf8ee] p-4 text-sm leading-6 text-[#215d27]">
                After a match or viewing, Protect Basic keeps the interaction on record for £0.99/month.
              </div>
            </div>
          )}

          {routeTab === 'Likes' && (
            <div className="space-y-4">
              <AppPulseStrip wallet={wallet} purchases={purchases} boosts={boosts} reports={reports} shares={shares} />
              <div className="rounded-4xl border border-white bg-white/86 p-6 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
                <h1 className="text-4xl font-normal tracking-tight text-slate-950">Likes</h1>
                <p className="mt-3 text-slate-600">Saved posts and liked posts stay here so you can come back to them quickly.</p>
              </div>
              <MatchPipelinePanel matches={matches} messages={matchMessages} viewings={viewings} reviews={reviews} onSendMessage={sendMatchMessage} onRequestViewing={requestViewing} onSubmitReview={submitMatchReview} />
              <div className="rounded-[1.75rem] border border-white bg-white/86 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
                <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">WHO LIKED YOU</p>
                <h2 className="mt-2 text-2xl font-normal tracking-tight text-slate-950">No hidden likes yet</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">When real users like your posts or profile, blurred likes can appear here. No likes are shown until real activity exists.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => openUpsell('reveal-like-1')} className="rounded-full bg-[#092243] px-4 py-2 text-sm text-white">Unlock Likes</button>
                  <button type="button" onClick={() => openUpsell('extra-swipes-10')} className="rounded-full bg-[#2f7d32] px-4 py-2 text-sm text-white">Get 10 more for 9p</button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {posts.filter((post) => likedIds.includes(post.id) || savedIds.includes(post.id)).map((post) => (
                  <FeedPostCard
                    key={post.id}
                    post={post}
                    liked={likedIds.includes(post.id)}
                    saved={savedIds.includes(post.id)}
                    followed={followedIds.includes(post.authorId)}
                    commentCount={post.commentCount + comments.filter((comment) => comment.postId === post.id).length}
                    onLike={toggleLike}
                    onSave={toggleSave}
                    onFollow={toggleFollow}
                    onShare={setSharePost}
                    onComment={setCommentPost}
                    onBoost={(post) => boostPost(post.id)}
                    onHide={hidePost}
                    onReport={setReportPost}
                  />
                ))}
                {posts.filter((post) => likedIds.includes(post.id) || savedIds.includes(post.id)).length === 0 && <p className="rounded-[1.75rem] border border-white bg-white/86 p-6 text-sm text-slate-600">Like or save posts from the Feed and they will appear here.</p>}
              </div>
            </div>
          )}

          {routeTab === 'Profile' && (
            <div className="space-y-5">
              <AppPulseStrip wallet={wallet} purchases={purchases} boosts={boosts} reports={reports} shares={shares} />
              <div className="rounded-[1.75rem] border border-[#cfe9fb] bg-white/88 p-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.45)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-950">Billing and upgrades</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">Manage Match, Priority, Protect, credits, boosts, and business starter upgrades.</p>
                  </div>
                  <a href="/app/billing" className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#092243] px-5 py-3 text-sm text-white">Open billing</a>
                </div>
              </div>
              <ProfileEditor profile={profile} setProfile={setProfile} answers={answers} setAnswers={setAnswers} />
              <ReputationScoreCard reputationProfile={reputationProfile} />
              <MatchPipelinePanel matches={matches} messages={matchMessages} viewings={viewings} reviews={reviews} onSendMessage={sendMatchMessage} onRequestViewing={requestViewing} onSubmitReview={submitMatchReview} />
              <TrustReputationPanel reports={reports} comments={comments} profile={profile} />
              <ActivityInbox usageLimit={usageLimit} posts={posts} shares={shares} reports={reports} boosts={boosts} profile={profile} />
              <MiniShopPanel onSelectProduct={openUpsell} />
            </div>
          )}

          {routeTab === 'Billing' && (
            <BillingPanel onSelectProduct={openUpsell} purchases={purchases} boosts={boosts} wallet={wallet} />
          )}
        </section>

        <aside className="hidden space-y-4 lg:block">
          <div className="rounded-[1.75rem] border border-white bg-white/86 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
            <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">LAUNCH STATS</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-2xl text-slate-950">{posts.length}</p><p className="text-slate-500">Posts</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-2xl text-slate-950">{shares.length}</p><p className="text-slate-500">Shares</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-2xl text-slate-950">{savedIds.length}</p><p className="text-slate-500">Saves</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="text-2xl text-slate-950">{reports.length}</p><p className="text-slate-500">Reports</p></div>
            </div>
          </div>
          <DailySwipePanel usageLimit={usageLimit} onBuyMore={openUpsell} />
          <div className="rounded-[1.75rem] border border-[#d5ecd7] bg-[#edf8ee] p-5 text-sm leading-7 text-[#215d27]">
            Share Everywhere creates a caption, tracking link, copy actions, share sheet, and reward record.
          </div>
          <ProfileStrengthCard profile={profile} answers={answers} />
          <ActivityInbox usageLimit={usageLimit} posts={posts} shares={shares} reports={reports} boosts={boosts} profile={profile} />
          <RoleLanesPanel profile={profile} onSelectTab={setActiveFeedTab} />
          <TractionPanel posts={posts} likedIds={likedIds} savedIds={savedIds} shares={shares} comments={comments} onBoost={openUpsell} />
          <BoostPerformanceCard boosts={boosts} onBoost={openUpsell} />
          <AdsInventoryPanel onBoost={openUpsell} />
          <MiniShopPanel onSelectProduct={openUpsell} compact />
          <ModerationQueueCard reports={reports} />
          <TrustReputationPanel reports={reports} comments={comments} profile={profile} />
          <div className="rounded-[1.75rem] border border-white bg-white/86 p-5 text-sm leading-7 text-slate-600 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45)]">
            <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">WALLET</p>
            <p className="mt-2 text-2xl text-slate-950">{wallet.balance} credits</p>
            <p>{purchases.length} purchases · {entitlements.length} entitlements · {appStreak.count} day streak</p>
          </div>
        </aside>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white bg-white/92 px-3 py-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-full bg-slate-950 p-1.5 text-white">
          {navItems.map(([label, href, Icon]) => (
            <a key={label} href={href} className={`flex flex-col items-center gap-1 rounded-full px-2 py-2 text-[0.7rem] ${routeTab === label ? 'bg-white/18' : 'text-white/72'}`}>
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}

const legalContent = {
  terms: {
    eyebrow: 'TERMS OF SERVICE',
    title: 'Terms of Service',
    intro:
      'These terms govern your use of RentEazy. By creating a profile, posting, or matching, you agree to use the platform fairly and lawfully.',
    sections: [
      ['What RentEazy is', 'RentEazy is a matching platform for the rental market. We are not a letting agency and do not own, manage, or guarantee any property. A match means mutual interest — it is not a tenancy, an offer, or approval.'],
      ['Your responsibilities', 'Provide accurate information in your profile and posts. Do not post misleading listings, impersonate others, harass members, or break the law. We may remove content or suspend accounts that breach these terms.'],
      ['Matches and viewings', 'Final rental approval always depends on referencing, affordability, availability, and the landlord or agent decision. Match scores are indicative only and never override those decisions.'],
      ['Paid features', 'Boosts, Superlikes, and seats improve visibility only when there is genuine fit. They do not change suitability, fit, or any final decision. Prices shown are launch prices and may change for new members.'],
      ['Contact', 'Questions about these terms? Email hello@renteazy.co.uk and we will reply within one business day.'],
    ],
  },
  privacy: {
    eyebrow: 'PRIVACY POLICY',
    title: 'Privacy Policy',
    intro:
      'This explains what we collect, why, and the choices you have. We collect only what we need to make matching work, and we do not sell your personal data.',
    sections: [
      ['What we collect', 'Account details (name, email), the profile information you choose to share (budget, areas, move date, requirements), and activity needed to run matching, swipes, and the Feed.'],
      ['How we use it', 'To create your profile, surface relevant matches, run the Feed, and keep the platform safe. We do not sell your personal data to third parties.'],
      ['Fonts and assets', 'We self-host our fonts, so your IP address is not shared with a font CDN when you load the site.'],
      ['Your choices', 'You can edit or delete your profile at any time. To request a copy of your data or deletion, email us and we will action it.'],
      ['Contact', 'Privacy questions or requests? Email hello@renteazy.co.uk and we will reply within one business day.'],
    ],
  },
};

function LegalPage({ kind }) {
  const doc = legalContent[kind] || legalContent.terms;
  return (
    <div className="min-h-screen bg-[#f5f8fb] font-['Inter',sans-serif] text-slate-900 antialiased">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <BrandLogo />
          <a href="/" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 transition-colors hover:text-[#2f7d32]">
            <iconify-icon icon="solar:arrow-left-linear" class="text-base"></iconify-icon>
            Back to home
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-['JetBrains_Mono',monospace] text-xs font-medium tracking-normal text-[#2670a8]">{doc.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-normal tracking-tight text-slate-950 md:text-5xl">{doc.title}</h1>
        <p className="mt-3 text-xs text-slate-400 font-['JetBrains_Mono',monospace]">Last updated 3 June 2026</p>
        <p className="mt-6 text-base leading-8 text-slate-600 font-light">{doc.intro}</p>
        <div className="mt-10 space-y-8">
          {doc.sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="text-xl font-normal tracking-tight text-slate-950">{heading}</h2>
              <p className="mt-3 text-base leading-8 text-slate-600 font-light">{body}</p>
            </section>
          ))}
        </div>
        <div className="mt-12 rounded-4xl border border-white bg-white/72 p-6 text-sm leading-7 text-slate-500 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.32),inset_0_1px_0_white]">
          This is a plain-English summary. A full, finalised legal document is available on request while RentEazy is in launch — email{' '}
          <a href="mailto:hello@renteazy.co.uk" className="text-[#2f7d32] underline">hello@renteazy.co.uk</a>.
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const rotatingHeroWords = useMemo(() => defaultRotatingHeroWords, []);
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname;

  if (pathname.startsWith('/app')) {
    return <RentEazyAppShell />;
  }

  if (pathname.startsWith('/signup') || pathname.startsWith('/waitlist')) {
    return <SignupBridge />;
  }

  if (pathname.startsWith('/terms')) {
    return <LegalPage kind="terms" />;
  }

  if (pathname.startsWith('/privacy')) {
    return <LegalPage kind="privacy" />;
  }

  return (
    <div className="bg-[#f5f8fb] text-slate-900 font-['Inter',sans-serif] min-h-screen relative overflow-x-hidden antialiased selection:bg-[#dff4e2] selection:text-[#092243]">
      <StickyMobileCTA />
      <RentEazyVoiceAgent />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="rent-eazy-float-bubble absolute top-[-12%] left-[-12%] w-[52vw] h-[52vw] rounded-full bg-[#cfe9fb]/42 blur-[7.5rem]"></div>
        <div className="rent-eazy-float-bubble absolute bottom-[-18%] right-[-10%] w-[62vw] h-[62vw] rounded-full bg-[#dff4e2]/42 blur-[8.75rem]"></div>
        <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.09) 1px, transparent 0)', backgroundSize: '2rem 2rem' }}></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 pt-5">
          <div className="relative overflow-hidden rounded-full bg-white/86 backdrop-blur-2xl border border-white/90 shadow-[0_14px_38px_-22px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,1)] px-4 py-3">
            <div className="relative z-10 flex items-center justify-between gap-4">
              <BrandLogo />
              <div className="hidden md:flex items-center gap-7 text-xs text-slate-600 font-normal">
                {navLinks.map((link) => (
                  <a key={link.label} href={link.href} className="relative transition-colors duration-300 hover:text-[#2f7d32] after:absolute after:left-0 after:-bottom-1.5 after:h-px after:w-0 after:bg-[#2f7d32] after:transition-all after:duration-300 hover:after:w-full">{link.label}</a>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <a href="#feed" className="hidden sm:inline-flex items-center justify-center rounded-full px-4 py-2 text-xs text-slate-700 bg-white/78 border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_white] hover:bg-white hover:text-[#2f7d32] transition-all duration-300">Browse Feed</a>
                <a href="#match" className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-xs text-white bg-linear-to-b from-[#52a832] to-[#2f7d32] border border-[#25672a] shadow-[0_5px_14px_rgba(47,125,50,0.28),inset_0_1px_0_rgba(255,255,255,0.35)] hover:from-[#64bd44] hover:to-[#3b8d3d] transition-all duration-300">Start Matching</a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        <section id="match" className="max-w-7xl mx-auto px-6 pt-36 md:pt-40 lg:pt-36 pb-14 md:pb-20">
          <div className="grid lg:grid-cols-[1fr_0.78fr] gap-8 lg:gap-x-10 lg:gap-y-6 xl:gap-x-12 items-start">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/75 border border-white px-3.5 py-2 shadow-[0_6px_18px_-12px_rgba(15,23,42,0.3),inset_0_1px_0_white] mb-8 lg:mb-5 xl:mb-6">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#52a832] opacity-50"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#52a832]"></span>
                </span>
                <span className="font-['JetBrains_Mono',monospace] text-xs font-medium tracking-normal text-slate-500">MUTUAL MATCHING · TENANTS · AGENTS · LANDLORDS</span>
              </div>
              <h1 className="hero-headline font-light tracking-normal leading-[0.94] text-slate-950" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.8)' }}>
                <span className="sr-only">Your next match could like you first.</span>
                <span aria-hidden="true" className="block">
                  <span className="block">Your next</span>
                  <span className="block whitespace-nowrap">
                    <RotatingHeroWord words={rotatingHeroWords} /> could
                  </span>
                </span>
                <span className="hero-headline-pill hero-pill-shimmer relative overflow-hidden inline-flex mt-4 rounded-[1.35rem] bg-linear-to-b from-[#52a832] to-[#2f7d32] border border-[#25672a] px-4 md:px-5 pb-2.5 pt-1.5 text-white font-normal shadow-[0_18px_38px_-20px_rgba(47,125,50,0.55),inset_0_1px_0_rgba(255,255,255,0.38)]">
                  like you first.
                </span>
              </h1>
            </div>

            <div className="relative order-last lg:order-none lg:row-span-2 lg:col-start-2 lg:row-start-1 lg:mt-5">
              {/* "try the demo" annotation */}
              <div className="pointer-events-none absolute -left-4 -top-5 z-20 hidden -rotate-6 items-start gap-2 text-[#2f7d32] lg:flex xl:-left-8">
                <span className="font-['Comic_Sans_MS','Bradley_Hand',cursive] text-lg font-semibold leading-none">try the demo</span>
                <svg aria-hidden="true" viewBox="0 0 142 82" className="mt-1 h-16 w-32 overflow-visible" fill="none">
                  <path d="M4 11C22 1 48 4 56 22C64 42 43 53 31 41C22 31 31 17 47 22C76 31 96 55 127 68" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M115 72C124 72 133 70 140 66" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <path d="M129 55C132 62 136 67 140 75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>

              {/* Floating match score — top right */}
              <div className="rent-eazy-float-bubble pointer-events-none absolute -right-4 top-16 z-30 hidden lg:flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3.5 py-2 shadow-[0_8px_24px_-10px_rgba(15,23,42,0.28),inset_0_1px_0_white] xl:-right-8">
                <span className="font-['JetBrains_Mono',monospace] text-sm font-bold text-[#2f7d32]">91%</span>
                <span className="text-xs text-slate-600">match score</span>
                <span className="flex h-2 w-2 rounded-full bg-[#52a832]"></span>
              </div>

              {/* Floating notification — bottom left */}
              <div className="rent-eazy-float-bubble pointer-events-none absolute -left-6 bottom-32 z-30 hidden lg:block rounded-2xl bg-white border border-slate-200 px-3.5 py-2.5 shadow-[0_8px_24px_-10px_rgba(15,23,42,0.28),inset_0_1px_0_white] xl:-left-10" style={{ animationDelay: '-2s' }}>
                <p className="text-[10px] font-medium text-[#2670a8] font-['JetBrains_Mono',monospace] tracking-[0.08em] mb-1">NEW MATCH</p>
                <p className="text-xs text-slate-800 font-medium">Amelia liked your listing</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Stratford 1-bed · 88% fit</p>
              </div>

              <HeroSwipeDeck />
            </div>

            <div className="text-center lg:text-left">
              <p className="mt-8 lg:mt-5 xl:mt-6 text-base md:text-lg leading-8 text-slate-600 font-light max-w-xl mx-auto lg:mx-0">Stop applying to listings. Start matching with people who already want you.</p>
              <div className="mt-10 lg:mt-6 xl:mt-8 flex flex-col items-center lg:items-start gap-3">
                <a href="/signup?source=hero_primary&offer=match24h" className="inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 bg-linear-to-b from-[#52a832] to-[#2f7d32] border border-[#25672a] text-white text-base font-medium shadow-[0_12px_28px_rgba(47,125,50,0.3),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-200 hover:shadow-[0_16px_36px_rgba(47,125,50,0.44)] hover:from-[#64bd44] hover:to-[#3b8d3d] active:scale-95">
                  Start Matching — it's free
                  <iconify-icon icon="solar:arrow-right-linear" class="text-xl"></iconify-icon>
                </a>
                <p className="text-xs text-slate-400 font-light">No card required · Profile ready in 2 minutes · Upgrade anytime</p>
                <div className="mt-1 flex items-center gap-5 text-sm text-slate-500">
                  <a href={socialAppUrl} className="inline-flex items-center gap-1.5 hover:text-[#2f7d32] transition-colors duration-200"><iconify-icon icon="solar:feed-linear" class="text-base text-[#2670a8]"></iconify-icon>Browse Feed</a>
                  <span className="w-px h-4 bg-slate-200" aria-hidden="true"></span>
                  <a href={socialSignupUrl} className="inline-flex items-center gap-1.5 hover:text-[#2f7d32] transition-colors duration-200"><iconify-icon icon="solar:add-square-linear" class="text-base text-[#2f7d32]"></iconify-icon>List a Property</a>
                </div>
                <a href="#why-switch" className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-[#2f7d32] transition-colors duration-200">
                  <iconify-icon icon="solar:arrow-down-linear" class="text-xs"></iconify-icon>
                  Why switch from Rightmove, Zoopla & SpareRoom?
                </a>
                <LiveActivityTicker />
              </div>
            </div>
          </div>

          {/* Scroll nudge */}
          <div className="mt-12 hidden lg:flex justify-center">
            <a href="#vsl" className="group flex flex-col items-center gap-2 text-slate-400 hover:text-[#2f7d32] transition-colors" aria-label="Scroll down">
              <span className="text-xs font-['JetBrains_Mono',monospace] tracking-[0.12em]">SCROLL</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 group-hover:border-[#d5ecd7] transition-colors animate-bounce">
                <iconify-icon icon="solar:arrow-down-linear" class="text-base"></iconify-icon>
              </span>
            </a>
          </div>
        </section>

        {/* ── Choose your lane — audience self-select ──────────────── */}
        <section id="who" className="max-w-7xl mx-auto px-6 pt-6 pb-2">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: 'solar:user-rounded-bold', accent: '#2670a8', iconBg: '#edf7ff', iconBorder: '#cde7f8',
                chipBg: '#edf7ff', chipText: '#154f79',
                label: 'Renters & buddies',
                promise: 'Match with a home — and the right people — that already want you. Your reputation comes with you to the next move.',
                proof: 'Free to swipe', cta: 'Start swiping', href: '#match',
              },
              {
                icon: 'solar:buildings-bold', accent: '#2f7d32', iconBg: '#edf8ee', iconBorder: '#d5ecd7',
                chipBg: '#edf8ee', chipText: '#215d27',
                label: 'Agents & landlords',
                promise: 'See vetted tenants who match your home and are ready to view — and build a reputation that wins your next instruction.',
                proof: 'Free to list', cta: 'For agents & landlords', href: '#partners',
              },
              {
                icon: 'solar:graph-up-bold', accent: '#092243', iconBg: 'rgba(9,34,67,0.06)', iconBorder: 'rgba(9,34,67,0.12)',
                chipBg: 'rgba(9,34,67,0.05)', chipText: '#092243',
                label: 'Operators, investors & sourcers',
                promise: 'Deal flow and demand signals from a market that remembers who actually delivers.',
                proof: 'Match by strategy', cta: 'Explore opportunities', href: '#marketplace',
              },
            ].map((p, i) => (
              <motion.a
                key={p.label}
                href={p.href}
                className="group relative flex flex-col rounded-4xl bg-white/72 border border-white p-6 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.32),inset_0_1px_0_white] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgba(15,23,42,0.42)]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border" style={{ backgroundColor: p.iconBg, borderColor: p.iconBorder }}>
                    <iconify-icon icon={p.icon} style={{ color: p.accent }} class="text-2xl"></iconify-icon>
                  </span>
                  <p className="font-['JetBrains_Mono',monospace] text-[11px] font-medium tracking-[0.1em]" style={{ color: p.accent }}>{p.label.toUpperCase()}</p>
                </div>
                <p className="text-base leading-7 font-light text-slate-700">{p.promise}</p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: p.chipBg, color: p.chipText }}>{p.proof}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: p.accent }}>
                    {p.cta}
                    <iconify-icon icon="solar:arrow-right-linear" class="text-base transition-transform group-hover:translate-x-0.5"></iconify-icon>
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        {/* ── Trust strip ────────────────────────────────────────── */}
        <section aria-hidden="true" className="max-w-7xl mx-auto px-6 pb-6 pt-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 items-center gap-x-6 gap-y-4 rounded-4xl bg-white/64 border border-white px-6 py-5 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.22),inset_0_1px_0_white]">
            {[
              ['solar:home-smile-bold', '#2f7d32', '9 match types', 'tenant ↔ property, buddy, agent, landlord & more'],
              ['solar:star-bold', '#2670a8', 'Free to post', 'no paywall on listing or browsing'],
              ['solar:shield-check-bold', '#2f7d32', 'Mutual interest first', 'both sides match before anyone wastes a viewing slot'],
              ['solar:buildings-2-bold', '#2670a8', 'UK rental market', 'built for rooms, flats, shares, short stays & investment'],
            ].map(([icon, color, label, sub]) => (
              <div key={label} className="flex items-center gap-3 text-left">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
                  <iconify-icon icon={icon} style={{ color }} class="text-lg"></iconify-icon>
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Stats band — real counts, animated on scroll ─────────── */}
        <section className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 rounded-4xl bg-linear-to-br from-[#0d2e57] to-[#06182f] border border-white/8 px-6 py-9 shadow-[0_24px_60px_-40px_rgba(9,34,67,0.7),inset_0_1px_0_rgba(255,255,255,0.1)]">
            {[
              { value: matchTypes.length, prefix: '', suffix: '', label: 'Match types', sub: 'tenant ↔ property, buddy, agent & more' },
              { value: postTypes.length, prefix: '', suffix: '', label: 'Ways to post', sub: 'rooms, briefs, deals, advice' },
              { value: roleOptions.length, prefix: '', suffix: '', label: 'Roles welcome', sub: 'tenants through to investors' },
              { value: 0, prefix: '£', suffix: '', label: 'To get started', sub: 'free to post & free to swipe' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-['Bricolage_Grotesque_Variable'] text-4xl md:text-5xl font-normal tracking-tight text-white">
                  {s.prefix}<NumberTicker value={s.value} className="text-[#9bd383]" />{s.suffix}
                </p>
                <p className="mt-2 text-sm font-medium text-white/90">{s.label}</p>
                <p className="mt-1 text-xs text-white/50">{s.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── VSL ─────────────────────────────────────────────────── */}
        <section id="vsl" className="max-w-5xl mx-auto px-6 pb-10 pt-4">
          <div className="mb-6 text-center">
            <p className="font-['JetBrains_Mono',monospace] text-xs font-medium tracking-normal text-[#2670a8] mb-3">SEE HOW IT WORKS · 30 SECONDS</p>
            <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-slate-950">Portals list. RentEazy matches.</h2>
            <p className="mt-3 text-base text-slate-500 font-light max-w-2xl mx-auto">Every side swipes a scored deck. When both sides like, it's a match — and your reputation comes along. Here's how, in 30 seconds.</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {[['🏠', 'Renters & buddies'], ['🏢', 'Agents, agencies & hosts'], ['🔑', 'Landlords, operators & investors']].map(([icon, label]) => (
                <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs text-slate-600">{icon} {label}</span>
              ))}
            </div>
          </div>
          <React.Suspense
            fallback={
              <div
                className="w-full rounded-4xl bg-[#06182f] shadow-[0_40px_90px_-45px_rgba(9,34,67,0.7),inset_0_0_0_1px_rgba(255,255,255,0.06)] animate-pulse"
                style={{ aspectRatio: '16/9' }}
                aria-hidden="true"
              />
            }
          >
            <VSLPlayer />
          </React.Suspense>

          {/* Close them here — capture intent the moment the video lands */}
          <div className="mt-7 flex flex-col items-center gap-3 text-center">
            <a
              href="/signup?source=vsl&offer=match24h"
              className="inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 bg-linear-to-b from-[#52a832] to-[#2f7d32] border border-[#25672a] text-white text-base font-medium shadow-[0_12px_28px_rgba(47,125,50,0.3),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-200 hover:shadow-[0_16px_36px_rgba(47,125,50,0.44)] hover:from-[#64bd44] hover:to-[#3b8d3d] active:scale-95"
            >
              Start free — your match is already swiping
              <iconify-icon icon="solar:arrow-right-linear" class="text-xl"></iconify-icon>
            </a>
            <p className="text-xs text-slate-400 font-light">No card required · Profile ready in 2 minutes · Free to post &amp; swipe</p>
          </div>
        </section>

        {/* ── How it works ────────────────────────────────────────── */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl mb-12">
            <p className="font-['JetBrains_Mono',monospace] text-xs font-medium tracking-normal text-[#2670a8] mb-4">HOW IT WORKS</p>
            <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-slate-950 leading-[1.05]">From brief to match in four steps.</h2>
            <p className="mt-5 text-base md:text-lg leading-8 text-slate-600 font-light">No gatekeeping. No random feeds. Just a structured path from profile to mutual match.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: '01',
                icon: 'solar:user-id-bold',
                title: 'Create your profile',
                body: 'Set your budget, areas, move date, must-haves, and viewing availability. Takes two minutes.',
                cardClass: 'bg-linear-to-br from-[#1d4ed8] to-[#1e3a8a] border-white/10',
                dark: true,
                iconClass: 'bg-white/18 border-white/22',
                iconColor: '#ffffff',
              },
              {
                step: '02',
                icon: 'solar:feed-bold',
                title: 'Post or browse the Feed',
                body: 'List a property, post a brief, or scroll the free Feed for homes, rooms, tenants, and opportunities.',
                cardClass: 'bg-white/90 border-white',
                dark: false,
                iconClass: 'bg-[#edf8ee] border-[#d5ecd7]',
                iconColor: '#2f7d32',
              },
              {
                step: '03',
                icon: 'solar:smartphone-bold',
                title: 'Swipe your match deck',
                body: 'Swipe through filtered cards. Like what fits, pass what does not. Superlike to get seen sooner.',
                cardClass: 'bg-linear-to-br from-[#092243] to-[#06182f] border-white/8',
                dark: true,
                iconClass: 'bg-white/14 border-white/18',
                iconColor: '#9bd383',
              },
              {
                step: '04',
                icon: 'solar:key-bold',
                title: 'Match, view, move in',
                body: 'When both sides like each other, a match opens. Viewing flow begins. No wasted slots.',
                cardClass: 'bg-linear-to-br from-[#2f7d32] to-[#14532d] border-white/10',
                dark: true,
                iconClass: 'bg-white/18 border-white/22',
                iconColor: '#ffffff',
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                className={`relative rounded-4xl border p-6 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.32),inset_0_1px_0_rgba(255,255,255,0.14)] transition-all duration-300 hover:shadow-[0_22px_44px_-26px_rgba(15,23,42,0.44)] hover:-translate-y-1 ${s.cardClass}`}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${s.iconClass}`}>
                    <iconify-icon icon={s.icon} style={{ color: s.iconColor }} class="text-2xl"></iconify-icon>
                  </div>
                  <span className={`font-['JetBrains_Mono',monospace] text-3xl font-medium select-none ${s.dark ? 'text-white/18' : 'text-slate-200'}`}>{s.step}</span>
                </div>
                <h3 className={`text-xl font-normal tracking-tight ${s.dark ? 'text-white' : 'text-slate-950'}`}>{s.title}</h3>
                <p className={`mt-3 text-sm leading-7 font-light ${s.dark ? 'text-white/65' : 'text-slate-600'}`}>{s.body}</p>
                {i < 3 && (
                  <div className={`absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 lg:flex h-6 w-6 items-center justify-center rounded-full border shadow-xs ${s.dark ? 'bg-[#06182f] border-white/14' : 'bg-white border-slate-200'}`}>
                    <iconify-icon icon="solar:arrow-right-linear" class={`text-sm ${s.dark ? 'text-white/40' : 'text-slate-400'}`}></iconify-icon>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/signup?source=how_it_works&offer=match24h" className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 bg-linear-to-b from-[#52a832] to-[#2f7d32] border border-[#25672a] text-white text-sm shadow-[0_8px_20px_rgba(47,125,50,0.24)] hover:from-[#64bd44] hover:to-[#3b8d3d] transition-all duration-200">Start free <iconify-icon icon="solar:arrow-right-linear" class="text-base"></iconify-icon></a>
            <a href="#swipe-ui" className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 bg-white border border-slate-200 text-slate-700 text-sm hover:text-[#2f7d32] transition-all duration-200">See the swipe decks</a>
          </div>
        </section>

        {/* ── Social proof ─────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                quote: 'Found a Stratford 1-bed in four days. The match score told me immediately it was right. First time I have ever felt like the search was working for me rather than against me.',
                name: 'Amelia R.',
                role: 'Tenant · East London',
                icon: 'solar:user-rounded-bold',
                iconBg: '#1d4ed8',
                tag: 'TENANT',
                tagColor: '#93c5fd',
                stars: 5,
              },
              {
                quote: 'Listed three properties and had viewing-ready tenants in our deck within 48 hours. The mutual match means we only spend time on people who actually want what we have.',
                name: 'James K.',
                role: 'Letting Agent · Canary Wharf',
                icon: 'solar:buildings-bold',
                iconBg: '#2f7d32',
                tag: 'LETTING AGENT',
                tagColor: '#c8f0a8',
                stars: 5,
                featured: true,
              },
              {
                quote: 'Matched directly with a tenant as a landlord. No agency fee — just a match, a viewing, and a signed agreement. The Protect record kept the whole process clean.',
                name: 'Sam P.',
                role: 'Landlord · Bow',
                icon: 'solar:home-smile-bold',
                iconBg: '#092243',
                tag: 'LANDLORD',
                tagColor: '#93c5fd',
                stars: 5,
              },
            ].map((t) => (
              <motion.div
                key={t.name}
                className={`relative rounded-4xl p-6 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.32),inset_0_1px_0_rgba(255,255,255,0.5)] transition-all duration-300 hover:shadow-[0_22px_44px_-26px_rgba(15,23,42,0.42)] hover:-translate-y-1 ${t.featured ? 'bg-linear-to-b from-[#092243] to-[#06182f] text-white border border-white/8' : 'bg-white/86 border border-white text-slate-950'}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {/* Tag + stars row */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="font-['JetBrains_Mono',monospace] text-[10px] tracking-widest" style={{ color: t.tagColor }}>{t.tag}</span>
                  <span className="text-xs tracking-tight" style={{ color: t.featured ? '#fbbf24' : '#f59e0b' }}>{'★'.repeat(t.stars)}</span>
                </div>
                {/* Large opening quote */}
                <svg className={`h-8 w-8 mb-3 ${t.featured ? 'text-white/18' : 'text-slate-200'}`} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M0 17.067C0 24.267 4.267 29.333 12 32l2.133-3.467C9.6 26.8 7.333 24 7.333 20.533c0-.533.134-.933.134-1.333H12V4H0v13.067zM18.667 17.067C18.667 24.267 22.933 29.333 30.667 32L32.8 28.533C28.267 26.8 26 24 26 20.533c0-.533.133-.933.133-1.333H30.667V4H18.667v13.067z"/></svg>
                <p className={`text-sm leading-7 font-light ${t.featured ? 'text-white/82' : 'text-slate-700'}`}>{t.quote}</p>
                {/* Divider */}
                <div className={`my-5 h-px ${t.featured ? 'bg-white/10' : 'bg-slate-100'}`}></div>
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: t.iconBg }}>
                    <iconify-icon icon={t.icon} style={{ color: 'white' }} class="text-lg"></iconify-icon>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${t.featured ? 'text-white' : 'text-slate-950'}`}>{t.name}</p>
                    <p className={`text-xs ${t.featured ? 'text-white/52' : 'text-slate-400'}`}>{t.role}</p>
                  </div>
                  {t.featured && (
                    <div className="ml-auto rounded-full bg-[#9bd383]/18 border border-[#9bd383]/28 px-2.5 py-1">
                      <span className="font-['JetBrains_Mono',monospace] text-[9px] tracking-widest text-[#9bd383]">VERIFIED</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Before vs After comparison ───────────────────────────── */}
        <section id="why-switch" className="max-w-7xl mx-auto px-6 pb-10">
          <div className="mb-8 max-w-2xl">
            <p className="font-['JetBrains_Mono',monospace] text-xs font-medium tracking-normal text-[#2670a8] mb-3">WHY SWITCH</p>
            <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-slate-950 leading-[1.05]">How RentEazy is different from every portal you've tried.</h2>
          </div>
          <div className="rounded-[2.75rem] overflow-hidden border border-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35),inset_0_1px_0_white]">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_1fr]">
              <div className="bg-[#fef2f2] border-b border-r border-[#fecaca] px-6 py-4 text-center">
                <p className="font-['JetBrains_Mono',monospace] text-xs tracking-widest text-[#dc2626] font-medium">THE OLD WAY</p>
              </div>
              <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-center">
                <span className="font-['JetBrains_Mono',monospace] text-[10px] text-slate-300 tracking-widest">VS</span>
              </div>
              <div className="bg-[#f0fdf4] border-b border-l border-[#bbf7d0] px-6 py-4 text-center">
                <p className="font-['JetBrains_Mono',monospace] text-xs tracking-widest text-[#16a34a] font-medium">RENTEAZY</p>
              </div>
            </div>
            {/* Comparison rows */}
            {[
              ['Browse hundreds of listings — most already let', 'Swipe a filtered deck of scored matches only'],
              ['Cold-message landlords who never reply', 'Match when both sides are genuinely interested'],
              ['No idea who is vetted, who is fake, who is urgent', 'Reputation score behind every agent and landlord'],
              ['View 12 properties, waste 11 slots', 'Viewings only happen after a mutual match'],
              ['Chase agents by phone and email for updates', 'Match history and viewing trail kept in Protect'],
              ['Start over on Rightmove, Zoopla, SpareRoom', 'One platform for tenants, agents, and landlords'],
              ['Find a place, then the portal forgets you — reputation back to zero', 'Your verified reputation travels with you, move to move'],
            ].map(([before, after], i) => (
              <div key={before} className={`grid grid-cols-[1fr_auto_1fr] ${i < 5 ? 'border-b border-slate-100' : ''}`}>
                <div className="flex items-start gap-2.5 px-5 py-4 bg-[#fff5f5]">
                  <span className="mt-0.5 shrink-0 text-[#dc2626] text-sm">✕</span>
                  <p className="text-sm leading-6 text-slate-600">{before}</p>
                </div>
                <div className="w-px bg-slate-100"></div>
                <div className="flex items-start gap-2.5 px-5 py-4 bg-[#f8fffe]">
                  <span className="mt-0.5 shrink-0 text-[#2f7d32] text-sm">✓</span>
                  <p className="text-sm leading-6 text-slate-700 font-medium">{after}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Be early — where it's live (cold-start objection) ────── */}
        <section id="be-early" className="max-w-7xl mx-auto px-6 py-12">
          <div className="relative overflow-hidden rounded-[2.75rem] border border-white/8 bg-linear-to-br from-[#0d2e57] to-[#06182f] shadow-[0_40px_90px_-45px_rgba(9,34,67,0.7),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <div className="grid items-center gap-8 p-8 md:p-12 lg:grid-cols-[1.05fr_0.95fr] lg:p-14">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#52a832]/35 bg-[#52a832]/18 px-3 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9bd383] opacity-60"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9bd383]"></span>
                  </span>
                  <span className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.14em] text-[#9bd383]">LIVE · EAST LONDON</span>
                </div>
                <h2 className="text-3xl font-normal leading-[1.05] tracking-tight text-white md:text-4xl lg:text-5xl">Be early. Build your reputation before your area fills.</h2>
                <p className="mt-5 max-w-lg text-base font-light leading-8 text-white/62">RentEazy opens area by area, starting in East London. Early is the advantage: you see every match in your patch while it's small — and the reputation you build now travels with you as the network grows across the UK.</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['E1', 'E2', 'E3', 'E8', 'E9', 'E14', 'E15', 'E20'].map((pc) => (
                    <span key={pc} className="rounded-full border border-[#9bd383]/25 bg-[#9bd383]/14 px-3 py-1 font-['JetBrains_Mono',monospace] text-xs text-[#9bd383]">{pc}</span>
                  ))}
                  <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 font-['JetBrains_Mono',monospace] text-xs text-white/45">your area next →</span>
                </div>
                <a href="/signup?source=be_early&offer=match24h" className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-[#25672a] bg-linear-to-b from-[#52a832] to-[#2f7d32] px-7 py-3.5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(47,125,50,0.32),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:from-[#64bd44] hover:to-[#3b8d3d]">
                  Claim your spot — free
                  <iconify-icon icon="solar:arrow-right-linear" class="text-lg"></iconify-icon>
                </a>
              </div>
              <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center">
                {[34, 56, 78, 100].map((s) => (
                  <span key={s} className="absolute rounded-full border border-[#9bd383]/15" style={{ width: `${s}%`, height: `${s}%` }} />
                ))}
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={`pulse-${i}`}
                    className="absolute rounded-full border border-[#9bd383]/40"
                    initial={{ width: '22%', height: '22%', opacity: 0.55 }}
                    animate={{ width: '100%', height: '100%', opacity: 0 }}
                    transition={{ duration: 3.4, repeat: Infinity, delay: i * 1.13, ease: 'easeOut' }}
                  />
                ))}
                {[['Manchester', '18%', '20%'], ['Birmingham', '32%', '40%'], ['Leeds', '68%', '18%'], ['Bristol', '26%', '70%']].map(([city, top, left]) => (
                  <span key={city} className="absolute flex flex-col items-center" style={{ top, left }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-white/25"></span>
                    <span className="mt-1 font-['JetBrains_Mono',monospace] text-[8px] tracking-[0.1em] text-white/25">{city}</span>
                  </span>
                ))}
                <span className="relative z-10 flex flex-col items-center">
                  <span className="flex h-4 w-4 rounded-full bg-[#52a832] shadow-[0_0_22px_5px_rgba(82,168,50,0.6)]"></span>
                  <span className="mt-2 rounded-full bg-[#06182f]/70 px-2 py-0.5 font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.12em] text-[#9bd383]">EAST LONDON · LIVE</span>
                </span>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 text-center">
                  <span className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.12em] text-white/40">LIVE HERE NOW · UK NEXT</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="feed" className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <p className="font-['JetBrains_Mono',monospace] text-xs font-medium tracking-normal text-[#2670a8] mb-4">WHY IT MATTERS</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-slate-950 leading-[1.05]">Rental search should not feel like shouting into the void.</h2>
            <p className="mt-5 text-base md:text-lg leading-8 text-slate-600 font-light max-w-xl">Listings get buried. Messages go unanswered. Nobody knows who is ready. RentEazy gives every side a structured way to find the right match — with reputation, scored cards, and mutual interest before anyone wastes a viewing slot.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {accounts.map((account, i) => {
              const styles = [
                { iconBg: '#edf7ff', iconBorder: '#cde7f8', iconColor: '#2670a8', checkColor: '#2670a8', cardClass: 'bg-white/72 border-white' },
                { iconBg: '#edf8ee', iconBorder: '#d5ecd7', iconColor: '#2f7d32', checkColor: '#2f7d32', cardClass: 'bg-linear-to-b from-[#092243] to-[#06182f] border-white/8 text-white', featured: true },
                { iconBg: 'rgba(9,34,67,0.08)', iconBorder: 'rgba(9,34,67,0.14)', iconColor: '#092243', checkColor: '#2670a8', cardClass: 'bg-white/72 border-white' },
              ][i];
              return (
                <motion.div
                  key={account.title}
                  className={`rounded-4xl border p-6 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.32),inset_0_1px_0_rgba(255,255,255,0.5)] transition-shadow duration-300 hover:shadow-[0_22px_44px_-26px_rgba(15,23,42,0.42)] ${styles.cardClass}`}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  {styles.featured && (
                    <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/16 border border-white/20 px-3 py-1 font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.12em] text-[#9bd383]">★ HIGHEST LTV</div>
                  )}
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: styles.iconBg, borderColor: styles.iconBorder }}>
                    <iconify-icon icon={account.icon} style={{ color: styles.iconColor }} class="text-2xl"></iconify-icon>
                  </div>
                  <h3 className={`mt-5 text-xl font-normal tracking-tight ${styles.featured ? 'text-white' : 'text-slate-950'}`}>{account.title}</h3>
                  <p className={`mt-3 text-sm leading-7 font-light ${styles.featured ? 'text-white/72' : 'text-slate-600'}`}>{account.text}</p>
                  <div className="mt-5 flex flex-col gap-2">
                    {account.items.map((item) => <CheckItem key={item} light={styles.featured}>{item}</CheckItem>)}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-8 relative overflow-hidden rounded-4xl bg-linear-to-br from-[#0d2e57] to-[#092243] border border-white/8 p-6 md:p-8 shadow-[0_24px_60px_-35px_rgba(9,34,67,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#2670a8]/18 blur-[60px] pointer-events-none"></div>
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#2f7d32]/22 border border-[#2f7d32]/35 px-3 py-1.5 mb-4">
                  <span className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.12em] text-[#9bd383]">FREE FEED</span>
                  <span className="font-['JetBrains_Mono',monospace] text-[10px] text-[#9bd383]/60">· {postTypes.length} POST TYPES</span>
                </div>
                <p className="text-xl md:text-2xl font-normal text-white leading-snug max-w-lg">Everyone gets a voice. Post homes, rooms, tenant briefs, investment deals, or area advice. No paywall, ever.</p>
              </div>
              <a href={socialAppUrl} className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#092243] px-5 py-3 text-sm font-medium hover:bg-[#f0fdf4] transition-colors">
                <iconify-icon icon="solar:feed-bold" class="text-base text-[#2670a8]"></iconify-icon>
                Browse Feed free
              </a>
            </div>
            <div className="-mx-6 md:-mx-8 overflow-visible">
              <Marquee speed={26} className="py-1.5">
                {feedTabs.map((tab) => <span key={tab} className="shrink-0 rounded-full bg-white/8 border border-white/12 px-4 py-1.5 text-xs text-white/72 whitespace-nowrap">{tab}</span>)}
              </Marquee>
              <Marquee speed={20} className="py-1.5 mt-1" reverse>
                {postTypes.slice(0, 10).map((type) => <span key={type} className="shrink-0 rounded-full bg-[#2670a8]/18 border border-[#2670a8]/22 px-4 py-1.5 text-xs text-[#93c5fd] whitespace-nowrap">{type}</span>)}
              </Marquee>
            </div>
          </div>
        </section>

        {/* ── Share Everywhere ─────────────────────────────────────── */}
        <section id="share-everywhere" className="max-w-7xl mx-auto px-6 py-10">
          <div className="relative isolate overflow-hidden rounded-[2.75rem] bg-linear-to-br from-[#0d2e57] via-[#092243] to-[#041528] border border-white/8 shadow-[0_40px_90px_-45px_rgba(9,34,67,0.7),inset_0_1px_0_rgba(255,255,255,0.12)]">
            {/* Ambient glows */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.75rem]">
              <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#52a832]/18 blur-[70px]"></div>
              <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#2670a8]/22 blur-[60px]"></div>
            </div>
            <div className="relative grid lg:grid-cols-[1fr_1fr] gap-8 p-8 md:p-12 lg:p-14">
              {/* Left — copy */}
              <div className="flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#52a832]/20 border border-[#52a832]/35 px-3 py-1.5 mb-6 w-fit">
                  <iconify-icon icon="solar:share-bold" class="text-sm text-[#9bd383]"></iconify-icon>
                  <span className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.12em] text-[#9bd383]">SHARE EVERYWHERE</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight text-white leading-[1.05]">Post once.<br />Reach everywhere.</h2>
                <p className="mt-5 text-base leading-8 text-white/62 font-light max-w-md">One tap generates a caption, a tracked sharing link, a native share sheet, and a reward record. Get 5 extra swipes every time you share a post that brings someone new in.</p>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: 'solar:copy-linear', color: '#9bd383', label: 'Copy caption', sub: 'Ready-to-paste text for any platform' },
                    { icon: 'solar:link-linear', color: '#5bc4ff', label: 'Tracking link', sub: 'See who clicked and which channel won' },
                    { icon: 'solar:gift-linear', color: '#fbbf24', label: '+5 swipes reward', sub: 'Every share that lands earns you more reach' },
                  ].map((f) => (
                    <div key={f.label} className="rounded-2xl bg-white/6 border border-white/10 p-4">
                      <iconify-icon icon={f.icon} style={{ color: f.color }} class="text-2xl block mb-3"></iconify-icon>
                      <p className="text-sm font-medium text-white/90">{f.label}</p>
                      <p className="mt-1 text-xs leading-5 text-white/45">{f.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-white/32 font-light shrink-0">Works with</span>
                  {[
                    ['tabler:brand-whatsapp', '#25D366', 'WhatsApp'],
                    ['tabler:brand-instagram', '#E1306C', 'Instagram'],
                    ['tabler:brand-x', '#ffffff', 'X'],
                    ['tabler:brand-facebook', '#1877F2', 'Facebook'],
                    ['tabler:brand-linkedin', '#0A66C2', 'LinkedIn'],
                    ['tabler:brand-tiktok', '#ff0050', 'TikTok'],
                  ].map(([icon, color, name]) => (
                    <span key={name} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] border border-white/10 px-2.5 py-1">
                      <iconify-icon icon={icon} style={{ color }} class="text-sm"></iconify-icon>
                      <span className="text-[10px] text-white/52">{name}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — share modal mockup */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-sm rounded-[1.75rem] bg-white p-5 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.12em] text-[#2670a8] mb-1">SHARE EVERYWHERE</p>
                      <p className="text-xl font-normal tracking-tight text-slate-950">Want more people to see this?</p>
                      <p className="mt-1 text-sm text-slate-500">Share and get 5 extra swipes today.</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 mb-3">
                    <p className="text-[10px] text-slate-400 mb-1">Suggested caption</p>
                    <p className="text-xs leading-5 text-slate-700">Double room near Stratford station. Bills included, Zone 2/3. See it on RentEazy:</p>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-200 p-3 mb-4">
                    <p className="text-[10px] text-slate-400 mb-1">Tracking link</p>
                    <p className="text-xs text-[#154f79] truncate">renteazy.co.uk/share/post/stratford-room?r=me&c=whatsapp</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="flex items-center justify-center gap-1.5 rounded-full bg-[#092243] py-3 text-xs text-white"><iconify-icon icon="solar:copy-linear" class="text-sm"></iconify-icon>Copy</div>
                    <div className="flex items-center justify-center gap-1.5 rounded-full border border-slate-200 py-3 text-xs text-slate-600"><iconify-icon icon="solar:link-linear" class="text-sm"></iconify-icon>Link</div>
                    <div className="flex items-center justify-center gap-1.5 rounded-full bg-[#2f7d32] py-3 text-xs text-white"><iconify-icon icon="solar:share-linear" class="text-sm"></iconify-icon>Share</div>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-[#edf8ee] px-3 py-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2f7d32] shrink-0"></span>
                    <p className="text-xs text-[#215d27]">Share tracked. Reward added: +5 swipes today.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="swipe-ui" className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl mb-10">
            <p className="font-['JetBrains_Mono',monospace] text-xs font-medium tracking-normal text-[#2670a8] mb-4">SWIPE DECKS</p>
            <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-slate-950 leading-[1.05]">Every side gets a focused discovery deck.</h2>
            <p className="mt-5 text-base md:text-lg leading-8 text-slate-600 font-light">The swipe experience keeps each option simple: focused cards, clean filters, clear next steps, and no fake scarcity.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {swipeCards.map((card, i) => {
              const style = [
                { card: 'bg-linear-to-br from-[#1d4ed8] to-[#1e3a8a] border-white/10', dark: true, labelColor: '#bfdbfe', badgeBg: 'rgba(191,219,254,0.18)', badgeBorder: 'rgba(191,219,254,0.3)', badgeText: '#bfdbfe' },
                { card: 'bg-linear-to-br from-[#2f7d32] to-[#14532d] border-white/10', dark: true, labelColor: '#c8f0a8', badgeBg: 'rgba(200,240,168,0.18)', badgeBorder: 'rgba(200,240,168,0.3)', badgeText: '#c8f0a8' },
                { card: 'bg-linear-to-br from-[#092243] to-[#06182f] border-white/10', dark: true, labelColor: '#93c5fd', badgeBg: 'rgba(147,197,253,0.14)', badgeBorder: 'rgba(147,197,253,0.25)', badgeText: '#93c5fd' },
              ][i];
              return (
                <motion.div
                  key={card.title}
                  className={`rounded-4xl border p-6 shadow-[0_18px_44px_-32px_rgba(15,23,42,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_56px_-32px_rgba(15,23,42,0.65)] ${style.card}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <p className="font-['JetBrains_Mono',monospace] text-xs" style={{ color: style.labelColor }}>{card.role}</p>
                  <h3 className="mt-3 text-2xl font-normal tracking-tight text-white">{card.title}</h3>
                  <div className="mt-4 space-y-2">{card.details.map((detail) => <p key={detail} className="text-sm text-white/65">{detail}</p>)}</div>
                  <div className="mt-5 flex flex-wrap gap-2">{card.badges.map((badge) => <span key={badge} className="rounded-full px-3 py-1 text-xs" style={{ backgroundColor: style.badgeBg, border: `1px solid ${style.badgeBorder}`, color: style.badgeText }}>{badge}</span>)}</div>
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    {card.buttons.map((button, index) => (
                      <button key={button} className={`rounded-full px-3 py-2 text-xs transition-opacity hover:opacity-90 ${index === 0 ? 'bg-white/12 border border-white/20 text-white/70' : index === 1 ? 'bg-white/20 border border-white/30 text-white' : 'bg-white text-[#092243] font-medium'}`}>{button}</button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-5">
            {discoveryModes.map((group, i) => {
              const modeStyles = [
                { hdr: 'text-[#1d4ed8]', bg: 'bg-[#edf7ff]', border: 'border-[#bfdbfe]', text: 'text-[#1e3a8a]' },
                { hdr: 'text-[#2f7d32]', bg: 'bg-[#edf8ee]', border: 'border-[#bbf7d0]', text: 'text-[#14532d]' },
                { hdr: 'text-[#092243]', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600' },
              ][i];
              return (
                <div key={group.role} className="rounded-2xl bg-white/72 border border-white p-5">
                  <h3 className={`text-sm font-medium font-['JetBrains_Mono',monospace] tracking-[0.06em] ${modeStyles.hdr}`}>{group.role.toUpperCase()}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.modes.map((mode) => (
                      <span key={mode} className={`rounded-full px-3 py-1 text-xs border ${modeStyles.bg} ${modeStyles.border} ${modeStyles.text}`}>{mode}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="marketplace" className="max-w-7xl mx-auto px-6 py-20">
          <div className="overflow-hidden rounded-[2.75rem] bg-linear-to-b from-[#092243] to-[#06182f] text-white border border-white/10 shadow-[0_40px_90px_-45px_rgba(15,23,42,0.78),inset_0_1px_0_rgba(255,255,255,0.14)]">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 p-8 md:p-12 lg:p-16">
              <div>
                <p className="font-['JetBrains_Mono',monospace] text-xs font-medium tracking-normal text-[#b8ddf4] mb-4">MUTUAL MATCHING</p>
                <h2 className="text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">Both sides match before anyone wastes time.</h2>
                <p className="mt-5 text-base leading-8 text-slate-300 font-light max-w-lg">Tenants see scored homes with agent and landlord reputation behind every offer. Agents and landlords see tenants with confirmed budgets, move dates, and viewing slots. No side advances without genuine mutual interest.</p>
                <div className="mt-8 rounded-2xl bg-white/[0.07] border border-white/10 p-5 text-sm leading-7 text-white/65">A match opens the conversation — it does not guarantee a tenancy. Final approval depends on referencing, affordability, and landlord or agent decision.</div>
              </div>
              <div className="grid gap-4">
                {/* Tenant side — with a real property thumbnail */}
                <div className="flex items-center gap-4 rounded-2xl bg-linear-to-br from-[#1d4ed8]/22 to-[#1e3a8a]/12 border border-[#1d4ed8]/25 p-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                    <img src="/images/match-flat.jpg" alt="Matched home" className="h-full w-full object-cover" loading="lazy" />
                    <span className="absolute bottom-1 left-1 rounded-full bg-[#2f7d32] px-1.5 py-0.5 text-[9px] font-bold text-white shadow">88%</span>
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1.5 flex items-center gap-2">
                      <iconify-icon icon="solar:user-rounded-bold" class="text-base text-[#93c5fd]"></iconify-icon>
                      <p className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.12em] text-[#93c5fd]">TENANT SIDE</p>
                    </div>
                    <h3 className="text-base font-normal leading-snug text-white">Swipe scored homes that fit your brief — reputation shown behind every offer.</h3>
                  </div>
                </div>

                {/* Mutual match — the centrepiece. Dark + green glow + beam, never white. */}
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#0f3d22] to-[#06231a] border border-[#2f7d32]/40 p-5 shadow-[0_0_44px_-14px_rgba(82,168,50,0.45)]">
                  <BorderBeam size={150} duration={8} borderWidth={1.5} colorFrom="#9bd383" colorTo="#5bc4ff" />
                  <div className="relative flex items-center gap-3">
                    <div className="flex -space-x-3">
                      <img src="/images/match-tenant.jpg" alt="Tenant" className="h-10 w-10 rounded-full border-2 border-[#06231a] object-cover" loading="lazy" />
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#06231a] bg-linear-to-br from-[#2670a8] to-[#1e3a8a]">
                        <iconify-icon icon="solar:home-smile-bold" class="text-lg text-white"></iconify-icon>
                      </span>
                    </div>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-[#52a832] to-[#2f7d32] text-sm font-bold text-white shadow-lg">✓</span>
                    <p className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.12em] text-[#9bd383]">MUTUAL MATCH</p>
                  </div>
                  <h3 className="relative mt-3 text-lg font-normal leading-snug text-white">Both sides like each other first. Then viewing flow begins.</h3>
                  <p className="relative mt-1.5 text-sm text-white/55">No cold messages. No wasted slots. Just genuine mutual interest.</p>
                </div>

                {/* Agent & landlord side — with a real tenant photo */}
                <div className="flex items-center gap-4 rounded-2xl bg-linear-to-br from-[#2f7d32]/22 to-[#14532d]/12 border border-[#2f7d32]/25 p-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                    <img src="/images/match-tenant.jpg" alt="Verified tenant" className="h-full w-full object-cover" loading="lazy" />
                    <span className="absolute bottom-1 left-1 rounded-full bg-[#2670a8] px-1.5 py-0.5 text-[9px] font-bold text-white shadow">Verified</span>
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1.5 flex items-center gap-2">
                      <iconify-icon icon="solar:buildings-bold" class="text-base text-[#9bd383]"></iconify-icon>
                      <p className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.12em] text-[#9bd383]">AGENT &amp; LANDLORD SIDE</p>
                    </div>
                    <h3 className="text-base font-normal leading-snug text-white">See vetted tenants who match your home — budgets and move dates confirmed.</h3>
                  </div>
                </div>

              </div>
            </div>

            {/* Full-width: every match type as a real visual pair, not a text pill */}
            <div className="border-t border-white/10 px-8 md:px-12 lg:px-16 py-9">
              <p className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.14em] text-[#b8ddf4] mb-5">{matchTypes.length} WAYS TO MATCH</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {matchTypes.map((mt) => {
                  const [a, b] = mt.split(' ↔ ');
                  const [ia, ca] = matchRoleIcon[a] || ['solar:user-rounded-bold', '#93c5fd'];
                  const [ib, cb] = matchRoleIcon[b] || ['solar:home-smile-bold', '#9bd383'];
                  return (
                    <div key={mt} className="flex items-center gap-2.5 rounded-2xl bg-white/[0.05] border border-white/10 px-3.5 py-3 transition-colors hover:bg-white/[0.08]">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.08]"><iconify-icon icon={ia} style={{ color: ca }} class="text-lg"></iconify-icon></span>
                      <iconify-icon icon="solar:arrow-right-linear" class="shrink-0 text-xs text-white/30"></iconify-icon>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.08]"><iconify-icon icon={ib} style={{ color: cb }} class="text-lg"></iconify-icon></span>
                      <span className="ml-1 min-w-0 text-xs leading-tight text-white/75">{a} <span className="text-white/35">↔</span> {b}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="filters" className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl mb-10">
            <p className="font-['JetBrains_Mono',monospace] text-xs font-medium tracking-normal text-[#2670a8] mb-4">FILTER-FIRST DISCOVERY</p>
            <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-slate-950 leading-[1.05]">Swipe faster because the deck is already narrowed.</h2>
            <p className="mt-5 text-base md:text-lg leading-8 text-slate-600 font-light">Set filters once. Every card in your deck already fits. No scrolling past irrelevant listings.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                role: 'Tenant filters',
                icon: 'solar:user-rounded-linear',
                iconBg: '#edf7ff', iconBorder: '#cde7f8', iconColor: '#2670a8',
                accent: '#2670a8', accentBg: '#edf7ff', accentBorder: '#cde7f8', accentText: '#154f79',
                items: filters[0].items,
              },
              {
                role: 'Agent filters',
                icon: 'solar:buildings-linear',
                iconBg: '#edf8ee', iconBorder: '#d5ecd7', iconColor: '#2f7d32',
                accent: '#2f7d32', accentBg: '#edf8ee', accentBorder: '#d5ecd7', accentText: '#215d27',
                items: filters[1].items,
              },
              {
                role: 'Landlord filters',
                icon: 'solar:home-smile-linear',
                iconBg: 'rgba(9,34,67,0.07)', iconBorder: 'rgba(9,34,67,0.12)', iconColor: '#092243',
                accent: '#092243', accentBg: 'rgba(9,34,67,0.06)', accentBorder: 'rgba(9,34,67,0.12)', accentText: '#092243',
                items: filters[2].items,
              },
            ].map((group, i) => (
              <motion.div
                key={group.role}
                className="rounded-4xl bg-white/72 border border-white p-6 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.32),inset_0_1px_0_white] transition-shadow duration-300 hover:shadow-[0_22px_44px_-26px_rgba(15,23,42,0.4)]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.09 }}
              >
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border" style={{ backgroundColor: group.iconBg, borderColor: group.iconBorder }}>
                      <iconify-icon icon={group.icon} style={{ color: group.iconColor }} class="text-xl"></iconify-icon>
                    </div>
                    <h3 className="text-lg font-normal text-slate-950">{group.role}</h3>
                  </div>
                  <span className="font-['JetBrains_Mono',monospace] text-xs rounded-full px-2 py-1" style={{ backgroundColor: group.accentBg, color: group.accent, border: `1px solid ${group.accentBorder}` }}>
                    {group.items.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full px-3 py-1 text-xs"
                      style={{ backgroundColor: group.accentBg, borderColor: group.accentBorder, color: group.accentText, border: `1px solid ${group.accentBorder}` }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="partners" className="max-w-7xl mx-auto px-6 py-20">
          <div className="rounded-[2.75rem] bg-white/70 border border-white p-8 md:p-12 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35),inset_0_1px_0_white]">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 items-start">
              <div>
                <p className="font-['JetBrains_Mono',monospace] text-xs font-medium tracking-normal text-[#2670a8] mb-4">AGENTS, LANDLORDS, AND TEAMS</p>
                <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-slate-950 leading-[1.05]">Your track record becomes your pipeline.</h2>
                <p className="mt-5 text-base leading-8 text-slate-600 font-light">Every renter who joins sees your rep score, your matched properties, and your history. Portals make you start from zero on every listing — here, the agents and landlords who deliver get found first, and keep getting found.</p>
                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <a href="/signup?source=partners" className="rounded-full bg-[#092243] text-white px-5 py-3 text-sm hover:bg-[#0c2e5a] transition-colors">Join Free</a>
                  <a href="#pricing" className="rounded-full bg-white border border-slate-200 px-5 py-3 text-sm text-slate-700 hover:text-[#2f7d32] transition-colors">Add Team Seats</a>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {['Free agency/business profile', 'Landlord individual pricing', 'Solo agent individual pricing', 'Paid seats for staff', 'Boosts and Superlikes', 'Shared business profile'].map((item) => (
                  <div key={item} className="rounded-3xl bg-white border border-slate-200 p-5 shadow-[0_10px_28px_-22px_rgba(15,23,42,0.24),inset_0_1px_0_white]"><CheckItem>{item}</CheckItem></div>
                ))}
              </div>
            </div>

            {/* Network effect callout */}
            <div className="mt-8 grid md:grid-cols-[1fr_1fr] gap-5">
              <div className="rounded-2xl bg-linear-to-br from-[#092243] to-[#06182f] border border-white/8 p-6 text-white">
                <iconify-icon icon="solar:graph-up-linear" class="text-3xl text-[#9bd383] mb-4 block"></iconify-icon>
                <p className="font-['JetBrains_Mono',monospace] text-xs text-[#9bd383] mb-3 tracking-widest">REPUTATION NETWORK EFFECT</p>
                <p className="text-lg font-normal leading-7">A 4.9 rep score on a small platform is just a number. On a growing platform, it's a pipeline. Every new user who joins sees your track record first.</p>
              </div>
              <div className="rounded-2xl bg-[#edf7ff] border border-[#cde7f8] p-6">
                <iconify-icon icon="solar:users-group-rounded-linear" class="text-3xl text-[#2670a8] mb-4 block"></iconify-icon>
                <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8] mb-3 tracking-widest">TEAM PRICING</p>
                <p className="text-lg font-normal leading-7 text-slate-800">Agencies and businesses pay per seat at the same base price as individuals, with automatic volume discounts from 5 seats upward.</p>
                <p className="mt-3 text-sm text-slate-500">Monthly from £4.99/seat · Yearly from £69.99/seat · 5+ seats: discounts apply</p>
              </div>
            </div>
          </div>
        </section>

        <section id="paid-mechanics" className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl mb-10">
            <p className="font-['JetBrains_Mono',monospace] text-xs font-medium tracking-normal text-[#2670a8] mb-4">UPGRADES AND ADD-ONS</p>
            <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-slate-950 leading-[1.05]">More reach. More signals. A clear record.</h2>
            <p className="mt-5 text-base md:text-lg leading-8 text-slate-600 font-light">Add only what helps. Stronger signals, better filters, profile and listing insights, and a simple record for matches and viewings.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">
            {paidMechanics.map((item, i) => {
              const styles = [
                { card: 'bg-linear-to-br from-[#2f7d32] to-[#14532d] border-white/10', dark: true, icon: 'bg-white/18 border-white/22 text-[#c8f0a8]' },
                { card: 'bg-white/90 border-white', dark: false, icon: 'bg-[#fef9c3] border-[#fef08a] text-[#ca8a04]' },
                { card: 'bg-linear-to-br from-[#1d4ed8] to-[#1e3a8a] border-white/10', dark: true, icon: 'bg-white/18 border-white/22 text-[#bfdbfe]' },
                { card: 'bg-white/90 border-white', dark: false, icon: 'bg-[#edf7ff] border-[#cde7f8] text-[#2670a8]' },
                { card: 'bg-linear-to-br from-[#0d2e57] to-[#06182f] border-white/10', dark: true, icon: 'bg-white/14 border-white/18 text-[#5bc4ff]' },
              ][i];
              const boldIcon = item.icon.replace('-linear', '-bold');
              return (
                <motion.div
                  key={item.title}
                  className={`rounded-4xl border p-6 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.32),inset_0_1px_0_rgba(255,255,255,0.14)] transition-all duration-300 hover:shadow-[0_22px_42px_-26px_rgba(15,23,42,0.44)] hover:-translate-y-1 ${styles.card}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                >
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${styles.icon}`}><iconify-icon icon={boldIcon} class="text-2xl"></iconify-icon></div>
                  <h3 className={`mt-5 text-xl font-normal tracking-tight ${styles.dark ? 'text-white' : 'text-slate-950'}`}>{item.title}</h3>
                  <p className={`mt-3 text-sm leading-7 font-light ${styles.dark ? 'text-white/65' : 'text-slate-600'}`}>{item.text}</p>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-8 rounded-2xl bg-[#edf7ff] border border-[#cde7f8] p-5 text-sm text-[#154f79]">No fake likes. No fake scarcity. Paid upgrades do not change tenant fit, agent decisions, landlord decisions, referencing, reputation, or final approval.</div>
        </section>

        <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fef9c3] border border-[#fef08a] px-3.5 py-1.5 mb-5">
              <span className="text-sm">⚡</span>
              <span className="font-['JetBrains_Mono',monospace] text-xs font-medium tracking-[0.08em] text-[#854d0e]">LAUNCH PRICING · LOCKED IN FOR EARLY MEMBERS</span>
            </div>
            <p className="font-['JetBrains_Mono',monospace] text-xs font-medium tracking-normal text-[#2670a8] mb-4">PRICING</p>
            <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-slate-950 leading-[1.05]">Start free. Upgrade when you want more matches.</h2>
            <p className="mt-5 text-base md:text-lg leading-8 text-slate-600 font-light">Individuals pay per profile. Agencies and teams pay per seat, with volume discounts for larger teams. <span className="text-[#16a34a] font-medium">Early members lock in launch prices permanently.</span></p>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {productLadder.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`relative overflow-hidden rounded-4xl border p-6 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.32),inset_0_1px_0_white] transition-shadow duration-300 ${plan.featured ? 'bg-linear-to-b from-[#52a832] to-[#2f7d32] text-white border-[#25672a] shadow-[0_24px_56px_-30px_rgba(47,125,50,0.4),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_32px_64px_-30px_rgba(47,125,50,0.55)]' : plan.premium ? 'bg-[#092243] text-white border-[#06182f]' : 'bg-white/72 border-white hover:shadow-[0_22px_44px_-26px_rgba(15,23,42,0.38)]'}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                {plan.featured && <BorderBeam size={140} duration={9} borderWidth={2} colorFrom="#ffffff" colorTo="#9bd383" />}
                {plan.featured && (
                  <div className="mb-3 flex items-center gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/22 px-3 py-1 text-[10px] text-white font-['JetBrains_Mono',monospace] tracking-[0.12em]">★ BEST VALUE</div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-[#fef9c3]/20 border border-[#fef08a]/25 px-2.5 py-1 text-[9px] text-[#fde68a] font-['JetBrains_Mono',monospace] tracking-widest">⚡ LAUNCH PRICE</div>
                  </div>
                )}
                <p className={`font-['JetBrains_Mono',monospace] text-xs mb-3 tracking-normal ${plan.featured ? 'text-[#edf8ee]' : plan.premium ? 'text-[#b8ddf4]' : 'text-[#2670a8]'}`}>{plan.name}</p>
                <h3 className="text-2xl font-normal tracking-tight">{plan.price}</h3>
                {plan.note && <p className={`mt-2 text-sm font-light ${plan.featured || plan.premium ? 'text-white/85' : 'text-slate-500'}`}>{plan.note}</p>}
                <p className={`mt-4 text-sm leading-6 font-light ${plan.featured || plan.premium ? 'text-white/75' : 'text-slate-600'}`}>{plan.desc}</p>
                <div className="mt-6 space-y-2">{plan.features.map(feature => <CheckItem key={feature} light={plan.featured || plan.premium}>{feature}</CheckItem>)}</div>
                <a href={plan.href} className={`mt-7 inline-flex rounded-full px-5 py-3 text-sm transition-all duration-200 ${plan.featured ? 'bg-white text-[#2f7d32] hover:bg-[#f0fdf1]' : plan.premium ? 'bg-white text-[#092243] hover:bg-[#edf7ff]' : 'bg-[#092243] text-white hover:bg-[#0c2e5a]'} shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]`}>{plan.cta}</a>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 rounded-4xl bg-white/72 border border-white p-6 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.32),inset_0_1px_0_white]">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
              <div>
                <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">TEAM DISCOUNTS</p>
                <h3 className="mt-3 text-2xl md:text-3xl font-normal tracking-tight text-slate-950">Growing team? Seats get cheaper.</h3>
                <p className="mt-4 text-sm md:text-base leading-7 text-slate-600 font-light">Agencies and businesses can add paid seats at the same low base price, with automatic discounts for larger teams.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {volumeDiscounts.map((group) => (
                  <div key={group.title} className="rounded-2xl bg-[#edf7ff] border border-[#cde7f8] p-5">
                    <p className="text-sm font-normal text-[#154f79]">{group.title}</p>
                    <div className="mt-4 space-y-2">{group.rows.map((row) => <p key={row} className="text-sm text-slate-600">{row}</p>)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="concierge" className="max-w-7xl mx-auto px-6 py-20">
          <div className="relative overflow-hidden rounded-[2.75rem] bg-[#092243] text-white border border-[#06182f] p-8 md:p-12 shadow-[0_40px_90px_-45px_rgba(15,23,42,0.78),inset_0_1px_0_rgba(255,255,255,0.12)]">
            <div className="absolute top-[-35%] right-[-14%] w-120 h-120 rounded-full bg-[#52a832]/20 blur-[6rem] pointer-events-none"></div>
            <div className="relative grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
              <div>
                <p className="font-['JetBrains_Mono',monospace] text-xs font-medium tracking-normal text-[#b8ddf4] mb-4">RENTEAZY CONCIERGE</p>
                <h2 className="text-4xl md:text-5xl font-normal tracking-tight leading-[1.05]">Want someone in your corner through the whole process?</h2>
                <p className="mt-5 text-base leading-8 text-slate-300 font-light">Concierge is a tailored service for tenants, landlords, and agents who want RentEazy to help contact, vet, schedule, follow up, and support the match or search end-to-end.</p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <a href="mailto:hello@renteazy.co.uk?subject=RentEazy Concierge" className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#092243] px-6 py-3 text-sm shadow-[inset_0_1px_0_white] hover:bg-[#f0fdf1] transition-colors">
                    <iconify-icon icon="solar:letter-linear" class="text-base text-[#2670a8]"></iconify-icon>
                    Talk to us
                  </a>
                  <div className="flex items-center gap-2 rounded-full bg-white/[0.07] border border-white/10 px-4 py-3 text-sm text-white/65">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9bd383]"></span>
                    Tailored quote · No standard rate
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {conciergeFeatures.map((item) => (
                  <div key={item} className="rounded-2xl bg-white/[0.07] border border-white/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"><iconify-icon icon="solar:check-circle-linear" class="text-2xl text-[#9bd383]"></iconify-icon><p className="mt-4 text-sm text-white/82">{item}</p></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
          <div className="mb-10 text-center">
            <p className="font-['JetBrains_Mono',monospace] text-xs font-medium tracking-normal text-[#2670a8] mb-4">FAQ · {faqs.length} ANSWERED</p>
            <h2 className="text-4xl md:text-5xl font-normal tracking-tight text-slate-950 leading-[1.05]">Straight answers.</h2>
            <p className="mt-4 text-base text-slate-500 font-light">No jargon. If something matters, it's here.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-4xl bg-white/72 border border-white shadow-[0_14px_34px_-26px_rgba(15,23,42,0.32),inset_0_1px_0_white] overflow-hidden open:bg-white/90 transition-all">
                <summary className="cursor-pointer list-none px-5 md:px-6 py-5 flex items-center justify-between gap-5 outline-hidden"><div className="flex items-center gap-4"><div className="w-10 h-10 shrink-0 rounded-2xl bg-[#edf7ff] border border-[#cde7f8] flex items-center justify-center"><iconify-icon icon={faq.icon} class="text-xl text-[#2670a8]"></iconify-icon></div><h3 className="text-base md:text-lg font-normal tracking-tight text-slate-950">{faq.q}</h3></div><div className="w-9 h-9 shrink-0 rounded-full bg-linear-to-b from-white to-slate-50 border border-slate-200 flex items-center justify-center"><iconify-icon icon="solar:add-circle-linear" class="text-xl text-slate-500 group-open:rotate-45 transition-transform"></iconify-icon></div></summary>
                <div className="px-5 md:px-6 pb-6 md:pl-23"><p className="text-sm md:text-base leading-7 text-slate-600 font-light">{faq.a}</p></div>
              </details>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <p className="text-base text-slate-600 font-light">Still have a question?</p>
            <a href="mailto:hello@renteazy.co.uk?subject=Question about RentEazy" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#092243] px-6 py-3 text-sm text-white hover:bg-[#0c2e5a] transition-colors">
              <iconify-icon icon="solar:letter-linear" class="text-base"></iconify-icon>
              hello@renteazy.co.uk
            </a>
            <p className="text-xs text-slate-400 font-light">We reply within one business day.</p>
          </div>
        </section>

        <section id="final-cta" className="max-w-7xl mx-auto px-6 pt-14 pb-20">
          <div className="relative isolate overflow-hidden rounded-[2.75rem] bg-linear-to-b from-[#0c376b] via-[#092243] to-[#06182f] text-white border border-[#06182f] shadow-[0_40px_90px_-45px_rgba(9,34,67,0.82),inset_0_1px_0_rgba(255,255,255,0.24)]">
            <div className="relative z-10 px-6 py-24 md:px-12 md:py-28 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/16 border border-white/20 px-3.5 py-2 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9bd383] shadow-[0_0_0_5px_rgba(155,211,131,0.18)]"></span>
                <span className="font-['JetBrains_Mono',monospace] text-xs font-medium tracking-normal text-[#edf7ff]">YOUR MATCH IS ALREADY IN THE DECK</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.05] max-w-5xl mx-auto">
                Find your match.
                <span className="block">Or let your match find you.</span>
              </h2>

              {/* Per-audience hooks */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
                {[
                  { emoji: '🏠', audience: 'Tenants', hook: 'Swipe scored homes. Match when a landlord or agent likes you back.' },
                  { emoji: '🏢', audience: 'Agents', hook: 'Your reputation travels with every match. More users, more demand for top performers.' },
                  { emoji: '🔑', audience: 'Landlords', hook: 'Match tenants directly or request an intro to a matched agent. You choose.' },
                ].map((a) => (
                  <div key={a.audience} className="rounded-2xl bg-white/[0.07] border border-white/10 p-4 text-left">
                    <div className="text-lg mb-2">{a.emoji}</div>
                    <p className="text-xs font-medium text-white/90 font-['JetBrains_Mono',monospace] tracking-[0.08em] mb-2">{a.audience.toUpperCase()}</p>
                    <p className="text-sm leading-6 text-white/58">{a.hook}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href="/signup?source=final_cta&offer=match24h" className="hero-pill-shimmer relative overflow-hidden w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 bg-linear-to-b from-[#52a832] to-[#2f7d32] border border-[#74c656]/30 text-white text-base font-medium shadow-[0_12px_32px_rgba(82,168,50,0.36)] transition-all duration-200 hover:from-[#64bd44] hover:to-[#3b8d3d] hover:shadow-[0_16px_40px_rgba(82,168,50,0.48)]">
                  Start free — no card required
                  <iconify-icon icon="solar:arrow-right-linear" class="text-xl"></iconify-icon>
                </a>
                <a href={socialAppUrl} className="w-full sm:w-auto inline-flex items-center justify-center rounded-full px-7 py-4 bg-white/10 border border-white/18 text-white/78 text-sm font-normal transition-all duration-200 hover:bg-white/18 hover:text-white">Browse Free Feed first</a>
              </div>
              <p className="mt-4 text-xs text-white/32">No card required · Profile ready in 2 minutes · Free to post and swipe</p>
            </div>
          </div>
        </section>

        <footer className="relative z-10 w-full bg-white/72 border-t border-white shadow-[0_-18px_55px_-40px_rgba(15,23,42,0.45),inset_0_1px_0_white] backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-14">
            <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1.65fr] gap-12 lg:gap-20">
              {/* Brand column */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <BrandLogo footer />
                <p className="mt-5 max-w-xs text-sm leading-7 text-slate-500 font-light">The rental market, connected. Tenants, agents, and landlords matched by mutual interest.</p>
                <p className="mt-3 text-xs text-[#2670a8] font-['JetBrains_Mono',monospace]">renteazy.co.uk</p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#edf8ee] border border-[#d5ecd7] px-3 py-1.5 text-xs text-[#2f7d32]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2f7d32]"></span>
                  Post free · Swipe free · Match when ready
                </div>
                {/* Social links */}
                <div className="mt-7 flex items-center gap-3">
                  {[
                    ['tabler:brand-x', 'Twitter / X', 'https://x.com/renteazy'],
                    ['tabler:brand-instagram', 'Instagram', 'https://instagram.com/renteazy'],
                    ['tabler:brand-linkedin', 'LinkedIn', 'https://linkedin.com/company/renteazy'],
                    ['tabler:mail', 'Email', 'mailto:hello@renteazy.co.uk'],
                  ].map(([icon, label, href]) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:border-[#d5ecd7] hover:bg-[#edf8ee] hover:text-[#2f7d32]"
                    >
                      <iconify-icon icon={icon} class="text-base"></iconify-icon>
                    </a>
                  ))}
                </div>
                {/* App teaser */}
                <div className="mt-5 flex items-center gap-2">
                  {[['tabler:brand-apple', 'iOS'], ['tabler:brand-android', 'Android']].map(([icon, label]) => (
                    <div key={label} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                      <iconify-icon icon={icon} class="text-sm text-slate-400"></iconify-icon>
                      <span className="text-[10px] text-slate-400">{label} soon</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Link columns */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center sm:text-left">
                {[
                  ['Product', [['Feed', '#feed'], ['Match', '#match'], ['Swipe', '#swipe-ui'], ['Protect', '#paid-mechanics'], ['Concierge', '#concierge']]],
                  ['For', [['Tenants', '#match'], ['Agents', '#partners'], ['Landlords', '#partners'], ['Operators', '#marketplace'], ['Investors', '#marketplace']]],
                  ['Pricing', [['Free Feed', '#pricing'], ['Monthly', '#pricing'], ['Yearly', '#pricing'], ['Team Seats', '#partners'], ['Volume Discounts', '#pricing']]],
                  ['Company', [['FAQ', '#faq'], ['About', '#how-it-works'], ['Terms', '/terms'], ['Privacy', '/privacy'], ['Contact', 'mailto:hello@renteazy.co.uk']]],
                ].map(([title, links]) => (
                  <div key={title}>
                    <p className="font-['JetBrains_Mono',monospace] text-[10px] font-medium tracking-normal text-slate-400 uppercase mb-4">{title}</p>
                    <div className="flex flex-col gap-3 text-sm text-slate-500 font-light">
                      {links.map(([label, href]) => <a key={label} href={href} className="hover:text-[#2f7d32] transition-colors">{label}</a>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-12 text-xs leading-6 text-slate-400 font-light max-w-3xl">
              RentEazy is not a letting agency and does not own, manage, or guarantee any property. Match scores are indicative only. Final rental approval depends on landlords, agents, referencing, affordability, availability, and applicable law.
            </p>
            <div className="mt-6 pt-6 border-t border-slate-200/70 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-400 font-light">© 2026 RentEazy Ltd. All rights reserved.</p>
              <div className="flex items-center gap-4 text-xs text-slate-400 font-light">
                <a href="/terms" className="hover:text-[#2f7d32] transition-colors">Terms</a>
                <span className="w-1 h-1 rounded-full bg-slate-300" aria-hidden="true"></span>
                <a href="/privacy" className="hover:text-[#2f7d32] transition-colors">Privacy</a>
                <span className="w-1 h-1 rounded-full bg-slate-300" aria-hidden="true"></span>
                <a href="mailto:hello@renteazy.co.uk" className="hover:text-[#2f7d32] transition-colors">hello@renteazy.co.uk</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
