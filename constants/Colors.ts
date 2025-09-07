/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const primaryColor = '#015382';
const secondaryColor = '#017DB0';
const accentColor = '#FFB400';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#4A5568',
    textLight: '#FFFFFF',
    background: '#FFFFFF',
    backgroundSecondary: '#F7F9FC',
    tint: primaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: primaryColor,
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    border: '#E2E8F0',
    cardBackground: '#FFFFFF',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#A0AEC0',
    textLight: '#FFFFFF',
    background: '#151718',
    backgroundSecondary: '#1E2022',
    tint: secondaryColor,
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: secondaryColor,
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    border: '#2D3748',
    cardBackground: '#1A202C',
  },
};
