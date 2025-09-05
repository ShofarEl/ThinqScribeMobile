import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  ActivityIndicator,
  Animated,
  Dimensions,
  SafeAreaView,
  Alert,
  Vibration
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { CustomText } from '@/components/CustomText';
import { ThemedView } from '@/components/ThemedView';
import { TextInput } from 'react-native';
import { MaterialIcons, Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/src/context/AuthContext';
import { getAuthErrorMessage } from '@/src/utils/errorMessages';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { login: authLogin } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const buttonGlowAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const formSlideAnim = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-50)).current;
  const footerSlideAnim = useRef(new Animated.Value(50)).current;
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  
  useEffect(() => {
    // Professional staggered animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true
        })
      ]),
      Animated.parallel([
        Animated.timing(headerSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true
        })
      ]),
      Animated.parallel([
        Animated.timing(formSlideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(footerSlideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        })
      ])
    ]).start();

    // Subtle button glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonGlowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true
        }),
        Animated.timing(buttonGlowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '', general: '' };
    
    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      // Haptic feedback for validation error
      if (Platform.OS === 'ios') {
        Vibration.vibrate(100);
      }
      
      // Shake animation for button
      Animated.sequence([
        Animated.timing(buttonScaleAnim, { toValue: 1.02, duration: 100, useNativeDriver: true }),
        Animated.timing(buttonScaleAnim, { toValue: 0.98, duration: 100, useNativeDriver: true }),
        Animated.timing(buttonScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true })
      ]).start();
      
      return;
    }

    setIsLoading(true);
    
    // Success haptic feedback
    if (Platform.OS === 'ios') {
      Vibration.vibrate(50);
    }
    
    try {
      // Call the actual login API
      const response = await authLogin({ email, password });
      console.log('Login successful:', response);
      console.log('User role:', response?.user?.role);
      
      // Success animation
      Animated.parallel([
        Animated.timing(buttonScaleAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(buttonGlowAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
      
      // Navigate to the main app - the navigation will handle role-based routing
      setTimeout(() => router.replace('/(tabs)'), 300);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = getAuthErrorMessage(error as Error);
      
      // Error haptic feedback
      if (Platform.OS === 'ios') {
        Vibration.vibrate([100, 50, 100]);
      }
      
      setErrors({
        ...errors,
        general: errorMessage || 'Sign in failed. Please check your credentials and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearError = (field: 'email' | 'password' | 'general') => {
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const handleFocus = (field: 'email' | 'password') => {
    setIsFocused((prev: { email: boolean; password: boolean }) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: 'email' | 'password') => {
    setIsFocused((prev: { email: boolean; password: boolean }) => ({ ...prev, [field]: false }));
  };

  const handleBiometricLogin = () => {
    Alert.alert(
      'Biometric Authentication',
      'Use your fingerprint or face ID to sign in quickly and securely.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Enable', onPress: () => console.log('Biometric enabled') }
      ]
    );
  };

  const isDark = colorScheme === 'dark';
  // Professional color palette
  const primaryColor = '#015382';
  const primaryColorLight = '#017DB0';
  const primaryColorDark = '#013A5C';
  const accentColor = '#00A8E8';
  const successColor = '#10B981';
  const errorColor = '#EF4444';
  const warningColor = '#F59E0B';

  return (
    <SafeAreaView style={[styles.safeArea, { 
      backgroundColor: isDark ? '#0A0A0F' : '#FFFFFF',
    }]}>
      <ThemedView style={[styles.container, { 
        backgroundColor: isDark ? '#0A0A0F' : '#FFFFFF',
      }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        
        {/* Enhanced Background Gradient */}
        <LinearGradient
          colors={isDark ? 
            ['rgba(1, 83, 130, 0.15)', 'rgba(0, 168, 232, 0.08)', 'rgba(16, 185, 129, 0.05)'] : 
            ['rgba(1, 83, 130, 0.08)', 'rgba(0, 168, 232, 0.05)', 'rgba(248, 250, 252, 1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />

        {/* Floating geometric shapes for visual interest */}
        <Animated.View 
          style={[
            styles.floatingShape,
            styles.shape1,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.1]
              }),
              transform: [{
                rotate: buttonGlowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                }) as any
              }]
            }
          ]}
        />
        <Animated.View 
          style={[
            styles.floatingShape,
            styles.shape2,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.08]
              }),
              transform: [{
                rotate: buttonGlowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['360deg', '0deg']
                }) as any
              }]
            }
          ]}
        />
        
        {/* Professional Back Button */}
        <Animated.View
          style={[
            styles.backButton,
            {
              opacity: fadeAnim,
              transform: [{ translateY: headerSlideAnim } as any]
            }
          ] as any}
        >
          <TouchableOpacity 
            style={[styles.backButtonInner, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
              shadowColor: primaryColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }]}
            onPress={() => router.back()}
          >
            <Feather 
              name="arrow-left" 
              size={20} 
              color={isDark ? '#FFFFFF' : primaryColor} 
            />
          </TouchableOpacity>
        </Animated.View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Professional Logo Section */}
            <Animated.View 
              style={[
                styles.logoContainer,
                { 
                  opacity: fadeAnim, 
                  transform: [{ 
                    translateY: slideAnim,
                    scale: logoScaleAnim
                  }] 
                }
              ]}
            >
              <Animated.View 
                style={[
                  styles.logoWrapper, 
                  {
                    backgroundColor: isDark ? 'rgba(1, 83, 130, 0.15)' : 'rgba(255, 255, 255, 0.95)',
                    shadowColor: primaryColor,
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: isDark ? 0.4 : 0.25,
                    shadowRadius: 32,
                    elevation: 15,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(1, 83, 130, 0.1)',
                  }
                ]}
              >
                <LinearGradient
                  colors={[primaryColor, primaryColorLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <MaterialIcons name="school" size={32} color="#FFFFFF" />
                </LinearGradient>
              </Animated.View>
              
              <View style={styles.logoTextContainer}>
                <CustomText style={[styles.logoText, { color: isDark ? '#FFFFFF' : '#1E293B' }]}>
                  ThinqScribe
                </CustomText>
                <ThemedText style={[styles.logoSubtext, { color: isDark ? '#94A3B8' : '#6B7280' }]}>
                  Academic Excellence Platform
                </ThemedText>
              </View>
            </Animated.View>
            
            {/* Professional Welcome Section */}
            <Animated.View 
              style={[
                styles.welcomeContainer,
                { opacity: fadeAnim, transform: [{ translateY: headerSlideAnim }] }
              ]}
            >
              <CustomText style={[styles.welcomeText, { color: isDark ? '#FFFFFF' : '#1E293B' }]}>
                Welcome Back
              </CustomText>
              <ThemedText style={[styles.subtitleText, { color: isDark ? '#94A3B8' : '#6B7280' }]}>
                Sign in to continue your academic journey
              </ThemedText>
              <View style={styles.welcomeAccent}>
                <View style={[styles.accentLine, { backgroundColor: primaryColor }]} />
              </View>
            </Animated.View>
            
            {/* Professional Error Message */}
            {errors.general ? (
              <Animated.View 
                entering={Platform.OS === 'ios' ? undefined : undefined}
                style={[
                  styles.errorContainer,
                  { 
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
                    borderColor: errorColor,
                    borderWidth: 1,
                    shadowColor: errorColor,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 6,
                  }
                ]}
              >
                <View style={[styles.errorIcon, { backgroundColor: errorColor }]}>
                  <Feather name="alert-triangle" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.errorTextContainer}>
                  <ThemedText style={styles.errorTitle}>Sign In Failed</ThemedText>
                  <ThemedText style={styles.errorText}>{errors.general}</ThemedText>
                </View>
              </Animated.View>
            ) : null}
            
            {/* Professional Form Container */}
            <Animated.View 
              style={[
                styles.formContainer,
                { 
                  opacity: fadeAnim, 
                  transform: [{ translateY: formSlideAnim }] 
                }
              ]}
            >
              {/* Enhanced Email Field */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>
                  Email Address
                </ThemedText>
                <Animated.View 
                  style={[
                    styles.inputContainer, 
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                      borderColor: errors.email 
                        ? errorColor 
                        : isFocused.email 
                          ? primaryColor 
                          : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      borderWidth: 2,
                      shadowColor: isFocused.email ? primaryColor : 'transparent',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isFocused.email ? 0.2 : 0,
                      shadowRadius: 8,
                      elevation: isFocused.email ? 4 : 0,
                      transform: [{ scale: isFocused.email ? 1.02 : 1 }]
                    }
                  ]}
                >
                  <View style={styles.inputIconContainer}>
                    <Animated.View
                      style={{
                        transform: [{ scale: email || isFocused.email ? 1.1 : 1 }],
                        opacity: email || isFocused.email ? 1 : 0.6,
                      }}
                    >
                      <Feather 
                        name="mail" 
                        size={20} 
                        color={
                          errors.email 
                            ? errorColor 
                            : (email || isFocused.email) 
                              ? primaryColor 
                              : (isDark ? '#9CA3AF' : '#6B7280')
                        } 
                        style={styles.inputIcon} 
                      />
                    </Animated.View>
                  </View>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#FFFFFF' : '#1F2937' }]}
                    placeholder="Enter your email address"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                    value={email}
                    onChangeText={(text: string) => {
                      setEmail(text);
                      clearError('email');
                    }}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </Animated.View>
                {errors.email ? (
                  <Animated.View style={styles.fieldErrorContainer}>
                    <Feather name="x-circle" size={14} color={errorColor} />
                    <ThemedText style={styles.fieldError}>{errors.email}</ThemedText>
                  </Animated.View>
                ) : null}
              </View>
              
              {/* Enhanced Password Field */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>
                  Password
                </ThemedText>
                <Animated.View 
                  style={[
                    styles.inputContainer, 
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                      borderColor: errors.password 
                        ? errorColor 
                        : isFocused.password 
                          ? primaryColor 
                          : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      borderWidth: 2,
                      shadowColor: isFocused.password ? primaryColor : 'transparent',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isFocused.password ? 0.2 : 0,
                      shadowRadius: 8,
                      elevation: isFocused.password ? 4 : 0,
                      transform: [{ scale: isFocused.password ? 1.02 : 1 }]
                    }
                  ]}
                >
                  <View style={styles.inputIconContainer}>
                    <Animated.View
                      style={{
                        transform: [{ scale: password || isFocused.password ? 1.1 : 1 }],
                        opacity: password || isFocused.password ? 1 : 0.6,
                      }}
                    >
                      <Feather 
                        name="lock" 
                        size={20} 
                        color={
                          errors.password 
                            ? errorColor 
                            : (password || isFocused.password) 
                              ? primaryColor 
                              : (isDark ? '#9CA3AF' : '#6B7280')
                        } 
                        style={styles.inputIcon} 
                      />
                    </Animated.View>
                  </View>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#FFFFFF' : '#1F2937' }]}
                    placeholder="Enter your password"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                    value={password}
                    onChangeText={(text: string) => {
                      setPassword(text);
                      clearError('password');
                    }}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Animated.View
                      style={{
                        opacity: password ? 1 : 0.6,
                        transform: [{ scale: showPassword ? 1.1 : 1 }]
                      }}
                    >
                      <Feather 
                        name={showPassword ? 'eye' : 'eye-off'} 
                        size={20} 
                        color={password ? primaryColor : (isDark ? '#9CA3AF' : '#6B7280')} 
                      />
                    </Animated.View>
                  </TouchableOpacity>
                </Animated.View>
                {errors.password ? (
                  <Animated.View style={styles.fieldErrorContainer}>
                    <Feather name="x-circle" size={14} color={errorColor} />
                    <ThemedText style={styles.fieldError}>{errors.password}</ThemedText>
                  </Animated.View>
                ) : null}
              </View>
              
              {/* Remember Me & Forgot Password */}
              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={styles.rememberMeContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[
                    styles.checkbox,
                    {
                      backgroundColor: rememberMe ? primaryColor : 'transparent',
                      borderColor: rememberMe ? primaryColor : (isDark ? '#6B7280' : '#D1D5DB'),
                    }
                  ]}>
                    {rememberMe && (
                      <Feather name="check" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <ThemedText style={[styles.rememberMeText, { color: isDark ? '#D1D5DB' : '#6B7280' }]}>
                    Remember me
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.forgotPassword}>
                  <ThemedText style={[styles.forgotPasswordText, { color: primaryColor }]}>
                    Forgot password?
                  </ThemedText>
                </TouchableOpacity>
              </View>
              
              {/* Professional Sign In Button */}
              <Animated.View
                style={[
                  styles.buttonContainer,
                  {
                    transform: [{ scale: buttonScaleAnim }],
                    shadowOpacity: buttonGlowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.2, 0.4]
                    }),
                    shadowRadius: buttonGlowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [8, 16]
                    }),
                    shadowColor: primaryColor,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: buttonGlowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [6, 12]
                    }),
                  }
                ]}
              >
                <TouchableOpacity 
                  style={[styles.signInButton]}
                  onPress={handleSignIn}
                  disabled={isLoading}
                  onPressIn={() => {
                    Animated.parallel([
                      Animated.spring(buttonScaleAnim, {
                        toValue: 0.96,
                        friction: 8,
                        tension: 100,
                        useNativeDriver: true
                      }),
                      Animated.timing(buttonGlowAnim, {
                        toValue: 1,
                        duration: 150,
                        useNativeDriver: true
                      })
                    ]).start();
                  }}
                  onPressOut={() => {
                    Animated.parallel([
                      Animated.spring(buttonScaleAnim, {
                        toValue: 1,
                        friction: 8,
                        tension: 100,
                        useNativeDriver: true
                      }),
                      Animated.timing(buttonGlowAnim, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: true
                      })
                    ]).start();
                  }}
                >
                  <LinearGradient
                    colors={[primaryColor, primaryColorLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.signInButtonGradient}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 12 }} />
                        <CustomText style={styles.signInButtonText}>Signing In...</CustomText>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <CustomText style={styles.signInButtonText}>Sign In</CustomText>
                        <Animated.View
                          style={{
                            transform: [{ 
                              translateX: buttonScaleAnim.interpolate({
                                inputRange: [0.96, 1],
                                outputRange: [0, 6]
                              })
                            }]
                          }}
                        >
                          <Feather name="arrow-right" size={18} color="#FFFFFF" />
                        </Animated.View>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Biometric Authentication Option */}
              <View style={styles.biometricContainer}>
                <View style={styles.dividerContainer}>
                  <View style={[styles.divider, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
                  <ThemedText style={[styles.dividerText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    or
                  </ThemedText>
                  <View style={[styles.divider, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
                </View>
                
                <TouchableOpacity 
                  style={[styles.biometricButton, {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  }]}
                  onPress={handleBiometricLogin}
                >
                  <Ionicons 
                    name="finger-print" 
                    size={24} 
                    color={primaryColor} 
                    style={{ marginRight: 8 }}
                  />
                  <ThemedText style={[styles.biometricText, { color: isDark ? '#E5E7EB' : '#374151' }]}>
                    Use Biometric Authentication
                  </ThemedText>
                </TouchableOpacity>
              </View>
              


            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
        
        {/* Professional Footer */}
        <Animated.View 
          style={[
            styles.footer, 
            {
              backgroundColor: isDark ? 'rgba(10, 10, 15, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              transform: [{ translateY: footerSlideAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <BlurView
            intensity={20}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.footerContent}>
            <ThemedText style={[styles.footerText, { color: isDark ? '#94A3B8' : '#6B7280' }]}>
              Don't have an account?{' '}
            </ThemedText>
            <TouchableOpacity 
              onPress={() => router.push('/signup')}
              style={styles.signUpLinkContainer}
            >
              <ThemedText style={[styles.signUpLink, { color: primaryColor }]}>
                Create one now
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Feather name="shield-check" size={14} color={successColor} />
            <ThemedText style={[styles.securityText, { color: isDark ? '#94A3B8' : '#6B7280' }]}>
              Your data is protected with enterprise-grade security
            </ThemedText>
          </View>
        </Animated.View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  // Floating shapes for visual interest
  floatingShape: {
    position: 'absolute',
    borderRadius: 50,
  },
  shape1: {
    width: 100,
    height: 100,
    top: '15%',
    right: -50,
    backgroundColor: '#015382',
  },
  shape2: {
    width: 80,
    height: 80,
    bottom: '25%',
    left: -40,
    backgroundColor: '#00A8E8',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 140,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  logoTextContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
    opacity: 0.8,
  },
  welcomeAccent: {
    marginTop: 16,
    alignItems: 'center',
  },
  accentLine: {
    width: 60,
    height: 3,
    borderRadius: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  errorIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  errorTextContainer: {
    flex: 1,
    paddingTop: 2,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 2,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    lineHeight: 18,
    opacity: 0.9,
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    overflow: 'hidden',
  },
  inputIconContainer: {
    marginRight: 12,
  },
  inputIcon: {
    // Icon styling handled inline
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 8,
    borderRadius: 8,
  },
  fieldErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 4,
  },
  fieldError: {
    fontSize: 13,
    color: '#EF4444',
    marginLeft: 6,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rememberMeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPassword: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  signInButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  signInButtonGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  biometricContainer: {
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  biometricText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerText: {
    fontSize: 15,
    fontWeight: '500',
  },
  signUpLinkContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  signUpLink: {
    fontWeight: '700',
    fontSize: 15,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  securityText: {
    marginLeft: 6,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },
});