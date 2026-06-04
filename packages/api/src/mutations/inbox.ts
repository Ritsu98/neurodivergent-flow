import { supabase } from '../client';
import type { InboxItem } from '@neurodivergent-flow/core';
import { INBOX_MAX_ITEMS } from '@neurodivergent-flow/core';

function mapDbToInboxItem(row: Record<string, unknown>): InboxItem {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    content: row.content as string,
    capturedAt: row.captured_at as string,
    promotedToTaskId: row.promoted_to_task_id as string | undefined,
    deletedAt: row.deleted_at as string | undefined,
    createdAt: row.created_at as string,
    syncedAt: row.synced_at as string | undefined,
    localId: row.local_id as string | undefined,
  };
}

function mapInboxItemToDb(item: Partial<InboxItem>): Record<string, unknown> {
  const dbRow: Record<string, unknown> = {};

  if (item.content !== undefined) dbRow.content = item.content;
  if (item.capturedAt !== undefined) dbRow.captured_at = item.capturedAt;
  if (item.promotedToTaskId !== undefined) dbRow.promoted_to_task_id = item.promotedToTaskId;
  if (item.deletedAt !== undefined) dbRow.deleted_at = item.deletedAt;
  if (item.syncedAt !== undefined) dbRow.synced_at = item.syncedAt;
  if (item.localId !== undefined) dbRow.local_id = item.localId;

  return dbRow;
}

export async function createInboxItem(
  userId: string,
  content: string,
  capturedAt?: string
): Promise<InboxItem> {
  const existing = await getInboxItems(userId);
  if (existing.length >= INBOX_MAX_ITEMS) {
    throw new Error(`Inbox limit reached (${INBOX_MAX_ITEMS} items). Promote or delete items first.`);
  }

  const dbRow = mapInboxItemToDb({
    content,
    capturedAt: capturedAt ?? new Date().toISOString(),
  });
  dbRow.user_id = userId;

  const { data, error } = await supabase
    .from('inbox_items')
    .insert(dbRow)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create inbox item: ${error.message}`);
  }

  return mapDbToInboxItem(data);
}

export async function getInboxItems(userId: string): Promise<InboxItem[]> {
  const { data, error } = await supabase
    .from('inbox_items')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('captured_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get inbox items: ${error.message}`);
  }

  return data.map(mapDbToInboxItem);
}

export async function softDeleteInboxItem(inboxItemId: string): Promise<void> {
  const { error } = await supabase
    .from('inbox_items')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', inboxItemId);

  if (error) {
    throw new Error(`Failed to delete inbox item: ${error.message}`);
  }
}

export async function markInboxItemPromoted(
  inboxItemId: string,
  taskId: string
): Promise<InboxItem> {
  const { data, error } = await supabase
    .from('inbox_items')
    .update({ promoted_to_task_id: taskId })
    .eq('id', inboxItemId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to mark inbox item promoted: ${error.message}`);
  }

  return mapDbToInboxItem(data);
}
