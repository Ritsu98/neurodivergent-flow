import { useEffect } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { getEnergyLog } from '@neurodivergent-flow/api';
import type { DayColor } from '@neurodivergent-flow/core';
import { useUserPrefsContext } from '@/providers/UserPrefsProvider';
import { useAuth } from '@/hooks/useAuth';
import { scheduleDailyNotifications } from '@/lib/notifications';

export function AppEffects() {
  const { userId } = useAuth();
  const { prefs, notificationPrefs } = useUserPrefsContext();

  useEffect(() => {
    if (!userId) return;

    void (async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const log = await getEnergyLog(userId, today, 'am');
        const dayColor = log?.dayColor as DayColor | undefined;
        await scheduleDailyNotifications(prefs, notificationPrefs, dayColor);
      } catch (error) {
        console.error('Failed to schedule notifications:', error);
      }
    })();
  }, [userId, prefs, notificationPrefs]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url;
      if (typeof url === 'string') {
        router.push(url as '/runner/focus');
      }
    });
    return () => sub.remove();
  }, []);

  return null;
}
