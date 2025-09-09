// Location Service - React Native Version
// Handles user location detection and currency recommendations

class LocationService {
  constructor() {
    this.cache = {
      location: null,
      timestamp: null,
      ttl: 1000 * 60 * 60 * 24 // 24 hour cache for location
    };

    // Country to currency mapping
    this.countryToCurrency = {
      'NG': 'NGN', 'GH': 'GHS', 'KE': 'KES', 'ZA': 'ZAR', 'EG': 'EGP',
      'US': 'USD', 'GB': 'GBP', 'CA': 'CAD', 'AU': 'AUD', 'JP': 'JPY',
      'CN': 'CNY', 'IN': 'INR', 'BR': 'BRL', 'MX': 'MXN', 'RU': 'RUB',
      'SA': 'SAR', 'AE': 'AED', 'TR': 'TRY', 'MA': 'MAD', 'TN': 'TND',
      'ET': 'ETB', 'UG': 'UGX', 'TZ': 'TZS', 'MZ': 'MZN', 'ZM': 'ZMW',
      'BW': 'BWP', 'MU': 'MUR', 'RW': 'RWF', 'MW': 'MWK', 'LS': 'LSL',
      'SZ': 'SZL', 'NA': 'NAD', 'BZ': 'BZD', 'GY': 'GYD', 'SR': 'SRD',
      'TT': 'TTD', 'JM': 'JMD', 'BB': 'BBD', 'BS': 'BSD', 'AG': 'XCD',
      'DM': 'XCD', 'GD': 'XCD', 'KN': 'XCD', 'LC': 'XCD', 'VC': 'XCD'
    };

    // African countries
    this.africanCountries = [
      'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CM', 'CV', 'CF', 'TD', 'KM', 'CD', 'CG', 'CI', 'DJ', 'EG', 'GQ', 'ER', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'SZ', 'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW'
    ];

    // Country flags and display names
    this.countryInfo = {
      'NG': { flag: '🇳🇬', name: 'Nigeria', currency: 'NGN' },
      'GH': { flag: '🇬🇭', name: 'Ghana', currency: 'GHS' },
      'KE': { flag: '🇰🇪', name: 'Kenya', currency: 'KES' },
      'ZA': { flag: '🇿🇦', name: 'South Africa', currency: 'ZAR' },
      'EG': { flag: '🇪🇬', name: 'Egypt', currency: 'EGP' },
      'MA': { flag: '🇲🇦', name: 'Morocco', currency: 'MAD' },
      'TN': { flag: '🇹🇳', name: 'Tunisia', currency: 'TND' },
      'ET': { flag: '🇪🇹', name: 'Ethiopia', currency: 'ETB' },
      'UG': { flag: '🇺🇬', name: 'Uganda', currency: 'UGX' },
      'TZ': { flag: '🇹🇿', name: 'Tanzania', currency: 'TZS' },
      'MZ': { flag: '🇲🇿', name: 'Mozambique', currency: 'MZN' },
      'ZM': { flag: '🇿🇲', name: 'Zambia', currency: 'ZMW' },
      'BW': { flag: '🇧🇼', name: 'Botswana', currency: 'BWP' },
      'MU': { flag: '🇲🇺', name: 'Mauritius', currency: 'MUR' },
      'RW': { flag: '🇷🇼', name: 'Rwanda', currency: 'RWF' },
      'US': { flag: '🇺🇸', name: 'United States', currency: 'USD' },
      'GB': { flag: '🇬🇧', name: 'United Kingdom', currency: 'GBP' },
      'CA': { flag: '🇨🇦', name: 'Canada', currency: 'CAD' },
      'AU': { flag: '🇦🇺', name: 'Australia', currency: 'AUD' },
      'JP': { flag: '🇯🇵', name: 'Japan', currency: 'JPY' },
      'CN': { flag: '🇨🇳', name: 'China', currency: 'CNY' },
      'IN': { flag: '🇮🇳', name: 'India', currency: 'INR' },
      'BR': { flag: '🇧🇷', name: 'Brazil', currency: 'BRL' },
      'MX': { flag: '🇲🇽', name: 'Mexico', currency: 'MXN' },
      'RU': { flag: '🇷🇺', name: 'Russia', currency: 'RUB' },
      'SA': { flag: '🇸🇦', name: 'Saudi Arabia', currency: 'SAR' },
      'AE': { flag: '🇦🇪', name: 'UAE', currency: 'AED' },
      'TR': { flag: '🇹🇷', name: 'Turkey', currency: 'TRY' }
    };
  }

