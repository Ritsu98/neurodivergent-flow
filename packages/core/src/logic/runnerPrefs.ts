import type { UserPrefs } from '../types/user';
import {
  DEFAULT_FOCUS_RUNNER_SETTINGS,
  DEFAULT_RECHARGE_RUNNER_SETTINGS,
  type FocusRunnerSettings,
  type RechargeRunnerSettings,
  type StoredRunnerSettings,
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

function parseStoredRunnerSettings(raw: unknown): StoredRunnerSettings {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  if (isFocusRunnerSettings(raw)) {
    return { focus: raw as FocusRunnerSettings };
  }
  const result: StoredRunnerSettings = {};
  if (obj.focus && isFocusRunnerSettings(obj.focus)) result.focus = obj.focus;
  if (obj.recharge && typeof obj.recharge === 'object') {
    const r = obj.recharge as Record<string, unknown>;
    if (Array.isArray(r.ritualItems)) {
      result.recharge = { ritualItems: r.ritualItems as string[] };
    }
  }
  return result;
}

export function getStoredRunnerSettings(prefs: UserPrefs | null): StoredRunnerSettings {
  return parseStoredRunnerSettings(prefs?.runnerSettings);
}

export function getFocusRunnerSettings(prefs: UserPrefs | null): FocusRunnerSettings {
  const stored = getStoredRunnerSettings(prefs).focus;
  if (stored) {
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

export function getRechargeRunnerSettings(prefs: UserPrefs | null): RechargeRunnerSettings {
  const stored = getStoredRunnerSettings(prefs).recharge;
  if (stored?.ritualItems?.length) return stored;
  return { ...DEFAULT_RECHARGE_RUNNER_SETTINGS };
}

export function mergeRunnerSettings(
  prefs: UserPrefs | null,
  patch: Partial<StoredRunnerSettings>
): StoredRunnerSettings {
  return { ...getStoredRunnerSettings(prefs), ...patch };
}
