import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    IconButton,
    Searchbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { agreementApi } from '../api/agreement';
import { paymentApi } from '../api/payment';
import { useAppLoading } from '../context/AppLoadingContext';
import { useAuth } from '../context/MobileAuthContext';

const { width } = Dimensions.get('window');

const PaymentHistory = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { setLoading: setGlobalLoading } = useAppLoading();

  // State
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'success', 'pending', 'failed'
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchQuery, filterStatus]);

  // 🆕 NEW: Fallback function to fetch payment data from agreements
  const fetchPaymentsFromAgreements = async () => {
    try {
      console.log('📱 [PaymentHistory] Fetching payments from agreements as fallback...');
      
      const response = await agreementApi.getAgreements();
      console.log('📱 [PaymentHistory] Agreements response:', response);
      
      const agreements = response.data || response || [];
      console.log('📱 [PaymentHistory] Agreements data:', agreements);
      
      // Extract payment data from agreements
      const paymentData = [];
      
      agreements.forEach(agreement => {
        if (agreement.installments && agreement.installments.length > 0) {
          agreement.installments.forEach(installment => {
            if (installment.isPaid || installment.status === 'paid') {
              paymentData.push({
                _id: `payment-${agreement._id}-${installment._id}`,
                paymentId: installment.stripePaymentIntentId || installment.paystackReference || `PAY-${installment._id}`,
                amount: installment.amount,
                status: 'success',
                createdAt: installment.paidDate || installment.paymentDate || agreement.createdAt,
                agreement: agreement,
                project: agreement.projectDetails,
                writer: agreement.writer,
                student: agreement.student,
                gateway: installment.stripePaymentIntentId ? 'stripe' : 'paystack',
                currency: 'USD',
                description: `Payment for ${agreement.projectDetails?.title || 'Project'}`
              });
            }
          });
        }
      });
      
      console.log('📱 [PaymentHistory] Extracted payment data from agreements:', paymentData);
      return paymentData;
      
    } catch (error) {
      console.error('📱 [PaymentHistory] Error fetching payments from agreements:', error);
      return [];
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      console.log('📱 [PaymentHistory] Fetching payment history...');
      console.log('📱 [PaymentHistory] User role:', user?.role);
      
      let paymentData = [];
      
      try {
        // 🔧 FIXED: Enhanced API call with proper parameters
        const response = await paymentApi.getPaymentHistory({
          role: user?.role,
          limit: 100,
          sort: 'desc'
        });
        
        console.log('📱 [PaymentHistory] Raw response:', response);
        console.log('📱 [PaymentHistory] Response data:', response.data);
        
        // 🔧 FIXED: Better data extraction with multiple fallbacks
        if (response && response.data) {
          paymentData = response.data.payments || response.data || [];
        } else if (Array.isArray(response)) {
          paymentData = response;
        } else if (response && response.payments) {
          paymentData = response.payments;
        }
        
        console.log('📱 [PaymentHistory] Extracted payment data:', paymentData);
        console.log('📱 [PaymentHistory] Payment data length:', paymentData.length);
        
      } catch (paymentApiError) {
        console.log('📱 [PaymentHistory] Payment API failed, trying fallback method...');
        console.error('📱 [PaymentHistory] Payment API error:', paymentApiError);
        
        // 🆕 FALLBACK: Try to get payment data from agreements
        paymentData = await fetchPaymentsFromAgreements();
      }
      
      // 🔧 FIXED: Enhanced payment data mapping with better fallbacks
      const enhancedPayments = paymentData.map((payment, index) => {
        console.log(`📱 [PaymentHistory] Processing payment ${index}:`, payment);
        
        return {
          ...payment,
          id: payment._id || payment.id || `payment-${index}`,
          paymentId: payment.paymentId || payment.reference || payment.transactionId || payment.id || `PAY-${index}`,
          amount: parseFloat(payment.amount || payment.totalAmount || payment.amountPaid || 0),
          status: payment.status || payment.paymentStatus || 'unknown',
          timestamp: payment.createdAt || payment.timestamp || payment.date || payment.paymentDate || new Date().toISOString(),
          project: payment.project || payment.agreement?.projectDetails || payment.agreement || {
            title: payment.description || payment.projectTitle || 'Unknown Project',
            _id: payment.agreementId || payment.projectId || null
          },
          otherParty: user?.role === 'student' 
            ? (payment.writer || payment.agreement?.writer || payment.writerInfo || { name: 'Unknown Writer' })
            : (payment.student || payment.agreement?.student || payment.studentInfo || { name: 'Unknown Student' }),
          receiptUrl: payment.receiptUrl || payment.receipt_url || payment.receipt,
          gateway: payment.gateway || payment.paymentGateway || 'unknown',
          currency: payment.currency || 'USD',
          description: payment.description || payment.notes || payment.project?.title || 'Payment'
        };
      });
      
      console.log('📱 [PaymentHistory] Enhanced payments:', enhancedPayments);
      
      setPayments(enhancedPayments);
      
      // 🔧 FIXED: Calculate stats with better status mapping
      const totalAmount = enhancedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const successfulPayments = enhancedPayments.filter(p => 
        ['success', 'completed', 'paid', 'succeeded'].includes(p.status?.toLowerCase())
      ).length;
      const pendingPayments = enhancedPayments.filter(p => 
        ['pending', 'processing', 'in_progress'].includes(p.status?.toLowerCase())
      ).length;
      const failedPayments = enhancedPayments.filter(p => 
        ['failed', 'cancelled', 'declined', 'error'].includes(p.status?.toLowerCase())
      ).length;
      
      const newStats = {
        totalPayments: enhancedPayments.length,
        totalAmount,
        successfulPayments,
        pendingPayments,
        failedPayments
      };
      
      console.log('📱 [PaymentHistory] Calculated stats:', newStats);
      setStats(newStats);
      
    } catch (err) {
      console.error('📱 [PaymentHistory] Error fetching payments:', err);
      console.error('📱 [PaymentHistory] Error details:', err.response?.data || err.message);
      
      // 🔧 FIXED: Better error handling with specific error messages
      let errorMessage = 'Failed to load payment history. Please try again.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Please log in again to view payment history.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to view payment history.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Error', errorMessage);
      
      // Set empty state on error
      setPayments([]);
      setStats({
        totalPayments: 0,
        totalAmount: 0,
        successfulPayments: 0,
        pendingPayments: 0,
        failedPayments: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(payment =>
        payment.paymentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.project?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.otherParty?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'success') {
        filtered = filtered.filter(p => p.status === 'success' || p.status === 'completed');
      } else {
        filtered = filtered.filter(p => p.status === filterStatus);
      }
    }

    setFilteredPayments(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPayments();
    setRefreshing(false);
  };

  const formatCurrency = (amount, currency = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase()
      }).format(amount || 0);
    } catch (error) {
      // Fallback for unsupported currencies
      return `${currency.toUpperCase()} ${(amount || 0).toFixed(2)}`;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return '#22c55e';
      case 'pending':
        return '#f59e0b';
      case 'failed':
      case 'cancelled':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'SUCCESS';
      case 'pending':
        return 'PENDING';
      case 'failed':
        return 'FAILED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  const handlePaymentPress = (payment) => {
    if (payment.project?._id) {
      router.push(`/agreement/${payment.project._id}`);
    } else {
      Alert.alert(
        'Payment Details',
        `Payment ID: ${payment.paymentId}\nAmount: ${formatCurrency(payment.amount, payment.currency)}\nStatus: ${getStatusText(payment.status)}\nDate: ${formatDate(payment.timestamp)}\nGateway: ${payment.gateway?.toUpperCase() || 'Unknown'}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleDownloadReceipt = (payment) => {
    if (payment.receiptUrl) {
      // In a real app, you would open the receipt URL
      Alert.alert('Receipt', `Receipt would be downloaded for payment ${payment.paymentId}`);
    } else {
      Alert.alert('Receipt', 'Receipt not available for this payment.');
    }
  };

  const renderHeader = () => (
    <View>
      <LinearGradient colors={['#015382', '#017DB0']} style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Payment History</Text>
          <Text style={styles.headerSubtitle}>
            Track all your transactions and payments
          </Text>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.totalCard]}>
            <Text style={styles.statValue}>{stats.totalPayments}</Text>
            <Text style={styles.statLabel}>Total Payments</Text>
          </Card>
          
          <Card style={[styles.statCard, styles.amountCard]}>
            <Text style={styles.statValue}>{formatCurrency(stats.totalAmount, 'USD')}</Text>
            <Text style={styles.statLabel}>Total Amount</Text>
          </Card>
        </View>
        
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.successCard]}>
            <Text style={styles.statValue}>{stats.successfulPayments}</Text>
            <Text style={styles.statLabel}>Successful</Text>
          </Card>
          
          <Card style={[styles.statCard, styles.pendingCard]}>
            <Text style={styles.statValue}>{stats.pendingPayments}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>
          
          <Card style={[styles.statCard, styles.failedCard]}>
            <Text style={styles.statValue}>{stats.failedPayments}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </Card>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.controlsContainer}>
        <Searchbar
          placeholder="Search payments..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#015382"
        />
        
        <View style={styles.filterContainer}>
          {['all', 'success', 'pending', 'failed'].map((status) => (
            <Chip
              key={status}
              selected={filterStatus === status}
              onPress={() => setFilterStatus(status)}
              style={[styles.filterChip, filterStatus === status && styles.selectedChip]}
              textStyle={[styles.filterChipText, filterStatus === status && styles.selectedChipText]}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Chip>
          ))}
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  const renderPaymentItem = ({ item: payment }) => (
    <TouchableOpacity
      style={styles.paymentItem}
      onPress={() => handlePaymentPress(payment)}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentId} numberOfLines={1}>
            {payment.paymentId}
          </Text>
          <Text style={styles.projectTitle} numberOfLines={1}>
            {payment.project?.title || 'Unknown Project'}
          </Text>
          <Text style={styles.otherParty}>
            {user?.role === 'student' ? 'Writer' : 'Student'}: {payment.otherParty?.name}
          </Text>
        </View>
        
        <View style={styles.paymentMeta}>
          <Text style={styles.paymentAmount}>
            {formatCurrency(payment.amount, payment.currency)}
          </Text>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(payment.status) }]}
            textStyle={styles.statusChipText}
          >
            {getStatusText(payment.status)}
          </Chip>
        </View>
      </View>
      
      <View style={styles.paymentFooter}>
        <View style={styles.paymentDate}>
          <Text style={styles.dateText}>
            {formatDate(payment.timestamp)}
          </Text>
          {payment.gateway && (
            <Text style={styles.gatewayText}>
              via {payment.gateway.charAt(0).toUpperCase() + payment.gateway.slice(1)}
            </Text>
          )}
        </View>
        
        <View style={styles.paymentActions}>
          {payment.status === 'success' && payment.receiptUrl && (
            <IconButton
              icon="download"
              size={20}
              onPress={() => handleDownloadReceipt(payment)}
              style={styles.actionButton}
            />
          )}
          <IconButton
            icon="arrow-right"
            size={20}
            onPress={() => handlePaymentPress(payment)}
            style={styles.actionButton}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💳</Text>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No payments found' : 'No payment history yet'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery 
          ? 'Try adjusting your search terms or filters'
          : 'Your payment transactions will appear here once you make payments'
        }
      </Text>
      {searchQuery && (
        <Button
          mode="contained"
          onPress={() => {
            setSearchQuery('');
            setFilterStatus('all');
          }}
          style={styles.clearButton}
        >
          Clear Filters
        </Button>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#015382" />
          <Text style={styles.loadingText}>Loading payment history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredPayments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
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
  listContainer: {
    paddingBottom: 20,
  },
  
  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 25,
    zIndex: 1,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 20,
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
  },
  
  // Stats Styles
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  totalCard: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    borderWidth: 1,
  },
  amountCard: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
    borderWidth: 1,
  },
  successCard: {
    backgroundColor: '#dcfce7',
  },
  pendingCard: {
    backgroundColor: '#fef3c7',
  },
  failedCard: {
    backgroundColor: '#fee2e2',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  
  // Controls Styles
  controlsContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBar: {
    marginBottom: 15,
    elevation: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: '#f1f5f9',
  },
  selectedChip: {
    backgroundColor: '#015382',
  },
  filterChipText: {
    color: '#64748b',
    fontSize: 12,
  },
  selectedChipText: {
    color: 'white',
  },
  resultsHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  resultsCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  
  // Payment Item Styles
  paymentItem: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
    minWidth: 0,
  },
  paymentId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#015382',
    marginBottom: 4,
  },
  otherParty: {
    fontSize: 13,
    color: '#64748b',
  },
  paymentMeta: {
    alignItems: 'flex-end',
    marginLeft: 15,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 8,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusChipText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  paymentDate: {
    flex: 1,
  },
  dateText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  gatewayText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 5,
  },
  actionButton: {
    margin: 0,
    backgroundColor: '#f8fafc',
  },
  
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  clearButton: {
    backgroundColor: '#015382',
  },
});

export default PaymentHistory;
