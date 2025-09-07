import React from 'react';
import { Card, Typography, Space, Tooltip } from 'antd';
import { DollarOutlined, GlobalOutlined } from '@ant-design/icons';
import { useCurrency } from '../hooks/useCurrency';
import { formatCurrency } from '../utils/currencyUtils';

const { Text } = Typography;

const WriterEarningsCard = ({ 
  title, 
  usdAmount, 
  icon, 
  color = '#1890ff',
  description 
}) => {
  const { location } = useCurrency();

  // For writers: Convert NGN amounts to USD by dividing by 1500, keep USD amounts as USD
  const getWriterDisplayAmount = (amount) => {
    if (!amount || amount === 0) return { formatted: '$0.00', currency: 'USD' };
    
    // The amount passed here could be either NGN or USD depending on the original agreement
    // We need to determine the original currency and convert accordingly for writer display
    
    // For now, assume amounts are already in the correct format
    // This will be refined based on the backend data structure
    return {
      formatted: formatCurrency(amount, 'usd'),
      currency: 'USD'
    };
  };

  const displayAmount = getWriterDisplayAmount(usdAmount);

  return (
    <Card 
      className="premium-stats-card earnings-card"
      bodyStyle={{ padding: '36px 32px' }}
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        borderRadius: '20px',
        border: 'none',
        boxShadow: `0 16px 48px ${color}40`,
        minHeight: '180px',
        transition: 'all 0.3s ease'
      }}
      hoverable
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '24px' 
      }}>
        <div style={{ flex: 1 }}>
          <Text 
            style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: '16px', 
              fontWeight: '500',
              display: 'block',
              marginBottom: '12px'
            }}
          >
            {title}
          </Text>
          
          <div style={{ marginBottom: '8px' }}>
            <Text 
              style={{ 
                color: 'white', 
                fontSize: 'clamp(28px, 6vw, 36px)', 
                fontWeight: '700',
                lineHeight: '1.2'
              }}
            >
              {displayAmount.formatted}
            </Text>
          </div>
          
          <Text 
            style={{ 
              color: 'rgba(255,255,255,0.8)', 
              fontSize: '14px',
              fontWeight: '400'
            }}
          >
            {description}
          </Text>
        </div>
        
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.2)', 
          borderRadius: '16px', 
          padding: '16px',
          minWidth: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
      </div>
      
      {/* Location display for context */}
      {location && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          <GlobalOutlined style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }} />
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
            {location.flag} {location.displayName} • USD display
          </Text>
        </div>
      )}
    </Card>
  );
};

export default WriterEarningsCard; 