import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { completeAgreement, getAgreement } from '../api/agreement';
import { useAppLoading } from '../context/AppLoadingContext';
import { useAuth } from '../context/MobileAuthContext';

const { width } = Dimensions.get('window');

const AgreementDetails = () => {
  const { agreementId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { setLoading: setGlobalLoading } = useAppLoading();

  // State
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
      const agreementData = await getAgreement(agreementId);
      console.log('📱 [AgreementDetails] Agreement data:', agreementData);
      
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
              await completeAgreement(agreementId);
              
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

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount || 0);
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
    if (!agreement?.installments) return null;
    return agreement.installments.find(inst => inst.status === 'pending');
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
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>
              {formatCurrency(agreement?.totalAmount || 0)}
            </Text>
            <Text style={styles.headerStatLabel}>Total Amount</Text>
          </View>
          
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(agreement?.status) }]}
            textStyle={styles.statusChipText}
          >
            {getStatusText(agreement?.status)}
          </Chip>
          
          {agreement?.paidAmount > 0 && (
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>
                {formatCurrency(agreement.paidAmount)}
              </Text>
              <Text style={styles.headerStatLabel}>Paid</Text>
            </View>
          )}
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
                {formatCurrency(nextInstallment.amount)}
              </Text>
              <Text style={styles.nextPaymentDate}>
                Due: {new Date(nextInstallment.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
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
