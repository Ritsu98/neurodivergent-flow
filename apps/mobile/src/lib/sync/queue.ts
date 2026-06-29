import { getDatabase } from '@/lib/sqlite/db';

export interface QueuedMutation {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
  retries: number;
}

function generateId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function enqueueMutation(type: string, payload: Record<string, unknown>): void {
  const db = getDatabase();
  const entry: QueuedMutation = {
    id: generateId(),
    type,
    payload,
    createdAt: new Date().toISOString(),
    retries: 0,
  };
  db.runSync(
    'INSERT INTO sync_queue (id, type, payload, created_at, retries) VALUES (?, ?, ?, ?, ?)',
    [entry.id, entry.type, JSON.stringify(entry.payload), entry.createdAt, entry.retries]
  );
}

export function getQueuedMutations(): QueuedMutation[] {
  const db = getDatabase();
  const rows = db.getAllSync<{
    id: string;
    type: string;
    payload: string;
    created_at: string;
    retries: number;
  }>('SELECT * FROM sync_queue ORDER BY created_at ASC');

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    payload: JSON.parse(row.payload) as Record<string, unknown>,
    createdAt: row.created_at,
    retries: row.retries,
  }));
}

export function removeQueuedMutation(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM sync_queue WHERE id = ?', [id]);
}

export function incrementMutationRetry(id: string): void {
  const db = getDatabase();
  db.runSync('UPDATE sync_queue SET retries = retries + 1 WHERE id = ?', [id]);
}
