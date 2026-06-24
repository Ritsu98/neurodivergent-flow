'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RitualChecklist } from '@/components/runner/focus/RitualChecklist';
import { SprintTimer } from '@/components/runner/shared/SprintTimer';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import type { RechargeType } from '@neurodivergent-flow/core';
import {
  RECHARGE_TYPE_CONFIG,
  RECHARGE_TIMER_STORAGE_KEY,
  getRechargeRunnerSettings,
  mergeRunnerSettings,
} from '@neurodivergent-flow/core';
import { getUserPrefs, upsertUserPrefs } from '@neurodivergent-flow/api';

const USER_ID = 'temp-user-id';
type Phase = 'select' | 'ritual' | 'active' | 'return';

export function RechargeRunnerContent() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('select');
  const [rechargeType, setRechargeType] = useState<RechargeType>('micro');
  const [ritualItems, setRitualItems] = useState<string[]>([]);
  const [useTimer, setUseTimer] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [isLoading, setIsLoading] = useState(true);

  const timer = useCountdownTimer({
    durationMinutes,
    storageKey: RECHARGE_TIMER_STORAGE_KEY,
    onComplete: () => setPhase('return'),
  });

  useEffect(() => {
    getUserPrefs(USER_ID).then((prefs) => {
      const settings = getRechargeRunnerSettings(prefs);
      setRitualItems(settings.ritualItems);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (phase !== 'active' || !useTimer) return;
    timer.resetForDuration(durationMinutes);
    timer.start();
  }, [phase, useTimer, durationMinutes]);

  const handleSelectType = (type: RechargeType) => {
    const config = RECHARGE_TYPE_CONFIG[type];
    setRechargeType(type);
    setDurationMinutes(config.defaultMinutes);
    setUseTimer(config.timerDefault);
    setPhase('ritual');
  };

  const saveRitualItems = async (items: string[]) => {
    const prefs = await getUserPrefs(USER_ID);
    await upsertUserPrefs(USER_ID, {
      runnerSettings: mergeRunnerSettings(prefs, {
        recharge: { ritualItems: items },
      }),
    });
  };

  const handleBegin = () => {
    if (useTimer) setPhase('active');
    else setPhase('return');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-surface p-4">
        <div className="mx-auto max-w-lg space-y-4">
          <h1 className="text-2xl font-bold">Recharge</h1>
          <p className="text-sm text-text-secondary">Pick what matches your energy.</p>
          {(Object.keys(RECHARGE_TYPE_CONFIG) as RechargeType[]).map((type) => {
            const config = RECHARGE_TYPE_CONFIG[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleSelectType(type)}
                className="w-full rounded-lg border-2 border-gray-200 bg-white p-4 text-left hover:border-primary-300"
              >
                <div className="font-semibold">{config.label}</div>
                <div className="mt-1 text-sm text-text-secondary">{config.description}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === 'ritual') {
    return (
      <>
        <RitualChecklist
          items={ritualItems}
          onItemsChange={(items) => {
            setRitualItems(items);
            void saveRitualItems(items);
          }}
          onBegin={handleBegin}
          onSkip={handleBegin}
          footer={
            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useTimer}
                  onChange={(e) => setUseTimer(e.target.checked)}
                />
                Set timer ({durationMinutes} min)
              </label>
            </div>
          }
        />
      </>
    );
  }

  if (phase === 'active') {
    return (
      <SprintTimer
        label={`${RECHARGE_TYPE_CONFIG[rechargeType].label}`}
        totalSeconds={timer.totalSeconds}
        remainingSeconds={timer.remainingSeconds}
        isPaused={timer.isPaused}
        isRunning={timer.isRunning}
        onStart={timer.start}
        onPause={timer.pause}
        onResume={timer.resume}
        onAbandon={() => router.push('/today')}
        onSkip={() => setPhase('return')}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface p-4">
      <div className="mx-auto w-full max-w-lg flex-1">
        <h1 className="text-2xl font-bold">Return ramp</h1>
        <p className="mt-2 text-text-secondary">How do you want to transition back?</p>
      </div>
      <div className="mx-auto w-full max-w-lg space-y-3 pb-6">
        <button
          type="button"
          onClick={() => router.push('/today')}
          className="w-full rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white"
        >
          Done for day
        </button>
        <button
          type="button"
          onClick={() => router.push('/runner/flex?duration=5')}
          className="w-full rounded-lg border border-gray-300 px-6 py-3 font-medium"
        >
          5-min Flex task
        </button>
      </div>
    </div>
  );
}
