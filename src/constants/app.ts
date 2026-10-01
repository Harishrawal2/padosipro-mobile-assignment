import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri;
const localIp = debuggerHost ? debuggerHost.split(':')[0] : '192.168.1.7';

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? `http://${localIp}:5000/api/v1`;

export const APP_CONFIG = {
  // Replace 'localhost' or '127.0.0.1' with host LAN IP because mobile devices cannot access PC host via localhost
  API_URL: rawApiUrl.replace('localhost', localIp).replace('127.0.0.1', localIp),
  OTP_RESEND_COOLDOWN_SECONDS: 30,
  OTP_LENGTH: 6,
} as const;


