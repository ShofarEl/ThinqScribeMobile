import client from './client';

export const paymentApi = {
  // Create checkout session for payment
  createCheckoutSession: async (agreementId) => {
    try {
      const response = await client.post('/payment/create-checkout-session', {
        agreementId
      });
      return response;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  // Get payment session details
  getPaymentSession: async (sessionId) => {
    try {
      const response = await client.get(`/payment/session/${sessionId}`);
      return response;
    } catch (error) {
      console.error('Error fetching payment session:', error);
      throw error;
    }
  },

  // Get payment details
  getPaymentDetails: async (sessionId) => {
    try {
      const response = await client.get(`/payment/session/${sessionId}`);
      return response;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  },

  // Get payment statistics
  getPaymentStats: async () => {
    try {
      const response = await client.get('/payment/stats');
      console.log('Payment stats API response:', response);
      
      // Make sure we're returning the actual data, not the response object
      return response.data || response;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      return {
        totalEarnings: 0,
        availableBalance: 0,
        pendingAmount: 0,
        totalSpent: 0,
        pendingPayments: 0
      };
    }
  },

  // Get payment history
  getPaymentHistory: async (params = {}) => {
    try {
      console.log('💳 [PaymentAPI] Fetching payment history with params:', params);
      
      // 🔧 FIXED: Enhanced API call with better error handling
      const response = await client.get('/payment/history', { 
        params: {
          ...params,
          include: 'agreement,writer,student',
          populate: 'agreement.projectDetails'
        }
      });
      
      console.log('💳 [PaymentAPI] Payment history response:', response);
      console.log('💳 [PaymentAPI] Response data:', response.data);
      
      return response;
    } catch (error) {
      console.error('💳 [PaymentAPI] Error fetching payment history:', error);
      console.error('💳 [PaymentAPI] Error response:', error.response?.data);
      
      // 🔧 FIXED: Better error handling with fallback
      if (error.response?.status === 404) {
        // Endpoint might not exist, return empty data
        console.log('💳 [PaymentAPI] Payment history endpoint not found, returning empty data');
        return { data: { payments: [] } };
      }
      
      throw error;
    }
  },

  // Get payment methods
  getPaymentMethods: async () => {
    try {
      const response = await client.get('/payment/methods');
      return response;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  // Add payment method
  addPaymentMethod: async (paymentMethodData) => {
    try {
      const response = await client.post('/payment/methods', paymentMethodData);
      return response;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }
};

export default paymentApi;