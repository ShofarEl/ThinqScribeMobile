import React, { useState, useEffect } from 'react';
import { Spin, Alert } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import AIChatComponent from '../components/chat/AIChatComponent';
import { useAuth } from '../context/AuthContext';

const AIChatPage = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!user || !token) {
      setError('Please sign in to use the AI assistant');
      setLoading(false);
      return;
    }

    // Small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [user, token]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <div>Loading AI Assistant...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        padding: '20px'
      }}>
        <Alert
          message="Authentication Required"
          description={error}
          type="warning"
          showIcon
          action={
            <a href="/signin" style={{ color: '#1890ff' }}>
              Sign In
            </a>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      <div style={{ 
        padding: '16px 24px', 
        borderBottom: '1px solid #e8e8e8',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          margin: 0, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          color: '#1f2937'
        }}>
          <RobotOutlined style={{ color: '#1890ff' }} />
          AI Assistant
        </h1>
        <p style={{ 
          margin: '4px 0 0 0', 
          color: '#6b7280',
          fontSize: '14px' 
        }}>
          Chat with AI models, upload files, and get intelligent assistance
        </p>
      </div>

      {/* AI Chat Component */}
      <div style={{ flex: 1, height: 0 }}>
        <AIChatComponent
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
};

export default AIChatPage; 