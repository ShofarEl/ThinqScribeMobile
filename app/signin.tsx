// Mobile-Optimized Sign In Screen for ThinqScribe
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Button, Card, Checkbox, TextInput } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/context/MobileAuthContext';
import { colors, typography } from '../src/styles/designSystem';

const { width, height } = Dimensions.get('window');

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const SignInScreen: React.FC = () => {
  const { signIn, isLoading, biometricSettings, authenticateWithBiometric } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);
  const shakeAnimation = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    cardScale.value = withSpring(1, { damping: 15 });
    cardOpacity.value = withTiming(1, { duration: 500 });
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Shake animation for validation errors
      shakeAnimation.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      await signIn(formData);

      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Sign in failed. Please try again.';
      setErrors({ general: errorMessage });
      
      // Error haptic feedback and shake animation
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shakeAnimation.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBiometricSignIn = async () => {
    try {
      const success = await authenticateWithBiometric();
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Enter your email address and we\'ll send you a password reset link.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reset Link',
          onPress: () => {
            // TODO: Implement forgot password functionality
            Alert.alert('Success', 'Password reset link sent to your email.');
          }
        }
      ]
    );
  };

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: cardScale.value },
        { translateX: shakeAnimation.value }
      ],
      opacity: cardOpacity.value,
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            {/* Decorative Background Elements */}
            <View style={styles.decorativeContainer}>
              <View style={styles.circle1} />
              <View style={styles.circle2} />
              <View style={styles.circle3} />
            </View>

            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../assets/images/Thinq-Scribe.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <View style={styles.logoUnderline} />
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to access your dashboard and continue your academic journey</Text>
            </View>

            {/* Sign In Form */}
            <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
              <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  {/* General Error */}
                  {errors.general && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{errors.general}</Text>
                    </View>
                  )}

                  {/* Email Input */}
                  <TextInput
                    label="Email Address"
                    value={formData.email}
                    onChangeText={(text) => {
                      setFormData({ ...formData, email: text });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={!!errors.email}
                    style={styles.input}
                    theme={styles.inputTheme}
                    left={<TextInput.Icon icon="email" />}
                  />
                  {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}

                  {/* Password Input */}
                  <TextInput
                    label="Password"
                    value={formData.password}
                    onChangeText={(text) => {
                      setFormData({ ...formData, password: text });
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    error={!!errors.password}
                    style={styles.input}
                    theme={styles.inputTheme}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                  />
                  {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}

                  {/* Remember Me & Forgot Password */}
                  <View style={styles.optionsRow}>
                    <View style={styles.checkboxRow}>
                      <Checkbox
                        status={formData.rememberMe ? 'checked' : 'unchecked'}
                        onPress={() => setFormData({ ...formData, rememberMe: !formData.rememberMe })}
                        theme={styles.checkboxTheme}
                      />
                      <Text style={styles.checkboxLabel}>Remember me</Text>
                    </View>
                    <Button
                      mode="text"
                      onPress={handleForgotPassword}
                      style={styles.forgotButton}
                      labelStyle={styles.forgotButtonText}
                    >
                      Forgot Password?
                    </Button>
                  </View>

                  {/* Sign In Button */}
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting || isLoading}
                    style={styles.signInButton}
                    contentStyle={styles.signInButtonContent}
                    labelStyle={styles.signInButtonText}
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </Button>

                  {/* Biometric Authentication */}
                  {biometricSettings.enabled && (
                    <>
                      <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                      </View>

                      <Button
                        mode="outlined"
                        onPress={handleBiometricSignIn}
                        style={styles.biometricButton}
                        icon={biometricSettings.type === 'face' ? 'face-recognition' : 'fingerprint'}
                      >
                        Sign in with {biometricSettings.type === 'face' ? 'Face ID' : 'Fingerprint'}
                      </Button>
                    </>
                  )}

                  {/* Sign Up Link */}
                  <View style={styles.signUpContainer}>
                    <Text style={styles.signUpText}>Don't have an account? </Text>
                    <Button
                      mode="text"
                      onPress={() => router.push('/signup')}
                      style={styles.signUpButton}
                      labelStyle={styles.signUpButtonText}
                    >
                      Sign Up
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: '#f0f8ff', // Light blue background
    position: 'relative',
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
    zIndex: 1,
    position: 'relative',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 200,
    height: 60,
    marginBottom: 8,
  },
  logoUnderline: {
    width: 60,
    height: 4,
    backgroundColor: colors.primary[500],
    borderRadius: 2,
    marginTop: 8,
  },
  title: {
    fontFamily: typography.fonts.subheading.fontFamily,
    fontWeight: '600' as const,
    fontSize: typography.sizes['3xl'],
    color: colors.primary[500],
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: typography.fonts.body.fontFamily,
    fontWeight: '400' as const,
    fontSize: typography.sizes.base,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.sizes.base,
    paddingHorizontal: 20,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
    position: 'relative',
  },
  card: {
    borderRadius: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    backgroundColor: '#ffffff',
  },
  cardContent: {
    padding: 28,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    fontWeight: Platform.OS === 'ios' ? '500' : '500',
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  inputTheme: {
    colors: {
      primary: '#015382',
      onSurfaceVariant: '#015382',
      outline: '#015382',
      surface: '#ffffff',
      onSurface: '#333333',
      onSurfaceDisabled: '#999999',
    },
  } as any,
  fieldError: {
    color: '#f44336',
    fontSize: 12,
    fontWeight: Platform.OS === 'ios' ? '500' : '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: Platform.OS === 'ios' ? '500' : '500',
    color: '#015382',
  },
  checkboxTheme: {
    colors: {
      primary: '#015382',
      onSurface: '#015382',
      surface: '#ffffff',
    },
  } as any,
  forgotButton: {
    marginLeft: 'auto',
  },
  forgotButtonText: {
    color: '#015382',
    fontSize: 14,
    fontWeight: Platform.OS === 'ios' ? '600' : '600',
  },
  signInButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#015382',
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: Platform.OS === 'ios' ? '600' : '600',
  },
  signInButtonContent: {
    paddingVertical: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 12,
    fontWeight: Platform.OS === 'ios' ? '500' : '500',
  },
  biometricButton: {
    borderRadius: 12,
    borderColor: '#015382',
    borderWidth: 2,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signUpText: {
    fontSize: 14,
    fontWeight: Platform.OS === 'ios' ? '500' : '500',
    color: '#015382',
  },
  signUpButton: {
    marginLeft: -8,
  },
  signUpButtonText: {
    color: '#015382',
    fontSize: 14,
    fontWeight: Platform.OS === 'ios' ? '600' : '600',
  },
});

export default SignInScreen;