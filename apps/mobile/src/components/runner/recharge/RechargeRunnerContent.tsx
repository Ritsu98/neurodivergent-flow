import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { getUserPrefs } from '@neurodivergent-flow/api';
import { upsertUserPrefsLocalFirst } from '@/lib/localData';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';

type Phase = 'select' | 'ritual' | 'active' | 'return';

export function RechargeRunnerContent() {
  const { userId } = useAuth();
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
    if (!userId) return;
    getUserPrefs(userId).then((prefs) => {
      const settings = getRechargeRunnerSettings(prefs);
      setRitualItems(settings.ritualItems);
      setIsLoading(false);
    });
  }, [userId]);

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
    if (!userId) return;
    const prefs = await getUserPrefs(userId);
    await upsertUserPrefsLocalFirst(userId, {
      runnerSettings: mergeRunnerSettings(prefs, { recharge: { ritualItems: items } }),
    });
  };

  const handleBegin = () => {
    if (useTimer) setPhase('active');
    else setPhase('return');
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (phase === 'select') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 p-4">
        <AppText variant="title">Recharge</AppText>
        <AppText variant="caption" className="mb-4 mt-2">
          Pick what matches your energy.
        </AppText>
        {(Object.keys(RECHARGE_TYPE_CONFIG) as RechargeType[]).map((type) => {
          const config = RECHARGE_TYPE_CONFIG[type];
          return (
            <Pressable
              key={type}
              onPress={() => handleSelectType(type)}
              className="mb-3 rounded-lg border-2 border-gray-200 bg-white p-4"
            >
              <AppText className="font-semibold">{config.label}</AppText>
              <AppText variant="caption" className="mt-1">
                {config.description}
              </AppText>
            </Pressable>
          );
        })}
      </SafeAreaView>
    );
  }

  if (phase === 'ritual') {
    return (
      <RitualChecklist
        items={ritualItems}
        onItemsChange={(items) => {
          setRitualItems(items);
          void saveRitualItems(items);
        }}
        onBegin={handleBegin}
        onSkip={handleBegin}
        footer={
          <Card className="mt-4">
            <Checkbox
              label={`Set timer (${durationMinutes} min)`}
              checked={useTimer}
              onToggle={setUseTimer}
            />
          </Card>
        }
      />
    );
  }

  if (phase === 'active') {
    return (
      <SprintTimer
        label={RECHARGE_TYPE_CONFIG[rechargeType].label}
        totalSeconds={timer.totalSeconds}
        remainingSeconds={timer.remainingSeconds}
        isPaused={timer.isPaused}
        isRunning={timer.isRunning}
        onStart={timer.start}
        onPause={timer.pause}
        onResume={timer.resume}
        onAbandon={() => router.replace('/(tabs)/today')}
        onSkip={() => setPhase('return')}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-4">
      <View className="flex-1">
        <AppText variant="title">Return ramp</AppText>
        <AppText variant="caption" className="mt-2">
          How do you want to transition back?
        </AppText>
      </View>
      <Button label="Done for day" onPress={() => router.replace('/(tabs)/today')} />
      <Button
        label="5-min Flex task"
        variant="secondary"
        className="mt-3"
        onPress={() => router.push('/runner/flex?duration=5')}
      />
    </SafeAreaView>
  );
}
