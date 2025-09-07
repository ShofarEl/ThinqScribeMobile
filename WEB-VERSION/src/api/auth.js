// Fixed auth.js service with better error handling and response structure
import client from './client.js';

export const storeAuthToken = (token) => {
  console.log('💾 [AuthService] Storing token');
  localStorage.setItem('thinqscribe_auth_token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('thinqscribe_auth_token');
};

export const clearAuthToken = () => {
  console.log('🗑️ [AuthService] Clearing token');
  localStorage.removeItem('thinqscribe_auth_token');
};

export const login = async (credentials) => {
  try {
    console.log('🔑 [AuthService] Attempting login...');
    
    // Ensure credentials is a proper object
    if (!credentials || typeof credentials !== 'object') {
      throw new Error('Invalid credentials format');
    }
    
    // Log the exact payload being sent
    console.log('🔑 [AuthService] Login payload:', JSON.stringify(credentials));
    
    const response = await client.post('/auth/login', credentials);
    console.log('🔑 [AuthService] Login response:', response);
    
    // The client interceptor returns response.data, so we work with that
    if (response && response.token) {
      console.log('💾 [AuthService] Storing token from login');
      localStorage.setItem('thinqscribe_auth_token', response.token);
      return response; // Return the full response data
    } else {
      console.error('❌ [AuthService] No token in login response:', response);
      throw new Error('Invalid login response - no token received');
    }
  } catch (error) {
    console.error('❌ [AuthService] Login error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    console.log('📝 [AuthService] Attempting registration...');
    
    // Ensure userData is a proper object
    if (!userData || typeof userData !== 'object') {
      throw new Error('Invalid user data format');
    }
    
    // Log the exact payload being sent
    console.log('📝 [AuthService] Registration data:', JSON.stringify(userData));
    
    const response = await client.post('/auth/register', userData);
    console.log('✅ [AuthService] Registration response:', response);
    
    // Store token if available in the response
    if (response && response.token) {
      console.log('💾 [AuthService] Storing token from registration');
      storeAuthToken(response.token);
    }
    
    return response;
  } catch (error) {
    console.error('❌ [AuthService] Registration error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    console.log('👤 [AuthService] Fetching current user...');
    const token = getAuthToken();
    if (!token) {
      console.log('🚫 [AuthService] No token found for getCurrentUser.');
      throw new Error('No authentication token found');
    }
    
    // Try both endpoints for compatibility
    let response;
    try {
      response = await client.get('/auth/me');
      console.log('✅ [AuthService] Current user response from /auth/me:', response);
    } catch (error) {
      console.log('⚠️ [AuthService] /auth/me failed, trying /user/profile...');
      response = await client.get('/user/profile');
      console.log('✅ [AuthService] Current user response from /user/profile:', response);
    }
    
    // The client interceptor already extracts the data, so response IS the user data
    const userData = response;
    
    if (!userData || !userData._id) {
      throw new Error('Invalid user data received');
    }
    
    return userData;
  } catch (error) {
    console.error('❌ [AuthService] getCurrentUser error:', error);
    clearAuthToken();
    throw error;
  }
};

export const logout = async () => {
  try {
    console.log('🚪 [AuthService] Logging out...');
    await client.post('/auth/logout');
    clearAuthToken();
    console.log('✅ [AuthService] Logged out successfully.');
  } catch (error) {
    console.error('❌ [AuthService] Logout error:', error);
    clearAuthToken(); // Clear token even if backend logout fails
    throw error;
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await client.post('/auth/forgot-password', { email });
    return response;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (resetToken, newPassword) => {
  try {
    const response = await client.put(`/auth/reset-password/${resetToken}`, { 
      password: newPassword 
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const verifyEmail = async (token) => {
  try {
    console.log('📧 [AuthService] Verifying email with token:', token);
    const response = await client.get(`/auth/verify/${token}`);
    console.log('✅ [AuthService] Verification response:', response);
    return response;
  } catch (error) {
    console.error('❌ [AuthService] Verification error:', error);
    throw error;
  }
};