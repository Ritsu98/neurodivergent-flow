import { useCallback, useEffect, useState } from 'react';
import type { DayThemeConfig, InboxItem, Task, TaskStatus, WeekPlan } from '@neurodivergent-flow/core';
import { getTodayDayIndex, getWeekStartDate, swapDayThemes } from '@neurodivergent-flow/core';
import { useAuth } from '@/hooks/useAuth';
import {
  createTaskLocalFirst,
  hydrateWeekFromRemote,
  markInboxItemPromotedLocalFirst,
  softDeleteInboxItemLocalFirst,
  updateTaskLocalFirst,
  updateWeekPlanLocalFirst,
} from '@/lib/localData';
import { getLocalInboxItems } from '@/lib/sqlite/repositories/inbox';
import { getLocalTasks } from '@/lib/sqlite/repositories/tasks';
import { getLocalUserPrefs } from '@/lib/sqlite/repositories/userPrefs';
import { getLocalWeekPlan } from '@/lib/sqlite/repositories/weekPlan';
import { ensureLocalDatabase } from '@/lib/sqlite/db';

export type WeekTab = 'week' | 'inbox' | 'tasks';

export function useWeekData() {
  const { userId } = useAuth();
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [workWindowDays, setWorkWindowDays] = useState<number[]>([]);
  const [workWindowTime, setWorkWindowTime] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const weekStart = getWeekStartDate();
  const todayIndex = getTodayDayIndex();

  const applyLocalState = useCallback(() => {
    if (!userId) return;
    ensureLocalDatabase();
    setWeekPlan(getLocalWeekPlan(userId, weekStart));
    setInboxItems(getLocalInboxItems(userId));
    setTasks(getLocalTasks(userId));

    const prefs = getLocalUserPrefs(userId);
    const days = prefs?.workWindows?.flatMap((w) => w.days) ?? [];
    setWorkWindowDays(days);
    const ww = prefs?.workWindows?.[0];
    setWorkWindowTime(ww ? `${ww.start} – ${ww.end}` : undefined);
  }, [userId, weekStart]);

  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      applyLocalState();
      await hydrateWeekFromRemote(userId, weekStart);
      applyLocalState();
    } catch (error) {
      console.error('Failed to load week data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [applyLocalState, weekStart, userId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const saveDayThemes = async (dayThemes: DayThemeConfig[]) => {
    if (!weekPlan) return;
    const updated = await updateWeekPlanLocalFirst(weekPlan.id, { dayThemes });
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
    await softDeleteInboxItemLocalFirst(id);
    setInboxItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handlePromoteInbox = async (
    item: InboxItem,
    day: number | null,
    status: TaskStatus
  ) => {
    if (!userId) return;
    const task = await createTaskLocalFirst({
      userId,
      weekPlanId: weekPlan?.id,
      title: item.content,
      day: day ?? undefined,
      status,
      isMvdEssential: false,
    });
    await markInboxItemPromotedLocalFirst(item.id, task.id);
    await loadData();
  };

  const handleMoveTask = async (taskId: string, status: TaskStatus, day?: number) => {
    const updated = await updateTaskLocalFirst(taskId, { status, day });
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? updated : t))
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
