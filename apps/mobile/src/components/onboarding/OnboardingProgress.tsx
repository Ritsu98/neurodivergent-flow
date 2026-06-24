import { View } from 'react-native';
import { AppText } from '@/components/ui/Text';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const percent = Math.round((currentStep / totalSteps) * 100);

  return (
    <View className="mb-6">
      <View className="mb-2 flex-row justify-between">
        <AppText variant="caption">
          Step {currentStep} of {totalSteps}
        </AppText>
        <AppText variant="caption">{percent}%</AppText>
      </View>
      <View className="h-2 w-full rounded-full bg-gray-200">
        <View className="h-2 rounded-full bg-primary-500" style={{ width: `${percent}%` }} />
      </View>
    </View>
  );
}
