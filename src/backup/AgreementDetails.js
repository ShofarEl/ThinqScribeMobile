import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    ActivityIndicator,
    Avatar,
    Button,
    Card,
    Chip,
    ProgressBar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { agreementApi } from '../api/agreement';
import EnhancedPaymentModal from '../components/EnhancedPaymentModal';
import { useAppLoading } from '../context/AppLoadingContext';
import { useAuth } from '../context/MobileAuthContext';
import { useCurrency } from '../hooks/useCurrency';

const { width } = Dimensions.get('window');

const AgreementDetails = () => {
  const { agreementId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { setLoading: setGlobalLoading } = useAppLoading();
  const { formatLocal } = useCurrency();

  // State
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Payment state
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentType, setPaymentType] = useState('next'); // 'next', 'full', 'custom'
  const [paymentAmount, setPaymentAmount] = useState(0);

  console.log('💳 [AgreementDetails] Payment state:', { 
    paymentModalVisible, 
    paymentType, 
    paymentAmount 
  });

  useEffect(() => {
    if (agreementId) {
      fetchAgreement();
    } else {
      Alert.alert('Error', 'Agreement ID is required.');
      router.back();
    }
  }, [agreementId]);

  const fetchAgreement = async () => {
    try {
      console.log('📱 [AgreementDetails] Fetching agreement:', agreementId);
      const agreementData = await agreementApi.getAgreement(agreementId);
      console.log('📱 [AgreementDetails] Agreement data:', agreementData);
      console.log('📱 [AgreementDetails] Agreement status:', agreementData?.status);
      console.log('📱 [AgreementDetails] Agreement installments:', agreementData?.installments);
      console.log('📱 [AgreementDetails] Agreement totalAmount:', agreementData?.totalAmount);
      console.log('📱 [AgreementDetails] Agreement paidAmount:', agreementData?.paidAmount);
      
      if (!agreementData) {
        throw new Error('Agreement not found');
      }

      setAgreement(agreementData);
    } catch (err) {
      console.error('📱 [AgreementDetails] Error fetching agreement:', err);
      Alert.alert('Error', err.message || 'Failed to load agreement details.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAgreement = async () => {
    Alert.alert(
      'Complete Agreement',
      'Are you sure you want to mark this agreement as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          onPress: async () => {
            try {
              setUpdating(true);
              await agreementApi.completeAgreement(agreementId);
              
              // Refresh agreement data
              await fetchAgreement();
              
              Alert.alert('Success', 'Agreement marked as completed!');
            } catch (err) {
              console.error('Error completing agreement:', err);
              Alert.alert('Error', 'Failed to complete agreement. Please try again.');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  // Payment handling functions
  const openPaymentModal = (type, amount = null) => {
    try {
      console.log('💳 [AgreementDetails] Opening payment modal:', { type, amount, currentPaymentType: paymentType });

      // 🔧 CRITICAL: Validate agreement before opening payment modal
      if (!agreement) {
        console.error('💳 [AgreementDetails] No agreement data available');
        Alert.alert('Error', 'Agreement data not available. Please refresh and try again.');
        return;
      }

      if (agreement.status !== 'active') {
        console.error('💳 [AgreementDetails] Agreement not active:', agreement.status);
        Alert.alert('Error', 'This agreement is not active and cannot accept payments.');
        return;
      }

      setPaymentType(type);

      const nextInstallment = getNextInstallment();
      console.log('💳 [AgreementDetails] Next installment for payment:', nextInstallment);

      if (type === 'next' && nextInstallment) {
        if (!nextInstallment.amount || nextInstallment.amount <= 0) {
          console.error('💳 [AgreementDetails] Next installment has invalid amount:', nextInstallment);
          Alert.alert('Error', 'Next installment has no valid amount. Please contact support.');
          return;
        }
        console.log('💳 [AgreementDetails] Setting payment amount from next installment:', nextInstallment.amount);
        setPaymentAmount(nextInstallment.amount);
      } else if (type === 'full') {
        const remainingAmount = (agreement?.totalAmount || 0) - (agreement?.paidAmount || 0);
        if (remainingAmount <= 0) {
          console.error('💳 [AgreementDetails] No remaining amount to pay:', remainingAmount);
          Alert.alert('Info', 'This agreement is already fully paid.');
          return;
        }
        console.log('💳 [AgreementDetails] Setting payment amount to full remaining:', remainingAmount);
        setPaymentAmount(remainingAmount);
      } else if (type === 'custom' && amount) {
        if (!amount || amount <= 0) {
          console.error('💳 [AgreementDetails] Invalid custom amount:', amount);
          Alert.alert('Error', 'Please enter a valid payment amount.');
          return;
        }
        console.log('💳 [AgreementDetails] Setting custom payment amount:', amount);
        setPaymentAmount(amount);
      }

      setPaymentModalVisible(true);
    } catch (error) {
      console.error('💳 [AgreementDetails] Error opening payment modal:', error);
      Alert.alert('Error', 'Failed to open payment modal. Please try again.');
    }
  };

  const handlePaymentSuccess = async (paymentData, currentPaymentType) => {
    try {
      console.log('💳 Payment completed successfully:', paymentData);

      // Update local agreement state
      const nextInstallment = getNextInstallment();
      const updatedInstallments = agreement.installments?.map(inst => {
        if (currentPaymentType === 'next' && inst._id === nextInstallment?._id) {
          return {
            ...inst,
            status: 'paid',
            isPaid: true,
            paymentDate: new Date(),
            transactionAmount: paymentData.amount,
            transactionCurrency: paymentData.currency,
            gateway: paymentData.gateway
          };
        }
        return inst;
      }) || [];

      const newPaidAmount = currentPaymentType === 'full' ?
        agreement.totalAmount :
        (agreement.paidAmount || 0) + paymentData.amount;

      setAgreement(prev => ({
        ...prev,
        installments: updatedInstallments,
        paidAmount: newPaidAmount,
        status: 'active'
      }));

      setPaymentModalVisible(false);

      Alert.alert(
        'Payment Successful',
        `Your payment has been processed successfully via ${paymentData.gateway}.`,
        [
          { text: 'OK' }
        ]
      );

      // Navigate to payment success screen
      router.push({
        pathname: '/payment-success',
        params: {
          agreementId: agreementId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          gateway: paymentData.gateway
        }
      });

    } catch (err) {
      console.error('Error handling payment success:', err);
      Alert.alert('Error', 'Payment was successful but there was an error updating the display.');
    }
  };

  const handlePaymentCancel = () => {
    setPaymentModalVisible(false);
  };

  // Detect currency from agreement payment preferences
  const getAgreementCurrency = () => {
    if (!agreement?.paymentPreferences) {
      console.log('💵 [AgreementDetails] No payment preferences found, defaulting to USD');
      return 'USD';
    }

    const prefs = agreement.paymentPreferences;
    console.log('💵 [AgreementDetails] Payment preferences:', prefs);

    // Check for explicit currency setting
    if (prefs.currency === 'ngn') {
      console.log('💵 [AgreementDetails] Currency detected: NGN (explicit setting)');
      return 'NGN';
    }

    // Check for Paystack gateway (typically NGN)
    if (prefs.gateway === 'paystack') {
      console.log('💵 [AgreementDetails] Currency detected: NGN (Paystack gateway)');
      return 'NGN';
    }

    // Check for native amount indicators
    if (prefs.nativeAmount && prefs.nativeAmount !== agreement.totalAmount && prefs.exchangeRate === 1) {
      console.log('💵 [AgreementDetails] Currency detected: NGN (native amount indicator)');
      return 'NGN';
    }
    if (prefs.nativeAmount && prefs.nativeAmount > 5000) {
      console.log('💵 [AgreementDetails] Currency detected: NGN (large native amount)');
      return 'NGN';
    }

    // Default to USD or explicit currency
    const finalCurrency = (prefs.currency || 'USD').toUpperCase();
    console.log('💵 [AgreementDetails] Currency detected:', finalCurrency, '(default/fallback)');
    return finalCurrency;
  };

  const formatCurrency = (amount, currencyOverride) => {
    const currency = currencyOverride || getAgreementCurrency();
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount || 0);

    console.log('💵 [AgreementDetails] Formatting currency:', {
      amount,
      currency,
      formatted,
      currencyOverride
    });

    return formatted;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'active': return '#10b981';
      case 'completed': return '#6366f1';
      case 'disputed': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'PENDING';
      case 'active': return 'ACTIVE';
      case 'completed': return 'COMPLETED';
      case 'disputed': return 'DISPUTED';
      default: return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  const calculateProgress = () => {
    if (!agreement?.installments || agreement.installments.length === 0) return 0;
    const paidCount = agreement.installments.filter(inst => inst.status === 'paid').length;
    return (paidCount / agreement.installments.length) * 100;
  };

  const getNextInstallment = () => {
    console.log('🔍 [AgreementDetails] Getting next installment...');
    console.log('🔍 [AgreementDetails] Agreement:', agreement ? 'exists' : 'null');
    console.log('🔍 [AgreementDetails] Installments:', agreement?.installments);

    if (!agreement?.installments) {
      console.log('🔍 [AgreementDetails] No installments found');
      return null;
    }

    const pendingInstallments = agreement.installments.filter(inst => inst.status === 'pending');
    console.log('🔍 [AgreementDetails] Pending installments:', pendingInstallments);

    const nextInstallment = agreement.installments.find(inst => inst.status === 'pending');
    console.log('🔍 [AgreementDetails] Next installment found:', nextInstallment);

    return nextInstallment;
  };

  const renderHeader = () => (
    <LinearGradient colors={['#015382', '#017DB0']} style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Agreement Details</Text>
        <Text style={styles.headerSubtitle}>
          {agreement?.projectDetails?.title || 'Untitled Project'}
        </Text>
        
        <View style={styles.headerStats}>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(agreement?.status) }]}
            textStyle={styles.statusChipText}
          >
            {getStatusText(agreement?.status)}
          </Chip>
        </View>
      </View>
    </LinearGradient>
  );

  const renderProjectInfo = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>📝 Project Information</Text>
      
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Subject</Text>
          <Text style={styles.infoValue}>
            {agreement?.projectDetails?.subject || 'Not specified'}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Deadline</Text>
          <Text style={styles.infoValue}>
            {agreement?.projectDetails?.deadline 
              ? formatDate(agreement.projectDetails.deadline)
              : 'Not specified'
            }
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Description</Text>
          <Text style={styles.infoValueMultiline}>
            {agreement?.projectDetails?.description || 'No description provided'}
          </Text>
        </View>
        
        {user?.role === 'student' && agreement?.writer && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Writer</Text>
            <View style={styles.participantInfo}>
              <Avatar.Image
                size={40}
                source={{ 
                  uri: agreement.writer.avatar || 
                       `https://api.dicebear.com/7.x/initials/svg?seed=${agreement.writer.name}` 
                }}
              />
              <Text style={styles.participantName}>{agreement.writer.name}</Text>
            </View>
          </View>
        )}
        
        {user?.role === 'writer' && agreement?.student && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Student</Text>
            <View style={styles.participantInfo}>
              <Avatar.Image
                size={40}
                source={{ 
                  uri: agreement.student.avatar || 
                       `https://api.dicebear.com/7.x/initials/svg?seed=${agreement.student.name}` 
                }}
              />
              <Text style={styles.participantName}>{agreement.student.name}</Text>
            </View>
          </View>
        )}
      </View>
    </Card>
  );

  const renderProgress = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>🏆 Project Progress</Text>
      
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Payment Progress</Text>
          <Text style={styles.progressPercentage}>
            {Math.round(calculateProgress())}% Complete
          </Text>
        </View>
        
        <ProgressBar 
          progress={calculateProgress() / 100} 
          color="#015382"
          style={styles.progressBar}
        />
        
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <Text style={styles.progressStatValue}>
              {agreement?.installments?.filter(i => i.status === 'paid').length || 0}
            </Text>
            <Text style={styles.progressStatLabel}>Paid</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressStatValue}>
              {agreement?.installments?.filter(i => i.status === 'pending').length || 0}
            </Text>
            <Text style={styles.progressStatLabel}>Pending</Text>
          </View>
          <View style={styles.progressStat}>
            <Text style={styles.progressStatValue}>
              {agreement?.installments?.length || 0}
            </Text>
            <Text style={styles.progressStatLabel}>Total</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderPaymentSchedule = () => {
    if (!agreement?.installments || agreement.installments.length === 0) {
      return (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>💰 Payment Information</Text>
          <View style={styles.singlePayment}>
            <Text style={styles.singlePaymentAmount}>
              {formatCurrency(agreement?.totalAmount || 0)}
            </Text>
            <Text style={styles.singlePaymentLabel}>Total Amount</Text>
            {agreement?.paidAmount > 0 && (
              <Text style={styles.singlePaymentPaid}>
                {formatCurrency(agreement.paidAmount)} paid
              </Text>
            )}
          </View>
        </Card>
      );
    }

    const nextInstallment = getNextInstallment();

    return (
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>💰 Payment Schedule</Text>
        
        {nextInstallment && (
          <View style={styles.nextPayment}>
            <Text style={styles.nextPaymentTitle}>Next Payment Due</Text>
            <View style={styles.nextPaymentInfo}>
              <Text style={styles.nextPaymentAmount}>
                {formatCurrency(nextInstallment.amount || 0)}
              </Text>
              <Text style={styles.nextPaymentDate}>
                Due: {nextInstallment.dueDate ? new Date(nextInstallment.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'Date not available'}
              </Text>
            </View>
          </View>
        )}
        
        <View style={styles.installmentsList}>
          {agreement.installments.map((installment, index) => (
            <View key={index} style={styles.installmentItem}>
              <View style={styles.installmentHeader}>
                <Text style={styles.installmentTitle}>
                  Installment {index + 1}
                </Text>
                <Chip
                  style={[
                    styles.installmentStatus,
                    { backgroundColor: getStatusColor(installment.status) }
                  ]}
                  textStyle={styles.installmentStatusText}
                >
                  {installment.status?.toUpperCase() || 'PENDING'}
                </Chip>
              </View>
              
              <View style={styles.installmentDetails}>
                <Text style={styles.installmentAmount}>
                  {formatCurrency(installment.amount)}
                </Text>
                <Text style={styles.installmentDate}>
                  Due: {new Date(installment.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderActions = () => {
    if (agreement?.status === 'completed') {
      return (
        <Card style={styles.card}>
          <View style={styles.completedState}>
            <Text style={styles.completedIcon}>✅</Text>
            <Text style={styles.completedTitle}>Agreement Completed</Text>
            <Text style={styles.completedText}>
              This project has been successfully completed.
            </Text>
          </View>
        </Card>
      );
    }

    if (agreement?.status === 'pending' && user?.role === 'writer') {
      return (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Actions</Text>
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              onPress={() => {
                // Handle accept agreement
                Alert.alert('Accept Agreement', 'Accept this agreement to start working.');
              }}
              style={styles.actionButton}
              loading={updating}
            >
              Accept Agreement
            </Button>
          </View>
        </Card>
      );
    }

    // Payment actions for students
    if (agreement?.status === 'active' && user?.role === 'student') {
      const nextInstallment = getNextInstallment();
      const remainingAmount = (agreement?.totalAmount || 0) - (agreement?.paidAmount || 0);

      return (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>💳 Payment Actions</Text>

          {nextInstallment && (
            <View style={styles.paymentAction}>
              <Text style={styles.paymentActionTitle}>Next Payment Due</Text>
              <View style={styles.paymentActionInfo}>
                <Text style={styles.paymentActionAmount}>
                  {formatCurrency(nextInstallment.amount || 0)}
                </Text>
                <Text style={styles.paymentActionDate}>
                  Due: {nextInstallment.dueDate ? new Date(nextInstallment.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'Date not available'}
                </Text>
              </View>

              <View style={styles.paymentButtons}>
                <Button
                  mode="contained"
                  onPress={() => openPaymentModal('next')}
                  style={[styles.paymentButton, styles.primaryPaymentButton]}
                  icon="credit-card"
                >
                  Pay Next Installment
                </Button>

                {nextInstallment?.amount && remainingAmount && remainingAmount > nextInstallment.amount && (
                  <Button
                    mode="outlined"
                    onPress={() => openPaymentModal('full')}
                    style={[styles.paymentButton, styles.secondaryPaymentButton]}
                    icon="cash-multiple"
                  >
                    Pay Full Amount
                  </Button>
                )}
              </View>
            </View>
          )}

          {!nextInstallment && remainingAmount > 0 && (
            <View style={styles.paymentAction}>
              <Text style={styles.paymentActionTitle}>Complete Payment</Text>
              <View style={styles.paymentActionInfo}>
                <Text style={styles.paymentActionAmount}>
                  {formatCurrency(remainingAmount)}
                </Text>
                <Text style={styles.paymentActionDate}>
                  Remaining balance
                </Text>
              </View>

              <Button
                mode="contained"
                onPress={() => openPaymentModal('full')}
                style={[styles.paymentButton, styles.primaryPaymentButton]}
                icon="credit-card"
              >
                Pay Remaining Balance
              </Button>
            </View>
          )}

          {remainingAmount === 0 && (
            <View style={styles.paymentCompleted}>
              <Text style={styles.paymentCompletedIcon}>🎉</Text>
              <Text style={styles.paymentCompletedTitle}>All Payments Completed!</Text>
              <Text style={styles.paymentCompletedText}>
                Your project is now fully funded.
              </Text>
            </View>
          )}
        </Card>
      );
    }

    if (agreement?.status === 'active' && user?.role === 'writer') {
      return (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Actions</Text>
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              onPress={handleCompleteAgreement}
              style={styles.actionButton}
              loading={updating}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Mark as Completed'}
            </Button>
          </View>
        </Card>
      );
    }

    return null;
  };

  const renderSummary = () => (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>📊 Summary</Text>
      
      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Status</Text>
          <Chip
            style={[styles.summaryChip, { backgroundColor: getStatusColor(agreement?.status) }]}
            textStyle={styles.summaryChipText}
          >
            {getStatusText(agreement?.status)}
          </Chip>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Amount</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(agreement?.totalAmount || 0)}
          </Text>
        </View>
        
        {agreement?.paidAmount > 0 && (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Paid Amount</Text>
            <Text style={[styles.summaryValue, styles.summaryValuePaid]}>
              {formatCurrency(agreement.paidAmount)}
            </Text>
          </View>
        )}
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Created</Text>
          <Text style={styles.summaryValue}>
            {agreement?.createdAt 
              ? new Date(agreement.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : 'Unknown'
            }
          </Text>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#015382" />
          <Text style={styles.loadingText}>Loading agreement details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!agreement) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Agreement Not Found</Text>
          <Text style={styles.errorText}>
            The requested agreement could not be found.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={styles.errorButton}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderProjectInfo()}
        {renderProgress()}
        {renderPaymentSchedule()}
        {renderActions()}
        {renderSummary()}
      </ScrollView>

      {/* Enhanced Payment Modal */}
      <EnhancedPaymentModal
        visible={paymentModalVisible}
        onCancel={handlePaymentCancel}
        onPaymentSuccess={handlePaymentSuccess}
        amount={paymentAmount}
        currency={getAgreementCurrency().toLowerCase()}
        agreementId={agreementId}
        title={paymentType === 'next' ? 'Pay Next Installment' : paymentType === 'full' ? 'Pay Full Amount' : 'Complete Payment'}
        description={
          paymentType === 'next'
            ? `Pay the next installment to continue your project.`
            : paymentType === 'full'
              ? 'Pay the remaining balance to complete your project.'
              : 'Complete your payment to proceed.'
        }
        agreementData={agreement}
        paymentType={paymentType}
      />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  errorButton: {
    backgroundColor: '#015382',
  },
  
  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 15,
    zIndex: 1,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 15,
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 3,
  },
  headerStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  statusChip: {
    paddingHorizontal: 5,
  },
  statusChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 15,
  },
  
  // Project Info Styles
  infoGrid: {
    gap: 15,
  },
  infoItem: {
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  infoValueMultiline: {
    fontSize: 15,
    color: '#1e293b',
    lineHeight: 20,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  participantName: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  
  // Progress Styles
  progressSection: {
    gap: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#015382',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#015382',
    marginBottom: 3,
  },
  progressStatLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  
  // Payment Styles
  singlePayment: {
    alignItems: 'center',
    padding: 20,
  },
  singlePaymentAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#015382',
    marginBottom: 5,
  },
  singlePaymentLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 10,
  },
  singlePaymentPaid: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  nextPayment: {
    backgroundColor: '#fef3c7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  nextPaymentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  nextPaymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextPaymentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400e',
  },
  nextPaymentDate: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  installmentsList: {
    gap: 12,
  },
  installmentItem: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  installmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  installmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  installmentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  installmentStatusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  installmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  installmentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#015382',
  },
  installmentDate: {
    fontSize: 12,
    color: '#64748b',
  },
  
  // Actions Styles
  actionsContainer: {
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#015382',
    paddingVertical: 5,
  },

  // Payment action styles
  paymentAction: {
    marginBottom: 20
  },
  paymentActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12
  },
  paymentActionInfo: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  paymentActionAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 4
  },
  paymentActionDate: {
    fontSize: 14,
    color: '#6b7280'
  },
  paymentButtons: {
    gap: 12
  },
  paymentButton: {
    marginVertical: 4
  },
  primaryPaymentButton: {
    backgroundColor: '#1e3a8a'
  },
  secondaryPaymentButton: {
    borderColor: '#1e3a8a',
    borderWidth: 2
  },

  // Payment completed styles
  paymentCompleted: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  paymentCompletedIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  paymentCompletedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 8,
    textAlign: 'center'
  },
  paymentCompletedText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center'
  },
  
  // Completed State
  completedState: {
    alignItems: 'center',
    padding: 20,
  },
  completedIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 8,
  },
  completedText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  
  // Summary Styles
  summaryGrid: {
    gap: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  summaryValuePaid: {
    color: '#059669',
  },
  summaryChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  summaryChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AgreementDetails;
