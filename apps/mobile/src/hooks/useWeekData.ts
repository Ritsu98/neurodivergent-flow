import { useCallback, useEffect, useState } from 'react';
import type { DayThemeConfig, InboxItem, Task, TaskStatus, WeekPlan } from '@neurodivergent-flow/core';
import { getTodayDayIndex, getWeekStartDate, swapDayThemes } from '@neurodivergent-flow/core';
import {
  createTask,
  markInboxItemPromoted,
  softDeleteInboxItem,
  updateTask,
  updateWeekPlan,
} from '@neurodivergent-flow/api';
import { USER_ID } from '@/constants/user';
import { hydrateWeekFromRemote } from '@/lib/localData';
import { getLocalInboxItems } from '@/lib/sqlite/repositories/inbox';
import { getLocalTasks, saveLocalTask } from '@/lib/sqlite/repositories/tasks';
import { getLocalUserPrefs } from '@/lib/sqlite/repositories/userPrefs';
import { getLocalWeekPlan, saveLocalWeekPlan } from '@/lib/sqlite/repositories/weekPlan';
import { ensureLocalDatabase } from '@/lib/sqlite/db';

export type WeekTab = 'week' | 'inbox' | 'tasks';

export function useWeekData() {
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [workWindowDays, setWorkWindowDays] = useState<number[]>([]);
  const [workWindowTime, setWorkWindowTime] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const weekStart = getWeekStartDate();
  const todayIndex = getTodayDayIndex();

  const applyLocalState = useCallback(() => {
    ensureLocalDatabase();
    setWeekPlan(getLocalWeekPlan(USER_ID, weekStart));
    setInboxItems(getLocalInboxItems(USER_ID));
    setTasks(getLocalTasks(USER_ID));

    const prefs = getLocalUserPrefs(USER_ID);
    const days = prefs?.workWindows?.flatMap((w) => w.days) ?? [];
    setWorkWindowDays(days);
    const ww = prefs?.workWindows?.[0];
    setWorkWindowTime(ww ? `${ww.start} – ${ww.end}` : undefined);
  }, [weekStart]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      applyLocalState();
      await hydrateWeekFromRemote(USER_ID, weekStart);
      applyLocalState();
    } catch (error) {
      console.error('Failed to load week data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [applyLocalState, weekStart]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const saveDayThemes = async (dayThemes: DayThemeConfig[]) => {
    if (!weekPlan) return;
    const updated = await updateWeekPlan(weekPlan.id, { dayThemes });
    saveLocalWeekPlan(updated);
    setWeekPlan(updated);
  };

  const handleUpdateDay = async (updated: DayThemeConfig) => {
    if (!weekPlan) return;
    const dayThemes = weekPlan.dayThemes.map((d) => (d.day === updated.day ? updated : d));
    await saveDayThemes(dayThemes);
  };

  const handleSwapWithDay = async (selectedDay: number, otherDay: number) => {
    if (!weekPlan) return;
    await saveDayThemes(swapDayThemes(weekPlan.dayThemes, selectedDay, otherDay));
  };

  const handleDeleteInbox = async (id: string) => {
    await softDeleteInboxItem(id);
    setInboxItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handlePromoteInbox = async (
    item: InboxItem,
    day: number | null,
    status: TaskStatus
  ) => {
    const task = await createTask({
      userId: USER_ID,
      weekPlanId: weekPlan?.id,
      title: item.content,
      day: day ?? undefined,
      status,
      isMvdEssential: false,
    });
    saveLocalTask(task);
    await markInboxItemPromoted(item.id, task.id);
    await loadData();
  };

  const handleMoveTask = async (taskId: string, status: TaskStatus, day?: number) => {
    const updated = await updateTask(taskId, { status, day });
    saveLocalTask(updated);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status, day: day ?? t.day } : t))
    );
  };

  return {
    weekPlan,
    tasks,
    inboxItems,
    workWindowDays,
    workWindowTime,
    isLoading,
    weekStart,
    todayIndex,
    loadData,
    handleUpdateDay,
    handleSwapWithDay,
    handleDeleteInbox,
    handlePromoteInbox,
    handleMoveTask,
  };
}
