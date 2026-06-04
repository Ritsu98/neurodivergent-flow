'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppNav } from '@/components/layout/AppNav';
import { WeekPlanEditor } from '@/components/week/WeekPlanEditor';
import type { DayThemeConfig, WeekIntensity } from '@neurodivergent-flow/core';
import { generateWeekPlan, getSundaySetupStartDate } from '@neurodivergent-flow/core';
import {
  getUserPrefs,
  createWeekPlan,
  getWeekPlan,
  updateWeekPlan,
} from '@neurodivergent-flow/api';

const USER_ID = 'temp-user-id';
const TOTAL_STEPS = 4;

const intensityOptions: { value: WeekIntensity; title: string; desc: string }[] = [
  { value: 'light', title: 'Light', desc: '1 Focus, 3 Recharge, 2 Flex, 1 Admin' },
  { value: 'normal', title: 'Normal', desc: '2 Focus, 2 Recharge, 2 Flex, 1 Admin' },
  { value: 'heavy', title: 'Heavy', desc: '3 Focus, 1 Recharge, 2 Flex, 1 Admin' },
];

export default function SundaySetupPage() {
  const router = useRouter();
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

  const handleConfirmPlan = () => setStep(3);

  const handleOutcomesNext = () => setStep(4);

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
        await import('@neurodivergent-flow/api').then(({ upsertUserPrefs }) =>
          upsertUserPrefs(USER_ID, { weekIntensityDefault: intensity })
        );
      }

      router.push('/today');
    } catch (error) {
      console.error('Sunday setup failed:', error);
      alert('Could not save your week plan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <AppNav showSundayBanner={false} />
      <main className="mx-auto max-w-2xl p-4">
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-sm text-text-secondary">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-primary-500 transition-all"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold">Choose intensity</h1>
              <p className="mt-2 text-sm text-text-secondary">How does this week look?</p>
              <div className="mt-6 space-y-3">
                {intensityOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-start rounded-lg border-2 p-4 ${
                      intensity === opt.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="intensity"
                      checked={intensity === opt.value}
                      onChange={() => setIntensity(opt.value)}
                      className="mt-1"
                    />
                    <div className="ml-3">
                      <div className="font-medium">{opt.title}</div>
                      <div className="text-sm text-text-secondary">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={handleIntensityNext}
                className="mt-8 rounded-lg bg-primary-500 px-6 py-2 font-medium text-white"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold">Confirm your week</h1>
              <p className="mt-2 text-sm text-text-secondary">Reorder if helpful.</p>
              <div className="mt-6">
                <WeekPlanEditor
                  dayThemes={dayThemes}
                  workWindowDays={workWindowDays}
                  onChange={setDayThemes}
                />
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-gray-300 px-6 py-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPlan}
                  className="rounded-lg bg-primary-500 px-6 py-2 font-medium text-white"
                >
                  Confirm plan
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold">Weekly outcomes</h1>
              <p className="mt-2 text-sm text-text-secondary">
                What are 1–3 outcomes you want this week? Optional.
              </p>
              <div className="mt-6 space-y-3">
                {outcomes.map((value, i) => (
                  <input
                    key={i}
                    type="text"
                    value={value}
                    onChange={(e) => {
                      const next = [...outcomes];
                      next[i] = e.target.value;
                      setOutcomes(next);
                    }}
                    placeholder={`Outcome ${i + 1}`}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                ))}
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-lg border border-gray-300 px-6 py-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleOutcomesNext}
                  className="rounded-lg bg-primary-500 px-6 py-2 font-medium text-white"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 className="text-2xl font-bold">Supplements check-in</h1>
              <p className="mt-2 text-sm text-text-secondary">Optional — skipped if not enabled.</p>
              <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-6 text-sm text-text-secondary">
                Supplement reminders and refill tracking will appear here once your supplement plan
                is configured during onboarding. For now, check your supplies manually if you take any.
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-lg border border-gray-300 px-6 py-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={isSaving}
                  className="rounded-lg bg-primary-500 px-6 py-2 font-medium text-white disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Finish — go to Today'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
