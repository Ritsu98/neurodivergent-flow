'use client';

import type { DayThemeConfig, DayTheme, Task } from '@neurodivergent-flow/core';
import {
  DAY_NAMES,
  THEME_LABELS,
  cycleDayTheme,
  swapDayThemes,
  adjustScheduledTime,
  isWorkday,
} from '@neurodivergent-flow/core';

interface DayDetailViewProps {
  config: DayThemeConfig;
  tasks: Task[];
  workWindowDays?: number[];
  workWindowTime?: string;
  onBack: () => void;
  onUpdateDay: (updated: DayThemeConfig) => void;
  onSwapWithDay: (otherDay: number) => void;
}

export function DayDetailView({
  config,
  tasks,
  workWindowDays = [],
  workWindowTime,
  onBack,
  onUpdateDay,
  onSwapWithDay,
}: DayDetailViewProps) {
  const dayTasks = tasks.filter((t) => t.day === config.day && t.status !== 'done').slice(0, 3);
  const hasWork = isWorkday(config.day, workWindowDays);

  const handleConvertTheme = () => {
    onUpdateDay({ ...config, theme: cycleDayTheme(config.theme) });
  };

  const handleTimeShift = (delta: number) => {
    if (!config.scheduledTime) return;
    onUpdateDay({ ...config, scheduledTime: adjustScheduledTime(config.scheduledTime, delta) });
  };

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className="text-sm font-medium text-primary-600">
        ← Back to week
      </button>

      <div>
        <h2 className="text-2xl font-bold">{DAY_NAMES[config.day]}</h2>
        <p className="text-text-secondary">
          {THEME_LABELS[config.theme]} day
          {config.scheduledTime && ` · ${config.scheduledTime}`}
        </p>
      </div>

      {hasWork && workWindowTime && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
          Work window: {workWindowTime}
        </div>
      )}

      <div className="space-y-3 rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold">Edit Primary Block</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleConvertTheme}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            Convert to next type
          </button>
          {config.day < 6 && (
            <button
              type="button"
              onClick={() => onSwapWithDay(config.day + 1)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              Swap with {DAY_NAMES[config.day + 1]}
            </button>
          )}
          {config.scheduledTime && (
            <>
              <button
                type="button"
                onClick={() => handleTimeShift(-30)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
              >
                30 min earlier
              </button>
              <button
                type="button"
                onClick={() => handleTimeShift(30)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
              >
                30 min later
              </button>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Top tasks</h3>
        {dayTasks.length === 0 ? (
          <p className="text-sm text-text-secondary">No tasks for this day yet.</p>
        ) : (
          <ul className="space-y-2">
            {dayTasks.map((task) => (
              <li key={task.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                <div className="font-medium">{task.title}</div>
                {task.nextStep && (
                  <div className="mt-1 text-text-muted">Next: {task.nextStep}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export { swapDayThemes };
