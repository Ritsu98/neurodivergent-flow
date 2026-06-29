import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { getTasks } from '@neurodivergent-flow/api';
import { createInboxItemLocalFirst, updateTaskLocalFirst } from '@/lib/localData';
import { useAuth } from '@/hooks/useAuth';
import { AppText } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/cn';

type Phase = 'categories' | 'sprint' | 'complete';

export function AdminRunnerContent() {
  const { userId } = useAuth();
  const params = useLocalSearchParams<{ taskId?: string }>();

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
    const taskId = params.taskId;
    if (!taskId || !userId) return;
    const dayIndex = getTodayDayIndex();
    getTasks(userId, { day: dayIndex, status: 'today' }).then((tasks) => {
      setActiveTask(tasks.find((t) => t.id === taskId) ?? null);
    });
  }, [params.taskId, userId]);

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
    cats.flatMap((c) =>
      ADMIN_CATEGORY_CONFIG[c].checklist.map((item) => `[${ADMIN_CATEGORY_CONFIG[c].label}] ${item}`)
    );

  const handleStart = () => {
    if (selected.length === 0) return;
    setChecklist(buildChecklist(selected));
    setChecked({});
    setPhase('sprint');
  };

  const handleNextStep = async (nextStep: string, saveAs: 'task' | 'inbox' | 'skip') => {
    if (!userId) return;
    if (saveAs === 'task' && nextStep && activeTask) {
      await updateTaskLocalFirst(activeTask.id, { nextStep });
    } else if (saveAs === 'inbox' && nextStep) {
      await createInboxItemLocalFirst(userId, nextStep);
    }
    router.replace('/(tabs)/today');
  };

  if (phase === 'categories') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 p-4">
        <AppText variant="title">Admin Sprint</AppText>
        <AppText variant="caption" className="mb-4 mt-2">
          Select one or more categories.
        </AppText>
        <AppText className="mb-2 text-sm font-medium">Duration</AppText>
        <View className="mb-4 flex-row flex-wrap gap-2">
          {ADMIN_DURATION_OPTIONS.map((m) => (
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
        <View className="gap-2">
          {(Object.keys(ADMIN_CATEGORY_CONFIG) as AdminCategory[]).map((cat) => (
            <View
              key={cat}
              className={cn(
                'rounded-lg border-2 p-3',
                selected.includes(cat) ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
              )}
            >
              <Checkbox
                label={ADMIN_CATEGORY_CONFIG[cat].label}
                checked={selected.includes(cat)}
                onToggle={() => toggleCategory(cat)}
              />
            </View>
          ))}
        </View>
        <Button
          label="Start sprint"
          onPress={handleStart}
          disabled={selected.length === 0}
          className="mt-4"
        />
      </SafeAreaView>
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
