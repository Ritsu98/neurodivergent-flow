'use client';

import { useState, useEffect } from 'react';
import { EnergySlider } from '@/components/today/EnergySlider';
import { PrimaryBlockCard } from '@/components/today/PrimaryBlockCard';
import { Top3Tasks } from '@/components/today/Top3Tasks';
import { MvdCard } from '@/components/today/MvdCard';
import { EveningBlockCard } from '@/components/today/EveningBlockCard';
import type { EnergyLog, WeekPlan, Task, DayColor, DayTheme } from '@neurodivergent-flow/core';
import {
  getEnergyLog,
  upsertEnergyLog,
  getUserPrefs,
  getWeekPlan,
  getTasks,
  createTask,
  updateTask,
} from '@neurodivergent-flow/api';

export default function TodayPage() {
  const [energyValue, setEnergyValue] = useState<number | undefined>(undefined);
  const [dayColor, setDayColor] = useState<DayColor | undefined>(undefined);
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mvdDismissed, setMvdDismissed] = useState(false);
  const [hasWorkWindow, setHasWorkWindow] = useState(false);

  // TODO: Get from auth (Stage 1.3)
  const userId = 'temp-user-id';
  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0-6 (Mon-Sun)

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      setIsLoading(true);

      // Load energy log
      const energyLog = await getEnergyLog(userId, today, 'am');
      if (energyLog) {
        setEnergyValue(energyLog.value);
        setDayColor(energyLog.dayColor);
      }

      // Load week plan
      // Calculate start date of current week (Monday)
      const todayDate = new Date();
      const dayOfWeek = todayDate.getDay();
      const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
      const startDate = new Date(todayDate);
      startDate.setDate(todayDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const startDateStr = startDate.toISOString().split('T')[0];

      const plan = await getWeekPlan(userId, startDateStr);
      setWeekPlan(plan);

      // Load tasks for today
      const todayTasks = await getTasks(userId, {
        day: dayIndex,
        status: 'today',
      });
      setTasks(todayTasks);

      // Check if user has work window
      const userPrefs = await getUserPrefs(userId);
      setHasWorkWindow((userPrefs?.workWindows?.length ?? 0) > 0);
    } catch (error) {
      console.error('Failed to load today data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnergySave = async (value: number) => {
    try {
      await upsertEnergyLog(userId, today, 'am', value);
      setEnergyValue(value);
      // Update day color
      if (value >= 4) setDayColor('green');
      else if (value >= 2) setDayColor('yellow');
      else setDayColor('red');
    } catch (error) {
      console.error('Failed to save energy:', error);
      throw error;
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      await updateTask(taskId, { status: 'done' });
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: 'done' } : t)));
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleTaskEdit = (task: Task) => {
    // TODO: Open edit modal
    console.log('Edit task:', task);
  };

  const handleAddTask = async () => {
    // TODO: Open add task modal
    console.log('Add task');
  };

  const handleStartPrimaryBlock = () => {
    // TODO: Navigate to appropriate Runner (Stage 4)
    const theme = weekPlan?.dayThemes.find((d) => d.day === dayIndex)?.theme;
    console.log('Start', theme);
  };

  const isRedDay = dayColor === 'red';
  const todayTheme = weekPlan?.dayThemes.find((d) => d.day === dayIndex)?.theme || 'flex';
  const scheduledTime = weekPlan?.dayThemes.find((d) => d.day === dayIndex)?.scheduledTime;
  const mvdTasks = tasks.filter((t) => t.isMvdEssential);
  const displayTasks = isRedDay ? mvdTasks : tasks;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Energy Slider */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <EnergySlider
            initialValue={energyValue}
            dayColor={dayColor}
            onSave={handleEnergySave}
          />
        </div>

        {/* Primary Block Card */}
        <PrimaryBlockCard
          dayTheme={todayTheme as DayTheme}
          scheduledTime={scheduledTime}
          onStart={handleStartPrimaryBlock}
          isRedDay={isRedDay}
        />

        {/* MVD Card (Red days) */}
        {isRedDay && !mvdDismissed && (
          <MvdCard tasks={mvdTasks} onDismiss={() => setMvdDismissed(true)} />
        )}

        {/* Evening Block Card (Work Window Users) */}
        {hasWorkWindow && scheduledTime && (
          <EveningBlockCard
            primaryBlockType={todayTheme as DayTheme}
            scheduledTime={scheduledTime}
            onStart={handleStartPrimaryBlock}
          />
        )}

        {/* Top 3 Tasks */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <Top3Tasks
            tasks={displayTasks}
            onTaskComplete={handleTaskComplete}
            onTaskEdit={handleTaskEdit}
            onAddTask={handleAddTask}
            isRedDay={isRedDay}
          />
        </div>
      </div>
    </div>
  );
}
