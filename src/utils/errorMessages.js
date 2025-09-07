// ThinqScribe/src/utils/errorMessages.js

/**
 * Gets a user-friendly error message for authentication errors
 * @param {Error} error - The error object
 * @returns {string} - A user-friendly error message
 */
export const getAuthErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // If the error has a response from the server
  if (error.response && error.response.data) {
    // Check for specific error messages from the API
    const { data } = error.response;
    
    if (data.message) {
      return data.message;
    }
    
    if (data.error) {
      return data.error;
    }
    
    // Check for validation errors
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0].msg || 'Validation error';
    }
  }
  
  // Handle specific HTTP status codes
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your information and try again.';
      case 401:
        return 'Invalid email or password. Please try again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This email is already in use. Please try another one.';
      case 422:
        return 'Validation error. Please check your information and try again.';
      case 429:
        return 'Too many attempts. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Error (${error.response.status}): Please try again later.`;
    }
  }
  
  // Network errors
  if (error.message && error.message.includes('Network Error')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  // Default error message
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Gets a user-friendly error message for payment-related errors
 * @param {Error} error - The error object
 * @returns {string} - A user-friendly error message
 */
export const getPaymentErrorMessage = (error) => {
  if (!error) return 'An unknown payment error occurred';
  
  // If the error has a response from the server
  if (error.response && error.response.data) {
    const { data } = error.response;
    
    if (data.message) {
      return data.message;
    }
    
    if (data.error) {
      return data.error;
    }
  }
  
  // Handle specific HTTP status codes for payment errors
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return 'Invalid payment information. Please check your details and try again.';
      case 401:
        return 'Authentication required. Please log in and try again.';
      case 402:
        return 'Payment required. Your payment was not processed.';
      case 403:
        return 'Payment forbidden. You do not have permission to make this payment.';
      case 404:
        return 'Payment service not found. Please try again later.';
      case 409:
        return 'Payment conflict. This transaction may have already been processed.';
      case 422:
        return 'Invalid payment data. Please check your payment details.';
      case 429:
        return 'Too many payment attempts. Please try again later.';
      case 500:
        return 'Payment server error. Please try again later.';
      default:
        return `Payment error (${error.response.status}): Please try again later.`;
    }
  }
  
  // Network errors
  if (error.message && error.message.includes('Network Error')) {
    return 'Network error during payment. Please check your internet connection and try again.';
  }
  
  // Default error message
  return error.message || 'An unexpected payment error occurred. Please try again.';
};

/**
 * Gets a user-friendly error message for API errors
 * @param {Error} error - The error object
 * @returns {string} - A user-friendly error message
 */
export const getApiErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // If the error has a response from the server
  if (error.response && error.response.data) {
    const { data } = error.response;
    
    if (data.message) {
      return data.message;
    }
    
    if (data.error) {
      return data.error;
    }
  }
  
  // Handle specific HTTP status codes
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your information.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred with your request.';
      case 422:
        return 'Validation error. Please check your information.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Error (${error.response.status}): Please try again later.`;
    }
  }
  
  // Network errors
  if (error.message && error.message.includes('Network Error')) {
    return 'Network error. Please check your internet connection.';
  }
  
  // Default error message
  return error.message || 'An unexpected error occurred. Please try again.';
};
