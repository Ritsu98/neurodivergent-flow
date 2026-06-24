const DB_NAME = 'neurodivergent-flow';
const DB_VERSION = 1;
const QUEUE_STORE = 'offline_queue';

export interface QueuedMutation {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
  retries: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
      }
    };
  });
}

export async function enqueueMutation(
  type: string,
  payload: Record<string, unknown>
): Promise<void> {
  const db = await openDb();
  const entry: QueuedMutation = {
    id: crypto.randomUUID(),
    type,
    payload,
    createdAt: new Date().toISOString(),
    retries: 0,
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    tx.objectStore(QUEUE_STORE).add(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getQueuedMutations(): Promise<QueuedMutation[]> {
  const db = await openDb();
  const items = await new Promise<QueuedMutation[]>((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readonly');
    const request = tx.objectStore(QUEUE_STORE).getAll();
    request.onsuccess = () => resolve(request.result as QueuedMutation[]);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function removeQueuedMutation(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    tx.objectStore(QUEUE_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}
