// ThinqScribe/src/screens/MessagesScreen.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentChat from './StudentChat';
import WriterChat from './WriterChat';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';

const MessagesScreen = () => {
  const { user, loading } = useAuth();

  // Debug logging
  console.log('📱 [MessagesScreen] Auth state:', {
    loading,
    isAuthenticated: !!user,
    userRole: user?.role,
    userId: user?._id
  });

  // Show loading while auth is being checked
  if (loading) {
    console.log('📱 [MessagesScreen] Showing loading state');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#015382" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if no user
  if (!user) {
    console.log('📱 [MessagesScreen] No user found, showing auth error');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Authentication Required</Text>
          <Text style={styles.errorText}>
            Please log in to access your messages
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Route based on user role
  console.log('📱 [MessagesScreen] Routing based on role:', user.role);
  
  if (user.role === 'writer') {
    console.log('📱 [MessagesScreen] Rendering WriterChat component');
    return <WriterChat />;
  } else if (user.role === 'student') {
    console.log('📱 [MessagesScreen] Rendering StudentChat component');
    return <StudentChat />;
  } else {
    // Fallback for unknown roles or admin
    console.log('📱 [MessagesScreen] Unknown role, showing error:', user.role);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Role Not Supported</Text>
          <Text style={styles.errorText}>
            Your current role ({user.role}) doesn't have access to messaging
          </Text>
        </View>
      </SafeAreaView>
    );
  }
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default MessagesScreen;
