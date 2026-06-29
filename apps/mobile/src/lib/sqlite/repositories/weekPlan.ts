import type { WeekPlan } from '@neurodivergent-flow/core';
import { getDatabase } from '@/lib/sqlite/db';

export function getLocalWeekPlan(userId: string, startDate: string): WeekPlan | null {
  const db = getDatabase();
  const row = db.getFirstSync<{ data_json: string }>(
    'SELECT data_json FROM week_plans WHERE user_id = ? AND start_date = ?',
    [userId, startDate]
  );
  if (!row) return null;
  return JSON.parse(row.data_json) as WeekPlan;
}

export function saveLocalWeekPlan(plan: WeekPlan): void {
  const db = getDatabase();
  db.runSync(
    `INSERT INTO week_plans (id, user_id, start_date, data_json, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, start_date) DO UPDATE SET
       id = excluded.id,
       data_json = excluded.data_json,
       updated_at = excluded.updated_at`,
    [
      plan.id,
      plan.userId,
      plan.startDate,
      JSON.stringify(plan),
      plan.updatedAt ?? new Date().toISOString(),
    ]
  );
}

export function getLocalWeekPlanById(weekPlanId: string): WeekPlan | null {
  const db = getDatabase();
  const row = db.getFirstSync<{ data_json: string }>(
    'SELECT data_json FROM week_plans WHERE id = ?',
    [weekPlanId]
  );
  return row ? (JSON.parse(row.data_json) as WeekPlan) : null;
}

export function deleteLocalWeekPlan(weekPlanId: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM week_plans WHERE id = ?', [weekPlanId]);
}
