'use client';

import { useState } from 'react';
import type { OnboardingData } from '@/app/onboarding/page';

interface IntensityStepProps {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const intensityDescriptions = {
  light: {
    title: 'Light',
    description: '1 Focus, 3 Recharge, 2 Flex, 1 Admin',
    days: 'More recovery time, less intensity',
  },
  normal: {
    title: 'Normal',
    description: '2 Focus, 2 Recharge, 2 Flex, 1 Admin',
    days: 'Balanced rhythm (recommended)',
  },
  heavy: {
    title: 'Heavy',
    description: '3 Focus, 1 Recharge, 2 Flex, 1 Admin',
    days: 'Higher intensity, watch for burnout',
    warning: true,
  },
};

export function IntensityStep({ data, onUpdate, onNext, onBack }: IntensityStepProps) {
  const weekIntensity = data.weekIntensity || 'normal';
  const [showWarning, setShowWarning] = useState(false);

  const handleIntensityChange = (intensity: 'light' | 'normal' | 'heavy') => {
    if (intensity === 'heavy') {
      setShowWarning(true);
    } else {
      setShowWarning(false);
      onUpdate({ weekIntensity: intensity });
    }
  };

  const handleConfirmHeavy = () => {
    setShowWarning(false);
    onUpdate({ weekIntensity: 'heavy' });
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold">Choose your default week intensity</h2>
      <p className="mb-6 text-text-secondary">You can change this each week during Sunday Setup.</p>

      {showWarning && (
        <div className="mb-6 rounded-lg border-2 border-energy-red bg-red-50 p-4">
          <p className="font-medium text-energy-red">Higher risk of burnout</p>
          <p className="mt-1 text-sm text-text-secondary">
            Heavy intensity means more focus days. Start with Normal?
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                setShowWarning(false);
                onUpdate({ weekIntensity: 'normal' });
              }}
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
            >
              Use Normal
            </button>
            <button
              onClick={handleConfirmHeavy}
              className="rounded-lg border border-energy-red px-4 py-2 text-sm font-medium text-energy-red hover:bg-red-100"
            >
              Continue with Heavy
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {(Object.keys(intensityDescriptions) as Array<keyof typeof intensityDescriptions>).map(
          (intensity) => {
            const desc = intensityDescriptions[intensity];
            return (
              <label
                key={intensity}
                className={`flex cursor-pointer items-start rounded-lg border-2 p-4 ${
                  weekIntensity === intensity
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <input
                  type="radio"
                  name="intensity"
                  value={intensity}
                  checked={weekIntensity === intensity}
                  onChange={() => handleIntensityChange(intensity)}
                  className="mt-1"
                />
                <div className="ml-3 flex-1">
                  <div className="font-medium">{desc.title}</div>
                  <div className="text-sm text-text-secondary">{desc.description}</div>
                  <div className="mt-1 text-xs text-text-muted">{desc.days}</div>
                </div>
              </label>
            );
          }
        )}
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
          disabled={!weekIntensity}
          className="rounded-lg bg-primary-500 px-6 py-2 font-medium text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-primary-600"
        >
          Next
        </button>
      </div>
    </div>
  );
}
