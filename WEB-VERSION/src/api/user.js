import client from './client';

// Get student dashboard data
export const fetchStudentDashboardData = async (params = {}) => {
  try {
    console.log('🎯 [API] Fetching student dashboard data...');
    const response = await client.get('/user/dashboard/student', { params });
    console.log('✅ [API] Dashboard data received:', response);
    
    // Return the response directly - client interceptor already extracts data
    // Ensure we have the new monthly spending fields
    if (response && response.stats) {
      return {
        ...response,
        stats: {
          ...response.stats,
          monthlySpending: response.stats.monthlySpending || 0,
          projectsThisMonth: response.stats.projectsThisMonth || 0
        }
      };
    }
    
    return response;
  } catch (error) {
    console.error('❌ [API] Error fetching dashboard data:', error);
    // Return default data structure instead of throwing
    return {
      totalAmountSpent: 0,
      totalAssignments: 0,
      workInProgress: 0,
      completedAssignments: 0,
      refundsRequested: 0,
      refundsProcessed: 0,
      recentAssignments: [],
      supportTickets: [],
      agreements: [],
      payments: [],
      stats: {
        totalSpent: 0,
        pendingPayments: 0,
        activeProjects: 0,
        completedProjects: 0,
        monthlySpending: 0,
        projectsThisMonth: 0
      }
    };
  }
};

// Get recommended writers
export const getRecommendedWriters = async () => {
  try {
    console.log('🎯 [API] Fetching recommended writers...');
    const response = await client.get('/user/recommended-writers');
    console.log('✅ [API] Recommended writers received:', response);
    
    // If response has data property, use it, otherwise use response directly
return response 
  } catch (error) {
    console.error('❌ [API] Error fetching recommended writers:', error);
    return [];
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    console.log('🎯 [API] Updating user profile...');
    const response = await client.put('/user/profile', profileData);
    console.log('✅ [API] Profile updated:', response);
    return response;
  } catch (error) {
    console.error('❌ [API] Error updating profile:', error);
    throw error;
  }
};

// Upload profile picture
export const uploadProfilePicture = async (formData) => {
  try {
    console.log('🎯 [API] Uploading profile picture...');
    const response = await client.post('/user/files/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('✅ [API] Profile picture uploaded:', response);
    return response;
  } catch (error) {
    console.error('❌ [API] Error uploading profile picture:', error);
    throw error;
  }
};

// Get user files
export const getUserFiles = async () => {
  try {
    console.log('🎯 [API] Fetching user files...');
    const response = await client.get('/user/files');
    console.log('✅ [API] User files received:', response);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('❌ [API] Error fetching user files:', error);
    return [];
  }
};

// Update payment terms
export const updatePaymentTerms = async (paymentTerms) => {
  try {
    console.log('🎯 [API] Updating payment terms...');
    const response = await client.put('/user/payment-terms', paymentTerms);
    console.log('✅ [API] Payment terms updated:', response);
    return response;
  } catch (error) {
    console.error('❌ [API] Error updating payment terms:', error);
    throw error;
  }
};