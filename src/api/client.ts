import axios, { AxiosError } from 'axios';
import { APP_CONFIG } from '@/constants/app';
import { storage } from '@/utils/storage';

// Single Axios instance for the whole app
const apiClient = axios.create({
  baseURL: APP_CONFIG.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach access token to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Error Shape ─────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * Extracts a user-friendly error message from an Axios error.
 * Never exposes raw stack traces.
 */
export function extractApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const data = error.response?.data as {
      message?: string;
      error?: { code?: string };
    } | undefined;

    return {
      message: data?.message ?? error.message ?? 'Something went wrong',
      code: data?.error?.code,
      statusCode: error.response?.status,
    };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: 'An unexpected error occurred' };
}

export default apiClient;
