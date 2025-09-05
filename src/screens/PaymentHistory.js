import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Button,
  Avatar,
  Chip,
  ActivityIndicator,
  Searchbar,
  IconButton,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useAppLoading } from '../context/AppLoadingContext';
import { paymentApi } from '../api/payment';

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

  const fetchPayments = async () => {
    try {
      setLoading(true);
      console.log('📱 [PaymentHistory] Fetching payment history...');
      
      const response = await paymentApi.getPaymentHistory();
      console.log('📱 [PaymentHistory] Raw response:', response);
      
      const paymentData = response.payments || response.data?.payments || response || [];
      console.log('📱 [PaymentHistory] Payment data:', paymentData);
      
      const enhancedPayments = paymentData.map(payment => ({
        ...payment,
        id: payment._id || payment.id,
        paymentId: payment.paymentId || payment.reference || payment.id,
        amount: payment.amount || payment.totalAmount || 0,
        status: payment.status || 'unknown',
        timestamp: payment.createdAt || payment.timestamp || payment.date,
        project: payment.project || payment.agreement?.projectDetails || {
          title: 'Unknown Project',
          _id: null
        },
        otherParty: user?.role === 'student' 
          ? (payment.writer || payment.agreement?.writer || { name: 'Unknown Writer' })
          : (payment.student || payment.agreement?.student || { name: 'Unknown Student' }),
        receiptUrl: payment.receiptUrl || payment.receipt_url,
        gateway: payment.gateway || 'unknown'
      }));
      
      setPayments(enhancedPayments);
      
      // Calculate stats
      const totalAmount = enhancedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const successfulPayments = enhancedPayments.filter(p => p.status === 'success' || p.status === 'completed').length;
      const pendingPayments = enhancedPayments.filter(p => p.status === 'pending').length;
      const failedPayments = enhancedPayments.filter(p => p.status === 'failed' || p.status === 'cancelled').length;
      
      setStats({
        totalPayments: enhancedPayments.length,
        totalAmount,
        successfulPayments,
        pendingPayments,
        failedPayments
      });
      
    } catch (err) {
      console.error('📱 [PaymentHistory] Error fetching payments:', err);
      Alert.alert('Error', 'Failed to load payment history. Please try again.');
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
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
        `Payment ID: ${payment.paymentId}\nAmount: ${formatCurrency(payment.amount)}\nStatus: ${getStatusText(payment.status)}\nDate: ${formatDate(payment.timestamp)}`,
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
            <Text style={styles.statValue}>{formatCurrency(stats.totalAmount)}</Text>
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
            {formatCurrency(payment.amount)}
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
