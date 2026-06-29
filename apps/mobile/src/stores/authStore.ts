import { create } from 'zustand';
import {
  getSession,
  onAuthStateChange,
  resetPassword,
  signIn,
  signOut,
  signUp,
  type Session,
  type User,
} from '@neurodivergent-flow/api';
import { clearLocalDatabase } from '@/lib/sqlite/db';

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

let unsubscribe: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;

    const session = await getSession();
    set({
      session,
      user: session?.user ?? null,
      isInitialized: true,
    });

    if (unsubscribe) unsubscribe();
    const subscription = onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
    unsubscribe = () => subscription.unsubscribe();
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      const session = await signIn(email, password);
      set({ session, user: session.user });
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password) => {
    set({ isLoading: true });
    try {
      const result = await signUp(email, password, {
        emailRedirectTo: 'neurodivergentflow://auth/callback',
      });
      if (result.session) {
        set({ session: result.session, user: result.user });
      }
      return { needsEmailConfirmation: result.needsEmailConfirmation };
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await signOut();
      clearLocalDatabase();
      set({ session: null, user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true });
    try {
      await resetPassword(email, 'neurodivergentflow://reset-password');
    } finally {
      set({ isLoading: false });
    }
  },
}));
