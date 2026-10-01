import apiClient from './client';
import type {
  AuthResponse,
  RegisterResponse,
  RefreshTokenResponse,
} from '@/types/auth.types';

export const authApi = {
  register: async (email: string, password: string): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<RegisterResponse>('/auth/register', {
      email,
      password,
    });
    return data;
  },

  verifyOtp: async (email: string, otp: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/verify-otp', {
      email,
      otp,
    });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return data;
  },

  resendOtp: async (email: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.post('/auth/resend-otp', { email });
    return data;
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const { data } = await apiClient.post<RefreshTokenResponse>(
      '/auth/refresh-token',
      { refreshToken }
    );
    return data;
  },

  logout: async (refreshToken?: string): Promise<void> => {
    await apiClient.post('/auth/logout', refreshToken ? { refreshToken } : {});
  },
};
