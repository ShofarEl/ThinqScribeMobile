// ThinqScribe/src/components/CreateAgreementModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import { Button, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useCurrency } from '../hooks/useCurrency';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

const CreateAgreementModal = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
  writer
}) => {
  const { location } = useCurrency();

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
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      }
    ]
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState('deadline');
  const [selectedInstallmentIndex, setSelectedInstallmentIndex] = useState(0);
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
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
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
      if (installment.dueDate <= now) {
        newErrors[`installment_${index}_date`] = 'Due date must be in the future';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }

    if (!writer) {
      Alert.alert('Error', 'Writer information is missing.');
      return;
    }

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
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      if (datePickerType === 'deadline') {
        setFormData(prev => ({ ...prev, deadline: selectedDate }));
      } else if (datePickerType.startsWith('installment_')) {
        const index = parseInt(datePickerType.split('_')[1]);
        const updatedInstallments = [...formData.installments];
        updatedInstallments[index].dueDate = selectedDate;
        setFormData(prev => ({ ...prev, installments: updatedInstallments }));
      }
    }
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
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#1e3a8a', '#3b82f6']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Service Agreement</Text>
            <View style={styles.headerSpacer} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Payment Gateway Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Icon name="information" size={20} color="#3b82f6" />
              <Text style={styles.infoTitle}>Payment Gateway Requirements</Text>
            </View>
            <Text style={styles.infoText}>
              Nigerian users must use Paystack with NGN currency. Non-Nigerian users must use Stripe with USD currency.
            </Text>
          </View>

          {/* Location Detection */}
          {location && (
            <View style={[styles.locationCard, { backgroundColor: isNigerian ? '#f0f9ff' : '#f0fdf4' }]}>
              <View style={styles.locationRow}>
                <Icon name="map-marker" size={16} color="#1890ff" />
                <Text style={styles.locationText}>
                  Detected: <Text style={styles.locationBold}>{location.displayName}</Text> {location.flag}
                </Text>
              </View>
              <View style={styles.locationRow}>
                <Text style={styles.recommendedText}>Recommended:</Text>
                <Chip
                  mode="flat"
                  style={[styles.gatewayChip, { backgroundColor: selectedGateway === 'paystack' ? '#e6f7ff' : '#f0fdf4' }]}
                  textStyle={{ fontSize: 12, fontWeight: '600' }}
                >
                  {selectedGateway.charAt(0).toUpperCase() + selectedGateway.slice(1)}
                </Chip>
              </View>
            </View>
          )}

          {/* Project Details */}
          <View style={styles.section}>
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
              <TouchableOpacity
                style={[styles.dateInput, errors.deadline && styles.inputError]}
                onPress={() => {
                  setDatePickerType('deadline');
                  setShowDatePicker(true);
                }}
              >
                <Icon name="calendar" size={20} color="#6b7280" />
                <Text style={styles.dateText}>
                  {moment(formData.deadline).format('MMM DD, YYYY [at] HH:mm')}
                </Text>
              </TouchableOpacity>
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
          </View>

          {/* Payment Structure */}
          <View style={styles.section}>
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
              <View key={index} style={styles.installmentCard}>
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
                    <TouchableOpacity
                      style={[styles.dateInput, styles.smallDateInput, errors[`installment_${index}_date`] && styles.inputError]}
                      onPress={() => {
                        setDatePickerType(`installment_${index}`);
                        setSelectedInstallmentIndex(index);
                        setShowDatePicker(true);
                      }}
                    >
                      <Icon name="calendar" size={16} color="#6b7280" />
                      <Text style={styles.smallDateText}>
                        {moment(installment.dueDate).format('MMM DD')}
                      </Text>
                    </TouchableOpacity>
                    {errors[`installment_${index}_date`] && (
                      <Text style={styles.errorText}>{errors[`installment_${index}_date`]}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}

            {formData.installments.length < 10 && (
              <TouchableOpacity style={styles.addInstallmentButton} onPress={addInstallment}>
                <Icon name="plus" size={20} color="#3b82f6" />
                <Text style={styles.addInstallmentText}>Add Another Installment</Text>
              </TouchableOpacity>
            )}

            {/* Payment Summary */}
            <View style={styles.summaryCard}>
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
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={[styles.actionButtonText, { color: '#6b7280' }]}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={[styles.actionButtonText, { color: 'white' }]}>
              {loading ? 'Creating...' : 'Create Agreement'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={datePickerType === 'deadline' ? formData.deadline : formData.installments[selectedInstallmentIndex]?.dueDate || new Date()}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
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
    fontWeight: '500'
  },
  gatewayChip: {
    height: 24
  },
  section: {
    marginTop: 20
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  dateText: {
    fontSize: 16,
    color: '#1f2937'
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
  smallDateInput: {
    paddingVertical: 8
  },
  smallDateText: {
    fontSize: 14,
    color: '#1f2937'
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
    justifyContent: 'center'
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
  }
});

export default CreateAgreementModal;
