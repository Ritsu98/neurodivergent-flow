export type OnboardingData = {
  workMode: 'none' | 'weekdays' | 'irregular';
  workWindows?: Array<{ days: number[]; start: string; end: string }>;
  afterWorkEnergy?: 'low' | 'mixed' | 'decent';
  preferredPrimaryBlockTime?: 'morning' | 'afternoon' | 'evening';
  sleepWindowStart?: string;
  sleepWindowEnd?: string;
  downshiftReminderEnabled: boolean;
  weekIntensity: 'light' | 'normal' | 'heavy';
  rechargeDefaults: string[];
  supplementsEnabled: boolean;
  selectedSupplements?: string[];
};
