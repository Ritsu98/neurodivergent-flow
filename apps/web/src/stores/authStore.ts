import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { syncAuthSession } from '@neurodivergent-flow/api';
import { createClient } from '@/lib/supabase/client';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const supabase = createClient();

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    await syncAuthSession(session);
    set({
      session,
      user: session?.user ?? null,
      isInitialized: true,
    });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncAuthSession(session);
      set({ session, user: session?.user ?? null });
    });
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      if (!data.session) throw new Error('Sign in failed — no session returned');
      await syncAuthSession(data.session);
      set({ session: data.session, user: data.user });
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password) => {
    set({ isLoading: true });
    try {
      const emailRedirectTo = `${window.location.origin}/auth/callback?next=/onboarding`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo },
      });
      if (error) throw new Error(error.message);

      const needsEmailConfirmation = Boolean(data.user && !data.session);
      if (data.session) {
        await syncAuthSession(data.session);
        set({ session: data.session, user: data.user });
      }
      return { needsEmailConfirmation };
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      await syncAuthSession(null);
      set({ session: null, user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true });
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw new Error(error.message);
    } finally {
      set({ isLoading: false });
    }
  },
}));
