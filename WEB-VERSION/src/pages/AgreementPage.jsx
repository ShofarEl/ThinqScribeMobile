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
  Form,
  Avatar,
  Tooltip,
  Badge
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
  SyncOutlined,
  BookOutlined,
  FireOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  StarOutlined,
  BankOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useCurrency } from '../hooks/useCurrency';
import { agreementApi } from '../api/agreement';
import { formatCurrency } from '../utils/currencyUtils';
import { AGREEMENT_STATUS } from '../types/agreement';
import HeaderComponent from '../components/HeaderComponent';
import StudentPriceDisplay from '../components/StudentPriceDisplay';
import EnhancedPaymentModal from '../components/EnhancedPaymentModal';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

// Modern styling constants
const modernStyles = {
  container: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    minHeight: '100vh',
    padding: '0'
  },
  contentWrapper: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: 'clamp(8px, 2vw, 16px)'
  },
  headerCard: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    borderRadius: 'clamp(12px, 3vw, 20px)',
    border: 'none',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    marginBottom: 'clamp(16px, 4vw, 24px)',
    color: 'white'
  },
  modernCard: {
    borderRadius: 'clamp(12px, 3vw, 16px)',
    border: 'none',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    background: '#ffffff'
  },
  paymentCard: {
    borderRadius: 'clamp(12px, 3vw, 20px)',
    border: 'none',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  }
};

