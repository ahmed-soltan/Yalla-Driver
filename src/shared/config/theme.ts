/**
 * JS-side mirror of the CSS custom properties in `global.css`.
 *
 * Prefer NativeWind className tokens (e.g. `className="bg-primary"`) for
 * anything that renders as a View/Text. Reach for this file only when a
 * component needs a raw color value in JS — e.g. an icon `color` prop,
 * a native chart lib, or `StatusBar` styling.
 */

export const BRAND = {
  primary: '#E8754F',
  primaryLight: '#F2895F',
  peach: '#F3A57C',
  primarySoft: 'rgba(232,117,79,0.14)',
  teal: '#3D8078',
  tealDark: '#2B6159',
  dark: '#1F2933',
  background: '#FFFFFF',
  surface: '#F7F3EC',
  surfaceRaised: '#FFFFFF',
  line: '#E8E1D5',
  text: '#1F2933',
  muted: '#6B7280',
  onPrimary: '#FFFFFF',
  onPrimaryGlass: 'rgba(255,255,255,0.25)',
  success: '#2B6159',
  successBg: '#DCEBE8',
  danger: '#B8432A',
} as const;

export const colors = {
  light: {
    background: BRAND.background,
    foreground: BRAND.text,
    primary: BRAND.primary,
    primaryForeground: BRAND.onPrimary,
    secondary: BRAND.teal,
    secondaryForeground: BRAND.onPrimary,
    muted: BRAND.surface,
    mutedForeground: BRAND.muted,
    card: BRAND.surfaceRaised,
    cardForeground: BRAND.text,
    border: BRAND.line,
    success: BRAND.success,
    warning: '#F59E0B',
    destructive: '#B8432A',
    destructiveForeground: BRAND.onPrimary,
  },
  dark: {
    background: '#080b13',
    foreground: '#f1f5f9',
    primary: '#3b82f6',
    primaryForeground: '#0f172a',
    secondary: '#1e293b',
    secondaryForeground: '#f1f5f9',
    muted: '#1e293b',
    mutedForeground: '#94a3b8',
    card: '#111827',
    cardForeground: '#f1f5f9',
    border: '#1e293b',
    success: '#4ade80',
    warning: '#facc15',
    destructive: '#f87171',
    destructiveForeground: '#0f172a',
  },
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
} as const;

export type ThemeMode = keyof typeof colors;
export type ThemeColors = (typeof colors)[ThemeMode];
