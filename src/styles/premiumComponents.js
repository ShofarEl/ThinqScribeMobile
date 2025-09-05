// Premium Component Styles
// World-class UI components for ThinqScribe mobile app

import { StyleSheet } from 'react-native';
import { colors, typography, shadows, spacing, borderRadius, layout } from './designSystem';

// Premium Card Styles
export const premiumCards = StyleSheet.create({
  // Main container cards
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.base,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  
  // Statistics cards with gradient borders - Web version inspired
  statCard: {
    backgroundColor: colors.white,
    borderRadius: 16, // Match web version border radius
    padding: 16, // Adjusted padding for better mobile layout
    margin: 0, // Remove margin, handled by container
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    minHeight: 100, // Reasonable height for mobile
    maxHeight: 120, // Prevent cards from being too tall
    justifyContent: 'space-between',
    // Add subtle background pattern like web version
    overflow: 'hidden',
  },
  
  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  
  statCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success[500],
  },
  
  statCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning[500],
  },
  
  statCardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: colors.info[500],
  },
  
  // Project cards with enhanced styling
  projectCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.base,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  
  projectCardActive: {
    borderColor: colors.primary[200],
    ...shadows.lg,
  },
  
  projectCardPending: {
    borderColor: colors.warning[200],
    backgroundColor: colors.warning[50],
  },
  
  projectCardCompleted: {
    borderColor: colors.success[200],
    backgroundColor: colors.success[50],
  },
  
  // Writer/Student profile cards
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.base,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Glass morphism cards
  glassCard: {
    backgroundColor: colors.glassmorphism,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    overflow: 'hidden',
  },
});

// Premium Typography Styles
export const premiumText = StyleSheet.create({
  // Headings
  displayLarge: {
    ...typography.fonts.heading,
    fontSize: typography.sizes['4xl'],
    color: colors.neutral[900],
    lineHeight: typography.sizes['4xl'] * 1.2,
    letterSpacing: typography.letterSpacing.tight,
  },
  
  displayMedium: {
    ...typography.fonts.heading,
    fontSize: typography.sizes['3xl'],
    color: colors.neutral[900],
    lineHeight: typography.sizes['3xl'] * 1.2,
  },
  
  headingLarge: {
    ...typography.fonts.heading,
    fontSize: typography.sizes['2xl'],
    color: colors.neutral[800],
    lineHeight: typography.sizes['2xl'] * 1.3,
  },
  
  headingMedium: {
    ...typography.fonts.subheading,
    fontSize: typography.sizes.xl,
    color: colors.neutral[800],
    lineHeight: typography.sizes.xl * 1.4,
  },
  
  headingSmall: {
    ...typography.fonts.subheading,
    fontSize: typography.sizes.lg,
    color: colors.neutral[700],
    lineHeight: typography.sizes.lg * 1.4,
  },
  
  // Body text
  bodyLarge: {
    ...typography.fonts.body,
    fontSize: typography.sizes.lg,
    color: colors.neutral[600],
    lineHeight: typography.sizes.lg * 1.5,
  },
  
  bodyMedium: {
    ...typography.fonts.body,
    fontSize: typography.sizes.base,
    color: colors.neutral[600],
    lineHeight: typography.sizes.base * 1.5,
  },
  
  bodySmall: {
    ...typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.neutral[500],
    lineHeight: typography.sizes.sm * 1.5,
  },
  
  // Specialized text
  caption: {
    ...typography.fonts.caption,
    fontSize: typography.sizes.xs,
    color: colors.neutral[400],
    lineHeight: typography.sizes.xs * 1.5, // Better line height
    letterSpacing: 0.2,
  },
  
  overline: {
    ...typography.fonts.caption,
    fontSize: 11, // Slightly larger for better readability
    color: colors.neutral[500], // Slightly darker for better contrast
    textTransform: 'uppercase',
    letterSpacing: 0.8, // More letter spacing for readability
    lineHeight: 14,
    fontWeight: '600',
  },
  
  // Numbers and money
  currency: {
    ...typography.fonts.mono,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.success[600],
  },
  
  currencyLarge: {
    ...typography.fonts.mono,
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.success[600],
  },
  
  // Status text
  textSuccess: {
    color: colors.success[600],
  },
  
  textWarning: {
    color: colors.warning[600],
  },
  
  textError: {
    color: colors.error[600],
  },
  
  textInfo: {
    color: colors.info[600],
  },
  
  textPrimary: {
    color: colors.primary[600],
  },
  
  textMuted: {
    color: colors.neutral[400],
  },
});

