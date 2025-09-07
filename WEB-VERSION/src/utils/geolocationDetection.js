// 🎯 ULTIMATE SOLUTION: Browser Geolocation API for maximum accuracy
// This gets the user's actual GPS/network location directly from the browser

console.log('🎯 ULTIMATE: Loading geolocation detection...');

// Reverse geocoding service to convert coordinates to country
const reverseGeocode = async (latitude, longitude) => {
  try {
    console.log(`📍 ULTIMATE: Reverse geocoding ${latitude}, ${longitude}...`);
    
    // Try multiple reverse geocoding services
    const services = [
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      `https://geocode.xyz/${latitude},${longitude}?json=1`,
      `http://api.positionstack.com/v1/reverse?access_key=demo&query=${latitude},${longitude}`
    ];
    
    for (const service of services) {
      try {
        console.log(`🌐 ULTIMATE: Trying reverse geocoding service: ${service}`);
        
        const response = await fetch(service, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        console.log('✅ ULTIMATE: Reverse geocoding response:', data);
        
        // Parse different service formats
        let countryCode = null;
        let countryName = null;
        let city = null;
        
        if (data.countryCode) {
          // bigdatacloud format
          countryCode = data.countryCode;
          countryName = data.countryName;
          city = data.city || data.locality;
        } else if (data.country) {
          // geocode.xyz format
          countryCode = data.prov; // This might be country code
          countryName = data.country;
          city = data.city;
        } else if (data.data && data.data[0]) {
          // positionstack format
          countryCode = data.data[0].country_code;
          countryName = data.data[0].country;
          city = data.data[0].locality;
        }
        
        if (countryCode && countryName) {
          return { countryCode, countryName, city };
        }
        
      } catch (error) {
        console.warn(`⚠️ ULTIMATE: Reverse geocoding service failed:`, error.message);
        continue;
      }
    }
    
    throw new Error('All reverse geocoding services failed');
    
  } catch (error) {
    console.error('❌ ULTIMATE: Reverse geocoding failed:', error);
    throw error;
  }
};

export const getGeolocation = async () => {
  console.log('🚀 ULTIMATE: Starting geolocation detection...');
  
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.error('❌ ULTIMATE: Geolocation not supported');
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    console.log('📍 ULTIMATE: Requesting geolocation permission...');
    
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0 // Force fresh location
    };
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log(`✅ ULTIMATE: Got coordinates: ${latitude}, ${longitude}`);
          
          // Get country from coordinates
          const geoData = await reverseGeocode(latitude, longitude);
          
          // Currency mapping
          const currencyMap = {
            'NG': { currency: 'ngn', symbol: '₦', flag: '🇳🇬' },
            'KE': { currency: 'kes', symbol: 'KSh', flag: '🇰🇪' },
            'US': { currency: 'usd', symbol: '$', flag: '🇺🇸' },
            'GB': { currency: 'gbp', symbol: '£', flag: '🇬🇧' },
            'CA': { currency: 'cad', symbol: 'C$', flag: '🇨🇦' },
            'AU': { currency: 'aud', symbol: 'A$', flag: '🇦🇺' },
            'ZA': { currency: 'zar', symbol: 'R', flag: '🇿🇦' },
            'GH': { currency: 'ghs', symbol: '₵', flag: '🇬🇭' },
            'TZ': { currency: 'tzs', symbol: 'TSh', flag: '🇹🇿' },
            'UG': { currency: 'ugx', symbol: 'USh', flag: '🇺🇬' }
          };
          
          const countryCode = geoData.countryCode.toUpperCase();
          const currencyInfo = currencyMap[countryCode] || { currency: 'usd', symbol: '$', flag: '🌍' };
          
          const result = {
            country: geoData.countryName,
            countryCode: countryCode.toLowerCase(),
            city: geoData.city,
            currency: currencyInfo.currency,
            symbol: currencyInfo.symbol,
            flag: currencyInfo.flag,
            latitude,
            longitude,
            method: 'GEOLOCATION-GPS'
          };
          
          console.log('🎯 ULTIMATE: Final geolocation result:', result);
          resolve(result);
          
        } catch (error) {
          console.error('❌ ULTIMATE: Error processing coordinates:', error);
          reject(error);
        }
      },
      (error) => {
        console.error('❌ ULTIMATE: Geolocation error:', error);
        
        let errorMessage = 'Geolocation failed';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Geolocation permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Geolocation position unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Geolocation timeout';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

// Fallback to Nigeria if geolocation fails
export const getLocationWithFallback = async () => {
  try {
    // Try geolocation first
    console.log('🎯 ULTIMATE: Trying geolocation first...');
    const geoResult = await getGeolocation();
    return geoResult;
    
  } catch (geoError) {
    console.warn('⚠️ ULTIMATE: Geolocation failed, using Nigeria fallback:', geoError.message);
    
    // Ultimate fallback - Nigeria for EDU-SAGE platform
    return {
      country: 'Nigeria',
      countryCode: 'ng',
      city: 'Lagos',
      currency: 'ngn',
      symbol: '₦',
      flag: '🇳🇬',
      method: 'NIGERIA-FALLBACK'
    };
  }
};

// Make it globally available for testing
if (typeof window !== 'undefined') {
  window.getGeolocation = getGeolocation;
  window.getLocationWithFallback = getLocationWithFallback;
} 