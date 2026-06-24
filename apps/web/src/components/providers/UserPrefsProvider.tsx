'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { UserPrefs } from '@neurodivergent-flow/core';
import {
  isAnalyticsEnabled,
  parseNotificationPrefs,
  type NotificationPrefs,
} from '@neurodivergent-flow/core';
import { getUserPrefs } from '@neurodivergent-flow/api';
import { initAnalytics, setAnalyticsEnabled } from '@/lib/analytics';

const USER_ID = 'temp-user-id';

interface UserPrefsContextValue {
  prefs: UserPrefs | null;
  notificationPrefs: NotificationPrefs;
  analyticsEnabled: boolean;
  isLoading: boolean;
  refreshPrefs: () => Promise<void>;
}

const UserPrefsContext = createContext<UserPrefsContextValue | null>(null);

export function UserPrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPrefs = useCallback(async () => {
    try {
      const data = await getUserPrefs(USER_ID);
      setPrefs(data);
      const analyticsOn = isAnalyticsEnabled(data?.notificationPreferences);
      setAnalyticsEnabled(analyticsOn);
      initAnalytics(analyticsOn);
    } catch (error) {
      console.error('Failed to load user prefs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPrefs();
  }, [refreshPrefs]);

  useEffect(() => {
    if (!prefs) return;
    const root = document.documentElement;
    root.classList.toggle('high-contrast', prefs.highContrastEnabled);
    root.classList.toggle('reduced-motion', prefs.reducedMotionEnabled);
  }, [prefs?.highContrastEnabled, prefs?.reducedMotionEnabled]);

  const notificationPrefs = parseNotificationPrefs(prefs?.notificationPreferences);
  const analyticsEnabled = isAnalyticsEnabled(prefs?.notificationPreferences);

  return (
    <UserPrefsContext.Provider
      value={{
        prefs,
        notificationPrefs,
        analyticsEnabled,
        isLoading,
        refreshPrefs,
      }}
    >
      {children}
    </UserPrefsContext.Provider>
  );
}

export function useUserPrefsContext() {
  const ctx = useContext(UserPrefsContext);
  if (!ctx) throw new Error('useUserPrefsContext must be used within UserPrefsProvider');
  return ctx;
}
