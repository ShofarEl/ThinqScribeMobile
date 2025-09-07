import React from 'react';
import { useAuth } from '../../src/context/AuthContext';
import StudentChat from '../../src/screens/StudentChat';
import WriterChat from '../../src/screens/WriterChat';

export default function ChatScreen() {
  const { user } = useAuth();
  
  // Render appropriate chat screen based on user role
  if (user?.role === 'writer') {
    return <WriterChat />;
  }
  
  return <StudentChat />;
}
