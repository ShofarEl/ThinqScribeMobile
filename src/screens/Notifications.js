import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Avatar,
  Badge,
  IconButton,
  ActivityIndicator,
  Button,
  Searchbar,
  Chip,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Notifications = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { notifications, unreadCount, markNotificationAsRead, markAllAsRead } = useNotifications();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'unread', 'read'
  const [filteredNotifications, setFilteredNotifications] = useState([]);

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchQuery, filterType]);

  const filterNotifications = () => {
    let filtered = notifications || [];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(notification =>
        notification.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType === 'unread') {
      filtered = filtered.filter(notification => !notification.read);
    } else if (filterType === 'read') {
      filtered = filtered.filter(notification => notification.read);
    }

    setFilteredNotifications(filtered);
  };

  const handleNotificationPress = (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      markNotificationAsRead(notification._id);
    }

    // Navigate to relevant screen based on notification type
    if (notification.link) {
      router.push(notification.link);
    } else if (notification.type === 'agreement') {
      router.push(`/agreement/${notification.agreementId}`);
    } else if (notification.type === 'message') {
      router.push(`/chat/${notification.chatId}`);
    } else if (notification.type === 'payment') {
      router.push(`/agreement/${notification.agreementId}`);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, you would refetch notifications from the server
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 2592000000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'agreement': return '📋';
      case 'message': return '💬';
      case 'payment': return '💰';
      case 'assignment': return '📝';
      case 'reminder': return '⏰';
      case 'system': return '⚙️';
      default: return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'agreement': return '#3b82f6';
      case 'message': return '#10b981';
      case 'payment': return '#f59e0b';
      case 'assignment': return '#8b5cf6';
      case 'reminder': return '#ef4444';
      case 'system': return '#64748b';
      default: return '#6366f1';
    }
  };

  const renderNotificationItem = ({ item: notification }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(notification)}
      style={[
        styles.notificationItem,
        !notification.read && styles.unreadNotificationItem
      ]}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={[
            styles.notificationIcon,
            { backgroundColor: getNotificationColor(notification.type) }
          ]}>
            <Text style={styles.notificationEmoji}>
              {getNotificationIcon(notification.type)}
            </Text>
          </View>
          
          <View style={styles.notificationInfo}>
            <Text style={[
              styles.notificationTitle,
              !notification.read && styles.unreadNotificationTitle
            ]} numberOfLines={1}>
              {notification.title}
            </Text>
            
            <Text style={styles.notificationTime}>
              {formatTime(notification.createdAt)}
            </Text>
          </View>
          
          {!notification.read && (
            <Badge size={8} style={styles.unreadBadge} />
          )}
        </View>
        
        <Text style={styles.notificationBody} numberOfLines={2}>
          {notification.content}
        </Text>
        
        {notification.type && (
          <Chip
            style={[styles.typeChip, { backgroundColor: getNotificationColor(notification.type) }]}
            textStyle={styles.typeChipText}
          >
            {notification.type.toUpperCase()}
          </Chip>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      <LinearGradient colors={['#015382', '#017DB0']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            Stay updated with your latest activity
          </Text>
          
          {unreadCount > 0 && (
            <View style={styles.headerStats}>
              <Badge size={24} style={styles.unreadCountBadge}>
                {unreadCount}
              </Badge>
              <Text style={styles.unreadCountText}>unread notifications</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.controlsContainer}>
        <Searchbar
          placeholder="Search notifications..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#015382"
        />
        
        <View style={styles.filtersContainer}>
          <View style={styles.filterChips}>
            {['all', 'unread', 'read'].map((type) => (
              <Chip
                key={type}
                selected={filterType === type}
                onPress={() => setFilterType(type)}
                style={[styles.filterChip, filterType === type && styles.selectedFilterChip]}
                textStyle={[styles.filterChipText, filterType === type && styles.selectedFilterChipText]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
                {type === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
              </Chip>
            ))}
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllReadButton}
              onPress={markAllAsRead}
            >
              <Text style={styles.markAllReadText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No notifications found' : 'No notifications yet'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery 
          ? 'Try adjusting your search terms'
          : 'When you receive notifications, they will appear here'
        }
      </Text>
      {searchQuery && (
        <Button
          mode="contained"
          onPress={() => setSearchQuery('')}
          style={styles.clearSearchButton}
        >
          Clear Search
        </Button>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#015382" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id || item.id}
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
  listContainer: {
    paddingBottom: 20,
  },
  
  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unreadCountBadge: {
    backgroundColor: '#ef4444',
  },
  unreadCountText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Controls Styles
  controlsContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBar: {
    marginBottom: 15,
    elevation: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  filterChip: {
    backgroundColor: '#f1f5f9',
  },
  selectedFilterChip: {
    backgroundColor: '#015382',
  },
  filterChipText: {
    color: '#64748b',
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: 'white',
  },
  markAllReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllReadText: {
    color: '#015382',
    fontSize: 12,
    fontWeight: '600',
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
    color: '#64748b',
    fontWeight: '500',
  },
  
  // Notification Item Styles
  notificationItem: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  unreadNotificationItem: {
    backgroundColor: '#fef3c7',
    borderColor: '#fbbf24',
  },
  notificationContent: {
    padding: 15,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationEmoji: {
    fontSize: 18,
  },
  notificationInfo: {
    flex: 1,
    minWidth: 0,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  unreadNotificationTitle: {
    fontWeight: '700',
  },
  notificationTime: {
    fontSize: 12,
    color: '#64748b',
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 10,
  },
  typeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  typeChipText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Empty State Styles
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
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  clearSearchButton: {
    backgroundColor: '#015382',
  },
});

export default Notifications;
