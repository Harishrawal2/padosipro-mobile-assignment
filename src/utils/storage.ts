import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'pp_access_token';
const REFRESH_TOKEN_KEY = 'pp_refresh_token';

export const storage = {
  setAccessToken: (token: string) =>
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token),

  getAccessToken: () =>
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),

  setRefreshToken: (token: string) =>
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token),

  getRefreshToken: () =>
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),

  clearTokens: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
