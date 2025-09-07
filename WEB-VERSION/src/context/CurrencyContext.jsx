import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserLocationAndCurrency, convertCurrency, formatCurrency, getCurrencySymbol, getExchangeRate } from '../utils/currencyUtils';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('usd');
  const [symbol, setSymbol] = useState('$');
  const [location, setLocation] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initializeCurrency = useCallback(async () => {
    console.log('🚀 Initializing currency system...');
    
    try {
      setLoading(true);
      setError(null);

      // Check for valid cached data first (2 hour cache)
      const cacheKey = 'edu_sage_location_cache';
      const cacheExpiryKey = 'edu_sage_location_cache_expiry';
      const cacheValidityHours = 2;
      
      const cachedData = localStorage.getItem(cacheKey);
      const cacheExpiry = localStorage.getItem(cacheExpiryKey);
      const now = Date.now();
      
      // Use cached data if it's still valid
      if (cachedData && cacheExpiry && now < parseInt(cacheExpiry)) {
        try {
          const locationData = JSON.parse(cachedData);
          const remainingMinutes = Math.round((parseInt(cacheExpiry) - now) / (1000 * 60));
          console.log(`✅ Using cached location data (valid for ${remainingMinutes} more minutes)`);
          
          // Set data from cache
          setCurrency(locationData.currency || 'ngn');
          setSymbol(locationData.symbol || '₦');
          setExchangeRate(locationData.exchangeRate || 1530);
          setLocation(locationData);
          setLoading(false);
          
          return; // Exit early with cached data
        } catch (parseError) {
          console.warn('⚠️ Failed to parse cached location data, fetching fresh');
        }
      }

      console.log('🔄 Cache expired or invalid, fetching fresh location data...');
      
      // Get location and currency data with retry logic
      let locationData = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts && !locationData) {
        try {
          console.log(`📡 Fetching location data (attempt ${attempts + 1}/${maxAttempts})...`);
          locationData = await getUserLocationAndCurrency();
          if (locationData) break;
        } catch (err) {
          console.warn(`⚠️ Location fetch attempt ${attempts + 1} failed:`, err.message);
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
          }
        }
      }
      
      if (locationData) {
        console.log('📍 Location data received:', locationData);
        
        // Force Nigerian currency - prioritize any Nigerian indicators
        let finalCurrency = locationData.currency || 'ngn'; // Default to NGN instead of USD
        let finalSymbol = locationData.symbol || '₦';
        let finalExchangeRate = locationData.exchangeRate || 1530; // Default NGN rate

        // Detect any signs of Nigeria and force it
        const isNigeria = (
          locationData.countryCode === 'ng' || 
          locationData.countryCode === 'NG' ||
          locationData.country?.toLowerCase().includes('nigeria') ||
          locationData.city?.toLowerCase().includes('lagos') ||
          locationData.timezone?.includes('Lagos') ||
          locationData.detectionMethod?.includes('browser') ||
          locationData.flag === '🇳🇬'
        );

        if (isNigeria || locationData.currency === 'ngn') {
          finalCurrency = 'ngn';
          finalSymbol = '₦';
          finalExchangeRate = 1530;
          console.log('🇳🇬 Nigerian location confirmed, setting NGN currency');
        }

        // Even if not explicitly Nigeria, check browser timezone
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (browserTimezone?.includes('Lagos') || browserTimezone?.includes('Africa')) {
          finalCurrency = 'ngn';
          finalSymbol = '₦';
          finalExchangeRate = 1530;
          console.log('🇳🇬 Browser timezone indicates Africa/Nigeria, forcing NGN');
        }

        // Update location data with final values
        const finalLocationData = {
          ...locationData,
          currency: finalCurrency,
          symbol: finalSymbol,
          exchangeRate: finalExchangeRate,
          country: isNigeria || finalCurrency === 'ngn' ? 'Nigeria' : locationData.country,
          countryCode: isNigeria || finalCurrency === 'ngn' ? 'ng' : locationData.countryCode,
          city: isNigeria || finalCurrency === 'ngn' ? 'Lagos' : locationData.city,
          region: isNigeria || finalCurrency === 'ngn' ? 'Lagos State' : locationData.region,
          timezone: isNigeria || finalCurrency === 'ngn' ? 'Africa/Lagos' : locationData.timezone,
          flag: isNigeria || finalCurrency === 'ngn' ? '🇳🇬' : locationData.flag,
          displayName: isNigeria || finalCurrency === 'ngn' ? 'Lagos, Nigeria' : locationData.displayName,
          isAfrican: isNigeria || finalCurrency === 'ngn' ? true : locationData.isAfrican,
          recommendedGateway: isNigeria || finalCurrency === 'ngn' ? 'paystack' : 'stripe',
          recommendedCurrency: finalCurrency,
          currencySymbol: finalSymbol,
          detectionMethod: locationData.detectionMethod || 'api',
          timestamp: now
        };

        // Cache the data with expiration
        const cacheExpiryTime = now + (cacheValidityHours * 60 * 60 * 1000);
        localStorage.setItem(cacheKey, JSON.stringify(finalLocationData));
        localStorage.setItem(cacheExpiryKey, cacheExpiryTime.toString());
        
        // Set state
        setCurrency(finalCurrency);
        setSymbol(finalSymbol);
        setExchangeRate(finalExchangeRate);
        setLocation(finalLocationData);
        
        console.log('💾 Location data cached and set for', cacheValidityHours, 'hours');
      } else {
        // Fallback if all attempts failed
        console.warn('⚠️ All location detection attempts failed, using fallback');
        const fallbackLocation = {
          country: 'Nigeria',
          countryCode: 'ng',
          currency: 'ngn',
          symbol: '₦',
          exchangeRate: 1530,
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
          error: 'Used fallback due to detection failure',
          detectionMethod: 'fallback'
        };
        
        setCurrency('ngn');
        setSymbol('₦');
        setExchangeRate(1530);
        setLocation(fallbackLocation);
        
        console.log('🇳🇬 Using Nigerian fallback for EDU-SAGE platform');
      }
    } catch (error) {
      console.error('❌ Currency initialization error:', error);
      setError(error.message);
      
      // Use fallback on error
      setCurrency('ngn');
      setSymbol('₦');
      setExchangeRate(1530);
      setLocation({
        country: 'Nigeria',
        countryCode: 'ng',
        currency: 'ngn',
        symbol: '₦',
        exchangeRate: 1530,
        city: 'Lagos',
        error: error.message,
        detectionMethod: 'error-fallback'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeCurrency();
  }, [initializeCurrency]);

  // Convert from USD to local currency
  const convertFromUSD = useCallback(async (amount) => {
    if (!amount || amount === 0) return 0;
    
    try {
      if (currency === 'usd') {
        return amount;
      }
      
      const convertedAmount = await convertCurrency(amount, 'usd', currency);
      return convertedAmount || amount;
    } catch (error) {
      console.error('Error converting from USD:', error);
      return amount;
    }
  }, [currency]);

  // Convert to USD from local currency
  const convertToUSD = useCallback(async (amount) => {
    if (!amount || amount === 0) return 0;
    
    try {
      if (currency === 'usd') {
        return amount;
      }
      
      const convertedAmount = await convertCurrency(amount, currency, 'usd');
      return convertedAmount || amount;
    } catch (error) {
      console.error('Error converting to USD:', error);
      return amount;
    }
  }, [currency]);

  // Format amount in USD
  const formatUSD = useCallback((amount) => {
    return formatCurrency(amount, 'usd', true);
  }, []);

  // Format amount in local currency (synchronous only)
  const formatLocal = useCallback((amount) => {
    if (!amount && amount !== 0) return formatCurrency(0, currency);
    
    try {
      let finalAmount = amount;
      
      // Convert from USD to local currency if needed
      if (currency !== 'usd' && exchangeRate && exchangeRate !== 1) {
        finalAmount = amount * exchangeRate;
      }
      
      return formatCurrency(finalAmount, currency, true);
    } catch (error) {
      console.error('❌ Error formatting local currency:', error);
      return formatCurrency(amount, currency);
    }
  }, [currency, exchangeRate]);

  // Format amount in local currency (asynchronous for conversion)
  const formatLocalAsync = useCallback(async (amount) => {
    if (!amount && amount !== 0) return formatCurrency(0, currency);
    
    try {
      console.log('💰 formatLocalAsync called with:', { amount, currency, exchangeRate });
      
      let finalAmount = amount;
      
      // Convert from USD to local currency if needed
      if (currency !== 'usd' && exchangeRate && exchangeRate !== 1) {
        finalAmount = amount * exchangeRate;
        console.log('💱 Currency conversion:', { from: amount, to: finalAmount, rate: exchangeRate });
      }
      
      const formatted = formatCurrency(finalAmount, currency, true);
      console.log('✅ Formatted amount:', formatted);
      return formatted;
    } catch (error) {
      console.error('❌ Error formatting local currency:', error);
      return formatCurrency(amount, currency);
    }
  }, [currency, exchangeRate]);

  // Get current exchange rate
  const getCurrentExchangeRate = useCallback(async () => {
    try {
      if (currency === 'usd') {
        return 1;
      }
      
      const rate = await getExchangeRate('usd', currency);
      setExchangeRate(rate);
      return rate;
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      return exchangeRate;
    }
  }, [currency, exchangeRate]);

  // Refresh currency data
  const refreshCurrency = useCallback(async () => {
    await initializeCurrency();
  }, [initializeCurrency]);

  const value = {
    currency,
    symbol,
    location,
    exchangeRate,
    loading,
    error,
    convertFromUSD,
    convertToUSD,
    formatUSD,
    formatLocal,
    formatLocalAsync,
    getCurrentExchangeRate,
    refreshCurrency,
    // Helper functions
    isUSD: currency === 'usd',
    isNGN: currency === 'ngn',
    countryName: location?.country || 'Unknown',
    countryCode: location?.countryCode || 'us',
    cityName: location?.city || 'Unknown',
    regionName: location?.region || 'Unknown',
    flag: location?.flag || '🌍',
    
    // Format function that uses local currency (synchronous)
    format: (amount) => formatLocal(amount),
    
    // Test function to force refresh
    testRefresh: async () => {
      console.log('🔄 Test refresh triggered');
      await initializeCurrency();
    }
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}; 