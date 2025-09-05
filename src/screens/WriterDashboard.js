// ThinqScribe/src/screens/WriterDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Card, Button, Avatar, Badge, ProgressBar, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { fetchWriterDashboardData, completeAssignment, acceptAssignment } from '../api/writerDashboard';
import { agreementApi } from '../api/agreement';
import { useCurrency } from '../hooks/useCurrency';
import { getUserLocationAndCurrency, formatCurrency, getCurrencySymbol } from '../utils/currencyUtils';
import { formatDate, getTimeAgo, getDaysUntilDate, isOverdue } from '../utils/dateUtils';

// Socket for real-time updates (if available)
let socket = null;
try {
  // Try to import socket if available
  const { useNotifications } = require('../context/NotificationContext');
  socket = useNotifications?.socket;
} catch (error) {
  console.log('📱 [WriterDashboard] Socket not available in mobile, using polling instead');
}

const { width } = Dimensions.get('window');

const WriterDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket() || {};
  const { 
    currency, 
    symbol, 
    location: userLocation, 
    loading: currencyLoading, 
    formatCurrency: formatCurrencyHook,
    convertPrice,
    exchangeRate,
    countryCode,
    isNGN,
    flag
  } = useCurrency();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [agreements, setAgreements] = useState([]);
  const [pendingAgreements, setPendingAgreements] = useState([]);
  const [activeAgreements, setActiveAgreements] = useState([]);
  const [completedAgreements, setCompletedAgreements] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingAmount: 0,
    completedCount: 0,
    activeCount: 0,
    pendingCount: 0,
    rating: 4.8,
    responseRate: 98
  });

  // Helper function to get writer earnings with proper currency conversion
  const getWriterEarningsDisplay = (agreements) => {
    let totalEarningsUSD = 0;
    let availableBalanceUSD = 0;
    let pendingAmountUSD = 0;

    console.log('💰 [MOBILE EARNINGS] Starting calculation with platform fee REMOVED');
    console.log('💰 [MOBILE EARNINGS] Processing', agreements.length, 'agreements');

    agreements.forEach((agreement, index) => {
      if (!agreement) return;

      // Detect original currency of the agreement
      const getAgreementCurrency = () => {
        if (!agreement.paymentPreferences) return 'usd';
        
        const prefs = agreement.paymentPreferences;
        
        // If currency is explicitly set to NGN, use that
        if (prefs.currency === 'ngn') return 'ngn';
        
        // If it was created with Paystack (Nigerian gateway), likely NGN
        if (prefs.gateway === 'paystack') return 'ngn';
        
        // If nativeAmount exists and is different from totalAmount, and exchangeRate is 1, likely NGN
        if (prefs.nativeAmount && prefs.nativeAmount !== agreement.totalAmount && prefs.exchangeRate === 1) return 'ngn';
        
        // If nativeAmount is much larger than what would be normal USD (>5000), likely NGN
        if (prefs.nativeAmount && prefs.nativeAmount > 5000) return 'ngn';
        
        // Otherwise use the stated currency
        return prefs.currency || 'usd';
      };

      const originalCurrency = getAgreementCurrency();
      const writerShareRate = 1.0; // 100% to writer - platform fee removed

      console.log(`💰 [MOBILE EARNINGS] Agreement ${index + 1}:`, {
        id: agreement._id?.slice(-8),
        title: agreement.projectDetails?.title,
        status: agreement.status,
        originalCurrency,
        totalAmount: agreement.totalAmount,
        paidAmount: agreement.paidAmount,
        writerShareRate
      });

      // For completed agreements, calculate earnings
      if (agreement.status === 'completed' && agreement.paidAmount > 0) {
        let writerEarnings = agreement.paidAmount * writerShareRate;
        
        console.log(`   - Completed agreement earnings BEFORE conversion: ${writerEarnings} ${originalCurrency}`);
        
        // Convert to USD for display
        if (originalCurrency === 'ngn') {
          // NGN agreements: divide by 1500 to get USD equivalent
          writerEarnings = writerEarnings / 1500;
          console.log(`   - Converted NGN to USD: ${writerEarnings} USD`);
        }
        // USD agreements: keep as USD
        
        totalEarningsUSD += writerEarnings;
        availableBalanceUSD += writerEarnings; // Assume available for withdrawal
        
        console.log(`   - Added to total earnings: ${writerEarnings} USD (Running total: ${totalEarningsUSD})`);
      }

      // For pending/active agreements, calculate pending amount
      if ((agreement.status === 'pending' || agreement.status === 'active') && agreement.totalAmount > 0) {
        const unpaidAmount = agreement.totalAmount - (agreement.paidAmount || 0);
        let pendingEarnings = unpaidAmount * writerShareRate;
        
        console.log(`   - Pending/Active agreement: unpaid ${unpaidAmount} ${originalCurrency}`);
        
        // Convert to USD for display
        if (originalCurrency === 'ngn') {
          // NGN agreements: divide by 1500 to get USD equivalent
          pendingEarnings = pendingEarnings / 1500;
          console.log(`   - Converted pending NGN to USD: ${pendingEarnings} USD`);
        }
        // USD agreements: keep as USD
        
        pendingAmountUSD += pendingEarnings;
        
        console.log(`   - Added to pending: ${pendingEarnings} USD (Running pending: ${pendingAmountUSD})`);
      }
    });

    console.log('💰 [MOBILE EARNINGS] FINAL CALCULATIONS:');
    console.log(`   - Total Earnings: $${totalEarningsUSD.toFixed(2)} USD`);
    console.log(`   - Available Balance: $${availableBalanceUSD.toFixed(2)} USD`);
    console.log(`   - Pending Amount: $${pendingAmountUSD.toFixed(2)} USD`);
    console.log('💰 [MOBILE EARNINGS] Platform fee has been REMOVED - writers get 100%');

    return {
      totalEarnings: totalEarningsUSD,
      availableBalance: availableBalanceUSD,
      pendingAmount: pendingAmountUSD
    };
  };

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('📱 [WriterDashboard] Fetching data...');

      // Always use agreements API for proper currency calculation
      console.log('📱 [WriterDashboard] Fetching agreements...');
      const agreementsData = await agreementApi.getAgreements();
      const agreements = Array.isArray(agreementsData) ? agreementsData : [];
      console.log('✅ [WriterDashboard] Agreements fetched:', agreements.length);

      // Categorize agreements
      const pending = agreements.filter(a => a?.status === 'pending');
      const active = agreements.filter(a => a?.status === 'active');
      const completed = agreements.filter(a => a?.status === 'completed');
      
      console.log('📊 [WriterDashboard] Final categorization:');
      console.log(`   - Pending: ${pending.length}`);
      console.log(`   - Active: ${active.length}`);
      console.log(`   - Completed: ${completed.length}`);
      
      // Sort completed agreements by most recent first
      const sortedCompleted = completed.sort((a, b) => 
        new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt)
      );

      setPendingAgreements(pending);
      setActiveAgreements(active);
      setCompletedAgreements(sortedCompleted);
      setAgreements(agreements);
      
      // Calculate proper writer earnings using currency conversion logic
      const writerEarnings = getWriterEarningsDisplay(agreements);
      
      console.log('💰 [WriterDashboard] Writer earnings calculated:', writerEarnings);
      
      // Update stats with proper currency conversion
      setStats({
        totalEarnings: writerEarnings.totalEarnings,
        availableBalance: writerEarnings.availableBalance,
        pendingAmount: writerEarnings.pendingAmount,
        completedCount: completed.length,
        activeCount: active.length,
        pendingCount: pending.length,
        rating: 4.8,
        responseRate: 98
      });

    } catch (error) {
      console.error('📱 [WriterDashboard] Error fetching data:', error);
      Alert.alert(
        'Error',
        'Failed to load dashboard data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Set up polling for real-time updates since socket may not be available in mobile
    const pollInterval = setInterval(() => {
      // Only poll if the app is in the foreground and user is authenticated
      if (user?._id) {
        console.log('📱 [WriterDashboard] Polling for updates...');
        fetchData(true);
      }
    }, 30000); // Poll every 30 seconds
    
    return () => {
      clearInterval(pollInterval);
    };
  }, [fetchData, user?._id]);

  // Socket real-time updates
  useEffect(() => {
    if (!socket || !user?._id) return;

    console.log('📱 [WriterDashboard] Setting up socket listeners');
    socket.emit('joinUserRoom', user._id);

    const handleAgreementUpdated = (data) => {
      console.log('📱 [WriterDashboard] Agreement updated:', data);
      fetchData(true); // Refresh data
    };

    const handleNewAgreement = (data) => {
      console.log('📱 [WriterDashboard] New agreement received:', data);
      if (data.agreement && data.agreement.writerId === user._id) {
        // Add to pending agreements immediately for better UX
        setPendingAgreements(prev => [data.agreement, ...prev]);
        setAgreementBadgeCount(prev => prev + 1);
      }
      fetchData(true); // Refresh data
    };

    const handleAgreementAccepted = (data) => {
      console.log('📱 [WriterDashboard] Agreement accepted:', data);
      fetchData(true); // Refresh data
    };

    const handleAgreementCompleted = (data) => {
      console.log('📱 [WriterDashboard] Agreement completed:', data);
      fetchData(true); // Refresh data
    };

    const handlePaymentReceived = (data) => {
      console.log('📱 [WriterDashboard] Payment received:', data);
      fetchData(true); // Refresh data
    };

    // Socket event listeners
    socket.on('agreementUpdated', handleAgreementUpdated);
    socket.on('newAgreement', handleNewAgreement);
    socket.on('agreementAccepted', handleAgreementAccepted);
    socket.on('agreementCompleted', handleAgreementCompleted);
    socket.on('paymentReceived', handlePaymentReceived);

    return () => {
      socket.off('agreementUpdated', handleAgreementUpdated);
      socket.off('newAgreement', handleNewAgreement);
      socket.off('agreementAccepted', handleAgreementAccepted);
      socket.off('agreementCompleted', handleAgreementCompleted);
      socket.off('paymentReceived', handlePaymentReceived);
    };
  }, [socket, user?._id, fetchData]);

  const onRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const handleAcceptAgreement = async (agreementId) => {
    try {
      console.log('📱 [WriterDashboard] Accepting agreement:', agreementId);
      
      Alert.alert(
        'Accept Agreement',
        'Are you sure you want to accept this project?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Accept', 
            onPress: async () => {
              await acceptAssignment(agreementId);
              Alert.alert('Success', 'Agreement accepted successfully!');
              fetchData(true);
            }
          }
        ]
      );
    } catch (error) {
      console.error('📱 [WriterDashboard] Error accepting agreement:', error);
      Alert.alert('Error', 'Failed to accept agreement. Please try again.');
    }
  };

  const handleCompleteAssignment = async (agreementId) => {
    try {
      console.log('📱 [WriterDashboard] Completing assignment:', agreementId);
      
      Alert.alert(
        'Complete Assignment',
        'Are you sure you want to mark this assignment as completed?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Complete', 
            onPress: async () => {
              await completeAssignment(agreementId);
              Alert.alert('Success', 'Assignment completed successfully!');
              fetchData(true);
            }
          }
        ]
      );
    } catch (error) {
      console.error('📱 [WriterDashboard] Error completing assignment:', error);
      Alert.alert('Error', 'Failed to complete assignment. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'active': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatCurrencyDisplay = (amount, currencyType = 'usd') => {
    if (!amount && amount !== 0) return formatCurrency(0, currencyType);
    
    // Use the user's detected location for display
    const displayCurrency = userLocation?.countryCode === 'ng' ? 'ngn' : currencyType;
    const displayAmount = userLocation?.countryCode === 'ng' && currencyType === 'usd' 
      ? amount * 1500 // Convert USD to NGN for display
      : amount;
    
    return formatCurrency(displayAmount, displayCurrency);
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card style={[styles.statCard, { borderLeftColor: color }]}>
      <Card.Content style={styles.statCardContent}>
        <View style={styles.statCardLeft}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
      </Card.Content>
    </Card>
  );

  // Detailed Project Card Component for the detailed sections
  const DetailedProjectCard = ({ agreement, onAccept, onComplete, isWriter = false }) => {
    const agreementCurrency = getCurrencySymbol(agreement.currency || 'usd');
    const totalAmount = agreement.totalAmount || 0;
    const paidAmount = agreement.paidAmount || 0;
    const remainingAmount = totalAmount - paidAmount;
    const projectTitle = agreement.projectDetails?.title || 'Untitled Project';
    const projectSubject = agreement.projectDetails?.subject || 'General';
    const studentName = agreement.student?.name || 'Unknown Student';
    const dueDate = agreement.projectDetails?.deadline;
    const isCompleted = agreement.status === 'completed';
    const isPending = agreement.status === 'pending';
    
    return (
      <Card style={styles.detailedProjectCard}>
        <Card.Content>
          <View style={styles.detailedProjectHeader}>
            <View style={styles.projectInfo}>
              <Text style={styles.detailedProjectTitle}>{projectTitle}</Text>
              <Text style={styles.projectSubjectDetailed}>{projectSubject}</Text>
            </View>
          </View>

          <View style={styles.detailedProjectBody}>
            {/* Student Information */}
            <View style={styles.writerInfoDetailed}>
              <Ionicons name="person-circle-outline" size={16} color="#6b7280" />
              <Text style={styles.writerTextDetailed}>Student: {studentName}</Text>
            </View>

            {/* Payment Information */}
            <View style={styles.paymentSectionDetailed}>
              <View style={styles.paymentHeaderDetailed}>
                <Text style={styles.paymentTitleDetailed}>Payment Details</Text>
                <Text style={styles.paymentPercentageDetailed}>
                  {formatCurrency(totalAmount, agreementCurrency)}
                </Text>
              </View>
              <View style={styles.paymentDetailsDetailed}>
                <Text style={styles.paidAmountDetailed}>
                  Paid: {formatCurrency(paidAmount, agreementCurrency)}
                </Text>
                <Text style={styles.totalAmountDetailed}>
                  Remaining: {formatCurrency(remainingAmount, agreementCurrency)}
                </Text>
              </View>
            </View>

            {/* Timeline Information */}
            {isCompleted ? (
              <View style={styles.completionInfoDetailed}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.completionTextDetailed}>
                  Completed {getTimeAgo(agreement.completedAt || agreement.updatedAt)}
                </Text>
              </View>
            ) : dueDate ? (
              <View style={styles.dueDateInfoDetailed}>
                <Ionicons name="calendar" size={16} color={isOverdue(dueDate) ? '#ef4444' : '#6b7280'} />
                <Text style={[
                  styles.dueDateTextDetailed,
                  { color: isOverdue(dueDate) ? '#ef4444' : '#6b7280' }
                ]}>
                  {isOverdue(dueDate) 
                    ? `${Math.abs(getDaysUntilDate(dueDate))} days overdue`
                    : getDaysUntilDate(dueDate) === 0 
                      ? 'Due today'
                      : `${getDaysUntilDate(dueDate)} days left`
                  }
                </Text>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.actionButtonsDetailed}>
              <TouchableOpacity style={styles.viewButtonDetailed}>
                <Ionicons name="eye-outline" size={16} color="#015382" />
                <Text style={styles.buttonTextDetailed}>View Details</Text>
              </TouchableOpacity>
              
              {isPending && onAccept && (
                <TouchableOpacity 
                  style={styles.acceptButtonDetailed}
                  onPress={() => onAccept(agreement._id)}
                >
                  <Ionicons name="checkmark-outline" size={16} color="#10b981" />
                  <Text style={[styles.buttonTextDetailed, { color: '#10b981' }]}>Accept</Text>
                </TouchableOpacity>
              )}
              
              {agreement.status === 'active' && onComplete && (
                <TouchableOpacity 
                  style={styles.completeButtonDetailed}
                  onPress={() => onComplete(agreement._id)}
                >
                  <Ionicons name="checkmark-done-outline" size={16} color="#3b82f6" />
                  <Text style={[styles.buttonTextDetailed, { color: '#3b82f6' }]}>Complete</Text>
                </TouchableOpacity>
              )}
              
              {!isCompleted && (
                <TouchableOpacity style={styles.chatButtonDetailed}>
                  <Ionicons name="chatbubble-outline" size={16} color="#f59e0b" />
                  <Text style={[styles.buttonTextDetailed, { color: '#f59e0b' }]}>Chat</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const ProjectCard = ({ agreement, onAccept, onComplete }) => (
    <Card style={styles.projectCard}>
      <Card.Content>
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle}>
            {agreement.projectDetails?.title || 'Untitled Project'}
          </Text>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(agreement.status) }]}
            textStyle={{ color: 'white', fontSize: 12 }}
          >
            {agreement.status}
          </Chip>
        </View>
        
        <Text style={styles.projectSubject}>
          {agreement.projectDetails?.subject || 'General'}
        </Text>
        
        {agreement.student && (
          <View style={styles.studentInfo}>
            <Avatar.Text 
              size={32} 
              label={agreement.student.name?.charAt(0) || 'S'} 
              style={styles.studentAvatar}
            />
            <Text style={styles.studentName}>{agreement.student.name}</Text>
          </View>
        )}
        
        <View style={styles.projectFooter}>
          <Text style={styles.projectAmount}>
            {(() => {
              // Enhanced currency detection logic for mobile
              const getAgreementCurrency = () => {
                if (!agreement.paymentPreferences) return 'usd';
                
                const prefs = agreement.paymentPreferences;
                
                // If currency is explicitly set to NGN, use that
                if (prefs.currency === 'ngn') return 'ngn';
                
                // If it was created with Paystack (Nigerian gateway), likely NGN
                if (prefs.gateway === 'paystack') return 'ngn';
                
                // If nativeAmount exists and is different from totalAmount, and exchangeRate is 1, likely NGN
                if (prefs.nativeAmount && prefs.nativeAmount !== agreement.totalAmount && prefs.exchangeRate === 1) return 'ngn';
                
                // If nativeAmount is much larger than what would be normal USD (>5000), likely NGN
                if (prefs.nativeAmount && prefs.nativeAmount > 5000) return 'ngn';
                
                // Otherwise use the stated currency
                return prefs.currency || 'usd';
              };

              const detectedCurrency = getAgreementCurrency();
              return formatCurrency(agreement.totalAmount, detectedCurrency);
            })()}
          </Text>
          {agreement.progress !== undefined && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{agreement.progress}%</Text>
              <ProgressBar 
                progress={agreement.progress / 100} 
                color="#3b82f6" 
                style={styles.progressBar}
              />
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {agreement.status === 'pending' && (
            <Button 
              mode="contained" 
              onPress={() => onAccept(agreement._id)}
              style={[styles.actionButton, styles.acceptButton]}
              compact
            >
              Accept
            </Button>
          )}
          
          {agreement.status === 'active' && (
            <>
              <Button 
                mode="outlined" 
                onPress={() => console.log('Chat with student')}
                style={[styles.actionButton, styles.chatButton]}
                compact
              >
                Chat
              </Button>
              <Button 
                mode="contained" 
                onPress={() => onComplete(agreement._id)}
                style={[styles.actionButton, styles.completeButton]}
                compact
              >
                Complete
              </Button>
            </>
          )}
          
          {agreement.status === 'completed' && (
            <Button 
              mode="outlined" 
              onPress={() => console.log('View details')}
              style={[styles.actionButton]}
              compact
            >
              View Details
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  if (loading || currencyLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#015382" style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>
            {currencyLoading ? "Detecting your location..." : "Loading your dashboard..."}
          </Text>
          <Text style={styles.loadingSubtext}>
            {currencyLoading ? "Getting currency information" : "Fetching your projects and earnings"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name}!</Text>
              <Text style={styles.roleText}>Writer Dashboard</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={styles.ratingText}>Rating: {stats.rating}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.profileButton}>
                <Avatar.Text 
                  size={45} 
                  label={user?.name?.charAt(0) || 'W'} 
                  style={styles.profileAvatar}
                  labelStyle={styles.profileAvatarLabel}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStatItem}>
              <Ionicons name="flash-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.headerStatText}>
                {activeAgreements.length} Active
              </Text>
            </View>
            <View style={styles.headerStatItem}>
              <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.headerStatText}>
                {pendingAgreements.length} Pending
              </Text>
            </View>
            <View style={styles.headerStatItem}>
              <Ionicons name="wallet-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.headerStatText}>
                {formatCurrencyDisplay(stats.availableBalance)}
              </Text>
            </View>
          </View>
        </View>

        {/* Location Status */}
        {userLocation && !currencyLoading && (
          <Card style={styles.locationCard}>
            <Card.Content style={styles.locationContent}>
              <View style={styles.locationInfo}>
                <Text style={styles.locationFlag}>{userLocation.flag}</Text>
                <View style={styles.locationText}>
                  <Text style={styles.locationCountry}>{userLocation.displayName || userLocation.country}</Text>
                  <Text style={styles.locationCurrency}>
                    {userLocation.currencySymbol} {userLocation.currency?.toUpperCase()} • Native Pricing
                  </Text>
                </View>
              </View>
              <View style={styles.locationStatus}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.locationStatusText}>Detected</Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Earnings"
            value={formatCurrencyDisplay(stats.totalEarnings)}
            icon="wallet-outline"
            color="#10b981"
            subtitle="Lifetime earnings"
          />
          <StatCard
            title="Available Balance"
            value={formatCurrencyDisplay(stats.availableBalance)}
            icon="card-outline"
            color="#3b82f6"
            subtitle="Ready to withdraw"
          />
          <StatCard
            title="Pending Amount"
            value={formatCurrencyDisplay(stats.pendingAmount)}
            icon="time-outline"
            color="#f59e0b"
            subtitle="From active projects"
          />
          <StatCard
            title="Completed"
            value={stats.completedCount.toString()}
            icon="checkmark-circle-outline"
            color="#8b5cf6"
            subtitle="Finished projects"
          />
        </View>

        {/* Enhanced Projects Management */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Project Overview</Text>
            <TouchableOpacity onPress={() => fetchData(true)}>
              <Ionicons name="refresh" size={20} color="#015382" />
            </TouchableOpacity>
          </View>
          
          {/* Projects Summary */}
          <View style={styles.projectsSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryCount}>{pendingAgreements.length}</Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryCount}>{activeAgreements.length}</Text>
              <Text style={styles.summaryLabel}>Active</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryCount}>{completedAgreements.length}</Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Detailed Projects Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWithIcon}>
              <Ionicons name="briefcase-outline" size={20} color="#015382" />
              <Text style={styles.sectionTitle}>Project Management</Text>
            </View>
            <Text style={styles.projectCount}>
              {activeAgreements.length + pendingAgreements.length + completedAgreements.length} total
              </Text>
            </View>
            
          {/* Active Projects Detailed Section */}
          <Card style={styles.projectSection}>
            <Card.Content>
              <View style={styles.projectSectionHeader}>
                <View style={styles.projectSectionTitleRow}>
                  <Ionicons name="flash" size={18} color="#10b981" />
                  <Text style={styles.projectSectionTitle}>
                    Active Projects ({activeAgreements.length})
                  </Text>
                </View>
                {activeAgreements.length > 0 && (
                  <View style={styles.statusTag}>
                    <Text style={styles.statusTagText}>In Progress</Text>
                  </View>
                )}
              </View>
            
            {activeAgreements.length > 0 ? (
              <View style={styles.detailedProjectsList}>
                {activeAgreements.map((agreement) => (
                  <DetailedProjectCard 
                key={agreement._id} 
                agreement={agreement} 
                    onComplete={handleCompleteAssignment}
                    isWriter={true}
              />
            ))}
          </View>
            ) : (
              <View style={styles.emptySection}>
                <Ionicons name="document-outline" size={32} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No Active Projects</Text>
                <Text style={styles.emptySubtitle}>Your active projects will appear here</Text>
              </View>
            )}
            </Card.Content>
          </Card>

          {/* Pending Projects Detailed Section */}
          <Card style={styles.projectSection}>
            <Card.Content>
              <View style={styles.projectSectionHeader}>
                <View style={styles.projectSectionTitleRow}>
                  <Ionicons name="time" size={18} color="#f59e0b" />
                  <Text style={styles.projectSectionTitle}>
                    Pending Projects ({pendingAgreements.length})
              </Text>
                </View>
                {pendingAgreements.length > 0 && (
                  <View style={[styles.statusTag, { backgroundColor: '#fef3c7' }]}>
                    <Text style={[styles.statusTagText, { color: '#d97706' }]}>Waiting for Response</Text>
                  </View>
                )}
            </View>
            
            {pendingAgreements.length > 0 ? (
              <View style={styles.detailedProjectsList}>
                {pendingAgreements.map((agreement) => (
                  <DetailedProjectCard 
                key={agreement._id} 
                agreement={agreement} 
                    onAccept={handleAcceptAgreement}
                    isWriter={true}
              />
            ))}
          </View>
            ) : (
              <View style={styles.emptySection}>
                <Ionicons name="hourglass-outline" size={32} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No Pending Projects</Text>
                <Text style={styles.emptySubtitle}>New project requests will appear here</Text>
              </View>
            )}
            </Card.Content>
          </Card>

          {/* Completed Projects Detailed Section */}
          <Card style={styles.projectSection}>
            <Card.Content>
              <View style={styles.projectSectionHeader}>
                <View style={styles.projectSectionTitleRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#3b82f6" />
                  <Text style={styles.projectSectionTitle}>
                    Completed Projects ({completedAgreements.length})
                  </Text>
                </View>
                {completedAgreements.length > 0 && (
                  <View style={[styles.statusTag, { backgroundColor: '#dbeafe' }]}>
                    <Text style={[styles.statusTagText, { color: '#1d4ed8' }]}>Finished</Text>
                  </View>
                )}
          </View>
          
          {completedAgreements.length > 0 ? (
              <View style={styles.detailedProjectsList}>
                {completedAgreements.map((agreement) => (
                  <DetailedProjectCard 
                    key={agreement._id} 
                    agreement={agreement} 
                    isWriter={true}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptySection}>
                <Ionicons name="trophy-outline" size={32} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No Completed Projects</Text>
                <Text style={styles.emptySubtitle}>Completed projects will appear here</Text>
              </View>
            )}
              </Card.Content>
            </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButtonContainer}>
              <Ionicons name="search-outline" size={24} color="#015382" />
              <Text style={styles.actionText}>Find Projects</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButtonContainer}>
              <Ionicons name="chatbubbles-outline" size={24} color="#015382" />
              <Text style={styles.actionText}>Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButtonContainer}>
              <Ionicons name="person-outline" size={24} color="#015382" />
              <Text style={styles.actionText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#015382',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  locationCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
    borderRadius: 12,
  },
  locationContent: {
    paddingVertical: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationFlag: {
    fontSize: 32,
    marginRight: 12,
  },
  locationText: {
    flex: 1,
  },
  locationCountry: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  locationCurrency: {
    fontSize: 14,
    color: '#6b7280',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationStatusText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#015382',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ratingText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 4,
    fontWeight: '500',
  },
  profileButton: {
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileAvatar: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileAvatarLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  headerStatText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCardLeft: {
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#9ca3af',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#015382',
    fontWeight: '500',
  },
  projectCard: {
    marginBottom: 12,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    height: 24,
  },
  projectSubject: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentAvatar: {
    marginRight: 8,
    backgroundColor: '#015382',
  },
  studentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  progressContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  progressBar: {
    width: 80,
    height: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  chatButton: {
    borderColor: '#3b82f6',
  },
  completeButton: {
    backgroundColor: '#015382',
  },
  emptyCard: {
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  projectsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#015382',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  activeBadge: {
    backgroundColor: '#3b82f6',
  },
  pendingBadge: {
    backgroundColor: '#f59e0b',
  },
  completedBadge: {
    backgroundColor: '#10b981',
  },
  // Detailed Project Section Styles
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  projectSection: {
    marginTop: 12,
    borderRadius: 12,
    elevation: 2,
  },
  projectSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  projectSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#166534',
  },
  detailedProjectsList: {
    gap: 12,
  },
  detailedProjectCard: {
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailedProjectHeader: {
    marginBottom: 12,
  },
  detailedProjectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  projectSubjectDetailed: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  projectMeta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  projectId: {
    fontSize: 12,
    color: '#3b82f6',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailedProjectBody: {
    gap: 12,
  },
  writerInfoDetailed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  writerTextDetailed: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  paymentSectionDetailed: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  paymentHeaderDetailed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentTitleDetailed: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  paymentPercentageDetailed: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  paymentDetailsDetailed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  paidAmountDetailed: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  totalAmountDetailed: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  completionInfoDetailed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    padding: 8,
    borderRadius: 6,
  },
  completionTextDetailed: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
  },
  dueDateInfoDetailed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 6,
  },
  dueDateTextDetailed: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtonsDetailed: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  viewButtonDetailed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flex: 1,
    justifyContent: 'center',
    minWidth: 90,
  },
  acceptButtonDetailed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    flex: 1,
    justifyContent: 'center',
    minWidth: 90,
  },
  completeButtonDetailed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    flex: 1,
    justifyContent: 'center',
    minWidth: 90,
  },
  chatButtonDetailed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
    flex: 1,
    justifyContent: 'center',
    minWidth: 90,
  },
  buttonTextDetailed: {
    fontSize: 12,
    fontWeight: '500',
    color: '#015382',
  },
  emptySection: {
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  actionButtonContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    minWidth: 80,
  },
  actionText: {
    fontSize: 12,
    color: '#015382',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default WriterDashboard;
