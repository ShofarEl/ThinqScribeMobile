import { locationApi } from '../api/location';
import { API_BASE_URL } from '../api/constants';

// Currency symbols mapping
const currencySymbols = {
  usd: '$',
  eur: '€',
  gbp: '£',
  jpy: '¥',
  cad: 'C$',
  aud: 'A$',
  chf: 'Fr',
  cny: '¥',
  inr: '₹',
  krw: '₩',
  sgd: 'S$',
  hkd: 'HK$',
  nzd: 'NZ$',
  mxn: '$',
  brl: 'R$',
  rub: '₽',
  zar: 'R',
  try: '₺',
  sek: 'kr',
  nok: 'kr',
  dkk: 'kr',
  pln: 'zł',
  czk: 'Kč',
  huf: 'Ft',
  bgn: 'лв',
  ron: 'lei',
  hrk: 'kn',
  ngn: '₦',
  ghs: '₵',
  ken: 'KSh',
  ugx: 'USh',
  tzs: 'TSh',
  rwf: 'FRw',
  mur: '₨',
  mad: 'MAD',
  egp: '£',
  cop: '$',
  pen: 'S/',
  clp: '$',
  ars: '$',
  uyu: '$',
  bob: 'Bs',
  pyg: '₲',
  php: '₱',
  thb: '฿',
  vnd: '₫',
  idr: 'Rp',
  myr: 'RM',
  kzt: '₸',
  pkr: '₨',
  bdt: '৳',
  lkr: '₨',
  npr: '₨',
  mmk: 'K',
  khr: '៛',
  lak: '₭',
  bnd: 'B$',
  fjd: 'FJ$',
  top: 'T$',
  wst: 'WS$',
  vuv: 'VT',
  sbv: 'SI$',
  pgk: 'K',
  default: '$'
};

// Helper function to get country flag emoji
const getCountryFlag = (countryCode) => {
  const flagMap = {
    'ng': '🇳🇬', 'ke': '🇰🇪', 'us': '🇺🇸', 'gb': '🇬🇧', 'ca': '🇨🇦', 
    'au': '🇦🇺', 'za': '🇿🇦', 'gh': '🇬🇭', 'tz': '🇹🇿', 'ug': '🇺🇬',
    'rw': '🇷🇼', 'et': '🇪🇹', 'ma': '🇲🇦', 'eg': '🇪🇬', 'dz': '🇩🇿',
    'tn': '🇹🇳', 'ao': '🇦🇴', 'mz': '🇲🇿', 'mg': '🇲🇬', 'cm': '🇨🇲',
    'fr': '🇫🇷', 'de': '🇩🇪', 'it': '🇮🇹', 'es': '🇪🇸', 'jp': '🇯🇵',
    'cn': '🇨🇳', 'in': '🇮🇳', 'br': '🇧🇷', 'mx': '🇲🇽', 'ru': '🇷🇺'
  };
  return flagMap[countryCode.toLowerCase()] || '🌍';
};

