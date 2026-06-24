import { useState } from 'react';
import { Alert, ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DayThemeConfig, WeekIntensity } from '@neurodivergent-flow/core';
import {
  generateWeekPlan,
  getSundaySetupStartDate,
} from '@neurodivergent-flow/core';
import {
  createWeekPlan,
  getUserPrefs,
  getWeekPlan,
  updateWeekPlan,
  upsertUserPrefs,
} from '@neurodivergent-flow/api';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { RadioOption } from '@/components/onboarding/RadioOption';
import { StepActions } from '@/components/onboarding/StepActions';
import { WeekPlanEditor } from '@/components/week/WeekPlanEditor';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/Text';
import { USER_ID } from '@/constants/user';

const TOTAL_STEPS = 4;

const intensityOptions: { value: WeekIntensity; title: string; desc: string }[] = [
  { value: 'light', title: 'Light', desc: '1 Focus, 3 Recharge, 2 Flex, 1 Admin' },
  { value: 'normal', title: 'Normal', desc: '2 Focus, 2 Recharge, 2 Flex, 1 Admin' },
  { value: 'heavy', title: 'Heavy', desc: '3 Focus, 1 Recharge, 2 Flex, 1 Admin' },
];

export default function SundaySetupScreen() {
  const [step, setStep] = useState(1);
  const [intensity, setIntensity] = useState<WeekIntensity>('normal');
  const [dayThemes, setDayThemes] = useState<DayThemeConfig[]>([]);
  const [outcomes, setOutcomes] = useState(['', '', '']);
  const [workWindowDays, setWorkWindowDays] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const initPlan = async (selectedIntensity: WeekIntensity) => {
    const prefs = await getUserPrefs(USER_ID);
    const themes = generateWeekPlan(
      selectedIntensity,
      prefs?.workWindows,
      prefs?.preferredPrimaryBlockTime
    );
    setDayThemes(themes);
    setWorkWindowDays(prefs?.workWindows?.flatMap((w) => w.days) ?? []);
    setIntensity(selectedIntensity);
  };

  const handleIntensityNext = async () => {
    await initPlan(intensity);
    setStep(2);
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      const prefs = await getUserPrefs(USER_ID);
      const startDate = getSundaySetupStartDate();
      const weeklyOutcomes = outcomes.map((o) => o.trim()).filter(Boolean);

      const existing = await getWeekPlan(USER_ID, startDate);
      if (existing) {
        await updateWeekPlan(existing.id, {
          intensity,
          dayThemes,
          weeklyOutcomes,
        });
      } else {
        await createWeekPlan({
          userId: USER_ID,
          startDate,
          intensity,
          dayThemes,
          weeklyOutcomes,
        });
      }

      if (prefs) {
        await upsertUserPrefs(USER_ID, { weekIntensityDefault: intensity });
      }

      router.replace('/(tabs)/today');
    } catch (error) {
      console.error('Sunday setup failed:', error);
      Alert.alert('Save failed', 'Could not save your week plan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />
        <Card className="p-6">
          {step === 1 ? (
            <View>
              <AppText variant="title">Choose intensity</AppText>
              <AppText variant="caption" className="mb-6 mt-2">
                How does this week look?
              </AppText>
              {intensityOptions.map((opt) => (
                <View key={opt.value} className="mb-2">
                  <RadioOption
                    label={opt.title}
                    description={opt.desc}
                    selected={intensity === opt.value}
                    onPress={() => setIntensity(opt.value)}
                  />
                </View>
              ))}
              <StepActions onNext={() => void handleIntensityNext()} />
            </View>
          ) : null}

          {step === 2 ? (
            <View>
              <AppText variant="title">Confirm your week</AppText>
              <AppText variant="caption" className="mb-4 mt-2">
                Reorder if helpful.
              </AppText>
              <WeekPlanEditor
                dayThemes={dayThemes}
                workWindowDays={workWindowDays}
                onChange={setDayThemes}
              />
              <StepActions onBack={() => setStep(1)} onNext={() => setStep(3)} nextLabel="Confirm plan" />
            </View>
          ) : null}

          {step === 3 ? (
            <View>
              <AppText variant="title">Weekly outcomes</AppText>
              <AppText variant="caption" className="mb-4 mt-2">
                What are 1–3 outcomes you want this week? Optional.
              </AppText>
              {outcomes.map((value, i) => (
                <TextInput
                  key={i}
                  value={value}
                  onChangeText={(text) => {
                    const next = [...outcomes];
                    next[i] = text;
                    setOutcomes(next);
                  }}
                  placeholder={`Outcome ${i + 1}`}
                  className="mb-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                />
              ))}
              <StepActions onBack={() => setStep(2)} onNext={() => setStep(4)} />
            </View>
          ) : null}

          {step === 4 ? (
            <View>
              <AppText variant="title">Supplements check-in</AppText>
              <AppText variant="caption" className="mb-4 mt-2">
                Optional — skipped if not enabled.
              </AppText>
              <Card className="border-dashed bg-gray-50">
                <AppText variant="caption">
                  Supplement reminders will appear here once configured. For now, check
                  your supplies manually if you take any.
                </AppText>
              </Card>
              <StepActions
                onBack={() => setStep(3)}
                onNext={() => void handleComplete()}
                nextLabel="Finish — go to Today"
                loading={isSaving}
              />
            </View>
          ) : null}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
