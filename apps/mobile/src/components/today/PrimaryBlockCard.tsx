import { View } from 'react-native';
import type { DayTheme } from '@neurodivergent-flow/core';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

interface PrimaryBlockCardProps {
  dayTheme: DayTheme;
  scheduledTime?: string;
  onStart: () => void;
  isRedDay?: boolean;
}

const themeLabels: Record<DayTheme, string> = {
  focus: 'Focus',
  recharge: 'Recharge',
  flex: 'Flex',
  admin: 'Admin',
};

const themeDescriptions: Record<DayTheme, string> = {
  focus: 'Deep work, priority projects',
  recharge: 'Intentional recovery',
  flex: 'Errands, chores, social',
  admin: 'Planning, bills, email',
};

export function PrimaryBlockCard({
  dayTheme,
  scheduledTime,
  onStart,
  isRedDay = false,
}: PrimaryBlockCardProps) {
  const label = themeLabels[dayTheme];
  const description = themeDescriptions[dayTheme];

  return (
    <View
      className={cn(
        'rounded-lg border-2 p-6',
        isRedDay ? 'border-energy-red bg-red-50' : 'border-primary-500 bg-primary-50'
      )}
    >
      <AppText variant="title">Today is a {label} day</AppText>
      <AppText variant="caption" className="mt-1">
        {description}
      </AppText>
      {scheduledTime ? (
        <AppText variant="caption" className="mt-2 font-medium">
          Scheduled: {scheduledTime}
        </AppText>
      ) : null}

      <Button
        label={`Start ${label}`}
        onPress={onStart}
        className={cn('mt-4', isRedDay && 'bg-energy-red')}
      />
    </View>
  );
}
