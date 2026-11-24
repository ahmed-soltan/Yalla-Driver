import { useAuthStore } from '@/shared/hooks/auth-store';
import { useEffect } from 'react';


/** Call once from the root layout to restore a persisted session before rendering routes. */
export function useAuthBootstrap() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return { isReady: status !== 'checking', isAuthenticated: status === 'authenticated' };
}
