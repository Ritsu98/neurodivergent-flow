'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignUpSchema, type SignUpInput } from '@neurodivergent-flow/core';
import { AuthShell, Field, inputClass } from '@/components/auth/AuthShell';
import { useAuthStore } from '@/stores/authStore';

export default function SignUpPage() {
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUp);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [error, setError] = useState('');
  const [confirmationSent, setConfirmationSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({ resolver: zodResolver(SignUpSchema) });

  const onSubmit = async (data: SignUpInput) => {
    setError('');
    try {
      const { needsEmailConfirmation } = await signUp(data.email, data.password);
      if (needsEmailConfirmation) {
        setConfirmationSent(true);
        return;
      }
      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    }
  };

  if (confirmationSent) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="We sent a confirmation link. Open it to activate your account, then sign in."
        footer={
          <Link href="/login" className="text-primary-600 hover:underline">
            Back to sign in
          </Link>
        }
      >
        <p className="text-sm text-text-secondary">
          If you don&apos;t see the email, check spam or wait a minute and try again.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="Start with a sustainable weekly rhythm."
      footer={
        <Link href="/login" className="text-primary-600 hover:underline">
          Already have an account? Sign in
        </Link>
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
            autoComplete="new-password"
            className={inputClass}
            {...register('password')}
          />
        </Field>
        <Field label="Confirm password" error={errors.confirmPassword?.message}>
          <input
            type="password"
            autoComplete="new-password"
            className={inputClass}
            {...register('confirmPassword')}
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
          {isLoading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
