import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/layout/AppHeader';
import { Card, AppText, Stack } from '@/components/ui';

export default function WeekScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <AppHeader active="week" />
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <Stack gap="lg">
          <View>
            <AppText variant="title">Week</AppText>
            <AppText variant="muted" className="mt-1">
              Week-at-a-glance, day themes, and inbox.
            </AppText>
          </View>

          <Card>
            <AppText variant="subtitle">Coming in M4</AppText>
            <AppText variant="caption" className="mt-2">
              Week glance, day detail, and task board will port from web here.
            </AppText>
          </Card>
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}
