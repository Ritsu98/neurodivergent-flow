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
import { useAuth } from '@/hooks/useAuth';

interface UserPrefsContextValue {
  prefs: UserPrefs | null;
  notificationPrefs: NotificationPrefs;
  analyticsEnabled: boolean;
  isLoading: boolean;
  refreshPrefs: () => Promise<void>;
}

const UserPrefsContext = createContext<UserPrefsContextValue | null>(null);

export function UserPrefsProvider({ children }: { children: ReactNode }) {
  const { userId, isAuthenticated } = useAuth();
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPrefs = useCallback(async () => {
    if (!userId) {
      setPrefs(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await getUserPrefs(userId);
      setPrefs(data);
      const analyticsOn = isAnalyticsEnabled(data?.notificationPreferences);
      setAnalyticsEnabled(analyticsOn);
      initAnalytics(analyticsOn);
    } catch (error) {
      console.error('Failed to load user prefs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setPrefs(null);
      setIsLoading(false);
      return;
    }
    void refreshPrefs();
  }, [isAuthenticated, refreshPrefs]);

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
