import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
    <GestureHandlerRootView style={{ flex: 1 }} enable={true}>
      <NavigationContainer>
        {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        <StatusBar style="auto" />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

// Root component with all providers
export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
    'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
    'SpaceMono-Regular': require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return <AppLoader />;
  }

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
