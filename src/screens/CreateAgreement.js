import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    Avatar,
    Button,
    Card,
    Chip,
    Divider,
    IconButton,
    Modal,
    Portal,
    TextInput
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { agreementApi } from '../api/agreement';
import { useAppLoading } from '../context/AppLoadingContext';
import { useAuth } from '../context/MobileAuthContext';
import { useCurrency } from '../hooks/useCurrency';
import { formatCurrency, getCurrencySymbol } from '../utils/currencyUtils';

const { width, height } = Dimensions.get('window');

const CreateAgreement = () => {
  const { writerId, chatId, writerName, writerAvatar } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { setLoading: setGlobalLoading } = useAppLoading();
  const { currency, userLocation } = useCurrency();

  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    totalAmount: '',
    installments: [
      {
        amount: '',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      }
    ]
  });

  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState('deadline'); // 'deadline' or installment index
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false); // For Android modal wrapper

  const steps = [
    { title: 'Project Details', icon: 'file-document-outline', color: '#3b82f6' },
    { title: 'Payment Terms', icon: 'currency-usd', color: '#10b981' },
    { title: 'Review & Submit', icon: 'check-circle-outline', color: '#8b5cf6' }
  ];

  const subjects = [
    'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English Literature', 'History', 'Psychology', 'Economics', 'Business',
    'Engineering', 'Philosophy', 'Sociology', 'Art & Design', 'Other'
  ];

  useEffect(() => {
    if (!writerId) {
      Alert.alert('Error', 'Writer information is missing', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [writerId]);

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.title.trim()) newErrors.title = 'Project title is required';
      if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (new Date(formData.deadline) <= new Date()) newErrors.deadline = 'Deadline must be in the future';
    } else if (step === 1) {
      if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
        newErrors.totalAmount = 'Valid total amount is required';
      }
      
      let installmentSum = 0;
      formData.installments.forEach((inst, index) => {
        if (!inst.amount || parseFloat(inst.amount) <= 0) {
          newErrors[`installment_${index}`] = 'Valid amount required';
        } else {
          installmentSum += parseFloat(inst.amount);
        }
        if (new Date(inst.dueDate) <= new Date()) {
          newErrors[`installment_date_${index}`] = 'Due date must be in the future';
        }
      });

      if (Math.abs(installmentSum - parseFloat(formData.totalAmount || 0)) > 0.01) {
        newErrors.installmentSum = 'Installment amounts must equal total amount';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setShowReviewModal(true);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const updateInstallment = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      installments: prev.installments.map((inst, i) => 
        i === index ? { ...inst, [field]: value } : inst
      )
    }));
    if (errors[`installment_${index}`] || errors[`installment_date_${index}`]) {
      setErrors(prev => ({ 
        ...prev, 
        [`installment_${index}`]: null,
        [`installment_date_${index}`]: null 
      }));
    }
  };

  const addInstallment = () => {
    setFormData(prev => ({
      ...prev,
      installments: [...prev.installments, {
        amount: '',
        dueDate: new Date(Date.now() + (prev.installments.length + 2) * 24 * 60 * 60 * 1000)
      }]
    }));
  };

  const removeInstallment = (index) => {
    if (formData.installments.length > 1) {
      setFormData(prev => ({
        ...prev,
        installments: prev.installments.filter((_, i) => i !== index)
      }));
    }
  };

  const showDatePickerFor = (type) => {
    setDatePickerType(type);
    
    // Force immediate display of date picker
    if (Platform.OS === 'android') {
      setShowDatePickerModal(true);
    } else {
      setShowDatePicker(true);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    setShowDatePickerModal(false);
    
    // Only update if user confirmed the selection
    if (selectedDate && (event.type === 'set' || Platform.OS === 'ios')) {
      if (datePickerType === 'deadline') {
        updateFormData('deadline', selectedDate);
      } else if (typeof datePickerType === 'number') {
        updateInstallment(datePickerType, 'dueDate', selectedDate);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) return;

    try {
      setLoading(true);
      setGlobalLoading(true);
      console.log('📱 [CreateAgreement] Creating agreement...');

      const agreementData = {
        writerId,
        chatId,
        projectDetails: {
          title: formData.title.trim(),
          subject: formData.subject.trim(),
          description: formData.description.trim(),
          deadline: formData.deadline.toISOString(),
        },
        totalAmount: parseFloat(formData.totalAmount),
        currency: currency || 'usd',
        installments: formData.installments.map(inst => ({
          amount: parseFloat(inst.amount),
          dueDate: inst.dueDate.toISOString(),
          status: 'pending'
        }))
      };

      console.log('📱 [CreateAgreement] Agreement data:', agreementData);

      const result = await agreementApi.createAgreement(agreementData);
      console.log('📱 [CreateAgreement] Agreement created:', result);

      setShowReviewModal(false);
      
      Alert.alert(
        'Success! 🎉',
        `Agreement created successfully!\n\nThe writer will be notified and can accept your project proposal. You'll receive updates on your dashboard.`,
        [
          {
            text: 'View Agreements',
            onPress: () => router.replace('/dashboard')
          },
          {
            text: 'Back to Chat',
            onPress: () => router.back(),
            style: 'cancel'
          }
        ]
      );

    } catch (err) {
      console.error('📱 [CreateAgreement] Error creating agreement:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to create agreement. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            {
              backgroundColor: index <= currentStep ? step.color : '#e5e7eb',
              borderColor: index === currentStep ? step.color : '#e5e7eb'
            }
          ]}>
            <Icon 
              name={step.icon} 
              size={20} 
              color={index <= currentStep ? 'white' : '#9ca3af'} 
            />
          </View>
          <Text style={[
            styles.stepText,
            { color: index <= currentStep ? step.color : '#9ca3af' }
          ]}>
            {step.title}
          </Text>
          {index < steps.length - 1 && (
            <View style={[
              styles.stepLine,
              { backgroundColor: index < currentStep ? step.color : '#e5e7eb' }
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderProjectDetailsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Project Information</Text>
      
      {/* Writer Info */}
      <Card style={styles.writerCard}>
        <Card.Content style={styles.writerCardContent}>
          <Avatar.Image
            size={50}
            source={{
              uri: writerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(writerName || 'Writer')}`
            }}
          />
          <View style={styles.writerInfo}>
            <Text style={styles.writerName}>{writerName || 'Selected Writer'}</Text>
            <Text style={styles.writerLabel}>Assigned Writer</Text>
          </View>
          <Icon name="check-circle" size={24} color="#10b981" />
        </Card.Content>
      </Card>

      {/* Project Title */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Project Title *</Text>
        <TextInput
          value={formData.title}
          onChangeText={(text) => updateFormData('title', text)}
          placeholder="Enter your project title"
          style={[styles.textInput, errors.title && styles.inputError]}
          mode="outlined"
          maxLength={100}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
      </View>

      {/* Subject */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Subject *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
          <View style={styles.chipContainer}>
            {subjects.map((subject) => (
              <Chip
                key={subject}
                selected={formData.subject === subject}
                onPress={() => updateFormData('subject', subject)}
                style={[
                  styles.subjectChip,
                  formData.subject === subject && styles.selectedChip
                ]}
                textStyle={[
                  styles.chipText,
                  formData.subject === subject && styles.selectedChipText
                ]}
              >
                {subject}
              </Chip>
            ))}
          </View>
        </ScrollView>
        {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Project Description *</Text>
        <TextInput
          value={formData.description}
          onChangeText={(text) => updateFormData('description', text)}
          placeholder="Describe your project requirements, expectations, and any specific instructions..."
          style={[styles.textArea, errors.description && styles.inputError]}
          mode="outlined"
          multiline
          numberOfLines={4}
          maxLength={1000}
        />
        <Text style={styles.characterCount}>{formData.description.length}/1000</Text>
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
      </View>

      {/* Deadline */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Project Deadline *</Text>
        <TouchableOpacity
          style={[styles.dateInput, errors.deadline && styles.inputError]}
          onPress={() => showDatePickerFor('deadline')}
        >
          <Icon name="calendar" size={20} color="#6b7280" />
          <Text style={styles.dateText}>
            {formData.deadline.toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
          <Icon name="chevron-down" size={20} color="#6b7280" />
        </TouchableOpacity>
        {errors.deadline && <Text style={styles.errorText}>{errors.deadline}</Text>}
      </View>
    </View>
  );

  const renderPaymentStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Payment Terms</Text>
      
      {/* Currency Display */}
      <Card style={styles.currencyCard}>
        <Card.Content style={styles.currencyContent}>
          <View style={styles.currencyInfo}>
            <Text style={styles.currencyFlag}>{userLocation?.flag || '🌍'}</Text>
            <View>
              <Text style={styles.currencyText}>
                Payment Currency: {getCurrencySymbol(currency)} {currency?.toUpperCase()}
              </Text>
              <Text style={styles.currencySubtext}>
                {userLocation?.displayName || 'Auto-detected based on location'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Total Amount */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Total Project Amount *</Text>
        <TextInput
          value={formData.totalAmount}
          onChangeText={(text) => updateFormData('totalAmount', text)}
          placeholder="0.00"
          style={[styles.textInput, errors.totalAmount && styles.inputError]}
          mode="outlined"
          keyboardType="numeric"
          left={<TextInput.Icon icon={() => <Text style={styles.currencySymbol}>{getCurrencySymbol(currency)}</Text>} />}
        />
        {errors.totalAmount && <Text style={styles.errorText}>{errors.totalAmount}</Text>}
      </View>

      {/* Installments */}
      <View style={styles.inputGroup}>
        <View style={styles.installmentHeader}>
          <Text style={styles.inputLabel}>Payment Installments *</Text>
          <TouchableOpacity onPress={addInstallment} style={styles.addButton}>
            <Icon name="plus" size={16} color="#3b82f6" />
            <Text style={styles.addButtonText}>Add Installment</Text>
          </TouchableOpacity>
        </View>

        {formData.installments.map((installment, index) => (
          <Card key={index} style={styles.installmentCard}>
            <Card.Content style={styles.installmentContent}>
              <View style={styles.installmentHeader}>
                <Text style={styles.installmentTitle}>Installment {index + 1}</Text>
                {formData.installments.length > 1 && (
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => removeInstallment(index)}
                    style={styles.removeButton}
                  />
                )}
              </View>
              
              <View style={styles.installmentRow}>
                <View style={styles.installmentAmountContainer}>
                  <Text style={styles.installmentLabel}>Amount</Text>
                  <TextInput
                    value={installment.amount}
                    onChangeText={(text) => updateInstallment(index, 'amount', text)}
                    placeholder="0.00"
                    style={[
                      styles.installmentInput,
                      errors[`installment_${index}`] && styles.inputError
                    ]}
                    mode="outlined"
                    keyboardType="numeric"
                    left={<TextInput.Icon icon={() => <Text style={styles.currencySymbol}>{getCurrencySymbol(currency)}</Text>} />}
                  />
                  {errors[`installment_${index}`] && (
                    <Text style={styles.errorText}>{errors[`installment_${index}`]}</Text>
                  )}
                </View>

                <View style={styles.installmentDateContainer}>
                  <Text style={styles.installmentLabel}>Due Date</Text>
                  <TouchableOpacity
                    style={[
                      styles.installmentDateInput,
                      errors[`installment_date_${index}`] && styles.inputError
                    ]}
                    onPress={() => showDatePickerFor(index)}
                  >
                    <Icon name="calendar" size={16} color="#6b7280" />
                    <Text style={styles.installmentDateText}>
                      {installment.dueDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                  </TouchableOpacity>
                  {errors[`installment_date_${index}`] && (
                    <Text style={styles.errorText}>{errors[`installment_date_${index}`]}</Text>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}

        {errors.installmentSum && (
          <Text style={styles.errorText}>{errors.installmentSum}</Text>
        )}
      </View>

      {/* Payment Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(parseFloat(formData.totalAmount) || 0, getCurrencySymbol(currency))}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Installments:</Text>
            <Text style={styles.summaryValue}>{formData.installments.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Installment Total:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(
                formData.installments.reduce((sum, inst) => sum + (parseFloat(inst.amount) || 0), 0),
                getCurrencySymbol(currency)
              )}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderReviewModal = () => (
    <Portal>
      <Modal visible={showReviewModal} onDismiss={() => setShowReviewModal(false)} contentContainerStyle={styles.modalContainer}>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>Review Agreement</Text>
          
          {/* Project Details */}
          <Card style={styles.reviewCard}>
            <Card.Content>
              <Text style={styles.reviewSectionTitle}>Project Details</Text>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Title:</Text>
                <Text style={styles.reviewValue}>{formData.title}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Subject:</Text>
                <Text style={styles.reviewValue}>{formData.subject}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Deadline:</Text>
                <Text style={styles.reviewValue}>
                  {formData.deadline.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Description:</Text>
                <Text style={styles.reviewValue}>{formData.description}</Text>
              </View>
            </Card.Content>
          </Card>

          {/* Payment Details */}
          <Card style={styles.reviewCard}>
            <Card.Content>
              <Text style={styles.reviewSectionTitle}>Payment Terms</Text>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Total Amount:</Text>
                <Text style={[styles.reviewValue, styles.reviewAmount]}>
                  {formatCurrency(parseFloat(formData.totalAmount), getCurrencySymbol(currency))}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Currency:</Text>
                <Text style={styles.reviewValue}>{currency?.toUpperCase()}</Text>
              </View>
              
              <Divider style={styles.reviewDivider} />
              
              <Text style={styles.reviewSubtitle}>Installments ({formData.installments.length})</Text>
              {formData.installments.map((installment, index) => (
                <View key={index} style={styles.installmentReview}>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Installment {index + 1}:</Text>
                    <Text style={styles.reviewValue}>
                      {formatCurrency(parseFloat(installment.amount), getCurrencySymbol(currency))}
                    </Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewSubLabel}>Due:</Text>
                    <Text style={styles.reviewSubValue}>
                      {installment.dueDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>

          {/* Agreement Terms */}
          <Card style={styles.reviewCard}>
            <Card.Content>
              <Text style={styles.reviewSectionTitle}>Agreement Terms</Text>
              <Text style={styles.termsText}>
                • This agreement is between you and {writerName || 'the selected writer'}{'\n'}
                • Payment will be processed according to the installment schedule{'\n'}
                • Work must be completed by the specified deadline{'\n'}
                • Both parties agree to communicate professionally{'\n'}
                • Disputes will be handled through ThinqScribe support
              </Text>
            </Card.Content>
          </Card>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowReviewModal(false)}
              style={styles.cancelButton}
              disabled={loading}
            >
              Back to Edit
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={loading}
              disabled={loading}
            >
              Create Agreement
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#015382', '#015382']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Create Agreement</Text>
            <Text style={styles.headerSubtitle}>Step {currentStep + 1} of {steps.length}</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {currentStep === 0 && renderProjectDetailsStep()}
          {currentStep === 1 && renderPaymentStep()}
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={handleBack}
            style={styles.backActionButton}
            disabled={loading}
          >
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.nextButton}
            disabled={loading}
          >
            {currentStep === steps.length - 1 ? 'Review' : 'Next'}
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker for iOS */}
      {showDatePicker && Platform.OS === 'ios' && (
        <DateTimePicker
          value={datePickerType === 'deadline' ? formData.deadline : formData.installments[datePickerType]?.dueDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Date Picker Modal for Android */}
      {showDatePickerModal && Platform.OS === 'android' && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showDatePickerModal}
          onRequestClose={() => setShowDatePickerModal(false)}
        >
          <View style={styles.datePickerModalOverlay}>
            <View style={styles.datePickerModalContent}>
              <DateTimePicker
                value={datePickerType === 'deadline' ? formData.deadline : formData.installments[datePickerType]?.dueDate || new Date()}
                mode="date"
                display="calendar"
                onChange={handleDateChange}
                minimumDate={new Date()}
                style={styles.datePicker}
              />
              <TouchableOpacity
                style={styles.datePickerCancelButton}
                onPress={() => setShowDatePickerModal(false)}
              >
                <Text style={styles.datePickerCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Review Modal */}
      {renderReviewModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 8,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  stepLine: {
    position: 'absolute',
    top: 20,
    left: '60%',
    right: '-60%',
    height: 2,
    zIndex: -1,
  },
  scrollContent: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  writerCard: {
    marginBottom: 24,
    elevation: 2,
  },
  writerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  writerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  writerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  writerLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
  },
  textArea: {
    backgroundColor: 'white',
    minHeight: 100,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  chipScrollView: {
    flexGrow: 0,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: '#3b82f6',
  },
  chipText: {
    color: '#374151',
  },
  selectedChipText: {
    color: 'white',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  currencyCard: {
    marginBottom: 24,
    backgroundColor: '#f0f9ff',
    elevation: 1,
  },
  currencyContent: {
    paddingVertical: 12,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencyFlag: {
    fontSize: 24,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369a1',
  },
  currencySubtext: {
    fontSize: 14,
    color: '#0284c7',
    marginTop: 2,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  installmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  installmentCard: {
    marginBottom: 12,
    elevation: 1,
  },
  installmentContent: {
    paddingVertical: 12,
  },
  installmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  removeButton: {
    margin: 0,
  },
  installmentRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  installmentAmountContainer: {
    flex: 2,
  },
  installmentDateContainer: {
    flex: 1,
  },
  installmentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 6,
  },
  installmentInput: {
    backgroundColor: 'white',
    fontSize: 14,
  },
  installmentDateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  installmentDateText: {
    fontSize: 14,
    color: '#374151',
  },
  summaryCard: {
    backgroundColor: '#f9fafb',
    elevation: 1,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 16,
  },
  backActionButton: {
    flex: 1,
    borderColor: '#d1d5db',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    maxHeight: height * 0.8,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  reviewCard: {
    marginBottom: 16,
    elevation: 2,
  },
  reviewSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  reviewValue: {
    fontSize: 14,
    color: '#374151',
    flex: 2,
    textAlign: 'right',
  },
  reviewAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  reviewDivider: {
    marginVertical: 12,
  },
  reviewSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  installmentReview: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reviewSubLabel: {
    fontSize: 12,
    color: '#9ca3af',
    flex: 1,
  },
  reviewSubValue: {
    fontSize: 12,
    color: '#6b7280',
    flex: 2,
    textAlign: 'right',
  },
  termsText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#d1d5db',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#059669',
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  datePicker: {
    backgroundColor: 'white',
  },
  datePickerCancelButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  datePickerCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
});

export default CreateAgreement;