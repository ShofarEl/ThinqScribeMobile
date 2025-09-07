// Error message mapping utility
export const getErrorMessage = (error) => {
  // If error has a response with data, use that first
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  // Map status codes to user-friendly messages
  const statusCode = error.response?.status;
  
  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Invalid email or password. Please check your credentials and try again.';
    case 403:
      return 'Access denied. You don\'t have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This resource already exists. Please try a different option.';
    case 422:
      return 'Invalid data provided. Please check your input and try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Service temporarily unavailable. Please try again later.';
    case 503:
      return 'Service is currently unavailable. Please try again later.';
    case 504:
      return 'Request timeout. Please try again later.';
    default:
      // If no status code or unknown status code
      if (error.message) {
        return error.message;
      }
      return 'An unexpected error occurred. Please try again.';
  }
};

// Specific error messages for different operations
export const getAuthErrorMessage = (error) => {
  const statusCode = error.response?.status;
  
  switch (statusCode) {
    case 401:
      return 'Invalid email or password. Please check your credentials and try again.';
    case 403:
      return 'Your account has been suspended. Please contact support.';
    case 404:
      return 'Account not found. Please check your email or create a new account.';
    case 409:
      return 'An account with this email already exists. Please sign in instead.';
    case 422:
      return 'Invalid email format or password requirements not met.';
    default:
      return getErrorMessage(error);
  }
};

export const getPaymentErrorMessage = (error) => {
  const statusCode = error.response?.status;
  
  switch (statusCode) {
    case 400:
      return 'Invalid payment information. Please check your details and try again.';
    case 401:
      return 'Payment authentication failed. Please try again.';
    case 402:
      return 'Payment failed. Please check your payment method and try again.';
    case 403:
      return 'Payment not authorized. Please contact support.';
    case 404:
      return 'Payment service not found. Please try again later.';
    case 409:
      return 'Payment already processed. Please check your account.';
    default:
      return getErrorMessage(error);
  }
};

export const getApiErrorMessage = (error) => {
  // Check if it's a network error
  if (!error.response) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  return getErrorMessage(error);
}; 