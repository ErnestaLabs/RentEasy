import { z } from 'zod';

export const roleSchema = z.enum(['tenant', 'landlord', 'investor', 'agent', 'sourcer', 'operator']);

export const cityQuerySchema = z.object({
  city: z.string().trim().min(1).max(80),
});

export const activityQuerySchema = z.object({
  city: z.string().trim().min(1).max(80),
  limit: z.coerce.number().int().min(1).max(10).default(10),
});

export const demoListingsQuerySchema = z.object({
  city: z.string().trim().min(1).max(80),
  count: z.coerce.number().int().min(1).max(5).default(5),
});

export const signalSchema = z.object({
  type: z.enum(['dwell', 'swipe_right', 'swipe_left', 'expand', 'skip', 'search', 'hide', 'explicit']),
  entityId: z.string().trim().min(1),
  entityType: z.enum(['listing', 'profile', 'opportunity', 'agent']),
  value: z.number().finite(),
  context: z.object({
    timeOfDay: z.number().min(0).max(23),
    device: z.enum(['mobile', 'tablet', 'desktop']),
    location: z.string().trim().max(120).optional(),
    sessionDepth: z.number().int().min(0),
  }),
  timestamp: z.number().int().positive(),
});

export const signalsBodySchema = z.object({
  sessionId: z.string().trim().min(1),
  userId: z.string().trim().min(1).optional(),
  signals: z.array(signalSchema).min(1).max(100),
});

export const sessionInitBodySchema = z.object({
  anonymousId: z.string().trim().min(1),
  referralSource: z.string().trim().max(200).default('direct'),
  device: z.string().trim().min(1).max(80),
  city: z.string().trim().max(80).optional(),
});

export const sessionLinkBodySchema = z.object({
  sessionId: z.string().trim().min(1),
});

export const feedRankedBodySchema = z.object({
  userId: z.string().trim().min(1).optional(),
  sessionId: z.string().trim().min(1),
  filters: z.object({
    city: z.string().trim().min(1),
    priceMin: z.number().int().min(0).optional(),
    priceMax: z.number().int().min(0).optional(),
    propertyType: z.array(z.string().trim().min(1)).optional(),
    zones: z.array(z.number().int().min(1).max(9)).optional(),
    features: z.array(z.string().trim().min(1)).optional(),
  }),
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(50),
});

export const cardSpecBodySchema = z.object({
  userId: z.string().trim().min(1).optional(),
  sessionId: z.string().trim().min(1),
  listingId: z.string().trim().min(1),
});

export const signupBodySchema = z.object({
  role: roleSchema,
  email: z.string().trim().email(),
  sessionId: z.string().trim().min(1),
});

