// Currency Service
// Handles multi-currency support, exchange rates, and currency formatting

class CurrencyService {
  constructor() {
    this.baseCurrency = 'USD'; // Base currency for exchange rates
    this.cache = {
      rates: null,
      timestamp: null,
      ttl: 1000 * 60 * 60 // 1 hour cache for exchange rates
    };

    // Currency configuration with symbols and formatting
    this.currencies = {
      // Major Global Currencies
      'USD': {
        name: 'US Dollar',
        symbol: '$',
        code: 'USD',
        decimals: 2,
        symbolFirst: true,
        region: 'Americas'
      },
      'EUR': {
        name: 'Euro',
        symbol: '€',
        code: 'EUR',
        decimals: 2,
        symbolFirst: false,
        region: 'Europe'
      },
      'GBP': {
        name: 'British Pound',
        symbol: '£',
        code: 'GBP',
        decimals: 2,
        symbolFirst: true,
        region: 'Europe'
      },
      'CAD': {
        name: 'Canadian Dollar',
        symbol: 'C$',
        code: 'CAD',
        decimals: 2,
        symbolFirst: true,
        region: 'Americas'
      },
      'AUD': {
        name: 'Australian Dollar',
        symbol: 'A$',
        code: 'AUD',
        decimals: 2,
        symbolFirst: true,
        region: 'Oceania'
      },
      'JPY': {
        name: 'Japanese Yen',
        symbol: '¥',
        code: 'JPY',
        decimals: 0,
        symbolFirst: true,
        region: 'Asia'
      },
      'CNY': {
        name: 'Chinese Yuan',
        symbol: '¥',
        code: 'CNY',
        decimals: 2,
        symbolFirst: true,
        region: 'Asia'
      },
      'INR': {
        name: 'Indian Rupee',
        symbol: '₹',
        code: 'INR',
        decimals: 2,
        symbolFirst: true,
        region: 'Asia'
      },

      // African Currencies (Primary Focus)
      'NGN': {
        name: 'Nigerian Naira',
        symbol: '₦',
        code: 'NGN',
        decimals: 2,
        symbolFirst: true,
        region: 'Africa',
        popular: true
      },
      'GHS': {
        name: 'Ghanaian Cedi',
        symbol: 'GH₵',
        code: 'GHS',
        decimals: 2,
        symbolFirst: true,
        region: 'Africa'
      },
      'KES': {
        name: 'Kenyan Shilling',
        symbol: 'KSh',
        code: 'KES',
        decimals: 2,
        symbolFirst: true,
        region: 'Africa'
      },
      'ZAR': {
        name: 'South African Rand',
        symbol: 'R',
        code: 'ZAR',
        decimals: 2,
        symbolFirst: true,
        region: 'Africa'
      },
      'EGP': {
        name: 'Egyptian Pound',
        symbol: 'E£',
        code: 'EGP',
        decimals: 2,
        symbolFirst: true,
        region: 'Africa'
      },
      'MAD': {
        name: 'Moroccan Dirham',
        symbol: 'MAD',
        code: 'MAD',
        decimals: 2,
        symbolFirst: false,
        region: 'Africa'
      },
      'TND': {
        name: 'Tunisian Dinar',
        symbol: 'د.ت',
        code: 'TND',
        decimals: 3,
        symbolFirst: false,
        region: 'Africa'
      },
      'ETB': {
        name: 'Ethiopian Birr',
        symbol: 'Br',
        code: 'ETB',
        decimals: 2,
        symbolFirst: false,
        region: 'Africa'
      },
      'UGX': {
        name: 'Ugandan Shilling',
        symbol: 'USh',
        code: 'UGX',
        decimals: 0,
        symbolFirst: true,
        region: 'Africa'
      },
      'TZS': {
        name: 'Tanzanian Shilling',
        symbol: 'TSh',
        code: 'TZS',
        decimals: 2,
        symbolFirst: true,
        region: 'Africa'
      },
      'MZN': {
        name: 'Mozambican Metical',
        symbol: 'MT',
        code: 'MZN',
        decimals: 2,
        symbolFirst: false,
        region: 'Africa'
      },
      'ZMW': {
        name: 'Zambian Kwacha',
        symbol: 'ZK',
        code: 'ZMW',
        decimals: 2,
        symbolFirst: true,
        region: 'Africa'
      },
      'BWP': {
        name: 'Botswana Pula',
        symbol: 'P',
        code: 'BWP',
        decimals: 2,
        symbolFirst: true,
        region: 'Africa'
      },
      'MUR': {
        name: 'Mauritian Rupee',
        symbol: '₨',
        code: 'MUR',
        decimals: 2,
        symbolFirst: true,
        region: 'Africa'
      },

      // Middle East Currencies
      'SAR': {
        name: 'Saudi Riyal',
        symbol: '﷼',
        code: 'SAR',
        decimals: 2,
        symbolFirst: false,
        region: 'Middle East'
      },
      'AED': {
        name: 'UAE Dirham',
        symbol: 'د.إ',
        code: 'AED',
        decimals: 2,
        symbolFirst: false,
        region: 'Middle East'
      },

      // Other Popular Currencies
      'BRL': {
        name: 'Brazilian Real',
        symbol: 'R$',
        code: 'BRL',
        decimals: 2,
        symbolFirst: true,
        region: 'Americas'
      },
      'MXN': {
        name: 'Mexican Peso',
        symbol: '$',
        code: 'MXN',
        decimals: 2,
        symbolFirst: true,
        region: 'Americas'
      },
      'RUB': {
        name: 'Russian Ruble',
        symbol: '₽',
        code: 'RUB',
        decimals: 2,
        symbolFirst: false,
        region: 'Europe'
      },
      'TRY': {
        name: 'Turkish Lira',
        symbol: '₺',
        code: 'TRY',
        decimals: 2,
        symbolFirst: false,
        region: 'Asia'
      }
    };

    // Exchange rate providers (with fallbacks)
    this.exchangeRateProviders = [
      {
        name: 'exchangerate-api',
        url: (base) => `https://api.exchangerate-api.com/v4/latest/${base}`,
        parser: (data) => data.rates
      },
      {
        name: 'fixer',
        url: (base) => `https://api.fixer.io/latest?base=${base}`,
        parser: (data) => data.rates
      }
    ];
  }

