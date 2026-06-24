import { useState, useEffect } from 'react';
import type { DayColor, DayTheme, Task, WeekPlan } from '@neurodivergent-flow/core';
import {
  getEnergyLog,
  getTasks,
  getUserPrefs,
  getWeekPlan,
  updateTask,
  upsertEnergyLog,
} from '@neurodivergent-flow/api';
import { USER_ID } from '@/constants/user';
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

  const loadTodayData = async () => {
    try {
      setIsLoading(true);

      const energyLog = await getEnergyLog(USER_ID, today, 'am');
      if (energyLog) {
        setEnergyValue(energyLog.value);
        setDayColor(energyLog.dayColor);
      }

      const plan = await getWeekPlan(USER_ID, getCurrentWeekStartDate());
      setWeekPlan(plan);

      const todayTasks = await getTasks(USER_ID, { day: dayIndex, status: 'today' });
      setTasks(todayTasks);

      const userPrefs = await getUserPrefs(USER_ID);
      setHasWorkWindow((userPrefs?.workWindows?.length ?? 0) > 0);
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
    await upsertEnergyLog(USER_ID, today, 'am', value);
    setEnergyValue(value);
    setDayColor(dayColorFromEnergy(value));
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
