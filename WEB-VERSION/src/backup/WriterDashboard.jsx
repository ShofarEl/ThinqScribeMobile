import React, { useEffect, useState, useCallback } from 'react';
import {
  Layout, 
  Card, 
  Table, 
  Tag, 
  Statistic, 
  Row, 
  Col, 
  Spin, 
  Badge, 
  Space, 
  notification, 
  Empty, 
  Typography, 
  Collapse, 
  Button, 
  Progress,
  Avatar,
  Tooltip,
  Timeline,
  Alert,
  Divider,
  Tabs,
  Modal
} from 'antd';
import {
  DollarOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  MessageOutlined, 
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  TrophyOutlined,
  StarOutlined,
  BankOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  BookOutlined,
  TeamOutlined,
  RiseOutlined,
  WalletOutlined,
  ProjectOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { agreementApi } from '../api/agreement';
import { paymentApi } from '../api/payment';
import { fetchWriterDashboardData, completeAssignment } from '../api/writerDashboard';
import { useNavigate, useLocation } from 'react-router-dom';
import HeaderComponent from '../components/HeaderComponent';
import ReviewAgreementModal from '../components/ReviewAgreementModal';
import CompleteAssignmentModal from '../components/CompleteAssignmentModal';
import AppLoader from '../components/AppLoader';
// Enhanced location and currency components
import { useCurrency } from '../hooks/useCurrency';
import moment from 'moment';
import './WriterDashboard.css';

const { Content } = Layout;
const { Panel } = Collapse;
const { Text, Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const WriterDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { socket } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const { convertToUSD, formatCurrency, location: userLocation } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [pendingAgreements, setPendingAgreements] = useState([]);
  const [activeAgreements, setActiveAgreements] = useState([]);
  const [completedAgreements, setCompletedAgreements] = useState([]);
  const [agreementBadgeCount, setAgreementBadgeCount] = useState(0);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Modal states for completion
  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [completing, setCompleting] = useState(false);

  const [stats, setStats] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingAmount: 0,
    completedCount: 0,
    activeCount: 0,
    pendingCount: 0,
    rating: 0,
    responseRate: 100
  });

  // Helper function to get agreement currency and convert for writer display
  const getWriterEarningsDisplay = (agreements) => {
    let totalEarningsUSD = 0;
    let availableBalanceUSD = 0;
    let pendingAmountUSD = 0;

    console.log('💰 [EARNINGS DEBUG] Starting calculation with platform fee REMOVED');
    console.log('💰 [EARNINGS DEBUG] Processing', agreements.length, 'agreements');

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

      console.log(`💰 [EARNINGS DEBUG] Agreement ${index + 1}:`, {
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

    console.log('💰 [EARNINGS DEBUG] FINAL CALCULATIONS:');
    console.log(`   - Total Earnings: $${totalEarningsUSD.toFixed(2)} USD`);
    console.log(`   - Available Balance: $${availableBalanceUSD.toFixed(2)} USD`);
    console.log(`   - Pending Amount: $${pendingAmountUSD.toFixed(2)} USD`);
    console.log('💰 [EARNINGS DEBUG] Platform fee has been REMOVED - writers get 100%');

    return {
      totalEarnings: totalEarningsUSD,
      availableBalance: availableBalanceUSD,
      pendingAmount: pendingAmountUSD
    };
  };

  const fetchData = useCallback(async (showRefreshIndicator = false, forceAgreementsAPI = false) => {
    if (!isAuthenticated || !user?._id) return;
    
    try {
      if (showRefreshIndicator) setRefreshing(true);
      else setLoading(true);
      
      console.log('🔄 Fetching writer dashboard data...', forceAgreementsAPI ? '(forced agreements API)' : '');
      
      // Always use agreements API for proper currency calculation
      console.log('🔄 Fetching agreements...');
      const agreementsData = await agreementApi.getAgreements();
      const agreements = Array.isArray(agreementsData) ? agreementsData : [];
      console.log('✅ Agreements fetched:', agreements.length);
      
      // Categorize agreements
      const pending = agreements.filter(a => a?.status === 'pending');
      const active = agreements.filter(a => a?.status === 'active');
      const completed = agreements.filter(a => a?.status === 'completed');
      
      console.log('📊 [fetchData] Final categorization:');
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
      setAgreementBadgeCount(pending.length);
      
      // Calculate proper writer earnings using currency conversion logic
      const writerEarnings = getWriterEarningsDisplay(agreements);
      
      console.log('💰 Writer earnings calculated:', writerEarnings);
      
      // Update stats with proper currency conversion
      setStats({
        totalEarnings: writerEarnings.totalEarnings,
        availableBalance: writerEarnings.availableBalance,
        pendingAmount: writerEarnings.pendingAmount,
        completedCount: completed.length,
        activeCount: active.length,
        pendingCount: pending.length,
        rating: 4.8, // Default rating
        responseRate: 98
      });
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      notification.error({
        message: 'Error Loading Dashboard',
        description: 'Unable to load dashboard data. Please try refreshing.',
        placement: 'bottomRight',
        duration: 6
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, user?._id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle refresh explicitly
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData(true, true); // Force fresh data from API
    setRefreshing(false);
  }, [fetchData]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !user?._id) return;

    console.log('🔌 Setting up socket listeners for writer dashboard');
    
    // Join writer room
    socket.emit('joinUserRoom', user._id);

    const handleNewAgreement = (data) => {
      console.log('📝 New agreement received:', data);
      
      // Add to pending agreements
      setPendingAgreements(prev => [data, ...prev]);
      setAgreementBadgeCount(prev => prev + 1);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingCount: prev.pendingCount + 1,
        pendingAmount: prev.pendingAmount + (data.totalAmount || 0)
      }));
      
      notification.success({
        message: 'New Project Available',
        description: `${data.projectDetails?.title || 'New project'} is available for review!`,
        placement: 'bottomRight',
        duration: 6
      });
    };

    const handleAgreementUpdated = (data) => {
      console.log('📝 Agreement updated:', data);
      fetchData(true);
    };

    const handleAgreementCompletedByMe = (data) => {
      console.log('✅ Agreement completed by me (socket):', data);
      console.log('🔍 [Socket] Completion data details:', {
        agreementId: data.agreementId,
        title: data.title,
        status: data.status,
        paidAmount: data.paidAmount,
        totalAmount: data.totalAmount
      });
      console.log('🔍 [Socket] BEFORE refresh - Current counts:', {
        active: activeAgreements.length,
        completed: completedAgreements.length,
        pending: pendingAgreements.length
      });
      
      // Always force refresh from backend to ensure accuracy
      console.log('🔄 [Socket] Refreshing data after completion confirmation...');
      fetchData(true, true); // Force agreements API for fresh data
      
      // Show confirmation notification
      notification.success({
        message: 'Completion Confirmed!',
        description: `"${data.title}" has been successfully completed. Payment has been processed.`,
        placement: 'bottomRight',
        duration: 8
      });
    };

    const handlePaymentReceived = (data) => {
      console.log('💰 Payment received:', data);
      
      // Update financial stats
      setStats(prev => ({
        ...prev,
        totalEarnings: prev.totalEarnings + (data.amount || 0),
        availableBalance: prev.availableBalance + (data.amount * 1.0 || 0) // Platform fee removed - writers get 100%
      }));
      
      notification.success({
        message: 'Payment Received',
        description: `You received $${data.amount?.toFixed(2)} for your work!`,
        placement: 'bottomRight',
        duration: 6
      });
      
      // Refresh data to ensure all stats are up to date
      fetchData(true);
    };

    // Set up socket listeners
    socket.on('newAgreement', handleNewAgreement);
    socket.on('agreementUpdated', handleAgreementUpdated);
    socket.on('agreementCompletedByMe', handleAgreementCompletedByMe);
    socket.on('paymentReceived', handlePaymentReceived);

    return () => {
      console.log('🔌 Cleaning up socket listeners');
      socket.off('newAgreement', handleNewAgreement);
      socket.off('agreementUpdated', handleAgreementUpdated);
      socket.off('agreementCompletedByMe', handleAgreementCompletedByMe);
      socket.off('paymentReceived', handlePaymentReceived);
    };
  }, [socket, user?._id, fetchData]);

  // Handle notification URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const showModal = params.get('modal');
    const agreementId = params.get('agreementId');
    
    if (showModal === 'review' && agreementId) {
      const agreement = pendingAgreements.find(a => a._id === agreementId);
      if (agreement) {
        setSelectedAgreement(agreement);
        setIsReviewModalVisible(true);
      }
    }
  }, [location.search, pendingAgreements]);

  const handleReviewAgreement = (agreement) => {
    setSelectedAgreement(agreement);
    setIsReviewModalVisible(true);
  };

  const handleAcceptAgreement = async (agreementId) => {
    console.log('✅ Attempting to accept agreement:', agreementId);
    setAccepting(true);
    
    try {
      const response = await agreementApi.acceptAgreement(agreementId);
      console.log('✅ Agreement accepted successfully:', response);
      
      // Update local state immediately for better UX
      setPendingAgreements(prev => prev.filter(a => a._id !== agreementId));
      setAgreementBadgeCount(prev => Math.max(0, prev - 1));
      
      // Move to active agreements
      const acceptedAgreement = pendingAgreements.find(a => a._id === agreementId);
      if (acceptedAgreement) {
        setActiveAgreements(prev => [
          { ...acceptedAgreement, status: 'active' },
          ...prev
        ]);
      }
      
      notification.success({
        message: 'Agreement Accepted',
        description: 'You can now start working on this project!',
        placement: 'bottomRight',
        duration: 6
      });
      
      setIsReviewModalVisible(false);
      
      // Refresh data after a short delay
      setTimeout(() => fetchData(true), 1500);
      
    } catch (err) {
      console.error('❌ Error accepting agreement:', err);
      notification.error({
        message: 'Failed to Accept Agreement',
        description: err.message || 'Please try again later.',
        placement: 'bottomRight',
        duration: 6
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleCancelAgreement = async (agreementId) => {
    try {
      setCancelling(true);
      setSelectedAgreement(prev => prev?._id === agreementId ? prev : null);
      
      console.log('🚫 [Dashboard] Cancelling agreement:', agreementId);
      
      const response = await agreementApi.cancelAgreement(agreementId);
      
      notification.success({
        message: 'Agreement Cancelled',
        description: 'The agreement has been cancelled successfully.',
        placement: 'topRight'
      });
      
      // Refresh data to reflect the cancellation
      await fetchData();
      
      // Close modal if open
      setIsReviewModalVisible(false);
      setSelectedAgreement(null);
      
    } catch (error) {
      console.error('❌ [Dashboard] Error cancelling agreement:', error);
      notification.error({
        message: 'Cancellation Failed', 
        description: error.message || 'Failed to cancel agreement. Please try again.',
        placement: 'topRight'
      });
    } finally {
      setCancelling(false);
    }
  };

  // URGENT COMPANY FIX - Simple completion function
  const handleCompleteAssignment = async (agreementId) => {
    console.log('🎯 [Dashboard] Assignment completion started:', agreementId);
    
    // Set the selected assignment and show modal
    setSelectedAssignmentId(agreementId);
    setIsCompleteModalVisible(true);
  };

  const handleModalCancel = () => {
    console.log('❌ [Modal] User cancelled completion');
    setIsCompleteModalVisible(false);
    setSelectedAssignmentId(null);
    setCompleting(false);
  };

  const handleModalConfirm = async () => {
    if (!selectedAssignmentId) return;

    let loadingNotification;
    
    try {
      setCompleting(true);
      
      // Find the agreement to show details
      const agreement = activeAgreements.find(a => a._id === selectedAssignmentId);
      const projectTitle = agreement?.projectDetails?.title || 'this assignment';
      
      // Show elegant loading notification
      loadingNotification = notification.open({
        message: '🔄 Processing Completion',
        description: `Marking "${projectTitle}" as completed...`,
        duration: 0,
        placement: 'topRight',
        style: {
          background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)',
          border: '1px solid #91d5ff',
          borderRadius: '12px'
        }
      });

      console.log('🔄 [Dashboard] Calling completeAssignment API...');
      console.log('🔍 [Dashboard] BEFORE completion - Active agreements:', activeAgreements.length);
      console.log('🔍 [Dashboard] BEFORE completion - Completed agreements:', completedAgreements.length);
      console.log('🔍 [Dashboard] Agreement to complete:', {
        id: selectedAssignmentId,
        title: activeAgreements.find(a => a._id === selectedAssignmentId)?.projectDetails?.title,
        currentStatus: activeAgreements.find(a => a._id === selectedAssignmentId)?.status
      });
      
      // Call API
      const response = await completeAssignment(selectedAssignmentId);
      console.log('✅ [Dashboard] Success:', response);
      console.log('🔍 [Dashboard] API Response Details:', {
        agreementId: response?.agreement?._id || response?._id,
        status: response?.agreement?.status || response?.status,
        completedAt: response?.agreement?.completedAt || response?.completedAt,
        progress: response?.agreement?.progress || response?.progress
      });
      
      console.log('🔍 [Dashboard] AFTER API call - About to update state...');
      
      // ✅ IMMEDIATE STATE UPDATE - Move agreement from active to completed
      const completedAgreement = activeAgreements.find(a => a._id === selectedAssignmentId);
      if (completedAgreement) {
        console.log('🔍 [Dashboard] Found agreement to move to completed:', {
          id: completedAgreement._id,
          title: completedAgreement.projectDetails?.title,
          currentStatus: completedAgreement.status
        });
        
        // Update the agreement status
        const updatedAgreement = {
          ...completedAgreement,
          status: 'completed',
          completedAt: new Date(),
          progress: 100
        };
        
        console.log('🔍 [Dashboard] Updated agreement object:', {
          id: updatedAgreement._id,
          status: updatedAgreement.status,
          completedAt: updatedAgreement.completedAt
        });
        
        // Remove from active agreements
        setActiveAgreements(prev => {
          const filtered = prev.filter(a => a._id !== selectedAssignmentId);
          console.log(`🔍 [Dashboard] Active agreements: ${prev.length} -> ${filtered.length}`);
          return filtered;
        });
        
        // Add to completed agreements
        setCompletedAgreements(prev => {
          const updated = [updatedAgreement, ...prev];
          console.log(`🔍 [Dashboard] Completed agreements: ${prev.length} -> ${updated.length}`);
          return updated;
        });
        
        // Update stats immediately
        setStats(prev => ({
          ...prev,
          activeCount: prev.activeCount - 1,
          completedCount: prev.completedCount + 1
        }));
        
        console.log('🔄 [Dashboard] Immediate state updated - moved to completed');
      } else {
        console.error('❌ [Dashboard] Could not find agreement to move to completed:', selectedAssignmentId);
      }
      
      // Close loading notification
      if (loadingNotification) {
        loadingNotification();
      }
      
      // Show beautiful success notification
      notification.success({
        message: '🎉 Assignment Completed Successfully!',
        description: (
          <div>
            <p style={{ margin: '8px 0 12px 0' }}>
              <strong>"{projectTitle}"</strong> has been marked as completed.
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#389e0d' }}>
              <span>✓ Payment processed</span>
              <span>✓ Student notified</span>
              <span>✓ Dashboard updating</span>
            </div>
          </div>
        ),
        placement: 'topRight',
        duration: 6,
        style: {
          background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9e7 100%)',
          border: '1px solid #b7eb8f',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(82, 196, 26, 0.12)'
        }
      });
      
      // Close modal and reset state
      setIsCompleteModalVisible(false);
      setSelectedAssignmentId(null);
      setCompleting(false);
      
      // Refresh dashboard
      console.log('🔄 [Dashboard] Refreshing dashboard...');
      setTimeout(() => {
        fetchData(true);
      }, 1000);
      
    } catch (error) {
      console.error('❌ [Dashboard] Completion failed:', error);
      
      // Close loading notification
      if (loadingNotification) {
        loadingNotification();
      }
      
      // Find the agreement to show details in error
      const agreement = activeAgreements.find(a => a._id === selectedAssignmentId);
      const projectTitle = agreement?.projectDetails?.title || 'this assignment';
      
      // Parse error message
      let errorMessage = 'Failed to complete assignment. Please try again.';
      let errorDetails = '';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        if (error.message.includes('not active')) {
          errorMessage = 'Assignment is not active';
          errorDetails = 'Only active assignments can be completed.';
        } else if (error.message.includes('not the assigned writer')) {
          errorMessage = 'Unauthorized';
          errorDetails = 'You are not the assigned writer for this project.';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Assignment not found';
          errorDetails = 'This assignment may have been deleted or completed already.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Show elegant error notification
      notification.error({
        message: '❌ Completion Failed',
        description: (
          <div>
            <p style={{ margin: '8px 0', fontWeight: '500' }}>{errorMessage}</p>
            {errorDetails && (
              <p style={{ margin: 0, fontSize: '14px', color: '#8c8c8c' }}>{errorDetails}</p>
            )}
          </div>
        ),
        placement: 'topRight',
        duration: 8,
        style: {
          background: 'linear-gradient(135deg, #fff2f0 0%, #fff1f0 100%)',
          border: '1px solid #ffaaa5',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(255, 77, 79, 0.12)'
        }
      });
      
      setCompleting(false);
    }
  };

  // Location Info Display
  const LocationInfoDisplay = () => {
    console.log('🌍 Currency Context Debug:', {
      currency,
      symbol,
      userLocation,
      exchangeRate,
      isUSD,
      countryName,
      cityName,
      currencyLoading
    });

    if (currencyLoading) {
      return (
        <Card style={{ marginBottom: '16px' }}>
          <Spin size="small" /> Loading location information...
        </Card>
      );
    }

    return (
      <Card style={{ marginBottom: '16px', background: '#f6ffed', borderColor: '#b7eb8f' }}>
        <Row gutter={16} align="middle">
          <Col>
            <Badge status="success" />
          </Col>
          <Col flex="auto">
            <Text strong>Location: </Text>
            <Text>{cityName}, {countryName}</Text>
            <Divider type="vertical" />
            <Text strong>Currency: </Text>
            <Text>{currency.toUpperCase()} ({symbol})</Text>
            {!isUSD && (
              <>
                <Divider type="vertical" />
                <Text strong>Exchange Rate: </Text>
                <Text>1 USD = {exchangeRate} {currency.toUpperCase()}</Text>
              </>
            )}
          </Col>
        </Row>
      </Card>
    );
  };

  // Replace the PremiumStatsCards component to fix loading issues
  const PremiumStatsCards = () => (
    <Row gutter={[32, 32]} className="mb-12">
      <Col xs={24} sm={12} lg={6}>
        <Card 
          className="premium-stats-card earnings-card"
          bodyStyle={{ padding: '36px 32px' }}
          style={{
            background: 'linear-gradient(135deg, #9333ea 0%, #9333eadd 100%)',
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 16px 48px #9333ea40',
            minHeight: '180px',
            transition: 'all 0.3s ease'
          }}
          hoverable
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '24px' 
          }}>
            <div style={{ flex: 1 }}>
              <Text 
                style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '16px', 
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '12px'
                }}
              >
                Total Earnings
              </Text>
              
              <div style={{ marginBottom: '8px' }}>
                <Text 
                  style={{ 
                    color: 'white', 
                    fontSize: 'clamp(28px, 6vw, 36px)', 
                    fontWeight: '700',
                    lineHeight: '1.2'
                  }}
                >
                  {formatCurrency(stats.totalEarnings, 'usd')}
                </Text>
              </div>
              
              <Text 
                style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  fontSize: '14px',
                  fontWeight: '400'
                }}
              >
                Lifetime revenue
              </Text>
            </div>
            
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: '16px', 
              padding: '16px',
              minWidth: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CrownOutlined style={{ fontSize: '28px', color: 'white' }} />
            </div>
          </div>
        </Card>
      </Col>
      
      <Col xs={24} sm={12} lg={6}>
        <Card 
          className="premium-stats-card earnings-card"
          bodyStyle={{ padding: '36px 32px' }}
          style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0ea5e9dd 100%)',
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 16px 48px #0ea5e940',
            minHeight: '180px',
            transition: 'all 0.3s ease'
          }}
          hoverable
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '24px' 
          }}>
            <div style={{ flex: 1 }}>
              <Text 
                style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '16px', 
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '12px'
                }}
              >
                Available Balance
              </Text>
              
              <div style={{ marginBottom: '8px' }}>
                <Text 
                  style={{ 
                    color: 'white', 
                    fontSize: 'clamp(28px, 6vw, 36px)', 
                    fontWeight: '700',
                    lineHeight: '1.2'
                  }}
                >
                  {formatCurrency(stats.availableBalance, 'usd')}
                </Text>
              </div>
              
              <Text 
                style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  fontSize: '14px',
                  fontWeight: '400'
                }}
              >
                Ready for withdrawal
              </Text>
            </div>
            
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: '16px', 
              padding: '16px',
              minWidth: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <WalletOutlined style={{ fontSize: '28px', color: 'white' }} />
            </div>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card 
          className="premium-stats-card balance-card"
          bodyStyle={{ padding: '36px 32px' }}
          style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 16px 48px rgba(14, 165, 233, 0.25)',
            minHeight: '180px',
            transition: 'all 0.3s ease'
          }}
          hoverable
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start' 
          }}>
            <div style={{ flex: 1 }}>
              <Text 
                style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '16px', 
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '12px'
                }}
              >
                Pending Earnings
              </Text>
              
              <div style={{ marginBottom: '8px' }}>
                <Text 
                  style={{ 
                    color: 'white', 
                    fontSize: 'clamp(28px, 6vw, 36px)', 
                    fontWeight: '700',
                    lineHeight: '1.2'
                  }}
                >
                  {formatCurrency(stats.pendingAmount, 'usd')}
                </Text>
              </div>
              
              <Text 
                style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  fontSize: '14px',
                  fontWeight: '400'
                }}
              >
                From active projects
              </Text>
            </div>
            
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: '16px', 
              padding: '16px',
              minWidth: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ClockCircleOutlined style={{ fontSize: '28px', color: 'white' }} />
            </div>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card 
          className="premium-stats-card projects-card"
          bodyStyle={{ padding: '36px 32px' }}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 16px 48px rgba(245, 158, 11, 0.25)',
            minHeight: '180px',
            transition: 'all 0.3s ease'
          }}
          hoverable
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start' 
          }}>
            <div style={{ flex: 1 }}>
              <Text 
                style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '16px', 
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '12px'
                }}
              >
                Completed Projects
              </Text>
              
              <div style={{ marginBottom: '8px' }}>
                <Text 
                  style={{ 
                    color: 'white', 
                    fontSize: 'clamp(28px, 6vw, 36px)', 
                    fontWeight: '700',
                    lineHeight: '1.2'
                  }}
                >
                  {stats.completedCount}
                </Text>
              </div>
              
              <Text 
                style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  fontSize: '14px',
                  fontWeight: '400'
                }}
              >
                Successfully delivered
              </Text>
            </div>
            
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: '16px', 
              padding: '16px',
              minWidth: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrophyOutlined style={{ fontSize: '28px', color: 'white' }} />
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );

  // Enhanced Project Details Table Columns
  const activeProjectsColumns = [
    {
      title: 'Project Information',
      dataIndex: ['projectDetails', 'title'],
      key: 'title',
      width: '30%',
      render: (title, record) => (
        <div className="project-info">
          <Title level={5} className="project-title">{title || 'Untitled Project'}</Title>
          <div className="project-meta">
            <Tag color="blue" className="project-id">ID: {record._id?.slice(-8)}</Tag>
            <Text type="secondary" className="project-subject">
              {record.projectDetails?.subject || 'General'}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Student Details',
      dataIndex: 'student',
      key: 'student',
      width: '20%',
      render: (student) => (
        <div className="student-info">
          <div className="student-avatar-section">
            <Avatar 
              size={40} 
              icon={<UserOutlined />} 
              src={student?.avatar}
              className="student-avatar"
            />
            <div className="student-details">
              <Text strong className="student-name">{student?.name || 'Unknown'}</Text>
              <Text type="secondary" className="student-email">
                {student?.email || 'No email'}
              </Text>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Payment Progress',
      key: 'paymentProgress',
      width: '25%',
      render: (_, record) => {
        // Calculate payment progress based on installments
        let paidInstallments = 0;
        let totalInstallments = 0;
        let paidAmount = 0;
        let totalAmount = record.totalAmount || 0;
        
        if (record.installments && record.installments.length > 0) {
          totalInstallments = record.installments.length;
          paidInstallments = record.installments.filter(inst => 
            inst.status === 'paid' || inst.status === 'processing'
          ).length;
          
          // Calculate actual paid amount from installments
          paidAmount = record.installments.reduce((sum, inst) => {
            return sum + (inst.status === 'paid' || inst.status === 'processing' ? inst.amount : 0);
          }, 0);
        } else {
          paidAmount = record.paidAmount || 0;
        }
        
        const unpaidAmount = totalAmount - paidAmount;
        const progressPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
        
        // Enhanced currency detection logic for writers - same as StudentDashboard
        const getAgreementCurrency = () => {
          if (!record.paymentPreferences) return 'usd';
          
          const prefs = record.paymentPreferences;
          
          // If currency is explicitly set to NGN, use that
          if (prefs.currency === 'ngn') return 'ngn';
          
          // If it was created with Paystack (Nigerian gateway), likely NGN
          if (prefs.gateway === 'paystack') return 'ngn';
          
          // If nativeAmount exists and is different from totalAmount, and exchangeRate is 1, likely NGN
          if (prefs.nativeAmount && prefs.nativeAmount !== totalAmount && prefs.exchangeRate === 1) return 'ngn';
          
          // If nativeAmount is much larger than what would be normal USD (>5000), likely NGN
          if (prefs.nativeAmount && prefs.nativeAmount > 5000) return 'ngn';
          
          // Otherwise use the stated currency
          return prefs.currency || 'usd';
        };

        const detectedCurrency = getAgreementCurrency();
        
        console.log('💱 [WriterDashboard] Agreement currency debug:', {
          agreementId: record._id?.slice(-8),
          title: record.projectDetails?.title,
          paymentPreferences: record.paymentPreferences,
          detectedCurrency,
          totalAmount,
          paidAmount,
          reasoning: record.paymentPreferences?.gateway === 'paystack' ? 'Paystack gateway' : 
                    record.paymentPreferences?.nativeAmount > 5000 ? 'Large nativeAmount' : 
                    record.paymentPreferences?.currency || 'default'
        });
        
        return (
          <div className="payment-progress">
            <div className="payment-amounts">
              <Text strong className="paid-amount">
                {formatCurrency(paidAmount, detectedCurrency)} paid
              </Text>
              <Text type="secondary" className="total-amount">
                of {formatCurrency(totalAmount, detectedCurrency)}
              </Text>
            </div>
            <Progress 
              percent={progressPercentage} 
              size="small" 
              status={progressPercentage === 100 ? 'success' : 'active'}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            {totalInstallments > 0 && (
              <Text type="secondary" className="installment-info">
                {paidInstallments} of {totalInstallments} installments paid
              </Text>
            )}
            {unpaidAmount > 0.01 && (
              <Text className="unpaid-amount" style={{ color: '#fa8c16', fontSize: '11px', fontWeight: '500' }}>
                Remaining: {formatCurrency(unpaidAmount, detectedCurrency)}
              </Text>
            )}
          </div>
        );
      }
    },
    {
      title: 'Timeline',
      key: 'timeline',
      width: '15%',
      render: (_, record) => {
        const dueDate = record.projectDetails?.deadline;
        
        // If the assignment is completed, show completion info instead of overdue
        if (record.status === 'completed') {
          const completedDate = record.completedAt || record.updatedAt;
          return (
            <div className="timeline-info">
              <div className="due-date">
                <CheckCircleOutlined className="calendar-icon" style={{ color: '#52c41a' }} />
                <Text className="date-text" style={{ color: '#52c41a', fontWeight: 600 }}>
                  {moment(completedDate).format('MMM DD')}
                </Text>
              </div>
              <Text type="secondary" className="days-info" style={{ fontSize: '12px' }}>
                Completed {moment(completedDate).fromNow()}
              </Text>
            </div>
          );
        }
        
        // For non-completed assignments, show regular deadline logic
        if (!dueDate) return <Text type="secondary">No deadline</Text>;
        
        const isOverdue = moment().isAfter(moment(dueDate));
        const daysUntilDue = moment(dueDate).diff(moment(), 'days');
        
        return (
          <div className="timeline-info">
            <div className="due-date">
              <CalendarOutlined className="calendar-icon" />
              <Text className={`date-text ${isOverdue ? 'overdue' : daysUntilDue <= 3 ? 'urgent' : 'normal'}`}>
                {moment(dueDate).format('MMM DD')}
              </Text>
            </div>
            <Text type="secondary" className="days-info">
              {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : 
               daysUntilDue === 0 ? 'Due today' :
               `${daysUntilDue} days left`}
            </Text>
          </div>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '22%',
      render: (_, record) => (
        <div className="action-buttons">
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="large"
              onClick={() => handleReviewAgreement(record)}
              loading={accepting && selectedAgreement?._id === record._id}
              className="review-button"
            >
              Review
            </Button>
          )}
          
          {record.status === 'active' && (
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<MessageOutlined />}
                size="large"
                onClick={() => navigate(`/chat/writer/${record.chatId}`)}
                disabled={!record.chatId}
                className="chat-button"
                block
              >
                Chat
              </Button>
              <Button
                type="default"
                icon={<CheckCircleOutlined />}
                size="large"
                onClick={() => handleCompleteAssignment(record._id)}
                className="complete-button"
                block
              >
                Mark Complete
              </Button>
            </Space>
          )}
          
          {record.status === 'completed' && (
            <Button
              icon={<EyeOutlined />}
              size="large"
              onClick={() => navigate(`/agreements/${record._id}`)}
              className="view-button"
            >
              View
            </Button>
          )}
        </div>
      )
    }
  ];

  // Debug function to clear cached data and force refresh
  const debugCurrentState = () => {
    console.log('🔍 [DEBUG] Current Writer Dashboard State:');
    console.log('   - Total Earnings:', stats.totalEarnings);
    console.log('   - Available Balance:', stats.availableBalance);
    console.log('   - Pending Amount:', stats.pendingAmount);
    console.log('   - Active Agreements:', activeAgreements.length);
    console.log('   - Completed Agreements:', completedAgreements.length);
    console.log('   - User Location:', userLocation);
    
    // Check localStorage for any cached values
    console.log('💾 [DEBUG] localStorage check:');
    console.log('   - edu_sage_total_spent:', localStorage.getItem('edu_sage_total_spent'));
    console.log('   - edu_sage_writer_earnings:', localStorage.getItem('edu_sage_writer_earnings'));
    console.log('   - edu_sage_writer_balance:', localStorage.getItem('edu_sage_writer_balance'));
  };

  const forceRefreshData = async () => {
    console.log('🔄 [FORCE REFRESH] Clearing all cached data and recalculating...');
    
    // Clear any cached earnings data from localStorage
    localStorage.removeItem('edu_sage_writer_earnings');
    localStorage.removeItem('edu_sage_writer_balance');
    localStorage.removeItem('edu_sage_total_spent');
    
    // Force refresh with agreements API (bypassing any cached dashboard data)
    await fetchData(true, true);
    
    notification.success({
      message: 'Data Refreshed',
      description: 'All earnings have been recalculated with platform fee removed!',
      placement: 'bottomRight',
      duration: 4
    });
  };

  // Make debug function available globally for testing
  window.debugWriterDashboard = debugCurrentState;

  return (
    <Layout className="writer-dashboard premium-layout">
      <HeaderComponent />
      
      <Content className="dashboard-content">
        <div className="dashboard-container">
          {/* Premium Header Section */}
          <div 
            className="dashboard-header premium-header"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              borderRadius: '20px',
              padding: '32px',
              marginBottom: '32px',
              color: 'white'
            }}
          >
            <div className="header-content">
              <div className="welcome-section">
                <Title 
                  level={1} 
                  style={{ 
                    color: 'white',
                    marginBottom: '8px',
                    fontSize: 'clamp(28px, 6vw, 42px)',
                    fontWeight: '800'
                  }}
                >
                  Welcome back, <span className="user-name">{user?.name}</span> 👋
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', marginBottom: 0 }}>
                  Manage your projects, track earnings, and grow your freelance business
                </Paragraph>
                
                {/* Location Status */}
                <div style={{ marginTop: '12px', padding: '8px 12px', background: userLocation ? '#f0f9ff' : '#fef2f2', borderRadius: '8px', border: `1px solid ${userLocation ? '#3b82f6' : '#ef4444'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EnvironmentOutlined style={{ color: userLocation ? '#3b82f6' : '#ef4444' }} />
                    {userLocation ? (
                      <Text style={{ fontSize: '14px', color: '#1e40af' }}>
                        {userLocation.flag} {userLocation.displayName || userLocation.country} • Earnings in USD (≈ {userLocation.currencySymbol} for reference)
                      </Text>
                    ) : (
                      <Text style={{ fontSize: '14px', color: '#1e40af' }}>
                        🇳🇬 Nigeria • Earnings in USD (≈ ₦ for reference)
                      </Text>
                    )}
                  </div>
                </div>
              </div>
              {/* Header Actions with Manual Refresh */}
              <div className="header-actions" style={{ marginBottom: '24px' }}>
                <Space size="large" wrap>
                  <Button 
                    type="primary" 
                    icon={<PlusCircleOutlined />}
                    onClick={() => navigate('/writers')}
                    size="large"
                    style={{
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      fontWeight: '600'
                    }}
                  >
                    Browse Projects
                  </Button>
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={refreshing}
                    size="large"
                    style={{
                      borderRadius: '12px',
                      height: 'clamp(40px, 8vw, 48px)',
                      paddingInline: 'clamp(16px, 4vw, 24px)'
                    }}
                  >
                    Refresh
                  </Button>
                  <Button 
                    type="dashed"
                    onClick={() => {
                      // Clear cached earnings data
                      localStorage.removeItem('edu_sage_writer_earnings');
                      localStorage.removeItem('edu_sage_writer_balance');
                      localStorage.removeItem('edu_sage_total_spent');
                      
                      console.log('🔄 Force refreshing writer dashboard with platform fee removed...');
                      fetchData(true, true);
                      
                      notification.success({
                        message: 'Earnings Recalculated',
                        description: 'Platform fee removed - you now get 100% of earnings!',
                        placement: 'bottomRight',
                        duration: 4
                      });
                    }}
                    loading={refreshing}
                    size="large"
                    style={{
                      borderRadius: '12px',
                      borderColor: '#52c41a',
                      color: '#52c41a',
                      fontWeight: '600'
                    }}
                  >
                    🎉 Fix Earnings (100%)
                  </Button>
                </Space>
              </div>
            </div>
          </div>

          {/* Premium Stats Cards */}
          <PremiumStatsCards />

          {/* Writer Earnings Info */}
          {userLocation && (
            <Card className="earnings-info-card" style={{ marginBottom: '32px' }}>
              <Row gutter={[24, 16]} align="middle">
                <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                    {userLocation.flag}
                  </div>
                  <Text strong style={{ fontSize: '16px', display: 'block' }}>
                    {userLocation.displayName}
                  </Text>
                </Col>
                <Col xs={24} sm={16}>
                  <div>
                    <Title level={4} style={{ marginBottom: '12px', color: '#1f2937' }}>
                      <DollarOutlined style={{ marginRight: '8px', color: '#667eea' }} />
                      Earnings Information
                    </Title>
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong style={{ color: '#52c41a' }}>✓ All earnings processed in USD</Text>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong style={{ color: '#52c41a' }}>✓ Local currency conversion shown for reference</Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      Your earnings are standardized in USD for global consistency. 
                      Local currency amounts help you understand the value in your region.
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          )}

          {/* Projects Management Section */}
          <Card className="projects-section premium-card">
            <div className="section-header">
              <Title level={2} className="section-title">
                <ProjectOutlined className="section-icon" />
                Project Management
              </Title>
              <Text type="secondary" className="section-subtitle">
                Manage your active and pending projects
              </Text>
            </div>

            <Tabs defaultActiveKey="active" className="premium-tabs">
              <TabPane 
                tab={
                  <span>
                    <ThunderboltOutlined />
                    Active Projects ({activeAgreements.length})
                  </span>
                } 
                key="active"
              >
                <Table
                  columns={activeProjectsColumns}
                  dataSource={activeAgreements}
                  rowKey="_id"
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  className="premium-table"
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No active projects yet"
                      />
                    )
                  }}
                />
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <ClockCircleOutlined />
                    Pending Review ({pendingAgreements.length})
                    {agreementBadgeCount > 0 && (
                      <Badge count={agreementBadgeCount} size="small" />
                    )}
                  </span>
                } 
                key="pending"
              >
                <Table
                  columns={activeProjectsColumns}
                  dataSource={pendingAgreements}
                  rowKey="_id"
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  className="premium-table"
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No pending projects"
                      />
                    )
                  }}
                />
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <CheckCircleOutlined />
                    Completed ({completedAgreements.length})
                  </span>
                } 
                key="completed"
              >
                <Table
                  columns={activeProjectsColumns}
                  dataSource={completedAgreements}
                  rowKey="_id"
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  className="premium-table"
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No completed projects yet"
                      />
                    )
                  }}
                />
              </TabPane>
            </Tabs>
          </Card>
        </div>

        {/* Review Agreement Modal */}
        <ReviewAgreementModal
          visible={isReviewModalVisible}
          agreement={selectedAgreement}
          onClose={() => {
            setIsReviewModalVisible(false);
            setSelectedAgreement(null);
          }}
          onAccept={handleAcceptAgreement}
          onCancel={handleCancelAgreement}
          loading={accepting}
        />

        {/* Complete Assignment Modal */}
        <CompleteAssignmentModal
          visible={isCompleteModalVisible}
          onClose={handleModalCancel}
          onConfirm={handleModalConfirm}
          projectTitle={
            selectedAssignmentId 
              ? activeAgreements.find(a => a._id === selectedAssignmentId)?.projectDetails?.title || 'this assignment'
              : 'this assignment'
          }
          loading={completing}
        />
      </Content>
    </Layout>
  );
};

export default WriterDashboard;