  // Check if location cache is valid
  isLocationCacheValid() {
    return this.cache.location && 
           this.cache.timestamp && 
           (Date.now() - this.cache.timestamp) < this.cache.ttl;
  }

  // Get user location (simplified for mobile)
  async getLocation() {
    try {
      // Return cached location if valid
      if (this.isLocationCacheValid()) {
        console.log('📍 Using cached location data');
        return this.cache.location;
      }

      console.log('📍 Detecting user location...');

      // For React Native, we'll use a simplified approach
      // In production, you might want to use react-native-geolocation-service
      // or react-native-geolocation-service for more accurate location detection
      
      // Try to get location from IP-based service
      const location = await this.getLocationFromIP();
      
      if (location) {
        // Cache the location
        this.cache = {
          location,
          timestamp: Date.now(),
          ttl: this.cache.ttl
        };
        
        console.log('📍 Location detected:', location);
        return location;
      }

      // Fallback to default location
      const fallbackLocation = this.getDefaultLocation();
      console.log('📍 Using fallback location:', fallbackLocation);
      
      this.cache = {
        location: fallbackLocation,
        timestamp: Date.now(),
        ttl: this.cache.ttl
      };
      
      return fallbackLocation;

    } catch (error) {
      console.error('❌ Failed to get location:', error);
      return this.getDefaultLocation();
    }
  }

  // Get location from IP-based service
  async getLocationFromIP() {
    try {
      // Use a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('IP service unavailable');

      const data = await response.json();
      
      if (data.country_code) {
        const countryCode = data.country_code.toUpperCase();
        const countryInfo = this.countryInfo[countryCode];
        
        return {
          country: data.country_name || 'Unknown',
          countryCode: countryCode,
          city: data.city || 'Unknown',
          region: data.region || 'Unknown',
          currency: this.countryToCurrency[countryCode] || 'USD',
          isAfrican: this.africanCountries.includes(countryCode),
          preferredPaymentGateway: this.africanCountries.includes(countryCode) ? 'paystack' : 'stripe',
          flag: countryInfo?.flag || '🌍',
          displayName: countryInfo ? `${countryInfo.flag} ${countryInfo.name}` : `${countryCode}`,
          timezone: data.timezone || 'UTC',
          latitude: data.latitude,
          longitude: data.longitude
        };
      }
      
      return null;
    } catch (error) {
      console.warn('⚠️ IP-based location detection failed:', error.message);
      return null;
    }
  }

  // Get default location (fallback)
  getDefaultLocation() {
    return {
      country: 'Nigeria',
      countryCode: 'NG',
      city: 'Lagos',
      region: 'Lagos',
      currency: 'NGN',
      isAfrican: true,
      preferredPaymentGateway: 'paystack',
      flag: '🇳🇬',
      displayName: '🇳🇬 Nigeria',
      timezone: 'Africa/Lagos',
      latitude: 6.5244,
      longitude: 3.3792
    };
  }

  // Get currency recommendation based on location
  getCurrencyRecommendation(location) {
    if (!location) return 'USD';

    const countryCode = location.countryCode;
    const recommendedCurrency = this.countryToCurrency[countryCode] || 'USD';
    
    console.log('💱 Currency recommendation:', {
      country: location.country,
      countryCode,
      recommendedCurrency
    });
    
    return recommendedCurrency;
  }

  // Get payment gateway recommendation based on location
  getGatewayRecommendation(location) {
    if (!location) return 'stripe';

    const isAfrican = location.isAfrican || this.africanCountries.includes(location.countryCode);
    const recommendedGateway = isAfrican ? 'paystack' : 'stripe';
    
    console.log('💳 Gateway recommendation:', {
      country: location.country,
      isAfrican,
      recommendedGateway
    });
    
    return recommendedGateway;
  }

  // Check if country is African
  isAfricanCountry(countryCode) {
    return this.africanCountries.includes(countryCode?.toUpperCase());
  }

  // Get country info
  getCountryInfo(countryCode) {
    return this.countryInfo[countryCode?.toUpperCase()] || null;
  }

  // Clear location cache
  clearCache() {
    this.cache = {
      location: null,
      timestamp: null,
      ttl: this.cache.ttl
    };
  }

  // Get fresh location (bypass cache)
  async getLocationFresh() {
    this.clearCache();
    return this.getLocation();
  }

  // Get location summary for display
  getLocationSummary(location) {
    if (!location) return 'Location not available';

    return {
      display: location.displayName || `${location.flag} ${location.country}`,
      currency: location.currency,
      gateway: location.preferredPaymentGateway,
      isAfrican: location.isAfrican
    };
  }
}

// Create singleton instance
const locationService = new LocationService();

export default locationService;
