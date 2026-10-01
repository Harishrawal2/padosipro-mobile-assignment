// All route names for the app — single source of truth
export const ROUTES = {
  // Auth Stack
  LOGIN: '/(auth)/login',
  REGISTER: '/(auth)/register',
  VERIFY_OTP: '/(auth)/verify-otp',

  // App Stack
  PROFILE: '/(app)/profile',
  TASK_SELECTION: '/(app)/task-selection',
  HOME: '/(app)/home',
} as const;
