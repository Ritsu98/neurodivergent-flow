import { upsertEnergyLog } from '@neurodivergent-flow/api';
import type { EnergyPeriod } from '@neurodivergent-flow/core';
import { upsertLocalEnergyLogFromRemote } from '@/lib/sqlite/repositories/energyLog';
import {
  getQueuedMutations,
  incrementMutationRetry,
  removeQueuedMutation,
} from '@/lib/sync/queue';
import { isOnline } from '@/lib/sync/network';

const MAX_RETRIES = 3;

async function handleMutation(type: string, payload: Record<string, unknown>): Promise<void> {
  switch (type) {
    case 'upsertEnergyLog': {
      const userId = payload.userId as string;
      const loggedAt = payload.loggedAt as string;
      const period = payload.period as EnergyPeriod;
      const value = payload.value as number;
      const saved = await upsertEnergyLog(userId, loggedAt, period, value);
      upsertLocalEnergyLogFromRemote(saved);
      return;
    }
    default:
      console.warn('[sync] Unhandled mutation type:', type);
  }
}

export async function flushSyncQueue(): Promise<void> {
  if (!(await isOnline())) return;

  const queue = getQueuedMutations();
  for (const item of queue) {
    try {
      await handleMutation(item.type, item.payload);
      removeQueuedMutation(item.id);
    } catch (error) {
      console.error('[sync] Failed to flush mutation:', item.type, error);
      if (item.retries >= MAX_RETRIES) {
        removeQueuedMutation(item.id);
      } else {
        incrementMutationRetry(item.id);
      }
    }
  }
}
