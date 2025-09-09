// EnhancedPaymentModal.js - React Native Version
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { agreementApi } from '../api/agreement';
import { useCurrency } from '../hooks/useCurrency';
import currencyService from '../services/currencyService';
import locationService from '../services/locationService';
import paymentGatewayService from '../services/paymentGatewayService';

const { width, height } = Dimensions.get('window');

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

  // Initialize payment when modal opens
  useEffect(() => {
    if (visible) {
      initializePayment();
    }
  }, [visible, initialAmount, initialCurrency]);

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
        method: selectedPaymentMethod,
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

      // 🔧 FIXED: Use enhanced payment API with proper data structure
      console.log('💳 Using enhanced payment API for payment processing...');
      const paymentResponse = await agreementApi.processPayment(agreementId, paymentData);

      console.log('✅ [FIXED] Payment session created:', paymentResponse);
      console.log('💳 Payment response keys:', Object.keys(paymentResponse));
      console.log('💳 Payment URL available:', !!(paymentResponse.url || paymentResponse.sessionUrl || paymentResponse.authorizationUrl));

      // Handle payment response
      if (paymentResponse.success && (paymentResponse.url || paymentResponse.sessionUrl || paymentResponse.authorizationUrl)) {
        // 🔧 FIXED: Automatically redirect to payment gateway (matching web version behavior)
        console.log('🚀 Auto-redirecting to payment gateway...');
        handlePaymentRedirect(paymentResponse);
      } else if (paymentResponse.success && !paymentResponse.url) {
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
    // For React Native, we need to handle payment redirection
    const redirectUrl = paymentResponse.url || paymentResponse.sessionUrl || paymentResponse.authorizationUrl;

    if (redirectUrl) {
      console.log('🚀 Redirecting to payment gateway:', redirectUrl);
      
      // For React Native Web (Expo), we can use window.location.href
      if (typeof window !== 'undefined' && window.location) {
        console.log('🌐 Opening payment URL in browser:', redirectUrl);
        window.location.href = redirectUrl;
      } else {
        // For native React Native, show alert with URL
        Alert.alert(
          'Complete Payment',
          `Please complete your payment at: ${redirectUrl}`,
          [
            {
              text: 'Copy URL',
              onPress: () => {
                // Copy URL to clipboard if available
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(redirectUrl);
                  Alert.alert('Success', 'Payment URL copied to clipboard');
                } else {
                  console.log('Payment URL:', redirectUrl);
                }
              }
            },
            { text: 'OK' }
          ]
        );
      }
    } else {
      Alert.alert('Error', 'No payment URL received from gateway');
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
  }
});

export default EnhancedPaymentModal;