  // Check if exchange rate cache is valid
  isRateCacheValid() {
    return this.cache.rates && 
           this.cache.timestamp && 
           (Date.now() - this.cache.timestamp) < this.cache.ttl;
  }

  // Get exchange rates
  async getExchangeRates(baseCurrency = this.baseCurrency) {
    try {
      // Return cached rates if valid
      if (this.isRateCacheValid() && this.cache.rates.base === baseCurrency) {
        console.log('💱 Using cached exchange rates');
        return this.cache.rates;
      }

      console.log(`🔄 Fetching exchange rates for ${baseCurrency}...`);

      // Try each provider until one succeeds
      for (const provider of this.exchangeRateProviders) {
        try {
          const response = await fetch(provider.url(baseCurrency));
          if (!response.ok) continue;

          const data = await response.json();
          const rates = provider.parser(data);

          if (rates && typeof rates === 'object') {
            const exchangeRates = {
              base: baseCurrency,
              rates,
              timestamp: Date.now(),
              provider: provider.name
            };

            // Cache the rates
            this.cache = {
              rates: exchangeRates,
              timestamp: Date.now(),
              ttl: this.cache.ttl
            };

            console.log(`✅ Exchange rates fetched from ${provider.name}`);
            return exchangeRates;
          }
        } catch (error) {
          console.warn(`⚠️ Provider ${provider.name} failed:`, error.message);
          continue;
        }
      }

      // If all providers fail, return fallback rates
      return this.getFallbackRates(baseCurrency);

    } catch (error) {
      console.error('❌ Failed to fetch exchange rates:', error);
      return this.getFallbackRates(baseCurrency);
    }
  }

  // Get fallback exchange rates (static rates for basic functionality)
  getFallbackRates(baseCurrency = 'USD') {
    console.log('🔄 Using fallback exchange rates');
    
    // Basic static rates relative to USD (approximate rates)
    const staticRates = {
      'USD': 1,
      'EUR': 0.85,
      'GBP': 0.73,
      'CAD': 1.25,
      'AUD': 1.35,
      'JPY': 110,
      'CNY': 6.45,
      'INR': 74,
      'NGN': 411,
      'GHS': 6.1,
      'KES': 110,
      'ZAR': 14.8,
      'EGP': 15.7,
      'MAD': 9.0,
      'ETB': 44,
      'UGX': 3550,
      'TZS': 2310,
      'BWP': 11.2,
      'MUR': 42.5,
      'SAR': 3.75,
      'AED': 3.67,
      'BRL': 5.2,
      'MXN': 20.1,
      'RUB': 74,
      'TRY': 8.5
    };

    return {
      base: baseCurrency,
      rates: staticRates,
      timestamp: Date.now(),
      provider: 'fallback',
      isFallback: true
    };
  }

