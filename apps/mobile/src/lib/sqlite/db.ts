import * as SQLite from 'expo-sqlite';
import { MIGRATION_V1, SCHEMA_VERSION } from '@/lib/sqlite/schema';

let database: SQLite.SQLiteDatabase | null = null;
let initialized = false;

export function ensureLocalDatabase(): void {
  if (initialized) return;
  initLocalDatabase();
  initialized = true;
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!database) {
    throw new Error('Local database not initialized. Call initLocalDatabase() first.');
  }
  return database;
}

export function initLocalDatabase(): void {
  if (database) return;

  database = SQLite.openDatabaseSync('neurodivergent_flow.db');
  database.execSync(MIGRATION_V1);

  const versionRow = database.getFirstSync<{ value: string }>(
    "SELECT value FROM schema_meta WHERE key = 'version'"
  );

  if (!versionRow) {
    database.runSync("INSERT INTO schema_meta (key, value) VALUES ('version', ?)", [
      String(SCHEMA_VERSION),
    ]);
  }

  initialized = true;
}

/** Clear all local user data on sign-out (prevents cross-account leakage). */
export function clearLocalDatabase(): void {
  if (!database) return;
  database.execSync(`
    DELETE FROM sync_queue;
    DELETE FROM energy_logs;
    DELETE FROM user_prefs;
    DELETE FROM week_plans;
    DELETE FROM tasks;
    DELETE FROM inbox_items;
  `);
}
