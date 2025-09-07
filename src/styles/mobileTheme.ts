// Mobile Theme System for ThinqScribe
export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#667eea',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#764ba2',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  white: '#ffffff',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },
};

export const gradients = {
  primary: ['#667eea', '#764ba2'],
  secondary: ['#f093fb', '#f5576c'],
  success: ['#4facfe', '#00f2fe'],
  dark: ['#434343', '#000000'],
  sunset: ['#fa709a', '#fee140'],
  ocean: ['#2196f3', '#21cbf3'],
};

export const animations = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    linear: 'linear',
  },
};

export const layout = {
  screen: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  center: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
};

export const components = {
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  button: {
    primary: {
      backgroundColor: colors.primary[500],
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: colors.primary[500],
      borderWidth: 1,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
    },
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.neutral[300],
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
  },
  header: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
};

export const textStyles = {
  h1: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '800' as const,
    lineHeight: typography.lineHeight.tight,
    color: colors.neutral[900],
  },
  h2: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '700' as const,
    lineHeight: typography.lineHeight.tight,
    color: colors.neutral[900],
  },
  h3: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '600' as const,
    lineHeight: typography.lineHeight.snug,
    color: colors.neutral[900],
  },
  h4: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600' as const,
    lineHeight: typography.lineHeight.snug,
    color: colors.neutral[900],
  },
  body: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.normal,
    color: colors.neutral[700],
  },
  bodyLarge: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.normal,
    color: colors.neutral[700],
  },
  bodySmall: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal,
    color: colors.neutral[600],
  },
  caption: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.normal,
    color: colors.neutral[500],
  },
  button: {
    fontSize: typography.fontSize.base,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  link: {
    fontSize: typography.fontSize.base,
    color: colors.primary[500],
    textDecorationLine: 'underline' as const,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  gradients,
  animations,
  layout,
  components,
  textStyles,
};
