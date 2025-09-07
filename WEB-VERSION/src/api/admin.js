import client from './client';

export const adminApi = {
  // Get comprehensive dashboard statistics
  getStats: async () => {
    try {
      console.log('🎯 [Admin API] Fetching dashboard stats...');
      const response = await client.get('/admin/stats');
      console.log('✅ [Admin API] Stats received:', response);
      return response;
    } catch (error) {
      console.error('❌ [Admin API] Error fetching stats:', error);
      throw error;
    }
  },

  // Get all users
  getUsers: async (params = {}) => {
    try {
      console.log('🎯 [Admin API] Fetching users...');
      const response = await client.get('/admin/users', { params });
      console.log('✅ [Admin API] Users received:', response);
      return response;
    } catch (error) {
      console.error('❌ [Admin API] Error fetching users:', error);
      throw error;
    }
  },

  // Get all writers with filtering
  getWriters: async (params = {}) => {
    try {
      console.log('🎯 [Admin API] Fetching writers...');
      const response = await client.get('/admin/writers', { params });
      console.log('✅ [Admin API] Writers received:', response);
      return response;
    } catch (error) {
      console.error('❌ [Admin API] Error fetching writers:', error);
      throw error;
    }
  },

  // Approve a writer
  approveWriter: async (writerId) => {
    try {
      console.log('🔄 [Admin API] Approving writer:', writerId);
      const response = await client.post(`/admin/writers/${writerId}/approve`);
      console.log('✅ [Admin API] Writer approved:', response);
      return response;
    } catch (error) {
      console.error('❌ [Admin API] Error approving writer:', error);
      throw error;
    }
  },

  // Publish a writer
  publishWriter: async (writerId) => {
    try {
      console.log('🔄 [Admin API] Publishing writer:', writerId);
      const response = await client.post(`/admin/writers/${writerId}/publish`);
      console.log('✅ [Admin API] Writer published:', response);
      return response;
    } catch (error) {
      console.error('❌ [Admin API] Error publishing writer:', error);
      throw error;
    }
  },

  // Unpublish a writer
  unpublishWriter: async (writerId) => {
    try {
      console.log('🔄 [Admin API] Unpublishing writer:', writerId);
      const response = await client.post(`/admin/writers/${writerId}/unpublish`);
      console.log('✅ [Admin API] Writer unpublished:', response);
      return response;
    } catch (error) {
      console.error('❌ [Admin API] Error unpublishing writer:', error);
      throw error;
    }
  },

  // Get all agreements
  getAgreements: async (params = {}) => {
    try {
      console.log('🎯 [Admin API] Fetching agreements...');
      const response = await client.get('/admin/agreements', { params });
      console.log('✅ [Admin API] Agreements received:', response);
      return response;
    } catch (error) {
      console.error('❌ [Admin API] Error fetching agreements:', error);
      throw error;
    }
  },

  // Fix payment statuses
  fixPaymentStatuses: async () => {
    try {
      console.log('🔧 [Admin API] Fixing payment statuses...');
      const response = await client.post('/admin/fix-payment-statuses');
      console.log('✅ [Admin API] Payment statuses fixed:', response);
      return response;
    } catch (error) {
      console.error('❌ [Admin API] Error fixing payment statuses:', error);
      throw error;
    }
  },

  // Fix payment calculations
  fixPaymentCalculations: async () => {
    try {
      console.log('🔧 [Admin API] Fixing payment calculations...');
      const response = await client.post('/admin/fix-payment-calculations');
      console.log('✅ [Admin API] Payment calculations fixed:', response);
      return response;
    } catch (error) {
      console.error('❌ [Admin API] Error fixing payment calculations:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      console.log('🔄 [Admin API] Updating user:', userId);
      const response = await client.put(`/admin/users/${userId}`, userData);
      console.log('✅ [Admin API] User updated:', response);
      return response;
    } catch (error) {
      console.error('❌ [Admin API] Error updating user:', error);
      throw error;
    }
  }
};

export default adminApi; 