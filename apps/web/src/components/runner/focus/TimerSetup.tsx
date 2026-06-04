'use client';

import {
  FOCUS_DURATION_OPTIONS,
  BREAK_DURATION_OPTIONS,
  type FocusRunnerSettings,
} from '@neurodivergent-flow/core';

interface TimerSetupProps {
  settings: FocusRunnerSettings;
  onChange: (settings: FocusRunnerSettings) => void;
}

export function TimerSetup({ settings, onChange }: TimerSetupProps) {
  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-sm font-semibold">Timer lengths</h2>
      <p className="mt-1 text-xs text-text-secondary">Two focus blocks with a break between.</p>

      <label className="mt-4 block text-sm font-medium">Focus block (minutes)</label>
      <select
        value={settings.focusDurationMinutes}
        onChange={(e) =>
          onChange({ ...settings, focusDurationMinutes: Number(e.target.value) })
        }
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
      >
        {FOCUS_DURATION_OPTIONS.map((m) => (
          <option key={m} value={m}>
            {m} min
          </option>
        ))}
      </select>

      <label className="mt-4 block text-sm font-medium">Break (minutes)</label>
      <select
        value={settings.breakDurationMinutes}
        onChange={(e) =>
          onChange({ ...settings, breakDurationMinutes: Number(e.target.value) })
        }
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
      >
        {BREAK_DURATION_OPTIONS.map((m) => (
          <option key={m} value={m}>
            {m} min
          </option>
        ))}
      </select>
    </div>
  );
}
