import { Pressable, View } from 'react-native';
import type { DayThemeConfig } from '@neurodivergent-flow/core';
import { DAY_NAMES, THEME_CHIP, getTodayDayIndex } from '@neurodivergent-flow/core';
import { AppText } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

interface WeekGlanceProps {
  dayThemes: DayThemeConfig[];
  workWindowDays?: number[];
  selectedDay?: number;
  onSelectDay?: (day: number) => void;
}

const chipStyles: Record<string, string> = {
  focus: 'bg-blue-100 text-blue-800 border-blue-300',
  recharge: 'bg-green-100 text-green-800 border-green-300',
  flex: 'bg-amber-100 text-amber-800 border-amber-300',
  admin: 'bg-purple-100 text-purple-800 border-purple-300',
};

export function WeekGlance({
  dayThemes,
  workWindowDays = [],
  selectedDay,
  onSelectDay,
}: WeekGlanceProps) {
  const todayIndex = getTodayDayIndex();

  return (
    <View className="flex-row flex-wrap justify-between gap-2">
      {dayThemes
        .slice()
        .sort((a, b) => a.day - b.day)
        .map((config) => {
          const isToday = config.day === todayIndex;
          const isSelected = config.day === selectedDay;
          const hasWorkWindow = workWindowDays.includes(config.day);

          return (
            <Pressable
              key={config.day}
              onPress={() => onSelectDay?.(config.day)}
              accessibilityLabel={`${DAY_NAMES[config.day]} ${config.theme}`}
              className={cn(
                'min-w-[12%] flex-1 items-center rounded-lg border-2 p-2',
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : isToday
                    ? 'border-primary-300 bg-white'
                    : 'border-gray-200 bg-white'
              )}
            >
              {hasWorkWindow ? (
                <View className="absolute left-1 right-1 top-1 h-1 rounded-full bg-gray-300" />
              ) : null}
              <AppText variant="muted" className="mt-1 text-xs font-medium">
                {DAY_NAMES[config.day]}
              </AppText>
              <View
                className={cn(
                  'mt-1 h-8 w-8 items-center justify-center rounded-full border',
                  chipStyles[config.theme]
                )}
              >
                <AppText className="text-sm font-bold">{THEME_CHIP[config.theme]}</AppText>
              </View>
              {isToday ? (
                <AppText className="mt-1 text-[10px] font-medium text-primary-600">Today</AppText>
              ) : null}
            </Pressable>
          );
        })}
    </View>
  );
}
