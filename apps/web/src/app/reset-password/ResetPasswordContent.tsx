'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ResetPasswordSchema,
  UpdatePasswordSchema,
  type ResetPasswordInput,
  type UpdatePasswordInput,
} from '@neurodivergent-flow/core';
import { AuthShell, Field, inputClass } from '@/components/auth/AuthShell';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [mode, setMode] = useState<'request' | 'update'>('request');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setMode('update');
    });
  }, [searchParams]);

  const requestForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const updateForm = useForm<UpdatePasswordInput>({
    resolver: zodResolver(UpdatePasswordSchema),
  });

  const onRequest = async (data: ResetPasswordInput) => {
    setError('');
    setMessage('');
    try {
      await resetPassword(data.email);
      setMessage('If that email exists, we sent a reset link.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email');
    }
  };

  const onUpdate = async (data: UpdatePasswordInput) => {
    setError('');
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (updateError) throw new Error(updateError.message);
      router.push('/today');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password');
    }
  };

  if (mode === 'update') {
    return (
      <AuthShell title="Set new password" subtitle="Choose a new password for your account.">
        <form onSubmit={updateForm.handleSubmit(onUpdate)} className="space-y-4">
          <Field label="New password" error={updateForm.formState.errors.password?.message}>
            <input
              type="password"
              autoComplete="new-password"
              className={inputClass}
              {...updateForm.register('password')}
            />
          </Field>
          <Field
            label="Confirm password"
            error={updateForm.formState.errors.confirmPassword?.message}
          >
            <input
              type="password"
              autoComplete="new-password"
              className={inputClass}
              {...updateForm.register('confirmPassword')}
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
            Update password
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your email and we will send a reset link."
      footer={
        <Link href="/login" className="text-primary-600 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={requestForm.handleSubmit(onRequest)} className="space-y-4">
        <Field label="Email" error={requestForm.formState.errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            className={inputClass}
            {...requestForm.register('email')}
          />
        </Field>
        {message ? (
          <p className="text-sm text-green-700" role="status">
            {message}
          </p>
        ) : null}
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
          {isLoading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </AuthShell>
  );
}
