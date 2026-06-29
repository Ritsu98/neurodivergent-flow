'use client';

import type { ReactNode } from 'react';

export const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <main className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm" id="main-content">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
        <div className="mt-6">{children}</div>
        {footer ? <p className="mt-6 text-center text-sm text-text-secondary">{footer}</p> : null}
      </main>
    </div>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
