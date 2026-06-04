export const DEFAULT_FOCUS_RITUAL_ITEMS = [
  'Phone away',
  'Water nearby',
  'Comfortable position',
  'Clear workspace',
] as const;

export const FOCUS_DURATION_OPTIONS = [25, 30, 35, 40, 45] as const;
export const BREAK_DURATION_OPTIONS = [5, 7, 10] as const;

export const DEFAULT_FOCUS_DURATION_MINUTES = 30;
export const DEFAULT_BREAK_DURATION_MINUTES = 5;

export type FocusRunnerPhase = 'ritual' | 'focus1' | 'break' | 'focus2' | 'complete';

export interface FocusRunnerSettings {
  focusRitualItems: string[];
  focusDurationMinutes: number;
  breakDurationMinutes: number;
}

export const DEFAULT_FOCUS_RUNNER_SETTINGS: FocusRunnerSettings = {
  focusRitualItems: [...DEFAULT_FOCUS_RITUAL_ITEMS],
  focusDurationMinutes: DEFAULT_FOCUS_DURATION_MINUTES,
  breakDurationMinutes: DEFAULT_BREAK_DURATION_MINUTES,
};

export const FOCUS_TIMER_STORAGE_KEY = 'nf_focus_timer_end';
