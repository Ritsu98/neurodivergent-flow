import {
  getDownshiftTime,
  MAX_NOTIFICATIONS_PER_DAY,
  shouldSendNotification,
  type NotificationPrefs,
} from '@neurodivergent-flow/core';
import type { DayColor, UserPrefs } from '@neurodivergent-flow/core';

const SENT_TODAY_KEY = 'nf_notifications_sent_date';
const SENT_COUNT_KEY = 'nf_notifications_sent_count';

function getSentCountToday(): number {
  const today = new Date().toISOString().split('T')[0];
  const storedDate = localStorage.getItem(SENT_TODAY_KEY);
  if (storedDate !== today) {
    localStorage.setItem(SENT_TODAY_KEY, today);
    localStorage.setItem(SENT_COUNT_KEY, '0');
    return 0;
  }
  return Number(localStorage.getItem(SENT_COUNT_KEY) ?? '0');
}

function incrementSentCount() {
  const count = getSentCountToday() + 1;
  localStorage.setItem(SENT_COUNT_KEY, String(count));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

function scheduleAt(timeHHmm: string, fire: () => void): (() => void) | null {
  const [h, m] = timeHHmm.split(':').map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= Date.now()) return null;
  const delay = target.getTime() - Date.now();
  const id = window.setTimeout(fire, delay);
  return () => window.clearTimeout(id);
}

function showNotification(
  title: string,
  body: string,
  tag: string,
  dayColor: DayColor | undefined,
  prefs: NotificationPrefs,
  type: 'core' | 'anchor'
) {
  if (!shouldSendNotification(type, dayColor, prefs)) return;
  if (getSentCountToday() >= MAX_NOTIFICATIONS_PER_DAY) return;
  if (Notification.permission !== 'granted') return;

  const redSuffix = dayColor === 'red' ? ' Skip is fine.' : '';
  new Notification(title, {
    body: `${body}${redSuffix}`,
    tag,
    icon: '/icon-192.png',
  });
  incrementSentCount();
}

export function scheduleDailyNotifications(
  prefs: UserPrefs | null,
  notificationPrefs: NotificationPrefs,
  dayColor: DayColor | undefined
): () => void {
  const cleanups: Array<() => void> = [];

  if (!notificationPrefs.enabled || Notification.permission !== 'granted') {
    return () => {};
  }

  if (notificationPrefs.downshift && prefs?.sleepWindowStart && prefs.downshiftReminderEnabled) {
    const time = getDownshiftTime(prefs.sleepWindowStart);
    const cancel = scheduleAt(time, () =>
      showNotification(
        'Time to wind down',
        'Start your downshift routine?',
        'downshift',
        dayColor,
        notificationPrefs,
        'anchor'
      )
    );
    if (cancel) cleanups.push(cancel);
  }

  const workWindow = prefs?.workWindows?.[0];
  if (notificationPrefs.primaryBlock && workWindow?.end) {
    const cancel = scheduleAt(workWindow.end, () =>
      showNotification(
        'Work window ending',
        'Ready for your Primary Block?',
        'primary-block',
        dayColor,
        notificationPrefs,
        'anchor'
      )
    );
    if (cancel) cleanups.push(cancel);
  }

  return () => cleanups.forEach((fn) => fn());
}
