import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Button,
  TextInput,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const Support = () => {
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { id: 'account', label: 'Account Issues', icon: '👤' },
    { id: 'payment', label: 'Payment & Billing', icon: '💳' },
    { id: 'technical', label: 'Technical Problems', icon: '🔧' },
    { id: 'quality', label: 'Quality Concerns', icon: '⭐' },
    { id: 'writer', label: 'Writer Issues', icon: '✍️' },
    { id: 'other', label: 'Other', icon: '❓' },
  ];

  const priorities = [
    { id: 'low', label: 'Low', color: '#22c55e', description: 'General questions' },
    { id: 'medium', label: 'Medium', color: '#f59e0b', description: 'Standard issues' },
    { id: 'high', label: 'High', color: '#ef4444', description: 'Urgent problems' },
  ];

  const faqs = [
    {
      question: 'How do I track my order?',
      answer: 'You can track your order from your dashboard. Go to "My Orders" to see real-time updates on your project status.'
    },
    {
      question: 'What if I\'m not satisfied with the work?',
      answer: 'We offer unlimited revisions within the scope of your original requirements. Contact your writer directly or reach out to support.'
    },
    {
      question: 'How do I make payments?',
      answer: 'We accept major credit cards, PayPal, and other secure payment methods. Payments are processed securely through our platform.'
    },
    {
      question: 'Can I communicate with my writer?',
      answer: 'Yes! Our platform includes a built-in messaging system that allows direct communication with your assigned writer.'
    }
  ];

  const handleSubmitTicket = async () => {
    if (!selectedCategory || !subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      
      // In a real app, you would send this to your support API
      console.log('📱 [Support] Submitting ticket:', {
        userId: user?._id,
        category: selectedCategory,
        subject: subject.trim(),
        message: message.trim(),
        priority,
        userInfo: {
          name: user?.name,
          email: user?.email,
          role: user?.role
        }
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Ticket Submitted',
        'Your support ticket has been submitted successfully. We\'ll get back to you within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedCategory('');
              setSubject('');
              setMessage('');
              setPriority('medium');
            }
          }
        ]
      );
      
    } catch (err) {
      console.error('📱 [Support] Error submitting ticket:', err);
      Alert.alert('Error', 'Failed to submit support ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSupport = () => {
    const emailUrl = `mailto:support@thinqscribe.com?subject=Support Request&body=Hi ThinqScribe Support Team,%0D%0A%0D%0AUser: ${user?.name || 'Guest'}%0D%0AEmail: ${user?.email || 'Not provided'}%0D%0A%0D%0APlease describe your issue here...`;
    Linking.openURL(emailUrl).catch(() => {
      Alert.alert('Error', 'Unable to open email client. Please email us at support@thinqscribe.com');
    });
  };

  const handleCallSupport = () => {
    const phoneUrl = 'tel:+15551234567';
    Linking.openURL(phoneUrl).catch(() => {
      Alert.alert('Error', 'Unable to open phone dialer. Please call +1 (555) 123-4567');
    });
  };

  const renderHeader = () => (
    <LinearGradient colors={['#015382', '#017DB0']} style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Support Center</Text>
        <Text style={styles.headerSubtitle}>
          We're here to help! Get support for any questions or issues.
        </Text>
      </View>
    </LinearGradient>
  );

  const renderQuickContact = () => (
    <Card style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>🚀 Quick Contact</Text>
      
      <View style={styles.quickContactContainer}>
        <Button
          mode="contained"
          onPress={handleEmailSupport}
          style={[styles.quickContactButton, { backgroundColor: '#059669' }]}
          labelStyle={styles.quickContactText}
          icon="email"
        >
          Email Support
        </Button>
        
        <Button
          mode="contained"
          onPress={handleCallSupport}
          style={[styles.quickContactButton, { backgroundColor: '#0ea5e9' }]}
          labelStyle={styles.quickContactText}
          icon="phone"
        >
          Call Support
        </Button>
      </View>
      
      <View style={styles.contactInfo}>
        <Text style={styles.contactInfoText}>📧 support@thinqscribe.com</Text>
        <Text style={styles.contactInfoText}>📞 +1 (555) 123-4567</Text>
        <Text style={styles.contactInfoText}>🕒 24/7 Support Available</Text>
      </View>
    </Card>
  );

  const renderTicketForm = () => (
    <Card style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>🎫 Submit Support Ticket</Text>
      
      {/* Category Selection */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Category *</Text>
        <View style={styles.categoryContainer}>
          {categories.map((category) => (
            <Chip
              key={category.id}
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.selectedCategoryChip
              ]}
              textStyle={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.selectedCategoryChipText
              ]}
            >
              {category.icon} {category.label}
            </Chip>
          ))}
        </View>
      </View>

      {/* Priority Selection */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Priority</Text>
        <View style={styles.priorityContainer}>
          {priorities.map((priorityOption) => (
            <Chip
              key={priorityOption.id}
              selected={priority === priorityOption.id}
              onPress={() => setPriority(priorityOption.id)}
              style={[
                styles.priorityChip,
                { backgroundColor: priority === priorityOption.id ? priorityOption.color : '#f1f5f9' }
              ]}
              textStyle={[
                styles.priorityChipText,
                { color: priority === priorityOption.id ? 'white' : '#64748b' }
              ]}
            >
              {priorityOption.label}
            </Chip>
          ))}
        </View>
        <Text style={styles.priorityDescription}>
          {priorities.find(p => p.id === priority)?.description}
        </Text>
      </View>

      {/* Subject */}
      <View style={styles.fieldContainer}>
        <TextInput
          label="Subject *"
          value={subject}
          onChangeText={setSubject}
          style={styles.input}
          mode="outlined"
          placeholder="Brief description of your issue"
          maxLength={100}
        />
      </View>

      {/* Message */}
      <View style={styles.fieldContainer}>
        <TextInput
          label="Detailed Message *"
          value={message}
          onChangeText={setMessage}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={6}
          placeholder="Please provide detailed information about your issue, including any error messages or steps you've already tried."
          maxLength={1000}
        />
        <Text style={styles.characterCount}>
          {message.length}/1000 characters
        </Text>
      </View>

      {/* Submit Button */}
      <Button
        mode="contained"
        onPress={handleSubmitTicket}
        disabled={submitting || !selectedCategory || !subject.trim() || !message.trim()}
        loading={submitting}
        style={styles.submitButton}
        labelStyle={styles.submitButtonText}
      >
        {submitting ? 'Submitting...' : 'Submit Ticket'}
      </Button>
    </Card>
  );

  const renderFAQ = () => (
    <Card style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>❓ Frequently Asked Questions</Text>
      
      {faqs.map((faq, index) => (
        <View key={index} style={styles.faqItem}>
          <Text style={styles.faqQuestion}>{faq.question}</Text>
          <Text style={styles.faqAnswer}>{faq.answer}</Text>
        </View>
      ))}
      
      <Button
        mode="outlined"
        onPress={() => router.push('/faq')}
        style={styles.moreFaqButton}
        labelStyle={styles.moreFaqButtonText}
        icon="arrow-right"
      >
        View All FAQs
      </Button>
    </Card>
  );

  const renderResources = () => (
    <Card style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>📚 Helpful Resources</Text>
      
      <View style={styles.resourcesContainer}>
        <Button
          mode="outlined"
          onPress={() => router.push('/about')}
          style={styles.resourceButton}
          labelStyle={styles.resourceButtonText}
          icon="information"
        >
          About ThinqScribe
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => router.push('/terms')}
          style={styles.resourceButton}
          labelStyle={styles.resourceButtonText}
          icon="file-document"
        >
          Terms of Service
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => router.push('/privacy')}
          style={styles.resourceButton}
          labelStyle={styles.resourceButtonText}
          icon="shield-check"
        >
          Privacy Policy
        </Button>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderQuickContact()}
        {renderTicketForm()}
        {renderFAQ()}
        {renderResources()}
      </ScrollView>
      
      {/* Back Button */}
      <View style={styles.backButtonContainer}>
        <Button
          mode="text"
          onPress={() => router.back()}
          labelStyle={styles.backButtonText}
          icon="arrow-left"
        >
          Back
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  
  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Section Styles
  sectionCard: {
    margin: 20,
    marginTop: 10,
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // Quick Contact Styles
  quickContactContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickContactButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 4,
  },
  quickContactText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  contactInfo: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactInfoText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
    textAlign: 'center',
  },
  
  // Form Styles
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#f1f5f9',
    marginBottom: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#015382',
  },
  categoryChipText: {
    color: '#64748b',
    fontSize: 12,
  },
  selectedCategoryChipText: {
    color: 'white',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  priorityChip: {
    flex: 1,
  },
  priorityChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priorityDescription: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: 'white',
  },
  characterCount: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#015382',
    borderRadius: 12,
    paddingVertical: 4,
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
  // FAQ Styles
  faqItem: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#015382',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  moreFaqButton: {
    borderColor: '#015382',
    borderRadius: 12,
    paddingVertical: 4,
  },
  moreFaqButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#015382',
  },
  
  // Resources Styles
  resourcesContainer: {
    gap: 12,
  },
  resourceButton: {
    borderColor: '#015382',
    borderRadius: 12,
    paddingVertical: 4,
  },
  resourceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#015382',
  },
  
  // Back Button Styles
  backButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Support;
