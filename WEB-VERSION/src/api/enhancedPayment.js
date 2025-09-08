import { getPaymentErrorMessage } from '../utils/errorMessages.js';
import { API_BASE_URL, API_ENDPOINTS } from './constants.js';

// Enhanced Payment API Service
class EnhancedPaymentAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.endpoints = API_ENDPOINTS.PAYMENT;
  }

  // Helper method to make authenticated API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get the correct auth token key used throughout the app
    const token = localStorage.getItem('thinqscribe_auth_token');
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...options
    };
    
    // Debug logging for authentication
    console.log('💳 [EnhancedPayment] Making request to:', url);
    console.log('💳 [EnhancedPayment] Method:', defaultOptions.method);
    console.log('💳 [EnhancedPayment] Token exists:', !!token);
    if (token) {
      console.log('💳 [EnhancedPayment] Token preview:', token.substring(0, 20) + '...');
    }
    if (defaultOptions.body) {
      console.log('💳 [EnhancedPayment] Request body:', defaultOptions.body);
    }

    try {
      const response = await fetch(url, defaultOptions);
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('💳 [EnhancedPayment] Failed to parse response as JSON:', parseError);
        data = { message: `Invalid response format (${response.status})` };
      }
      
      if (!response.ok) {
        console.error('💳 [EnhancedPayment] Request failed with status:', response.status);
        console.error('💳 [EnhancedPayment] Error response:', data);
        
        // Enhanced error handling for auth issues
        if (response.status === 401) {
          console.error('💳 [EnhancedPayment] Authentication failed - token may be expired');
          
          // If token is expired, clear it and suggest re-login
          if (data.message && data.message.includes('token')) {
            localStorage.removeItem('thinqscribe_auth_token');
          }
        }
        
        // Include more details in the error
        const errorMessage = getPaymentErrorMessage({ response: { status: response.status, data } });
        const error = new Error(errorMessage);
        error.status = response.status;
        error.response = data;
        throw error;
      }
      
      console.log('💳 [EnhancedPayment] Request successful:', endpoint);
      return data;
    } catch (error) {
      console.error('💳 [EnhancedPayment] Request failed:', error);
      
      // If it's a network error, provide more context
      if (!error.status && error.message.includes('fetch')) {
        console.error('💳 [EnhancedPayment] Network error - check if backend is running');
      }
      
      throw error;
    }
  }

  // Get payment gateway recommendation based on location
  async getGatewayRecommendation(locationData) {
    try {
      const response = await this.makeRequest(this.endpoints.GATEWAY_RECOMMENDATION, {
        method: 'POST',
        body: JSON.stringify({
          countryCode: locationData.countryCode,
          currency: locationData.recommendedCurrency,
          amount: 100 // Default amount for fee calculation
        })
      });
      return response;
    } catch (error) {
      console.error('Failed to get gateway recommendation:', error);
      return {
        recommendation: { gateway: 'stripe', reason: 'fallback', confidence: 'low' },
        paymentMethods: ['card'],
        gatewayConfig: { name: 'Stripe', currency: 'usd' },
        defaultCurrency: 'usd'
      };
    }
  }

  // Create enhanced checkout session
  async createEnhancedCheckoutSession(paymentData) {
    try {
      // 🔧 CRITICAL: Validate payment data before sending
      const validatedData = this.validatePaymentData(paymentData);
      
      console.log('💳 [EnhancedPayment] Creating checkout session with data:', {
        agreementId: validatedData.agreementId,
        amount: validatedData.amount,
        currency: validatedData.currency,
        gateway: validatedData.gateway,
        paymentMethod: validatedData.paymentMethod,
        location: validatedData.location || validatedData.userLocation,
        validation: { originalAmount: paymentData.amount, validatedAmount: validatedData.amount },
        allKeys: Object.keys(validatedData)
      });
      
      const response = await this.makeRequest(this.endpoints.CREATE_ENHANCED_CHECKOUT, {
        method: 'POST',
        body: JSON.stringify(validatedData)
      });
      
      console.log('💳 [EnhancedPayment] Checkout session response:', response);
      return response;
    } catch (error) {
      console.error('💳 [EnhancedPayment] Failed to create checkout session:', error);
      throw error;
    }
  }

  // 🔧 NEW: Validate payment data before API call
  validatePaymentData(paymentData) {
    const validated = { ...paymentData };
    
    // Ensure amount is valid and properly rounded
    const amount = parseFloat(paymentData.amount);
    if (isNaN(amount) || amount < 0.002) {
      console.error('💳 [EnhancedPayment] Invalid amount:', { original: paymentData.amount, parsed: amount });
      throw new Error(`Invalid payment amount: ${paymentData.amount}. Minimum amount is 0.002.`);
    }
    
    // 🔧 CRITICAL: Round to 3 decimal places and ensure minimum
    const roundedAmount = Math.round(amount * 1000) / 1000;
    const finalAmount = Math.max(roundedAmount, 0.002);
    
    console.log('💳 [EnhancedPayment] Amount validation:', {
      original: paymentData.amount,
      parsed: amount,
      rounded: roundedAmount,
      final: finalAmount
    });
    
    validated.amount = finalAmount;
    
    // Ensure currency is valid
    if (!paymentData.currency || typeof paymentData.currency !== 'string') {
      throw new Error('Invalid currency provided');
    }
    
    validated.currency = paymentData.currency.toLowerCase();
    
    // Ensure gateway is valid
    if (!paymentData.gateway) {
      throw new Error('Payment gateway is required');
    }
    
    // Ensure agreement ID is valid
    if (!paymentData.agreementId) {
      throw new Error('Agreement ID is required');
    }
    
    console.log('💳 [EnhancedPayment] Payment data validated successfully:', {
      amount: validated.amount,
      currency: validated.currency,
      gateway: validated.gateway,
      agreementId: validated.agreementId
    });
    
    return validated;
  }

  // Get currency conversion rate
  async getCurrencyRate(fromCurrency, toCurrency, amount = 1) {
    try {
      const response = await this.makeRequest(
        `${this.endpoints.CURRENCY_RATE}?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
      );
      return response;
    } catch (error) {
      console.error('Failed to get currency rate:', error);
      return {
        from: fromCurrency,
        to: toCurrency,
        originalAmount: amount,
        convertedAmount: amount,
        exchangeRate: 1
      };
    }
  }

  // Get supported currencies
  async getSupportedCurrencies() {
    try {
      const response = await this.makeRequest(this.endpoints.CURRENCIES);
      return response;
    } catch (error) {
      console.error('Failed to get supported currencies:', error);
      return {};
    }
  }

  // Convert currency amount
  async convertCurrency(amount, fromCurrency, toCurrency) {
    try {
      const rate = await this.getCurrencyRate(fromCurrency, toCurrency, amount);
      return {
        success: true,
        originalAmount: amount,
        convertedAmount: rate.convertedAmount,
        exchangeRate: rate.exchangeRate,
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        formattedOriginal: rate.formattedOriginal,
        formattedConverted: rate.formattedConverted
      };
    } catch (error) {
      console.error('Failed to convert currency:', error);
      return {
        success: false,
        error: error.message,
        originalAmount: amount,
        convertedAmount: amount,
        exchangeRate: 1
      };
    }
  }

  // Get payment configuration for a specific gateway and location
  async getPaymentConfig(gateway, countryCode) {
    try {
      const recommendation = await this.getGatewayRecommendation({
        countryCode,
        recommendedCurrency: this.getDefaultCurrency(countryCode)
      });
      
      return {
        gateway,
        name: recommendation.gatewayConfig.name,
        publicKey: recommendation.gatewayConfig.publicKey,
        currency: recommendation.gatewayConfig.currency,
        paymentMethods: recommendation.paymentMethods,
        fees: recommendation.fees,
        features: recommendation.gatewayConfig.features
      };
    } catch (error) {
      console.error('Failed to get payment config:', error);
      return {
        gateway: 'stripe',
        name: 'Stripe',
        currency: 'usd',
        paymentMethods: ['card']
      };
    }
  }

  // Calculate payment fees
  calculatePaymentFees(amount, gateway = 'stripe', isInternational = false) {
    const feeRates = {
      stripe: {
        domestic: 0.029, // 2.9% + $0.30
        international: 0.029,
        fixedFee: 0.30
      },
      paystack: {
        domestic: 0.015, // 1.5%
        international: 0.039, // 3.9%
        fixedFee: 0
      }
    };

    const rates = feeRates[gateway] || feeRates.stripe;
    const feeRate = isInternational ? rates.international : rates.domestic;
    const percentageFee = amount * feeRate;
    const totalFee = percentageFee + rates.fixedFee;

    return {
      amount,
      feeRate,
      percentageFee,
      fixedFee: rates.fixedFee,
      totalFee,
      totalAmount: amount + totalFee,
      gateway
    };
  }

  // Get default currency for country
  getDefaultCurrency(countryCode) {
    const currencyMap = {
      'ng': 'ngn', 'gh': 'ghs', 'ke': 'kes', 'za': 'zar',
      'ug': 'ugx', 'tz': 'tzs', 'rw': 'rwf', 'zm': 'zmw',
      'bw': 'bwp', 'mu': 'mur', 'eg': 'egp', 'ma': 'mad',
      'us': 'usd', 'gb': 'gbp', 'de': 'eur', 'fr': 'eur',
      'it': 'eur', 'es': 'eur', 'nl': 'eur', 'be': 'eur',
      'at': 'eur', 'jp': 'jpy', 'cn': 'cny', 'in': 'inr',
      'ca': 'cad', 'au': 'aud'
    };
    
    return currencyMap[countryCode?.toLowerCase()] || 'usd';
  }

  // Format currency amount
  formatCurrency(amount, currency) {
    const currencySymbols = {
      'usd': '$', 'eur': '€', 'gbp': '£', 'cad': 'C$', 'aud': 'A$', 'jpy': '¥',
      'chf': 'CHF', 'sek': 'kr', 'nok': 'kr', 'dkk': 'kr',
      'ngn': '₦', 'ghs': '₵', 'kes': 'KSh', 'zar': 'R', 'ugx': 'USh',
      'tzs': 'TSh', 'rwf': 'FRw', 'zmw': 'ZK', 'bwp': 'P', 'mur': '₨',
      'egp': 'E£', 'mad': 'MAD', 'dza': 'DA', 'tnd': 'TD', 'xaf': 'FCFA',
      'xof': 'CFA', 'etb': 'Br', 'aoa': 'Kz', 'mzn': 'MT', 'sll': 'Le',
      'lrd': 'L$', 'gnf': 'FG', 'cdf': 'FC', 'mga': 'Ar', 'kmf': 'CF',
      'djf': 'Fdj', 'sos': 'Sh', 'stn': 'Db', 'cve': '$', 'gmd': 'D',
      'inr': '₹', 'cny': '¥', 'krw': '₩', 'sgd': 'S$', 'hkd': 'HK$',
      'myr': 'RM', 'thb': '฿', 'php': '₱', 'idr': 'Rp', 'vnd': '₫'
    };
    
    const symbol = currencySymbols[currency.toLowerCase()] || currency.toUpperCase();
    const decimals = ['jpy', 'krw', 'vnd', 'ugx', 'rwf', 'kmf', 'djf', 'gnf', 'mga'].includes(currency.toLowerCase()) ? 0 : 2;
    
    return `${symbol}${amount.toFixed(decimals)}`;
  }

  // Get currency info
  getCurrencyInfo(currency) {
    const currencyData = {
      'usd': { name: 'US Dollar', symbol: '$', decimals: 2, flag: '🇺🇸' },
      'eur': { name: 'Euro', symbol: '€', decimals: 2, flag: '🇪🇺' },
      'gbp': { name: 'British Pound', symbol: '£', decimals: 2, flag: '🇬🇧' },
      'ngn': { name: 'Nigerian Naira', symbol: '₦', decimals: 2, flag: '🇳🇬' },
      'ghs': { name: 'Ghanaian Cedi', symbol: '₵', decimals: 2, flag: '🇬🇭' },
      'kes': { name: 'Kenyan Shilling', symbol: 'KSh', decimals: 2, flag: '🇰🇪' },
      'zar': { name: 'South African Rand', symbol: 'R', decimals: 2, flag: '🇿🇦' },
      'ugx': { name: 'Ugandan Shilling', symbol: 'USh', decimals: 0, flag: '🇺🇬' },
      'inr': { name: 'Indian Rupee', symbol: '₹', decimals: 2, flag: '🇮🇳' },
      'cad': { name: 'Canadian Dollar', symbol: 'C$', decimals: 2, flag: '🇨🇦' },
      'aud': { name: 'Australian Dollar', symbol: 'A$', decimals: 2, flag: '🇦🇺' },
      'jpy': { name: 'Japanese Yen', symbol: '¥', decimals: 0, flag: '🇯🇵' }
    };
    
    return currencyData[currency.toLowerCase()] || {
      name: currency.toUpperCase(),
      symbol: currency.toUpperCase(),
      decimals: 2,
      flag: '🌍'
    };
  }

  // Check if gateway supports currency
  gatewaySupportsCurrenty(gateway, currency) {
    const supportedCurrencies = {
      stripe: ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'chf', 'sek', 'nok', 'dkk', 'inr', 'sgd', 'hkd', 'myr'],
      paystack: ['ngn', 'ghs', 'kes', 'zar', 'ugx', 'tzs', 'rwf', 'zmw', 'egp', 'mad']
    };
    
    return supportedCurrencies[gateway]?.includes(currency.toLowerCase()) || false;
  }

  // Get popular currencies for region
  getPopularCurrencies(region = 'global') {
    const regionCurrencies = {
      global: ['usd', 'eur', 'gbp', 'jpy', 'cad', 'aud'],
      africa: ['ngn', 'ghs', 'kes', 'zar', 'ugx', 'tzs', 'rwf', 'zmw', 'egp', 'mad'],
      asia: ['inr', 'cny', 'krw', 'sgd', 'hkd', 'myr', 'thb', 'php', 'idr', 'vnd'],
      europe: ['eur', 'gbp', 'chf', 'sek', 'nok', 'dkk']
    };
    
    return regionCurrencies[region.toLowerCase()] || regionCurrencies.global;
  }

  // Legacy payment methods (for backward compatibility)
  async createCheckoutSession(agreementId, paymentType = 'next', amount) {
    try {
      const response = await this.makeRequest(this.endpoints.CREATE_CHECKOUT_SESSION, {
        method: 'POST',
        body: JSON.stringify({ agreementId, paymentType, amount })
      });
      return response;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw error;
    }
  }

  // Get payment stats
  async getPaymentStats() {
    try {
      const response = await this.makeRequest(this.endpoints.STATS);
      return response;
    } catch (error) {
      console.error('Failed to get payment stats:', error);
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory() {
    try {
      const response = await this.makeRequest(this.endpoints.HISTORY);
      return response;
    } catch (error) {
      console.error('Failed to get payment history:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new EnhancedPaymentAPI(); 