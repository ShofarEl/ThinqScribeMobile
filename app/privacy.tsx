// Privacy Policy Screen for ThinqScribe Mobile
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const PrivacyScreen: React.FC = () => {
  const lastUpdated = "December 15, 2024";

  const sections = [
    {
      title: "Information We Collect",
      icon: "📋",
      content: "When you create an account, we collect your name, email address, and payment information. We also collect information about your academic projects and communication with writers to ensure quality service delivery."
    },
    {
      title: "How We Use Your Information",
      icon: "🔧",
      content: "We use your information to connect you with qualified writers, process payments, deliver academic support services, and improve our platform. We also use your contact information for important updates and customer support."
    },
    {
      title: "Information Sharing",
      icon: "🤝",
      content: "We share necessary project details with matched writers who are bound by strict confidentiality agreements. We may share information with trusted service providers and when required by law."
    },
    {
      title: "Data Security",
      icon: "🔒",
      content: "All sensitive data is encrypted both in transit and at rest using industry-standard protocols. We implement strict access controls and conduct regular security audits."
    },
    {
      title: "Your Rights",
      icon: "⚖️",
      content: "You have the right to access, correct, or delete your personal data. You can also opt out of non-essential communications and request a copy of your information."
    },
  ];

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <View style={styles.headerContent}>
        <IconButton icon="arrow-left" iconColor="#ffffff" onPress={() => router.back()} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.headerSubtitle}>Your privacy is our priority</Text>
          <Text style={styles.lastUpdated}>Last Updated: {lastUpdated}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderIntroduction = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.introTitle}>Our Commitment to Your Privacy</Text>
        <Text style={styles.introText}>
          At ThinqScribe, we are committed to protecting your privacy and ensuring the security of your personal information. 
          This Privacy Policy explains how we collect, use, share, and protect your information when you use our academic 
          writing platform and services.
        </Text>
        <Text style={styles.introText}>
          By using ThinqScribe, you consent to the practices described in this Privacy Policy. We encourage you to read 
          this policy carefully and contact us if you have any questions.
        </Text>
      </Card.Content>
    </Card>
  );

  const renderSection = (section: typeof sections[0], index: number) => (
    <Card key={index} style={styles.sectionCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>{section.icon}</Text>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
        <Text style={styles.sectionContent}>{section.content}</Text>
      </Card.Content>
    </Card>
  );

  const renderContact = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>📞</Text>
          <Text style={styles.sectionTitle}>Contact Us</Text>
        </View>
        
        <Text style={styles.contactText}>
          If you have any questions about this Privacy Policy, please contact us:
        </Text>
        
        <View style={styles.contactInfo}>
          <Text style={styles.contactItem}>📧 Email: privacy@thinqscribe.com</Text>
          <Text style={styles.contactItem}>📍 Address: 123 Academic Ave, Education City, EC 12345</Text>
          <Text style={styles.contactItem}>📱 Phone: +1 (555) 123-4567</Text>
        </View>
        
        <View style={styles.contactButtons}>
          <Button mode="contained" onPress={() => router.push('/support')} style={styles.contactButton} icon="message">
            Contact Support
          </Button>
          <Button mode="outlined" onPress={() => router.push('/terms')} style={styles.termsButton} icon="file-document">
            View Terms of Service
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {renderHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderIntroduction()}
        {sections.map((section, index) => renderSection(section, index))}
        {renderContact()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingVertical: 30 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  headerTextContainer: { flex: 1, marginLeft: 12, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: 'white', marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginBottom: 12 },
  lastUpdated: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' },
  content: { flex: 1 },
  sectionCard: { margin: 16, marginTop: 8, borderRadius: 16, elevation: 3 },
  introTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 16, textAlign: 'center' },
  introText: { fontSize: 16, color: '#475569', lineHeight: 24, marginBottom: 16, textAlign: 'justify' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionIcon: { fontSize: 24, marginRight: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', flex: 1 },
  sectionContent: { fontSize: 14, color: '#475569', lineHeight: 22, textAlign: 'justify' },
  contactText: { fontSize: 16, color: '#475569', lineHeight: 22, marginBottom: 20, textAlign: 'center' },
  contactInfo: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 16 },
  contactItem: { fontSize: 14, color: '#1e293b', marginBottom: 8, lineHeight: 20 },
  contactButtons: { gap: 12 },
  contactButton: { backgroundColor: '#667eea', borderRadius: 12, paddingVertical: 4 },
  termsButton: { borderColor: '#667eea', borderRadius: 12, paddingVertical: 4 },
});

export default PrivacyScreen;