import { useState } from 'react';
import { View } from 'react-native';
import type { OnboardingData } from '@/types/onboarding';
import { RadioOption } from '@/components/onboarding/RadioOption';
import { StepActions } from '@/components/onboarding/StepActions';
import { AppText } from '@/components/ui/Text';
import { Stack } from '@/components/ui/Stack';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface IntensityStepProps {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const intensityDescriptions = {
  light: {
    title: 'Light',
    description: '1 Focus, 3 Recharge, 2 Flex, 1 Admin',
    days: 'More recovery time, less intensity',
  },
  normal: {
    title: 'Normal',
    description: '2 Focus, 2 Recharge, 2 Flex, 1 Admin',
    days: 'Balanced rhythm (recommended)',
  },
  heavy: {
    title: 'Heavy',
    description: '3 Focus, 1 Recharge, 2 Flex, 1 Admin',
    days: 'Higher intensity, watch for burnout',
  },
} as const;

export function IntensityStep({ data, onUpdate, onNext, onBack }: IntensityStepProps) {
  const weekIntensity = data.weekIntensity || 'normal';
  const [showWarning, setShowWarning] = useState(false);

  const handleIntensityChange = (intensity: 'light' | 'normal' | 'heavy') => {
    if (intensity === 'heavy') {
      setShowWarning(true);
    } else {
      setShowWarning(false);
      onUpdate({ weekIntensity: intensity });
    }
  };

  return (
    <View>
      <AppText variant="title">Choose your default week intensity</AppText>
      <AppText variant="caption" className="mb-6 mt-2">
        You can change this each week during Sunday Setup.
      </AppText>

      {showWarning ? (
        <Card className="mb-6 border-2 border-energy-red bg-red-50">
          <AppText className="font-medium text-energy-red">Higher risk of burnout</AppText>
          <AppText variant="caption" className="mt-1">
            Heavy intensity means more focus days. Start with Normal?
          </AppText>
          <View className="mt-4 flex-row gap-2">
            <Button
              label="Use Normal"
              className="flex-1"
              onPress={() => {
                setShowWarning(false);
                onUpdate({ weekIntensity: 'normal' });
              }}
            />
            <Button
              label="Continue Heavy"
              variant="secondary"
              className="flex-1"
              onPress={() => {
                setShowWarning(false);
                onUpdate({ weekIntensity: 'heavy' });
              }}
            />
          </View>
        </Card>
      ) : null}

      <Stack gap="sm">
        {(Object.keys(intensityDescriptions) as Array<keyof typeof intensityDescriptions>).map(
          (intensity) => {
            const desc = intensityDescriptions[intensity];
            return (
              <RadioOption
                key={intensity}
                label={desc.title}
                description={`${desc.description}\n${desc.days}`}
                selected={weekIntensity === intensity}
                onPress={() => handleIntensityChange(intensity)}
              />
            );
          }
        )}
      </Stack>

      <StepActions onBack={onBack} onNext={onNext} nextDisabled={!weekIntensity} />
    </View>
  );
}
