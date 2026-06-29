'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignInSchema, type SignInInput } from '@neurodivergent-flow/core';
import { getUserPrefs } from '@neurodivergent-flow/api';
import { AuthShell, Field, inputClass } from '@/components/auth/AuthShell';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({ resolver: zodResolver(SignInSchema) });

  const onSubmit = async (data: SignInInput) => {
    setError('');
    try {
      await signIn(data.email, data.password);
      const userId = useAuthStore.getState().user?.id;
      if (!userId) {
        router.push('/today');
        return;
      }
      const prefs = await getUserPrefs(userId);
      router.push(prefs ? '/today' : '/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Pick up where you left off."
      footer={
        <>
          <Link href="/signup" className="text-primary-600 hover:underline">
            Create an account
          </Link>
          {' · '}
          <Link href="/reset-password" className="text-primary-600 hover:underline">
            Forgot password?
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            className={inputClass}
            {...register('email')}
          />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <input
            type="password"
            autoComplete="current-password"
            className={inputClass}
            {...register('password')}
          />
        </Field>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isLoading}
          className="min-h-12 w-full rounded-lg bg-primary-500 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}
