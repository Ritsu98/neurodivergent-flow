import type { DayColor, EnergyLog, EnergyPeriod } from '@neurodivergent-flow/core';
import { getDatabase } from '@/lib/sqlite/db';

function getDayColor(value: number): DayColor {
  if (value >= 4) return 'green';
  if (value >= 2) return 'yellow';
  return 'red';
}

interface EnergyLogRow {
  id: string;
  user_id: string;
  logged_at: string;
  period: string;
  value: number;
  day_color: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: EnergyLogRow): EnergyLog {
  return {
    id: row.id,
    userId: row.user_id,
    loggedAt: row.logged_at,
    period: row.period as EnergyPeriod,
    value: row.value,
    dayColor: (row.day_color as DayColor | null) ?? undefined,
    createdAt: row.created_at,
  };
}

export function getLocalEnergyLog(
  userId: string,
  loggedAt: string,
  period: EnergyPeriod
): EnergyLog | null {
  const db = getDatabase();
  const row = db.getFirstSync<EnergyLogRow>(
    `SELECT * FROM energy_logs WHERE user_id = ? AND logged_at = ? AND period = ?`,
    [userId, loggedAt, period]
  );
  return row ? mapRow(row) : null;
}

export function saveLocalEnergyLog(
  userId: string,
  loggedAt: string,
  period: EnergyPeriod,
  value: number,
  existingId?: string
): EnergyLog {
  const db = getDatabase();
  const now = new Date().toISOString();
  const dayColor = period === 'am' ? getDayColor(value) : undefined;
  const id = existingId ?? `local_energy_${userId}_${loggedAt}_${period}`;

  db.runSync(
    `INSERT INTO energy_logs (id, user_id, logged_at, period, value, day_color, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, logged_at, period) DO UPDATE SET
       value = excluded.value,
       day_color = excluded.day_color,
       updated_at = excluded.updated_at`,
    [id, userId, loggedAt, period, value, dayColor ?? null, now, now]
  );

  return {
    id,
    userId,
    loggedAt,
    period,
    value,
    dayColor,
    createdAt: now,
  };
}

export function upsertLocalEnergyLogFromRemote(log: EnergyLog): void {
  const db = getDatabase();
  const now = new Date().toISOString();
  db.runSync(
    `INSERT INTO energy_logs (id, user_id, logged_at, period, value, day_color, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, logged_at, period) DO UPDATE SET
       id = excluded.id,
       value = excluded.value,
       day_color = excluded.day_color,
       updated_at = excluded.updated_at`,
    [
      log.id,
      log.userId,
      log.loggedAt,
      log.period,
      log.value,
      log.dayColor ?? null,
      log.createdAt,
      now,
    ]
  );
}
