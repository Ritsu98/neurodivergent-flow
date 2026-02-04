'use client';

import type { OnboardingData } from '@/app/onboarding/page';

interface SleepWindowStepProps {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SleepWindowStep({ data, onUpdate, onNext, onBack }: SleepWindowStepProps) {
  const sleepWindowStart = data.sleepWindowStart || '22:00';
  const sleepWindowEnd = data.sleepWindowEnd || '07:00';
  const downshiftReminderEnabled = data.downshiftReminderEnabled ?? true;

  const handleNext = () => {
    onUpdate({
      sleepWindowStart,
      sleepWindowEnd,
      downshiftReminderEnabled,
    });
    onNext();
  };

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold">Sleep window</h2>
      <p className="mb-6 text-text-secondary">When do you typically sleep?</p>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Bedtime</label>
          <input
            type="time"
            value={sleepWindowStart}
            onChange={(e) => onUpdate({ sleepWindowStart: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Wake time</label>
          <input
            type="time"
            value={sleepWindowEnd}
            onChange={(e) => onUpdate({ sleepWindowEnd: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="downshift"
            checked={downshiftReminderEnabled}
            onChange={(e) => onUpdate({ downshiftReminderEnabled: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="downshift" className="cursor-pointer">
            Enable downshift reminder (30 min before bedtime)
          </label>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-6 py-2 font-medium hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="rounded-lg bg-primary-500 px-6 py-2 font-medium text-white hover:bg-primary-600"
        >
          Next
        </button>
      </div>
    </div>
  );
}
