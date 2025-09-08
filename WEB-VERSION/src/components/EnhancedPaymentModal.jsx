import {
  BankOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  GlobalOutlined,
  MobileOutlined,
  PayCircleOutlined,
  QrcodeOutlined,
  WarningOutlined
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography
} from 'antd';
import React, { useEffect, useState } from 'react';

import enhancedPaymentAPI from '../api/enhancedPayment';
import { useCurrency } from '../hooks/useCurrency';
import currencyService from '../services/currencyService';
import locationService from '../services/locationService';
import paymentGatewayService from '../services/paymentGatewayService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const EnhancedPaymentModal = ({
  visible,
  onCancel,
  onPaymentSuccess,
  amount: initialAmount,
  currency: initialCurrency = 'USD',
  agreementCurrency = 'USD', // 🆕 NEW: Pass agreement's native currency
  title = 'Complete Payment',
  description = '',
  agreementId = null,
  asPage = false
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
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🔧 FIXED: Initialize with proper currency logic
  useEffect(() => {
    if (asPage || visible) {
      initializePayment();
    }
  }, [asPage, visible, initialAmount, initialCurrency, agreementCurrency]);

  // 🔧 FIXED: Proper initialization without forced conversion
  const initializePayment = async () => {
    try {
      setLoading(true);
      
      // Get user location
      const location = await locationService.getLocation();
      setUserLocation(location);
      
      // 🆕 SMART CURRENCY DEFAULTING:
      let defaultCurrency = initialCurrency;
      
      // If no currency specified, use smart defaults
      if (!initialCurrency || initialCurrency === 'USD') {
        if (agreementCurrency && agreementCurrency !== 'USD') {
          defaultCurrency = agreementCurrency; // Respect agreement currency
        } else if (location?.countryCode === 'ng') {
          defaultCurrency = 'ngn'; // Nigerian users default to NGN
        } else {
          defaultCurrency = 'usd'; // Everyone else defaults to USD
        }
      }
      
      setSelectedCurrency(defaultCurrency.toLowerCase());
      
      // 🔧 FIXED: Don't convert amount if currencies match
      if (defaultCurrency.toLowerCase() === agreementCurrency.toLowerCase()) {
        setConvertedAmount(initialAmount); // No conversion needed
      } else {
        // Only convert if currencies are different
        try {
          const rates = await currencyService.getExchangeRates();
          const rate = rates[defaultCurrency.toUpperCase()] || 1;
          const newAmount = agreementCurrency.toLowerCase() === 'usd' 
            ? initialAmount * rate 
            : initialAmount / rate;
          setConvertedAmount(newAmount);
        } catch (error) {
          console.warn('Exchange rate fetch failed, using original amount');
          setConvertedAmount(initialAmount);
        }
      }
      
      // Get payment configuration
      const config = await paymentGatewayService.getPaymentConfig(
        convertedAmount || initialAmount,
        defaultCurrency,
        location
      );
      
      setPaymentConfig(config);
      
      // Smart gateway selection
      const smartGateway = defaultCurrency === 'usd' ? 'stripe' : 'paystack';
      setSelectedGateway(paymentGatewayService.getGateway(smartGateway));
      
      // Set default payment method
      if (config.paymentMethods && config.paymentMethods.length > 0) {
        setSelectedPaymentMethod(config.paymentMethods[0]);
      }
      
      // Get currency list
      const currencies = currencyService.getSupportedCurrencies();
      setCurrencyList(currencies);
      
      console.log('💳 [FIXED] Payment initialized:', {
        agreementCurrency,
        selectedCurrency: defaultCurrency,
        originalAmount: initialAmount,
        convertedAmount: convertedAmount || initialAmount,
        smartGateway
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize payment:', error);
      message.error('Failed to load payment options');
    } finally {
      setLoading(false);
    }
  };

  // 🔧 FIXED: Handle currency change without double conversion
  const handleCurrencyChange = async (newCurrency) => {
    try {
      setLoading(true);
      
      console.log('💱 [FIXED] Currency change requested:', {
        from: selectedCurrency,
        to: newCurrency,
        originalAmount: initialAmount,
        agreementCurrency
      });
      
      setSelectedCurrency(newCurrency);
      
      // 🔧 FIXED: Smart conversion logic
      let newAmount = initialAmount;
      
      if (newCurrency.toLowerCase() === agreementCurrency.toLowerCase()) {
        // Converting back to agreement's native currency - use original amount
        newAmount = initialAmount;
        console.log('💱 Using original amount (same as agreement currency)');
      } else {
        // Converting to different currency - apply exchange rate
        try {
          const rates = await currencyService.getExchangeRates();
          if (agreementCurrency.toLowerCase() === 'usd' && newCurrency !== 'usd') {
            // USD agreement, converting to local currency
            newAmount = initialAmount * (rates[newCurrency.toUpperCase()] || 1);
          } else if (agreementCurrency.toLowerCase() !== 'usd' && newCurrency === 'usd') {
            // Local agreement, converting to USD
            newAmount = initialAmount / (rates[agreementCurrency.toUpperCase()] || 1);
          } else {
            // Cross-currency conversion (rare case)
            const usdAmount = agreementCurrency.toLowerCase() === 'usd' 
              ? initialAmount 
              : initialAmount / (rates[agreementCurrency.toUpperCase()] || 1);
            newAmount = newCurrency === 'usd' 
              ? usdAmount 
              : usdAmount * (rates[newCurrency.toUpperCase()] || 1);
          }
        } catch (error) {
          console.warn('Exchange rate fetch failed during conversion');
          newAmount = initialAmount;
        }
      }
      
      setConvertedAmount(newAmount);
      
      // Smart gateway recommendation
      const recommendedGateway = newCurrency === 'usd' ? 'stripe' : 'paystack';
      const gateway = paymentGatewayService.getGateway(recommendedGateway);
      setSelectedGateway(gateway);
      
      console.log('💱 [FIXED] Currency converted:', {
        newCurrency,
        newAmount,
        recommendedGateway
      });
      
      // Update payment configuration
      const config = await paymentGatewayService.getPaymentConfig(
        newAmount,
        newCurrency,
        userLocation
      );
      
      setPaymentConfig(config);
      
      // Reset payment method selection
      if (config.paymentMethods && config.paymentMethods.length > 0) {
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
    
    console.log('💳 Gateway changed to:', {
      gatewayId,
      gatewayName: gateway?.name,
      currency: selectedCurrency,
      compatible: gateway?.supportedCurrencies?.includes(selectedCurrency.toUpperCase())
    });
    
    // Update available payment methods
    const methods = paymentGatewayService.getAvailablePaymentMethods(gatewayId, userLocation);
    if (methods && methods.length > 0) {
      setSelectedPaymentMethod(methods[0]);
    }
  };

  // 🔧 FIXED: Payment processing with correct currency data
  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      // Validate selections
      if (!selectedGateway || !selectedPaymentMethod) {
        message.error('Please select payment method');
        return;
      }
      
      // 🔧 CRITICAL: Final amount validation and rounding before payment
      let finalAmount = convertedAmount || initialAmount;
      
      // Round to 3 decimal places for more precision
      finalAmount = Math.round(finalAmount * 1000) / 1000;
      
      // Ensure minimum amount
      if (finalAmount < 0.002) {
        finalAmount = 0.002; // Set to minimum instead of erroring
        console.warn('💳 Amount was below minimum, setting to 0.002');
      }
      
      console.log('💳 [EnhancedPaymentModal] Final amount validation:', {
        original: initialAmount,
        converted: convertedAmount,
        final: finalAmount
      });
      
      const paymentData = {
        gateway: selectedGateway.id,
        method: selectedPaymentMethod.id,
        amount: finalAmount, // 🔧 Use validated and rounded amount
        currency: selectedCurrency,
        agreementCurrency: agreementCurrency, // 🆕 Pass agreement's native currency
        agreementId,
        userLocation
      };
      
      console.log('💳 [FIXED] Processing payment:', paymentData);
      
      // 🔧 FIXED: Enhanced payment API call with currency context
      const paymentResponse = await enhancedPaymentAPI.createEnhancedCheckoutSession({
        agreementId,
        paymentType: 'next',
        amount: finalAmount, // 🔧 Use validated final amount
        currency: selectedCurrency,
        gateway: selectedGateway.id,
        paymentMethod: selectedPaymentMethod.id,
        location: userLocation,
        originalCurrency: agreementCurrency // 🆕 Help backend understand context
      });
      
      console.log('✅ [FIXED] Payment session created:', paymentResponse);
      
      // Handle different gateway response structures
      if (paymentResponse.sessionUrl || paymentResponse.authorizationUrl) {
        // Store agreement ID for post-payment redirection
        if (agreementId) {
          localStorage.setItem('currentAgreementId', agreementId);
        }
        
        // Redirect to payment gateway
        const redirectUrl = paymentResponse.sessionUrl || paymentResponse.authorizationUrl;
        console.log('🚀 Redirecting to payment gateway:', redirectUrl);
        
        message.loading('Redirecting to payment gateway...', 1);
        setTimeout(() => {
          window.location.href = redirectUrl;
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
        throw new Error('No payment URL received from gateway');
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
    if (asPage) {
      return (
        <div style={{ 
          maxWidth: isMobile ? '100%' : 900, 
          margin: isMobile ? '12px' : '24px auto', 
          padding: isMobile ? '0 12px' : '0 16px' 
        }}>
          <div style={{ textAlign: 'center', padding: isMobile ? '20px' : '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Setting up your payment options...</Text>
            </div>
          </div>
        </div>
      );
    }
    return (
      <Modal
        title="Loading Payment Options"
        open={visible}
        footer={null}
        onCancel={onCancel}
        width={isMobile ? '100vw' : 600}
        style={{
          top: isMobile ? 0 : undefined,
          maxWidth: isMobile ? '100vw' : undefined,
          margin: isMobile ? 0 : undefined,
          height: isMobile ? '100vh' : undefined
        }}
        bodyStyle={{
          padding: isMobile ? '12px' : '24px',
          maxHeight: isMobile ? 'calc(100vh - 60px)' : undefined,
          overflowY: 'auto'
        }}
        centered={!isMobile}
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

  // 🔧 FIXED: Proper fee calculation
  const feeCalculation = selectedGateway && selectedPaymentMethod 
    ? paymentGatewayService.calculateFees(
        convertedAmount,
        selectedCurrency,
        selectedGateway.id,
        selectedPaymentMethod.id
      )
    : { fee: 0, total: convertedAmount, rate: '0' };

  const headerNode = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <CreditCardOutlined style={{ color: '#015382', fontSize: '20px' }} />
      <Title level={4} style={{ margin: 0, color: '#015382' }}>
        {title}
      </Title>
    </div>
  );

  const content = (
    <>
      {/* 🔧 FIXED: Better currency context display */}
      {description && (
        <Alert
          message={
            <div>
              <Text>{description}</Text>
              {agreementCurrency && (
                <Text style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
                  (Agreement created in {agreementCurrency.toUpperCase()})
                </Text>
              )}
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Location and Currency Info */}
      {userLocation && (
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col xs={24} sm={24} md={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text strong>Location:</Text>
                <Tag icon={<GlobalOutlined />}>
                  {userLocation.flag} {userLocation.displayName}
                </Tag>
              </div>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text strong>Recommended Gateway:</Text>
                <Tag color={selectedGateway?.id === 'paystack' ? 'green' : 'blue'}>
                  {selectedGateway?.name}
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
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={8}>
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
              
              <Col xs={24} sm={24} md={8}>
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
              
              <Col xs={24} sm={24} md={8}>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Gateway:</Text>
                  <Space direction="vertical" style={{ width: '100%', marginTop: '4px' }}>
                    <Select
                      style={{ width: '100%' }}
                      value={selectedGateway?.id}
                      onChange={handleGatewayChange}
                    >
                      {paymentGatewayService.getAllGateways().map(gateway => (
                        <Option key={gateway.id} value={gateway.id}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {gateway.logo} {gateway.name}
                            {/* Compatibility indicator */}
                            {gateway.supportedCurrencies.includes(selectedCurrency.toUpperCase()) ? 
                              <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                              <WarningOutlined style={{ color: '#faad14' }} />
                            }
                          </div>
                        </Option>
                      ))}
                    </Select>
                    
                    {/* Gateway recommendation */}
                    {selectedCurrency === 'usd' && selectedGateway?.id !== 'stripe' && (
                      <Alert
                        message="Stripe Recommended for USD"
                        description="Stripe provides better support for USD transactions worldwide"
                        type="info"
                        showIcon
                        size="small"
                        action={
                          <Button 
                            size="small" 
                            type="link"
                            onClick={() => handleGatewayChange('stripe')}
                          >
                            Switch to Stripe
                          </Button>
                        }
                      />
                    )}
                    
                    {selectedCurrency === 'ngn' && selectedGateway?.id !== 'paystack' && (
                      <Alert
                        message="Paystack Recommended for NGN"
                        description="Paystack offers better rates and local payment methods for Nigerian customers"
                        type="info"
                        showIcon
                        size="small"
                        action={
                          <Button 
                            size="small" 
                            type="link"
                            onClick={() => handleGatewayChange('paystack')}
                          >
                            Switch to Paystack
                          </Button>
                        }
                      />
                    )}
                    
                    {/* Compatibility warning */}
                    {selectedGateway && !selectedGateway.supportedCurrencies.includes(selectedCurrency.toUpperCase()) && (
                      <Alert
                        message="Currency Not Supported"
                        description={`${selectedGateway.name} may not support ${selectedCurrency.toUpperCase()} payments`}
                        type="warning"
                        showIcon
                        size="small"
                      />
                    )}
                  </Space>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Payment Methods */}
        <Col xs={24} sm={24} md={14}>
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
        <Col xs={24} sm={24} md={10}>
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
            {selectedGateway && selectedGateway.advantages && (
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
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: isMobile ? 'center' : 'flex-end', 
        gap: isMobile ? '8px' : '12px',
        marginTop: '24px'
      }}>
        <Button 
          size="large" 
          onClick={onCancel} 
          disabled={processing}
          style={{
            minWidth: isMobile ? '100%' : 'auto',
            order: isMobile ? 2 : 1
          }}
        >
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
            minWidth: isMobile ? '100%' : '120px',
            order: isMobile ? 1 : 2
          }}
        >
          {processing ? 'Processing...' : `Pay ${currencyService.format(feeCalculation.total, selectedCurrency)}`}
        </Button>
      </div>
    </>
  );

  return asPage ? (
    <div style={{ 
      maxWidth: isMobile ? '100%' : 1000, 
      margin: isMobile ? '12px' : '24px auto', 
      padding: isMobile ? '0 12px' : '0 16px' 
    }}>
      {headerNode}
      <div style={{ marginTop: 16 }}>
        {content}
      </div>
    </div>
  ) : (
    <Modal
      title={headerNode}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={isMobile ? '100vw' : 700}
      style={{
        top: isMobile ? 0 : undefined,
        maxWidth: isMobile ? '100vw' : undefined,
        margin: isMobile ? 0 : undefined,
        height: isMobile ? '100vh' : undefined
      }}
      bodyStyle={{ 
        padding: isMobile ? '12px' : '24px',
        maxHeight: isMobile ? 'calc(100vh - 60px)' : undefined,
        overflowY: 'auto'
      }}
      centered={!isMobile}
    >
      {content}
    </Modal>
  );
};

export default EnhancedPaymentModal;