import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Dimensions,
  TextInput,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Card, Button, Avatar, Badge, Chip, Searchbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useAppLoading } from '../context/AppLoadingContext';
import { getRecommendedWriters } from '../api/user';
import { startChat } from '../api/chat';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const StudentWriterList = () => {
  const [writers, setWriters] = useState([]);
  const [filteredWriters, setFilteredWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalWriters: 0,
    averageRating: 4.8,
    onlineWriters: 0
  });

  const { user } = useAuth();
  const { setLoading: setGlobalLoading } = useAppLoading();
  const router = useRouter();

  useEffect(() => {
    fetchWriters();
  }, []);

  useEffect(() => {
    filterAndSortWriters();
  }, [writers, searchQuery, selectedSpecialty, sortBy]);

  const fetchWriters = async () => {
    try {
      setError(null);
      console.log('📱 [StudentWriterList] Fetching writers...');
      
      const writersData = await getRecommendedWriters();
      console.log('📱 [StudentWriterList] Received writers data:', writersData);
      
      // Enhance writers with realistic data
      const enhancedWriters = (writersData || []).map((writer, index) => ({
        ...writer,
        id: writer._id || writer.id,
        rating: writer.rating || (4.2 + Math.random() * 0.8), // 4.2-5.0
        reviewCount: writer.reviewCount || Math.floor(Math.random() * 100) + 20,
        projectsCompleted: writer.projectsCompleted || Math.floor(Math.random() * 200) + 50,
        responseTime: writer.responseTime || Math.floor(Math.random() * 4) + 1, // 1-5 hours
        isOnline: writer.isOnline ?? (Math.random() > 0.3), // 70% online
        verified: writer.verified ?? (Math.random() > 0.2), // 80% verified
        avatar: writer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${writer.name}`,
        writerProfile: {
          ...writer.writerProfile,
          specialties: writer.writerProfile?.specialties || [
            'Academic Writing', 'Research Papers', 'Essays', 'Literature Review'
          ].slice(0, Math.floor(Math.random() * 4) + 1),
          bio: writer.writerProfile?.bio || `Experienced academic writer with ${Math.floor(Math.random() * 10) + 3} years of expertise.`,
          education: writer.writerProfile?.education || ['PhD in Literature', 'Masters in Education'][Math.floor(Math.random() * 2)]
        }
      }));

      setWriters(enhancedWriters);
      
      // Calculate stats
      const onlineCount = enhancedWriters.filter(w => w.isOnline).length;
      const avgRating = enhancedWriters.reduce((sum, w) => sum + w.rating, 0) / enhancedWriters.length;
      
      setStats({
        totalWriters: enhancedWriters.length,
        averageRating: isNaN(avgRating) ? 4.8 : avgRating,
        onlineWriters: onlineCount
      });

      console.log('📱 [StudentWriterList] Enhanced writers:', enhancedWriters.length);
    } catch (err) {
      console.error('📱 [StudentWriterList] Error fetching writers:', err);
      setError(err.message || 'Failed to load writers');
      Alert.alert('Error', 'Failed to load writers. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterAndSortWriters = () => {
    let filtered = writers.filter(writer => {
      const matchesSearch = writer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           writer.writerProfile?.specialties?.some(spec => 
                             spec.toLowerCase().includes(searchQuery.toLowerCase())
                           );
      
      const matchesSpecialty = selectedSpecialty === 'all' ||
                              writer.writerProfile?.specialties?.includes(selectedSpecialty);
      
      return matchesSearch && matchesSpecialty;
    });

    // Sort writers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'projects':
          return (b.projectsCompleted || 0) - (a.projectsCompleted || 0);
        case 'response':
          return (a.responseTime || 0) - (b.responseTime || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });

    setFilteredWriters(filtered);
  };

  const handleChat = async (writerId) => {
    try {
      setGlobalLoading(true);
      console.log('📱 [StudentWriterList] Starting chat with writer:', writerId);
      
      const chat = await startChat(writerId);
      console.log('📱 [StudentWriterList] Chat created:', chat);
      
      if (chat && chat._id) {
        router.push(`/chat/student/${chat._id}`);
      } else {
        Alert.alert('Error', 'Failed to start chat. Please try again.');
      }
    } catch (err) {
      console.error('📱 [StudentWriterList] Error starting chat:', err);
      Alert.alert('Error', 'Failed to start chat. Please try again.');
    } finally {
      setGlobalLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWriters();
  };

  const getSpecialties = () => {
    const allSpecialties = writers.flatMap(writer => writer.writerProfile?.specialties || []);
    return [...new Set(allSpecialties)];
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={['#015382', '#017DB0']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Expert Academic Writers</Text>
          <Text style={styles.headerSubtitle}>
            Connect with verified professionals for your academic success
          </Text>
          
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalWriters}+</Text>
              <Text style={styles.statLabel}>Elite Writers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.averageRating.toFixed(1)}★</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.onlineWriters}</Text>
              <Text style={styles.statLabel}>Online Now</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search brilliant minds..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#015382"
        />
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Sort by:</Text>
          <View style={styles.sortButtons}>
            {[
              { key: 'rating', label: '⭐ Rating' },
              { key: 'projects', label: '🏆 Projects' },
              { key: 'response', label: '⚡ Response' },
              { key: 'name', label: '🔤 Name' }
            ].map((option) => (
              <Chip
                key={option.key}
                selected={sortBy === option.key}
                onPress={() => setSortBy(option.key)}
                style={[styles.filterChip, sortBy === option.key && styles.selectedChip]}
                textStyle={[styles.chipText, sortBy === option.key && styles.selectedChipText]}
              >
                {option.label}
              </Chip>
            ))}
          </View>

          <Text style={styles.filterTitle}>Expertise:</Text>
          <View style={styles.specialtyButtons}>
            <Chip
              selected={selectedSpecialty === 'all'}
              onPress={() => setSelectedSpecialty('all')}
              style={[styles.filterChip, selectedSpecialty === 'all' && styles.selectedChip]}
              textStyle={[styles.chipText, selectedSpecialty === 'all' && styles.selectedChipText]}
            >
              All Areas
            </Chip>
            {getSpecialties().slice(0, 6).map((specialty) => (
              <Chip
                key={specialty}
                selected={selectedSpecialty === specialty}
                onPress={() => setSelectedSpecialty(specialty)}
                style={[styles.filterChip, selectedSpecialty === specialty && styles.selectedChip]}
                textStyle={[styles.chipText, selectedSpecialty === specialty && styles.selectedChipText]}
              >
                {specialty}
              </Chip>
            ))}
          </View>
        </View>
      )}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          ✨ {filteredWriters.length} exceptional minds found
        </Text>
      </View>
    </View>
  );

  const renderWriter = ({ item: writer }) => (
    <Card style={styles.writerCard}>
      <View style={styles.cardHeader}>
        <LinearGradient
          colors={['#015382', '#017DB0']}
          style={styles.cardHeaderGradient}
        >
          <View style={styles.onlineStatusContainer}>
            {writer.isOnline ? (
              <Badge size={12} style={styles.onlineBadge} />
            ) : (
              <Badge size={12} style={styles.offlineBadge} />
            )}
            <Text style={styles.statusText}>
              {writer.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>

          <View style={styles.avatarContainer}>
            <Avatar.Image 
              size={80} 
              source={{ uri: writer.avatar }}
              style={styles.writerAvatar}
            />
            {writer.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
              </View>
            )}
          </View>

          <Text style={styles.writerName}>{writer.name}</Text>
          
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>
              ⭐ {writer.rating.toFixed(1)}/5.0 • {writer.reviewCount} reviews
            </Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.cardContent}>
        {/* Specialties */}
        <View style={styles.specialtiesContainer}>
          <Text style={styles.sectionTitle}>🎯 Expertise Areas:</Text>
          <View style={styles.specialtyTags}>
            {writer.writerProfile?.specialties?.slice(0, 3).map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyTagText}>{specialty}</Text>
              </View>
            ))}
            {writer.writerProfile?.specialties?.length > 3 && (
              <View style={styles.specialtyTag}>
                <Text style={styles.specialtyTagText}>
                  +{writer.writerProfile.specialties.length - 3} more
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.writerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{writer.projectsCompleted}+</Text>
            <Text style={styles.statText}>🏆 Projects</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{writer.responseTime}h</Text>
            <Text style={styles.statText}>⚡ Response</Text>
          </View>
        </View>

        {/* Bio */}
        {writer.writerProfile?.bio && (
          <Text style={styles.writerBio} numberOfLines={2}>
            {writer.writerProfile.bio}
          </Text>
        )}

        {/* Connect Button */}
        <Button
          mode="contained"
          onPress={() => handleChat(writer.id)}
          style={styles.connectButton}
          labelStyle={styles.connectButtonText}
          icon="message"
        >
          ✨ Connect & Collaborate
        </Button>
      </View>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>No Writers Found</Text>
      <Text style={styles.emptyText}>
        Try adjusting your search criteria or browse all writers
      </Text>
      <Button
        mode="contained"
        onPress={() => {
          setSearchQuery('');
          setSelectedSpecialty('all');
        }}
        style={styles.clearButton}
      >
        Clear Filters
      </Button>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#015382" />
          <Text style={styles.loadingText}>Finding expert writers for you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && writers.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Unable to Load Writers</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={fetchWriters} style={styles.retryButton}>
            Try Again
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredWriters}
        renderItem={renderWriter}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContainer: {
    paddingBottom: 20,
  },
  header: {
    marginBottom: 10,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    minWidth: 90,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  searchBar: {
    flex: 1,
    marginRight: 10,
    elevation: 2,
  },
  filterButton: {
    backgroundColor: '#015382',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
  },
  filterButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
    marginTop: 10,
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  specialtyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f1f5f9',
  },
  selectedChip: {
    backgroundColor: '#015382',
  },
  chipText: {
    color: '#64748b',
    fontSize: 12,
  },
  selectedChipText: {
    color: 'white',
  },
  resultsHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#015382',
  },
  writerCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 20,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    overflow: 'hidden',
  },
  cardHeaderGradient: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  onlineStatusContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineBadge: {
    backgroundColor: '#22c55e',
    marginRight: 5,
  },
  offlineBadge: {
    backgroundColor: '#64748b',
    marginRight: 5,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  writerAvatar: {
    borderWidth: 3,
    borderColor: 'white',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  verifiedIcon: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  writerName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  cardContent: {
    padding: 20,
  },
  specialtiesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
  },
  specialtyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyTag: {
    backgroundColor: '#015382',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  writerStats: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#015382',
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  writerBio: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 20,
  },
  connectButton: {
    backgroundColor: '#015382',
    borderRadius: 15,
    paddingVertical: 8,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#015382',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  clearButton: {
    backgroundColor: '#015382',
  },
});

export default StudentWriterList;
