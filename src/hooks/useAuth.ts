import { useState, useCallback } from 'react';
import { authApi } from '@/api/auth.api';
import { storage } from '@/utils/storage';
import { useAuthStore } from '@/store/auth.store';
import type { AuthUser } from '@/types/auth.types';


// Auth hook: sign-in, sign-out, token restore — consumed by screens
export function useAuth() {
  const store = useAuthStore();
  return store;
}

// Hook used in root layout to provide AuthStore value
export function useAuthProvider() {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const setAuthenticated = useCallback(
    async (authUser: AuthUser, token: string, refreshToken: string) => {
      await storage.setAccessToken(token);
      await storage.setRefreshToken(refreshToken);
      setUser(authUser);
      setAccessToken(token);
      setStatus('authenticated');
    },
    []
  );

  const setUnauthenticated = useCallback(async () => {
    await storage.clearTokens();
    setUser(null);
    setAccessToken(null);
    setStatus('unauthenticated');
  }, []);

  const updateUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser);
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const [token, refreshToken] = await Promise.all([
        storage.getAccessToken(),
        storage.getRefreshToken(),
      ]);

      if (!token || !refreshToken) {
        setStatus('unauthenticated');
        return;
      }

      // Try to refresh to verify the stored tokens are still valid
      const response = await authApi.refreshToken(refreshToken);
      if (response.data) {
        await storage.setAccessToken(response.data.accessToken);
        await storage.setRefreshToken(response.data.refreshToken);
        setUser(response.data.user);
        setAccessToken(response.data.accessToken);
        setStatus('authenticated');
      } else {
        await storage.clearTokens();
        setStatus('unauthenticated');
      }
    } catch {
      // Tokens invalid — user needs to log in again
      await storage.clearTokens();
      setStatus('unauthenticated');
    }
  }, []);

  return {
    status,
    user,
    accessToken,
    setAuthenticated,
    setUnauthenticated,
    updateUser,
    restoreSession,
  };
}
