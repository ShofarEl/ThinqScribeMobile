import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/src/context/AuthContext';
import { AppLoadingProvider } from '@/src/context/AppLoadingContext';
import { NotificationProvider } from '@/src/context/NotificationContext';
import { SocketProvider } from '@/src/context/SocketContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AppLoadingProvider>
      <NotificationProvider>
        <AuthProvider>
          <SocketProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="signin" />
              <Stack.Screen name="signup" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </SocketProvider>
      </AuthProvider>
    </NotificationProvider>
  </AppLoadingProvider>
  );
}
