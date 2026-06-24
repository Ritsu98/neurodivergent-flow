import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (mobile) or NEXT_PUBLIC_* (web).'
    );
  }

  client = createClient(url, key);
  return client;
}

/** Lazy singleton — does not throw until first use. */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getSupabaseClient(), prop, receiver);
    return typeof value === 'function' ? value.bind(getSupabaseClient()) : value;
  },
});
