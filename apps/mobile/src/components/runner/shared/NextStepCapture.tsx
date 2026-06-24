import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RadioOption } from '@/components/onboarding/RadioOption';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';
import { Stack } from '@/components/ui/Stack';

interface NextStepCaptureProps {
  title?: string;
  subtitle?: string;
  taskTitle?: string;
  onDone: (nextStep: string, saveAs: 'task' | 'inbox' | 'skip') => Promise<void>;
  onBack?: () => void;
}

export function NextStepCapture({
  title = "What's your next tiny step?",
  subtitle = 'Optional — capture it for later or skip.',
  taskTitle,
  onDone,
  onBack,
}: NextStepCaptureProps) {
  const [nextStep, setNextStep] = useState('');
  const [saveAs, setSaveAs] = useState<'task' | 'inbox' | 'skip'>('inbox');
  const [isSaving, setIsSaving] = useState(false);

  const handleDone = async () => {
    setIsSaving(true);
    try {
      const trimmed = nextStep.trim();
      await onDone(trimmed, trimmed ? saveAs : 'skip');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-4">
        <AppText variant="title">{title}</AppText>
        <AppText variant="caption" className="mt-2">
          {subtitle}
        </AppText>
        {taskTitle ? (
          <AppText variant="caption" className="mt-4">
            For: <AppText className="font-medium">{taskTitle}</AppText>
          </AppText>
        ) : null}

        <TextInput
          value={nextStep}
          onChangeText={setNextStep}
          placeholder="e.g. put dishes away, reply to one email"
          multiline
          numberOfLines={3}
          className="mt-6 min-h-[80px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900"
        />

        {nextStep.trim() ? (
          <Stack gap="sm" className="mt-4">
            <AppText className="text-sm font-medium">Save as</AppText>
            <RadioOption
              label="Later inbox"
              selected={saveAs === 'inbox'}
              onPress={() => setSaveAs('inbox')}
            />
            <RadioOption
              label="Update today's task next step"
              selected={saveAs === 'task'}
              onPress={() => setSaveAs('task')}
            />
          </Stack>
        ) : null}
      </View>

      <View className="gap-3 p-4">
        <Button label={isSaving ? 'Saving…' : 'Done'} onPress={() => void handleDone()} disabled={isSaving} />
        {onBack ? <Button label="Back" variant="ghost" onPress={onBack} /> : null}
      </View>
    </SafeAreaView>
  );
}
