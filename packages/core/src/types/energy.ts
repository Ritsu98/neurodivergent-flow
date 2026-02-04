export type EnergyPeriod = 'am' | 'pm' | 'eve';
export type DayColor = 'green' | 'yellow' | 'red';

export interface EnergyLog {
  id: string;
  userId: string;
  loggedAt: string; // YYYY-MM-DD
  period: EnergyPeriod;
  value: number; // 0-5
  dayColor?: DayColor; // Computed from AM value
  createdAt: string;
}
