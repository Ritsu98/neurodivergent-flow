'use client';

import type { DayThemeConfig } from '@neurodivergent-flow/core';
import { DAY_NAMES, THEME_LABELS, swapDayThemes } from '@neurodivergent-flow/core';
import { WeekGlance } from './WeekGlance';

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
    <div className="space-y-4">
      <WeekGlance
        dayThemes={dayThemes}
        workWindowDays={workWindowDays}
        onSelectDay={() => {}}
      />
      <p className="text-xs text-text-secondary">
        Tap swap to exchange themes between adjacent days.
      </p>
      <div className="space-y-2">
        {dayThemes
          .slice()
          .sort((a, b) => a.day - b.day)
          .map((config) => (
            <div
              key={config.day}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm"
            >
              <span>
                <strong>{DAY_NAMES[config.day]}</strong> — {THEME_LABELS[config.theme]}
                {config.scheduledTime && ` at ${config.scheduledTime}`}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={config.day === 0}
                  onClick={() => handleSwap(config.day, 'prev')}
                  className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-40"
                >
                  ← Swap
                </button>
                <button
                  type="button"
                  disabled={config.day === 6}
                  onClick={() => handleSwap(config.day, 'next')}
                  className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-40"
                >
                  Swap →
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
