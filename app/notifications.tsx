// Notifications Screen for ThinqScribe Mobile
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge, Chip, IconButton, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Notification {
  _id: string;
  title: string;
  content: string;
  type: 'agreement' | 'message' | 'payment' | 'system';
  createdAt: string;
  read: boolean;
}

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchQuery, filterType]);

  const loadNotifications = async () => {
    const mockNotifications: Notification[] = [
      {
        _id: '1',
        title: 'New Agreement Created',
        content: 'Dr. Smith has accepted your project proposal.',
        type: 'agreement',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
      {
        _id: '2',
        title: 'Payment Reminder',
        content: 'Your payment of $250 is due in 2 days.',
        type: 'payment',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        read: false,
      },
    ];
    setNotifications(mockNotifications);
  };

  const filterNotifications = () => {
    let filtered = [...notifications];
    if (searchQuery.trim()) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterType === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filterType === 'read') {
      filtered = filtered.filter(n => n.read);
    }
    setFilteredNotifications(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const formatTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    const icons = { agreement: '📋', message: '💬', payment: '💰', system: '⚙️' };
    return icons[type as keyof typeof icons] || '📢';
  };

  const getNotificationColor = (type: string) => {
    const colors = { agreement: '#3b82f6', message: '#10b981', payment: '#f59e0b', system: '#64748b' };
    return colors[type as keyof typeof colors] || '#6366f1';
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity style={[styles.notificationItem, !item.read && styles.unreadItem]}>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={[styles.notificationIcon, { backgroundColor: getNotificationColor(item.type) }]}>
            <Text style={styles.notificationEmoji}>{getNotificationIcon(item.type)}</Text>
          </View>
          <View style={styles.notificationInfo}>
            <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.notificationTime}>{formatTime(item.createdAt)}</Text>
          </View>
          {!item.read && <Badge size={8} style={styles.unreadBadge} />}
        </View>
        <Text style={styles.notificationBody} numberOfLines={2}>{item.content}</Text>
        <Chip style={[styles.typeChip, { backgroundColor: getNotificationColor(item.type) }]} textStyle={styles.typeChipText}>
          {item.type.toUpperCase()}
        </Chip>
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton icon="arrow-left" iconColor="#ffffff" onPress={() => router.back()} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.headerStats}>
                <Badge size={20} style={styles.unreadCountBadge}>{unreadCount}</Badge>
                <Text style={styles.unreadCountText}>unread notifications</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.controlsContainer}>
        <Searchbar
          placeholder="Search notifications..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <View style={styles.filtersContainer}>
          {['all', 'unread', 'read'].map((type) => (
            <Chip
              key={type}
              selected={filterType === type}
              onPress={() => setFilterType(type)}
              style={[styles.filterChip, filterType === type && styles.selectedChip]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Chip>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingVertical: 30 },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  headerTextContainer: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: 'white', marginBottom: 8 },
  headerStats: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  unreadCountBadge: { backgroundColor: '#ef4444' },
  unreadCountText: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  controlsContainer: { backgroundColor: 'white', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  searchBar: { marginBottom: 15 },
  filtersContainer: { flexDirection: 'row', gap: 8 },
  filterChip: { backgroundColor: '#f1f5f9' },
  selectedChip: { backgroundColor: '#667eea' },
  listContainer: { padding: 20 },
  notificationItem: { backgroundColor: 'white', marginBottom: 12, borderRadius: 12, elevation: 1, borderWidth: 1, borderColor: '#f1f5f9' },
  unreadItem: { backgroundColor: '#fef3c7', borderColor: '#fbbf24' },
  notificationContent: { padding: 15 },
  notificationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  notificationIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  notificationEmoji: { fontSize: 18 },
  notificationInfo: { flex: 1 },
  notificationTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  unreadTitle: { fontWeight: '700' },
  notificationTime: { fontSize: 12, color: '#64748b' },
  unreadBadge: { backgroundColor: '#ef4444' },
  notificationBody: { fontSize: 14, color: '#64748b', lineHeight: 18, marginBottom: 10 },
  typeChip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2 },
  typeChipText: { color: 'white', fontSize: 10, fontWeight: '600' },
});

export default NotificationsScreen;