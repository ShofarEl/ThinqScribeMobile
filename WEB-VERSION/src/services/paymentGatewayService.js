// Payment Gateway Service
// Intelligently selects between Paystack (Africa) and Stripe (Global) based on user location

import locationService from './locationService';
import currencyService from './currencyService';

class PaymentGatewayService {
  constructor() {
    // Payment gateway configurations
    this.gateways = {
      paystack: {
        name: 'Paystack',
        id: 'paystack',
        description: 'Secure payments for Africa',
        logo: '🏦',
        regions: ['Africa'],
        supportedCountries: [
          'NG', 'GH', 'ZA', 'KE' // Primary Paystack countries
        ],
        supportedCurrencies: ['NGN', 'GHS', 'ZAR', 'KES', 'USD'],
        methods: ['card', 'bank_transfer', 'ussd', 'qr', 'mobile_money'],
        features: [
          'Local bank transfers',
          'Mobile money payments',
          'USSD payments',
          'QR code payments',
          'Card payments (Visa, Mastercard, Verve)'
        ],
        advantages: [
          'No international transaction fees',
          'Instant bank transfers',
          'Local payment methods',
          'Better success rates in Africa'
        ],
        baseUrl: 'https://api.paystack.co',
        testMode: process.env.NODE_ENV !== 'production'
      },
      stripe: {
        name: 'Stripe',
        id: 'stripe',
        description: 'Global payment processing',
        logo: '💳',
        regions: ['Global', 'Americas', 'Europe', 'Asia', 'Oceania'],
        supportedCountries: [], // Global - too many to list
        supportedCurrencies: [
          'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR', 
          'BRL', 'MXN', 'RUB', 'TRY', 'SAR', 'AED'
        ],
        methods: ['card', 'bank_transfer', 'digital_wallets'],
        features: [
          'International card payments',
          'Digital wallets (Apple Pay, Google Pay)',
          'Bank transfers (ACH, SEPA)',
          'Buy now, pay later options'
        ],
        advantages: [
          'Global reach',
          'Multi-currency support',
          'Advanced fraud protection',
          'Comprehensive payment methods'
        ],
        baseUrl: 'https://api.stripe.com',
        testMode: process.env.NODE_ENV !== 'production'
      }
    };

    // Payment method configurations
    this.paymentMethods = {
      // Card payments (both gateways)
      card: {
        name: 'Credit/Debit Card',
        icon: '💳',
        description: 'Visa, Mastercard, American Express',
        availableOn: ['paystack', 'stripe'],
        processingTime: 'Instant',
        fees: 'Standard gateway fees apply'
      },
      
      // Bank transfers
      bank_transfer: {
        name: 'Bank Transfer',
        icon: '🏦',
        description: 'Direct bank account transfer',
        availableOn: ['paystack', 'stripe'],
        processingTime: '1-3 business days',
        fees: 'Lower fees than cards'
      },
      
      // Mobile money (Africa-specific)
      mobile_money: {
        name: 'Mobile Money',
        icon: '📱',
        description: 'MTN, Airtel, Vodafone, etc.',
        availableOn: ['paystack'],
        processingTime: 'Instant',
        fees: 'Network charges may apply',
        countries: ['GH', 'KE', 'UG', 'TZ']
      },
      
      // USSD (Nigeria-specific)
      ussd: {
        name: 'USSD Payment',
        icon: '*️⃣',
        description: 'Pay with your phone using bank USSD',
        availableOn: ['paystack'],
        processingTime: 'Instant',
        fees: 'No additional fees',
        countries: ['NG']
      },
      
      // QR Code payments
      qr: {
        name: 'QR Code',
        icon: '📱',
        description: 'Scan to pay with your banking app',
        availableOn: ['paystack'],
        processingTime: 'Instant',
        fees: 'No additional fees',
        countries: ['NG', 'GH']
      },
      
      // Digital wallets (Global)
      digital_wallets: {
        name: 'Digital Wallets',
        icon: '📱',
        description: 'Apple Pay, Google Pay, PayPal',
        availableOn: ['stripe'],
        processingTime: 'Instant',
        fees: 'Standard wallet fees apply'
      }
    };
  }

  // Get recommended payment gateway based on user location
  async getRecommendedGateway(userLocation = null) {
    try {
      // Get user location if not provided
      if (!userLocation) {
        userLocation = await locationService.getLocation();
      }

      console.log('💳 Determining payment gateway for:', userLocation);

      // Check if user is in Africa (prioritize Paystack)
      if (userLocation.isAfrican) {
        // Check if specifically supported by Paystack
        if (this.gateways.paystack.supportedCountries.includes(userLocation.countryCode)) {
          return {
            primary: this.gateways.paystack,
            fallback: this.gateways.stripe,
            reason: `Optimized for ${userLocation.country}`,
            recommendation: 'Use Paystack for better local payment options and lower fees'
          };
        } else {
          // Other African countries - still prefer Paystack but mention limited support
          return {
            primary: this.gateways.paystack,
            fallback: this.gateways.stripe,
            reason: `African region - ${userLocation.country}`,
            recommendation: 'Paystack recommended for African markets, Stripe as backup'
          };
        }
      }

      // Non-African countries - use Stripe
      return {
        primary: this.gateways.stripe,
        fallback: this.gateways.paystack,
        reason: `Global market - ${userLocation.country}`,
        recommendation: 'Stripe recommended for international payments'
      };

    } catch (error) {
      console.error('❌ Error determining payment gateway:', error);
      
      // Default fallback
      return {
        primary: this.gateways.stripe,
        fallback: this.gateways.paystack,
        reason: 'Default selection',
        recommendation: 'Stripe as default with Paystack fallback'
      };
    }
  }

