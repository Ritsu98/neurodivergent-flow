import {
  createInboxItem,
  createTask,
  createWeekPlan,
  markInboxItemPromoted,
  softDeleteInboxItem,
  updateTask,
  updateWeekPlan,
  upsertEnergyLog,
  upsertUserPrefs,
} from '@neurodivergent-flow/api';
import type { EnergyPeriod, Task, UserPrefs, WeekPlan } from '@neurodivergent-flow/core';
import { upsertLocalEnergyLogFromRemote } from '@/lib/sqlite/repositories/energyLog';
import { deleteLocalInboxItem, saveLocalInboxItem } from '@/lib/sqlite/repositories/inbox';
import { deleteLocalTask, saveLocalTask } from '@/lib/sqlite/repositories/tasks';
import { saveLocalUserPrefs } from '@/lib/sqlite/repositories/userPrefs';
import { deleteLocalWeekPlan, saveLocalWeekPlan } from '@/lib/sqlite/repositories/weekPlan';
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
    case 'createTask': {
      const localId = payload.localId as string;
      const task = payload.task as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
      const saved = await createTask(task);
      deleteLocalTask(localId);
      saveLocalTask(saved);
      return;
    }
    case 'updateTask': {
      const taskId = payload.taskId as string;
      const updates = payload.updates as Partial<Task>;
      const saved = await updateTask(taskId, updates);
      saveLocalTask(saved);
      return;
    }
    case 'createInboxItem': {
      const localId = payload.localId as string;
      const userId = payload.userId as string;
      const content = payload.content as string;
      const capturedAt = payload.capturedAt as string | undefined;
      const saved = await createInboxItem(userId, content, capturedAt);
      deleteLocalInboxItem(localId);
      saveLocalInboxItem(saved);
      return;
    }
    case 'softDeleteInboxItem': {
      const inboxItemId = payload.inboxItemId as string;
      await softDeleteInboxItem(inboxItemId);
      return;
    }
    case 'markInboxItemPromoted': {
      const inboxItemId = payload.inboxItemId as string;
      const taskId = payload.taskId as string;
      const saved = await markInboxItemPromoted(inboxItemId, taskId);
      saveLocalInboxItem(saved);
      return;
    }
    case 'upsertUserPrefs': {
      const userId = payload.userId as string;
      const prefs = payload.prefs as Partial<UserPrefs>;
      const saved = await upsertUserPrefs(userId, prefs);
      saveLocalUserPrefs(saved);
      return;
    }
    case 'updateWeekPlan': {
      const weekPlanId = payload.weekPlanId as string;
      const updates = payload.updates as Partial<WeekPlan>;
      const saved = await updateWeekPlan(weekPlanId, updates);
      saveLocalWeekPlan(saved);
      return;
    }
    case 'createWeekPlan': {
      const localId = payload.localId as string;
      const weekPlan = payload.weekPlan as Omit<WeekPlan, 'id' | 'createdAt' | 'updatedAt'>;
      const saved = await createWeekPlan(weekPlan);
      deleteLocalWeekPlan(localId);
      saveLocalWeekPlan(saved);
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
