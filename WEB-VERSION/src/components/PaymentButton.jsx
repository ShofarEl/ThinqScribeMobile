import React, { useState } from 'react';
import { Button, notification } from 'antd';
import { CreditCardOutlined, LoadingOutlined } from '@ant-design/icons';
import { agreementApi } from '../api/agreement';
import { AGREEMENT_STATUS } from '../types/agreement';

const PaymentButton = ({ orderId, amount, status, onPaymentInitiated }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!orderId || !amount) {
      notification.error({
        message: 'Payment Error',
        description: 'Missing order information. Please refresh the page.',
      });
      return;
    }

    setLoading(true);
    
    try {
      // Create checkout session
      const response = await agreementApi.createCheckoutSession(orderId);
      
      if (!response?.sessionUrl) {
        throw new Error('No payment session URL received');
      }

      // Call callback if provided
      if (onPaymentInitiated) {
        onPaymentInitiated();
      }

      // Redirect to Stripe checkout
      window.location.href = response.sessionUrl;
      
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
      
      notification.error({
        message: 'Payment Setup Failed',
        description: error.response?.data?.message || error.message || 'Unable to initiate payment. Please try again.',
      });
    }
  };

  const getButtonProps = () => {
    switch (status) {
      case AGREEMENT_STATUS.PENDING:
        return {
          type: 'primary',
          size: 'large',
          icon: loading ? <LoadingOutlined /> : <CreditCardOutlined />,
          loading,
          children: loading ? 'Processing...' : `Pay $${amount?.toFixed(2)}`,
          onClick: handlePayment,
          disabled: !amount || amount <= 0
        };
      
      case AGREEMENT_STATUS.ACTIVE:
        return {
          type: 'default',
          size: 'large',
          children: 'Payment Completed',
          disabled: true,
          icon: <CreditCardOutlined />,
        };
      
      case AGREEMENT_STATUS.COMPLETED:
        return {
          type: 'default',
          size: 'large',
          children: 'Project Completed',
          disabled: true,
        };
      
      default:
        return {
          type: 'default',
          size: 'large',
          children: 'Payment Unavailable',
          disabled: true,
        };
    }
  };

  return <Button {...getButtonProps()} />;
};

export default PaymentButton; 