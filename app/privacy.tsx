// Privacy Policy Screen for ThinqScribe Mobile
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const PrivacyScreen: React.FC = () => {
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
            <Text style={styles.introIcon}>🔒</Text>
          </View>
          <Text style={styles.introTitle}>Our Commitment to Your Privacy</Text>
          <View style={styles.divider} />
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

  const renderContact = () => (
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
        colors={['rgba(1, 83, 130, 0.05)', 'rgba(30, 64, 175, 0.05)']}
        style={styles.cardGradient}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.sectionIcon}>📞</Text>
            </View>
            <Text style={styles.sectionTitle}>Contact Us</Text>
          </View>
          <View style={styles.divider} />

          <Text style={styles.contactText}>
            If you have any questions about this Privacy Policy, please contact us:
          </Text>

          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📧</Text>
              <Text style={styles.contactText}>business@thinqscribe.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📍</Text>
              <Text style={styles.contactText}>123 Academic Ave, Education City, EC 12345</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📱</Text>
              <Text style={styles.contactText}>+234 811 116 1612</Text>
            </View>
          </View>

          <View style={styles.contactButtons}>
            <Button
              mode="contained"
              onPress={() => router.push('/support')}
              style={styles.contactButton}
              icon="message"
              labelStyle={styles.buttonText}
            >
              Contact Support
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.push('/terms')}
              style={styles.termsButton}
              icon="file-document"
              labelStyle={styles.outlineButtonText}
            >
              View Terms of Service
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
        {renderContact()}
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
    backgroundColor: 'rgba(1, 83, 130, 0.1)',
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
    backgroundColor: 'rgba(1, 83, 130, 0.2)',
    marginBottom: 20,
    borderRadius: 0.5,
  },
  contactText: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  contactInfo: {
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(1, 83, 130, 0.1)',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  contactButtons: {
    gap: 16,
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
  termsButton: {
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

export default PrivacyScreen;