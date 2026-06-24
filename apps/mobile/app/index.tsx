import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { isOnboardingComplete } from '@/lib/onboarding';

export default function Index() {
  const [ready, setReady] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    void isOnboardingComplete().then((value) => {
      setComplete(value);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return <Redirect href={complete ? '/(tabs)/today' : '/onboarding'} />;
}
