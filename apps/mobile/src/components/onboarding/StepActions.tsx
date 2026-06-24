import { View } from 'react-native';
import { Button } from '@/components/ui/Button';

interface StepActionsProps {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}

export function StepActions({
  onBack,
  onNext,
  nextLabel = 'Next',
  nextDisabled = false,
  loading = false,
}: StepActionsProps) {
  return (
    <View className="mt-8 flex-row justify-between gap-3">
      {onBack ? (
        <Button label="Back" variant="secondary" onPress={onBack} className="flex-1" />
      ) : (
        <View className="flex-1" />
      )}
      <Button
        label={loading ? 'Saving…' : nextLabel}
        onPress={onNext}
        disabled={nextDisabled || loading}
        className="flex-1"
      />
    </View>
  );
}
