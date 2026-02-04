export type TimingAnchor =
  | 'am'
  | 'pm'
  | 'with_breakfast'
  | 'with_lunch'
  | 'with_dinner'
  | 'before_bed';
export type TemplateSource = 'basics' | 'sleep' | 'focus' | 'busy' | 'custom';

export interface Supplement {
  id: string;
  name: string;
  templateSource?: TemplateSource;
  timingAnchor: TimingAnchor;
  withFood: boolean;
  avoidWith: string[];
  safetyNote?: string;
  isOptional: boolean;
  createdAt: string;
}

export interface UserSupplementPlan {
  id: string;
  userId: string;
  supplementId: string;
  isCore: boolean;
  isActive: boolean;
  customTiming?: string;
  refillLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplementLog {
  id: string;
  userId: string;
  userSupplementPlanId: string;
  takenAt: string; // YYYY-MM-DD
  takenTime?: string; // HH:mm
  createdAt: string;
}
