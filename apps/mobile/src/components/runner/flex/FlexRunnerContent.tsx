import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SprintTimer } from '@/components/runner/shared/SprintTimer';
import { SprintChecklist } from '@/components/runner/shared/SprintChecklist';
import { NextStepCapture } from '@/components/runner/shared/NextStepCapture';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import type { FlexZone, Task } from '@neurodivergent-flow/core';
import {
  FLEX_DURATION_OPTIONS,
  FLEX_TIMER_STORAGE_KEY,
  FLEX_ZONE_CONFIG,
  getTodayDayIndex,
} from '@neurodivergent-flow/core';
import { createInboxItem, getTasks, updateTask } from '@neurodivergent-flow/api';
import { USER_ID } from '@/constants/user';
import { AppText } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

type Phase = 'zone' | 'sprint' | 'complete';

export function FlexRunnerContent() {
  const params = useLocalSearchParams<{ duration?: string; zone?: string; taskId?: string }>();
  const presetDuration = params.duration;
  const presetZone = params.zone as FlexZone | undefined;
  const quickSprint = presetDuration != null;

  const [phase, setPhase] = useState<Phase>(quickSprint || presetZone ? 'sprint' : 'zone');
  const [zone, setZone] = useState<FlexZone>(presetZone ?? 'kitchen');
  const [durationMinutes, setDurationMinutes] = useState(
    presetDuration ? Number(presetDuration) : 15
  );
  const [checklist, setChecklist] = useState<string[]>([
    ...FLEX_ZONE_CONFIG[presetZone ?? 'kitchen'].checklist,
  ]);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const timer = useCountdownTimer({
    durationMinutes,
    storageKey: FLEX_TIMER_STORAGE_KEY,
    onComplete: () => setPhase('complete'),
  });

  useEffect(() => {
    const taskId = params.taskId;
    if (taskId) {
      const dayIndex = getTodayDayIndex();
      getTasks(USER_ID, { day: dayIndex, status: 'today' }).then((tasks) => {
        setActiveTask(tasks.find((t) => t.id === taskId) ?? null);
      });
    }
  }, [params.taskId]);

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
    router.replace('/(tabs)/today');
  };

  const durationOptions = [5, ...FLEX_DURATION_OPTIONS].filter(
    (v, i, arr) => arr.indexOf(v) === i
  );

  if (phase === 'zone') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 p-4">
        <AppText variant="title">Flex Sprint</AppText>
        <AppText variant="caption" className="mb-4 mt-2">
          Pick a zone for a short reset.
        </AppText>
        <AppText className="mb-2 text-sm font-medium">Duration</AppText>
        <View className="mb-4 flex-row flex-wrap gap-2">
          {durationOptions.map((m) => (
            <Pressable
              key={m}
              onPress={() => setDurationMinutes(m)}
              className={cn(
                'rounded-lg border px-3 py-2',
                durationMinutes === m ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
              )}
            >
              <AppText className="text-sm">{m} min</AppText>
            </Pressable>
          ))}
        </View>
        {(Object.keys(FLEX_ZONE_CONFIG) as FlexZone[]).map((z) => (
          <Pressable
            key={z}
            onPress={() => handleSelectZone(z)}
            className="mb-3 rounded-lg border-2 border-gray-200 bg-white p-4"
          >
            <AppText className="font-semibold">{FLEX_ZONE_CONFIG[z].label}</AppText>
          </Pressable>
        ))}
      </SafeAreaView>
    );
  }

  if (phase === 'complete') {
    return (
      <NextStepCapture title="Sprint complete" taskTitle={activeTask?.title} onDone={handleNextStep} />
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
      onAbandon={() => router.replace('/(tabs)/today')}
    >
      <SprintChecklist
        items={checklist}
        checked={checked}
        onToggle={(i) => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
      />
    </SprintTimer>
  );
}
