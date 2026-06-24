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
import { USER_ID } from '@/constants/user';
import { cn } from '@/lib/cn';

interface UserPrefsContextValue {
  prefs: UserPrefs | null;
  notificationPrefs: NotificationPrefs;
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
    } catch (error) {
      console.error('Failed to load user prefs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPrefs();
  }, [refreshPrefs]);

  const notificationPrefs = parseNotificationPrefs(prefs?.notificationPreferences);

  const rootClassName = cn(
    'flex-1 bg-gray-50',
    prefs?.highContrastEnabled && 'high-contrast',
    prefs?.reducedMotionEnabled && 'reduced-motion'
  );

  return (
    <UserPrefsContext.Provider
      value={{
        prefs,
        notificationPrefs,
        isLoading,
        refreshPrefs,
      }}
    >
      <View className={rootClassName}>{children}</View>
    </UserPrefsContext.Provider>
  );
}

export function useUserPrefsContext() {
  const ctx = useContext(UserPrefsContext);
  if (!ctx) throw new Error('useUserPrefsContext must be used within UserPrefsProvider');
  return ctx;
}
