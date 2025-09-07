// Professional Font Configuration for ThinqScribe
// System fonts with proper weight hierarchy

import { Platform } from 'react-native';

export const fonts = {
  // Font Families - Platform Optimized
  regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
  medium: Platform.OS === 'ios' ? 'System' : 'Roboto', 
  semiBold: Platform.OS === 'ios' ? 'System' : 'Roboto',
  bold: Platform.OS === 'ios' ? 'System' : 'Roboto',

  // Font Weights - Platform Optimized
  weights: {
    regular: Platform.OS === 'ios' ? '400' : 'normal',
    medium: Platform.OS === 'ios' ? '500' : '500',
    semiBold: Platform.OS === 'ios' ? '600' : '600',
    bold: Platform.OS === 'ios' ? '700' : 'bold',
  },

  // Font Sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },

  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

// Typography Styles
export const typography = {
  // Headers
  h1: {
    fontFamily: fonts.bold,
    fontWeight: fonts.weights.bold,
    fontSize: fonts.sizes['5xl'],
    lineHeight: fonts.lineHeights.tight,
    letterSpacing: fonts.letterSpacing.tight,
  },
  h2: {
    fontFamily: fonts.bold,
    fontWeight: fonts.weights.bold,
    fontSize: fonts.sizes['4xl'],
    lineHeight: fonts.lineHeights.tight,
    letterSpacing: fonts.letterSpacing.tight,
  },
  h3: {
    fontFamily: fonts.semiBold,
    fontWeight: fonts.weights.semiBold,
    fontSize: fonts.sizes['3xl'],
    lineHeight: fonts.lineHeights.normal,
    letterSpacing: fonts.letterSpacing.normal,
  },
  h4: {
    fontFamily: fonts.semiBold,
    fontWeight: fonts.weights.semiBold,
    fontSize: fonts.sizes['2xl'],
    lineHeight: fonts.lineHeights.normal,
    letterSpacing: fonts.letterSpacing.normal,
  },
  h5: {
    fontFamily: fonts.semiBold,
    fontWeight: fonts.weights.semiBold,
    fontSize: fonts.sizes.xl,
    lineHeight: fonts.lineHeights.normal,
    letterSpacing: fonts.letterSpacing.normal,
  },
  h6: {
    fontFamily: fonts.semiBold,
    fontWeight: fonts.weights.semiBold,
    fontSize: fonts.sizes.lg,
    lineHeight: fonts.lineHeights.normal,
    letterSpacing: fonts.letterSpacing.normal,
  },

  // Body Text
  body: {
    fontFamily: fonts.regular,
    fontWeight: fonts.weights.regular,
    fontSize: fonts.sizes.base,
    lineHeight: fonts.lineHeights.relaxed,
    letterSpacing: fonts.letterSpacing.normal,
  },
  bodySmall: {
    fontFamily: fonts.regular,
    fontWeight: fonts.weights.regular,
    fontSize: fonts.sizes.sm,
    lineHeight: fonts.lineHeights.normal,
    letterSpacing: fonts.letterSpacing.normal,
  },
  bodyLarge: {
    fontFamily: fonts.regular,
    fontWeight: fonts.weights.regular,
    fontSize: fonts.sizes.lg,
    lineHeight: fonts.lineHeights.relaxed,
    letterSpacing: fonts.letterSpacing.normal,
  },

  // Labels and Form Elements
  label: {
    fontFamily: fonts.medium,
    fontWeight: fonts.weights.medium,
    fontSize: fonts.sizes.sm,
    lineHeight: fonts.lineHeights.normal,
    letterSpacing: fonts.letterSpacing.normal,
  },
  labelLarge: {
    fontFamily: fonts.medium,
    fontWeight: fonts.weights.medium,
    fontSize: fonts.sizes.lg,
    lineHeight: fonts.lineHeights.normal,
    letterSpacing: fonts.letterSpacing.normal,
  },
  input: {
    fontFamily: fonts.regular,
    fontWeight: fonts.weights.regular,
    fontSize: fonts.sizes.base,
    lineHeight: fonts.lineHeights.normal,
    letterSpacing: fonts.letterSpacing.normal,
  },

  // Buttons
  button: {
    fontFamily: fonts.semiBold,
    fontWeight: fonts.weights.semiBold,
    fontSize: fonts.sizes.base,
    lineHeight: fonts.lineHeights.normal,
    letterSpacing: fonts.letterSpacing.normal,
  },
  buttonSmall: {
    fontFamily: fonts.semiBold,
    fontWeight: fonts.weights.semiBold,
    fontSize: fonts.sizes.sm,
    lineHeight: fonts.lineHeights.normal,
    letterSpacing: fonts.letterSpacing.normal,
  },
  buttonLarge: {
    fontFamily: fonts.semiBold,
    fontWeight: fonts.weights.semiBold,
    fontSize: fonts.sizes.lg,
    lineHeight: fonts.lineHeights.normal,
    letterSpacing: fonts.letterSpacing.normal,
  },

  // Links
  link: {
    fontFamily: fonts.semiBold,
    fontWeight: fonts.weights.semiBold,
    fontSize: fonts.sizes.sm,
    lineHeight: fonts.lineHeights.normal,
    letterSpacing: fonts.letterSpacing.normal,
  },

  // Captions and Small Text
  caption: {
    fontFamily: fonts.medium,
    fontWeight: fonts.weights.medium,
    fontSize: fonts.sizes.xs,
    lineHeight: fonts.lineHeights.normal,
    letterSpacing: fonts.letterSpacing.normal,
  },

  // Error Text
  error: {
    fontFamily: fonts.medium,
    fontWeight: fonts.weights.medium,
    fontSize: fonts.sizes.xs,
    lineHeight: fonts.lineHeights.normal,
    letterSpacing: fonts.letterSpacing.normal,
  },

  // Logo and Brand
  logo: {
    fontFamily: fonts.bold,
    fontWeight: fonts.weights.bold,
    fontSize: fonts.sizes['5xl'],
    lineHeight: fonts.lineHeights.tight,
    letterSpacing: fonts.letterSpacing.wide,
  },
};

// Color combinations for different text types
export const textColors = {
  primary: '#015382',      // Brand color for headers, buttons, links
  secondary: '#2C3E50',    // Dark gray for body text
  tertiary: '#5A6C7D',     // Medium gray for secondary text
  muted: '#95A5A6',        // Light gray for captions, placeholders
  error: '#f44336',        // Red for error messages
  success: '#4CAF50',      // Green for success messages
  warning: '#FF9800',      // Orange for warnings
  white: '#ffffff',        // White text for dark backgrounds
};

export default {
  fonts,
  typography,
  textColors,
};
