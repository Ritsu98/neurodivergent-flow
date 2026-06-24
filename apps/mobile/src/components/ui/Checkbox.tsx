import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  description?: string;
}

export function Checkbox({ label, checked, onToggle, description }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onToggle(!checked)}
      className="flex-row items-start"
    >
      <View
        className={cn(
          'mr-3 mt-0.5 h-6 w-6 items-center justify-center rounded border-2',
          checked ? 'border-primary-500 bg-primary-500' : 'border-gray-400 bg-white'
        )}
      >
        {checked ? <AppText className="text-xs font-bold text-white">✓</AppText> : null}
      </View>
      <View className="flex-1">
        <AppText className="font-medium">{label}</AppText>
        {description ? (
          <AppText variant="caption" className="mt-1">
            {description}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}
