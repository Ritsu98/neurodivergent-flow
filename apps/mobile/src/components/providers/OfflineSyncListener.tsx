import { useEffect } from 'react';
import { flushSyncQueue } from '@/lib/sync/flush';
import { subscribeOnline } from '@/lib/sync/network';

export function OfflineSyncListener() {
  useEffect(() => {
    void flushSyncQueue();

    const unsub = subscribeOnline((online) => {
      if (online) void flushSyncQueue();
    });

    return unsub;
  }, []);

  return null;
}