  // Get available payment methods for a specific gateway and location
  getAvailablePaymentMethods(gatewayId, userLocation) {
    const gateway = this.gateways[gatewayId];
    if (!gateway) return [];

    return Object.entries(this.paymentMethods)
      .filter(([methodId, method]) => {
        // Check if method is available on this gateway
        if (!method.availableOn.includes(gatewayId)) return false;
        
        // Check country-specific restrictions
        if (method.countries && userLocation?.countryCode) {
          return method.countries.includes(userLocation.countryCode);
        }
        
        return true;
      })
      .map(([methodId, method]) => ({
        id: methodId,
        ...method
      }));
  }

  // Get supported currencies for a gateway
  getSupportedCurrencies(gatewayId) {
    const gateway = this.gateways[gatewayId];
    return gateway ? gateway.supportedCurrencies : [];
  }

  // Check if a currency is supported by a gateway
  isCurrencySupported(gatewayId, currencyCode) {
    const supportedCurrencies = this.getSupportedCurrencies(gatewayId);
    return supportedCurrencies.includes(currencyCode);
  }

  // Get payment configuration for a specific scenario
  async getPaymentConfig(amount, currency, userLocation = null) {
    try {
      // Get user location if not provided
      if (!userLocation) {
        userLocation = await locationService.getLocation();
      }

      // Get recommended gateway
      const gatewayRecommendation = await this.getRecommendedGateway(userLocation);
      const primaryGateway = gatewayRecommendation.primary;
      const fallbackGateway = gatewayRecommendation.fallback;

      // Check currency support
      let selectedGateway = primaryGateway;
      let currencySupported = this.isCurrencySupported(primaryGateway.id, currency);

      if (!currencySupported) {
        // Try fallback gateway
        if (this.isCurrencySupported(fallbackGateway.id, currency)) {
          selectedGateway = fallbackGateway;
          currencySupported = true;
        } else {
          // Convert to USD as last resort
          const conversion = await currencyService.convert(amount, currency, 'USD');
          amount = conversion.convertedAmount;
          currency = 'USD';
          currencySupported = true;
        }
      }

      // Get available payment methods
      const paymentMethods = this.getAvailablePaymentMethods(selectedGateway.id, userLocation);

      // Format amount
      const formattedAmount = currencyService.format(amount, currency);

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

  // Get public key for gateway (from environment variables)
  getPublicKey(gatewayId) {
    switch (gatewayId) {
      case 'paystack':
        return process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'pk_test_paystack_key';
      case 'stripe':
        return process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_stripe_key';
      default:
        return null;
    }
  }

  // Get all available gateways
  getAllGateways() {
    return Object.values(this.gateways);
  }

  // Get gateway by ID
  getGateway(gatewayId) {
    return this.gateways[gatewayId] || null;
  }

  // Get payment method details
  getPaymentMethod(methodId) {
    return this.paymentMethods[methodId] || null;
  }

  // Calculate fees for a payment (estimate)
  calculateFees(amount, currency, gatewayId, paymentMethodId) {
    // This is a simplified fee calculation
    // In production, you'd call the respective gateway APIs for accurate fees
    
    const baseRates = {
      paystack: {
        card: 0.015, // 1.5%
        bank_transfer: 0.01, // 1%
        mobile_money: 0.015, // 1.5%
        ussd: 0.015, // 1.5%
        qr: 0.01 // 1%
      },
      stripe: {
        card: 0.029, // 2.9%
        bank_transfer: 0.008, // 0.8%
        digital_wallets: 0.029 // 2.9%
      }
    };

    const gateway = baseRates[gatewayId];
    if (!gateway) return { fee: 0, total: amount };

    const rate = gateway[paymentMethodId] || 0.025; // Default 2.5%
    const fee = Math.round(amount * rate * 100) / 100;
    const total = amount + fee;

    return {
      fee,
      total,
      rate: rate * 100, // Return as percentage
      currency,
      formattedFee: currencyService.format(fee, currency),
      formattedTotal: currencyService.format(total, currency)
    };
  }

  // Validate payment configuration
  validatePaymentConfig(config) {
    const errors = [];

    if (!config.amount || config.amount <= 0) {
      errors.push('Invalid payment amount');
    }

    if (!config.currency || !currencyService.getCurrencyInfo(config.currency)) {
      errors.push('Invalid or unsupported currency');
    }

    if (!config.gateway || !this.gateways[config.gateway.id]) {
      errors.push('Invalid payment gateway');
    }

    if (!config.paymentMethods || config.paymentMethods.length === 0) {
      errors.push('No payment methods available');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Create singleton instance
const paymentGatewayService = new PaymentGatewayService();

export default paymentGatewayService; 