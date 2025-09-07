// Location caching utility to prevent re-initialization on navigation
class LocationCache {
  constructor() {
    this.cacheKey = 'edu_sage_location_cache';
    this.cacheExpiryKey = 'edu_sage_location_cache_expiry';
    this.cacheValidityHours = 2; // Cache for 2 hours
    this.inMemoryCache = null;
    this.fetchPromise = null; // Prevent multiple simultaneous fetches
  }

  // Check if cached data is still valid
  isValidCache() {
    const cacheExpiry = localStorage.getItem(this.cacheExpiryKey);
    const now = Date.now();
    return cacheExpiry && now < parseInt(cacheExpiry);
  }

  // Get cached location data
  getCachedData() {
    try {
      // Check in-memory cache first (fastest)
      if (this.inMemoryCache && this.isValidCache()) {
        console.log('⚡ Using in-memory location cache');
        return this.inMemoryCache;
      }

      // Check localStorage cache
      const cachedData = localStorage.getItem(this.cacheKey);
      if (cachedData && this.isValidCache()) {
        const locationData = JSON.parse(cachedData);
        this.inMemoryCache = locationData; // Store in memory for faster access
        
        const cacheExpiry = localStorage.getItem(this.cacheExpiryKey);
        const remainingMinutes = Math.round((parseInt(cacheExpiry) - Date.now()) / (1000 * 60));
        console.log(`✅ Using cached location data (valid for ${remainingMinutes} more minutes)`);
        
        return locationData;
      }
    } catch (error) {
      console.warn('⚠️ Failed to parse cached location data:', error);
    }
    
    return null;
  }

  // Set cached location data
  setCachedData(locationData) {
    try {
      const now = Date.now();
      const expiry = now + (this.cacheValidityHours * 60 * 60 * 1000);
      
      localStorage.setItem(this.cacheKey, JSON.stringify(locationData));
      localStorage.setItem(this.cacheExpiryKey, expiry.toString());
      this.inMemoryCache = locationData;
      
      console.log('💾 Location data cached successfully');
    } catch (error) {
      console.warn('⚠️ Failed to cache location data:', error);
    }
  }

  // Clear cache (for debugging or force refresh)
  clearCache() {
    localStorage.removeItem(this.cacheKey);
    localStorage.removeItem(this.cacheExpiryKey);
    this.inMemoryCache = null;
    console.log('🗑️ Location cache cleared');
  }

  // Get location with smart caching
  async getLocation(forceRefresh = false) {
    // If force refresh, clear cache first
    if (forceRefresh) {
      this.clearCache();
    }

    // Check cache first
    const cachedData = this.getCachedData();
    if (cachedData && !forceRefresh) {
      return cachedData;
    }

    // Prevent multiple simultaneous fetches
    if (this.fetchPromise) {
      console.log('🔄 Location fetch already in progress, waiting...');
      return await this.fetchPromise;
    }

    // Fetch fresh data
    this.fetchPromise = this.fetchLocationData();
    
    try {
      const locationData = await this.fetchPromise;
      this.setCachedData(locationData);
      return locationData;
    } finally {
      this.fetchPromise = null;
    }
  }

  // Fetch location data from API
  async fetchLocationData() {
    console.log('🔄 Fetching fresh location data...');
    
    try {
      const { getUserLocationAndCurrency } = await import('./currencyUtils.js');
      const locationData = await getUserLocationAndCurrency();
      
      if (locationData) {
        // Process and normalize the data
        return this.processLocationData(locationData);
      }
      
      throw new Error('No location data received');
    } catch (error) {
      console.warn('⚠️ Location fetch failed, using fallback:', error.message);
      return this.getFallbackData();
    }
  }

  // Process and normalize location data
  processLocationData(rawData) {
    // Detect Nigerian location
    const isNigeria = (
      rawData.countryCode === 'ng' || 
      rawData.countryCode === 'NG' ||
      rawData.country?.toLowerCase().includes('nigeria') ||
      rawData.city?.toLowerCase().includes('lagos') ||
      rawData.timezone?.includes('Lagos') ||
      rawData.flag === '🇳🇬'
    );

    // Browser timezone check
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isAfricaTimezone = browserTimezone?.includes('Africa/Lagos') || browserTimezone?.includes('Africa');

    // Determine final currency
    let finalCurrency = rawData.currency || 'usd';
    let finalSymbol = rawData.symbol || '$';
    let finalExchangeRate = rawData.exchangeRate || 1;

    if (isNigeria || isAfricaTimezone || finalCurrency === 'ngn') {
      finalCurrency = 'ngn';
      finalSymbol = '₦';
      finalExchangeRate = 1530;
    }

    return {
      ...rawData,
      currency: finalCurrency,
      symbol: finalSymbol,
      exchangeRate: finalExchangeRate,
      country: isNigeria ? 'Nigeria' : rawData.country,
      countryCode: isNigeria ? 'ng' : rawData.countryCode,
      city: isNigeria ? 'Lagos' : rawData.city,
      flag: isNigeria ? '🇳🇬' : rawData.flag,
      isAfrican: isNigeria || rawData.isAfrican,
      recommendedGateway: finalCurrency === 'ngn' ? 'paystack' : 'stripe',
      recommendedCurrency: finalCurrency,
      currencySymbol: finalSymbol,
      detectionMethod: rawData.detectionMethod || 'api',
      timestamp: Date.now()
    };
  }

  // Fallback data for Nigeria
  getFallbackData() {
    return {
      country: 'Nigeria',
      countryCode: 'ng',
      currency: 'ngn',
      symbol: '₦',
      exchangeRate: 1530,
      city: 'Lagos',
      region: 'Lagos State',
      timezone: 'Africa/Lagos',
      flag: '🇳🇬',
      displayName: 'Lagos, Nigeria',
      isAfrican: true,
      recommendedGateway: 'paystack',
      recommendedCurrency: 'ngn',
      currencySymbol: '₦',
      detectionMethod: 'fallback',
      timestamp: Date.now()
    };
  }
}

// Export singleton instance
export const locationCache = new LocationCache();
export default locationCache; 