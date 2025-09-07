import React, { useState, useEffect } from 'react';
import { Typography, Space, Tooltip, Spin, Tag } from 'antd';
import { DollarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useCurrency } from '../hooks/useCurrency';

const { Text } = Typography;

const StudentPriceDisplay = ({ 
  usdPrice, 
  transactionAmount = null, // Actual transaction amount if available
  transactionCurrency = null, // Actual transaction currency if available
  paymentHistory = null, // Payment history for this amount
  size = 'default',
  showUSDReference = true,
  style = {},
  className = ''
}) => {
  const { currency, symbol, exchangeRate, location, loading } = useCurrency();

  const fontSize = {
    small: '16px',
    default: '24px',
    large: '32px'
  }[size];

  const referenceFontSize = {
    small: '12px',
    default: '14px',
    large: '16px'
  }[size];

  if (loading) {
    return (
      <Space align="center" style={style} className={className}>
        <Spin size="small" />
        <Text type="secondary">Loading price...</Text>
      </Space>
    );
  }

  if (!usdPrice || usdPrice <= 0) {
    return (
      <Text style={style} className={className}>-</Text>
    );
  }

  const isNigerian = location?.countryCode === 'ng' || location?.country === 'Nigeria';

  // Format currency amount
  const formatCurrency = (amount, currencyCode) => {
    const currencySymbols = {
      'ngn': '₦', 'kes': 'KSh', 'ghs': '₵', 'zar': 'R',
      'usd': '$', 'eur': '€', 'gbp': '£', 'cad': 'C$', 'aud': 'A$'
    };
    
    const currencySymbol = currencySymbols[currencyCode?.toLowerCase()] || '$';
    
    // Format based on currency type
    if (currencyCode?.toLowerCase() === 'ngn' || currencyCode?.toLowerCase() === 'kes') {
      // No decimals for these currencies
      return `${currencySymbol}${Math.round(amount).toLocaleString()}`;
    } else {
      return `${currencySymbol}${amount.toFixed(2)}`;
    }
  };

  // Determine what to display based on user location and transaction data
  let displayAmount = usdPrice;
  let displayCurrency = 'usd';
  let originalAmount = null;
  let originalCurrency = null;

  if (isNigerian) {
    // Nigerian students: Show in transaction currency if available, otherwise convert USD to NGN
    if (transactionAmount && transactionCurrency) {
      displayAmount = transactionAmount;
      displayCurrency = transactionCurrency;
      
      // If the transaction currency is NGN, use the amount as is (it's already in NGN)
      if (transactionCurrency.toLowerCase() === 'ngn') {
        displayAmount = transactionAmount;
        displayCurrency = 'ngn';
      }
      // If they paid in USD but we want to show NGN equivalent
      else if (transactionCurrency.toLowerCase() === 'usd') {
        const ngnAmount = usdPrice * (exchangeRate || 770); // Fallback exchange rate
        displayAmount = ngnAmount;
        displayCurrency = 'ngn';
        originalAmount = transactionAmount;
        originalCurrency = transactionCurrency;
      }
    } else {
      // No transaction data, convert USD to NGN for display
      displayAmount = usdPrice * (exchangeRate || 770);
      displayCurrency = 'ngn';
      originalAmount = usdPrice;
      originalCurrency = 'usd';
    }
  } else {
    // Non-Nigerian students: Always show in USD
    displayAmount = usdPrice;
    displayCurrency = 'usd';
    
    // If they paid in a different currency, show that as reference
    if (transactionAmount && transactionCurrency && transactionCurrency.toLowerCase() !== 'usd') {
      originalAmount = transactionAmount;
      originalCurrency = transactionCurrency;
    }
  }

  return (
    <div style={style} className={className}>
      {/* Primary Display Amount */}
      <Space align="center">
        <Text 
          strong 
          style={{ 
            fontSize,
            color: '#52c41a' 
          }}
        >
          {formatCurrency(displayAmount, displayCurrency)}
        </Text>
        <Tag 
          color={isNigerian ? "green" : "blue"} 
          style={{ 
            fontSize: '10px',
            fontWeight: 'bold'
          }}
        >
          {displayCurrency.toUpperCase()}
        </Tag>
        {location?.flag && (
          <Text style={{ fontSize: '14px' }}>{location.flag}</Text>
        )}
      </Space>

      {/* Show original transaction currency if different */}
      {originalAmount && originalCurrency && showUSDReference && (
        <div style={{ marginTop: '4px' }}>
          <Tooltip title={`Original ${originalCurrency.toUpperCase()} transaction amount`}>
            <Space align="center" size="small">
              <DollarOutlined 
                style={{ 
                  color: '#8c8c8c', 
                  fontSize: '12px' 
                }} 
              />
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: referenceFontSize,
                  textDecoration: 'none'
                }}
              >
                {formatCurrency(originalAmount, originalCurrency)} {originalCurrency.toUpperCase()}
              </Text>
              <InfoCircleOutlined 
                style={{ 
                  color: '#d9d9d9', 
                  fontSize: '10px' 
                }} 
              />
            </Space>
          </Tooltip>
        </div>
      )}

      {/* Payment method indicator if available */}
      {paymentHistory && paymentHistory.length > 0 && (
        <div style={{ marginTop: '2px' }}>
          <Space size="small">
            {paymentHistory.map((payment, index) => (
              <Tag 
                key={index}
                size="small" 
                color={payment.gateway === 'paystack' ? 'green' : 'blue'}
                style={{ fontSize: '9px' }}
              >
                {payment.gateway}
              </Tag>
            ))}
          </Space>
        </div>
      )}
    </div>
  );
};

export default StudentPriceDisplay; 