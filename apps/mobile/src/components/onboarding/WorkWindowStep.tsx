import { useState } from 'react';
import { View } from 'react-native';
import type { OnboardingData } from '@/types/onboarding';
import { RadioOption } from '@/components/onboarding/RadioOption';
import { StepActions } from '@/components/onboarding/StepActions';
import { AppText } from '@/components/ui/Text';
import { Stack } from '@/components/ui/Stack';
import { TimeField } from '@/components/ui/TimeField';

interface WorkWindowStepProps {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function WorkWindowStep({ data, onUpdate, onNext }: WorkWindowStepProps) {
  const [workMode, setWorkMode] = useState<'none' | 'weekdays' | 'irregular' | ''>(
    data.workMode || ''
  );
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('17:00');
  const [afterWorkEnergy, setAfterWorkEnergy] = useState<'low' | 'mixed' | 'decent' | ''>(
    data.afterWorkEnergy || ''
  );
  const [preferredTime, setPreferredTime] = useState<'morning' | 'afternoon' | 'evening' | ''>(
    data.preferredPrimaryBlockTime || ''
  );

  const handleWorkModeChange = (mode: 'none' | 'weekdays' | 'irregular') => {
    setWorkMode(mode);
    onUpdate({ workMode: mode });
  };

  const handleNext = () => {
    if (workMode === 'weekdays') {
      onUpdate({
        workMode,
        workWindows: [{ days: [1, 2, 3, 4, 5], start: workStart, end: workEnd }],
        afterWorkEnergy: afterWorkEnergy as 'low' | 'mixed' | 'decent',
      });
    } else if (workMode === 'none') {
      onUpdate({
        workMode,
        preferredPrimaryBlockTime: preferredTime as 'morning' | 'afternoon' | 'evening',
      });
    } else if (workMode === 'irregular') {
      onUpdate({ workMode });
    }
    onNext();
  };

  const canContinue =
    !!workMode &&
    (workMode === 'irregular' ||
      (workMode === 'weekdays' && !!afterWorkEnergy) ||
      (workMode === 'none' && !!preferredTime));

  return (
    <View>
      <AppText variant="title">Do you have structured work or study time?</AppText>
      <AppText variant="caption" className="mb-6 mt-2">
        This helps us schedule your Primary Blocks.
      </AppText>

      <Stack gap="sm">
        <RadioOption
          label="Yes, mostly weekdays"
          description="Mon–Fri schedule"
          selected={workMode === 'weekdays'}
          onPress={() => handleWorkModeChange('weekdays')}
        />
        <RadioOption
          label="Yes, rotating or irregular"
          description="Shifts or changing schedule"
          selected={workMode === 'irregular'}
          onPress={() => handleWorkModeChange('irregular')}
        />
        <RadioOption
          label="No"
          description="No structured work time"
          selected={workMode === 'none'}
          onPress={() => handleWorkModeChange('none')}
        />
      </Stack>

      {workMode === 'weekdays' ? (
        <View className="mt-6 rounded-lg bg-gray-50 p-4">
          <AppText className="mb-2 font-medium">Work hours (Mon–Fri)</AppText>
          <View className="mb-4 flex-row gap-4">
            <TimeField label="Start" value={workStart} onChange={setWorkStart} />
            <TimeField label="End" value={workEnd} onChange={setWorkEnd} />
          </View>
          <AppText className="mb-2 font-medium">After work, energy tends to be:</AppText>
          <Stack gap="sm">
            {(['low', 'mixed', 'decent'] as const).map((energy) => (
              <RadioOption
                key={energy}
                label={energy.charAt(0).toUpperCase() + energy.slice(1)}
                selected={afterWorkEnergy === energy}
                onPress={() => setAfterWorkEnergy(energy)}
              />
            ))}
          </Stack>
        </View>
      ) : null}

      {workMode === 'none' ? (
        <View className="mt-6 rounded-lg bg-gray-50 p-4">
          <AppText className="mb-2 font-medium">When is your preferred energy peak?</AppText>
          <Stack gap="sm">
            {(['morning', 'afternoon', 'evening'] as const).map((time) => (
              <RadioOption
                key={time}
                label={time.charAt(0).toUpperCase() + time.slice(1)}
                selected={preferredTime === time}
                onPress={() => setPreferredTime(time)}
              />
            ))}
          </Stack>
        </View>
      ) : null}

      <StepActions onNext={handleNext} nextDisabled={!canContinue} />
    </View>
  );
}
