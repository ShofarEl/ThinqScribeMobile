import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Appbar, Text, Badge, Avatar, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = ({ 
  title, 
  showBack = false, 
  showNotification = true, 
  showProfile = true,
  unreadNotifications = 0,
  rightAction = null,
  subtitle = null,
  transparent = false,
  user = null
}) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <Appbar.Header 
      style={[
        styles.header, 
        transparent && styles.transparentHeader,
        { paddingTop: insets.top > 0 ? 0 : 8 }
      ]}
    >
      {showBack ? (
        <Appbar.BackAction onPress={() => navigation.goBack()} color={theme.colors.primary} />
      ) : (
        <View style={styles.logoContainer}>
          <MaterialIcons name="school" size={24} color={theme.colors.primary} />
          <Text style={[styles.logoText, { color: theme.colors.primary }]}>
            {title || 'ThinkScribe'}
          </Text>
        </View>
      )}
      
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
      
      <View style={styles.rightContainer}>
        {showNotification && (
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate('Notifications')}
          >
            <MaterialIcons name="notifications" size={24} color={theme.colors.text} />
            {unreadNotifications > 0 && (
              <Badge 
                size={18} 
                style={[styles.badge, { backgroundColor: theme.colors.notification }]}
              >
                {unreadNotifications}
              </Badge>
            )}
          </TouchableOpacity>
        )}
        
        {rightAction && rightAction}
        
        {showProfile && (
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={() => navigation.navigate('Profile')}
          >
            {user?.avatar ? (
              <Avatar.Image 
                source={{ uri: user.avatar }} 
                size={32} 
              />
            ) : (
              <Avatar.Icon 
                icon="account" 
                size={32} 
                color="#fff"
                style={{ backgroundColor: theme.colors.primary }}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    elevation: 2,
    backgroundColor: '#fff',
  },
  transparentHeader: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 8,
  },
  rightContainer: {
    flexDirection: 'row',
    marginLeft: 'auto',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  profileButton: {
    marginLeft: 8,
    marginRight: 4,
  },
});

export default Header;
