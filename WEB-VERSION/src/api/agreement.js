import { API_BASE_URL, API_ENDPOINTS } from './constants.js';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('thinqscribe_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to make API requests
const makeRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const agreementApi = {
  // Create a new agreement
  createAgreement: async (agreementData) => {
    try {
      const response = await makeRequest(`${API_BASE_URL}${API_ENDPOINTS.AGREEMENT.CREATE}`, {
        method: 'POST',
        body: JSON.stringify(agreementData)
      });
      return response;
    } catch (error) {
      console.error('Failed to create agreement:', error);
      throw error;
    }
  },

  // Get all agreements for current user
  getAgreements: async () => {
    try {
      const response = await makeRequest(`${API_BASE_URL}${API_ENDPOINTS.AGREEMENT.LIST}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch agreements:', error);
      throw error;
    }
  },

  // Get specific agreement by ID
  getAgreement: async (agreementId) => {
    try {
      const response = await makeRequest(`${API_BASE_URL}${API_ENDPOINTS.AGREEMENT.GET}/${agreementId}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch agreement:', error);
      throw error;
    }
  },

  // Accept agreement (writers only)
  acceptAgreement: async (agreementId) => {
    try {
      const response = await makeRequest(`${API_BASE_URL}/agreements/${agreementId}/accept`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Failed to accept agreement:', error);
      throw error;
    }
  },

  // Complete agreement (writers only)
  completeAgreement: async (agreementId) => {
    try {
      const response = await makeRequest(`${API_BASE_URL}${API_ENDPOINTS.AGREEMENT.COMPLETE}/${agreementId}`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Failed to complete agreement:', error);
      throw error;
    }
  },

  // Update agreement progress (writers only)
  updateProgress: async (agreementId, progress) => {
    try {
      const response = await makeRequest(`${API_BASE_URL}${API_ENDPOINTS.AGREEMENT.UPDATE}/${agreementId}/progress`, {
        method: 'PUT',
        body: JSON.stringify({ progress })
      });
      return response;
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw error;
    }
  },

  // Get payment recommendation for agreement
  getPaymentRecommendation: async (agreementId) => {
    try {
      const response = await makeRequest(`${API_BASE_URL}/agreements/${agreementId}/payment-recommendation`);
      return response;
    } catch (error) {
      console.error('Failed to get payment recommendation:', error);
      throw error;
    }
  },

  // Create enhanced payment session with multi-currency and gateway support
  createEnhancedPaymentSession: async (agreementId, options = {}) => {
    try {
      const { currency, gateway, paymentMethod = 'card' } = options;
      
      const response = await makeRequest(`${API_BASE_URL}/agreements/${agreementId}/payment`, {
        method: 'POST',
        body: JSON.stringify({
          currency,
          gateway,
          paymentMethod
        })
      });
      return response;
    } catch (error) {
      console.error('Failed to create enhanced payment session:', error);
      throw error;
    }
  },

  // Legacy payment session creation (for backward compatibility)
  createPaymentSession: async (agreementId) => {
    try {
      const response = await makeRequest(`${API_BASE_URL}/agreements/${agreementId}/payment`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Failed to create payment session:', error);
      throw error;
    }
  },

  // Get payment gateway recommendation with location detection
  getPaymentGatewayRecommendation: async (agreementId) => {
    try {
      // First get the agreement details
      const agreement = await agreementAPI.getAgreement(agreementId);
      
      // Then get the payment recommendation
      const recommendation = await agreementAPI.getPaymentRecommendation(agreementId);
      
      return {
        agreement,
        ...recommendation
      };
    } catch (error) {
      console.error('Failed to get payment gateway recommendation:', error);
      throw error;
    }
  },

  // Process payment with selected gateway and currency
  processPayment: async (agreementId, paymentData) => {
    try {
      const {
        gateway,
        currency,
        paymentMethod,
        amount,
        location
      } = paymentData;

      const response = await agreementAPI.createEnhancedPaymentSession(agreementId, {
        currency,
        gateway,
        paymentMethod
      });

      if (response.success) {
        // Handle different gateway responses
        if (gateway === 'stripe') {
          return {
            success: true,
            type: 'redirect',
            url: response.sessionUrl,
            sessionId: response.sessionId,
            gateway: 'stripe',
            currency,
            amount: response.amount,
            originalAmount: response.originalAmount,
            exchangeRate: response.exchangeRate
          };
        } else if (gateway === 'paystack') {
          return {
            success: true,
            type: 'redirect',
            url: response.authorizationUrl,
            reference: response.reference,
            accessCode: response.accessCode,
            gateway: 'paystack',
            currency,
            amount: response.amount,
            originalAmount: response.originalAmount,
            exchangeRate: response.exchangeRate
          };
        }
      }

      throw new Error(response.error || 'Payment processing failed');
    } catch (error) {
      console.error('Failed to process payment:', error);
      throw error;
    }
  },

  // Cancel agreement
  cancelAgreement: async (agreementId, reason) => {
    try {
      const response = await makeRequest(`${API_BASE_URL}/agreements/${agreementId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      return response;
    } catch (error) {
      console.error('Failed to cancel agreement:', error);
      throw error;
    }
  }
};
