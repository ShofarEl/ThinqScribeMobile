import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Steps, Button, Alert, Spin, Divider, notification } from 'antd';
import { LoadingOutlined, CreditCardOutlined, CheckCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { useNotifications } from '../context/NotificationContext';
import enhancedPaymentAPI from '../api/enhancedPayment';
import client from '../api/client';

const { Step } = Steps;

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { socket } = useNotifications();
  
  const [loading, setLoading] = useState(true);
  const [agreement, setAgreement] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Fetch agreement details
  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        console.log('Fetching agreement:', orderId);
        const response = await client.get(`/agreements/${orderId}`);
        console.log('Agreement response:', response);
        setAgreement(response);
      } catch (err) {
        console.error('Error fetching agreement:', err);
        setError(err.response?.data?.message || 'Unable to load agreement details');
        notification.error({
          message: 'Error Loading Agreement',
          description: err.response?.data?.message || 'Unable to load agreement details'
        });
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchAgreement();
    } else {
      setError('No order ID provided');
      setLoading(false);
    }
  }, [orderId]);

  // Listen for payment-related socket events
  useEffect(() => {
    if (!socket || !agreement) return;

    const handlePaymentSuccess = (data) => {
      if (data.orderId === orderId) {
        notification.success({
          message: 'Payment Successful',
          description: 'Your payment has been processed successfully.'
        });
        setCurrentStep(2);
        setTimeout(() => {
          navigate(`/order/${orderId}/success`);
        }, 2000);
      }
    };

    const handlePaymentFailure = (data) => {
      if (data.orderId === orderId) {
        setError(data.error || 'Payment failed. Please try again.');
        setPaymentLoading(false);
        notification.error({
          message: 'Payment Failed',
          description: data.error || 'Payment failed. Please try again.'
        });
      }
    };

    socket.on('paymentSuccess', handlePaymentSuccess);
    socket.on('paymentFailed', handlePaymentFailure);

    return () => {
      socket.off('paymentSuccess', handlePaymentSuccess);
      socket.off('paymentFailed', handlePaymentFailure);
    };
  }, [socket, orderId, agreement, navigate]);

  const handlePayment = async () => {
    setPaymentLoading(true);
    setError(null);
    
    try {
      console.log('Creating checkout session for agreement:', agreement?._id);
      
      // Validate agreement
      if (!agreement?._id) {
        throw new Error('Invalid agreement data');
      }

      // Get the next unpaid installment
      const nextInstallment = agreement.installments?.find(i => !i.isPaid);
      if (!nextInstallment) {
        throw new Error('No pending installments found');
      }

      // Create Paystack checkout session via enhanced API
      const response = await enhancedPaymentAPI.createEnhancedCheckoutSession({
        agreementId: agreement._id,
        paymentType: 'next',
        amount: nextInstallment.amount,
        currency: 'ngn',
        gateway: 'paystack',
        paymentMethod: 'card'
      });
      console.log('Checkout session response:', response);

      const redirectUrl = response.authorizationUrl || response.sessionUrl;
      if (!redirectUrl) {
        console.error('Invalid response:', response);
        throw new Error('No payment authorization URL received');
      }

      // Emit payment initiation event
      socket.emit('paymentInitiated', {
        agreementId: agreement._id,
        installmentId: response.installment?.id,
        amount: response.installment?.amount,
        type: 'installment'
      });

      // Redirect to Paystack authorization
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('Payment setup error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to setup payment';
      setError(errorMessage);
      setPaymentLoading(false);
      notification.error({
        message: 'Payment Setup Failed',
        description: errorMessage
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="shadow-xl rounded-xl border-0 bg-white/90 backdrop-blur-sm p-8">
          <div className="text-center">
            <Spin 
              size="large" 
              indicator={<LoadingOutlined className="text-4xl text-blue-500" spin />}
            />
            <Text className="mt-4 block text-gray-600">Loading payment details...</Text>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-xl mx-auto">
          <Alert
            message="Payment Error"
            description={error}
            type="error"
            showIcon
            className="shadow-lg rounded-xl"
            action={
              <div className="mt-4">
                <Button type="primary" onClick={() => navigate(`/order/${orderId}`)}>
                  Return to Order
                </Button>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Title level={1} className="text-gray-800 mb-2 !text-4xl font-bold">
            Complete Your Payment
          </Title>
          <Text className="text-gray-600 text-lg">
            Review and pay for your service agreement
          </Text>
        </div>

        <Steps current={currentStep} className="mb-8">
          <Step title="Review" icon={<CreditCardOutlined />} />
          <Step title="Payment" icon={<DollarOutlined />} />
          <Step title="Confirmation" icon={<CheckCircleOutlined />} />
        </Steps>

        <Card 
          className="shadow-2xl rounded-2xl border-0 bg-white/90 backdrop-blur-sm"
          bodyStyle={{ padding: '2rem' }}
        >
          <div className="mb-6">
            <Title level={2} className="text-gray-800 mb-4 !text-2xl">
              Agreement Summary
            </Title>
            <div className="space-y-4">
              <div>
                <Text type="secondary">Project Title</Text>
                <div className="text-lg font-medium">{agreement?.projectDetails?.title}</div>
              </div>
              <div>
                <Text type="secondary">Description</Text>
                <div className="text-base">{agreement?.projectDetails?.description}</div>
              </div>
              <Divider />
              <div className="flex justify-between items-center">
                <Text strong className="text-lg">Total Amount</Text>
                <Text strong className="text-2xl text-green-600">
                  ${agreement?.totalAmount?.toFixed(2)}
                </Text>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <Button
              type="primary"
              size="large"
              block
              onClick={handlePayment}
              loading={paymentLoading}
              className="h-14 text-lg font-medium rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0"
              icon={<CreditCardOutlined />}
            >
              {paymentLoading ? 'Processing...' : 'Pay Now'}
            </Button>
            <div className="mt-4 text-center text-sm text-gray-500">
              <svg className="w-4 h-4 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure payment powered by Stripe
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
