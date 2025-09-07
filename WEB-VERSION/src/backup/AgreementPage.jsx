import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Spin, 
  Alert, 
  Typography, 
  Steps, 
  Tag, 
  Divider, 
  notification, 
  Row, 
  Col, 
  Progress,
  Timeline,
  Space,
  Descriptions,
  Form
} from 'antd';
import { 
  CreditCardOutlined, 
  LoadingOutlined, 
  CheckCircleOutlined,
  FileDoneOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  LockOutlined,
  CalendarOutlined,
  UserOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { agreementApi } from '../api/agreement';
import { AGREEMENT_STATUS } from '../types/agreement';
import HeaderComponent from '../components/HeaderComponent';
import moment from 'moment';
import PaymentStatusTag from '../components/PaymentStatusTag';
import { getCorrectPaymentStatus, getPaymentStatusColor, formatPaymentAmount } from '../utils/paymentUtils';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const AgreementPage = () => {
  const { orderId, agreementId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useNotifications();
  
  // Use agreementId if available, otherwise use orderId
  const currentId = agreementId || orderId;
  const isAgreementView = !!agreementId;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(null);

  // Fetch order/agreement details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!currentId) {
        setError('No order ID provided. Please check the URL and try again.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        console.log('Fetching agreement with ID:', currentId);
        const orderData = await agreementApi.getAgreement(currentId);
        console.log('Fetched order data:', orderData);
        
        if (!orderData) {
          throw new Error('Agreement not found');
        }
        
        setOrder(orderData);
        
        // Set current step based on order status
        switch(orderData.status) {
          case AGREEMENT_STATUS.PENDING:
            setCurrentStep(0);
            break;
          case AGREEMENT_STATUS.ACTIVE:
            setCurrentStep(2);
            break;
          case AGREEMENT_STATUS.COMPLETED:
            setCurrentStep(3);
            break;
          default:
            setCurrentStep(0);
        }
      } catch (err) {
        console.error('Error fetching agreement:', err);
        setError(err.message || 'Unable to load agreement details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [currentId]);

  // Listen for payment-related socket events
  useEffect(() => {
    if (!socket || !order || !user) return;

    socket.emit('joinUserRoom', user._id);

    const handlePaymentSuccess = (data) => {
      if (data.agreementId === currentId) {
        // Update all processing installments to paid
        const updatedInstallments = order.installments?.map(inst => {
          if (inst._id === data.installmentId || inst.status === 'processing') {
            return { ...inst, status: 'paid', isPaid: true, paymentDate: new Date() };
          }
          return inst;
        }) || [];
        
        // Calculate new paid amount
        const newPaidAmount = updatedInstallments.reduce((sum, inst) => {
          return sum + (inst.status === 'paid' ? inst.amount : 0);
        }, 0);
        
        // Update local storage for dashboard total spent
        try {
          const currentSpent = parseFloat(localStorage.getItem('edu_sage_total_spent') || '0');
          const newTotalSpent = currentSpent + data.amount;
          localStorage.setItem('edu_sage_total_spent', newTotalSpent.toString());
          console.log('Updated localStorage total spent to:', newTotalSpent);
        } catch (e) {
          console.error('Error updating localStorage:', e);
        }
        
        setOrder(prev => ({ 
          ...prev, 
          status: AGREEMENT_STATUS.ACTIVE,
          installments: updatedInstallments,
          paidAmount: newPaidAmount
        }));
        
        setCurrentStep(2);
        notification.success({
          message: 'Payment Successful',
          description: 'Your payment has been processed successfully.',
          placement: 'topRight'
        });
      }
    };

    const handlePaymentFailure = (data) => {
      if (data.agreementId === currentId) {
        setError(data.error || 'Payment failed. Please try again.');
        setPaymentLoading(false);
        notification.error({
          message: 'Payment Failed',
          description: data.error || 'Payment failed. Please try again.',
          placement: 'topRight'
        });
      }
    };

    socket.on('paymentSuccess', handlePaymentSuccess);
    socket.on('paymentFailed', handlePaymentFailure);

    return () => {
      socket.off('paymentSuccess', handlePaymentSuccess);
      socket.off('paymentFailed', handlePaymentFailure);
    };
  }, [socket, currentId, order, user]);

  const handlePayment = async (paymentType = 'next', customAmount = null) => {
    setPaymentLoading(true);
    setError(null);

    try {
      console.log('🔄 Initiating payment:', { paymentType, customAmount, agreementId: currentId });
      
      let paymentData = {
        agreementId: currentId,
        paymentType
      };

      if (paymentType === 'full') {
        paymentData.amount = order.totalAmount;
      } else if (paymentType === 'custom' && customAmount) {
        paymentData.amount = customAmount;
      }

      console.log('🔄 Payment request data:', paymentData);
      
      // Use the agreementApi instead of direct fetch
      const response = await agreementApi.createCheckoutSession(currentId, paymentData);
      console.log('✅ Payment session response:', response);
      
      if (!response.sessionUrl) {
        throw new Error('No payment session URL received from server');
      }
      
      console.log('✅ Redirecting to payment URL:', response.sessionUrl);
      
      // Emit socket event before redirecting
      if (socket) {
        socket.emit('paymentInitiated', {
          agreementId: currentId,
          installmentId: response.installment?.id || 'full',
          amount: response.installment?.amount || paymentData.amount,
          type: paymentType
        });
      }

      // Redirect to payment page
      window.location.href = response.sessionUrl;
      
    } catch (err) {
      console.error('❌ Payment initiation error:', err);
      const errorMessage = err.message || 'Failed to initiate payment. Please try again.';
      setError(errorMessage);
      setPaymentLoading(false);
      
      notification.error({
        message: 'Payment Error',
        description: errorMessage,
        placement: 'topRight',
        duration: 5
      });
    }
  };

  const getStatusTag = (status) => {
    const statusColors = {
      [AGREEMENT_STATUS.PENDING]: 'warning',
      [AGREEMENT_STATUS.ACTIVE]: 'processing',
      [AGREEMENT_STATUS.COMPLETED]: 'success',
      [AGREEMENT_STATUS.DISPUTED]: 'error'
    };

    return (
      <Tag color={statusColors[status] || 'default'}>
        {status?.replace('_', ' ').toUpperCase()}
      </Tag>
    );
  };

  const getInstallmentStatusTag = (status) => {
    const colors = {
      pending: 'warning',
      paid: 'success',
      overdue: 'error',
      processing: 'processing'
    };
    
    return (
      <Tag color={colors[status] || 'default'}>
        {status?.toUpperCase()}
      </Tag>
    );
  };

  const calculateProgress = () => {
    if (!order?.installments || order.installments.length === 0) return 0;
    const paidCount = order.installments.filter(inst => inst.status === 'paid').length;
    return (paidCount / order.installments.length) * 100;
  };

  const getNextInstallment = () => {
    if (!order?.installments) return null;
    return order.installments.find(inst => inst.status === 'pending');
  };

  const renderPaymentStatus = (installment) => {
    // Always treat 'processing' as 'paid' to fix the UI issue
    if (installment.status === 'processing') {
      installment = { ...installment, status: 'paid' };
    }
    
    const correctedStatus = getCorrectPaymentStatus(installment);
    const statusColor = getPaymentStatusColor(correctedStatus);
    
    let icon = null;
    switch(correctedStatus) {
      case 'paid':
        icon = <CheckCircleOutlined />;
        break;
      case 'processing':
        icon = <SyncOutlined spin />;
        break;
      case 'pending':
        icon = <ClockCircleOutlined />;
        break;
      case 'failed':
        icon = <CloseCircleOutlined />;
        break;
      default:
        icon = <InfoCircleOutlined />;
    }
    
    return (
      <Tag 
        color={statusColor} 
        icon={icon}
        style={{
          fontWeight: 'bold',
          padding: '0 8px',
          fontSize: '12px'
        }}
      >
        {correctedStatus.toUpperCase()}
      </Tag>
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await agreementApi.createAgreement(formData);
      console.log('Agreement created:', response);
      setOrder(response);
      setCurrentStep(2);  // Move to review step
      notification.success({
        message: 'Agreement Created',
        description: 'Your agreement has been created successfully.',
        placement: 'topRight'
      });
    } catch (error) {
      console.error('Error creating agreement:', error);
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to create agreement.',
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <HeaderComponent />
        <div className="flex justify-center items-center min-h-screen">
          <Spin 
            size="large" 
            indicator={<LoadingOutlined className="text-4xl text-blue-500" spin />}
          />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeaderComponent />
        <div className="max-w-4xl mx-auto p-6 mt-8">
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="rounded-lg"
            action={
              <Button type="primary" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            }
          />
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <HeaderComponent />
        <div className="max-w-4xl mx-auto p-6 mt-8">
          <Alert
            message="Order Not Found"
            description="The requested order could not be found."
            type="warning"
            showIcon
            className="rounded-lg"
          />
        </div>
      </>
    );
  }

  const nextInstallment = getNextInstallment();
  const remainingAmount = order.totalAmount - (order.paidAmount || 0);

  return (
    <>
      <HeaderComponent />
      <div className="max-w-6xl mx-auto p-6 mt-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <Title level={2} className="mb-2">
                {isAgreementView ? 'Agreement Details' : 'Order Details'}
              </Title>
              <Text type="secondary" className="text-lg">
                {order.projectDetails?.title || 'Untitled Project'}
              </Text>
            </div>
            <div className="text-right">
              {getStatusTag(order.status)}
              <div className="mt-2">
                <Text strong className="text-2xl">
                  ${order.totalAmount?.toFixed(2) || '0.00'}
                </Text>
                {order.paidAmount > 0 && (
                  <div className="text-sm text-gray-500">
                    Paid: ${order.paidAmount.toFixed(2)} | Remaining: ${remainingAmount.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Row gutter={24}>
          {/* Left Column - Project Details */}
          <Col xs={24} lg={14}>
            <Card title="Project Information" className="mb-6">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Subject">
                  {order.projectDetails?.subject || 'Not specified'}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {order.projectDetails?.description || 'No description provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Deadline">
                  <Space>
                    <CalendarOutlined />
                    {order.projectDetails?.deadline 
                      ? moment(order.projectDetails.deadline).format('MMMM DD, YYYY')
                      : 'Not specified'
                    }
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Writer">
                  <Space>
                    <UserOutlined />
                    {order.writer?.name || 'Not assigned'}
                  </Space>
                </Descriptions.Item>
                {order.projectDetails?.wordCount && (
                  <Descriptions.Item label="Word Count">
                    {order.projectDetails.wordCount}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Progress Steps */}
            <Card title="Project Progress" className="mb-6">
              <Steps current={currentStep} size="small">
                <Step 
                  title="Agreement Created" 
                  description="Waiting for acceptance"
                  icon={<FileDoneOutlined />}
                />
                <Step 
                  title="Payment Required" 
                  description="Complete payment to start"
                  icon={<CreditCardOutlined />}
                />
                <Step 
                  title="In Progress" 
                  description="Writer working on project"
                  icon={<ClockCircleOutlined />}
                />
                <Step 
                  title="Completed" 
                  description="Project delivered"
                  icon={<CheckCircleOutlined />}
                />
              </Steps>
              
              {order.status === AGREEMENT_STATUS.ACTIVE && (
                <div className="mt-4">
                  <Progress 
                    percent={calculateProgress()} 
                    status="active"
                    format={percent => `${percent}% Complete`}
                  />
                </div>
              )}
            </Card>
          </Col>

          {/* Right Column - Payment Details */}
          <Col xs={24} lg={10}>
            {isAgreementView && order.installments?.length > 0 ? (
              /* Agreement View - Show Installments */
              <Card title="Payment Schedule" className="mb-6">
                <Timeline>
                  {order.installments.map((installment, index) => {
                    // Always treat processing as paid for display
                    const displayInstallment = installment.status === 'processing' 
                      ? { ...installment, status: 'paid' } 
                      : installment;
                      
                    const status = getCorrectPaymentStatus(displayInstallment);
                    
                    return (
                      <Timeline.Item
                        key={displayInstallment._id || index}
                        dot={renderPaymentStatus(displayInstallment)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <Text strong>${displayInstallment.amount?.toFixed(2)}</Text>
                          {renderPaymentStatus(displayInstallment)}
                        </div>
                        <Text type="secondary">
                          Due: {moment(displayInstallment.dueDate).format('MMM DD, YYYY')}
                        </Text>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
                
                {/* Payment Actions */}
                {order.status === AGREEMENT_STATUS.ACTIVE && nextInstallment && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <Title level={5}>Next Payment Due</Title>
                    <Text>${nextInstallment.amount.toFixed(2)} due {moment(nextInstallment.dueDate).format('MMM DD, YYYY')}</Text>
                    <div className="mt-3 space-x-2">
                      <Button
                        type="primary"
                        icon={<CreditCardOutlined />}
                        onClick={() => handlePayment('next')}
                        loading={paymentLoading}
                      >
                        Pay Next Installment
                      </Button>
                      {remainingAmount > nextInstallment.amount && (
                        <Button
                          type="default"
                          onClick={() => handlePayment('full')}
                          loading={paymentLoading}
                        >
                          Pay Full Amount (${remainingAmount.toFixed(2)})
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              /* Order View or No Installments - Show Total Payment */
              <Card title="Payment Information" className="mb-6">
                <div className="text-center p-6">
                  <DollarOutlined className="text-4xl text-blue-500 mb-4" />
                  <Title level={3} className="mb-2">
                    ${remainingAmount?.toFixed(2) || '0.00'}
                  </Title>
                  <Text type="secondary" className="block mb-4">
                    {order.paidAmount > 0 ? 'Remaining Amount Due' : 'Total Amount Due'}
                  </Text>
                  
                  {order.status === AGREEMENT_STATUS.ACTIVE && remainingAmount > 0 && (
                    <Button
                      type="primary"
                      size="large"
                      icon={<CreditCardOutlined />}
                      onClick={() => handlePayment('full')}
                      loading={paymentLoading}
                      className="w-full"
                    >
                      Pay ${remainingAmount.toFixed(2)}
                    </Button>
                  )}
                  
                  {order.status === AGREEMENT_STATUS.ACTIVE && remainingAmount === 0 && (
                    <Alert
                      message="Payment Completed"
                      description="All payments have been processed successfully."
                      type="success"
                      showIcon
                    />
                  )}

                  {order.status === AGREEMENT_STATUS.PENDING && (
                    <Alert
                      message="Waiting for Writer"
                      description="Payment will be available once the writer accepts this agreement."
                      type="info"
                      showIcon
                    />
                  )}
                </div>
              </Card>
            )}

            {/* Summary Card */}
            <Card title="Summary">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Text>Status:</Text>
                  {getStatusTag(order.status)}
                </div>
                <div className="flex justify-between">
                  <Text>Total Amount:</Text>
                  <Text strong>${order.totalAmount?.toFixed(2) || '0.00'}</Text>
                </div>
                {order.paidAmount > 0 && (
                  <div className="flex justify-between">
                    <Text>Paid Amount:</Text>
                    <Text className="text-green-600">${order.paidAmount.toFixed(2)}</Text>
                  </div>
                )}
                {order.installments && (
                  <>
                    <div className="flex justify-between">
                      <Text>Installments:</Text>
                      <Text>{order.installments.length}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text>Paid:</Text>
                      <Text className="text-green-600">
                        {order.installments.filter(i => i.status === 'paid').length}
                      </Text>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <Text>Created:</Text>
                  <Text>{moment(order.createdAt).format('MMM DD, YYYY')}</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default AgreementPage;