import {
  createInboxItem,
  createTask,
  createWeekPlan,
  getEnergyLog,
  getInboxItems,
  getTasks,
  getUserPrefs,
  getWeekPlan,
  markInboxItemPromoted,
  softDeleteInboxItem,
  updateTask,
  updateWeekPlan,
  upsertEnergyLog,
  upsertUserPrefs,
} from '@neurodivergent-flow/api';
import type {
  EnergyPeriod,
  InboxItem,
  Task,
  TaskStatus,
  UserPrefs,
  WeekPlan,
} from '@neurodivergent-flow/core';
import { getLocalEnergyLog, saveLocalEnergyLog, upsertLocalEnergyLogFromRemote } from '@/lib/sqlite/repositories/energyLog';
import {
  deleteLocalInboxItem,
  getLocalInboxItem,
  getLocalInboxItems,
  saveLocalInboxItem,
  saveLocalInboxItems,
} from '@/lib/sqlite/repositories/inbox';
import {
  deleteLocalTask,
  getLocalTask,
  getLocalTasks,
  saveLocalTask,
  saveLocalTasks,
} from '@/lib/sqlite/repositories/tasks';
import { getLocalUserPrefs, saveLocalUserPrefs } from '@/lib/sqlite/repositories/userPrefs';
import { getLocalWeekPlan, getLocalWeekPlanById, saveLocalWeekPlan, deleteLocalWeekPlan } from '@/lib/sqlite/repositories/weekPlan';
import { shouldApplyRemote } from '@/lib/sync/conflict';
import { generateLocalId } from '@/lib/sync/ids';
import { enqueueMutation } from '@/lib/sync/queue';
import { isOnline } from '@/lib/sync/network';

async function tryRemote<T>(fn: () => Promise<T>): Promise<T | null> {
  if (!(await isOnline())) return null;
  try {
    return await fn();
  } catch (error) {
    console.error('[local] Remote call failed, queueing:', error);
    return null;
  }
}

function mergeRemoteTasks(userId: string, remoteTasks: Task[]): void {
  const localTasks = getLocalTasks(userId);
  const localById = new Map(localTasks.map((t) => [t.id, t]));
  const remoteIds = new Set(remoteTasks.map((t) => t.id));
  const merged: Task[] = [];

  for (const remote of remoteTasks) {
    const local = localById.get(remote.id);
    merged.push(
      !local || shouldApplyRemote(local.updatedAt, remote.updatedAt) ? remote : local
    );
  }

  for (const local of localTasks) {
    if (!remoteIds.has(local.id)) merged.push(local);
  }

  saveLocalTasks(userId, merged);
}

function mergeRemoteInboxItems(userId: string, remoteItems: InboxItem[]): void {
  const localItems = getLocalInboxItems(userId);
  const localById = new Map(localItems.map((i) => [i.id, i]));
  const remoteIds = new Set(remoteItems.map((i) => i.id));
  const merged: InboxItem[] = [];

  for (const remote of remoteItems) {
    const local = localById.get(remote.id);
    const remoteUpdated = remote.deletedAt ?? remote.createdAt;
    const localUpdated = local?.deletedAt ?? local?.createdAt;
    merged.push(!local || shouldApplyRemote(localUpdated, remoteUpdated) ? remote : local);
  }

  for (const local of localItems) {
    if (!remoteIds.has(local.id)) merged.push(local);
  }

  saveLocalInboxItems(userId, merged);
}

export async function hydrateTodayFromRemote(
  userId: string,
  today: string,
  weekStart: string,
  dayIndex: number
): Promise<void> {
  if (!(await isOnline())) return;

  try {
    const [energyLog, plan, todayTasks, prefs] = await Promise.all([
      getEnergyLog(userId, today, 'am'),
      getWeekPlan(userId, weekStart),
      getTasks(userId, { day: dayIndex, status: 'today' }),
      getUserPrefs(userId),
    ]);

    if (energyLog) {
      const local = getLocalEnergyLog(userId, today, 'am');
      if (!local || shouldApplyRemote(local.createdAt, energyLog.createdAt)) {
        upsertLocalEnergyLogFromRemote(energyLog);
      }
    }
    if (plan) {
      const local = getLocalWeekPlan(userId, weekStart);
      if (!local || shouldApplyRemote(local.updatedAt, plan.updatedAt)) {
        saveLocalWeekPlan(plan);
      }
    }
    if (todayTasks.length) mergeRemoteTasks(userId, todayTasks);
    if (prefs) {
      const local = getLocalUserPrefs(userId);
      if (!local || shouldApplyRemote(local.updatedAt, prefs.updatedAt)) {
        saveLocalUserPrefs(prefs);
      }
    }
  } catch (error) {
    console.error('[local] Failed to hydrate from remote:', error);
  }
}

