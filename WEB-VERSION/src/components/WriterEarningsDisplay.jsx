import React from 'react';
import { Card, Space, Typography, Tag, Tooltip, Statistic, Row, Col } from 'antd';
import { 
  DollarOutlined, 
  TrophyOutlined, 
  CalendarOutlined,
  InfoCircleOutlined,
  SwapOutlined,
  BankOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const WriterEarningsDisplay = ({ 
  totalEarnings = 0,
  availableBalance = 0,
  pendingAmount = 0,
  monthlyEarnings = 0,
  showDetails = true,
  size = 'default'
}) => {
  const formatUSD = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStatColor = (amount) => {
    if (amount > 1000) return '#52c41a'; // Green for high amounts
    if (amount > 100) return '#1890ff';  // Blue for medium amounts
    return '#8c8c8c'; // Gray for low amounts
  };

  return (
    <Card 
      title={
        <Space>
          <DollarOutlined style={{ color: '#1890ff' }} />
          <Text strong>Writer Earnings (USD)</Text>
          <Tooltip title="All earnings are converted to USD for standardized display">
            <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
          </Tooltip>
        </Space>
      }
      style={{ borderRadius: '12px' }}
      headStyle={{ borderBottom: '1px solid #f0f0f0', padding: '16px 24px' }}
      bodyStyle={{ padding: '24px' }}
    >
      <Row gutter={[16, 16]}>
        {/* Total Earnings */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            size="small" 
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px'
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <Statistic
              title={
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                  Total Earnings
                </Text>
              }
              value={totalEarnings}
              formatter={(value) => formatUSD(value)}
              valueStyle={{ 
                color: '#fff', 
                fontSize: size === 'large' ? '28px' : '20px',
                fontWeight: 'bold'
              }}
              prefix={<TrophyOutlined style={{ color: '#fff' }} />}
            />
          </Card>
        </Col>

        {/* Available Balance */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            size="small" 
            style={{ 
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              border: 'none',
              borderRadius: '8px'
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <Statistic
              title={
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                  Available Balance
                </Text>
              }
              value={availableBalance}
              formatter={(value) => formatUSD(value)}
              valueStyle={{ 
                color: '#fff', 
                fontSize: size === 'large' ? '28px' : '20px',
                fontWeight: 'bold'
              }}
              prefix={<BankOutlined style={{ color: '#fff' }} />}
            />
          </Card>
        </Col>

        {/* Pending Amount */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            size="small" 
            style={{ 
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
              border: 'none',
              borderRadius: '8px'
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <Statistic
              title={
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                  Pending Payments
                </Text>
              }
              value={pendingAmount}
              formatter={(value) => formatUSD(value)}
              valueStyle={{ 
                color: '#fff', 
                fontSize: size === 'large' ? '28px' : '20px',
                fontWeight: 'bold'
              }}
              prefix={<SwapOutlined style={{ color: '#fff' }} />}
            />
          </Card>
        </Col>

        {/* Monthly Earnings */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            size="small" 
            style={{ 
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              border: 'none',
              borderRadius: '8px'
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <Statistic
              title={
                <Text style={{ color: 'rgba(139, 69, 19, 0.8)', fontSize: '12px' }}>
                  This Month
                </Text>
              }
              value={monthlyEarnings}
              formatter={(value) => formatUSD(value)}
              valueStyle={{ 
                color: '#8b4513', 
                fontSize: size === 'large' ? '28px' : '20px',
                fontWeight: 'bold'
              }}
              prefix={<CalendarOutlined style={{ color: '#8b4513' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Details */}
      {showDetails && (
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text strong style={{ color: '#262626', fontSize: '14px' }}>
              💰 Earnings Summary
            </Text>
            <Text style={{ fontSize: '12px', color: '#8c8c8c', lineHeight: '1.6' }}>
              • All earnings are automatically converted to USD for international standardization<br/>
              • Conversion rates are updated in real-time from reliable exchange rate APIs<br/>
              • Available balance represents funds ready for withdrawal (90% of total earnings)<br/>
              • Pending amounts will be added to available balance once projects are completed
            </Text>
            
            <div style={{ marginTop: '12px' }}>
              <Space wrap>
                <Tag color="blue" style={{ borderRadius: '12px' }}>
                  <DollarOutlined /> USD Standard
                </Tag>
                <Tag color="green" style={{ borderRadius: '12px' }}>
                  Real-time Conversion
                </Tag>
                <Tag color="gold" style={{ borderRadius: '12px' }}>
                  International Platform
                </Tag>
              </Space>
            </div>
          </Space>
        </div>
      )}
    </Card>
  );
};

export default WriterEarningsDisplay; 