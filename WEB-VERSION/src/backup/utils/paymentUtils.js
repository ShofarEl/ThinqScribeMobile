/**
 * Utility functions for handling payment-related operations
 */

/**
 * Determines the correct payment status based on multiple factors
 * @param {Object} payment - The payment object
 * @param {string} payment.status - The current status from the backend
 * @param {Date|string} payment.paymentDate - The payment date (if any)
 * @param {boolean} payment.isPaid - Whether the payment is marked as paid
 * @returns {string} The corrected payment status
 */
export const getCorrectPaymentStatus = (payment) => {
  if (!payment) return 'pending';
  
  // If payment has a payment date or is explicitly marked as paid, it's PAID
  if (payment.paymentDate || payment.isPaid) {
    return 'paid';
  }
  
  // Always treat processing payments as paid to fix the UI issue
  if (payment.status === 'processing') {
    return 'paid';
  }
  
  // Otherwise return the original status
  return payment.status || 'pending';
};

/**
 * Gets the appropriate color for a payment status
 * @param {string} status - The payment status
 * @returns {string} The color code for the status
 */
export const getPaymentStatusColor = (status) => {
  const statusColors = {
    paid: 'success',
    processing: 'processing',
    pending: 'warning',
    failed: 'error',
    cancelled: 'default'
  };
  
  return statusColors[status?.toLowerCase()] || statusColors.pending;
};

/**
 * Formats a payment amount (deprecated - use useCurrency hook instead)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount string
 */
export const formatPaymentAmount = (amount) => {
  if (amount === undefined || amount === null) return '$0.00';
  return `$${Number(amount).toFixed(2)}`;
};

/**
 * Format amount with proper currency localization
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'usd')
 * @param {string} symbol - Currency symbol (default: '$')
 * @returns {string} Formatted amount string
 */
export const formatLocalizedAmount = (amount, currency = 'usd', symbol = '$') => {
  if (amount === undefined || amount === null) return `${symbol}0.00`;
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${symbol}${Number(amount).toFixed(2)}`;
  }
};

export default {
  getCorrectPaymentStatus,
  getPaymentStatusColor,
  formatPaymentAmount
}; 