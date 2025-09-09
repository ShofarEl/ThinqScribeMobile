// Payment Gateway Service - React Native Version
// Handles payment gateway configuration, recommendations, and fee calculations

class PaymentGatewayService {
  constructor() {
    this.gateways = {
      paystack: {
        id: 'paystack',
        name: 'Paystack',
        description: 'Secure payments for Africa',
        logo: '🏦',
        regions: ['Africa'],
        supportedCountries: ['NG', 'GH', 'KE', 'ZA', 'UG', 'TZ', 'RW', 'ZM', 'BW', 'MU', 'EG', 'MA'],
        supportedCurrencies: ['NGN', 'GHS', 'ZAR', 'KES', 'UGX', 'TZS', 'RWF', 'ZMW', 'BWP', 'MUR', 'EGP', 'MAD', 'USD'],
        methods: ['card', 'bank_transfer', 'ussd', 'qr', 'mobile_money'],
        baseUrl: 'https://api.paystack.co',
        testMode: true,
        advantages: [
          'Optimized for African markets',
          'Lower fees for local payments',
          'Supports local payment methods',
          'Fast settlement times'
        ]
      },
      stripe: {
        id: 'stripe',
        name: 'Stripe',
        description: 'Global payment processing',
        logo: '💳',
        regions: ['Global'],
        supportedCountries: [],
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK', 'INR', 'SGD', 'HKD', 'MYR'],
        methods: ['card', 'bank_transfer', 'digital_wallets'],
        baseUrl: 'https://api.stripe.com',
        testMode: true,
        advantages: [
          'Global reach and reliability',
          'Advanced fraud protection',
          'Comprehensive API',
          'Strong developer tools'
        ]
      }
    };

    this.paymentMethods = {
      card: {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, American Express',
        processingTime: 'Instant',
        fees: 'Standard gateway fees',
        icon: 'credit-card'
      },
      bank_transfer: {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Direct bank account transfer',
        processingTime: '1-3 business days',
        fees: 'Lower fees than cards',
        icon: 'bank'
      },
      mobile_money: {
        id: 'mobile_money',
        name: 'Mobile Money',
        description: 'MTN, Airtel, Vodafone, etc.',
        processingTime: 'Instant',
        fees: 'Network charges may apply',
        countries: ['GH', 'KE', 'UG', 'TZ'],
        icon: 'cellphone'
      },
      ussd: {
        id: 'ussd',
        name: 'USSD Payment',
        description: 'Pay with your phone using bank USSD',
        processingTime: 'Instant',
        fees: 'No additional fees',
        countries: ['NG'],
        icon: 'dialpad'
      },
      qr: {
        id: 'qr',
        name: 'QR Code',
        description: 'Scan to pay with your banking app',
        processingTime: 'Instant',
        fees: 'No additional fees',
        countries: ['NG', 'GH'],
        icon: 'qrcode'
      },
      digital_wallets: {
        id: 'digital_wallets',
        name: 'Digital Wallets',
        description: 'Apple Pay, Google Pay, etc.',
        processingTime: 'Instant',
        fees: 'Standard gateway fees',
        icon: 'wallet'
      }
    };

    this.feeRates = {
      paystack: {
        card: 0.015, // 1.5%
        bank_transfer: 0.01, // 1%
        mobile_money: 0.015, // 1.5%
        ussd: 0.015, // 1.5%
        qr: 0.01, // 1%
        fixedFee: 0
      },
      stripe: {
        card: 0.029, // 2.9%
        bank_transfer: 0.008, // 0.8%
        digital_wallets: 0.029, // 2.9%
        fixedFee: 0.30 // $0.30
      }
    };
  }

  // Get all available gateways
  getAllGateways() {
    return Object.values(this.gateways);
  }

  // Get gateway by ID
  getGateway(gatewayId) {
    return this.gateways[gatewayId] || this.gateways.paystack;
  }

  // Get recommended gateway based on location and currency
  getRecommendedGateway(location, currency) {
    const countryCode = location?.countryCode?.toUpperCase();
    const currencyCode = currency?.toUpperCase();

    console.log('💳 [PaymentGatewayService] Getting recommendation:', {
      countryCode,
      currencyCode,
      location: location?.country
    });

    // Check if it's an African country
    const africanCountries = ['NG', 'GH', 'KE', 'ZA', 'UG', 'TZ', 'RW', 'ZM', 'BW', 'MU', 'EG', 'MA'];
    const isAfrican = africanCountries.includes(countryCode);

    // Check if it's an African currency
    const africanCurrencies = ['NGN', 'GHS', 'KES', 'ZAR', 'UGX', 'TZS', 'RWF', 'ZMW', 'BWP', 'MUR', 'EGP', 'MAD'];
    const isAfricanCurrency = africanCurrencies.includes(currencyCode);

    if (isAfrican || isAfricanCurrency) {
      console.log('💳 [PaymentGatewayService] Recommending Paystack for African market');
      return this.gateways.paystack;
    } else {
      console.log('💳 [PaymentGatewayService] Recommending Stripe for global market');
      return this.gateways.stripe;
    }
  }

