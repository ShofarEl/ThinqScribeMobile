// ThinqScribe/src/components/CreateAgreementModal.js
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Card } from 'react-native-paper';
import { useCurrency } from '../hooks/useCurrency';
import SimpleCalendarPicker from './SimpleCalendarPicker';

// Import premium design system

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
  return `${month} ${day}`;
};

const { width, height } = Dimensions.get('window');

const CreateAgreementModal = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
  writer
}) => {
  const { location } = useCurrency();
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    totalAmount: '',
    installments: [
      {
        amount: '',
        dueDate: new Date() // Today - first installment can be paid immediately
      }
    ]
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [selectedCurrency, setSelectedCurrency] = useState('ngn');
  const [selectedGateway, setSelectedGateway] = useState('paystack');

  // Payment recommendation based on location
  useEffect(() => {
    if (location) {
      const isNigerian = location.countryCode === 'ng';
      const isAfrican = location.isAfrican;

      // Force Paystack + NGN policy per requirements
      setSelectedGateway('paystack');
      setSelectedCurrency(isNigerian ? 'ngn' : (isAfrican ? (location.currency || 'ngn') : 'ngn'));
    }
  }, [location]);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      description: '',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalAmount: '',
      installments: [
        {
          amount: '',
          dueDate: new Date() // Today - first installment can be paid immediately
        }
      ]
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = 'Valid total amount is required';
    }

    // Validate installments
    const totalAmount = parseFloat(formData.totalAmount) || 0;
    let installmentSum = 0;

    formData.installments.forEach((installment, index) => {
      const amount = parseFloat(installment.amount) || 0;
      if (amount <= 0) {
        newErrors[`installment_${index}_amount`] = 'Amount must be greater than 0';
      }
      installmentSum += amount;
    });

    // Check if installment sum matches total amount
    if (Math.abs(totalAmount - installmentSum) > 0.01) {
      newErrors.installmentSum = 'Sum of installments must equal total amount';
    }

    // Validate dates
    const now = new Date();
    if (formData.deadline <= now) {
      newErrors.deadline = 'Deadline must be in the future';
    }

    formData.installments.forEach((installment, index) => {
      // First installment can be today, subsequent installments must be in the future
      if (index === 0) {
        // Allow first installment to be today or in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const installmentDate = new Date(installment.dueDate);
        installmentDate.setHours(0, 0, 0, 0);
        if (installmentDate < today) {
          newErrors[`installment_${index}_date`] = 'Due date cannot be in the past';
        }
      } else {
        // Subsequent installments must be in the future
        if (installment.dueDate <= now) {
          newErrors[`installment_${index}_date`] = 'Due date must be in the future';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isProcessing) return;
    
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }

    if (!writer) {
      Alert.alert('Error', 'Writer information is missing.');
      return;
    }

    setIsProcessing(true);
    try {
      const agreementData = {
        writerId: writer._id,
        projectDetails: {
          title: formData.title.trim(),
          subject: formData.subject.trim(),
          description: formData.description.trim(),
          deadline: formData.deadline.toISOString()
        },
        totalAmount: parseFloat(formData.totalAmount),
        installments: formData.installments.map(inst => ({
          amount: parseFloat(inst.amount),
          dueDate: inst.dueDate.toISOString(),
          status: 'pending'
        })),
        paymentPreferences: {
          currency: selectedCurrency,
          gateway: selectedGateway,
          location: location ? {
            country: location.country,
            countryCode: location.countryCode,
            isAfrican: location.isAfrican
          } : null,
          nativeAmount: parseFloat(formData.totalAmount)
        }
      };

      await onSubmit(agreementData);
    } catch (error) {
      console.error('Error submitting agreement:', error);
      Alert.alert('Error', 'Failed to create agreement. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle deadline date change
  const handleDeadlineChange = (date) => {
    setFormData(prev => ({ ...prev, deadline: date }));
  };

  // Handle installment date change
  const handleInstallmentDateChange = (index, date) => {
    const updatedInstallments = [...formData.installments];
    updatedInstallments[index].dueDate = date;
    setFormData(prev => ({ ...prev, installments: updatedInstallments }));
  };


  const addInstallment = () => {
    if (formData.installments.length < 10) {
      setFormData(prev => ({
        ...prev,
        installments: [
          ...prev.installments,
          {
            amount: '',
            dueDate: new Date(Date.now() + (prev.installments.length + 2) * 24 * 60 * 60 * 1000)
          }
        ]
      }));
    }
  };

  const removeInstallment = (index) => {
    if (formData.installments.length > 1) {
      const updatedInstallments = formData.installments.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, installments: updatedInstallments }));
    }
  };

  const updateInstallment = (index, field, value) => {
    const updatedInstallments = [...formData.installments];
    updatedInstallments[index][field] = value;
    setFormData(prev => ({ ...prev, installments: updatedInstallments }));
  };

  const getCurrencySymbol = (currency) => ({ 'usd': '$', 'ngn': '₦' }[currency] || '₦');

  const isNigerian = location?.countryCode === 'ng';
  const installmentSum = formData.installments.reduce((sum, inst) => sum + (parseFloat(inst.amount) || 0), 0);
  const totalAmount = parseFloat(formData.totalAmount) || 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Premium Header */}
        <LinearGradient
          colors={['#015382', '#015382']}
          style={styles.modernHeader}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.modernCloseButton}>
              <Icon name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              Create Service Agreement
            </Text>
            <View style={styles.headerSpacer} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Prominent Paystack Banner */}
          <View style={styles.paystackBanner}>
            <View style={styles.bannerContent}>
              <View style={styles.bannerLeft}>
                <Icon name="credit-card" size={24} color="white" />
                <View style={styles.bannerTextContainer}>
                  <Text style={styles.bannerTitle}>Paystack Recommended</Text>
                  <Text style={styles.bannerSubtitle}>Secure payments with NGN currency</Text>
                </View>
              </View>
              <View style={styles.bannerRight}>
                <Text style={styles.bannerCurrency}>₦ NGN</Text>
              </View>
            </View>
          </View>

          {/* Payment Gateway Info */}
          <Card style={styles.infoCard} elevation={1}>
            <Card.Content>
              <View style={styles.infoHeader}>
                <Icon name="information" size={20} color="#3b82f6" />
                <Text style={styles.infoTitle}>Payment Gateway Requirements</Text>
              </View>
              <Text style={styles.infoText}>
                Nigerian users must use Paystack with NGN currency. Non-Nigerian users must use Stripe with USD currency.
              </Text>
            </Card.Content>
          </Card>

          {/* Location Detection & Payment Gateway */}
          {location && (
            <Card style={[styles.locationCard, { backgroundColor: isNigerian ? '#f0f9ff' : '#f0fdf4' }]} elevation={1}>
              <Card.Content>
                <View style={styles.locationRow}>
                  <Icon name="map-marker" size={16} color="#1890ff" />
                  <Text style={styles.locationText}>
                    Detected: <Text style={styles.locationBold}>{location.displayName}</Text> {location.flag}
                  </Text>
                </View>
                <View style={styles.locationRow}>
                  <Text style={styles.recommendedText}>Recommended Payment Gateway:</Text>
                </View>
                <View style={styles.paystackRow}>
                  <View style={styles.paystackContainer}>
                    <View style={styles.paystackBadge}>
                      <Icon name="credit-card" size={18} color="#3b82f6" />
                      <Text style={styles.paystackText}>Paystack</Text>
                    </View>
                    <Text style={styles.paystackDescription}>
                      {isNigerian
                        ? "Secure payments for Nigerian users with NGN currency"
                        : "Recommended for African users with multi-currency support"
                      }
                    </Text>
                  </View>
                  <View style={styles.currencyBadge}>
                    <Text style={styles.currencyText}>₦ NGN</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Project Details */}
          <Card style={styles.sectionCard} elevation={2}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Project Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Project Title *</Text>
                <TextInput
                  style={[styles.textInput, errors.title && styles.inputError]}
                  value={formData.title}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, title: value }))}
                  placeholder="e.g., Research Paper on Climate Change"
                  placeholderTextColor="#9ca3af"
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject *</Text>
                <TextInput
                  style={[styles.textInput, errors.subject && styles.inputError]}
                  value={formData.subject}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                  placeholder="e.g., Environmental Science"
                  placeholderTextColor="#9ca3af"
                />
                {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Deadline *</Text>
                <SimpleCalendarPicker
                  value={formData.deadline}
                  onDateChange={handleDeadlineChange}
                  minimumDate={new Date()}
                  size="normal"
                  style={errors.deadline && styles.inputError}
                />
                {errors.deadline && <Text style={styles.errorText}>{errors.deadline}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Project Description *</Text>
                <TextInput
                  style={[styles.textArea, errors.description && styles.inputError]}
                  value={formData.description}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  placeholder="Include all requirements, formatting guidelines, expected deliverables, quality standards, etc."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
              </View>
            </Card.Content>
          </Card>

          {/* Payment Structure */}
          <Card style={styles.sectionCard} elevation={2}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Payment Structure</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Total Project Amount ({getCurrencySymbol(selectedCurrency)}) *
                </Text>
                <TextInput
                  style={[styles.textInput, errors.totalAmount && styles.inputError]}
                  value={formData.totalAmount}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, totalAmount: value }))}
                  placeholder="Enter total amount"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
                {errors.totalAmount && <Text style={styles.errorText}>{errors.totalAmount}</Text>}
              </View>

              {/* Installments */}
              <Text style={styles.subsectionTitle}>Payment Installments</Text>
              
              {formData.installments.map((installment, index) => (
                <Card key={index} style={styles.installmentCard} elevation={1}>
                  <Card.Content>
                    <View style={styles.installmentHeader}>
                      <Text style={styles.installmentTitle}>Installment {index + 1}</Text>
                      {formData.installments.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeInstallment(index)}
                          style={styles.removeButton}
                        >
                          <Icon name="delete" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.installmentRow}>
                      <View style={styles.installmentInput}>
                        <Text style={styles.installmentLabel}>Amount ({getCurrencySymbol(selectedCurrency)})</Text>
                        <TextInput
                          style={[styles.textInput, styles.smallInput, errors[`installment_${index}_amount`] && styles.inputError]}
                          value={installment.amount}
                          onChangeText={(value) => updateInstallment(index, 'amount', value)}
                          placeholder="0.00"
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                        />
                        {errors[`installment_${index}_amount`] && (
                          <Text style={styles.errorText}>{errors[`installment_${index}_amount`]}</Text>
                        )}
                      </View>

                      <View style={styles.installmentInput}>
                        <Text style={styles.installmentLabel}>Due Date</Text>
                        <SimpleCalendarPicker
                          value={installment.dueDate}
                          onDateChange={(date) => handleInstallmentDateChange(index, date)}
                          minimumDate={index === 0 ? undefined : new Date(Date.now() + 24 * 60 * 60 * 1000)}
                          size="small"
                          style={[styles.smallCalendar, errors[`installment_${index}_date`] && styles.inputError]}
                        />
                        {errors[`installment_${index}_date`] && (
                          <Text style={styles.errorText}>{errors[`installment_${index}_date`]}</Text>
                        )}
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))}

              {formData.installments.length < 10 && (
                <TouchableOpacity style={styles.addInstallmentButton} onPress={addInstallment}>
                  <Icon name="plus" size={20} color="#3b82f6" />
                  <Text style={styles.addInstallmentText}>Add Another Installment</Text>
                </TouchableOpacity>
              )}

              {/* Payment Summary */}
              <Card style={styles.summaryCard} elevation={1}>
                <Card.Content>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Project Amount:</Text>
                    <Text style={styles.summaryAmount}>
                      {getCurrencySymbol(selectedCurrency)}{totalAmount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Sum of Installments:</Text>
                    <Text style={[
                      styles.summaryAmount,
                      { color: Math.abs(totalAmount - installmentSum) > 0.01 ? '#ef4444' : '#059669' }
                    ]}>
                      {getCurrencySymbol(selectedCurrency)}{installmentSum.toFixed(2)}
                    </Text>
                  </View>
                  {Math.abs(totalAmount - installmentSum) > 0.01 && totalAmount > 0 && (
                    <Text style={styles.summaryError}>
                      Difference: {getCurrencySymbol(selectedCurrency)}{Math.abs(totalAmount - installmentSum).toFixed(2)}
                    </Text>
                  )}
                  {errors.installmentSum && <Text style={styles.errorText}>{errors.installmentSum}</Text>}
                </Card.Content>
              </Card>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={onClose}
            disabled={loading || isProcessing}
          >
            <Text style={[styles.actionButtonText, { color: '#6b7280' }]}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.submitButton, (loading || isProcessing) && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Icon name="check" size={18} color="white" />
            )}
            <Text style={[styles.actionButtonText, { color: 'white', marginLeft: isProcessing ? 0 : 6 }]}>
              {isProcessing ? 'Creating...' : 'Create Agreement'}
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
    backgroundColor: '#f5f5f5'
  },
  modernHeader: {
    paddingTop: 44,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  modernCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white'
  },
  headerSpacer: {
    width: 40
  },
  content: {
    flex: 1,
    paddingHorizontal: 16
  },
  paystackBanner: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerTextContainer: {
    marginLeft: 12,
  },
  bannerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  bannerRight: {
    alignItems: 'flex-end',
  },
  bannerCurrency: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937'
  },
  infoText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18
  },
  locationCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6
  },
  locationText: {
    fontSize: 13,
    color: '#374151'
  },
  locationBold: {
    fontWeight: '600'
  },
  recommendedText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 8
  },
  gatewayChip: {
    height: 24
  },
  paystackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12
  },
  paystackContainer: {
    flex: 1,
  },
  paystackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    gap: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  paystackText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  paystackDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    marginLeft: 4,
  },
  currencyBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  currencyText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 12
  },
  inputGroup: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1f2937'
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 80
  },
  dateInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  smallDateInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    borderRadius: 8,
  },
  smallDateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  smallCalendar: {
    flex: 1,
    minWidth: 120, // Ensure minimum width for the calendar button
  },
  inputError: {
    borderColor: '#ef4444'
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4
  },
  installmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  installmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  installmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937'
  },
  removeButton: {
    padding: 4
  },
  installmentRow: {
    flexDirection: 'row',
    gap: 12
  },
  installmentInput: {
    flex: 1
  },
  installmentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4
  },
  smallInput: {
    paddingVertical: 8,
    fontSize: 14
  },
  addInstallmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    paddingVertical: 12,
    gap: 8
  },
  addInstallmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6'
  },
  summaryCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151'
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669'
  },
  summaryError: {
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 4
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
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db'
  },
  submitButton: {
    backgroundColor: '#1e3a8a'
  },
  disabledButton: {
    opacity: 0.6
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600'
  },
});

export default CreateAgreementModal;