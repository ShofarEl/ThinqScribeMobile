// Create Agreement Screen for ThinqScribe Mobile
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Card, Chip, IconButton, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/context/MobileAuthContext';
import { formatCurrency, getCurrencySymbol } from '../src/utils/currencyUtils';

const CreateAgreementScreen: React.FC = () => {
  const { writerId, writerName } = useLocalSearchParams();
  const { location } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    totalAmount: '',
  });

  const subjects = ['Computer Science', 'Mathematics', 'Physics', 'English Literature', 'Business', 'Other'];

  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Success!', 'Agreement created successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create agreement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProjectStep = () => (
    <View style={styles.stepContent}>
      <Card style={styles.writerCard}>
        <Card.Content style={styles.writerCardContent}>
          <Avatar.Text size={50} label={(writerName as string)?.charAt(0) || 'W'} />
          <View style={styles.writerInfo}>
            <Text style={styles.writerName}>{writerName || 'Selected Writer'}</Text>
            <Text style={styles.writerLabel}>Assigned Writer</Text>
          </View>
        </Card.Content>
      </Card>

      <TextInput
        label="Project Title *"
        value={formData.title}
        onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
        mode="outlined"
        style={styles.input}
      />

      <Text style={styles.inputLabel}>Subject *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chipContainer}>
          {subjects.map((subject) => (
            <Chip
              key={subject}
              selected={formData.subject === subject}
              onPress={() => setFormData(prev => ({ ...prev, subject }))}
              style={[styles.subjectChip, formData.subject === subject && styles.selectedChip]}
            >
              {subject}
            </Chip>
          ))}
        </View>
      </ScrollView>

      <TextInput
        label="Project Description *"
        value={formData.description}
        onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.textArea}
      />
    </View>
  );

  const renderPaymentStep = () => (
    <View style={styles.stepContent}>
      <Card style={styles.currencyCard}>
        <Card.Content>
          <Text style={styles.currencyText}>
            Currency: {getCurrencySymbol(location?.currency)} {location?.currency?.toUpperCase()}
          </Text>
        </Card.Content>
      </Card>

      <TextInput
        label="Total Project Amount *"
        value={formData.totalAmount}
        onChangeText={(text) => setFormData(prev => ({ ...prev, totalAmount: text }))}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
        left={<TextInput.Icon icon={() => <Text>{getCurrencySymbol(location?.currency)}</Text>} />}
      />

      <Card style={styles.reviewCard}>
        <Card.Content>
          <Text style={styles.reviewTitle}>Review Agreement</Text>
          <Text style={styles.reviewLabel}>Project: {formData.title}</Text>
          <Text style={styles.reviewLabel}>Subject: {formData.subject}</Text>
          <Text style={styles.reviewLabel}>Amount: {formatCurrency(parseFloat(formData.totalAmount) || 0, location?.currency)}</Text>
          <Text style={styles.reviewDescription}>{formData.description}</Text>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton icon="arrow-left" iconColor="#ffffff" onPress={() => router.back()} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Create Agreement</Text>
            <Text style={styles.headerSubtitle}>Step {currentStep + 1} of 2</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <ScrollView style={styles.scrollContent}>
          {currentStep === 0 ? renderProjectStep() : renderPaymentStep()}
        </ScrollView>

        <View style={styles.footer}>
          <Button mode="outlined" onPress={() => currentStep === 0 ? router.back() : setCurrentStep(0)} style={styles.backButton}>
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            mode="contained"
            onPress={handleNext}
            loading={isSubmitting}
            style={styles.nextButton}
          >
            {currentStep === 0 ? 'Next' : 'Create Agreement'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingVertical: 16, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  headerText: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  content: { flex: 1 },
  scrollContent: { flex: 1 },
  stepContent: { padding: 20 },
  writerCard: { marginBottom: 20 },
  writerCardContent: { flexDirection: 'row', alignItems: 'center' },
  writerInfo: { marginLeft: 16 },
  writerName: { fontSize: 18, fontWeight: '600' },
  writerLabel: { fontSize: 14, color: '#666' },
  input: { marginBottom: 16 },
  textArea: { marginBottom: 16, minHeight: 100 },
  inputLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  chipContainer: { flexDirection: 'row', paddingRight: 16, marginBottom: 16 },
  subjectChip: { marginRight: 8, backgroundColor: '#f3f4f6' },
  selectedChip: { backgroundColor: '#667eea' },
  currencyCard: { marginBottom: 20, backgroundColor: '#f0f9ff' },
  currencyText: { fontSize: 16, fontWeight: '600', color: '#0369a1' },
  reviewCard: { marginTop: 20 },
  reviewTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  reviewLabel: { fontSize: 14, marginBottom: 4, color: '#333' },
  reviewDescription: { fontSize: 14, color: '#666', lineHeight: 20, marginTop: 8 },
  footer: { flexDirection: 'row', padding: 20, backgroundColor: 'white', gap: 16 },
  backButton: { flex: 1 },
  nextButton: { flex: 1, backgroundColor: '#667eea' },
});

export default CreateAgreementScreen;