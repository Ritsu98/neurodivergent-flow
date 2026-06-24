import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/layout/AppHeader';
import { WeekGlance } from '@/components/week/WeekGlance';
import { DayDetailView } from '@/components/week/DayDetailView';
import { InboxPanel } from '@/components/week/InboxPanel';
import { TaskBoard } from '@/components/week/TaskBoard';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Text';
import { useWeekData, type WeekTab } from '@/hooks/useWeekData';
import { cn } from '@/lib/cn';

export default function WeekScreen() {
  const [tab, setTab] = useState<WeekTab>('week');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const {
    weekPlan,
    tasks,
    inboxItems,
    workWindowDays,
    workWindowTime,
    isLoading,
    weekStart,
    todayIndex,
    handleUpdateDay,
    handleSwapWithDay,
    handleDeleteInbox,
    handlePromoteInbox,
    handleMoveTask,
  } = useWeekData();

  const selectedConfig = weekPlan?.dayThemes.find((d) => d.day === selectedDay);

  const tabClass = (t: WeekTab) =>
    cn('rounded-lg px-4 py-2', tab === t ? 'bg-primary-500' : 'bg-gray-100');

  const tabTextClass = (t: WeekTab) =>
    cn('text-sm font-medium', tab === t ? 'text-white' : 'text-gray-600');

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <AppHeader active="week" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  if (!weekPlan) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <AppHeader active="week" />
        <View className="flex-1 items-center justify-center p-6">
          <AppText variant="caption" className="text-center">
            No week plan found.
          </AppText>
          <Link href="/sunday-setup" className="mt-4">
            <AppText className="font-medium text-primary-600">Run Sunday Setup</AppText>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <AppHeader active="week" />
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <View className="mb-4 flex-row gap-2">
          <Pressable
            onPress={() => {
              setTab('week');
              setSelectedDay(null);
            }}
            className={tabClass('week')}
          >
            <AppText className={tabTextClass('week')}>Week</AppText>
          </Pressable>
          <Pressable onPress={() => setTab('inbox')} className={tabClass('inbox')}>
            <AppText className={tabTextClass('inbox')}>Later ({inboxItems.length})</AppText>
          </Pressable>
          <Pressable onPress={() => setTab('tasks')} className={tabClass('tasks')}>
            <AppText className={tabTextClass('tasks')}>Tasks</AppText>
          </Pressable>
        </View>

        {tab === 'week' && selectedDay == null ? (
          <Card>
            <AppText variant="subtitle">Weekly rhythm</AppText>
            <AppText variant="caption" className="mb-4 mt-1">
              Week of {weekStart}
            </AppText>
            <WeekGlance
              dayThemes={weekPlan.dayThemes}
              workWindowDays={workWindowDays}
              onSelectDay={(day) => setSelectedDay(day)}
            />
          </Card>
        ) : null}

        {tab === 'week' && selectedDay != null && selectedConfig ? (
          <Card>
            <DayDetailView
              config={selectedConfig}
              tasks={tasks}
              workWindowDays={workWindowDays}
              workWindowTime={workWindowTime}
              onBack={() => setSelectedDay(null)}
              onUpdateDay={(updated) => void handleUpdateDay(updated)}
              onSwapWithDay={(otherDay) => void handleSwapWithDay(selectedDay, otherDay)}
            />
          </Card>
        ) : null}

        {tab === 'inbox' ? (
          <Card>
            <AppText variant="subtitle" className="mb-4">
              Later inbox
            </AppText>
            <InboxPanel
              items={inboxItems}
              onDelete={handleDeleteInbox}
              onPromote={handlePromoteInbox}
            />
          </Card>
        ) : null}

        {tab === 'tasks' ? (
          <Card>
            <AppText variant="subtitle" className="mb-4">
              Task board
            </AppText>
            <TaskBoard
              tasks={tasks}
              todayDayIndex={todayIndex}
              onMoveTask={handleMoveTask}
            />
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
