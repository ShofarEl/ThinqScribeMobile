// Currency utilities for mobile ThinqScribe

// Currency symbols mapping
const currencySymbols = {
  usd: '$',
  eur: '€',
  gbp: '£',
  jpy: '¥',
  cad: 'C$',
  aud: 'A$',
  ngn: '₦',
  ghs: '₵',
  kes: 'KSh',
  zar: 'R',
  default: '$'
};

// Helper function to get country flag emoji
const getCountryFlag = (countryCode) => {
  const flagMap = {
    'ng': '🇳🇬', 'ke': '🇰🇪', 'us': '🇺🇸', 'gb': '🇬🇧', 'ca': '🇨🇦', 
    'au': '🇦🇺', 'za': '🇿🇦', 'gh': '🇬🇭'
  };
  return flagMap[countryCode?.toLowerCase()] || '🌍';
};

// Enhanced location detection for mobile
export const getUserLocationAndCurrency = async () => {
  console.log('🔍 [MOBILE] Starting location and currency detection...');
  
  try {
    // For mobile, try IP-based detection with Nigerian fallback
    const externalServices = [
      { name: 'ipapi.co', url: 'https://ipapi.co/json/' },
      { name: 'ipinfo.io', url: 'https://ipinfo.io/json' }
    ];
    
    for (const service of externalServices) {
      try {
        console.log(`🌐 [MOBILE] Trying ${service.name}...`);
        
        const response = await fetch(service.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`✅ [MOBILE] ${service.name} response:`, data);
        
        // Normalize the response format
        let normalizedData = {};
        
        if (service.name === 'ipapi.co') {
          normalizedData = {
            country_code: data.country_code,
            country_name: data.country_name,
            city: data.city,
            region: data.region,
            timezone: data.timezone,
            ip: data.ip
          };
        } else if (service.name === 'ipinfo.io') {
          normalizedData = {
            country_code: data.country,
            country_name: data.country,
            city: data.city,
            region: data.region,
            timezone: data.timezone,
            ip: data.ip
          };
        }
        
        if (normalizedData.country_code) {
          // Get currency for the detected country
          let currency = 'usd';
          let symbol = '$';
          let exchangeRate = 1;
          let isAfrican = false;
          
          const countryCode = normalizedData.country_code.toLowerCase();
          
          // Currency mapping for different countries
          const currencyMap = {
            'ng': { currency: 'ngn', symbol: '₦', rate: 1500 },
            'ke': { currency: 'kes', symbol: 'KSh', rate: 150 },
            'us': { currency: 'usd', symbol: '$', rate: 1 },
            'gb': { currency: 'gbp', symbol: '£', rate: 0.8 },
            'ca': { currency: 'cad', symbol: 'C$', rate: 1.35 },
            'au': { currency: 'aud', symbol: 'A$', rate: 1.5 },
            'za': { currency: 'zar', symbol: 'R', rate: 18 },
            'gh': { currency: 'ghs', symbol: '₵', rate: 12 }
          };
          
          if (currencyMap[countryCode]) {
            currency = currencyMap[countryCode].currency;
            symbol = currencyMap[countryCode].symbol;
            exchangeRate = currencyMap[countryCode].rate;
          }
          
          // Check if African country
          const africanCountries = ['ng', 'ke', 'za', 'gh', 'tz', 'ug', 'rw', 'et', 'ma', 'eg'];
          isAfrican = africanCountries.includes(countryCode);
          
          const result = {
            country: normalizedData.country_name || 'Nigeria',
            countryCode: countryCode,
            currency: currency,
            symbol: symbol,
            exchangeRate: exchangeRate,
            city: normalizedData.city || 'Lagos',
            region: normalizedData.region || 'Lagos State',
            timezone: normalizedData.timezone || 'Africa/Lagos',
            ip: normalizedData.ip || 'Unknown',
            flag: getCountryFlag(countryCode),
            displayName: `${normalizedData.city || 'Lagos'}, ${normalizedData.country_name || 'Nigeria'}`,
            isAfrican: isAfrican,
            recommendedGateway: isAfrican ? 'paystack' : 'stripe',
            recommendedCurrency: currency,
            currencySymbol: symbol,
            detectionMethod: `mobile-${service.name}`
          };
          
          console.log(`🎉 [MOBILE] Location result from ${service.name}:`, result);
          return result;
        }
        
      } catch (serviceError) {
        console.warn(`⚠️ [MOBILE] ${service.name} failed:`, serviceError.message);
        continue;
      }
    }
    
    throw new Error('All location detection methods failed');
    
  } catch (error) {
    console.error('❌ [MOBILE] Location detection error:', error);
    
    // Nigerian fallback for ThinqScribe platform
    console.log('🇳🇬 [MOBILE] Using Nigerian fallback for ThinqScribe platform');
    return {
      country: 'Nigeria',
      countryCode: 'ng',
      currency: 'ngn',
      symbol: '₦',
      exchangeRate: 1500,
      city: 'Lagos',
      region: 'Lagos State',
      timezone: 'Africa/Lagos',
      ip: 'Unknown',
      flag: '🇳🇬',
      displayName: 'Lagos, Nigeria',
      isAfrican: true,
      recommendedGateway: 'paystack',
      recommendedCurrency: 'ngn',
      currencySymbol: '₦',
      error: error.message,
      isFallback: true,
      detectionMethod: 'mobile-fallback'
    };
  }
};

