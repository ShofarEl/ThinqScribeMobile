// Location Detection Service
// Uses multiple methods for accurate location detection: IP geolocation, browser API, and fallbacks

class LocationService {
  constructor() {
    this.cache = {
      location: null,
      timestamp: null,
      ttl: 1000 * 60 * 30 // 30 minutes cache
    };
    
    // African countries for payment gateway selection
    this.africanCountries = new Set([
      'NG', 'GH', 'KE', 'ZA', 'EG', 'MA', 'TN', 'DZ', 'LY', 'SD',
      'ET', 'UG', 'TZ', 'MZ', 'MW', 'ZM', 'ZW', 'BW', 'NA', 'SZ',
      'LS', 'MG', 'MU', 'SC', 'KM', 'DJ', 'SO', 'ER', 'SS', 'CF',
      'TD', 'CM', 'GQ', 'GA', 'CG', 'CD', 'AO', 'ST', 'CV', 'GW',
      'GN', 'SL', 'LR', 'CI', 'BF', 'ML', 'NE', 'SN', 'GM', 'MR',
      'EH', 'BI', 'RW'
    ]);

    // Currency mapping based on countries
    this.currencyMap = {
      // Major currencies
      'US': 'USD', 'GB': 'GBP', 'EU': 'EUR', 'CA': 'CAD', 'AU': 'AUD',
      'JP': 'JPY', 'CN': 'CNY', 'IN': 'INR', 'BR': 'BRL', 'MX': 'MXN',
      
      // African currencies
      'NG': 'NGN', 'GH': 'GHS', 'KE': 'KES', 'ZA': 'ZAR', 'EG': 'EGP',
      'MA': 'MAD', 'TN': 'TND', 'DZ': 'DZD', 'ET': 'ETB', 'UG': 'UGX',
      'TZ': 'TZS', 'MZ': 'MZN', 'ZM': 'ZMW', 'BW': 'BWP', 'MU': 'MUR',
      
      // Other common currencies
      'RU': 'RUB', 'TR': 'TRY', 'SA': 'SAR', 'AE': 'AED', 'QA': 'QAR',
      'KW': 'KWD', 'BH': 'BHD', 'OM': 'OMR', 'JO': 'JOD', 'LB': 'LBP',
      'IL': 'ILS', 'IR': 'IRR', 'IQ': 'IQD', 'AF': 'AFN', 'PK': 'PKR',
      'BD': 'BDT', 'LK': 'LKR', 'MM': 'MMK', 'TH': 'THB', 'VN': 'VND',
      'MY': 'MYR', 'SG': 'SGD', 'ID': 'IDR', 'PH': 'PHP', 'KR': 'KRW',
      'TW': 'TWD', 'HK': 'HKD', 'NZ': 'NZD'
    };

    // Supported payment gateways by region
    this.paymentGateways = {
      africa: ['paystack', 'flutterwave'],
      global: ['stripe', 'paypal']
    };
  }

  // Check if cached location is still valid
  isCacheValid() {
    return this.cache.location && 
           this.cache.timestamp && 
           (Date.now() - this.cache.timestamp) < this.cache.ttl;
  }

  // Get location using multiple methods
  async getLocation() {
    try {
      // Return cached result if valid
      if (this.isCacheValid()) {
        console.log('🗺️ Returning cached location:', this.cache.location);
        return this.cache.location;
      }

      console.log('🔍 Detecting user location...');
      
      // Try browser geolocation first (most accurate but requires permission)
      let location = await this.getBrowserLocation().catch(() => null);
      
      // Fallback to IP geolocation if browser location fails
      if (!location) {
        location = await this.getIPLocation();
      }
      
      // Enhance location data
      if (location) {
        location = await this.enhanceLocationData(location);
        
        // Cache the result
        this.cache = {
          location,
          timestamp: Date.now(),
          ttl: this.cache.ttl
        };
        
        console.log('✅ Location detected:', location);
        return location;
      }
      
      // Final fallback
      return this.getDefaultLocation();
      
    } catch (error) {
      console.error('❌ Location detection failed:', error);
      return this.getDefaultLocation();
    }
  }

