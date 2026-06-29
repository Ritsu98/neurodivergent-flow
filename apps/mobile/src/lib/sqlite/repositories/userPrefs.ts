import type { UserPrefs } from '@neurodivergent-flow/core';
import { getDatabase } from '@/lib/sqlite/db';

export function getLocalUserPrefs(userId: string): UserPrefs | null {
  const db = getDatabase();
  const row = db.getFirstSync<{ data_json: string }>(
    'SELECT data_json FROM user_prefs WHERE user_id = ?',
    [userId]
  );
  if (!row) return null;
  return JSON.parse(row.data_json) as UserPrefs;
}

export function saveLocalUserPrefs(prefs: UserPrefs): void {
  const db = getDatabase();
  db.runSync(
    `INSERT INTO user_prefs (user_id, data_json, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       data_json = excluded.data_json,
       updated_at = excluded.updated_at`,
    [prefs.userId, JSON.stringify(prefs), prefs.updatedAt ?? new Date().toISOString()]
  );
}
