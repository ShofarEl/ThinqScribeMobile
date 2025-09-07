// Support Screen for ThinqScribe Mobile
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card, Chip, IconButton, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/context/MobileAuthContext';

const SupportScreen: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'technical', label: 'Technical Issue', icon: '⚙️' },
    { id: 'payment', label: 'Payment Problem', icon: '💳' },
    { id: 'account', label: 'Account Help', icon: '👤' },
    { id: 'writer', label: 'Writer Issues', icon: '✍️' },
    { id: 'general', label: 'General Question', icon: '❓' },
  ];

  const faqItems = [
    {
      question: 'How do I make a payment?',
      answer: 'You can make payments through the agreement page using your credit card or bank transfer.',
    },
    {
      question: 'How do I contact my writer?',
      answer: 'Use the chat feature in your dashboard to communicate directly with your assigned writer.',
    },
    {
      question: 'Can I request revisions?',
      answer: 'Yes, you can request revisions through the chat or agreement page. Most writers offer free revisions.',
    },
  ];

  const handleSubmitTicket = async () => {
    if (!selectedCategory || !subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Ticket Submitted',
        'Your support ticket has been submitted. We\'ll get back to you within 24 hours.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@thinqscribe.com?subject=Mobile App Support');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+1234567890');
  };

  const renderQuickContact = () => (
    <Card style={styles.contactCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Quick Contact</Text>
        <View style={styles.contactButtons}>
          <TouchableOpacity style={styles.contactButton} onPress={handleEmailSupport}>
            <Text style={styles.contactIcon}>📧</Text>
            <Text style={styles.contactLabel}>Email Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={handleCallSupport}>
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactLabel}>Call Us</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderTicketForm = () => (
    <Card style={styles.formCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Submit a Support Ticket</Text>
        
        <View style={styles.categoryContainer}>
          <Text style={styles.inputLabel}>Category *</Text>
          <View style={styles.categoryChips}>
            {categories.map((category) => (
              <Chip
                key={category.id}
                selected={selectedCategory === category.id}
                onPress={() => {
                  setSelectedCategory(category.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[styles.categoryChip, selectedCategory === category.id && styles.selectedCategoryChip]}
                textStyle={[styles.categoryChipText, selectedCategory === category.id && styles.selectedCategoryChipText]}
              >
                {category.icon} {category.label}
              </Chip>
            ))}
          </View>
        </View>

        <TextInput
          label="Subject *"
          value={subject}
          onChangeText={setSubject}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Describe your issue *"
          value={message}
          onChangeText={setMessage}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />

        <Button
          mode="contained"
          onPress={handleSubmitTicket}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
        >
          Submit Ticket
        </Button>
      </Card.Content>
    </Card>
  );

  const renderFAQ = () => (
    <Card style={styles.faqCard}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqItems.map((item, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{item.question}</Text>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton icon="arrow-left" iconColor="#ffffff" onPress={() => router.back()} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <Text style={styles.headerSubtitle}>We're here to help you</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderQuickContact()}
        {renderTicketForm()}
        {renderFAQ()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingVertical: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  headerTextContainer: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginTop: 4 },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#333' },
  contactCard: { marginBottom: 20, borderRadius: 12 },
  contactButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  contactButton: { alignItems: 'center', padding: 16, flex: 1 },
  contactIcon: { fontSize: 32, marginBottom: 8 },
  contactLabel: { fontSize: 14, fontWeight: '500', color: '#667eea' },
  formCard: { marginBottom: 20, borderRadius: 12 },
  categoryContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#333' },
  categoryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { backgroundColor: '#f0f0f0', marginBottom: 8 },
  selectedCategoryChip: { backgroundColor: '#667eea' },
  categoryChipText: { fontSize: 12 },
  selectedCategoryChipText: { color: '#ffffff' },
  input: { marginBottom: 16 },
  textArea: { marginBottom: 16, minHeight: 100 },
  submitButton: { backgroundColor: '#667eea', marginTop: 8 },
  faqCard: { borderRadius: 12 },
  faqItem: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  faqQuestion: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  faqAnswer: { fontSize: 14, color: '#666', lineHeight: 20 },
});

export default SupportScreen;