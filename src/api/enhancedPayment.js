// Enhanced Payment API Service - React Native Version
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from './constants.js';

class EnhancedPaymentAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.endpoints = {
      ...API_ENDPOINTS.PAYMENT
    };
  }

  // Helper method to get authorization headers
  async getAuthHeaders() {
    const token = await AsyncStorage.getItem('thinqscribe_auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Helper method to make authenticated API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(await this.getAuthHeaders())
      },
      ...options
    };

    console.log('💳 [EnhancedPayment] Making request to:', url);
    console.log('💳 [EnhancedPayment] Method:', defaultOptions.method);

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { message: `HTTP ${response.status}` };
        }

        console.error('💳 [EnhancedPayment] Request failed:', response.status, errorData);
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('💳 [EnhancedPayment] Request successful:', endpoint);
      return data;

    } catch (error) {
      console.error('💳 [EnhancedPayment] Request failed:', error);
      throw error;
    }
  }

  // Get payment gateway recommendation based on location
  async getGatewayRecommendation(locationData) {
    try {
      console.log('💳 [EnhancedPayment] Getting gateway recommendation for:', locationData);
      const response = await this.makeRequest(this.endpoints.GATEWAY_RECOMMENDATION, {
        method: 'POST',
        body: JSON.stringify({
          countryCode: locationData.countryCode,
          currency: locationData.recommendedCurrency || locationData.currency,
          amount: 100
        })
      });
      console.log('💳 [EnhancedPayment] Gateway recommendation response:', response);
      return response;
    } catch (error) {
      console.error('Failed to get gateway recommendation:', error);
      console.log('💳 [EnhancedPayment] Using fallback gateway recommendation');
      return {
        recommendation: { gateway: 'paystack', reason: 'fallback', confidence: 'low' },
        paymentMethods: ['card'],
        gatewayConfig: { name: 'Paystack', currency: 'ngn' },
        defaultCurrency: 'ngn'
      };
    }
  }

  // Create enhanced checkout session
  async createEnhancedCheckoutSession(paymentData) {
    try {
      // 🔧 CRITICAL: Validate payment data before sending (matching web version)
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

  // 🔧 NEW: Validate payment data before API call (from web version)
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
      if (fromCurrency === toCurrency) {
        return amount;
      }

      const rate = await this.getCurrencyRate(fromCurrency, toCurrency, amount);
      return rate.convertedAmount || amount;
    } catch (error) {
      console.error('Failed to convert currency:', error);
      return amount;
    }
  }

  // Get payment configuration for a specific scenario
  async getPaymentConfig(amount, currency, userLocation = null) {
    try {
      // Get user location if not provided
      if (!userLocation) {
        userLocation = await this.getUserLocation();
      }

      // Get recommended gateway
      const gatewayRecommendation = await this.getGatewayRecommendation(userLocation);
      const primaryGateway = this.getGateway(gatewayRecommendation.recommendation.gateway);
      const fallbackGateway = this.getGateway('paystack'); // Default fallback

      // Check currency support
      let selectedGateway = primaryGateway;
      let currencySupported = this.isCurrencySupported(primaryGateway.id, currency);

      if (!currencySupported) {
        selectedGateway = fallbackGateway;
        currencySupported = true;
      }

      // Get available payment methods
      const paymentMethods = this.getAvailablePaymentMethods(selectedGateway.id, userLocation);

      // Format amount
      const formattedAmount = this.formatCurrency(amount, currency);

      return {
        gateway: selectedGateway,
        fallbackGateway: selectedGateway.id === primaryGateway.id ? fallbackGateway : primaryGateway,
        amount,
        currency,
        formattedAmount,
        paymentMethods,
        userLocation,
        recommendation: gatewayRecommendation.recommendation,
        reason: gatewayRecommendation.reason,
        config: {
          publicKey: this.getPublicKey(selectedGateway.id),
          testMode: selectedGateway.testMode,
          baseUrl: selectedGateway.baseUrl
        }
      };

    } catch (error) {
      console.error('❌ Error getting payment config:', error);
      throw new Error('Failed to configure payment options');
    }
  }

  // Get public key for gateway
  getPublicKey(gatewayId) {
    switch (gatewayId) {
      case 'paystack':
        return process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_paystack_key';
      case 'stripe':
        return process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY || 'pk_test_stripe_key';
      default:
        return null;
    }
  }

  // Get gateway by ID
  getGateway(gatewayId) {
    const gateways = {
      paystack: {
        id: 'paystack',
        name: 'Paystack',
        description: 'Secure payments for Africa',
        logo: '🏦',
        regions: ['Africa'],
        supportedCountries: ['NG', 'GH', 'KE', 'ZA'],
        supportedCurrencies: ['NGN', 'GHS', 'ZAR', 'KES', 'USD'],
        methods: ['card', 'bank_transfer', 'ussd', 'qr', 'mobile_money'],
        baseUrl: 'https://api.paystack.co',
        testMode: true
      },
      stripe: {
        id: 'stripe',
        name: 'Stripe',
        description: 'Global payment processing',
        logo: '💳',
        regions: ['Global'],
        supportedCountries: [],
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
        methods: ['card', 'bank_transfer', 'digital_wallets'],
        baseUrl: 'https://api.stripe.com',
        testMode: true
      }
    };

    return gateways[gatewayId] || gateways.paystack;
  }

  // Get available payment methods for a specific gateway and location
  getAvailablePaymentMethods(gatewayId, userLocation) {
    const gateway = this.getGateway(gatewayId);
    if (!gateway) return [];

    const allMethods = {
      card: {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, American Express',
        processingTime: 'Instant',
        fees: 'Standard gateway fees'
      },
      bank_transfer: {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Direct bank account transfer',
        processingTime: '1-3 business days',
        fees: 'Lower fees than cards'
      },
      mobile_money: {
        id: 'mobile_money',
        name: 'Mobile Money',
        description: 'MTN, Airtel, Vodafone, etc.',
        processingTime: 'Instant',
        fees: 'Network charges may apply',
        countries: ['GH', 'KE', 'UG', 'TZ']
      },
      ussd: {
        id: 'ussd',
        name: 'USSD Payment',
        description: 'Pay with your phone using bank USSD',
        processingTime: 'Instant',
        fees: 'No additional fees',
        countries: ['NG']
      },
      qr: {
        id: 'qr',
        name: 'QR Code',
        description: 'Scan to pay with your banking app',
        processingTime: 'Instant',
        fees: 'No additional fees',
        countries: ['NG', 'GH']
      }
    };

    return Object.values(allMethods).filter(method => {
      // Check if method is available on this gateway
      if (!gateway.methods.includes(method.id)) return false;

      // Check country-specific restrictions
      if (method.countries && userLocation?.countryCode) {
        return method.countries.includes(userLocation.countryCode);
      }

      return true;
    });
  }

  // Check if a currency is supported by a gateway
  isCurrencySupported(gatewayId, currencyCode) {
    const gateway = this.getGateway(gatewayId);
    return gateway ? gateway.supportedCurrencies.includes(currencyCode.toUpperCase()) : false;
  }

  // Calculate payment fees
  calculateFees(amount, gatewayId, paymentMethodId) {
    const baseRates = {
      paystack: {
        card: 0.015,
        bank_transfer: 0.01,
        mobile_money: 0.015,
        ussd: 0.015,
        qr: 0.01
      },
      stripe: {
        card: 0.029,
        bank_transfer: 0.008,
        digital_wallets: 0.029
      }
    };

    const gateway = baseRates[gatewayId];
    if (!gateway) return { fee: 0, total: amount };

    const rate = gateway[paymentMethodId] || 0.025;
    const fee = Math.round(amount * rate * 100) / 100;
    const total = amount + fee;

    return {
      fee,
      total,
      rate: rate * 100,
      formattedFee: this.formatCurrency(fee, 'NGN'),
      formattedTotal: this.formatCurrency(total, 'NGN')
    };
  }

  // Format currency amount
  formatCurrency(amount, currency) {
    const currencySymbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'NGN': '₦', 'GHS': 'GH₵',
      'KES': 'KSh', 'ZAR': 'R', 'CAD': 'C$', 'AUD': 'A$'
    };

    const symbol = currencySymbols[currency] || currency;
    const decimals = ['JPY', 'KRW', 'VND'].includes(currency) ? 0 : 2;

    return `${symbol}${amount.toFixed(decimals)}`;
  }

  // Get user location (simplified for mobile)
  async getUserLocation() {
    try {
      // For mobile, we'll use a simplified location detection
      // In production, you might want to use react-native-geolocation-service
      return {
        country: 'Nigeria',
        countryCode: 'NG',
        city: 'Lagos',
        region: 'Lagos',
        currency: 'NGN',
        isAfrican: true,
        preferredPaymentGateway: 'paystack',
        flag: '🇳🇬',
        displayName: 'Lagos, Nigeria'
      };
    } catch (error) {
      console.error('Failed to get user location:', error);
      return {
        country: 'United States',
        countryCode: 'US',
        currency: 'USD',
        isAfrican: false,
        preferredPaymentGateway: 'stripe',
        flag: '🇺🇸',
        displayName: 'New York, United States'
      };
    }
  }

  // Legacy payment methods for backward compatibility
  async createPaymentSession(agreementId, paymentType = 'next', amount) {
    try {
      const response = await this.makeRequest(this.endpoints.CREATE_CHECKOUT_SESSION, {
        method: 'POST',
        body: JSON.stringify({ agreementId, paymentType, amount })
      });
      return response;
    } catch (error) {
      console.error('Failed to create payment session:', error);
      throw error;
    }
  }
}

// Export singleton instance
const enhancedPaymentAPI = new EnhancedPaymentAPI();
export default enhancedPaymentAPI;
