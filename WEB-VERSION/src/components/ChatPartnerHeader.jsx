import React from 'react';
import { Avatar, Space, Typography, Tag, Tooltip, Badge } from 'antd';
import { 
  UserOutlined, 
  EnvironmentOutlined, 
  DollarOutlined,
  StarOutlined,
  BookOutlined,
  CrownOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const ChatPartnerHeader = ({ 
  partner, 
  showRole = true, 
  showLocation = true,
  showRating = true,
  style = {} 
}) => {
  if (!partner) return null;

  const { name, avatar, role, locationData, writerProfile } = partner;
  
  const formatLocation = (location) => {
    if (!location) return 'Unknown Location';
    return `${location.city || 'Unknown'}, ${location.country || 'Unknown'}`;
  };

  const getRoleColor = (userRole) => {
    switch (userRole) {
      case 'student': return 'blue';
      case 'writer': return 'green';
      case 'admin': return 'red';
      default: return 'default';
    }
  };

  const getRoleIcon = (userRole) => {
    switch (userRole) {
      case 'student': return <BookOutlined />;
      case 'writer': return <CrownOutlined />;
      case 'admin': return <StarOutlined />;
      default: return <UserOutlined />;
    }
  };

  return (
    <div 
      style={{
        padding: '16px',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: '#fafafa',
        borderRadius: '8px 8px 0 0',
        ...style
      }}
    >
      <Space size="middle" align="center">
        {/* Avatar with Online Status */}
        <Badge dot status="success" offset={[-2, 32]}>
          <Avatar
            size={48}
            src={avatar}
            icon={<UserOutlined />}
            style={{
              backgroundColor: role === 'writer' ? '#52c41a' : '#1890ff'
            }}
          />
        </Badge>

        {/* User Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {/* Name and Role */}
            <Space size="small" wrap>
              <Title level={5} style={{ margin: 0, color: '#262626' }}>
                {name}
              </Title>
              {showRole && role && (
                <Tag 
                  color={getRoleColor(role)} 
                  icon={getRoleIcon(role)}
                  style={{ borderRadius: '12px' }}
                >
                  {role.toUpperCase()}
                </Tag>
              )}
              {showRating && writerProfile?.rating?.average > 0 && (
                <Tag 
                  color="gold" 
                  icon={<StarOutlined />}
                  style={{ borderRadius: '12px' }}
                >
                  {writerProfile.rating.average.toFixed(1)} ({writerProfile.rating.count} reviews)
                </Tag>
              )}
            </Space>

            {/* Location Information */}
            {showLocation && locationData && (
              <Space size="small" style={{ color: '#8c8c8c' }}>
                <EnvironmentOutlined style={{ color: '#1890ff' }} />
                <Tooltip title={`Currently in ${formatLocation(locationData)}`}>
                  <Space size="small">
                    <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                      {locationData.flag || '🌍'} {formatLocation(locationData)}
                    </Text>
                    {locationData.currency && (
                      <Tag 
                        size="small" 
                        color={locationData.currency === 'ngn' ? 'green' : 'blue'}
                        style={{ fontSize: '10px', margin: 0, borderRadius: '8px' }}
                        icon={<DollarOutlined />}
                      >
                        {locationData.currencySymbol || '$'} {locationData.currency?.toUpperCase()}
                      </Tag>
                    )}
                  </Space>
                </Tooltip>
              </Space>
            )}

            {/* Writer Specialties */}
            {role === 'writer' && writerProfile?.specialties?.length > 0 && (
              <Space size="small" wrap>
                {writerProfile.specialties.slice(0, 3).map((specialty, index) => (
                  <Tag 
                    key={index} 
                    size="small" 
                    style={{ 
                      backgroundColor: '#f6ffed', 
                      borderColor: '#b7eb8f',
                      color: '#52c41a',
                      borderRadius: '6px',
                      fontSize: '10px'
                    }}
                  >
                    {specialty}
                  </Tag>
                ))}
                {writerProfile.specialties.length > 3 && (
                  <Text style={{ fontSize: '10px', color: '#8c8c8c' }}>
                    +{writerProfile.specialties.length - 3} more
                  </Text>
                )}
              </Space>
            )}
          </Space>
        </div>
      </Space>
    </div>
  );
};

export default ChatPartnerHeader; 