/** Next Monday from today (matches web onboarding). */
export function getNextWeekStartDate(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + daysUntilMonday);
  return startDate.toISOString().split('T')[0];
}
