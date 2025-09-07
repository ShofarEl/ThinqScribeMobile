import React, { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Select,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  message,
  Alert,
  Tag,
  Spin
} from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  GlobalOutlined,
  CreditCardOutlined,
  BankOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useCurrency } from '../hooks/useCurrency.js';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Corrected and Merged CreateAgreementModal
const CreateAgreementModal = forwardRef(({
  visible,
  onClose,
  onSubmit,
  loading,
  writer
}, ref) => {
  const [form] = Form.useForm();
  // State for installments, now based on direct amount input
  const [installments, setInstallments] = useState([{ amount: 0, dueDate: moment().add(1, 'day') }]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [installmentSum, setInstallmentSum] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const {
    location,
    loading: locationLoading,
    isAfrican
  } = useCurrency();

  // State for new payment features
  const [paymentRecommendation, setPaymentRecommendation] = useState(null);
  // Default to NGN + Paystack per new policy
  const [selectedCurrency, setSelectedCurrency] = useState('ngn');
  const [selectedGateway, setSelectedGateway] = useState('paystack');

  // --- Core Logic Functions ---

  // Function to reset the form state
  const resetAllFields = () => {
    form.resetFields();
    setInstallments([{ amount: 0, dueDate: moment().add(1, 'day') }]);
    setTotalAmount(0);
    setInstallmentSum(0);
    setSelectedCurrency('usd');
    setSelectedGateway('stripe');
  };

  useImperativeHandle(ref, () => ({
    resetFields: resetAllFields
  }));

  // Effect to handle modal visibility changes
  useEffect(() => {
    if (visible) {
      resetAllFields();
    }
  }, [visible]);

  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Effect for Geolocation-based payment recommendations
  useEffect(() => {
    if (location && !locationLoading) {
      const isNigerian = location.countryCode === 'ng';
      const isAfricanCountry = location.isAfrican || isAfrican;

      // Force Paystack + NGN policy
      setSelectedGateway('paystack');
      setPaymentRecommendation({ gateway: 'paystack', currency: 'ngn' });
      setSelectedCurrency(isNigerian ? 'ngn' : (isAfricanCountry ? (location.currency || 'ngn') : 'ngn'));
    }
  }, [location, locationLoading, isAfrican]);

  // Effect to calculate the sum of installments whenever they change
  useEffect(() => {
    const sum = installments.reduce((acc, inst) => acc + (Number(inst.amount) || 0), 0);
    setInstallmentSum(sum);
  }, [installments]);


  // --- Event Handlers ---

  const handleTotalAmountChange = (value) => {
    setTotalAmount(value || 0);
  };

  const handleInstallmentChange = (index, field, value) => {
    const updatedInstallments = [...installments];
    updatedInstallments[index] = { ...updatedInstallments[index], [field]: value };
    setInstallments(updatedInstallments);
  };

  const addInstallment = () => {
    if (installments.length < 10) {
      setInstallments([...installments, { amount: 0, dueDate: moment().add(installments.length + 1, 'day') }]);
    }
  };

  const removeInstallment = (index) => {
    const updated = installments.filter((_, i) => i !== index);
    setInstallments(updated);
  };

  // --- Validation and Submission ---

  const validateForm = () => {
    // 1. Check for total amount
    if (!totalAmount || totalAmount <= 0) {
      message.error('Please enter a valid total project amount.');
      return false;
    }

    // 2. Check if there's at least one installment
    if (installments.length === 0) {
      message.error('Please add at least one installment.');
      return false;
    }

    // 3. Check if sum of installments matches total amount
    if (Math.abs(totalAmount - installmentSum) > 0.01) {
      message.error("The sum of installment amounts must equal the 'Total Project Amount'.");
      return false;
    }

    // 4. Check each installment for valid amount and future date
    for (const inst of installments) {
      if (!inst.amount || inst.amount <= 0) {
        message.error('All installments must have an amount greater than 0.');
        return false;
      }
      if (!inst.dueDate || moment(inst.dueDate).isBefore(moment().startOf('day'))) {
        message.error('All installment due dates must be in the future.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); // Validate Ant Design fields

      if (!validateForm()) { // Run our custom, robust validation
        return;
      }

      // Format data for submission
      const agreementData = {
        writerId: writer._id,
        projectDetails: {
          title: values.title,
          subject: values.subject,
          description: values.description,
          deadline: values.deadline.toDate(),
          requirements: values.requirements || ''
        },
        totalAmount,
        // Send the amount directly, no more percentages
        installments: installments.map(inst => ({
          amount: Number(inst.amount),
          dueDate: inst.dueDate.toDate()
        })),
        // Include the selected payment preferences
        paymentPreferences: {
          currency: selectedCurrency,
          gateway: selectedGateway,
          location: location ? {
            country: location.country,
            countryCode: location.countryCode,
            isAfrican: location.isAfrican || isAfrican
          } : null,
          nativeAmount: totalAmount // Store the original amount in the selected currency
        }
      };

      await onSubmit(agreementData);

    } catch (error) {
      console.error('Form validation failed:', error);
      message.error('Please fill in all required project detail fields.');
    }
  };

  // --- Helper Functions ---
  const getCurrencySymbol = (currency) => ({ 'usd': '$', 'ngn': '₦' }[currency] || '$');

  const getGatewayIcon = (gateway) => (gateway === 'paystack' ? <BankOutlined /> : <CreditCardOutlined />);

  // Check if user is Nigerian
  const isNigerian = location?.countryCode === 'ng';

  return (
    <Modal
      title={
        <div style={{ 
          padding: '8px 0',
          borderBottom: '1px solid #f0f0f0',
          marginBottom: '16px'
        }}>
          <Space>
            <FileTextOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
            <Text strong style={{ fontSize: '18px', color: '#262626' }}>
              Create Service Agreement
            </Text>
          </Space>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={isMobile ? '100vw' : Math.min(1000, window.innerWidth * 0.95)}
      style={{ 
        top: isMobile ? 0 : 20,
        maxWidth: isMobile ? '100vw' : undefined,
        margin: isMobile ? 0 : undefined,
        height: isMobile ? '100vh' : undefined
      }}
      destroyOnClose
      bodyStyle={{ 
        padding: isMobile ? '12px' : '20px',
        maxHeight: isMobile ? 'calc(100vh - 60px)' : '80vh',
        overflowY: 'auto'
      }}
      centered={!isMobile}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} scrollToFirstError>
        
        {/* Professional Payment Gateway Instructions */}
        <Alert
          message={
            <Space>
              <InfoCircleOutlined />
              <Text strong style={{ color: '#1f2937' }}>Payment Gateway Requirements</Text>
            </Space>
          }
          description={
            <div style={{ marginTop: '8px' }}>
              <div style={{ marginBottom: '12px' }}>
                <Text style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>
                  To ensure secure and compliant payment processing, please follow these gateway requirements:
                </Text>
              </div>
              
              <Row gutter={[16, 12]}>
                <Col xs={24} sm={24} md={12}>
                  <div style={{ 
                    padding: '12px', 
                    background: '#f0f9ff', 
                    borderRadius: '8px',
                    border: '1px solid #bfdbfe'
                  }}>
                    <div style={{ marginBottom: '8px' }}>
                      <Space>
                        <Tag color="blue" style={{ marginBottom: '4px' }}>🇳🇬 NIGERIAN USERS</Tag>
                      </Space>
                    </div>
                    <Text strong style={{ color: '#1e40af', display: 'block', marginBottom: '4px' }}>
                      Must Use Paystack Only
                    </Text>
                    <Text style={{ color: '#1e40af', fontSize: '13px' }}>
                      • NGN currency required<br/>
                      • Bank transfer, cards, USSD supported<br/>
                      • Compliance with CBN regulations
                    </Text>
                  </div>
                </Col>
                
                <Col xs={24} sm={24} md={12}>
                  <div style={{ 
                    padding: '12px', 
                    background: '#f0fdf4', 
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{ marginBottom: '8px' }}>
                      <Space>
                        <Tag color="green" style={{ marginBottom: '4px' }}>🌍 NON-NIGERIAN USERS</Tag>
                      </Space>
                    </div>
                    <Text strong style={{ color: '#166534', display: 'block', marginBottom: '4px' }}>
                      Must Use Stripe Only
                    </Text>
                    <Text style={{ color: '#166534', fontSize: '13px' }}>
                      • USD currency required<br/>
                      • International cards supported<br/>
                      • Global payment compliance
                    </Text>
                  </div>
                </Col>
              </Row>
              
              <div style={{ 
                marginTop: '12px', 
                padding: '8px 12px', 
                background: '#fffbeb',
                borderRadius: '6px',
                border: '1px solid #fed7aa'
              }}>
                <Text style={{ color: '#92400e', fontSize: '13px' }}>
                  <ExclamationCircleOutlined style={{ marginRight: '6px' }} />
                  <strong>Important:</strong> Using the incorrect gateway may result in payment processing failures or compliance issues.
                </Text>
              </div>
            </div>
          }
          type="info"
          showIcon={false}
          style={{ 
            marginBottom: '24px',
            border: '1px solid #d1d5db',
            borderRadius: '12px'
          }}
        />

        {/* Location Detection and Recommendation */}
        {location && !locationLoading && (
          <Card 
            size="small" 
            style={{ 
              marginBottom: '20px', 
              background: isNigerian ? '#f0f9ff' : '#f0fdf4',
              border: `1px solid ${isNigerian ? '#bfdbfe' : '#bbf7d0'}`,
              borderRadius: '10px'
            }}
          >
             <Row gutter={[16, 8]} align="middle">
              <Col xs={24} sm={24} md={12}>
                <Space>
                  <GlobalOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                  <Text style={{ color: '#374151', fontWeight: '600' }}>
                    Detected: <strong style={{ color: '#1f2937' }}>
                      {location.displayName || `${location.city}, ${location.country}`}
                    </strong> {location.flag}
                  </Text>
                </Space>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Space>
                  <Text style={{ color: '#374151', fontWeight: '500' }}>Recommended:</Text>
                  <Tag 
                    color={selectedGateway === 'paystack' ? 'blue' : 'green'} 
                    style={{ 
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '2px 8px'
                    }}
                  >
                    {getGatewayIcon(selectedGateway)} {selectedGateway.charAt(0).toUpperCase() + selectedGateway.slice(1)}
                  </Tag>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        {/* Project Details Card */}
        <Card 
          size="small" 
          title={
            <Space>
              <FileTextOutlined style={{ color: '#1890ff' }} />
              <Text strong style={{ color: '#262626', fontSize: '16px' }}>Project Details</Text>
            </Space>
          } 
          style={{ 
            marginBottom: '20px',
            border: '1px solid #e5e7eb',
            borderRadius: '10px'
          }}
          headStyle={{ 
            background: '#fafafa',
            borderRadius: '10px 10px 0 0'
          }}
        >
          <Form.Item 
            name="title" 
            label={<Text strong style={{ color: '#374151' }}>Project Title</Text>} 
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input 
              placeholder="e.g., Research Paper on Climate Change" 
              size="large" 
              style={{ 
                borderRadius: '8px',
                border: '1px solid #d1d5db'
              }}
            />
          </Form.Item>
          
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={24} md={12}>
              <Form.Item 
                name="subject" 
                label={<Text strong style={{ color: '#374151' }}>Subject</Text>} 
                rules={[{ required: true, message: 'Please select a subject' }]}
              >
                <Input 
                  placeholder="e.g., Environmental Science" 
                  size="large"
                  style={{ 
                    borderRadius: '8px',
                    border: '1px solid #d1d5db'
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <Form.Item 
                name="deadline" 
                label={<Text strong style={{ color: '#374151' }}>Deadline</Text>} 
                rules={[{ required: true, message: 'Please select a deadline' }]}
              >
                <DatePicker 
                  showTime 
                  format="YYYY-MM-DD HH:mm" 
                  style={{ 
                    width: '100%',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db'
                  }} 
                  size="large" 
                  disabledDate={(d) => d && d < moment().endOf('day')} 
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item 
            name="description" 
            label={<Text strong style={{ color: '#374151' }}>Project Description</Text>} 
            rules={[{ required: true, message: 'Please describe the project' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Include all requirements, formatting guidelines, expected deliverables, quality standards, etc."
              style={{ 
                borderRadius: '8px',
                border: '1px solid #d1d5db'
              }}
            />
          </Form.Item>
        </Card>

        {/* Payment Structure Card */}
        <Card 
          size="small" 
          title={
            <Space>
              <DollarOutlined style={{ color: '#10b981' }} />
              <Text strong style={{ color: '#262626', fontSize: '16px' }}>Payment Structure</Text>
            </Space>
          } 
          style={{ 
            marginBottom: '20px',
            border: '1px solid #e5e7eb',
            borderRadius: '10px'
          }}
          headStyle={{ 
            background: '#fafafa',
            borderRadius: '10px 10px 0 0'
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={8}>
              <Form.Item 
                label={
                  <Text strong style={{ color: '#374151' }}>
                    Total Project Amount ({getCurrencySymbol(selectedCurrency)})
                  </Text>
                } 
                required
              >
                <InputNumber
                  style={{ 
                    width: '100%',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db'
                  }}
                  size="large"
                  placeholder="Enter total amount"
                  min={1}
                  precision={2}
                  value={totalAmount}
                  onChange={handleTotalAmountChange}
                  prefix={getCurrencySymbol(selectedCurrency)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Form.Item label={<Text strong style={{ color: '#374151' }}>Payment Currency</Text>}>
                <Select 
                  value={selectedCurrency} 
                  onChange={setSelectedCurrency} 
                  size="large"
                  style={{ 
                    borderRadius: '8px'
                  }}
                >
                  <Option value="ngn">🇳🇬 NGN - Nigerian Naira</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Form.Item label={<Text strong style={{ color: '#374151' }}>Payment Gateway</Text>}>
                <Select 
                  value={selectedGateway} 
                  onChange={setSelectedGateway} 
                  size="large"
                  style={{ 
                    borderRadius: '8px'
                  }}
                >
                  <Option value="paystack">
                    <Space>
                      <BankOutlined />
                      Paystack (Cards, Bank, USSD)
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0' }}>
            <Text strong style={{ color: '#6b7280' }}>Payment Installments</Text>
          </Divider>

          <Alert
            message={<Text strong style={{ color: '#1f2937' }}>Installment Setup Instructions</Text>}
            description={
              <Text style={{ color: '#4b5563' }}>
                Break down the total project amount into milestone-based installments. 
                The sum of all installments must exactly match the total project amount above.
              </Text>
            }
            type="info"
            showIcon
            style={{ 
              marginBottom: '16px',
              borderRadius: '8px',
              border: '1px solid #bfdbfe'
            }}
          />

          <div style={{ 
            maxHeight: '300px', 
            overflowY: 'auto', 
            paddingRight: '8px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px'
          }}>
            {installments.map((installment, index) => (
              <Card 
                key={index} 
                size="small" 
                style={{ 
                  marginBottom: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
                title={
                  <Text strong style={{ color: '#1f2937' }}>
                    Installment {index + 1}
                  </Text>
                } 
                extra={
                  installments.length > 1 && (
                    <Button 
                      type="text" 
                      danger 
                      size="small" 
                      icon={<DeleteOutlined />} 
                      onClick={() => removeInstallment(index)}
                      style={{ color: '#ef4444' }}
                    />
                  )
                }
              >
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={24} md={12}>
                    <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px', display: 'block' }}>
                      Amount ({getCurrencySymbol(selectedCurrency)})
                    </Text>
                    <InputNumber
                      style={{ 
                        width: '100%',
                        borderRadius: '6px'
                      }}
                      placeholder="Installment Amount"
                      min={0.01}
                      precision={2}
                      value={installment.amount}
                      onChange={(value) => handleInstallmentChange(index, 'amount', value)}
                      prefix={getCurrencySymbol(selectedCurrency)}
                    />
                  </Col>
                  <Col xs={24} sm={24} md={12}>
                    <Text style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px', display: 'block' }}>
                      Due Date
                    </Text>
                    <DatePicker
                      style={{ 
                        width: '100%',
                        borderRadius: '6px'
                      }}
                      placeholder="Due Date"
                      value={installment.dueDate}
                      onChange={(date) => handleInstallmentChange(index, 'dueDate', date)}
                      disabledDate={(d) => d && d < moment().startOf('day')}
                      format="YYYY-MM-DD"
                    />
                  </Col>
                </Row>
              </Card>
            ))}
          </div>

          <Button 
            type="dashed" 
            onClick={addInstallment} 
            disabled={installments.length >= 10} 
            icon={<PlusOutlined />} 
            block 
            size="large"
            style={{ 
              marginTop: '16px',
              borderRadius: '8px',
              height: '48px',
              border: '2px dashed #d1d5db',
              color: '#6b7280'
            }}
          >
            Add Another Installment
          </Button>

          {/* Payment Validation Summary */}
          <div style={{ 
            background: '#f9fafb', 
            padding: '16px', 
            borderRadius: '8px', 
            marginTop: '20px',
            border: '1px solid #e5e7eb'
          }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: '8px' }}>
              <Col>
                <Text strong style={{ color: '#374151' }}>Total Project Amount:</Text>
              </Col>
              <Col>
                <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>
                  {getCurrencySymbol(selectedCurrency)}{totalAmount.toFixed(2)}
                </Text>
              </Col>
            </Row>
            <Divider style={{ margin: '8px 0' }} />
            <Row justify="space-between" align="middle">
              <Col>
                <Text strong style={{ color: '#374151' }}>Sum of Installments:</Text>
              </Col>
              <Col>
                <Tag 
                  color={Math.abs(totalAmount - installmentSum) > 0.01 || totalAmount === 0 ? 'error' : 'success'}
                  style={{ 
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '4px 12px'
                  }}
                >
                  {getCurrencySymbol(selectedCurrency)}{installmentSum.toFixed(2)}
                </Tag>
              </Col>
            </Row>
            
            {Math.abs(totalAmount - installmentSum) > 0.01 && totalAmount > 0 && (
              <div style={{ marginTop: '8px' }}>
                <Text style={{ color: '#ef4444', fontSize: '13px' }}>
                  <ExclamationCircleOutlined style={{ marginRight: '4px' }} />
                  Difference: {getCurrencySymbol(selectedCurrency)}{Math.abs(totalAmount - installmentSum).toFixed(2)}
                </Text>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: isMobile ? 'center' : 'flex-end', 
          gap: isMobile ? '8px' : '12px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <Button 
            size="large" 
            onClick={onClose} 
            disabled={loading}
            style={{ 
              minWidth: isMobile ? '100%' : '100px',
              borderRadius: '8px',
              order: isMobile ? 2 : 1
            }}
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            size="large" 
            loading={loading} 
            onClick={handleSubmit}
            style={{ 
              minWidth: isMobile ? '100%' : '140px',
              borderRadius: '8px',
              background: '#1890ff',
              order: isMobile ? 1 : 2
            }}
          >
            Create Agreement
          </Button>
        </div>
      </Form>
    </Modal>
  );
});

export default CreateAgreementModal;