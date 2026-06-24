import { useState } from 'react';
import { Modal, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';

interface LaterCaptureModalProps {
  visible: boolean;
  onSave: (content: string) => Promise<void>;
  onClose: () => void;
}

export function LaterCaptureModal({ visible, onSave, onClose }: LaterCaptureModalProps) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    setIsSaving(true);
    try {
      await onSave(trimmed);
      setContent('');
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40 p-4">
        <View className="rounded-lg bg-white p-6">
          <AppText variant="subtitle">What came up?</AppText>
          <AppText variant="caption" className="mt-1">
            Capture it for later. Your timer keeps running.
          </AppText>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Quick note..."
            multiline
            numberOfLines={3}
            className="mt-4 min-h-[80px] rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <View className="mt-4 flex-row gap-3">
            <Button label="Cancel" variant="secondary" onPress={onClose} className="flex-1" />
            <Button
              label={isSaving ? 'Saving…' : 'Save to Later'}
              onPress={() => void handleSave()}
              disabled={!content.trim() || isSaving}
              className="flex-1"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
