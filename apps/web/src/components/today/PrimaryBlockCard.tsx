'use client';

import type { DayTheme, DayThemeConfig } from '@neurodivergent-flow/core';

interface PrimaryBlockCardProps {
  dayTheme: DayTheme;
  scheduledTime?: string;
  onStart: () => void;
  onEdit?: () => void;
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
  onEdit,
  isRedDay = false,
}: PrimaryBlockCardProps) {
  const label = themeLabels[dayTheme];
  const description = themeDescriptions[dayTheme];

  return (
    <div className={`rounded-lg border-2 p-6 ${isRedDay ? 'border-energy-red bg-red-50' : 'border-primary-500 bg-primary-50'}`}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Today is a {label} day</h2>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
        {scheduledTime && (
          <p className="mt-2 text-sm font-medium text-text-secondary">
            Scheduled: {scheduledTime}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onStart}
          className={`flex-1 rounded-lg px-6 py-3 font-semibold text-white transition-colors ${
            isRedDay ? 'bg-energy-red hover:bg-red-600' : 'bg-primary-500 hover:bg-primary-600'
          }`}
        >
          Start {label}
        </button>
        {onEdit && (
          <button
            onClick={onEdit}
            className="rounded-lg border border-gray-300 px-4 py-3 font-medium hover:bg-gray-50"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
