import RNCSlider from '@react-native-community/slider';
import { View } from 'react-native';
import { AppText } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  label?: string;
  className?: string;
}

export function Slider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 5,
  step = 1,
  label,
  className,
}: SliderProps) {
  return (
    <View className={cn('w-full', className)}>
      {label ? (
        <AppText variant="caption" className="mb-2">
          {label}
        </AppText>
      ) : null}
      <RNCSlider
        value={value}
        onValueChange={onValueChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        minimumTrackTintColor="#0ea5e9"
        maximumTrackTintColor="#d1d5db"
        thumbTintColor="#0284c7"
        accessibilityLabel={label ?? 'Slider'}
      />
    </View>
  );
}
