// ThinqScribe/src/screens/StudentDashboard.js
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Avatar, Button, Card, ProgressBar } from 'react-native-paper';
import { agreementApi } from '../api/agreement';
import { startChat } from '../api/chat';
import { fetchStudentDashboardData, getRecommendedWriters } from '../api/user';
import CreateAgreementModal from '../components/CreateAgreementModal';
import { useAuth } from '../context/MobileAuthContext';
import { useCurrency } from '../hooks/useCurrency';
import { formatCurrency } from '../utils/currencyUtils';
import { getCurrentMonth, getCurrentYear, getDaysUntilDate, getTimeAgo, isOverdue } from '../utils/dateUtils';

// Import premium design system
import { colors, shadows, spacing } from '../styles/designSystem';
import {
  premiumAvatars,
  premiumCards,
  premiumLayout,
  premiumStatus,
  premiumText
} from '../styles/premiumComponents';

// Socket for real-time updates (if available)
let socket = null;
try {
  // Try to import socket if available
  const { useNotifications } = require('../context/NotificationContext');
  socket = useNotifications?.socket;
} catch (error) {
  console.log('📱 [StudentDashboard] Socket not available in mobile, using polling instead');
}

const { width } = Dimensions.get('window');

const StudentDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Generate fallback avatar URL
  const getFallbackAvatar = () => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=015382&textColor=ffffff`;
  };
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
  const [recommendedWriters, setRecommendedWriters] = useState([]);
  const [agreementBadgeCount, setAgreementBadgeCount] = useState(0);
  
  // Modal states
  const [showCreateAgreementModal, setShowCreateAgreementModal] = useState(false);
  const [selectedWriter, setSelectedWriter] = useState(null);
  const [creatingAgreement, setCreatingAgreement] = useState(false);
  
  const [stats, setStats] = useState({
    totalSpent: 0,
    pendingPayments: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalProjects: 0,
    averageRating: 0,
    moneySpentThisMonth: 0,
    projectsThisMonth: 0
  });

  // Helper function for enhanced currency detection - MOBILE VERSION
  const getAgreementCurrency = (agreement) => {
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

  // Calculate monthly spending from agreements - IMPROVED MOBILE VERSION  
  const calculateMonthlySpending = (agreementsList) => {
    const currentMonth = getCurrentMonth();
    const currentYear = getCurrentYear();
    
    let monthlySpent = 0;
    
    agreementsList.forEach(agreement => {
      if (agreement.paidAmount > 0) {
        // Check if this is a Nigerian agreement (paid in NGN)
        const isNigerianAgreement = agreement?.paymentPreferences?.currency === 'ngn' || 
                                   agreement?.originalCurrency === 'ngn' ||
                                   agreement?.currency === 'ngn';
        
        // IMPROVED: Check installments for payments made this month
        if (agreement.installments && agreement.installments.length > 0) {
          agreement.installments.forEach(installment => {
            if (installment.status === 'paid') {
              // Check if payment was made this month
              const paymentDate = installment.paymentDate || installment.paidDate;
              if (paymentDate) {
                const pDate = new Date(paymentDate);
                if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
                  const amount = installment.amount || 0;
                  const agreementCurrency = getAgreementCurrency(agreement);
                  
                  // Convert based on user location (default to Nigerian conversion if location not loaded yet)
                  const isNigerian = userLocation?.countryCode === 'ng' || !userLocation; // Default to Nigerian if location not loaded
                  if (isNigerian) {
                    if (agreementCurrency === 'usd') {
                      monthlySpent += amount * 1500; // Convert USD to NGN
                    } else {
                      monthlySpent += amount; // Keep NGN as is
                    }
                  } else {
                    monthlySpent += amount; // For non-Nigerian users, use as is
                  }
                }
              } else {
                // If no specific payment date, use the agreement's completion date
                const completionDate = new Date(agreement.completedAt || agreement.updatedAt);
                if (completionDate.getMonth() === currentMonth && completionDate.getFullYear() === currentYear) {
                  const amount = installment.amount || 0;
                  const agreementCurrency = getAgreementCurrency(agreement);
                  
                  // Convert based on user location (default to Nigerian conversion if location not loaded yet)
                  const isNigerian = userLocation?.countryCode === 'ng' || !userLocation; // Default to Nigerian if location not loaded
                  if (isNigerian) {
                    if (agreementCurrency === 'usd') {
                      monthlySpent += amount * 1500; // Convert USD to NGN
                    } else {
                      monthlySpent += amount; // Keep NGN as is
                    }
                  } else {
                    monthlySpent += amount; // For non-Nigerian users, use as is
                  }
                }
              }
            }
          });
        } else {
          // If no installments, check if the agreement was completed/paid this month
          const relevantDate = new Date(agreement.completedAt || agreement.updatedAt || agreement.createdAt);
          if (relevantDate.getMonth() === currentMonth && relevantDate.getFullYear() === currentYear) {
            const agreementCurrency = getAgreementCurrency(agreement);
            
            // Convert based on user location (default to Nigerian conversion if location not loaded yet)
            const isNigerian = userLocation?.countryCode === 'ng' || !userLocation; // Default to Nigerian if location not loaded
            if (isNigerian) {
              if (agreementCurrency === 'usd') {
                monthlySpent += agreement.paidAmount * 1500; // Convert USD to NGN
              } else {
                monthlySpent += agreement.paidAmount; // Keep NGN as is
              }
            } else {
              monthlySpent += agreement.paidAmount; // For non-Nigerian users, use as is
            }
          }
        }
      }
    });
    
    console.log('💰 [Mobile Dashboard] Monthly spending calculated:', {
      currentMonth: currentMonth + 1, // +1 for human-readable month
      currentYear,
      monthlySpent,
      agreementsChecked: agreementsList.length,
      userLocation: userLocation?.countryCode
    });
    
    return monthlySpent;
  };

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('📱 [StudentDashboard] Fetching data...');

      // Fetch dashboard data and agreements in parallel
      const [dashboardResponse, agreementsResponse, writersResponse] = await Promise.all([
        fetchStudentDashboardData().catch(err => {
          console.warn('Dashboard API failed:', err);
          return null;
        }),
        agreementApi.getAgreements().catch(err => {
          console.warn('Agreements API failed:', err);
          return [];
        }),
        getRecommendedWriters().catch(err => {
          console.warn('Writers API failed:', err);
          return [];
        })
      ]);

      console.log('📱 [StudentDashboard] Data received:', {
        dashboard: dashboardResponse,
        agreements: agreementsResponse?.length || 0,
        writers: writersResponse?.length || 0
      });

      // Process agreements FIRST
      const agreementsList = Array.isArray(agreementsResponse) ? agreementsResponse : [];
      setAgreements(agreementsList);
      
      // Categorize agreements by status
      const pending = agreementsList.filter(a => a?.status === 'pending');
      const active = agreementsList.filter(a => a?.status === 'active');
      const completed = agreementsList.filter(a => a?.status === 'completed');
      
      setPendingAgreements(pending);
      setActiveAgreements(active);
      setCompletedAgreements(completed);
      setAgreementBadgeCount(pending.length + active.length);
      
      setDashboardData(dashboardResponse);
      setRecommendedWriters(Array.isArray(writersResponse) ? writersResponse : []);

      // Calculate financial data with proper currency conversion
      const calculatedPendingPayments = [...pending, ...active].reduce((sum, agreement) => {
        const pendingAmount = agreement?.installments?.reduce((total, installment) => {
          if (installment.status !== 'processing' && installment.status !== 'paid') {
            const agreementCurrency = getAgreementCurrency(agreement);
            const amount = installment.amount || 0;
            
            const isNigerian = userLocation?.countryCode === 'ng' || !userLocation;
            if (isNigerian) {
              if (agreementCurrency === 'usd') {
                return total + (amount * 1500);
              } else {
                return total + amount;
              }
            } else {
              return total + amount;
            }
          }
          return total;
        }, 0) || 0;
        return sum + pendingAmount;
      }, 0);
      
      // Calculate total spent from agreements
      let totalPaidAmount = 0;
      agreementsList.forEach(agreement => {
        let amountToAdd = 0;
        if (agreement.paidAmount && typeof agreement.paidAmount === 'number') {
          amountToAdd = agreement.paidAmount;
        } else if (agreement.status === 'completed' && agreement.totalAmount) {
          amountToAdd = agreement.totalAmount;
        } else if (agreement.installments) {
          amountToAdd = agreement.installments.reduce((sum, inst) => {
            if (inst.status === 'paid' || inst.status === 'processing') {
              return sum + (inst.amount || 0);
            }
            return sum;
          }, 0);
        }

        if (amountToAdd > 0) {
          const agreementCurrency = getAgreementCurrency(agreement);
          
          const isNigerian = userLocation?.countryCode === 'ng' || !userLocation;
          if (isNigerian) {
            if (agreementCurrency === 'usd') {
              totalPaidAmount += amountToAdd * 1500;
            } else {
              totalPaidAmount += amountToAdd;
            }
          } else {
            totalPaidAmount += amountToAdd;
          }
        }
      });
      
      // Calculate monthly spending
      const monthlySpending = calculateMonthlySpending(agreementsList);
      
      // Update stats with calculated values
      setStats({
        totalSpent: totalPaidAmount,
        pendingPayments: calculatedPendingPayments,
        activeProjects: active.length,
        completedProjects: completed.length,
        totalProjects: agreementsList.length,
        averageRating: dashboardResponse?.averageRating || 0,
        moneySpentThisMonth: monthlySpending,
        projectsThisMonth: dashboardResponse?.projectsThisMonth || active.length
      });

    } catch (error) {
      console.error('📱 [StudentDashboard] Error fetching data:', error);
      Alert.alert(
        'Error',
        'Failed to load dashboard data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userLocation]);

  useEffect(() => {
    fetchData();
    
    // Set up polling for real-time updates since socket may not be available in mobile
    const pollInterval = setInterval(() => {
      // Only poll if the app is in the foreground and user is authenticated
      if (user?._id) {
        console.log('📱 [StudentDashboard] Polling for updates...');
        fetchData(true);
      }
    }, 30000); // Poll every 30 seconds
    
    return () => {
      clearInterval(pollInterval);
    };
  }, [fetchData, user?._id]);

  const onRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Create Agreement Modal Handlers
  const handleCreateAgreementWithWriter = (writer) => {
    console.log('📱 [StudentDashboard] Creating agreement with writer:', writer.name);
    setSelectedWriter(writer);
    setShowCreateAgreementModal(true);
  };

  // Chat Handler
  const handleChat = async (writerId) => {
    try {
      console.log('📱 [StudentDashboard] Starting chat with writer:', writerId);
      const chat = await startChat(writerId);
      if (chat && chat._id) {
        router.push(`/chat/${chat._id}`);
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
      Alert.alert('Error', 'Failed to start chat. Please try again.');
    }
  };

  // Fixed navigation handler for Writers List - Using Expo Router
  const navigateToWritersList = () => {
    try {
      console.log('🔍 [Expo Router Debug] Attempting to navigate to Writers');
      console.log('🔍 [Expo Router Debug] Router type:', typeof router);
      console.log('🔍 [Expo Router Debug] Router methods:', Object.keys(router));

      // Use Expo Router to navigate to writers page
      console.log('🔄 [Expo Router Debug] Navigating to /writers');
      router.push('/writers');
      console.log('✅ [Expo Router Debug] Navigation to writers succeeded');

    } catch (error) {
      console.error('❌ [Expo Router Debug] Navigation failed:', error);
      console.error('❌ [Expo Router Debug] Error details:', error.message);

      // Fallback: Try alternative navigation method
      try {
        console.log('🔄 [Expo Router Debug] Trying router.navigate()');
        router.navigate('/writers');
        console.log('✅ [Expo Router Debug] router.navigate() succeeded');

      } catch (navigateError) {
        console.error('❌ [Expo Router Debug] router.navigate() also failed:', navigateError);

        // Last resort: Show error
        Alert.alert(
          'Navigation Error',
          `Unable to navigate to writers list.\n\nError: ${error.message}\n\nPlease check if the writers page exists.`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleCreateAgreement = async (agreementData) => {
    try {
      setCreatingAgreement(true);
      console.log('📱 [StudentDashboard] Creating agreement:', agreementData);

      const result = await agreementApi.createAgreement(agreementData);
      console.log('📱 [StudentDashboard] Agreement created successfully:', result);

      // Close modal and reset state
      setShowCreateAgreementModal(false);
      setSelectedWriter(null);

      // Refresh dashboard data
      await fetchData();

      Alert.alert(
        'Success! 🎉',
        `Agreement created successfully!\n\nThe writer will be notified and can accept your project proposal. You'll receive updates on your dashboard.`,
        [
          {
            text: 'OK',
            onPress: () => console.log('Agreement creation acknowledged')
          }
        ]
      );

    } catch (error) {
      console.error('📱 [StudentDashboard] Error creating agreement:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create agreement. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setCreatingAgreement(false);
    }
  };

  const handleCloseCreateAgreementModal = () => {
    setShowCreateAgreementModal(false);
    setSelectedWriter(null);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'active': return 'flash-outline';
      case 'completed': return 'checkmark-circle-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const formatCurrencyDisplay = (amount, currencyType = 'ngn') => {
    if (!amount && amount !== 0) return formatCurrency(0, currencyType);
    
    // Use the user's detected location for display
    const displayCurrency = userLocation?.countryCode === 'ng' ? 'ngn' : currencyType;
    const displayAmount = amount; // Already converted in calculations
    
    return formatCurrency(displayAmount, displayCurrency);
  };

  const StatCard = ({ title, value, icon, color, subtitle, type = 'primary' }) => {
    return (
      <Card style={styles.statCard}>
        <LinearGradient
          colors={
            type === 'success' ? ['#10b981', '#059669'] :
            type === 'warning' ? ['#f59e0b', '#d97706'] :
            type === 'info' ? ['#0ea5e9', '#06b6d4'] :
            type === 'completed' ? ['#7c3aed', '#8b5cf6'] :
            ['#1e3a8a', '#3b82f6'] // primary
          }
          style={styles.statCardGradient}
        >
          <View style={styles.statCardContent}>
            <View style={styles.statCardLeft}>
              <Text style={styles.statCardTitle}>
                {title}
              </Text>
              <Text style={styles.statCardValue}>
                {value}
              </Text>
              {subtitle && (
                <Text style={styles.statCardSubtitle}>
                  {subtitle}
                </Text>
              )}
            </View>
            <View style={styles.statCardIcon}>
              <Ionicons name={icon} size={20} color={colors.white} />
            </View>
          </View>
        </LinearGradient>
      </Card>
    );
  };

  // Detailed Project Card Component for the detailed sections
  const DetailedProjectCard = ({ agreement }) => {
    const agreementCurrency = getAgreementCurrency(agreement);
    const totalAmount = agreement.totalAmount || 0;
    const paidAmount = agreement.paidAmount || 0;
    const remainingAmount = totalAmount - paidAmount;
    const projectTitle = agreement.projectDetails?.title || 'Untitled Project';
    const projectSubject = agreement.projectDetails?.subject || 'General';
    const writerName = agreement.writer?.name || 'Unassigned';
    const dueDate = agreement.projectDetails?.deadline;
    const isCompleted = agreement.status === 'completed';
    
    return (
      <Card style={styles.detailedProjectCard}>
        <Card.Content style={{ backgroundColor: colors.white }}>
          <View style={styles.detailedProjectHeader}>
            <View style={styles.projectInfo}>
              <Text style={styles.detailedProjectTitle}>{projectTitle}</Text>
              <Text style={styles.projectSubjectDetailed}>{projectSubject}</Text>
            </View>
          </View>

          <View style={styles.detailedProjectBody}>
            {/* Writer Information */}
            <View style={styles.writerInfoDetailed}>
              <Ionicons name="person-circle-outline" size={16} color="#6b7280" />
              <Text style={styles.writerTextDetailed}>Writer: {writerName}</Text>
            </View>

            {/* Payment Progress */}
            <View style={styles.paymentSectionDetailed}>
              <View style={styles.paymentHeaderDetailed}>
                <Text style={styles.paymentTitleDetailed}>Payment Progress</Text>
                <Text style={styles.paymentPercentageDetailed}>
                  {totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}%
                </Text>
              </View>
              <ProgressBar 
                progress={totalAmount > 0 ? paidAmount / totalAmount : 0} 
                color="#10b981" 
                style={styles.progressBarDetailed}
              />
              <View style={styles.paymentDetailsDetailed}>
                <Text style={styles.paidAmountDetailed}>
                  Paid: {formatCurrency(paidAmount, agreementCurrency)}
                </Text>
                <Text style={styles.totalAmountDetailed}>
                  Total: {formatCurrency(totalAmount, agreementCurrency)}
                </Text>
              </View>
              {remainingAmount > 0 && (
                <Text style={styles.remainingAmountDetailed}>
                  Remaining: {formatCurrency(remainingAmount, agreementCurrency)}
                </Text>
              )}
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
              {!isCompleted && (
                <TouchableOpacity style={styles.chatButtonDetailed}>
                  <Ionicons name="chatbubble-outline" size={16} color="#10b981" />
                  <Text style={[styles.buttonTextDetailed, { color: '#10b981' }]}>Chat</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const ProjectCard = ({ agreement }) => {
    const getCardStyle = (status) => {
      switch (status) {
        case 'active':
          return premiumCards.projectCardActive;
        case 'pending':
          return premiumCards.projectCardPending;
        case 'completed':
          return premiumCards.projectCardCompleted;
        default:
          return {};
      }
    };

    return (
      <View style={[premiumCards.projectCard, getCardStyle(agreement.status)]}>
        <View style={styles.projectHeader}>
          <Text style={[premiumText.headingSmall, { flex: 1, marginRight: spacing.md }]}>
            {agreement.projectDetails?.title || 'Untitled Project'}
          </Text>
          <View style={[
            premiumStatus.badge,
            agreement.status === 'active' && premiumStatus.badgePrimary,
            agreement.status === 'pending' && premiumStatus.badgeWarning,
            agreement.status === 'completed' && premiumStatus.badgeSuccess,
          ]}>
            <Text style={[
              premiumStatus.badgeText,
              agreement.status === 'active' && premiumStatus.badgeTextPrimary,
              agreement.status === 'pending' && premiumStatus.badgeTextWarning,
              agreement.status === 'completed' && premiumStatus.badgeTextSuccess,
            ]}>
              {agreement.status.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <Text style={[premiumText.bodyMedium, { marginBottom: spacing.md, color: colors.neutral[500] }]}>
          {agreement.projectDetails?.subject || 'General'}
        </Text>
        
        {agreement.writer && (
          <View style={[styles.writerInfo, { marginBottom: spacing.md }]}>
            <View style={[premiumAvatars.container, premiumAvatars.small, { marginRight: spacing.sm }]}>
            <Avatar.Text 
              size={32} 
              label={agreement.writer.name?.charAt(0) || 'W'} 
                style={{ backgroundColor: colors.primary[500] }}
            />
            </View>
            <Text style={[premiumText.bodySemibold, { color: colors.neutral[700] }]}>
              {agreement.writer.name}
            </Text>
          </View>
        )}
        
        {/* Payment Progress */}
        <View style={styles.paymentProgress}>
          {(() => {
            // Calculate payment progress based on installments
            let paidInstallments = 0;
            let totalInstallments = 0;
            let paidAmount = 0;
            let totalAmount = agreement.totalAmount || 0;
            
            if (agreement.installments && agreement.installments.length > 0) {
              totalInstallments = agreement.installments.length;
              paidInstallments = agreement.installments.filter(inst => 
                inst.status === 'paid' || inst.status === 'processing'
              ).length;
              
              // Calculate actual paid amount from installments
              paidAmount = agreement.installments.reduce((sum, inst) => {
                return sum + (inst.status === 'paid' || inst.status === 'processing' ? inst.amount : 0);
              }, 0);
            } else {
              paidAmount = agreement.paidAmount || 0;
            }
            
            const unpaidAmount = totalAmount - paidAmount;
            const progressPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
            const isFullyPaid = unpaidAmount <= 0.01;
            
            // Enhanced currency detection logic
            const detectedCurrency = getAgreementCurrency(agreement);
            
            return (
              <View>
                <View style={styles.paymentAmounts}>
                  <Text style={styles.paidAmount}>
                    {formatCurrency(paidAmount, detectedCurrency)} paid
                  </Text>
                  <Text style={styles.totalAmount}>
                    of {formatCurrency(totalAmount, detectedCurrency)}
                  </Text>
                </View>
                <ProgressBar 
                  progress={progressPercentage / 100} 
                  color={isFullyPaid ? "#10b981" : "#3b82f6"} 
                  style={styles.progressBar}
                />
                {totalInstallments > 0 && (
                  <Text style={styles.installmentInfo}>
                    {paidInstallments} of {totalInstallments} installments paid
                  </Text>
                )}
                {!isFullyPaid && unpaidAmount > 0 && (
                  <Text style={styles.unpaidAmount}>
                    Remaining: {formatCurrency(unpaidAmount, detectedCurrency)}
                  </Text>
                )}
              </View>
            );
          })()}
        </View>
        
        {/* Timeline */}
        <View style={styles.timeline}>
          {(() => {
            const dueDate = agreement.projectDetails?.deadline;
            
            // If the assignment is completed, show completion info instead of overdue
            if (agreement.status === 'completed') {
              const completedDate = agreement.completedAt || agreement.updatedAt;
              return (
                <View style={styles.timelineInfo}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={[styles.timelineText, { color: '#10b981' }]}>
                    Completed {getTimeAgo(completedDate)}
                  </Text>
                </View>
              );
            }
            
            // For non-completed assignments, show regular deadline logic
            if (!dueDate) return (
              <View style={styles.timelineInfo}>
                <Ionicons name="calendar" size={16} color="#6b7280" />
                <Text style={styles.timelineText}>No deadline set</Text>
              </View>
            );
            
            const isOverdueDate = isOverdue(dueDate);
            const daysUntilDue = getDaysUntilDate(dueDate);
            
            return (
              <View style={styles.timelineInfo}>
                <Ionicons 
                  name="calendar" 
                  size={16} 
                  color={isOverdueDate ? '#ef4444' : daysUntilDue <= 3 ? '#f59e0b' : '#10b981'} 
                />
                <Text style={[
                  styles.timelineText, 
                  { 
                    color: isOverdueDate ? '#ef4444' : daysUntilDue <= 3 ? '#f59e0b' : '#374151' 
                  }
                ]}>
                  {isOverdueDate ? `${Math.abs(daysUntilDue)} days overdue` : 
                   daysUntilDue === 0 ? 'Due today' :
                   `${daysUntilDue} days left`}
                </Text>
              </View>
            );
          })()}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {agreement.status === 'pending' && (
            <Button 
              mode="contained" 
              onPress={() => console.log('Make payment')}
              style={[styles.actionButton, styles.paymentButton]}
              compact
            >
              Make Payment
            </Button>
          )}
          
          {agreement.status === 'active' && (
            <>
              <Button 
                mode="outlined" 
                onPress={() => console.log('Chat with writer')}
                style={[styles.actionButton, styles.chatButton]}
                compact
              >
                Chat
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => console.log('View details')}
                style={[styles.actionButton]}
                compact
              >
                View Details
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
      </View>
  );
  };


  if (loading || currencyLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#015382" style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>
            {currencyLoading ? "Detecting your location..." : "Loading your dashboard..."}
          </Text>
          <Text style={styles.loadingSubtext}>
            {currencyLoading ? "Getting currency information" : "Fetching your projects and payments"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[premiumLayout.screen]}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
      >
        {/* Professional Header */}
        <View style={styles.headerContainer}>
          <LinearGradient 
            colors={colors.gradients.thinqscribe} 
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>Student Dashboard</Text>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity 
                  style={styles.profileButton}
                  onPress={() => router.push('/profile-settings')}
                >
                  <Image
                    source={{ uri: user?.avatar || getFallbackAvatar() }}
                    style={styles.profileAvatar}
                    onError={() => {
                      // Fallback to initials if image fails to load
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name}!</Text>
            
            {/* Location Detection */}
            {userLocation && !currencyLoading && (
              <View style={styles.locationContainer}>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationFlag}>{userLocation.flag}</Text>
                  <View style={styles.locationText}>
                    <Text style={styles.locationCountry}>
                      {userLocation.displayName || userLocation.country}
                    </Text>
                    <Text style={styles.locationCurrency}>
                      {userLocation.currencySymbol} {userLocation.currency?.toUpperCase()} • Native Pricing
                    </Text>
                  </View>
                  <View style={styles.locationStatus}>
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  </View>
                </View>
              </View>
            )}
          </View>
          
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Ionicons name="document-text-outline" size={18} color="#10b981" />
              <Text style={styles.quickStatText}>
                {activeAgreements.length + pendingAgreements.length} Active
              </Text>
            </View>
            <View style={styles.quickStatItem}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#3b82f6" />
              <Text style={styles.quickStatText}>
                {completedAgreements.length} Completed
              </Text>
            </View>
            <View style={styles.quickStatItem}>
              <Ionicons name="wallet-outline" size={18} color="#f59e0b" />
              <Text style={styles.quickStatText}>
                {formatCurrencyDisplay(stats.totalSpent)}
              </Text>
            </View>
          </View>
        </View>


        {/* Stats Cards - Full Width Layout */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Spent"
            value={formatCurrencyDisplay(stats.totalSpent)}
            icon="card-outline"
            subtitle="All time payments"
            type="primary"
          />
          <StatCard
            title="This Month"
            value={formatCurrencyDisplay(stats.moneySpentThisMonth)}
            icon="trending-up-outline"
            subtitle={`${new Date().toLocaleString('default', { month: 'long' })} spending`}
            type="info"
          />
          <StatCard
            title="Active Projects"
            value={stats.activeProjects.toString()}
            icon="flash-outline"
            subtitle="In progress"
            type="success"
          />
          <StatCard
            title="Completed"
            value={stats.completedProjects.toString()}
            icon="trophy-outline"
            subtitle="Finished projects"
            type="completed"
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
        <View style={styles.detailedProjectsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWithIcon}>
              <Ionicons name="folder-open-outline" size={20} color="#015382" />
              <Text style={styles.sectionTitle}>Project Management</Text>
            </View>
            <Text style={styles.projectCount}>
              {activeAgreements.length + pendingAgreements.length + completedAgreements.length} total
            </Text>
          </View>
          
          {/* Active Projects Detailed Section */}
          <Card style={styles.projectSection}>
            <Card.Content style={{ backgroundColor: colors.white }}>
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
                  <DetailedProjectCard key={agreement._id} agreement={agreement} />
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
            <Card.Content style={{ backgroundColor: colors.white }}>
              <View style={styles.projectSectionHeader}>
                <View style={styles.projectSectionTitleRow}>
                  <Ionicons name="time" size={18} color="#f59e0b" />
                  <Text style={styles.projectSectionTitle}>
                    Pending Projects ({pendingAgreements.length})
                  </Text>
                </View>
                {pendingAgreements.length > 0 && (
                  <View style={[styles.statusTag, { backgroundColor: '#fef3c7' }]}>
                    <Text style={[styles.statusTagText, { color: '#d97706' }]}>Waiting for Writer</Text>
                  </View>
                )}
              </View>
            
            {pendingAgreements.length > 0 ? (
              <View style={styles.detailedProjectsList}>
                {pendingAgreements.map((agreement) => (
                  <DetailedProjectCard key={agreement._id} agreement={agreement} />
                ))}
              </View>
            ) : (
              <View style={styles.emptySection}>
                <Ionicons name="hourglass-outline" size={32} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No Pending Projects</Text>
                <Text style={styles.emptySubtitle}>Projects waiting for writers will appear here</Text>
              </View>
            )}
            </Card.Content>
          </Card>

          {/* Completed Projects Detailed Section */}
          <Card style={styles.projectSection}>
            <Card.Content style={{ backgroundColor: colors.white }}>
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
                  <DetailedProjectCard key={agreement._id} agreement={agreement} />
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


        {/* Enhanced Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowCreateAgreementModal(true)}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="add-outline" size={24} color="white" />
                <Text style={[styles.actionText, { color: 'white' }]}>New Project</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={navigateToWritersList}
            >
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="people-outline" size={24} color="white" />
                <Text style={[styles.actionText, { color: 'white' }]}>Find Writers</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/messages')}
            >
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="chatbubbles-outline" size={24} color="white" />
                <Text style={[styles.actionText, { color: 'white' }]}>Messages</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button - Browse Writers */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/writers')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#015382', '#1e3a8a']}
          style={styles.fabGradient}
        >
          <Ionicons name="people" size={20} color="white" />
          <Text style={styles.fabText}>Browse Writers</Text>
        </LinearGradient>
        <View style={styles.fabPulse} />
      </TouchableOpacity>

      {/* Create Agreement Modal */}
      <CreateAgreementModal
        visible={showCreateAgreementModal}
        onClose={handleCloseCreateAgreementModal}
        onSubmit={handleCreateAgreement}
        loading={creatingAgreement}
        writer={selectedWriter}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
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
  
  // Professional Header Container
  headerContainer: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  headerGradient: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  profileButton: {
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  
  // Welcome Section
  welcomeSection: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  welcomeContent: {
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  
  // Location Styles
  locationContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  locationFlag: {
    fontSize: 18,
    marginRight: 8,
  },
  locationText: {
    flex: 1,
  },
  locationCountry: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 2,
  },
  locationCurrency: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  locationStatus: {
    marginLeft: 8,
  },
  
  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  quickStatText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  
  // Stats Cards - FIXED LAYOUT
  statsContainer: {
    paddingHorizontal: 16,
    marginVertical: 16,
    gap: 12,
  },
  statCard: {
    width: '100%',
    borderRadius: 16,
    elevation: 4,
    backgroundColor: colors.white,
    marginBottom: 8,
    ...shadows.md,
  },
  statCardGradient: {
    borderRadius: 16,
    padding: 16,
    height: 100,
    justifyContent: 'center',
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    height: '100%',
  },
  statCardLeft: {
    flex: 1,
    paddingRight: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 60,
  },
  statCardTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statCardValue: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 28,
    marginBottom: 2,
  },
  statCardSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.2,
  },
  statCardIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Section styles - FIXED MARGINS
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    ...shadows.sm,
  },
  detailedProjectsSection: {
    marginHorizontal: 0, // Remove horizontal margin for full width
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16, // Add padding for sections without margins
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
  
  // Project Sections - FIXED MARGINS
  projectSection: {
    marginTop: 12,
    marginBottom: 16,
    marginHorizontal: 16, // Consistent margin
    borderRadius: 16,
    elevation: 4,
    backgroundColor: colors.white,
    ...shadows.md,
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
  
  // Projects Summary
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
  
  // Detailed Project Cards
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
  progressBarDetailed: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 8,
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
  remainingAmountDetailed: {
    fontSize: 12,
    color: '#ef4444',
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
  chatButtonDetailed: {
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
  
  // Payment Progress Styles
  paymentProgress: {
    marginVertical: 12,
  },
  paymentAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paidAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  totalAmount: {
    fontSize: 14,
    color: '#6b7280',
  },
  installmentInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  unpaidAmount: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    marginVertical: 4,
  },
  
  // Timeline Styles
  timeline: {
    marginVertical: 8,
  },
  timelineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineText: {
    fontSize: 13,
    marginLeft: 8,
    color: '#374151',
  },
  
  // Project Header Styles
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
  projectSubject: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  writerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  writerAvatar: {
    marginRight: 8,
    backgroundColor: '#015382',
  },
  writerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  paymentButton: {
    backgroundColor: '#f59e0b',
  },
  chatButton: {
    borderColor: '#3b82f6',
  },
  
  // Empty States
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
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    gap: 12,
  },
  actionButtonGradient: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    height: 80,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Floating Action Button
  fab: {
    position: 'absolute',
    top: 200,
    right: 20,
    width: 140,
    height: 50,
    borderRadius: 25,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 1000,
  },
  fabGradient: {
    width: 140,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
  },
  fabText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  fabPulse: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 29,
    backgroundColor: 'rgba(1, 83, 130, 0.3)',
    zIndex: -1,
  },
});

export default StudentDashboard;