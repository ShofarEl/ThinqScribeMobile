import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ThinkScribeLanding from './pages/LandingPage.jsx';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import StudentChat from './pages/StudentChat';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import WriterDashboard from './pages/WriterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WriterChat from './pages/WriterChat';
import NotAuthorized from './pages/NotAuthorized';
import AgreementPage from './pages/AgreementPage';
import PaymentPage from './pages/PaymentPage';
import Dashboard from "./pages/Dashboard"
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailed from './pages/PaymentFailed';
import PaymentHistory from './pages/PaymentHistory';
import ProfileSettings from './pages/ProfileSettings';
import Search from './pages/Search';
import StudentWriterList from './pages/StudentWriterList';
import Notifications from './pages/Notifications';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Typography } from 'antd';
import StudentAssignments from './pages/StudentAssignments';
import About from './pages/About.jsx'
import { AIChatProvider } from './context/AIChatContext';
import AIChat from './pages/AIChat.jsx'
import { message } from 'antd';
import { AppLoadingProvider } from './context/AppLoadingContext';
const { Title, Text, Paragraph } = Typography;

// Configure Ant Design message
message.config({
  top: 100,
  duration: 3,
  maxCount: 3,
  rtl: false,
});

function App() {
  useEffect(() => {
    // Add global CSS fixes for text layout issues
    const style = document.createElement('style');
    style.textContent = `
      /* Fix auth page text layout issues */
      .modern-auth-input {
        font-size: 14px !important;
        line-height: 1.4 !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
      }
      
      .modern-auth-input::placeholder {
        color: #9ca3af !important;
        opacity: 1 !important;
        font-size: 14px !important;
      }
      
      .auth-options-row {
        flex-wrap: wrap !important;
        gap: 8px !important;
      }
      
      .remember-checkbox .ant-checkbox-wrapper {
        white-space: nowrap !important;
        font-size: 13px !important;
      }
      
      .forgot-link {
        white-space: nowrap !important;
        font-size: 13px !important;
      }
      
      .role-card {
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
      }
      
      .role-content .ant-typography {
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        line-height: 1.3 !important;
      }
      
      .role-content .ant-typography-secondary {
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        line-height: 1.4 !important;
      }
      
      /* Fix header search bar visibility */
      .ant-input-affix-wrapper {
        background-color: white !important;
      }
      
      .ant-input-affix-wrapper .ant-input {
        background-color: transparent !important;
        color: #1f2937 !important;
        font-size: 14px !important;
      }
      
      .ant-input-affix-wrapper .ant-input::placeholder {
        color: #6b7280 !important;
        opacity: 1 !important;
        font-size: 14px !important;
      }
      
      .ant-input-affix-wrapper:focus,
      .ant-input-affix-wrapper-focused {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
      }
      
      /* Mobile responsive fixes */
      @media (max-width: 768px) {
        .auth-options-row {
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 12px !important;
        }
        
        .role-card {
          padding: 16px !important;
          gap: 12px !important;
        }
        
        .social-buttons-container {
          flex-direction: column !important;
          gap: 10px !important;
        }
      }
      
      @media (max-width: 576px) {
        .modern-auth-input {
          font-size: 16px !important; /* Prevents zoom on iOS */
          height: 44px !important;
        }
        
        .modern-auth-input::placeholder {
          font-size: 16px !important;
        }
        
        .role-content .ant-typography {
          font-size: 14px !important;
        }
        
        .role-content .ant-typography-secondary {
          font-size: 12px !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <AppLoadingProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<ThinkScribeLanding />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/not-authorized" element={<NotAuthorized />} />

                {/* Dashboard routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/student/dashboard" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/student/assignments" element={<StudentAssignments />} />
                
                {/* Writer routes */}
                <Route path="/writer/dashboard" element={<WriterDashboard />} />
                
                {/* Admin routes - Only accessible by admin users */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Agreement and payment routes */}
                <Route path="/agreements/:agreementId" element={
                  <ProtectedRoute>
                    <AgreementPage />
                  </ProtectedRoute>
                } />
                <Route path="/agreements/:agreementId/chat" element={<WriterChat />} />
                
                {/* Student specific routes */}
                <Route path="/student/writers" element={<StudentWriterList />} />
                <Route path="/student/chat/:writerId" element={<StudentChat />} />
                
                {/* Protected routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfileSettings />
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } />
                
                <Route path="/search" element={
                  <ProtectedRoute>
                    <Search />
                  </ProtectedRoute>
                } />
                 <Route path="/about" element={
                  <ProtectedRoute>
                    <About/>
                  </ProtectedRoute>
                } />
                <Route path="/writers" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentWriterList />
                  </ProtectedRoute>
                } />
                <Route path="/chat/student/*" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentChat />
                  </ProtectedRoute>
                } />
                <Route path="/chat/writer/*" element={
                  <ProtectedRoute allowedRoles={['writer']}>
                    <WriterChat />
                  </ProtectedRoute>
                } />
           
                <Route path="/payment/:orderId" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <PaymentPage />
                  </ProtectedRoute>
                } />
                <Route path="/payment/success" element={
                  <ProtectedRoute>
                    <PaymentSuccessPage />
                  </ProtectedRoute>
                } />
                <Route path="/order/:orderId/success" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <PaymentSuccessPage />
                  </ProtectedRoute>
                } />
                <Route path="/agreements/:agreementId/failed" element={
                  <ProtectedRoute>
                    <PaymentFailed />
                  </ProtectedRoute>
                } />
                <Route path="/payments/history" element={
                  <ProtectedRoute allowedRoles={['writer']}>
                    <PaymentHistory/>
                  </ProtectedRoute>
                } />
                <Route path="/ai-chat" element={
                  <AIChatProvider>
                    <AIChat />
                  </AIChatProvider>
                } />
              </Routes>
            </AppLoadingProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;