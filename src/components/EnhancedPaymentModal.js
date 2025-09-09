// EnhancedPaymentModal.js - React Native Version
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { agreementApi } from '../api/agreement';
import client from '../api/client';
import { API_BASE_URL } from '../api/constants';
import { useCurrency } from '../hooks/useCurrency';
import currencyService from '../services/currencyService';
import locationService from '../services/locationService';
import paymentGatewayService from '../services/paymentGatewayService';

const { width, height } = Dimensions.get('window');

// 🔧 Platform-specific WebView component
const PlatformWebView = ({ 
  source, 
  style, 
  onNavigationStateChange, 
  onLoad, 
  onError, 
  onShouldStartLoadWithRequest,
  ...props 
}) => {
  if (Platform.OS === 'web') {
    // For web platform, use a regular iframe
    return (
      <iframe
        src={source.uri}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          ...style
        }}
        onLoad={onLoad}
        onError={onError}
        title="Payment Gateway"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
        {...props}
      />
    );
  } else {
    // For mobile platforms, use react-native-webview
    return (
      <WebView
        source={source}
        style={style}
        onNavigationStateChange={onNavigationStateChange}
        onLoad={onLoad}
        onError={onError}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        {...props}
      />
    );
  }
};

const EnhancedPaymentModal = ({
  visible,
  onCancel,
  onPaymentSuccess,
  amount: initialAmount,
  currency: initialCurrency = 'USD',
  agreementId = null,
  title = 'Complete Payment',
  description = '',
  agreementData = null,
  paymentType = 'custom'
}) => {
  const { formatLocal, currency, symbol } = useCurrency();

  console.log('💳 [EnhancedPaymentModal] Initialized with paymentType:', paymentType);
  console.log('💳 [EnhancedPaymentModal] All props:', { 
    visible, 
    paymentType, 
    amount: initialAmount, 
    currency: initialCurrency, 
    agreementId 
  });

  // State management
  const [loading, setLoading] = useState(true);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);
  const [convertedAmount, setConvertedAmount] = useState(initialAmount);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // 🆕 In-app payment state
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Initialize payment when modal opens
  useEffect(() => {
    if (visible) {
      initializePayment();
    }
  }, [visible, initialAmount, initialCurrency]);

  // 🔧 NEW: Web-specific message listener for payment completion
  useEffect(() => {
    if (Platform.OS === 'web' && showPaymentWebView) {
      const handleMessage = (event) => {
        // Handle payment completion messages from iframe
        if (event.data && typeof event.data === 'object') {
          const { type, url, reference } = event.data;
          
          if (type === 'payment_success' && reference) {
            console.log('🌐 Web payment success received:', reference);
            handlePaymentSuccess(reference, url);
          } else if (type === 'payment_failed') {
            console.log('🌐 Web payment failure received');
            setShowPaymentWebView(false);
            setPaymentLoading(false);
            Alert.alert('Payment Failed', 'Payment was cancelled or failed. Please try again.');
          }
        }
      };

      window.addEventListener('message', handleMessage);
      
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [showPaymentWebView]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      
      // Get user location using location service
      const location = await locationService.getLocation();
      setUserLocation(location);
      
      // 🆕 SMART CURRENCY DEFAULTING (matching web version):
      let defaultCurrency = initialCurrency;
      
      // If no currency specified, use smart defaults
      if (!initialCurrency || initialCurrency === 'USD') {
        if (location?.countryCode === 'NG') {
          defaultCurrency = 'ngn'; // Nigerian users default to NGN
        } else {
          defaultCurrency = 'usd'; // Everyone else defaults to USD
        }
      }
      
      setSelectedCurrency(defaultCurrency.toLowerCase());
      
      // 🔧 FIXED: Don't convert amount if currencies match
      setConvertedAmount(initialAmount); // For mobile, we'll keep it simple
      
      // Get payment configuration using payment gateway service
      const config = paymentGatewayService.getPaymentConfig(
        initialAmount,
        defaultCurrency,
        location
      );
      
      setPaymentConfig(config);
      
      // Smart gateway selection
      const smartGateway = defaultCurrency === 'usd' ? 'stripe' : 'paystack';
      setSelectedGateway(smartGateway);
      
      // Set default payment method
      if (config.paymentMethods && config.paymentMethods.length > 0) {
        setSelectedPaymentMethod(config.paymentMethods[0]);
      }
      
      console.log('💳 [FIXED] Payment initialized:', {
        selectedCurrency: defaultCurrency,
        originalAmount: initialAmount,
        convertedAmount: initialAmount,
        smartGateway,
        location: location?.country
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize payment:', error);
      
      // Fallback configuration
      const fallbackLocation = {
        country: 'Nigeria',
        countryCode: 'NG',
        currency: 'NGN'
      };
      setUserLocation(fallbackLocation);
      
      setSelectedCurrency('ngn');
      setConvertedAmount(initialAmount);
      
      const fallbackConfig = {
        gateway: paymentGatewayService.getGateway('paystack'),
        amount: initialAmount,
        currency: 'ngn',
        paymentMethods: paymentGatewayService.getAvailablePaymentMethods('paystack', fallbackLocation),
        userLocation: fallbackLocation
      };
      setPaymentConfig(fallbackConfig);
      
      setSelectedGateway('paystack');
      if (fallbackConfig.paymentMethods && fallbackConfig.paymentMethods.length > 0) {
        setSelectedPaymentMethod(fallbackConfig.paymentMethods[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = async (newCurrency) => {
    try {
      setLoading(true);

      setSelectedCurrency(newCurrency);

      // Handle currency conversion (simplified for mobile)
      let newAmount = initialAmount;
      if (newCurrency.toLowerCase() === 'ngn' && initialCurrency === 'USD') {
        newAmount = initialAmount * 1500; // Approximate NGN rate
      } else if (newCurrency.toLowerCase() === 'usd' && initialCurrency === 'NGN') {
        newAmount = initialAmount / 1500; // Approximate USD rate
      }

      setConvertedAmount(newAmount);

      // Smart gateway recommendation
      const recommendedGateway = newCurrency === 'usd' ? 'stripe' : 'paystack';
      setSelectedGateway(recommendedGateway);

      // Update payment configuration (fallback for mobile)
      const config = {
        gateways: ['paystack', 'stripe'],
        currencies: ['ngn', 'usd'],
        paymentMethods: ['card'],
        gatewayConfig: { name: recommendedGateway === 'stripe' ? 'Stripe' : 'Paystack', currency: newCurrency }
      };
      setPaymentConfig(config);

      // Reset payment method selection
      if (config.paymentMethods && config.paymentMethods.length > 0) {
        setSelectedPaymentMethod(config.paymentMethods[0]);
      }

    } catch (error) {
      console.error('❌ Currency conversion failed:', error);
      Alert.alert('Error', 'Failed to convert currency');
    } finally {
      setLoading(false);
    }
  };

  const handleGatewayChange = (gatewayId) => {
    setSelectedGateway(gatewayId);

    // Update available payment methods (simplified for mobile)
    const methods = ['card']; // Default payment method
    if (methods && methods.length > 0) {
      setSelectedPaymentMethod(methods[0]);
    }
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);

      // Validate selections
      if (!selectedGateway || !selectedPaymentMethod) {
        Alert.alert('Error', 'Please select payment method');
        return;
      }

      // 🔧 CRITICAL: Final amount validation and rounding before payment (matching web version)
      let finalAmount = convertedAmount || initialAmount;
      
      // Round to 3 decimal places for more precision
      finalAmount = Math.round(finalAmount * 1000) / 1000;
      
      // Ensure minimum amount
      if (finalAmount < 0.002) {
        finalAmount = 0.002; // Set to minimum instead of erroring
        console.warn('💳 Amount was below minimum, setting to 0.002');
      }

      console.log('💳 [EnhancedPaymentModal] Final amount validation:', {
        original: initialAmount,
        converted: convertedAmount,
        final: finalAmount
      });

      const paymentData = {
        gateway: selectedGateway,
        method: selectedPaymentMethod?.id || selectedPaymentMethod,
        amount: finalAmount, // 🔧 Use validated and rounded amount
        currency: selectedCurrency,
        agreementId,
        userLocation,
        paymentType // 🆕 Pass payment type for proper processing
      };

      console.log('💳 [FIXED] Processing payment:', paymentData);
      console.log('💳 Agreement ID:', agreementId);
      console.log('💳 Agreement data:', agreementData);
      console.log('💳 Agreement status:', agreementData?.status);
      console.log('💳 Agreement installments:', agreementData?.installments);

      // 🔧 FIXED: Use direct enhanced payment API call (matching web version)
      console.log('💳 Using enhanced payment API for payment processing...');
      
      // Create enhanced payment session directly (like web version)
      const paymentResponse = await client.post('/payment/enhanced-checkout', {
        agreementId,
        paymentType,
        amount: finalAmount,
        currency: selectedCurrency,
        gateway: selectedGateway,
        paymentMethod: selectedPaymentMethod?.id || selectedPaymentMethod,
        location: userLocation
      });

      console.log('✅ [FIXED] Payment session created:', paymentResponse);
      console.log('💳 Payment response keys:', Object.keys(paymentResponse));
      console.log('💳 Payment URL available:', !!(paymentResponse.url || paymentResponse.sessionUrl || paymentResponse.authorizationUrl));

      // Handle payment response (matching web version)
      if (paymentResponse.sessionUrl || paymentResponse.authorizationUrl) {
        // 🔧 FIXED: Automatically redirect to payment gateway (matching web version behavior)
        console.log('🚀 Auto-redirecting to payment gateway...');
        handlePaymentRedirect(paymentResponse);
      } else if (paymentResponse.success) {
        // Payment completed successfully
        Alert.alert('Success', 'Payment processed successfully!');

        if (onPaymentSuccess) {
          onPaymentSuccess({
            ...paymentData,
            sessionId: paymentResponse.sessionId,
            transactionId: paymentResponse.transactionId,
            reference: paymentResponse.reference
          }, paymentType);
        }
      } else {
        throw new Error(paymentResponse.error || 'Payment session creation failed');
      }

    } catch (error) {
      console.error('❌ Payment processing failed:', error);
      
      // Enhanced error handling (matching web version)
      let errorMessage = 'Payment failed. Please try again.';
      if (error.message) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('authorization') || error.message.includes('auth')) {
          errorMessage = 'Authentication error. Please refresh and try again.';
        } else if (error.message.includes('amount') || error.message.includes('currency')) {
          errorMessage = 'Invalid payment amount or currency. Please try again.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Payment service is currently unavailable. Please contact support or try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Payment Failed', errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentRedirect = (paymentResponse) => {
    // 🆕 NEW: Use in-app WebView for Paystack payments
    const redirectUrl = paymentResponse.sessionUrl || paymentResponse.authorizationUrl || paymentResponse.url;

    if (redirectUrl) {
      console.log('🚀 Opening payment in-app WebView:', redirectUrl);
      
      if (Platform.OS === 'web') {
        // For web platform, show option to open in new tab or iframe
        Alert.alert(
          'Complete Payment',
          'Choose how to complete your payment:',
          [
            {
              text: 'Open in New Tab',
              onPress: () => {
                window.open(redirectUrl, '_blank');
                // Set a flag to check for payment completion
                setPaymentUrl(redirectUrl);
                setShowPaymentWebView(true);
                setPaymentLoading(true);
              }
            },
            {
              text: 'Open in Modal',
              onPress: () => {
                setPaymentUrl(redirectUrl);
                setShowPaymentWebView(true);
                setPaymentLoading(true);
              }
            },
            {
              text: 'Cancel',
              onPress: () => {
                setProcessing(false);
              }
            }
          ]
        );
      } else {
        // For mobile platforms, use WebView
        setPaymentUrl(redirectUrl);
        setShowPaymentWebView(true);
        setPaymentLoading(true);
      }
    } else {
      Alert.alert('Error', 'No payment URL received from gateway');
    }
  };

  // 🆕 NEW: Handle WebView navigation events (mobile only)
  const handleWebViewNavigationStateChange = async (navState) => {
    if (Platform.OS === 'web') {
      // Web platform doesn't support navigation state change for iframe
      return;
    }
    
    const { url } = navState;
    console.log('🌐 WebView navigation:', url);
    
    // 🔧 CRITICAL: Prevent external redirects to web version
    const blockedPatterns = [
      'thinqscribe.com',
      'payment-success',
      'payment/failed',
      'payment/cancelled',
      'payment/error',
      '/success',
      '/callback',
      '/verify'
    ];
    
    const shouldBlock = blockedPatterns.some(pattern => url.includes(pattern));
    
    if (shouldBlock) {
      console.log('🚫 Blocking external redirect to web version:', url);
      
      // Extract payment reference from the blocked URL
      const getReferenceFromUrl = (url) => {
        try {
          const urlParams = new URLSearchParams(url.split('?')[1]);
          return urlParams.get('reference') || 
                 urlParams.get('trxref') || 
                 urlParams.get('session_id') || 
                 urlParams.get('ref') || 
                 urlParams.get('transaction_id') ||
                 'unknown';
        } catch (error) {
          console.error('Error parsing URL:', error);
          return 'unknown';
        }
      };
      
      const reference = getReferenceFromUrl(url);
      console.log('🔍 Extracted reference from blocked URL:', reference);
      
      // 🔧 IMPROVED: Check if this is a success or failure URL
      const isSuccessUrl = url.includes('success') || url.includes('callback') || url.includes('verify');
      const isFailureUrl = url.includes('failed') || url.includes('cancel') || url.includes('error');
      
      if (isSuccessUrl && reference !== 'unknown') {
        // Handle as payment success since we're blocking the redirect
        await handlePaymentSuccess(reference, url);
        return false; // Prevent navigation
      } else if (isFailureUrl) {
        // Handle as payment failure
        console.log('❌ Payment failure detected from blocked URL:', url);
        setShowPaymentWebView(false);
        setPaymentLoading(false);
        
        Alert.alert(
          'Payment Failed', 
          'Payment was cancelled or failed. Please try again.',
          [{ text: 'OK' }]
        );
        return false; // Prevent navigation
      } else {
        // Unknown redirect, just block it
        console.log('🚫 Blocking unknown redirect pattern:', url);
        return false; // Prevent navigation
      }
    }
    
    // Extract reference from URL if available
    const getReferenceFromUrl = (url) => {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      return urlParams.get('reference') || urlParams.get('trxref') || urlParams.get('session_id') || 'unknown';
    };
    
    // Check for payment success URLs (Paystack patterns)
    if (url.includes('success') || 
        url.includes('callback') || 
        url.includes('verify') ||
        url.includes('payment-success') ||
        url.includes('transaction-success') ||
        (url.includes('paystack') && url.includes('success'))) {
      
      console.log('✅ Payment success detected:', url);
      
      // Extract payment reference and handle success
      const reference = getReferenceFromUrl(url);
      await handlePaymentSuccess(reference, url);
      return false; // Prevent navigation
      
    } else if (url.includes('cancel') || 
               url.includes('error') || 
               url.includes('failed') ||
               url.includes('payment-failed') ||
               (url.includes('paystack') && (url.includes('cancel') || url.includes('error')))) {
      
      console.log('❌ Payment failure detected:', url);
      
      // Payment cancelled or failed
      setShowPaymentWebView(false);
      setPaymentLoading(false);
      
      Alert.alert(
        'Payment Cancelled', 
        'Payment was cancelled or failed. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // 🆕 NEW: Handle WebView load events
  const handleWebViewLoad = () => {
    setPaymentLoading(false);
  };

  // 🆕 NEW: Handle WebView errors
  const handleWebViewError = (error) => {
    console.error('❌ WebView error:', error);
    setPaymentLoading(false);
    Alert.alert('Payment Error', 'Failed to load payment page. Please try again.');
  };

  // 🆕 NEW: Close payment WebView
  const closePaymentWebView = () => {
    setShowPaymentWebView(false);
    setPaymentUrl(null);
    setPaymentLoading(false);
  };

  // 🔧 NEW: Simple verification method that works with original client.js
  const verifyPaymentSimple = async (reference) => {
    try {
      console.log('🔍 [EnhancedPaymentModal] Simple verification for:', reference);
      
      // Use the client but handle the response more carefully
      const response = await client.post(`/payment/manual-verify/${reference}`);
      
      console.log('🔍 [EnhancedPaymentModal] Simple verification response:', response);
      
      // Since client.js interceptor processes the response, we work with what we get
      if (response) {
        // Check for success indicators
        if (response.success === true || 
            response.verified === true || 
            response.status === 'success' ||
            response.status === 'completed' ||
            (response.payment && response.payment.status === 'success') ||
            (response.transaction && response.transaction.status === 'success')) {
          
          console.log('✅ [EnhancedPaymentModal] Simple verification successful');
          return {
            success: true,
            data: response,
            method: 'simple'
          };
        }
      }
      
      return {
        success: false,
        error: 'Payment verification failed',
        method: 'simple'
      };
    } catch (error) {
      console.error('❌ [EnhancedPaymentModal] Simple verification error:', error);
      return {
        success: false,
        error: error.message || 'Payment verification failed',
        method: 'simple'
      };
    }
  };

  // 🆕 NEW: Verify payment with backend
  const verifyPayment = async (reference) => {
    try {
      console.log('🔍 [EnhancedPaymentModal] Verifying payment:', reference);
      
      // 🔧 FIXED: Try multiple verification endpoints
      let response;
      let verificationMethod = 'primary';
      
      try {
        // Primary: Try the enhanced payment verification endpoint
        response = await client.post(`/payment/enhanced-verify/${reference}`);
        console.log('✅ [EnhancedPaymentModal] Primary verification successful');
      } catch (primaryError) {
        console.log('⚠️ [EnhancedPaymentModal] Primary verification failed, trying fallback:', primaryError.message);
        
        // 🔧 NEW: Try direct fetch to bypass client interceptor issues
        try {
          const token = await AsyncStorage.getItem('thinqscribe_auth_token');
          const directResponse = await fetch(`${API_BASE_URL}/payment/manual-verify/${reference}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` })
            }
          });
          
          if (directResponse.ok) {
            const directData = await directResponse.json();
            console.log('✅ [EnhancedPaymentModal] Direct fetch verification successful');
            response = directData; // Use raw response data
            verificationMethod = 'direct_fetch';
          } else {
            throw new Error(`Direct fetch failed with status: ${directResponse.status}`);
          }
        } catch (directError) {
          console.log('⚠️ [EnhancedPaymentModal] Direct fetch failed, trying fallback1:', directError.message);
        }
        
        try {
          // Fallback 1: Try the manual verification endpoint
          response = await client.post(`/payment/manual-verify/${reference}`);
          verificationMethod = 'fallback1';
          console.log('✅ [EnhancedPaymentModal] Fallback1 verification successful');
        } catch (fallback1Error) {
          console.log('⚠️ [EnhancedPaymentModal] Fallback1 verification failed, trying fallback2:', fallback1Error.message);
          
          try {
            // Fallback 2: Try the agreement payment verification
            response = await client.post(`/agreements/${agreementId}/verify-payment`, {
              reference: reference
            });
            verificationMethod = 'fallback2';
            console.log('✅ [EnhancedPaymentModal] Fallback2 verification successful');
          } catch (fallback2Error) {
            console.log('⚠️ [EnhancedPaymentModal] Fallback2 failed, trying fallback3:', fallback2Error.message);
            
            try {
              // Fallback 3: Try to get agreement and check payment status
              const agreementResponse = await agreementApi.getAgreement(agreementId);
              if (agreementResponse && agreementResponse.payments) {
                const payment = agreementResponse.payments.find(p => 
                  p.reference === reference || 
                  p.transactionId === reference ||
                  p.sessionId === reference
                );
                
                if (payment && (payment.status === 'completed' || payment.status === 'success')) {
                  response = {
                    success: true,
                    data: {
                      payment: payment,
                      agreement: agreementResponse,
                      verified: true
                    }
                  };
                  verificationMethod = 'fallback3';
                  console.log('✅ [EnhancedPaymentModal] Fallback3 verification successful');
                } else {
                  throw new Error('Payment not found in agreement or not completed');
                }
              } else {
                throw new Error('No payments found in agreement');
              }
            } catch (fallback3Error) {
              console.log('⚠️ [EnhancedPaymentModal] All verification methods failed:', fallback3Error.message);
              throw fallback3Error;
            }
          }
        }
      }
      
      // 🔧 FIXED: Handle different response structures (working with original client.js)
      let success = false;
      let data = null;
      
      if (response) {
        // The client.js interceptor already extracts nested data, so we work with the processed response
        console.log('🔍 [EnhancedPaymentModal] Processing response after client interceptor:', response);
        
        // Handle direct success response (after client interceptor processing)
        if (response.success === true) {
          success = true;
          data = response.data || response;
        }
        // Handle response with success property
        else if (response.success !== false && (response.status === 'success' || response.verified === true)) {
          success = true;
          data = response;
        }
        // Handle response with payment data (common patterns)
        else if (response.payment || response.transaction || response.amount || response.reference) {
          success = true;
          data = response;
        }
        // Handle response that indicates successful verification
        else if (response.verified === true || response.status === 'completed' || response.status === 'success') {
          success = true;
          data = response;
        }
        // Handle response with gateway-specific success indicators
        else if (response.gateway_response && response.gateway_response.status === 'success') {
          success = true;
          data = response;
        }
      }
      
      if (success) {
        console.log('✅ [EnhancedPaymentModal] Payment verified successfully via', verificationMethod);
        return {
          success: true,
          data: data,
          method: verificationMethod
        };
      } else {
        console.log('⚠️ [EnhancedPaymentModal] Payment verification failed - no success response');
        return {
          success: false,
          error: 'Payment verification failed - no success response',
          method: verificationMethod
        };
      }
    } catch (error) {
      console.error('❌ [EnhancedPaymentModal] Payment verification error:', error);
      return {
        success: false,
        error: error.message || 'Payment verification failed',
        method: 'error'
      };
    }
  };

  // 🆕 NEW: Poll payment verification (fallback method)
  const pollPaymentVerification = async (reference, maxAttempts = 8) => {
    console.log('🔄 [EnhancedPaymentModal] Starting payment verification polling...');
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔍 Polling attempt ${attempt}/${maxAttempts} for payment:`, reference);
        
        // Try simple verification first, then complex verification
        let result = await verifyPaymentSimple(reference);
        
        if (!result.success) {
          result = await verifyPayment(reference);
        }
        
        if (result.success) {
          console.log('✅ Payment verified via polling on attempt', attempt);
          return result;
        }
        
        // Progressive delay: 2s, 3s, 4s, 5s, 6s, 7s, 8s, 10s
        const delay = Math.min(2000 + (attempt * 1000), 10000);
        if (attempt < maxAttempts) {
          console.log(`⏳ Waiting ${delay}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.log(`⚠️ Poll attempt ${attempt} failed:`, error.message);
        
        // Progressive delay for errors too
        const delay = Math.min(2000 + (attempt * 1000), 10000);
        if (attempt < maxAttempts) {
          console.log(`⏳ Waiting ${delay}ms before retry after error...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.log('⏰ Payment verification polling timeout reached after', maxAttempts, 'attempts');
    return {
      success: false,
      error: 'Payment verification timeout - please contact support with your payment reference'
    };
  };

  // 🆕 NEW: Handle payment success (extracted for reuse)
  const handlePaymentSuccess = async (reference, successUrl) => {
    console.log('✅ Payment success detected:', successUrl);
    
    // Show loading while verifying
    setPaymentLoading(true);
    
    try {
      // 🔧 CRITICAL: Verify payment with backend before proceeding
      console.log('🔍 Verifying payment with backend...');
      
      // Try simple verification first (works better with original client.js)
      let verificationResult = await verifyPaymentSimple(reference);
      
      // If simple verification fails, try the complex verification
      if (!verificationResult.success) {
        console.log('⚠️ Simple verification failed, trying complex verification...');
        verificationResult = await verifyPayment(reference);
      }
      
      if (verificationResult.success) {
        console.log('✅ Payment verified successfully by backend');
        
        // Payment completed and verified, close WebView and handle success
        setShowPaymentWebView(false);
        setPaymentLoading(false);
        
        // Call success callback with verified payment data
        if (onPaymentSuccess) {
          onPaymentSuccess({
            gateway: selectedGateway,
            method: selectedPaymentMethod,
            amount: convertedAmount,
            currency: selectedCurrency,
            agreementId,
            userLocation,
            paymentType,
            reference: reference,
            successUrl: successUrl,
            verified: true,
            verificationData: verificationResult.data
          }, paymentType);
        }
        
        // 🔧 FALLBACK: Set dashboard refresh flag directly as backup
        try {
          await AsyncStorage.setItem('forceRefreshDashboard', JSON.stringify({
            timestamp: Date.now(),
            reason: 'payment_success_verified',
            agreementId: agreementId,
            paymentData: {
              amount: convertedAmount,
              currency: selectedCurrency,
              gateway: selectedGateway,
              reference: reference,
              verified: true
            }
          }));
          console.log('💳 [EnhancedPaymentModal] Dashboard refresh flag set as fallback');
        } catch (error) {
          console.error('💳 [EnhancedPaymentModal] Failed to set dashboard refresh flag:', error);
        }
        
        // Show success message
        Alert.alert(
          'Payment Successful!', 
          'Your payment has been processed and verified successfully.',
          [{ text: 'OK' }]
        );
      } else {
        console.log('❌ Payment verification failed, trying polling method...');
        
        // Try polling verification as fallback
        const pollingResult = await pollPaymentVerification(reference);
        
        if (pollingResult.success) {
          console.log('✅ Payment verified via polling');
          
          // Payment completed and verified via polling, close WebView and handle success
          setShowPaymentWebView(false);
          setPaymentLoading(false);
          
          // Call success callback with verified payment data
          if (onPaymentSuccess) {
            onPaymentSuccess({
              gateway: selectedGateway,
              method: selectedPaymentMethod,
              amount: convertedAmount,
              currency: selectedCurrency,
              agreementId,
              userLocation,
              paymentType,
              reference: reference,
              successUrl: successUrl,
              verified: true,
              verificationData: pollingResult.data,
              verifiedViaPolling: true
            }, paymentType);
          }
          
          // 🔧 FALLBACK: Set dashboard refresh flag directly as backup
          try {
            await AsyncStorage.setItem('forceRefreshDashboard', JSON.stringify({
              timestamp: Date.now(),
              reason: 'payment_success_polling',
              agreementId: agreementId,
              paymentData: {
                amount: convertedAmount,
                currency: selectedCurrency,
                gateway: selectedGateway,
                reference: reference,
                verified: true,
                verifiedViaPolling: true
              }
            }));
            console.log('💳 [EnhancedPaymentModal] Dashboard refresh flag set via polling');
          } catch (error) {
            console.error('💳 [EnhancedPaymentModal] Failed to set dashboard refresh flag:', error);
          }
          
          // Show success message
          Alert.alert(
            'Payment Successful!', 
            'Your payment has been processed and verified successfully.',
            [{ text: 'OK' }]
          );
        } else {
          console.log('❌ Payment verification failed even with polling:', pollingResult.error);
          
          // 🔧 FINAL FALLBACK: Try one more time with extended timeout
          console.log('🔄 Trying final fallback verification with extended timeout...');
          const finalResult = await pollPaymentVerification(reference, 12); // 12 attempts with longer delays
          
          if (finalResult.success) {
            console.log('✅ Payment verified via final fallback');
            
            // Payment completed and verified via final fallback, close WebView and handle success
            setShowPaymentWebView(false);
            setPaymentLoading(false);
            
            // Call success callback with verified payment data
            if (onPaymentSuccess) {
              onPaymentSuccess({
                gateway: selectedGateway,
                method: selectedPaymentMethod,
                amount: convertedAmount,
                currency: selectedCurrency,
                agreementId,
                userLocation,
                paymentType,
                reference: reference,
                successUrl: successUrl,
                verified: true,
                verificationData: finalResult.data,
                verifiedViaFinalFallback: true
              }, paymentType);
            }
            
            // Show success message
            Alert.alert(
              'Payment Successful!', 
              'Your payment has been processed and verified successfully.',
              [{ text: 'OK' }]
            );
          } else {
            // 🔧 FINAL FALLBACK: If all verification fails, assume payment is successful after timeout
            console.log('⚠️ All verification methods failed, using timeout-based fallback...');
            
            // Show a dialog asking user to confirm if payment was completed
            Alert.alert(
              'Payment Verification', 
              `We're having trouble verifying your payment automatically.\n\nReference: ${reference}\n\nDid you complete the payment successfully?`,
              [
                { text: 'No, Payment Failed', onPress: () => {
                  setShowPaymentWebView(false);
                  setPaymentLoading(false);
                  Alert.alert('Payment Failed', 'Please try again or contact support.');
                }},
                { text: 'Yes, Payment Completed', onPress: async () => {
                  // Assume payment is successful and proceed
                  console.log('✅ User confirmed payment completion, proceeding with success flow');
                  
                  setShowPaymentWebView(false);
                  setPaymentLoading(false);
                  
                  // Call success callback with user-confirmed payment data
                  if (onPaymentSuccess) {
                    onPaymentSuccess({
                      gateway: selectedGateway,
                      method: selectedPaymentMethod,
                      amount: convertedAmount,
                      currency: selectedCurrency,
                      agreementId,
                      userLocation,
                      paymentType,
                      reference: reference,
                      successUrl: successUrl,
                      verified: false, // Not verified by backend
                      userConfirmed: true, // Confirmed by user
                      verificationData: { userConfirmed: true, reference: reference }
                    }, paymentType);
                  }
                  
                  // 🔧 FALLBACK: Set dashboard refresh flag directly as backup
                  try {
                    await AsyncStorage.setItem('forceRefreshDashboard', JSON.stringify({
                      timestamp: Date.now(),
                      reason: 'payment_success_user_confirmed',
                      agreementId: agreementId,
                      paymentData: {
                        amount: convertedAmount,
                        currency: selectedCurrency,
                        gateway: selectedGateway,
                        reference: reference,
                        verified: false,
                        userConfirmed: true
                      }
                    }));
                    console.log('💳 [EnhancedPaymentModal] Dashboard refresh flag set for user-confirmed payment');
                  } catch (error) {
                    console.error('💳 [EnhancedPaymentModal] Failed to set dashboard refresh flag:', error);
                  }
                  
                  // Show success message
                  Alert.alert(
                    'Payment Successful!', 
                    'Your payment has been recorded. Please check your dashboard for updates.',
                    [{ text: 'OK' }]
                  );
                }},
                { text: 'Retry Verification', onPress: () => {
                  // Retry verification
                  handlePaymentSuccess(reference, successUrl);
                }}
              ]
            );
          }
        }
      }
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      setPaymentLoading(false);
      
      Alert.alert(
        'Verification Error', 
        'Failed to verify payment. Please contact support.',
        [{ text: 'OK', onPress: () => {
          setShowPaymentWebView(false);
          setPaymentLoading(false);
        }}]
      );
    }
  };

  const calculateFees = (amount, gateway = 'paystack', paymentMethod = 'card') => {
    // Use payment gateway service for fee calculation
    return paymentGatewayService.calculateFees(
      amount,
      selectedCurrency,
      gateway,
      paymentMethod
    );
  };

  const getPaymentMethodIcon = (methodId) => {
    const icons = {
      card: 'credit-card',
      bank_transfer: 'bank',
      mobile_money: 'cellphone',
      ussd: 'dialpad',
      qr: 'qrcode',
      digital_wallets: 'wallet'
    };
    return icons[methodId] || 'credit-card';
  };

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Setting up payment options...</Text>
        </View>
      </Modal>
    );
  }

  const feeCalculation = selectedGateway && selectedPaymentMethod
    ? calculateFees(convertedAmount, selectedGateway, selectedPaymentMethod.id)
    : { fee: 0, total: convertedAmount, rate: '0' };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#3b82f6', '#1e3a8a']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Icon name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Description */}
          {description && (
            <Card style={styles.descriptionCard}>
              <Card.Content>
                <Text style={styles.descriptionText}>{description}</Text>
              </Card.Content>
            </Card>
          )}

          {/* Location and Gateway Info */}
          {userLocation && (
            <Card style={styles.infoCard}>
              <Card.Content>
                <View style={styles.infoRow}>
                  <Icon name="map-marker" size={16} color="#1890ff" />
                  <Text style={styles.infoText}>
                    Location: {userLocation.displayName || userLocation.country}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Recommended Gateway:</Text>
                  <Chip
                    mode="flat"
                    style={[styles.gatewayChip, {
                      backgroundColor: selectedGateway?.id === 'paystack' ? '#e6f7ff' : '#f0fdf4'
                    }]}
                    textStyle={{ fontSize: 12, fontWeight: '600' }}
                  >
                    {selectedGateway?.name || 'Paystack'}
                  </Chip>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Payment Configuration */}
          <Card style={styles.paymentCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Payment Details</Text>

              {/* Currency Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Currency:</Text>
                <View style={styles.currencyButtons}>
                  <TouchableOpacity
                    style={[styles.currencyButton, selectedCurrency === 'usd' && styles.currencyButtonActive]}
                    onPress={() => handleCurrencyChange('usd')}
                  >
                    <Text style={[styles.currencyText, selectedCurrency === 'usd' && styles.currencyTextActive]}>
                      USD ($)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.currencyButton, selectedCurrency === 'ngn' && styles.currencyButtonActive]}
                    onPress={() => handleCurrencyChange('ngn')}
                  >
                    <Text style={[styles.currencyText, selectedCurrency === 'ngn' && styles.currencyTextActive]}>
                      NGN (₦)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Amount Display */}
              <View style={styles.amountDisplay}>
                <Text style={styles.amountLabel}>Amount:</Text>
                <Text style={styles.amountValue}>
                  {currencyService.format(convertedAmount, selectedCurrency.toUpperCase())}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Payment Methods */}
          <Card style={styles.methodsCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Payment Methods</Text>

              {paymentConfig?.paymentMethods?.map(method => (
                <TouchableOpacity
                  key={method.id}
                  style={[styles.methodItem, selectedPaymentMethod?.id === method.id && styles.methodItemSelected]}
                  onPress={() => setSelectedPaymentMethod(method)}
                >
                  <View style={styles.methodLeft}>
                    <Icon name={getPaymentMethodIcon(method.id)} size={20} color="#3b82f6" />
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodName}>{method.name}</Text>
                      <Text style={styles.methodDescription}>{method.description}</Text>
                    </View>
                  </View>
                  <View style={styles.methodRight}>
                    <Text style={styles.methodFee}>{method.fees}</Text>
                    <Text style={styles.methodTime}>{method.processingTime}</Text>
                  </View>
                </TouchableOpacity>
              )) || (
                <Text style={styles.noMethodsText}>No payment methods available</Text>
              )}
            </Card.Content>
          </Card>

          {/* Payment Summary */}
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Payment Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>
                  {currencyService.format(convertedAmount, selectedCurrency.toUpperCase())}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Processing Fee ({feeCalculation.rate}%):</Text>
                <Text style={styles.summaryValue}>
                  {currencyService.format(feeCalculation.fee, selectedCurrency.toUpperCase())}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { fontWeight: '700' }]}>Total:</Text>
                <Text style={[styles.summaryValue, { fontWeight: '700', color: '#1e3a8a' }]}>
                  {currencyService.format(feeCalculation.total, selectedCurrency.toUpperCase())}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={onCancel}
            disabled={processing}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.payButton, processing && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={processing || !selectedPaymentMethod}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Icon name="credit-card" size={18} color="#ffffff" />
                <Text style={styles.payButtonText}>
                  Pay {currencyService.format(feeCalculation.total, selectedCurrency.toUpperCase())}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 🆕 NEW: In-app Payment WebView Modal */}
      {showPaymentWebView && (
        <Modal
          visible={showPaymentWebView}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={closePaymentWebView}
        >
          <View style={styles.webViewContainer}>
            {/* WebView Header */}
            <LinearGradient
              colors={['#3b82f6', '#1e3a8a']}
              style={styles.webViewHeader}
            >
              <View style={styles.webViewHeaderContent}>
                <TouchableOpacity onPress={closePaymentWebView} style={styles.webViewCloseButton}>
                  <Icon name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.webViewHeaderTitle}>Complete Payment</Text>
                <View style={{ width: 40 }} />
              </View>
            </LinearGradient>

            {/* Loading indicator */}
            {paymentLoading && (
              <View style={styles.webViewLoadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.webViewLoadingText}>
                  {paymentUrl ? 'Verifying payment...' : 'Loading payment page...'}
                </Text>
              </View>
            )}

            {/* Payment WebView */}
            {paymentUrl && (
              <PlatformWebView
                source={{ uri: paymentUrl }}
                style={styles.webView}
                onNavigationStateChange={handleWebViewNavigationStateChange}
                onLoad={handleWebViewLoad}
                onError={handleWebViewError}
                onShouldStartLoadWithRequest={Platform.OS === 'web' ? undefined : (request) => {
                  console.log('🔍 WebView should start load with request:', request.url);
                  
                  // 🔧 CRITICAL: Block external redirects to web version
                  const blockedPatterns = [
                    'thinqscribe.com',
                    'payment-success',
                    'payment/failed',
                    'payment/cancelled',
                    'payment/error',
                    '/success',
                    '/callback',
                    '/verify'
                  ];
                  
                  const shouldBlock = blockedPatterns.some(pattern => request.url.includes(pattern));
                  
                  if (shouldBlock) {
                    console.log('🚫 Blocking external redirect:', request.url);
                    
                    // Extract reference and handle payment success/failure
                    const getReferenceFromUrl = (url) => {
                      try {
                        const urlParams = new URLSearchParams(url.split('?')[1]);
                        return urlParams.get('reference') || 
                               urlParams.get('trxref') || 
                               urlParams.get('session_id') || 
                               urlParams.get('ref') || 
                               urlParams.get('transaction_id') ||
                               'unknown';
                      } catch (error) {
                        console.error('Error parsing URL:', error);
                        return 'unknown';
                      }
                    };
                    
                    const reference = getReferenceFromUrl(request.url);
                    console.log('🔍 Extracted reference from blocked URL:', reference);
                    
                    // 🔧 IMPROVED: Check if this is a success or failure URL
                    const isSuccessUrl = request.url.includes('success') || request.url.includes('callback') || request.url.includes('verify');
                    const isFailureUrl = request.url.includes('failed') || request.url.includes('cancel') || request.url.includes('error');
                    
                    if (isSuccessUrl && reference !== 'unknown') {
                      // Handle payment success asynchronously
                      setTimeout(() => {
                        handlePaymentSuccess(reference, request.url);
                      }, 100);
                    } else if (isFailureUrl) {
                      // Handle payment failure
                      setTimeout(() => {
                        setShowPaymentWebView(false);
                        setPaymentLoading(false);
                        Alert.alert(
                          'Payment Failed', 
                          'Payment was cancelled or failed. Please try again.',
                          [{ text: 'OK' }]
                        );
                      }, 100);
                    }
                    
                    return false; // Block the navigation
                  }
                  
                  return true; // Allow other navigation
                }}
                startInLoadingState={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                mixedContentMode="compatibility"
                thirdPartyCookiesEnabled={true}
                sharedCookiesEnabled={true}
                allowsBackForwardNavigationGestures={true}
                bounces={false}
                scrollEnabled={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={true}
                userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
                renderLoading={() => (
                  <View style={styles.webViewLoadingContainer}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.webViewLoadingText}>Loading payment page...</Text>
                  </View>
                )}
              />
            )}

            {/* Fallback: Open in External Browser Button */}
            <View style={styles.webViewFooter}>
              <TouchableOpacity
                style={styles.externalBrowserButton}
                onPress={() => {
                  if (paymentUrl) {
                    if (Platform.OS === 'web') {
                      window.open(paymentUrl, '_blank');
                    } else {
                      WebBrowser.openBrowserAsync(paymentUrl, {
                        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
                        controlsColor: '#3b82f6'
                      });
                    }
                  }
                }}
              >
                <Icon name="open-in-new" size={16} color="#3b82f6" />
                <Text style={styles.externalBrowserButtonText}>Open in Browser</Text>
              </TouchableOpacity>
              
              {/* Web-specific manual verification button */}
              {Platform.OS === 'web' && (
                <TouchableOpacity
                  style={[styles.externalBrowserButton, { marginTop: 8, backgroundColor: '#10b981' }]}
                  onPress={() => {
                    Alert.alert(
                      'Payment Completed?',
                      'If you have completed the payment, please enter the payment reference to verify:',
                      [
                        {
                          text: 'Cancel',
                          style: 'cancel'
                        },
                        {
                          text: 'Verify Payment',
                          onPress: () => {
                            // For web, we'll use a simple prompt for reference
                            const reference = prompt('Enter payment reference (if any):');
                            if (reference && reference.trim()) {
                              handlePaymentSuccess(reference.trim(), paymentUrl);
                            } else {
                              Alert.alert('No Reference', 'Please contact support if you completed payment but don\'t have a reference.');
                            }
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Icon name="check-circle" size={16} color="#ffffff" />
                  <Text style={[styles.externalBrowserButtonText, { color: '#ffffff' }]}>I Completed Payment</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280'
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center'
  },
  content: {
    flex: 1,
    paddingHorizontal: 16
  },
  descriptionCard: {
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  descriptionText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8
  },
  infoLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600'
  },
  infoText: {
    fontSize: 13,
    color: '#374151'
  },
  gatewayChip: {
    height: 28,
    backgroundColor: '#e6f7ff'
  },
  paymentCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16
  },
  inputGroup: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  currencyButtons: {
    flexDirection: 'row',
    gap: 12
  },
  currencyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center'
  },
  currencyButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff'
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151'
  },
  currencyTextActive: {
    color: '#1e40af'
  },
  amountDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginTop: 8
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151'
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e3a8a'
  },
  methodsCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff'
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
    backgroundColor: '#ffffff'
  },
  methodItemSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff'
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12
  },
  methodInfo: {
    flex: 1
  },
  methodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937'
  },
  methodDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2
  },
  methodRight: {
    alignItems: 'flex-end'
  },
  methodFee: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500'
  },
  methodTime: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
    marginTop: 2
  },
  noMethodsText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
    padding: 20
  },
  summaryCard: {
    marginBottom: 20,
    backgroundColor: '#ffffff'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  summaryLabel: {
    fontSize: 14,
    color: '#374151'
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937'
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db'
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280'
  },
  payButton: {
    backgroundColor: '#1e3a8a'
  },
  payButtonDisabled: {
    opacity: 0.6
  },
  payButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff'
  },
  // 🆕 NEW: WebView styles
  webViewContainer: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  webViewHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16
  },
  webViewHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  webViewCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  webViewHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center'
  },
  webViewLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  webViewLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500'
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  webViewFooter: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  externalBrowserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    gap: 8
  },
  externalBrowserButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6'
  }
});

export default EnhancedPaymentModal;
