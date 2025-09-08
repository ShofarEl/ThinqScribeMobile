import { useAuth } from '@/src/context/MobileAuthContext';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, typography } from '../src/styles/designSystem';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // If user is already authenticated, redirect to tabs
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading]);

  // Add console log to debug
  console.log('🏠 ROOT Index screen rendered', { isAuthenticated, isLoading });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        {/* Decorative Background Elements */}
        <View style={styles.decorativeContainer}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>
        <View style={styles.content}>
          <Image 
            source={require('../assets/images/Thinq-Scribe.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={[styles.subtitle, { marginBottom: 0 }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Decorative Background Elements */}
      <View style={styles.decorativeContainer}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>
      <View style={styles.content}>
        <Image 
          source={require('../assets/images/Thinq-Scribe.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff', // Light blue background
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoImage: {
    width: 200,
    height: 60,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: typography.fonts.body.fontFamily,
    fontWeight: '400' as const,
    fontSize: typography.sizes.base,
    color: colors.neutral[500],
    marginBottom: 60,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.sizes.base,
  },
  buttonContainer: {
    gap: 16,
    width: '100%',
  },
  button: {
    backgroundColor: colors.primary[500],
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: colors.primary[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontFamily: typography.fonts.bodySemibold.fontFamily,
    fontWeight: '600' as const,
    color: colors.white,
    fontSize: typography.sizes.lg,
    textAlign: 'center',
  },
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  circle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(1, 83, 130, 0.20)',
  },
  circle2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(1, 83, 130, 0.15)',
  },
  circle3: {
    position: 'absolute',
    top: '40%',
    right: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(1, 83, 130, 0.18)',
  },
});
