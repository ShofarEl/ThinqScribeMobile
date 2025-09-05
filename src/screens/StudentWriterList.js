// ThinqScribe/src/screens/StudentWriterList.js - Mobile Writer Marketplace

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar, Badge, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getRecommendedWriters } from '../api/user';
import { startChat } from '../api/chat';
import { useNotifications } from '../context/NotificationContext';

// Import premium design system
import { colors, typography, shadows, spacing, borderRadius } from '../styles/designSystem';
import { 
  premiumCards, 
  premiumText, 
  premiumButtons, 
  premiumStatus, 
  premiumAvatars, 
  premiumLayout 
} from '../styles/premiumComponents';

const { width, height } = Dimensions.get('window');

const StudentWriterList = () => {
  const [writers, setWriters] = useState([]);
  const [filteredWriters, setFilteredWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const { socket } = useNotifications();
  const navigation = useNavigation();

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
                writerProfile: {
                  ...writer.writerProfile,
                  bio: data.updatedFields.bio !== undefined ? data.updatedFields.bio : writer.writerProfile?.bio
                }
              }
            : writer
        )
      );
    };

    socket.on('writerProfileUpdated', handleWriterProfileUpdate);

    return () => {
      socket.off('writerProfileUpdated', handleWriterProfileUpdate);
    };
  }, [socket]);

  const fetchWriters = async () => {
    try {
      setLoading(true);
      const writersData = await getRecommendedWriters();
      
      // Enhanced mock data for better demonstration
      const enhancedWriters = writersData.map((writer, index) => ({
        ...writer,
        rating: 4.2 + Math.random() * 0.8, // Random rating between 4.2-5.0
        reviewCount: Math.floor(Math.random() * 100) + 20,
        projectsCompleted: Math.floor(Math.random() * 200) + 50,
        responseTime: Math.floor(Math.random() * 4) + 1, // 1-5 hours
        isOnline: Math.random() > 0.3, // 70% chance of being online
        verified: Math.random() > 0.2, // 80% chance of being verified
        writerProfile: {
          ...writer.writerProfile,
          specialties: writer.writerProfile?.specialties || [
            'Academic Writing', 'Research Papers', 'Essays', 'Literature Review'
          ].slice(0, Math.floor(Math.random() * 4) + 1)
        }
      }));
      
      setWriters(enhancedWriters);
      setFilteredWriters(enhancedWriters);
    } catch (err) {
      setError(err.message || 'Failed to load writers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter and sort writers
  useEffect(() => {
    let filtered = writers.filter(writer => {
      const matchesSearch = writer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           writer.writerProfile?.specialties?.some(spec => 
                             spec.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [writers, searchTerm, selectedSpecialty, sortBy]);

  const handleChat = async (writerId) => {
    try {
      const chat = await startChat(writerId);
      if (chat && chat._id) {
        navigation.navigate('StudentChat', { chatId: chat._id });
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWriters();
  };

  // Get unique specialties for filter
  const specialties = [...new Set(
    writers.flatMap(writer => writer.writerProfile?.specialties || [])
  )];

  const filterOptions = [
    { label: 'All Expertise', value: 'all' },
    ...specialties.map(specialty => ({ label: specialty, value: specialty }))
  ];

  const sortOptions = [
    { label: '⭐ Highest Rated', value: 'rating' },
    { label: '🏆 Most Projects', value: 'projects' },
    { label: '⚡ Fastest Response', value: 'response' },
    { label: '🔤 Name (A-Z)', value: 'name' }
  ];

  const renderFilterChip = (option, isSelected, onPress) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.filterChip,
        isSelected && styles.selectedFilterChip
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterChipText,
        isSelected && styles.selectedFilterChipText
      ]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const renderWriterCard = ({ item: writer }) => (
    <View style={styles.writerCard}>
      {/* Header with gradient */}
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.writerCardHeader}
      >
        {/* Online status */}
        <View style={styles.onlineStatus}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: writer.isOnline ? colors.success[500] : colors.neutral[400] }
          ]} />
          <Text style={[premiumText.caption, { color: colors.white, marginLeft: spacing.xs }]}>
            {writer.isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>

        {/* Avatar with verification badge */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ 
              uri: writer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${writer.name}` 
            }}
            style={styles.writerAvatar}
          />
          {writer.verified && (
            <View style={styles.verificationBadge}>
              <Ionicons name="checkmark" size={14} color={colors.white} />
            </View>
          )}
        </View>

        {/* Name and rating */}
        <Text style={[premiumText.headingSmall, { color: colors.white, textAlign: 'center', marginTop: spacing.md }]}>
          {writer.name}
        </Text>
        
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name="star"
                size={14}
                color={star <= Math.floor(writer.rating) ? colors.warning[400] : colors.neutral[300]}
              />
            ))}
          </View>
          <Text style={[premiumText.caption, { color: colors.white, marginTop: spacing.xs }]}>
            ({writer.rating?.toFixed(1)}/5.0) • {writer.reviewCount} reviews
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.writerCardContent}>
        {/* Bio */}
        {writer.writerProfile?.bio && (
          <View style={styles.bioSection}>
            <Text style={[premiumText.caption, { color: colors.neutral[600], marginBottom: spacing.xs }]}>
              About Me:
            </Text>
            <Text style={[premiumText.bodySmall, { color: colors.neutral[600], lineHeight: 18 }]}>
              {writer.writerProfile.bio.length > 80 
                ? `${writer.writerProfile.bio.substring(0, 80)}...` 
                : writer.writerProfile.bio
              }
            </Text>
          </View>
        )}

        {/* Specialties */}
        <View style={styles.specialtiesSection}>
          <Text style={[premiumText.caption, { color: colors.neutral[600], marginBottom: spacing.sm }]}>
            Expertise Areas:
          </Text>
          <View style={styles.specialtyTags}>
            {writer.writerProfile?.specialties?.slice(0, 2).map((specialty, idx) => (
              <View key={idx} style={styles.specialtyTag}>
                <Text style={styles.specialtyTagText}>{specialty}</Text>
              </View>
            )) || (
              <View style={styles.specialtyTag}>
                <Text style={styles.specialtyTagText}>General Writing</Text>
              </View>
            )}
            {writer.writerProfile?.specialties?.length > 2 && (
              <View style={[styles.specialtyTag, { backgroundColor: colors.neutral[200] }]}>
                <Text style={[styles.specialtyTagText, { color: colors.neutral[600] }]}>
                  +{writer.writerProfile.specialties.length - 2}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={[premiumText.headingSmall, { color: colors.primary[600] }]}>
              {writer.projectsCompleted}+
            </Text>
            <Text style={[premiumText.caption, { color: colors.neutral[500] }]}>
              🏆 Projects
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[premiumText.headingSmall, { color: colors.success[600] }]}>
              {writer.responseTime}h
            </Text>
            <Text style={[premiumText.caption, { color: colors.neutral[500] }]}>
              ⚡ Response
            </Text>
          </View>
        </View>

        {/* Action button */}
        <TouchableOpacity
          style={[premiumButtons.primary, { marginTop: spacing.lg }]}
          onPress={() => handleChat(writer._id)}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.white} />
          <Text style={[premiumButtons.buttonTextPrimary, { marginLeft: spacing.sm }]}>
            Start Conversation
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[premiumLayout.screen]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={[premiumText.bodyLarge, { marginTop: spacing.lg, textAlign: 'center' }]}>
            Finding expert writers for you...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[premiumLayout.screen]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error[500]} />
          <Text style={[premiumText.headingMedium, { marginTop: spacing.lg, textAlign: 'center' }]}>
            Unable to Load Writers
          </Text>
          <Text style={[premiumText.bodyMedium, { marginTop: spacing.sm, textAlign: 'center', color: colors.neutral[500] }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[premiumButtons.primary, { marginTop: spacing.xl }]}
            onPress={fetchWriters}
          >
            <Text style={premiumButtons.buttonTextPrimary}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[premiumLayout.screen]}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[premiumText.headingLarge, { color: colors.white, fontWeight: '700' }]}>
              Expert Writers
            </Text>
            <Text style={[premiumText.bodyMedium, { color: colors.white, opacity: 0.9, marginTop: spacing.xs }]}>
              {filteredWriters.length} brilliant minds available
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.neutral[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search brilliant minds..."
            placeholderTextColor={colors.neutral[400]}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Specialty Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {filterOptions.slice(0, 5).map(option => 
            renderFilterChip(
              option,
              selectedSpecialty === option.value,
              () => setSelectedSpecialty(option.value)
            )
          )}
        </ScrollView>

        {/* Sort Options */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {sortOptions.map(option => 
            renderFilterChip(
              option,
              sortBy === option.value,
              () => setSortBy(option.value)
            )
          )}
        </ScrollView>
      </View>

      {/* Writers List */}
      {filteredWriters.length > 0 ? (
        <FlatList
          data={filteredWriters}
          renderItem={renderWriterCard}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
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
          <Ionicons name="people-outline" size={64} color={colors.neutral[300]} />
          <Text style={[premiumText.headingMedium, { marginTop: spacing.lg, textAlign: 'center' }]}>
            No Writers Found
          </Text>
          <Text style={[premiumText.bodyMedium, { marginTop: spacing.sm, textAlign: 'center', color: colors.neutral[500] }]}>
            Try adjusting your search criteria or browse all writers
          </Text>
          <TouchableOpacity
            style={[premiumButtons.secondary, { marginTop: spacing.xl }]}
            onPress={() => {
              setSearchTerm('');
              setSelectedSpecialty('all');
            }}
          >
            <Text style={premiumButtons.buttonTextSecondary}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.base,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  filtersContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
    height: 48,
  },
  
  searchIcon: {
    marginRight: spacing.sm,
  },
  
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.neutral[800],
  },
  
  filtersRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  
  filterChip: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  
  selectedFilterChip: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  
  filterChipText: {
    ...typography.fonts.caption,
    fontSize: typography.sizes.sm,
    color: colors.neutral[600],
    fontWeight: '500',
  },
  
  selectedFilterChipText: {
    color: colors.white,
  },
  
  listContainer: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  
  row: {
    justifyContent: 'space-between',
  },
  
  writerCard: {
    width: (width - spacing.base * 3) / 2,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  
  writerCardHeader: {
    padding: spacing.lg,
    alignItems: 'center',
    position: 'relative',
  },
  
  onlineStatus: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  avatarContainer: {
    position: 'relative',
  },
  
  writerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.neutral[200],
    borderWidth: 3,
    borderColor: colors.white,
  },
  
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  
  ratingContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  
  writerCardContent: {
    padding: spacing.lg,
  },
  
  bioSection: {
    marginBottom: spacing.lg,
  },
  
  specialtiesSection: {
    marginBottom: spacing.lg,
  },
  
  specialtyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  
  specialtyTag: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  
  specialtyTagText: {
    fontSize: typography.sizes.xs,
    color: colors.primary[700],
    fontWeight: '600',
  },
  
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  
  statItem: {
    alignItems: 'center',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
});

export default StudentWriterList;