  // Convert amount between currencies
  async convert(amount, fromCurrency, toCurrency) {
    try {
      if (fromCurrency === toCurrency) {
        return {
          amount,
          fromCurrency,
          toCurrency,
          rate: 1,
          convertedAmount: amount
        };
      }

      const rates = await this.getExchangeRates('USD');
      
      // Convert to USD first, then to target currency
      const fromRate = rates.rates[fromCurrency] || 1;
      const toRate = rates.rates[toCurrency] || 1;
      
      const usdAmount = amount / fromRate;
      const convertedAmount = usdAmount * toRate;
      const conversionRate = toRate / fromRate;

      return {
        amount,
        fromCurrency,
        toCurrency,
        rate: conversionRate,
        convertedAmount: Math.round(convertedAmount * 100) / 100,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Currency conversion failed:', error);
      return {
        amount,
        fromCurrency,
        toCurrency,
        rate: 1,
        convertedAmount: amount,
        error: 'Conversion failed'
      };
    }
  }

  // Format currency amount with proper symbols and formatting
  format(amount, currencyCode, options = {}) {
    const currency = this.currencies[currencyCode];
    if (!currency) {
      return `${amount} ${currencyCode}`;
    }

    const {
      showCode = false,
      locale = 'en-US',
      minimumFractionDigits = currency.decimals,
      maximumFractionDigits = currency.decimals
    } = options;

    try {
      // Format the number with proper locale
      const formattedNumber = new Intl.NumberFormat(locale, {
        minimumFractionDigits,
        maximumFractionDigits
      }).format(amount);

      // Apply currency symbol
      if (currency.symbolFirst) {
        const result = `${currency.symbol}${formattedNumber}`;
        return showCode ? `${result} ${currency.code}` : result;
      } else {
        const result = `${formattedNumber} ${currency.symbol}`;
        return showCode ? `${result} (${currency.code})` : result;
      }

    } catch (error) {
      console.warn('⚠️ Currency formatting failed:', error);
      return `${currency.symbol}${amount}`;
    }
  }

  // Get currency info
  getCurrencyInfo(currencyCode) {
    return this.currencies[currencyCode] || null;
  }

  // Get all supported currencies
  getSupportedCurrencies() {
    return Object.keys(this.currencies).map(code => ({
      code,
      ...this.currencies[code]
    }));
  }

  // Get currencies by region
  getCurrenciesByRegion(region) {
    return this.getSupportedCurrencies().filter(currency => 
      currency.region.toLowerCase() === region.toLowerCase()
    );
  }

  // Get popular currencies (featured ones)
  getPopularCurrencies() {
    const popular = ['USD', 'EUR', 'GBP', 'NGN', 'CAD', 'AUD'];
    return popular.map(code => ({
      code,
      ...this.currencies[code]
    })).filter(Boolean);
  }

  // Get currency suggestion based on location
  getCurrencySuggestion(countryCode, userPreference = null) {
    // User preference takes priority
    if (userPreference && this.currencies[userPreference]) {
      return userPreference;
    }

    // Map common country codes to currencies
    const countryToCurrency = {
      'NG': 'NGN', 'GH': 'GHS', 'KE': 'KES', 'ZA': 'ZAR', 'EG': 'EGP',
      'US': 'USD', 'GB': 'GBP', 'CA': 'CAD', 'AU': 'AUD', 'JP': 'JPY',
      'CN': 'CNY', 'IN': 'INR', 'BR': 'BRL', 'MX': 'MXN', 'RU': 'RUB',
      'SA': 'SAR', 'AE': 'AED', 'TR': 'TRY', 'MA': 'MAD', 'TN': 'TND',
      'ET': 'ETB', 'UG': 'UGX', 'TZ': 'TZS', 'MZ': 'MZN', 'ZM': 'ZMW',
      'BW': 'BWP', 'MU': 'MUR'
    };

    return countryToCurrency[countryCode] || 'USD';
  }

  // Clear exchange rate cache
  clearCache() {
    this.cache = {
      rates: null,
      timestamp: null,
      ttl: this.cache.ttl
    };
  }

  // Get fresh exchange rates (bypass cache)
  async getExchangeRatesFresh(baseCurrency = this.baseCurrency) {
    this.clearCache();
    return this.getExchangeRates(baseCurrency);
  }
}

// Create singleton instance
const currencyService = new CurrencyService();

export default currencyService; 