export async function saveEnergyLogLocalFirst(
  userId: string,
  loggedAt: string,
  period: EnergyPeriod,
  value: number
): Promise<void> {
  const existing = getLocalEnergyLog(userId, loggedAt, period);
  saveLocalEnergyLog(userId, loggedAt, period, value, existing?.id);

  const saved = await tryRemote(() => upsertEnergyLog(userId, loggedAt, period, value));
  if (saved) {
    upsertLocalEnergyLogFromRemote(saved);
    return;
  }

  enqueueMutation('upsertEnergyLog', { userId, loggedAt, period, value });
}

export async function createTaskLocalFirst(
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Task> {
  const now = new Date().toISOString();
  const localId = generateLocalId('task');
  const localTask: Task = { ...task, id: localId, createdAt: now, updatedAt: now };
  saveLocalTask(localTask);

  const saved = await tryRemote(() => createTask(task));
  if (saved) {
    deleteLocalTask(localId);
    saveLocalTask(saved);
    return saved;
  }

  enqueueMutation('createTask', { localId, task });
  return localTask;
}

export async function updateTaskLocalFirst(
  taskId: string,
  updates: Partial<Task>
): Promise<Task> {
  const existing = getLocalTask(taskId);
  if (!existing) throw new Error(`Task not found locally: ${taskId}`);

  const now = new Date().toISOString();
  const merged: Task = {
    ...existing,
    ...updates,
    updatedAt: now,
    completedAt:
      updates.status === 'done' && !updates.completedAt ? now : (updates.completedAt ?? existing.completedAt),
  };
  saveLocalTask(merged);

  const saved = await tryRemote(() => updateTask(taskId, updates));
  if (saved) {
    saveLocalTask(saved);
    return saved;
  }

  enqueueMutation('updateTask', { taskId, updates });
  return merged;
}

export async function createInboxItemLocalFirst(
  userId: string,
  content: string,
  capturedAt?: string
): Promise<InboxItem> {
  const now = capturedAt ?? new Date().toISOString();
  const localId = generateLocalId('inbox');
  const localItem: InboxItem = {
    id: localId,
    userId,
    content,
    capturedAt: now,
    createdAt: now,
  };
  saveLocalInboxItem(localItem);

  const saved = await tryRemote(() => createInboxItem(userId, content, capturedAt));
  if (saved) {
    deleteLocalInboxItem(localId);
    saveLocalInboxItem(saved);
    return saved;
  }

  enqueueMutation('createInboxItem', { localId, userId, content, capturedAt: now });
  return localItem;
}

export async function softDeleteInboxItemLocalFirst(inboxItemId: string): Promise<void> {
  const existing = getLocalInboxItem(inboxItemId);
  if (!existing) return;

  const now = new Date().toISOString();
  saveLocalInboxItem({ ...existing, deletedAt: now });

  const deleted = await tryRemote(() => softDeleteInboxItem(inboxItemId));
  if (deleted !== null) return;

  enqueueMutation('softDeleteInboxItem', { inboxItemId });
}

export async function markInboxItemPromotedLocalFirst(
  inboxItemId: string,
  taskId: string
): Promise<InboxItem> {
  const existing = getLocalInboxItem(inboxItemId);
  if (!existing) throw new Error(`Inbox item not found locally: ${inboxItemId}`);

  const promoted: InboxItem = { ...existing, promotedToTaskId: taskId };
  saveLocalInboxItem(promoted);

  const saved = await tryRemote(() => markInboxItemPromoted(inboxItemId, taskId));
  if (saved) {
    saveLocalInboxItem(saved);
    return saved;
  }

  enqueueMutation('markInboxItemPromoted', { inboxItemId, taskId });
  return promoted;
}

export async function upsertUserPrefsLocalFirst(
  userId: string,
  prefs: Partial<UserPrefs>
): Promise<UserPrefs> {
  const current = getLocalUserPrefs(userId);
  const now = new Date().toISOString();
  const merged: UserPrefs = {
    id: current?.id ?? generateLocalId('prefs'),
    userId,
    workMode: prefs.workMode ?? current?.workMode ?? 'none',
    weekIntensityDefault: prefs.weekIntensityDefault ?? current?.weekIntensityDefault ?? 'normal',
    downshiftReminderEnabled:
      prefs.downshiftReminderEnabled ?? current?.downshiftReminderEnabled ?? true,
    rechargeDefaults: prefs.rechargeDefaults ?? current?.rechargeDefaults ?? [],
    notificationPreferences: {
      ...(current?.notificationPreferences ?? {}),
      ...(prefs.notificationPreferences ?? {}),
    },
    highContrastEnabled: prefs.highContrastEnabled ?? current?.highContrastEnabled ?? false,
    reducedMotionEnabled: prefs.reducedMotionEnabled ?? current?.reducedMotionEnabled ?? false,
    hapticsEnabled: prefs.hapticsEnabled ?? current?.hapticsEnabled ?? true,
    soundEnabled: prefs.soundEnabled ?? current?.soundEnabled ?? true,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
    workWindows: prefs.workWindows !== undefined ? prefs.workWindows : current?.workWindows,
    afterWorkEnergy: prefs.afterWorkEnergy ?? current?.afterWorkEnergy,
    preferredPrimaryBlockTime:
      prefs.preferredPrimaryBlockTime ?? current?.preferredPrimaryBlockTime,
    sleepWindowStart: prefs.sleepWindowStart ?? current?.sleepWindowStart,
    sleepWindowEnd: prefs.sleepWindowEnd ?? current?.sleepWindowEnd,
    runnerSettings: prefs.runnerSettings ?? current?.runnerSettings,
  };
  saveLocalUserPrefs(merged);

  const saved = await tryRemote(() => upsertUserPrefs(userId, prefs));
  if (saved) {
    saveLocalUserPrefs(saved);
    return saved;
  }

  enqueueMutation('upsertUserPrefs', { userId, prefs });
  return merged;
}

export async function updateWeekPlanLocalFirst(
  weekPlanId: string,
  updates: Partial<WeekPlan>
): Promise<WeekPlan> {
  const plan = getLocalWeekPlanById(weekPlanId);
  if (!plan) throw new Error(`Week plan not found locally: ${weekPlanId}`);

  const now = new Date().toISOString();
  const merged: WeekPlan = { ...plan, ...updates, updatedAt: now };
  saveLocalWeekPlan(merged);

  const saved = await tryRemote(() => updateWeekPlan(weekPlanId, updates));
  if (saved) {
    saveLocalWeekPlan(saved);
    return saved;
  }

  enqueueMutation('updateWeekPlan', { weekPlanId, updates });
  return merged;
}

export async function createWeekPlanLocalFirst(
  weekPlan: Omit<WeekPlan, 'id' | 'createdAt' | 'updatedAt'>
): Promise<WeekPlan> {
  const now = new Date().toISOString();
  const localId = generateLocalId('week');
  const localPlan: WeekPlan = {
    ...weekPlan,
    id: localId,
    createdAt: now,
    updatedAt: now,
  };
  saveLocalWeekPlan(localPlan);

  const saved = await tryRemote(() => createWeekPlan(weekPlan));
  if (saved) {
    deleteLocalWeekPlan(localId);
    saveLocalWeekPlan(saved);
    return saved;
  }

  enqueueMutation('createWeekPlan', { localId, weekPlan });
  return localPlan;
}

export async function hydrateWeekFromRemote(userId: string, weekStart: string): Promise<void> {
  if (!(await isOnline())) return;

  try {
    const [plan, prefs, inbox, allTasks] = await Promise.all([
      getWeekPlan(userId, weekStart),
      getUserPrefs(userId),
      getInboxItems(userId),
      getTasks(userId),
    ]);
    if (plan) {
      const local = getLocalWeekPlan(userId, weekStart);
      if (!local || shouldApplyRemote(local.updatedAt, plan.updatedAt)) {
        saveLocalWeekPlan(plan);
      }
    }
    if (prefs) {
      const local = getLocalUserPrefs(userId);
      if (!local || shouldApplyRemote(local.updatedAt, prefs.updatedAt)) {
        saveLocalUserPrefs(prefs);
      }
    }
    if (inbox.length) mergeRemoteInboxItems(userId, inbox);
    if (allTasks.length) mergeRemoteTasks(userId, allTasks);
  } catch (error) {
    console.error('[local] Failed to hydrate week from remote:', error);
  }
}
