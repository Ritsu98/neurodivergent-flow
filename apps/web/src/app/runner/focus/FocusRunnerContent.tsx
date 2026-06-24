'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RitualChecklist } from '@/components/runner/focus/RitualChecklist';
import { TimerSetup } from '@/components/runner/focus/TimerSetup';
import { FocusTimer } from '@/components/runner/focus/FocusTimer';
import { LaterCaptureModal } from '@/components/runner/focus/LaterCaptureModal';
import { HardStopScreen } from '@/components/runner/focus/HardStopScreen';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import type { FocusRunnerPhase, FocusRunnerSettings, Task } from '@neurodivergent-flow/core';
import {
  FOCUS_TIMER_STORAGE_KEY,
  getFocusRunnerSettings,
  mergeRunnerSettings,
} from '@neurodivergent-flow/core';
import {
  getUserPrefs,
  upsertUserPrefs,
  createInboxItem,
  updateTask,
  getTasks,
} from '@neurodivergent-flow/api';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

const USER_ID = 'temp-user-id';
const SESSION_LOG_KEY = 'nf_focus_session_log';

export function FocusRunnerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskIdParam = searchParams.get('taskId');

  const [phase, setPhase] = useState<FocusRunnerPhase>('ritual');
  const [settings, setSettings] = useState<FocusRunnerSettings | null>(null);
  const [ritualItems, setRitualItems] = useState<string[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showLaterModal, setShowLaterModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const focusMinutes =
    phase === 'break' ? (settings?.breakDurationMinutes ?? 5) : (settings?.focusDurationMinutes ?? 30);
  const timerStorageKey =
    phase === 'focus1'
      ? `${FOCUS_TIMER_STORAGE_KEY}_1`
      : phase === 'break'
        ? `${FOCUS_TIMER_STORAGE_KEY}_break`
        : `${FOCUS_TIMER_STORAGE_KEY}_2`;

  const advancePhase = useCallback(() => {
    setPhase((current) => {
      if (current === 'focus1') return 'break';
      if (current === 'break') return 'focus2';
      if (current === 'focus2') return 'complete';
      return current;
    });
  }, []);

  const timer = useCountdownTimer({
    durationMinutes: focusMinutes,
    storageKey: timerStorageKey,
    onComplete: advancePhase,
  });

  useEffect(() => {
    loadRunnerData();
  }, []);

  useEffect(() => {
    if (phase !== 'focus1' && phase !== 'break' && phase !== 'focus2') return;
    timer.resetForDuration(focusMinutes);
    timer.start();
  }, [phase]);

  const loadRunnerData = async () => {
    try {
      setIsLoading(true);
      const prefs = await getUserPrefs(USER_ID);
      const runnerSettings = getFocusRunnerSettings(prefs);
      setSettings(runnerSettings);
      setRitualItems(runnerSettings.focusRitualItems);

      if (taskIdParam) {
        const dayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
        const tasks = await getTasks(USER_ID, { day: dayIndex, status: 'today' });
        setActiveTask(tasks.find((t) => t.id === taskIdParam) ?? null);
      }
    } catch (error) {
      console.error('Failed to load focus runner:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRunnerSettings = async (next: FocusRunnerSettings) => {
    setSettings(next);
    setRitualItems(next.focusRitualItems);
    try {
      const prefs = await getUserPrefs(USER_ID);
      await upsertUserPrefs(USER_ID, {
        runnerSettings: mergeRunnerSettings(prefs, { focus: next }),
      });
    } catch (error) {
      console.error('Failed to save runner settings:', error);
    }
  };

  const handleRitualItemsChange = (items: string[]) => {
    if (!settings) return;
    const next = { ...settings, focusRitualItems: items };
    setRitualItems(items);
    void saveRunnerSettings(next);
  };

  const handleBeginOrSkip = () => {
    if (!settings) return;
    void saveRunnerSettings(settings);
    sessionStorage.removeItem(`${FOCUS_TIMER_STORAGE_KEY}_1`);
    sessionStorage.removeItem(`${FOCUS_TIMER_STORAGE_KEY}_break`);
    sessionStorage.removeItem(`${FOCUS_TIMER_STORAGE_KEY}_2`);
    setPhase('focus1');
  };

  const logSessionComplete = () => {
    const entry = {
      completedAt: new Date().toISOString(),
      focusMinutes: settings?.focusDurationMinutes,
      breakMinutes: settings?.breakDurationMinutes,
    };
    const existing = JSON.parse(sessionStorage.getItem(SESSION_LOG_KEY) ?? '[]') as unknown[];
    sessionStorage.setItem(SESSION_LOG_KEY, JSON.stringify([...existing, entry].slice(-20)));
  };

  const handleHardStopDone = async (
    nextStep: string,
    saveAs: 'task' | 'inbox' | 'skip'
  ) => {
    try {
      if (saveAs !== 'skip' && nextStep) {
        if (saveAs === 'task' && activeTask) {
          await updateTask(activeTask.id, { nextStep });
        } else {
          await createInboxItem(USER_ID, nextStep);
        }
      }
      logSessionComplete();
      trackEvent(AnalyticsEvents.focusSessionComplete);
    } catch (error) {
      console.error('Failed to save next step:', error);
    }
    router.push('/today');
  };

  const handleLaterSave = async (content: string) => {
    await createInboxItem(USER_ID, content);
  };

  const timerLabel =
    phase === 'break' ? 'Break' : phase === 'focus2' ? 'Focus block 2' : 'Focus block 1';

  if (isLoading || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (phase === 'ritual') {
    return (
      <RitualChecklist
        items={ritualItems}
        onItemsChange={handleRitualItemsChange}
        onBegin={handleBeginOrSkip}
        onSkip={handleBeginOrSkip}
        footer={<TimerSetup settings={settings} onChange={saveRunnerSettings} />}
      />
    );
  }

  if (phase === 'complete') {
    return (
      <HardStopScreen
        taskTitle={activeTask?.title}
        onDone={handleHardStopDone}
        onBack={() => setPhase('focus2')}
      />
    );
  }

  return (
    <>
      <FocusTimer
        label={timerLabel}
        totalSeconds={timer.totalSeconds}
        remainingSeconds={timer.remainingSeconds}
        isPaused={timer.isPaused}
        isRunning={timer.isRunning}
        onStart={timer.start}
        onPause={timer.pause}
        onResume={timer.resume}
        onAbandon={() => {
          timer.abandon();
          router.push('/today');
        }}
        onLater={() => setShowLaterModal(true)}
      />
      {showLaterModal && (
        <LaterCaptureModal
          onSave={handleLaterSave}
          onClose={() => setShowLaterModal(false)}
        />
      )}
    </>
  );
}
