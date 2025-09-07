// src/context/AuthContext.jsx

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  login as apiLogin,
  register as authRegister,
  logout as apiLogout, 
  getCurrentUser
} from '../api/auth.js';
import { notification } from 'antd';
import { useAppLoading } from './AppLoadingContext';
import { getAuthErrorMessage } from '../utils/errorMessages.js';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

// Actions
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        loading: false
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { setIsLoading, setProgress } = useAppLoading();

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem('thinqscribe_auth_token');
    
    if (!token) {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return false;
    }

    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      setProgress(30);
      
      const userData = await getCurrentUser();
      setProgress(80);
      
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData });
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      localStorage.removeItem('thinqscribe_auth_token');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return false;
    }
  }, [setProgress]);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      console.log('📝 [Auth] Registering new user...');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      // Show global loading
      setIsLoading(true);
      setProgress(20);

      // Ensure userData is a proper object
      if (!userData || typeof userData !== 'object') {
        throw new Error('Invalid user data format');
      }
      
      console.log('📝 [Auth] Registration data:', userData);
      setProgress(50);
      
      const response = await authRegister(userData);
      console.log('✅ [Auth] Registration successful:', response);
      
      setProgress(100);
      dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS });
      
      notification.success({
        message: 'Registration Successful',
        description: 'Your account has been created successfully. Please check your email for verification.',
      });
      
      // Hide loading
      setTimeout(() => setIsLoading(false), 300);
      
      return response;
    } catch (error) {
      console.error('❌ [Auth] Registration failed:', error);
      const errorMessage = getAuthErrorMessage(error);
      
      dispatch({ type: AUTH_ACTIONS.REGISTER_FAILURE, payload: errorMessage });
      
      notification.error({
        message: 'Registration Failed',
        description: errorMessage,
      });
      
      // Hide loading
      setIsLoading(false);
      
      throw error;
    }
  }, [setIsLoading, setProgress]);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      setIsLoading(true);
      setProgress(20);

      const credentials = typeof email === 'string' 
        ? { email, password } 
        : email;
      
      setProgress(40);
      
      const response = await apiLogin(credentials);
      setProgress(70);

      const userData = response.user || response.data || response;
      
      if (!userData) {
        throw new Error('No user data received from login');
      }

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: userData });
      setProgress(100);
      
      notification.success({
        message: 'Login Successful',
        description: `Welcome back, ${userData.name || userData.firstName || 'User'}!`,
      });
      
      setTimeout(() => setIsLoading(false), 500);
      
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = getAuthErrorMessage(error);
      
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
      
      notification.error({
        message: 'Login Failed',
        description: errorMessage,
      });
      
      setIsLoading(false);
      throw error;
    }
  }, [setIsLoading, setProgress]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setProgress(50);
      
      await apiLogout();
      setProgress(100);
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('thinqscribe_auth_token');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      notification.success({
        message: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [setIsLoading, setProgress]);

  // Update user data
  const updateUser = useCallback((userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Initial authentication check
  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      if (mounted) {
        // Update global loading state
        setProgress(10);
        
        // Simulate initial app loading
        setTimeout(async () => {
          await checkAuthStatus();
          
          // Complete loading with a slight delay for smoother transition
          if (mounted) {
            setProgress(100);
            setTimeout(() => {
              setIsLoading(false);
            }, 800);
          }
        }, 1000);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [checkAuthStatus, setIsLoading, setProgress]);

  const value = {
    ...state,
    login,
    logout,
    register,
    checkAuthStatus,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;