import { View } from 'react-native';
import type { DayThemeConfig } from '@neurodivergent-flow/core';
import { DAY_NAMES, THEME_LABELS, swapDayThemes } from '@neurodivergent-flow/core';
import { WeekGlance } from '@/components/week/WeekGlance';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';

interface WeekPlanEditorProps {
  dayThemes: DayThemeConfig[];
  workWindowDays?: number[];
  onChange: (dayThemes: DayThemeConfig[]) => void;
}

export function WeekPlanEditor({ dayThemes, workWindowDays, onChange }: WeekPlanEditorProps) {
  const handleSwap = (day: number, direction: 'prev' | 'next') => {
    const other = direction === 'prev' ? day - 1 : day + 1;
    if (other < 0 || other > 6) return;
    onChange(swapDayThemes(dayThemes, day, other));
  };

  return (
    <View className="gap-4">
      <WeekGlance dayThemes={dayThemes} workWindowDays={workWindowDays} />
      <AppText variant="muted">Tap swap to exchange themes between adjacent days.</AppText>
      {dayThemes
        .slice()
        .sort((a, b) => a.day - b.day)
        .map((config) => (
          <View
            key={config.day}
            className="flex-row items-center justify-between rounded-lg border border-gray-200 p-3"
          >
            <AppText className="flex-1 text-sm">
              <AppText className="font-bold">{DAY_NAMES[config.day]}</AppText> —{' '}
              {THEME_LABELS[config.theme]}
              {config.scheduledTime ? ` at ${config.scheduledTime}` : ''}
            </AppText>
            <View className="flex-row gap-1">
              <Button
                label="←"
                variant="secondary"
                disabled={config.day === 0}
                onPress={() => handleSwap(config.day, 'prev')}
                className="px-2 py-1"
              />
              <Button
                label="→"
                variant="secondary"
                disabled={config.day === 6}
                onPress={() => handleSwap(config.day, 'next')}
                className="px-2 py-1"
              />
            </View>
          </View>
        ))}
    </View>
  );
}
