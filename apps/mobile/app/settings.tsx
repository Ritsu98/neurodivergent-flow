import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NOTIFICATION_PREF_KEYS } from '@neurodivergent-flow/core';
import { upsertUserPrefs } from '@neurodivergent-flow/api';
import { SettingsToggleRow } from '@/components/settings/SettingsToggleRow';
import { Button, Card, AppText, Stack } from '@/components/ui';
import { USER_ID } from '@/constants/user';
import { requestNotificationPermission } from '@/lib/notifications';
import { useUserPrefsContext } from '@/providers/UserPrefsProvider';

export default function SettingsScreen() {
  const { prefs, refreshPrefs, isLoading } = useUserPrefsContext();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (isLoading || !prefs) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0ea5e9" />
        <AppText variant="caption" className="mt-2">
          Loading settings…
        </AppText>
      </SafeAreaView>
    );
  }

  const notif = prefs.notificationPreferences ?? {};

  const saveNotif = async (updates: Record<string, boolean>) => {
    setIsSaving(true);
    setMessage('');
    try {
      await upsertUserPrefs(USER_ID, {
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

  const saveAccessibility = async (
    field: 'highContrastEnabled' | 'reducedMotionEnabled',
    value: boolean
  ) => {
    setIsSaving(true);
    try {
      await upsertUserPrefs(USER_ID, { [field]: value });
      await refreshPrefs();
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      await saveNotif({ [NOTIFICATION_PREF_KEYS.enabled]: true });
    } else {
      setMessage('Notification permission denied.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <Stack gap="lg">
          <View>
            <AppText variant="title">Settings</AppText>
            <AppText variant="muted" className="mt-1">
              Accessibility, notifications, and privacy.
            </AppText>
          </View>

          <Card>
            <AppText variant="subtitle">Accessibility</AppText>
            <SettingsToggleRow
              label="High contrast"
              checked={prefs.highContrastEnabled}
              onChange={(v) => void saveAccessibility('highContrastEnabled', v)}
              disabled={isSaving}
            />
            <SettingsToggleRow
              label="Reduced motion"
              checked={prefs.reducedMotionEnabled}
              onChange={(v) => void saveAccessibility('reducedMotionEnabled', v)}
              disabled={isSaving}
            />
          </Card>

          <Card>
            <AppText variant="subtitle">Notifications</AppText>
            <AppText variant="caption" className="mb-2">
              Max 2 per day. Red days keep only essentials unless you override.
            </AppText>
            <Button
              label="Enable push notifications"
              onPress={() => void handleEnableNotifications()}
              disabled={isSaving}
              className="mb-4"
            />
            <SettingsToggleRow
              label="Notifications on"
              checked={notif[NOTIFICATION_PREF_KEYS.enabled] ?? true}
              onChange={(v) => void saveNotif({ [NOTIFICATION_PREF_KEYS.enabled]: v })}
              disabled={isSaving}
            />
            <SettingsToggleRow
              label="Downshift reminder (bedtime − 30 min)"
              checked={notif[NOTIFICATION_PREF_KEYS.downshift] ?? true}
              onChange={(v) => void saveNotif({ [NOTIFICATION_PREF_KEYS.downshift]: v })}
              disabled={isSaving}
            />
            <SettingsToggleRow
              label="Primary Block reminder (work window end)"
              checked={notif[NOTIFICATION_PREF_KEYS.primaryBlock] ?? true}
              onChange={(v) => void saveNotif({ [NOTIFICATION_PREF_KEYS.primaryBlock]: v })}
              disabled={isSaving}
            />
            <SettingsToggleRow
              label="Show all notifications on Red days"
              checked={notif[NOTIFICATION_PREF_KEYS.redDayOverride] ?? false}
              onChange={(v) => void saveNotif({ [NOTIFICATION_PREF_KEYS.redDayOverride]: v })}
              disabled={isSaving}
            />
          </Card>

          <Card>
            <AppText variant="subtitle">Privacy</AppText>
            <AppText variant="caption" className="mb-2">
              Analytics is opt-in. We never log task text or personal content.
            </AppText>
            <SettingsToggleRow
              label="Share anonymous usage analytics"
              checked={notif[NOTIFICATION_PREF_KEYS.analytics] ?? false}
              onChange={(v) => void saveNotif({ [NOTIFICATION_PREF_KEYS.analytics]: v })}
              disabled={isSaving}
            />
          </Card>

          {message ? (
            <AppText variant="caption" accessibilityLiveRegion="polite">
              {message}
            </AppText>
          ) : null}

          <Button label="Back" variant="secondary" onPress={() => router.back()} />
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}
