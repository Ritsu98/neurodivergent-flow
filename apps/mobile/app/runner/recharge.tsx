import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, AppText, Stack } from '@/components/ui';

export default function RechargeRunnerScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <Stack gap="lg">
          <View>
            <AppText variant="title">Recharge Runner</AppText>
            <AppText variant="muted" className="mt-1">
              Intentional recovery — coming in M3.
            </AppText>
          </View>
          <Card>
            <AppText variant="caption">Placeholder route.</AppText>
          </Card>
          <Button label="Done" onPress={() => router.back()} />
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}
