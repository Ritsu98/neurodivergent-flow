import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignInSchema, type SignInInput } from '@neurodivergent-flow/core';
import { getUserPrefs } from '@neurodivergent-flow/api';
import { AuthField, AuthScreen, AuthTextInput } from '@/components/auth/AuthScreen';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';
import { useAuthStore } from '@/stores/authStore';

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [error, setError] = useState('');
  const { control, handleSubmit, formState: { errors } } = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
  });

  const onSubmit = async (data: SignInInput) => {
    setError('');
    try {
      await signIn(data.email, data.password);
      const userId = useAuthStore.getState().user?.id;
      if (!userId) {
        router.replace('/(tabs)/today');
        return;
      }
      const prefs = await getUserPrefs(userId);
      router.replace(prefs ? '/(tabs)/today' : '/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

  return (
    <AuthScreen
      title="Sign in"
      subtitle="Welcome back. Pick up where you left off."
      footer={
        <View className="items-center gap-2">
          <Link href="/(auth)/signup" asChild>
            <Pressable accessibilityRole="link">
              <AppText className="text-primary-600">Create an account</AppText>
            </Pressable>
          </Link>
          <Link href="/(auth)/reset-password" asChild>
            <Pressable accessibilityRole="link">
              <AppText className="text-primary-600">Forgot password?</AppText>
            </Pressable>
          </Link>
        </View>
      }
    >
      <AuthField label="Email" error={errors.email?.message}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthTextInput
              keyboardType="email-address"
              autoComplete="email"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </AuthField>
      <AuthField label="Password" error={errors.password?.message}>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthTextInput
              secureTextEntry
              autoComplete="password"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </AuthField>
      {error ? (
        <AppText variant="caption" className="mb-4 text-red-600" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
      <Button label={isLoading ? 'Signing in…' : 'Sign in'} onPress={() => void handleSubmit(onSubmit)()} disabled={isLoading} />
    </AuthScreen>
  );
}
