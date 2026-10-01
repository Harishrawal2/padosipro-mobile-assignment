import { createContext, useContext } from 'react';
import type { AuthUser } from '@/types/auth.types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthStore {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  setAuthenticated: (user: AuthUser, accessToken: string, refreshToken: string) => Promise<void>;
  setUnauthenticated: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
  restoreSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthStore | null>(null);

export function useAuthStore(): AuthStore {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthStore must be used inside AuthProvider');
  }
  return ctx;
}
