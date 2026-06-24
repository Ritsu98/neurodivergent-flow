import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, AppText, Stack } from '@/components/ui';

export default function SundaySetupScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <Stack gap="lg">
          <View>
            <AppText variant="title">Sunday Minimum</AppText>
            <AppText variant="muted" className="mt-1">
              A 10-minute weekly setup. Coming in M4.
            </AppText>
          </View>

          <Card>
            <AppText variant="caption">
              Port from web Sunday Setup: intensity, themes, inbox triage.
            </AppText>
          </Card>

          <Button label="Back" variant="secondary" onPress={() => router.back()} />
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}
