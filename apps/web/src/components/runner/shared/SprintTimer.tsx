'use client';

import { formatTimerDisplay, getTimerProgress } from '@neurodivergent-flow/core';

interface SprintTimerProps {
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isPaused: boolean;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onAbandon: () => void;
  onSkip?: () => void;
  children?: React.ReactNode;
}

export function SprintTimer({
  label,
  totalSeconds,
  remainingSeconds,
  isPaused,
  isRunning,
  onStart,
  onPause,
  onResume,
  onAbandon,
  onSkip,
  children,
}: SprintTimerProps) {
  const progress = getTimerProgress(totalSeconds, remainingSeconds);
  const display = formatTimerDisplay(remainingSeconds);

  return (
    <div className="flex min-h-screen flex-col bg-surface p-4">
      <div className="mx-auto w-full max-w-lg flex-1">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        <h1 className="mt-2 text-5xl font-bold tabular-nums">{display}</h1>

        <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-primary-500 transition-all duration-1000"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {children && <div className="mt-6">{children}</div>}

        <div className="mt-8 flex flex-wrap gap-3">
          {!isRunning && (
            <button
              type="button"
              onClick={onStart}
              className="rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white"
            >
              Start
            </button>
          )}
          {isRunning && !isPaused && (
            <button
              type="button"
              onClick={onPause}
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium"
            >
              Pause
            </button>
          )}
          {isPaused && (
            <button
              type="button"
              onClick={onResume}
              className="rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white"
            >
              Resume
            </button>
          )}
          {(isRunning || isPaused) && (
            <button
              type="button"
              onClick={onAbandon}
              className="rounded-lg px-6 py-3 text-sm text-text-secondary hover:text-energy-red"
            >
              Abandon
            </button>
          )}
          {onSkip && !isRunning && (
            <button
              type="button"
              onClick={onSkip}
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium"
            >
              Skip timer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
