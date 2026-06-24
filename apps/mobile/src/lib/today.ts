/** Monday-based day index: 0 = Mon, 6 = Sun */
export function getTodayDayIndex(): number {
  const dayOfWeek = new Date().getDay();
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/** Start of current week (Monday) as YYYY-MM-DD */
export function getCurrentWeekStartDate(): string {
  const todayDate = new Date();
  const dayOfWeek = todayDate.getDay();
  const startDate = new Date(todayDate);
  startDate.setDate(todayDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return startDate.toISOString().split('T')[0];
}

export function dayColorFromEnergy(value: number): 'green' | 'yellow' | 'red' {
  if (value >= 4) return 'green';
  if (value >= 2) return 'yellow';
  return 'red';
}
