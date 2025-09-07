// ThinqScribe/src/components/ReviewAgreementModal.js
import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Button, Divider, Chip } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCurrency } from '../hooks/useCurrency';
// Using native Date methods instead of moment

// Date formatting helper functions
const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${month} ${day}, ${year} at ${hours}:${minutes}`;
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
};

const { width, height } = Dimensions.get('window');

const ReviewAgreementModal = ({
  visible,
  agreement,
  onClose,
  onAccept,
  onCancel,
  loading = false
}) => {
  const { formatCurrency } = useCurrency();

  if (!agreement) return null;

  const handleAccept = () => {
    Alert.alert(
      'Accept Agreement',
      'Are you sure you want to accept this project? Once accepted, you\'ll be committed to completing the work as outlined.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: () => onAccept(agreement._id)
        }
      ]
    );
  };

  const handleDecline = () => {
    Alert.alert(
      'Decline Agreement',
      'Are you sure you want to decline this project? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => onCancel(agreement._id)
        }
      ]
    );
  };

  // Enhanced currency detection logic for mobile - same as web version
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

  const formatAmount = (amount) => {
    const currencySymbols = { 'usd': '$', 'ngn': '₦' };
    const symbol = currencySymbols[detectedCurrency] || '$';
    return `${symbol}${amount?.toFixed(2) || '0.00'}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'active': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const totalInstallments = agreement.installments?.length || 0;
  const totalAmount = agreement.totalAmount || 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Review Agreement</Text>
            <View style={styles.headerSpacer} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Project Status */}
          <View style={styles.section}>
            <View style={styles.statusHeader}>
              <Text style={styles.sectionTitle}>Project Status</Text>
              <Chip
                mode="flat"
                style={[styles.statusChip, { backgroundColor: getStatusColor(agreement.status) + '20' }]}
                textStyle={[styles.statusText, { color: getStatusColor(agreement.status) }]}
              >
                {agreement.status?.charAt(0).toUpperCase() + agreement.status?.slice(1) || 'Unknown'}
              </Chip>
            </View>
          </View>

          {/* Project Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Details</Text>
            <View style={styles.projectCard}>
              <Text style={styles.projectTitle}>
                {agreement.projectDetails?.title || 'Untitled Project'}
              </Text>
              <Text style={styles.projectSubject}>
                Subject: {agreement.projectDetails?.subject || 'Not specified'}
              </Text>
              <Text style={styles.projectDescription}>
                {agreement.projectDetails?.description || 'No description available'}
              </Text>
              
              {agreement.projectDetails?.deadline && (
                <View style={styles.deadlineContainer}>
                  <Icon name="calendar-clock" size={16} color="#f59e0b" />
                  <Text style={styles.deadlineText}>
                    Due: {formatDateTime(agreement.projectDetails.deadline)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Student Information */}
          {agreement.student && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Student Information</Text>
              <View style={styles.studentCard}>
                <View style={styles.studentInfo}>
                  <Icon name="account" size={20} color="#3b82f6" />
                  <Text style={styles.studentName}>{agreement.student.name || 'Unknown Student'}</Text>
                </View>
                <Text style={styles.studentEmail}>{agreement.student.email || 'No email provided'}</Text>
              </View>
            </View>
          )}

          {/* Payment Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <View style={styles.paymentCard}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Total Amount:</Text>
                <Text style={styles.paymentAmount}>{formatAmount(totalAmount)}</Text>
              </View>
              
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Currency:</Text>
                <Text style={styles.paymentValue}>{detectedCurrency.toUpperCase()}</Text>
              </View>
              
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Installments:</Text>
                <Text style={styles.paymentValue}>{totalInstallments} payments</Text>
              </View>

              {agreement.paymentPreferences?.gateway && (
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Payment Gateway:</Text>
                  <Text style={styles.paymentValue}>
                    {agreement.paymentPreferences.gateway.charAt(0).toUpperCase() + 
                     agreement.paymentPreferences.gateway.slice(1)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Installment Breakdown */}
          {agreement.installments && agreement.installments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Schedule</Text>
              {agreement.installments.map((installment, index) => (
                <View key={index} style={styles.installmentCard}>
                  <View style={styles.installmentHeader}>
                    <Text style={styles.installmentTitle}>Installment {index + 1}</Text>
                    <Text style={styles.installmentAmount}>
                      {formatAmount(installment.amount)}
                    </Text>
                  </View>
                  {installment.dueDate && (
                    <Text style={styles.installmentDate}>
                      Due: {formatDate(installment.dueDate)}
                    </Text>
                  )}
                  <View style={styles.installmentStatus}>
                    <Chip
                      mode="flat"
                      style={[styles.miniChip, { backgroundColor: getStatusColor(installment.status) + '20' }]}
                      textStyle={[styles.miniChipText, { color: getStatusColor(installment.status) }]}
                    >
                      {installment.status?.charAt(0).toUpperCase() + installment.status?.slice(1) || 'Pending'}
                    </Chip>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Important Notes */}
          <View style={styles.section}>
            <View style={styles.notesCard}>
              <View style={styles.notesHeader}>
                <Icon name="information" size={20} color="#3b82f6" />
                <Text style={styles.notesTitle}>Important Notes</Text>
              </View>
              <Text style={styles.notesText}>
                • By accepting this agreement, you commit to completing the project as outlined
              </Text>
              <Text style={styles.notesText}>
                • Payment will be processed according to the installment schedule
              </Text>
              <Text style={styles.notesText}>
                • You can communicate with the student through the chat feature
              </Text>
              <Text style={styles.notesText}>
                • Mark the project as complete when finished to receive payment
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={handleDecline}
            disabled={loading}
          >
            <Icon name="close-circle" size={20} color="#ef4444" />
            <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Decline</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAccept}
            disabled={loading}
          >
            <Icon name="check-circle" size={20} color="white" />
            <Text style={[styles.actionButtonText, { color: 'white' }]}>
              {loading ? 'Accepting...' : 'Accept Project'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white'
  },
  headerSpacer: {
    width: 40
  },
  content: {
    flex: 1,
    paddingHorizontal: 16
  },
  section: {
    marginTop: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  statusChip: {
    borderRadius: 20
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  projectCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8
  },
  projectSubject: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12
  },
  projectDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 8
  },
  deadlineText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '500',
    marginLeft: 6
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8
  },
  studentEmail: {
    fontSize: 14,
    color: '#6b7280'
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6b7280'
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669'
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937'
  },
  installmentCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6'
  },
  installmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  installmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937'
  },
  installmentAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669'
  },
  installmentDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8
  },
  installmentStatus: {
    alignItems: 'flex-start'
  },
  miniChip: {
    height: 24,
    borderRadius: 12
  },
  miniChipText: {
    fontSize: 10,
    fontWeight: '600'
  },
  notesCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8
  },
  notesText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 4
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8
  },
  declineButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  acceptButton: {
    backgroundColor: '#059669'
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600'
  }
});

export default ReviewAgreementModal;
