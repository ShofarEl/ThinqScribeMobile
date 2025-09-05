import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { theme } from './src/styles/theme';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { AppLoadingProvider } from './src/context/AppLoadingContext';
import AppLoader from './src/components/AppLoader';

// Main navigation container that handles auth state
const AppNavigationContainer = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
      <StatusBar style="auto" />
    </NavigationContainer>
  );
};

// Root component with all providers
export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <NotificationProvider>
            <AppLoadingProvider>
              <AppNavigationContainer />
            </AppLoadingProvider>
          </NotificationProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
