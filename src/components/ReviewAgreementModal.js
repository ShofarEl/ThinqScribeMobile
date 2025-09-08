// ThinqScribe/src/components/ReviewAgreementModal.js
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { useCurrency } from '../hooks/useCurrency';
import { formatCurrency } from '../utils/currencyUtils';
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
  const { formatCurrency: formatCurrencyHook } = useCurrency();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!agreement) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Agreement Details</Text>
              <View style={styles.headerSpacer} />
            </View>
          </LinearGradient>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading agreement details...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  const handleAccept = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onAccept(agreement._id);
    } catch (error) {
      console.error('Error accepting agreement:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onCancel(agreement._id);
    } catch (error) {
      console.error('Error declining agreement:', error);
    } finally {
      setIsProcessing(false);
    }
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
    if (!amount) return '0.00';
    return formatCurrency(amount, detectedCurrency);
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
            <Text style={styles.createdDate}>
              Created: {formatDate(agreement.createdAt)}
            </Text>
          </View>

          {/* Project Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Details</Text>
            <Card style={styles.projectCard} elevation={2}>
              <Card.Content>
                <Text style={styles.projectTitle}>
                  {agreement.projectDetails?.title || 'Untitled Project'}
                </Text>
                
                <View style={styles.projectMeta}>
                  <View style={styles.metaItem}>
                    <Icon name="book-open-page-variant" size={16} color="#6b7280" />
                    <Text style={styles.metaText}>
                      {agreement.projectDetails?.subject || 'Not specified'}
                    </Text>
                  </View>
                  
                  <View style={styles.metaItem}>
                    <Icon name="school" size={16} color="#6b7280" />
                    <Text style={styles.metaText}>
                      {agreement.projectDetails?.academicLevel || 'Not specified'}
                    </Text>
                  </View>
                  
                  <View style={styles.metaItem}>
                    <Icon name="file-document" size={16} color="#6b7280" />
                    <Text style={styles.metaText}>
                      {agreement.projectDetails?.pages || 'Not specified'} pages
                    </Text>
                  </View>
                  
                  <View style={styles.metaItem}>
                    <Icon name="format-quote-close" size={16} color="#6b7280" />
                    <Text style={styles.metaText}>
                      {agreement.projectDetails?.citationStyle || 'Not specified'}
                    </Text>
                  </View>
                </View>
                
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
              </Card.Content>
            </Card>
          </View>

          {/* Student Information */}
          {agreement.student && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Student Information</Text>
              <Card style={styles.studentCard} elevation={2}>
                <Card.Content>
                  <View style={styles.studentInfo}>
                    <View style={styles.studentAvatar}>
                      <Text style={styles.studentAvatarText}>
                        {agreement.student.name?.charAt(0)?.toUpperCase() || 'S'}
                      </Text>
                    </View>
                    <View style={styles.studentDetails}>
                      <Text style={styles.studentName}>{agreement.student.name || 'Unknown Student'}</Text>
                      <Text style={styles.studentEmail}>{agreement.student.email || 'No email provided'}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Payment Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <Card style={styles.paymentCard} elevation={2}>
              <Card.Content>
                <View style={styles.paymentHeader}>
                  <Text style={styles.paymentTitle}>Total Project Value</Text>
                  <Text style={styles.paymentAmount}>{formatAmount(totalAmount)}</Text>
                </View>
                
                <View style={styles.paymentDetails}>
                  <View style={styles.paymentRow}>
                    <Icon name="currency-usd" size={16} color="#6b7280" />
                    <Text style={styles.paymentLabel}>Currency:</Text>
                    <Text style={styles.paymentValue}>{detectedCurrency.toUpperCase()}</Text>
                  </View>
                  
                  <View style={styles.paymentRow}>
                    <Icon name="calendar-multiple" size={16} color="#6b7280" />
                    <Text style={styles.paymentLabel}>Installments:</Text>
                    <Text style={styles.paymentValue}>{totalInstallments} payments</Text>
                  </View>

                  {agreement.paymentPreferences?.gateway && (
                    <View style={styles.paymentRow}>
                      <Icon name="credit-card" size={16} color="#6b7280" />
                      <Text style={styles.paymentLabel}>Gateway:</Text>
                      <Text style={styles.paymentValue}>
                        {agreement.paymentPreferences.gateway.charAt(0).toUpperCase() + 
                         agreement.paymentPreferences.gateway.slice(1)}
                      </Text>
                    </View>
                  )}
                  
                  {agreement.paymentPreferences?.location && (
                    <View style={styles.paymentRow}>
                      <Icon name="map-marker" size={16} color="#6b7280" />
                      <Text style={styles.paymentLabel}>Location:</Text>
                      <Text style={styles.paymentValue}>
                        {agreement.paymentPreferences.location.country || 'Not specified'}
                      </Text>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          </View>

          {/* Installment Breakdown */}
          {agreement.installments && agreement.installments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Schedule</Text>
              {agreement.installments.slice(0, 3).map((installment, index) => (
                <Card key={index} style={styles.installmentCard} elevation={1}>
                  <Card.Content>
                    <View style={styles.installmentHeader}>
                      <View style={styles.installmentInfo}>
                        <Text style={styles.installmentTitle}>Installment {index + 1}</Text>
                        {installment.dueDate && (
                          <Text style={styles.installmentDate}>
                            Due: {formatDate(installment.dueDate)}
                          </Text>
                        )}
                      </View>
                      <View style={styles.installmentRight}>
                        <Text style={styles.installmentAmount}>
                          {formatAmount(installment.amount)}
                        </Text>
                        <Chip
                          mode="flat"
                          style={[styles.miniChip, { backgroundColor: getStatusColor(installment.status) + '20' }]}
                          textStyle={[styles.miniChipText, { color: getStatusColor(installment.status) }]}
                        >
                          {installment.status?.charAt(0).toUpperCase() + installment.status?.slice(1) || 'Pending'}
                        </Chip>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))}
              {agreement.installments.length > 3 && (
                <View style={styles.moreInstallments}>
                  <Text style={styles.moreInstallmentsText}>
                    +{agreement.installments.length - 3} more installments
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Important Notes */}
          {agreement.status === 'pending' && (
            <View style={styles.section}>
              <Card style={styles.notesCard} elevation={1}>
                <Card.Content>
                  <View style={styles.notesHeader}>
                    <Icon name="alert-circle" size={20} color="#f59e0b" />
                    <Text style={styles.notesTitle}>Review Agreement Terms Carefully</Text>
                  </View>
                  <Text style={styles.notesText}>
                    By accepting this agreement, you commit to delivering the project by the specified deadline and according to all requirements. Payment will be released based on the agreed schedule. Please ensure you understand all project requirements before proceeding.
                  </Text>
                </Card.Content>
              </Card>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.closeButton]}
            onPress={onClose}
            disabled={isProcessing}
          >
            <Text style={[styles.actionButtonText, { color: '#6b7280' }]}>Close</Text>
          </TouchableOpacity>
          
          {agreement.status === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.declineButton]}
                onPress={handleDecline}
                disabled={loading || isProcessing}
              >
                <Icon name="close-circle" size={18} color="#ef4444" />
                <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>
                  {isProcessing ? 'Declining...' : 'Decline'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={handleAccept}
                disabled={loading || isProcessing}
              >
                <Icon name="check-circle" size={18} color="white" />
                <Text style={[styles.actionButtonText, { color: 'white' }]}>
                  {isProcessing ? 'Accepting...' : 'Accept Agreement'}
                </Text>
              </TouchableOpacity>
            </>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center'
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
  createdDate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8
  },
  projectCard: {
    borderRadius: 12,
    marginBottom: 8
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12
  },
  projectMeta: {
    marginBottom: 12
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500'
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
    borderRadius: 12,
    marginBottom: 8
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  studentAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white'
  },
  studentDetails: {
    flex: 1
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4
  },
  studentEmail: {
    fontSize: 14,
    color: '#6b7280'
  },
  paymentCard: {
    borderRadius: 12,
    marginBottom: 8
  },
  paymentHeader: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  paymentTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#059669'
  },
  paymentDetails: {
    gap: 12
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6b7280',
    minWidth: 80
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1
  },
  installmentCard: {
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6'
  },
  installmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  installmentInfo: {
    flex: 1
  },
  installmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4
  },
  installmentDate: {
    fontSize: 12,
    color: '#6b7280'
  },
  installmentRight: {
    alignItems: 'flex-end'
  },
  installmentAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4
  },
  moreInstallments: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginTop: 8
  },
  moreInstallmentsText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic'
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
    backgroundColor: '#fffbeb'
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e'
  },
  notesText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f9fafb',
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
    gap: 6
  },
  closeButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db'
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
