import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View
} from 'react-native';
import {
    Button
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const About = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const teamMembers = [
    {
      name: 'Tubokeyi Anthony',
      role: 'CEO & Founder',
      avatar: '👑',
      description: 'Visionary leader driving innovation in academic support and educational technology.'
    },
    {
      name: 'Tubokeyi Michael',
      role: 'CTO',
      avatar: '⚙️',
      description: 'Tech expert who built scalable platforms for over 10 million users.'
    },
    {
      name: 'Oluwatomisin Momoh',
      role: 'COO',
      avatar: '📊',
      description: 'Operations specialist ensuring seamless delivery of academic services.'
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


  const renderMissionSection = () => (
    <Animated.View style={[
      styles.sectionCard,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim.interpolate({
          inputRange: [0, 50],
          outputRange: [0, 20],
        }) }]
      }
    ]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.98)', 'rgba(248,250,252,0.95)']}
        style={styles.cardGradient}
      >
        <View style={styles.missionIconContainer}>
          <Text style={styles.missionIcon}>🎯</Text>
        </View>
      <Text style={styles.sectionTitle}>Our Mission</Text>
        <View style={styles.divider} />
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
      </LinearGradient>
    </Animated.View>
  );

  const renderAchievements = () => (
    <Animated.View style={[
      styles.sectionCard,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim.interpolate({
          inputRange: [0, 50],
          outputRange: [0, 30],
        }) }]
      }
    ]}>
      <LinearGradient
        colors={['rgba(124, 58, 237, 0.05)', 'rgba(139, 92, 246, 0.05)']}
        style={styles.cardGradient}
      >
      <Text style={styles.sectionTitle}>Our Impact</Text>
        <View style={styles.divider} />
      <View style={styles.achievementsGrid}>
        {achievements.map((achievement, index) => (
            <Animated.View
              key={index}
              style={[
                styles.achievementItem,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, 30 + index * 15],
                  }) }]
                }
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(248,250,252,0.8)']}
                style={styles.achievementGradient}
              >
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            <Text style={styles.achievementNumber}>{achievement.number}</Text>
            <Text style={styles.achievementLabel}>{achievement.label}</Text>
            <Text style={styles.achievementDescription}>{achievement.description}</Text>
              </LinearGradient>
            </Animated.View>
        ))}
      </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderValues = () => (
    <Animated.View style={[
      styles.sectionCard,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim.interpolate({
          inputRange: [0, 50],
          outputRange: [0, 40],
        }) }]
      }
    ]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.98)', 'rgba(248,250,252,0.95)']}
        style={styles.cardGradient}
      >
      <Text style={styles.sectionTitle}>Our Values</Text>
        <View style={styles.divider} />
      <View style={styles.valuesContainer}>
        {values.map((value, index) => (
            <Animated.View
              key={index}
              style={[
                styles.valueItem,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, 40 + index * 20],
                  }) }]
                }
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.9)']}
                style={styles.valueGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
            <View style={styles.valueHeader}>
                  <View style={styles.valueIconContainer}>
              <Text style={styles.valueIcon}>{value.icon}</Text>
                  </View>
              <Text style={styles.valueTitle}>{value.title}</Text>
            </View>
            <Text style={styles.valueDescription}>{value.description}</Text>
              </LinearGradient>
            </Animated.View>
        ))}
      </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderTeam = () => (
    <Animated.View style={[
      styles.sectionCard,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim.interpolate({
          inputRange: [0, 50],
          outputRange: [0, 50],
        }) }]
      }
    ]}>
      <LinearGradient
        colors={['rgba(124, 58, 237, 0.03)', 'rgba(139, 92, 246, 0.03)']}
        style={styles.cardGradient}
      >
      <Text style={styles.sectionTitle}>Leadership Team</Text>
        <View style={styles.divider} />
      <View style={styles.teamContainer}>
        {teamMembers.map((member, index) => (
            <Animated.View
              key={index}
              style={[
                styles.teamMember,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, 50 + index * 25],
                  }) }]
                }
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.9)']}
                style={styles.teamCardGradient}
              >
                <View style={styles.teamMemberContent}>
                  <View style={styles.avatarContainer}>
            <Text style={styles.memberAvatar}>{member.avatar}</Text>
                    <LinearGradient
                      colors={['#153862', '#2563eb']}
                      style={styles.avatarBorder}
                    />
                  </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
              <Text style={styles.memberDescription}>{member.description}</Text>
            </View>
          </View>
              </LinearGradient>
            </Animated.View>
        ))}
      </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderQuality = () => (
    <Animated.View style={[
      styles.sectionCard,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim.interpolate({
          inputRange: [0, 50],
          outputRange: [0, 60],
        }) }]
      }
    ]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.98)', 'rgba(248,250,252,0.95)']}
        style={styles.cardGradient}
      >
      <Text style={styles.sectionTitle}>Quality Assurance</Text>
        <View style={styles.divider} />
      <View style={styles.qualityContainer}>
          {[
            {
              icon: '🔍',
              title: 'Rigorous Screening',
              description: 'All writers undergo comprehensive background checks and skill assessments'
            },
            {
              icon: '📚',
              title: 'Academic Standards',
              description: 'Every project is reviewed for academic integrity and quality compliance'
            },
            {
              icon: '🔒',
              title: 'Secure Platform',
              description: 'Bank-grade security ensures your data and communications are protected'
            }
          ].map((item, index) => (
            <Animated.View
              key={index}
              style={[
                styles.qualityItem,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, 60 + index * 15],
                  }) }]
                }
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.9)']}
                style={styles.qualityGradient}
              >
                <View style={styles.qualityIconContainer}>
                  <Text style={styles.qualityIcon}>{item.icon}</Text>
        </View>
                <Text style={styles.qualityTitle}>{item.title}</Text>
                <Text style={styles.qualityDescription}>{item.description}</Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>
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
          outputRange: [0, 70],
        }) }]
      }
    ]}>
      <LinearGradient
        colors={['rgba(124, 58, 237, 0.05)', 'rgba(139, 92, 246, 0.05)']}
        style={styles.cardGradient}
      >
      <Text style={styles.sectionTitle}>Get in Touch</Text>
        <View style={styles.divider} />
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
      </LinearGradient>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 10],
            }) }]
          }
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderMissionSection()}
        {renderAchievements()}
        {renderValues()}
        {renderTeam()}
        {renderQuality()}
        {renderContact()}
      </Animated.ScrollView>

      {/* Back Button */}
      <Animated.View style={[
        styles.backButtonContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <Button
          mode="text"
          onPress={() => router.back()}
          labelStyle={styles.backButtonText}
          icon="arrow-left"
        >
          Back
        </Button>
      </Animated.View>
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
  scrollContent: {
    paddingBottom: 100,
  },
  
  
  // Section Styles
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    marginBottom: 24,
    borderRadius: 0.5,
  },
  
  // Mission Styles
  missionIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  missionIcon: {
    fontSize: 48,
  },
  missionText: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 26,
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
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  achievementGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  achievementIcon: {
    fontSize: 36,
    marginBottom: 16,
  },
  achievementNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#153862',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  achievementLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // Values Styles
  valuesContainer: {
    gap: 20,
  },
  valueItem: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  valueGradient: {
    flex: 1,
    padding: 20,
    borderLeftWidth: 6,
    borderLeftColor: '#15382',
  },
  valueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  valueIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  valueIcon: {
    fontSize: 24,
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  valueDescription: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
  },
  
  // Team Styles
  teamContainer: {
    gap: 20,
  },
  teamMember: {
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  teamCardGradient: {
    flex: 1,
  },
  teamMemberContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  memberAvatar: {
    fontSize: 56,
  },
  avatarBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 32,
    zIndex: -1,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  memberRole: {
    fontSize: 15,
    fontWeight: '700',
    color: '#153862',
    marginBottom: 12,
  },
  memberDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  
  // Quality Styles
  qualityContainer: {
    gap: 16,
  },
  qualityItem: {
    alignItems: 'center',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  qualityGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    padding: 24,
  },
  qualityIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  qualityIcon: {
    fontSize: 28,
  },
  qualityTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'center',
  },
  qualityDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Contact Styles
  contactText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
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
  contactButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  joinButton: {
    borderColor: '#153862',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 6,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#153862',
    letterSpacing: 0.5,
  },
  
  // Back Button Styles
  backButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default About;
