export type WorkMode = 'none' | 'weekdays' | 'irregular';
export type AfterWorkEnergy = 'low' | 'mixed' | 'decent';
export type PreferredPrimaryBlockTime = 'morning' | 'afternoon' | 'evening';
export type WeekIntensity = 'light' | 'normal' | 'heavy';

export interface WorkWindow {
  days: number[]; // 0=Mon, 6=Sun
  start: string; // HH:mm
  end: string; // HH:mm
}

export interface UserPrefs {
  id: string;
  userId: string;
  workMode: WorkMode;
  workWindows?: WorkWindow[];
  afterWorkEnergy?: AfterWorkEnergy;
  preferredPrimaryBlockTime?: PreferredPrimaryBlockTime;
  sleepWindowStart?: string; // HH:mm
  sleepWindowEnd?: string; // HH:mm
  downshiftReminderEnabled: boolean;
  weekIntensityDefault: WeekIntensity;
  rechargeDefaults: string[];
  notificationPreferences: Record<string, boolean>;
  highContrastEnabled: boolean;
  reducedMotionEnabled: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
