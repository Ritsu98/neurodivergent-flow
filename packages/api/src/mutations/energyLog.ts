import { supabase } from '../client';
import type { EnergyLog, EnergyPeriod, DayColor } from '@neurodivergent-flow/core';

/**
 * Map database row (snake_case) to EnergyLog (camelCase)
 */
function mapDbToEnergyLog(row: any): EnergyLog {
  return {
    id: row.id,
    userId: row.user_id,
    loggedAt: row.logged_at,
    period: row.period as EnergyPeriod,
    value: row.value,
    dayColor: row.day_color as DayColor | undefined,
    createdAt: row.created_at,
  };
}

/**
 * Map EnergyLog (camelCase) to database row (snake_case)
 */
function mapEnergyLogToDb(log: Partial<EnergyLog>): any {
  const dbRow: any = {};

  if (log.loggedAt !== undefined) dbRow.logged_at = log.loggedAt;
  if (log.period !== undefined) dbRow.period = log.period;
  if (log.value !== undefined) dbRow.value = log.value;
  if (log.dayColor !== undefined) dbRow.day_color = log.dayColor;

  return dbRow;
}

/**
 * Get day color from energy value
 */
function getDayColor(value: number): DayColor {
  if (value >= 4) return 'green';
  if (value >= 2) return 'yellow';
  return 'red';
}

/**
 * Create or update energy log
 */
export async function upsertEnergyLog(
  userId: string,
  loggedAt: string,
  period: EnergyPeriod,
  value: number
): Promise<EnergyLog> {
  const dayColor = period === 'am' ? getDayColor(value) : undefined;

  const dbRow = mapEnergyLogToDb({
    loggedAt,
    period,
    value,
    dayColor,
  });
  dbRow.user_id = userId;

  const { data, error } = await supabase
    .from('energy_logs')
    .upsert(dbRow, {
      onConflict: 'user_id,logged_at,period',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save energy log: ${error.message}`);
  }

  return mapDbToEnergyLog(data);
}

/**
 * Get energy log for a specific date and period
 */
export async function getEnergyLog(
  userId: string,
  loggedAt: string,
  period: EnergyPeriod
): Promise<EnergyLog | null> {
  const { data, error } = await supabase
    .from('energy_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('logged_at', loggedAt)
    .eq('period', period)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get energy log: ${error.message}`);
  }

  return mapDbToEnergyLog(data);
}

/**
 * Get all energy logs for a date
 */
export async function getEnergyLogsForDate(
  userId: string,
  date: string
): Promise<EnergyLog[]> {
  const { data, error } = await supabase
    .from('energy_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('logged_at', date)
    .order('period', { ascending: true });

  if (error) {
    throw new Error(`Failed to get energy logs: ${error.message}`);
  }

  return data.map(mapDbToEnergyLog);
}
