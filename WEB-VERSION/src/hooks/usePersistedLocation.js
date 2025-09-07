import { useState, useEffect, useRef } from 'react';

// Global state to prevent multiple fetches
let globalLocationState = {
  data: null,
  loading: false,
  error: null,
  lastFetch: 0,
  cacheExpiry: 2 * 60 * 60 * 1000 // 2 hours
};

export const usePersistedLocation = () => {
  const [location, setLocation] = useState(globalLocationState.data);
  const [loading, setLoading] = useState(globalLocationState.loading && !globalLocationState.data);
  const [error, setError] = useState(globalLocationState.error);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const initializeLocation = async () => {
      const now = Date.now();
      
      // Check if we have recent cached data
      if (globalLocationState.data && 
          (now - globalLocationState.lastFetch) < globalLocationState.cacheExpiry) {
        console.log('✅ Using cached location data');
        setLocation(globalLocationState.data);
        setLoading(false);
        return;
      }

      // Check localStorage cache
      try {
        const cached = localStorage.getItem('edu_sage_location_persistent');
        const cacheTime = localStorage.getItem('edu_sage_location_cache_time');
        
        if (cached && cacheTime && (now - parseInt(cacheTime)) < globalLocationState.cacheExpiry) {
          const locationData = JSON.parse(cached);
          console.log('✅ Using localStorage cached location');
          
          globalLocationState.data = locationData;
          globalLocationState.lastFetch = parseInt(cacheTime);
          
          if (mountedRef.current) {
            setLocation(locationData);
            setLoading(false);
          }
          return;
        }
      } catch (e) {
        console.warn('Cache read error:', e);
      }

      // Only fetch if not already fetching
      if (globalLocationState.loading) {
        console.log('⏳ Location fetch already in progress');
        return;
      }

      console.log('🔄 Fetching fresh location data...');
      globalLocationState.loading = true;
      
      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      try {
        // Dynamic import to avoid circular dependencies
        const { getUserLocationAndCurrency } = await import('../utils/currencyUtils.js');
        const locationData = await getUserLocationAndCurrency();
        
        if (locationData) {
          // Process location data
          const processedData = {
            ...locationData,
            country: locationData.country || 'Nigeria',
            countryCode: locationData.countryCode || 'ng',
            currency: locationData.currency || 'ngn',
            symbol: locationData.symbol || '₦',
            exchangeRate: locationData.exchangeRate || 1530,
            timestamp: now
          };

          // Update global state
          globalLocationState.data = processedData;
          globalLocationState.loading = false;
          globalLocationState.error = null;
          globalLocationState.lastFetch = now;

          // Cache to localStorage
          try {
            localStorage.setItem('edu_sage_location_persistent', JSON.stringify(processedData));
            localStorage.setItem('edu_sage_location_cache_time', now.toString());
          } catch (e) {
            console.warn('Cache write error:', e);
          }

          if (mountedRef.current) {
            setLocation(processedData);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Location fetch error:', err);
        
        const fallbackData = {
          country: 'Nigeria',
          countryCode: 'ng',
          currency: 'ngn',
          symbol: '₦',
          exchangeRate: 1530,
          city: 'Lagos',
          flag: '🇳🇬',
          error: err.message,
          timestamp: now
        };

        globalLocationState.data = fallbackData;
        globalLocationState.loading = false;
        globalLocationState.error = err.message;
        globalLocationState.lastFetch = now;

        if (mountedRef.current) {
          setLocation(fallbackData);
          setError(err.message);
          setLoading(false);
        }
      }
    };

    initializeLocation();
  }, []); // Empty dependency array - only run once

  // Force refresh function
  const refreshLocation = () => {
    globalLocationState.lastFetch = 0; // Invalidate cache
    localStorage.removeItem('edu_sage_location_persistent');
    localStorage.removeItem('edu_sage_location_cache_time');
    
    // Re-trigger fetch
    setLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return {
    location,
    loading,
    error,
    refreshLocation
  };
}; 