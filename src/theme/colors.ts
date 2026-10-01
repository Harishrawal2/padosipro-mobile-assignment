export const colors = {
  primary: '#0D5C46',         // Deep forest green from screenshots
  primaryDark: '#0A4937',     // Darker forest green
  primaryLight: '#E6F4EE',    // Light mint background for icon badges
  buttonBackground: '#0D5C46',// Vibrant deep forest green
  buttonPressed: '#0A4937',

  secondary: '#0F172A',
  accent: '#0D5C46',

  background: '#FAF9F6',      // Warm cream/off-white screen background
  surface: '#FFFFFF',         // Card white surface
  surfaceSecondary: '#F3F4F6',

  textPrimary: '#111827',     // Dark heading text
  textSecondary: '#475569',   // Slate body text
  textTertiary: '#94A3B8',    // Muted placeholder/caption
  textOnPrimary: '#FFFFFF',

  border: '#E2E8F0',          // Subtle input and card border
  borderFocus: '#0D5C46',

  error: '#EF4444',
  errorLight: '#FEE2E2',
  success: '#22C55E',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  inputBackground: '#FFFFFF', // White background for text inputs

  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export type ColorKey = keyof typeof colors;

