'use client';

import { useEffect } from 'react';
import { getQueuedMutations, isOnline, removeQueuedMutation } from '@/lib/offlineQueue';

/**
 * Processes offline mutation queue when connectivity returns.
 * Handlers are registered per mutation type as sync layer expands.
 */
export function OfflineSyncListener() {
  useEffect(() => {
    const flush = async () => {
      if (!isOnline()) return;
      const queue = await getQueuedMutations();
      for (const item of queue) {
        // Stage 6 foundation: queue drain logs pending work until handlers wire up
        console.info('[offline-sync] pending mutation:', item.type, item.id);
        await removeQueuedMutation(item.id);
      }
    };

    window.addEventListener('online', flush);
    void flush();
    return () => window.removeEventListener('online', flush);
  }, []);

  return null;
}
