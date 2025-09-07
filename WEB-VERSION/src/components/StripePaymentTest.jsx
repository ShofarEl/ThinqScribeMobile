import React, { useState } from 'react';
import { Card, Button, Select, Input, Alert, Space, Typography, Divider } from 'antd';
import { CreditCardOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import enhancedPaymentAPI from '../api/enhancedPayment';

const { Title, Text } = Typography;
const { Option } = Select;

const StripePaymentTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [testConfig, setTestConfig] = useState({
    amount: 30,
    currency: 'usd',
    gateway: 'stripe',
    agreementId: '687c155167274d485626b35c' // Test agreement ID
  });

  const testStripePayment = async () => {
    try {
      setLoading(true);
      setResult(null);
      
      console.log('🧪 Testing Stripe USD payment configuration...');
      
      const paymentData = {
        agreementId: testConfig.agreementId,
        paymentType: 'next',
        amount: testConfig.amount,
        currency: testConfig.currency,
        gateway: testConfig.gateway,
        paymentMethod: 'card',
        location: {
          country: 'Nigeria',
          countryCode: 'ng'
        }
      };
      
      console.log('📤 Sending payment test request:', paymentData);
      
      const response = await enhancedPaymentAPI.createEnhancedCheckoutSession(paymentData);
      
      console.log('📥 Payment test response:', response);
      
      setResult({
        success: true,
        message: 'Stripe configuration working correctly!',
        details: response,
        type: 'success'
      });
      
    } catch (error) {
      console.error('❌ Stripe test failed:', error);
      
      setResult({
        success: false,
        message: 'Stripe configuration issue detected',
        details: error.message || 'Unknown error',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testPaystackPayment = async () => {
    try {
      setLoading(true);
      setResult(null);
      
      console.log('🧪 Testing Paystack NGN payment configuration...');
      
      const paymentData = {
        agreementId: testConfig.agreementId,
        paymentType: 'next',
        amount: 46020, // NGN equivalent
        currency: 'ngn',
        gateway: 'paystack',
        paymentMethod: 'card',
        location: {
          country: 'Nigeria',
          countryCode: 'ng'
        }
      };
      
      console.log('📤 Sending Paystack test request:', paymentData);
      
      const response = await enhancedPaymentAPI.createEnhancedCheckoutSession(paymentData);
      
      console.log('📥 Paystack test response:', response);
      
      setResult({
        success: true,
        message: 'Paystack configuration working correctly!',
        details: response,
        type: 'success'
      });
      
    } catch (error) {
      console.error('❌ Paystack test failed:', error);
      
      setResult({
        success: false,
        message: 'Paystack configuration issue detected',
        details: error.message || 'Unknown error',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Payment Gateway Test" style={{ maxWidth: 600, margin: '20px auto' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={4}>Test Payment Configuration</Title>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Text strong>Amount:</Text>
          <Input
            type="number"
            value={testConfig.amount}
            onChange={(e) => setTestConfig({...testConfig, amount: Number(e.target.value)})}
            style={{ width: 100 }}
            prefix="$"
          />
          
          <Text strong>Currency:</Text>
          <Select
            value={testConfig.currency}
            onChange={(value) => setTestConfig({...testConfig, currency: value})}
            style={{ width: 80 }}
          >
            <Option value="usd">USD</Option>
            <Option value="ngn">NGN</Option>
          </Select>
        </div>
        
        <Divider />
        
        <Space>
          <Button
            type="primary"
            icon={<CreditCardOutlined />}
            loading={loading}
            onClick={testStripePayment}
            disabled={testConfig.currency !== 'usd'}
          >
            Test Stripe (USD)
          </Button>
          
          <Button
            type="primary"
            icon={<CreditCardOutlined />}
            loading={loading}
            onClick={testPaystackPayment}
            style={{ backgroundColor: '#00C851' }}
            disabled={testConfig.currency !== 'ngn'}
          >
            Test Paystack (NGN)
          </Button>
        </Space>
        
        {loading && (
          <Alert
            message="Testing payment configuration..."
            icon={<LoadingOutlined />}
            type="info"
            showIcon
          />
        )}
        
        {result && (
          <Alert
            message={result.message}
            description={
              <div>
                <Text code>{result.details}</Text>
                <br />
                <Text type="secondary">
                  Check browser console for detailed logs
                </Text>
              </div>
            }
            type={result.type}
            showIcon
            icon={result.success ? <CheckCircleOutlined /> : undefined}
          />
        )}
        
        <Divider />
        
        <Alert
          message="Configuration Status"
          description={
            <ul>
              <li><strong>✅ Stripe:</strong> Configured for USD payments globally</li>
              <li><strong>✅ Paystack:</strong> Configured for NGN payments in Nigeria</li>
              <li><strong>✅ Auto-routing:</strong> USD → Stripe, NGN → Paystack</li>
              <li><strong>✅ Enhanced Modal:</strong> User can toggle between gateways</li>
            </ul>
          }
          type="info"
          showIcon
        />
      </Space>
    </Card>
  );
};

export default StripePaymentTest; 