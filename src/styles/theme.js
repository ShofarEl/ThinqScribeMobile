import { Platform } from 'react-native';
import { DefaultTheme } from 'react-native-paper';
import { colors, typography } from './designSystem';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary[500],
    primaryLight: colors.primary[400],
    primaryDark: colors.primary[600],
    accent: colors.warning[500],
    background: colors.white,
    surface: colors.white,
    text: colors.neutral[700],
    textSecondary: colors.neutral[500],
    error: colors.error[500],
    success: colors.success[500],
    warning: colors.warning[500],
    info: colors.info[500],
    border: colors.neutral[200],
    card: colors.white,
    notification: colors.error[500],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  roundness: 8,
  elevation: {
    small: 2,
    medium: 4,
    large: 8,
  },
  fonts: {
    // Override default fonts completely to avoid conflicts
    regular: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Regular' : typography.fonts.body.fontFamily,
      fontWeight: typography.fonts.body.fontWeight,
    },
    medium: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Medium' : typography.fonts.bodySemibold.fontFamily,
      fontWeight: typography.fonts.bodySemibold.fontWeight,
    },
    light: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Regular' : typography.fonts.body.fontFamily,
      fontWeight: typography.fonts.body.fontWeight,
    },
    thin: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Regular' : typography.fonts.body.fontFamily,
      fontWeight: typography.fonts.body.fontWeight,
    },
    // Add missing MD3-compatible variant to prevent runtime errors when components request it
    bodyMedium: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Regular' : typography.fonts.body.fontFamily,
      fontWeight: typography.fonts.body.fontWeight,
    },
    bodySmall: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Regular' : typography.fonts.body.fontFamily,
      fontWeight: typography.fonts.body.fontWeight,
    },
    bodyLarge: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Regular' : typography.fonts.body.fontFamily,
      fontWeight: typography.fonts.body.fontWeight,
    },
    label: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Medium' : typography.fonts.caption.fontFamily,
      fontWeight: typography.fonts.caption.fontWeight,
    },
    labelLarge: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Medium' : typography.fonts.caption.fontFamily,
      fontWeight: typography.fonts.caption.fontWeight,
    },
    input: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Regular' : typography.fonts.body.fontFamily,
      fontWeight: typography.fonts.body.fontWeight,
    },
    button: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Bold' : typography.fonts.bodySemibold.fontFamily,
      fontWeight: typography.fonts.bodySemibold.fontWeight,
    },
    buttonSmall: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Bold' : typography.fonts.bodySemibold.fontFamily,
      fontWeight: typography.fonts.bodySemibold.fontWeight,
    },
    buttonLarge: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Bold' : typography.fonts.bodySemibold.fontFamily,
      fontWeight: typography.fonts.bodySemibold.fontWeight,
    },
    link: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Medium' : typography.fonts.bodySemibold.fontFamily,
      fontWeight: typography.fonts.bodySemibold.fontWeight,
    },
    caption: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Regular' : typography.fonts.caption.fontFamily,
      fontWeight: typography.fonts.caption.fontWeight,
    },
    error: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Medium' : typography.fonts.caption.fontFamily,
      fontWeight: typography.fonts.caption.fontWeight,
    },
    logo: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Bold' : typography.fonts.heading.fontFamily,
      fontWeight: typography.fonts.heading.fontWeight,
    },
    bold: {
      fontFamily: Platform.OS === 'android' ? 'Inter-Bold' : typography.fonts.heading.fontFamily,
      fontWeight: typography.fonts.heading.fontWeight,
    },
  },
  animation: {
    scale: 1.0,
  },
};
