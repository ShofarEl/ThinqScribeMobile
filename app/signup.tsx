// Mobile-Optimized Sign Up Screen for ThinqScribe
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
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Card, SegmentedButtons, TextInput } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/context/MobileAuthContext';
import { colors, typography } from '../src/styles/designSystem';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'writer';
  referralCode: string;
  agreeToTerms: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const SignUpScreen: React.FC = () => {
  const { signUp, isLoading, location } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    referralCode: '',
    agreeToTerms: false,
  });
  
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Animation values
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 15 });
    cardOpacity.value = withTiming(1, { duration: 500 });
  }, []);

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep = (step: number) => {
    const newErrors: any = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    } else if (step === 2) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (step === 3) {
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      const signupData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(), // Combine firstName and lastName into name
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        referralCode: formData.referralCode || undefined,
        location: location ? {
          country: location.country,
          currency: location.currency,
          symbol: location.symbol,
        } : undefined,
      };

      await signUp(signupData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Welcome to ThinqScribe!',
        'Your account has been created successfully.',
        [{ text: 'Get Started', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error: any) {
      console.error('Sign up error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Sign up failed. Please try again.';
      setErrors({ general: errorMessage });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

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
              <Text style={styles.title}>Join Our Community</Text>
              <Text style={styles.subtitle}>Create your account and start your academic journey with expert writers</Text>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>Step {currentStep} of 3</Text>
            </View>

            <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
              <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  {errors.general && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{errors.general}</Text>
                    </View>
                  )}

                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <View style={styles.stepContainer}>
                      <Text style={styles.stepTitle}>Basic Information</Text>
                      <Text style={styles.stepSubtitle}>Tell us about yourself</Text>

                  <Text style={styles.sectionTitle}>I am a:</Text>
                  <SegmentedButtons
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as 'student' | 'writer' })}
                    buttons={[
                      { value: 'student', label: 'Student', icon: 'school' },
                      { value: 'writer', label: 'Writer', icon: 'pencil' },
                    ]}
                    style={styles.segmentedButtons}
                  />

                  <TextInput
                    label="First Name"
                    value={formData.firstName}
                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                    mode="outlined"
                    error={!!errors.firstName}
                    style={styles.input}
                        theme={styles.inputTheme}
                    left={<TextInput.Icon icon="account" />}
                  />
                  {errors.firstName && <Text style={styles.fieldError}>{errors.firstName}</Text>}

                      <TextInput
                        label="Last Name"
                        value={formData.lastName}
                        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                        mode="outlined"
                        error={!!errors.lastName}
                        style={styles.input}
                        theme={styles.inputTheme}
                        left={<TextInput.Icon icon="account" />}
                      />
                  {errors.lastName && <Text style={styles.fieldError}>{errors.lastName}</Text>}

                      <TextInput
                        label="Email Address"
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={!!errors.email}
                        style={styles.input}
                        theme={styles.inputTheme}
                        left={<TextInput.Icon icon="email" />}
                      />
                  {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
                    </View>
                  )}

                  {/* Step 2: Security */}
                  {currentStep === 2 && (
                    <View style={styles.stepContainer}>
                      <Text style={styles.stepTitle}>Security</Text>
                      <Text style={styles.stepSubtitle}>Create a secure password</Text>

                      <TextInput
                        label="Password"
                        value={formData.password}
                        onChangeText={(text) => setFormData({ ...formData, password: text })}
                        mode="outlined"
                        secureTextEntry={!showPassword}
                        error={!!errors.password}
                        style={styles.input}
                        theme={styles.inputTheme}
                        left={<TextInput.Icon icon="lock" />}
                        right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} />}
                      />
                  {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}

                      <TextInput
                        label="Confirm Password"
                        value={formData.confirmPassword}
                        onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                        mode="outlined"
                        secureTextEntry={!showConfirmPassword}
                        error={!!errors.confirmPassword}
                        style={styles.input}
                        theme={styles.inputTheme}
                        left={<TextInput.Icon icon="lock-check" />}
                        right={<TextInput.Icon icon={showConfirmPassword ? 'eye-off' : 'eye'} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
                      />
                  {errors.confirmPassword && <Text style={styles.fieldError}>{errors.confirmPassword}</Text>}

                      <TextInput
                        label="Referral Code (Optional)"
                        value={formData.referralCode}
                        onChangeText={(text) => setFormData({ ...formData, referralCode: text })}
                        mode="outlined"
                        style={styles.input}
                        theme={styles.inputTheme}
                        left={<TextInput.Icon icon="gift" />}
                      />
                    </View>
                  )}

                  {/* Step 3: Terms & Submit */}
                  {currentStep === 3 && (
                    <View style={styles.stepContainer}>
                      <Text style={styles.stepTitle}>Almost Done!</Text>
                      <Text style={styles.stepSubtitle}>Review and accept our terms</Text>

                      <View style={styles.termsContainer}>
                        <TouchableOpacity
                          onPress={() => setFormData({ ...formData, agreeToTerms: !formData.agreeToTerms })}
                          style={styles.checkbox}
                        >
                          {formData.agreeToTerms && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </TouchableOpacity>
                        <View style={styles.termsTextContainer}>
                          <Text style={styles.termsText}>I agree to the </Text>
                          <Button 
                            mode="text" 
                            onPress={() => router.push('/terms')} 
                            labelStyle={styles.linkText}
                            compact
                          >
                            Terms
                          </Button>
                          <Text style={styles.termsText}> and </Text>
                          <Button 
                            mode="text" 
                            onPress={() => router.push('/privacy')} 
                            labelStyle={styles.linkText}
                            compact
                          >
                            Privacy Policy
                          </Button>
                        </View>
                      </View>
                  {errors.agreeToTerms && <Text style={styles.fieldError}>{errors.agreeToTerms}</Text>}
                    </View>
                  )}

                  {/* Navigation Buttons */}
                  <View style={styles.navigationContainer}>
                    {currentStep > 1 && (
                      <Button
                        mode="outlined"
                        onPress={prevStep}
                        style={styles.navButton}
                        labelStyle={styles.navButtonText}
                      >
                        Back
                      </Button>
                    )}
                    
                    {currentStep < 3 ? (
                      <Button
                        mode="contained"
                        onPress={nextStep}
                        style={[styles.navButton, styles.nextButton]}
                        labelStyle={styles.nextButtonText}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={isSubmitting}
                        disabled={isSubmitting || isLoading}
                        style={[styles.navButton, styles.submitButton]}
                        labelStyle={styles.submitButtonText}
                      >
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    )}
                  </View>

                  <View style={styles.signInContainer}>
                    <Text style={styles.signInText}>Already have an account? </Text>
                    <Button mode="text" onPress={() => router.push('/signin')} labelStyle={styles.signInButtonText}>Sign In</Button>
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
  container: { flex: 1 },
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
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 },
  header: { 
    alignItems: 'center', 
    marginBottom: 30,
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
    marginBottom: 8 
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
  cardContent: { padding: 28 },
  errorContainer: { backgroundColor: '#ffebee', borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: { 
    color: '#c62828', 
    fontSize: 14, 
    fontWeight: Platform.OS === 'ios' ? '500' : '500',
    textAlign: 'center' 
  },
  sectionTitle: { 
    fontFamily: typography.fonts.subheading.fontFamily,
    fontWeight: '600' as const,
    fontSize: typography.sizes.lg, 
    marginBottom: 12, 
    color: colors.neutral[700] 
  },
  segmentedButtons: { 
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  input: { 
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  inputTheme: {
    colors: {
      primary: colors.primary[500],
      onSurfaceVariant: colors.primary[500],
      outline: colors.neutral[300],
      surface: colors.white,
      onSurface: colors.neutral[700],
      onSurfaceDisabled: colors.neutral[400],
    },
  } as any,
  fieldError: { 
    fontFamily: typography.fonts.caption.fontFamily,
    fontWeight: '500' as const,
    color: colors.error[500], 
    fontSize: typography.sizes.xs, 
    marginBottom: 8, 
    marginLeft: 4 
  },
  progressContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(1, 83, 130, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 2,
  },
  progressText: {
    fontFamily: typography.fonts.caption.fontFamily,
    fontWeight: '500' as const,
    color: colors.primary[500],
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: 8,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontFamily: typography.fonts.subheading.fontFamily,
    fontWeight: '600' as const,
    fontSize: typography.sizes['2xl'],
    color: colors.primary[500],
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontFamily: typography.fonts.body.fontFamily,
    fontWeight: '400' as const,
    fontSize: typography.sizes.base,
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
    width: '100%',
    alignItems: 'center',
  },
  navButton: {
    flex: 1,
    borderRadius: 12,
  },
  navButtonText: {
    fontFamily: typography.fonts.bodySemibold.fontFamily,
    fontWeight: '600' as const,
    color: colors.primary[500],
    fontSize: typography.sizes.base,
  },
  nextButton: {
    backgroundColor: colors.primary[500],
  },
  nextButtonText: {
    fontFamily: typography.fonts.bodySemibold.fontFamily,
    fontWeight: '600' as const,
    color: colors.white,
    fontSize: typography.sizes.base,
  },
  submitButton: { 
    borderRadius: 12,
    backgroundColor: colors.primary[500],
  },
  submitButtonText: {
    fontFamily: typography.fonts.bodySemibold.fontFamily,
    fontWeight: '600' as const,
    color: colors.white,
    fontSize: typography.sizes.base,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 16 },
  termsContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginVertical: 16,
    paddingHorizontal: 4,
    backgroundColor: '#015382',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#015382',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    borderWidth: 3,
    borderColor: '#015382',
    borderRadius: 4,
    backgroundColor: '#ffffff',
    width: 24,
    height: 24,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#015382',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxTheme: {
    colors: {
      primary: colors.primary[500],
      onSurface: colors.primary[500],
      surface: colors.white,
      outline: '#015382',
    },
  } as any,
  termsTextContainer: { 
    flex: 1, 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    alignItems: 'center', 
    marginLeft: 8,
    paddingTop: 2,
    justifyContent: 'flex-start',
  },
  termsText: { 
    fontFamily: typography.fonts.caption.fontFamily,
    fontWeight: '500' as const,
    fontSize: typography.sizes.sm, 
    color: '#ffffff',
    lineHeight: typography.lineHeights.normal * typography.sizes.sm,
  },
  linkText: {
    fontFamily: typography.fonts.bodySemibold.fontFamily,
    fontWeight: '600' as const,
    color: '#ffffff',
    fontSize: typography.sizes.sm,
    textDecorationLine: 'underline',
  },
  signInContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  signInText: { 
    fontFamily: typography.fonts.caption.fontFamily,
    fontWeight: '500' as const,
    fontSize: typography.sizes.sm, 
    color: colors.neutral[600] 
  },
  signInButtonText: {
    fontFamily: typography.fonts.bodySemibold.fontFamily,
    fontWeight: '600' as const,
    color: colors.primary[500],
    fontSize: typography.sizes.sm,
  },
});

export default SignUpScreen;