  // Browser geolocation API (most accurate)
  async getBrowserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocoding to get location details
            const locationData = await this.reverseGeocode(latitude, longitude);
            resolve({
              ...locationData,
              coordinates: { latitude, longitude },
              source: 'browser',
              accuracy: position.coords.accuracy
            });
          } catch (error) {
            // If reverse geocoding fails, provide basic info
            resolve({
              country: 'Unknown',
              countryCode: 'UN',
              city: 'Unknown',
              region: 'Unknown',
              coordinates: { latitude, longitude },
              source: 'browser',
              accuracy: position.coords.accuracy
            });
          }
        },
        (error) => {
          console.log('Browser geolocation denied or failed:', error.message);
          reject(error);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes
        }
      );
    });
  }

  // IP-based geolocation (fallback)
  async getIPLocation() {
    const services = [
      // Primary service
      {
        url: 'https://ipapi.co/json/',
        parser: (data) => ({
          country: data.country_name,
          countryCode: data.country_code,
          city: data.city,
          region: data.region,
          timezone: data.timezone,
          isp: data.org,
          source: 'ip-ipapi'
        })
      },
      // Fallback services
      {
        url: 'https://api.ipgeolocation.io/ipgeo?apiKey=free',
        parser: (data) => ({
          country: data.country_name,
          countryCode: data.country_code2,
          city: data.city,
          region: data.state_prov,
          timezone: data.time_zone?.name,
          source: 'ip-ipgeolocation'
        })
      },
      {
        url: 'https://freeipapi.com/api/json',
        parser: (data) => ({
          country: data.countryName,
          countryCode: data.countryCode,
          city: data.cityName,
          region: data.regionName,
          timezone: data.timeZone,
          source: 'ip-freeipapi'
        })
      }
    ];

    for (const service of services) {
      try {
        console.log(`🌐 Trying IP geolocation service: ${service.url}`);
        const response = await fetch(service.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        const location = service.parser(data);
        
        if (location.countryCode && location.countryCode !== 'UN') {
          console.log(`✅ IP location from ${service.url}:`, location);
          return location;
        }
      } catch (error) {
        console.warn(`⚠️ IP service failed ${service.url}:`, error.message);
        continue;
      }
    }
    
    throw new Error('All IP geolocation services failed');
  }

  // Reverse geocoding for browser coordinates
  async reverseGeocode(latitude, longitude) {
    try {
      // Using a free reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (!response.ok) throw new Error('Reverse geocoding failed');
      
      const data = await response.json();
      
      return {
        country: data.countryName,
        countryCode: data.countryCode,
        city: data.city || data.locality,
        region: data.principalSubdivision,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    } catch (error) {
      console.warn('⚠️ Reverse geocoding failed:', error);
      throw error;
    }
  }

  // Enhance location data with additional information
  async enhanceLocationData(location) {
    return {
      ...location,
      currency: this.getCurrencyForCountry(location.countryCode),
      isAfrican: this.isAfricanCountry(location.countryCode),
      preferredPaymentGateway: this.getPreferredPaymentGateway(location.countryCode),
      flag: this.getCountryFlag(location.countryCode),
      displayName: this.getDisplayName(location),
      timestamp: new Date().toISOString()
    };
  }

  // Get default location (fallback)
  getDefaultLocation() {
    return {
      country: 'United States',
      countryCode: 'US',
      city: 'New York',
      region: 'New York',
      currency: 'USD',
      isAfrican: false,
      preferredPaymentGateway: 'stripe',
      flag: '🇺🇸',
      displayName: 'New York, United States',
      source: 'default',
      timestamp: new Date().toISOString()
    };
  }

  // Get currency for country code
  getCurrencyForCountry(countryCode) {
    return this.currencyMap[countryCode] || 'USD';
  }

  // Check if country is African
  isAfricanCountry(countryCode) {
    return this.africanCountries.has(countryCode);
  }

  // Get preferred payment gateway based on location
  getPreferredPaymentGateway(countryCode) {
    if (this.isAfricanCountry(countryCode)) {
      return 'paystack'; // Primary for Africa
    }
    return 'stripe'; // Default for rest of world
  }

  // Get country flag emoji
  getCountryFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    
    return String.fromCodePoint(...codePoints);
  }

  // Get display name for location
  getDisplayName(location) {
    const parts = [];
    
    if (location.city && location.city !== 'Unknown') {
      parts.push(location.city);
    }
    
    if (location.region && location.region !== location.city && location.region !== 'Unknown') {
      parts.push(location.region);
    }
    
    if (location.country && location.country !== 'Unknown') {
      parts.push(location.country);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
  }

  // Get all supported currencies
  getSupportedCurrencies() {
    const currencies = new Set(Object.values(this.currencyMap));
    return Array.from(currencies).sort();
  }

  // Get payment gateways for region
  getPaymentGatewaysForRegion(isAfrican) {
    return isAfrican ? this.paymentGateways.africa : this.paymentGateways.global;
  }

  // Clear cache (useful for testing or manual refresh)
  clearCache() {
    this.cache = {
      location: null,
      timestamp: null,
      ttl: this.cache.ttl
    };
  }

  // Get location without caching (force refresh)
  async getLocationFresh() {
    this.clearCache();
    return this.getLocation();
  }
}

// Create singleton instance
const locationService = new LocationService();

export default locationService; 