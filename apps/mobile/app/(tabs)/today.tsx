import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRunnerPath } from '@neurodivergent-flow/core';
import { AppHeader } from '@/components/layout/AppHeader';
import { EnergySlider } from '@/components/today/EnergySlider';
import { PrimaryBlockCard } from '@/components/today/PrimaryBlockCard';
import { Top3Tasks } from '@/components/today/Top3Tasks';
import { MvdCard } from '@/components/today/MvdCard';
import { EveningBlockCard } from '@/components/today/EveningBlockCard';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Text';
import { Stack } from '@/components/ui/Stack';
import { useTodayData } from '@/hooks/useTodayData';

export default function TodayScreen() {
  const [mvdDismissed, setMvdDismissed] = useState(false);
  const {
    energyValue,
    dayColor,
    displayTasks,
    tasks,
    hasWorkWindow,
    isLoading,
    isRedDay,
    todayTheme,
    scheduledTime,
    handleEnergySave,
    handleTaskComplete,
  } = useTodayData();

  const handleStartPrimaryBlock = () => {
    const firstTask = tasks.find((t) => t.status !== 'done');
    router.push(getRunnerPath(todayTheme, firstTask?.id));
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <AppHeader active="today" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0ea5e9" />
          <AppText variant="caption" className="mt-2">
            Loading…
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <AppHeader active="today" />
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <Stack gap="lg">
          <Card>
            <EnergySlider
              initialValue={energyValue}
              dayColor={dayColor}
              onSave={handleEnergySave}
            />
          </Card>

          <PrimaryBlockCard
            dayTheme={todayTheme}
            scheduledTime={scheduledTime}
            onStart={handleStartPrimaryBlock}
            isRedDay={isRedDay}
          />

          {isRedDay && !mvdDismissed ? (
            <MvdCard tasks={displayTasks} onDismiss={() => setMvdDismissed(true)} />
          ) : null}

          {hasWorkWindow && scheduledTime ? (
            <EveningBlockCard
              primaryBlockType={todayTheme}
              scheduledTime={scheduledTime}
              onStart={handleStartPrimaryBlock}
            />
          ) : null}

          <Card>
            <Top3Tasks
              tasks={displayTasks}
              onTaskComplete={handleTaskComplete}
              isRedDay={isRedDay}
            />
          </Card>
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}
