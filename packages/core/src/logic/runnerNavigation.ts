import type { DayTheme } from '../types/week';

export function getRunnerPath(theme: DayTheme, taskId?: string): string {
  const base: Record<DayTheme, string> = {
    focus: '/runner/focus',
    recharge: '/runner/recharge',
    flex: '/runner/flex',
    admin: '/runner/admin',
  };
  const path = base[theme];
  if (taskId) return `${path}?taskId=${taskId}`;
  return path;
}
