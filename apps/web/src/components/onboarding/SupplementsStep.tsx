'use client';

import { useState } from 'react';
import type { OnboardingData } from '@/app/onboarding/page';

interface SupplementsStepProps {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const supplementTemplates = {
  basics: {
    name: 'Basics',
    description: 'Very conservative: Vitamin D, Magnesium PM, Hydration',
    items: ['Vitamin D (if you already take it)', 'Magnesium (PM)', 'Hydration anchor'],
  },
  sleep: {
    name: 'Sleep Support',
    description: 'Magnesium timing, Caffeine cutoff, Downshift checklist',
    items: ['Magnesium timing', 'No caffeine after X', 'Downshift checklist'],
  },
  focus: {
    name: 'Focus-Friendly Day',
    description: 'Caffeine timing, optional L-theanine, Protein reminder',
    items: ['Caffeine timing rules', 'L-theanine (if you use it)', 'Protein-with-breakfast reminder'],
  },
  busy: {
    name: 'Busy / Low Appetite Day',
    description: 'Electrolytes, Easy protein, Minimum nutrition',
    items: ['Electrolytes reminder', 'Easy protein prompt', 'Minimum nutrition counts'],
  },
};

export function SupplementsStep({ data, onUpdate, onNext, onBack }: SupplementsStepProps) {
  const [supplementsEnabled, setSupplementsEnabled] = useState(
    data.supplementsEnabled || false
  );
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  const handleToggleTemplate = (templateId: string) => {
    if (selectedTemplates.includes(templateId)) {
      setSelectedTemplates(selectedTemplates.filter((t) => t !== templateId));
    } else {
      setSelectedTemplates([...selectedTemplates, templateId]);
    }
  };

  const handleNext = () => {
    onUpdate({
      supplementsEnabled,
      selectedSupplements: selectedTemplates,
    });
    onNext();
  };

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold">Supplements (Optional)</h2>
      <p className="mb-6 text-text-secondary">
        Enable supplement reminders? These are reminders only, not medical advice.
      </p>

      <div className="mb-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="supplementsEnabled"
            checked={supplementsEnabled}
            onChange={(e) => setSupplementsEnabled(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="supplementsEnabled" className="cursor-pointer font-medium">
            Enable supplement reminders
          </label>
        </div>
        <p className="mt-2 text-sm text-text-secondary">
          You can always change this later in settings.
        </p>
      </div>

      {supplementsEnabled && (
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-energy-yellow bg-yellow-50 p-4">
            <p className="text-sm font-medium text-energy-yellow">
              ⚠️ Not medical advice. Verify interactions and suitability with a clinician.
            </p>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium">Select templates (optional):</label>
            <div className="space-y-3">
              {(Object.keys(supplementTemplates) as Array<keyof typeof supplementTemplates>).map(
                (templateId) => {
                  const template = supplementTemplates[templateId];
                  const isSelected = selectedTemplates.includes(templateId);
                  return (
                    <label
                      key={templateId}
                      className={`flex cursor-pointer items-start rounded-lg border-2 p-4 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleTemplate(templateId)}
                        className="mt-1"
                      />
                      <div className="ml-3">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-text-secondary">{template.description}</div>
                        <ul className="mt-2 text-xs text-text-muted">
                          {template.items.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </label>
                  );
                }
              )}
            </div>
          </div>
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
          Complete Setup
        </button>
      </div>
    </div>
  );
}
