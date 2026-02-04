import { supabase } from '../client';
import type { WeekPlan, DayThemeConfig } from '@neurodivergent-flow/core';

/**
 * Map database row (snake_case) to WeekPlan (camelCase)
 */
function mapDbToWeekPlan(row: any): WeekPlan {
  return {
    id: row.id,
    userId: row.user_id,
    startDate: row.start_date,
    intensity: row.intensity,
    weeklyOutcomes: row.weekly_outcomes ?? [],
    dayThemes: row.day_themes as DayThemeConfig[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Map WeekPlan (camelCase) to database row (snake_case)
 */
function mapWeekPlanToDb(weekPlan: Partial<WeekPlan>): any {
  const dbRow: any = {};

  if (weekPlan.startDate !== undefined) dbRow.start_date = weekPlan.startDate;
  if (weekPlan.intensity !== undefined) dbRow.intensity = weekPlan.intensity;
  if (weekPlan.weeklyOutcomes !== undefined) dbRow.weekly_outcomes = weekPlan.weeklyOutcomes;
  if (weekPlan.dayThemes !== undefined) dbRow.day_themes = weekPlan.dayThemes;

  return dbRow;
}

/**
 * Create a new week plan
 */
export async function createWeekPlan(
  weekPlan: Omit<WeekPlan, 'id' | 'createdAt' | 'updatedAt'>
): Promise<WeekPlan> {
  const dbRow = mapWeekPlanToDb(weekPlan);
  dbRow.user_id = weekPlan.userId;
  dbRow.created_at = new Date().toISOString();
  dbRow.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('week_plans')
    .insert(dbRow)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create week plan: ${error.message}`);
  }

  return mapDbToWeekPlan(data);
}

/**
 * Get week plan for a specific start date
 */
export async function getWeekPlan(userId: string, startDate: string): Promise<WeekPlan | null> {
  const { data, error } = await supabase
    .from('week_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('start_date', startDate)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get week plan: ${error.message}`);
  }

  return mapDbToWeekPlan(data);
}

/**
 * Update week plan
 */
export async function updateWeekPlan(
  weekPlanId: string,
  updates: Partial<WeekPlan>
): Promise<WeekPlan> {
  const dbRow = mapWeekPlanToDb(updates);
  dbRow.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('week_plans')
    .update(dbRow)
    .eq('id', weekPlanId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update week plan: ${error.message}`);
  }

  return mapDbToWeekPlan(data);
}
