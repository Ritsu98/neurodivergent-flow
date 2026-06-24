import { useState, useEffect } from 'react';
import { View } from 'react-native';
import type { DayColor } from '@neurodivergent-flow/core';
import { Slider } from '@/components/ui/Slider';
import { AppText } from '@/components/ui/Text';
import { dayColorFromEnergy } from '@/lib/today';

interface EnergySliderProps {
  initialValue?: number;
  dayColor?: DayColor;
  onSave: (value: number) => Promise<void>;
  disabled?: boolean;
}

const energyLabels = ['Very low', 'Low', 'Moderate', 'Good', 'High', 'Very high'];

export function EnergySlider({ initialValue, onSave, disabled }: EnergySliderProps) {
  const [value, setValue] = useState(initialValue ?? 3);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialValue !== undefined) {
      setValue(initialValue);
    }
  }, [initialValue]);

  const colorLabel = dayColorFromEnergy(value);
  const labelCapitalized = colorLabel.charAt(0).toUpperCase() + colorLabel.slice(1);

  const handleChange = async (newValue: number) => {
    const rounded = Math.round(newValue);
    setValue(rounded);
    if (disabled) return;

    setIsSaving(true);
    try {
      await onSave(rounded);
    } catch (error) {
      console.error('Failed to save energy:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const badgeClass =
    colorLabel === 'green'
      ? 'bg-green-100'
      : colorLabel === 'yellow'
        ? 'bg-yellow-100'
        : 'bg-red-100';

  const textClass =
    colorLabel === 'green'
      ? 'text-energy-green'
      : colorLabel === 'yellow'
        ? 'text-energy-yellow'
        : 'text-energy-red';

  return (
    <View className="w-full">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-1">
          <AppText variant="subtitle">How&apos;s your energy today?</AppText>
          <AppText variant="caption" className="mt-1">
            Today is a{' '}
            <AppText className={`font-medium ${textClass}`}>{labelCapitalized}</AppText> plan
          </AppText>
        </View>
        {isSaving ? <AppText variant="muted">Saving…</AppText> : null}
      </View>

      <Slider
        value={value}
        onValueChange={(v) => void handleChange(v)}
        minimumValue={0}
        maximumValue={5}
        step={1}
        label="Energy level 0 to 5"
      />

      <View className="mt-2 flex-row justify-between">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <AppText key={n} variant="muted">
            {n}
          </AppText>
        ))}
      </View>

      <View className={`mt-4 rounded-lg p-3 ${badgeClass}`}>
        <AppText className={`text-center font-medium ${textClass}`}>{labelCapitalized}</AppText>
        <AppText variant="caption" className="mt-1 text-center">
          {energyLabels[value] ?? ''}
        </AppText>
      </View>
    </View>
  );
}
