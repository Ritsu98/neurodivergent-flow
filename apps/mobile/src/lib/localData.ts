import {
  getEnergyLog,
  getInboxItems,
  getTasks,
  getUserPrefs,
  getWeekPlan,
  upsertEnergyLog,
} from '@neurodivergent-flow/api';
import { getLocalEnergyLog, saveLocalEnergyLog, upsertLocalEnergyLogFromRemote } from '@/lib/sqlite/repositories/energyLog';
import { saveLocalInboxItems } from '@/lib/sqlite/repositories/inbox';
import { saveLocalTasks } from '@/lib/sqlite/repositories/tasks';
import { saveLocalUserPrefs } from '@/lib/sqlite/repositories/userPrefs';
import { saveLocalWeekPlan } from '@/lib/sqlite/repositories/weekPlan';
import { enqueueMutation } from '@/lib/sync/queue';
import { isOnline } from '@/lib/sync/network';
import type { EnergyPeriod } from '@neurodivergent-flow/core';
import { dayColorFromEnergy } from '@/lib/today';

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

    if (energyLog) upsertLocalEnergyLogFromRemote(energyLog);
    if (plan) saveLocalWeekPlan(plan);
    if (todayTasks.length) saveLocalTasks(userId, todayTasks);
    if (prefs) saveLocalUserPrefs(prefs);
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

  if (await isOnline()) {
    try {
      const saved = await upsertEnergyLog(userId, loggedAt, period, value);
      upsertLocalEnergyLogFromRemote(saved);
      return;
    } catch (error) {
      console.error('[local] Remote energy save failed, queueing:', error);
    }
  }

  enqueueMutation('upsertEnergyLog', { userId, loggedAt, period, value });
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
    if (plan) saveLocalWeekPlan(plan);
    if (prefs) saveLocalUserPrefs(prefs);
    if (inbox.length) saveLocalInboxItems(userId, inbox);
    if (allTasks.length) saveLocalTasks(userId, allTasks);
  } catch (error) {
    console.error('[local] Failed to hydrate week from remote:', error);
  }
}

