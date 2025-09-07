import React, { memo } from 'react';
import { Space, Typography, Tag, Tooltip } from 'antd';
import { GlobalOutlined, DollarOutlined, LoadingOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useCurrency } from '../hooks/useCurrency';

const { Text } = Typography;

const LocationDisplay = memo(({ 
  showCity = true, 
  showCurrency = true, 
  size = 'default',
  style = {},
  compact = false 
}) => {
  const { location, currency, symbol, loading, error } = useCurrency();

  // Early return for loading state
  if (loading) {
    return (
      <Space 
        size="small" 
        style={{ 
          ...style,
          maxWidth: compact ? '100px' : '160px',
          overflow: 'hidden'
        }}
      >
        <LoadingOutlined spin />
        <Text 
          type="secondary" 
          style={{ 
            fontSize: size === 'small' ? '12px' : '14px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: compact ? '60px' : '120px'
          }}
        >
          {compact ? 'Loading...' : 'Detecting location...'}
        </Text>
      </Space>
    );
  }

  // Early return for error state
  if (error || !location) {
    return compact ? null : (
      <Space 
        size="small" 
        style={{ 
          ...style,
          maxWidth: '160px',
          overflow: 'hidden'
        }}
      >
        <GlobalOutlined />
        <Text 
          type="secondary" 
          style={{ 
            fontSize: size === 'small' ? '12px' : '14px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '120px'
          }}
        >
          Location unavailable
        </Text>
      </Space>
    );
  }

  const flag = location.flag || '🌍';
  const country = location.country || 'Unknown';
  const city = location.city || 'Unknown';
  const countryCode = location.countryCode?.toUpperCase() || 'US';

  if (compact) {
    return (
      <Tooltip title={`${city}, ${country} | ${symbol} ${currency.toUpperCase()}`}>
        <Space 
          size="small" 
          style={{ 
            ...style,
            maxWidth: '80px',
            overflow: 'hidden'
          }}
        >
          <Text style={{ 
            fontSize: size === 'small' ? '14px' : '16px',
            lineHeight: 1
          }}>
            {flag}
          </Text>
          {showCurrency && (
            <Text 
              strong
              style={{ 
                fontSize: size === 'small' ? '12px' : '14px',
                color: currency === 'ngn' ? '#52c41a' : '#1890ff',
                whiteSpace: 'nowrap'
              }}
            >
              {symbol}
            </Text>
          )}
        </Space>
      </Tooltip>
    );
  }

  return (
    <Space 
      size="small" 
      style={{ 
        ...style,
        maxWidth: '200px',
        overflow: 'hidden'
      }}
    >
      <EnvironmentOutlined style={{ color: '#1890ff' }} />
      <Space size="small" wrap={false}>
        <Text 
          strong 
          style={{ 
            fontSize: size === 'small' ? '12px' : '14px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '120px'
          }}
        >
          {flag} {showCity ? `${city}, ${country}` : country}
        </Text>
        {showCurrency && (
          <Tag 
            color={currency === 'ngn' ? 'green' : 'blue'}
            style={{ 
              fontSize: size === 'small' ? '11px' : '12px',
              margin: 0,
              borderRadius: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <DollarOutlined style={{ marginRight: '2px' }} />
            {symbol} {currency.toUpperCase()}
          </Tag>
        )}
      </Space>
    </Space>
  );
});

export default LocationDisplay; 