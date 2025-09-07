// Enhanced Mobile Authentication Context for ThinqScribe
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
// @ts-ignore
import { getCurrentUser, login, logout, register } from '../api/auth';
// @ts-ignore
import { getUserLocationAndCurrency } from '../utils/currencyUtils';

// Web-compatible secure storage functions
const isWeb = Platform.OS === 'web';

const secureStorage = {
  setItemAsync: async (key: string, value: string) => {
    if (isWeb) {
      // Use localStorage for web
      localStorage.setItem(key, value);
    } else {
      // Use SecureStore for native
      await SecureStore.setItemAsync(key, value);
    }
  },
  
  getItemAsync: async (key: string): Promise<string | null> => {
    if (isWeb) {
      // Use localStorage for web
      return localStorage.getItem(key);
    } else {
      // Use SecureStore for native
      return await SecureStore.getItemAsync(key);
    }
  },
  
  deleteItemAsync: async (key: string) => {
    if (isWeb) {
      // Use localStorage for web
      localStorage.removeItem(key);
    } else {
      // Use SecureStore for native
      await SecureStore.deleteItemAsync(key);
    }
  }
};

interface User {
  _id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: 'student' | 'writer';
  avatar?: string;
  isVerified: boolean;
  bio?: string;
  phone?: string;
  specialties?: string[];
  rating?: number;
  completedProjects?: number;
  totalEarnings?: number;
  writerProfile?: {
    bio?: string;
    specialties?: string[];
    responseTime?: number;
    verified?: boolean;
  };
  location?: {
    country: string;
    currency: string;
    symbol: string;
    countryCode: string;
    displayName: string;
    currencySymbol: string;
    flag: string;
  };
}

interface BiometricSettings {
  enabled: boolean;
  type: 'fingerprint' | 'face' | 'iris' | 'none';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  biometricSettings: BiometricSettings;
  location: any;
  signIn: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<void>;
  signUp: (userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
  updateUserLocation: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricSettings, setBiometricSettings] = useState<BiometricSettings>({
    enabled: false,
    type: 'none'
  });
  const [location, setLocation] = useState<any>(null);

  const isAuthenticated = !!user;

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check for stored auth token
      const token = await secureStorage.getItemAsync('thinqscribe_auth_token');
      
      if (token) {
        try {
          // Get current user
          const userData = await getCurrentUser();
          setUser(userData);
          
          // Update location data
          await updateUserLocation();
          
          // Load biometric settings
          await loadBiometricSettings();
        } catch (error) {
          console.error('Failed to get current user:', error);
          await signOut();
        }
      } else {
        // Update location even if not authenticated
        await updateUserLocation();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBiometricSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('biometric_settings');
      if (settings) {
        setBiometricSettings(JSON.parse(settings));
      }
      
      // Check available biometric types (only on native platforms)
      if (!isWeb) {
        const biometricType = await LocalAuthentication.getEnrolledLevelAsync();
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        if (biometricType === LocalAuthentication.SecurityLevel.BIOMETRIC) {
          let type: BiometricSettings['type'] = 'fingerprint';
          if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            type = 'face';
          } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
            type = 'iris';
          }
          
          setBiometricSettings(prev => ({ ...prev, type }));
        }
      } else {
        // Default settings for web
        setBiometricSettings(prev => ({ ...prev, type: 'none' }));
      }
    } catch (error) {
      console.error('Failed to load biometric settings:', error);
    }
  };

  const updateUserLocation = async () => {
    try {
      const locationData = await getUserLocationAndCurrency();
      setLocation(locationData);
      
      // Store location data
      await AsyncStorage.setItem('user_location', JSON.stringify(locationData));
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
  };

  const signIn = async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    try {
      setIsLoading(true);
      
      const response = await login(credentials);
      
      if (response.token) {
        // Store token securely
        await secureStorage.setItemAsync('thinqscribe_auth_token', response.token);
        
        // Store remember me preference
        if (credentials.rememberMe) {
          await AsyncStorage.setItem('remember_me', 'true');
        }
        
        // Set user data
        setUser(response.user || response);
        
        // Update location
        await updateUserLocation();
        
        console.log('✅ Sign in successful');
      }
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: any) => {
    try {
      setIsLoading(true);
      
      // Add location data to signup
      if (location) {
        userData.location = {
          country: location.country,
          currency: location.currency,
          symbol: location.symbol
        };
      }
      
      const response = await register(userData);
      
      if (response.token) {
        // Store token securely
        await secureStorage.setItemAsync('thinqscribe_auth_token', response.token);
        
        // Set user data
        setUser(response.user || response);
        
        console.log('✅ Sign up successful');
      }
    } catch (error) {
      console.error('❌ Sign up failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Call API logout
      await logout();
      
      // Clear stored data
      await secureStorage.deleteItemAsync('thinqscribe_auth_token');
      await AsyncStorage.removeItem('remember_me');
      
      // Reset state
      setUser(null);
      
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      // Still clear local data even if API call fails
      await secureStorage.deleteItemAsync('thinqscribe_auth_token');
      await AsyncStorage.removeItem('remember_me');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const enableBiometric = async (): Promise<boolean> => {
    try {
      // Skip biometric on web
      if (isWeb) {
        console.warn('Biometric authentication not available on web');
        return false;
      }

      // Check if biometric authentication is available
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        throw new Error('Biometric hardware not available');
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        throw new Error('No biometric data enrolled');
      }

      // Test biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric authentication for ThinqScribe',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use password instead',
      });

      if (result.success) {
        const newSettings = { ...biometricSettings, enabled: true };
        setBiometricSettings(newSettings);
        await AsyncStorage.setItem('biometric_settings', JSON.stringify(newSettings));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to enable biometric:', error);
      return false;
    }
  };

  const disableBiometric = async () => {
    try {
      const newSettings = { ...biometricSettings, enabled: false };
      setBiometricSettings(newSettings);
      await AsyncStorage.setItem('biometric_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to disable biometric:', error);
    }
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      // Skip biometric on web
      if (isWeb) {
        console.warn('Biometric authentication not available on web');
        return false;
      }

      if (!biometricSettings.enabled) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with biometric to access ThinqScribe',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use password instead',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  };

  const refreshUser = async () => {
    try {
      if (isAuthenticated) {
        const userData = await getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, user might need to re-authenticate
      await signOut();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    biometricSettings,
    location,
    signIn,
    signUp,
    signOut,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
    refreshUser,
    updateUserLocation,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
