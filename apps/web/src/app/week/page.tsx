'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppNav } from '@/components/layout/AppNav';
import { WeekGlance } from '@/components/week/WeekGlance';
import { DayDetailView, swapDayThemes } from '@/components/week/DayDetailView';
import { InboxPanel } from '@/components/week/InboxPanel';
import { TaskBoard } from '@/components/week/TaskBoard';
import type { DayThemeConfig, InboxItem, Task, TaskStatus, WeekPlan } from '@neurodivergent-flow/core';
import {
  getWeekStartDate,
  getTodayDayIndex,
} from '@neurodivergent-flow/core';
import {
  getWeekPlan,
  updateWeekPlan,
  getUserPrefs,
  getInboxItems,
  softDeleteInboxItem,
  markInboxItemPromoted,
  getTasks,
  createTask,
  updateTask,
} from '@neurodivergent-flow/api';
import { useAuth } from '@/hooks/useAuth';

type Tab = 'week' | 'inbox' | 'tasks';

export default function WeekPage() {
  const { userId } = useAuth();
  const [tab, setTab] = useState<Tab>('week');
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [workWindowDays, setWorkWindowDays] = useState<number[]>([]);
  const [workWindowTime, setWorkWindowTime] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const weekStart = getWeekStartDate();
  const todayIndex = getTodayDayIndex();

  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const [plan, prefs, inbox, allTasks] = await Promise.all([
        getWeekPlan(userId, weekStart),
        getUserPrefs(userId),
        getInboxItems(userId),
        getTasks(userId),
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
  }, [userId, weekStart]);

  useEffect(() => {
    loadData();
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

  const handleSwapWithDay = async (otherDay: number) => {
    if (!weekPlan || selectedDay == null) return;
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
      userId,
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

  const selectedConfig = weekPlan?.dayThemes.find((d) => d.day === selectedDay);

  const tabClass = (t: Tab) =>
    `rounded-lg px-4 py-2 text-sm font-medium ${
      tab === t ? 'bg-primary-500 text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
    }`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <AppNav />
        <div className="flex items-center justify-center p-12 text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!weekPlan) {
    return (
      <div className="min-h-screen bg-surface">
        <AppNav />
        <div className="mx-auto max-w-2xl p-6 text-center">
          <p className="text-text-secondary">No week plan found.</p>
          <a href="/sunday-setup" className="mt-4 inline-block text-primary-600 hover:underline">
            Run Sunday Setup
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <AppNav />
      <main className="mx-auto max-w-2xl space-y-6 p-4" id="main-content">
        <div className="flex gap-2">
          <button type="button" className={tabClass('week')} onClick={() => { setTab('week'); setSelectedDay(null); }}>
            Week
          </button>
          <button type="button" className={tabClass('inbox')} onClick={() => setTab('inbox')}>
            Later ({inboxItems.length})
          </button>
          <button type="button" className={tabClass('tasks')} onClick={() => setTab('tasks')}>
            Tasks
          </button>
        </div>

        {tab === 'week' && selectedDay == null && (
          <div className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold">Weekly rhythm</h1>
            <p className="text-sm text-text-secondary">Week of {weekStart}</p>
            <WeekGlance
              dayThemes={weekPlan.dayThemes}
              workWindowDays={workWindowDays}
              onSelectDay={(day) => setSelectedDay(day)}
            />
          </div>
        )}

        {tab === 'week' && selectedDay != null && selectedConfig && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <DayDetailView
              config={selectedConfig}
              tasks={tasks}
              workWindowDays={workWindowDays}
              workWindowTime={workWindowTime}
              onBack={() => setSelectedDay(null)}
              onUpdateDay={handleUpdateDay}
              onSwapWithDay={handleSwapWithDay}
            />
          </div>
        )}

        {tab === 'inbox' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h1 className="mb-4 text-xl font-bold">Later inbox</h1>
            <InboxPanel
              items={inboxItems}
              onDelete={handleDeleteInbox}
              onPromote={handlePromoteInbox}
            />
          </div>
        )}

        {tab === 'tasks' && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h1 className="mb-4 text-xl font-bold">Task board</h1>
            <TaskBoard tasks={tasks} todayDayIndex={todayIndex} onMoveTask={handleMoveTask} />
          </div>
        )}
      </main>
    </div>
  );
}
