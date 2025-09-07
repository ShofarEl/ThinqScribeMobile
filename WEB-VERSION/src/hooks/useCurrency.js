import { useState, useEffect } from 'react';
import { getLocationWithFallback } from '../utils/geolocationDetection.js';
import exchangeRateService from '../utils/exchangeRateService.js';
import { getCurrencySymbol, formatCurrency } from '../utils/currencyUtils.js';

/**
 * Custom hook for managing user's location-based currency
 * @returns {object} Currency state and utilities
 */
export const useCurrency = () => {
  const [currency, setCurrency] = useState('usd');
  const [symbol, setSymbol] = useState('$');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(1);

  console.log('🔥 BEAST MODE: useCurrency hook called from standalone hooks/useCurrency.js');
  console.log('🔥 Current user agent:', navigator.userAgent);
  console.log('🔥 Current timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
  console.log('🔥 Current languages:', navigator.languages);

  useEffect(() => {
    let mounted = true;
    
    const detectUserCurrency = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🎯 ULTIMATE: Using geolocation + Nigeria fallback detection');
        
        // Use the new geolocation-based detection system
        const locationData = await getLocationWithFallback();
        
        if (mounted) {
          setCurrency(locationData.currency);
          setSymbol(locationData.symbol);
          setLocation(locationData);
          
          // Get real exchange rate
          try {
            const realExchangeRate = await exchangeRateService.getExchangeRate(locationData.currency);
            setExchangeRate(realExchangeRate);
            console.log('💱 Real exchange rate fetched:', `1 USD = ${realExchangeRate} ${locationData.currency.toUpperCase()}`);
          } catch (rateError) {
            console.warn('⚠️ Failed to get real exchange rate, using fallback');
            // Use fallback rate based on currency
            const fallbackRates = {
              'ngn': 1500,
              'kes': 150,
              'ghs': 12,
              'zar': 18,
              'tzs': 2500,
              'ugx': 3700,
              'usd': 1
            };
            setExchangeRate(fallbackRates[locationData.currency] || 1);
          }
          
          console.log('🎯 ULTIMATE: Currency set to:', locationData.currency, locationData.symbol);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          // Nigerian fallback for EDU-SAGE platform
          setCurrency('ngn');
          setSymbol('₦');
          setExchangeRate(1500);
          setLocation({
            country: 'Nigeria',
            countryCode: 'ng',
            currency: 'ngn',
            symbol: '₦',
            city: 'Lagos',
            flag: '🇳🇬',
            displayName: 'Lagos, Nigeria',
            isAfrican: true,
            method: 'NIGERIA-FALLBACK'
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    detectUserCurrency();

    return () => {
      mounted = false;
    };
  }, []);

  const format = (amount, customCurrency) => {
    return formatCurrency(amount, customCurrency || currency);
  };

  const getSymbol = (customCurrency) => {
    return getCurrencySymbol(customCurrency || currency);
  };

  // Additional utility functions
  const convertToLocal = async (usdAmount) => {
    if (currency === 'usd') return usdAmount;
    
    try {
      const conversion = await getUserLocationAndCurrency();
      return usdAmount * (conversion.exchangeRate || 1);
    } catch (error) {
      console.error('Currency conversion error:', error);
      return usdAmount;
    }
  };

  const formatLocalAmount = (usdAmount, showBoth = false) => {
    if (currency === 'usd') {
      return formatCurrency(usdAmount, 'usd');
    }
    
    const localAmount = usdAmount * (location?.exchangeRate || 1);
    const localFormatted = formatCurrency(localAmount, currency);
    
    if (showBoth) {
      return `${localFormatted} (≈ ${formatCurrency(usdAmount, 'usd')})`;
    }
    
    return localFormatted;
  };

  // Convert from USD to local currency using real exchange rates
  const convertFromUSD = async (amount) => {
    if (!amount || amount === 0) return 0;
    
    try {
      return await exchangeRateService.convertFromUSD(amount, currency);
    } catch (error) {
      console.error('Error converting from USD:', error);
      return amount * exchangeRate; // Fallback to stored rate
    }
  };

  // Convert to USD from local currency
  const convertToUSD = async (localAmount) => {
    if (!localAmount || localAmount === 0) return 0;
    
    try {
      return await exchangeRateService.convertToUSD(localAmount, currency);
    } catch (error) {
      console.error('Error converting to USD:', error);
      return localAmount / exchangeRate; // Fallback to stored rate
    }
  };

  // Format amount in USD
  const formatUSD = (amount) => {
    return exchangeRateService.formatCurrency(amount, 'USD');
  };

  // Format amount in local currency
  const formatLocal = (amount) => {
    return exchangeRateService.formatCurrency(amount, currency);
  };

  // Get multi-currency display (USD + local)
  const getMultiCurrencyDisplay = async (usdAmount) => {
    try {
      return await exchangeRateService.getMultiCurrencyDisplay(usdAmount, currency);
    } catch (error) {
      console.error('Error getting multi-currency display:', error);
      return {
        usd: { amount: usdAmount, formatted: formatUSD(usdAmount), currency: 'USD' },
        local: { amount: usdAmount * exchangeRate, formatted: formatLocal(usdAmount * exchangeRate), currency: currency.toUpperCase() }
      };
    }
  };

  // Format amount in local currency (async version for compatibility)
  const formatLocalAsync = async (amount) => {
    return formatLocal(amount);
  };

  // Get current exchange rate
  const getCurrentExchangeRate = () => {
    return exchangeRate;
  };

  // Refresh currency function
  const refreshCurrency = async () => {
    const detectUserCurrency = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const locationData = await getUserLocationAndCurrency();
        
        setCurrency(locationData.currency);
        setSymbol(locationData.symbol);
        setLocation(locationData);
        setExchangeRate(locationData.exchangeRate || 1);
      } catch (err) {
        setError(err.message);
        // Fallback to USD
        setCurrency('usd');
        setSymbol('$');
        setExchangeRate(1);
      } finally {
        setLoading(false);
      }
    };

    await detectUserCurrency();
  };

  return {
    currency,
    symbol,
    location,
    loading,
    error,
    exchangeRate,
    format,
    getSymbol,
    convertToLocal,
    formatLocalAmount,
    isAfrican: location?.isAfrican || false,
    recommendedGateway: location?.recommendedGateway || 'stripe',
    countryName: location?.country || 'Unknown',
    cityName: location?.city || 'Unknown',
    flag: location?.flag || '🌍',
    // Additional helpful utilities
    convertPrice: (usdAmount) => convertToLocal(usdAmount),
    formatCurrency: (amount, currencyCode) => formatCurrency(amount, currencyCode || currency),
    getCurrencySymbol: (currencyCode) => getCurrencySymbol(currencyCode || currency),
    convertToUSD: convertToUSD,
    
    // Compatibility properties for old CurrencyContext
    convertFromUSD,
    convertToUSD,
    formatUSD,
    formatLocal,
    formatLocalAsync,
    getMultiCurrencyDisplay,
    getCurrentExchangeRate,
    refreshCurrency,
    isUSD: currency === 'usd',
    isNGN: currency === 'ngn',
    countryCode: location?.countryCode || 'us',
    regionName: location?.region || 'Unknown',
    
    // Test function to force refresh
    testRefresh: async () => {
      console.log('🔄 Test refresh triggered');
      await refreshCurrency();
    }
  };
};

export default useCurrency; 