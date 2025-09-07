// ThinqScribe Design System
// Professional UI/UX design tokens for world-class mobile experience

import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Modern Color Palette - ThinqScribe Brand
export const colors = {
  // Primary Brand Colors - ThinqScribe Blue (#015382)
  primary: {
    50: '#E8F4F8',   // Lightest blue for backgrounds
    100: '#D1E9F1',  // Very light blue for subtle highlights
    200: '#A3D3E3',  // Light blue for hover states
    300: '#75BDD5',  // Medium light blue
    400: '#47A7C7',  // Medium blue
    500: '#015382',  // Main ThinqScribe brand blue - primary CTA color
    600: '#014A75',  // Darker blue for active states
    700: '#014168',  // Dark blue for emphasis
    800: '#01385B',  // Very dark blue
    900: '#012F4E',  // Darkest blue for headers
  },
  
  // Neutral Colors - Professional Slate Scale
  neutral: {
    50: '#F8FAFC',   // Main background
    100: '#F1F5F9',  // Card backgrounds
    200: '#E2E8F0',  // Borders and dividers
    300: '#CBD5E1',  // Disabled elements
    400: '#94A3B8',  // Muted text
    500: '#64748B',  // Secondary text
    600: '#475569',  // Body text
    700: '#334155',  // Strong text
    800: '#1E293B',  // Headings
    900: '#0F172A',  // Dark headings
  },
  
  // Semantic Colors
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#10B981',  // Main success color
    600: '#059669',  // Darker success
    700: '#047857',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',  // Main warning color
    600: '#D97706',
    700: '#B45309',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',  // Main error color
    600: '#DC2626',
    700: '#B91C1C',
  },
  
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',  // Main info color
    600: '#2563EB',
    700: '#1D4ED8',
  },
  
  // Premium Gradients
  gradients: {
    primary: ['#015382', '#014A75'],
    success: ['#10B981', '#059669'],
    premium: ['#015382', '#47A7C7'],
    sunset: ['#F59E0B', '#EF4444'],
    ocean: ['#015382', '#10B981'],
    thinqscribe: ['#015382', '#75BDD5'],
  },
  
  // Special Effects
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  glassmorphism: 'rgba(255, 255, 255, 0.1)',
};

// Professional Typography System
export const typography = {
  // Font Families - Modern System Fonts (Actually Works!)
  fonts: {
    heading: {
      fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'Roboto-Bold',
      fontWeight: '700',
    },
    subheading: {
      fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'Roboto-Medium',
      fontWeight: '600',
    },
    body: {
      fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'Roboto-Regular',
      fontWeight: '400',
    },
    bodySemibold: {
      fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'Roboto-Medium',
      fontWeight: '600',
    },
    mono: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'SpaceMono-Regular',
      fontWeight: 'normal',
    },
    caption: {
      fontFamily: Platform.OS === 'ios' ? 'Avenir-Book' : 'Roboto-Regular',
      fontWeight: '500',
    }
  },
  
  // Font Size Scale
  sizes: {
    xs: 12,    // Captions, fine print
    sm: 14,    // Small text, labels
    base: 16,  // Body text
    lg: 18,    // Large body text
    xl: 20,    // Small headings
    '2xl': 24, // Medium headings
    '3xl': 30, // Large headings
    '4xl': 36, // Display headings
    '5xl': 48, // Hero text
  },
  
  // Line Heights
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: -0.025,
    normal: 0,
    wide: 0.025,
  }
};

// Modern Shadow System - Premium Depth
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },
  
  premium: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  }
};

// Spacing System - Consistent 8pt Grid
export const spacing = {
  xs: 4,      // 0.25rem
  sm: 8,      // 0.5rem
  md: 12,     // 0.75rem
  base: 16,   // 1rem
  lg: 20,     // 1.25rem
  xl: 24,     // 1.5rem
  '2xl': 32,  // 2rem
  '3xl': 48,  // 3rem
  '4xl': 64,  // 4rem
  '5xl': 80,  // 5rem
};

// Border Radius System
export const borderRadius = {
  none: 0,
  sm: 4,      // Small elements
  md: 8,      // Cards, buttons
  lg: 12,     // Large cards
  xl: 16,     // Modals
  '2xl': 24,  // Hero elements
  full: 9999, // Circular
};

// Layout Breakpoints
export const breakpoints = {
  sm: 320,   // Small phones
  md: 375,   // Standard phones
  lg: 414,   // Large phones
  xl: 768,   // Tablets
};

// Component Sizing
export const sizing = {
  button: {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
  },
  
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 80,
  },
  
  icon: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  }
};

// Animation Values
export const animations = {
  timing: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  
  spring: {
    damping: 15,
    stiffness: 150,
  }
};

// Layout Helpers
export const layout = {
  screenWidth: width,
  screenHeight: height,
  
  // Container widths
  container: {
    sm: Math.min(width - 32, 640),
    md: Math.min(width - 32, 768),
    lg: Math.min(width - 32, 1024),
  },
  
  // Card grid
  cardGrid: {
    twoColumn: (width - 48) / 2, // 16px margin + 16px gap
    threeColumn: (width - 64) / 3,
  }
};

// Component Presets
export const presets = {
  // Card styles
  card: {
    default: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing.base,
      ...shadows.md,
    },
    
    premium: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      ...shadows.lg,
      borderWidth: 1,
      borderColor: colors.neutral[200],
    },
    
    glass: {
      backgroundColor: colors.glassmorphism,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.neutral[200],
      backdropFilter: 'blur(10px)',
    }
  },
  
  // Button styles
  button: {
    primary: {
      backgroundColor: colors.primary[500],
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      ...shadows.sm,
    },
    
    secondary: {
      backgroundColor: colors.neutral[100],
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderWidth: 1,
      borderColor: colors.neutral[200],
    }
  }
};

export default {
  colors,
  typography,
  shadows,
  spacing,
  borderRadius,
  breakpoints,
  sizing,
  animations,
  layout,
  presets,
};
