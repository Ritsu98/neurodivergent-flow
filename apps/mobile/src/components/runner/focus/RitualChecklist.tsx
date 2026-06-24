import { useState, type ReactNode } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

interface RitualChecklistProps {
  items: string[];
  onItemsChange: (items: string[]) => void;
  onBegin: () => void;
  onSkip: () => void;
  footer?: ReactNode;
}

export function RitualChecklist({
  items,
  onItemsChange,
  onBegin,
  onSkip,
  footer,
}: RitualChecklistProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [newItem, setNewItem] = useState('');

  const allChecked = items.length > 0 && items.every((_, i) => checked[i]);

  const toggleItem = (index: number) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
    setChecked({});
  };

  const addItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    onItemsChange([...items, trimmed]);
    setNewItem('');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-4">
        <AppText variant="title">Start ritual</AppText>
        <AppText variant="caption" className="mt-2">
          A quick setup before you focus. Optional, but helpful.
        </AppText>

        <View className="mt-6 gap-3">
          {items.map((item, index) => (
            <View
              key={`${item}-${index}`}
              className="flex-row items-center gap-3 rounded-lg border border-gray-200 bg-white p-4"
            >
              {!isEditing ? (
                <Pressable
                  onPress={() => toggleItem(index)}
                  className={cn(
                    'h-5 w-5 items-center justify-center rounded border-2',
                    checked[index] ? 'border-primary-500 bg-primary-500' : 'border-gray-400'
                  )}
                >
                  {checked[index] ? (
                    <AppText className="text-xs font-bold text-white">✓</AppText>
                  ) : null}
                </Pressable>
              ) : null}
              <AppText className="flex-1">{item}</AppText>
              {isEditing && items.length > 1 ? (
                <Pressable onPress={() => removeItem(index)}>
                  <AppText variant="caption" className="text-energy-red">
                    Remove
                  </AppText>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>

        {isEditing ? (
          <View className="mt-4 flex-row gap-2">
            <TextInput
              value={newItem}
              onChangeText={setNewItem}
              placeholder="Add ritual item"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              onSubmitEditing={addItem}
            />
            <Button label="Add" onPress={addItem} />
          </View>
        ) : null}

        <Pressable onPress={() => setIsEditing(!isEditing)} className="mt-4">
          <AppText className="text-sm font-medium text-primary-600">
            {isEditing ? 'Done editing' : 'Customize checklist'}
          </AppText>
        </Pressable>

        {footer}
      </View>

      <View className="gap-3 p-4">
        {allChecked ? <Button label="Begin Focus" onPress={onBegin} /> : null}
        <Button label="Skip ritual" variant="secondary" onPress={onSkip} />
      </View>
    </SafeAreaView>
  );
}
