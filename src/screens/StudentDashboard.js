// ThinqScribe/src/screens/StudentDashboard.js
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
import { Card, Button, Avatar, Badge, ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { fetchStudentDashboardData, getRecommendedWriters } from '../api/user';
import { agreementApi } from '../api/agreement';
import { useCurrency } from '../hooks/useCurrency';
import { getUserLocationAndCurrency, formatCurrency, getCurrencySymbol, getAgreementCurrency } from '../utils/currencyUtils';
import { formatDate, getTimeAgo, getDaysUntilDate, isOverdue, getCurrentMonth, getCurrentYear, isDateInCurrentMonth } from '../utils/dateUtils';

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

  // Calculate monthly spending from agreements - MOBILE VERSION  
  const calculateMonthlySpending = (agreementsList) => {
    const currentMonth = getCurrentMonth();
    const currentYear = getCurrentYear();
    
    let monthlySpent = 0;
    
    agreementsList.forEach(agreement => {
      if (agreement.paidAmount > 0) {
        // Check installments for payments made this month
        if (agreement.installments && agreement.installments.length > 0) {
          agreement.installments.forEach(installment => {
            if (installment.status === 'paid') {
              const paymentDate = installment.paymentDate || installment.paidDate;
              if (paymentDate) {
                if (isDateInCurrentMonth(paymentDate)) {
                  const amount = installment.amount || 0;
                  const agreementCurrency = getAgreementCurrency(agreement);
                  
                  // Convert based on user location
                  const isNigerian = userLocation?.countryCode === 'ng' || !userLocation;
                  if (isNigerian) {
                    if (agreementCurrency === 'usd') {
                      monthlySpent += amount * 1500; // Convert USD to NGN
                    } else {
                      monthlySpent += amount; // Keep NGN as is
                    }
                  } else {
                    monthlySpent += amount;
                  }
                }
              }
            }
          });
        } else {
          // If no installments, check if the agreement was completed/paid this month
          const relevantDate = agreement.completedAt || agreement.updatedAt || agreement.createdAt;
          if (isDateInCurrentMonth(relevantDate)) {
            const agreementCurrency = getAgreementCurrency(agreement);
            
            const isNigerian = userLocation?.countryCode === 'ng' || !userLocation;
            if (isNigerian) {
              if (agreementCurrency === 'usd') {
                monthlySpent += agreement.paidAmount * 1500;
              } else {
                monthlySpent += agreement.paidAmount;
              }
            } else {
              monthlySpent += agreement.paidAmount;
            }
          }
        }
      }
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
        <Card.Content>
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

  const ProjectCard = ({ agreement }) => (
    <Card style={styles.projectCard}>
      <Card.Content>
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle}>
            {agreement.projectDetails?.title || 'Untitled Project'}
          </Text>
          <Badge 
            style={[styles.statusBadge, { backgroundColor: getStatusColor(agreement.status) }]}
          >
            {agreement.status}
          </Badge>
        </View>
        
        <Text style={styles.projectSubject}>
          {agreement.projectDetails?.subject || 'General'}
        </Text>
        
        {agreement.writer && (
          <View style={styles.writerInfo}>
            <Avatar.Text 
              size={32} 
              label={agreement.writer.name?.charAt(0) || 'W'} 
              style={styles.writerAvatar}
            />
            <Text style={styles.writerName}>{agreement.writer.name}</Text>
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
      </Card.Content>
    </Card>
  );

  const WriterCard = ({ writer }) => (
    <Card style={styles.writerCard}>
      <Card.Content style={styles.writerCardContent}>
        <Avatar.Text 
          size={40} 
          label={writer.name?.charAt(0) || 'W'} 
          style={styles.writerAvatar}
        />
        <View style={styles.writerDetails}>
          <Text style={styles.writerName}>{writer.name}</Text>
          <Text style={styles.writerSpecialty}>{writer.specialty}</Text>
          <View style={styles.writerRating}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.ratingText}>{writer.rating || '4.5'}</Text>
          </View>
        </View>
        <Button 
          mode="contained" 
          compact 
          onPress={() => console.log('Hire writer:', writer.name)}
          style={styles.hireButton}
        >
          Hire
        </Button>
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
            {currencyLoading ? "Getting currency information" : "Fetching your projects and payments"}
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
              <Text style={styles.roleText}>Student Dashboard</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.profileButton}>
                <Avatar.Text 
                  size={45} 
                  label={user?.name?.charAt(0) || 'S'} 
                  style={styles.profileAvatar}
                  labelStyle={styles.profileAvatarLabel}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStatItem}>
              <Ionicons name="document-text-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.headerStatText}>
                {activeAgreements.length + pendingAgreements.length} Active
              </Text>
            </View>
            <View style={styles.headerStatItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.headerStatText}>
                {completedAgreements.length} Completed
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
            title="Total Spent"
            value={formatCurrencyDisplay(stats.totalSpent)}
            icon="card-outline"
            color="#10b981"
            subtitle="Lifetime spending"
          />
          <StatCard
            title="Active Projects"
            value={stats.activeProjects.toString()}
            icon="flash-outline"
            color="#3b82f6"
            subtitle="In progress"
          />
          <StatCard
            title="Completed"
            value={stats.completedProjects.toString()}
            icon="checkmark-circle-outline"
            color="#f59e0b"
            subtitle="Finished projects"
          />
          <StatCard
            title="This Month"
            value={formatCurrencyDisplay(stats.moneySpentThisMonth)}
            icon="calendar-outline"
            color="#8b5cf6"
            subtitle={`${stats.projectsThisMonth} projects`}
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
              <Ionicons name="folder-open-outline" size={20} color="#015382" />
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

        {/* Recommended Writers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended Writers</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recommendedWriters.length > 0 ? (
            recommendedWriters.slice(0, 3).map((writer) => (
              <WriterCard key={writer._id} writer={writer} />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="people-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No writers available</Text>
                <Text style={styles.emptySubtext}>Check back later</Text>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add-outline" size={24} color="#015382" />
              <Text style={styles.actionText}>New Project</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="people-outline" size={24} color="#015382" />
              <Text style={styles.actionText}>Find Writers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubbles-outline" size={24} color="#015382" />
              <Text style={styles.actionText}>Messages</Text>
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
  },
  paymentButton: {
    backgroundColor: '#f59e0b',
  },
  chatButton: {
    borderColor: '#3b82f6',
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
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerStatText: {
    fontSize: 13,
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
  statusBadge: {
    color: 'white',
    fontSize: 12,
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
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  writerCard: {
    marginBottom: 12,
    elevation: 2,
  },
  writerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  writerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  writerSpecialty: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  writerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  hireButton: {
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  actionButton: {
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

export default StudentDashboard;
