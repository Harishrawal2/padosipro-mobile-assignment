import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '@/store/auth.store';
import { useAuthProvider } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import { Loading } from '@/components/Loading';

SplashScreen.preventAutoHideAsync();

/**
 * Navigation guard — centralized routing based on auth + profile state.
 *
 * Flows:
 *   unauthenticated                      → /(auth)/login
 *   authenticated, profile incomplete    → /(app)/profile
 *   authenticated, profile complete,
 *     coming from auth group             → /(app)/home  (returning users)
 *   profile just completed (profile pg)  → /(app)/task-selection
 */
function NavigationGuard() {
  const { status, user } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (status === 'loading') return;

    const seg = segments as string[];
    const inAuthGroup = seg[0] === '(auth)';
    const inAppGroup  = seg[0] === '(app)';
    const currentPage = seg[1];

    if (status === 'unauthenticated') {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
      return;
    }

    // Authenticated
    if (!user?.profileCompleted) {
      // Needs to complete profile first
      if (!(inAppGroup && currentPage === 'profile')) {
        router.replace('/profile');
      }
      return;
    }

    // Profile complete
    if (inAuthGroup) {
      // Returning user after login: go straight to home
      router.replace('/home');
      return;
    }
  }, [status, user?.profileCompleted, segments]);

  if (status === 'loading') {
    return <Loading fullScreen message="Loading…" />;
  }

  return <Slot />;
}

export default function RootLayout() {
  const authProvider = useAuthProvider();

  useEffect(() => {
    authProvider.restoreSession().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  return (
    <AuthContext.Provider value={authProvider}>
      <StatusBar style="auto" />
      <NavigationGuard />
    </AuthContext.Provider>
  );
}
