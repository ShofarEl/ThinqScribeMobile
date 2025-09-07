import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Result, Button, Spin, Typography, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import HeaderComponent from '../components/HeaderComponent';
import client from '../api/client';
import AppLoader from '../components/AppLoader';

const { Text, Paragraph } = Typography;

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);
  const [dashboardRefreshed, setDashboardRefreshed] = useState(false);

  const reference = searchParams.get('reference') || searchParams.get('trxref') || searchParams.get('session_id');
  const status = searchParams.get('status');
  const agreementId = searchParams.get('agreement') || searchParams.get('agreement_id');
  const errorMessage = searchParams.get('error');

  // Determine payment gateway based on reference format
  const isStripePayment = reference && reference.startsWith('cs_');
  const isPaystackPayment = reference && !reference.startsWith('cs_');

  // 🔥 POLLING TO VERIFY PAYMENT PROCESSING
  useEffect(() => {
    if (!reference || !paymentData || dashboardRefreshed) return;

    let pollCount = 0;
    const maxPolls = 10;
    
    const pollPaymentStatus = async () => {
      try {
        pollCount++;
        console.log(`🔍 Polling payment status (${pollCount}/${maxPolls}) for:`, reference);
        
        const response = await client.post(`/payment/manual-verify/${reference}`);
        
        // Add better error handling for undefined responses
        if (response && response.data && response.data.success) {
          console.log('✅ Payment verified via polling - stopping polls');
          setDashboardRefreshed(true);
          localStorage.setItem('forceRefreshDashboard', 'true');
          return true;
        }
        
        return false;
      } catch (error) {
        console.log(`⚠️ Poll ${pollCount} failed:`, error.message);
        return false;
      }
    };

    const pollInterval = setInterval(async () => {
      const shouldStop = await pollPaymentStatus();
      
      if (shouldStop || pollCount >= maxPolls) {
        clearInterval(pollInterval);
        if (pollCount >= maxPolls) {
          console.log('⏰ Polling timeout reached');
        }
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [reference, paymentData, dashboardRefreshed]);

  useEffect(() => {
    console.log('💳 Payment page loaded with params:', {
      reference,
      status,
      agreementId,
      error: errorMessage,
      fullUrl: window.location.href,
      pathname: window.location.pathname
    });

    const timer = setTimeout(() => {
      setLoading(false);
      
      if (window.location.pathname === '/payment/success' && reference) {
        console.log('✅ Payment successful - success path with reference');
        setPaymentData({
          reference,
          status: 'success',
          agreementId,
          message: isStripePayment ? 'Stripe payment completed successfully!' : 'Payment completed successfully!',
          gateway: isStripePayment ? 'stripe' : 'paystack'
        });
        triggerDashboardRefresh();
        return;
      }
      
      if (status === 'success' && reference) {
        console.log('✅ Payment successful - explicit status');
        setPaymentData({
          reference,
          status: 'success',
          agreementId,
          message: isStripePayment ? 'Stripe payment completed successfully!' : 'Payment completed successfully!',
          gateway: isStripePayment ? 'stripe' : 'paystack'
        });
        triggerDashboardRefresh();
        return;
      }
      
      // Special handling for Stripe checkout success
      if (isStripePayment && window.location.pathname === '/payment/success') {
        console.log('✅ Stripe payment detected - showing success');
        setPaymentData({
          reference,
          status: 'success',
          agreementId,
          message: 'Stripe payment completed successfully!',
          gateway: 'stripe'
        });
        triggerDashboardRefresh();
        return;
      }
      
      if (errorMessage) {
        setError(`Payment error: ${decodeURIComponent(errorMessage)}`);
      } else if (window.location.pathname.includes('/payment/failed')) {
        setError('Payment was not completed successfully. Please try again.');
      } else if (window.location.pathname.includes('/payment/cancelled')) {
        setError('Payment was cancelled. You can try again when ready.');
      } else if (status && status !== 'success') {
        setError(`Payment ${status}. Please try again or contact support.`);
      } else {
        setError('Unable to verify payment status. Please check your dashboard or contact support.');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [reference, status, agreementId, errorMessage]);

  const triggerDashboardRefresh = async () => {
    console.log('🔄 Triggering comprehensive dashboard refresh...');
    
    try {
      localStorage.setItem('forceRefreshDashboard', 'true');
      localStorage.setItem('paymentJustCompleted', reference || 'true');
      
      if (reference) {
        try {
          await handleManualVerification();
        } catch (error) {
          console.log('⚠️ Manual verification failed, continuing with other methods');
        }
      }
      
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: 'PAYMENT_SUCCESS', reference, agreementId }, '*');
      }
      
      if (window.BroadcastChannel) {
        const channel = new BroadcastChannel('payment-updates');
        channel.postMessage({
          type: 'PAYMENT_SUCCESS',
          reference,
          agreementId,
          timestamp: Date.now()
        });
        channel.close();
      }
      
      try {
        const dashboardResponse = await client.get('/user/dashboard/student');
        if (dashboardResponse.data && dashboardResponse.data.stats) {
          localStorage.setItem('edu_sage_total_spent', dashboardResponse.data.stats.totalSpent?.toString() || '0');
          localStorage.setItem('dashboardLastUpdate', Date.now().toString());
        }
      } catch (error) {
        console.log('⚠️ Dashboard API call failed:', error.message);
      }
      
      console.log('✅ All dashboard refresh methods triggered');
      
    } catch (error) {
      console.error('🔴 Error triggering dashboard refresh:', error);
    }
  };

  const handleViewAgreement = () => {
    const targetAgreementId = agreementId || 
                               searchParams.get('agreement') || 
                               localStorage.getItem('currentAgreementId');
    
    if (targetAgreementId) {
      navigate(`/agreements/${targetAgreementId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleBackToDashboard = () => {
    localStorage.setItem('forceRefreshDashboard', 'true');
    navigate('/dashboard');
  };

  const handleRefreshDashboard = () => {
    localStorage.setItem('forceRefreshDashboard', 'true');
    
    if (window.location.pathname === '/dashboard') {
      window.location.reload();
    } else {
      navigate('/dashboard');
    }
  };

  const handleManualVerification = async () => {
    if (!reference) return;

    try {
      const response = await client.post(`/payment/manual-verify/${reference}`);
      
      // Add better error handling for undefined responses
      if (response && response.data && response.data.success) {
        setPaymentData({
          reference,
          status: 'success',
          agreementId,
          message: 'Payment manually verified and processed!'
        });
        setError(null);
        localStorage.setItem('forceRefreshDashboard', 'true');
      } else {
        console.log('⚠️ Manual verification failed - no success response');
        setError('Payment verification failed. Please try again.');
      }
    } catch (error) {
      console.error('🔴 Manual verification error:', error);
      setError('Payment verification failed. Please contact support.');
    }
  };

  if (loading) {
    return (
      <>
        <HeaderComponent />
        <AppLoader />
      </>
    );
  }

  return (
    <>
      <HeaderComponent />
      <div style={{ 
        padding: '40px 20px', 
        maxWidth: '800px', 
        margin: '0 auto',
        minHeight: '60vh'
      }}>
        <Card style={{ borderRadius: '12px' }}>
          {paymentData ? (
            <Result
              status="success"
              title="Payment Successful!"
              subTitle={
                <div>
                  <Paragraph>
                    {paymentData.message}
                  </Paragraph>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                    <Text type="secondary">Payment Reference: </Text>
                    <Tag color="blue" style={{ fontFamily: 'monospace' }}>
                      {paymentData.reference}
                    </Tag>
                    {paymentData.gateway && (
                      <>
                        <Text type="secondary">via</Text>
                        <Tag color={paymentData.gateway === 'stripe' ? 'purple' : 'green'}>
                          {paymentData.gateway === 'stripe' ? '💳 Stripe' : '🏦 Paystack'}
                        </Tag>
                      </>
                    )}
                    </div>
                </div>
              }
              extra={[
                <Button type="primary" key="agreement" onClick={handleViewAgreement}>
                  View Agreement
                </Button>,
                <Button key="dashboard" onClick={handleBackToDashboard}>
                  Back to Dashboard
                </Button>,
                <Button 
                  key="refresh" 
                  type="dashed"
                  onClick={handleRefreshDashboard}
                  style={{ 
                    borderColor: '#1890ff',
                    color: '#1890ff'
                  }}
                >
                  🔄 Refresh Dashboard
                </Button>,
              ]}
            />
          ) : (
            <Result
              icon={<CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '64px' }} />}
              status="error"
              title="Payment Verification Failed"
              subTitle={
                <div>
                  <Paragraph>
                    {error || 'We could not verify your payment. Please contact support if you believe this is an error.'}
                  </Paragraph>
                  {reference && (
                    <div style={{ marginTop: '16px' }}>
                      <Text strong>Reference: </Text>
                      <Tag color="red">{reference}</Tag>
                    </div>
                  )}
                </div>
              }
              extra={[
                <Button type="primary" key="dashboard" onClick={handleBackToDashboard}>
                  Back to Dashboard
                </Button>,
                <Button key="support" onClick={() => navigate('/support')}>
                  Contact Support
                </Button>,
              ]}
            />
          )}
        </Card>
      </div>
    </>
  );
};

export default PaymentSuccess; 