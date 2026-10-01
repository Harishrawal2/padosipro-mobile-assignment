import apiClient from './client';
import type { UserProfileResponse } from '@/types/user.types';
import type { ProfileOnboardingInput } from '@/types/user.types';

export const userApi = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const { data } = await apiClient.get<UserProfileResponse>('/users/me');
    return data;
  },

  updateProfile: async (input: ProfileOnboardingInput): Promise<UserProfileResponse> => {
    const { data } = await apiClient.post<UserProfileResponse>(
      '/users/profile',
      input
    );
    return data;
  },
};
