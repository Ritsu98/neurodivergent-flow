import { useCallback, useEffect, useState } from 'react';
import type { DayThemeConfig, InboxItem, Task, TaskStatus, WeekPlan } from '@neurodivergent-flow/core';
import { getTodayDayIndex, getWeekStartDate, swapDayThemes } from '@neurodivergent-flow/core';
import {
  createTask,
  getInboxItems,
  getTasks,
  getUserPrefs,
  getWeekPlan,
  markInboxItemPromoted,
  softDeleteInboxItem,
  updateTask,
  updateWeekPlan,
} from '@neurodivergent-flow/api';
import { USER_ID } from '@/constants/user';

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

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [plan, prefs, inbox, allTasks] = await Promise.all([
        getWeekPlan(USER_ID, weekStart),
        getUserPrefs(USER_ID),
        getInboxItems(USER_ID),
        getTasks(USER_ID),
      ]);
      setWeekPlan(plan);
      setInboxItems(inbox);
      setTasks(allTasks);
      const days = prefs?.workWindows?.flatMap((w) => w.days) ?? [];
      setWorkWindowDays(days);
      const ww = prefs?.workWindows?.[0];
      if (ww) setWorkWindowTime(`${ww.start} – ${ww.end}`);
    } catch (error) {
      console.error('Failed to load week data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const saveDayThemes = async (dayThemes: DayThemeConfig[]) => {
    if (!weekPlan) return;
    const updated = await updateWeekPlan(weekPlan.id, { dayThemes });
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
    await markInboxItemPromoted(item.id, task.id);
    await loadData();
  };

  const handleMoveTask = async (taskId: string, status: TaskStatus, day?: number) => {
    await updateTask(taskId, { status, day });
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
