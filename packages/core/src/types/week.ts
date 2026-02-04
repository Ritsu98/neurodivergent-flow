import type { WeekIntensity } from './user';

export type DayTheme = 'focus' | 'recharge' | 'flex' | 'admin';

export interface DayThemeConfig {
  day: number; // 0=Mon, 6=Sun
  theme: DayTheme;
  scheduledTime?: string; // HH:mm (auto-derived but editable)
}

export interface WeekPlan {
  id: string;
  userId: string;
  startDate: string; // YYYY-MM-DD
  intensity: WeekIntensity;
  weeklyOutcomes: string[];
  dayThemes: DayThemeConfig[];
  createdAt: string;
  updatedAt: string;
}
