// Enhanced client.js with comprehensive debugging
import axios from 'axios';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../utils/errorMessages.js';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : 'https://thinkscribe-xk1e.onrender.com';

// Enhanced token handling with debugging
const getAuthToken = () => {
  const token = localStorage.getItem('thinqscribe_auth_token');
  console.log('🔍 [Auth] Getting token from localStorage');
  console.log('🔍 [Auth] Token exists:', !!token);
  if (token) {
    console.log('🔍 [Auth] Token length:', token.length);
    console.log('🔍 [Auth] Token preview:', token.substring(0, 50) + '...');
    
    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      console.log('🔍 [Auth] Token expires at:', new Date(payload.exp * 1000));
      console.log('🔍 [Auth] Current time:', new Date());
      console.log('🔍 [Auth] Token expired:', payload.exp < now);
    } catch (e) {
      console.log('🔍 [Auth] Could not decode token payload');
    }
  }
  return token;
};

const clearAuthToken = () => {
  console.log('🧹 [Auth] Clearing token from localStorage');
  localStorage.removeItem('thinqscribe_auth_token');
};

const client = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000*60,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Enhanced request interceptor
client.interceptors.request.use(
  (config) => {
    console.log('🚀 [Request] Making request to:', config.url);
    console.log('🚀 [Request] Method:', config.method?.toUpperCase());
    
    const token = getAuthToken();

    // Add currency and location information if available
    const locationCache = localStorage.getItem('edu_sage_location_cache');
    if (locationCache) {
      try {
        const location = JSON.parse(locationCache);
        config.headers['X-User-Currency'] = location.currency || 'usd';
        config.headers['X-User-Country'] = location.countryCode || 'us';
        config.headers['X-User-Timezone'] = location.timezone || 'UTC';
      } catch (e) {
        console.warn('Failed to parse location cache:', e);
      }
    }
    
    // Skip adding auth header for login/register endpoints
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/verify'];
    const isAuthEndpoint = authEndpoints.some(endpoint => config.url.includes(endpoint));
    
    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ [Request] Added Authorization header');
      console.log('🔍 [Request] Auth header:', `Bearer ${token.substring(0, 20)}...`);
    } else if (isAuthEndpoint) {
      console.log('ℹ️ [Request] Skipping auth header for auth endpoint');
    } else {
      console.log('⚠️ [Request] No token available to add to headers');
    }
    
    console.log('🔍 [Request] Final headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('❌ [Request] Interceptor error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
client.interceptors.response.use(
  (response) => {
    console.log('API Response interceptor - Raw response:', response);
    
    // If the response has a data property with success and data nested inside
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      console.log('API Response interceptor - Extracting nested data:', response.data.data);
      return response.data.data;
    }
    
    // Special case for arrays wrapped in data property
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      console.log('API Response interceptor - Extracting array from data property:', response.data.data);
      return response.data.data;
    }
    
    // If the response just has a data property (standard axios response)
    if (response.data) {
      console.log('API Response interceptor - Returning response.data:', response.data);
      return response.data;
    }
    
    // Otherwise return the whole response
    console.log('API Response interceptor - Returning full response:', response);
    return response;
  },
  (error) => {
    console.error('API Response interceptor - Error:', error);
    
    // Enhanced error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      console.error('API Error Status:', error.response.status);
      console.error('API Error Headers:', error.response.headers);
      
      // Handle 401 Unauthorized errors (token expired)
      if (error.response.status === 401) {
        console.log('Unauthorized - clearing auth token');
        localStorage.removeItem('thinqscribe_auth_token');
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('/signin')) {
          window.location.href = '/signin';
        }
      }
      
      // Enhance error message with user-friendly text
      if (error.response.data) {
        error.response.data.userFriendlyMessage = getApiErrorMessage(error);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error Request:', error.request);
      error.userFriendlyMessage = 'Network error. Please check your internet connection and try again.';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error Message:', error.message);
      console.error('API Error Config:', error.config);
      error.userFriendlyMessage = getApiErrorMessage(error);
    }
    
    return Promise.reject(error);
  }
);

// Helper functions
function isAuthPage() {
  const authPages = ['/signin', '/signup', '/forgot-password', '/reset-password'];
  const currentPath = window.location.pathname;
  const isAuth = authPages.some(path => currentPath.includes(path));
  console.log('🔍 [Helper] Current path:', currentPath);
  console.log('🔍 [Helper] Is auth page:', isAuth);
  return isAuth;
}

function handleCommonErrors(status, data) {
  const messages = {
    404: 'Resource not found',
    422: 'Validation error occurred',
    500: 'Server error. Please try again later',
  };
  const message = data.message || messages[status] || 'An error occurred';
  console.log('⚠️ [Error] Showing toast:', message);
  toast.error(message);
}

export default client;