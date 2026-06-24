import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RadioOption } from '@/components/onboarding/RadioOption';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';
import { Stack } from '@/components/ui/Stack';

interface HardStopScreenProps {
  taskTitle?: string;
  onDone: (nextStep: string, saveAs: 'task' | 'inbox' | 'skip') => Promise<void>;
  onBack: () => void;
}

export function HardStopScreen({ taskTitle, onDone, onBack }: HardStopScreenProps) {
  const [nextStep, setNextStep] = useState('');
  const [saveAs, setSaveAs] = useState<'task' | 'inbox' | 'skip'>('task');
  const [isSaving, setIsSaving] = useState(false);

  const handleDone = async (step: string, mode: 'task' | 'inbox' | 'skip') => {
    setIsSaving(true);
    try {
      await onDone(step, mode);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-4">
        <AppText variant="title">Hard stop</AppText>
        <AppText variant="caption" className="mt-2">
          Nice work. What&apos;s your next tiny step?
        </AppText>
        {taskTitle ? (
          <AppText variant="caption" className="mt-4">
            For: <AppText className="font-medium">{taskTitle}</AppText>
          </AppText>
        ) : null}

        <TextInput
          value={nextStep}
          onChangeText={setNextStep}
          placeholder="Optional — e.g. open doc, write one line"
          multiline
          numberOfLines={3}
          className="mt-6 min-h-[80px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-base"
        />

        {nextStep.trim() ? (
          <Stack gap="sm" className="mt-4">
            <AppText className="text-sm font-medium">Save as</AppText>
            <RadioOption
              label="Update today's task next step"
              selected={saveAs === 'task'}
              onPress={() => setSaveAs('task')}
            />
            <RadioOption
              label="Save to Later inbox"
              selected={saveAs === 'inbox'}
              onPress={() => setSaveAs('inbox')}
            />
          </Stack>
        ) : null}
      </View>

      <View className="gap-3 p-4">
        <Button
          label={isSaving ? 'Saving…' : 'Done'}
          onPress={() => void handleDone(nextStep.trim(), nextStep.trim() ? saveAs : 'skip')}
          disabled={isSaving}
        />
        <Button
          label="Skip — return to Today"
          variant="ghost"
          onPress={() => void handleDone('', 'skip')}
          disabled={isSaving}
        />
        <Button label="Back to timer" variant="ghost" onPress={onBack} />
      </View>
    </SafeAreaView>
  );
}
