import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignUpSchema, type SignUpInput } from '@neurodivergent-flow/core';
import { AuthField, AuthScreen, AuthTextInput } from '@/components/auth/AuthScreen';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';
import { useAuthStore } from '@/stores/authStore';

export default function SignUpScreen() {
  const signUp = useAuthStore((s) => s.signUp);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [error, setError] = useState('');
  const [confirmationSent, setConfirmationSent] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
  });

  const onSubmit = async (data: SignUpInput) => {
    setError('');
    try {
      const { needsEmailConfirmation } = await signUp(data.email, data.password);
      if (needsEmailConfirmation) {
        setConfirmationSent(true);
        return;
      }
      router.replace('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    }
  };

  if (confirmationSent) {
    return (
      <AuthScreen
        title="Check your email"
        subtitle="We sent a confirmation link. Open it to activate your account, then sign in."
        footer={
          <Link href="/(auth)/login" asChild>
            <Pressable accessibilityRole="link" className="items-center">
              <AppText className="text-primary-600">Back to sign in</AppText>
            </Pressable>
          </Link>
        }
      >
        <AppText variant="caption">
          If you don&apos;t see the email, check spam or wait a minute and try again.
        </AppText>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Create account"
      subtitle="Start with a sustainable weekly rhythm."
      footer={
        <Link href="/(auth)/login" asChild>
          <Pressable accessibilityRole="link" className="items-center">
            <AppText className="text-primary-600">Already have an account? Sign in</AppText>
          </Pressable>
        </Link>
      }
    >
      <AuthField label="Email" error={errors.email?.message}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthTextInput keyboardType="email-address" autoComplete="email" onBlur={onBlur} onChangeText={onChange} value={value} />
          )}
        />
      </AuthField>
      <AuthField label="Password" error={errors.password?.message}>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthTextInput secureTextEntry autoComplete="new-password" onBlur={onBlur} onChangeText={onChange} value={value} />
          )}
        />
      </AuthField>
      <AuthField label="Confirm password" error={errors.confirmPassword?.message}>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthTextInput secureTextEntry autoComplete="new-password" onBlur={onBlur} onChangeText={onChange} value={value} />
          )}
        />
      </AuthField>
      {error ? (
        <AppText variant="caption" className="mb-4 text-red-600" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
      <Button label={isLoading ? 'Creating account…' : 'Create account'} onPress={() => void handleSubmit(onSubmit)()} disabled={isLoading} />
    </AuthScreen>
  );
}
