import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Result, Button, Card, Typography, Descriptions, Spin, notification } from 'antd';
import { CheckCircleFilled, ArrowRightOutlined, DashboardOutlined } from '@ant-design/icons';
import { paymentApi } from '../api/payment';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        // Get parameters from URL
        const searchParams = new URLSearchParams(location.search);
        const orderId = searchParams.get('orderId');
        const agreementId = searchParams.get('agreementId');
        
        // If no orderId in query params, check URL path (for direct routes)
        const pathParts = location.pathname.split('/');
        const orderIdFromPath = pathParts[pathParts.indexOf('order') + 1];
        
        const finalOrderId = orderId || orderIdFromPath;
        
        if (!finalOrderId && !agreementId) {
          notification.error({
            message: 'Missing Information',
            description: 'Order ID or Agreement ID is required to fetch payment details.'
          });
          setLoading(false);
          return;
        }

        // Fetch payment details using order ID or agreement ID
        let response;
        if (finalOrderId) {
          response = await paymentApi.getPaymentByOrderId(finalOrderId);
        } else if (agreementId) {
          response = await paymentApi.getPaymentsByAgreementId(agreementId);
          // For agreement payments, get the most recent one
          if (Array.isArray(response) && response.length > 0) {
            response = response.sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
            )[0];
          }
        }

        setPaymentDetails(response);
      } catch (error) {
        console.error('Error fetching payment details:', error);
        notification.error({
          message: 'Error',
          description: 'Failed to load payment details. Please try again later.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [location]);

  const handleViewOrder = () => {
    if (paymentDetails?.agreement) {
      navigate(`/agreements/${paymentDetails.agreement._id}`);
    } else if (paymentDetails?.agreementId) {
      navigate(`/agreements/${paymentDetails.agreementId}`);
    }
  };

  const handleReturnToDashboard = () => {
    if (!user) return;

    if (user.role === 'student') {
      navigate('/student/dashboard');
    } else if (user.role === 'writer') {
      navigate('/writer/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--light-gray)'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  const formatTransactionId = (transactionId) => {
    if (!transactionId) return 'N/A';
    
    // If it's a long string (like Stripe ID), truncate it
    if (transactionId.length > 20) {
      return `${transactionId.substring(0, 10)}...${transactionId.substring(transactionId.length - 4)}`;
    }
    
    return transactionId;
  };

  return (
    <div style={{ 
      padding: '48px 16px', 
      backgroundColor: 'var(--light-gray)', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Result
        icon={<CheckCircleFilled style={{ color: 'var(--primary-color)' }} />}
        title={
          <Title level={2} style={{ color: 'var(--primary-color)' }}>
            Payment Successful!
          </Title>
        }
        subTitle={
          <Text style={{ fontSize: '18px', color: 'var(--dark-gray)' }}>
            Thank you for your payment. Your transaction has been completed successfully.
          </Text>
        }
        extra={[
          <Button 
            key="order" 
            type="primary" 
            icon={<ArrowRightOutlined />}
            onClick={handleViewOrder}
            style={{
              backgroundColor: 'var(--primary-color)',
              borderColor: 'var(--primary-color)'
            }}
          >
            View Order Details
          </Button>,
          <Button 
            key="dashboard" 
            icon={<DashboardOutlined />}
            onClick={handleReturnToDashboard}
          >
            Return to Dashboard
          </Button>
        ]}
      />
      
      {paymentDetails && (
        <Card 
          style={{ 
            maxWidth: '800px', 
            width: '100%', 
            marginTop: '32px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            borderRadius: '12px'
          }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Title level={4} style={{ margin: 0 }}>Payment Receipt</Title>
              <Text type="secondary">
                {paymentDetails.createdAt ? dayjs(paymentDetails.createdAt).format('MMM D, YYYY h:mm A') : 'N/A'}
              </Text>
            </div>
          }
        >
          <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
            <Descriptions.Item label="Amount Paid">
              <Text strong style={{ color: 'var(--primary-color)', fontSize: '16px' }}>
                ${typeof paymentDetails.amount === 'number' ? paymentDetails.amount.toFixed(2) : paymentDetails.amount}
              </Text>
            </Descriptions.Item>
            
            <Descriptions.Item label="Payment Status">
              <Text style={{ color: '#52c41a', fontWeight: '500' }}>
                {paymentDetails.status === 'succeeded' ? 'Successful' : paymentDetails.status}
              </Text>
            </Descriptions.Item>
            
            <Descriptions.Item label="Transaction ID">
              {formatTransactionId(paymentDetails.transactionId || paymentDetails._id)}
            </Descriptions.Item>
            
            <Descriptions.Item label="Payment Method">
              {paymentDetails.paymentMethod || 'Credit Card'}
            </Descriptions.Item>
            
            {paymentDetails.agreement && (
              <Descriptions.Item label="Project Title" span={2}>
                {paymentDetails.agreement.projectDetails?.title || 'Custom Project'}
              </Descriptions.Item>
            )}
            
            {paymentDetails.installmentNumber !== undefined && (
              <Descriptions.Item label="Payment Info">
                Installment {paymentDetails.installmentNumber} of {paymentDetails.totalInstallments || '?'}
              </Descriptions.Item>
            )}
            
            {user && (
              <Descriptions.Item label="Account">
                {user.name || user.email}
              </Descriptions.Item>
            )}
          </Descriptions>
          
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Text type="secondary">
              A confirmation email has been sent to your registered email address.
              If you have any questions, please contact our support team.
            </Text>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PaymentSuccessPage;