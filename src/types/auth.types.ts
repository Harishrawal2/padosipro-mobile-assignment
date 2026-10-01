// ─── Auth Types ─────────────────────────────────────────────────────────────

export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ResendOtpInput {
  email: string;
}

// ─── API Response Types ──────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  isVerified: boolean;
  profileCompleted: boolean;
  name?: string | null;
  mobileNumber?: string | null;
  address?: string | null;
  businessName?: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
}

// ─── Auth State ──────────────────────────────────────────────────────────────

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
}
