import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import ThinqScribeLanding from './pages/LandingPage.jsx';
import SignInPremium from './pages/SignInPremium.jsx';
import SignUpPremium from './pages/SignUpPremium.jsx';
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
import Dashboard from "./pages/DashBoard"
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailed from './pages/PaymentFailed';
import PaymentHistory from './pages/PaymentHistory';
import ProfileSettings from './pages/ProfileSettings';
import Search from './pages/Search';
import StudentWriterList from './pages/StudentWriterList';
import WriterProfile from './pages/WriterProfile';
import Notifications from './pages/Notifications';
import AboutUs from './pages/AboutUs';
import ContactSupport from './pages/ContactSupport';
import OurWriters from './pages/OurWriters';
import QualityPromise from './pages/QualityPromise';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CallProvider } from './context/CallContext';
import { Typography } from 'antd';
import StudentAssignments from './pages/StudentAssignments';
import About from './pages/About.jsx'

import { message } from 'antd';
import { AppLoadingProvider } from './context/AppLoadingContext';
import AppLoader from './components/AppLoader';
import PaymentSuccess from './pages/PaymentSuccess';
import CreateAgreementWrapper from './pages/CreateAgreementWrapper.jsx';
import EnhancedPaymentPage from './pages/EnhancedPaymentPage.jsx';
import InfluencerDashboard from './pages/InfluencerDashboard.jsx';
import InfluencerDetails from './pages/InfluencerDetails.jsx';
const { Title, Text, Paragraph } = Typography;

// Configure Ant Design message
message.config({
  top: 100,
  duration: 3,
  maxCount: 3,
  rtl: false
});

// Inner component that can access auth context
const AppRoutes = () => {
  const { user } = useAuth();

  return (
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<ThinqScribeLanding />} />
                <Route path="/signin" element={<SignInPremium />} />
                <Route path="/signup" element={<SignUpPremium />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/not-authorized" element={<NotAuthorized />} />
                <Route path="/about" element={<About />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/contact-support" element={<ContactSupport />} />
                <Route path="/our-writers" element={<OurWriters />} />
                <Route path="/quality-promise" element={<QualityPromise />} />
                
                <Route path="/signup/ref/:referralCode" element={<SignUpPremium />} />
            
            
                {/* Dashboard routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/student/dashboard" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } />
      <Route path="/writer/dashboard" element={
        <ProtectedRoute allowedRoles={['writer']}>
          <WriterDashboard />
        </ProtectedRoute>
      } />
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/influencers" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <InfluencerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/influencers/:id" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <InfluencerDetails />
                  </ProtectedRoute>
                } />
                
      {/* Chat routes */}
      <Route path="/chat/student/:writerId" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentChat />
        </ProtectedRoute>
      } />
      <Route path="/chat/writer/:studentId" element={
        <ProtectedRoute allowedRoles={['writer']}>
          <WriterChat />
                  </ProtectedRoute>
                } />
             
      <Route path="/chat/student/:writerId" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentChat />
        </ProtectedRoute>
      } />
      <Route path="/chat/writer" element={
        <ProtectedRoute allowedRoles={['writer']}>
          <WriterChat />
                  </ProtectedRoute>
                } />
                 <Route path="/chat/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentChat />
        </ProtectedRoute>
      } />
                
      
      {/* Search and assignment routes */}
      <Route path="/search" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Search />
        </ProtectedRoute>
      } />
      <Route path="/writers" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentWriterList />
        </ProtectedRoute>
      } />
      <Route path="/writers/:writerId" element={
        <ProtectedRoute allowedRoles={['student']}>
          <WriterProfile />
        </ProtectedRoute>
      } />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } />
      <Route path="/profile" element={
                  <ProtectedRoute>
          <ProfileSettings />
                  </ProtectedRoute>
                } />
      <Route path="/agreements/:agreementId" element={
                  <ProtectedRoute>
          <AgreementPage />
                  </ProtectedRoute>
                } />
                <Route path="/agreements/create" element={
                  <ProtectedRoute>
                    <CreateAgreementWrapper/>
                  </ProtectedRoute>
                } />
                <Route path="/payment/enhanced" element={
                  <ProtectedRoute>
                    <EnhancedPaymentPage/>
                  </ProtectedRoute>
                } />
      <Route path="/payment/:agreementId" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <PaymentPage />
                  </ProtectedRoute>
                } />
      <Route path="/payment-success" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <PaymentSuccessPage />
                  </ProtectedRoute>
                } />
      <Route path="/payment-failed" element={
        <ProtectedRoute allowedRoles={['student']}>
                    <PaymentFailed />
                  </ProtectedRoute>
                } />
                <Route path="/assignments" element={
        <ProtectedRoute allowedRoles={['student']}>
                    <StudentAssignments />
                  </ProtectedRoute>
                } />
                <Route path="/payments/history" element={
                  <ProtectedRoute allowedRoles={['writer']}>
                    <PaymentHistory/>
                  </ProtectedRoute>
                } />
              
                {/* Payment Routes - Must be before agreement routes */}
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/failed" element={<PaymentSuccess />} />
                <Route path="/payment/error" element={<PaymentSuccess />} />
                <Route path="/payment/cancelled" element={<PaymentSuccess />} />
                <Route path="/payment/callback" element={<PaymentSuccess />} />

              </Routes>
  );
};

function App() {
  // Note: Global CSS variables are now defined in index.css
  // Removing dynamic styles to prevent conflicts
  
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <CurrencyProvider>
              <CallProvider>
                <AppLoadingProvider>
                  <AppRoutes />
                </AppLoadingProvider>
              </CallProvider>
            </CurrencyProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;