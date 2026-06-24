import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

interface RadioOptionProps {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}

export function RadioOption({ label, description, selected, onPress }: RadioOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        'flex-row items-start rounded-lg border-2 p-4',
        selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
      )}
    >
      <View
        className={cn(
          'mr-3 mt-1 h-5 w-5 rounded-full border-2',
          selected ? 'border-primary-500 bg-primary-500' : 'border-gray-400'
        )}
      />
      <View className="flex-1">
        <AppText className="font-medium">{label}</AppText>
        {description ? (
          <AppText variant="caption" className="mt-0.5">
            {description}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}
