// ThinqScribe/src/navigation/AuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from '../screens/LandingScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: false 
      }}
    >
      <Stack.Screen 
        name="Landing" 
        component={LandingScreen} 
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;