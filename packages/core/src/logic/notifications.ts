export const NOTIFICATION_PREF_KEYS = {
  enabled: 'notificationsEnabled',
  downshift: 'downshiftReminder',
  primaryBlock: 'primaryBlockReminder',
  redDayOverride: 'redDayShowAll',
  analytics: 'analyticsEnabled',
} as const;

export const MAX_NOTIFICATIONS_PER_DAY = 2;

export interface NotificationPrefs {
  enabled: boolean;
  downshift: boolean;
  primaryBlock: boolean;
  redDayOverride: boolean;
}

export function parseNotificationPrefs(
  raw: Record<string, boolean> | undefined
): NotificationPrefs {
  if (!raw) {
    return {
      enabled: true,
      downshift: true,
      primaryBlock: true,
      redDayOverride: false,
    };
  }
  return {
    enabled: raw[NOTIFICATION_PREF_KEYS.enabled] ?? true,
    downshift: raw[NOTIFICATION_PREF_KEYS.downshift] ?? true,
    primaryBlock: raw[NOTIFICATION_PREF_KEYS.primaryBlock] ?? true,
    redDayOverride: raw[NOTIFICATION_PREF_KEYS.redDayOverride] ?? false,
  };
}

export function isAnalyticsEnabled(raw: Record<string, boolean> | undefined): boolean {
  return raw?.[NOTIFICATION_PREF_KEYS.analytics] === true;
}

/** Non-essential notifications suppressed on Red days unless user overrides. */
export function shouldSendNotification(
  type: 'core' | 'anchor',
  dayColor: 'green' | 'yellow' | 'red' | undefined,
  prefs: NotificationPrefs
): boolean {
  if (!prefs.enabled) return false;
  if (dayColor === 'red' && !prefs.redDayOverride && type !== 'core') return false;
  return true;
}

export function getDownshiftTime(sleepWindowStart: string): string {
  const [hours, minutes] = sleepWindowStart.split(':').map(Number);
  const total = hours * 60 + minutes - 30;
  const clamped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
