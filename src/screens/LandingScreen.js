// ThinqScribe/src/screens/LandingScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const LandingScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#015382', '#017DB0']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="school" size={48} color="white" />
            </View>
            <Text style={styles.logoText}>ThinqScribe</Text>
            <Text style={styles.tagline}>Academic Excellence Platform</Text>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <View style={styles.feature}>
              <Ionicons name="people-outline" size={24} color="white" />
              <Text style={styles.featureText}>Connect with Expert Writers</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="document-text-outline" size={24} color="white" />
              <Text style={styles.featureText}>High-Quality Academic Work</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="shield-checkmark-outline" size={24} color="white" />
              <Text style={styles.featureText}>Secure & Reliable Platform</Text>
            </View>
          </View>

          {/* CTA Buttons */}
          <View style={styles.buttonsSection}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/signin')}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>
              <Ionicons name="arrow-forward" size={20} color="#015382" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/signup')}
            >
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Join thousands of students and writers achieving academic excellence
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  featuresSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 12,
    fontWeight: '500',
  },
  buttonsSection: {
    gap: 12,
    marginTop: 40,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#015382',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LandingScreen;