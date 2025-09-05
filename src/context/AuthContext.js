// ThinqScribe/src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  login as apiLogin, 
  register as apiRegister, 
  logout as apiLogout, 
  getCurrentUser, 
  getAuthToken 
} from '../api/auth';
import { getAuthErrorMessage } from '../utils/errorMessages';

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

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        return false;
      }

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const userData = await getCurrentUser();
      
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData });
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      await AsyncStorage.removeItem('thinqscribe_auth_token');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return false;
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      console.log('📝 [Auth] Registering new user...');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      // Ensure userData is a proper object
      if (!userData || typeof userData !== 'object') {
        throw new Error('Invalid user data format');
      }
      
      console.log('📝 [Auth] Registration data:', userData);
      
      const response = await apiRegister(userData);
      console.log('✅ [Auth] Registration successful:', response);
      
      dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS });
      
      return response;
    } catch (error) {
      console.error('❌ [Auth] Registration failed:', error);
      const errorMessage = getAuthErrorMessage(error);
      
      dispatch({ type: AUTH_ACTIONS.REGISTER_FAILURE, payload: errorMessage });
      
      throw error;
    }
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const credentials = typeof email === 'string' 
        ? { email, password } 
        : email;
      
      const response = await apiLogin(credentials);

      const userData = response.user || response.data || response;
      
      if (!userData) {
        throw new Error('No user data received from login');
      }

      console.log('📱 [Auth] Login successful for user:', {
        id: userData._id,
        email: userData.email,
        role: userData.role,
        name: userData.name
      });

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: userData });
      
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = getAuthErrorMessage(error);
      
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
      
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      await AsyncStorage.removeItem('thinqscribe_auth_token');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

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
        // Simulate initial app loading
        setTimeout(async () => {
          await checkAuthStatus();
        }, 1000);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [checkAuthStatus]);

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