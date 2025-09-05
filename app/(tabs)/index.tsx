import React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import StudentDashboard from '@/src/screens/StudentDashboard';
import WriterDashboard from '@/src/screens/WriterDashboard';

export default function HomeScreen() {
  const { user } = useAuth();

  console.log('📱 [HomeScreen] User role:', user?.role);

  // Route to appropriate dashboard based on user role
  if (user?.role === 'writer') {
    return <WriterDashboard />;
  }
  
  // Default to student dashboard
  return <StudentDashboard />;
}