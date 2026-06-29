import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { View } from 'react-native';
import type { UserPrefs } from '@neurodivergent-flow/core';
import { parseNotificationPrefs, type NotificationPrefs } from '@neurodivergent-flow/core';
import { getUserPrefs } from '@neurodivergent-flow/api';
import { ensureLocalDatabase } from '@/lib/sqlite/db';
import { getLocalUserPrefs, saveLocalUserPrefs } from '@/lib/sqlite/repositories/userPrefs';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

interface UserPrefsContextValue {
  prefs: UserPrefs | null;
  notificationPrefs: NotificationPrefs;
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
      ensureLocalDatabase();
      const local = getLocalUserPrefs(userId);
      if (local) setPrefs(local);

      const data = await getUserPrefs(userId);
      if (data) {
        saveLocalUserPrefs(data);
        setPrefs(data);
      } else {
        setPrefs(null);
      }
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

  const rootClassName = cn(
    'flex-1 bg-gray-50',
    prefs?.highContrastEnabled && 'high-contrast',
    prefs?.reducedMotionEnabled && 'reduced-motion'
  );

  const notificationPrefs = parseNotificationPrefs(prefs?.notificationPreferences);

  return (
    <UserPrefsContext.Provider value={{ prefs, notificationPrefs, isLoading, refreshPrefs }}>
      <View className={rootClassName}>{children}</View>
    </UserPrefsContext.Provider>
  );
}

export function useUserPrefsContext() {
  const ctx = useContext(UserPrefsContext);
  if (!ctx) throw new Error('useUserPrefsContext must be used within UserPrefsProvider');
  return ctx;
}