// Enhanced currency detection with better automatic Nigerian detection
export const getUserLocationAndCurrency = async () => {
  console.log('🔍 Starting enhanced location and currency detection...');
  
  try {
    // Clear ALL caches first to force fresh detection every time
    localStorage.removeItem('edu_sage_location_cache');
    localStorage.removeItem('edu_sage_location_cache_expiry');
    localStorage.removeItem('location_cache');
    localStorage.removeItem('location_override');
    sessionStorage.removeItem('edu_sage_location_cache');
    sessionStorage.removeItem('location_cache');
    console.log('🗑️ Force cleared all caches for fresh VPN detection');

    // Skip manual override check to always get fresh data
    // const manualOverride = localStorage.getItem('location_override');
    // if (manualOverride) {
    //   const overrideData = JSON.parse(manualOverride);
    //   console.log('🔧 Using manual location override:', overrideData);
    //   return overrideData;
    // }

    // Enhanced automatic Nigerian detection using browser hints
    const detectNigeriaFromBrowser = () => {
      // Check timezone - Nigeria uses Africa/Lagos timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const isAfricaLagos = timezone?.includes('Africa/Lagos');
      const isAfricaTimezone = timezone?.includes('Africa');
      
      // Check for Nigerian language preferences
      const languages = navigator.languages || [navigator.language];
      const hasNigerianLanguage = languages.some(lang => 
        lang.includes('ha') || // Hausa
        lang.includes('ig') || // Igbo
        lang.includes('yo') || // Yoruba
        lang.includes('en-NG') // English (Nigeria)
      );
      
      // Check current time to see if it matches Nigerian time zone (more precise)
      const now = new Date();
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const localOffset = 1; // Nigeria is UTC+1
      const nigerianTime = new Date(utcTime + (localOffset * 3600000));
      const timeDiff = Math.abs(now.getTime() - nigerianTime.getTime()) / (1000 * 60); // in minutes
      const isNigerianTime = timeDiff < 30; // Within 30 minutes of Nigerian time (more precise)
      
      console.log('🇳🇬 Nigerian detection signals:', {
        timezone,
        isAfricaLagos,
        isAfricaTimezone,
        hasNigerianLanguage,
        isNigerianTime,
        languages
      });
      
      // Only return true if we have STRONG signals for Nigeria
      return isAfricaLagos || hasNigerianLanguage || (isNigerianTime && isAfricaTimezone);
    };

    const isLikelyNigeria = detectNigeriaFromBrowser();
    
    // BEAST MODE: Skip backend completely and use direct external IP detection
    // Backend has caching issues with VPN, so we'll use external services directly
    console.log('🔥 BEAST MODE: Bypassing backend, using direct external IP detection');
    
    const tryBackendDetection = async () => {
      // Commented out to bypass backend caching issues
      // const endpoints = [
      //   '/api/location/currency',
      //   '/api/location/detect', 
      //   '/api/location/external-ip'
      // ];
      // 
      // Backend detection disabled for VPN compatibility
      return null;
    };

    // Skip backend detection to avoid caching issues
    const backendResult = null;
    
    if (backendResult && backendResult.location) {
      const locationData = backendResult.location;
      const currencyData = backendResult.currency || {};
      
      console.log('✅ Backend location detection successful:', locationData);
      
      // Check if it's Nigeria - respect IP detection but allow browser override
      let finalCurrency = currencyData.code || 'usd';
      let finalSymbol = currencyData.symbol || '$';
      let exchangeRate = currencyData.exchangeRate || 1;
      let isNigeria = false;
      
      // Primary: Detect Nigeria from actual location data
      if (locationData.countryCode === 'ng' || 
          locationData.country?.toLowerCase().includes('nigeria') ||
          locationData.countryCode === 'NG') {
        
        finalCurrency = 'ngn';
        finalSymbol = '₦';
        exchangeRate = 1530;
        isNigeria = true;
        console.log('🇳🇬 Nigeria detected via IP/backend location');
      }
      // Note: Commented out browser override to respect VPN/actual IP location
      // Secondary: Override only if browser STRONGLY suggests Nigeria but IP shows non-African country
      // else if (isLikelyNigeria && 
      //          !locationData.country?.toLowerCase().includes('nigeria') &&
      //          !locationData.country?.toLowerCase().includes('africa') &&
      //          (locationData.country?.toLowerCase().includes('united states') || 
      //           locationData.country?.toLowerCase().includes('canada') ||
      //           locationData.country?.toLowerCase().includes('united kingdom'))) {
      //   
      //   finalCurrency = 'ngn';
      //   finalSymbol = '₦';
      //   exchangeRate = 1500;
      //   isNigeria = true;
      //   console.log('🇳🇬 Nigeria detected via browser hints (overriding non-African IP)');
      // }
      
      const result = {
        country: isNigeria ? 'Nigeria' : (locationData.country || 'Nigeria'),
        countryCode: isNigeria ? 'ng' : (locationData.countryCode || 'ng').toLowerCase(),
        currency: finalCurrency,
        symbol: finalSymbol,
        exchangeRate: exchangeRate,
        city: isNigeria ? 'Lagos' : (locationData.city || 'Lagos'),
        region: isNigeria ? 'Lagos State' : (locationData.region || 'Lagos State'),
        timezone: isNigeria ? 'Africa/Lagos' : (locationData.timezone || 'Africa/Lagos'),
        ip: backendResult.detectedIP || 'Unknown',
        flag: isNigeria ? '🇳🇬' : (locationData.flag || '🇳🇬'),
        displayName: isNigeria ? 'Lagos, Nigeria' : (locationData.displayName || 'Lagos, Nigeria'),
        isAfrican: isNigeria,
        recommendedGateway: isNigeria ? 'paystack' : 'stripe',
        recommendedCurrency: finalCurrency,
        currencySymbol: finalSymbol,
        detectionMethod: isNigeria ? 'backend+browser' : 'backend'
      };
      
              // Note: Caching disabled to ensure VPN changes are always detected
        // localStorage.setItem('location_cache', JSON.stringify({
        //   data: result,
        //   timestamp: Date.now()
        // }));
      
      return result;
    }
    
    // If backend completely failed but browser hints suggest Nigeria, use Nigeria
    if (isLikelyNigeria) {
      console.log('🇳🇬 Using Nigeria based on browser detection (backend failed)');
      const result = {
        country: 'Nigeria',
        countryCode: 'ng',
        currency: 'ngn',
        symbol: '₦',
        exchangeRate: 1500,
        city: 'Lagos',
        region: 'Lagos State',
        timezone: 'Africa/Lagos',
        ip: 'Browser Detection',
        flag: '🇳🇬',
        displayName: 'Lagos, Nigeria',
        isAfrican: true,
        recommendedGateway: 'paystack',
        recommendedCurrency: 'ngn',
        currencySymbol: '₦',
        detectionMethod: 'browser-timezone'
      };
      
      localStorage.setItem('location_cache', JSON.stringify({
        data: result,
        timestamp: Date.now()
      }));
      
      return result;
    }
    
    // BEAST MODE: Try multiple external IP services for maximum accuracy
    console.log('🔥 BEAST MODE: Trying multiple external IP services...');
    
    const externalServices = [
      { name: 'ipapi.co', url: 'https://ipapi.co/json/', timeout: 8000 },
      { name: 'ipinfo.io', url: 'https://ipinfo.io/json', timeout: 8000 },
      { name: 'ip-api.com', url: 'http://ip-api.com/json/', timeout: 8000 },
      { name: 'freegeoip.app', url: 'https://freegeoip.app/json/', timeout: 8000 }
    ];
    
    for (const service of externalServices) {
      try {
        console.log(`🌐 Trying ${service.name}...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), service.timeout);
        
        const externalResponse = await fetch(service.url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!externalResponse.ok) {
          throw new Error(`HTTP ${externalResponse.status}`);
        }
        
        const externalData = await externalResponse.json();
        console.log(`✅ ${service.name} response:`, externalData);
        
        // Normalize the response format (different services have different fields)
        let normalizedData = {};
        
        if (service.name === 'ipapi.co') {
          normalizedData = {
            country_code: externalData.country_code,
            country_name: externalData.country_name,
            city: externalData.city,
            region: externalData.region,
            timezone: externalData.timezone,
            ip: externalData.ip
          };
        } else if (service.name === 'ipinfo.io') {
          normalizedData = {
            country_code: externalData.country,
            country_name: externalData.country,
            city: externalData.city,
            region: externalData.region,
            timezone: externalData.timezone,
            ip: externalData.ip
          };
        } else if (service.name === 'ip-api.com') {
          normalizedData = {
            country_code: externalData.countryCode,
            country_name: externalData.country,
            city: externalData.city,
            region: externalData.regionName,
            timezone: externalData.timezone,
            ip: externalData.query
          };
        } else if (service.name === 'freegeoip.app') {
          normalizedData = {
            country_code: externalData.country_code,
            country_name: externalData.country_name,
            city: externalData.city,
            region: externalData.region_name,
            timezone: externalData.time_zone,
            ip: externalData.ip
          };
        }
        
        if (normalizedData.country_code) {
          console.log(`🎯 Successfully got location from ${service.name}:`, normalizedData);
          
          // Get currency and exchange rate for the detected country
          let currency = 'usd';
          let symbol = '$';
          let exchangeRate = 1;
          let isAfrican = false;
          
          const countryCode = normalizedData.country_code.toLowerCase();
          const countryName = normalizedData.country_name?.toLowerCase() || '';
          
          // Currency mapping for different countries
          const currencyMap = {
            'ng': { currency: 'ngn', symbol: '₦', rate: 1500 },
            'ke': { currency: 'kes', symbol: 'KSh', rate: 150 },
            'us': { currency: 'usd', symbol: '$', rate: 1 },
            'gb': { currency: 'gbp', symbol: '£', rate: 0.8 },
            'ca': { currency: 'cad', symbol: 'C$', rate: 1.35 },
            'au': { currency: 'aud', symbol: 'A$', rate: 1.5 },
            'za': { currency: 'zar', symbol: 'R', rate: 18 },
            'gh': { currency: 'ghs', symbol: '₵', rate: 12 },
            'tz': { currency: 'tzs', symbol: 'TSh', rate: 2300 },
            'ug': { currency: 'ugx', symbol: 'USh', rate: 3700 }
          };
          
          if (currencyMap[countryCode]) {
            currency = currencyMap[countryCode].currency;
            symbol = currencyMap[countryCode].symbol;
            exchangeRate = currencyMap[countryCode].rate;
          }
          
          // Check if African country
          const africanCountries = ['ng', 'ke', 'za', 'gh', 'tz', 'ug', 'rw', 'et', 'ma', 'eg', 'dz', 'tn', 'ao', 'mz', 'mg', 'cm', 'ci', 'bf', 'ml', 'ne', 'td', 'sd', 'ly', 'mr', 'sn', 'gm', 'gw', 'sl', 'lr', 'bj', 'tg', 'cv', 'st', 'gq', 'ga', 'cg', 'cd', 'cf', 'ao', 'zm', 'zw', 'bw', 'na', 'sz', 'ls', 'mw', 'bi', 'rw', 'dj', 'so', 'er', 'et', 'ss', 'sc', 'mu', 'km'];
          isAfrican = africanCountries.includes(countryCode);
          
          const result = {
            country: normalizedData.country_name || 'Unknown',
            countryCode: countryCode,
            currency: currency,
            symbol: symbol,
            exchangeRate: exchangeRate,
            city: normalizedData.city || 'Unknown',
            region: normalizedData.region || 'Unknown',
            timezone: normalizedData.timezone || 'UTC',
            ip: normalizedData.ip || 'Unknown',
            flag: getCountryFlag(countryCode),
            displayName: `${normalizedData.city || 'Unknown'}, ${normalizedData.country_name || 'Unknown'}`,
            isAfrican: isAfrican,
            recommendedGateway: isAfrican ? 'paystack' : 'stripe',
            recommendedCurrency: currency,
            currencySymbol: symbol,
            detectionMethod: `external-${service.name}`,
            detectionService: service.name
          };
          
          console.log(`🎉 Final location result from ${service.name}:`, result);
          return result;
        }
        
      } catch (serviceError) {
        console.warn(`⚠️ ${service.name} failed:`, serviceError.message);
        continue;
      }
    }
    
    // Note: Cache check disabled to ensure fresh VPN detection
    // Check localStorage cache as another fallback
    // const cached = localStorage.getItem('location_cache');
    // if (cached) {
    //   const cacheData = JSON.parse(cached);
    //   const isExpired = Date.now() - cacheData.timestamp > 24 * 60 * 60 * 1000; // 24 hours
    //   
    //   if (!isExpired) {
    //     console.log('💾 Using cached location data');
    //     return cacheData.data;
    //   }
    // }
    
    throw new Error('All location detection methods failed');
    
  } catch (error) {
    console.error('❌ Location detection error:', error);
  
    // Final intelligent fallback based on browser hints
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const languages = navigator.languages || [navigator.language];
    
    // Check for STRONG Nigerian indicators
    const hasAfricaLagos = timezone?.includes('Africa/Lagos');
    const hasNigerianLanguage = languages.some(lang => 
      lang.includes('ha') || lang.includes('ig') || 
      lang.includes('yo') || lang.includes('en-NG')
    );
    
    console.log(`🔍 Final fallback - Browser timezone: ${timezone}, languages: ${languages.join(', ')}`);
    console.log(`🔍 Strong Nigerian signals - Lagos timezone: ${hasAfricaLagos}, Nigerian language: ${hasNigerianLanguage}`);
    
    // Note: Commented out to respect VPN/IP-based location completely  
    // Only use Nigeria fallback if we have STRONG indicators
    // if (hasAfricaLagos || hasNigerianLanguage) {
    //   console.log('🇳🇬 Using Nigeria fallback based on strong browser signals');
    //   return {
    //     country: 'Nigeria',
    //     countryCode: 'ng',
    //     currency: 'ngn',
    //     symbol: '₦',
    //     exchangeRate: 1500,
    //     city: 'Lagos',
    //     region: 'Lagos State',
    //     timezone: 'Africa/Lagos',
    //     ip: 'Unknown',
    //     flag: '🇳🇬',
    //     displayName: 'Lagos, Nigeria',
    //     isAfrican: true,
    //     recommendedGateway: 'paystack',
    //     recommendedCurrency: 'ngn',
    //     currencySymbol: '₦',
    //     error: 'Used browser-based detection',
    //     detectionMethod: 'browser-fallback'
    //   };
    // }
    
    // Default fallback - prioritize Nigeria for EDU-SAGE platform
    console.log('🇳🇬 Using Nigerian fallback for EDU-SAGE platform');
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
      detectionMethod: 'fallback'
    };
  }
};

// Helper function to manually set location (for testing/development)
export const setLocationOverride = (locationData) => {
  localStorage.setItem('location_override', JSON.stringify(locationData));
  console.log('🔧 Location override set:', locationData);
  // Trigger a page reload to apply the override
  window.location.reload();
};

// Helper function to clear location override and ALL caches
export const clearLocationOverride = () => {
  localStorage.removeItem('location_override');
  localStorage.removeItem('location_cache');
  localStorage.removeItem('edu_sage_location_cache');
  localStorage.removeItem('edu_sage_location_cache_expiry');
  sessionStorage.removeItem('edu_sage_location_cache');
  sessionStorage.removeItem('location_cache');
  console.log('🗑️ ALL location data and caches cleared');
  window.location.reload();
};

// Helper function to force location refresh (call this from console)
export const forceLocationRefresh = () => {
  console.log('🔄 Force clearing all location data...');
  localStorage.clear(); // Nuclear option - clear everything
  sessionStorage.clear();
  console.log('💥 All storage cleared - refreshing page...');
  window.location.reload();
};

// Helper function to test location detection directly
export const testLocationDetection = async () => {
  console.log('🔥 BEAST MODE: Testing location detection...');
  try {
    const result = await getUserLocationAndCurrency();
    console.log('🎯 Location detection result:', result);
    return result;
  } catch (error) {
    console.error('❌ Location detection failed:', error);
    return null;
  }
};

// Make it globally available for console access
if (typeof window !== 'undefined') {
  window.forceLocationRefresh = forceLocationRefresh;
  window.clearLocationOverride = clearLocationOverride;
  window.testLocationDetection = testLocationDetection;
  window.getUserLocationAndCurrency = getUserLocationAndCurrency;
}

// Get currency symbol
export const getCurrencySymbol = (currency) => {
  const currencyLower = currency ? currency.toLowerCase() : 'usd';
  return currencySymbols[currencyLower] || currencySymbols.default;
};

// Map country codes to currencies
const getCurrencyFromCountryCode = (countryCode) => {
  const currencyMap = {
    'us': 'usd', 'gb': 'gbp', 'eu': 'eur', 'jp': 'jpy', 'ca': 'cad',
    'au': 'aud', 'ch': 'chf', 'cn': 'cny', 'in': 'inr', 'kr': 'krw',
    'sg': 'sgd', 'hk': 'hkd', 'nz': 'nzd', 'mx': 'mxn', 'br': 'brl',
    'ru': 'rub', 'za': 'zar', 'tr': 'try', 'se': 'sek', 'no': 'nok',
    'dk': 'dkk', 'pl': 'pln', 'cz': 'czk', 'hu': 'huf', 'bg': 'bgn',
    'ro': 'ron', 'hr': 'hrk', 'ng': 'ngn', 'gh': 'ghs', 'ke': 'ken',
    'ug': 'ugx', 'tz': 'tzs', 'rw': 'rwf', 'mu': 'mur', 'ma': 'mad',
    'eg': 'egp', 'co': 'cop', 'pe': 'pen', 'cl': 'clp', 'ar': 'ars',
    'uy': 'uyu', 'bo': 'bob', 'py': 'pyg', 'ph': 'php', 'th': 'thb',
    'vn': 'vnd', 'id': 'idr', 'my': 'myr', 'kz': 'kzt', 'pk': 'pkr',
    'bd': 'bdt', 'lk': 'lkr', 'np': 'npr', 'mm': 'mmk', 'kh': 'khr',
    'la': 'lak', 'bnd': 'bnd', 'fj': 'fjd', 'to': 'top', 'ws': 'wst',
    'vu': 'vuv', 'sb': 'sbv', 'pg': 'pgk'
  };
  
  return currencyMap[countryCode.toLowerCase()] || 'usd';
};

// Convert currency amounts using multiple APIs for accuracy
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (!amount || amount === 0) return 0;
  if (fromCurrency === toCurrency) return amount;
  
  const fromCur = fromCurrency.toUpperCase();
  const toCur = toCurrency.toUpperCase();
  
  try {
    // First try ExchangeRate-API (free and accurate)
    const response1 = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCur}`);
    const data1 = await response1.json();
    
    if (data1.rates && data1.rates[toCur]) {
      const rate = data1.rates[toCur];
      const convertedAmount = amount * rate;
      console.log(`💱 Currency conversion: ${amount} ${fromCur} = ${convertedAmount} ${toCur} (rate: ${rate})`);
      return convertedAmount;
    }
    
    // Fallback to Fixer.io API
    const response2 = await fetch(`https://api.fixer.io/latest?base=${fromCur}&symbols=${toCur}`);
    const data2 = await response2.json();
    
    if (data2.rates && data2.rates[toCur]) {
      const rate = data2.rates[toCur];
      const convertedAmount = amount * rate;
      console.log(`💱 Currency conversion (fallback): ${amount} ${fromCur} = ${convertedAmount} ${toCur} (rate: ${rate})`);
      return convertedAmount;
    }
    
    // Final fallback to our backend
          const response3 = await fetch(`${API_BASE_URL}/location/exchange-rates?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`);
    const data3 = await response3.json();
    
    if (data3.success && data3.convertedAmount) {
      return parseFloat(data3.convertedAmount);
    }
    
    return amount; // Fallback to original amount
  } catch (error) {
    console.error('Currency conversion error:', error);
    return amount;
  }
};

// Format currency for display
export const formatCurrency = (amount, currency = 'usd', showSymbol = true) => {
  if (!amount && amount !== 0) return '0.00';
  
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

// Format localized amount
export const formatLocalizedAmount = (amount, currency, exchangeRate = 1) => {
  const convertedAmount = amount * exchangeRate;
  
  // Special handling for NGN
  if (currency.toLowerCase() === 'ngn') {
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${Math.round(convertedAmount).toLocaleString()}`;
  }
  
  return formatCurrency(convertedAmount, currency);
};

// Get exchange rate using accurate APIs
export const getExchangeRate = async (fromCurrency, toCurrency) => {
  const fromCur = fromCurrency.toUpperCase();
  const toCur = toCurrency.toUpperCase();
  
  if (fromCur === toCur) return 1;
  
  try {
    // First try ExchangeRate-API (free and accurate)
    const response1 = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCur}`);
    const data1 = await response1.json();
    
    if (data1.rates && data1.rates[toCur]) {
      const rate = data1.rates[toCur];
      console.log(`💱 Exchange rate: 1 ${fromCur} = ${rate} ${toCur}`);
      return rate;
    }
    
    // Fallback to Fixer.io API
    const response2 = await fetch(`https://api.fixer.io/latest?base=${fromCur}&symbols=${toCur}`);
    const data2 = await response2.json();
    
    if (data2.rates && data2.rates[toCur]) {
      const rate = data2.rates[toCur];
      console.log(`💱 Exchange rate (fallback): 1 ${fromCur} = ${rate} ${toCur}`);
      return rate;
    }
    
    // Final fallback to our backend
          const response3 = await fetch(`${API_BASE_URL}/location/exchange-rates?from=${fromCurrency}&to=${toCurrency}`);
    const data3 = await response3.json();
    
    if (data3.success && data3.rate) {
      return parseFloat(data3.rate);
    }
    
    return 1; // Fallback
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    return 1;
  }
}; 