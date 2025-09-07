import { useState, useEffect } from 'react';

/**
 * Custom hook for managing user's location-based currency - Mobile Version
 * @returns {object} Currency state and utilities
 */
export const useCurrency = () => {
  const [currency, setCurrency] = useState('ngn'); // Default to NGN for ThinqScribe
  const [symbol, setSymbol] = useState('₦');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(1500);

  console.log('🔥 MOBILE: useCurrency hook called');
  console.log('🔥 MOBILE: Default to Nigerian market');

  useEffect(() => {
    let mounted = true;
    
    const detectUserCurrency = async () => {
      try {
        setLoading(true);
        setError(null);

        // For mobile, we'll use a simpler approach with Nigerian default
        // but still detect actual location for accuracy
        console.log('🌍 [MOBILE] Starting location detection...');

        // Try to get location from platform APIs
        let locationData = null;
        
        try {
          // Try fetch to external IP service for location detection
          const response = await fetch('https://ipapi.co/json/', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            },
            timeout: 8000
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('🌍 [MOBILE] IP Location detected:', data);
            
            locationData = {
              country: data.country_name || 'Nigeria',
              countryCode: (data.country_code || 'ng').toLowerCase(),
              currency: data.country_code?.toLowerCase() === 'ng' ? 'ngn' : 'usd',
              symbol: data.country_code?.toLowerCase() === 'ng' ? '₦' : '$',
              exchangeRate: data.country_code?.toLowerCase() === 'ng' ? 1500 : 1,
              city: data.city || 'Lagos',
              region: data.region || 'Lagos State',
              timezone: data.timezone || 'Africa/Lagos',
              ip: data.ip || 'Unknown',
              flag: data.country_code?.toLowerCase() === 'ng' ? '🇳🇬' : '🌍',
              displayName: `${data.city || 'Lagos'}, ${data.country_name || 'Nigeria'}`,
              isAfrican: data.country_code?.toLowerCase() === 'ng',
              recommendedGateway: data.country_code?.toLowerCase() === 'ng' ? 'paystack' : 'stripe',
              detectionMethod: 'ip-api'
            };
          }
        } catch (ipError) {
          console.warn('🌍 [MOBILE] IP detection failed:', ipError.message);
        }

        // If no location data, use Nigerian default for ThinqScribe platform
        if (!locationData) {
          console.log('🇳🇬 [MOBILE] Using Nigerian default for ThinqScribe platform');
          locationData = {
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
            detectionMethod: 'default-nigerian'
          };
        }

        if (mounted) {
          setCurrency(locationData.currency);
          setSymbol(locationData.symbol);
          setExchangeRate(locationData.exchangeRate);
          setLocation(locationData);
          
          console.log('✅ [MOBILE] Currency detection completed:', {
            currency: locationData.currency,
            symbol: locationData.symbol,
            country: locationData.country,
            exchangeRate: locationData.exchangeRate
          });
        }
      } catch (err) {
        console.error('❌ [MOBILE] Currency detection error:', err);
        if (mounted) {
          setError(err.message);
          // Nigerian fallback for ThinqScribe platform
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

  // Format currency for mobile display
  const formatCurrency = (amount, customCurrency) => {
    const currencyToUse = customCurrency || currency;
    const symbolToUse = customCurrency ? getCurrencySymbol(customCurrency) : symbol;
    
    if (!amount && amount !== 0) return `${symbolToUse}0`;
    
    // Special formatting for NGN (no decimal places typically)
    if (currencyToUse.toLowerCase() === 'ngn') {
      const formatted = Math.round(parseFloat(amount)).toLocaleString();
      return `${symbolToUse}${formatted}`;
    }
    
    const formatted = parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return `${symbolToUse}${formatted}`;
  };

  // Convert price utility
  const convertPrice = (usdAmount) => {
    if (currency === 'usd') return usdAmount;
    return usdAmount * exchangeRate;
  };

  return {
    currency,
    symbol,
    location,
    loading,
    error,
    exchangeRate,
    formatCurrency,
    convertPrice,
    getCurrencySymbol: (customCurrency) => {
      const currencySymbols = {
        usd: '$', eur: '€', gbp: '£', ngn: '₦', ghs: '₵', 
        kes: 'KSh', zar: 'R', cad: 'C$', aud: 'A$'
      };
      return currencySymbols[(customCurrency || currency).toLowerCase()] || '$';
    },
    isAfrican: location?.isAfrican || false,
    recommendedGateway: location?.recommendedGateway || 'paystack',
    countryName: location?.country || 'Nigeria',
    cityName: location?.city || 'Lagos',
    flag: location?.flag || '🇳🇬',
    isUSD: currency === 'usd',
    isNGN: currency === 'ngn',
    countryCode: location?.countryCode || 'ng'
  };
};

// Get currency symbol helper
const getCurrencySymbol = (currency) => {
  const currencySymbols = {
    usd: '$', eur: '€', gbp: '£', ngn: '₦', ghs: '₵', 
    kes: 'KSh', zar: 'R', cad: 'C$', aud: 'A$'
  };
  return currencySymbols[currency?.toLowerCase()] || '$';
};

export default useCurrency;
