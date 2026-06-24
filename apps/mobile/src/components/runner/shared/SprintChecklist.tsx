import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

interface SprintChecklistProps {
  items: string[];
  checked: Record<number, boolean>;
  onToggle: (index: number) => void;
}

export function SprintChecklist({ items, checked, onToggle }: SprintChecklistProps) {
  return (
    <View className="rounded-lg border border-gray-200 bg-white p-4">
      {items.map((item, index) => (
        <Pressable
          key={`${item}-${index}`}
          onPress={() => onToggle(index)}
          className="mb-2 flex-row items-center gap-3"
        >
          <View
            className={cn(
              'h-5 w-5 items-center justify-center rounded border-2',
              checked[index] ? 'border-primary-500 bg-primary-500' : 'border-gray-400'
            )}
          >
            {checked[index] ? <AppText className="text-xs font-bold text-white">✓</AppText> : null}
          </View>
          <AppText className={cn('flex-1 text-sm', checked[index] && 'text-gray-500 line-through')}>
            {item}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}
