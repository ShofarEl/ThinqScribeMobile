import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Button,
  Avatar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const About = () => {
  const router = useRouter();

  const teamMembers = [
    {
      name: 'Dr. Sarah Chen',
      role: 'CEO & Founder',
      avatar: '👩‍💼',
      description: 'Former Stanford professor with 15+ years in educational technology.'
    },
    {
      name: 'Michael Rodriguez',
      role: 'CTO',
      avatar: '👨‍💻',
      description: 'Tech veteran who built scalable platforms for over 10 million users.'
    },
    {
      name: 'Dr. Amina Hassan',
      role: 'Head of Academic Excellence',
      avatar: '👩‍🎓',
      description: 'PhD in Education with expertise in academic writing and research.'
    }
  ];

  const achievements = [
    {
      icon: '🎓',
      number: '50,000+',
      label: 'Students Helped',
      description: 'Academic papers and assignments completed'
    },
    {
      icon: '✍️',
      number: '5,000+',
      label: 'Expert Writers',
      description: 'Qualified academic professionals'
    },
    {
      icon: '⭐',
      number: '4.9/5',
      label: 'Average Rating',
      description: 'Customer satisfaction score'
    },
    {
      icon: '🌍',
      number: '150+',
      label: 'Countries',
      description: 'Global reach and accessibility'
    }
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Academic Excellence',
      description: 'We maintain the highest standards in academic writing and research, ensuring every piece of work meets university-level requirements.'
    },
    {
      icon: '🤝',
      title: 'Ethical Practices',
      description: 'We promote academic integrity and provide guidance that helps students learn and improve their own writing skills.'
    },
    {
      icon: '⚡',
      title: 'Innovation',
      description: 'We continuously evolve our platform with cutting-edge technology to provide the best user experience.'
    },
    {
      icon: '🌟',
      title: 'Accessibility',
      description: 'Quality academic support should be accessible to all students, regardless of their background or location.'
    }
  ];

  const renderHeader = () => (
    <LinearGradient colors={['#015382', '#017DB0']} style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>About ThinqScribe</Text>
        <Text style={styles.headerSubtitle}>
          Empowering students worldwide with premium academic writing support
        </Text>
      </View>
    </LinearGradient>
  );

  const renderMissionSection = () => (
    <Card style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Our Mission</Text>
      <Text style={styles.missionText}>
        At ThinqScribe, we believe every student deserves access to high-quality academic support. 
        Our mission is to bridge the gap between academic challenges and student success by connecting 
        learners with expert writers and researchers who can guide them toward academic excellence.
      </Text>
      
      <Text style={styles.missionText}>
        Founded in 2020, we've grown from a small startup to a trusted platform serving students 
        across 150+ countries. Our commitment to quality, integrity, and innovation has made us 
        a leader in the academic support industry.
      </Text>
    </Card>
  );

  const renderAchievements = () => (
    <Card style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Our Impact</Text>
      <View style={styles.achievementsGrid}>
        {achievements.map((achievement, index) => (
          <View key={index} style={styles.achievementItem}>
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            <Text style={styles.achievementNumber}>{achievement.number}</Text>
            <Text style={styles.achievementLabel}>{achievement.label}</Text>
            <Text style={styles.achievementDescription}>{achievement.description}</Text>
          </View>
        ))}
      </View>
    </Card>
  );

  const renderValues = () => (
    <Card style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Our Values</Text>
      <View style={styles.valuesContainer}>
        {values.map((value, index) => (
          <View key={index} style={styles.valueItem}>
            <View style={styles.valueHeader}>
              <Text style={styles.valueIcon}>{value.icon}</Text>
              <Text style={styles.valueTitle}>{value.title}</Text>
            </View>
            <Text style={styles.valueDescription}>{value.description}</Text>
          </View>
        ))}
      </View>
    </Card>
  );

  const renderTeam = () => (
    <Card style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Leadership Team</Text>
      <View style={styles.teamContainer}>
        {teamMembers.map((member, index) => (
          <View key={index} style={styles.teamMember}>
            <Text style={styles.memberAvatar}>{member.avatar}</Text>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
              <Text style={styles.memberDescription}>{member.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );

  const renderQuality = () => (
    <Card style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Quality Assurance</Text>
      <View style={styles.qualityContainer}>
        <View style={styles.qualityItem}>
          <Text style={styles.qualityIcon}>🔍</Text>
          <Text style={styles.qualityTitle}>Rigorous Screening</Text>
          <Text style={styles.qualityDescription}>
            All writers undergo comprehensive background checks and skill assessments
          </Text>
        </View>
        
        <View style={styles.qualityItem}>
          <Text style={styles.qualityIcon}>📚</Text>
          <Text style={styles.qualityTitle}>Academic Standards</Text>
          <Text style={styles.qualityDescription}>
            Every project is reviewed for academic integrity and quality compliance
          </Text>
        </View>
        
        <View style={styles.qualityItem}>
          <Text style={styles.qualityIcon}>🔒</Text>
          <Text style={styles.qualityTitle}>Secure Platform</Text>
          <Text style={styles.qualityDescription}>
            Bank-grade security ensures your data and communications are protected
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderContact = () => (
    <Card style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Get in Touch</Text>
      <Text style={styles.contactText}>
        Have questions about our platform or need support? We're here to help!
      </Text>
      
      <View style={styles.contactButtons}>
        <Button
          mode="contained"
          onPress={() => router.push('/support')}
          style={styles.contactButton}
          labelStyle={styles.contactButtonText}
          icon="headset"
        >
          Contact Support
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => router.push('/signup')}
          style={styles.joinButton}
          labelStyle={styles.joinButtonText}
          icon="account-plus"
        >
          Join ThinqScribe
        </Button>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderMissionSection()}
        {renderAchievements()}
        {renderValues()}
        {renderTeam()}
        {renderQuality()}
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
  },
  
  // Section Styles
  sectionCard: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // Mission Styles
  missionText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'justify',
  },
  
  // Achievements Styles
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  achievementItem: {
    width: (width - 80) / 2,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  achievementNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#015382',
    marginBottom: 4,
  },
  achievementLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Values Styles
  valuesContainer: {
    gap: 20,
  },
  valueItem: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#015382',
  },
  valueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  valueIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  valueDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  
  // Team Styles
  teamContainer: {
    gap: 20,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  memberAvatar: {
    fontSize: 48,
    marginRight: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    fontWeight: '600',
    color: '#015382',
    marginBottom: 8,
  },
  memberDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 18,
  },
  
  // Quality Styles
  qualityContainer: {
    gap: 16,
  },
  qualityItem: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  qualityIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  qualityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  qualityDescription: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Contact Styles
  contactText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
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
  joinButton: {
    borderColor: '#015382',
    borderRadius: 12,
    paddingVertical: 4,
  },
  joinButtonText: {
    fontSize: 16,
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

export default About;
