'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SprintTimer } from '@/components/runner/shared/SprintTimer';
import { SprintChecklist } from '@/components/runner/shared/SprintChecklist';
import { NextStepCapture } from '@/components/runner/shared/NextStepCapture';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import type { FlexZone, Task } from '@neurodivergent-flow/core';
import {
  FLEX_ZONE_CONFIG,
  FLEX_DURATION_OPTIONS,
  FLEX_TIMER_STORAGE_KEY,
  getTodayDayIndex,
} from '@neurodivergent-flow/core';
import { createInboxItem, getTasks, updateTask } from '@neurodivergent-flow/api';

const USER_ID = 'temp-user-id';
type Phase = 'zone' | 'sprint' | 'complete';

export function FlexRunnerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetDuration = searchParams.get('duration');
  const presetZone = searchParams.get('zone') as FlexZone | null;
  const quickSprint = presetDuration != null;

  const [phase, setPhase] = useState<Phase>(quickSprint || presetZone ? 'sprint' : 'zone');
  const [zone, setZone] = useState<FlexZone>(presetZone ?? 'kitchen');
  const [durationMinutes, setDurationMinutes] = useState(
    presetDuration ? Number(presetDuration) : 15
  );
  const [checklist, setChecklist] = useState<string[]>(
    [...FLEX_ZONE_CONFIG[presetZone ?? 'kitchen'].checklist]
  );
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const timer = useCountdownTimer({
    durationMinutes,
    storageKey: FLEX_TIMER_STORAGE_KEY,
    onComplete: () => setPhase('complete'),
  });

  useEffect(() => {
    const taskId = searchParams.get('taskId');
    if (taskId) {
      const dayIndex = getTodayDayIndex();
      getTasks(USER_ID, { day: dayIndex, status: 'today' }).then((tasks) => {
        setActiveTask(tasks.find((t) => t.id === taskId) ?? null);
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (phase !== 'sprint') return;
    timer.resetForDuration(durationMinutes);
    timer.start();
  }, [phase, durationMinutes]);

  const handleSelectZone = (z: FlexZone) => {
    setZone(z);
    setChecklist([...FLEX_ZONE_CONFIG[z].checklist]);
    setChecked({});
    setPhase('sprint');
  };

  const handleNextStep = async (nextStep: string, saveAs: 'task' | 'inbox' | 'skip') => {
    if (saveAs === 'task' && nextStep && activeTask) {
      await updateTask(activeTask.id, { nextStep });
    } else if (saveAs === 'inbox' && nextStep) {
      await createInboxItem(USER_ID, nextStep);
    }
    router.push('/today');
  };

  if (phase === 'zone') {
    return (
      <div className="min-h-screen bg-surface p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <h1 className="text-2xl font-bold">Flex Sprint</h1>
          <p className="text-sm text-text-secondary">Pick a zone for a short reset.</p>
          <label className="block text-sm font-medium">Duration</label>
          <select
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            {[5, ...FLEX_DURATION_OPTIONS].filter(
              (v, i, arr) => arr.indexOf(v) === i
            ).map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
          {(Object.keys(FLEX_ZONE_CONFIG) as FlexZone[]).map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => handleSelectZone(z)}
              className="w-full rounded-lg border-2 border-gray-200 bg-white p-4 text-left hover:border-primary-300"
            >
              <div className="font-semibold">{FLEX_ZONE_CONFIG[z].label}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <NextStepCapture
        title="Sprint complete"
        taskTitle={activeTask?.title}
        onDone={handleNextStep}
      />
    );
  }

  return (
    <SprintTimer
      label={`${FLEX_ZONE_CONFIG[zone].label} sprint`}
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
