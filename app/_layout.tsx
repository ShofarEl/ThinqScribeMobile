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
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="signin" options={{ headerShown: false }} />
              <Stack.Screen name="signup" options={{ headerShown: false }} />
              
              {/* Payment Screens */}
              <Stack.Screen name="payment-history" options={{ headerShown: false }} />
              <Stack.Screen name="payment-success" options={{ headerShown: false }} />
              <Stack.Screen name="payment-failed" options={{ headerShown: false }} />
              
              {/* Chat & Agreement Screens */}
              <Stack.Screen name="chat/[chatId]" options={{ headerShown: false }} />
              <Stack.Screen name="agreement/[agreementId]" options={{ headerShown: false }} />
              <Stack.Screen name="create-agreement" options={{ headerShown: false }} />
              
              {/* Other Screens */}
              <Stack.Screen name="writers" options={{ headerShown: false }} />
              <Stack.Screen name="profile-settings" options={{ headerShown: false }} />
              <Stack.Screen name="notifications" options={{ headerShown: false }} />
              
              {/* Legal & Support Screens */}
              <Stack.Screen name="about" options={{ headerShown: false }} />
              <Stack.Screen name="privacy" options={{ headerShown: false }} />
              <Stack.Screen name="terms" options={{ headerShown: false }} />
              <Stack.Screen name="support" options={{ headerShown: false }} />
              
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
