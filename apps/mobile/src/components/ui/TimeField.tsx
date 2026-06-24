import { TextInput, View } from 'react-native';
import { AppText } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

interface TimeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TimeField({ label, value, onChange, className }: TimeFieldProps) {
  return (
    <View className={cn('flex-1', className)}>
      <AppText variant="caption" className="mb-1">
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="09:00"
        placeholderTextColor="#9ca3af"
        keyboardType="numbers-and-punctuation"
        maxLength={5}
        className="rounded-md border border-gray-300 bg-white px-3 py-3 text-base text-gray-900"
        accessibilityLabel={label}
      />
    </View>
  );
}
