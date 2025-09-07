import React from 'react';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

// Keep props loose to avoid tight coupling to @react-navigation packages
export function HapticTab(props: any) {
  return (
    <Pressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
