import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, AppText, Stack } from '@/components/ui';
import { useUserPrefsContext } from '@/providers/UserPrefsProvider';

export default function SettingsScreen() {
  const { prefs, isLoading } = useUserPrefsContext();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <Stack gap="lg">
          <View>
            <AppText variant="title">Settings</AppText>
            <AppText variant="muted" className="mt-1">
              Accessibility and preferences. Full settings arrive in M5.
            </AppText>
          </View>

          <Card>
            <AppText variant="subtitle">User prefs</AppText>
            <AppText variant="caption" className="mt-2">
              {isLoading
                ? 'Loading…'
                : prefs
                  ? `Intensity default: ${prefs.weekIntensityDefault ?? 'normal'}`
                  : 'No prefs loaded — check Supabase env and seed data.'}
            </AppText>
          </Card>

          <Button label="Back" variant="secondary" onPress={() => router.back()} />
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}
