'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SprintTimer } from '@/components/runner/shared/SprintTimer';
import { SprintChecklist } from '@/components/runner/shared/SprintChecklist';
import { NextStepCapture } from '@/components/runner/shared/NextStepCapture';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import type { AdminCategory, Task } from '@neurodivergent-flow/core';
import {
  ADMIN_CATEGORY_CONFIG,
  ADMIN_DURATION_OPTIONS,
  ADMIN_TIMER_STORAGE_KEY,
  getTodayDayIndex,
} from '@neurodivergent-flow/core';
import { createInboxItem, getTasks, updateTask } from '@neurodivergent-flow/api';
import { useAuth } from '@/hooks/useAuth';

type Phase = 'categories' | 'sprint' | 'complete';

export function AdminRunnerContent() {
  const router = useRouter();
  const { userId } = useAuth();
  const searchParams = useSearchParams();

  const [phase, setPhase] = useState<Phase>('categories');
  const [selected, setSelected] = useState<AdminCategory[]>(['planning']);
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const timer = useCountdownTimer({
    durationMinutes,
    storageKey: ADMIN_TIMER_STORAGE_KEY,
    onComplete: () => setPhase('complete'),
  });

  useEffect(() => {
    const taskId = searchParams.get('taskId');
    if (taskId) {
      const dayIndex = getTodayDayIndex();
      getTasks(userId, { day: dayIndex, status: 'today' }).then((tasks) => {
        setActiveTask(tasks.find((t) => t.id === taskId) ?? null);
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (phase !== 'sprint') return;
    timer.resetForDuration(durationMinutes);
    timer.start();
  }, [phase, durationMinutes]);

  const toggleCategory = (cat: AdminCategory) => {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const buildChecklist = (cats: AdminCategory[]) =>
    cats.flatMap((c) => ADMIN_CATEGORY_CONFIG[c].checklist.map((item) => `[${ADMIN_CATEGORY_CONFIG[c].label}] ${item}`));

  const handleStart = () => {
    if (selected.length === 0) return;
    setChecklist(buildChecklist(selected));
    setChecked({});
    setPhase('sprint');
  };

  const handleNextStep = async (nextStep: string, saveAs: 'task' | 'inbox' | 'skip') => {
    if (saveAs === 'task' && nextStep && activeTask) {
      await updateTask(activeTask.id, { nextStep });
    } else if (saveAs === 'inbox' && nextStep) {
      await createInboxItem(userId, nextStep);
    }
    router.push('/today');
  };

  if (phase === 'categories') {
    return (
      <div className="min-h-screen bg-surface p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <h1 className="text-2xl font-bold">Admin Sprint</h1>
          <p className="text-sm text-text-secondary">Select one or more categories.</p>
          <label className="block text-sm font-medium">Duration</label>
          <select
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            {ADMIN_DURATION_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
          <div className="space-y-2">
            {(Object.keys(ADMIN_CATEGORY_CONFIG) as AdminCategory[]).map((cat) => (
              <label
                key={cat}
                className={`flex cursor-pointer items-center rounded-lg border-2 p-3 ${
                  selected.includes(cat) ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="mr-3"
                />
                {ADMIN_CATEGORY_CONFIG[cat].label}
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={handleStart}
            disabled={selected.length === 0}
            className="w-full rounded-lg bg-primary-500 py-3 font-semibold text-white disabled:opacity-50"
          >
            Start sprint
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <NextStepCapture
        title="Admin sprint complete"
        taskTitle={activeTask?.title}
        onDone={handleNextStep}
      />
    );
  }

  return (
    <SprintTimer
      label="Admin sprint"
      totalSeconds={timer.totalSeconds}
      remainingSeconds={timer.remainingSeconds}
      isPaused={timer.isPaused}
      isRunning={timer.isRunning}
      onStart={timer.start}
      onPause={timer.pause}
      onResume={timer.resume}
      onAbandon={() => router.push('/today')}
    >
      <SprintChecklist
        items={checklist}
        checked={checked}
        onToggle={(i) => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
      />
    </SprintTimer>
  );
}
