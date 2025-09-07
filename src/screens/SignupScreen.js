import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Checkbox, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../styles/designSystem';

const SignupScreen = ({ navigation }) => {
  const theme = useTheme();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('student'); // 'student' or 'writer'
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    if (!agreeTerms) {
      // Show error for terms agreement
      return;
    }

    setIsLoading(true);
    try {
      // This would be replaced with actual registration logic
      console.log('Signup data:', { ...data, userType });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Navigate to main app or verification screen
      // navigation.navigate('VerifyEmail');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <MaterialIcons name="school" size={40} color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.primary }]}>Create Account</Text>
            <Text style={styles.subtitle}>Join the ThinkScribe community</Text>
          </View>

          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'student' && { backgroundColor: theme.colors.primary + '20' },
                userType === 'student' && { borderColor: theme.colors.primary }
              ]}
              onPress={() => setUserType('student')}
            >
              <MaterialIcons
                name="school"
                size={24}
                color={userType === 'student' ? theme.colors.primary : '#6B7280'}
              />
              <Text
                style={[
                  styles.userTypeText,
                  userType === 'student' && { color: theme.colors.primary, fontWeight: '600' }
                ]}
              >
                Student
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'writer' && { backgroundColor: theme.colors.primary + '20' },
                userType === 'writer' && { borderColor: theme.colors.primary }
              ]}
              onPress={() => setUserType('writer')}
            >
              <MaterialIcons
                name="edit"
                size={24}
                color={userType === 'writer' ? theme.colors.primary : '#6B7280'}
              />
              <Text
                style={[
                  styles.userTypeText,
                  userType === 'writer' && { color: theme.colors.primary, fontWeight: '600' }
                ]}
              >
                Writer
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              rules={{
                required: 'Name is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Full Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.name}
                  left={<TextInput.Icon icon="account" color={theme.colors.primary} />}
                />
              )}
              name="name"
            />
            {errors.name && (
              <HelperText type="error" visible={!!errors.name}>
                {errors.name.message}
              </HelperText>
            )}

            <Controller
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.email}
                  left={<TextInput.Icon icon="email" color={theme.colors.primary} />}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
              name="email"
            />
            {errors.email && (
              <HelperText type="error" visible={!!errors.email}>
                {errors.email.message}
              </HelperText>
            )}

            <Controller
              control={control}
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={styles.input}
                  mode="outlined"
                  secureTextEntry={secureTextEntry}
                  error={!!errors.password}
                  left={<TextInput.Icon icon="lock" color={theme.colors.primary} />}
                  right={
                    <TextInput.Icon
                      icon={secureTextEntry ? 'eye' : 'eye-off'}
                      onPress={() => setSecureTextEntry(!secureTextEntry)}
                      color={theme.colors.primary}
                    />
                  }
                />
              )}
              name="password"
            />
            {errors.password && (
              <HelperText type="error" visible={!!errors.password}>
                {errors.password.message}
              </HelperText>
            )}

            <Controller
              control={control}
              rules={{
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={styles.input}
                  mode="outlined"
                  secureTextEntry={secureTextEntry}
                  error={!!errors.confirmPassword}
                  left={<TextInput.Icon icon="lock-check" color={theme.colors.primary} />}
                />
              )}
              name="confirmPassword"
            />
            {errors.confirmPassword && (
              <HelperText type="error" visible={!!errors.confirmPassword}>
                {errors.confirmPassword.message}
              </HelperText>
            )}

            <View style={styles.termsContainer}>
              <Checkbox
                status={agreeTerms ? 'checked' : 'unchecked'}
                onPress={() => setAgreeTerms(!agreeTerms)}
                color={colors.primary[500]}
              />
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text
                    style={[styles.termsLink, { color: colors.primary[500] }]}
                    onPress={() => navigation.navigate('Terms')}
                  >
                    Terms of Service
                  </Text>
                  {' '}and{' '}
                  <Text
                    style={[styles.termsLink, { color: colors.primary[500] }]}
                    onPress={() => navigation.navigate('Privacy')}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </View>

            <Button
              mode="contained"
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              labelStyle={styles.buttonLabel}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading || !agreeTerms}
            >
              Create Account
            </Button>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: typography.fonts.subheading.fontFamily,
    fontWeight: '600',
    fontSize: typography.sizes['3xl'],
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: typography.fonts.body.fontFamily,
    fontWeight: '400',
    fontSize: typography.sizes.base,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  userTypeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6B7280',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: 8,
    paddingTop: 2,
  },
  termsText: {
    fontFamily: typography.fonts.caption.fontFamily,
    fontWeight: '500',
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
    lineHeight: typography.lineHeights.normal * typography.sizes.sm,
  },
  termsLink: {
    fontFamily: typography.fonts.bodySemibold.fontFamily,
    fontWeight: '600',
    color: colors.primary[500],
    textDecorationLine: 'underline',
  },
  button: {
    marginVertical: 8,
    borderRadius: 8,
    paddingVertical: 4,
  },
  buttonLabel: {
    fontFamily: typography.fonts.bodySemibold.fontFamily,
    fontSize: typography.sizes.base,
    fontWeight: '600',
    paddingVertical: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default SignupScreen;
