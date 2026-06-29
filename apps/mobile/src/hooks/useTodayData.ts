import { useState, useEffect } from 'react';
import type { DayColor, DayTheme, Task, WeekPlan } from '@neurodivergent-flow/core';
import { getTasks, getUserPrefs, updateTask } from '@neurodivergent-flow/api';
import { USER_ID } from '@/constants/user';
import { hydrateTodayFromRemote, saveEnergyLogLocalFirst } from '@/lib/localData';
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
    ensureLocalDatabase();
    const localEnergy = getLocalEnergyLog(USER_ID, today, 'am');
    if (localEnergy) {
      setEnergyValue(localEnergy.value);
      setDayColor(localEnergy.dayColor ?? dayColorFromEnergy(localEnergy.value));
    }

    const localPlan = getLocalWeekPlan(USER_ID, weekStart);
    setWeekPlan(localPlan);

    const localTasks = getLocalTasks(USER_ID).filter(
      (t) => t.day === dayIndex && t.status === 'today'
    );
    setTasks(localTasks);

    const localPrefs = getLocalUserPrefs(USER_ID);
    setHasWorkWindow((localPrefs?.workWindows?.length ?? 0) > 0);
  };

  const loadTodayData = async () => {
    try {
      setIsLoading(true);
      applyLocalState();
      await hydrateTodayFromRemote(USER_ID, today, weekStart, dayIndex);
      applyLocalState();
    } catch (error) {
      console.error('Failed to load today data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTodayData();
  }, []);

  const handleEnergySave = async (value: number) => {
    setEnergyValue(value);
    setDayColor(dayColorFromEnergy(value));
    await saveEnergyLogLocalFirst(USER_ID, today, 'am', value);
  };

  const handleTaskComplete = async (taskId: string) => {
    await updateTask(taskId, { status: 'done' });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: 'done' } : t)));
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
