export interface InboxItem {
  id: string;
  userId: string;
  content: string;
  capturedAt: string;
  promotedToTaskId?: string;
  deletedAt?: string;
  createdAt: string;
  syncedAt?: string;
  localId?: string;
}
