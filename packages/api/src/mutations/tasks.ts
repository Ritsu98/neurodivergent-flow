import { supabase } from '../client';
import type { Task, TaskStatus } from '@neurodivergent-flow/core';

/**
 * Map database row (snake_case) to Task (camelCase)
 */
function mapDbToTask(row: any): Task {
  return {
    id: row.id,
    userId: row.user_id,
    weekPlanId: row.week_plan_id,
    title: row.title,
    outcome: row.outcome,
    nextStep: row.next_step,
    day: row.day,
    status: row.status as TaskStatus,
    isMvdEssential: row.is_mvd_essential ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    syncedAt: row.synced_at,
    localId: row.local_id,
  };
}

/**
 * Map Task (camelCase) to database row (snake_case)
 */
function mapTaskToDb(task: Partial<Task>): any {
  const dbRow: any = {};

  if (task.weekPlanId !== undefined) dbRow.week_plan_id = task.weekPlanId;
  if (task.title !== undefined) dbRow.title = task.title;
  if (task.outcome !== undefined) dbRow.outcome = task.outcome;
  if (task.nextStep !== undefined) dbRow.next_step = task.nextStep;
  if (task.day !== undefined) dbRow.day = task.day;
  if (task.status !== undefined) dbRow.status = task.status;
  if (task.isMvdEssential !== undefined) dbRow.is_mvd_essential = task.isMvdEssential;
  if (task.completedAt !== undefined) dbRow.completed_at = task.completedAt;
  if (task.syncedAt !== undefined) dbRow.synced_at = task.syncedAt;
  if (task.localId !== undefined) dbRow.local_id = task.localId;

  return dbRow;
}

/**
 * Create a new task
 */
export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const dbRow = mapTaskToDb(task);
  dbRow.user_id = task.userId;
  dbRow.created_at = new Date().toISOString();
  dbRow.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('tasks')
    .insert(dbRow)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`);
  }

  return mapDbToTask(data);
}

/**
 * Get tasks for a user with filters
 */
export async function getTasks(
  userId: string,
  filters?: {
    day?: number;
    status?: TaskStatus;
    isMvdEssential?: boolean;
  }
): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  if (filters?.day !== undefined) {
    query = query.eq('day', filters.day);
  }
  if (filters?.status !== undefined) {
    query = query.eq('status', filters.status);
  }
  if (filters?.isMvdEssential !== undefined) {
    query = query.eq('is_mvd_essential', filters.isMvdEssential);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get tasks: ${error.message}`);
  }

  return data.map(mapDbToTask);
}

/**
 * Update a task
 */
export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  const dbRow = mapTaskToDb(updates);
  dbRow.updated_at = new Date().toISOString();

  if (updates.status === 'done' && !updates.completedAt) {
    dbRow.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(dbRow)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update task: ${error.message}`);
  }

  return mapDbToTask(data);
}

/**
 * Delete a task (soft delete)
 */
export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    throw new Error(`Failed to delete task: ${error.message}`);
  }
}
