// ThinqScribe/src/screens/StudentWriterList.js - Mobile-Optimized Writer Marketplace

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { startChat } from '../api/chat';
import { getRecommendedWriters } from '../api/user';
import { useNotifications } from '../context/NotificationContext';
import writerStore from '../utils/writerStore';

// Import premium design system
import { colors, shadows } from '../styles/designSystem';

const { width, height } = Dimensions.get('window');

const StudentWriterList = () => {
  const [writers, setWriters] = useState([]);
  const [filteredWriters, setFilteredWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { socket } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    fetchWriters();
  }, []);

  // Socket listener for real-time writer profile updates
  useEffect(() => {
    if (!socket) return;

    const handleWriterProfileUpdate = (data) => {
      console.log('📝 Received writer profile update:', data);
      
      setWriters(prevWriters => 
        prevWriters.map(writer => 
          writer._id === data.writerId 
            ? {
                ...writer,
                name: data.updatedFields.name || writer.name,
                avatar: data.updatedFields.avatar || writer.avatar,
                responseTime: data.updatedFields.responseTime !== undefined ? data.updatedFields.responseTime : writer.responseTime,
                writerProfile: {
                  ...writer.writerProfile,
                  bio: data.updatedFields.bio !== undefined ? data.updatedFields.bio : writer.writerProfile?.bio,
                  specialties: data.updatedFields.specialties !== undefined ? data.updatedFields.specialties : writer.writerProfile?.specialties,
                  responseTime: data.updatedFields.responseTime !== undefined ? data.updatedFields.responseTime : writer.writerProfile?.responseTime
                }
              }
            : writer
        )
      );

      // Also update filtered writers
      setFilteredWriters(prevFiltered => 
        prevFiltered.map(writer => 
          writer._id === data.writerId 
            ? {
                ...writer,
                name: data.updatedFields.name || writer.name,
                avatar: data.updatedFields.avatar || writer.avatar,
                responseTime: data.updatedFields.responseTime !== undefined ? data.updatedFields.responseTime : writer.responseTime,
                writerProfile: {
                  ...writer.writerProfile,
                  bio: data.updatedFields.bio !== undefined ? data.updatedFields.bio : writer.writerProfile?.bio,
                  specialties: data.updatedFields.specialties !== undefined ? data.updatedFields.specialties : writer.writerProfile?.specialties,
                  responseTime: data.updatedFields.responseTime !== undefined ? data.updatedFields.responseTime : writer.writerProfile?.responseTime
                }
              }
            : writer
        )
      );

      // Update writerStore with the new profile data
      writerStore.updateWriterProfileData(data.writerId, {
        name: data.updatedFields.name,
        avatar: data.updatedFields.avatar,
        bio: data.updatedFields.bio,
        specialties: data.updatedFields.specialties,
        responseTime: data.updatedFields.responseTime
      });
    };

    socket.on('writerProfileUpdated', handleWriterProfileUpdate);

    return () => {
      socket.off('writerProfileUpdated', handleWriterProfileUpdate);
    };
  }, [socket]);

  const fetchWriters = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('📱 [StudentWriterList] Fetching writers...');
      const writersData = await getRecommendedWriters();
      
      if (writersData && Array.isArray(writersData)) {
        console.log('📱 [StudentWriterList] Processing writers with store...');
        const processedWriters = await writerStore.processWriterData(writersData);
        
        setWriters(processedWriters);
        setFilteredWriters(processedWriters);
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('📱 [StudentWriterList] Error fetching writers:', err);
      setError(err.message || 'Failed to load writers');
      setWriters([]);
      setFilteredWriters([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Simple search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredWriters(writers);
      return;
    }

    const filtered = writers.filter(writer => {
      const matchesSearch = writer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        writer.writerProfile?.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        writer.writerProfile?.specialties?.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        );
      return matchesSearch;
    });

    // Sort by rating (highest first)
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    setFilteredWriters(filtered);
  }, [writers, searchTerm]);

  const handleChat = async (writerId) => {
    try {
      const chat = await startChat(writerId);
      if (chat && chat._id) {
        router.push(`/chat/${chat._id}`);
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const onRefresh = () => {
    fetchWriters(true);
  };

  const renderWriterCard = ({ item: writer }) => (
    <TouchableOpacity 
      style={styles.writerCard}
      onPress={() => handleChat(writer._id)}
      activeOpacity={0.95}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ 
              uri: writer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${writer.name}` 
            }}
              style={styles.avatar}
          />
          {writer.verified && (
            <View style={styles.verificationBadge}>
                <Ionicons name="checkmark" size={12} color={colors.white} />
            </View>
          )}
        </View>

          <View style={styles.writerInfo}>
            <Text style={styles.writerName}>{writer.name}</Text>
            <View style={styles.ratingRow}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name="star"
                    size={12}
                color={star <= Math.floor(writer.rating) ? colors.warning[400] : colors.neutral[300]}
              />
            ))}
          </View>
              <Text style={styles.ratingText}>
                {writer.rating?.toFixed(1)} ({writer.reviewCount})
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: writer.isOnline ? colors.success[500] : colors.neutral[400] }
          ]} />
          <Text style={[
            styles.statusText,
            { color: writer.isOnline ? colors.success[600] : colors.neutral[500] }
          ]}>
            {writer.isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Bio Section */}
        {writer.writerProfile?.bio && (
          <View style={styles.bioSection}>
          <Text style={styles.bioText}>
            {writer.writerProfile.bio.length > 100 
              ? `${writer.writerProfile.bio.substring(0, 100)}...` 
                : writer.writerProfile.bio
              }
            </Text>
          </View>
        )}

        {/* Specialties */}
        <View style={styles.specialtiesSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.specialtyTags}
        >
          {(writer.writerProfile?.specialties || ['General Writing']).slice(0, 3).map((specialty, idx) => (
              <View key={idx} style={styles.specialtyTag}>
                <Text style={styles.specialtyTagText}>{specialty}</Text>
              </View>
          ))}
          {writer.writerProfile?.specialties?.length > 3 && (
            <View style={[styles.specialtyTag, styles.moreTag]}>
              <Text style={styles.moreTagText}>
                +{writer.writerProfile.specialties.length - 3}
                </Text>
              </View>
            )}
        </ScrollView>
          </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{writer.projectsCompleted || 0}</Text>
          <Text style={styles.statLabel}>Projects</Text>
        </View>
        <View style={styles.statDivider} />
          <View style={styles.statItem}>
          <Text style={styles.statValue}>{writer.responseTime || 24}h</Text>
          <Text style={styles.statLabel}>Response</Text>
          </View>
        <View style={styles.statDivider} />
          <View style={styles.statItem}>
          <Text style={styles.statValue}>{writer.rating?.toFixed(1) || '0.0'}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        </View>

      {/* Action Button */}
      <View style={styles.actionSection}>
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.chatButton}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.white} />
          <Text style={styles.chatButtonText}>Start Chat</Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Finding expert writers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          <Text style={styles.errorTitle}>Unable to Load Writers</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchWriters()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Compact Header */}
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Expert Writers</Text>
            <Text style={styles.headerSubtitle}>
              {filteredWriters.length} available • {writers.filter(w => w.isOnline).length} online
            </Text>
          </View>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search writers or expertise..."
            placeholderTextColor={colors.neutral[400]}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={18} color={colors.neutral[400]} />
            </TouchableOpacity>
          )}
        </View>
        
        {searchTerm.length > 0 && (
            <Text style={styles.searchResultsText}>
            {filteredWriters.length} result{filteredWriters.length !== 1 ? 's' : ''} found
            </Text>
        )}
      </View>

      {/* Writers List */}
      {filteredWriters.length > 0 ? (
        <FlatList
          data={filteredWriters}
          renderItem={renderWriterCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary[500]}
              colors={[colors.primary[500]]}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color={colors.neutral[300]} />
          <Text style={styles.emptyTitle}>No Writers Found</Text>
          <Text style={styles.emptyMessage}>
            {searchTerm ? 'Try a different search term' : 'No writers available at the moment'}
          </Text>
          {searchTerm && (
          <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchTerm('')}
            >
              <Text style={styles.clearButtonText}>Clear Search</Text>
          </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },

  // Header Styles
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  
  headerSubtitle: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
    marginTop: 2,
  },
  
  headerRight: {
    width: 40,
  },

  // Search Styles
  searchSection: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.neutral[800],
    marginLeft: 8,
  },
  
  searchResultsText: {
    fontSize: 12,
    color: colors.neutral[600],
    textAlign: 'center',
    marginTop: 8,
  },

  // Writer Card Styles
  listContainer: {
    padding: 16,
  },
  
  writerCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    overflow: 'hidden',
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.neutral[200],
  },
  
  verificationBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.success[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  
  writerInfo: {
    flex: 1,
  },
  
  writerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: 4,
  },
  
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  stars: {
    flexDirection: 'row',
    marginRight: 6,
  },
  
  ratingText: {
    fontSize: 12,
    color: colors.neutral[600],
    fontWeight: '500',
  },
  
  statusContainer: {
    alignItems: 'flex-end',
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  
  bioSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  
  bioText: {
    fontSize: 13,
    color: colors.neutral[600],
    lineHeight: 18,
  },
  
  specialtiesSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  
  specialtyTags: {
    flexDirection: 'row',
  },
  
  specialtyTag: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  
  specialtyTagText: {
    fontSize: 11,
    color: colors.primary[700],
    fontWeight: '600',
  },
  
  moreTag: {
    backgroundColor: colors.neutral[200],
  },
  
  moreTagText: {
    fontSize: 11,
    color: colors.neutral[600],
    fontWeight: '600',
  },
  
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.neutral[50],
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary[600],
  },
  
  statLabel: {
    fontSize: 11,
    color: colors.neutral[500],
    marginTop: 2,
  },
  
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.neutral[300],
  },
  
  actionSection: {
    padding: 16,
    paddingTop: 12,
  },
  
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
  },
  
  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 6,
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  
  loadingText: {
    fontSize: 16,
    color: colors.neutral[600],
    marginTop: 16,
    textAlign: 'center',
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[800],
    marginTop: 16,
    textAlign: 'center',
  },
  
  errorMessage: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: 8,
    textAlign: 'center',
  },
  
  retryButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[800],
    marginTop: 16,
    textAlign: 'center',
  },
  
  emptyMessage: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: 8,
    textAlign: 'center',
  },
  
  clearButton: {
    backgroundColor: colors.neutral[200],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[700],
  },
});

export default StudentWriterList;