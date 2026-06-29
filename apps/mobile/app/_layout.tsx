import 'react-native-gesture-handler';
import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureAuthStorage } from '@neurodivergent-flow/api';
import { QueryProvider } from '@/providers/QueryProvider';
import { LocalDbProvider } from '@/providers/LocalDbProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { UserPrefsProvider } from '@/providers/UserPrefsProvider';
import { AppEffects } from '@/components/providers/AppEffects';
import { supabaseAuthStorage } from '@/lib/supabaseStorage';

configureAuthStorage(supabaseAuthStorage);

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LocalDbProvider>
        <QueryProvider>
          <AuthProvider>
            <UserPrefsProvider>
              <AppEffects />
              <StatusBar style="auto" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
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
          </AuthProvider>
        </QueryProvider>
      </LocalDbProvider>
    </SafeAreaProvider>
  );
}
