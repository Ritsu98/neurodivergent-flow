import { supabase } from '../client';
import type { UserPrefs, WorkWindow } from '@neurodivergent-flow/core';

/**
 * Map database row (snake_case) to UserPrefs (camelCase)
 */
function mapDbToUserPrefs(row: any): UserPrefs {
  return {
    id: row.id,
    userId: row.user_id,
    workMode: row.work_mode,
    workWindows: row.work_windows as WorkWindow[] | undefined,
    afterWorkEnergy: row.after_work_energy,
    preferredPrimaryBlockTime: row.preferred_primary_block_time,
    sleepWindowStart: row.sleep_window_start,
    sleepWindowEnd: row.sleep_window_end,
    downshiftReminderEnabled: row.downshift_reminder_enabled ?? true,
    weekIntensityDefault: row.week_intensity_default ?? 'normal',
    rechargeDefaults: row.recharge_defaults ?? [],
    notificationPreferences: row.notification_preferences ?? {},
    highContrastEnabled: row.high_contrast_enabled ?? false,
    reducedMotionEnabled: row.reduced_motion_enabled ?? false,
    hapticsEnabled: row.haptics_enabled ?? true,
    soundEnabled: row.sound_enabled ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Map UserPrefs (camelCase) to database row (snake_case)
 */
function mapUserPrefsToDb(prefs: Partial<UserPrefs>): any {
  const dbRow: any = {};

  if (prefs.workMode !== undefined) dbRow.work_mode = prefs.workMode;
  if (prefs.workWindows !== undefined) dbRow.work_windows = prefs.workWindows;
  if (prefs.afterWorkEnergy !== undefined) dbRow.after_work_energy = prefs.afterWorkEnergy;
  if (prefs.preferredPrimaryBlockTime !== undefined)
    dbRow.preferred_primary_block_time = prefs.preferredPrimaryBlockTime;
  if (prefs.sleepWindowStart !== undefined) dbRow.sleep_window_start = prefs.sleepWindowStart;
  if (prefs.sleepWindowEnd !== undefined) dbRow.sleep_window_end = prefs.sleepWindowEnd;
  if (prefs.downshiftReminderEnabled !== undefined)
    dbRow.downshift_reminder_enabled = prefs.downshiftReminderEnabled;
  if (prefs.weekIntensityDefault !== undefined)
    dbRow.week_intensity_default = prefs.weekIntensityDefault;
  if (prefs.rechargeDefaults !== undefined) dbRow.recharge_defaults = prefs.rechargeDefaults;
  if (prefs.notificationPreferences !== undefined)
    dbRow.notification_preferences = prefs.notificationPreferences;
  if (prefs.highContrastEnabled !== undefined)
    dbRow.high_contrast_enabled = prefs.highContrastEnabled;
  if (prefs.reducedMotionEnabled !== undefined)
    dbRow.reduced_motion_enabled = prefs.reducedMotionEnabled;
  if (prefs.hapticsEnabled !== undefined) dbRow.haptics_enabled = prefs.hapticsEnabled;
  if (prefs.soundEnabled !== undefined) dbRow.sound_enabled = prefs.soundEnabled;

  return dbRow;
}

/**
 * Create or update user preferences
 */
export async function upsertUserPrefs(
  userId: string,
  prefs: Partial<UserPrefs>
): Promise<UserPrefs> {
  const dbRow = mapUserPrefsToDb(prefs);
  dbRow.user_id = userId;
  dbRow.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('user_prefs')
    .upsert(dbRow, {
      onConflict: 'user_id',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save user preferences: ${error.message}`);
  }

  return mapDbToUserPrefs(data);
}

/**
 * Get user preferences
 */
export async function getUserPrefs(userId: string): Promise<UserPrefs | null> {
  const { data, error } = await supabase
    .from('user_prefs')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to get user preferences: ${error.message}`);
  }

  return mapDbToUserPrefs(data);
}
