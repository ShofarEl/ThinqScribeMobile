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

type UserRole = 'student' | 'writer';
interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

interface SignupFormErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  general: string;
}

export default function SignUpScreen() {
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<{
    name: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
  }>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const [errors, setErrors] = useState<SignupFormErrors>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
  });
  
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { register: authRegister } = useAuth();
  
  // Enhanced Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const buttonGlowAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const formSlideAnim = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-50)).current;
  const footerSlideAnim = useRef(new Animated.Value(50)).current;
  const roleAnimLeft = useRef(new Animated.Value(0)).current;
  const roleAnimRight = useRef(new Animated.Value(0)).current;
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

  // Role selection animations
  useEffect(() => {
    if (formData.role === 'student') {
      Animated.parallel([
        Animated.spring(roleAnimLeft, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true
        }),
        Animated.spring(roleAnimRight, {
          toValue: 0,
          tension: 120,
          friction: 8,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(roleAnimLeft, {
          toValue: 0,
          tension: 120,
          friction: 8,
          useNativeDriver: true
        }),
        Animated.spring(roleAnimRight, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [formData.role]);

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: SignupFormErrors = { 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '', 
      general: '' 
    };
    
    // Enhanced Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name should only contain letters and spaces';
      isValid = false;
    }
    
    // Enhanced Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Enhanced Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
      isValid = false;
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // Terms acceptance validation
    if (!acceptTerms) {
      newErrors.general = 'Please accept the Terms of Service and Privacy Policy';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (field: keyof SignupFormData, value: string) => {
    setFormData((prev: SignupFormData) => ({
      ...prev,
      [field]: field === 'role' ? (value as UserRole) : value
    }));
    
    // Clear error when user starts typing
    if (errors[field as keyof SignupFormErrors]) {
      setErrors((prev: SignupFormErrors) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFocus = (field: keyof typeof isFocused) => {
    setIsFocused((prev: typeof isFocused) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: keyof typeof isFocused) => {
    setIsFocused((prev: typeof isFocused) => ({ ...prev, [field]: false }));
  };

  const clearError = (field: keyof SignupFormErrors) => {
    if (errors[field]) {
      setErrors((prev: SignupFormErrors) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSignUp = async () => {
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
      // Prepare user data for registration
      const userData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: formData.role,
      };
      
      // Call the actual registration API
      const response = await authRegister(userData);
      console.log('Registration successful:', response);
      console.log('User role:', response?.user?.role || userData.role);
      
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
      console.error('Registration error:', error);
      const errorMessage = getAuthErrorMessage(error as Error);
      
      // Error haptic feedback
      if (Platform.OS === 'ios') {
        Vibration.vibrate([100, 50, 100]);
      }
      
      setErrors({
        ...errors,
        general: errorMessage || 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
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
            {/* Logo Section */}
            <Animated.View 
              style={[
                styles.logoContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <Animated.View 
                style={[
                  styles.logoWrapper, 
                  {
                    backgroundColor: isDark ? 'rgba(31, 41, 55, 0.4)' : 'rgba(255, 255, 255, 0.7)',
                    shadowColor: primaryColor,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: isDark ? 0.5 : 0.3,
                    shadowRadius: 24,
                    elevation: 10
                  }
                ]}
              >
                <MaterialIcons name="school" size={26} color={primaryColor} />
              </Animated.View>
              <CustomText style={[styles.logoText, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>
                ThinqScribe
              </CustomText>
              <ThemedText style={[styles.logoSubtext, { color: isDark ? '#94A3B8' : '#4B5563' }]}>
                Academic Excellence Platform
              </ThemedText>
            </Animated.View>
            
            {/* Welcome Section */}
            <Animated.View 
              style={[
                styles.welcomeContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <CustomText style={[styles.welcomeText, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>
                Create Your Account
              </CustomText>
              <ThemedText style={[styles.subtitleText, { color: isDark ? '#94A3B8' : '#4B5563' }]}>
                Join thousands of students achieving academic excellence
              </ThemedText>
            </Animated.View>
            
            {/* Error Message */}
            {errors.general ? (
              <Animated.View 
                style={[
                  styles.errorContainer,
                  { 
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                    borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
                  }
                ]}
              >
                <Feather name="alert-circle" size={18} color="#EF4444" />
                <ThemedText style={styles.errorText}>{errors.general}</ThemedText>
              </Animated.View>
            ) : null}
            
            {/* Form Container */}
            <Animated.View 
              style={[
                styles.formContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              {/* Role Selection */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>
                  I am a:
                </ThemedText>
                <View style={styles.roleContainer}>
                  <Animated.View
                    style={{
                      flex: 1,
                      transform: [{ 
                        scale: roleAnimLeft.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.95, 1.05]
                        })
                      }],
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        {
                          backgroundColor: formData.role === 'student' 
                            ? primaryColor 
                            : isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                          borderColor: 'transparent',
                          borderBottomColor: formData.role === 'student' 
                            ? primaryColorLight 
                            : 'rgba(1, 83, 130, 0.3)',
                          borderBottomWidth: 2,
                        }
                      ]}
                      onPress={() => handleChange('role', 'student')}
                    >
                      <Animated.View
                        style={{
                          transform: [{ 
                            rotate: roleAnimLeft.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '10deg']
                            })
                          }]
                        }}
                      >
                        <FontAwesome5 
                          name="graduation-cap"
                          size={14} 
                          color={formData.role === 'student' ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')} 
                          style={styles.roleIcon}
                        />
                      </Animated.View>
                      <CustomText style={[
                        styles.roleText,
                        { 
                          color: formData.role === 'student' ? '#FFFFFF' : '#000000',
                          fontWeight: formData.role === 'student' ? '600' : '500'
                        }
                      ]}>
                        Student
                      </CustomText>
                    </TouchableOpacity>
                  </Animated.View>
                  
                  <Animated.View
                    style={{
                      flex: 1,
                      transform: [{ 
                        scale: roleAnimRight.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.95, 1.05]
                        })
                      }],
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        {
                          backgroundColor: formData.role === 'writer' 
                            ? primaryColor 
                            : isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                          borderColor: 'transparent',
                          borderBottomColor: formData.role === 'writer' 
                            ? primaryColorLight 
                            : 'rgba(1, 83, 130, 0.3)',
                          borderBottomWidth: 2,
                        }
                      ]}
                      onPress={() => handleChange('role', 'writer')}
                    >
                      <Animated.View
                        style={{
                          transform: [{ 
                            rotate: roleAnimRight.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '10deg']
                            })
                          }]
                        }}
                      >
                        <FontAwesome5 
                          name="pen-nib"
                          size={14} 
                          color={formData.role === 'writer' ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')} 
                          style={styles.roleIcon}
                        />
                      </Animated.View>
                      <CustomText style={[
                        styles.roleText,
                        { 
                          color: formData.role === 'writer' ? '#FFFFFF' : '#000000',
                          fontWeight: formData.role === 'writer' ? '600' : '500'
                        }
                      ]}>
                        Writer
                      </CustomText>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>
            
              {/* Full Name Field */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>
                  Full Name
                </ThemedText>
                <View style={[styles.inputContainer, {
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  borderColor: errors.name 
                    ? '#EF4444' 
                    : 'transparent',
                  borderBottomColor: errors.name 
                    ? '#EF4444' 
                    : primaryColor,
                  borderBottomWidth: 2,
                }]}>
                  <Animated.View
                    style={{
                      transform: [{ scale: formData.name ? 1.1 : 1 }],
                      opacity: formData.name ? 1 : 0.7,
                    }}
                  >
                    <Feather 
                      name="user" 
                      size={18} 
                      color={formData.name ? primaryColor : (isDark ? '#9CA3AF' : '#6B7280')} 
                      style={styles.inputIcon} 
                    />
                  </Animated.View>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000' }]}
                    placeholder="Enter your full name"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={formData.name}
                    onChangeText={(text) => handleChange('name', text)}
                  />
                </View>
                {errors.name ? (
                  <ThemedText style={styles.fieldError}>{errors.name}</ThemedText>
                ) : null}
              </View>
              
              {/* Email Field */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>
                  Email Address
                </ThemedText>
                <View style={[styles.inputContainer, {
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  borderColor: errors.email 
                    ? '#EF4444' 
                    : 'transparent',
                  borderBottomColor: errors.email 
                    ? '#EF4444' 
                    : primaryColor,
                  borderBottomWidth: 2,
                }]}>
                  <Animated.View
                    style={{
                      transform: [{ scale: formData.email ? 1.1 : 1 }],
                      opacity: formData.email ? 1 : 0.7,
                    }}
                  >
                    <Feather 
                      name="mail" 
                      size={18} 
                      color={formData.email ? primaryColor : (isDark ? '#9CA3AF' : '#6B7280')} 
                      style={styles.inputIcon} 
                    />
                  </Animated.View>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000' }]}
                    placeholder="Enter your email address"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={formData.email}
                    onChangeText={(text) => handleChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email ? (
                  <ThemedText style={styles.fieldError}>{errors.email}</ThemedText>
                ) : null}
              </View>
              
              {/* Password Field */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>
                  Password
                </ThemedText>
                <View style={[styles.inputContainer, {
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  borderColor: errors.password 
                    ? '#EF4444' 
                    : 'transparent',
                  borderBottomColor: errors.password 
                    ? '#EF4444' 
                    : primaryColor,
                  borderBottomWidth: 2,
                }]}>
                  <Animated.View
                    style={{
                      transform: [{ scale: formData.password ? 1.1 : 1 }],
                      opacity: formData.password ? 1 : 0.7,
                    }}
                  >
                    <Feather 
                      name="lock" 
                      size={18} 
                      color={formData.password ? primaryColor : (isDark ? '#9CA3AF' : '#6B7280')} 
                      style={styles.inputIcon} 
                    />
                  </Animated.View>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000' }]}
                    placeholder="Create a strong password"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={formData.password}
                    onChangeText={(text) => handleChange('password', text)}
                    secureTextEntry={!showPassword}
                  />
                  <Animated.View
                    style={{
                      opacity: formData.password ? 1 : 0.7,
                    }}
                  >
                    <TouchableOpacity 
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Feather 
                        name={showPassword ? 'eye' : 'eye-off'} 
                        size={18} 
                        color={isDark ? '#9CA3AF' : '#6B7280'} 
                      />
                    </TouchableOpacity>
                  </Animated.View>
                </View>
                {errors.password ? (
                  <ThemedText style={styles.fieldError}>{errors.password}</ThemedText>
                ) : null}
              </View>
              
              {/* Confirm Password Field */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: isDark ? '#E5E7EB' : '#374151' }]}>
                  Confirm Password
                </ThemedText>
                <View style={[styles.inputContainer, {
                  backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  borderColor: errors.confirmPassword 
                    ? '#EF4444' 
                    : 'transparent',
                  borderBottomColor: errors.confirmPassword 
                    ? '#EF4444' 
                    : primaryColor,
                  borderBottomWidth: 2,
                }]}>
                  <Animated.View
                    style={{
                      transform: [{ scale: formData.confirmPassword ? 1.1 : 1 }],
                      opacity: formData.confirmPassword ? 1 : 0.7,
                    }}
                  >
                    <Feather 
                      name="lock" 
                      size={18} 
                      color={formData.confirmPassword ? primaryColor : (isDark ? '#9CA3AF' : '#6B7280')} 
                      style={styles.inputIcon} 
                    />
                  </Animated.View>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000' }]}
                    placeholder="Confirm your password"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleChange('confirmPassword', text)}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <Animated.View
                    style={{
                      opacity: formData.confirmPassword ? 1 : 0.7,
                    }}
                  >
                    <TouchableOpacity 
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Feather 
                        name={showConfirmPassword ? 'eye' : 'eye-off'} 
                        size={18} 
                        color={isDark ? '#9CA3AF' : '#6B7280'} 
                      />
                    </TouchableOpacity>
                  </Animated.View>
                </View>
                {errors.confirmPassword ? (
                  <ThemedText style={styles.fieldError}>{errors.confirmPassword}</ThemedText>
                ) : null}
              </View>
              
              {/* Terms and Conditions */}
              <View style={styles.termsContainer}>
                              <ThemedText style={[styles.termsText, { color: isDark ? '#94A3B8' : '#4B5563' }]}>
                By creating an account, you agree to our
              </ThemedText>
                <View style={styles.termsLinksContainer}>
                  <TouchableOpacity>
                    <CustomText style={[styles.termsLink, { color: primaryColor, marginRight: 10 }]}>
                      Terms of Service
                    </CustomText>
                  </TouchableOpacity>
                  <ThemedText style={[styles.termsText, { color: isDark ? '#94A3B8' : '#4B5563' }]}>and</ThemedText>
                  <TouchableOpacity>
                    <CustomText style={[styles.termsLink, { color: primaryColor, marginLeft: 10 }]}>
                      Privacy Policy
                    </CustomText>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Sign Up Button */}
              <Animated.View
                style={[
                  styles.buttonContainer,
                  {
                    transform: [{ scale: buttonScaleAnim }],
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    shadowColor: primaryColor,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 8,
                  }
                ]}
              >
                <TouchableOpacity 
                  style={[styles.signUpButton, {
                    backgroundColor: primaryColor,
                  }]}
                  onPress={handleSignUp}
                  disabled={isLoading}
                  onPressIn={() => {
                    Animated.spring(buttonScaleAnim, {
                      toValue: 0.95,
                      friction: 8,
                      tension: 40,
                      useNativeDriver: true
                    }).start();
                  }}
                  onPressOut={() => {
                    Animated.spring(buttonScaleAnim, {
                      toValue: 1,
                      friction: 8,
                      tension: 40,
                      useNativeDriver: true
                    }).start();
                  }}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                      <CustomText style={styles.signUpButtonText}>Creating account...</CustomText>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <CustomText style={styles.signUpButtonText}>Create Account</CustomText>
                      <Animated.View
                        style={{
                          transform: [{ 
                            translateX: buttonScaleAnim.interpolate({
                              inputRange: [0.95, 1],
                              outputRange: [0, 4]
                            })
                          }]
                        }}
                      >
                        <Feather name="arrow-right" size={16} color="#FFFFFF" />
                      </Animated.View>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
              


            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
        
        {/* Footer */}
        <View style={[styles.footer, {
          backgroundColor: isDark ? 'rgba(15, 15, 35, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTopColor: isDark ? 'rgba(71, 85, 105, 0.2)' : '#E5E7EB',
        }]}>
          <ThemedText style={[styles.footerText, { color: isDark ? '#94A3B8' : '#4B5563' }]}>
            Already have an account?{' '}
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('./signin')}>
            <ThemedText style={[styles.signInLink, { color: primaryColor }]}>Sign in here</ThemedText>
          </TouchableOpacity>
        </View>
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
    width: 120,
    height: 120,
    top: '10%',
    right: -60,
    backgroundColor: '#015382',
  },
  shape2: {
    width: 90,
    height: 90,
    bottom: '30%',
    left: -45,
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
    marginBottom: 18,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#EF4444',
    flex: 1,
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    paddingLeft: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIcon: {
    marginRight: 6,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
    overflow: 'hidden',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    fontWeight: '400',
  },
  eyeIcon: {
    padding: 6,
  },
  fieldError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    paddingLeft: 4,
  },
  termsContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  termsLinksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLink: {
    fontWeight: '600',
    fontSize: 14,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 18,
  },
  signUpButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: 6,
  },
  signUpButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 10,
  },
  securityText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#059669',
    textAlign: 'center',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '400',
  },
  signInLink: {
    fontWeight: '600',
    fontSize: 14,
  },
});