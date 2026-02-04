'use client';

import { useState } from 'react';
import type { OnboardingData } from '@/app/onboarding/page';

interface RechargeStepProps {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const rechargeOptions = [
  { id: 'movie', label: 'Movie' },
  { id: 'reading', label: 'Reading' },
  { id: 'walk', label: 'Walk' },
  { id: 'bath', label: 'Bath' },
  { id: 'hobby', label: 'Hobby' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'music', label: 'Music' },
  { id: 'nature', label: 'Nature' },
  { id: 'other', label: 'Other' },
];

export function RechargeStep({ data, onUpdate, onNext, onBack }: RechargeStepProps) {
  const [selected, setSelected] = useState<string[]>(data.rechargeDefaults || []);

  const handleToggle = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const handleNext = () => {
    onUpdate({ rechargeDefaults: selected });
    onNext();
  };

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold">Choose your recharge activities</h2>
      <p className="mb-6 text-text-secondary">Pick up to 3 defaults for your Recharge Runner.</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {rechargeOptions.map((option) => {
          const isSelected = selected.includes(option.id);
          return (
            <button
              key={option.id}
              onClick={() => handleToggle(option.id)}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="font-medium">{option.label}</div>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="mt-4 text-sm text-text-secondary">
          Selected: {selected.length} / 3
        </div>
      )}

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
