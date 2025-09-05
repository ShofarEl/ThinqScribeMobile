import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

/**
 * A custom card component with enhanced styling and touch feedback
 * Designed specifically for elderly users with larger touch targets and clear visual hierarchy
 */
const Card = ({
  title,
  subtitle,
  children,
  onPress,
  icon,
  rightContent,
  style,
  contentStyle,
  elevation = 2,
  disabled = false,
  compact = false,
  highlighted = false,
}) => {
  const theme = useTheme();
  
  const cardContent = (
    <>
      {(title || icon) && (
        <View style={styles.header}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <View style={styles.titleContainer}>
            {title && (
              <Text 
                style={[
                  styles.title, 
                  compact && styles.compactTitle,
                  { color: highlighted ? theme.colors.primary : theme.colors.text }
                ]}
                numberOfLines={2}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text 
                style={[
                  styles.subtitle, 
                  compact && styles.compactSubtitle,
                  { color: theme.colors.textSecondary }
                ]}
                numberOfLines={compact ? 1 : 2}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {rightContent && (
            <View style={styles.rightContent}>
              {rightContent}
            </View>
          )}
        </View>
      )}
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </>
  );

  const cardStyles = [
    styles.card,
    {
      backgroundColor: theme.colors.surface,
      borderColor: highlighted ? theme.colors.primary : theme.colors.border,
      shadowColor: theme.colors.text,
      elevation: elevation,
    },
    compact && styles.compactCard,
    highlighted && styles.highlightedCard,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={disabled}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{cardContent}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  compactCard: {
    marginVertical: 4,
    padding: 0,
  },
  highlightedCard: {
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  compactTitle: {
    fontSize: 16,
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  compactSubtitle: {
    fontSize: 12,
  },
  rightContent: {
    marginLeft: 8,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
});

export default Card;
