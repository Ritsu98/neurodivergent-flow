import 'react-native-gesture-handler';
import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from '@/providers/QueryProvider';
import { UserPrefsProvider } from '@/providers/UserPrefsProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <UserPrefsProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding/index" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="sunday-setup" />
            <Stack.Screen name="runner/focus" />
            <Stack.Screen name="runner/recharge" />
            <Stack.Screen name="runner/flex" />
            <Stack.Screen name="runner/admin" />
          </Stack>
        </UserPrefsProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
