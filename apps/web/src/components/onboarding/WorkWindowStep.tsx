'use client';

import { useState } from 'react';
import type { OnboardingData } from '@/app/onboarding/page';

interface WorkWindowStepProps {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function WorkWindowStep({ data, onUpdate, onNext }: WorkWindowStepProps) {
  const [workMode, setWorkMode] = useState<'none' | 'weekdays' | 'irregular' | ''>(
    data.workMode || ''
  );
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('17:00');
  const [afterWorkEnergy, setAfterWorkEnergy] = useState<'low' | 'mixed' | 'decent' | ''>(
    data.afterWorkEnergy || ''
  );
  const [preferredTime, setPreferredTime] = useState<'morning' | 'afternoon' | 'evening' | ''>(
    data.preferredPrimaryBlockTime || ''
  );

  const handleWorkModeChange = (mode: 'none' | 'weekdays' | 'irregular') => {
    setWorkMode(mode);
    onUpdate({ workMode: mode });
  };

  const handleNext = () => {
    if (workMode === 'weekdays') {
      onUpdate({
        workMode,
        workWindows: [{ days: [1, 2, 3, 4, 5], start: workStart, end: workEnd }],
        afterWorkEnergy: afterWorkEnergy as 'low' | 'mixed' | 'decent',
      });
    } else if (workMode === 'none') {
      onUpdate({
        workMode,
        preferredPrimaryBlockTime: preferredTime as 'morning' | 'afternoon' | 'evening',
      });
    } else {
      onUpdate({ workMode });
    }
    onNext();
  };

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold">Do you have structured work or study time?</h2>
      <p className="mb-6 text-text-secondary">This helps us schedule your Primary Blocks.</p>

      <div className="space-y-4">
        <label className="flex cursor-pointer items-start rounded-lg border-2 border-gray-200 p-4 hover:border-primary-300">
          <input
            type="radio"
            name="workMode"
            value="weekdays"
            checked={workMode === 'weekdays'}
            onChange={() => handleWorkModeChange('weekdays')}
            className="mt-1"
          />
          <div className="ml-3">
            <div className="font-medium">Yes, mostly weekdays</div>
            <div className="text-sm text-text-secondary">Mon-Fri schedule</div>
          </div>
        </label>

        <label className="flex cursor-pointer items-start rounded-lg border-2 border-gray-200 p-4 hover:border-primary-300">
          <input
            type="radio"
            name="workMode"
            value="irregular"
            checked={workMode === 'irregular'}
            onChange={() => handleWorkModeChange('irregular')}
            className="mt-1"
          />
          <div className="ml-3">
            <div className="font-medium">Yes, rotating or irregular</div>
            <div className="text-sm text-text-secondary">Shifts or changing schedule</div>
          </div>
        </label>

        <label className="flex cursor-pointer items-start rounded-lg border-2 border-gray-200 p-4 hover:border-primary-300">
          <input
            type="radio"
            name="workMode"
            value="none"
            checked={workMode === 'none'}
            onChange={() => handleWorkModeChange('none')}
            className="mt-1"
          />
          <div className="ml-3">
            <div className="font-medium">No</div>
            <div className="text-sm text-text-secondary">No structured work time</div>
          </div>
        </label>
      </div>

      {/* Work window details for weekdays */}
      {workMode === 'weekdays' && (
        <div className="mt-6 space-y-4 rounded-lg bg-gray-50 p-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Work hours (Mon-Fri)</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-text-secondary">Start</label>
                <input
                  type="time"
                  value={workStart}
                  onChange={(e) => setWorkStart(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-text-secondary">End</label>
                <input
                  type="time"
                  value={workEnd}
                  onChange={(e) => setWorkEnd(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">After work, energy tends to be:</label>
            <div className="space-y-2">
              {(['low', 'mixed', 'decent'] as const).map((energy) => (
                <label key={energy} className="flex cursor-pointer items-center">
                  <input
                    type="radio"
                    name="afterWorkEnergy"
                    value={energy}
                    checked={afterWorkEnergy === energy}
                    onChange={(e) => setAfterWorkEnergy(e.target.value as typeof energy)}
                    className="mr-2"
                  />
                  <span className="capitalize">{energy}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preferred time for no work */}
      {workMode === 'none' && (
        <div className="mt-6 space-y-4 rounded-lg bg-gray-50 p-4">
          <div>
            <label className="mb-2 block text-sm font-medium">When is your preferred energy peak?</label>
            <div className="space-y-2">
              {(['morning', 'afternoon', 'evening'] as const).map((time) => (
                <label key={time} className="flex cursor-pointer items-center">
                  <input
                    type="radio"
                    name="preferredTime"
                    value={time}
                    checked={preferredTime === time}
                    onChange={(e) => setPreferredTime(e.target.value as typeof time)}
                    className="mr-2"
                  />
                  <span className="capitalize">{time}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          disabled={!workMode || (workMode === 'weekdays' && !afterWorkEnergy) || (workMode === 'none' && !preferredTime)}
          className="rounded-lg bg-primary-500 px-6 py-2 font-medium text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-primary-600"
        >
          Next
        </button>
      </div>
    </div>
  );
}
