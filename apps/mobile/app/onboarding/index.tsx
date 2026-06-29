import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generateWeekPlan } from '@neurodivergent-flow/core';
import { createWeekPlanLocalFirst, upsertUserPrefsLocalFirst } from '@/lib/localData';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { WorkWindowStep } from '@/components/onboarding/WorkWindowStep';
import { SleepWindowStep } from '@/components/onboarding/SleepWindowStep';
import { IntensityStep } from '@/components/onboarding/IntensityStep';
import { RechargeStep } from '@/components/onboarding/RechargeStep';
import { SupplementsStep } from '@/components/onboarding/SupplementsStep';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { setOnboardingComplete } from '@/lib/onboarding';
import { getNextWeekStartDate } from '@/lib/weekStart';
import type { OnboardingData } from '@/types/onboarding';

const TOTAL_STEPS = 5;

export default function OnboardingScreen() {
  const { userId } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Partial<OnboardingData>>({
    downshiftReminderEnabled: true,
    weekIntensity: 'normal',
    rechargeDefaults: [],
    supplementsEnabled: false,
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((step) => step + 1);
    } else {
      void handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((step) => step - 1);
    }
  };

  const handleComplete = async () => {
    if (!userId) return;
    if (!data.workMode || !data.weekIntensity) {
      Alert.alert('Missing info', 'Please complete all required steps.');
      return;
    }

    setSaving(true);
    try {
      await upsertUserPrefsLocalFirst(userId, {
        workMode: data.workMode,
        workWindows: data.workWindows,
        afterWorkEnergy: data.afterWorkEnergy,
        preferredPrimaryBlockTime: data.preferredPrimaryBlockTime,
        sleepWindowStart: data.sleepWindowStart,
        sleepWindowEnd: data.sleepWindowEnd,
        downshiftReminderEnabled: data.downshiftReminderEnabled ?? true,
        weekIntensityDefault: data.weekIntensity,
        rechargeDefaults: data.rechargeDefaults || [],
      });

      const dayThemes = generateWeekPlan(
        data.weekIntensity,
        data.workWindows,
        data.preferredPrimaryBlockTime
      );

      await createWeekPlanLocalFirst({
        userId: userId,
        startDate: getNextWeekStartDate(),
        intensity: data.weekIntensity,
        weeklyOutcomes: [],
        dayThemes,
      });

      await setOnboardingComplete(true);
      router.replace('/(tabs)/today');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      Alert.alert('Save failed', 'Could not save your preferences. Check Supabase env and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <OnboardingProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        <Card className="p-6">
          {currentStep === 1 ? (
            <WorkWindowStep data={data} onUpdate={updateData} onNext={handleNext} />
          ) : null}
          {currentStep === 2 ? (
            <SleepWindowStep
              data={data}
              onUpdate={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          ) : null}
          {currentStep === 3 ? (
            <IntensityStep
              data={data}
              onUpdate={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          ) : null}
          {currentStep === 4 ? (
            <RechargeStep
              data={data}
              onUpdate={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          ) : null}
          {currentStep === 5 ? (
            <SupplementsStep
              data={data}
              onUpdate={updateData}
              onNext={handleNext}
              onBack={handleBack}
              loading={saving}
            />
          ) : null}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
