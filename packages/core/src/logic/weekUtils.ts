import type { DayTheme, DayThemeConfig } from '../types/week';

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const THEME_CHIP: Record<DayTheme, string> = {
  focus: 'F',
  recharge: 'R',
  flex: 'X',
  admin: 'A',
};

export const THEME_LABELS: Record<DayTheme, string> = {
  focus: 'Focus',
  recharge: 'Recharge',
  flex: 'Flex',
  admin: 'Admin',
};

const THEME_CYCLE: DayTheme[] = ['focus', 'recharge', 'flex', 'admin'];

export const INBOX_MAX_ITEMS = 20;
export const INBOX_WARNING_THRESHOLD = 15;

export function getWeekStartDate(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d.toISOString().split('T')[0];
}

export function getTodayDayIndex(date = new Date()): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

export function isSunday(date = new Date()): boolean {
  return date.getDay() === 0;
}

export function isWorkday(dayIndex: number, workWindowDays?: number[]): boolean {
  return workWindowDays?.includes(dayIndex) ?? false;
}

export function swapDayThemes(
  dayThemes: DayThemeConfig[],
  dayA: number,
  dayB: number
): DayThemeConfig[] {
  const configA = dayThemes.find((d) => d.day === dayA);
  const configB = dayThemes.find((d) => d.day === dayB);
  if (!configA || !configB) return dayThemes;

  return dayThemes.map((d) => {
    if (d.day === dayA) return { ...d, theme: configB.theme };
    if (d.day === dayB) return { ...d, theme: configA.theme };
    return d;
  });
}

export function cycleDayTheme(theme: DayTheme): DayTheme {
  const index = THEME_CYCLE.indexOf(theme);
  return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
}

export function adjustScheduledTime(time: string, deltaMinutes: number): string {
  const [hours, minutes] = time.split(':').map(Number);
  const total = hours * 60 + minutes + deltaMinutes;
  const clamped = Math.max(0, Math.min(23 * 60 + 59, total));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getNextWeekStartDate(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const daysUntilNextMonday = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + daysUntilNextMonday);
  return d.toISOString().split('T')[0];
}

export function getSundaySetupStartDate(date = new Date()): string {
  if (date.getDay() === 0) {
    return getNextWeekStartDate(date);
  }
  return getWeekStartDate(date);
}
