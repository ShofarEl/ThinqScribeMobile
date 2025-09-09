// ThinqScribe/src/screens/ExploreScreen.js
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/MobileAuthContext';

const ExploreScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  const serviceCategories = [
    {
      id: 'academic-writing',
      title: 'Academic Writing',
      description: 'Professional essays, research papers, and dissertations',
      icon: 'school',
      iconType: 'ionicons',
      color: '#015382',
      services: [
        'Essay Writing',
        'Research Papers',
        'Dissertations',
        'Thesis Writing',
        'Case Studies',
        'Literature Reviews'
      ]
    },
    {
      id: 'creative-writing',
      title: 'Creative Writing',
      description: 'Engaging stories, articles, and creative content',
      icon: 'create',
      iconType: 'ionicons',
      color: '#059669',
      services: [
        'Short Stories',
        'Blog Posts',
        'Articles',
        'Poetry',
        'Scripts',
        'Content Writing'
      ]
    },
    {
      id: 'business-writing',
      title: 'Business Writing',
      description: 'Professional business documents and reports',
      icon: 'business',
      iconType: 'ionicons',
      color: '#dc2626',
      services: [
        'Business Plans',
        'Reports',
        'Proposals',
        'Presentations',
        'Marketing Content',
        'Technical Writing'
      ]
    },
    {
      id: 'editing-services',
      title: 'Editing & Proofreading',
      description: 'Professional editing and proofreading services',
      icon: 'checkmark-circle',
      iconType: 'ionicons',
      color: '#7c3aed',
      services: [
        'Grammar Check',
        'Style Editing',
        'Content Review',
        'Formatting',
        'Citation Check',
        'Plagiarism Check'
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Find Writers',
      description: 'Browse qualified writers',
      icon: 'people',
      action: () => router.push('/writers'),
      color: '#015382'
    },
    {
      title: 'Create Project',
      description: 'Start a new project',
      icon: 'add-circle',
      action: () => router.push('/create-agreement'),
      color: '#059669'
    },
    {
      title: 'My Projects',
      description: 'View your projects',
      icon: 'folder',
      action: () => router.push('/'),
      color: '#dc2626'
    },
    {
      title: 'Get Help',
      description: 'Contact support',
      icon: 'help-circle',
      action: () => router.push('/support'),
      color: '#7c3aed'
    }
  ];

  const renderServiceCategory = (category) => (
    <Card key={category.id} style={styles.categoryCard} elevation={3}>
      <Card.Content style={styles.categoryContent}>
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
            {category.iconType === 'ionicons' ? (
              <Ionicons name={category.icon} size={24} color={category.color} />
            ) : (
              <MaterialCommunityIcons name={category.icon} size={24} color={category.color} />
            )}
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
          </View>
        </View>
        
        <View style={styles.servicesList}>
          {category.services.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <View style={[styles.serviceDot, { backgroundColor: category.color }]} />
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.exploreButton, { backgroundColor: category.color }]}
          onPress={() => router.push('/writers')}
        >
          <Text style={styles.exploreButtonText}>Explore {category.title}</Text>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );

  const renderQuickAction = (action) => (
    <TouchableOpacity 
      key={action.title}
      style={styles.quickActionCard}
      onPress={action.action}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
        <Ionicons name={action.icon} size={24} color={action.color} />
      </View>
      <Text style={styles.quickActionTitle}>{action.title}</Text>
      <Text style={styles.quickActionDescription}>{action.description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#015382', '#017DB0']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Explore Services</Text>
          <Text style={styles.headerSubtitle}>
            Discover professional writing services tailored for you
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <Card style={styles.welcomeCard} elevation={2}>
          <Card.Content>
            <Text style={styles.welcomeTitle}>
              Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </Text>
            <Text style={styles.welcomeText}>
              {user?.role === 'writer' 
                ? 'Explore opportunities to showcase your writing skills and connect with students.'
                : 'Find the perfect writer for your academic and creative writing needs.'
              }
            </Text>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Service Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <Text style={styles.sectionSubtitle}>
            Professional writing services across all disciplines
          </Text>
          {serviceCategories.map(renderServiceCategory)}
        </View>

        {/* Why Choose Us */}
        <Card style={styles.featuresCard} elevation={2}>
          <Card.Content>
            <Text style={styles.featuresTitle}>Why Choose ThinqScribe?</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="shield-checkmark" size={20} color="#059669" />
                <Text style={styles.featureText}>Quality Guaranteed</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="time" size={20} color="#059669" />
                <Text style={styles.featureText}>On-Time Delivery</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="lock-closed" size={20} color="#059669" />
                <Text style={styles.featureText}>Secure & Confidential</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="people" size={20} color="#059669" />
                <Text style={styles.featureText}>Expert Writers</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  welcomeCard: {
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  categoryCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  categoryContent: {
    padding: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  servicesList: {
    marginBottom: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  serviceText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  exploreButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  featuresCard: {
    marginBottom: 24,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
});

export default ExploreScreen;
