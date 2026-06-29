'use client';

import { useState } from 'react';
import { AppNav } from '@/components/layout/AppNav';
import { useUserPrefsContext } from '@/components/providers/UserPrefsProvider';
import { NOTIFICATION_PREF_KEYS } from '@neurodivergent-flow/core';
import { upsertUserPrefs } from '@neurodivergent-flow/api';
import { requestNotificationPermission } from '@/lib/webNotifications';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { userId, signOut } = useAuth();
  const { prefs, refreshPrefs } = useUserPrefsContext();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (!prefs) {
    return (
      <div className="min-h-screen bg-surface">
        <AppNav showSundayBanner={false} />
        <p className="p-8 text-text-secondary">Loading settings...</p>
      </div>
    );
  }

  const notif = prefs.notificationPreferences ?? {};

  const save = async (updates: Record<string, boolean>) => {
    if (!userId) return;
    setIsSaving(true);
    setMessage('');
    try {
      await upsertUserPrefs(userId, {
        notificationPreferences: { ...notif, ...updates },
      });
      await refreshPrefs();
      setMessage('Saved.');
    } catch {
      setMessage('Could not save. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const saveAccessibility = async (field: 'highContrastEnabled' | 'reducedMotionEnabled', value: boolean) => {
    if (!userId) return;
    setIsSaving(true);
    try {
      await upsertUserPrefs(userId, { [field]: value });
      await refreshPrefs();
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      await save({ [NOTIFICATION_PREF_KEYS.enabled]: true });
    } else {
      setMessage('Notification permission denied in browser.');
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <AppNav showSundayBanner={false} />
      <main className="mx-auto max-w-2xl space-y-8 p-4" id="main-content">
        <h1 className="text-2xl font-bold">Settings</h1>

        <section className="rounded-lg bg-white p-6 shadow-sm" aria-labelledby="a11y-heading">
          <h2 id="a11y-heading" className="text-lg font-semibold">
            Accessibility
          </h2>
          <div className="mt-4 space-y-4">
            <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4">
              <span className="text-sm">High contrast</span>
              <input
                type="checkbox"
                checked={prefs.highContrastEnabled}
                onChange={(e) => saveAccessibility('highContrastEnabled', e.target.checked)}
                className="h-5 w-5"
              />
            </label>
            <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4">
              <span className="text-sm">Reduced motion</span>
              <input
                type="checkbox"
                checked={prefs.reducedMotionEnabled}
                onChange={(e) => saveAccessibility('reducedMotionEnabled', e.target.checked)}
                className="h-5 w-5"
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm" aria-labelledby="notif-heading">
          <h2 id="notif-heading" className="text-lg font-semibold">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Max 2 per day. Red days keep only essentials unless you override.
          </p>
          <div className="mt-4 space-y-4">
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="min-h-12 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white"
            >
              Enable browser notifications
            </button>
            <ToggleRow
              label="Notifications on"
              checked={notif[NOTIFICATION_PREF_KEYS.enabled] ?? true}
              onChange={(v) => save({ [NOTIFICATION_PREF_KEYS.enabled]: v })}
              disabled={isSaving}
            />
            <ToggleRow
              label="Downshift reminder (bedtime − 30 min)"
              checked={notif[NOTIFICATION_PREF_KEYS.downshift] ?? true}
              onChange={(v) => save({ [NOTIFICATION_PREF_KEYS.downshift]: v })}
              disabled={isSaving}
            />
            <ToggleRow
              label="Primary Block reminder (work window end)"
              checked={notif[NOTIFICATION_PREF_KEYS.primaryBlock] ?? true}
              onChange={(v) => save({ [NOTIFICATION_PREF_KEYS.primaryBlock]: v })}
              disabled={isSaving}
            />
            <ToggleRow
              label="Show all notifications on Red days"
              checked={notif[NOTIFICATION_PREF_KEYS.redDayOverride] ?? false}
              onChange={(v) => save({ [NOTIFICATION_PREF_KEYS.redDayOverride]: v })}
              disabled={isSaving}
            />
          </div>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm" aria-labelledby="privacy-heading">
          <h2 id="privacy-heading" className="text-lg font-semibold">
            Privacy
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Analytics is opt-in. We never log task text or personal content.
          </p>
          <div className="mt-4">
            <ToggleRow
              label="Share anonymous usage analytics"
              checked={notif[NOTIFICATION_PREF_KEYS.analytics] ?? false}
              onChange={(v) => save({ [NOTIFICATION_PREF_KEYS.analytics]: v })}
              disabled={isSaving}
            />
          </div>
        </section>

        {message && <p className="text-sm text-text-secondary" role="status">{message}</p>}

        <section className="rounded-lg bg-white p-6 shadow-sm" aria-labelledby="account-heading">
          <h2 id="account-heading" className="text-lg font-semibold">
            Account
          </h2>
          <button
            type="button"
            onClick={() => void signOut().then(() => { window.location.href = '/login'; })}
            className="mt-4 min-h-12 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
          >
            Sign out
          </button>
        </section>
      </main>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5"
      />
    </label>
  );
}
