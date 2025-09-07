import { useAuth } from '@/src/context/MobileAuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotFoundScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If user is authenticated, redirect to tabs instead of showing not found
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)');
    } else if (!isLoading && !isAuthenticated) {
      // If not authenticated, redirect to main landing page
      router.replace('/');
    }
  }, [isAuthenticated, isLoading]);

  return (
    <>
      <Stack.Screen options={{ title: 'ThinqScribe', headerShown: false }} />
      <LinearGradient
        colors={['#015382', '#017DB0']}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Oops!</Text>
          <Text style={styles.subtitle}>This page could not be found.</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.buttonText}>Go to Home</Text>
            </TouchableOpacity>
            
            {!isAuthenticated && (
              <TouchableOpacity 
                style={styles.button}
                onPress={() => router.push('./signin')}
              >
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 60,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 16,
    width: '100%',
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
