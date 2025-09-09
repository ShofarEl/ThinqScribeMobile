import React from 'react';
import { Text, TextProps, Platform } from 'react-native';

interface CustomTextProps extends TextProps {
  style?: any;
  children: React.ReactNode;
}

export function CustomText({ style, children, ...props }: CustomTextProps) {
  // Use system fonts that resemble Abril Fatface
  const fontFamily = Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'serif'
  });

  return (
    <Text 
      {...props} 
      style={[
        { 
          fontFamily, 
          fontWeight: '700',
          letterSpacing: 0.5
        }, 
        style
      ]}
    >
      {children}
    </Text>
  );
}
