// Mobile Dashboard Router for ThinqScribe - Routes to correct dashboard based on user role
import React from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/MobileAuthContext';
import StudentDashboard from '../../src/screens/StudentDashboard';
import WriterDashboard from '../../src/screens/WriterDashboard';

const DashboardScreen: React.FC = () => {
  const { user, isLoading } = useAuth();

  console.log('🏠 [Dashboard Router] User role:', user?.role);
  console.log('🏠 [Dashboard Router] Loading:', isLoading);

  // Show loading state while authentication is being determined
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#015382" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  // Route to appropriate dashboard based on user role
  if (user?.role === 'student') {
    console.log('🏠 [Dashboard Router] Routing to StudentDashboard');
    return <StudentDashboard />;
  } else if (user?.role === 'writer') {
    console.log('🏠 [Dashboard Router] Routing to WriterDashboard');
    return <WriterDashboard />;
  } else {
    console.log('🏠 [Dashboard Router] Unknown role, defaulting to StudentDashboard');
    return <StudentDashboard />;
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#015382',
    fontWeight: '500',
  },
});

export default DashboardScreen;