// Get currency symbol
export const getCurrencySymbol = (currency) => {
  const currencyLower = currency ? currency.toLowerCase() : 'ngn';
  return currencySymbols[currencyLower] || currencySymbols.default;
};

// Format currency for display
export const formatCurrency = (amount, currency = 'ngn', showSymbol = true) => {
  if (!amount && amount !== 0) return showSymbol ? `${getCurrencySymbol(currency)}0` : '0';
  
  const symbol = showSymbol ? getCurrencySymbol(currency) : '';
  
  // Special formatting for NGN (no decimal places typically)
  if (currency.toLowerCase() === 'ngn') {
    const formatted = Math.round(parseFloat(amount)).toLocaleString();
    return `${symbol}${formatted}`;
  }
  
  const formatted = parseFloat(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return `${symbol}${formatted}`;
};

// Convert currency amounts
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (!amount || amount === 0) return 0;
  if (fromCurrency === toCurrency) return amount;
  
  // Simple conversion rates for mobile (can be enhanced)
  const rates = {
    usd: { ngn: 1500, kes: 150, zar: 18, ghs: 12 },
    ngn: { usd: 1/1500, kes: 150/1500, zar: 18/1500, ghs: 12/1500 }
  };
  
  const fromCur = fromCurrency.toLowerCase();
  const toCur = toCurrency.toLowerCase();
  
  if (rates[fromCur] && rates[fromCur][toCur]) {
    return amount * rates[fromCur][toCur];
  }
  
  return amount; // Fallback to original amount
};

// Enhanced currency detection for agreements
export const getAgreementCurrency = (agreement) => {
  if (!agreement.paymentPreferences) return 'usd';
  
  const prefs = agreement.paymentPreferences;
  
  // If currency is explicitly set to NGN, use that
  if (prefs.currency === 'ngn') return 'ngn';
  
  // If it was created with Paystack (Nigerian gateway), likely NGN
  if (prefs.gateway === 'paystack') return 'ngn';
  
  // If nativeAmount exists and is different from totalAmount, and exchangeRate is 1, likely NGN
  if (prefs.nativeAmount && prefs.nativeAmount !== agreement.totalAmount && prefs.exchangeRate === 1) return 'ngn';
  
  // If nativeAmount is much larger than what would be normal USD (>5000), likely NGN
  if (prefs.nativeAmount && prefs.nativeAmount > 5000) return 'ngn';
  
  // Otherwise use the stated currency
  return prefs.currency || 'usd';
};

export default {
  getUserLocationAndCurrency,
  getCurrencySymbol,
  formatCurrency,
  convertCurrency,
  getAgreementCurrency
};
