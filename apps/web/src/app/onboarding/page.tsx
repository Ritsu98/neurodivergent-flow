'use client';

import { useState } from 'react';
import { WorkWindowStep } from '@/components/onboarding/WorkWindowStep';
import { SleepWindowStep } from '@/components/onboarding/SleepWindowStep';
import { IntensityStep } from '@/components/onboarding/IntensityStep';
import { RechargeStep } from '@/components/onboarding/RechargeStep';
import { SupplementsStep } from '@/components/onboarding/SupplementsStep';

export type OnboardingData = {
  workMode: 'none' | 'weekdays' | 'irregular';
  workWindows?: Array<{ days: number[]; start: string; end: string }>;
  afterWorkEnergy?: 'low' | 'mixed' | 'decent';
  preferredPrimaryBlockTime?: 'morning' | 'afternoon' | 'evening';
  sleepWindowStart?: string;
  sleepWindowEnd?: string;
  downshiftReminderEnabled: boolean;
  weekIntensity: 'light' | 'normal' | 'heavy';
  rechargeDefaults: string[];
  supplementsEnabled: boolean;
  selectedSupplements?: string[];
};

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({
    downshiftReminderEnabled: true,
    weekIntensity: 'normal',
    rechargeDefaults: [],
    supplementsEnabled: false,
  });

  const totalSteps = 5;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // TODO: Get userId from auth (will be implemented in Stage 1.3)
      const userId = 'temp-user-id'; // Replace with actual auth

      // Save user preferences
      const { upsertUserPrefs } = await import('@neurodivergent-flow/api');
      await upsertUserPrefs(userId, {
        workMode: data.workMode!,
        workWindows: data.workWindows,
        afterWorkEnergy: data.afterWorkEnergy,
        preferredPrimaryBlockTime: data.preferredPrimaryBlockTime,
        sleepWindowStart: data.sleepWindowStart,
        sleepWindowEnd: data.sleepWindowEnd,
        downshiftReminderEnabled: data.downshiftReminderEnabled ?? true,
        weekIntensityDefault: data.weekIntensity!,
        rechargeDefaults: data.rechargeDefaults || [],
      });

      // Generate and save first week plan
      const { generateWeekPlan } = await import('@neurodivergent-flow/core');
      const { createWeekPlan } = await import('@neurodivergent-flow/api');

      // Calculate start date (next Monday or today if Monday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + daysUntilMonday);
      const startDateStr = startDate.toISOString().split('T')[0];

      const dayThemes = generateWeekPlan(
        data.weekIntensity!,
        data.workWindows,
        data.preferredPrimaryBlockTime
      );

      await createWeekPlan({
        userId,
        startDate: startDateStr,
        intensity: data.weekIntensity!,
        weeklyOutcomes: [],
        dayThemes,
      });

      // Navigate to Today screen
      window.location.href = '/today';
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      alert('Failed to save your preferences. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-text-secondary">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-primary-500 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          {currentStep === 1 && (
            <WorkWindowStep data={data} onUpdate={updateData} onNext={handleNext} />
          )}
          {currentStep === 2 && (
            <SleepWindowStep data={data} onUpdate={updateData} onNext={handleNext} onBack={handleBack} />
          )}
          {currentStep === 3 && (
            <IntensityStep data={data} onUpdate={updateData} onNext={handleNext} onBack={handleBack} />
          )}
          {currentStep === 4 && (
            <RechargeStep data={data} onUpdate={updateData} onNext={handleNext} onBack={handleBack} />
          )}
          {currentStep === 5 && (
            <SupplementsStep data={data} onUpdate={updateData} onNext={handleNext} onBack={handleBack} />
          )}
        </div>
      </div>
    </div>
  );
}
