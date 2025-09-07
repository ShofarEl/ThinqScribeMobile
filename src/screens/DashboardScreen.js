import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Badge, Button, Card, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AccessibleButton from '../components/AccessibleButton';
import Header from '../components/Header';
import { useAuth } from '../context/MobileAuthContext';
import { useNotifications } from '../context/NotificationContext';
import { formatCurrency } from '../utils/currencyUtils';

const DashboardScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { notifications, fetchNotifications } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: user?.role === 'student' ? 12 : 45,
    activeProjects: user?.role === 'student' ? 3 : 8,
    completedProjects: user?.role === 'student' ? 9 : 37,
    totalEarnings: user?.role === 'student' ? 0 : 125000,
    pendingPayments: user?.role === 'student' ? 15000 : 25000,
    currency: user?.location?.currency || 'ngn',
    symbol: user?.location?.symbol || '₦',
    activeAssignments: 3,
    completedAssignments: 12,
    upcomingDeadlines: 2,
    messages: 5,
    unreadMessages: 2,
  });

  useEffect(() => {
    // In a real app, this would fetch dashboard data from API
    // fetchDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, this would refresh all dashboard data
    await fetchNotifications();
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const renderStatsCard = () => (
    <Card style={styles.statsCard}>
      <LinearGradient
        colors={user?.role === 'student' ? ['#667eea', '#764ba2'] : ['#f093fb', '#f5576c']}
        style={styles.statsGradient}
      >
        <View style={styles.statsHeader}>
          <View>
            <Text style={styles.welcomeText}>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</Text>
            <Text style={styles.roleText}>
              {user?.role === 'student' ? 'Student Dashboard' : 'Writer Dashboard'}
            </Text>
          </View>
          <Avatar.Text size={50} label={user?.name?.[0] || 'U'} style={styles.avatar} />
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalProjects}</Text>
            <Text style={styles.statLabel}>Total Projects</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.activeProjects}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.completedProjects}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.earningsContainer}>
          <Text style={styles.earningsLabel}>
            {user?.role === 'student' ? 'Total Spent' : 'Total Earnings'}
          </Text>
          <Text style={styles.earningsAmount}>
            {formatCurrency(user?.role === 'student' ? stats.pendingPayments : stats.totalEarnings, stats.currency)}
          </Text>
        </View>
      </LinearGradient>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={`Hi, ${user?.name?.split(' ')[0] || 'Student'}`}
        subtitle="Welcome back to ThinkScribe"
        unreadNotifications={unreadNotifications}
      />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Enhanced Stats Card */}
        {renderStatsCard()}

        {/* Quick Actions Card */}
        <Card style={styles.quickActionsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            <Button mode="contained-tonal" icon="plus" onPress={() => navigation.navigate('CreateProject')} style={styles.actionButton}>
              New Project
            </Button>
            <Button mode="contained-tonal" icon="message" onPress={() => navigation.navigate('Chat')} style={styles.actionButton}>
              Messages
            </Button>
            <Button mode="contained-tonal" icon="account-search" onPress={() => navigation.navigate('WriterList')} style={styles.actionButton}>
              {user?.role === 'student' ? 'Find Writers' : 'Analytics'}
            </Button>
            <Button mode="contained-tonal" icon="cog" onPress={() => navigation.navigate('Profile')} style={styles.actionButton}>
              Settings
            </Button>
          </View>
        </Card>
        
        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={[styles.quickActionItem, { backgroundColor: theme.colors.primary + '10' }]}
            onPress={() => navigation.navigate('WriterList')}
          >
            <MaterialIcons name="people" size={28} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Find Writers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionItem, { backgroundColor: theme.colors.accent + '10' }]}
            onPress={() => navigation.navigate('Chat')}
          >
            <MaterialIcons name="chat" size={28} color={theme.colors.accent} />
            <Text style={styles.quickActionText}>Messages</Text>
            {stats.unreadMessages > 0 && (
              <Badge 
                style={[styles.badge, { backgroundColor: theme.colors.notification }]}
              >
                {stats.unreadMessages}
              </Badge>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionItem, { backgroundColor: theme.colors.success + '10' }]}
            onPress={() => navigation.navigate('Assignments')}
          >
            <MaterialIcons name="assignment" size={28} color={theme.colors.success} />
            <Text style={styles.quickActionText}>Assignments</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionItem, { backgroundColor: theme.colors.info + '10' }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <MaterialIcons name="settings" size={28} color={theme.colors.info} />
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>
        </View>
        
        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
        
        {notifications.slice(0, 3).map((notification, index) => (
          <Card
            key={notification._id}
            onPress={() => navigation.navigate('Notifications')}
            style={styles.activityCard}
            highlighted={!notification.read}
          >
            <View style={styles.activityItem}>
              <View style={[
                styles.activityIconContainer,
                { 
                  backgroundColor: 
                    notification.type === 'message' ? theme.colors.primary + '20' :
                    notification.type === 'payment' ? theme.colors.success + '20' :
                    theme.colors.accent + '20'
                }
              ]}>
                <MaterialIcons 
                  name={
                    notification.type === 'message' ? 'chat' :
                    notification.type === 'payment' ? 'payment' :
                    'notifications'
                  } 
                  size={20} 
                  color={
                    notification.type === 'message' ? theme.colors.primary :
                    notification.type === 'payment' ? theme.colors.success :
                    theme.colors.accent
                  } 
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{notification.title}</Text>
                <Text style={styles.activityMessage} numberOfLines={2}>{notification.message}</Text>
                <Text style={styles.activityTime}>
                  {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              {!notification.read && (
                <View style={[styles.unreadDot, { backgroundColor: theme.colors.notification }]} />
              )}
            </View>
          </Card>
        ))}
        
        {notifications.length > 0 && (
          <AccessibleButton
            title="View All Notifications"
            variant="text"
            color={theme.colors.primary}
            onPress={() => navigation.navigate('Notifications')}
            style={styles.viewAllNotificationsButton}
          />
        )}
        
        {/* Educational Resources */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Educational Resources</Text>
        </View>
        
        <Card
          title="AI-Powered Learning Tools"
          subtitle="Enhance your learning with our AI tools"
          onPress={() => {}}
          icon={<MaterialIcons name="psychology" size={24} color={theme.colors.primary} />}
          style={styles.resourceCard}
        >
          <Text style={styles.resourceDescription}>
            Access our suite of AI-powered tools designed to help you learn more effectively.
          </Text>
          <AccessibleButton
            title="Explore Tools"
            variant="text"
            color={theme.colors.primary}
            onPress={() => {}}
            style={styles.resourceButton}
          />
        </Card>
        
        <Card
          title="Study Resources Library"
          subtitle="Access our collection of study materials"
          onPress={() => {}}
          icon={<MaterialIcons name="library-books" size={24} color={theme.colors.primary} />}
          style={styles.resourceCard}
        >
          <Text style={styles.resourceDescription}>
            Browse through our extensive library of study materials, guides, and templates.
          </Text>
          <AccessibleButton
            title="Browse Library"
            variant="text"
            color={theme.colors.primary}
            onPress={() => {}}
            style={styles.resourceButton}
          />
        </Card>
        
        {/* Extra padding at bottom for comfortable scrolling */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryCardContent: {
    paddingTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  viewAllButton: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionItem: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  activityCard: {
    marginBottom: 12,
    padding: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  viewAllNotificationsButton: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  resourceCard: {
    marginBottom: 16,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    marginTop: 8,
  },
  resourceButton: {
    alignSelf: 'flex-start',
  },
});

export default DashboardScreen;
