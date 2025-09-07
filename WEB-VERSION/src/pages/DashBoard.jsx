import React, { useEffect } from 'react';
import { Layout, Spin, Alert } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HeaderComponent from '../components/HeaderComponent';
import StudentDashboard from './StudentDashboard';
import WriterDashboard from './WriterDashboard';
import AdminDashboard from './AdminDashboard';

const { Content } = Layout;

const Dashboard = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      console.log('🎯 [Dashboard] User details:', {
        id: user?._id,
        email: user?.email,
        role: user?.role,
        isAuthenticated,
        fullUser: user
      });
      
      // Redirect based on user role to specific dashboard
      if (isAuthenticated && user?.role) {
        const userRole = user.role.toLowerCase().trim(); // Normalize role
        
        console.log(`🔀 [Dashboard] Redirecting user with role: "${userRole}"`);
        
        switch (userRole) {
          case 'student':
            console.log('📚 [Dashboard] → Student Dashboard');
            navigate('/student/dashboard', { replace: true });
            return;
            
          case 'writer':
            console.log('✍️ [Dashboard] → Writer Dashboard');
            navigate('/writer/dashboard', { replace: true });
            return;
            
          case 'admin':
            console.log('👑 [Dashboard] → Admin Dashboard');
            navigate('/admin/dashboard', { replace: true });
            return;
            
          default:
            console.warn(`⚠️ [Dashboard] Unknown role: "${userRole}"`);
            // Don't redirect for unknown roles, let it fall through
        }
      } else if (isAuthenticated && !user?.role) {
        console.warn('⚠️ [Dashboard] User authenticated but no role:', user);
      } else if (!isAuthenticated) {
        console.log('🔒 [Dashboard] User not authenticated');
      }
    }
  }, [loading, user, isAuthenticated, navigate]);

  // Loading state
  if (loading) {
    return (
      <Layout className="min-h-screen bg-[#F4F7F6]">
        <HeaderComponent />
        <Content className="p-8">
          <div className="flex items-center justify-center h-full">
            <div style={{ textAlign: 'center' }}>
              <Spin size="large" tip="Loading dashboard..." />
              <div style={{ marginTop: '16px', color: '#666', fontSize: '14px' }}>
                Authenticating user and loading dashboard...
              </div>
            </div>
          </div>
        </Content>
      </Layout>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    console.log('🔒 [Dashboard] Rendering not authenticated state');
    return (
      <Layout className="min-h-screen bg-[#F4F7F6]">
        <HeaderComponent />
        <Content className="p-8 flex items-center justify-center">
          <Alert
            message="Authentication Required"
            description="Please log in to view your dashboard."
            type="warning"
            showIcon
          />
        </Content>
      </Layout>
    );
  }

  // Render appropriate dashboard based on role
  if (user?.role) {
    const userRole = user.role.toLowerCase().trim();
    
    console.log(`🎨 [Dashboard] Rendering dashboard for role: "${userRole}"`);
    
    switch (userRole) {
      case 'student':
        console.log('📚 [Dashboard] Rendering StudentDashboard');
        return <StudentDashboard />;
        
      case 'writer':
        console.log('✍️ [Dashboard] Rendering WriterDashboard');
        return <WriterDashboard />;
        
      case 'admin':
        console.log('👑 [Dashboard] Rendering AdminDashboard');
        return <AdminDashboard />;
        
      default:
        console.error(`❌ [Dashboard] Unsupported role: "${userRole}"`);
        return (
          <Layout className="min-h-screen bg-[#F4F7F6]">
            <HeaderComponent />
            <Content className="p-8 flex items-center justify-center">
              <Alert
                message="Unsupported Role"
                description={
                  <div>
                    <p><strong>Your role "{user.role}" is not supported.</strong></p>
                    <p>Supported roles: student, writer, admin</p>
                    <p>User ID: {user._id}</p>
                    <p>Email: {user.email}</p>
                    <p>Please contact support if this is an error.</p>
                  </div>
                }
                type="error"
                showIcon
              />
            </Content>
          </Layout>
        );
    }
  }

  // User authenticated but no role assigned
  console.warn('⚠️ [Dashboard] User authenticated but no role assigned');
  return (
    <Layout className="min-h-screen bg-[#F4F7F6]">
      <HeaderComponent />
      <Content className="p-8 flex items-center justify-center">
        <Alert
          message="Account Setup Required"
          description={
            <div>
              <p><strong>Your account doesn't have a role assigned.</strong></p>
              <p>User ID: {user?._id}</p>
              <p>Email: {user?.email}</p>
              <p>Current Role: {user?.role || 'undefined'}</p>
              <p>Please contact support to complete your account setup.</p>
            </div>
          }
          type="warning"
          showIcon
        />
      </Content>
    </Layout>
  );
};

export default Dashboard;