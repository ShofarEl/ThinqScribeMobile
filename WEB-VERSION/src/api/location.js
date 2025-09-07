import { API_BASE_URL, API_ENDPOINTS } from './constants.js';

// Location API Service
class LocationAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.endpoints = API_ENDPOINTS.LOCATION;
  }

  // Helper method to make API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    };

    try {
      const response = await fetch(url, defaultOptions);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Location API Error:', error);
      throw error;
    }
  }

  // Detect user's location from IP
  async detectLocation() {
    try {
      const response = await this.makeRequest(this.endpoints.DETECT);
      return response;
    } catch (error) {
      console.error('Failed to detect location:', error);
      return {
        success: false,
        error: error.message,
        data: {
          country: 'United States',
          countryCode: 'us',
          city: 'New York',
          region: 'New York',
          timezone: 'America/New_York',
          ip: 'unknown'
        }
      };
    }
  }

  // Get location summary for payment processing
  async getLocationSummary() {
    try {
      const response = await this.makeRequest(this.endpoints.SUMMARY);
      return response;
    } catch (error) {
      console.error('Failed to get location summary:', error);
      return {
        success: false,
        error: error.message,
        summary: this.getDefaultLocationSummary()
      };
    }
  }

  // Get user's location and currency information
  async getCurrency() {
    try {
      const response = await this.makeRequest(this.endpoints.CURRENCY);
      return response;
    } catch (error) {
      console.error('Failed to get location currency:', error);
      return {
        success: false,
        error: error.message,
        data: {
          country: 'United States',
          countryCode: 'us',
          currency: 'usd',
          symbol: '$',
          exchangeRate: 1,
          city: 'New York',
          region: 'New York',
          timezone: 'America/New_York',
          ip: 'unknown'
        }
      };
    }
  }

  // Get user's location and currency information (legacy method)
  async getLocationCurrency() {
    return await this.getCurrency();
  }

  // Get location from external IP API (proxy to avoid CORS)
  async getExternalIPLocation() {
    try {
      const response = await this.makeRequest(this.endpoints.EXTERNAL_IP);
      return response;
    } catch (error) {
      console.error('Failed to get external IP location:', error);
      return {
        success: false,
        error: error.message,
        location: {
          country: 'United States',
          countryCode: 'us',
          city: 'Unknown',
          region: 'Unknown',
          timezone: 'UTC',
          ip: 'Unknown'
        },
        currency: {
          code: 'usd',
          symbol: '$',
          exchangeRate: 1
        }
      };
    }
  }

  // Get location by specific IP address
  async getLocationByIP(ipAddress) {
    try {
      const response = await this.makeRequest(this.endpoints.BY_IP, {
        method: 'POST',
        body: JSON.stringify({ ipAddress })
      });
      return response;
    } catch (error) {
      console.error('Failed to get location by IP:', error);
      throw error;
    }
  }

  // Check if a country is in Africa
  async isAfricanCountry(countryCode) {
    try {
      const response = await this.makeRequest(`${this.endpoints.IS_AFRICAN}/${countryCode}`);
      return response;
    } catch (error) {
      console.error('Failed to check if country is African:', error);
      return {
        success: false,
        error: error.message,
        isAfrican: false,
        recommendedGateway: 'stripe'
      };
    }
  }

  // Get cache statistics (admin)
  async getCacheStats() {
    try {
      const response = await this.makeRequest(this.endpoints.CACHE_STATS);
      return response;
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      throw error;
    }
  }

  // Clear location cache (admin)
  async clearCache() {
    try {
      const response = await this.makeRequest(this.endpoints.CLEAR_CACHE, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  // Get cached location data from localStorage
  getCachedLocation() {
    try {
      const cached = localStorage.getItem('location_data');
      if (cached) {
        const data = JSON.parse(cached);
        const isExpired = Date.now() - data.timestamp > 30 * 60 * 1000; // 30 minutes
        
        if (!isExpired) {
          return data.location;
        }
      }
    } catch (error) {
      console.error('Failed to get cached location:', error);
    }
    return null;
  }

  // Cache location data in localStorage
  cacheLocation(location) {
    try {
      const data = {
        location,
        timestamp: Date.now()
      };
      localStorage.setItem('location_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to cache location:', error);
    }
  }

  // Get location with caching
  async getLocationWithCache() {
    // Try to get from cache first
    const cached = this.getCachedLocation();
    if (cached) {
      return { success: true, location: cached, fromCache: true };
    }

    // If not in cache, detect location
    const result = await this.detectLocation();
    if (result.success) {
      this.cacheLocation(result.location);
    }
    
    return { ...result, fromCache: false };
  }

  // Get default location (fallback)
  getDefaultLocation() {
    return {
      country: 'United States',
      countryCode: 'us',
      city: 'New York',
      region: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
      currency: 'usd',
      isp: null,
      ipAddress: null,
      isAfrican: false,
      flag: '🇺🇸',
      displayName: 'New York, United States',
      recommendedGateway: 'stripe',
      recommendedCurrency: 'usd'
    };
  }

  // Get default location summary
  getDefaultLocationSummary() {
    return {
      country: 'United States',
      countryCode: 'us',
      city: 'New York',
      displayName: 'New York, United States',
      flag: '🇺🇸',
      isAfrican: false,
      recommendedGateway: 'stripe',
      recommendedCurrency: 'usd',
      timezone: 'America/New_York'
    };
  }

  // Get country flag emoji
  getCountryFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '🌍';
    
    return countryCode
      .toUpperCase()
      .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
  }

  // Format location display name
  formatDisplayName(city, country) {
    if (city && country) {
      return `${city}, ${country}`;
    }
    return country || 'Unknown Location';
  }

  // Clear cached location
  clearCachedLocation() {
    try {
      localStorage.removeItem('location_data');
    } catch (error) {
      console.error('Failed to clear cached location:', error);
    }
  }
}

// Export singleton instance
const locationApi = new LocationAPI();

export default locationApi;
export { locationApi }; 