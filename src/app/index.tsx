import { useAuth } from '@/src/context/MobileAuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // If user is already authenticated, redirect to tabs
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading]);

  // Add console log to debug
  console.log('🏠 ROOT Index screen rendered', { isAuthenticated, loading });

  if (loading) {
    return (
      <LinearGradient
        colors={['#015382', '#017DB0']}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>ThinqScribe</Text>
          <Text style={styles.subtitle}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#015382', '#017DB0']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>ThinqScribe</Text>
        <Text style={styles.subtitle}>Academic Excellence Platform</Text>
        
        <View style={styles.buttonContainer}>
          <Link href="./signin" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="./signup" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </LinearGradient>
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
