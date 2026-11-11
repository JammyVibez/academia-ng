/**
 * Academia NG design tokens — violet ink, white paper, pink light.
 * Mirrored by the web client so both platforms share one visual language.
 */
export const colors = {
  primary: '#5B21B6',
  primaryDark: '#1B0B2E',
  primaryLight: '#7C3AED',
  primarySoft: '#EFE6FE',
  accent: '#EC4899',
  accentDark: '#BE185D',
  accentSoft: '#FCE7F3',
  bg: '#F8F6FC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1ECF9',
  text: '#0B0710',
  textSecondary: '#3B3247',
  muted: '#6E6580',
  border: '#E7E1EF',
  borderStrong: '#D4C9E4',
  danger: '#B3261E',
  dangerBg: '#FBEAE7',
  success: '#BE185D',
  successSoft: '#FCE7F3',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: 'rgba(255,255,255,0.74)',
  overlay: 'rgba(11,7,16,0.55)',
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
    shadowColor: '#1B0B2E',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#1B0B2E',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  button: {
    shadowColor: '#5B21B6',
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  glow: {
    shadowColor: '#EC4899',
    shadowOpacity: 0.38,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
} as const;

/** Gradient ramps used for hero surfaces, primary actions and light sweeps. */
export const gradients = {
  hero: ['#2A0B4A', '#5B21B6', '#1B0B2E'] as const,
  heroDeep: ['#0B0710', '#2E1065'] as const,
  primary: ['#7C3AED', '#5B21B6'] as const,
  pink: ['#F472B6', '#DB2777'] as const,
  pinkSoft: ['#FDE8F4', '#F9CFE7'] as const,
  sheen: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0)'] as const,
  shimmer: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0)'] as const,
} as const;
