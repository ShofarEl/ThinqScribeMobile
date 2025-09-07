// 🔥 NUCLEAR SOLUTION: Ultra-simple location detection that ACTUALLY WORKS
// This bypasses ALL existing systems and directly gets your real IP location

console.log('🔥 NUCLEAR: Loading simple location detection...');

export const getSimpleLocation = async () => {
  console.log('🚀 NUCLEAR: Starting fresh location detection...');
  
  try {
    // Direct call to external service - NO caching, NO backend, NO complexity
    console.log('📡 NUCLEAR: Calling ipapi.co directly...');
    
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ NUCLEAR: Raw IP data received:', data);
    
    if (!data.country_code) {
      throw new Error('No country code in response');
    }
    
    // Simple currency mapping
    const currencyMap = {
      'NG': { currency: 'ngn', symbol: '₦', flag: '🇳🇬' },
      'KE': { currency: 'kes', symbol: 'KSh', flag: '🇰🇪' },
      'US': { currency: 'usd', symbol: '$', flag: '🇺🇸' },
      'GB': { currency: 'gbp', symbol: '£', flag: '🇬🇧' },
      'CA': { currency: 'cad', symbol: 'C$', flag: '🇨🇦' },
      'AU': { currency: 'aud', symbol: 'A$', flag: '🇦🇺' },
      'ZA': { currency: 'zar', symbol: 'R', flag: '🇿🇦' },
      'GH': { currency: 'ghs', symbol: '₵', flag: '🇬🇭' }
    };
    
    const countryCode = data.country_code.toUpperCase();
    const currencyInfo = currencyMap[countryCode] || { currency: 'usd', symbol: '$', flag: '🌍' };
    
    const result = {
      country: data.country_name,
      countryCode: countryCode.toLowerCase(),
      city: data.city,
      currency: currencyInfo.currency,
      symbol: currencyInfo.symbol,
      flag: currencyInfo.flag,
      ip: data.ip,
      method: 'NUCLEAR-SIMPLE'
    };
    
    console.log('🎯 NUCLEAR: Final result:', result);
    return result;
    
  } catch (error) {
    console.error('❌ NUCLEAR: Detection failed:', error);
    
    // Ultimate fallback
    return {
      country: 'United States',
      countryCode: 'us',
      city: 'New York',
      currency: 'usd',
      symbol: '$',
      flag: '🇺🇸',
      ip: 'Unknown',
      method: 'NUCLEAR-FALLBACK'
    };
  }
};

// Make it globally available for testing
if (typeof window !== 'undefined') {
  window.getSimpleLocation = getSimpleLocation;
} 