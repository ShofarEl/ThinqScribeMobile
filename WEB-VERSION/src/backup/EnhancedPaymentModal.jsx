import React, { useState, useEffect } from 'react';
import {
  Modal,
  Card,
  Row,
  Col,
  Button,
  Select,
  Typography,
  Space,
  Alert,
  Divider,
  Tag,
  Tooltip,
  Spin,
  Radio,
  Input,
  message
} from 'antd';
import {
  CreditCardOutlined,
  BankOutlined,
  MobileOutlined,
  GlobalOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  PayCircleOutlined,
  QrcodeOutlined
} from '@ant-design/icons';

import locationService from '../services/locationService';
import currencyService from '../services/currencyService';
import paymentGatewayService from '../services/paymentGatewayService';
import enhancedPaymentAPI from '../api/enhancedPayment';
import { useCurrency } from '../hooks/useCurrency';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const EnhancedPaymentModal = ({
  visible,
  onCancel,
  onPaymentSuccess,
  amount: initialAmount,
  currency: initialCurrency = 'USD',
  title = 'Complete Payment',
  description = '',
  agreementId = null
}) => {
  const { formatLocal, currency: userCurrency, symbol } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);
  const [convertedAmount, setConvertedAmount] = useState(initialAmount);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [currencyList, setCurrencyList] = useState([]);

  // Initialize payment configuration
  useEffect(() => {
    if (visible) {
      initializePayment();
    }
  }, [visible, initialAmount, initialCurrency]);

  // Initialize payment options
  const initializePayment = async () => {
    try {
      setLoading(true);
      
      // Get user location
      const location = await locationService.getLocation();
      setUserLocation(location);
      
      // Get payment configuration
      const config = await paymentGatewayService.getPaymentConfig(
        initialAmount,
        initialCurrency,
        location
      );
      
      setPaymentConfig(config);
      setSelectedGateway(config.gateway);
      setSelectedCurrency(config.currency);
      setConvertedAmount(config.amount);
      
      // Set default payment method
      if (config.paymentMethods.length > 0) {
        setSelectedPaymentMethod(config.paymentMethods[0]);
      }
      
      // Get currency list
      const currencies = currencyService.getSupportedCurrencies();
      setCurrencyList(currencies);
      
      console.log('💳 Payment initialized:', config);
      
    } catch (error) {
      console.error('❌ Failed to initialize payment:', error);
      message.error('Failed to load payment options');
    } finally {
      setLoading(false);
    }
  };

  // Handle currency change
  const handleCurrencyChange = async (newCurrency) => {
    try {
      setLoading(true);
      
      // Convert amount to new currency
      const conversion = await currencyService.convert(
        initialAmount,
        initialCurrency,
        newCurrency
      );
      
      setSelectedCurrency(newCurrency);
      setConvertedAmount(conversion.convertedAmount);
      
      // Update payment configuration
      const config = await paymentGatewayService.getPaymentConfig(
        conversion.convertedAmount,
        newCurrency,
        userLocation
      );
      
      setPaymentConfig(config);
      setSelectedGateway(config.gateway);
      
      // Reset payment method selection
      if (config.paymentMethods.length > 0) {
        setSelectedPaymentMethod(config.paymentMethods[0]);
      }
      
    } catch (error) {
      console.error('❌ Currency conversion failed:', error);
      message.error('Failed to convert currency');
    } finally {
      setLoading(false);
    }
  };

  // Handle gateway change
  const handleGatewayChange = (gatewayId) => {
    const gateway = paymentGatewayService.getGateway(gatewayId);
    setSelectedGateway(gateway);
    
    // Update available payment methods
    const methods = paymentGatewayService.getAvailablePaymentMethods(gatewayId, userLocation);
    if (methods.length > 0) {
      setSelectedPaymentMethod(methods[0]);
    }
  };

  // Handle payment processing
  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      // Validate selections
      if (!selectedGateway || !selectedPaymentMethod) {
        message.error('Please select payment method');
        return;
      }
      
      const paymentData = {
        gateway: selectedGateway.id,
        method: selectedPaymentMethod.id,
        amount: convertedAmount,
        currency: selectedCurrency,
        agreementId,
        userLocation
      };
      
      console.log('💳 Processing payment with backend:', paymentData);
      
      // Create enhanced payment session with selected gateway and currency
      const paymentResponse = await enhancedPaymentAPI.createEnhancedCheckoutSession({
        agreementId,
        amount: convertedAmount,
        currency: selectedCurrency,
        gateway: selectedGateway.id,
        paymentMethod: selectedPaymentMethod.id,
        location: userLocation  // Changed from userLocation to location to match backend expectation
      });
      
      console.log('✅ Payment session created:', paymentResponse);
      
      if (paymentResponse.sessionUrl) {
        // Redirect to payment gateway
        message.loading('Redirecting to payment gateway...', 1);
        setTimeout(() => {
          window.location.href = paymentResponse.sessionUrl;
        }, 1000);
      } else if (paymentResponse.success) {
        // Payment completed successfully (for some gateways)
        message.success('Payment processed successfully!');
        
        if (onPaymentSuccess) {
          onPaymentSuccess({
            ...paymentData,
            sessionId: paymentResponse.sessionId,
            transactionId: paymentResponse.transactionId,
            reference: paymentResponse.reference
          });
        }
      } else {
        throw new Error(paymentResponse.error || 'Payment session creation failed');
      }
      
    } catch (error) {
      console.error('❌ Payment processing failed:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Payment failed. Please try again.';
      if (error.message) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('authorization') || error.message.includes('auth')) {
          errorMessage = 'Authentication error. Please refresh and try again.';
        } else if (error.message.includes('amount') || error.message.includes('currency')) {
          errorMessage = 'Invalid payment amount or currency. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      message.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (methodId) => {
    const icons = {
      card: <CreditCardOutlined />,
      bank_transfer: <BankOutlined />,
      mobile_money: <MobileOutlined />,
      ussd: <PayCircleOutlined />,
      qr: <QrcodeOutlined />,
      digital_wallets: <GlobalOutlined />
    };
    return icons[methodId] || <CreditCardOutlined />;
  };

  // Render loading state
  if (loading) {
    return (
      <Modal
        title="Loading Payment Options"
        open={visible}
        footer={null}
        onCancel={onCancel}
        width={600}
        centered
      >
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text>Setting up your payment options...</Text>
          </div>
        </div>
      </Modal>
    );
  }

  // Calculate fees
  const feeCalculation = selectedGateway && selectedPaymentMethod 
    ? paymentGatewayService.calculateFees(
        convertedAmount,
        selectedCurrency,
        selectedGateway.id,
        selectedPaymentMethod.id
      )
    : { fee: 0, total: convertedAmount };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCardOutlined style={{ color: '#015382', fontSize: '20px' }} />
          <Title level={4} style={{ margin: 0, color: '#015382' }}>
            {title}
          </Title>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      centered
      bodyStyle={{ padding: '24px' }}
    >
      {/* Description */}
      {description && (
        <Alert
          message={description}
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Location and Currency Info */}
      {userLocation && (
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text strong>Location:</Text>
                <Tag icon={<GlobalOutlined />}>
                  {userLocation.flag} {userLocation.displayName}
                </Tag>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text strong>Preferred Gateway:</Text>
                <Tag color={userLocation.isAfrican ? 'green' : 'blue'}>
                  {paymentConfig?.gateway?.name}
                </Tag>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      <Row gutter={16}>
        {/* Payment Configuration */}
        <Col span={24}>
          <Card title="Payment Details" size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Currency:</Text>
                  <Select
                    style={{ width: '100%', marginTop: '4px' }}
                    value={selectedCurrency}
                    onChange={handleCurrencyChange}
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {currencyList.map(currency => (
                      <Option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
              
              <Col span={8}>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Amount:</Text>
                  <div style={{ 
                    marginTop: '4px',
                    padding: '8px 12px',
                    background: '#f5f5f5',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    {currencyService.format(convertedAmount, selectedCurrency)}
                  </div>
                </div>
              </Col>
              
              <Col span={8}>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Gateway:</Text>
                  <Select
                    style={{ width: '100%', marginTop: '4px' }}
                    value={selectedGateway?.id}
                    onChange={handleGatewayChange}
                  >
                    {paymentGatewayService.getAllGateways().map(gateway => (
                      <Option key={gateway.id} value={gateway.id}>
                        {gateway.logo} {gateway.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Payment Methods */}
        <Col span={14}>
          <Card title="Payment Methods" size="small">
            {paymentConfig?.paymentMethods?.length > 0 ? (
              <Radio.Group
                value={selectedPaymentMethod?.id}
                onChange={(e) => {
                  const method = paymentConfig.paymentMethods.find(m => m.id === e.target.value);
                  setSelectedPaymentMethod(method);
                }}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {paymentConfig.paymentMethods.map(method => (
                    <Radio key={method.id} value={method.id} style={{ width: '100%' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '8px 0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {getPaymentMethodIcon(method.id)}
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{method.name}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {method.description}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '11px', color: '#666' }}>
                          <div>{method.processingTime}</div>
                          <div>{method.fees}</div>
                        </div>
                      </div>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <WarningOutlined style={{ fontSize: '24px', color: '#faad14' }} />
                <div style={{ marginTop: '8px' }}>
                  No payment methods available for this configuration
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Payment Summary */}
        <Col span={10}>
          <Card title="Payment Summary" size="small">
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Subtotal:</Text>
                <Text strong>
                  {currencyService.format(convertedAmount, selectedCurrency)}
                </Text>
              </div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Processing Fee ({feeCalculation.rate}%):</Text>
                <Text>
                  {currencyService.format(feeCalculation.fee, selectedCurrency)}
                </Text>
              </div>
            </div>
            
            <Divider style={{ margin: '12px 0' }} />
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: '16px' }}>Total:</Text>
                <Text strong style={{ fontSize: '16px', color: '#015382' }}>
                  {currencyService.format(feeCalculation.total, selectedCurrency)}
                </Text>
              </div>
            </div>

            {/* Gateway Advantages */}
            {selectedGateway && (
              <div style={{ marginTop: '16px' }}>
                <Text strong style={{ fontSize: '12px' }}>Why {selectedGateway.name}?</Text>
                <ul style={{ fontSize: '11px', marginTop: '4px', paddingLeft: '16px' }}>
                  {selectedGateway.advantages.slice(0, 2).map((advantage, index) => (
                    <li key={index}>{advantage}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recommendation */}
      {paymentConfig?.recommendation && (
        <Alert
          message="Payment Recommendation"
          description={paymentConfig.recommendation}
          type="info"
          showIcon
          style={{ margin: '16px 0' }}
        />
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '12px',
        marginTop: '24px'
      }}>
        <Button size="large" onClick={onCancel} disabled={processing}>
          Cancel
        </Button>
        <Button
          type="primary"
          size="large"
          loading={processing}
          onClick={handlePayment}
          disabled={!selectedPaymentMethod}
          style={{
            background: 'linear-gradient(135deg, #015382 0%, #017DB0 100%)',
            border: 'none',
            minWidth: '120px'
          }}
        >
          {processing ? 'Processing...' : `Pay ${currencyService.format(feeCalculation.total, selectedCurrency)}`}
        </Button>
      </div>
    </Modal>
  );
};

export default EnhancedPaymentModal; 