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
export const RECHARGE_TIMER_STORAGE_KEY = 'nf_recharge_timer_end';
export const FLEX_TIMER_STORAGE_KEY = 'nf_flex_timer_end';
export const ADMIN_TIMER_STORAGE_KEY = 'nf_admin_timer_end';

// --- Recharge ---

export type RechargeType = 'micro' | 'full' | 'gentle';

export const RECHARGE_TYPE_CONFIG: Record<
  RechargeType,
  { label: string; description: string; defaultMinutes: number; timerDefault: boolean }
> = {
  micro: { label: 'Micro-recharge', description: '10–20 min intentional rest', defaultMinutes: 15, timerDefault: true },
  full: { label: 'Full recharge', description: '45–90 min deeper recovery', defaultMinutes: 60, timerDefault: true },
  gentle: { label: 'Gentle reset', description: 'Shower, comfy, tea, music — no rush', defaultMinutes: 30, timerDefault: false },
};

export const DEFAULT_RECHARGE_RITUAL_ITEMS = [
  'Phone down',
  'Lights adjusted',
  'Comfort item ready',
  'Distractions minimized',
] as const;

export interface RechargeRunnerSettings {
  ritualItems: string[];
}

export const DEFAULT_RECHARGE_RUNNER_SETTINGS: RechargeRunnerSettings = {
  ritualItems: [...DEFAULT_RECHARGE_RITUAL_ITEMS],
};

// --- Flex ---

export type FlexZone = 'kitchen' | 'laundry' | 'inbox' | 'calls' | 'errands' | 'other';

export const FLEX_ZONE_CONFIG: Record<FlexZone, { label: string; checklist: string[] }> = {
  kitchen: { label: 'Kitchen', checklist: ['Clear counters', 'Load/unload dishwasher', 'Wipe surfaces'] },
  laundry: { label: 'Laundry', checklist: ['Start or switch load', 'Fold 5 items', 'Put away one pile'] },
  inbox: { label: 'Inbox', checklist: ['Process 3 emails', 'Archive old threads', 'Flag one follow-up'] },
  calls: { label: 'Calls', checklist: ['List who to call', 'Make one call', 'Schedule callback if needed'] },
  errands: { label: 'Errands', checklist: ['List top 3 errands', 'Do the closest one', 'Pack bag/keys'] },
  other: { label: 'Other', checklist: ['Name the task', 'Gather what you need', 'Start small'] },
};

export const FLEX_DURATION_OPTIONS = [10, 15, 20] as const;

// --- Admin ---

export type AdminCategory = 'bills' | 'calendar' | 'email' | 'planning' | 'other';

export const ADMIN_CATEGORY_CONFIG: Record<AdminCategory, { label: string; checklist: string[] }> = {
  bills: { label: 'Bills', checklist: ['Check due dates', 'Pay or schedule one bill', 'File receipt'] },
  calendar: { label: 'Calendar', checklist: ['Review this week', 'Add one event', 'Confirm appointments'] },
  email: { label: 'Email', checklist: ['Inbox zero attempt (15 min max)', 'Star one action item', 'Unsubscribe one list'] },
  planning: { label: 'Planning', checklist: ['Review Top 3', 'Update one next step', 'Note blockers'] },
  other: { label: 'Other', checklist: ['Define admin task', 'Set timer boundary', 'Start first step'] },
};

export const ADMIN_DURATION_OPTIONS = [15, 20, 25, 30] as const;

// --- Stored prefs blob ---

export interface StoredRunnerSettings {
  focus?: FocusRunnerSettings;
  recharge?: RechargeRunnerSettings;
}
