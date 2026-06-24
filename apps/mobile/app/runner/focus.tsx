import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, AppText, Stack } from '@/components/ui';

function RunnerPlaceholder({ name }: { name: string }) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <Stack gap="lg">
          <View>
            <AppText variant="title">{name} Runner</AppText>
            <AppText variant="muted" className="mt-1">
              Timer and ritual flow — coming in M3.
            </AppText>
          </View>

          <Card>
            <AppText variant="caption">Placeholder route wired for navigation testing.</AppText>
          </Card>

          <Button label="Done" variant="primary" onPress={() => router.back()} />
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function FocusRunnerScreen() {
  return <RunnerPlaceholder name="Focus" />;
}
