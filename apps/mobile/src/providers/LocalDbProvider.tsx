import { useEffect, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { ensureLocalDatabase } from '@/lib/sqlite/db';
import { flushSyncQueue } from '@/lib/sync/flush';
import { subscribeOnline } from '@/lib/sync/network';

export function LocalDbProvider({ children }: { children: ReactNode }) {
  ensureLocalDatabase();

  useEffect(() => {
    void flushSyncQueue();
  }, []);

  useEffect(() => {
    const unsubNet = subscribeOnline((online) => {
      if (online) void flushSyncQueue();
    });

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void flushSyncQueue();
    });

    return () => {
      unsubNet();
      appStateSub.remove();
    };
  }, []);

  return <>{children}</>;
}
