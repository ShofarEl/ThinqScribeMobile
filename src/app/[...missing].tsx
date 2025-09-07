import { useRouter } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/src/context/AuthContext';
import { useEffect } from 'react';

export default function CatchAllScreen() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Automatically redirect based on auth state
    if (!loading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/');
      }
    }
  }, [isAuthenticated, loading]);

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
        <Text style={styles.subtitle}>Redirecting...</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.buttonText}>Go to Home</Text>
          </TouchableOpacity>
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
