import { z } from 'zod';

export const WorkWindowSchema = z.object({
  days: z.array(z.number().min(0).max(6)),
  start: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  end: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
});

export const UserPrefsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  workMode: z.enum(['none', 'weekdays', 'irregular']),
  workWindows: z.array(WorkWindowSchema).optional(),
  afterWorkEnergy: z.enum(['low', 'mixed', 'decent']).optional(),
  preferredPrimaryBlockTime: z.enum(['morning', 'afternoon', 'evening']).optional(),
  sleepWindowStart: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  sleepWindowEnd: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  downshiftReminderEnabled: z.boolean().default(true),
  weekIntensityDefault: z.enum(['light', 'normal', 'heavy']).default('normal'),
  rechargeDefaults: z.array(z.string()),
  notificationPreferences: z.record(z.boolean()).default({}),
  highContrastEnabled: z.boolean().default(false),
  reducedMotionEnabled: z.boolean().default(false),
  hapticsEnabled: z.boolean().default(true),
  soundEnabled: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserPrefsInput = z.infer<typeof UserPrefsSchema>;
