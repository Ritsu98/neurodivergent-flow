'use client';

import type { DayThemeConfig } from '@neurodivergent-flow/core';
import { DAY_NAMES, THEME_CHIP, getTodayDayIndex } from '@neurodivergent-flow/core';

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
    <div className="grid grid-cols-7 gap-2">
      {dayThemes
        .slice()
        .sort((a, b) => a.day - b.day)
        .map((config) => {
          const isToday = config.day === todayIndex;
          const isSelected = config.day === selectedDay;
          const hasWorkWindow = workWindowDays.includes(config.day);

          return (
            <button
              key={config.day}
              type="button"
              onClick={() => onSelectDay?.(config.day)}
              className={`relative flex flex-col items-center rounded-lg border-2 p-2 transition-colors ${
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : isToday
                    ? 'border-primary-300 bg-white ring-2 ring-primary-200'
                    : 'border-gray-200 bg-white hover:border-primary-200'
              }`}
              aria-label={`${DAY_NAMES[config.day]} ${config.theme}`}
            >
              {hasWorkWindow && (
                <span
                  className="absolute inset-x-1 top-1 h-1 rounded-full bg-gray-300"
                  title="Work window"
                />
              )}
              <span className="mt-1 text-xs font-medium text-text-secondary">
                {DAY_NAMES[config.day]}
              </span>
              <span
                className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${chipStyles[config.theme]}`}
              >
                {THEME_CHIP[config.theme]}
              </span>
              {isToday && (
                <span className="mt-1 text-[10px] font-medium text-primary-600">Today</span>
              )}
            </button>
          );
        })}
    </div>
  );
}
