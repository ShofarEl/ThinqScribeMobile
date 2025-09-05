import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider } from '@/src/context/AuthContext';
import { AppLoadingProvider } from '@/src/context/AppLoadingContext';
import { NotificationProvider } from '@/src/context/NotificationContext';
import { SocketProvider } from '@/src/context/SocketContext';

export default function RootLayout() {
  return (
    <AppLoadingProvider>
      <NotificationProvider>
        <AuthProvider>
          <SocketProvider>
            <Stack 
              screenOptions={{ 
                headerShown: false,
                animation: 'none'
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
              <Stack.Screen name="audio-call" />
              <Stack.Screen name="about" />
              <Stack.Screen name="notifications" />
              <Stack.Screen name="privacy" />
              <Stack.Screen name="terms" />
              <Stack.Screen name="support" />
              <Stack.Screen name="+not-found" />
              <Stack.Screen name="[...missing]" />
            </Stack>
          </SocketProvider>
        </AuthProvider>
      </NotificationProvider>
    </AppLoadingProvider>
  );
}
