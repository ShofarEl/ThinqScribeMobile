import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { paymentApi } from '../api/payment';
import { useAuth } from '../context/MobileAuthContext';

const { width } = Dimensions.get('window');

const PaymentSuccess = () => {
  const { reference, status, agreement, agreementId, error: errorParam } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    console.log('📱 [PaymentSuccess] Loaded with params:', {
      reference,
      status,
      agreement: agreement || agreementId,
      error: errorParam,
    });

    // Simulate loading delay
    const timer = setTimeout(() => {
      handlePaymentVerification();
    }, 1500);

    return () => clearTimeout(timer);
  }, [reference, status, agreement, agreementId, errorParam]);

  const handlePaymentVerification = async () => {
    try {
      setLoading(true);

      // Check for error first
      if (errorParam) {
        setError(`Payment error: ${decodeURIComponent(errorParam)}`);
        setLoading(false);
        return;
      }

      // Check if we have a reference for successful payment
      if (reference && (status === 'success' || !status)) {
        // Determine payment gateway
        const isStripePayment = reference.startsWith('cs_');
        const isPaystackPayment = !reference.startsWith('cs_');

        setPaymentData({
          reference,
          status: 'success',
          agreementId: agreement || agreementId,
          message: isStripePayment 
            ? 'Stripe payment completed successfully!' 
            : 'Payment completed successfully!',
          gateway: isStripePayment ? 'stripe' : 'paystack',
          amount: null, // Will be filled if we can verify
        });

        // Try to verify payment details
        await verifyPaymentDetails(reference);
      } else {
        // No reference or failed status
        setError(
          status 
            ? `Payment ${status}. Please try again or contact support.`
            : 'Unable to verify payment status. Please check your dashboard or contact support.'
        );
      }
    } catch (err) {
      console.error('📱 [PaymentSuccess] Verification error:', err);
      setError('Failed to verify payment. Please contact support if you believe this is an error.');
    } finally {
      setLoading(false);
    }
  };

  const verifyPaymentDetails = async (paymentReference) => {
    try {
      setVerifying(true);
      console.log('📱 [PaymentSuccess] Verifying payment:', paymentReference);
      
      const response = await paymentApi.verifyPayment(paymentReference);
      console.log('📱 [PaymentSuccess] Verification response:', response);
      
      if (response.success) {
        setPaymentData(prev => ({
          ...prev,
          amount: response.amount || response.data?.amount,
          verified: true,
          verificationMessage: 'Payment verified successfully'
        }));
        
        // Trigger dashboard refresh
        triggerDashboardRefresh();
      }
    } catch (err) {
      console.log('📱 [PaymentSuccess] Verification failed:', err.message);
      // Don't show error, just continue without verification
    } finally {
      setVerifying(false);
    }
  };

  const triggerDashboardRefresh = async () => {
    // In a real app, you would use context or state management to refresh dashboard
    console.log('📱 [PaymentSuccess] Triggering dashboard refresh...');
    
    try {
      // Use AsyncStorage to set a flag for dashboard refresh
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('forceRefreshDashboard', JSON.stringify({
        timestamp: Date.now(),
        reason: 'payment_success',
        agreementId: agreement || agreementId
      }));
      console.log('📱 [PaymentSuccess] Dashboard refresh flag set');
    } catch (error) {
      console.error('📱 [PaymentSuccess] Failed to set refresh flag:', error);
    }
  };

  const handleViewAgreement = () => {
    const targetAgreementId = agreement || agreementId;
    
    if (targetAgreementId) {
      router.push(`/agreement/${targetAgreementId}`);
    } else {
      router.push('/dashboard');
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleViewPaymentHistory = () => {
    router.push('/payment-history');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderSuccess = () => (
    <View style={styles.resultContainer}>
      <LinearGradient
        colors={['#22c55e', '#16a34a']}
        style={styles.successIcon}
      >
        <Text style={styles.successIconText}>✓</Text>
      </LinearGradient>
      
      <Text style={styles.resultTitle}>Payment Successful!</Text>
      
      <Text style={styles.resultSubtitle}>
        {paymentData.message}
      </Text>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment Reference:</Text>
          <Chip style={styles.referenceChip} textStyle={styles.referenceText}>
            {paymentData.reference}
          </Chip>
        </View>
        
        {paymentData.gateway && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Gateway:</Text>
            <Chip 
              style={[
                styles.gatewayChip, 
                { backgroundColor: paymentData.gateway === 'stripe' ? '#6366f1' : '#22c55e' }
              ]}
              textStyle={styles.gatewayText}
            >
              {paymentData.gateway === 'stripe' ? '💳 Stripe' : '🏦 Paystack'}
            </Chip>
          </View>
        )}
        
        {paymentData.amount && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Paid:</Text>
            <Text style={styles.amountText}>
              {formatCurrency(paymentData.amount)}
            </Text>
          </View>
        )}
        
        {verifying && (
          <View style={styles.verifyingContainer}>
            <ActivityIndicator size="small" color="#015382" />
            <Text style={styles.verifyingText}>Verifying payment...</Text>
          </View>
        )}
        
        {paymentData.verified && (
          <View style={styles.verifiedContainer}>
            <Text style={styles.verifiedIcon}>✓</Text>
            <Text style={styles.verifiedText}>Payment verified</Text>
          </View>
        )}
      </View>
      
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={handleViewAgreement}
          style={styles.primaryButton}
          labelStyle={styles.primaryButtonText}
        >
          {agreement || agreementId ? 'View Agreement' : 'Go to Dashboard'}
        </Button>
        
        <Button
          mode="outlined"
          onPress={handleViewPaymentHistory}
          style={styles.secondaryButton}
          labelStyle={styles.secondaryButtonText}
        >
          View Payment History
        </Button>
        
        <Button
          mode="text"
          onPress={handleBackToDashboard}
          style={styles.textButton}
          labelStyle={styles.textButtonText}
        >
          Back to Dashboard
        </Button>
      </View>
    </View>
  );

  const renderError = () => (
    <View style={styles.resultContainer}>
      <LinearGradient
        colors={['#ef4444', '#dc2626']}
        style={styles.errorIcon}
      >
        <Text style={styles.errorIconText}>✕</Text>
      </LinearGradient>
      
      <Text style={styles.resultTitle}>Payment Failed</Text>
      
      <Text style={styles.resultSubtitle}>
        {error || 'We could not process your payment. Please try again.'}
      </Text>
      
      {reference && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference:</Text>
            <Chip style={styles.errorReferenceChip} textStyle={styles.errorReferenceText}>
              {reference}
            </Chip>
          </View>
        </View>
      )}
      
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={handleBackToDashboard}
          style={styles.primaryButton}
          labelStyle={styles.primaryButtonText}
        >
          Back to Dashboard
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => router.push('/support')}
          style={styles.secondaryButton}
          labelStyle={styles.secondaryButtonText}
        >
          Contact Support
        </Button>
        
        <Button
          mode="text"
          onPress={() => router.back()}
          style={styles.textButton}
          labelStyle={styles.textButtonText}
        >
          Try Again
        </Button>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#015382" />
          <Text style={styles.loadingText}>Processing payment result...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.resultCard}>
          {paymentData && !error ? renderSuccess() : renderError()}
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  resultCard: {
    borderRadius: 20,
    elevation: 4,
    padding: 30,
  },
  resultContainer: {
    alignItems: 'center',
  },
  
  // Success Styles
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 40,
    color: 'white',
    fontWeight: '700',
  },
  
  // Error Styles
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIconText: {
    fontSize: 40,
    color: 'white',
    fontWeight: '700',
  },
  
  // Text Styles
  resultTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  
  // Details Styles
  detailsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  referenceChip: {
    backgroundColor: '#dbeafe',
  },
  referenceText: {
    color: '#1e40af',
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  gatewayChip: {
    paddingHorizontal: 8,
  },
  gatewayText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  errorReferenceChip: {
    backgroundColor: '#fee2e2',
  },
  errorReferenceText: {
    color: '#dc2626',
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  
  // Verification Styles
  verifyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  verifyingText: {
    fontSize: 14,
    color: '#015382',
    marginLeft: 8,
    fontWeight: '500',
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  verifiedIcon: {
    fontSize: 16,
    color: '#22c55e',
    marginRight: 8,
  },
  verifiedText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
  
  // Actions Styles
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#015382',
    borderRadius: 12,
    paddingVertical: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButton: {
    borderColor: '#015382',
    borderRadius: 12,
    paddingVertical: 4,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#015382',
  },
  textButton: {
    paddingVertical: 4,
  },
  textButtonText: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default PaymentSuccess;
