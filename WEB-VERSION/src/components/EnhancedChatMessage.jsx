import React from 'react';
import { Avatar, Tag, Tooltip, Space, Typography } from 'antd';
import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Text } = Typography;

const EnhancedChatMessage = ({ 
  message, 
  isOwnMessage, 
  showLocation = true,
  compact = false 
}) => {
  const { sender, content, timestamp, locationData } = message;
  
  const formatLocation = (location) => {
    if (!location) return 'Unknown Location';
    return `${location.city || 'Unknown'}, ${location.country || 'Unknown'}`;
  };

  const getLocationDisplay = (location) => {
    if (!location) return null;
    
    return (
      <Space size="small">
        <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>
          {location.flag || '🌍'} {formatLocation(location)}
        </Text>
        {location.currency && (
          <Tag 
            size="small" 
            color={location.currency === 'ngn' ? 'green' : 'blue'}
            style={{ fontSize: '10px', margin: 0 }}
          >
            {location.currencySymbol || '$'} {location.currency?.toUpperCase()}
          </Tag>
        )}
      </Space>
    );
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
        marginBottom: '16px',
        gap: '8px'
      }}
    >
      {/* Avatar */}
      <Avatar
        size={compact ? 32 : 40}
        src={sender.avatar}
        icon={<UserOutlined />}
        style={{
          backgroundColor: isOwnMessage ? '#1890ff' : '#52c41a',
          flexShrink: 0
        }}
      />

      {/* Message Content */}
      <div 
        style={{
          maxWidth: '70%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
        }}
      >
        {/* Sender Info with Location */}
        <div 
          style={{
            marginBottom: '4px',
            textAlign: isOwnMessage ? 'right' : 'left'
          }}
        >
          <Space direction="vertical" size="small">
            <Text strong style={{ fontSize: '14px' }}>
              {sender.name}
            </Text>
            {showLocation && sender.locationData && (
              <Tooltip 
                title={`Chatting from ${formatLocation(sender.locationData)}`}
                placement={isOwnMessage ? 'left' : 'right'}
              >
                <div>{getLocationDisplay(sender.locationData)}</div>
              </Tooltip>
            )}
          </Space>
        </div>

        {/* Message Bubble */}
        <div
          style={{
            backgroundColor: isOwnMessage ? '#1890ff' : '#f0f0f0',
            color: isOwnMessage ? 'white' : '#000',
            padding: '8px 12px',
            borderRadius: '18px',
            borderTopLeftRadius: isOwnMessage ? '18px' : '4px',
            borderTopRightRadius: isOwnMessage ? '4px' : '18px',
            maxWidth: '100%',
            wordBreak: 'break-word'
          }}
        >
          <Text style={{ color: 'inherit' }}>
            {content}
          </Text>
        </div>

        {/* Timestamp */}
        <Text 
          style={{ 
            fontSize: '11px', 
            color: '#8c8c8c',
            marginTop: '4px',
            textAlign: isOwnMessage ? 'right' : 'left'
          }}
        >
          {moment(timestamp).format('HH:mm')}
        </Text>
      </div>
    </div>
  );
};

export default EnhancedChatMessage; 