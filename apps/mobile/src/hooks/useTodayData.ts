import { useState, useEffect } from 'react';
import type { DayColor, DayTheme, Task, WeekPlan } from '@neurodivergent-flow/core';
import { useAuth } from '@/hooks/useAuth';
import { hydrateTodayFromRemote, saveEnergyLogLocalFirst, updateTaskLocalFirst } from '@/lib/localData';
import { ensureLocalDatabase } from '@/lib/sqlite/db';
import { getLocalEnergyLog } from '@/lib/sqlite/repositories/energyLog';
import { getLocalUserPrefs } from '@/lib/sqlite/repositories/userPrefs';
import { getLocalWeekPlan } from '@/lib/sqlite/repositories/weekPlan';
import { getLocalTasks } from '@/lib/sqlite/repositories/tasks';
import {
  dayColorFromEnergy,
  getCurrentWeekStartDate,
  getTodayDateString,
  getTodayDayIndex,
} from '@/lib/today';

export function useTodayData() {
  const { userId } = useAuth();
  const [energyValue, setEnergyValue] = useState<number | undefined>(undefined);
  const [dayColor, setDayColor] = useState<DayColor | undefined>(undefined);
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hasWorkWindow, setHasWorkWindow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const dayIndex = getTodayDayIndex();
  const today = getTodayDateString();
  const weekStart = getCurrentWeekStartDate();

  const applyLocalState = () => {
    if (!userId) return;
    ensureLocalDatabase();
    const localEnergy = getLocalEnergyLog(userId, today, 'am');
    if (localEnergy) {
      setEnergyValue(localEnergy.value);
      setDayColor(localEnergy.dayColor ?? dayColorFromEnergy(localEnergy.value));
    }

    const localPlan = getLocalWeekPlan(userId, weekStart);
    setWeekPlan(localPlan);

    const localTasks = getLocalTasks(userId).filter(
      (t) => t.day === dayIndex && t.status === 'today'
    );
    setTasks(localTasks);

    const localPrefs = getLocalUserPrefs(userId);
    setHasWorkWindow((localPrefs?.workWindows?.length ?? 0) > 0);
  };

  const loadTodayData = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      applyLocalState();
      await hydrateTodayFromRemote(userId, today, weekStart, dayIndex);
      applyLocalState();
    } catch (error) {
      console.error('Failed to load today data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    void loadTodayData();
  }, [userId]);

  const handleEnergySave = async (value: number) => {
    if (!userId) return;
    setEnergyValue(value);
    setDayColor(dayColorFromEnergy(value));
    await saveEnergyLogLocalFirst(userId, today, 'am', value);
  };

  const handleTaskComplete = async (taskId: string) => {
    const updated = await updateTaskLocalFirst(taskId, { status: 'done' });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  };

  const todayTheme = (weekPlan?.dayThemes.find((d) => d.day === dayIndex)?.theme ||
    'flex') as DayTheme;
  const scheduledTime = weekPlan?.dayThemes.find((d) => d.day === dayIndex)?.scheduledTime;
  const isRedDay = dayColor === 'red';
  const mvdTasks = tasks.filter((t) => t.isMvdEssential);
  const displayTasks = isRedDay ? mvdTasks : tasks;

  return {
    energyValue,
    dayColor,
    weekPlan,
    tasks,
    displayTasks,
    hasWorkWindow,
    isLoading,
    isRedDay,
    todayTheme,
    scheduledTime,
    handleEnergySave,
    handleTaskComplete,
    refresh: loadTodayData,
  };
}
