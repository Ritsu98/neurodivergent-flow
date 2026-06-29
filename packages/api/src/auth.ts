import type { AuthChangeEvent, Session, Subscription, User } from '@supabase/supabase-js';
import { getSupabaseClient, supabase } from './client';

export type { Session, User };

export interface SignUpResult {
  user: User | null;
  session: Session | null;
  needsEmailConfirmation: boolean;
}

export async function signUp(
  email: string,
  password: string,
  options?: { emailRedirectTo?: string }
): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: options?.emailRedirectTo
      ? { emailRedirectTo: options.emailRedirectTo }
      : undefined,
  });
  if (error) throw new Error(error.message);

  return {
    user: data.user,
    session: data.session,
    needsEmailConfirmation: Boolean(data.user && !data.session),
  };
}

export async function signIn(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (!data.session) throw new Error('Sign in failed — no session returned');
  return data.session;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function resetPassword(email: string, redirectTo: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw new Error(error.message);
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
): Subscription {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
}

/** Sync session to the shared API client (e.g. after SSR browser auth). */
export async function syncAuthSession(session: Session | null): Promise<void> {
  const client = getSupabaseClient();
  if (session) {
    await client.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  } else {
    await client.auth.signOut({ scope: 'local' });
  }
}
