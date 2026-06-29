import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  getDownshiftTime,
  MAX_NOTIFICATIONS_PER_DAY,
  shouldSendNotification,
  type DayColor,
  type NotificationPrefs,
  type UserPrefs,
} from '@neurodivergent-flow/core';

const SENT_TODAY_KEY = 'nf_notifications_sent_date';
const SENT_COUNT_KEY = 'nf_notifications_sent_count';
const DOWNSHIFT_ID = 'downshift-reminder';
const PRIMARY_BLOCK_ID = 'primary-block-reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function getSentCountToday(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const storedDate = await AsyncStorage.getItem(SENT_TODAY_KEY);
  if (storedDate !== today) {
    await AsyncStorage.setItem(SENT_TODAY_KEY, today);
    await AsyncStorage.setItem(SENT_COUNT_KEY, '0');
    return 0;
  }
  return Number((await AsyncStorage.getItem(SENT_COUNT_KEY)) ?? '0');
}

export async function incrementSentCount(): Promise<void> {
  const count = (await getSentCountToday()) + 1;
  await AsyncStorage.setItem(SENT_COUNT_KEY, String(count));
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  await ensureAndroidChannel();
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function parseTimeToDate(timeHHmm: string): Date | null {
  const [h, m] = timeHHmm.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= Date.now()) return null;
  return target;
}

async function scheduleAt(
  identifier: string,
  timeHHmm: string,
  title: string,
  body: string,
  dayColor: DayColor | undefined,
  prefs: NotificationPrefs,
  type: 'core' | 'anchor',
  data?: Record<string, unknown>
): Promise<void> {
  if (!shouldSendNotification(type, dayColor, prefs)) return;

  const sent = await getSentCountToday();
  if (sent >= MAX_NOTIFICATIONS_PER_DAY) return;

  const triggerDate = parseTimeToDate(timeHHmm);
  if (!triggerDate) return;

  const redSuffix = dayColor === 'red' ? ' Skip is fine.' : '';

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body: `${body}${redSuffix}`,
      data: data ?? {},
      ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
    },
    trigger: triggerDate,
  });
}

export async function cancelScheduledNotifications(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DOWNSHIFT_ID);
  await Notifications.cancelScheduledNotificationAsync(PRIMARY_BLOCK_ID);
}

export async function scheduleDailyNotifications(
  prefs: UserPrefs | null,
  notificationPrefs: NotificationPrefs,
  dayColor: DayColor | undefined
): Promise<void> {
  await cancelScheduledNotifications();

  const { status } = await Notifications.getPermissionsAsync();
  if (!notificationPrefs.enabled || status !== 'granted') return;

  if (notificationPrefs.downshift && prefs?.sleepWindowStart && prefs.downshiftReminderEnabled) {
    const time = getDownshiftTime(prefs.sleepWindowStart);
    await scheduleAt(
      DOWNSHIFT_ID,
      time,
      'Time to wind down',
      'Start your downshift routine?',
      dayColor,
      notificationPrefs,
      'anchor',
      { url: '/runner/recharge' }
    );
  }

  const workWindow = prefs?.workWindows?.[0];
  if (notificationPrefs.primaryBlock && workWindow?.end) {
    await scheduleAt(
      PRIMARY_BLOCK_ID,
      workWindow.end,
      'Work window ending',
      'Ready for your Primary Block?',
      dayColor,
      notificationPrefs,
      'anchor',
      { url: '/runner/focus' }
    );
  }
}
