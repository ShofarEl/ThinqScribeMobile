// 🌍 Real-time Exchange Rate Service
// Fetches accurate currency conversion rates from multiple APIs

console.log('💱 Exchange Rate Service initialized');

class ExchangeRateService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 10 * 60 * 1000; // 10 minutes cache
    this.baseCurrency = 'USD'; // All conversions relative to USD
  }

  // Get exchange rate from USD to target currency
  async getExchangeRate(targetCurrency) {
    const cacheKey = `USD_${targetCurrency.toUpperCase()}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log(`💾 Using cached rate for ${targetCurrency}:`, cached.rate);
      return cached.rate;
    }

    try {
      console.log(`📡 Fetching exchange rate: USD → ${targetCurrency}`);
      
      // Try multiple exchange rate APIs
      const rate = await this.fetchFromMultipleAPIs(targetCurrency);
      
      // Cache the result
      this.cache.set(cacheKey, {
        rate,
        timestamp: Date.now()
      });
      
      console.log(`✅ Exchange rate USD → ${targetCurrency}:`, rate);
      return rate;
      
    } catch (error) {
      console.error(`❌ Failed to get exchange rate for ${targetCurrency}:`, error);
      return this.getFallbackRate(targetCurrency);
    }
  }

  // Try multiple exchange rate APIs for reliability
  async fetchFromMultipleAPIs(targetCurrency) {
    const currency = targetCurrency.toUpperCase();
    
    // List of exchange rate APIs (free tiers) - removed problematic ones
    const apis = [
      {
        name: 'exchangerate-api.com',
        url: `https://api.exchangerate-api.com/v4/latest/USD`,
        parser: (data) => data.rates[currency]
      },
      {
        name: 'freeforexapi.com',
        url: `https://api.freeforexapi.com/api/live?pairs=USD${currency}`,
        parser: (data) => data.rates[`USD${currency}`]?.rate
      }
    ];

    for (const api of apis) {
      try {
        console.log(`🌐 Trying ${api.name}...`);
        
        const response = await fetch(api.url, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          timeout: 8000
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const rate = api.parser(data);

        if (rate && typeof rate === 'number' && rate > 0) {
          console.log(`✅ ${api.name} provided rate:`, rate);
          return rate;
        }

      } catch (error) {
        console.warn(`⚠️ ${api.name} failed:`, error.message);
        continue;
      }
    }

    throw new Error('All exchange rate APIs failed');
  }

  // Get fallback exchange rates for common currencies
  getFallbackRate(currency) {
    const fallbackRates = {
      'NGN': 1500, // Nigerian Naira
      'EUR': 0.85, // Euro
      'GBP': 0.75, // British Pound
      'CAD': 1.35, // Canadian Dollar
      'AUD': 1.45, // Australian Dollar
      'JPY': 110,  // Japanese Yen
      'INR': 75,   // Indian Rupee
      'KES': 150,  // Kenyan Shilling
      'GHS': 12,   // Ghanaian Cedi
      'ZAR': 18,   // South African Rand
      'TZS': 2500, // Tanzanian Shilling
      'UGX': 3700, // Ugandan Shilling
      'USD': 1     // US Dollar
    };
    
    const rate = fallbackRates[currency.toUpperCase()] || 1;
    console.log(`💱 Using fallback rate for ${currency}:`, rate);
    return rate;
  }

  // Convert from USD to target currency
  async convertFromUSD(amount, targetCurrency) {
    if (!amount || amount === 0) return 0;
    if (targetCurrency.toUpperCase() === 'USD') return amount;
    
    try {
      const rate = await this.getExchangeRate(targetCurrency);
      return amount * rate;
    } catch (error) {
      console.error('Error converting from USD:', error);
      const fallbackRate = this.getFallbackRate(targetCurrency);
      return amount * fallbackRate;
    }
  }

  // Convert to USD from source currency
  async convertToUSD(amount, sourceCurrency) {
    if (!amount || amount === 0) return 0;
    if (sourceCurrency.toUpperCase() === 'USD') return amount;
    
    try {
      const rate = await this.getExchangeRate(sourceCurrency);
      return amount / rate;
    } catch (error) {
      console.error('Error converting to USD:', error);
      const fallbackRate = this.getFallbackRate(sourceCurrency);
      return amount / fallbackRate;
    }
  }

  // Format currency amount
  formatCurrency(amount, currency) {
    if (!amount && amount !== 0) return '0';
    
    const currencyCode = currency.toUpperCase();
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return formatter.format(amount);
  }

  // Get multi-currency display
  async getMultiCurrencyDisplay(usdAmount, targetCurrency) {
    try {
      const localAmount = await this.convertFromUSD(usdAmount, targetCurrency);
      
      return {
        usd: {
          amount: usdAmount,
          formatted: this.formatCurrency(usdAmount, 'USD'),
          currency: 'USD'
        },
        local: {
          amount: localAmount,
          formatted: this.formatCurrency(localAmount, targetCurrency),
          currency: targetCurrency.toUpperCase()
        }
      };
    } catch (error) {
      console.error('Error getting multi-currency display:', error);
      const fallbackRate = this.getFallbackRate(targetCurrency);
      const localAmount = usdAmount * fallbackRate;
      
      return {
        usd: {
          amount: usdAmount,
          formatted: this.formatCurrency(usdAmount, 'USD'),
          currency: 'USD'
        },
        local: {
          amount: localAmount,
          formatted: this.formatCurrency(localAmount, targetCurrency),
          currency: targetCurrency.toUpperCase()
        }
      };
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    console.log('💾 Exchange rate cache cleared');
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        rate: value.rate,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp
      }))
    };
  }
}

// Create singleton instance
const exchangeRateService = new ExchangeRateService();

// Export service and individual functions
export default exchangeRateService;

// Export individual functions for convenience
export const getExchangeRate = (currency) => exchangeRateService.getExchangeRate(currency);
export const convertFromUSD = (amount, currency) => exchangeRateService.convertFromUSD(amount, currency);
export const convertToUSD = (amount, currency) => exchangeRateService.convertToUSD(amount, currency);
export const formatCurrency = (amount, currency) => exchangeRateService.formatCurrency(amount, currency);
export const getMultiCurrencyDisplay = (amount, currency) => exchangeRateService.getMultiCurrencyDisplay(amount, currency);

// Make it globally available for testing
if (typeof window !== 'undefined') {
  window.exchangeRateService = exchangeRateService;
  window.testExchangeRate = async (currency) => {
    const rate = await exchangeRateService.getExchangeRate(currency);
    console.log(`💱 Test: 1 USD = ${rate} ${currency}`);
    return rate;
  };
} 