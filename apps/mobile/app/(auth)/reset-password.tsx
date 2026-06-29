import { useState } from 'react';
import { Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResetPasswordSchema, type ResetPasswordInput } from '@neurodivergent-flow/core';
import { AuthField, AuthScreen, AuthTextInput } from '@/components/auth/AuthScreen';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';
import { useAuthStore } from '@/stores/authStore';

export default function ResetPasswordScreen() {
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setError('');
    setMessage('');
    try {
      await resetPassword(data.email);
      setMessage('If that email exists, we sent a reset link.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email');
    }
  };

  return (
    <AuthScreen
      title="Reset password"
      subtitle="Enter your email and we will send a reset link."
      footer={
        <Link href="/(auth)/login" asChild>
          <Pressable accessibilityRole="link" className="items-center">
            <AppText className="text-primary-600">Back to sign in</AppText>
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
      {message ? (
        <AppText variant="caption" className="mb-4 text-green-700" accessibilityRole="text">
          {message}
        </AppText>
      ) : null}
      {error ? (
        <AppText variant="caption" className="mb-4 text-red-600" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
      <Button label={isLoading ? 'Sending…' : 'Send reset link'} onPress={() => void handleSubmit(onSubmit)()} disabled={isLoading} />
    </AuthScreen>
  );
}