  // Get available payment methods for a gateway and location
  getAvailablePaymentMethods(gatewayId, userLocation) {
    const gateway = this.getGateway(gatewayId);
    if (!gateway) return [];

    const countryCode = userLocation?.countryCode?.toUpperCase();

    return Object.values(this.paymentMethods).filter(method => {
      // Check if method is available on this gateway
      if (!gateway.methods.includes(method.id)) return false;

      // Check country-specific restrictions
      if (method.countries && countryCode) {
        return method.countries.includes(countryCode);
      }

      return true;
    });
  }

  // Check if gateway supports currency
  isCurrencySupported(gatewayId, currencyCode) {
    const gateway = this.getGateway(gatewayId);
    return gateway ? gateway.supportedCurrencies.includes(currencyCode.toUpperCase()) : false;
  }

  // Calculate payment fees
  calculateFees(amount, currency, gatewayId, paymentMethodId) {
    const gateway = this.getGateway(gatewayId);
    if (!gateway) return { fee: 0, total: amount, rate: '0' };

    const rates = this.feeRates[gatewayId];
    if (!rates) return { fee: 0, total: amount, rate: '0' };

    const methodRate = rates[paymentMethodId] || rates.card;
    const percentageFee = amount * methodRate;
    const fixedFee = rates.fixedFee || 0;
    const totalFee = percentageFee + fixedFee;
    const total = amount + totalFee;

    return {
      fee: Math.round(totalFee * 100) / 100,
      total: Math.round(total * 100) / 100,
      rate: (methodRate * 100).toFixed(2),
      percentageFee: Math.round(percentageFee * 100) / 100,
      fixedFee: fixedFee
    };
  }

  // Get payment configuration for a specific scenario
  getPaymentConfig(amount, currency, userLocation) {
    const recommendedGateway = this.getRecommendedGateway(userLocation, currency);
    const availableMethods = this.getAvailablePaymentMethods(recommendedGateway.id, userLocation);

    return {
      gateway: recommendedGateway,
      amount,
      currency,
      paymentMethods: availableMethods,
      userLocation,
      recommendation: {
        gateway: recommendedGateway.id,
        reason: this.getRecommendationReason(userLocation, currency),
        confidence: 'high'
      }
    };
  }

  // Get recommendation reason
  getRecommendationReason(location, currency) {
    const countryCode = location?.countryCode?.toUpperCase();
    const currencyCode = currency?.toUpperCase();

    const africanCountries = ['NG', 'GH', 'KE', 'ZA', 'UG', 'TZ', 'RW', 'ZM', 'BW', 'MU', 'EG', 'MA'];
    const africanCurrencies = ['NGN', 'GHS', 'KES', 'ZAR', 'UGX', 'TZS', 'RWF', 'ZMW', 'BWP', 'MUR', 'EGP', 'MAD'];

    if (africanCountries.includes(countryCode) || africanCurrencies.includes(currencyCode)) {
      return 'Optimized for African markets with local payment methods';
    } else {
      return 'Global reach with comprehensive payment options';
    }
  }

  // Get public key for gateway (for mobile, these would be in environment variables)
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

  // Format currency amount
  formatCurrency(amount, currency) {
    const currencySymbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'NGN': '₦', 'GHS': 'GH₵',
      'KES': 'KSh', 'ZAR': 'R', 'CAD': 'C$', 'AUD': 'A$', 'JPY': '¥',
      'CNY': '¥', 'INR': '₹', 'BRL': 'R$', 'MXN': '$', 'RUB': '₽',
      'TRY': '₺', 'SAR': '﷼', 'AED': 'د.إ', 'EGP': 'E£', 'MAD': 'MAD'
    };

    const symbol = currencySymbols[currency] || currency;
    const decimals = ['JPY', 'KRW', 'VND', 'UGX', 'RWF', 'KMF', 'DJF', 'GNF', 'MGA'].includes(currency) ? 0 : 2;

    return `${symbol}${amount.toFixed(decimals)}`;
  }

  // Get gateway advantages
  getGatewayAdvantages(gatewayId) {
    const gateway = this.getGateway(gatewayId);
    return gateway?.advantages || [];
  }

  // Check if gateway is recommended for currency
  isGatewayRecommendedForCurrency(gatewayId, currency) {
    const gateway = this.getGateway(gatewayId);
    const africanCurrencies = ['NGN', 'GHS', 'KES', 'ZAR', 'UGX', 'TZS', 'RWF', 'ZMW', 'BWP', 'MUR', 'EGP', 'MAD'];
    
    if (gatewayId === 'paystack' && africanCurrencies.includes(currency.toUpperCase())) {
      return true;
    }
    
    if (gatewayId === 'stripe' && !africanCurrencies.includes(currency.toUpperCase())) {
      return true;
    }
    
    return false;
  }
}

// Create singleton instance
const paymentGatewayService = new PaymentGatewayService();

export default paymentGatewayService;
