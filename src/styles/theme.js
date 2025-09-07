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
      fontFamily: typography.fonts.body.fontFamily,
      fontWeight: typography.fonts.body.fontWeight,
    },
    medium: {
      fontFamily: typography.fonts.bodySemibold.fontFamily,
      fontWeight: typography.fonts.bodySemibold.fontWeight,
    },
    light: {
      fontFamily: typography.fonts.body.fontFamily,
      fontWeight: typography.fonts.body.fontWeight,
    },
    thin: {
      fontFamily: typography.fonts.body.fontFamily,
      fontWeight: typography.fonts.body.fontWeight,
    },
    bodySmall: {
      fontFamily: typography.fonts.body.fontFamily,
      fontWeight: typography.fonts.body.fontWeight,
    },
    bodyLarge: {
      fontFamily: typography.fonts.body.fontFamily,
      fontWeight: typography.fonts.body.fontWeight,
    },
    label: {
      fontFamily: typography.fonts.caption.fontFamily,
      fontWeight: typography.fonts.caption.fontWeight,
    },
    labelLarge: {
      fontFamily: typography.fonts.caption.fontFamily,
      fontWeight: typography.fonts.caption.fontWeight,
    },
    input: {
      fontFamily: typography.fonts.body.fontFamily,
      fontWeight: typography.fonts.body.fontWeight,
    },
    button: {
      fontFamily: typography.fonts.bodySemibold.fontFamily,
      fontWeight: typography.fonts.bodySemibold.fontWeight,
    },
    buttonSmall: {
      fontFamily: typography.fonts.bodySemibold.fontFamily,
      fontWeight: typography.fonts.bodySemibold.fontWeight,
    },
    buttonLarge: {
      fontFamily: typography.fonts.bodySemibold.fontFamily,
      fontWeight: typography.fonts.bodySemibold.fontWeight,
    },
    link: {
      fontFamily: typography.fonts.bodySemibold.fontFamily,
      fontWeight: typography.fonts.bodySemibold.fontWeight,
    },
    caption: {
      fontFamily: typography.fonts.caption.fontFamily,
      fontWeight: typography.fonts.caption.fontWeight,
    },
    error: {
      fontFamily: typography.fonts.caption.fontFamily,
      fontWeight: typography.fonts.caption.fontWeight,
    },
    logo: {
      fontFamily: typography.fonts.heading.fontFamily,
      fontWeight: typography.fonts.heading.fontWeight,
    },
    bold: {
      fontFamily: typography.fonts.heading.fontFamily,
      fontWeight: typography.fonts.heading.fontWeight,
    },
  },
  animation: {
    scale: 1.0,
  },
};
