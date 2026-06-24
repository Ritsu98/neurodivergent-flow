import { useState } from 'react';
import { View } from 'react-native';
import type { DayTheme } from '@neurodivergent-flow/core';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';
import { Checkbox } from '@/components/ui/Checkbox';

interface EveningBlockCardProps {
  primaryBlockType: DayTheme;
  scheduledTime?: string;
  onStart: () => void;
}

const themeLabels: Record<DayTheme, string> = {
  focus: 'Focus',
  recharge: 'Recharge',
  flex: 'Flex',
  admin: 'Admin',
};

const activationChecklist = [
  'Phone away or silent',
  'Water nearby',
  'Comfortable position',
  'Clear workspace',
];

export function EveningBlockCard({
  primaryBlockType,
  scheduledTime,
  onStart,
}: EveningBlockCardProps) {
  const [showChecklist, setShowChecklist] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(activationChecklist.map(() => false));

  return (
    <View className="rounded-lg border-2 border-primary-300 bg-primary-50 p-6">
      <AppText variant="subtitle">After work</AppText>
      <AppText variant="caption" className="mt-1">
        {themeLabels[primaryBlockType]} block{scheduledTime ? ` at ${scheduledTime}` : ''}
      </AppText>

      <Button
        label={showChecklist ? 'Hide checklist' : 'Show 2-min activation checklist'}
        variant="ghost"
        onPress={() => setShowChecklist(!showChecklist)}
        className="mt-4"
      />

      {showChecklist ? (
        <View className="mt-3 gap-2 rounded-lg bg-white p-4">
          {activationChecklist.map((item, index) => (
            <Checkbox
              key={item}
              label={item}
              checked={checked[index] ?? false}
              onToggle={(value) => {
                setChecked((prev) => {
                  const next = [...prev];
                  next[index] = value;
                  return next;
                });
              }}
            />
          ))}
        </View>
      ) : null}

      <Button label="Start Evening Block" onPress={onStart} className="mt-4" />
    </View>
  );
}
