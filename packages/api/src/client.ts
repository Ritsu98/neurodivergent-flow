import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface AuthStorageAdapter {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
}

function getSupabaseConfig(): { url: string; key: string } {
  const url =
    process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  return { url, key };
}

let client: SupabaseClient | null = null;
let authStorage: AuthStorageAdapter | undefined;

/**
 * Mobile: pass AsyncStorage adapter once at app startup so sessions persist.
 */
export function configureAuthStorage(storage: AuthStorageAdapter): void {
  authStorage = storage;
  client = null;
}

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (mobile) or NEXT_PUBLIC_* (web).'
    );
  }

  client = createClient(url, key, {
    auth: authStorage
      ? {
          storage: authStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        }
      : {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: typeof window !== 'undefined',
        },
  });
  return client;
}

/** Lazy singleton — does not throw until first use. */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getSupabaseClient(), prop, receiver);
    return typeof value === 'function' ? value.bind(getSupabaseClient()) : value;
  },
});
