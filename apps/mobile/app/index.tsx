import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { getUserPrefs } from '@neurodivergent-flow/api';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { isAuthenticated, userId, isInitialized } = useAuth();
  const [ready, setReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated || !userId) {
      setReady(true);
      return;
    }

    void getUserPrefs(userId)
      .then((prefs) => {
        setNeedsOnboarding(!prefs);
        setReady(true);
      })
      .catch(() => {
        setNeedsOnboarding(true);
        setReady(true);
      });
  }, [isInitialized, isAuthenticated, userId]);

  if (!isInitialized || (isAuthenticated && !ready)) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href={needsOnboarding ? '/onboarding' : '/(tabs)/today'} />;
}
