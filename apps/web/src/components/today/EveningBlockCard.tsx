'use client';

import { useState } from 'react';
import type { DayTheme } from '@neurodivergent-flow/core';

interface EveningBlockCardProps {
  primaryBlockType: DayTheme;
  scheduledTime?: string;
  onStart: () => void;
}

const themeLabels: Record<DayTheme, string> = {
  focus: 'Focus',
  recharge: 'Recharge',
  flex: 'Flex',
  admin: 'Admin',
};

export function EveningBlockCard({
  primaryBlockType,
  scheduledTime,
  onStart,
}: EveningBlockCardProps) {
  const [showChecklist, setShowChecklist] = useState(false);

  const activationChecklist = [
    'Phone away or silent',
    'Water nearby',
    'Comfortable position',
    'Clear workspace',
  ];

  return (
    <div className="rounded-lg border-2 border-primary-300 bg-primary-50 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">After work</h3>
        <p className="mt-1 text-sm text-text-secondary">
          {themeLabels[primaryBlockType]} block {scheduledTime && `at ${scheduledTime}`}
        </p>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowChecklist(!showChecklist)}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          {showChecklist ? 'Hide' : 'Show'} 2-min activation checklist
        </button>

        {showChecklist && (
          <div className="mt-3 space-y-2 rounded-lg bg-white p-4">
            {activationChecklist.map((item, index) => (
              <label key={index} className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onStart}
        className="w-full rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white hover:bg-primary-600"
      >
        Start Evening Block
      </button>
    </div>
  );
}
