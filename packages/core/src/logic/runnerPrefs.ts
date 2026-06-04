import type { UserPrefs } from '../types/user';
import {
  DEFAULT_FOCUS_RUNNER_SETTINGS,
  type FocusRunnerSettings,
} from '../types/runner';

export const RUNNER_SETTINGS_KEY = '_runnerSettings';

function isFocusRunnerSettings(value: unknown): value is FocusRunnerSettings {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  return (
    Array.isArray(s.focusRitualItems) &&
    typeof s.focusDurationMinutes === 'number' &&
    typeof s.breakDurationMinutes === 'number'
  );
}

export function getFocusRunnerSettings(prefs: UserPrefs | null): FocusRunnerSettings {
  const stored = prefs?.runnerSettings;
  if (stored && isFocusRunnerSettings(stored)) {
    return {
      focusRitualItems:
        stored.focusRitualItems.length > 0
          ? stored.focusRitualItems
          : DEFAULT_FOCUS_RUNNER_SETTINGS.focusRitualItems,
      focusDurationMinutes: stored.focusDurationMinutes,
      breakDurationMinutes: stored.breakDurationMinutes,
    };
  }
  return { ...DEFAULT_FOCUS_RUNNER_SETTINGS };
}
