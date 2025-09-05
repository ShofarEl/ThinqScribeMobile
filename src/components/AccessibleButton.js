import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';

/**
 * Accessible Button component designed for elderly users
 * Features:
 * - Larger touch target (min 48x48)
 * - High contrast options
 * - Clear visual feedback
 * - Optional icon support
 * - Loading state
 */
const AccessibleButton = ({
  onPress,
  title,
  icon,
  variant = 'filled', // 'filled', 'outlined', 'text'
  size = 'medium', // 'small', 'medium', 'large'
  color,
  textColor,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  iconPosition = 'left', // 'left', 'right'
  highContrast = false,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  
  // Determine colors based on variant and provided props
  const getBackgroundColor = () => {
    if (disabled) return '#E5E7EB';
    if (variant === 'filled') {
      return color || theme.colors.primary;
    }
    return 'transparent';
  };
  
  const getTextColor = () => {
    if (disabled) return '#9CA3AF';
    if (textColor) return textColor;
    if (variant === 'filled') {
      return '#FFFFFF';
    }
    return color || theme.colors.primary;
  };
  
  const getBorderColor = () => {
    if (disabled) return '#E5E7EB';
    if (variant === 'outlined') {
      return color || theme.colors.primary;
    }
    return 'transparent';
  };
  
  // Determine sizing
  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 20 };
    }
  };
  
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outlined' ? 2 : 0,
          ...getPadding(),
        },
        fullWidth && styles.fullWidth,
        highContrast && styles.highContrast,
        style,
      ]}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size={size === 'small' ? 16 : 20} />
      ) : (
        <View style={[
          styles.contentContainer,
          iconPosition === 'right' && styles.reverseContent,
        ]}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconContainer}>
              {icon}
            </View>
          )}
          
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
                fontWeight: '600',
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          
          {icon && iconPosition === 'right' && (
            <View style={styles.iconContainer}>
              {icon}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48, // Minimum touch target size for accessibility
    minWidth: 48,
  },
  fullWidth: {
    width: '100%',
  },
  highContrast: {
    borderWidth: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reverseContent: {
    flexDirection: 'row-reverse',
  },
  text: {
    textAlign: 'center',
  },
  iconContainer: {
    marginHorizontal: 8,
  },
});

export default AccessibleButton;
