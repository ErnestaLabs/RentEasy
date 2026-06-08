import React, { useEffect, useMemo, useRef, useState } from 'react';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/700.css';
import "iconify-icon";
import { motion } from 'framer-motion';
import { PricingTable, SignIn, SignInButton, SignUp, SignUpButton, UserButton, useAuth, useUser } from '@clerk/react';
import IPhoneMockup from '@/components/ui/iphone-mockup';
import Marquee from '@/components/ui/marquee';
import { NumberTicker } from '@/components/ui/number-ticker';
import { BorderBeam } from '@/components/ui/border-beam';
import RentEazyVoiceAgent from '@/components/voice/RentEazyVoiceAgent';
import ProfileChooser from '@/profile/ProfileChooser';
import { useProfile } from '@/profile/useProfile';
import { getProfile } from '@/profile/profiles';
import RoleStory from '@/landing/RoleStory';
import { buildRentEazyFeed, createFeedSignal, createFeedCardSchema } from '@/lib/feedEngine';
import AppBottomNav from '@/app/components/AppBottomNav';
import BillingScreen from '@/app/screens/BillingScreen';
import FeedScreen from '@/app/screens/FeedScreen';
import LikesScreen from '@/app/screens/LikesScreen';
import PostScreen from '@/app/screens/PostScreen';
import ProfileScreen from '@/app/screens/ProfileScreen';
import SwipeScreen from '@/app/screens/SwipeScreen';
import SwipeInteractiveMatchCard from '@/app/components/swipe/InteractiveMatchCard';
// Code-split the VSL: Remotion is ~400KB and sits below the fold, so it must
// not block the hero paint. Loads lazily when the user scrolls toward it.
const VSLPlayer = React.lazy(() => import('@/components/vsl/VSLPlayer'));
import { ArrowDownLeft, ArrowUp, BadgeCheck, Bell, Bookmark, CalendarCheck, Camera, Check, Compass, Copy, Flag, Flame, Gift, Heart, Home, MapPin, Megaphone, MessageCircle, PlusCircle, RotateCcw, Search, Send, Share2, ShieldCheck, Sparkles, Star, UserPlus, UserRound, Users, X } from 'lucide-react';

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

const galleryImages = {
  living: [
    '/pexels/galleries/apartment-living-01.jpg',
    '/pexels/galleries/apartment-living-02.jpg',
    '/pexels/galleries/apartment-living-03.jpg',
    '/pexels/galleries/apartment-living-04.jpg',
    '/pexels/galleries/apartment-living-05.jpg',
    '/pexels/galleries/apartment-living-06.jpg',
    '/pexels/galleries/apartment-living-07.jpg',
    '/pexels/galleries/apartment-living-08.jpg',
  ],
  bedroom: [
    '/pexels/galleries/apartment-bedroom-01.jpg',
    '/pexels/galleries/apartment-bedroom-02.jpg',
    '/pexels/galleries/apartment-bedroom-03.jpg',
    '/pexels/galleries/apartment-bedroom-04.jpg',
    '/pexels/galleries/apartment-bedroom-05.jpg',
    '/pexels/galleries/apartment-bedroom-06.jpg',
    '/pexels/galleries/apartment-bedroom-07.jpg',
    '/pexels/galleries/apartment-bedroom-08.jpg',
  ],
  kitchen: [
    '/pexels/galleries/apartment-kitchen-01.jpg',
    '/pexels/galleries/apartment-kitchen-02.jpg',
    '/pexels/galleries/apartment-kitchen-03.jpg',
    '/pexels/galleries/apartment-kitchen-04.jpg',
    '/pexels/galleries/apartment-kitchen-05.jpg',
    '/pexels/galleries/apartment-kitchen-06.jpg',
    '/pexels/galleries/apartment-kitchen-07.jpg',
    '/pexels/galleries/apartment-kitchen-08.jpg',
  ],
  bathroom: [
    '/pexels/galleries/flat-bathroom-01.jpg',
    '/pexels/galleries/flat-bathroom-02.jpg',
    '/pexels/galleries/flat-bathroom-03.jpg',
    '/pexels/galleries/flat-bathroom-04.jpg',
    '/pexels/galleries/flat-bathroom-05.jpg',
    '/pexels/galleries/flat-bathroom-06.jpg',
  ],
  studio: [
    '/pexels/galleries/studio-flat-01.jpg',
    '/pexels/galleries/studio-flat-02.jpg',
    '/pexels/galleries/studio-flat-03.jpg',
    '/pexels/galleries/studio-flat-04.jpg',
    '/pexels/galleries/studio-flat-05.jpg',
    '/pexels/galleries/studio-flat-06.jpg',
    '/pexels/galleries/studio-flat-07.jpg',
    '/pexels/galleries/studio-flat-08.jpg',
  ],
  exterior: [
    '/pexels/galleries/house-exterior-01.jpg',
    '/pexels/galleries/house-exterior-02.jpg',
    '/pexels/galleries/house-exterior-03.jpg',
    '/pexels/galleries/house-exterior-04.jpg',
    '/pexels/galleries/house-exterior-05.jpg',
    '/pexels/galleries/house-exterior-06.jpg',
  ],
  shared: [
    '/pexels/galleries/shared-house-01.jpg',
    '/pexels/galleries/shared-house-02.jpg',
    '/pexels/galleries/shared-house-03.jpg',
    '/pexels/galleries/shared-house-04.jpg',
    '/pexels/galleries/shared-house-05.jpg',
    '/pexels/galleries/shared-house-06.jpg',
  ],
  tenant: [
    '/pexels/people/tenant-profile-01.jpg',
    '/pexels/people/tenant-profile-02.jpg',
    '/pexels/people/tenant-profile-03.jpg',
    '/pexels/people/tenant-profile-04.jpg',
    '/pexels/people/tenant-profile-05.jpg',
    '/pexels/people/tenant-profile-06.jpg',
  ],
  buddyPeople: [
    '/pexels/people/house-buddy-01.jpg',
    '/pexels/people/house-buddy-02.jpg',
    '/pexels/people/house-buddy-03.jpg',
    '/pexels/people/house-buddy-04.jpg',
    '/pexels/people/house-buddy-05.jpg',
    '/pexels/people/house-buddy-06.jpg',
  ],
  agentPeople: [
    '/pexels/people/agent-profile-01.jpg',
    '/pexels/people/agent-profile-02.jpg',
    '/pexels/people/agent-profile-03.jpg',
    '/pexels/people/agent-profile-04.jpg',
    '/pexels/people/agent-profile-05.jpg',
  ],
  landlordPeople: [
    '/pexels/people/landlord-profile-01.jpg',
    '/pexels/people/landlord-profile-02.jpg',
    '/pexels/people/landlord-profile-03.jpg',
    '/pexels/people/landlord-profile-04.jpg',
    '/pexels/people/landlord-profile-05.jpg',
  ],
  investorPeople: [
    '/pexels/people/investor-profile-01.jpg',
    '/pexels/people/investor-profile-02.jpg',
    '/pexels/people/investor-profile-03.jpg',
    '/pexels/people/investor-profile-04.jpg',
  ],
};

const swipeGalleryBlueprints = {
  flat: ['living', 'kitchen', 'bedroom', 'bathroom'],
  room: ['bedroom', 'shared', 'kitchen', 'bathroom'],
  studio: ['studio', 'kitchen', 'bathroom', 'living'],
  house: ['exterior', 'living', 'bedroom', 'kitchen'],
  tenant: ['tenant', 'tenant', 'living', 'bedroom'],
  landlord: ['landlordPeople', 'exterior', 'living', 'kitchen'],
  agent: ['agentPeople', 'living', 'kitchen', 'bedroom'],
  operator: ['agentPeople', 'living', 'studio', 'kitchen'],
  investor: ['investorPeople', 'exterior', 'living', 'kitchen'],
  buddy: ['buddyPeople', 'buddyPeople', 'bedroom', 'shared'],
  'short stay': ['studio', 'living', 'kitchen', 'bathroom'],
};

function buildConsistentGallery(type, index, length = 4) {
  const blueprint = swipeGalleryBlueprints[type] || swipeGalleryBlueprints.flat;
  return Array.from({ length }, (_, offset) => {
    const bucket = blueprint[offset % blueprint.length];
    const images = galleryImages[bucket] || galleryImages.living;
    return images[(index + offset * 2) % images.length];
  });
}

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
  ['viewing-ready-tenant', 'tenant', 'Viewing-ready tenant', 'East London', '£1,450 budget', 90, 'Move in 3 weeks', 'References, viewing windows and affordability ready', ['Tenant profile', 'Ready to view', 'Budget clear']],
  ['self-employed-renter', 'tenant', 'Self-employed renter', 'Hackney / Islington', '£1,550 budget', 86, 'Profile complete', 'Contracts, accounts and references prepared', ['Tenant profile', 'Human review', 'Documents ready']],
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
  const gallery = buildConsistentGallery(type, index);
  const peopleCard = ['tenant', 'buddy', 'operator', 'investor', 'landlord'].includes(type);
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
    gallery,
    imageSrc: gallery[0],
    imageAlt: `${title} swipe card`,
    imagePosition: peopleCard ? 'center center' : 'center 68%',
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

const openPeepsBustAvatars = Array.from({ length: 105 }, (_, index) => `/open-peeps/bust/peep-${index + 1}.png`);
const openPeepsStandingAvatars = Array.from({ length: 30 }, (_, index) => `/open-peeps/standing/peep-standing-${index + 1}.png`);
const openPeepsSittingAvatars = [1, 2, 4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 17, 18].map((index) => `/open-peeps/sitting/peep-sitting-${index}.png`);

function getPeepAvatarSrc(seed = '', variant = 'bust', avatarIndex = null) {
  const pool = variant === 'standing'
    ? openPeepsStandingAvatars
    : variant === 'sitting'
      ? openPeepsSittingAvatars
      : openPeepsBustAvatars;
  const index = Number.isFinite(Number(avatarIndex)) ? Number(avatarIndex) : Math.abs(stableHash(seed));
  return pool[Math.abs(index) % pool.length] || openPeepsBustAvatars[0];
}

const avatarBackgrounds = {
  mist: 'bg-[#edf7ff]',
  green: 'bg-[#edf8ee]',
  navy: 'bg-[#092243]',
  sun: 'bg-[#fff7ed]',
  blush: 'bg-[#fff1f2]',
};

const avatarBackgroundOptions = [
  ['mist', 'Mist', 'bg-[#edf7ff]'],
  ['green', 'Green', 'bg-[#edf8ee]'],
  ['navy', 'Navy', 'bg-[#092243]'],
  ['sun', 'Sun', 'bg-[#fff7ed]'],
  ['blush', 'Blush', 'bg-[#fff1f2]'],
];

const avatarVariantOptions = [
  ['bust', 'Bust'],
  ['standing', 'Standing'],
  ['sitting', 'Sitting'],
];

