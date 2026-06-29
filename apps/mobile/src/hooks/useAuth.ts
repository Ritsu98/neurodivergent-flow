import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const signOut = useAuthStore((s) => s.signOut);

  return {
    session,
    user,
    userId: user?.id ?? null,
    isLoading,
    isInitialized,
    isAuthenticated: Boolean(session?.user),
    signOut,
  };
}
