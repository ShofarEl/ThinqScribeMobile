import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppLoader from './src/components/AppLoader';
import { AppLoadingProvider } from './src/context/AppLoadingContext';
import { AuthProvider, useAuth } from './src/context/MobileAuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { theme } from './src/styles/theme';

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
