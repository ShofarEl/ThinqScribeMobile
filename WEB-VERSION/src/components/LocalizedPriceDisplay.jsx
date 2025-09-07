import React, { useState, useEffect } from 'react';
import { Space, Typography, Tag, Tooltip, Alert, Spin } from 'antd';
import { DollarOutlined, SwapOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useCurrency } from '../hooks/useCurrency';

const { Text } = Typography;

const LocalizedPriceDisplay = ({ 
  usdAmount, 
  size = 'default',
  showBoth = true,
  showExchangeRate = false,
  style = {},
  prefix = '',
  suffix = '',
  highlight = false
}) => {
  const { 
    currency, 
    symbol, 
    exchangeRate, 
    loading, 
    formatLocalAmount,
    countryName,
    flag
  } = useCurrency();
  
  const [localAmount, setLocalAmount] = useState(null);

  useEffect(() => {
    if (usdAmount && exchangeRate) {
      setLocalAmount(usdAmount * exchangeRate);
    }
  }, [usdAmount, exchangeRate]);

  if (loading) {
    return <Spin size="small" />;
  }

  if (!usdAmount || usdAmount <= 0) {
    return <Text>-</Text>;
  }

  const isUSD = currency === 'usd';
  const fontSize = size === 'large' ? '18px' : size === 'small' ? '12px' : '14px';
  const fontWeight = highlight ? 'bold' : 'normal';

  // Format USD amount
  const usdFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(usdAmount);

  // Format local amount
  const localFormatted = localAmount ? new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    currencyDisplay: 'symbol'
  }).format(localAmount) : `${symbol}${(usdAmount * exchangeRate).toFixed(2)}`;

  if (isUSD) {
    return (
      <Text 
        style={{ 
          fontSize, 
          fontWeight, 
          color: highlight ? '#1890ff' : 'inherit',
          ...style 
        }}
      >
        {prefix}{usdFormatted}{suffix}
      </Text>
    );
  }

  return (
    <Space direction="vertical" size="small" style={style}>
      {/* Primary Amount (Local Currency) */}
      <Space size="small" align="center">
        <Text 
          strong 
          style={{ 
            fontSize: size === 'large' ? '20px' : '16px', 
            color: highlight ? '#1890ff' : '#262626',
            fontWeight: 'bold'
          }}
        >
          {prefix}{flag} {localFormatted}{suffix}
        </Text>
        <Tag 
          color={currency === 'ngn' ? 'green' : 'blue'}
          style={{ fontSize: '10px' }}
        >
          {currency.toUpperCase()}
        </Tag>
      </Space>

      {/* Secondary Amount (USD) */}
      {showBoth && (
        <Space size="small" align="center">
          <SwapOutlined style={{ color: '#8c8c8c', fontSize: '12px' }} />
          <Text 
            style={{ 
              fontSize: '12px', 
              color: '#8c8c8c' 
            }}
          >
            ≈ {usdFormatted} USD
          </Text>
          {showExchangeRate && (
            <Tooltip title={`Exchange Rate: 1 USD = ${exchangeRate} ${currency.toUpperCase()}`}>
              <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: '10px' }} />
            </Tooltip>
          )}
        </Space>
      )}

      {/* Exchange Rate Info */}
      {showExchangeRate && (
        <Alert
          message={`Rate: 1 USD = ${exchangeRate} ${currency.toUpperCase()}`}
          type="info"
          showIcon={false}
          style={{ 
            fontSize: '10px', 
            padding: '4px 8px',
            marginTop: '4px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #d1ecf1'
          }}
        />
      )}
    </Space>
  );
};

export default LocalizedPriceDisplay; 