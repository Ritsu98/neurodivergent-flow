import type {
  WeekIntensity,
  DayTheme,
  DayThemeConfig,
  WorkWindow,
  PreferredPrimaryBlockTime,
} from '../types';

/**
 * Generates a week plan based on intensity, work windows, and user preferences
 */
export function generateWeekPlan(
  intensity: WeekIntensity,
  workWindows?: WorkWindow[],
  preferredTime?: PreferredPrimaryBlockTime
): DayThemeConfig[] {
  // Get day theme distribution based on intensity
  const distribution = getDayThemeDistribution(intensity);

  // Create array of 7 days (Mon-Sun, 0-6)
  const days: DayThemeConfig[] = [];

  // Distribute themes across the week
  let themeIndex = 0;
  for (let day = 0; day < 7; day++) {
    const theme = distribution[themeIndex % distribution.length];
    days.push({
      day,
      theme,
      scheduledTime: getScheduledTime(day, workWindows, preferredTime),
    });
    themeIndex++;
  }

  // Apply default schedule suggestions (reorder if needed)
  return applyDefaultSchedule(days, workWindows);
}

/**
 * Get day theme distribution based on intensity
 */
function getDayThemeDistribution(intensity: WeekIntensity): DayTheme[] {
  switch (intensity) {
    case 'light':
      return ['focus', 'recharge', 'recharge', 'recharge', 'flex', 'flex', 'admin'];
    case 'normal':
      return ['focus', 'focus', 'recharge', 'recharge', 'flex', 'flex', 'admin'];
    case 'heavy':
      return ['focus', 'focus', 'focus', 'recharge', 'flex', 'flex', 'admin'];
    default:
      return ['focus', 'focus', 'recharge', 'recharge', 'flex', 'flex', 'admin'];
  }
}

/**
 * Get scheduled time for Primary Block based on day and work windows
 */
function getScheduledTime(
  day: number,
  workWindows?: WorkWindow[],
  preferredTime?: PreferredPrimaryBlockTime
): string | undefined {
  // Check if this day is a workday
  const isWorkday = workWindows?.some((window) => window.days.includes(day));

  if (isWorkday) {
    // Workdays: schedule Primary Block in evening (30 min after work ends)
    const workWindow = workWindows?.find((w) => w.days.includes(day));
    if (workWindow) {
      const [hours, minutes] = workWindow.end.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(hours, minutes + 30, 0, 0);
      return `${String(endTime.getHours()).padStart(2, '0')}:${String(
        endTime.getMinutes()
      ).padStart(2, '0')}`;
    }
  }

  // Non-workdays: use preferred time or default
  if (preferredTime) {
    const timeMap: Record<PreferredPrimaryBlockTime, string> = {
      morning: '09:00',
      afternoon: '14:00',
      evening: '18:00',
    };
    return timeMap[preferredTime];
  }

  // Default: afternoon
  return '14:00';
}

/**
 * Apply default schedule suggestions
 * Mon: Flex (recover from Monday)
 * Tue: Focus
 * Wed: Recharge
 * Thu: Focus
 * Fri: Flex (cleanup / social / errands)
 * Sat: Recharge
 * Sun: Admin + Prep
 */
function applyDefaultSchedule(
  days: DayThemeConfig[],
  workWindows?: WorkWindow[]
): DayThemeConfig[] {
  const defaultSchedule: Record<number, DayTheme> = {
    0: 'flex', // Mon
    1: 'focus', // Tue
    2: 'recharge', // Wed
    3: 'focus', // Thu
    4: 'flex', // Fri
    5: 'recharge', // Sat
    6: 'admin', // Sun
  };

  // Reorder themes to match default schedule while preserving distribution
  const themeCounts = countThemes(days);
  const reordered: DayThemeConfig[] = [];

  for (let day = 0; day < 7; day++) {
    const preferredTheme = defaultSchedule[day];
    const available = themeCounts[preferredTheme] || 0;

    if (available > 0) {
      reordered.push({
        day,
        theme: preferredTheme,
        scheduledTime: days.find((d) => d.day === day)?.scheduledTime,
      });
      themeCounts[preferredTheme]--;
    } else {
      // Use first available theme
      const firstAvailable = Object.keys(themeCounts).find(
        (theme) => themeCounts[theme as DayTheme] > 0
      ) as DayTheme;
      reordered.push({
        day,
        theme: firstAvailable,
        scheduledTime: days.find((d) => d.day === day)?.scheduledTime,
      });
      themeCounts[firstAvailable]--;
    }
  }

  // Update scheduled times based on work windows
  return reordered.map((day) => ({
    ...day,
    scheduledTime: getScheduledTime(
      day.day,
      workWindows,
      undefined // preferredTime already applied
    ),
  }));
}

/**
 * Count themes in the distribution
 */
function countThemes(days: DayThemeConfig[]): Record<DayTheme, number> {
  const counts: Record<DayTheme, number> = {
    focus: 0,
    recharge: 0,
    flex: 0,
    admin: 0,
  };

  days.forEach((day) => {
    counts[day.theme]++;
  });

  return counts;
}
