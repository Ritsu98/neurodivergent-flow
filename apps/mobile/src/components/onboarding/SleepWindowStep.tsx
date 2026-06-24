import { View } from 'react-native';
import type { OnboardingData } from '@/types/onboarding';
import { StepActions } from '@/components/onboarding/StepActions';
import { AppText } from '@/components/ui/Text';
import { Stack } from '@/components/ui/Stack';
import { Checkbox } from '@/components/ui/Checkbox';
import { TimeField } from '@/components/ui/TimeField';

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
    onUpdate({ sleepWindowStart, sleepWindowEnd, downshiftReminderEnabled });
    onNext();
  };

  return (
    <View>
      <AppText variant="title">Sleep window</AppText>
      <AppText variant="caption" className="mb-6 mt-2">
        When do you typically sleep?
      </AppText>

      <Stack gap="md">
        <TimeField
          label="Bedtime"
          value={sleepWindowStart}
          onChange={(value) => onUpdate({ sleepWindowStart: value })}
        />
        <TimeField
          label="Wake time"
          value={sleepWindowEnd}
          onChange={(value) => onUpdate({ sleepWindowEnd: value })}
        />
        <Checkbox
          label="Enable downshift reminder (30 min before bedtime)"
          checked={downshiftReminderEnabled}
          onToggle={(checked) => onUpdate({ downshiftReminderEnabled: checked })}
        />
      </Stack>

      <StepActions onBack={onBack} onNext={handleNext} />
    </View>
  );
}
