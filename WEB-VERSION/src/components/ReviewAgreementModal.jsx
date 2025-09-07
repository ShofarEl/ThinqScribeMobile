import React, { useState } from 'react';
import { 
  Modal, 
  Spin, 
  Alert, 
  Button, 
  Space, 
  Typography, 
  Descriptions, 
  message, 
  Card,
  Row,
  Col,
  Divider,
  Tag,
  Timeline
} from 'antd';
import { 
  DollarCircleOutlined, 
  CalendarOutlined, 
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  UserOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useCurrency } from '../hooks/useCurrency';
import { formatCurrency } from '../utils/currencyUtils';

const { Text, Title, Paragraph } = Typography;

const ReviewAgreementModal = ({ visible, agreement, onClose, onAccept, onCancel, loading }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { currency, symbol, location } = useCurrency();

  const handleAccept = async () => {
    if (isProcessing) return; // Prevent double-clicks
    
    setIsProcessing(true);
    try {
      await onAccept(agreement._id); // ✅ Pass only the ID, not the entire object
    } catch (error) {
      console.error('Error accepting agreement:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (isProcessing) return; // Prevent double-clicks
    
    setIsProcessing(true);
    try {
      await onCancel(agreement._id); // ✅ Pass only the ID, not the entire object
    } catch (error) {
      console.error('Error declining agreement:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced currency detection for agreement
  const getAgreementCurrency = () => {
    if (!agreement?.paymentPreferences) return 'usd';
    
    const prefs = agreement.paymentPreferences;
    
    // If currency is explicitly set to NGN, use that
    if (prefs.currency === 'ngn') return 'ngn';
    
    // If it was created with Paystack (Nigerian gateway), likely NGN
    if (prefs.gateway === 'paystack') return 'ngn';
    
    // If nativeAmount exists and is different from totalAmount, and exchangeRate is 1, likely NGN
    if (prefs.nativeAmount && prefs.nativeAmount !== agreement.totalAmount && prefs.exchangeRate === 1) return 'ngn';
    
    // If nativeAmount is much larger than what would be normal USD (>5000), likely NGN
    if (prefs.nativeAmount && prefs.nativeAmount > 5000) return 'ngn';
    
    // Otherwise use the stated currency
    return prefs.currency || 'usd';
  };

  // Format amount based on detected agreement currency
  const formatAmount = (amount) => {
    if (!amount) return '0.00';
    
    const detectedCurrency = getAgreementCurrency();
    console.log('💱 [ReviewAgreementModal] Currency debug:', {
      agreementId: agreement?._id?.slice(-8),
      title: agreement?.projectDetails?.title,
      paymentPreferences: agreement?.paymentPreferences,
      detectedCurrency,
      amount,
      reasoning: agreement?.paymentPreferences?.gateway === 'paystack' ? 'Paystack gateway' : 
                 agreement?.paymentPreferences?.nativeAmount > 5000 ? 'Large nativeAmount' : 
                 agreement?.paymentPreferences?.currency || 'default'
    });
    
    // Use formatCurrency from currencyUtils to display amount as stored
    return formatCurrency(amount, detectedCurrency);
  };

  // Format installment amount using the same currency detection
  const formatInstallmentAmount = (amount) => {
    if (!amount) return '0.00';
    
    const detectedCurrency = getAgreementCurrency();
    
    // Use formatCurrency from currencyUtils to display amount as stored
    return formatCurrency(amount, detectedCurrency);
  };

  if (!agreement) {
    return (
      <Modal 
        open={visible} 
        onCancel={onClose} 
        footer={null} 
        title={
          <Text strong style={{ fontSize: '18px', color: '#262626' }}>
            Agreement Details
          </Text>
        }
        width={Math.min(900, window.innerWidth * 0.95)}
        centered
        key={`modal-loading-${visible}`}
        destroyOnClose={true}
        maskClosable={false}
      >
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Spin size="large" tip={
            <Text style={{ color: '#6b7280', marginTop: '12px' }}>
              Loading agreement details...
            </Text>
          } />
        </div>
      </Modal>
    );
  }

  const isPending = agreement.status === 'pending';
  const formattedDate = agreement?.projectDetails?.deadline ? 
    moment(agreement.projectDetails.deadline).format('MMMM DD, YYYY') : 'Not specified';
  const daysUntilDeadline = agreement?.projectDetails?.deadline ? 
    moment(agreement.projectDetails.deadline).diff(moment(), 'days') : null;

  const getStatusColor = (status) => {
    const colors = {
      pending: '#faad14',
      active: '#52c41a',
      completed: '#1890ff',
      cancelled: '#ff4d4f'
    };
    return colors[status] || '#d9d9d9';
  };

  const totalInstallments = agreement.installments?.length || 0;
  const paidInstallments = agreement.installments?.filter(inst => inst.status === 'paid').length || 0;

  return (
    <Modal 
      open={visible}
      onCancel={onClose}
      width={Math.min(1100, window.innerWidth * 0.95)}
      centered
      className="agreement-modal"
      footer={null}
      title={null}
      key={`modal-${agreement._id}-${visible}`}
      destroyOnClose={true}
      maskClosable={false}
      bodyStyle={{ 
        padding: 0,
        maxHeight: '85vh',
        overflowY: 'auto'
      }}
    >
      <Spin spinning={loading} tip="Processing...">
        {/* Header */}
        <div 
          style={{ 
            padding: '24px', 
            backgroundColor: '#fafafa', 
            borderBottom: '1px solid #e5e7eb',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Title level={3} style={{ color: '#1f2937', marginBottom: '8px', fontSize: 'clamp(18px, 4vw, 24px)' }}>
                {agreement?.projectDetails?.title || 'Service Agreement'}
              </Title>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                <Tag 
                  color={getStatusColor(agreement.status)} 
                  style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    padding: '4px 12px',
                    borderRadius: '6px'
                  }}
                >
                  {agreement.status?.toUpperCase()}
                </Tag>
                <Text style={{ color: '#6b7280', fontSize: '14px' }}>
                  Created: {moment(agreement.createdAt).format('MMM DD, YYYY')}
                </Text>
                {daysUntilDeadline !== null && (
                  <Text style={{ color: '#6b7280', fontSize: '14px' }}>
                    Deadline: {formattedDate} ({daysUntilDeadline} days)
                  </Text>
                )}
              </div>
            </div>
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={onClose}
              size="large"
              style={{ color: '#6b7280', flexShrink: 0 }}
            />
          </div>
        </div>

        {/* Payment Gateway Information */}
        {agreement.paymentPreferences && (
          <div style={{ padding: '20px 24px 0 24px' }}>
            <Alert
              message={
                <Space>
                  <InfoCircleOutlined />
                  <Text strong style={{ color: '#1f2937' }}>Payment Gateway Information</Text>
                </Space>
              }
              description={
                <div style={{ marginTop: '8px' }}>
                  <Row gutter={[16, 8]}>
                    <Col xs={24} sm={8}>
                      <Text style={{ color: '#374151' }}>
                        <strong>Gateway:</strong> {agreement.paymentPreferences.gateway?.charAt(0).toUpperCase() + agreement.paymentPreferences.gateway?.slice(1) || 'Not specified'}
                      </Text>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Text style={{ color: '#374151' }}>
                        <strong>Currency:</strong> {agreement.paymentPreferences.currency?.toUpperCase() || 'USD'}
                      </Text>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Text style={{ color: '#374151' }}>
                        <strong>Location:</strong> {agreement.paymentPreferences.location?.country || 'Not specified'}
                      </Text>
                    </Col>
                  </Row>
                </div>
              }
              type="info"
              showIcon={false}
              style={{ 
                marginBottom: '20px',
                borderRadius: '8px',
                border: '1px solid #bfdbfe'
              }}
            />
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '0 24px 24px 24px' }}>
          <Row gutter={[24, 24]}>
            {/* Left Column - Project Details */}
            <Col xs={24} lg={14}>
              <Card 
                title={
                  <Space>
                    <FileTextOutlined style={{ color: '#1890ff' }} />
                    <Text strong style={{ color: '#262626' }}>Project Requirements</Text>
                  </Space>
                }
                style={{ marginBottom: '20px' }}
                bordered={true}
                headStyle={{ 
                  backgroundColor: '#fafafa',
                  borderRadius: '8px 8px 0 0'
                }}
                bodyStyle={{ padding: '20px' }}
              >
                <Descriptions column={{ xs: 1, sm: 1, md: 1 }} bordered size="small">
                  <Descriptions.Item 
                    label={<Text strong style={{ color: '#374151' }}>Academic Level</Text>}
                    labelStyle={{ backgroundColor: '#f9fafb', color: '#374151' }}
                    contentStyle={{ color: '#1f2937' }}
                  >
                    {agreement?.projectDetails?.academicLevel || 'Not specified'}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<Text strong style={{ color: '#374151' }}>Subject</Text>}
                    labelStyle={{ backgroundColor: '#f9fafb', color: '#374151' }}
                    contentStyle={{ color: '#1f2937' }}
                  >
                    {agreement?.projectDetails?.subject || 'Not specified'}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<Text strong style={{ color: '#374151' }}>Pages</Text>}
                    labelStyle={{ backgroundColor: '#f9fafb', color: '#374151' }}
                    contentStyle={{ color: '#1f2937' }}
                  >
                    {agreement?.projectDetails?.pages || 'Not specified'}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<Text strong style={{ color: '#374151' }}>Citation Style</Text>}
                    labelStyle={{ backgroundColor: '#f9fafb', color: '#374151' }}
                    contentStyle={{ color: '#1f2937' }}
                  >
                    {agreement?.projectDetails?.citationStyle || 'Not specified'}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<Text strong style={{ color: '#374151' }}>Sources Required</Text>}
                    labelStyle={{ backgroundColor: '#f9fafb', color: '#374151' }}
                    contentStyle={{ color: '#1f2937' }}
                  >
                    {agreement?.projectDetails?.sources || 'Not specified'}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<Text strong style={{ color: '#374151' }}>Deadline</Text>}
                    labelStyle={{ backgroundColor: '#f9fafb', color: '#374151' }}
                    contentStyle={{ color: '#1f2937' }}
                  >
                    <Space>
                      <CalendarOutlined style={{ color: '#1890ff' }} />
                      <Text style={{ color: '#1f2937' }}>{formattedDate}</Text>
                      {daysUntilDeadline !== null && (
                        <Tag color={daysUntilDeadline < 7 ? 'red' : daysUntilDeadline < 14 ? 'orange' : 'green'}>
                          {daysUntilDeadline} days
                        </Tag>
                      )}
                    </Space>
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ marginTop: '20px' }}>
                  <Text strong style={{ color: '#374151', display: 'block', marginBottom: '8px' }}>
                    Project Description:
                  </Text>
                  <div 
                    style={{ 
                      backgroundColor: '#f9fafb', 
                      padding: '16px', 
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      marginTop: '8px'
                    }}
                  >
                    <Text style={{ color: '#374151', lineHeight: '1.6' }}>
                      {agreement?.projectDetails?.description || 'No description provided'}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Right Column - Payment & Timeline */}
            <Col xs={24} lg={10}>
              {/* Payment Information */}
              <Card 
                title={
                  <Space>
                    <DollarCircleOutlined style={{ color: '#10b981' }} />
                    <Text strong style={{ color: '#262626' }}>Payment Details</Text>
                  </Space>
                }
                style={{ marginBottom: '20px' }}
                bordered={true}
                headStyle={{ 
                  backgroundColor: '#fafafa',
                  borderRadius: '8px 8px 0 0'
                }}
                bodyStyle={{ padding: '20px' }}
              >
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <Title 
                    level={2} 
                    style={{ 
                      color: '#10b981', 
                      marginBottom: '4px',
                      fontSize: 'clamp(24px, 6vw, 32px)'
                    }}
                  >
                    {formatAmount(agreement?.totalAmount)}
                  </Title>
                  <Text style={{ color: '#6b7280', fontSize: '14px' }}>Total Project Value</Text>
                  {location?.countryCode === 'ng' && agreement?.paymentPreferences?.currency === 'usd' && (
                    <div style={{ marginTop: '6px' }}>
                      <Text style={{ color: '#6b7280', fontSize: '12px' }}>
                        (≈ ${agreement?.totalAmount?.toFixed(2)} USD)
                      </Text>
                    </div>
                  )}
                </div>

                <Divider style={{ margin: '16px 0' }} />

                {agreement.installments && agreement.installments.length > 0 ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <Text strong style={{ color: '#374151' }}>Payment Schedule</Text>
                      <Tag color="blue" style={{ fontSize: '12px', fontWeight: '600' }}>
                        {totalInstallments} installments
                      </Tag>
                    </div>
                    
                    <Timeline size="small">
                      {agreement.installments.slice(0, 3).map((installment, index) => (
                        <Timeline.Item
                          key={index}
                          dot={
                            installment.status === 'paid' ? (
                              <CheckCircleOutlined style={{ color: '#10b981' }} />
                            ) : (
                              <DollarCircleOutlined style={{ color: '#1890ff' }} />
                            )
                          }
                          color={installment.status === 'paid' ? 'green' : 'blue'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ color: '#1f2937' }}>
                              {formatInstallmentAmount(installment.amount)}
                            </Text>
                            <Text style={{ color: '#6b7280', fontSize: '12px' }}>
                              {moment(installment.dueDate).format('MMM DD')}
                            </Text>
                          </div>
                        </Timeline.Item>
                      ))}
                      {agreement.installments.length > 3 && (
                        <Timeline.Item dot="..." color="gray">
                          <Text style={{ color: '#6b7280' }}>
                            +{agreement.installments.length - 3} more installments
                          </Text>
                        </Timeline.Item>
                      )}
                    </Timeline>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Text style={{ color: '#6b7280' }}>Single payment upon completion</Text>
                  </div>
                )}
              </Card>

              {/* Student Information */}
              {agreement.student && (
                <Card 
                  title={
                    <Space>
                      <UserOutlined style={{ color: '#6366f1' }} />
                      <Text strong style={{ color: '#262626' }}>Student Information</Text>
                    </Space>
                  }
                  style={{ marginBottom: '20px' }}
                  bordered={true}
                  headStyle={{ 
                    backgroundColor: '#fafafa',
                    borderRadius: '8px 8px 0 0'
                  }}
                  bodyStyle={{ padding: '20px' }}
                  size="small"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        backgroundColor: '#6366f1', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: '600', fontSize: '18px' }}>
                        {agreement.student.name?.charAt(0).toUpperCase()}
                      </Text>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong style={{ color: '#1f2937', display: 'block' }}>
                        {agreement.student.name}
                      </Text>
                      <Text style={{ color: '#6b7280', fontSize: '14px', wordBreak: 'break-all' }}>
                        {agreement.student.email}
                      </Text>
                    </div>
                  </div>
                </Card>
              )}
            </Col>
          </Row>

          {/* Agreement Terms Alert */}
          {isPending && (
            <Alert 
              message={<Text strong style={{ color: '#1f2937' }}>Review Agreement Terms Carefully</Text>}
              description={
                <div style={{ marginTop: '8px' }}>
                  <Text style={{ color: '#374151', lineHeight: '1.6' }}>
                    By accepting this agreement, you commit to delivering the project by the specified deadline 
                    and according to all requirements. Payment will be released based on the agreed schedule. 
                    Please ensure you understand all project requirements before proceeding.
                  </Text>
                </div>
              }
              type="warning" 
              showIcon 
              icon={<ExclamationCircleOutlined />}
              style={{ 
                marginTop: '20px',
                backgroundColor: '#fffbeb', 
                border: '1px solid #fed7aa',
                borderRadius: '8px'
              }}
            />
          )}
        </div>

        {/* Footer Actions - Always visible at bottom */}
        <div 
          style={{ 
            padding: '20px 24px', 
            backgroundColor: '#fafafa', 
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: window.innerWidth < 640 ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: window.innerWidth < 640 ? 'stretch' : 'center',
            gap: '12px',
            position: 'sticky',
            bottom: 0,
            zIndex: 10
          }}
        >
          <div style={{ order: window.innerWidth < 640 ? 2 : 1 }}>
            {isPending && (
              <Text style={{ color: '#6b7280', fontSize: '14px' }}>
                <InfoCircleOutlined style={{ marginRight: '6px' }} />
                Please review all details carefully before making a decision
              </Text>
            )}
          </div>
          
          <div 
            style={{ 
              display: 'flex',
              gap: '12px',
              flexDirection: window.innerWidth < 480 ? 'column' : 'row',
              order: window.innerWidth < 640 ? 1 : 2
            }}
          >
            <Button 
              size="large"
              onClick={onClose}
              disabled={isProcessing}
              style={{ 
                minWidth: '100px',
                borderRadius: '8px'
              }}
            >
              Close
            </Button>
            
            {isPending && (
              <>
                <Button 
                  type="default" 
                  danger 
                  size="large"
                  icon={<CloseCircleOutlined />}
                  onClick={handleDecline}
                  loading={isProcessing}
                  disabled={loading || isProcessing}
                  style={{ 
                    minWidth: '120px',
                    borderRadius: '8px'
                  }}
                >
                  Decline
                </Button>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={handleAccept}
                  loading={isProcessing}
                  disabled={loading || isProcessing}
                  style={{
                    backgroundColor: '#10b981',
                    borderColor: '#10b981',
                    minWidth: '160px',
                    borderRadius: '8px'
                  }}
                >
                  Accept Agreement
                </Button>
              </>
            )}
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default ReviewAgreementModal;