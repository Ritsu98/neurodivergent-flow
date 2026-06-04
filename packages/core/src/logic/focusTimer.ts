export function formatTimerDisplay(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function getRemainingSeconds(endTimestampMs: number): number {
  return Math.max(0, Math.ceil((endTimestampMs - Date.now()) / 1000));
}

export function createEndTimestamp(durationMinutes: number): number {
  return Date.now() + durationMinutes * 60 * 1000;
}

export function getTimerProgress(
  totalSeconds: number,
  remainingSeconds: number
): number {
  if (totalSeconds <= 0) return 0;
  return Math.min(1, Math.max(0, 1 - remainingSeconds / totalSeconds));
}