// Premium Button Styles
export const premiumButtons = StyleSheet.create({
  // Primary buttons
  primary: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  
  primaryLarge: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    ...shadows.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  
  // Secondary buttons
  secondary: {
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  
  // Success buttons
  success: {
    backgroundColor: colors.success[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  
  // Warning buttons
  warning: {
    backgroundColor: colors.warning[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  
  // Outline buttons
  outline: {
    backgroundColor: colors.transparent,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  
  // Ghost buttons
  ghost: {
    backgroundColor: colors.transparent,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  
  // Button text styles
  buttonTextPrimary: {
    ...typography.fonts.bodySemibold,
    fontSize: typography.sizes.base,
    color: colors.white,
  },
  
  buttonTextSecondary: {
    ...typography.fonts.bodySemibold,
    fontSize: typography.sizes.base,
    color: colors.neutral[700],
  },
  
  buttonTextOutline: {
    ...typography.fonts.bodySemibold,
    fontSize: typography.sizes.base,
    color: colors.primary[600],
  },
  
  buttonTextGhost: {
    ...typography.fonts.bodySemibold,
    fontSize: typography.sizes.base,
    color: colors.neutral[600],
  },
});

// Premium Status Indicators
export const premiumStatus = StyleSheet.create({
  // Status badges
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  badgeSuccess: {
    backgroundColor: colors.success[100],
  },
  
  badgeWarning: {
    backgroundColor: colors.warning[100],
  },
  
  badgeError: {
    backgroundColor: colors.error[100],
  },
  
  badgeInfo: {
    backgroundColor: colors.info[100],
  },
  
  badgePrimary: {
    backgroundColor: colors.primary[100],
  },
  
  badgeNeutral: {
    backgroundColor: colors.neutral[100],
  },
  
  // Badge text
  badgeText: {
    ...typography.fonts.caption,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  
  badgeTextSuccess: {
    color: colors.success[700],
  },
  
  badgeTextWarning: {
    color: colors.warning[700],
  },
  
  badgeTextError: {
    color: colors.error[700],
  },
  
  badgeTextInfo: {
    color: colors.info[700],
  },
  
  badgeTextPrimary: {
    color: colors.primary[700],
  },
  
  badgeTextNeutral: {
    color: colors.neutral[700],
  },
});

// Progress Indicators
export const premiumProgress = StyleSheet.create({
  progressContainer: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  
  progressBarPrimary: {
    backgroundColor: colors.primary[500],
  },
  
  progressBarSuccess: {
    backgroundColor: colors.success[500],
  },
  
  progressBarWarning: {
    backgroundColor: colors.warning[500],
  },
  
  // Circular progress
  circularProgress: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.neutral[200],
  },
});

// Avatar Styles
export const premiumAvatars = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    overflow: 'hidden',
  },
  
  small: {
    width: 32,
    height: 32,
  },
  
  medium: {
    width: 40,
    height: 40,
  },
  
  large: {
    width: 48,
    height: 48,
  },
  
  extraLarge: {
    width: 64,
    height: 64,
  },
  
  // Avatar with status indicator
  withStatus: {
    position: 'relative',
  },
  
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.white,
  },
  
  statusOnline: {
    backgroundColor: colors.success[500],
  },
  
  statusBusy: {
    backgroundColor: colors.warning[500],
  },
  
  statusOffline: {
    backgroundColor: colors.neutral[400],
  },
});

// Layout helpers
export const premiumLayout = StyleSheet.create({
  // Screen containers
  screen: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  
  screenPadding: {
    paddingHorizontal: spacing.base,
  },
  
  // Section containers
  section: {
    marginVertical: spacing.base,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.base,
  },
  
  // Grid layouts
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  
  gridItem: {
    paddingHorizontal: spacing.xs,
  },
  
  twoColumn: {
    width: '50%',
  },
  
  threeColumn: {
    width: '33.333%',
  },
  
  // Spacing utilities
  marginXs: { margin: spacing.xs },
  marginSm: { margin: spacing.sm },
  marginMd: { margin: spacing.md },
  marginLg: { margin: spacing.lg },
  marginXl: { margin: spacing.xl },
  
  paddingXs: { padding: spacing.xs },
  paddingSm: { padding: spacing.sm },
  paddingMd: { padding: spacing.md },
  paddingLg: { padding: spacing.lg },
  paddingXl: { padding: spacing.xl },
});

export default {
  premiumCards,
  premiumText,
  premiumButtons,
  premiumStatus,
  premiumProgress,
  premiumAvatars,
  premiumLayout,
};
