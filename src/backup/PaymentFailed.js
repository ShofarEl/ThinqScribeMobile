import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/MobileAuthContext';

const PaymentFailed = () => {
  const { reference, error: errorParam, reason, agreement, agreementId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState(null);

  useEffect(() => {
    console.log('📱 [PaymentFailed] Loaded with params:', {
      reference,
      error: errorParam,
      reason,
      agreement: agreement || agreementId,
    });

    // Simulate loading delay
    const timer = setTimeout(() => {
      processFailureDetails();
    }, 1000);

    return () => clearTimeout(timer);
  }, [reference, errorParam, reason, agreement, agreementId]);

  const processFailureDetails = () => {
    setLoading(false);
    
    let errorMessage = 'Payment could not be processed. Please try again.';
    let errorType = 'general';
    
    // Decode and process error details
    if (errorParam) {
      errorMessage = decodeURIComponent(errorParam);
    } else if (reason) {
      errorMessage = decodeURIComponent(reason);
    }
    
    // Determine error type for better UX
    const errorLower = errorMessage.toLowerCase();
    if (errorLower.includes('insufficient') || errorLower.includes('balance')) {
      errorType = 'insufficient_funds';
      errorMessage = 'Insufficient funds. Please check your account balance and try again.';
    } else if (errorLower.includes('card') || errorLower.includes('declined')) {
      errorType = 'card_declined';
      errorMessage = 'Your card was declined. Please check your card details or try a different payment method.';
    } else if (errorLower.includes('expired')) {
      errorType = 'card_expired';
      errorMessage = 'Your card has expired. Please use a valid card.';
    } else if (errorLower.includes('network') || errorLower.includes('connection')) {
      errorType = 'network_error';
      errorMessage = 'Network error occurred. Please check your internet connection and try again.';
    } else if (errorLower.includes('timeout')) {
      errorType = 'timeout';
      errorMessage = 'Payment request timed out. Please try again.';
    } else if (errorLower.includes('cancelled') || errorLower.includes('canceled')) {
      errorType = 'cancelled';
      errorMessage = 'Payment was cancelled. You can try again when ready.';
    }
    
    setErrorDetails({
      message: errorMessage,
      type: errorType,
      reference: reference || null,
      originalError: errorParam || reason || null
    });
  };

  const getErrorIcon = (errorType) => {
    switch (errorType) {
      case 'insufficient_funds':
        return '💳';
      case 'card_declined':
      case 'card_expired':
        return '🚫';
      case 'network_error':
        return '📶';
      case 'timeout':
        return '⏱️';
      case 'cancelled':
        return '🔄';
      default:
        return '❌';
    }
  };

  const getErrorAdvice = (errorType) => {
    switch (errorType) {
      case 'insufficient_funds':
        return 'Please ensure your account has sufficient balance or try a different payment method.';
      case 'card_declined':
        return 'Your bank may have declined the transaction. Contact your bank or try a different card.';
      case 'card_expired':
        return 'Please update your card details with a valid, non-expired card.';
      case 'network_error':
        return 'Check your internet connection and ensure you have a stable connection.';
      case 'timeout':
        return 'The payment took too long to process. Please try again with a stable connection.';
      case 'cancelled':
        return 'You cancelled the payment. You can try again whenever you\'re ready.';
      default:
        return 'If this issue persists, please contact our support team for assistance.';
    }
  };

  const handleRetryPayment = () => {
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

  const handleContactSupport = () => {
    const supportMessage = `Payment failed with reference: ${reference || 'N/A'}\nError: ${errorDetails?.originalError || 'Unknown error'}\nUser: ${user?.email || 'Unknown'}`;
    
    Alert.alert(
      'Contact Support',
      'How would you like to contact support?',
      [
        {
          text: 'Email',
          onPress: () => {
            // In a real app, you would open email client
            Alert.alert('Email Support', 'Please email support@thinqscribe.com with your payment details.');
          }
        },
        {
          text: 'In-App Support',
          onPress: () => router.push('/support')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const handleViewPaymentHistory = () => {
    router.push('/payment-history');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.loadingText}>Processing payment failure...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.resultCard}>
          <View style={styles.resultContainer}>
            {/* Error Icon */}
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              style={styles.errorIcon}
            >
              <Text style={styles.errorIconText}>
                {getErrorIcon(errorDetails?.type)}
              </Text>
            </LinearGradient>
            
            {/* Title */}
            <Text style={styles.resultTitle}>Payment Failed</Text>
            
            {/* Error Message */}
            <Text style={styles.resultSubtitle}>
              {errorDetails?.message}
            </Text>
            
            {/* Advice */}
            <Text style={styles.adviceText}>
              {getErrorAdvice(errorDetails?.type)}
            </Text>
            
            {/* Error Details */}
            {errorDetails?.reference && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Reference:</Text>
                  <Chip style={styles.errorReferenceChip} textStyle={styles.errorReferenceText}>
                    {errorDetails.reference}
                  </Chip>
                </View>
              </View>
            )}
            
            {/* Error Type Chip */}
            <Chip
              style={[styles.errorTypeChip, { backgroundColor: getErrorTypeColor(errorDetails?.type) }]}
              textStyle={styles.errorTypeText}
            >
              {getErrorTypeLabel(errorDetails?.type)}
            </Chip>
            
            {/* Actions */}
            <View style={styles.actionsContainer}>
              <Button
                mode="contained"
                onPress={handleRetryPayment}
                style={styles.primaryButton}
                labelStyle={styles.primaryButtonText}
                icon="refresh"
              >
                {agreement || agreementId ? 'Try Again' : 'Back to Dashboard'}
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleContactSupport}
                style={styles.secondaryButton}
                labelStyle={styles.secondaryButtonText}
                icon="help-circle"
              >
                Contact Support
              </Button>
              
              <View style={styles.additionalActions}>
                <Button
                  mode="text"
                  onPress={handleViewPaymentHistory}
                  style={styles.textButton}
                  labelStyle={styles.textButtonText}
                  icon="history"
                >
                  Payment History
                </Button>
                
                <Button
                  mode="text"
                  onPress={handleBackToDashboard}
                  style={styles.textButton}
                  labelStyle={styles.textButtonText}
                  icon="home"
                >
                  Dashboard
                </Button>
              </View>
            </View>
          </View>
        </Card>
        
        {/* Tips Card */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Payment Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipText}>• Ensure your card has sufficient balance</Text>
            <Text style={styles.tipText}>• Check that your card details are correct</Text>
            <Text style={styles.tipText}>• Try using a different payment method</Text>
            <Text style={styles.tipText}>• Contact your bank if the issue persists</Text>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
};

const getErrorTypeColor = (errorType) => {
  switch (errorType) {
    case 'insufficient_funds':
      return '#f59e0b';
    case 'card_declined':
    case 'card_expired':
      return '#ef4444';
    case 'network_error':
      return '#6366f1';
    case 'timeout':
      return '#8b5cf6';
    case 'cancelled':
      return '#64748b';
    default:
      return '#ef4444';
  }
};

const getErrorTypeLabel = (errorType) => {
  switch (errorType) {
    case 'insufficient_funds':
      return 'INSUFFICIENT FUNDS';
    case 'card_declined':
      return 'CARD DECLINED';
    case 'card_expired':
      return 'CARD EXPIRED';
    case 'network_error':
      return 'NETWORK ERROR';
    case 'timeout':
      return 'TIMEOUT';
    case 'cancelled':
      return 'CANCELLED';
    default:
      return 'PAYMENT FAILED';
  }
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
    gap: 20,
  },
  resultCard: {
    borderRadius: 20,
    elevation: 4,
    padding: 30,
  },
  resultContainer: {
    alignItems: 'center',
  },
  
  // Error Icon Styles
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIconText: {
    fontSize: 32,
    color: 'white',
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
    color: '#ef4444',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '600',
  },
  adviceText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  
  // Details Styles
  detailsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
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
  
  // Error Type Chip
  errorTypeChip: {
    marginBottom: 30,
    paddingHorizontal: 12,
  },
  errorTypeText: {
    color: 'white',
    fontSize: 12,
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
    borderColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 4,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  additionalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  textButton: {
    paddingVertical: 4,
  },
  textButtonText: {
    fontSize: 14,
    color: '#64748b',
  },
  
  // Tips Card Styles
  tipsCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
    borderWidth: 1,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0c4a6e',
    marginBottom: 15,
    textAlign: 'center',
  },
  tipsList: {
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#0c4a6e',
    lineHeight: 20,
  },
});

export default PaymentFailed;