const AgreementPage = () => {
  const { orderId, agreementId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useNotifications();
  const { formatLocal, convertFromUSD } = useCurrency();
  
  const currentId = agreementId || orderId;
  const isAgreementView = !!agreementId;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  
  // Enhanced payment modal state
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentType, setPaymentType] = useState('next'); // 'next', 'full', 'custom'
  const [paymentAmount, setPaymentAmount] = useState(0);

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
        const updatedInstallments = order.installments?.map(inst => {
          if (inst._id === data.installmentId) {
            return { ...inst, status: 'paid', isPaid: true, paymentDate: new Date() };
          }
          return inst;
        }) || [];
        
        const newPaidAmount = updatedInstallments.reduce((sum, inst) => {
          return sum + (inst.status === 'paid' ? inst.amount : 0);
        }, 0);
        
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

  // Enhanced payment handling functions
  const openPaymentModal = (type, amount = null) => {
    setPaymentType(type);
    
    if (type === 'next' && nextInstallment) {
      setPaymentAmount(nextInstallment.amount);
    } else if (type === 'full') {
      setPaymentAmount(remainingAmount);
    } else if (type === 'custom' && amount) {
      setPaymentAmount(amount);
    }
    
    // Debug currency detection
    const detectedCurrency = (() => {
      if (!order?.paymentPreferences) return 'USD';
      const prefs = order.paymentPreferences;
      if (prefs.currency === 'ngn') return 'NGN';
      if (prefs.gateway === 'paystack') return 'NGN';
      if (prefs.nativeAmount && prefs.nativeAmount !== order.totalAmount && prefs.exchangeRate === 1) return 'NGN';
      if (prefs.nativeAmount && prefs.nativeAmount > 5000) return 'NGN';
      return (prefs.currency || 'USD').toUpperCase();
    })();
    
    console.log('💳 [Payment Modal] Currency detection:', {
      detectedCurrency,
      paymentAmount: type === 'next' ? nextInstallment?.amount : type === 'full' ? remainingAmount : amount,
      paymentPreferences: order?.paymentPreferences,
      reasoning: order?.paymentPreferences?.gateway === 'paystack' ? 'Paystack gateway' : 
                order?.paymentPreferences?.nativeAmount > 5000 ? 'Large nativeAmount' : 
                order?.paymentPreferences?.currency || 'default'
    });
    
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      console.log('💳 Payment completed successfully:', paymentData);
      
      // Update local state optimistically
      const updatedInstallments = order.installments?.map(inst => {
        if (paymentType === 'next' && inst._id === nextInstallment?._id) {
          return { 
            ...inst, 
            status: 'paid', 
            isPaid: true, 
            paymentDate: new Date(),
            transactionAmount: paymentData.amount,
            transactionCurrency: paymentData.currency,
            gateway: paymentData.gateway,
            paymentHistory: [...(inst.paymentHistory || []), {
              gateway: paymentData.gateway,
              currency: paymentData.currency,
              amount: paymentData.amount,
              timestamp: new Date()
            }]
          };
        }
        return inst;
      }) || [];
      
      const newPaidAmount = paymentType === 'full' ? order.totalAmount : 
        (order.paidAmount || 0) + paymentData.amount;
      
      // Update localStorage for spending tracking
      try {
        const currentSpent = parseFloat(localStorage.getItem('edu_sage_total_spent') || '0');
        const newTotalSpent = currentSpent + paymentData.amount;
        localStorage.setItem('edu_sage_total_spent', newTotalSpent.toString());
        console.log('💰 Updated localStorage total spent to:', newTotalSpent);
      } catch (e) {
        console.error('Error updating localStorage:', e);
      }
      
      // Update order state
      setOrder(prev => ({ 
        ...prev, 
        status: AGREEMENT_STATUS.ACTIVE,
        installments: updatedInstallments,
        paidAmount: newPaidAmount,
        paymentHistory: [...(prev.paymentHistory || []), {
          gateway: paymentData.gateway,
          currency: paymentData.currency,
          amount: paymentData.amount,
          timestamp: new Date(),
          type: paymentType
        }]
      }));
      
      setCurrentStep(2);
      setPaymentModalVisible(false);
      
      notification.success({
        message: 'Payment Successful',
        description: `Your ${paymentData.gateway} payment has been processed successfully.`,
        placement: 'topRight'
      });
      
      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('paymentCompleted', {
          agreementId: currentId,
          installmentId: paymentType === 'next' ? nextInstallment?._id : 'full',
          amount: paymentData.amount,
          currency: paymentData.currency,
          gateway: paymentData.gateway,
          type: paymentType
        });
      }
      
    } catch (err) {
      console.error('❌ Error handling payment success:', err);
      notification.error({
        message: 'Payment Update Error',
        description: 'Payment was successful but there was an error updating the display. Please refresh the page.',
        placement: 'topRight'
      });
    }
  };

  const handlePaymentCancel = () => {
    setPaymentModalVisible(false);
    setPaymentLoading(false);
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      [AGREEMENT_STATUS.PENDING]: { color: 'warning', icon: <ClockCircleOutlined />, text: 'PENDING' },
      [AGREEMENT_STATUS.ACTIVE]: { color: 'processing', icon: <SyncOutlined />, text: 'ACTIVE' },
      [AGREEMENT_STATUS.COMPLETED]: { color: 'success', icon: <CheckCircleOutlined />, text: 'COMPLETED' },
      [AGREEMENT_STATUS.DISPUTED]: { color: 'error', icon: <CloseCircleOutlined />, text: 'DISPUTED' }
    };

    const config = statusConfig[status] || { color: 'default', icon: <InfoCircleOutlined />, text: status };

    return (
      <Tag 
        color={config.color} 
        icon={config.icon}
        style={{ 
          padding: '4px 12px', 
          borderRadius: '12px', 
          fontWeight: '600',
          fontSize: '12px'
        }}
      >
        {config.text}
      </Tag>
    );
  };

  // Clean payment status rendering without duplication
  const renderPaymentStatus = (installment) => {
    const status = installment.status || 'pending';
    
    const statusConfig = {
      paid: { color: 'success', icon: <CheckCircleOutlined />, text: 'PAID' },
      processing: { color: 'processing', icon: <SyncOutlined spin />, text: 'PROCESSING' },
      pending: { color: 'warning', icon: <ClockCircleOutlined />, text: 'PENDING' },
      failed: { color: 'error', icon: <CloseCircleOutlined />, text: 'FAILED' },
      overdue: { color: 'error', icon: <CloseCircleOutlined />, text: 'OVERDUE' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Tag 
        color={config.color} 
        icon={config.icon}
        style={{
          fontWeight: '600',
          padding: '4px 12px',
          borderRadius: '8px',
          fontSize: '11px'
        }}
      >
        {config.text}
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

  if (loading) {
    return (
      <>
        <HeaderComponent />
        <div style={modernStyles.container}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh'
          }}>
            <Card style={{ 
              borderRadius: '20px', 
              border: 'none',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              padding: '40px'
            }}>
              <Spin 
                size="large" 
                indicator={<LoadingOutlined style={{ fontSize: '48px', color: '#1e3a8a' }} spin />}
              />
              <div style={{ marginTop: '20px', fontSize: '16px', color: '#6b7280' }}>
                Loading agreement details...
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeaderComponent />
        <div style={modernStyles.container}>
          <div style={modernStyles.contentWrapper}>
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              style={{ borderRadius: '16px' }}
              action={
                <Button type="primary" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              }
            />
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <HeaderComponent />
        <div style={modernStyles.container}>
          <div style={modernStyles.contentWrapper}>
            <Alert
              message="Order Not Found"
              description="The requested order could not be found."
              type="warning"
              showIcon
              style={{ borderRadius: '16px' }}
            />
          </div>
        </div>
      </>
    );
  }

  const nextInstallment = getNextInstallment();
  const remainingAmount = order.totalAmount - (order.paidAmount || 0);
  
  // Enhanced currency detection logic
  const getOrderCurrency = () => {
    if (!order.paymentPreferences) return 'usd';
    
    const prefs = order.paymentPreferences;
    
    // If currency is explicitly set to NGN, use that
    if (prefs.currency === 'ngn') return 'ngn';
    
    // If it was created with Paystack (Nigerian gateway), likely NGN
    if (prefs.gateway === 'paystack') return 'ngn';
    
    // If nativeAmount exists and is different from totalAmount, and exchangeRate is 1, likely NGN
    if (prefs.nativeAmount && prefs.nativeAmount !== order.totalAmount && prefs.exchangeRate === 1) return 'ngn';
    
    // If nativeAmount is much larger than what would be normal USD (>5000), likely NGN
    if (prefs.nativeAmount && prefs.nativeAmount > 5000) return 'ngn';
    
    // Otherwise use the stated currency
    return prefs.currency || 'usd';
  };
  
  const orderCurrency = getOrderCurrency();
  
  console.log('💱 [AgreementPage] Order currency debug:', {
    orderId: currentId?.slice(-8),
    title: order.projectDetails?.title,
    paymentPreferences: order.paymentPreferences,
    orderCurrency,
    totalAmount: order.totalAmount,
    reasoning: order.paymentPreferences?.gateway === 'paystack' ? 'Paystack gateway' : 
               order.paymentPreferences?.nativeAmount > 5000 ? 'Large nativeAmount' : 
               order.paymentPreferences?.currency || 'default'
  });

  return (
    <>
      <HeaderComponent />
      <div style={modernStyles.container}>
        <div style={modernStyles.contentWrapper}>
          {/* Modern Header Card */}
          <Card style={modernStyles.headerCard}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} lg={16}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'clamp(8px, 2vw, 16px)',
                  flexWrap: 'wrap'
                }}>
                  <Avatar 
                    size={{ xs: 48, sm: 56, md: 64 }}
                    icon={<BookOutlined />} 
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontSize: 'clamp(16px, 3vw, 24px)'
                    }} 
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Title 
                      level={{ xs: 3, sm: 2 }} 
                      style={{ 
                        color: 'white', 
                        marginBottom: 'clamp(4px, 1vw, 8px)',
                        fontSize: 'clamp(18px, 4vw, 32px)',
                        lineHeight: 1.2
                      }}
                    >
                      {isAgreementView ? 'Agreement Details' : 'Order Details'}
                    </Title>
                    <Text style={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      fontSize: 'clamp(12px, 2.5vw, 16px)',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {order.projectDetails?.title || 'Untitled Project'}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={8} style={{ textAlign: { xs: 'left', lg: 'right' } }}>
                <div style={{ marginBottom: 'clamp(8px, 2vw, 12px)' }}>
                  {getStatusTag(order.status)}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <Text style={{ 
                    color: 'white',
                    fontSize: 'clamp(16px, 3.5vw, 20px)',
                    fontWeight: '600'
                  }}>
                    {formatCurrency(order.totalAmount || 0, orderCurrency)}
                  </Text>
                </div>
                {order.paidAmount > 0 && (
                  <div style={{ 
                    fontSize: 'clamp(10px, 2vw, 13px)', 
                    color: 'rgba(255,255,255,0.8)',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: { xs: 'flex-start', lg: 'space-between' },
                    alignItems: { xs: 'flex-start', lg: 'center' },
                    gap: { xs: '4px', sm: '8px' },
                    maxWidth: '300px',
                    marginLeft: { xs: '0', lg: 'auto' }
                  }}>
                    <span>Paid:</span>
                    <Text style={{ 
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: 'clamp(10px, 2vw, 13px)',
                        fontWeight: '500'
                    }}>
                      {formatCurrency(order.paidAmount, orderCurrency)}
                    </Text>
                    <span style={{ 
                      margin: { xs: '0', sm: '0 8px' },
                      display: { xs: 'none', sm: 'inline' }
                    }}>•</span>
                    <span>Remaining:</span>
                    <Text style={{ 
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: 'clamp(10px, 2vw, 13px)',
                        fontWeight: '500'
                    }}>
                      {formatCurrency(remainingAmount, orderCurrency)}
                    </Text>
                  </div>
                )}
              </Col>
            </Row>
          </Card>

          <Row gutter={[16, 16]}>
            {/* Left Column - Project Details */}
            <Col xs={24} lg={14}>
              {/* Project Information */}
              <Card 
                                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)' }}>
                      <BookOutlined style={{ 
                        color: '#1e3a8a', 
                        fontSize: 'clamp(14px, 2.5vw, 18px)' 
                      }} />
                      <span style={{ 
                        fontSize: 'clamp(14px, 2.5vw, 18px)', 
                        fontWeight: '600' 
                      }}>Project Information</span>
                    </div>
                  }
                style={{ ...modernStyles.modernCard, marginBottom: '24px' }}
              >
                <Descriptions column={{ xs: 1, sm: 1, md: 2 }} bordered size="middle">
                  <Descriptions.Item 
                    label={<span style={{ fontWeight: '600' }}>Subject</span>}
                    span={2}
                  >
                    {order.projectDetails?.subject || 'Not specified'}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span style={{ fontWeight: '600' }}>Description</span>}
                    span={2}
                  >
                    {order.projectDetails?.description || 'No description provided'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<span style={{ fontWeight: '600' }}>Deadline</span>}>
                    <Space>
                      <CalendarOutlined style={{ color: '#fa8c16' }} />
                      {order.projectDetails?.deadline 
                        ? moment(order.projectDetails.deadline).format('MMMM DD, YYYY')
                        : 'Not specified'
                      }
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label={<span style={{ fontWeight: '600' }}>Writer</span>}>
                    <Space>
                      <UserOutlined style={{ color: '#52c41a' }} />
                      {order.writer?.name || 'Not assigned'}
                    </Space>
                  </Descriptions.Item>
                  {order.projectDetails?.wordCount && (
                    <Descriptions.Item 
                      label={<span style={{ fontWeight: '600' }}>Word Count</span>}
                      span={2}
                    >
                      <Badge count={order.projectDetails.wordCount} style={{ backgroundColor: '#1890ff' }} />
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* Progress Steps */}
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)' }}>
                    <TrophyOutlined style={{ 
                      color: '#faad14', 
                      fontSize: 'clamp(14px, 2.5vw, 18px)' 
                    }} />
                    <span style={{ 
                      fontSize: 'clamp(14px, 2.5vw, 18px)', 
                      fontWeight: '600' 
                    }}>Project Progress</span>
                  </div>
                }
                style={modernStyles.modernCard}
              >
                <Steps 
                  current={currentStep} 
                  size="small"
                  direction="vertical"
                  style={{ marginBottom: '20px' }}
                >
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
                    icon={<FireOutlined />}
                  />
                  <Step 
                    title="Completed" 
                    description="Project delivered"
                    icon={<CheckCircleOutlined />}
                  />
                </Steps>
                
                {order.status === AGREEMENT_STATUS.ACTIVE && (
                  <div style={{ 
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    padding: '16px',
                    borderRadius: '12px'
                  }}>
                    <Progress 
                      percent={calculateProgress()} 
                      status="active"
                      strokeColor={{
                        '0%': '#667eea',
                        '100%': '#764ba2',
                      }}
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
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)' }}>
                      <BankOutlined style={{ 
                        color: '#52c41a', 
                        fontSize: 'clamp(14px, 2.5vw, 18px)' 
                      }} />
                      <span style={{ 
                        fontSize: 'clamp(14px, 2.5vw, 18px)', 
                        fontWeight: '600' 
                      }}>Payment Schedule</span>
                    </div>
                  }
                  style={{ ...modernStyles.paymentCard, marginBottom: '24px' }}
                >
                  <Timeline>
                    {order.installments.map((installment, index) => (
                      <Timeline.Item
                        key={installment._id || index}
                        dot={
                          <div style={{ 
                            width: '24px', 
                            height: '24px', 
                            borderRadius: '50%', 
                            background: installment.status === 'paid' ? '#52c41a' : '#faad14',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {installment.status === 'paid' ? 
                              <CheckCircleOutlined style={{ color: 'white', fontSize: '12px' }} /> :
                              <ClockCircleOutlined style={{ color: 'white', fontSize: '12px' }} />
                            }
                          </div>
                        }
                      >
                        <div style={{ 
                          background: installment.status === 'paid' ? '#f6ffed' : '#fff7e6',
                          padding: '16px',
                          borderRadius: '12px',
                          border: `1px solid ${installment.status === 'paid' ? '#b7eb8f' : '#ffd591'}`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <Text style={{ fontSize: '14px', fontWeight: '600' }}>
                              {formatCurrency(installment.amount || 0, orderCurrency)}
                            </Text>
                            {renderPaymentStatus(installment)}
                          </div>
                          
                          {/* Payment History for this installment */}
                          {installment.paymentHistory && installment.paymentHistory.length > 0 && (
                            <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                              <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                                Payment Method Used:
                              </Text>
                              <Space size="small" wrap>
                                {installment.paymentHistory.map((payment, index) => (
                                  <Tooltip 
                                    key={index}
                                    title={`Paid via ${payment.gateway} - ${payment.currency} ${payment.amount} on ${moment(payment.timestamp).format('MMM DD, YYYY HH:mm')}`}
                                  >
                                    <Tag 
                                      size="small" 
                                      color={payment.gateway === 'paystack' ? 'green' : 'blue'}
                                      icon={payment.gateway === 'paystack' ? <BankOutlined /> : <CreditCardOutlined />}
                                      style={{ fontSize: '9px', cursor: 'pointer' }}
                                    >
                                      {payment.gateway?.toUpperCase()}
                                    </Tag>
                                  </Tooltip>
                                ))}
                              </Space>
                            </div>
                          )}
                          
                          <Text type="secondary" style={{ fontSize: '13px' }}>
                            Due: {moment(installment.dueDate).format('MMM DD, YYYY')}
                          </Text>
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                  
                  {/* Payment Actions */}
                  {order.status === AGREEMENT_STATUS.ACTIVE && nextInstallment && (
                                          <div style={{ 
                        padding: 'clamp(12px, 3vw, 20px)',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        borderRadius: 'clamp(8px, 2vw, 16px)',
                        marginTop: 'clamp(12px, 3vw, 20px)'
                      }}>
                        <Title level={5} style={{ marginBottom: 'clamp(8px, 2vw, 12px)' }}>
                          <ThunderboltOutlined style={{ 
                            color: '#fa8c16', 
                            marginRight: 'clamp(4px, 1vw, 8px)' 
                          }} />
                          Next Payment Due
                        </Title>
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: { xs: 'column', sm: 'row' },
                          justifyContent: { xs: 'flex-start', sm: 'space-between' }, 
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          gap: { xs: '4px', sm: '0' },
                          marginBottom: 'clamp(8px, 2vw, 12px)',
                          padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
                          background: 'rgba(255,255,255,0.8)',
                          borderRadius: 'clamp(6px, 1.5vw, 8px)',
                          border: '1px solid #e8e8e8'
                        }}>
                          <div>
                            <Text style={{ 
                              fontSize: 'clamp(12px, 2.5vw, 15px)', 
                              fontWeight: '600' 
                            }}>
                              {formatCurrency(nextInstallment.amount, orderCurrency)}
                            </Text>
                          </div>
                          <Text style={{ 
                            fontSize: 'clamp(10px, 2vw, 12px)', 
                            color: '#666', 
                            fontWeight: '500' 
                          }}>
                            Due: {moment(nextInstallment.dueDate).format('MMM DD')}
                          </Text>
                        </div>
                        <div style={{ 
                          marginTop: 'clamp(12px, 3vw, 16px)', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 'clamp(8px, 2vw, 12px)' 
                        }}>
                        <Button
                          type="primary"
                          icon={<CreditCardOutlined />}
                          onClick={() => openPaymentModal('next')}
                          loading={paymentLoading}
                          size="large"
                          style={{
                            borderRadius: 'clamp(8px, 2vw, 12px)',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            fontWeight: '600',
                            height: 'clamp(40px, 8vw, 48px)',
                            fontSize: 'clamp(14px, 2.5vw, 16px)'
                          }}
                          block
                        >
                          Pay Next Installment
                        </Button>
                        {remainingAmount > nextInstallment.amount && (
                          <Button
                            type="default"
                            onClick={() => openPaymentModal('full')}
                            loading={paymentLoading}
                            size="large"
                            style={{ 
                              borderRadius: 'clamp(8px, 2vw, 12px)', 
                              fontWeight: '600',
                              height: 'clamp(40px, 8vw, 48px)',
                              fontSize: 'clamp(14px, 2.5vw, 16px)'
                            }}
                            block
                          >
                            Pay Full Amount
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ) : (
                /* Order View or No Installments - Show Total Payment */
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)' }}>
                      <DollarOutlined style={{ 
                        color: '#52c41a', 
                        fontSize: 'clamp(14px, 2.5vw, 18px)' 
                      }} />
                      <span style={{ 
                        fontSize: 'clamp(14px, 2.5vw, 18px)', 
                        fontWeight: '600' 
                      }}>Payment Information</span>
                    </div>
                  }
                  style={{ ...modernStyles.paymentCard, marginBottom: '24px' }}
                >
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{
                      width: 'clamp(60px, 15vw, 80px)',
                      height: 'clamp(60px, 15vw, 80px)',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto clamp(12px, 3vw, 20px)'
                    }}>
                      <DollarOutlined style={{ 
                        fontSize: 'clamp(20px, 5vw, 32px)', 
                        color: 'white' 
                      }} />
                    </div>
                    
                    <div style={{ marginBottom: 'clamp(8px, 2vw, 12px)' }}>
                      <Text style={{ 
                        fontSize: 'clamp(16px, 4vw, 22px)', 
                        fontWeight: 'bold', 
                        color: '#52c41a' 
                      }}>
                        {formatCurrency(remainingAmount || 0, orderCurrency)}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ 
                      fontSize: 'clamp(12px, 2.5vw, 16px)', 
                      display: 'block', 
                      marginBottom: 'clamp(16px, 4vw, 24px)' 
                    }}>
                      {order.paidAmount > 0 ? 'Remaining Amount Due' : 'Total Amount Due'}
                    </Text>
                    
                    {order.status === AGREEMENT_STATUS.ACTIVE && remainingAmount > 0 && (
                      <Button
                        type="primary"
                        size="large"
                        icon={<CreditCardOutlined />}
                        onClick={() => openPaymentModal('full')}
                        loading={paymentLoading}
                        style={{
                          width: '100%',
                          height: 'clamp(40px, 8vw, 48px)',
                          borderRadius: 'clamp(8px, 2vw, 12px)',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none',
                          fontWeight: '600',
                          fontSize: 'clamp(14px, 2.5vw, 16px)'
                        }}
                      >
                        Complete Payment
                      </Button>
                    )}
                    
                    {order.status === AGREEMENT_STATUS.ACTIVE && remainingAmount === 0 && (
                      <Alert
                        message="Payment Completed"
                        description="All payments have been processed successfully."
                        type="success"
                        showIcon
                        style={{ borderRadius: '12px' }}
                      />
                    )}

                    {order.status === AGREEMENT_STATUS.PENDING && (
                      <Alert
                        message="Waiting for Writer"
                        description="Payment will be available once the writer accepts this agreement."
                        type="info"
                        showIcon
                        style={{ borderRadius: '12px' }}
                      />
                    )}
                  </div>
                </Card>
              )}

              {/* Summary Card */}
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)' }}>
                    <StarOutlined style={{ 
                      color: '#faad14', 
                      fontSize: 'clamp(14px, 2.5vw, 18px)' 
                    }} />
                    <span style={{ 
                      fontSize: 'clamp(14px, 2.5vw, 18px)', 
                      fontWeight: '600' 
                    }}>Summary</span>
                  </div>
                }
                style={modernStyles.modernCard}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontWeight: '500' }}>Status:</Text>
                    {getStatusTag(order.status)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontWeight: '500' }}>Total Amount:</Text>
                    <Text style={{ fontSize: '14px', fontWeight: '600' }}>
                      {formatCurrency(order.totalAmount || 0, orderCurrency)}
                    </Text>
                  </div>
                  {order.paidAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontWeight: '500' }}>Paid Amount:</Text>
                      <Text style={{ color: '#52c41a', fontWeight: '600', fontSize: '14px' }}>
                        {formatCurrency(order.paidAmount, orderCurrency)}
                      </Text>
                    </div>
                  )}
                  {order.installments && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '500' }}>Installments:</Text>
                        <Badge count={order.installments.length} style={{ backgroundColor: '#1890ff' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '500' }}>Paid:</Text>
                        <Badge 
                          count={order.installments.filter(i => i.status === 'paid').length} 
                          style={{ backgroundColor: '#52c41a' }} 
                        />
                      </div>
                    </>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontWeight: '500' }}>Created:</Text>
                    <Text>{moment(order.createdAt).format('MMM DD, YYYY')}</Text>
                  </div>
                  
                  {/* Overall Payment History */}
                  {order.paymentHistory && order.paymentHistory.length > 0 && (
                    <>
                      <Divider style={{ margin: '12px 0' }} />
                      <div style={{ marginBottom: '8px' }}>
                        <Text style={{ fontWeight: '500', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                          Payment History:
                        </Text>
                        <Space size="small" wrap>
                          {order.paymentHistory.map((payment, index) => (
                            <Tooltip 
                              key={index}
                              title={`${payment.gateway} payment of ${payment.currency} ${payment.amount} on ${moment(payment.timestamp).format('MMM DD, YYYY HH:mm')} (${payment.type})`}
                            >
                              <Tag 
                                size="small" 
                                color={payment.gateway === 'paystack' ? 'green' : 'blue'}
                                icon={payment.gateway === 'paystack' ? <BankOutlined /> : <CreditCardOutlined />}
                                style={{ fontSize: '10px', cursor: 'pointer', marginBottom: '4px' }}
                              >
                                {payment.gateway?.toUpperCase()} - {payment.type}
                              </Tag>
                            </Tooltip>
                          ))}
                        </Space>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
        
        {/* Enhanced Payment Modal */}
        <EnhancedPaymentModal
          visible={paymentModalVisible}
          onCancel={handlePaymentCancel}
          onPaymentSuccess={handlePaymentSuccess}
          amount={paymentAmount}
          currency={(() => {
            // Enhanced currency detection for payment modal
            if (!order?.paymentPreferences) return 'USD';
            
            const prefs = order.paymentPreferences;
            
            // If currency is explicitly set to NGN, use that
            if (prefs.currency === 'ngn') return 'NGN';
            
            // If it was created with Paystack (Nigerian gateway), likely NGN
            if (prefs.gateway === 'paystack') return 'NGN';
            
            // If nativeAmount exists and is different from totalAmount, and exchangeRate is 1, likely NGN
            if (prefs.nativeAmount && prefs.nativeAmount !== order.totalAmount && prefs.exchangeRate === 1) return 'NGN';
            
            // If nativeAmount is much larger than what would be normal USD (>5000), likely NGN
            if (prefs.nativeAmount && prefs.nativeAmount > 5000) return 'NGN';
            
            // Otherwise use the stated currency
            return (prefs.currency || 'USD').toUpperCase();
          })()}
          title={`Complete Payment - ${paymentType === 'next' ? 'Next Installment' : paymentType === 'full' ? 'Full Amount' : 'Custom Amount'}`}
          description={
            paymentType === 'next' 
              ? `Pay the next installment due ${nextInstallment ? moment(nextInstallment.dueDate).format('MMM DD, YYYY') : ''}` 
              : paymentType === 'full' 
                ? 'Pay the remaining balance to complete this agreement'
                : 'Complete your custom payment amount'
          }
          agreementId={currentId}
          agreementData={order}
        />
      </div>
    </>
  );
};

export default AgreementPage;