import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View, ActivityIndicator } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CustomText } from '@/components/CustomText';
import { useAuth } from '@/src/context/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('📱 [TabLayout] User not authenticated, redirecting to signin');
      router.replace('/signin');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? '#64748B' : '#94A3B8',
        headerShown: false,
        // Wrap to avoid type incompatibility between different @react-navigation versions
        tabBarButton: (props) => <HapticTab {...(props as any)} />,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          ...Platform.select({
            ios: {
              position: 'absolute',
              height: 72,
              paddingBottom: 8,
              paddingTop: 8,
            },
            default: {
              height: 72,
              paddingBottom: 8,
              paddingTop: 8,
            },
          }),
          backgroundColor: isDark ? 'rgba(15, 15, 35, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 1,
          borderTopColor: isDark ? 'rgba(71, 85, 105, 0.2)' : 'rgba(226, 232, 240, 0.8)',
          elevation: 20,
          shadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.5 : 0.1,
          shadowRadius: 16,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          letterSpacing: 0.5,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarLabelPosition: 'below-icon',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <View style={[
                styles.iconWrapper,
                focused && {
                  backgroundColor: colors.primary + '20',
                }
              ]}>
                <IconSymbol 
                  size={24} 
                  name={focused ? "house.fill" : "house"} 
                  color={focused ? colors.primary : color} 
                />
              </View>
              {focused && (
                <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
              )}
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <View style={[
                styles.iconWrapper,
                focused && {
                  backgroundColor: colors.primary + '20',
                }
              ]}>
                <IconSymbol 
                  size={24} 
                  name={focused ? "paperplane.fill" : "paperplane"} 
                  color={focused ? colors.primary : color} 
                />
              </View>
              {focused && (
                <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
              )}
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <View style={[
                styles.iconWrapper,
                focused && {
                  backgroundColor: colors.primary + '20',
                }
              ]}>
                <IconSymbol 
                  size={24} 
                  name={focused ? "message.fill" : "message"} 
                  color={focused ? colors.primary : color} 
                />
              </View>
              {focused && (
                <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
              )}
              {/* Message badge for unread messages */}
              <View style={[styles.messageBadge, { backgroundColor: '#EF4444' }]}>
                <CustomText style={styles.messageBadgeText}>2</CustomText>
              </View>
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <View style={[
                styles.iconWrapper,
                focused && {
                  backgroundColor: colors.primary + '20',
                }
              ]}>
                <IconSymbol 
                  size={24} 
                  name={focused ? "person.fill" : "person"} 
                  color={focused ? colors.primary : color} 
                />
              </View>
              {focused && (
                <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  messageBadge: {
    position: 'absolute',
    top: 0,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  messageBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});