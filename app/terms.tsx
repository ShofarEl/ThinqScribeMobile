// Terms of Service Screen for ThinqScribe Mobile
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const TermsScreen: React.FC = () => {
  const lastUpdated = "December 15, 2024";

  const sections = [
    {
      title: "Acceptance of Terms",
      icon: "✅",
      content: "By accessing and using ThinqScribe, you accept and agree to be bound by the terms and provision of this agreement. These terms apply to all visitors, users, and others who access or use the service."
    },
    {
      title: "Service Description",
      icon: "📝",
      content: "ThinqScribe is an academic writing platform that connects students with qualified writers. We provide a marketplace for academic assistance, project management tools, and communication features."
    },
    {
      title: "User Responsibilities",
      icon: "👤",
      content: "Users must provide accurate information, maintain account security, use the service legally and ethically, respect intellectual property rights, and communicate professionally with other users."
    },
    {
      title: "Payment Terms",
      icon: "💳",
      content: "All payments are processed securely through our payment partners. Refunds are subject to our refund policy. Users are responsible for all charges incurred under their account."
    },
    {
      title: "Intellectual Property",
      icon: "©️",
      content: "All content and work delivered through our platform belongs to the paying user upon completion and payment. Writers retain rights to their general knowledge and expertise."
    },
    {
      title: "Prohibited Activities",
      icon: "🚫",
      content: "Users may not engage in fraudulent activities, violate academic integrity policies, share account credentials, attempt to circumvent our systems, or use the service for illegal purposes."
    },
    {
      title: "Limitation of Liability",
      icon: "⚖️",
      content: "ThinqScribe provides the platform 'as is' and makes no warranties about the service. Our liability is limited to the amount paid for the specific service in question."
    },
  ];

  const renderHeader = () => (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
      <View style={styles.headerContent}>
        <IconButton icon="arrow-left" iconColor="#ffffff" onPress={() => router.back()} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <Text style={styles.headerSubtitle}>Please read these terms carefully</Text>
          <Text style={styles.lastUpdated}>Last Updated: {lastUpdated}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderIntroduction = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <Text style={styles.introTitle}>Welcome to ThinqScribe</Text>
        <Text style={styles.introText}>
          These Terms of Service ("Terms") govern your use of ThinqScribe's academic writing platform and services. 
          By creating an account or using our services, you agree to these terms and our Privacy Policy.
        </Text>
        <Text style={styles.introText}>
          Please read these terms carefully. If you do not agree with any part of these terms, 
          you may not access or use our services.
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

  const renderAgreement = () => (
    <Card style={styles.sectionCard}>
      <Card.Content>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>📋</Text>
          <Text style={styles.sectionTitle}>Agreement and Changes</Text>
        </View>
        
        <Text style={styles.sectionContent}>
          By using ThinqScribe, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
          We reserve the right to modify these terms at any time, and such modifications will be effective immediately upon posting.
        </Text>
        
        <Text style={styles.sectionContent} style={{ marginTop: 16 }}>
          Your continued use of the service after any changes constitutes acceptance of the new terms. 
          We recommend reviewing these terms periodically for any updates.
        </Text>
        
        <View style={styles.contactButtons}>
          <Button mode="contained" onPress={() => router.push('/support')} style={styles.contactButton} icon="help-circle">
            Need Help?
          </Button>
          <Button mode="outlined" onPress={() => router.push('/privacy')} style={styles.privacyButton} icon="shield-account">
            Privacy Policy
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
        {renderAgreement()}
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
  contactButtons: { gap: 12, marginTop: 20 },
  contactButton: { backgroundColor: '#667eea', borderRadius: 12, paddingVertical: 4 },
  privacyButton: { borderColor: '#667eea', borderRadius: 12, paddingVertical: 4 },
});

export default TermsScreen;