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

      // Clear old cache to force fresh detection
      localStorage.removeItem('edu_sage_location_cache');
      localStorage.removeItem('edu_sage_location_cache_expiry');
      localStorage.removeItem('location_cache');
      console.log('🗑️ Cleared old location cache for fresh detection');
      
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
        let finalExchangeRate = locationData.exchangeRate || 1500; // Default NGN rate

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
          finalExchangeRate = 1500;
          console.log('🇳🇬 Nigerian location confirmed, setting NGN currency');
        }

        // Even if not explicitly Nigeria, check browser timezone
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (browserTimezone?.includes('Lagos') || browserTimezone?.includes('Africa')) {
          finalCurrency = 'ngn';
          finalSymbol = '₦';
          finalExchangeRate = 1500;
          console.log('🇳🇬 Browser timezone indicates Africa/Nigeria, forcing NGN');
        }

        // Update location data with final values - force Nigerian data
        const finalLocationData = {
          ...locationData,
          country: isNigeria || finalCurrency === 'ngn' ? 'Nigeria' : locationData.country,
          countryCode: isNigeria || finalCurrency === 'ngn' ? 'ng' : locationData.countryCode,
          city: isNigeria || finalCurrency === 'ngn' ? 'Lagos' : locationData.city,
          region: isNigeria || finalCurrency === 'ngn' ? 'Lagos State' : locationData.region,
          timezone: isNigeria || finalCurrency === 'ngn' ? 'Africa/Lagos' : locationData.timezone,
          flag: isNigeria || finalCurrency === 'ngn' ? '🇳🇬' : locationData.flag,
          currency: finalCurrency,
          symbol: finalSymbol,
          exchangeRate: finalExchangeRate
        };
        
        setCurrency(finalCurrency);
        setSymbol(finalSymbol);
        setLocation(finalLocationData);
        setExchangeRate(finalExchangeRate);
        
        // Cache the result for 1 hour
        localStorage.setItem('edu_sage_location_cache', JSON.stringify(finalLocationData));
        localStorage.setItem('edu_sage_location_cache_expiry', (Date.now() + 60 * 60 * 1000).toString());
        
        console.log('✅ Currency system initialized:', {
          currency: finalCurrency,
          symbol: finalSymbol,
          country: finalLocationData.country,
          exchangeRate: finalExchangeRate
        });
      } else {
        throw new Error('Failed to get location data after multiple attempts');
      }
    } catch (err) {
      console.error('❌ Currency initialization error:', err);
      setError(err.message);
      
      // Intelligent fallback - default to Nigeria based on user feedback
      console.log('🇳🇬 Falling back to Nigeria as default location');
      const fallbackLocation = {
        country: 'Nigeria',
        countryCode: 'ng',
        currency: 'ngn',
        symbol: '₦',
        exchangeRate: 1500,
        city: 'Lagos',
        region: 'Lagos State',
        timezone: 'Africa/Lagos',
        flag: '🇳🇬',
        displayName: 'Lagos, Nigeria',
        error: err.message,
        isFallback: true
      };
      
      setCurrency('ngn');
      setSymbol('₦');
      setExchangeRate(1500);
      setLocation(fallbackLocation);
      
      console.log('🇳🇬 Using Nigeria as fallback location');
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