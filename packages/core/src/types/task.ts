export type TaskStatus = 'this_week' | 'today' | 'done';

export interface Task {
  id: string;
  userId: string;
  weekPlanId?: string;
  title: string;
  outcome?: string;
  nextStep?: string;
  day?: number; // 0=Mon, 6=Sun, null = This Week
  status: TaskStatus;
  isMvdEssential: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  syncedAt?: string;
  localId?: string; // For offline-first
}
