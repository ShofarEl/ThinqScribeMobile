// ThinqScribe/src/screens/HomeScreen.js
import React from 'react';
import { useAuth } from '../context/MobileAuthContext';
import StudentDashboard from './StudentDashboard';
import WriterDashboard from './WriterDashboard';

const HomeScreen = () => {
  const { user } = useAuth();

  // Route to appropriate dashboard based on user role
  if (user?.role === 'writer') {
    return <WriterDashboard />;
  }
  
  return <StudentDashboard />;
};

export default HomeScreen;