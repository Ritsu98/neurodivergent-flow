import type { Task } from '@neurodivergent-flow/core';
import { getDatabase } from '@/lib/sqlite/db';

export function getLocalTasks(userId: string): Task[] {
  const db = getDatabase();
  const rows = db.getAllSync<{ data_json: string }>(
    'SELECT data_json FROM tasks WHERE user_id = ? ORDER BY updated_at DESC',
    [userId]
  );
  return rows.map((row) => JSON.parse(row.data_json) as Task);
}

export function saveLocalTasks(userId: string, tasks: Task[]): void {
  const db = getDatabase();
  for (const task of tasks) {
    db.runSync(
      `INSERT INTO tasks (id, user_id, data_json, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         data_json = excluded.data_json,
         updated_at = excluded.updated_at`,
      [task.id, userId, JSON.stringify(task), task.updatedAt ?? new Date().toISOString()]
    );
  }
}

export function saveLocalTask(task: Task): void {
  saveLocalTasks(task.userId, [task]);
}

export function getLocalTask(taskId: string): Task | null {
  const db = getDatabase();
  const row = db.getFirstSync<{ data_json: string }>(
    'SELECT data_json FROM tasks WHERE id = ?',
    [taskId]
  );
  return row ? (JSON.parse(row.data_json) as Task) : null;
}

export function deleteLocalTask(taskId: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM tasks WHERE id = ?', [taskId]);
}
