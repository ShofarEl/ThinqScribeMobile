import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Button,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const Privacy = () => {
  const router = useRouter();

  const lastUpdated = "December 15, 2024";

  const sections = [
    {
      title: "Information We Collect",
      icon: "📋",
      content: [
        {
          subtitle: "Personal Information",
          text: "When you create an account, we collect your name, email address, phone number, and payment information. This information is necessary to provide our services and process transactions."
        },
        {
          subtitle: "Academic Information", 
          text: "We collect information about your academic projects, writing assignments, and communication with writers to ensure quality service delivery."
        },
        {
          subtitle: "Usage Data",
          text: "We automatically collect information about how you use our platform, including device information, IP address, browser type, and usage patterns."
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: "🔧",
      content: [
        {
          subtitle: "Service Provision",
          text: "We use your information to connect you with qualified writers, process payments, and deliver academic support services."
        },
        {
          subtitle: "Platform Improvement",
          text: "We analyze usage data to improve our platform, develop new features, and enhance user experience."
        },
        {
          subtitle: "Communication",
          text: "We use your contact information to send important updates, notifications about your orders, and customer support communications."
        },
        {
          subtitle: "Security",
          text: "We use your information to detect and prevent fraud, unauthorized access, and other security threats."
        }
      ]
    },
    {
      title: "Information Sharing",
      icon: "🤝",
      content: [
        {
          subtitle: "With Writers",
          text: "We share necessary project details with matched writers to enable them to provide academic support. Writers are bound by strict confidentiality agreements."
        },
        {
          subtitle: "Service Providers",
          text: "We may share information with trusted third-party service providers who help us operate our platform, such as payment processors and cloud storage providers."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information when required by law, to protect our rights, or to ensure the safety of our users and platform."
        }
      ]
    },
    {
      title: "Data Security",
      icon: "🔒",
      content: [
        {
          subtitle: "Encryption",
          text: "All sensitive data is encrypted both in transit and at rest using industry-standard encryption protocols."
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls to ensure only authorized personnel can access your personal information."
        },
        {
          subtitle: "Regular Audits",
          text: "We conduct regular security audits and assessments to identify and address potential vulnerabilities."
        },
        {
          subtitle: "Incident Response",
          text: "We have comprehensive incident response procedures in place to quickly address any security breaches."
        }
      ]
    },
    {
      title: "Your Rights",
      icon: "⚖️",
      content: [
        {
          subtitle: "Access & Portability",
          text: "You have the right to access your personal data and request a copy of the information we hold about you."
        },
        {
          subtitle: "Correction",
          text: "You can update or correct your personal information at any time through your account settings."
        },
        {
          subtitle: "Deletion",
          text: "You may request deletion of your personal data, subject to certain legal and contractual obligations."
        },
        {
          subtitle: "Opt-out",
          text: "You can opt out of non-essential communications and marketing materials at any time."
        }
      ]
    },
    {
      title: "Cookies & Tracking",
      icon: "🍪",
      content: [
        {
          subtitle: "Essential Cookies",
          text: "We use essential cookies to enable basic platform functionality, user authentication, and security features."
        },
        {
          subtitle: "Analytics Cookies",
          text: "We use analytics cookies to understand how users interact with our platform and improve our services."
        },
        {
          subtitle: "Cookie Management",
          text: "You can manage cookie preferences through your browser settings, though disabling certain cookies may affect platform functionality."
        }
      ]
    },
    {
      title: "International Transfers",
      icon: "🌍",
      content: [
        {
          subtitle: "Global Service",
          text: "As we serve users worldwide, your information may be transferred to and processed in countries other than your country of residence."
        },
        {
          subtitle: "Safeguards",
          text: "We implement appropriate safeguards to ensure your personal data receives adequate protection regardless of where it is processed."
        }
      ]
    },
    {
      title: "Data Retention",
      icon: "🗄️",
      content: [
        {
          subtitle: "Retention Period",
          text: "We retain your personal information for as long as necessary to provide our services and comply with legal obligations."
        },
        {
          subtitle: "Account Deletion",
          text: "When you delete your account, we will remove your personal information within 30 days, except where retention is required by law."
        }
      ]
    }
  ];

  const renderHeader = () => (
    <LinearGradient colors={['#015382', '#017DB0']} style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <Text style={styles.headerSubtitle}>
          Your privacy is our priority. Learn how we protect and use your information.
        </Text>
        <Text style={styles.lastUpdated}>
          Last Updated: {lastUpdated}
        </Text>
      </View>
    </LinearGradient>
  );

  const renderIntroduction = () => (
    <Card style={styles.sectionCard}>
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
    </Card>
  );

  const renderSection = (section, index) => (
    <Card key={index} style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{section.icon}</Text>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      
      {section.content.map((item, itemIndex) => (
        <View key={itemIndex} style={styles.contentItem}>
          <Text style={styles.contentSubtitle}>{item.subtitle}</Text>
          <Text style={styles.contentText}>{item.text}</Text>
        </View>
      ))}
    </Card>
  );

  const renderContact = () => (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>📞</Text>
        <Text style={styles.sectionTitle}>Contact Us</Text>
      </View>
      
      <Text style={styles.contactText}>
        If you have any questions about this Privacy Policy or our data practices, please contact us:
      </Text>
      
      <View style={styles.contactInfo}>
        <Text style={styles.contactItem}>📧 Email: privacy@thinqscribe.com</Text>
        <Text style={styles.contactItem}>📍 Address: 123 Academic Ave, Education City, EC 12345</Text>
        <Text style={styles.contactItem}>📱 Phone: +1 (555) 123-4567</Text>
      </View>
      
      <Text style={styles.responseText}>
        We will respond to privacy-related inquiries within 30 days of receipt.
      </Text>
      
      <View style={styles.contactButtons}>
        <Button
          mode="contained"
          onPress={() => router.push('/support')}
          style={styles.contactButton}
          labelStyle={styles.contactButtonText}
          icon="message"
        >
          Contact Support
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => router.push('/terms')}
          style={styles.termsButton}
          labelStyle={styles.termsButtonText}
          icon="file-document"
        >
          View Terms of Service
        </Button>
      </View>
    </Card>
  );

  const renderChanges = () => (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>🔄</Text>
        <Text style={styles.sectionTitle}>Policy Changes</Text>
      </View>
      
      <Text style={styles.contentText}>
        We may update this Privacy Policy from time to time to reflect changes in our practices, 
        technology, legal requirements, or other factors. When we make significant changes, we will:
      </Text>
      
      <View style={styles.changesList}>
        <Text style={styles.changesItem}>• Notify you via email or platform notification</Text>
        <Text style={styles.changesItem}>• Update the "Last Updated" date at the top of this policy</Text>
        <Text style={styles.changesItem}>• Provide a summary of key changes when significant</Text>
        <Text style={styles.changesItem}>• Give you time to review changes before they take effect</Text>
      </View>
      
      <Text style={styles.contentText}>
        Your continued use of ThinqScribe after any changes constitutes acceptance of the updated Privacy Policy.
      </Text>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderIntroduction()}
        {sections.map((section, index) => renderSection(section, index))}
        {renderChanges()}
        {renderContact()}
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
    marginBottom: 16,
  },
  lastUpdated: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  
  // Introduction Styles
  introTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'justify',
  },
  
  // Content Styles
  contentItem: {
    marginBottom: 20,
  },
  contentSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    textAlign: 'justify',
  },
  
  // Contact Styles
  contactText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  contactInfo: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  contactItem: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 20,
  },
  responseText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  contactButtons: {
    gap: 12,
  },
  contactButton: {
    backgroundColor: '#015382',
    borderRadius: 12,
    paddingVertical: 4,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  termsButton: {
    borderColor: '#015382',
    borderRadius: 12,
    paddingVertical: 4,
  },
  termsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#015382',
  },
  
  // Changes Styles
  changesList: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  changesItem: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
    lineHeight: 20,
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

export default Privacy;
