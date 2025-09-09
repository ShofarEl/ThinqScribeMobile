// Terms of Service Screen for ThinqScribe Mobile
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const TermsScreen: React.FC = () => {
  const lastUpdated = "December 15, 2024";
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

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


  const renderIntroduction = () => (
    <Animated.View style={[
      styles.sectionCard,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.95)']}
        style={styles.cardGradient}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.introIconContainer}>
            <Text style={styles.introIcon}>⚖️</Text>
          </View>
          <Text style={styles.introTitle}>Welcome to ThinqScribe</Text>
          <View style={styles.divider} />
          <Text style={styles.introText}>
            These Terms of Service ("Terms") govern your use of ThinqScribe's academic writing platform and services.
            By creating an account or using our services, you agree to these terms and our Privacy Policy.
          </Text>
          <Text style={styles.introText}>
            Please read these terms carefully. If you do not agree with any part of these terms,
            you may not access or use our services.
          </Text>
        </Card.Content>
      </LinearGradient>
    </Animated.View>
  );

  const renderSection = (section: typeof sections[0], index: number) => (
    <Animated.View
      key={index}
      style={[
        styles.sectionCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim.interpolate({
            inputRange: [0, 50],
            outputRange: [0, 50 + index * 10],
          }) }]
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.98)', 'rgba(248,250,252,0.95)']}
        style={styles.cardGradient}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>
            </View>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.sectionContent}>{section.content}</Text>
        </Card.Content>
      </LinearGradient>
    </Animated.View>
  );

  const renderAgreement = () => (
    <Animated.View style={[
      styles.sectionCard,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim.interpolate({
          inputRange: [0, 50],
          outputRange: [0, 80],
        }) }]
      }
    ]}>
      <LinearGradient
        colors={['rgba(220, 38, 38, 0.05)', 'rgba(239, 68, 68, 0.05)']}
        style={styles.cardGradient}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.sectionIcon}>📋</Text>
            </View>
            <Text style={styles.sectionTitle}>Agreement and Changes</Text>
          </View>
          <View style={styles.divider} />

          <Text style={styles.sectionContent}>
            By using ThinqScribe, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            We reserve the right to modify these terms at any time, and such modifications will be effective immediately upon posting.
          </Text>

          <Text style={styles.sectionContent} style={{ marginTop: 16 }}>
            Your continued use of the service after any changes constitutes acceptance of the new terms.
            We recommend reviewing these terms periodically for any updates.
          </Text>

          <View style={styles.contactButtons}>
            <Button
              mode="contained"
              onPress={() => router.push('/support')}
              style={styles.contactButton}
              icon="help-circle"
              labelStyle={styles.buttonText}
            >
              Need Help?
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.push('/privacy')}
              style={styles.privacyButton}
              icon="shield-account"
              labelStyle={styles.outlineButtonText}
            >
              Privacy Policy
            </Button>
          </View>
        </Card.Content>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <Animated.ScrollView
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 20],
            }) }]
          }
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderIntroduction()}
        {sections.map((section, index) => renderSection(section, index))}
        {renderAgreement()}
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
  },
  cardContent: {
    padding: 24,
  },
  introIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  introIcon: {
    fontSize: 48,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  introText: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 26,
    marginBottom: 16,
    textAlign: 'justify',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sectionIcon: {
    fontSize: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
    letterSpacing: -0.2,
  },
  sectionContent: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 24,
    textAlign: 'justify',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    marginBottom: 20,
    borderRadius: 0.5,
  },
  contactButtons: {
    gap: 16,
    marginTop: 20,
  },
  contactButton: {
    backgroundColor: '#153862',
    borderRadius: 16,
    paddingVertical: 6,
    elevation: 4,
    shadowColor: '#153862',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  privacyButton: {
    borderColor: '#153862',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#153862',
    letterSpacing: 0.5,
  },
});

export default TermsScreen;