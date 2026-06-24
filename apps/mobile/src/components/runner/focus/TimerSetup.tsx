import { Pressable, View } from 'react-native';
import {
  BREAK_DURATION_OPTIONS,
  FOCUS_DURATION_OPTIONS,
  type FocusRunnerSettings,
} from '@neurodivergent-flow/core';
import { AppText } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

interface TimerSetupProps {
  settings: FocusRunnerSettings;
  onChange: (settings: FocusRunnerSettings) => void;
}

function DurationRow({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: readonly number[];
  value: number;
  onSelect: (minutes: number) => void;
}) {
  return (
    <View className="mt-4">
      <AppText className="text-sm font-medium">{label}</AppText>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {options.map((m) => (
          <Pressable
            key={m}
            onPress={() => onSelect(m)}
            className={cn(
              'rounded-lg border px-3 py-2',
              value === m ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-white'
            )}
          >
            <AppText className="text-sm">{m} min</AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function TimerSetup({ settings, onChange }: TimerSetupProps) {
  return (
    <View className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
      <AppText className="text-sm font-semibold">Timer lengths</AppText>
      <AppText variant="muted" className="mt-1">
        Two focus blocks with a break between.
      </AppText>

      <DurationRow
        label="Focus block (minutes)"
        options={FOCUS_DURATION_OPTIONS}
        value={settings.focusDurationMinutes}
        onSelect={(focusDurationMinutes) => onChange({ ...settings, focusDurationMinutes })}
      />

      <DurationRow
        label="Break (minutes)"
        options={BREAK_DURATION_OPTIONS}
        value={settings.breakDurationMinutes}
        onSelect={(breakDurationMinutes) => onChange({ ...settings, breakDurationMinutes })}
      />
    </View>
  );
}
