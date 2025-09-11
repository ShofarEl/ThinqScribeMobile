import { AppLoadingProvider } from '@/src/context/AppLoadingContext';
import { NotificationProvider } from '@/src/context/NotificationContext';
import { SocketProvider } from '@/src/context/SocketContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '../src/context/MobileAuthContext';
import { TabVisibilityProvider } from '../src/context/TabVisibilityContext';
import { theme } from '../src/styles/theme';

export default function RootLayout() {
  // Load only the fonts we actually need
  const [loaded] = useFonts({
    // Roboto fonts for Android
    'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
    // SpaceMono for code
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <AppLoadingProvider>
          <NotificationProvider>
            <SocketProvider>
              <TabVisibilityProvider>
              <Stack 
                screenOptions={{ 
                  headerShown: false,
                  animation: 'slide_from_right'
                }}
                initialRouteName="index"
              >
                <Stack.Screen 
                  name="index" 
                  options={{ 
                    title: 'ThinqScribe'
                  }} 
                />
                <Stack.Screen name="signin" />
                <Stack.Screen name="signup" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="chat/[chatId]" />
                <Stack.Screen name="writers" />
                <Stack.Screen name="create-agreement" />
                <Stack.Screen name="profile-settings" />
                <Stack.Screen name="audio-call" />
                <Stack.Screen name="about" />
                <Stack.Screen name="notifications" />
                <Stack.Screen name="privacy" />
                <Stack.Screen name="terms" />
                <Stack.Screen name="support" />
                <Stack.Screen name="agreement/[agreementId]" />
                <Stack.Screen name="payment-success" />
                <Stack.Screen name="payment-failed" />
                <Stack.Screen name="+not-found" />
                <Stack.Screen name="[...missing]" />
              </Stack>
              <Toast />
              </TabVisibilityProvider>
            </SocketProvider>
          </NotificationProvider>
        </AppLoadingProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
