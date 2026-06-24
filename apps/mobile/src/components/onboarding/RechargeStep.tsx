import { useState } from 'react';
import { Pressable, View } from 'react-native';
import type { OnboardingData } from '@/types/onboarding';
import { StepActions } from '@/components/onboarding/StepActions';
import { AppText } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

interface RechargeStepProps {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const rechargeOptions = [
  { id: 'movie', label: 'Movie' },
  { id: 'reading', label: 'Reading' },
  { id: 'walk', label: 'Walk' },
  { id: 'bath', label: 'Bath' },
  { id: 'hobby', label: 'Hobby' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'music', label: 'Music' },
  { id: 'nature', label: 'Nature' },
  { id: 'other', label: 'Other' },
];

export function RechargeStep({ data, onUpdate, onNext, onBack }: RechargeStepProps) {
  const [selected, setSelected] = useState<string[]>(data.rechargeDefaults || []);

  const handleToggle = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const handleNext = () => {
    onUpdate({ rechargeDefaults: selected });
    onNext();
  };

  return (
    <View>
      <AppText variant="title">Choose your recharge activities</AppText>
      <AppText variant="caption" className="mb-6 mt-2">
        Pick up to 3 defaults for your Recharge Runner.
      </AppText>

      <View className="flex-row flex-wrap gap-3">
        {rechargeOptions.map((option) => {
          const isSelected = selected.includes(option.id);
          return (
            <Pressable
              key={option.id}
              onPress={() => handleToggle(option.id)}
              className={cn(
                'min-w-[45%] flex-1 rounded-lg border-2 p-4',
                isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
              )}
            >
              <AppText className="font-medium">{option.label}</AppText>
            </Pressable>
          );
        })}
      </View>

      {selected.length > 0 ? (
        <AppText variant="caption" className="mt-4">
          Selected: {selected.length} / 3
        </AppText>
      ) : null}

      <StepActions onBack={onBack} onNext={handleNext} />
    </View>
  );
}
