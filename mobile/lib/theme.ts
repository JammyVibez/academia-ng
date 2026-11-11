/**
 * Academia NG design tokens — calm, premium, academic.
 * Mirrored by the web client so both platforms share one visual language.
 */
export const colors = {
  primary: '#0E3B2E',
  primaryDark: '#082A20',
  primaryLight: '#1B5745',
  primarySoft: '#E6EFEA',
  accent: '#C8A34A',
  accentDark: '#997628',
  accentSoft: '#F8F0DA',
  bg: '#F4F6F3',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2EE',
  text: '#121A16',
  textSecondary: '#3F4B45',
  muted: '#78857E',
  border: '#E3E7E0',
  borderStrong: '#CFD6CE',
  danger: '#B3261E',
  dangerBg: '#FBEAE7',
  success: '#1F7A58',
  successSoft: '#E7F3ED',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: 'rgba(255,255,255,0.72)',
  overlay: 'rgba(8,22,17,0.5)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const shadow = {
  card: {
    shadowColor: '#0B241C',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#0B241C',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  button: {
    shadowColor: '#0E3B2E',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
} as const;
