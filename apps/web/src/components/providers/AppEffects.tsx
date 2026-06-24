'use client';

import { useEffect } from 'react';
import { useUserPrefsContext } from '@/components/providers/UserPrefsProvider';
import { getEnergyLog } from '@neurodivergent-flow/api';
import type { DayColor } from '@neurodivergent-flow/core';
import { scheduleDailyNotifications } from '@/lib/webNotifications';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

const USER_ID = 'temp-user-id';

export function AppEffects() {
  const { prefs, notificationPrefs } = useUserPrefsContext();

  useEffect(() => {
    trackEvent(AnalyticsEvents.appOpen);
  }, []);

  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;

    async function setup() {
      const log = await getEnergyLog(USER_ID, new Date().toISOString().split('T')[0], 'am');
      if (cancelled) return;
      const dayColor = log?.dayColor as DayColor | undefined;
      cleanup = scheduleDailyNotifications(prefs, notificationPrefs, dayColor);
    }

    void setup();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [prefs, notificationPrefs]);

  return null;
}
