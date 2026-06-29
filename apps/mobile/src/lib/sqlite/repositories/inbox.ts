import type { InboxItem } from '@neurodivergent-flow/core';
import { getDatabase } from '@/lib/sqlite/db';

export function getLocalInboxItems(userId: string): InboxItem[] {
  const db = getDatabase();
  const rows = db.getAllSync<{ data_json: string }>(
    'SELECT data_json FROM inbox_items WHERE user_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC',
    [userId]
  );
  return rows.map((row) => JSON.parse(row.data_json) as InboxItem);
}

export function saveLocalInboxItems(userId: string, items: InboxItem[]): void {
  const db = getDatabase();
  for (const item of items) {
    db.runSync(
      `INSERT INTO inbox_items (id, user_id, data_json, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         data_json = excluded.data_json,
         updated_at = excluded.updated_at,
         deleted_at = excluded.deleted_at`,
      [
        item.id,
        userId,
        JSON.stringify(item),
        item.createdAt ?? new Date().toISOString(),
        item.deletedAt ?? null,
      ]
    );
  }
}
