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

const Terms = () => {
  const router = useRouter();

  const lastUpdated = "December 15, 2024";

  const sections = [
    {
      title: "Acceptance of Terms",
      icon: "✅",
      content: [
        {
          text: "By accessing and using ThinqScribe, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not use our services."
        },
        {
          text: "These terms apply to all users of ThinqScribe, including students, writers, and any other parties who access or use our platform."
        }
      ]
    },
    {
      title: "Service Description",
      icon: "📚",
      content: [
        {
          subtitle: "Platform Purpose",
          text: "ThinqScribe is an academic support platform that connects students with qualified writers to provide assistance with academic writing, research, and related educational services."
        },
        {
          subtitle: "Service Scope",
          text: "Our services include academic writing assistance, research support, editing, proofreading, and educational guidance. We do not provide completed assignments intended for direct submission."
        },
        {
          subtitle: "Educational Use",
          text: "All services are intended for educational purposes, including learning, reference, and academic skill development. Users are responsible for ensuring compliance with their institution's academic integrity policies."
        }
      ]
    },
    {
      title: "User Accounts",
      icon: "👤",
      content: [
        {
          subtitle: "Account Creation",
          text: "You must provide accurate, complete, and current information when creating an account. You are responsible for maintaining the confidentiality of your account credentials."
        },
        {
          subtitle: "Account Responsibility",
          text: "You are solely responsible for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account."
        },
        {
          subtitle: "Account Termination",
          text: "We reserve the right to suspend or terminate accounts that violate these terms or engage in inappropriate behavior on our platform."
        }
      ]
    },
    {
      title: "User Conduct",
      icon: "⚖️",
      content: [
        {
          subtitle: "Prohibited Activities",
          text: "Users may not engage in illegal activities, harassment, spam, fraud, or any behavior that violates academic integrity or platform security."
        },
        {
          subtitle: "Academic Integrity",
          text: "Users must comply with their institution's academic integrity policies. Our services are intended to support learning, not to facilitate academic dishonesty."
        },
        {
          subtitle: "Respectful Communication",
          text: "All users must maintain respectful and professional communication with other users, writers, and support staff."
        }
      ]
    },
    {
      title: "Writer Requirements",
      icon: "✍️",
      content: [
        {
          subtitle: "Qualifications",
          text: "Writers must possess relevant academic qualifications and demonstrate expertise in their designated subject areas through our verification process."
        },
        {
          subtitle: "Quality Standards",
          text: "Writers must deliver original, high-quality work that meets academic standards and project requirements within agreed timeframes."
        },
        {
          subtitle: "Confidentiality",
          text: "Writers must maintain strict confidentiality regarding all client information and project details, in accordance with our privacy policies."
        }
      ]
    },
    {
      title: "Payment Terms",
      icon: "💰",
      content: [
        {
          subtitle: "Payment Processing",
          text: "Payments are processed securely through our integrated payment system. We accept major credit cards and other approved payment methods."
        },
        {
          subtitle: "Pricing",
          text: "Service pricing is clearly displayed on our platform. Prices may vary based on project complexity, urgency, and writer expertise level."
        },
        {
          subtitle: "Refunds",
          text: "Refunds may be available in certain circumstances as outlined in our Refund Policy. Requests must be submitted through our support system."
        },
        {
          subtitle: "Disputes",
          text: "Payment disputes should be reported immediately through our platform. We will investigate all legitimate concerns and take appropriate action."
        }
      ]
    },
    {
      title: "Intellectual Property",
      icon: "📄",
      content: [
        {
          subtitle: "Platform Content",
          text: "ThinqScribe owns all rights to the platform design, software, logos, and other proprietary content. Users may not reproduce or distribute this content without permission."
        },
        {
          subtitle: "User Content",
          text: "Users retain ownership of content they submit but grant ThinqScribe a license to use such content for service provision and platform improvement."
        },
        {
          subtitle: "Delivered Work",
          text: "Upon payment completion, students receive full rights to commissioned work, subject to our terms regarding academic integrity and proper use."
        }
      ]
    },
    {
      title: "Privacy & Data Protection",
      icon: "🔒",
      content: [
        {
          subtitle: "Data Collection",
          text: "We collect and process personal data as described in our Privacy Policy, which forms an integral part of these terms."
        },
        {
          subtitle: "Data Security",
          text: "We implement industry-standard security measures to protect user data and maintain platform security."
        },
        {
          subtitle: "Third-Party Services",
          text: "Our platform may integrate with third-party services for payment processing, analytics, and other functionality, subject to their respective privacy policies."
        }
      ]
    },
    {
      title: "Disclaimers",
      icon: "⚠️",
      content: [
        {
          subtitle: "Service Availability",
          text: "While we strive for continuous service availability, we cannot guarantee uninterrupted access to our platform and services."
        },
        {
          subtitle: "Academic Outcomes",
          text: "We do not guarantee specific academic outcomes or grades. Our services are intended to support learning and skill development."
        },
        {
          subtitle: "Writer Performance",
          text: "While we carefully screen our writers, we cannot guarantee the performance of individual writers in every circumstance."
        }
      ]
    },
    {
      title: "Limitation of Liability",
      icon: "🛡️",
      content: [
        {
          subtitle: "Service Limitations",
          text: "Our liability is limited to the amount paid for specific services. We are not liable for indirect, consequential, or incidental damages."
        },
        {
          subtitle: "User Responsibility",
          text: "Users are responsible for ensuring proper use of our services in compliance with their academic institution's policies and applicable laws."
        }
      ]
    },
    {
      title: "Dispute Resolution",
      icon: "🤝",
      content: [
        {
          subtitle: "Internal Resolution",
          text: "We encourage users to first contact our support team to resolve any disputes or concerns about our services."
        },
        {
          subtitle: "Mediation",
          text: "If internal resolution is not successful, disputes may be resolved through mediation or arbitration as specified in applicable laws."
        },
        {
          subtitle: "Legal Jurisdiction",
          text: "These terms are governed by the laws of the jurisdiction where ThinqScribe is incorporated, subject to applicable international regulations."
        }
      ]
    },
    {
      title: "Changes to Terms",
      icon: "🔄",
      content: [
        {
          subtitle: "Modification Rights",
          text: "We reserve the right to modify these terms at any time. Significant changes will be communicated to users through email or platform notifications."
        },
        {
          subtitle: "Effective Date",
          text: "Changes become effective immediately upon posting unless otherwise specified. Continued use of our services constitutes acceptance of modified terms."
        }
      ]
    }
  ];

  const renderHeader = () => (
    <LinearGradient colors={['#015382', '#017DB0']} style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <Text style={styles.headerSubtitle}>
          Please read these terms carefully before using ThinqScribe services.
        </Text>
        <Text style={styles.lastUpdated}>
          Last Updated: {lastUpdated}
        </Text>
      </View>
    </LinearGradient>
  );

  const renderIntroduction = () => (
    <Card style={styles.sectionCard}>
      <Text style={styles.introTitle}>Welcome to ThinqScribe</Text>
      <Text style={styles.introText}>
        These Terms of Service ("Terms") govern your use of ThinqScribe's academic writing platform and services. 
        By accessing or using our platform, you agree to comply with and be bound by these terms.
      </Text>
      <Text style={styles.introText}>
        ThinqScribe is committed to providing high-quality academic support while maintaining ethical standards 
        and promoting academic integrity. Please read these terms carefully and contact us if you have any questions.
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
          {item.subtitle && (
            <Text style={styles.contentSubtitle}>{item.subtitle}</Text>
          )}
          <Text style={styles.contentText}>{item.text}</Text>
        </View>
      ))}
    </Card>
  );

  const renderContact = () => (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>📞</Text>
        <Text style={styles.sectionTitle}>Contact Information</Text>
      </View>
      
      <Text style={styles.contactText}>
        If you have any questions about these Terms of Service, please contact us:
      </Text>
      
      <View style={styles.contactInfo}>
        <Text style={styles.contactItem}>📧 Email: legal@thinqscribe.com</Text>
        <Text style={styles.contactItem}>📍 Address: 123 Academic Ave, Education City, EC 12345</Text>
        <Text style={styles.contactItem}>📱 Phone: +1 (555) 123-4567</Text>
        <Text style={styles.contactItem}>🌐 Website: www.thinqscribe.com</Text>
      </View>
      
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
          onPress={() => router.push('/privacy')}
          style={styles.privacyButton}
          labelStyle={styles.privacyButtonText}
          icon="shield-check"
        >
          Privacy Policy
        </Button>
      </View>
    </Card>
  );

  const renderAcknowledgment = () => (
    <Card style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>📝</Text>
        <Text style={styles.sectionTitle}>Acknowledgment</Text>
      </View>
      
      <Text style={styles.contentText}>
        By using ThinqScribe, you acknowledge that you have read these Terms of Service, understand them, 
        and agree to be bound by their terms and conditions. You also acknowledge that these terms, together 
        with our Privacy Policy, represent the complete agreement between you and ThinqScribe regarding the 
        use of our services.
      </Text>
      
      <View style={styles.acknowledgmentBox}>
        <Text style={styles.acknowledgmentTitle}>✓ Key Points to Remember:</Text>
        <Text style={styles.acknowledgmentItem}>• Use our services for educational and learning purposes</Text>
        <Text style={styles.acknowledgmentItem}>• Maintain academic integrity and follow your institution's policies</Text>
        <Text style={styles.acknowledgmentItem}>• Treat all users and writers with respect and professionalism</Text>
        <Text style={styles.acknowledgmentItem}>• Report any issues or concerns through our support system</Text>
        <Text style={styles.acknowledgmentItem}>• Keep your account information secure and up to date</Text>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderIntroduction()}
        {sections.map((section, index) => renderSection(section, index))}
        {renderAcknowledgment()}
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
    marginBottom: 20,
  },
  contactItem: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 20,
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
  privacyButton: {
    borderColor: '#015382',
    borderRadius: 12,
    paddingVertical: 4,
  },
  privacyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#015382',
  },
  
  // Acknowledgment Styles
  acknowledgmentBox: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  acknowledgmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 12,
  },
  acknowledgmentItem: {
    fontSize: 14,
    color: '#0c4a6e',
    marginBottom: 6,
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

export default Terms;