function PeepAvatar({ seed, variant = 'bust', avatarIndex = null, avatarBg = 'mist', className = 'h-11 w-11', imageClassName = '', ring = 'ring-1 ring-[#cfe9fb]' }) {
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full ${avatarBackgrounds[avatarBg] || avatarBackgrounds.mist} ${ring} ${className}`}>
      <img src={getPeepAvatarSrc(seed, variant, avatarIndex)} alt="" className={`h-full w-full object-cover object-top ${imageClassName}`} loading="lazy" />
    </span>
  );
}

function getAvatarPool(variant = 'bust') {
  if (variant === 'standing') return openPeepsStandingAvatars;
  if (variant === 'sitting') return openPeepsSittingAvatars;
  return openPeepsBustAvatars;
}

function AvatarCustomizer({ profile, setProfile }) {
  const variant = profile.avatarVariant || 'standing';
  const avatarBg = profile.avatarBg || 'mist';
  const selectedIndex = Number.isFinite(Number(profile.avatarIndex)) ? Number(profile.avatarIndex) : 0;
  const pool = getAvatarPool(variant);
  const visibleAvatars = pool.slice(0, variant === 'bust' ? 24 : 18);
  const isFullBody = variant !== 'bust';

  const updateAvatar = (patch) => {
    setProfile((current) => ({
      ...current,
      ...patch,
    }));
  };

  return (
    <div className="rounded-[1.75rem] border border-white bg-white/90 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2670a8]">Avatar</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Choose your look</h2>
        </div>
        <PeepAvatar
          seed={`${profile.id}-${profile.name}-${profile.role}`}
          variant={variant}
          avatarIndex={selectedIndex}
          avatarBg={avatarBg}
          className="h-16 w-16 rounded-[1.2rem]"
          ring="ring-1 ring-slate-200"
          imageClassName={isFullBody ? 'object-contain p-1' : ''}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1 rounded-full bg-[#edf3f7] p-1">
        {avatarVariantOptions.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => updateAvatar({ avatarVariant: value, avatarIndex: 0 })}
            className={`rounded-full px-3 py-2 text-xs font-semibold transition ${variant === value ? 'bg-[#092243] text-white shadow-[0_10px_24px_-18px_rgba(9,34,67,0.8)]' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-6 gap-2">
        {visibleAvatars.map((src, index) => {
          const selected = selectedIndex === index;
          return (
            <button
              key={src}
              type="button"
              onClick={() => updateAvatar({ avatarIndex: index })}
              className={`relative aspect-square overflow-hidden rounded-2xl transition ${avatarBackgrounds[avatarBg] || avatarBackgrounds.mist} ${selected ? 'ring-2 ring-[#2f7d32] ring-offset-2 ring-offset-white' : 'ring-1 ring-slate-200 hover:ring-[#8bdc65]'}`}
              aria-label={`Choose avatar ${index + 1}`}
            >
              <img src={src} alt="" className={`h-full w-full ${isFullBody ? 'object-contain p-1' : 'object-cover object-top'}`} loading="lazy" />
              {selected && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#2f7d32] ring-2 ring-white" />}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-600">Background</span>
        <div className="flex gap-2">
          {avatarBackgroundOptions.map(([value, label, className]) => (
            <button
              key={value}
              type="button"
              onClick={() => updateAvatar({ avatarBg: value })}
              className={`h-8 w-8 rounded-full ${className} ${avatarBg === value ? 'ring-2 ring-[#092243] ring-offset-2 ring-offset-white' : 'ring-1 ring-slate-200'}`}
              aria-label={`Use ${label} avatar background`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

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
    name: 'Founding Yearly',
    price: '£69.99/year',
    note: 'Founding rate — locked for life',
    desc: 'First 1,000 founding members lock £69.99/year for as long as they stay — instead of the £99.99 standard.',
    cta: 'Lock founding price',
    href: '/signup?offer=founding-yearly&plan=yearly',
    featured: true,
    features: ['£30/year below standard — for life', 'About 19p/day', 'See who liked you', 'Advanced filters', 'Daily picks', 'Superlikes included', 'Better visibility', 'Profile/listing insights'],
  },
  {
    name: 'Individual Monthly',
    price: '£4.99 first month',
    note: 'Then £9.99/month',
    desc: 'For tenants, buddies, landlords, and solo agents.',
    cta: 'Start for £4.99',
    href: '/signup?source=pricing&plan=individual-monthly&offer=first-month-499',
    features: ['See who liked you', 'Swipe-based matching', 'Advanced filters', 'Daily picks', 'Superlikes included', 'Better visibility', 'Match scores', 'Profile/listing insights'],
  },
  {
    name: 'Free Feed',
    price: '£0',
    desc: 'For everyone. Start here.',
    cta: 'Join Free',
    href: '/signup?source=pricing&plan=free',
    features: ['Create profile', 'Browse Feed', 'Post to Feed', 'Basic swipes', 'Basic likes', 'Blurred Who Liked You', 'Basic filters', 'Follow and save'],
  },
  {
    name: 'Business Yearly Seats',
    price: '£99.99/year per seat',
    note: 'Volume discounts for teams',
    desc: 'Volume discounts for larger teams.',
    cta: 'Get Team Yearly',
    href: '/signup?source=pricing&plan=business-yearly',
    features: ['Yearly seat access', 'Shared business profile', 'Team seat management', 'Advanced filters', 'Superlikes included', 'Boost access', 'Volume discounts'],
  },
  {
    name: 'Agency / Business Monthly',
    price: '£4.99 first month per seat',
    note: 'Then £9.99/month per seat',
    desc: 'For agencies, teams, and multi-seat operators.',
    cta: 'Add Seats',
    href: '/signup?source=pricing&plan=business-monthly&offer=first-month-499',
    features: ['Staff seats', 'Shared business profile', 'Advanced filters', 'Who liked you', 'Screened demand', 'Landlord/property discovery', 'Superlikes included', 'Boost access', 'Profile/listing insights'],
  },
  {
    name: 'Protect',
    price: 'From £0.99/month',
    note: 'Protect Plus at £2.99/month',
    desc: 'For everyone.',
    cta: 'Add Protect',
    href: '/signup?source=pricing&plan=protect',
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
  name: 'New RentEazy profile',
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
  avatarVariant: 'standing',
  avatarIndex: 0,
  avatarBg: 'mist',
};

const previewUser = {
  id: 'preview-visitor',
  name: 'Guest preview',
  role: '',
};

const previewAppProfile = {
  id: previewUser.id,
  name: previewUser.name,
  role: previewUser.role,
  area: '',
  budget: '',
  moveDate: '',
  lookingFor: '',
  avatarVariant: 'standing',
  avatarIndex: 1,
  avatarBg: 'mist',
};

const previewUsageLimit = {
  id: 'daily-swipes-preview',
  userId: previewUser.id,
  limitType: 'daily_swipes',
  period: 'day',
  used: 0,
  allowance: 0,
  resetsAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
};

const previewWallet = {
  id: 'wallet-preview',
  userId: previewUser.id,
  balance: 0,
  updatedAt: new Date().toISOString(),
};

const previewAppStreak = {
  id: 'streak-preview',
  userId: previewUser.id,
  streakType: 'daily_app_open',
  count: 0,
  lastActivityAt: null,
};

const previewReputationProfile = {
  userId: previewUser.id,
  score: 0,
  tier: 'Not started',
  completedEvents: [],
  missingFields: ['Create an account', 'Choose a role', 'Answer match questions'],
  suggestions: ['Create a free account to start building real RentEazy reputation.'],
  updatedAt: new Date().toISOString(),
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
    media: ['/pexels/images/stratford-room.jpg'],
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
    media: ['/pexels/images/hackney-tenant.jpg'],
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
    media: ['/pexels/images/clapham-buddy.jpg'],
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
    media: ['/pexels/videos/city-apartment.mp4'],
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
    media: ['/pexels/images/bow-landlord-flat.jpg'],
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
    media: ['/pexels/images/northwest-investor.jpg'],
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
    media: ['/pexels/images/canary-area-insight.jpg'],
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
    media: ['/pexels/videos/agent-walkthrough.mp4'],
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
    media: ['/pexels/images/operator-west-london.jpg'],
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
    media: ['/pexels/images/leeds-student-house.jpg'],
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
    media: ['/pexels/images/referencing-question.jpg'],
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
    media: ['/pexels/videos/rental-feed-scroll.mp4'],
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

const vocSeededFeedPosts = [
  {
    id: 'voc-tenant-ghosted-viewing',
    authorId: 'tenant-jules',
    authorType: 'Tenant',
    authorName: 'Jules M.',
    postType: 'Question',
    title: 'Is it normal to get no reply after a viewing?',
    body: 'Viewed a room, sent my availability and documents, then nothing. I would rather get a clear no than sit refreshing messages for days.',
    media: ['/pexels/images/referencing-question.jpg'],
    area: 'London',
    budget: 'Advice needed',
    tags: ['Ghosting', 'Viewing follow-up', 'Clear replies'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-04T11:40:00.000Z',
    updatedAt: '2026-06-04T11:40:00.000Z',
    likeCount: 18,
    commentCount: 7,
    saveCount: 11,
    shareCount: 2,
  },
  {
    id: 'voc-agent-callback-window',
    authorId: 'agent-dockside',
    authorType: 'Agent',
    authorName: 'Dockside Lettings',
    postType: 'Agent Update',
    title: 'Canary Wharf rooms: reply window today',
    body: 'If you matched on a bills-included room under £1,000, send move date and viewing windows today. We are closing the shortlist tonight.',
    media: ['/pexels/images/canary-area-insight.jpg'],
    area: 'Canary Wharf',
    budget: 'Under £1,000 rooms',
    tags: ['Reply window', 'Bills included', 'Shortlist'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-04T11:20:00.000Z',
    updatedAt: '2026-06-04T11:20:00.000Z',
    likeCount: 24,
    commentCount: 5,
    saveCount: 19,
    shareCount: 4,
  },
  {
    id: 'voc-renter-referencing-self-employed',
    authorId: 'tenant-omar',
    authorType: 'Tenant',
    authorName: 'Omar H.',
    postType: 'Looking',
    title: 'Self-employed renter with clean records',
    body: 'I can show contracts, accounts, references and deposit. Looking for a landlord who will read the full profile instead of auto-rejecting me.',
    media: ['/pexels/images/hackney-tenant.jpg'],
    area: 'Hackney / Islington',
    budget: 'Up to £1,450 pcm',
    tags: ['Self-employed', 'Referencing', 'Human review'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-04T10:50:00.000Z',
    updatedAt: '2026-06-04T10:50:00.000Z',
    likeCount: 31,
    commentCount: 12,
    saveCount: 16,
    shareCount: 3,
  },
  {
    id: 'voc-single-renter-zone2',
    authorId: 'tenant-sarah',
    authorType: 'Tenant',
    authorName: 'Sarah L.',
    postType: 'Looking',
    title: 'Single professional looking without a bidding war',
    body: 'Stable income, strong references, no pets. I am trying to avoid another best-and-final race where couples or upfront rent always win.',
    media: ['/pexels/images/feed-moving.jpg'],
    area: 'Zone 2 London',
    budget: 'Up to £1,600 pcm',
    tags: ['Single renter', 'No bidding war', 'References ready'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-04T10:25:00.000Z',
    updatedAt: '2026-06-04T10:25:00.000Z',
    likeCount: 27,
    commentCount: 9,
    saveCount: 14,
    shareCount: 4,
  },
  {
    id: 'voc-scam-warning-bank-transfer',
    authorId: 'tenant-nina',
    authorType: 'Tenant',
    authorName: 'Nina P.',
    postType: 'Advice',
    title: 'Red flag: asked to pay outside the platform',
    body: 'A listing looked cheap, then the contact wanted money sent directly before viewing. I reported it. Do not pay deposits before verifying the source.',
    media: ['/pexels/images/referencing-question.jpg'],
    area: 'UK',
    budget: 'Safety warning',
    tags: ['Scam/fraud', 'Deposit safety', 'Report'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-04T09:55:00.000Z',
    updatedAt: '2026-06-04T09:55:00.000Z',
    likeCount: 46,
    commentCount: 15,
    saveCount: 39,
    shareCount: 11,
  },
  {
    id: 'voc-room-bills-clarity',
    authorId: 'agent-eastline',
    authorType: 'Agent',
    authorName: 'Eastline Rooms',
    postType: 'Room',
    title: 'Bills-included double room in Bow',
    body: 'Clean double room with council tax, broadband and utilities included. We will only message matched renters who have a move date and budget filled in.',
    media: ['/pexels/images/feed-room-1.jpg'],
    area: 'Bow',
    budget: '£975 pcm',
    tags: ['Bills included', 'Matched renters only', 'Move date needed'],
    visibility: 'public',
    sponsoredStatus: 'Boosted',
    createdAt: '2026-06-04T09:35:00.000Z',
    updatedAt: '2026-06-04T09:35:00.000Z',
    likeCount: 35,
    commentCount: 6,
    saveCount: 29,
    shareCount: 5,
  },
  {
    id: 'voc-flatshare-adults',
    authorId: 'buddy-ellie',
    authorType: 'House Buddy',
    authorName: 'Ellie C.',
    postType: 'House Buddy',
    title: 'Adult flatshare without chaos',
    body: 'Looking for one person for a calm home, not a party house. Clean shared spaces, predictable bills, and direct communication matter most.',
    media: ['/pexels/images/clapham-buddy.jpg'],
    area: 'Brixton / Clapham',
    budget: '£950-£1,150 each',
    tags: ['Calm home', 'Shared responsibilities', 'Bills clarity'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-04T09:10:00.000Z',
    updatedAt: '2026-06-04T09:10:00.000Z',
    likeCount: 22,
    commentCount: 10,
    saveCount: 17,
    shareCount: 3,
  },
  {
    id: 'voc-landlord-prescreen-form',
    authorId: 'landlord-dan',
    authorType: 'Landlord',
    authorName: 'Dan W.',
    postType: 'Landlord Update',
    title: 'Pre-screen before I offer viewings',
    body: 'Last listing had huge enquiry volume and too many no-shows. I am only booking people with budget, move date, household details and viewing times completed.',
    media: ['/pexels/images/feed-landlord.jpg'],
    area: 'Croydon',
    budget: 'Rooms from £850 pcm',
    tags: ['Pre-screening', 'No-shows', 'Viewing slots'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-04T08:45:00.000Z',
    updatedAt: '2026-06-04T08:45:00.000Z',
    likeCount: 40,
    commentCount: 18,
    saveCount: 20,
    shareCount: 6,
  },
  {
    id: 'voc-landlord-void-period',
    authorId: 'landlord-maria',
    authorType: 'Landlord',
    authorName: 'Maria G.',
    postType: 'Landlord Opportunity',
    title: 'Small flat, need fewer viewings and better fit',
    body: 'The flat is ready. I would rather speak to five suitable renters than handle another week of open enquiries that go nowhere.',
    media: ['/pexels/images/bow-landlord-flat.jpg'],
    area: 'Walthamstow',
    budget: '£1,575 pcm',
    tags: ['Void period', 'Suitable renters', 'Direct let'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-04T08:25:00.000Z',
    updatedAt: '2026-06-04T08:25:00.000Z',
    likeCount: 29,
    commentCount: 8,
    saveCount: 21,
    shareCount: 2,
  },
  {
    id: 'voc-landlord-agent-fee',
    authorId: 'landlord-colin',
    authorType: 'Landlord',
    authorName: 'Colin B.',
    postType: 'Question',
    title: 'When is an agent worth the management fee?',
    body: 'I do not mind paying for useful work. I do mind paying percentages and then doing the chasing, statements and tenant checks myself.',
    media: ['/pexels/images/feed-office-agent.jpg'],
    area: 'Birmingham',
    budget: 'Landlord question',
    tags: ['Agent fees', 'Management', 'Vetting control'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-04T08:05:00.000Z',
    updatedAt: '2026-06-04T08:05:00.000Z',
    likeCount: 33,
    commentCount: 16,
    saveCount: 15,
    shareCount: 4,
  },
  {
    id: 'voc-agent-quality-viewings',
    authorId: 'agent-harbour',
    authorType: 'Agent',
    authorName: 'Harbour & Co',
    postType: 'Agent Update',
    title: 'Greenwich viewings: confirmed renters only',
    body: 'We are trialling confirmation checks before Saturday slots. It protects renters from wasted trips and landlords from empty appointments.',
    media: ['/pexels/videos/agent-walkthrough.mp4'],
    area: 'Greenwich',
    budget: 'Rooms £890-£1,100',
    tags: ['Confirmed viewing', 'No-show reduction', 'Documents ready'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-04T07:45:00.000Z',
    updatedAt: '2026-06-04T07:45:00.000Z',
    likeCount: 26,
    commentCount: 7,
    saveCount: 18,
    shareCount: 3,
  },
  {
    id: 'voc-tenant-deposit-return',
    authorId: 'tenant-reece',
    authorType: 'Tenant',
    authorName: 'Reece J.',
    postType: 'Advice',
    title: 'How do you protect your deposit trail?',
    body: 'I am moving soon and want a clean record: photos, inventory, messages and checkout notes. What should be logged before keys are handed over?',
    media: ['/pexels/images/feed-moving.jpg'],
    area: 'Manchester',
    budget: 'Move-out checklist',
    tags: ['Deposit', 'Protect', 'Move-out record'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-03T18:30:00.000Z',
    updatedAt: '2026-06-03T18:30:00.000Z',
    likeCount: 38,
    commentCount: 14,
    saveCount: 34,
    shareCount: 7,
  },
  {
    id: 'voc-short-stay-between-homes',
    authorId: 'host-bridge',
    authorType: 'Short-Term Host',
    authorName: 'BridgeStay',
    postType: 'Short-Term Stay',
    title: 'Weekly stay for renters between homes',
    body: 'Furnished studio for people stuck between viewings, referencing and move-in dates. Weekly extension possible, bills included.',
    media: ['/pexels/videos/city-apartment.mp4'],
    area: 'Shoreditch',
    budget: '£615/week',
    tags: ['Between homes', 'Bills included', 'Flexible extension'],
    visibility: 'public',
    sponsoredStatus: 'Promoted',
    createdAt: '2026-06-03T17:50:00.000Z',
    updatedAt: '2026-06-03T17:50:00.000Z',
    likeCount: 21,
    commentCount: 4,
    saveCount: 25,
    shareCount: 5,
  },
  {
    id: 'voc-operator-compliant-stock',
    authorId: 'operator-keysafe',
    authorType: 'Operator',
    authorName: 'KeySafe Stays',
    postType: 'Operator Offer',
    title: 'Operator seeking compliant furnished homes',
    body: 'Looking for landlords who want management or co-hosting with clear reporting. Not interested in unclear lease positions or poor handover records.',
    media: ['/pexels/images/operator-west-london.jpg'],
    area: 'West London',
    budget: 'Management / co-hosting',
    tags: ['Operator fit', 'Compliance', 'Monthly reporting'],
    visibility: 'public',
    sponsoredStatus: 'Sponsored',
    createdAt: '2026-06-03T17:20:00.000Z',
    updatedAt: '2026-06-03T17:20:00.000Z',
    likeCount: 19,
    commentCount: 6,
    saveCount: 18,
    shareCount: 4,
  },
  {
    id: 'voc-investor-deals-stack-up',
    authorId: 'investor-raj',
    authorType: 'Investor',
    authorName: 'Raj V.',
    postType: 'Investor Brief',
    title: 'Send numbers that survive due diligence',
    body: 'Open to North West BTL and HMO leads, but I need rent comparables, refurb assumptions, financing notes and source transparency before a call.',
    media: ['/pexels/images/northwest-investor.jpg'],
    area: 'Manchester / Liverpool',
    budget: '£180k-£420k',
    tags: ['Due diligence', 'BTL', 'HMO', 'Numbers first'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-03T16:40:00.000Z',
    updatedAt: '2026-06-03T16:40:00.000Z',
    likeCount: 44,
    commentCount: 20,
    saveCount: 32,
    shareCount: 8,
  },
  {
    id: 'voc-sourcer-compliance-visible',
    authorId: 'sourcer-mersey',
    authorType: 'Sourcer',
    authorName: 'Mersey Property Desk',
    postType: 'Sourcer Deal',
    title: 'Liverpool deal pack with compliance notes',
    body: 'Two-bed refurb lead with source notes, rent evidence, fees shown plainly and compliance checklist attached. Investors can ask for missing assumptions.',
    media: ['/pexels/images/leeds-student-house.jpg'],
    area: 'Liverpool',
    budget: '£145k guide',
    tags: ['Compliance visible', 'Rent evidence', 'Fees shown'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-03T16:05:00.000Z',
    updatedAt: '2026-06-03T16:05:00.000Z',
    likeCount: 28,
    commentCount: 11,
    saveCount: 27,
    shareCount: 5,
  },
  {
    id: 'voc-investor-no-broadcast',
    authorId: 'investor-sasha',
    authorType: 'Investor',
    authorName: 'Sasha D.',
    postType: 'Question',
    title: 'How are people vetting sourcers before paying fees?',
    body: 'I ignore broadcast deal blasts now. I want track record, compliance visibility and referrals from people who have actually completed.',
    media: ['/pexels/images/feed-office-agent.jpg'],
    area: 'UK',
    budget: 'Investor question',
    tags: ['Sourcer vetting', 'Track record', 'No broadcast deals'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-03T15:35:00.000Z',
    updatedAt: '2026-06-03T15:35:00.000Z',
    likeCount: 55,
    commentCount: 24,
    saveCount: 41,
    shareCount: 9,
  },
  {
    id: 'voc-btl-section24-check',
    authorId: 'landlord-investor-lee',
    authorType: 'Investor',
    authorName: 'Lee F.',
    postType: 'Advice',
    title: 'Before buying: model tax, voids and maintenance',
    body: 'A deal can look fine before Section 24, repairs, voids and management time. I am saving posts that show the full downside as well as headline rent.',
    media: ['/pexels/images/northwest-investor.jpg'],
    area: 'UK',
    budget: 'Deal analysis',
    tags: ['Section 24', 'Void risk', 'Maintenance'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-03T15:05:00.000Z',
    updatedAt: '2026-06-03T15:05:00.000Z',
    likeCount: 48,
    commentCount: 17,
    saveCount: 46,
    shareCount: 10,
  },
  {
    id: 'voc-agent-transparent-process',
    authorId: 'agent-northstar',
    authorType: 'Agent',
    authorName: 'Northstar Homes',
    postType: 'Agent Update',
    title: 'Our rental process in five steps',
    body: 'Match, profile check, viewing slot, landlord decision, clear response. No duplicate forms after every message. Ask questions below.',
    media: ['/pexels/images/feed-office-agent.jpg'],
    area: 'Leeds',
    budget: 'Process update',
    tags: ['Transparent process', 'No duplicate forms', 'Clear response'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-03T14:30:00.000Z',
    updatedAt: '2026-06-03T14:30:00.000Z',
    likeCount: 37,
    commentCount: 13,
    saveCount: 30,
    shareCount: 6,
  },
  {
    id: 'voc-area-insight-zone2-rooms',
    authorId: 'renteazy-market',
    authorType: 'RentEazy',
    authorName: 'RentEazy Market',
    postType: 'Area Insight',
    title: 'Zone 2 rooms: what gets replies first',
    body: 'Posts with move date, budget, viewing windows and bills preference get clearer responses. Missing details are the main reason conversations stall.',
    media: ['/pexels/images/feed-balcony-1.jpg'],
    area: 'London Zone 2',
    budget: 'Market signal',
    tags: ['Area insight', 'Profile strength', 'Reply quality'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-03T14:00:00.000Z',
    updatedAt: '2026-06-03T14:00:00.000Z',
    likeCount: 62,
    commentCount: 16,
    saveCount: 53,
    shareCount: 12,
  },
  {
    id: 'voc-property-stratford-studio',
    authorId: 'landlord-ana',
    authorType: 'Landlord',
    authorName: 'Ana V.',
    postType: 'Property',
    title: 'Stratford studio, first-come viewing list',
    body: 'Furnished studio near station. I will review matched profiles in order and reply either way so nobody waits in silence.',
    media: ['/pexels/images/feed-kitchen-1.jpg'],
    area: 'Stratford',
    budget: '£1,395 pcm',
    tags: ['Studio', 'Clear replies', 'Matched profiles'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-03T13:35:00.000Z',
    updatedAt: '2026-06-03T13:35:00.000Z',
    likeCount: 42,
    commentCount: 9,
    saveCount: 38,
    shareCount: 5,
  },
  {
    id: 'voc-property-hackney-flat',
    authorId: 'agent-canal',
    authorType: 'Agent',
    authorName: 'Canal Homes',
    postType: 'Property',
    title: 'Hackney one-bed with clear bills breakdown',
    body: 'One-bed flat with estimated council tax, broadband and energy shown separately. Best for renters who want the real monthly cost before viewing.',
    media: ['/pexels/images/feed-flat-1.jpg'],
    area: 'Hackney',
    budget: '£1,725 pcm',
    tags: ['Bills breakdown', 'One-bed', 'Monthly cost'],
    visibility: 'public',
    sponsoredStatus: 'Promoted',
    createdAt: '2026-06-03T13:05:00.000Z',
    updatedAt: '2026-06-03T13:05:00.000Z',
    likeCount: 39,
    commentCount: 8,
    saveCount: 35,
    shareCount: 4,
  },
  {
    id: 'voc-room-manchester-flatshare',
    authorId: 'agent-mcrrooms',
    authorType: 'Agent',
    authorName: 'MCR Rooms',
    postType: 'Room',
    title: 'Manchester room with response deadline',
    body: 'Double room in a quiet flatshare. Shortlist closes tomorrow afternoon and every matched profile will receive a yes/no update.',
    media: ['/pexels/images/feed-room-1.jpg'],
    area: 'Manchester',
    budget: '£690 pcm',
    tags: ['Quiet flatshare', 'Response deadline', 'Bills estimate'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-03T12:40:00.000Z',
    updatedAt: '2026-06-03T12:40:00.000Z',
    likeCount: 34,
    commentCount: 7,
    saveCount: 28,
    shareCount: 5,
  },
  {
    id: 'voc-landlord-pet-question',
    authorId: 'landlord-hannah',
    authorType: 'Landlord',
    authorName: 'Hannah R.',
    postType: 'Question',
    title: 'How are landlords handling pets fairly?',
    body: 'I am open to pets if the profile is clear on routine, references and property fit. Looking for practical policy ideas, not blanket assumptions.',
    media: ['/pexels/images/feed-house-1.jpg'],
    area: 'Brighton',
    budget: 'Landlord question',
    tags: ['Pets', 'Policy', 'Fair screening'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-03T12:05:00.000Z',
    updatedAt: '2026-06-03T12:05:00.000Z',
    likeCount: 30,
    commentCount: 19,
    saveCount: 18,
    shareCount: 4,
  },
  {
    id: 'voc-resident-maintenance-record',
    authorId: 'tenant-leah',
    authorType: 'Tenant',
    authorName: 'Leah S.',
    postType: 'Success Story',
    title: 'Keeping maintenance notes helped',
    body: 'Logged the repair, photos and messages in one place. It made the follow-up calmer and gave both sides a clean record.',
    media: ['/pexels/images/perk-cleaning.jpg'],
    area: 'Bristol',
    budget: 'Resident mode',
    tags: ['Maintenance record', 'Protect', 'Resident mode'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-03T11:40:00.000Z',
    updatedAt: '2026-06-03T11:40:00.000Z',
    likeCount: 23,
    commentCount: 6,
    saveCount: 21,
    shareCount: 3,
  },
  {
    id: 'voc-perk-cleaning-move',
    authorId: 'partner-moveclean',
    authorType: 'Business',
    authorName: 'Move-clean Partner',
    postType: 'Operator Offer',
    title: 'Move-in and end-of-tenancy cleaning slots',
    body: 'Useful when you have a confirmed move date or listing handover. Sponsored partner card, labelled and reportable.',
    media: ['/pexels/videos/cleaning-service.mp4'],
    area: 'London',
    budget: 'From £49',
    tags: ['Cleaning', 'Move date', 'Partner offer'],
    visibility: 'public',
    sponsoredStatus: 'Sponsored',
    createdAt: '2026-06-03T11:20:00.000Z',
    updatedAt: '2026-06-03T11:20:00.000Z',
    likeCount: 12,
    commentCount: 2,
    saveCount: 19,
    shareCount: 3,
  },
  {
    id: 'voc-perk-storage-window',
    authorId: 'partner-storage',
    authorType: 'Business',
    authorName: 'Move Window Storage',
    postType: 'Availability',
    title: 'Short-term storage for awkward move gaps',
    body: 'For renters between homes, rooms or short stays. Shown around move-window signals, not random display advertising.',
    media: ['/pexels/images/perk-storage.jpg'],
    area: 'UK',
    budget: 'Partner offer',
    tags: ['Storage', 'Move gap', 'Partner offer'],
    visibility: 'public',
    sponsoredStatus: 'Sponsored',
    createdAt: '2026-06-03T11:00:00.000Z',
    updatedAt: '2026-06-03T11:00:00.000Z',
    likeCount: 9,
    commentCount: 1,
    saveCount: 17,
    shareCount: 2,
  },
  {
    id: 'voc-broadband-move-in',
    authorId: 'partner-broadband',
    authorType: 'Business',
    authorName: 'Move-ready Broadband',
    postType: 'Availability',
    title: 'Broadband setup before move-in',
    body: 'Compare setup windows once a tenancy or short stay becomes likely. Labelled partner post with frequency caps.',
    media: ['/pexels/images/perk-broadband.jpg'],
    area: 'UK',
    budget: 'Partner offer',
    tags: ['Broadband', 'Move-in', 'Partner offer'],
    visibility: 'public',
    sponsoredStatus: 'Promoted',
    createdAt: '2026-06-03T10:40:00.000Z',
    updatedAt: '2026-06-03T10:40:00.000Z',
    likeCount: 11,
    commentCount: 1,
    saveCount: 15,
    shareCount: 2,
  },
  {
    id: 'voc-renter-fair-process',
    authorId: 'tenant-ade',
    authorType: 'Tenant',
    authorName: 'Ade F.',
    postType: 'Advice',
    title: 'Fair process beats bidding pressure',
    body: 'I am more likely to trust a listing that explains order, criteria and response timing than one that says act ASAP with no process.',
    media: ['/pexels/images/feed-balcony-1.jpg'],
    area: 'London',
    budget: 'Rental process',
    tags: ['Fair process', 'No bidding pressure', 'Transparency'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-03T10:10:00.000Z',
    updatedAt: '2026-06-03T10:10:00.000Z',
    likeCount: 58,
    commentCount: 21,
    saveCount: 44,
    shareCount: 13,
  },
  {
    id: 'voc-agent-no-middleman-balance',
    authorId: 'agent-clearroute',
    authorType: 'Agent',
    authorName: 'ClearRoute Agency',
    postType: 'Agent Update',
    title: 'Where agents still add value',
    body: 'Fast replies, clean process, honest shortlists and useful landlord context. If an agent cannot provide that, renters and landlords should know.',
    media: ['/pexels/images/feed-office-agent.jpg'],
    area: 'London',
    budget: 'Agent standard',
    tags: ['Agent accountability', 'Clear process', 'Shortlist quality'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-03T09:40:00.000Z',
    updatedAt: '2026-06-03T09:40:00.000Z',
    likeCount: 25,
    commentCount: 14,
    saveCount: 18,
    shareCount: 4,
  },
  {
    id: 'voc-investor-referral-network',
    authorId: 'investor-maya',
    authorType: 'Investor',
    authorName: 'Maya K.',
    postType: 'Investor Brief',
    title: 'Looking for sourcers with investor references',
    body: 'Interested in Midlands and North West leads. I want to see completed introductions and investor feedback before discussing fees.',
    media: ['/pexels/images/northwest-investor.jpg'],
    area: 'Midlands / North West',
    budget: '£120k-£300k',
    tags: ['Investor references', 'Track record', 'Deal flow'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-03T09:15:00.000Z',
    updatedAt: '2026-06-03T09:15:00.000Z',
    likeCount: 32,
    commentCount: 10,
    saveCount: 29,
    shareCount: 6,
  },
  {
    id: 'voc-sourcer-fees-plain',
    authorId: 'sourcer-clearpack',
    authorType: 'Sourcer',
    authorName: 'ClearPack Sourcing',
    postType: 'Sourcer Deal',
    title: 'Sourcing fee shown before the call',
    body: 'Deal pack includes fee, source route, comparable rents, refurb range and red flags. If the numbers do not stack, say so in comments.',
    media: ['/pexels/images/leeds-student-house.jpg'],
    area: 'Birmingham',
    budget: '£165k guide',
    tags: ['Fee visible', 'Red flags', 'Comparable rents'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-03T08:50:00.000Z',
    updatedAt: '2026-06-03T08:50:00.000Z',
    likeCount: 28,
    commentCount: 13,
    saveCount: 26,
    shareCount: 5,
  },
  {
    id: 'voc-availability-leeds-room',
    authorId: 'agent-leedsrooms',
    authorType: 'Agent',
    authorName: 'Leeds Rooms',
    postType: 'Availability',
    title: 'Headingley room available after fall-through',
    body: 'One room came back after a failed reference. Preference for renters with move date, affordability and viewing slots already completed.',
    media: ['/pexels/images/leeds-student-house.jpg'],
    area: 'Leeds',
    budget: '£625 pcm',
    tags: ['Availability', 'Reference ready', 'Room'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-03T08:25:00.000Z',
    updatedAt: '2026-06-03T08:25:00.000Z',
    likeCount: 19,
    commentCount: 5,
    saveCount: 24,
    shareCount: 3,
  },
  {
    id: 'voc-corporate-stay-relocation',
    authorId: 'operator-citybridge',
    authorType: 'Operator',
    authorName: 'CityBridge Stays',
    postType: 'Serviced Accommodation',
    title: 'Corporate relocation stay with monthly reporting',
    body: 'Furnished stay for relocation teams and guests waiting on long-term rentals. Bills, Wi-Fi and extension terms visible upfront.',
    media: ['/pexels/videos/rental-feed-scroll.mp4'],
    area: 'Manchester',
    budget: 'From £720/week',
    tags: ['Corporate stay', 'Relocation', 'Bills visible'],
    visibility: 'public',
    sponsoredStatus: 'Boosted',
    createdAt: '2026-06-03T08:05:00.000Z',
    updatedAt: '2026-06-03T08:05:00.000Z',
    likeCount: 18,
    commentCount: 3,
    saveCount: 22,
    shareCount: 4,
  },
  {
    id: 'voc-landlord-renters-rights',
    authorId: 'landlord-owen',
    authorType: 'Landlord',
    authorName: 'Owen T.',
    postType: 'Question',
    title: 'How careful is too careful after legal changes?',
    body: 'The risk of the wrong tenant feels bigger now. I want to stay fair, but I also need confidence before handing over keys.',
    media: ['/pexels/images/feed-landlord.jpg'],
    area: 'Kent',
    budget: 'Landlord question',
    tags: ['Vetting', 'Fair process', 'Key handover'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-02T17:50:00.000Z',
    updatedAt: '2026-06-02T17:50:00.000Z',
    likeCount: 36,
    commentCount: 22,
    saveCount: 20,
    shareCount: 5,
  },
  {
    id: 'voc-tenant-direct-landlord',
    authorId: 'tenant-monica',
    authorType: 'Tenant',
    authorName: 'Monica A.',
    postType: 'Looking',
    title: 'Looking for direct landlord conversation',
    body: 'I am not trying to bypass checks. I just want a chance to explain my situation to the person actually deciding.',
    media: ['/pexels/images/hackney-tenant.jpg'],
    area: 'South London',
    budget: 'Up to £1,350 pcm',
    tags: ['Direct landlord', 'Human explanation', 'References ready'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-02T17:10:00.000Z',
    updatedAt: '2026-06-02T17:10:00.000Z',
    likeCount: 41,
    commentCount: 15,
    saveCount: 25,
    shareCount: 6,
  },
  {
    id: 'voc-room-female-safe-flatshare',
    authorId: 'buddy-zara',
    authorType: 'House Buddy',
    authorName: 'Zara N.',
    postType: 'House Buddy',
    title: 'Buddy-up for a safe, quiet flatshare',
    body: 'Seeking another woman for a calm two-bed search. Priority is responsive landlord, clear deposit protection and no surprise visits.',
    media: ['/pexels/images/clapham-buddy.jpg'],
    area: 'Islington / Finsbury Park',
    budget: '£1,150 each',
    tags: ['Buddy-up', 'Deposit protection', 'Quiet home'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-02T16:35:00.000Z',
    updatedAt: '2026-06-02T16:35:00.000Z',
    likeCount: 49,
    commentCount: 18,
    saveCount: 34,
    shareCount: 9,
  },
  {
    id: 'voc-property-btr-transparent',
    authorId: 'operator-buildstay',
    authorType: 'Operator',
    authorName: 'BuildStay Living',
    postType: 'Property',
    title: 'Managed rental with first-come process',
    body: 'Two flats available with published criteria and response timing. No bidding, no hidden process, no duplicate paperwork after matching.',
    media: ['/pexels/images/greenwich-viewings.jpg'],
    area: 'Wembley',
    budget: 'From £1,580 pcm',
    tags: ['Managed rental', 'First-come process', 'No bidding'],
    visibility: 'public',
    sponsoredStatus: 'Promoted',
    createdAt: '2026-06-02T16:05:00.000Z',
    updatedAt: '2026-06-02T16:05:00.000Z',
    likeCount: 52,
    commentCount: 11,
    saveCount: 48,
    shareCount: 10,
  },
  {
    id: 'voc-advice-zero-deposit',
    authorId: 'renteazy-safety',
    authorType: 'RentEazy',
    authorName: 'RentEazy Safety',
    postType: 'Advice',
    title: 'Before accepting any deposit alternative',
    body: 'Check what protection you keep, what you lose, and who gets paid if there is a dispute. Save the terms before signing.',
    media: ['/pexels/images/perk-insurance.jpg'],
    area: 'UK',
    budget: 'Safety note',
    tags: ['Deposit alternatives', 'Terms', 'Safety'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-02T15:30:00.000Z',
    updatedAt: '2026-06-02T15:30:00.000Z',
    likeCount: 63,
    commentCount: 20,
    saveCount: 71,
    shareCount: 18,
  },
  {
    id: 'voc-area-insight-no-shows',
    authorId: 'renteazy-market',
    authorType: 'RentEazy',
    authorName: 'RentEazy Market',
    postType: 'Area Insight',
    title: 'Viewing no-shows hurt both sides',
    body: 'Same-day confirmation and profile completeness are strong signals. Renters avoid wasted journeys; landlords avoid empty appointments.',
    media: ['/pexels/videos/moving-boxes.mp4'],
    area: 'UK',
    budget: 'Market signal',
    tags: ['Viewing reliability', 'Profile strength', 'Confirmation'],
    visibility: 'public',
    sponsoredStatus: null,
    createdAt: '2026-06-02T15:00:00.000Z',
    updatedAt: '2026-06-02T15:00:00.000Z',
    likeCount: 57,
    commentCount: 14,
    saveCount: 50,
    shareCount: 12,
  },
];

const feedImagePool = [
  '/pexels/images/stratford-room.jpg',
  '/pexels/images/feed-flat-1.jpg',
  '/pexels/images/feed-room-1.jpg',
  '/pexels/images/greenwich-viewings.jpg',
  '/pexels/images/bow-landlord-flat.jpg',
  '/pexels/images/northwest-investor.jpg',
  '/pexels/images/operator-west-london.jpg',
  '/pexels/images/leeds-student-house.jpg',
  '/pexels/images/canary-area-insight.jpg',
  '/pexels/images/feed-moving.jpg',
  '/pexels/images/feed-balcony-1.jpg',
  '/pexels/images/feed-kitchen-1.jpg',
  '/pexels/images/feed-house-1.jpg',
  '/pexels/images/feed-landlord.jpg',
  '/pexels/images/feed-office-agent.jpg',
  '/pexels/images/hackney-tenant.jpg',
  '/pexels/images/clapham-buddy.jpg',
  '/pexels/images/manchester-relocation.jpg',
  '/pexels/images/referencing-question.jpg',
  '/pexels/images/shoreditch-short-stay.jpg',
  '/pexels/images/perk-cleaning.jpg',
  '/pexels/images/perk-storage.jpg',
  '/pexels/images/perk-broadband.jpg',
  '/pexels/images/perk-insurance.jpg',
];

const feedVideoPool = [
  '/pexels/videos/agent-walkthrough.mp4',
  '/pexels/videos/city-apartment.mp4',
  '/pexels/videos/city-skyline.mp4',
  '/pexels/videos/cleaning-service.mp4',
  '/pexels/videos/moving-boxes.mp4',
  '/pexels/videos/rental-feed-scroll.mp4',
];

const feedImagePoolsByPostType = {
  Property: ['/pexels/images/feed-flat-1.jpg', '/pexels/images/feed-kitchen-1.jpg', '/pexels/images/feed-balcony-1.jpg', '/pexels/images/bow-landlord-flat.jpg', '/pexels/images/greenwich-viewings.jpg', '/pexels/images/feed-house-1.jpg', '/pexels/images/shoreditch-short-stay.jpg'],
  Room: ['/pexels/images/stratford-room.jpg', '/pexels/images/feed-room-1.jpg', '/pexels/images/manchester-relocation.jpg', '/pexels/images/clapham-buddy.jpg', '/pexels/images/feed-kitchen-1.jpg', '/pexels/images/feed-balcony-1.jpg'],
  Looking: ['/pexels/images/hackney-tenant.jpg', '/pexels/images/feed-moving.jpg', '/pexels/images/clapham-buddy.jpg', '/pexels/images/referencing-question.jpg', '/pexels/images/manchester-relocation.jpg'],
  'House Buddy': ['/pexels/images/clapham-buddy.jpg', '/pexels/images/hackney-tenant.jpg', '/pexels/images/feed-room-1.jpg', '/pexels/images/feed-moving.jpg'],
  'Short-Term Stay': ['/pexels/images/shoreditch-short-stay.jpg', '/pexels/images/feed-flat-1.jpg', '/pexels/images/feed-balcony-1.jpg', '/pexels/images/manchester-relocation.jpg'],
  'Serviced Accommodation': ['/pexels/images/shoreditch-short-stay.jpg', '/pexels/images/feed-flat-1.jpg', '/pexels/images/operator-west-london.jpg', '/pexels/images/feed-kitchen-1.jpg'],
  Availability: ['/pexels/images/manchester-relocation.jpg', '/pexels/images/shoreditch-short-stay.jpg', '/pexels/images/feed-room-1.jpg', '/pexels/images/feed-moving.jpg'],
  'Operator Offer': ['/pexels/images/operator-west-london.jpg', '/pexels/images/feed-house-1.jpg', '/pexels/images/feed-office-agent.jpg', '/pexels/images/shoreditch-short-stay.jpg'],
  'Landlord Opportunity': ['/pexels/images/bow-landlord-flat.jpg', '/pexels/images/feed-landlord.jpg', '/pexels/images/feed-house-1.jpg', '/pexels/images/feed-flat-1.jpg'],
  'Investor Brief': ['/pexels/images/northwest-investor.jpg', '/pexels/images/leeds-student-house.jpg', '/pexels/images/feed-office-agent.jpg', '/pexels/images/feed-house-1.jpg'],
  'Sourcer Deal': ['/pexels/images/leeds-student-house.jpg', '/pexels/images/northwest-investor.jpg', '/pexels/images/feed-office-agent.jpg', '/pexels/images/feed-house-1.jpg'],
  'Agent Update': ['/pexels/images/feed-office-agent.jpg', '/pexels/images/greenwich-viewings.jpg', '/pexels/images/canary-area-insight.jpg', '/pexels/images/stratford-room.jpg'],
  'Landlord Update': ['/pexels/images/feed-landlord.jpg', '/pexels/images/bow-landlord-flat.jpg', '/pexels/images/feed-house-1.jpg', '/pexels/images/feed-office-agent.jpg'],
  Advice: ['/pexels/images/referencing-question.jpg', '/pexels/images/feed-moving.jpg', '/pexels/images/perk-insurance.jpg', '/pexels/images/feed-office-agent.jpg', '/pexels/images/canary-area-insight.jpg'],
  Question: ['/pexels/images/referencing-question.jpg', '/pexels/images/feed-office-agent.jpg', '/pexels/images/feed-moving.jpg', '/pexels/images/feed-landlord.jpg'],
  'Area Insight': ['/pexels/images/canary-area-insight.jpg', '/pexels/images/greenwich-viewings.jpg', '/pexels/images/feed-balcony-1.jpg', '/pexels/images/feed-office-agent.jpg'],
  'Success Story': ['/pexels/images/feed-moving.jpg', '/pexels/images/hackney-tenant.jpg', '/pexels/images/feed-balcony-1.jpg'],
  General: feedImagePool,
};

const videoEligiblePostTypes = new Set(['Short-Term Stay', 'Availability', 'Agent Update', 'Area Insight']);

function stableHash(value = '') {
  return Array.from(String(value)).reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
}

function chooseLeastUsedMedia(pool, usage, seed) {
  const start = Math.abs(seed) % pool.length;
  let best = pool[start];
  let bestCount = usage.get(best) || 0;
  for (let offset = 1; offset < pool.length; offset += 1) {
    const candidate = pool[(start + offset) % pool.length];
    const candidateCount = usage.get(candidate) || 0;
    if (candidateCount < bestCount) {
      best = candidate;
      bestCount = candidateCount;
    }
  }
  usage.set(best, bestCount + 1);
  return best;
}

function diversifySeedPostMedia(posts) {
  const mediaUsage = new Map();
  return posts.map((post, index) => {
    const pool = feedImagePoolsByPostType[post.postType] || feedImagePool;
    const seed = stableHash(`${post.id}-${post.postType}-${post.area}-${index}`);
    const useVideo = videoEligiblePostTypes.has(post.postType) && index % 11 === 3;
    const media = useVideo
      ? [chooseLeastUsedMedia(feedVideoPool, mediaUsage, seed)]
      : [chooseLeastUsedMedia(pool, mediaUsage, seed)];
    return { ...post, media };
  });
}

const allSeededFeedPosts = diversifySeedPostMedia([...seededFeedPosts, ...vocSeededFeedPosts]);

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
  {
    id: 'group-self-employed-renters',
    name: 'Self-Employed Renters UK',
    groupType: 'Support network',
    area: 'UK',
    description: 'Referencing workarounds, document prep, landlord explanations, guarantor questions, and fair process advice for freelancers and founders.',
    visibility: 'open',
    memberCount: 214,
    postCount: 68,
    roles: ['Tenant', 'House Buddy', 'Landlord', 'Individual Agent'],
    createdAt: '2026-06-01T08:40:00.000Z',
    updatedAt: '2026-06-01T08:40:00.000Z',
  },
  {
    id: 'group-deposit-moveout-records',
    name: 'Deposits & Move-Out Records',
    groupType: 'Resident community',
    area: 'UK',
    description: 'Inventory photos, checkout notes, repair trails, deposit protection questions, and clean handover checklists.',
    visibility: 'open',
    memberCount: 176,
    postCount: 52,
    roles: ['Tenant', 'House Buddy', 'Landlord', 'Operator', 'Short-Term Host'],
    createdAt: '2026-06-01T08:50:00.000Z',
    updatedAt: '2026-06-01T08:50:00.000Z',
  },
  {
    id: 'group-landlord-screening',
    name: 'Landlord Screening Room',
    groupType: 'Role network',
    area: 'UK',
    description: 'Pre-screening forms, viewing reliability, fair criteria, direct lets, agent accountability, and reducing no-shows without excluding good renters.',
    visibility: 'open',
    memberCount: 139,
    postCount: 47,
    roles: ['Landlord', 'Individual Agent', 'Agency / Business', 'Operator'],
    createdAt: '2026-06-01T09:00:00.000Z',
    updatedAt: '2026-06-01T09:00:00.000Z',
  },
  {
    id: 'group-due-diligence-deals',
    name: 'Due Diligence Deal Room',
    groupType: 'Professional circle',
    area: 'UK',
    description: 'Deal packs, comparable rents, refurb assumptions, fees, red flags, compliance checks, and investor feedback before introductions.',
    visibility: 'open',
    memberCount: 122,
    postCount: 39,
    roles: ['Investor', 'Sourcer', 'Operator', 'Landlord'],
    createdAt: '2026-06-01T09:10:00.000Z',
    updatedAt: '2026-06-01T09:10:00.000Z',
  },
  {
    id: 'group-direct-landlord-renters',
    name: 'Direct Landlord Matches',
    groupType: 'Matching room',
    area: 'London',
    description: 'Renters who want human review and landlords who want to keep vetting control while still running a clear, fair process.',
    visibility: 'open',
    memberCount: 188,
    postCount: 61,
    roles: ['Tenant', 'House Buddy', 'Landlord'],
    createdAt: '2026-06-01T09:20:00.000Z',
    updatedAt: '2026-06-01T09:20:00.000Z',
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

const seededLifecycleTasks = [
  {
    id: 'task-today-better-matches',
    userId: currentUser.id,
    roleType: 'General',
    cadence: 'today',
    title: 'Answer 3 match questions',
    body: 'Improve ranking, match explanations, and which cards appear first.',
    actionLabel: 'Improve matches',
    targetPath: '/app/profile',
    reward: 'Better match score',
    status: 'open',
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
  },
  {
    id: 'task-today-swipe-deck',
    userId: currentUser.id,
    roleType: 'General',
    cadence: 'today',
    title: 'Use today’s swipe allowance',
    body: 'Each pass, like, and Superlike teaches RentEazy what fits.',
    actionLabel: 'Open Swipe',
    targetPath: '/app/swipe',
    reward: 'Better daily picks',
    status: 'open',
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
  },
  {
    id: 'task-week-post-market-signal',
    userId: currentUser.id,
    roleType: 'General',
    cadence: 'week',
    title: 'Post a useful market signal',
    body: 'A question, availability update, brief, deal, or area insight gives the network more live inventory.',
    actionLabel: 'Create post',
    targetPath: '/app/post',
    reward: 'Feed reach signal',
    status: 'open',
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
  },
  {
    id: 'task-long-reputation-asset',
    userId: currentUser.id,
    roleType: 'General',
    cadence: 'long',
    title: 'Build your portable rental reputation',
    body: 'Matches, viewings, reviews, and helpful participation compound into your RentEazy Reputation Score.',
    actionLabel: 'View profile',
    targetPath: '/app/profile',
    reward: 'Reputation growth',
    status: 'open',
    createdAt: new Date().toISOString(),
    dueAt: new Date(Date.now() + 240 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
  },
];

const seededReferrals = [
  {
    id: 'referral-demo-buddy',
    userId: currentUser.id,
    inviteType: 'House Buddy',
    target: 'A future flatmate',
    status: 'ready_to_share',
    reward: '5 extra swipes after first accepted invite',
    trackingUrl: 'https://renteazy.co.uk/join?ref=demo-user&invite=buddy',
    createdAt: new Date().toISOString(),
    acceptedAt: null,
  },
];

const seededResidentProfiles = [
  {
    id: 'resident-demo-current-home',
    userId: currentUser.id,
    status: 'active_resident',
    homeLabel: 'Stratford room search record',
    area: 'Stratford',
    tenancyStart: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    leaseEndsAt: new Date(Date.now() + 260 * 24 * 60 * 60 * 1000).toISOString(),
    landlordOrAgentName: 'Eastline Rooms',
    reputationImpact: 'Active resident records can support future references when verified.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seededMaintenanceRequests = [
  {
    id: 'maintenance-demo-window',
    userId: currentUser.id,
    residentProfileId: 'resident-demo-current-home',
    title: 'Window handle needs attention',
    category: 'Repair',
    priority: 'Normal',
    status: 'logged',
    notes: 'Logged as an example resident-mode record. Keep updates timestamped inside RentEazy.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seededRentRecords = [
  {
    id: 'rent-record-demo-june',
    userId: currentUser.id,
    residentProfileId: 'resident-demo-current-home',
    month: '2026-06',
    amount: 925,
    currency: 'GBP',
    status: 'recorded_on_time',
    verificationStatus: 'self_recorded',
    reputationPoints: 5,
    createdAt: new Date().toISOString(),
  },
];

const seededLandlordProperties = [
  {
    id: 'property-demo-bow',
    ownerId: currentUser.id,
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seededProfessionalProfiles = [
  {
    id: 'pro-demo-agent',
    userId: currentUser.id,
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seededTenantDemandSignals = [
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seededDealWatchlist = [
  {
    id: 'watch-demo-northwest',
    userId: currentUser.id,
    dealPostId: 'post-investor-northwest',
    dealType: 'Investor Brief',
    area: 'Manchester / Liverpool',
    strategy: 'Buy-to-let and serviced options',
    status: 'watching',
    score: 82,
    reasonBadges: ['Investor criteria fit', 'Numbers first', 'Sourcer route'],
    notes: 'Track sourcer responses and clean-number opportunities.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seededOperatorPortfolioSignals = [
  {
    id: 'operator-signal-west-london',
    operatorId: currentUser.id,
    area: 'West London',
    propertyType: 'Family houses and flats',
    model: 'Management / co-hosting',
    unitsTracked: 8,
    occupancySignal: 'Strong weekday demand',
    landlordDemandCount: 6,
    investorBriefCount: 3,
    complianceStatus: 'Ready to verify',
    nextAction: 'Publish operator requirements for landlords and investors.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seededMarketIntroductions = [
  {
    id: 'intro-demo-amelia-bow',
    userId: currentUser.id,
    sourceType: 'tenant_demand',
    sourceId: 'demand-amelia-hackney',
    targetType: 'landlord_property',
    targetId: 'property-demo-bow',
    status: 'shortlisted',
    reason: 'Budget, move timing, and area fit the Bow pipeline.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seededNotifications = [
  {
    id: 'notification-demo-swipes',
    userId: currentUser.id,
    type: 'daily_swipes_ready',
    title: 'Your daily swipes are ready.',
    body: 'Use them to improve today’s matching signals.',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notification-demo-viewing',
    userId: currentUser.id,
    type: 'viewing_window',
    title: 'Viewing record ready to update.',
    body: 'Add notes after the viewing so the match history stays useful.',
    read: false,
    createdAt: new Date().toISOString(),
  },
];

const roleReturnReasons = {
  General: ['Fresh posts from the rental market', 'Daily swipes and picks', 'Reputation progress'],
  Tenant: ['New rooms, homes, stays, and buddy posts', 'Viewing slots and matched replies', 'Move-in perks when timing fits'],
  'House Buddy': ['Buddy-up posts and rooms', 'Lifestyle fit prompts', 'Shared-area communities'],
  Landlord: ['Tenant demand and agent routes', 'Operator and investor interest', 'Listing traction and local signals'],
  'Individual Agent': ['Viewing-ready demand', 'Landlord opportunity posts', 'Response reputation and pipeline'],
  'Agency / Business': ['Team demand signals', 'Sponsored reach options', 'Area activity and pipeline'],
  'Short-Term Guest': ['Flexible stays and relocation updates', 'Move timing perks', 'Saved stay options'],
  'Short-Term Host': ['Guest demand and relocation needs', 'Operator/community signals', 'Useful partner offers'],
  Operator: ['Landlord opportunities', 'Investor briefs and sourcer deals', 'Portfolio partner offers'],
  Sourcer: ['Investor briefs', 'Operator demand', 'Deal-room communities'],
  Investor: ['Sourcer deals', 'Operator opportunities', 'Area and yield-adjacent market insight'],
};

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

function postTextIncludes(post, signal) {
  if (!signal) return false;
  const haystack = [post.title, post.body, post.area, post.budget, ...(post.tags || [])].join(' ').toLowerCase();
  return String(signal).toLowerCase().split(/[,\s/]+/).filter((part) => part.length > 2).some((part) => haystack.includes(part));
}

function calculateFeedRanking(post, { profile, answers, followedIds, likedIds, savedIds, comments }) {
  const relevantTypes = roleRelevantPostTypes(profile.role);
  const areaSignals = [profile.area, answers['tenant-areas'], answers['buddy-areas'], answers['investor-areas']].filter(Boolean);
  const budgetSignals = [profile.budget, answers['tenant-budget'], answers['buddy-budget'], answers['investor-budget']].filter(Boolean);
  const reasons = [];
  const negativeSignals = [];
  let score = 38;

  if (relevantTypes.includes(post.postType)) {
    score += 22;
    reasons.push('Role fit');
  }
  if (areaSignals.some((signal) => postTextIncludes(post, signal))) {
    score += 14;
    reasons.push('Area fit');
  }
  if (budgetSignals.some((signal) => postTextIncludes(post, signal))) {
    score += 10;
    reasons.push('Budget signal');
  }
  if (followedIds.includes(post.authorId)) {
    score += 12;
    reasons.push('Followed source');
  }
  const commentCount = comments.filter((comment) => comment.postId === post.id).length + Number(post.commentCount || 0);
  const socialProof = Number(post.likeCount || 0) + Number(post.saveCount || 0) + commentCount + Number(post.shareCount || 0);
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
  if (likedIds.includes(post.id) || savedIds.includes(post.id)) {
    score += 5;
    reasons.push('Saved or liked by you');
  }

  const objective = ['Question', 'Advice', 'Area Insight'].includes(post.postType)
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
    calculatedAt: new Date().toISOString(),
  };
}

function buildLocalRecommendationInsights({ profile, answers, feedRankings, behavioralEvents, partnerOffers }) {
  const events = behavioralEvents || [];
  const eventCounts = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {});
  const objectiveCounts = (feedRankings || []).reduce((acc, ranking) => {
    acc[ranking.objective] = (acc[ranking.objective] || 0) + 1;
    return acc;
  }, {});
  const reasonCounts = (feedRankings || []).flatMap((ranking) => ranking.reasons || []).reduce((acc, reason) => {
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {});
  const likedSwipes = events.filter((event) => event.eventType === 'swipe_action' && ['like', 'superlike'].includes(event.metadata?.action));
  const passedSwipes = events.filter((event) => event.eventType === 'swipe_action' && event.metadata?.action === 'pass');
  const answeredQuestions = Object.values(answers || {}).filter((value) => String(value || '').trim()).length;
  const role = profile.role || 'General';

  return {
    learnedSignals: {
      role,
      area: profile.area || answers['tenant-areas'] || answers['buddy-areas'] || answers['investor-areas'] || '',
      answeredQuestions,
      likedSwipes: likedSwipes.length,
      passedSwipes: passedSwipes.length,
      feedInteractions: (eventCounts.post_liked || 0) + (eventCounts.post_saved || 0) + (eventCounts.post_shared || 0) + (eventCounts.post_commented || 0),
      perkOpens: eventCounts.partner_offer_opened || 0,
    },
    feedMix: {
      discovery: objectiveCounts.Discovery || 0,
      progress: objectiveCounts.Progress || 0,
      socialProof: objectiveCounts['Social proof'] || 0,
      topReasons: Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([reason]) => reason),
    },
    swipeDeck: {
      likedCount: likedSwipes.length,
      passedCount: passedSwipes.length,
      prioritySignals: likedSwipes.length ? ['Show more cards like recent likes', 'Keep suitability above paid visibility'] : ['Collect first swipe signals'],
      suppressedSignals: passedSwipes.length ? ['Reduce cards similar to recent passes'] : [],
    },
    perkRecommendations: (partnerOffers || [])
      .filter((offer) => !offer.eligibleRoles?.length || offer.eligibleRoles.includes(role) || !profile.role)
      .slice(0, 4)
      .map((offer) => ({ offerId: offer.id, title: offer.title, reason: offer.eligibleRoles?.includes(role) ? `${role} fit` : 'Relevant rental-market perk' })),
    nextActions: [
      answeredQuestions < 3 && { id: 'answer-questions', label: 'Answer 3 questions', targetPath: '/app/profile', reason: 'Improves matching and Feed rank explanations' },
      likedSwipes.length + passedSwipes.length < 3 && { id: 'swipe-more', label: 'Swipe 3 cards', targetPath: '/app/swipe', reason: 'Teaches the deck what to show next' },
      !eventCounts.post_created && { id: 'post-signal', label: 'Create a useful post', targetPath: '/app/post', reason: 'Adds inventory and improves the network' },
    ].filter(Boolean).slice(0, 3),
    updatedAt: new Date().toISOString(),
  };
}

function scoreSwipeCard(card, { profile, answers, recommendationInsights, behavioralEvents }) {
  const roleTypes = roleRelevantPostTypes(profile.role);
  const areaSignals = [profile.area, answers['tenant-areas'], answers['buddy-areas'], answers['investor-areas']].filter(Boolean);
  const likedSwipeIds = new Set((behavioralEvents || []).filter((event) => event.eventType === 'swipe_action' && ['like', 'superlike'].includes(event.metadata?.action)).map((event) => event.targetId));
  const passedSwipeIds = new Set((behavioralEvents || []).filter((event) => event.eventType === 'swipe_action' && event.metadata?.action === 'pass').map((event) => event.targetId));
  let score = Number(card.matchScore || 50);
  const reasons = ['Base match score'];

  if (roleTypes.some((type) => card.type?.toLowerCase().includes(type.toLowerCase().split(' ')[0]) || card.badges?.some((badge) => badge.toLowerCase().includes(type.toLowerCase().split(' ')[0])))) {
    score += 8;
    reasons.push('Role fit');
  }
  if (areaSignals.some((signal) => postTextIncludes({ ...card, body: card.detailLine, area: card.location, budget: card.price, tags: card.badges }, signal))) {
    score += 7;
    reasons.push('Area signal');
  }
  if (likedSwipeIds.has(card.id)) {
    score += 10;
    reasons.push('Previously liked');
  }
  if (passedSwipeIds.has(card.id)) {
    score -= 14;
    reasons.push('Reduced after pass');
  }
  if (recommendationInsights?.swipeDeck?.likedCount > 0 && card.badges?.some((badge) => ['Budget fit', 'Area fit', 'Operator', 'Investor brief', 'Buddy match'].includes(badge))) {
    score += 4;
    reasons.push('Matches recent deck signals');
  }

  return { ...card, recommendationScore: Math.max(0, Math.min(100, Math.round(score))), recommendationReasons: [...new Set(reasons)].slice(0, 4) };
}

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

function BrandLogo({ footer = false, compact = false }) {
  return (
    <a href="/" className="inline-flex shrink-0 flex-col items-center" aria-label="RentEazy">
      <img
        src={footer ? '/images/renteazy-logo-2026-t.png' : '/images/renteazy-mark-2026-t.png'}
        alt="RentEazy"
        className={footer ? 'h-24 w-auto object-contain' : compact ? 'h-9 w-auto object-contain' : 'h-11 w-auto object-contain'}
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

function DemoCardVisual({ card, dimmed = false, quiet = false, photoIndex = 0, onPreviousPhoto, onNextPhoto }) {
  const typeLabel = card.type.charAt(0).toUpperCase() + card.type.slice(1);
  const gallery = card.gallery?.length ? card.gallery : [card.imageSrc].filter(Boolean);
  const activePhotoIndex = Math.min(photoIndex, Math.max(0, gallery.length - 1));
  const activeImage = gallery[activePhotoIndex] || card.imageSrc;

  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-slate-200 ${dimmed ? 'opacity-55' : ''}`}
    >
      <img
        src={activeImage}
        alt={card.imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: card.imagePosition }}
        loading="eager"
        decoding="async"
        draggable="false"
      />
      <div className="absolute inset-0 bg-linear-to-t from-[rgba(6,24,47,0.9)] via-[rgba(6,24,47,0.18)] to-[rgba(6,24,47,0.02)]" />
      {!quiet && (
        <>
          {gallery.length > 1 && (
            <div className="absolute inset-x-5 top-3 z-20 flex gap-1.5">
              {gallery.map((photo, index) => (
                <span key={`${photo}-${index}`} className={`h-1 flex-1 rounded-full ${index === activePhotoIndex ? 'bg-white' : 'bg-white/35'}`} />
              ))}
            </div>
          )}
          {gallery.length > 1 && (
            <div className="absolute inset-x-4 top-1/2 z-20 flex -translate-y-1/2 justify-between">
              <button
                type="button"
                aria-label="Previous photo"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onPreviousPhoto?.();
                }}
                className="grid h-9 w-9 place-items-center rounded-full bg-black/28 text-lg font-semibold text-white ring-1 ring-white/20 backdrop-blur-md"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onNextPhoto?.();
                }}
                className="grid h-9 w-9 place-items-center rounded-full bg-black/28 text-lg font-semibold text-white ring-1 ring-white/20 backdrop-blur-md"
              >
                ›
              </button>
            </div>
          )}
          <div className="absolute left-5 right-5 top-5 z-10 flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/92 backdrop-blur-sm px-3 py-1 text-xs font-medium text-[#092243] shadow-[0_8px_18px_-12px_rgba(15,23,42,0.35)]">{card.matchScore}% match</span>
            <span className="rounded-full bg-white/18 backdrop-blur-sm border border-white/35 px-3 py-1 text-xs text-white">{typeLabel} · {activePhotoIndex + 1}/{gallery.length}</span>
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

function InteractiveMatchCard({
  cards = heroSwipeCards,
  canSwipe = true,
  onSwipeAction = () => {},
  onBlocked = () => {},
  blockedFeedback = 'Daily swipes used',
  immersive = false,
}) {
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
  const deck = cards.length ? cards : heroSwipeCards;
  const card = deck[activeIndex % deck.length];
  const nextCard = deck[(activeIndex + 1) % deck.length];
  const totalCards = deck.length;
  const progress = ((activeIndex + 1) / totalCards) * 100;
  const visibleIndex = activeIndex % totalCards;

  const showTrial = (kind, nextSwipeCount) => {
    if (immersive) return;
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

  const rewind = () => {
    if (swipeCount <= 0) {
      setFeedback('Nothing to rewind yet');
      return;
    }
    setActiveIndex((current) => (current - 1 + deck.length) % deck.length);
    setSwipeCount((count) => Math.max(0, count - 1));
    setDragX(0);
    setDragY(0);
    setFeedback('Previous card restored');
  };

  const swipe = (action) => {
    if (!canSwipe) {
      setFeedback(blockedFeedback);
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
      setActiveIndex((current) => (current + 1) % deck.length);
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

  if (immersive) {
    const actionButtons = [
      { label: 'Rewind', icon: RotateCcw, onClick: rewind, className: 'h-11 w-11 border-white/10 bg-white/9 text-white/74 hover:bg-white/14' },
      { label: 'Not for me', icon: X, onClick: () => swipe('pass'), className: 'h-[3.75rem] w-[3.75rem] border-[#ff4f73]/28 bg-[#17191f] text-[#ff4f73] shadow-[0_16px_38px_-22px_rgba(255,79,115,0.8)]' },
      { label: 'Priority', icon: Sparkles, onClick: () => swipe('superlike'), className: 'h-[4.5rem] w-[4.5rem] border-[#62a8ff]/30 bg-[#0d2a4c] text-[#62a8ff] shadow-[0_20px_46px_-24px_rgba(98,168,255,0.86)]' },
      { label: 'Interested', icon: Heart, onClick: () => swipe('like'), className: 'h-[3.75rem] w-[3.75rem] border-[#64dd70]/30 bg-[#112416] text-[#64dd70] shadow-[0_16px_38px_-22px_rgba(100,221,112,0.78)]' },
      { label: 'Send', icon: Send, onClick: () => swipe('superlike'), className: 'h-11 w-11 border-white/10 bg-white/9 text-[#36a3ff] hover:bg-white/14' },
    ];

    return (
      <section className="relative h-[100dvh] min-h-[42rem] overflow-hidden bg-[#050506] text-white md:h-[calc(100vh-2rem)] md:min-h-[45rem] md:rounded-[2.15rem] md:border md:border-white/10 md:shadow-[0_34px_84px_-48px_rgba(0,0,0,0.9)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(47,125,50,0.26),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_18%,rgba(0,0,0,0.92)_100%)]" />
        <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-4 md:px-5 md:pt-5">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-white/52">RentEazy Match</p>
            <p className="mt-1 text-sm font-semibold text-white">{feedback}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/82 backdrop-blur-xl">{visibleIndex + 1}/{totalCards}</span>
            <button type="button" onClick={() => swipe('superlike')} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-[#62a8ff] backdrop-blur-xl" aria-label="Priority signal">
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 top-[5.25rem] bottom-[12rem] px-3 md:top-[5.75rem] md:bottom-[7.25rem] md:px-4">
          <div className="absolute inset-x-7 top-6 bottom-0 rounded-[2.2rem] bg-white/6 blur-[1px]" />
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
            className={`hero-swipe-card absolute inset-3 overflow-hidden rounded-[2.15rem] border border-white/12 bg-[#121318] shadow-[0_34px_76px_-38px_rgba(0,0,0,0.98)] outline-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ transform: `translate(${dragX}px, ${dragY}px) rotate(${dragX / 24}deg)` }}
          >
            <DemoCardVisual card={card} />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/56 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-black/92 via-black/34 to-transparent" />
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity ${Math.abs(dragX) > 28 || dragY < -50 ? 'opacity-100' : 'opacity-0'}`}>
              <span className={`rotate-[-10deg] rounded-2xl border-2 px-6 py-3 text-base font-black uppercase tracking-[0.14em] shadow-2xl ${dragY < -50 ? 'border-[#62a8ff] bg-[#0d2a4c]/84 text-[#62a8ff]' : dragX >= 0 ? 'border-[#64dd70] bg-[#112416]/84 text-[#64dd70]' : 'border-[#ff4f73] bg-[#231018]/84 text-[#ff4f73]'}`}>
                {dragY < -50 ? 'Priority' : dragX >= 0 ? 'Interested' : 'Not for me'}
              </span>
            </div>
          </article>
        </div>

        <div className="absolute inset-x-0 bottom-[6.35rem] z-30 flex items-center justify-center gap-2.5 px-4 md:bottom-5 md:gap-3">
          {actionButtons.map(({ label, icon: Icon, onClick, className }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              title={label}
              onClick={(event) => {
                event.stopPropagation();
                onClick();
              }}
              className={`grid shrink-0 place-items-center rounded-full border backdrop-blur-xl transition hover:scale-105 active:scale-95 ${className}`}
            >
              <Icon className="h-5 w-5" strokeWidth={label === 'Interested' ? 2.6 : 2.3} />
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className={`relative overflow-hidden ${immersive ? 'rounded-[1.2rem] bg-transparent' : 'rounded-[1.7rem] bg-white border border-slate-200 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.42),inset_0_1px_0_white]'}`}>
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
      <div className={immersive ? 'p-0' : 'p-4 sm:p-5'}>
        {!immersive && <div className="flex items-start justify-between gap-4 pb-4">
          <div>
            <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">TRY THE SWIPE DECK</p>
            <p className="mt-1 text-sm text-slate-500">Tap not for me when it does not fit. Like what does. Superlike to get seen sooner.</p>
          </div>
          <div className="rounded-full bg-[#edf7ff] border border-[#cde7f8] px-3 py-1 text-xs text-[#154f79]">{activeIndex + 1} / {totalCards}</div>
        </div>}
        {!immersive && <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-4">
          <div className="h-full rounded-full bg-linear-to-r from-[#2f7d32] to-[#2670a8]" style={{ width: `${progress}%` }}></div>
        </div>}
        <div className={`relative overflow-visible ${immersive ? 'h-[calc(100vh-13.5rem)] min-h-[34rem]' : 'h-126 sm:h-136 lg:h-120 xl:h-128'}`}>
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
                {dragY < -50 ? 'SUPERLIKE' : dragX >= 0 ? 'LIKE' : 'NOT FOR ME'}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-4">
              <button type="button" aria-label="Not for me" onClick={(event) => { event.stopPropagation(); swipe('pass'); }} className="h-14 w-14 rounded-full bg-white/94 backdrop-blur-sm border border-white text-[#ef4444] shadow-[0_16px_30px_-18px_rgba(0,0,0,0.55),inset_0_1px_0_white]">
                <ArrowDownLeft className="mx-auto h-7 w-7" strokeWidth={2.4} />
              </button>
              <button type="button" aria-label="Superlike" onClick={(event) => { event.stopPropagation(); swipe('superlike'); }} className="h-16 w-16 rounded-full bg-[#092243]/96 backdrop-blur-sm border border-white/20 text-white shadow-[0_18px_34px_-18px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.2)]">
                <Sparkles className="mx-auto h-8 w-8" strokeWidth={2.2} />
              </button>
              <button type="button" aria-label="Like" onClick={(event) => { event.stopPropagation(); swipe('like'); }} className="h-14 w-14 rounded-full bg-[#2f7d32]/96 backdrop-blur-sm border border-white/20 text-white shadow-[0_16px_30px_-18px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.25)]">
                <Check className="mx-auto h-7 w-7" strokeWidth={2.7} />
              </button>
            </div>
          </article>
        </div>
      </div>
      <div className={`${immersive ? 'mx-0 mt-3 mb-0' : 'mx-4 sm:mx-5 mb-5'} flex items-center justify-between gap-4 rounded-2xl bg-[#edf7ff] border border-[#cde7f8] p-3 text-sm`}>
        <span className="text-[#154f79]">{feedback}</span>
        <span className="text-slate-500">{likeCount} liked</span>
      </div>
      {!immersive && <p className="mx-4 sm:mx-5 mb-5 text-center text-xs text-slate-400">Limited free swipes refresh daily. Answer quick questions to improve this deck.</p>}
      <div className={`${immersive ? 'mt-3 mb-0' : 'mx-4 sm:mx-5 mb-5'} flex justify-center gap-1.5`} aria-hidden="true">
        {deck.slice(0, 12).map((item, index) => <span key={item.id} className={`h-1.5 rounded-full transition-all ${index === activeIndex % Math.min(12, deck.length) ? 'w-6 bg-[#2f7d32]' : 'w-1.5 bg-slate-300'}`}></span>)}
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
                {dragY < -50 ? 'SUPERLIKE' : dragX >= 0 ? 'LIKE' : 'NOT FOR ME'}
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
              <button type="button" aria-label="Not for me" onClick={() => moveNext('pass')} className="flex h-16 items-center justify-center rounded-full bg-white/10 border border-white/10 text-[#ff5a73] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"><ArrowDownLeft className="h-9 w-9 stroke-[2.8]" /></button>
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
  return roleOptions.includes(role) ? role : 'All market';
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
    const displayName = user.fullName || user.primaryEmailAddress?.emailAddress || 'New RentEazy profile';
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
              <a href={appFeedUrl} className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600">Preview the Feed</a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
 * APP UI OWNERSHIP - OPTION B
 *
 * The presentational app components below are Claude-owned for visual uplift.
 * Claude may change markup, classes, component-local layout state, transitions,
 * and copy inside these UI functions.
 *
 * Codex keeps ownership of RentEazyAppContainer, persistent state keys, data
 * contracts, Clerk/auth bridges, ranking/scoring helpers, preview gating, and
 * mutating handlers. Do not change function props or handler semantics without
 * coordinating with Codex.
 */
function ComposerPanel({ onCreatePost, compact = false, profile = currentUser }) {
  const [postType, setPostType] = useState('Looking');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [area, setArea] = useState('');
  const [budget, setBudget] = useState('');
  const [tags, setTags] = useState('');
  const [media, setMedia] = useState([]);
  const mediaInputRef = useRef(null);

  const addMediaFiles = (event) => {
    const files = Array.from(event.target.files || []).slice(0, 6 - media.length);
    if (!files.length) return;
    const readers = files.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result, type: file.type.startsWith('video') ? 'video' : 'image', name: file.name });
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then((items) => {
      setMedia((current) => [...current, ...items.filter(Boolean)].slice(0, 6));
      event.target.value = '';
    });
  };

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
      media: media.map((item) => item.url),
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
    setMedia([]);
  };

  return (
    <form onSubmit={submit} className="overflow-hidden rounded-[2rem] bg-white shadow-[0_26px_80px_-58px_rgba(15,23,42,0.72)] ring-1 ring-black/5">
      <div className="bg-[#e2f7f3] px-5 pb-6 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <PeepAvatar
              seed={`${profile.id}-${profile.name}-${profile.role}`}
              variant={profile.avatarVariant || 'bust'}
              avatarIndex={profile.avatarIndex}
              avatarBg={profile.avatarBg || 'mist'}
              className="h-12 w-12"
              imageClassName={(profile.avatarVariant || 'bust') === 'bust' ? '' : 'object-contain p-1'}
            />
            <div>
              <p className="text-sm font-bold text-[#092243]">{profile.name || currentUser.name}</p>
              <p className="text-xs font-medium text-[#092243]/55">{profile.role || currentUser.role} · public post</p>
            </div>
          </div>
          <span className="rounded-full bg-white/70 px-3 py-1.5 font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.1em] text-[#215d27]">FREE TO POST</span>
        </div>
      </div>
      <div className="p-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={compact ? 4 : 5} placeholder="What are you looking for, offering, or sharing?" className="w-full resize-none rounded-[1.5rem] border-0 bg-[#f4f7f8] px-4 py-4 text-base leading-7 text-slate-900 outline-hidden placeholder:text-slate-400 focus:bg-[#eef5f3]" />
        </div>
      </div>
      {media.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {media.map((item, index) => (
            <div key={`${item.name}-${index}`} className="relative overflow-hidden rounded-[1.4rem] bg-slate-100">
              {item.type === 'video' ? (
                <video src={item.url} className="aspect-square h-full w-full object-cover" muted playsInline />
              ) : (
                <img src={item.url} alt="" className="aspect-square h-full w-full object-cover" />
              )}
              <button type="button" onClick={() => setMedia((current) => current.filter((_, mediaIndex) => mediaIndex !== index))} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/62 text-sm font-bold text-white">×</button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Post title" className="rounded-[1.15rem] border-0 bg-[#f4f7f8] px-4 py-3 text-sm font-medium outline-hidden focus:bg-[#eef5f3]" />
        <select value={postType} onChange={(event) => setPostType(event.target.value)} className="rounded-[1.15rem] border-0 bg-[#f4f7f8] px-4 py-3 text-sm font-medium outline-hidden focus:bg-[#eef5f3]">
          {postTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
        <input value={area} onChange={(event) => setArea(event.target.value)} placeholder="Area" className="rounded-[1.15rem] border-0 bg-[#f4f7f8] px-4 py-3 text-sm font-medium outline-hidden focus:bg-[#eef5f3]" />
        <input value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="Budget or price" className="rounded-[1.15rem] border-0 bg-[#f4f7f8] px-4 py-3 text-sm font-medium outline-hidden focus:bg-[#eef5f3]" />
      </div>
      <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Tags, separated by commas" className="mt-3 w-full rounded-[1.15rem] border-0 bg-[#f4f7f8] px-4 py-3 text-sm font-medium outline-hidden focus:bg-[#eef5f3]" />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <input ref={mediaInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={addMediaFiles} />
          <button type="button" onClick={() => mediaInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full bg-[#f4f7f8] px-4 py-2.5 text-sm font-bold text-[#050506]"><Camera className="h-4 w-4" /> Media</button>
          <span className="rounded-full bg-[#f4f7f8] px-4 py-2.5 text-sm font-bold text-[#050506]">{postType}</span>
          <span className="rounded-full bg-[#f4f7f8] px-4 py-2.5 text-sm font-bold text-[#050506]">Public</span>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2f7d32] px-5 py-3 text-sm font-bold text-white">
          <PlusCircle className="h-4 w-4" />
          Post free
        </button>
      </div>
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
            <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Want more people to see this?</h2>
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
            <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Report this post</h2>
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
            <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">{post.title}</h2>
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
          <p className="font-['JetBrains_Mono',monospace] text-[11px] tracking-[0.14em] text-[#2670a8]">MATCH PROFILE</p>
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-[1.7rem] font-normal leading-tight tracking-tight text-slate-950">{strength.score}% ready</h2>
        </div>
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#52a832 ${strength.score * 3.6}deg, #e6edf3 0deg)` }}>
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-sm font-bold text-[#092243]">{strength.score}<span className="text-[10px] text-slate-400">%</span></div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">Answer a few more questions to improve your matches.</p>
      {strength.suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {strength.suggestions.map((item) => <span key={item} className="rounded-full border border-[#cde7f8] bg-[#edf7ff] px-3 py-1 text-xs font-medium text-[#154f79]">{item}</span>)}
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
      <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Want better matches?</h2>
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
    <div id="profile-editor" className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <div className="rounded-4xl border border-white bg-white/86 p-6 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
        <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">MARKET PROFILE</p>
        <h1 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-4xl font-semibold tracking-tight text-slate-950">Your market profile</h1>
        <p className="mt-3 text-slate-600">This is how RentEazy understands your role, area, timing, and intent.</p>
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
        <AvatarCustomizer profile={profile} setProfile={setProfile} />
        <ProfileStrengthCard profile={profile} answers={answers} />
        <ProgressiveQuestionsPanel profile={profile} answers={answers} setAnswers={setAnswers} />
      </div>
    </div>
  );
}

function ProfileSocialOverview({ profile, answers, reputationProfile, usageLimit, posts, likedIds, savedIds, shares, matches, groups, groupMemberships, wallet, purchases, appStreak, onSelectProduct, onSelectTab }) {
  const match = getMatchSummary(profile, answers);
  const strength = calculateProfileStrength(profile, answers);
  const remaining = Math.max(0, usageLimit.allowance - usageLimit.used);
  const ownPosts = posts.filter((post) => post.authorId === currentUser.id || post.authorName === profile.name);
  const latestPost = ownPosts[0] || posts[0];
  const lanes = getRoleMarketLanes(profile.role).slice(0, 4);
  const joinedIds = new Set(groupMemberships.map((membership) => membership.groupId));
  const joinedGroups = groups.filter((group) => joinedIds.has(group.id)).slice(0, 3);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.62)]">
        <div className="p-5 text-center sm:p-7">
          <PeepAvatar
            seed={`${profile.id}-${profile.name}-${profile.role}`}
            variant={profile.avatarVariant || 'standing'}
            avatarIndex={profile.avatarIndex}
            avatarBg={profile.avatarBg || 'mist'}
            className="mx-auto h-28 w-28 rounded-[1.85rem] shadow-[0_18px_42px_-28px_rgba(15,23,42,0.72)]"
            ring="ring-4 ring-[#f1f5f9]"
            imageClassName={(profile.avatarVariant || 'standing') === 'bust' ? '' : 'object-contain p-1'}
          />
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-[#edf7ff] px-3 py-1 text-xs font-semibold text-[#154f79] ring-1 ring-[#cfe9fb]">{displayRole(profile.role)}</span>
            <span className="rounded-full bg-[#edf8ee] px-3 py-1 text-xs font-semibold text-[#215d27] ring-1 ring-[#d5ecd7]">{reputationProfile.tier} reputation</span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl">{profile.name || 'New RentEazy profile'}</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">{[profile.area || 'Set area', profile.budget || 'Add budget/range', profile.moveDate || 'Add timing'].join(' · ')}</p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:mx-auto sm:max-w-sm">
            <a href="/app/post" className="rounded-full bg-[#092243] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_-22px_rgba(9,34,67,0.82)]">Post</a>
            <a href="/app/swipe" className="rounded-full bg-[#8bdc65] px-4 py-3 text-sm font-semibold text-[#092243] shadow-[0_14px_28px_-22px_rgba(47,125,50,0.65)]">Swipe</a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-4 lg:grid-cols-4">
          {[
            [`${match.score}%`, 'Match fit', match.badges.slice(0, 2).join(' · ') || 'Answer questions'],
            [`${strength.score}%`, 'Profile strength', strength.suggestions.slice(0, 2).join(' · ') || 'Ready'],
            [`${remaining}`, 'Swipes left', 'Resets daily'],
            [`${likedIds.length + savedIds.length}`, 'Shortlist', `${matches.length} matches · ${shares.length} shares`],
          ].map(([value, label, sub]) => (
            <div key={label} className="rounded-[1.35rem] bg-[#f6f9fb] p-4 ring-1 ring-slate-200/70">
              <p className="text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{label}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="rounded-[1.75rem] border border-white bg-white/92 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2670a8]">Market map</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Where you fit today</h2>
            </div>
            <a href="/app/feed" className="rounded-full bg-[#092243] px-4 py-2 text-xs font-semibold text-white">Open Feed</a>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {lanes.map(([title, body, tab]) => (
              <button key={title} type="button" onClick={() => onSelectTab(tab)} className="rounded-[1.25rem] border border-slate-200 bg-[#f7faf9] p-4 text-left transition hover:border-[#2f7d32]">
                <span className="block text-sm font-semibold text-slate-950">{title}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{body}</span>
              </button>
            ))}
          </div>
          {latestPost && (
            <a href="/app/feed" className="mt-4 flex gap-3 rounded-[1.25rem] bg-[#edf7ff] p-3 ring-1 ring-[#cfe9fb]">
              {latestPost.media?.[0] && <FeedMediaAsset src={latestPost.media[0]} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />}
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-950">{latestPost.title}</span>
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#154f79]">{latestPost.body}</span>
              </span>
            </a>
          )}
        </div>
        <div className="rounded-[1.75rem] border border-white bg-[#092243] p-5 text-white shadow-[0_24px_60px_-42px_rgba(9,34,67,0.9)]">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8fd0ff]">Account pulse</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Useful, not busy.</h2>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[[wallet.balance, 'Credits'], [purchases.length, 'Buys'], [appStreak.count, 'Days']].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                <p className="text-xl font-semibold">{value}</p>
                <p className="mt-1 text-[0.68rem] text-white/55">{label}</p>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => onSelectProduct('extra-swipes-10')} className="mt-4 w-full rounded-full bg-[#8bdc65] px-4 py-3 text-sm font-semibold text-[#092243]">+10 swipes for 9p</button>
          <a href="/app/billing" className="mt-2 inline-flex w-full justify-center rounded-full bg-white/12 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/12">Billing</a>
        </div>
      </section>

      {!!joinedGroups.length && (
        <section className="w-full overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {joinedGroups.map((group) => (
            <a key={group.id} href="/app/feed" className="min-w-[15rem] rounded-[1.35rem] bg-white px-4 py-3 text-sm shadow-[0_14px_34px_-28px_rgba(15,23,42,0.45)] ring-1 ring-white">
              <span className="block font-semibold text-slate-950">{group.name}</span>
              <span className="mt-1 block text-xs text-slate-500">{group.memberCount} members · {group.area}</span>
            </a>
          ))}
          </div>
        </section>
      )}
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
    <div className="overflow-hidden rounded-[1.6rem] bg-[#092243] p-5 text-white shadow-[0_22px_52px_-34px_rgba(9,34,67,0.95)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.14em] text-[#8fd0ff]">DAILY SWIPES</p>
          <p className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-3xl font-normal tracking-tight">{remaining} <span className="text-base text-white/60">left today</span></p>
        </div>
        <button type="button" onClick={() => onBuyMore('extra-swipes-10')} className="shrink-0 rounded-full bg-[#8bdc65] px-4 py-2.5 text-sm font-semibold text-[#092243] transition hover:bg-[#9bea75]">+10 · 9p</button>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/12">
        <div className="h-full rounded-full bg-linear-to-r from-[#8bdc65] to-[#5bc4ff]" style={{ width: `${usageLimit.allowance ? (remaining / usageLimit.allowance) * 100 : 0}%` }} />
      </div>
      <p className="mt-2 text-xs text-white/55">Resets at {resetTime} · keep your streak going</p>
    </div>
  );
}

function DailyPicksPanel({ picks }) {
  return (
    <div className="rounded-3xl border border-white bg-white/86 p-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">DAILY PICKS</p>
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Fresh cards for today</h2>
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
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="rounded-full bg-[#edf8ee] px-2 py-0.5 text-[0.65rem] text-[#215d27]">{pick.recommendationScore || pick.matchScore}% fit</span>
                {(pick.recommendationReasons || pick.badges || []).slice(0, 1).map((reason) => <span key={reason} className="rounded-full bg-white px-2 py-0.5 text-[0.65rem] text-slate-500">{reason}</span>)}
              </div>
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
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">{completed} / {missions.length} launch loops</h2>
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

function LikesSocialInbox({ posts, likedIds, savedIds, matches, matchMessages, profile, onOpenPost, onSelectProduct }) {
  const savedPosts = posts.filter((post) => likedIds.includes(post.id) || savedIds.includes(post.id)).slice(0, 10);
  const matchRows = matches.slice(0, 6).map((match) => {
    const latestMessage = matchMessages
      .filter((message) => message.matchId === match.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    return {
      id: match.id,
      kind: 'match',
      title: match.subjectTitle,
      subtitle: latestMessage?.body || `${match.score}% fit · ${match.status.replace(/_/g, ' ')}`,
      meta: match.reasonBadges?.[0] || 'Mutual match',
      badge: `${match.score}%`,
      createdAt: latestMessage?.createdAt || match.createdAt,
      action: null,
    };
  });
  const postRows = savedPosts.map((post) => ({
    id: post.id,
    kind: savedIds.includes(post.id) ? 'saved' : 'liked',
    title: post.title,
    subtitle: post.body,
    meta: `${post.authorName} · ${post.area}`,
    badge: savedIds.includes(post.id) ? 'Saved' : 'Liked',
    createdAt: post.createdAt,
    post,
  }));
  const rows = [...matchRows, ...postRows].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const hiddenLikeCount = Math.max(0, likedIds.length + matches.length - 1);

  return (
    <section className="max-w-full overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.62)]">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-b border-slate-100 p-4 sm:flex sm:items-center sm:p-5">
        <PeepAvatar
          seed={`${profile.id}-${profile.name}-${profile.role}`}
          variant={profile.avatarVariant || 'standing'}
          avatarIndex={profile.avatarIndex}
          avatarBg={profile.avatarBg || 'mist'}
          className="h-12 w-12 rounded-2xl"
          ring="ring-1 ring-slate-200"
          imageClassName={(profile.avatarVariant || 'standing') === 'bust' ? '' : 'object-contain p-1'}
        />
        <div className="min-w-0">
          <h1 className="font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Likes</h1>
          <p className="truncate text-sm text-slate-500">Matches, saved posts, and useful threads in one place.</p>
        </div>
        <button type="button" onClick={() => onSelectProduct('reveal-like-1')} className="col-span-2 w-full rounded-full bg-[#092243] px-3 py-2 text-xs font-semibold text-white sm:col-span-1 sm:w-auto sm:shrink-0 sm:px-4 sm:text-sm">Unlock</button>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-2 rounded-full bg-[#f3f6f8] px-4 py-3 text-sm text-slate-500">
          <Search className="h-4 w-4" />
          <span className="min-w-0 truncate">Search matches, saved posts, people</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 pb-1">
          {['All', 'Matches', 'Liked', 'Saved', 'Viewing'].map((chip, index) => (
            <button key={chip} type="button" className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${index === 0 ? 'bg-[#092243] text-white' : 'bg-[#f3f6f8] text-slate-600'}`}>{chip}</button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        <div className="px-4 py-4 sm:px-5">
          <div className="overflow-hidden rounded-[1.6rem] bg-linear-to-br from-[#0d2e57] to-[#06182f] p-5 text-white shadow-[0_22px_52px_-36px_rgba(9,34,67,0.9)]">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#ff3366]/20 text-[#ff7a9c] ring-1 ring-[#ff3366]/30">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-xl font-normal leading-tight">{hiddenLikeCount ? `${hiddenLikeCount} ${hiddenLikeCount === 1 ? 'person likes' : 'people like'} you` : 'No hidden likes yet'}</p>
                <p className="mt-0.5 text-sm text-white/60">{hiddenLikeCount ? 'See who — every like is real, nothing faked.' : 'Nothing is faked. Real likes appear here as they arrive.'}</p>
              </div>
            </div>
            {hiddenLikeCount > 0 && (
              <button type="button" onClick={() => onSelectProduct('reveal-like-1')} className="mt-4 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#092243] transition hover:bg-[#f0fdf4]">Reveal who liked you</button>
            )}
          </div>
        </div>

        {rows.map((row) => (
          <button
            key={`${row.kind}-${row.id}`}
            type="button"
            onClick={() => row.post && onOpenPost(row.post)}
            className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-[#f7faf9] sm:px-5"
          >
            {row.post?.media?.[0] ? (
              <FeedMediaAsset src={row.post.media[0]} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
            ) : (
              <PeepAvatar
                seed={`${row.id}-${row.title}`}
                variant="bust"
                avatarBg={row.kind === 'match' ? 'sky' : 'mint'}
                className="h-14 w-14 rounded-2xl"
                ring="ring-1 ring-slate-200"
              />
            )}
            <span className="min-w-0 flex-1">
              <span className="line-clamp-1 block font-semibold text-slate-950">{row.title}</span>
              <span className="line-clamp-1 block text-sm text-slate-500">{row.subtitle}</span>
              <span className="mt-1 block text-xs text-slate-400">{row.meta}</span>
            </span>
            <span className={`max-w-[4.25rem] shrink-0 truncate rounded-full px-2.5 py-1 text-xs font-semibold ${row.kind === 'match' ? 'bg-[#edf8ee] text-[#215d27]' : 'bg-[#f3f6f8] text-slate-500'}`}>{row.badge}</span>
          </button>
        ))}

        {!rows.length && (
          <div className="px-5 py-8 text-sm leading-6 text-slate-500">
            Like or save posts from the Feed, or create mutual interest from Swipe. They will appear here without fake activity.
          </div>
        )}
      </div>
    </section>
  );
}

function SocialKitProfilePage({ profile, posts, likedIds, savedIds, matches, reputationProfile, answers, onOpenPost }) {
  const strength = calculateProfileStrength(profile, answers);
  const ownOrRelevantPosts = posts
    .filter((post) => post.authorId === profile.id || post.authorName === profile.name || likedIds.includes(post.id) || savedIds.includes(post.id))
    .slice(0, 8);
  const gallery = (ownOrRelevantPosts.length ? ownOrRelevantPosts : posts).filter((post) => post.media?.[0]).slice(0, 6);
  const ownPostCount = posts.filter((post) => post.authorId === profile.id || post.authorName === profile.name).length;
  const trustScore = Number.isFinite(Number(reputationProfile?.score)) ? Number(reputationProfile.score) : 0;

  return (
    <section className="overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_-52px_rgba(15,23,42,0.62)] ring-1 ring-white">
      <div className="relative min-h-[18rem] overflow-hidden bg-linear-to-br from-[#092243] via-[#0d2e57] to-[#06182f] px-6 pb-6 pt-5">
        <div className="absolute -right-20 -top-28 h-72 w-72 rotate-45 rounded-[4rem] border border-white/12" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rotate-45 rounded-[4rem] bg-white/[0.04]" />
        <div className="absolute -right-10 top-16 h-40 w-40 rounded-full bg-[#52a832]/20 blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <a href="/app/feed" className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/25">
            <ArrowDownLeft className="h-4 w-4" />
          </a>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/25">
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
        <div className="relative z-10 mt-8 text-center">
          <PeepAvatar
            seed={`${profile.id}-${profile.name}-${profile.role}`}
            variant={profile.avatarVariant || 'standing'}
            avatarIndex={profile.avatarIndex}
            avatarBg={profile.avatarBg || 'mist'}
            className="mx-auto h-28 w-28 rounded-[2rem]"
            ring="ring-8 ring-white/15"
            imageClassName={(profile.avatarVariant || 'standing') === 'bust' ? '' : 'object-contain p-1'}
          />
          <h1 className="mt-4 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-semibold tracking-tight text-white">{profile.name || 'New RentEazy profile'}</h1>
          <p className="mt-1 text-sm font-medium text-white/65">@{(profile.name || 'renteazy').toLowerCase().replace(/[^a-z0-9]+/g, '') || 'renteazy'} · {displayRole(profile.role)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-6 py-5 text-center">
        {[
          [ownPostCount, 'Posts'],
          [trustScore, 'Trust'],
          [matches.length, 'Matches'],
        ].map(([value, label]) => (
          <div key={label}>
            <p className="font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-semibold text-[#092243]">{value}</p>
            <p className="mt-1 text-xs font-semibold tracking-wide text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="mx-6 rounded-[1.55rem] bg-linear-to-br from-[#edf8ee] to-[#e3f2ff] p-3.5 ring-1 ring-[#d5ecd7]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#092243]">{strength.score}% profile strength</p>
            <p className="mt-1 line-clamp-1 text-xs text-slate-500">{strength.suggestions.slice(0, 2).join(' · ') || 'Ready for matching'}</p>
          </div>
          <a href="#profile-editor" className="shrink-0 rounded-full bg-[#092243] px-4 py-2 text-xs font-bold text-white shadow-[0_12px_26px_-16px_rgba(9,34,67,0.8)] transition hover:bg-[#0d2e57]">Edit</a>
        </div>
      </div>

      <div className="px-6 pb-6 pt-5">
        <div className="mb-4 flex items-center justify-center gap-2">
          <button type="button" className="rounded-full bg-[#092243] px-5 py-2 text-xs font-bold text-white shadow-[0_12px_26px_-18px_rgba(9,34,67,0.75)]">Photos</button>
          <button type="button" className="rounded-full bg-[#f4f7f8] px-5 py-2 text-xs font-bold text-slate-500 transition hover:text-[#092243]">Saved</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {gallery.map((post, index) => (
            <button
              key={post.id}
              type="button"
              onClick={() => onOpenPost(post)}
              className={`overflow-hidden rounded-[1.55rem] bg-slate-100 ${index % 3 === 0 ? 'row-span-2 aspect-[0.72]' : 'aspect-square'}`}
            >
              <FeedMediaAsset src={post.media[0]} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialHomeHeader({ profile, usageLimit, groups, memberships, posts, onSelectTab }) {
  const remaining = Math.max(0, usageLimit.allowance - usageLimit.used);
  const joinedCount = memberships.length;
  const roleLabel = displayRole(profile.role);
  const popularAreas = [...new Set(posts.map((post) => post.area).filter(Boolean))].slice(0, 3);

  return (
    <section className="overflow-hidden rounded-[1.65rem] border border-white/75 bg-white/76 p-3 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.7),inset_0_1px_0_rgba(255,255,255,0.96)] backdrop-blur-2xl">
      <div className="flex items-center gap-2">
        <a href="/app/post" className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.3rem] bg-[#f7faf9] px-3 py-3 text-left ring-1 ring-black/5 transition-transform active:scale-[0.99]">
          <span className="relative flex shrink-0">
            <PeepAvatar
              seed={`${profile.id}-${profile.name}-${profile.role}`}
              variant={profile.avatarVariant || 'bust'}
              avatarIndex={profile.avatarIndex}
              avatarBg={profile.avatarBg || 'mist'}
              className="h-10 w-10 shadow-[0_12px_28px_-16px_rgba(9,34,67,0.55)]"
              ring="ring-1 ring-black/5"
              imageClassName={(profile.avatarVariant || 'bust') === 'bust' ? '' : 'object-contain p-1'}
            />
            <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#2f7d32]" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-slate-950">What are you looking for, offering, or sharing?</span>
            <span className="mt-0.5 block truncate text-xs text-slate-500">Post into the rental market feed</span>
          </span>
        </a>
        <div className="flex shrink-0 gap-1.5">
          <button type="button" aria-label="Groups" onClick={() => onSelectTab('Groups')} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#092243] ring-1 ring-black/5 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.5)]"><Users className="h-4 w-4" /></button>
          <a href="/app/swipe" aria-label="Swipe" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2f7d32] text-white shadow-[0_14px_30px_-18px_rgba(47,125,50,0.7)]"><Flame className="h-4 w-4" /></a>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <a href="/app/profile" className="rounded-2xl bg-[#edf7ff] px-2 py-2 text-[#154f79]">
          <span className="block truncate text-[0.68rem] text-[#154f79]/70">Role</span>
          <span className="block truncate text-xs font-semibold">{roleLabel}</span>
        </a>
        <a href="/app/swipe" className="rounded-2xl bg-[#edf8ee] px-2 py-2 text-[#215d27]">
          <span className="block text-[0.68rem] text-[#215d27]/70">Swipes</span>
          <span className="block text-xs font-semibold">{remaining} ready</span>
        </a>
        <button type="button" onClick={() => onSelectTab('Groups')} className="rounded-2xl bg-white px-2 py-2 text-slate-700 ring-1 ring-black/5">
          <span className="block text-[0.68rem] text-slate-400">Groups</span>
          <span className="block text-xs font-semibold">{joinedCount} joined</span>
        </button>
      </div>
      {popularAreas.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5">
          {popularAreas.map((area) => (
            <button key={area} type="button" onClick={() => onSelectTab('For You')} className="shrink-0 rounded-full bg-[#f7faf9] px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-black/5">{area}</button>
          ))}
        </div>
      )}
    </section>
  );
}

function SocialStoryRail({ posts, groups, onSelectTab }) {
  const mediaPosts = posts
    .filter((post) => post.media?.[0])
    .slice(0, 5)
    .map((post) => ({
      id: post.id,
      title: post.postType === 'Area Insight' ? post.area : post.postType,
      body: post.authorName.split(' ')[0],
      media: getVideoPreviewImage(post) || post.media[0],
      tab: post.postType === 'Room' || post.postType === 'Property' ? 'Properties' : post.postType === 'Looking' ? 'Looking' : post.postType === 'House Buddy' ? 'Buddies' : 'For You',
    }));
  const stories = [
    { id: 'post', title: 'Post', body: 'Free', media: '', tab: 'Post' },
    ...mediaPosts,
    { id: 'groups', title: 'Groups', body: `${groups.length} open`, media: '', tab: 'Groups' },
    { id: 'perks', title: 'Perks', body: 'Useful', media: '', tab: 'Perks' },
  ];

  const openStory = (tab) => {
    if (tab === 'Post') {
      window.location.href = '/app/post';
      return;
    }
    onSelectTab(tab);
  };

  return (
    <div className="-mx-6 overflow-x-auto px-6 pb-1 [scrollbar-width:none]">
      <div className="flex min-w-max gap-3">
        {stories.map(({ id, title, body, media, tab }) => (
          <button key={id} type="button" onClick={() => openStory(tab)} className="w-[76px] shrink-0 text-left">
            <span className="relative block h-[96px] overflow-hidden rounded-[1.45rem] bg-[#e2f7f3] shadow-[0_18px_40px_-28px_rgba(15,23,42,0.74)] ring-1 ring-black/5">
              {media ? (
                <>
                  <FeedMediaAsset src={media} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <span className="absolute inset-0 bg-linear-to-t from-black/62 via-black/10 to-transparent" />
                </>
              ) : (
                <span className="absolute inset-0 bg-linear-to-br from-[#dff8f3] via-white to-[#cfe9fb]" />
              )}
              <span className={`absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full ${id === 'post' ? 'bg-[#050506] text-white' : 'bg-white/86 text-[#050506]'} shadow-[0_10px_24px_-18px_rgba(0,0,0,0.7)]`}>
                {id === 'post' ? <PlusCircle className="h-4 w-4" /> : id === 'groups' ? <Users className="h-4 w-4" /> : id === 'perks' ? <Gift className="h-4 w-4" /> : <Sparkles className="h-3.5 w-3.5" />}
              </span>
              <span className="absolute inset-x-0 bottom-0 p-2">
                <span className={`block truncate text-xs font-bold ${media ? 'text-white' : 'text-[#050506]'}`}>{title}</span>
                <span className={`block truncate text-[0.64rem] font-medium ${media ? 'text-white/72' : 'text-[#050506]/55'}`}>{body}</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DailyReturnPanel({ profile, lifecycleTasks, reputationProfile, onCompleteTask }) {
  const role = profile.role || 'General';
  const reasons = roleReturnReasons[role] || roleReturnReasons.General;
  const relevantTasks = lifecycleTasks
    .filter((task) => task.roleType === 'General' || task.roleType === role)
    .sort((a, b) => {
      const cadenceOrder = { today: 0, week: 1, long: 2 };
      return (cadenceOrder[a.cadence] ?? 3) - (cadenceOrder[b.cadence] ?? 3);
    })
    .slice(0, 5);
  const completedCount = relevantTasks.filter((task) => task.status === 'completed').length;
  const openCount = Math.max(0, relevantTasks.length - completedCount);

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white/92 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <div className="bg-[#092243] p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-['JetBrains_Mono',monospace] text-xs text-[#8fd0ff]">WHY OPEN TODAY</p>
            <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-3xl font-semibold tracking-tight">Your rental world moved.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/68">RentEazy gives every role a reason to check in without forcing a long form or fake urgency.</p>
          </div>
          <div className="shrink-0 rounded-2xl bg-white/12 px-4 py-3 text-center ring-1 ring-white/12">
            <p className="text-2xl font-semibold">{openCount}</p>
            <p className="text-[0.68rem] text-white/58">open loops</p>
          </div>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {reasons.map((reason) => (
            <div key={reason} className="rounded-2xl bg-white/10 px-3 py-3 text-sm leading-5 ring-1 ring-white/10">{reason}</div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 p-4 lg:grid-cols-[1fr_15rem]">
        <div className="grid gap-3">
          {relevantTasks.map((task) => {
            const complete = task.status === 'completed';
            return (
              <article key={task.id} className={`rounded-3xl border p-4 ${complete ? 'border-[#d5ecd7] bg-[#edf8ee]' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#2670a8]">{task.cadence === 'today' ? 'Today' : task.cadence === 'week' ? 'This week' : 'Long game'} · {task.reward}</p>
                    <h3 className="mt-1 text-base font-semibold text-slate-950">{task.title}</h3>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs ${complete ? 'bg-white text-[#215d27]' : 'bg-slate-50 text-slate-500'}`}>{complete ? 'Done' : 'Open'}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{task.body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={task.targetPath} className="rounded-full bg-[#092243] px-4 py-2 text-sm text-white">{task.actionLabel}</a>
                  {!complete && (
                    <button type="button" onClick={() => onCompleteTask(task.id)} className="rounded-full bg-[#2f7d32] px-4 py-2 text-sm text-white">Mark useful</button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        <div className="rounded-3xl border border-[#d5ecd7] bg-[#edf8ee] p-4 text-[#215d27]">
          <p className="font-['JetBrains_Mono',monospace] text-xs">REPUTATION ASSET</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{reputationProfile?.score || 0}</p>
          <p className="mt-1 text-sm">{reputationProfile?.tier || 'Starter'} tier</p>
          <p className="mt-4 text-sm leading-6">Helpful activity, mutual matches, viewings, and double-sided feedback improve the asset users do not want to lose.</p>
        </div>
      </div>
    </section>
  );
}

function RecommendationLoopPanel({ insights, onOpenOffer }) {
  const learned = insights?.learnedSignals || {};
  const feedMix = insights?.feedMix || {};
  const swipeDeck = insights?.swipeDeck || {};
  const nextActions = insights?.nextActions || [];
  const perkRecommendations = insights?.perkRecommendations || [];

  return (
    <section className="rounded-[1.75rem] border border-white bg-white/92 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.42),inset_0_1px_0_white]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">RECOMMENDATION LOOP</p>
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">What RentEazy learned</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Your actions change Feed rank, swipe priority, and relevant perks. No fake scarcity, no hidden trust boosts.</p>
        </div>
        <Sparkles className="mt-1 h-5 w-5 text-[#2f7d32]" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        {[
          [learned.answeredQuestions || 0, 'Answers'],
          [learned.likedSwipes || 0, 'Liked swipes'],
          [learned.feedInteractions || 0, 'Feed signals'],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xl text-slate-950">{value}</p>
            <p className="text-slate-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-3xl bg-[#092243] p-4 text-white">
        <p className="text-xs text-[#8fd0ff]">Feed mix</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-2xl bg-white/10 p-3"><p className="text-lg font-semibold">{feedMix.discovery || 0}</p><p className="text-white/58">Discovery</p></div>
          <div className="rounded-2xl bg-white/10 p-3"><p className="text-lg font-semibold">{feedMix.progress || 0}</p><p className="text-white/58">Progress</p></div>
          <div className="rounded-2xl bg-white/10 p-3"><p className="text-lg font-semibold">{feedMix.socialProof || 0}</p><p className="text-white/58">Proof</p></div>
        </div>
        {feedMix.topReasons?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {feedMix.topReasons.map((reason) => <span key={reason} className="rounded-full bg-white/12 px-3 py-1 text-xs text-white/72">{reason}</span>)}
          </div>
        )}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#d5ecd7] bg-[#edf8ee] p-4 text-[#215d27]">
          <p className="text-sm font-medium">Swipe deck adjustment</p>
          <div className="mt-2 space-y-2">
            {[...(swipeDeck.prioritySignals || []), ...(swipeDeck.suppressedSignals || [])].slice(0, 3).map((signal) => (
              <p key={signal} className="rounded-2xl bg-white px-3 py-2 text-xs">{signal}</p>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-950">Next best actions</p>
          <div className="mt-2 space-y-2">
            {nextActions.length ? nextActions.map((action) => (
              <a key={action.id} href={action.targetPath} className="block rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span className="font-medium text-slate-950">{action.label}</span>
                <span className="mt-1 block">{action.reason}</span>
              </a>
            )) : <p className="rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-500">Keep using Feed, Swipe, and Groups to improve recommendations.</p>}
          </div>
        </div>
      </div>
      {perkRecommendations.length > 0 && (
        <div className="mt-4 rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-950">Perks now prioritised</p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {perkRecommendations.map((offer) => (
              <button key={offer.offerId} type="button" onClick={() => onOpenOffer?.(offer.offerId)} className="min-w-56 rounded-2xl bg-white p-3 text-left text-xs text-slate-600">
                <span className="block font-medium text-slate-950">{offer.title}</span>
                <span className="mt-1 block">{offer.reason}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ReferralLoopPanel({ profile, referrals, onCreateReferral }) {
  const [inviteType, setInviteType] = useState(profile.role === 'Investor' ? 'Sourcer' : profile.role === 'Landlord' ? 'Agent' : 'House Buddy');
  const [target, setTarget] = useState('');
  const templates = ['House Buddy', 'Landlord', 'Agent', 'Operator', 'Sourcer', 'Investor'];
  const recentReferral = referrals[0];

  const submit = (event) => {
    event.preventDefault();
    onCreateReferral({ inviteType, target });
    setTarget('');
  };

  const copyReferral = async (url) => {
    if (!url || !navigator.clipboard) return;
    await navigator.clipboard.writeText(url);
  };

  return (
    <section className="rounded-[1.75rem] border border-white bg-white/92 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">INVITE LOOP</p>
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Bring the right side of the market in</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Useful invites improve liquidity: buddies bring buddies, landlords bring supply, sourcers bring deals, investors bring criteria.</p>
        </div>
        <UserPlus className="mt-1 h-5 w-5 text-[#2f7d32]" />
      </div>
      <form onSubmit={submit} className="mt-4 grid gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {templates.map((type) => (
            <button key={type} type="button" onClick={() => setInviteType(type)} className={`shrink-0 rounded-full px-4 py-2 text-sm ${inviteType === type ? 'bg-[#092243] text-white' : 'border border-slate-200 bg-white text-slate-600'}`}>{type}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={target} onChange={(event) => setTarget(event.target.value)} placeholder="Who should join? Optional" className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-hidden focus:border-[#2f7d32]" />
          <button className="rounded-full bg-[#2f7d32] px-5 py-3 text-sm text-white">Create link</button>
        </div>
      </form>
      {recentReferral && (
        <div className="mt-4 rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-950">{recentReferral.inviteType} invite ready</p>
          <p className="mt-1 truncate text-xs text-slate-500">{recentReferral.trackingUrl}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => copyReferral(recentReferral.trackingUrl)} className="rounded-full bg-white px-4 py-2 text-sm text-slate-700">Copy link</button>
            <a href={`mailto:?subject=Join me on RentEazy&body=${encodeURIComponent(recentReferral.trackingUrl)}`} className="rounded-full bg-[#092243] px-4 py-2 text-sm text-white">Send invite</a>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">{recentReferral.reward}</p>
        </div>
      )}
    </section>
  );
}

function ResidentModePanel({ residentProfiles, maintenanceRequests, rentRecords, onLogMaintenance, onLogRent }) {
  const [maintenanceDraft, setMaintenanceDraft] = useState({ title: '', category: 'Repair', priority: 'Normal', notes: '' });
  const [rentDraft, setRentDraft] = useState({ month: new Date().toISOString().slice(0, 7), amount: '' });
  const resident = residentProfiles[0];
  const leaseDays = resident?.leaseEndsAt ? Math.max(0, Math.ceil((new Date(resident.leaseEndsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000))) : null;

  const submitMaintenance = (event) => {
    event.preventDefault();
    if (!maintenanceDraft.title.trim()) return;
    onLogMaintenance(maintenanceDraft);
    setMaintenanceDraft({ title: '', category: 'Repair', priority: 'Normal', notes: '' });
  };

  const submitRent = (event) => {
    event.preventDefault();
    if (!Number(rentDraft.amount)) return;
    onLogRent(rentDraft);
    setRentDraft({ month: new Date().toISOString().slice(0, 7), amount: '' });
  };

  return (
    <section className="rounded-[1.75rem] border border-white bg-white/92 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">RESIDENT MODE</p>
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Stay useful after move-in</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Maintenance, rent history, lease reminders, and local records keep reputation growing between searches.</p>
        </div>
        <ShieldCheck className="mt-1 h-5 w-5 text-[#2f7d32]" />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-3xl bg-[#092243] p-4 text-white">
          <p className="text-xs text-white/58">{resident?.area || 'RentEazy network'}</p>
          <h3 className="mt-2 text-lg font-semibold">{resident?.homeLabel || 'Resident record ready'}</h3>
          <p className="mt-3 text-sm leading-6 text-white/68">{leaseDays !== null ? `${leaseDays} days until renewal window pressure starts.` : 'Add a lease date to unlock renewal reminders.'}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs text-[#2670a8]">Records</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{maintenanceRequests.length + rentRecords.length}</p>
          <p className="mt-1 text-sm text-slate-500">timestamped resident signals</p>
        </div>
        <div className="rounded-3xl bg-[#edf8ee] p-4 text-[#215d27]">
          <p className="text-xs">Reputation</p>
          <p className="mt-2 text-sm leading-6">{resident?.reputationImpact || 'Resident history can become a portable trust asset.'}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <form onSubmit={submitMaintenance} className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-950">Log maintenance</p>
          <input value={maintenanceDraft.title} onChange={(event) => setMaintenanceDraft((current) => ({ ...current, title: event.target.value }))} placeholder="What needs attention?" className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-hidden focus:border-[#2f7d32]" />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <select value={maintenanceDraft.category} onChange={(event) => setMaintenanceDraft((current) => ({ ...current, category: event.target.value }))} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm">
              {['Repair', 'Safety', 'Cleaning', 'Noise', 'Other'].map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={maintenanceDraft.priority} onChange={(event) => setMaintenanceDraft((current) => ({ ...current, priority: event.target.value }))} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm">
              {['Low', 'Normal', 'Urgent'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <textarea value={maintenanceDraft.notes} onChange={(event) => setMaintenanceDraft((current) => ({ ...current, notes: event.target.value }))} rows={2} placeholder="Notes" className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
          <button className="mt-3 w-full rounded-full bg-[#2f7d32] px-4 py-3 text-sm text-white">Save record</button>
        </form>
        <form onSubmit={submitRent} className="rounded-3xl border border-[#d5ecd7] bg-[#edf8ee] p-4">
          <p className="text-sm font-medium text-[#215d27]">Record rent history</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <input type="month" value={rentDraft.month} onChange={(event) => setRentDraft((current) => ({ ...current, month: event.target.value }))} className="rounded-2xl border border-[#c6e5c9] bg-white px-3 py-2 text-sm" />
            <input inputMode="numeric" value={rentDraft.amount} onChange={(event) => setRentDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="£ amount" className="rounded-2xl border border-[#c6e5c9] bg-white px-3 py-2 text-sm" />
          </div>
          <p className="mt-3 text-xs leading-5 text-[#215d27]">Self-recorded now; verification can be added later. Do not upload bank details here.</p>
          <button className="mt-3 w-full rounded-full bg-[#092243] px-4 py-3 text-sm text-white">Save rent record</button>
        </form>
      </div>
    </section>
  );
}

function LandlordModePanel({ properties, posts, onAddProperty }) {
  const [draft, setDraft] = useState({ title: '', area: '', propertyType: 'Room', expectedRent: '' });
  const tenantDemandPosts = posts.filter((post) => ['Looking', 'House Buddy', 'Question'].includes(post.postType)).length;
  const totalDemand = properties.reduce((sum, property) => sum + Number(property.tenantDemandCount || 0), tenantDemandPosts);
  const totalOperatorInterest = properties.reduce((sum, property) => sum + Number(property.operatorInterestCount || 0), 0);

  const submit = (event) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.area.trim()) return;
    onAddProperty(draft);
    setDraft({ title: '', area: '', propertyType: 'Room', expectedRent: '' });
  };

  return (
    <section className="rounded-[1.75rem] border border-white bg-white/92 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">LANDLORD MODE</p>
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Demand before vacancy</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Properties connect to tenant demand, agent routes, operator offers, and investor interest.</p>
        </div>
        <Home className="mt-1 h-5 w-5 text-[#2f7d32]" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xl text-slate-950">{properties.length}</p><p className="text-slate-500">Properties</p></div>
        <div className="rounded-2xl bg-[#edf8ee] p-3"><p className="text-xl text-[#215d27]">{totalDemand}</p><p className="text-[#215d27]">Demand</p></div>
        <div className="rounded-2xl bg-[#edf7ff] p-3"><p className="text-xl text-[#154f79]">{totalOperatorInterest}</p><p className="text-[#154f79]">Operators</p></div>
      </div>
      <div className="mt-4 grid gap-3">
        {properties.slice(0, 3).map((property) => (
          <article key={property.id} className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-[#2670a8]">{property.area} · {property.propertyType}</p>
                <h3 className="mt-1 text-base font-semibold text-slate-950">{property.title}</h3>
              </div>
              <span className="rounded-full bg-[#edf8ee] px-3 py-1 text-xs text-[#215d27]">{property.vacancyRisk} risk</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{property.benchmarkNote}</p>
            <p className="mt-2 text-xs text-slate-500">{property.tenantDemandCount} tenant signals · {property.agentInterestCount} agent routes · {property.operatorInterestCount} operator signals</p>
          </article>
        ))}
      </div>
      <form onSubmit={submit} className="mt-4 grid gap-2 rounded-3xl bg-slate-50 p-3">
        <p className="text-sm font-medium text-slate-950">Add property pipeline</p>
        <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Property or room name" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
        <div className="grid grid-cols-3 gap-2">
          <input value={draft.area} onChange={(event) => setDraft((current) => ({ ...current, area: event.target.value }))} placeholder="Area" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm" />
          <select value={draft.propertyType} onChange={(event) => setDraft((current) => ({ ...current, propertyType: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm">
            {['Room', 'Flat', 'House', 'Short stay'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input value={draft.expectedRent} onChange={(event) => setDraft((current) => ({ ...current, expectedRent: event.target.value }))} placeholder="Rent" className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm" />
        </div>
        <button className="rounded-full bg-[#092243] px-4 py-3 text-sm text-white">Create pipeline</button>
      </form>
    </section>
  );
}

function ProfessionalModePanel({ profile, professionalProfiles, posts, groups }) {
  const role = profile.role || 'General';
  const activeProfile = professionalProfiles.find((item) => item.roleType === role) || professionalProfiles[0];
  const professionalPosts = posts.filter((post) => ['Agent Update', 'Sourcer Deal', 'Investor Brief', 'Operator Offer', 'Landlord Opportunity'].includes(post.postType));
  const professionalGroups = groups.filter((group) => ['Role network', 'Professional circle', 'Deal community'].includes(group.groupType));

  return (
    <section className="rounded-[1.75rem] border border-white bg-white/92 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">PROFESSIONAL MODE</p>
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Pipeline, status, and market signal</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Agents, sourcers, investors, and operators get reputation, followership, deal flow, and response metrics.</p>
        </div>
        <BadgeCheck className="mt-1 h-5 w-5 text-[#2f7d32]" />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
        {[
          [activeProfile?.responseRate || 0, 'Response %'],
          [activeProfile?.verifiedDeals || 0, 'Verified'],
          [activeProfile?.followerCount || 0, 'Followers'],
          [activeProfile?.pipelineCount || 0, 'Pipeline'],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xl text-slate-950">{value}</p>
            <p className="text-slate-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-3xl bg-[#092243] p-4 text-white">
          <p className="text-xs text-[#8fd0ff]">{activeProfile?.roleType || role} · #{activeProfile?.leaderboardRank || '—'} in active area</p>
          <h3 className="mt-2 text-lg font-semibold">{activeProfile?.displayName || 'Professional profile ready'}</h3>
          <p className="mt-3 text-sm leading-6 text-white/68">{activeProfile?.areas?.join(', ') || 'Add areas to start ranking professional demand.'}</p>
        </div>
        <div className="rounded-3xl bg-[#edf8ee] p-4 text-[#215d27]">
          <p className="text-sm font-medium">Market signal</p>
          <p className="mt-2 text-sm leading-6">{professionalPosts.length} professional posts and {professionalGroups.length} role groups are feeding the network right now.</p>
          <a href="/app/post" className="mt-4 inline-flex rounded-full bg-[#2f7d32] px-4 py-2 text-sm text-white">Post update</a>
        </div>
      </div>
    </section>
  );
}

function TenantDemandPipelinePanel({ signals, properties, introductions, onShortlist }) {
  const shortlistedIds = new Set(introductions.map((item) => item.sourceId));
  const strongSignals = signals.filter((signal) => Number(signal.strength || 0) >= 75).length;
  const totalMatchedProperties = signals.reduce((sum, signal) => sum + (signal.matchedPropertyIds?.length || 0), 0);

  return (
    <section className="rounded-[1.75rem] border border-white bg-white/92 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">TENANT DEMAND PIPELINE</p>
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Demand landlords can act on</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Looking posts, buddy-up posts, and market signals become shortlists for landlord, agent, and operator workflows.</p>
        </div>
        <Users className="mt-1 h-5 w-5 text-[#2f7d32]" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xl text-slate-950">{signals.length}</p><p className="text-slate-500">Signals</p></div>
        <div className="rounded-2xl bg-[#edf8ee] p-3"><p className="text-xl text-[#215d27]">{strongSignals}</p><p className="text-[#215d27]">Strong</p></div>
        <div className="rounded-2xl bg-[#edf7ff] p-3"><p className="text-xl text-[#154f79]">{totalMatchedProperties}</p><p className="text-[#154f79]">Property fits</p></div>
      </div>
      <div className="mt-4 space-y-3">
        {signals.slice(0, 4).map((signal) => {
          const shortlisted = shortlistedIds.has(signal.id) || signal.status === 'shortlisted';
          const targetProperty = properties.find((property) => signal.matchedPropertyIds?.includes(property.id));
          return (
            <article key={signal.id} className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[#2670a8]">{signal.roleType} · {signal.area}</p>
                  <h3 className="mt-1 text-base font-semibold text-slate-950">{signal.displayName}</h3>
                  <p className="mt-1 text-xs text-slate-500">{signal.budget} · {signal.moveDate}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#edf8ee] px-3 py-1 text-xs text-[#215d27]">{signal.strength}% fit</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{signal.propertyInterest}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {signal.reasonBadges?.map((badge) => <span key={badge} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{badge}</span>)}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">{targetProperty ? `Best fit: ${targetProperty.title}` : 'No property fit yet; keep as market signal.'}</p>
                <button type="button" onClick={() => onShortlist(signal)} className={`shrink-0 rounded-full px-4 py-2 text-xs ${shortlisted ? 'bg-[#edf8ee] text-[#215d27]' : 'bg-[#092243] text-white'}`}>
                  {shortlisted ? 'Shortlisted' : 'Shortlist'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DealTrackingPanel({ posts, watchlist, onWatchDeal, onUpdateDealStatus }) {
  const dealPosts = posts.filter((post) => ['Sourcer Deal', 'Investor Brief', 'Landlord Opportunity', 'Operator Offer'].includes(post.postType));
  const watchedIds = new Set(watchlist.map((item) => item.dealPostId));
  const activeWatchCount = watchlist.filter((item) => item.status !== 'passed').length;

  return (
    <section className="rounded-[1.75rem] border border-white bg-white/92 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">DEAL WATCHLIST</p>
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Follow the money signals</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Investors, sourcers, and operators can watch briefs, deals, landlord opportunities, and operator offers.</p>
        </div>
        <Bookmark className="mt-1 h-5 w-5 text-[#2f7d32]" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xl text-slate-950">{dealPosts.length}</p><p className="text-slate-500">Deal posts</p></div>
        <div className="rounded-2xl bg-[#edf8ee] p-3"><p className="text-xl text-[#215d27]">{activeWatchCount}</p><p className="text-[#215d27]">Watching</p></div>
        <div className="rounded-2xl bg-[#edf7ff] p-3"><p className="text-xl text-[#154f79]">{Math.round((watchlist[0]?.score || 0))}</p><p className="text-[#154f79]">Top score</p></div>
      </div>
      <div className="mt-4 space-y-3">
        {dealPosts.slice(0, 4).map((post) => {
          const watched = watchedIds.has(post.id);
          const watchItem = watchlist.find((item) => item.dealPostId === post.id);
          return (
            <article key={post.id} className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-[#2670a8]">{post.postType} · {post.area}</p>
                  <h3 className="mt-1 text-base font-semibold text-slate-950">{post.title}</h3>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{post.budget}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{post.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(watchItem?.reasonBadges || post.tags || []).slice(0, 3).map((badge) => <span key={badge} className="rounded-full bg-[#edf7ff] px-3 py-1 text-xs text-[#154f79]">{badge}</span>)}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => onWatchDeal(post)} className={`rounded-full px-4 py-2 text-xs ${watched ? 'bg-[#edf8ee] text-[#215d27]' : 'bg-[#092243] text-white'}`}>
                  {watched ? 'Watching' : 'Watch deal'}
                </button>
                {watched && ['reviewing', 'contacted', 'passed'].map((status) => (
                  <button key={status} type="button" onClick={() => onUpdateDealStatus(watchItem.id, status)} className={`rounded-full px-3 py-2 text-xs ${watchItem.status === status ? 'bg-[#2f7d32] text-white' : 'bg-slate-100 text-slate-600'}`}>{status}</button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function OperatorSignalsPanel({ signals, onAddSignal }) {
  const [draft, setDraft] = useState({ area: '', propertyType: '', model: 'Management', unitsTracked: '', occupancySignal: '' });
  const totalUnits = signals.reduce((sum, signal) => sum + Number(signal.unitsTracked || 0), 0);
  const landlordDemand = signals.reduce((sum, signal) => sum + Number(signal.landlordDemandCount || 0), 0);
  const investorBriefs = signals.reduce((sum, signal) => sum + Number(signal.investorBriefCount || 0), 0);

  const submit = (event) => {
    event.preventDefault();
    if (!draft.area.trim()) return;
    onAddSignal(draft);
    setDraft({ area: '', propertyType: '', model: 'Management', unitsTracked: '', occupancySignal: '' });
  };

  return (
    <section className="rounded-[1.75rem] border border-white bg-white/92 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">OPERATOR SIGNALS</p>
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Portfolio demand map</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Operators can publish areas, property needs, and model signals without turning the app into a dashboard.</p>
        </div>
        <Compass className="mt-1 h-5 w-5 text-[#2f7d32]" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xl text-slate-950">{totalUnits}</p><p className="text-slate-500">Units</p></div>
        <div className="rounded-2xl bg-[#edf8ee] p-3"><p className="text-xl text-[#215d27]">{landlordDemand}</p><p className="text-[#215d27]">Landlord fit</p></div>
        <div className="rounded-2xl bg-[#edf7ff] p-3"><p className="text-xl text-[#154f79]">{investorBriefs}</p><p className="text-[#154f79]">Investor briefs</p></div>
      </div>
      <div className="mt-4 space-y-3">
        {signals.slice(0, 3).map((signal) => (
          <article key={signal.id} className="rounded-3xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-[#2670a8]">{signal.area} · {signal.model}</p>
            <h3 className="mt-1 text-base font-semibold text-slate-950">{signal.propertyType}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{signal.occupancySignal}</p>
            <p className="mt-2 text-xs text-slate-500">{signal.unitsTracked} units tracked · {signal.complianceStatus}</p>
            <p className="mt-2 text-xs text-[#215d27]">{signal.nextAction}</p>
          </article>
        ))}
      </div>
      <form onSubmit={submit} className="mt-4 grid gap-2 rounded-3xl bg-slate-50 p-3">
        <p className="text-sm font-medium text-slate-950">Add operator signal</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input value={draft.area} onChange={(event) => setDraft((current) => ({ ...current, area: event.target.value }))} placeholder="Area" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
          <select value={draft.model} onChange={(event) => setDraft((current) => ({ ...current, model: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
            {['Management', 'Co-hosting', 'Serviced accommodation', 'Rent-to-rent'].map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_7rem]">
          <input value={draft.propertyType} onChange={(event) => setDraft((current) => ({ ...current, propertyType: event.target.value }))} placeholder="Property type wanted" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
          <input value={draft.unitsTracked} onChange={(event) => setDraft((current) => ({ ...current, unitsTracked: event.target.value }))} placeholder="Units" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
        </div>
        <input value={draft.occupancySignal} onChange={(event) => setDraft((current) => ({ ...current, occupancySignal: event.target.value }))} placeholder="Occupancy or demand signal" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
        <button className="rounded-full bg-[#092243] px-4 py-3 text-sm text-white">Save signal</button>
      </form>
    </section>
  );
}

function UsefulNotificationsPanel({ notifications, onMarkRead }) {
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <section className="rounded-[1.75rem] border border-white bg-white/92 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-[11px] tracking-[0.12em] text-[#2670a8]">USEFUL NOTIFICATIONS</p>
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Only when it reduces uncertainty</h2>
        </div>
        {unreadCount > 0 && (
          <span className="shrink-0 rounded-full bg-[#2f7d32] px-3 py-1 text-xs font-semibold text-white shadow-[0_8px_20px_-12px_rgba(47,125,50,0.8)]">{unreadCount} new</span>
        )}
      </div>
      <div className="mt-4 space-y-2">
        {notifications.slice(0, 4).map((notification) => (
          <article
            key={notification.id}
            className={`relative overflow-hidden rounded-2xl p-3.5 transition ${notification.read ? 'bg-slate-50/80' : 'bg-[#eef6ff] ring-1 ring-[#cfe6ff]'}`}
          >
            {!notification.read && <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-[#2670a8]" />}
            <div className={`flex items-start justify-between gap-3 ${notification.read ? '' : 'pl-2'}`}>
              <div className="min-w-0">
                <p className={`flex items-center gap-2 text-sm font-semibold ${notification.read ? 'text-slate-700' : 'text-slate-950'}`}>
                  {!notification.read && <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#2670a8]" />}
                  <span className="truncate">{notification.title}</span>
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{notification.body}</p>
              </div>
              {!notification.read && (
                <button
                  type="button"
                  onClick={() => onMarkRead(notification.id)}
                  className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#154f79] shadow-[0_6px_16px_-10px_rgba(15,79,121,0.7)] transition hover:bg-[#154f79] hover:text-white"
                >
                  Mark read
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
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
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Find your rental people</h2>
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

function PerkCard({ offer, onOpenOffer, recommended }) {
  return (
    <button type="button" onClick={() => onOpenOffer(offer)} className="group flex flex-col rounded-4xl border border-white bg-white/90 p-5 text-left shadow-[0_18px_44px_-32px_rgba(15,23,42,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_54px_-32px_rgba(15,23,42,0.5)]">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf8ee] px-3 py-1 font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.08em] text-[#2f7d32]"><Gift className="h-3 w-3" />{offer.category}</span>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {recommended && <span className="rounded-full bg-[#2f7d32] px-2.5 py-0.5 text-[10px] font-semibold text-white">For your profile</span>}
          {offer.sponsoredStatus && <span className="rounded-full bg-[#fff7ed] px-2.5 py-0.5 text-[10px] font-medium text-[#9a3412]">{offer.sponsoredStatus}</span>}
        </div>
      </div>
      <h3 className="mt-3 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-xl font-normal leading-tight tracking-tight text-slate-950">{offer.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{offer.description}</p>
      {offer.reward && <p className="mt-3 text-sm font-semibold text-[#2f7d32]">{offer.reward}</p>}
      <span className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#092243] px-5 py-2.5 text-sm font-medium text-white transition group-hover:bg-[#0c2e5a]">{offer.cta} <span className="transition group-hover:translate-x-0.5">→</span></span>
    </button>
  );
}

function PerksRail({ partnerOffers, profile, onOpenOffer, compact = false }) {
  const role = profile.role || 'General';
  const isRecommended = (offer) => Boolean(offer.eligibleRoles?.includes(role));
  // Always show every perk. Profile-matched ones surface first; the rest
  // stay available whenever the member wants them.
  const ordered = [...partnerOffers].sort((a, b) => Number(isRecommended(b)) - Number(isRecommended(a)));

  if (compact) {
    return (
      <div className="grid gap-3">
        {ordered.slice(0, 3).map((offer) => (
          <PerkCard key={offer.id} offer={offer} onOpenOffer={onOpenOffer} recommended={isRecommended(offer)} />
        ))}
      </div>
    );
  }

  const recommended = ordered.filter(isRecommended);
  const others = ordered.filter((offer) => !isRecommended(offer));

  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-[#0d2e57] to-[#06182f] p-6 text-white shadow-[0_30px_70px_-44px_rgba(9,34,67,0.9)] md:p-8">
        <div className="pointer-events-none absolute -top-20 right-0 h-56 w-56 rounded-full bg-[#52a832]/22 blur-[70px]" />
        <p className="relative font-['JetBrains_Mono',monospace] text-[11px] tracking-[0.16em] text-[#9bd383]">PERKS · ALL IN ONE PLACE</p>
        <h2 className="relative mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-3xl font-normal leading-tight tracking-tight md:text-4xl">Every reward, in one place.</h2>
        <p className="relative mt-3 max-w-xl text-sm font-light leading-7 text-white/65 md:text-base">We surface the perks that fit your profile first — the rest stay right here whenever you need them. Every offer is labelled and capped. No spam, no clutter.</p>
      </div>

      {recommended.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-lg font-normal tracking-tight text-[#092243]">Recommended for your profile</h3>
            <span className="rounded-full bg-[#edf8ee] px-3 py-1 font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.08em] text-[#2f7d32]">{recommended.length}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {recommended.map((offer) => (
              <PerkCard key={offer.id} offer={offer} onOpenOffer={onOpenOffer} recommended />
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-lg font-normal tracking-tight text-[#092243]">{recommended.length ? 'More perks' : 'All perks'}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {others.map((offer) => (
              <PerkCard key={offer.id} offer={offer} onOpenOffer={onOpenOffer} recommended={false} />
            ))}
          </div>
        </div>
      )}

      {partnerOffers.length === 0 && (
        <div className="rounded-4xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
          <p className="text-sm text-slate-500">No perks yet — partner rewards will appear here as they go live.</p>
        </div>
      )}
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
            <p className="mt-1 line-clamp-2 text-sm font-semibold">{topPost?.title || 'Fresh market signal'}</p>
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
  const ownPostCount = posts.filter((post) => post.authorId === profile.id || post.authorName === profile.name).length;
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
            [ownPostCount, 'Posts'],
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
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Whole-market Feed</h2>
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
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Your signals</h2>
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
      <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Reach rental intent</h2>
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
            <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-5xl font-semibold tracking-tight">{profile.score}</h2>
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
        <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">No mutual matches yet</h2>
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
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Match → Chat → Viewing → Review</h2>
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

function GlobalChatWidget({ matches, messages, profile, onSendMessage, routeTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id || '');
  const [messageBody, setMessageBody] = useState('');
  const [showConversationList, setShowConversationList] = useState(false);
  const currentUserId = profile.id || currentUser.id;

  const conversations = useMemo(() => matches.map((match) => {
    const sortedMessages = messages
      .filter((message) => message.matchId === match.id)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const otherParticipantIndex = Math.max(0, match.participantIds?.findIndex((id) => id !== currentUserId) ?? 1);
    const fallbackIndex = otherParticipantIndex >= 0 ? otherParticipantIndex : 1;
    const title = match.participantNames?.[fallbackIndex] || match.participantNames?.find((name) => name !== profile.name) || 'RentEazy contact';
    const type = match.participantTypes?.[fallbackIndex] || 'Member';
    const lastMessage = sortedMessages[sortedMessages.length - 1];
    const unreadCount = sortedMessages.filter((message) => message.authorId !== currentUserId).slice(-3).length;
    return {
      ...match,
      title,
      type,
      sortedMessages,
      lastMessage,
      unreadCount,
      latestAt: lastMessage?.createdAt || match.updatedAt || match.createdAt,
    };
  }).sort((a, b) => new Date(b.latestAt) - new Date(a.latestAt)), [currentUserId, matches, messages, profile.name]);

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedMatchId) || conversations[0];
  const totalUnread = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);

  useEffect(() => {
    if (!selectedMatchId && conversations[0]?.id) setSelectedMatchId(conversations[0].id);
  }, [conversations, selectedMatchId]);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const submitMessage = (event) => {
    event.preventDefault();
    const clean = messageBody.trim();
    if (!clean || !selectedConversation) return;
    onSendMessage(selectedConversation.id, clean);
    setMessageBody('');
  };

  const ConversationButton = ({ conversation, compact = false, rail = false }) => (
    <button
      type="button"
      onClick={() => {
        setSelectedMatchId(conversation.id);
        setShowConversationList(false);
      }}
      title={conversation.title}
      className={`relative flex w-full items-center gap-3 rounded-2xl text-left transition ${selectedConversation?.id === conversation.id ? 'bg-[#edf8ee] text-slate-950 ring-1 ring-[#c7e8ca]' : 'text-slate-600 hover:bg-slate-100'} ${rail ? 'justify-center p-2' : compact ? 'p-3' : 'p-2.5'}`}
    >
      <PeepAvatar seed={conversation.title} variant="bust" className={compact ? 'h-12 w-12' : 'h-10 w-10'} avatarBg={selectedConversation?.id === conversation.id ? 'mint' : 'sky'} ring="ring-1 ring-white" />
      {!rail && (
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">{conversation.title}</span>
          <span className="block truncate text-xs text-slate-500">{conversation.lastMessage?.body || conversation.subjectTitle}</span>
        </span>
      )}
      {conversation.unreadCount > 0 && <span className={`${rail ? 'absolute right-1 top-1' : ''} grid h-5 min-w-5 place-items-center rounded-full bg-[#2f7d32] px-1 text-[0.62rem] font-bold text-white`}>{Math.min(conversation.unreadCount, 9)}</span>}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none md:inset-auto">
      {!isOpen && (
        <button
          type="button"
          aria-label="Open messages"
          onClick={() => setIsOpen(true)}
          className={`pointer-events-auto fixed right-4 grid h-[3.75rem] w-[3.75rem] place-items-center rounded-full bg-[#092243] text-white shadow-[0_24px_56px_-26px_rgba(9,34,67,0.92)] ring-1 ring-white/35 transition hover:scale-105 active:scale-95 ${routeTab === 'Swipe' ? 'bottom-[13.75rem] md:bottom-5' : 'bottom-[5.9rem] md:bottom-5'}`}
        >
          <MessageCircle className="h-6 w-6" />
          {totalUnread > 0 && (
            <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-[#2f7d32] px-1.5 text-[0.68rem] font-bold text-white ring-2 ring-white">
              {Math.min(totalUnread, 9)}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <section className="pointer-events-auto fixed inset-0 flex flex-col overflow-hidden bg-white text-slate-950 md:inset-auto md:right-5 md:bottom-5 md:h-[500px] md:w-[500px] md:rounded-[1.8rem] md:border md:border-white/80 md:shadow-[0_34px_90px_-38px_rgba(15,23,42,0.78)] md:ring-1 md:ring-black/5">
          <div className="bg-[#092243] px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] text-white md:pt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white shadow-[0_10px_28px_-18px_rgba(0,0,0,0.7)]">
                  <img src="/images/renteazy-mark-2026-t.png" alt="RentEazy" className="h-7 w-auto object-contain" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{selectedConversation?.title || 'Messages'}</p>
                  <p className="truncate text-xs text-white/62">{selectedConversation ? `${selectedConversation.subjectTitle} · ${selectedConversation.score}% fit` : 'Open after a mutual match'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {conversations.length > 1 && (
                  <button type="button" onClick={() => setShowConversationList(true)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white md:hidden" aria-label="Show conversations">
                    <MessageCircle className="h-4 w-4" />
                  </button>
                )}
                <button type="button" onClick={() => setIsOpen(false)} aria-label="Close messages" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {!conversations.length ? (
            <div className="grid flex-1 place-items-center bg-[#f6f8fb] p-6">
              <div className="max-w-xs rounded-[1.45rem] bg-white p-6 text-center shadow-[0_18px_44px_-36px_rgba(15,23,42,0.58)]">
                <MessageCircle className="mx-auto h-9 w-9 text-[#2f7d32]" />
                <p className="mt-3 text-base font-bold text-slate-950">No conversations yet</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Like a suitable card. Messaging opens when interest is accepted on both sides.</p>
                <a href="/app/swipe" className="mt-4 inline-flex rounded-full bg-[#2f7d32] px-5 py-3 text-sm font-bold text-white">Open Swipe</a>
              </div>
            </div>
          ) : !selectedConversation ? null : (
            <div className="relative grid min-h-0 flex-1 md:grid-cols-[5.5rem_1fr]">
              <aside className="hidden min-h-0 border-r border-slate-100 bg-white p-2 md:block">
                <div className="mb-2 px-1 py-2 text-center">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-slate-400">Chats</p>
                </div>
                <div className="max-h-[398px] space-y-1 overflow-y-auto pr-1">
                  {conversations.map((conversation) => (
                    <ConversationButton key={conversation.id} conversation={conversation} rail />
                  ))}
                </div>
              </aside>

              {showConversationList && (
                <div className="absolute inset-0 z-20 bg-white p-4 md:hidden">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-lg font-bold text-slate-950">Messages</p>
                    <button type="button" onClick={() => setShowConversationList(false)} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700" aria-label="Close conversations">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {conversations.map((conversation) => <ConversationButton key={conversation.id} conversation={conversation} compact />)}
                  </div>
                </div>
              )}

              <div className="grid min-h-0 grid-rows-[1fr_auto] bg-[#f6f8fb]">
                <div className="min-h-0 overflow-y-auto px-4 py-4">
                  <div className="mb-4 flex items-center gap-3 rounded-[1.35rem] bg-white p-3 shadow-[0_12px_32px_-28px_rgba(15,23,42,0.5)] md:hidden">
                    <PeepAvatar seed={selectedConversation.title} variant="bust" className="h-12 w-12" avatarBg="mint" ring="ring-1 ring-[#d8efe0]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-950">{selectedConversation.title}</p>
                      <p className="truncate text-xs text-slate-500">{selectedConversation.type} · {selectedConversation.score}% fit</p>
                    </div>
                    <span className="rounded-full bg-[#edf8ee] px-3 py-1 text-[0.68rem] font-bold text-[#215d27]">{selectedConversation.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="space-y-3">
                    {selectedConversation.sortedMessages.map((message) => {
                      const mine = message.authorId === currentUserId;
                      return (
                        <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[82%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.5)] ${mine ? 'rounded-br-md bg-[#2f7d32] text-white' : 'rounded-bl-md bg-white text-slate-800'}`}>
                            <p>{message.body}</p>
                            <p className={`mt-1 text-[0.64rem] ${mine ? 'text-white/62' : 'text-slate-400'}`}>
                              {new Date(message.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={submitMessage} className="flex items-center gap-2 border-t border-slate-100 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-3">
                  <input
                    value={messageBody}
                    onChange={(event) => setMessageBody(event.target.value)}
                    placeholder="Write a message"
                    className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-hidden focus:border-[#2f7d32] focus:bg-white"
                  />
                  <button type="submit" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#2f7d32] text-white shadow-[0_14px_28px_-20px_rgba(47,125,50,0.86)]" aria-label="Send message">
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function TrustReputationPanel({ reports, comments, profile }) {
  const verifiedActions = comments.filter((comment) => comment.authorId === profile.id || comment.authorId === currentUser.id).length;

  return (
    <div className="rounded-3xl border border-white bg-white/86 p-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">REPUTATION</p>
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Trust is behavioural</h2>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#edf8ee] text-[#2f7d32] ring-1 ring-[#d5ecd7]"><ShieldCheck className="h-5 w-5" /></span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-2xl bg-[#edf8ee] p-3 ring-1 ring-[#d5ecd7]"><p className="text-xl font-semibold text-[#215d27]">{verifiedActions}</p><p className="mt-0.5 text-slate-500">Useful replies</p></div>
        <div className={`rounded-2xl p-3 ring-1 ${reports.length ? 'bg-[#fff1f0] ring-[#ffd6d2]' : 'bg-slate-50 ring-slate-100'}`}><p className={`text-xl font-semibold ${reports.length ? 'text-[#b42318]' : 'text-slate-950'}`}>{reports.length}</p><p className="mt-0.5 text-slate-500">Reports</p></div>
        <div className="rounded-2xl bg-[#edf7ff] p-3 ring-1 ring-[#cfe6ff]"><p className="text-xl font-semibold text-[#154f79]">0</p><p className="mt-0.5 text-slate-500">Verified feedback</p></div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">Paid visibility does not change trust, fit, referencing, approval, or reputation.</p>
    </div>
  );
}

const microProductIcons = {
  'Extra swipes': Flame,
  'Reveal likes': Heart,
  Superlikes: Star,
  Rewinds: RotateCcw,
  'Mini Boost': ArrowUp,
  'Post Boost': ArrowUp,
  Profile: BadgeCheck,
  'Business starter': Megaphone,
  Protect: ShieldCheck,
  Credits: Gift,
};

function MiniShopPanel({ onSelectProduct, compact = false }) {
  const products = compact ? microProducts.slice(0, 4) : microProducts;

  return (
    <div className="rounded-[1.75rem] border border-white bg-white/86 p-5 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.45),inset_0_1px_0_white]">
      <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">PERKS</p>
      <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Boosts and extras</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Small paid extras are clearly priced. Credits can keep low-cost actions simple and transparent.</p>
      <div className="mt-4 grid gap-2">
        {products.map((product) => {
          const Icon = microProductIcons[product.category] || Sparkles;
          return (
          <button key={product.id} type="button" onClick={() => onSelectProduct(product.id)} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-[#2f7d32] hover:bg-[#fbfdfb]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#edf8ee] text-[#2f7d32] ring-1 ring-[#d5ecd7] transition group-hover:bg-[#2f7d32] group-hover:text-white">
              <Icon className="h-[1.15rem] w-[1.15rem]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-950">{product.name}</span>
              <span className="block truncate text-xs text-slate-500">{product.description}</span>
            </span>
            <span className="shrink-0 rounded-full bg-[#edf8ee] px-3 py-1 text-xs font-semibold text-[#215d27] ring-1 ring-[#d5ecd7]">{product.price}</span>
          </button>
          );
        })}
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
        <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Sign in to manage plans.</h2>
          <p className="mt-2 text-sm leading-6">Plans, seats, paid extras, and billing are handled securely inside your RentEazy account.</p>
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

function SignupAction({ children, className = '' }) {
  if (clerkEnabled) {
    return (
      <SignUpButton mode="modal" fallbackRedirectUrl="/app/feed">
        <button type="button" className={className}>{children}</button>
      </SignUpButton>
    );
  }

  return <a href="/signup" className={className}>{children}</a>;
}

function PreviewSignupPrompt({ action = 'continue', onClose }) {
  const copyByAction = {
    like: ['Create a free account to like posts.', 'Likes tune your Feed and open the right match signals.'],
    save: ['Create a free account to save this.', 'Saved posts stay with your profile and improve recommendations.'],
    post: ['Create a free account to post.', 'Post what you need, what you have, or what you know.'],
    match: ['Create a free account to start matching.', 'Swipe cards, send interest, and open conversations after mutual fit.'],
    comment: ['Create a free account to reply.', 'Keep useful rental conversations attached to your profile.'],
    share: ['Create a free account to share from RentEazy.', 'Share links, track interest, and bring replies back into RentEazy.'],
    follow: ['Create a free account to follow people and groups.', 'Following makes the Feed more relevant.'],
    report: ['Create a free account to report this.', 'Reports are tied to accountable RentEazy profiles.'],
    group: ['Create a free account to join groups.', 'Groups keep area, role, and deal conversations attached to real profiles.'],
    billing: ['Create a free account to manage plans and perks.', 'Paid extras, credits, boosts, and Protect records belong inside your RentEazy account.'],
    invite: ['Create a free account to invite people.', 'Invite links and rewards need an account so they can be tracked properly.'],
    resident: ['Create a free account to use Resident Mode.', 'Maintenance, rent records, and viewing notes are saved to your own profile.'],
    profile: ['Create a free account to edit your profile.', 'Your role, avatar, answers, and reputation progress belong to your account.'],
    continue: ['Create a free account to continue.', 'The preview is open. Interaction starts after signup.'],
  };
  const [title, body] = copyByAction[action] || copyByAction.continue;

  return (
    <div className="fixed inset-0 z-[95] grid place-items-end bg-[#050506]/46 p-3 backdrop-blur-sm sm:place-items-center">
      <section className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-[0_34px_90px_-38px_rgba(15,23,42,0.78)]">
        <div className="bg-[#092243] px-5 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/48">RentEazy preview</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">{title}</h2>
            </div>
            <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white" aria-label="Close signup prompt">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm leading-6 text-slate-600">{body}</p>
          <div className="mt-5 grid gap-2">
            <SignupAction className="inline-flex w-full items-center justify-center rounded-full bg-[#2f7d32] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_34px_-24px_rgba(47,125,50,0.8)]">
              Create free account
            </SignupAction>
            <button type="button" onClick={onClose} className="inline-flex w-full items-center justify-center rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700">
              Keep previewing
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeedPreviewBanner({ onSignup }) {
  return (
    <section className="overflow-hidden rounded-[1.7rem] bg-[#092243] p-4 text-white shadow-[0_22px_58px_-38px_rgba(9,34,67,0.86)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/44">Preview mode</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight">Browse the Feed. Sign up to interact.</h2>
          <p className="mt-1 text-sm leading-6 text-white/62">Like, post, match, comment, save, and message after creating a free account.</p>
        </div>
        <button type="button" onClick={onSignup} className="shrink-0 rounded-full bg-[#8bdc65] px-5 py-3 text-sm font-bold text-[#092243]">Create account</button>
      </div>
    </section>
  );
}

function PreviewRouteGate({ action = 'continue', title, body }) {
  const highlightsByAction = {
    post: [
      ['Media-ready', 'Add photos or videos to listings, rooms, stays, deals, and updates.'],
      ['Share Everywhere', 'Generate a caption, tracking link, copy action, and share reward.'],
      ['Real traction', 'See views, likes, saves, comments, shares, and labelled boosts.'],
    ],
    continue: [
      ['Free preview', 'Browse the Feed and Swipe before creating an account.'],
      ['Account actions', 'Like, save, post, match, message, and report after signup.'],
      ['No fake stats', 'Your own profile and activity starts when you create an account.'],
    ],
  };
  const highlights = highlightsByAction[action] || highlightsByAction.continue;

  return (
    <div className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-xl content-center gap-4 px-4 py-8">
      <section className="overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.62)] ring-1 ring-white">
        <div className="bg-linear-to-br from-[#092243] via-[#0d2e57] to-[#06182f] p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/46">RentEazy preview</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
          <div className="mt-5 rounded-[1.35rem] bg-white/10 p-3 ring-1 ring-white/12">
            <div className="rounded-[1rem] bg-white p-3 text-[#092243]">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#2f7d32]">Post to Feed</p>
              <p className="mt-1 text-sm font-semibold">Listings, questions, rooms, deals, stays, and updates</p>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[0.68rem] font-bold text-white/76">
              <span className="rounded-full bg-white/10 py-2">Photos</span>
              <span className="rounded-full bg-white/10 py-2">Videos</span>
              <span className="rounded-full bg-white/10 py-2">Share</span>
            </div>
          </div>
        </div>
        <div className="p-6 pt-5">
          <p className="text-sm leading-7 text-slate-600">{body}</p>
          <SignupAction className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#2f7d32] px-5 py-3 text-sm font-bold text-white">
            Create free account
          </SignupAction>
          <a href="/app/feed" className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700">
            Back to preview Feed
          </a>
          <div className="mt-5 space-y-2">
            {highlights.map(([label, text]) => (
              <div key={label} className="rounded-[1.15rem] bg-[#f3f7f4] p-3 ring-1 ring-[#d5ecd7]">
                <p className="text-sm font-bold text-[#092243]">{label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function buildContextualOffers({ routeTab, activeFeedTab, remainingSwipes, newPost, profile, answers, posts, likedIds, savedIds, shares, boosts, matches }) {
  const strength = calculateProfileStrength(profile, answers);
  const ownPosts = posts.filter((post) => post.authorId === currentUser.id || post.authorName === profile.name || post.authorName === currentUser.name);
  const warmPost = ownPosts.find((post) => Number(post.likeCount || 0) + Number(post.saveCount || 0) + Number(post.shareCount || 0) + Number(post.commentCount || 0) > 0);
  const businessRoles = ['Landlord', 'Individual Agent', 'Agency / Business', 'Short-Term Host', 'Operator', 'Sourcer', 'Investor'];
  const cards = [];

  if (routeTab === 'Swipe' && remainingSwipes <= 3) {
    cards.push({
      id: 'extra-swipes-10',
      priority: remainingSwipes === 0 ? 100 : 70,
      eyebrow: remainingSwipes === 0 ? 'Swipe run ended' : 'Almost out',
      title: remainingSwipes === 0 ? 'Keep this swipe run going.' : `${remainingSwipes} swipes left.`,
      body: 'Add 10 more swipes for today without unlocking a full plan.',
      trigger: 'Shown when the free daily swipe allowance is low.',
      cta: 'Get 10 for 9p',
      icon: Flame,
      tone: 'navy',
    });
  }

  if (routeTab === 'Swipe' && remainingSwipes > 0 && remainingSwipes <= 8) {
    cards.push({
      id: 'superlike-1',
      priority: 48,
      eyebrow: 'Strong fit moment',
      title: 'Found a card that matters?',
      body: 'Use one Superlike when you want to be shown sooner to a suitable match.',
      trigger: 'Shown only inside the swipe deck.',
      cta: 'Superlike for 19p',
      icon: Sparkles,
      tone: 'green',
    });
  }

  // The just-posted boost+share moment is owned by the FeedScreen banner at the
  // top of the feed (the right position, immediately after returning from the
  // composer). We deliberately do NOT also emit a high-priority post-bump card
  // here: `newPost` is sticky for the whole session, so a card keyed on it would
  // duplicate that banner and dominate the Feed slot for every later visit.

  // Post-traction card: a DIFFERENT, later moment — an older post of yours has
  // picked up real activity, so a bump can reach more suitable people. Guard it
  // off the freshly-created post (banner's job) rather than off `newPost`, which
  // never clears and would kill this card for the rest of the session.
  if (warmPost && warmPost.id !== newPost?.id && routeTab === 'Feed' && activeFeedTab !== 'Perks' && activeFeedTab !== 'Groups') {
    cards.push({
      id: 'post-bump-small',
      priority: 54,
      eyebrow: 'Post traction',
      title: 'Your post is getting activity.',
      body: 'A small labelled bump reaches more suitable people while the signal is still fresh.',
      trigger: 'Shown when one of your earlier posts has real engagement.',
      cta: 'Boost from 29p',
      icon: Megaphone,
      tone: 'blue',
    });
  }

  if (routeTab === 'Likes' && (matches.length || likedIds.length || savedIds.length)) {
    cards.push({
      id: 'reveal-like-1',
      priority: 78,
      eyebrow: 'Real interest',
      title: 'Check one like without buying a plan.',
      body: 'Reveal one real like when likes exist, or keep building your shortlist for free.',
      trigger: 'Shown on Likes when there is saved, liked, or matched activity.',
      cta: 'Reveal one for 9p',
      icon: Heart,
      tone: 'navy',
    });
  }

  if (routeTab === 'Profile' && strength.score < 72) {
    cards.push({
      id: 'profile-polish',
      priority: routeTab === 'Profile' ? 82 : 38,
      eyebrow: 'Profile gap',
      title: 'Make your profile easier to match.',
      body: 'Polish wording and match clarity once you have filled the basics.',
      trigger: 'Shown when profile strength is below 72%.',
      cta: 'Polish for 49p',
      icon: UserRound,
      tone: 'blue',
      freeAlternative: 'Answer 3 quick questions first',
    });
  }

  // Match-milestone moment: once a mutual match exists, the logical next offer
  // is keeping the match + viewing trail. Fills the
  // Profile/Likes slot that otherwise sits empty for an active member.
  if (['Profile', 'Likes'].includes(routeTab) && matches.length > 0) {
    cards.push({
      id: 'protect-basic',
      priority: routeTab === 'Likes' ? 64 : 68,
      eyebrow: matches.length > 1 ? `${matches.length} matches` : 'You have a match',
      title: 'Keep your match and viewing trail.',
      body: 'Protect Basic saves your match, message, and viewing records so your reputation has receipts later.',
      trigger: 'Shown once you have at least one mutual match.',
      cta: 'Protect for 99p/mo',
      icon: ShieldCheck,
      tone: 'navy',
      freeAlternative: 'Records stay visible in-app for free',
    });
  }

  if (routeTab === 'Feed' && businessRoles.includes(profile.role) && ['Agents', 'Landlords', 'Operators', 'Sourcers', 'Investors', 'For You'].includes(activeFeedTab)) {
    cards.push({
      id: 'sponsored-post-starter',
      priority: 42,
      eyebrow: 'Business reach',
      title: 'Test a labelled sponsored post.',
      body: 'Useful for listings, offers, services, or deal posts aimed at rental-market intent.',
      trigger: 'Shown to business roles in relevant Feed tabs.',
      cta: 'Starter for 99p',
      icon: BadgeCheck,
      tone: 'green',
    });
  }

  if (routeTab === 'Feed' && shares.length > 0 && !boosts.length) {
    cards.push({
      id: 'extra-swipes-10',
      priority: 35,
      eyebrow: 'Share reward',
      title: 'You are creating reach.',
      body: 'Keep exploring after sharing with a small swipe top-up.',
      trigger: 'Shown after real share intent is recorded.',
      cta: '+10 swipes for 9p',
      icon: Share2,
      tone: 'blue',
    });
  }

  return cards.sort((a, b) => b.priority - a.priority);
}

function GenOfferCard({ card, onSelectProduct, onDismiss, onSharePost, newPost, compact = false }) {
  if (!card) return null;
  const product = microProducts.find((item) => item.id === card.id);
  const Icon = card.icon || Sparkles;
  const tone = {
    navy: {
      wrap: 'bg-[#092243] text-white ring-white/10',
      icon: 'bg-white text-[#092243]',
      chip: 'bg-white/12 text-white/68 ring-white/12',
      cta: 'bg-white text-[#092243]',
      ghost: 'bg-white/10 text-white ring-white/12',
    },
    green: {
      wrap: 'bg-[#edf8ee] text-[#123d22] ring-[#d5ecd7]',
      icon: 'bg-[#2f7d32] text-white',
      chip: 'bg-white/70 text-[#215d27] ring-[#d5ecd7]',
      cta: 'bg-[#2f7d32] text-white',
      ghost: 'bg-white text-[#215d27] ring-[#d5ecd7]',
    },
    blue: {
      wrap: 'bg-[#edf7ff] text-[#092243] ring-[#cfe9fb]',
      icon: 'bg-[#2670a8] text-white',
      chip: 'bg-white/80 text-[#154f79] ring-[#cfe9fb]',
      cta: 'bg-[#092243] text-white',
      ghost: 'bg-white text-[#154f79] ring-[#cfe9fb]',
    },
  }[card.tone || 'blue'];

  return (
    <section className={`overflow-hidden rounded-[1.55rem] p-4 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.55)] ring-1 ${tone.wrap}`}>
      <div className="flex items-start gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[1.05rem] ${tone.icon}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] ring-1 ${tone.chip}`}>{card.eyebrow}</p>
              <h2 className={`${compact ? 'mt-2 text-lg' : 'mt-3 text-xl'} font-['Bricolage_Grotesque_Variable',Inter,sans-serif] font-semibold leading-tight tracking-tight`}>{card.title}</h2>
            </div>
            <button type="button" onClick={() => onDismiss(card.id)} className={`shrink-0 rounded-full px-2.5 py-1 text-xs ring-1 ${tone.ghost}`}>Not now</button>
          </div>
          <p className="mt-2 text-sm leading-6 opacity-75">{card.body}</p>
          <p className="mt-2 text-xs leading-5 opacity-58">{card.trigger}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => onSelectProduct(card.id)} className={`rounded-full px-4 py-2 text-sm font-semibold ${tone.cta}`}>
              {card.cta || product?.price || 'Open'}
            </button>
            {card.secondaryAction === 'share' && newPost && (
              <button type="button" onClick={() => onSharePost(newPost)} className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ${tone.ghost}`}>Share Everywhere</button>
            )}
            {card.freeAlternative && <span className={`inline-flex items-center rounded-full px-3 py-2 text-xs ring-1 ${tone.chip}`}>{card.freeAlternative}</span>}
          </div>
        </div>
      </div>
    </section>
  );
}

function BillingPanel({ onSelectProduct, purchases, boosts, wallet }) {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2rem] bg-[#092243] p-6 text-white shadow-[0_28px_70px_-46px_rgba(9,34,67,0.95)]">
        <p className="font-['JetBrains_Mono',monospace] text-xs text-[#8fd0ff]">BILLING</p>
        <h1 className="mt-3 max-w-full break-words font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-[2rem] font-normal leading-[1.04] tracking-tight sm:text-4xl">Plans, boosts, credits, and Protect.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">Start free, keep useful activity flowing, and upgrade only when you want less friction or labelled business reach. Paid visibility never replaces suitability or trust.</p>
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
          <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">Billing is ready to connect.</h2>
          <p className="mt-2 text-sm leading-6">Connect billing products before taking live payments. Until then, this screen only previews the offer flow.</p>
        </div>
      )}
      <MiniShopPanel onSelectProduct={onSelectProduct} />
    </div>
  );
}

function MicroOfferModal({ product, onClose, onConfirm, billingEnabled = false }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-90 flex items-end justify-center bg-[#06182f]/58 p-4 backdrop-blur-xs sm:items-center">
      <div className="w-full max-w-md rounded-4xl border border-white bg-white p-5 shadow-[0_30px_90px_-45px_rgba(0,0,0,0.65)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">{product.category.toUpperCase()}</p>
            <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-3xl font-normal tracking-tight text-slate-950">{product.name}</h2>
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
          <button type="button" onClick={() => onConfirm(product)} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#2f7d32] px-5 py-3 text-sm text-white">Add to account</button>
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
      <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">{activeBoosts.length} active</h2>
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
      <h2 className="mt-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal tracking-tight text-slate-950">{reports.length} reports</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Reports are queued for review. Sponsored posts use the same report flow.</p>
    </div>
  );
}

function isVideoMedia(src = '') {
  return /\.(mp4|webm|mov)$/i.test(String(src).split('?')[0]);
}

function getVideoPreviewImage(post) {
  const pool = feedImagePoolsByPostType[post?.postType] || feedImagePool;
  const seed = stableHash(`${post?.id || ''}-${post?.area || ''}-video-preview`);
  return pool[Math.abs(seed) % pool.length] || feedImagePool[0];
}

function FeedMediaAsset({ src, className = '', alt = '', mode = 'preview' }) {
  if (!src) return null;
  if (isVideoMedia(src)) {
    const shouldAutoplay = mode === 'motion';
    return (
      <video
        src={src}
        className={className}
        muted
        loop={shouldAutoplay}
        autoPlay={shouldAutoplay}
        playsInline
        preload="metadata"
        disablePictureInPicture
        aria-label={alt || 'Feed video'}
      />
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" />;
}

function FeedTimelineCard({ post, ranking, card, liked, saved, followed, commentCount, onOpen, onLike, onSave, onFollow, onShare, onComment, onReport }) {
  const schema = card || createFeedCardSchema(post, ranking, 0);
  const image = schema.heroImage;
  const isVideo = isVideoMedia(image);
  const previewImage = isVideo ? getVideoPreviewImage(post) : image;
  const rank = ranking || { score: 50, reasons: ['Fresh'] };

  const stop = (handler) => (event) => {
    event.stopPropagation();
    handler?.();
  };

  return (
    <article
      data-feed-card={post.id}
      onClick={onOpen}
      className="group overflow-hidden rounded-[2.1rem] bg-white shadow-[0_24px_70px_-52px_rgba(15,23,42,0.62)] ring-1 ring-white transition active:scale-[0.99]"
    >
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <PeepAvatar seed={`${post.authorId}-${post.authorName}-${post.authorType}`} className="h-12 w-12" ring="ring-1 ring-slate-200" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-slate-950">{post.authorName}</p>
              {['Agent', 'Landlord', 'Operator', 'Sourcer', 'Investor'].includes(post.authorType) && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#2670a8]" />}
            </div>
            <p className="truncate text-xs font-medium text-slate-400">{post.authorType} · {post.area} · 2 hrs ago</p>
          </div>
        </div>
        <button type="button" onClick={stop(() => onFollow(post.authorId))} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${followed ? 'bg-[#092243] text-white' : 'bg-[#f2f5f7] text-slate-600'}`} aria-label={followed ? 'Following' : 'Follow'}>
          <UserPlus className="h-4 w-4" />
        </button>
      </div>

      {previewImage && (
        <div className="relative mx-4 overflow-hidden rounded-[2rem] bg-slate-200">
          <FeedMediaAsset src={previewImage} alt="" className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.018]" />
          {isVideo && (
            <div className="absolute left-4 top-4 rounded-full bg-black/42 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-md">
              Video
            </div>
          )}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
            <span className="rounded-full bg-white/88 px-3 py-1.5 text-xs font-semibold text-[#092243] shadow-[0_12px_30px_-22px_rgba(15,23,42,0.7)] backdrop-blur-md">{schema.matchPercent || rank.score}% fit</span>
            {post.sponsoredStatus && <span className="rounded-full bg-[#fff7ed]/95 px-3 py-1.5 text-xs font-semibold text-[#9a3412]">{post.sponsoredStatus}</span>}
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/74 via-black/18 to-transparent p-4 pt-20">
            <h2 className="line-clamp-2 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-2xl font-normal leading-tight tracking-tight text-white">{post.title}</h2>
            <p className="mt-1 line-clamp-1 text-sm font-medium text-white/80">{schema.price || post.budget || post.area} · {post.postType}</p>
            <button type="button" onClick={stop(() => onOpen?.())} className="mt-3 rounded-full bg-white/16 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-md">View post</button>
          </div>
          <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-[#05070b]/88 p-1.5 text-white shadow-[0_18px_44px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10 backdrop-blur-xl">
            <button type="button" onClick={stop(() => onLike(post.id, post))} className={`grid h-10 w-10 place-items-center rounded-full ${liked ? 'bg-[#ff3366] text-white' : 'text-white/90 hover:bg-white/12'}`} aria-label="Like"><Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} /></button>
            <button type="button" onClick={stop(() => onComment(post))} className="grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/12" aria-label="Comment"><MessageCircle className="h-5 w-5" /></button>
            <button type="button" onClick={stop(() => onSave(post.id, post))} className={`grid h-10 w-10 place-items-center rounded-full ${saved ? 'bg-[#8bdc65] text-[#092243]' : 'text-white/90 hover:bg-white/12'}`} aria-label="Save"><Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} /></button>
          </div>
        </div>
      )}

      <div className="px-4 pb-4 pt-3">
        <p className="line-clamp-2 text-sm leading-6 text-slate-600">{post.body}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <span>{post.likeCount + (liked ? 1 : 0)} likes</span>
            <span>{commentCount} comments</span>
            <span>{post.saveCount + (saved ? 1 : 0)} saves</span>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={stop(() => onShare(post))} className="grid h-9 w-9 place-items-center rounded-full bg-[#f2f5f7] text-slate-600" aria-label="Share"><Share2 className="h-4 w-4" /></button>
            <button type="button" onClick={stop(() => onReport(post))} className="grid h-9 w-9 place-items-center rounded-full bg-[#f2f5f7] text-slate-400" aria-label="Report"><Flag className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(rank.reasons || ['Fresh rental signal']).slice(0, 2).map((reason) => <span key={reason} className="rounded-full bg-[#edf8ee] px-3 py-1 text-xs font-semibold text-[#215d27]">{reason}</span>)}
          <span className="rounded-full bg-[#edf7ff] px-3 py-1 text-xs font-semibold text-[#154f79]">{post.area}</span>
        </div>
      </div>
    </article>
  );
}

function FeedPostCard({ post, ranking, card, streamId, liked, saved, followed, commentCount, onLike, onSave, onFollow, onShare, onComment, onBoost, onHide, onReport, onExplain, onPass, onMatch, onSignal }) {
  const schema = card || createFeedCardSchema(post, ranking, 0);
  const image = schema.heroImage;
  const [showWhy, setShowWhy] = useState(false);
  const rank = ranking || { score: 50, objective: 'Discovery', reasons: ['Fresh'], negativeSignals: [] };
  const rootRef = useRef(null);
  const visibleSinceRef = useRef(0);
  const mountedAtRef = useRef(Date.now());

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
        visibleSinceRef.current = Date.now();
        onSignal?.('impression', post, { streamId, sequence: rank.sequence, ratio: entry.intersectionRatio });
      } else if (visibleSinceRef.current) {
        const dwellMs = Date.now() - visibleSinceRef.current;
        visibleSinceRef.current = 0;
        if (dwellMs > 250) onSignal?.('dwell', post, { streamId, dwellMs });
      }
    }, { threshold: [0, 0.55, 0.9] });
    observer.observe(node);
    return () => {
      if (visibleSinceRef.current) {
        const dwellMs = Date.now() - visibleSinceRef.current;
        if (dwellMs > 250) onSignal?.('dwell', post, { streamId, dwellMs });
      }
      observer.disconnect();
    };
  }, [onSignal, post, rank.sequence, streamId]);

  const actionSpeedMs = () => Date.now() - mountedAtRef.current;
  const adaptiveFacts = {
    price: schema.price,
    location: schema.area,
    match: schema.matchPercent >= 72 ? 'Strong fit' : 'For you',
    trust: schema.trustSignal.replace(' source', ''),
  };

  return (
    <article ref={rootRef} data-feed-card={post.id} className="relative h-[100dvh] snap-start overflow-hidden bg-slate-950 text-white">
      {image && <FeedMediaAsset src={image} alt="" mode="motion" className="absolute inset-0 h-full w-full object-cover" />}
      <div className="absolute inset-0 bg-linear-to-t from-black/88 via-black/18 to-black/42" />

      <div className="absolute right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3">
        <button type="button" aria-label="Like" onClick={() => onLike(post.id, post)} className={`grid h-12 w-12 place-items-center rounded-full backdrop-blur-md ring-1 ring-white/18 ${liked ? 'bg-[#edf8ee] text-[#2f7d32]' : 'bg-black/34 text-white'}`}><Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} /></button>
        <span className="text-[0.68rem] font-semibold text-white/80">{post.likeCount + (liked ? 1 : 0)}</span>
        <button type="button" aria-label="Comment" onClick={() => onComment(post)} className="grid h-12 w-12 place-items-center rounded-full bg-black/34 text-white ring-1 ring-white/18 backdrop-blur-md"><MessageCircle className="h-5 w-5" /></button>
        <span className="text-[0.68rem] font-semibold text-white/80">{commentCount}</span>
        <button type="button" aria-label="Save" onClick={() => onSave(post.id, post)} className={`grid h-12 w-12 place-items-center rounded-full backdrop-blur-md ring-1 ring-white/18 ${saved ? 'bg-[#edf7ff] text-[#154f79]' : 'bg-black/34 text-white'}`}><Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} /></button>
        <button type="button" aria-label="Share" onClick={() => onShare(post)} className="grid h-12 w-12 place-items-center rounded-full bg-black/34 text-white ring-1 ring-white/18 backdrop-blur-md"><Share2 className="h-5 w-5" /></button>
        <button type="button" aria-label="Report post" onClick={() => onReport(post)} className="grid h-10 w-10 place-items-center rounded-full bg-black/28 text-white/78 ring-1 ring-white/14 backdrop-blur-md"><Flag className="h-4 w-4" /></button>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-4 pb-28 pr-20">
        <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <PeepAvatar seed={`${post.authorId}-${post.authorName}-${post.authorType}`} className="h-10 w-10" ring="ring-2 ring-white/60" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-semibold">{post.authorName}</p>
                {['Agent', 'Landlord', 'Operator', 'Sourcer', 'Investor'].includes(post.authorType) && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#8fd0ff]" />}
              </div>
              <p className="truncate text-xs text-white/70">{post.authorType} · {post.area} · {post.postType}</p>
            </div>
          </div>
          <button type="button" onClick={() => onFollow(post.authorId)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-md ${followed ? 'bg-[#edf8ee] text-[#215d27]' : 'bg-white/18 text-white ring-1 ring-white/18'}`}>{followed ? 'Following' : 'Follow'}</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(schema.fieldOrder || ['price', 'location', 'match', 'trust']).slice(0, 3).map((field) => (
            <span key={field} className="rounded-full bg-white/16 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/14 backdrop-blur-md">{adaptiveFacts[field]}</span>
          ))}
          {post.sponsoredStatus && <span className="rounded-full bg-[#fff7ed]/95 px-3 py-1.5 text-xs font-semibold text-[#9a3412]">{post.sponsoredStatus}</span>}
        </div>
        <h2 className="mt-3 text-[1.6rem] font-semibold leading-tight tracking-tight">{post.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/82">{post.body}</p>
        <div className="mt-3 flex items-center gap-2">
          <button type="button" data-feed-action="interested" onClick={() => onMatch?.(post, actionSpeedMs())} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#092243] active:scale-[0.98]">{schema.ctaText || 'I’m interested'}</button>
          <button type="button" onClick={() => {
            const next = !showWhy;
            setShowWhy(next);
            if (next) {
              onSignal?.('expand', post, { streamId, objective: rank.objective, score: rank.score });
              onExplain?.(post, rank);
            }
          }} className="rounded-full bg-black/30 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/16 backdrop-blur-md">{showWhy ? 'Hide' : 'Why this'}</button>
        </div>
        {showWhy && (
          <div className="mt-3 rounded-2xl bg-black/34 p-3 ring-1 ring-white/14 backdrop-blur-md">
            <p className="text-xs leading-5 text-white/78">{schema.whyThisForYou}</p>
          </div>
        )}
      </div>
    </article>
  );
}

function FeedImmersiveViewer({ items, initialIndex, likedIds, savedIds, followedIds, comments, onClose, onLike, onSave, onFollow, onShare, onComment, onBoost, onHide, onReport, onExplain, onPass, onMatch, onSignal }) {
  const scrollerRef = useRef(null);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    requestAnimationFrame(() => {
      node.scrollTop = Math.max(0, initialIndex) * window.innerHeight;
    });
  }, [initialIndex]);

  if (initialIndex == null || initialIndex < 0) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 mx-auto max-w-[480px] px-3 pt-3">
        <div className="pointer-events-auto flex items-center justify-between">
          <button type="button" onClick={onClose} className="rounded-full bg-black/38 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/14 backdrop-blur-md">
            Close
          </button>
          <span className="rounded-full bg-black/32 px-3 py-2 text-xs font-semibold text-white/80 ring-1 ring-white/12 backdrop-blur-md">Scroll posts</span>
        </div>
      </div>
      <div ref={scrollerRef} className="mx-auto h-[100dvh] max-w-[480px] snap-y snap-mandatory overflow-y-auto overscroll-contain scroll-smooth bg-black">
        {items.map((item) => {
          const post = item.post;
          return (
            <FeedPostCard
              key={item.streamId}
              post={post}
              ranking={{ ...item.ranking, sequence: item.sequence, rewardSpike: item.rewardSpike }}
              card={item.card}
              streamId={item.streamId}
              liked={likedIds.includes(post.id)}
              saved={savedIds.includes(post.id)}
              followed={followedIds.includes(post.authorId)}
              commentCount={post.commentCount + comments.filter((comment) => comment.postId === post.id).length}
              onLike={onLike}
              onSave={onSave}
              onFollow={onFollow}
              onShare={onShare}
              onComment={onComment}
              onBoost={onBoost}
              onHide={onHide}
              onReport={onReport}
              onExplain={onExplain}
              onPass={onPass}
              onMatch={onMatch}
              onSignal={onSignal}
            />
          );
        })}
      </div>
    </div>
  );
}

function SupportDisclosure({ title, subtitle, children, defaultOpen = false }) {
  return (
    <details open={defaultOpen} className="group overflow-hidden rounded-[1.55rem] bg-white shadow-[0_18px_44px_-36px_rgba(15,23,42,0.58)] ring-1 ring-black/5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
        <span className="min-w-0">
          <span className="block text-sm font-bold text-[#050506]">{title}</span>
          {subtitle && <span className="mt-0.5 block truncate text-xs font-medium text-slate-400">{subtitle}</span>}
        </span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f4f7f8] text-[#050506] transition group-open:rotate-180">
          <ArrowUp className="h-4 w-4" />
        </span>
      </summary>
      <div className="border-t border-slate-100 p-3">
        {children}
      </div>
    </details>
  );
}

function AppSupportSidebar({
  routeTab,
  wallet,
  purchases,
  boosts,
  reports,
  shares,
  posts,
  savedIds,
  comments,
  entitlements,
  appStreak,
  usageLimit,
  profile,
  answers,
  notifications,
  markNotificationRead,
  activeRecommendationInsights,
  openRecommendedOffer,
  referrals,
  createReferral,
  residentProfiles,
  maintenanceRequests,
  rentRecords,
  logMaintenanceRequest,
  logRentRecord,
  landlordProperties,
  addLandlordProperty,
  tenantDemandSignals,
  marketIntroductions,
  shortlistTenantDemand,
  professionalProfiles,
  groups,
  dealWatchlist,
  watchDeal,
  updateDealStatus,
  operatorPortfolioSignals,
  addOperatorSignal,
  activeFeedTab,
  setActiveFeedTab,
  likedIds,
  feedAds,
  openOffer,
}) {
  const ownPostCount = posts.filter((post) => post.authorId === profile.id || post.authorName === profile.name).length;
  return (
    <aside className="sticky top-5 hidden max-h-[calc(100vh-2.5rem)] space-y-3 overflow-y-auto pr-1 lg:block [scrollbar-width:none]">
      <div className="rounded-[1.75rem] bg-[#092243] p-5 text-white shadow-[0_26px_70px_-48px_rgba(9,34,67,0.82)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-white/38">{routeTab}</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Your day</h2>
          </div>
          <span className="rounded-full bg-[#8bdc65] px-3 py-1.5 text-xs font-bold text-[#092243]">{wallet.balance} credits</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {[
            [ownPostCount, 'Posts'],
            [shares.length, 'Shares'],
            [savedIds.length, 'Saves'],
            [reports.length, 'Reports'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-[1.2rem] bg-white/10 p-3">
              <p className="text-2xl font-bold">{value}</p>
              <p className="mt-0.5 text-xs font-medium text-white/45">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <DailySwipePanel usageLimit={usageLimit} onBuyMore={openOffer} />
      <ProfileStrengthCard profile={profile} answers={answers} />

      <SupportDisclosure title="Notifications" subtitle={`${notifications.filter((item) => !item.read).length} unread`} defaultOpen>
        <UsefulNotificationsPanel notifications={notifications} onMarkRead={markNotificationRead} />
      </SupportDisclosure>

      <SupportDisclosure title="For you" subtitle="Perks and next steps">
        <RecommendationLoopPanel insights={activeRecommendationInsights} onOpenOffer={openRecommendedOffer} />
      </SupportDisclosure>

      <SupportDisclosure title="Growth" subtitle="Invites and community loops">
        <ReferralLoopPanel profile={profile} referrals={referrals} onCreateReferral={createReferral} />
        <div className="mt-3">
          <RoleLanesPanel profile={profile} onSelectTab={setActiveFeedTab} />
        </div>
      </SupportDisclosure>

      <SupportDisclosure title="Resident Records" subtitle="Maintenance and rent history">
        <ResidentModePanel residentProfiles={residentProfiles} maintenanceRequests={maintenanceRequests} rentRecords={rentRecords} onLogMaintenance={logMaintenanceRequest} onLogRent={logRentRecord} />
      </SupportDisclosure>

      <SupportDisclosure title="Business Tools" subtitle="Landlords, operators, sourcers, investors">
        <LandlordModePanel properties={landlordProperties} posts={posts} onAddProperty={addLandlordProperty} />
        <div className="mt-3">
          <TenantDemandPipelinePanel signals={tenantDemandSignals} properties={landlordProperties} introductions={marketIntroductions} onShortlist={shortlistTenantDemand} />
        </div>
        <div className="mt-3">
          <ProfessionalModePanel profile={profile} professionalProfiles={professionalProfiles} posts={posts} groups={groups} />
        </div>
        <div className="mt-3">
          <DealTrackingPanel posts={posts} watchlist={dealWatchlist} onWatchDeal={watchDeal} onUpdateDealStatus={updateDealStatus} />
        </div>
        <div className="mt-3">
          <OperatorSignalsPanel signals={operatorPortfolioSignals} onAddSignal={addOperatorSignal} />
        </div>
      </SupportDisclosure>

      <SupportDisclosure title="Boosts and Perks" subtitle="Paid reach, clear labels">
        <TractionPanel posts={posts} likedIds={likedIds} savedIds={savedIds} shares={shares} comments={comments} onBoost={openOffer} />
        <div className="mt-3">
          <BoostPerformanceCard boosts={boosts} onBoost={openOffer} />
        </div>
        <div className="mt-3">
          <AdsInventoryPanel onBoost={openOffer} />
        </div>
        <div className="mt-3">
          <MiniShopPanel onSelectProduct={openOffer} compact />
        </div>
      </SupportDisclosure>

      <SupportDisclosure title="Safety" subtitle="Reports and trust">
        <ModerationQueueCard reports={reports} />
        <div className="mt-3">
          <TrustReputationPanel reports={reports} comments={comments} profile={profile} />
        </div>
      </SupportDisclosure>

      <div className="rounded-[1.55rem] bg-white p-4 text-sm font-medium text-slate-500 shadow-[0_18px_44px_-36px_rgba(15,23,42,0.58)] ring-1 ring-black/5">
        {purchases.length} purchases · {appStreak.count} day streak · {feedAds.length} labelled offers · {activeFeedTab} active
      </div>
    </aside>
  );
}

/*
 * END CLAUDE-OWNED APP UI BLOCK.
 * Stateful container and app wiring below remain Codex-owned.
 */
function RentEazyAppContainer({ isPreviewVisitor = false }) {
  const path = typeof window === 'undefined' ? '/app/feed' : window.location.pathname;
  const routeTab = path.includes('/billing') ? 'Billing' : path.includes('/perks') ? 'Perks' : path.includes('/post') ? 'Post' : path.includes('/likes') ? 'Likes' : path.includes('/profile') ? 'Profile' : path.includes('/swipe') ? 'Swipe' : 'Feed';
  const [activeFeedTab, setActiveFeedTab] = useStoredState('renteazy-feed-tab', 'For You');
  const [posts, setPosts] = useStoredState('renteazy-feed-posts', allSeededFeedPosts);
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
  const [feedRankings, setFeedRankings] = useStoredState('renteazy-feed-rankings', []);
  const [recommendationInsights, setRecommendationInsights] = useStoredState('renteazy-recommendation-insights', null);
  const [behavioralEvents, setBehavioralEvents] = useStoredState('renteazy-behavioral-events', []);
  const [feedSignals, setFeedSignals] = useStoredState('renteazy-feed-signals', []);
  const [hiddenAdIds, setHiddenAdIds] = useStoredState('renteazy-hidden-ads', []);
  const [matches, setMatches] = useStoredState('renteazy-matches', seededMatches);
  const [matchMessages, setMatchMessages] = useStoredState('renteazy-match-messages', seededMatchMessages);
  const [viewings, setViewings] = useStoredState('renteazy-viewings', seededViewings);
  const [reviews, setReviews] = useStoredState('renteazy-reviews', []);
  const [reputationProfile, setReputationProfile] = useStoredState('renteazy-reputation-profile', defaultReputationProfile);
  const [lifecycleTasks, setLifecycleTasks] = useStoredState('renteazy-lifecycle-tasks', seededLifecycleTasks);
  const [referrals, setReferrals] = useStoredState('renteazy-referrals', seededReferrals);
  const [residentProfiles, setResidentProfiles] = useStoredState('renteazy-resident-profiles', seededResidentProfiles);
  const [maintenanceRequests, setMaintenanceRequests] = useStoredState('renteazy-maintenance-requests', seededMaintenanceRequests);
  const [rentRecords, setRentRecords] = useStoredState('renteazy-rent-records', seededRentRecords);
  const [landlordProperties, setLandlordProperties] = useStoredState('renteazy-landlord-properties', seededLandlordProperties);
  const [professionalProfiles, setProfessionalProfiles] = useStoredState('renteazy-professional-profiles', seededProfessionalProfiles);
  const [tenantDemandSignals, setTenantDemandSignals] = useStoredState('renteazy-tenant-demand-signals', seededTenantDemandSignals);
  const [dealWatchlist, setDealWatchlist] = useStoredState('renteazy-deal-watchlist', seededDealWatchlist);
  const [operatorPortfolioSignals, setOperatorPortfolioSignals] = useStoredState('renteazy-operator-portfolio-signals', seededOperatorPortfolioSignals);
  const [marketIntroductions, setMarketIntroductions] = useStoredState('renteazy-market-introductions', seededMarketIntroductions);
  const [notifications, setNotifications] = useStoredState('renteazy-notifications', seededNotifications);
  const [openedOfferId, setOpenedOfferId] = useState('');
  const [selectedFeedViewerIndex, setSelectedFeedViewerIndex] = useState(null);
  const [sharePost, setSharePost] = useState(null);
  const [reportPost, setReportPost] = useState(null);
  const [commentPost, setCommentPost] = useState(null);
  const [previewPrompt, setPreviewPrompt] = useState(null);
  const [offerProductId, setOfferProductId] = useState(null);
  const [dismissedOffers, setDismissedOffers] = useState([]);
  const [newPost, setNewPost] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const profileSyncRef = useRef('');
  const answersSyncRef = useRef('');
  const lastFeedActionRef = useRef(null);
  const scrollSignalRef = useRef(0);

  const visibleProfile = isPreviewVisitor ? previewAppProfile : profile;
  const visibleAnswers = isPreviewVisitor ? {} : answers;
  const visibleLikedIds = isPreviewVisitor ? [] : likedIds;
  const visibleSavedIds = isPreviewVisitor ? [] : savedIds;
  const visibleFollowedIds = isPreviewVisitor ? [] : followedIds;
  const visibleHiddenPostIds = isPreviewVisitor ? [] : hiddenPostIds;
  const visibleShares = isPreviewVisitor ? [] : shares;
  const visibleReports = isPreviewVisitor ? [] : reports;
  const visibleComments = isPreviewVisitor ? [] : comments;
  const visibleUsageLimit = isPreviewVisitor ? previewUsageLimit : usageLimit;
  const visibleEntitlements = isPreviewVisitor ? [] : entitlements;
  const visiblePurchases = isPreviewVisitor ? [] : purchases;
  const visibleBoosts = isPreviewVisitor ? [] : boosts;
  const visibleAppStreak = isPreviewVisitor ? previewAppStreak : appStreak;
  const visibleWallet = isPreviewVisitor ? previewWallet : wallet;
  const visibleGroupMemberships = isPreviewVisitor ? [] : groupMemberships;
  const visibleBehavioralEvents = isPreviewVisitor ? [] : behavioralEvents;
  const visibleFeedSignals = isPreviewVisitor ? [] : feedSignals;
  const visibleMatches = isPreviewVisitor ? [] : matches;
  const visibleMatchMessages = isPreviewVisitor ? [] : matchMessages;
  const visibleViewings = isPreviewVisitor ? [] : viewings;
  const visibleReviews = isPreviewVisitor ? [] : reviews;
  const visibleReputationProfile = isPreviewVisitor ? previewReputationProfile : reputationProfile;
  const visibleLifecycleTasks = isPreviewVisitor ? [] : lifecycleTasks;
  const visibleReferrals = isPreviewVisitor ? [] : referrals;
  const visibleResidentProfiles = isPreviewVisitor ? [] : residentProfiles;
  const visibleMaintenanceRequests = isPreviewVisitor ? [] : maintenanceRequests;
  const visibleRentRecords = isPreviewVisitor ? [] : rentRecords;
  const visibleDealWatchlist = isPreviewVisitor ? [] : dealWatchlist;
  const visibleNotifications = isPreviewVisitor ? [] : notifications;

  const remainingSwipes = Math.max(0, visibleUsageLimit.allowance - visibleUsageLimit.used);
  const activeOfferProduct = microProducts.find((product) => product.id === offerProductId);
  const rankedSwipeCards = useMemo(() => heroSwipeCards
    .map((card) => scoreSwipeCard(card, { profile: visibleProfile, answers: visibleAnswers, recommendationInsights, behavioralEvents: visibleBehavioralEvents }))
    .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0)), [visibleAnswers, visibleBehavioralEvents, visibleProfile, recommendationInsights]);
  const localRecommendationInsights = useMemo(() => buildLocalRecommendationInsights({ profile: visibleProfile, answers: visibleAnswers, feedRankings, behavioralEvents: visibleBehavioralEvents, partnerOffers }), [visibleAnswers, visibleBehavioralEvents, feedRankings, partnerOffers, visibleProfile]);
  const activeRecommendationInsights = recommendationInsights || localRecommendationInsights;
  const contextualOffers = useMemo(() => buildContextualOffers({
    routeTab,
    activeFeedTab,
    remainingSwipes,
    newPost,
    profile: visibleProfile,
    answers: visibleAnswers,
    posts,
    likedIds: visibleLikedIds,
    savedIds: visibleSavedIds,
    shares: visibleShares,
    boosts: visibleBoosts,
    matches: visibleMatches,
  }).filter((card) => !dismissedOffers.includes(card.id)).slice(0, 2), [activeFeedTab, dismissedOffers, newPost, posts, remainingSwipes, routeTab, visibleAnswers, visibleBoosts, visibleLikedIds, visibleMatches, visibleProfile, visibleSavedIds, visibleShares]);
  const primaryContextualOffer = contextualOffers[0];
  const recommendedOfferIds = new Set((activeRecommendationInsights?.perkRecommendations || []).map((offer) => offer.offerId));
  const sortedPartnerOffers = useMemo(() => [...partnerOffers].sort((a, b) => Number(recommendedOfferIds.has(b.id)) - Number(recommendedOfferIds.has(a.id))), [partnerOffers, activeRecommendationInsights]);
  const dailyPicks = rankedSwipeCards.slice(0, 3);
  const previewLockedRoute = isPreviewVisitor ? {
    Likes: {
      action: 'likes',
      title: 'Create an account to see your rental activity',
      body: 'Likes, saved posts, matches, messages, and viewing threads are available after signup so the app can keep your real history together.',
    },
    Profile: {
      action: 'profile',
      title: 'Create an account to build your RentEazy profile',
      body: 'Your role, avatar, match answers, reputation progress, and resident records belong to your account.',
    },
    Billing: {
      action: 'billing',
      title: 'Create an account to manage RentEazy plans and perks',
      body: 'Free Feed and preview browsing stay open. Account-only plans, credits, boosts, and Protect records appear after signup.',
    },
  }[routeTab] : null;
  // Preview must look like the real app, not a different app made of locked
  // "Create account" cards. We render the real Likes/Profile/Billing screens in
  // preview too; each already carries its own in-context signup CTA, so the
  // conversion ask survives without blanking the whole screen. previewLockedRoute
  // is retained (referenced below) as a kill-switch — flip previewGateActive to
  // restore the full-screen gate.
  const previewGateActive = false && previewLockedRoute;

  useEffect(() => {
    const seedById = new Map(allSeededFeedPosts.map((post) => [post.id, post]));
    const missingSeeds = allSeededFeedPosts.filter((post) => !posts.some((currentPost) => currentPost.id === post.id));
    const hasStaleSeedMedia = posts.some((post) => {
      const seed = seedById.get(post.id);
      return seed && seed.media?.[0] && seed.media[0] !== post.media?.[0];
    });
    if (!missingSeeds.length && !hasStaleSeedMedia) return;
    setPosts((current) => {
      const nextIds = new Set(current.map((post) => post.id));
      const nextMissingSeeds = allSeededFeedPosts.filter((post) => !nextIds.has(post.id));
      const refreshedCurrent = current.map((post) => {
        const seed = seedById.get(post.id);
        return seed?.media?.[0] && seed.media[0] !== post.media?.[0]
          ? { ...post, media: seed.media }
          : post;
      });
      return nextMissingSeeds.length ? [...nextMissingSeeds, ...refreshedCurrent] : refreshedCurrent;
    });
  }, [posts, setPosts]);

  useEffect(() => {
    const currentIds = new Set(groups.map((group) => group.id));
    const missingGroups = seededGroups.filter((group) => !currentIds.has(group.id));
    if (!missingGroups.length) return;
    setGroups((current) => {
      const nextIds = new Set(current.map((group) => group.id));
      const nextMissingGroups = seededGroups.filter((group) => !nextIds.has(group.id));
      return nextMissingGroups.length ? [...nextMissingGroups, ...current] : current;
    });
  }, [groups, setGroups]);

  const applyApiState = (state) => {
    if (!state) return;
    const isPublicPreviewState = state.user === null;
    if (state.posts) setPosts(state.posts);
    if (state.groups) setGroups(state.groups);
    if (state.partnerOffers) setPartnerOffers(state.partnerOffers);
    if (state.feedAds) setFeedAds(state.feedAds);
    if (state.feedRankings) setFeedRankings(state.feedRankings);
    if (state.recommendationInsights) setRecommendationInsights(state.recommendationInsights);
    if (isPublicPreviewState) return;
    if (state.likedIds) setLikedIds(state.likedIds);
    if (state.savedIds) setSavedIds(state.savedIds);
    if (state.followedIds) setFollowedIds(state.followedIds);
    if (state.hiddenPostIds) setHiddenPostIds(state.hiddenPostIds);
    if (state.comments) setComments(state.comments);
    if (state.shares) setShares(state.shares);
    if (state.reports) setReports(state.reports);
    if (state.profile) setProfile((current) => ({ ...current, ...state.profile }));
    if (state.answers) setAnswers(state.answers);
    if (state.usageLimit) setUsageLimit(state.usageLimit);
    if (state.entitlements) setEntitlements(state.entitlements);
    if (state.purchases) setPurchases(state.purchases);
    if (state.boosts) setBoosts(state.boosts);
    if (state.wallet) setWallet(state.wallet);
    if (state.appStreak) setAppStreak(state.appStreak);
    if (state.groupMemberships) setGroupMemberships(state.groupMemberships);
    if (state.behavioralEvents) setBehavioralEvents(state.behavioralEvents);
    if (state.matches) setMatches(state.matches);
    if (state.matchMessages) setMatchMessages(state.matchMessages);
    if (state.viewings) setViewings(state.viewings);
    if (state.reviews) setReviews(state.reviews);
    if (state.reputationProfile) setReputationProfile(state.reputationProfile);
    if (state.lifecycleTasks) setLifecycleTasks(state.lifecycleTasks);
    if (state.referrals) setReferrals(state.referrals);
    if (state.residentProfiles) setResidentProfiles(state.residentProfiles);
    if (state.maintenanceRequests) setMaintenanceRequests(state.maintenanceRequests);
    if (state.rentRecords) setRentRecords(state.rentRecords);
    if (state.landlordProperties) setLandlordProperties(state.landlordProperties);
    if (state.professionalProfiles) setProfessionalProfiles(state.professionalProfiles);
    if (state.tenantDemandSignals) setTenantDemandSignals(state.tenantDemandSignals);
    if (state.dealWatchlist) setDealWatchlist(state.dealWatchlist);
    if (state.operatorPortfolioSignals) setOperatorPortfolioSignals(state.operatorPortfolioSignals);
    if (state.marketIntroductions) setMarketIntroductions(state.marketIntroductions);
    if (state.notifications) setNotifications(state.notifications);
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
    if (isPreviewVisitor || backendStatus !== 'connected') return;
    const editableProfile = {
      name: profile.name,
      role: profile.role,
      area: profile.area,
      budget: profile.budget,
      moveDate: profile.moveDate,
      lookingFor: profile.lookingFor,
      avatarVariant: profile.avatarVariant,
      avatarIndex: profile.avatarIndex,
      avatarBg: profile.avatarBg,
    };
    const payload = JSON.stringify(editableProfile);
    if (profileSyncRef.current === payload) return;
    profileSyncRef.current = payload;
    const timer = window.setTimeout(() => {
      syncApiState(apiRequest('/api/profile', { method: 'PATCH', body: editableProfile }));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [backendStatus, isPreviewVisitor, profile]);

  useEffect(() => {
    if (isPreviewVisitor || backendStatus !== 'connected') return;
    const payload = JSON.stringify(answers);
    if (answersSyncRef.current === payload) return;
    answersSyncRef.current = payload;
    const timer = window.setTimeout(() => {
      syncApiState(apiRequest('/api/answers', { method: 'PATCH', body: { answers } }));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [answers, backendStatus, isPreviewVisitor]);

  useEffect(() => {
    if (isPreviewVisitor) return;
    const now = Date.now();
    if (new Date(usageLimit.resetsAt).getTime() <= now) {
      setUsageLimit((current) => ({
        ...current,
        used: 0,
        resetsAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      }));
    }
  }, [isPreviewVisitor, setUsageLimit, usageLimit.resetsAt]);

  useEffect(() => {
    if (isPreviewVisitor) return;
    const today = new Date().toISOString().slice(0, 10);
    const last = String(appStreak.lastActivityAt || '').slice(0, 10);
    if (today !== last) {
      setAppStreak((current) => ({
        ...current,
        count: current.count + 1,
        lastActivityAt: new Date().toISOString(),
      }));
    }
  }, [appStreak.lastActivityAt, isPreviewVisitor, setAppStreak]);

  useEffect(() => {
    if (isPreviewVisitor) return undefined;
    if (routeTab !== 'Feed') return undefined;
    const onScroll = () => {
      const now = Date.now();
      if (now - scrollSignalRef.current < 250) return;
      scrollSignalRef.current = now;
      const scrollDepth = Math.round(window.scrollY + window.innerHeight);
      const signal = {
        id: createPostId(),
        type: 'scroll',
        eventType: 'feed_scroll',
        targetType: 'feed',
        targetId: activeFeedTab,
        postId: '',
        metadata: { scrollY: Math.round(window.scrollY), scrollDepth, activeFeedTab },
        createdAt: new Date().toISOString(),
      };
      setFeedSignals((current) => [signal, ...current].slice(0, 240));
      syncApiState(apiRequest('/api/events', { method: 'POST', body: signal }));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [activeFeedTab, isPreviewVisitor, routeTab, setFeedSignals]);

  useEffect(() => {
    if (routeTab !== 'Feed') return undefined;
    const recordExit = () => {
      const lastAction = lastFeedActionRef.current;
      if (!lastAction || Date.now() - lastAction.createdAt > 2200) return;
      const post = posts.find((item) => item.id === lastAction.postId);
      if (post) recordFeedSignal('immediate_exit', post, { previousAction: lastAction.type });
    };
    window.addEventListener('beforeunload', recordExit);
    document.addEventListener('visibilitychange', recordExit);
    return () => {
      window.removeEventListener('beforeunload', recordExit);
      document.removeEventListener('visibilitychange', recordExit);
    };
  }, [posts, routeTab]);

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

  const openOffer = (productId) => {
    if (isPreviewVisitor) {
      requireAccount('billing');
      return;
    }
    if (dismissedOffers.includes(productId)) return;
    setOfferProductId(productId);
  };

  const closeOffer = () => {
    if (offerProductId) setDismissedOffers((current) => [...new Set([...current, offerProductId])]);
    setOfferProductId(null);
  };

  const dismissOffer = (productId) => {
    setDismissedOffers((current) => [...new Set([...current, productId])]);
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

  const recordFeedSignal = (type, post, metadata = {}) => {
    const signal = createFeedSignal({ type, post, metadata });
    lastFeedActionRef.current = { postId: post?.id || '', createdAt: Date.now(), type };
    setFeedSignals((current) => [signal, ...current].slice(0, 240));
    trackBehaviorEvent(signal.eventType, signal.targetType, signal.targetId, signal.metadata);
    return signal;
  };

  const explainFeedItem = (post, ranking) => {
    trackBehaviorEvent('feed_explanation_opened', 'post', post.id, {
      postType: post.postType,
      objective: ranking?.objective,
      score: ranking?.score,
      reasons: ranking?.reasons || [],
    });
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

  const openRecommendedOffer = (offerId) => {
    const offer = partnerOffers.find((item) => item.id === offerId);
    if (offer) openPartnerOffer(offer);
  };

  const completeLifecycleTask = (taskId) => {
    setLifecycleTasks((current) => current.map((task) => task.id === taskId ? { ...task, status: 'completed', completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : task));
    syncApiState(apiRequest(`/api/lifecycle-tasks/${taskId}/complete`, { method: 'POST' }));
  };

  const createReferral = (draft) => {
    const inviteType = draft.inviteType || 'Rental connection';
    const referral = {
      id: createPostId(),
      userId: profile.id || currentUser.id,
      inviteType,
      target: draft.target?.trim() || `A ${inviteType.toLowerCase()} contact`,
      status: 'ready_to_share',
      reward: '5 extra swipes after first accepted invite',
      trackingUrl: `https://renteazy.co.uk/join?ref=${encodeURIComponent(profile.id || currentUser.id)}&invite=${encodeURIComponent(inviteType.toLowerCase().replace(/\s+/g, '-'))}`,
      createdAt: new Date().toISOString(),
      acceptedAt: null,
    };
    setReferrals((current) => [referral, ...current]);
    syncApiState(apiRequest('/api/referrals', { method: 'POST', body: referral }));
  };

  const logMaintenanceRequest = (draft) => {
    const request = {
      id: createPostId(),
      userId: profile.id || currentUser.id,
      residentProfileId: residentProfiles[0]?.id || '',
      title: draft.title.trim(),
      category: draft.category,
      priority: draft.priority,
      status: 'logged',
      notes: draft.notes?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMaintenanceRequests((current) => [request, ...current]);
    syncApiState(apiRequest('/api/resident/maintenance', { method: 'POST', body: request }));
  };

  const logRentRecord = (draft) => {
    const record = {
      id: createPostId(),
      userId: profile.id || currentUser.id,
      residentProfileId: residentProfiles[0]?.id || '',
      month: draft.month,
      amount: Number(draft.amount),
      currency: 'GBP',
      status: 'recorded_on_time',
      verificationStatus: 'self_recorded',
      reputationPoints: 5,
      createdAt: new Date().toISOString(),
    };
    setRentRecords((current) => [record, ...current]);
    syncApiState(apiRequest('/api/resident/rent-records', { method: 'POST', body: record }));
  };

  const addLandlordProperty = (draft) => {
    const property = {
      id: createPostId(),
      ownerId: profile.id || currentUser.id,
      title: draft.title.trim(),
      area: draft.area.trim(),
      propertyType: draft.propertyType,
      status: 'pipeline',
      expectedRent: Number(draft.expectedRent || 0),
      currency: 'GBP',
      vacancyRisk: 'Unknown',
      benchmarkNote: 'Benchmark will improve as more local RentEazy signals arrive.',
      tenantDemandCount: 0,
      operatorInterestCount: 0,
      agentInterestCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLandlordProperties((current) => [property, ...current]);
    syncApiState(apiRequest('/api/landlord/properties', { method: 'POST', body: property }));
  };

  const shortlistTenantDemand = (signal) => {
    const targetId = signal.matchedPropertyIds?.[0] || landlordProperties[0]?.id || '';
    const introduction = {
      id: createPostId(),
      userId: profile.id || currentUser.id,
      sourceType: 'tenant_demand',
      sourceId: signal.id,
      targetType: targetId ? 'landlord_property' : 'demand_pipeline',
      targetId,
      status: 'shortlisted',
      reason: `${signal.displayName} fits ${signal.area} demand and timing.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTenantDemandSignals((current) => current.map((item) => item.id === signal.id ? { ...item, status: 'shortlisted', updatedAt: new Date().toISOString() } : item));
    setMarketIntroductions((current) => [introduction, ...current.filter((item) => !(item.sourceId === signal.id && item.targetId === targetId))]);
    syncApiState(apiRequest(`/api/landlord/demand/${signal.id}/shortlist`, { method: 'POST', body: introduction }));
  };

  const watchDeal = (post) => {
    const existing = dealWatchlist.find((item) => item.dealPostId === post.id);
    if (existing) {
      setDealWatchlist((current) => current.map((item) => item.id === existing.id ? { ...item, status: 'watching', updatedAt: new Date().toISOString() } : item));
    } else {
      const watchItem = {
        id: createPostId(),
        userId: profile.id || currentUser.id,
        dealPostId: post.id,
        dealType: post.postType,
        area: post.area,
        strategy: post.tags?.join(', ') || 'Rental-market opportunity',
        status: 'watching',
        score: post.sponsoredStatus ? 76 : 70,
        reasonBadges: (post.tags || ['Fresh signal']).slice(0, 3),
        notes: `Watch ${post.title} and track next steps.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDealWatchlist((current) => [watchItem, ...current]);
    }
    syncApiState(apiRequest('/api/deals/watchlist', { method: 'POST', body: { dealPostId: post.id, reasonBadges: (post.tags || []).slice(0, 3) } }));
  };

  const updateDealStatus = (watchId, status) => {
    setDealWatchlist((current) => current.map((item) => item.id === watchId ? { ...item, status, updatedAt: new Date().toISOString() } : item));
    syncApiState(apiRequest(`/api/deals/watchlist/${watchId}/status`, { method: 'PATCH', body: { status } }));
  };

  const addOperatorSignal = (draft) => {
    const signal = {
      id: createPostId(),
      operatorId: profile.id || currentUser.id,
      area: draft.area.trim(),
      propertyType: draft.propertyType.trim() || 'Mixed property types',
      model: draft.model,
      unitsTracked: Number(draft.unitsTracked || 0),
      occupancySignal: draft.occupancySignal.trim() || 'New operator signal',
      landlordDemandCount: 0,
      investorBriefCount: 0,
      complianceStatus: 'Ready to verify',
      nextAction: 'Connect suitable landlords, investors, and sourcers.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOperatorPortfolioSignals((current) => [signal, ...current]);
    syncApiState(apiRequest('/api/operator/signals', { method: 'POST', body: signal }));
  };

  const markNotificationRead = (notificationId) => {
    setNotifications((current) => current.map((notification) => notification.id === notificationId ? { ...notification, read: true, readAt: new Date().toISOString() } : notification));
    syncApiState(apiRequest(`/api/notifications/${notificationId}/read`, { method: 'POST' }));
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
    if (action === 'superlike') openOffer('superlike-1');
    syncApiState(apiRequest('/api/swipes', {
      method: 'POST',
      body: {
        action,
        targetType: 'swipe_card',
        targetId: card.id,
        subjectTitle: card.title,
        score: card.recommendationScore || card.matchScore,
        reasonBadges: [...new Set([...(card.badges || []), ...(card.recommendationReasons || [])])].slice(0, 6),
        missingInfo: ['Confirm viewing availability'],
        counterpartId: `source-${card.id || 'card'}`,
        counterpartName: card.type === 'room' || card.type === 'flat' || card.type === 'studio' ? 'Listing source' : 'RentEazy profile',
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
    if (isPreviewVisitor) {
      setOfferProductId(null);
      requireAccount('billing');
      return;
    }
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

    setOfferProductId(null);
    syncApiState(apiRequest('/api/purchases', { method: 'POST', body: { productId: product.id, sku: product.sku } }));
  };

  const toggleLike = (postId) => {
    toggleId(setLikedIds, postId);
    syncApiState(apiRequest(`/api/posts/${postId}/like`, { method: 'POST' }));
  };

  const toggleSave = (postId, post = posts.find((item) => item.id === postId)) => {
    if (post) recordFeedSignal('save', post, { saved: !savedIds.includes(postId) });
    toggleId(setSavedIds, postId);
    syncApiState(apiRequest(`/api/posts/${postId}/save`, { method: 'POST' }));
  };

  const toggleFollow = (followingId) => {
    toggleId(setFollowedIds, followingId);
    syncApiState(apiRequest('/api/follows', { method: 'POST', body: { followingId } }));
  };

  const hidePost = (postId, post = posts.find((item) => item.id === postId)) => {
    if (post) recordFeedSignal('not_interested', post, { suppressionDays: 30 });
    setHiddenPostIds((current) => [...new Set([...current, postId])]);
    syncApiState(apiRequest(`/api/posts/${postId}/hide`, { method: 'POST' }));
  };

  const passFeedCard = (post, speedMs) => {
    recordFeedSignal('not_interested', post, { direction: 'left', speedMs, suppressionDays: 30, source: 'pass' });
    setHiddenPostIds((current) => [...new Set([...current, post.id])]);
    syncApiState(apiRequest(`/api/posts/${post.id}/hide`, { method: 'POST' }));
  };

  const matchFeedCard = (post, speedMs) => {
    recordFeedSignal('match', post, { direction: 'right', speedMs });
    if (!likedIds.includes(post.id)) toggleLike(post.id);
  };

  const boostPost = (postId, productId = 'post-bump-small') => {
    openOffer(productId);
    syncApiState(apiRequest(`/api/posts/${postId}/boost`, { method: 'POST', body: { productId } }));
  };

  const submitReport = (report) => {
    setReports((current) => [report, ...current]);
    syncApiState(apiRequest(`/api/posts/${report.targetId}/report`, { method: 'POST', body: report }));
  };

  const feedStream = useMemo(() => buildRentEazyFeed({
    posts,
    profile: visibleProfile,
    answers: visibleAnswers,
    followedIds: visibleFollowedIds,
    likedIds: visibleLikedIds,
    savedIds: visibleSavedIds,
    hiddenPostIds: visibleHiddenPostIds,
    comments: visibleComments,
    behavioralEvents: visibleBehavioralEvents,
    feedSignals: visibleFeedSignals,
    activeFeedTab,
    minItems: 60,
  }), [activeFeedTab, posts, visibleAnswers, visibleBehavioralEvents, visibleComments, visibleFeedSignals, visibleFollowedIds, visibleHiddenPostIds, visibleLikedIds, visibleProfile, visibleSavedIds]);
  const rankingById = feedStream.rankingById;
  const feedItems = feedStream.items;
  const visibleFeedItems = isPreviewVisitor ? feedItems.slice(0, 6) : feedItems;
  const requireAccount = (action = 'continue') => {
    setPreviewPrompt(action);
    return false;
  };
  const previewGuard = (action, handler) => (...args) => {
    if (isPreviewVisitor) {
      requireAccount(action);
      return undefined;
    }
    return handler?.(...args);
  };
  const guardedToggleLike = previewGuard('like', toggleLike);
  const guardedToggleSave = previewGuard('save', toggleSave);
  const guardedToggleFollow = previewGuard('follow', toggleFollow);
  const guardedShare = previewGuard('share', setSharePost);
  const guardedComment = previewGuard('comment', setCommentPost);
  const guardedReport = previewGuard('report', setReportPost);
  const guardedOpenOffer = previewGuard('billing', openOffer);
  const guardedJoinGroup = previewGuard('group', joinGroup);
  const guardedCreateGroup = previewGuard('group', createGroup);
  const guardedMarkNotificationRead = previewGuard('profile', markNotificationRead);
  const guardedCompleteLifecycleTask = previewGuard('profile', completeLifecycleTask);
  const guardedCreateReferral = previewGuard('invite', createReferral);
  const guardedLogMaintenanceRequest = previewGuard('resident', logMaintenanceRequest);
  const guardedLogRentRecord = previewGuard('resident', logRentRecord);
  const guardedAddLandlordProperty = previewGuard('profile', addLandlordProperty);
  const guardedShortlistTenantDemand = previewGuard('match', shortlistTenantDemand);
  const guardedWatchDeal = previewGuard('match', watchDeal);
  const guardedUpdateDealStatus = previewGuard('match', updateDealStatus);
  const guardedAddOperatorSignal = previewGuard('profile', addOperatorSignal);
  const guardedOpenFeedItem = (index) => {
    if (isPreviewVisitor) {
      requireAccount('continue');
      return;
    }
    setSelectedFeedViewerIndex(index);
  };

  const navItems = [
    ['Feed', '/app/feed', Home],
    ['Swipe', '/app/swipe', Flame],
    ['Likes', '/app/likes', Heart],
    ['Perks', '/app/perks', Gift],
    ['Post', '/app/post', PlusCircle],
    ['Profile', '/app/profile', UserRound],
  ];
  const appScreenComponents = {
    ActivityInbox,
    AdsInventoryPanel,
    BillingPanel,
    BrandLogo,
    ComposerPanel,
    DailyReturnPanel,
    FeedPreviewBanner,
    FeedTimelineCard,
    GenOfferCard,
    GroupsPanel,
    InteractiveMatchCard: SwipeInteractiveMatchCard,
    LikesSocialInbox,
    MiniShopPanel,
    PeepAvatar,
    PerksRail,
    PreviewRouteGate,
    ProfileEditor,
    ReputationScoreCard,
    SocialHomeHeader,
    SocialKitProfilePage,
    SocialStoryRail,
    TrustReputationPanel,
    UsefulNotificationsPanel,
    navItems,
    routeTab,
  };

  return (
    <div className={`${routeTab === 'Feed' ? 'min-h-screen bg-white pb-24' : routeTab === 'Swipe' ? 'min-h-screen bg-[#050506] pb-0' : 'min-h-screen bg-[#f7f9fa] pb-24'} text-slate-900 antialiased`} style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
      {clerkEnabled && <ClerkSessionBridge setProfile={setProfile} />}
      {(sharePost || (routeTab === 'Post' && newPost)) && (
        <ShareEverywhereModal post={sharePost || newPost} onClose={() => setSharePost(null)} onShared={trackShare} />
      )}
      {reportPost && <ReportModal post={reportPost} onClose={() => setReportPost(null)} onReport={submitReport} />}
      {commentPost && <CommentModal post={commentPost} comments={visibleComments.filter((comment) => comment.postId === commentPost.id)} onClose={() => setCommentPost(null)} onComment={addComment} />}
      <MicroOfferModal product={activeOfferProduct} onClose={closeOffer} onConfirm={confirmMicroProduct} billingEnabled={clerkEnabled} />
      {previewPrompt && <PreviewSignupPrompt action={previewPrompt} onClose={() => setPreviewPrompt(null)} />}
      <FeedImmersiveViewer
        items={visibleFeedItems}
        initialIndex={selectedFeedViewerIndex}
        likedIds={visibleLikedIds}
        savedIds={visibleSavedIds}
        followedIds={visibleFollowedIds}
        comments={visibleComments}
        onClose={() => setSelectedFeedViewerIndex(null)}
        onLike={guardedToggleLike}
        onSave={guardedToggleSave}
        onFollow={guardedToggleFollow}
        onShare={guardedShare}
        onComment={guardedComment}
        onBoost={(post) => boostPost(post.id)}
        onHide={hidePost}
        onReport={guardedReport}
        onExplain={explainFeedItem}
        onPass={passFeedCard}
        onMatch={matchFeedCard}
        onSignal={recordFeedSignal}
      />
      {!isPreviewVisitor && <GlobalChatWidget matches={matches} messages={matchMessages} profile={profile} onSendMessage={sendMatchMessage} routeTab={routeTab} />}
      {routeTab !== 'Feed' && routeTab !== 'Swipe' && <header className="sticky top-0 z-40 px-3 pt-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-[1.45rem] border border-white/80 bg-white/78 px-3 py-2 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.55),inset_0_1px_0_rgba(255,255,255,0.96)] backdrop-blur-2xl">
          <BrandLogo compact />
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map(([label, href, Icon]) => (
              <a key={label} href={href} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ${routeTab === label ? 'bg-[#092243] text-white shadow-[0_12px_24px_-18px_rgba(9,34,67,0.75)]' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Icon className="h-4 w-4" />
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {isPreviewVisitor
              ? <a href="/signup" className="hidden rounded-full bg-[#edf8ee] px-3 py-1.5 text-xs font-semibold text-[#215d27] sm:inline-flex">Sign up</a>
              : <a href="/app/profile" className="hidden rounded-full bg-[#edf7ff] px-3 py-1.5 text-xs text-[#154f79] sm:inline-flex">{displayRole(profile.role)}</a>}
            <span className={`hidden rounded-full px-3 py-1.5 text-xs lg:inline-flex ${backendStatus === 'connected' ? 'bg-[#edf8ee] text-[#215d27]' : backendStatus === 'checking' ? 'bg-[#edf7ff] text-[#154f79]' : 'bg-[#fff7ed] text-[#9a3412]'}`}>{backendStatus === 'connected' ? 'API connected' : backendStatus === 'checking' ? 'API checking' : 'Offline mode'}</span>
            {clerkEnabled ? <ClerkAccountControls /> : <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 ring-1 ring-black/5"><Bell className="h-4 w-4" /></button>}
          </div>
        </div>
      </header>}

      <main className={`mx-auto grid ${routeTab === 'Feed' ? 'max-w-[520px] gap-4 px-3 py-3 lg:max-w-7xl lg:grid-cols-[17rem_minmax(0,36rem)_20rem] lg:items-start lg:px-6 lg:py-5' : routeTab === 'Swipe' ? 'max-w-[430px] gap-0 px-0 py-0 md:max-w-[27rem] md:px-4 md:py-8 lg:py-10' : 'gap-6 px-4 py-5'} ${routeTab === 'Swipe' ? '' : routeTab === 'Feed' ? '' : 'max-w-6xl lg:grid-cols-[1fr_20rem]'}`}>
        {routeTab === 'Feed' && (
          <FeedScreen
            activeFeedTab={activeFeedTab}
            comments={visibleComments}
            components={appScreenComponents}
            createGroup={guardedCreateGroup}
            dismissOffer={dismissOffer}
            feedTabs={feedTabs}
            followedIds={visibleFollowedIds}
            groupMemberships={visibleGroupMemberships}
            groups={groups}
            guardedComment={guardedComment}
            guardedOpenFeedItem={guardedOpenFeedItem}
            guardedReport={guardedReport}
            guardedShare={guardedShare}
            guardedToggleFollow={guardedToggleFollow}
            guardedToggleLike={guardedToggleLike}
            guardedToggleSave={guardedToggleSave}
            isPreviewVisitor={isPreviewVisitor}
            joinGroup={guardedJoinGroup}
            likedIds={visibleLikedIds}
            newPost={newPost}
            openedOfferId={openedOfferId}
            openPartnerOffer={openPartnerOffer}
            openOffer={guardedOpenOffer}
            posts={posts}
            primaryContextualOffer={primaryContextualOffer}
            profile={visibleProfile}
            requireAccount={requireAccount}
            savedIds={visibleSavedIds}
            setActiveFeedTab={setActiveFeedTab}
            setSharePost={setSharePost}
            sortedPartnerOffers={sortedPartnerOffers}
            usageLimit={visibleUsageLimit}
            visibleFeedItems={visibleFeedItems}
          />
        )}
        {routeTab !== 'Feed' && <section className="min-w-0 overflow-x-hidden">
          {previewGateActive && (
            <PreviewRouteGate
              action={previewLockedRoute.action}
              title={previewLockedRoute.title}
              body={previewLockedRoute.body}
            />
          )}

          {routeTab === 'Post' && (
            <PostScreen
              addPost={addPost}
              boosts={visibleBoosts}
              components={appScreenComponents}
              isPreviewVisitor={isPreviewVisitor}
              openOffer={guardedOpenOffer}
              posts={posts}
              profile={visibleProfile}
              reports={visibleReports}
              shares={visibleShares}
              usageLimit={visibleUsageLimit}
            />
          )}

          {routeTab === 'Perks' && (
            <div className="space-y-4">
              {openedOfferId && (
                <div className="rounded-3xl border border-[#d5ecd7] bg-[#edf8ee] px-4 py-3 text-sm text-[#215d27]">
                  Perk opened. RentEazy records the signal so future offers can be more relevant.
                </div>
              )}
              <PerksRail partnerOffers={sortedPartnerOffers} profile={visibleProfile} onOpenOffer={openPartnerOffer} />
            </div>
          )}

          {routeTab === 'Swipe' && (
            <SwipeScreen
              components={appScreenComponents}
              handleSwipeAction={handleSwipeAction}
              isPreviewVisitor={isPreviewVisitor}
              openOffer={guardedOpenOffer}
              rankedSwipeCards={rankedSwipeCards}
              remainingSwipes={remainingSwipes}
              requireAccount={requireAccount}
            />
          )}

          {!previewGateActive && routeTab === 'Likes' && (
            <LikesScreen
              components={appScreenComponents}
              dismissOffer={dismissOffer}
              feedItems={feedItems}
              likedIds={visibleLikedIds}
              matches={visibleMatches}
              matchMessages={visibleMatchMessages}
              newPost={newPost}
              openOffer={guardedOpenOffer}
              posts={posts}
              primaryContextualOffer={primaryContextualOffer}
              profile={visibleProfile}
              savedIds={visibleSavedIds}
              setSelectedFeedViewerIndex={setSelectedFeedViewerIndex}
              setSharePost={setSharePost}
            />
          )}

          {!previewGateActive && routeTab === 'Profile' && (
            <ProfileScreen
              answers={visibleAnswers}
              comments={visibleComments}
              components={appScreenComponents}
              completeLifecycleTask={guardedCompleteLifecycleTask}
              dismissOffer={dismissOffer}
              feedItems={feedItems}
              lifecycleTasks={visibleLifecycleTasks}
              likedIds={visibleLikedIds}
              markNotificationRead={guardedMarkNotificationRead}
              matches={visibleMatches}
              newPost={newPost}
              notifications={visibleNotifications}
              openOffer={guardedOpenOffer}
              posts={posts}
              primaryContextualOffer={primaryContextualOffer}
              profile={visibleProfile}
              reports={visibleReports}
              reputationProfile={visibleReputationProfile}
              savedIds={visibleSavedIds}
              setAnswers={isPreviewVisitor ? () => requireAccount('profile') : setAnswers}
              setProfile={isPreviewVisitor ? () => requireAccount('profile') : setProfile}
              setSelectedFeedViewerIndex={setSelectedFeedViewerIndex}
              setSharePost={setSharePost}
            />
          )}

          {!previewGateActive && routeTab === 'Billing' && (
            <BillingScreen boosts={visibleBoosts} components={appScreenComponents} openOffer={guardedOpenOffer} purchases={visiblePurchases} wallet={visibleWallet} />
          )}
        </section>}

        {routeTab === 'Feed' && (
          <aside className="sticky top-5 hidden space-y-4 lg:block">
            <DailySwipePanel usageLimit={visibleUsageLimit} onBuyMore={guardedOpenOffer} />
            <ProfileStrengthCard profile={visibleProfile} answers={visibleAnswers} />
            <UsefulNotificationsPanel notifications={visibleNotifications} onMarkRead={markNotificationRead} />
            <RecommendationLoopPanel insights={activeRecommendationInsights} onOpenOffer={openRecommendedOffer} />
            <MiniShopPanel onSelectProduct={guardedOpenOffer} compact />
          </aside>
        )}

        {routeTab === 'Profile' && <aside className="hidden space-y-4 lg:block">
          <DailySwipePanel usageLimit={visibleUsageLimit} onBuyMore={guardedOpenOffer} />
          <ProfileStrengthCard profile={visibleProfile} answers={visibleAnswers} />
          <UsefulNotificationsPanel notifications={visibleNotifications} onMarkRead={markNotificationRead} />
          <RecommendationLoopPanel insights={activeRecommendationInsights} onOpenOffer={openRecommendedOffer} />
          <MiniShopPanel onSelectProduct={guardedOpenOffer} compact />
        </aside>}

        {routeTab !== 'Feed' && routeTab !== 'Swipe' && routeTab !== 'Profile' && routeTab !== 'Perks' && (
          <AppSupportSidebar
            routeTab={routeTab}
            wallet={visibleWallet}
            purchases={visiblePurchases}
            boosts={visibleBoosts}
            reports={visibleReports}
            shares={visibleShares}
            posts={posts}
            savedIds={visibleSavedIds}
            comments={visibleComments}
            entitlements={visibleEntitlements}
            appStreak={visibleAppStreak}
            usageLimit={visibleUsageLimit}
            profile={visibleProfile}
            answers={visibleAnswers}
            notifications={visibleNotifications}
            markNotificationRead={guardedMarkNotificationRead}
            activeRecommendationInsights={activeRecommendationInsights}
            openRecommendedOffer={openRecommendedOffer}
            referrals={visibleReferrals}
            createReferral={guardedCreateReferral}
            residentProfiles={visibleResidentProfiles}
            maintenanceRequests={visibleMaintenanceRequests}
            rentRecords={visibleRentRecords}
            logMaintenanceRequest={guardedLogMaintenanceRequest}
            logRentRecord={guardedLogRentRecord}
            landlordProperties={landlordProperties}
            addLandlordProperty={guardedAddLandlordProperty}
            tenantDemandSignals={tenantDemandSignals}
            marketIntroductions={marketIntroductions}
            shortlistTenantDemand={guardedShortlistTenantDemand}
            professionalProfiles={professionalProfiles}
            groups={groups}
            dealWatchlist={visibleDealWatchlist}
            watchDeal={guardedWatchDeal}
            updateDealStatus={guardedUpdateDealStatus}
            operatorPortfolioSignals={operatorPortfolioSignals}
            addOperatorSignal={guardedAddOperatorSignal}
            activeFeedTab={activeFeedTab}
            setActiveFeedTab={setActiveFeedTab}
            likedIds={visibleLikedIds}
            feedAds={feedAds}
            openOffer={guardedOpenOffer}
          />
        )}
      </main>

      <AppBottomNav navItems={navItems} routeTab={routeTab} />
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

function ClerkRentEazyAppContainer() {
  const { isLoaded, isSignedIn } = useUser();
  return <RentEazyAppContainer isPreviewVisitor={!isLoaded || !isSignedIn} />;
}

export default function App() {
  const { profile, setProfile } = useProfile();
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname;

  if (pathname.startsWith('/app')) {
    const hasLocalApiSession = Boolean(getStoredJson('renteazy-api-token', ''));
    return clerkEnabled ? <ClerkRentEazyAppContainer /> : <RentEazyAppContainer isPreviewVisitor={!hasLocalApiSession} />;
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

  // Land → pick who you are → get a profile-specific landing (not a generic one).
  if (!profile) {
    return <ProfileChooser onSelect={setProfile} />;
  }
  const pc = getProfile(profile);
  const rotatingHeroWords = pc.hero.rotating;

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
                <a href={socialAppUrl} className="hidden sm:inline-flex items-center justify-center rounded-full px-4 py-2 text-xs text-slate-700 bg-white/78 border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_white] hover:bg-white hover:text-[#2f7d32] transition-all duration-300">Browse Feed</a>
                <a href="/signup?source=nav_primary&offer=match24h" className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-xs text-white bg-linear-to-b from-[#52a832] to-[#2f7d32] border border-[#25672a] shadow-[0_5px_14px_rgba(47,125,50,0.28),inset_0_1px_0_rgba(255,255,255,0.35)] hover:from-[#64bd44] hover:to-[#3b8d3d] transition-all duration-300">Start Matching</a>
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
              <p className="mt-8 lg:mt-5 xl:mt-6 text-base md:text-lg leading-8 text-slate-600 font-light max-w-xl mx-auto lg:mx-0">{pc.hero.heroShort}</p>
              <div className="mt-10 lg:mt-6 xl:mt-8 flex flex-col items-center lg:items-start gap-3">
                <a href="/signup?source=hero_primary&offer=match24h" className="inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 bg-linear-to-b from-[#52a832] to-[#2f7d32] border border-[#25672a] text-white text-base font-medium shadow-[0_12px_28px_rgba(47,125,50,0.3),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-200 hover:shadow-[0_16px_36px_rgba(47,125,50,0.44)] hover:from-[#64bd44] hover:to-[#3b8d3d] active:scale-95">
                  Start Matching — it's free
                  <iconify-icon icon="solar:arrow-right-linear" class="text-xl"></iconify-icon>
                </a>
                <p className="text-xs text-slate-400 font-light">No card required · Profile ready in 2 minutes · Upgrade anytime</p>
                <div className="mt-1 flex items-center gap-5 text-sm text-slate-500">
                  <a href={socialAppUrl} className="inline-flex items-center gap-1.5 hover:text-[#2f7d32] transition-colors duration-200"><iconify-icon icon="solar:feed-linear" class="text-base text-[#2670a8]"></iconify-icon>Preview the Feed</a>
                  <span className="w-px h-4 bg-slate-200" aria-hidden="true"></span>
                  <a href="/signup?source=hero_list_property" className="inline-flex items-center gap-1.5 hover:text-[#2f7d32] transition-colors duration-200"><iconify-icon icon="solar:add-square-linear" class="text-base text-[#2f7d32]"></iconify-icon>List a Property</a>
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

        {/* ── PER-ROLE STORY (Gen UI: landlord sees landlord pain → dream → how) ── */}
        <RoleStory profile={profile} />

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
            <VSLPlayer userType={pc.vslUserType} />
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
                <p className="text-xl md:text-2xl font-normal text-white leading-snug max-w-lg">Everyone gets a voice. Post homes, rooms, tenant briefs, investment deals, or area advice. No paywall — preview free, then create a profile to post, like, and match.</p>
              </div>
              <a href={socialAppUrl} className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 text-white/85 px-5 py-3 text-sm font-normal hover:bg-white/16 transition-colors">
                <iconify-icon icon="solar:feed-linear" class="text-base text-[#9bd383]"></iconify-icon>
                Preview the Feed
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
                <p className="mt-3 text-sm text-slate-500">Monthly from £4.99/seat · Yearly £99.99/seat · 5+ seats: discounts apply</p>
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
          {/* ── FOUNDING MEMBER OFFER — first 1,000 who go yearly lock £69.99/yr for life ── */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-[#25672a] bg-linear-to-br from-[#0c376b] via-[#0d2e57] to-[#06182f] p-8 md:p-10 mb-12 shadow-[0_30px_70px_-40px_rgba(9,34,67,0.7)]">
            <BorderBeam size={220} duration={11} borderWidth={2} colorFrom="#52a832" colorTo="#9bd383" />
            <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#52a832]/18 border border-[#52a832]/40 px-3.5 py-1.5">
                  <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9bd383] opacity-60"></span><span className="relative inline-flex h-2 w-2 rounded-full bg-[#9bd383]"></span></span>
                  <span className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.14em] text-[#9bd383]">FOUNDING MEMBERS · FIRST 1,000</span>
                </div>
                <h3 className="mt-5 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-3xl md:text-[2.6rem] font-normal leading-[1.05] tracking-tight text-white">
                  Lock <span className="text-[#9bd383]">£69.99/year</span> — for life.
                </h3>
                <p className="mt-4 max-w-xl text-base leading-7 font-light text-white/70">
                  Be one of the first 1,000 members to commit to a yearly plan and your price is frozen at £69.99/year — not the £99.99 standard — for as long as you stay. Start free; switch to founding whenever you’re ready.
                </p>
                <a href="/signup?offer=founding-yearly&plan=yearly" className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#74c656]/40 bg-linear-to-b from-[#52a832] to-[#2f7d32] px-7 py-3.5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(47,125,50,0.36)]">
                  Claim your founding price — go yearly
                  <iconify-icon icon="solar:arrow-right-linear" class="text-base"></iconify-icon>
                </a>
                <p className="mt-3 font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.12em] text-white/40">FIRST 1,000 YEARLY MEMBERS · YOUR RATE NEVER RISES WHILE YOU STAY</p>
              </div>
              <div className="rounded-4xl bg-white/[0.06] border border-white/12 p-7 text-center backdrop-blur-sm">
                <p className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.16em] text-white/45">YOUR FOUNDING RATE</p>
                <div className="mt-3 flex items-end justify-center gap-2.5">
                  <span className="text-2xl font-normal text-white/35 line-through leading-none">£99.99</span>
                  <span className="font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-6xl font-normal text-white leading-none">£69.99</span>
                </div>
                <p className="mt-2 text-sm text-white/55">per year · locked forever</p>
                <div className="mt-5 h-px bg-white/10"></div>
                <p className="mt-5 text-sm font-light leading-6 text-white/65">Commit yearly now and your rate never changes. Lock it while you’re in the first 1,000.</p>
              </div>
            </div>
          </div>
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
                <a href={socialAppUrl} className="w-full sm:w-auto inline-flex items-center justify-center rounded-full px-7 py-4 bg-white/10 border border-white/18 text-white/78 text-sm font-normal transition-all duration-200 hover:bg-white/18 hover:text-white">Preview the Feed</a>
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
