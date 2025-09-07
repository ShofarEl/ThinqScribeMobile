import React, { useState, useEffect, memo, useMemo } from 'react';
import {
  Avatar,
  Badge,
  Dropdown,
  Input,
  Menu,
  Space,
  Typography,
  Button,
  Drawer,
  Popover,
  List,
  Divider,
  Empty,
  Layout,
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
  BookOutlined,
  MessageOutlined,
  WalletOutlined,
  FileTextOutlined,
  BellOutlined,
  SearchOutlined,
  MenuOutlined,
  CommentOutlined,
  CloseOutlined,
  EditOutlined,
  DownOutlined,
  TeamOutlined,
  DollarOutlined,
  RobotOutlined,
  LoginOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useCurrency } from '../hooks/useCurrency';
import LocationDisplay from './LocationDisplay';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import './HeaderComponent.css';

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

const { Text } = Typography;
const { Header } = Layout;

// Define InfoCircleOutlined component
const InfoCircleOutlined = () => (
  <svg viewBox="64 64 896 896" focusable="false" data-icon="info-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
    <path d="M464 336a48 48 0 1096 0 48 48 0 10-96 0zm72 112h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V456c0-4.4-3.6-8-8-8z"></path>
  </svg>
);

const HeaderComponent = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: 0
  });

  // Enhanced responsive screen size detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width <= 768,
        isTablet: width > 768 && width <= 1023,
        isDesktop: width > 1023,
        width
      });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
      setDrawerVisible(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setDrawerVisible(false);
    }
  };

  // Get message count from notifications
  const messageNotifications = useMemo(() => 
    notifications.filter(n => 
      n.type === 'message' || n.title?.toLowerCase().includes('message') || n.content?.toLowerCase().includes('message')
    ), [notifications]
  );
  
  const unreadMessageCount = useMemo(() => 
    messageNotifications.filter(n => !n.read).length, 
    [messageNotifications]
  );

  // Get general notification count
  const generalNotifications = useMemo(() => 
    notifications.filter(n => 
      n.type !== 'message' && !n.title?.toLowerCase().includes('message') && !n.content?.toLowerCase().includes('message')
    ), [notifications]
  );
  
  const unreadNotificationCount = useMemo(() => 
    generalNotifications.filter(n => !n.read).length, 
    [generalNotifications]
  );

  // Check if user is currently in a chat room
  const isInChatRoom = location.pathname.includes('/chat/student') || location.pathname.includes('/chat/writer');

  const handleMessagesClick = () => {
    messageNotifications.forEach(notif => {
      if (!notif.read) {
        markAsRead(notif._id);
      }
    });
    
    if (user?.role === 'student') {
      navigate('/chat/student');
    } else if (user?.role === 'writer') {
      navigate('/chat/writer');
    } else {
      navigate('/messages');
    }
    setDrawerVisible(false);
  };

  const handleNotificationsClick = () => {
    setNotificationDropdownOpen(!notificationDropdownOpen);
  };

  const handleNotificationItemClick = async (notification) => {
    try {
      if (!notification.read) {
        await markAsRead(notification._id);
      }
      
      if (notification.link) {
        navigate(notification.link);
      } else {
        navigate('/notifications');
      }
      
      setNotificationDropdownOpen(false);
    } catch (error) {
      if (notification.link) {
        navigate(notification.link);
      } else {
        navigate('/notifications');
      }
      setNotificationDropdownOpen(false);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getDashboardLink = () => {
    if (!isAuthenticated || !user) return '/';
    
    switch (user.role) {
      case 'student':
        return '/student/dashboard';
      case 'writer':
        return '/writer/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/dashboard';
    }
  };

  const getNavItems = () => {
    if (!isAuthenticated || !user) {
      return [
        {
          key: 'home',
          icon: <HomeOutlined />,
          label: 'Home',
          path: '/',
        },
        {
          key: 'about',
          icon: <InfoCircleOutlined />,
          label: 'About',
          path: '/about',
        },
      ];
    }

    const commonItems = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        path: getDashboardLink(),
      },
      {
        key: 'ai-chat',
        icon: <RobotOutlined />,
        label: 'AI Assistant',
        path: 'https://ai.thinqscribe.com',
        external: true,
      },
    ];

    if (user.role === 'student') {
      return [
        ...commonItems,
        {
          key: 'writers',
          icon: <TeamOutlined />,
          label: 'Writers',
          path: '/writers',
        },
      ];
    } else if (user.role === 'writer') {
      return [
        ...commonItems,
      ];
    } else if (user.role === 'admin') {
      return [
        ...commonItems,
        {
          key: 'users',
          icon: <TeamOutlined />,
          label: 'Users',
          path: '/admin/users',
        },
        {
          key: 'reports',
          icon: <FileTextOutlined />,
          label: 'Influencers',
          path: '/admin/influencers',
        },
      ];
    }

    return commonItems;
  };

  const navItems = useMemo(() => getNavItems(), [isAuthenticated, user]);
  const isActive = (path) => location.pathname === path;

  // Mobile navigation drawer content
  const mobileNavContent = useMemo(() => (
    <div 
      className="flex flex-col h-full"
      style={{ 
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <img
            src="/App-Icon-Light.png"
            alt="App Icon"
            className="w-6 h-6 object-contain"
          />
          <img
            src="/Thinq-Scribe.png"
            alt="Thinqscribe"
            className="h-4 object-contain"
          />
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => setDrawerVisible(false)}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          size="small"
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </div>

      {isAuthenticated ? (
        <>
          {/* Search Section */}
          <div className="p-4 border-b border-gray-100 bg-white flex-shrink-0">
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
              className="rounded-lg border-gray-200"
              size="middle"
            />
          </div>

          {/* Navigation Links */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-1">
              {navItems.map((item) => (
                item.external ? (
                  <a
                    key={item.key}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setDrawerVisible(false)}
                    className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-gray-600 hover:bg-white hover:shadow-sm"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <Text className="font-medium text-gray-700 text-sm">
                      {item.label}
                    </Text>
                  </a>
                ) : (
                  <Link
                    key={item.key}
                    to={item.path}
                    onClick={() => setDrawerVisible(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm'
                        : 'text-gray-600 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <Text className={`font-medium ${
                      isActive(item.path) ? 'text-blue-600' : 'text-gray-700'
                    } text-sm`}>
                      {item.label}
                    </Text>
                  </Link>
                )
              ))}

              {/* Messages Link (if not in chat room) */}
              {!isInChatRoom && (
                <button
                  onClick={handleMessagesClick}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    location.pathname.includes('/chat')
                      ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm'
                      : 'text-gray-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <Badge count={unreadMessageCount} size="small">
                    <span className="text-lg">
                      <MessageOutlined />
                    </span>
                  </Badge>
                  <Text className={`font-medium ${
                    location.pathname.includes('/chat') ? 'text-blue-600' : 'text-gray-700'
                  } text-sm`}>
                    Messages
                  </Text>
                </button>
              )}
            </div>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Avatar
                size={36}
                src={user?.avatar || ''}
                icon={!user?.avatar && <UserOutlined />}
                className="border-2 border-blue-100 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Text className="font-semibold text-gray-900 block truncate text-sm">
                  {user?.name}
                </Text>
                <Text className="text-blue-600 font-medium truncate text-xs">
                  {user?.role === 'student' ? 'Student' : user?.role === 'writer' ? 'Professional Writer' : 'Admin'}
                </Text>
              </div>
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className="text-red-500 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                size="small"
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div className="space-y-1 mb-6">
            <Link
              to="/"
              onClick={() => setDrawerVisible(false)}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                isActive('/') 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm' 
                  : 'text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <span className="text-lg"><HomeOutlined /></span>
              <Text className={`font-medium ${isActive('/') ? 'text-blue-600' : 'text-gray-700'} text-sm`}>
                Home
              </Text>
            </Link>
            
            <Link
              to="/about"
              onClick={() => setDrawerVisible(false)}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                isActive('/about') 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm' 
                  : 'text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <span className="text-lg"><InfoCircleOutlined /></span>
              <Text className={`font-medium ${isActive('/about') ? 'text-blue-600' : 'text-gray-700'} text-sm`}>
                About
              </Text>
            </Link>
          </div>
          
          {/* Auth Buttons */}
          <div className="space-y-3">
            <Link to="/signin" className="block">
              <Button 
                type="primary" 
                icon={<LoginOutlined />} 
                className="w-full h-10"
                onClick={() => setDrawerVisible(false)}
                style={{
                  backgroundColor: 'var(--primary-color)',
                  borderColor: 'var(--primary-color)',
                }}
              >
                Sign In
              </Button>
            </Link>
            <Link to="/signup" className="block">
              <Button 
                icon={<UserAddOutlined />} 
                className="w-full h-10 border-gray-300 text-gray-700 hover:border-blue-300 hover:text-blue-600"
                onClick={() => setDrawerVisible(false)}
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  ), [
    isAuthenticated, 
    user, 
    navItems, 
    location.pathname, 
    searchQuery, 
    unreadMessageCount, 
    isInChatRoom
  ]);

  const getUserMenu = () => (
    <Menu
      items={[
        {
          key: 'profile',
          label: <Link to="/profile">Profile Settings</Link>,
          icon: <UserOutlined />
        },
        {
          key: 'divider',
          type: 'divider'
        },
        {
          key: 'logout',
          label: 'Logout',
          icon: <LogoutOutlined />,
          onClick: handleLogout,
        }
      ]}
    />
  );

  // Notification content for popover
  const notificationContent = useMemo(() => (
    <div style={{ 
      width: screenSize.isMobile ? '280px' : '320px', 
      maxHeight: '400px', 
      overflow: 'auto' 
    }}>
      {notifications.length > 0 ? (
        <>
          <List
            itemLayout="horizontal"
            dataSource={notifications.slice(0, 5)}
            renderItem={item => (
              <List.Item
                key={item._id}
                onClick={() => handleNotificationItemClick(item)}
                style={{ 
                  cursor: 'pointer', 
                  padding: '10px 12px',
                  backgroundColor: item.read ? 'transparent' : 'rgba(1, 83, 130, 0.05)',
                  borderRadius: '4px',
                  marginBottom: '2px'
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={
                        item.type === 'payment' ? <DollarOutlined /> : 
                        item.type === 'message' ? <MessageOutlined /> : 
                        <BellOutlined />
                      }
                      style={{ 
                        backgroundColor: 
                          item.type === 'payment' ? '#52c41a' : 
                          item.type === 'message' ? 'var(--primary-color)' : 
                          '#faad14',
                        width: '28px',
                        height: '28px',
                        fontSize: '14px'
                      }} 
                    />
                  }
                  title={
                    <span style={{ 
                      fontWeight: item.read ? 'normal' : 'bold',
                      color: item.read ? 'var(--text-color)' : 'var(--primary-color)',
                      fontSize: '13px'
                    }}>
                      {item.title || 'Notification'}
                    </span>
                  }
                  description={
                    <div>
                      <div style={{ fontSize: '12px', marginBottom: '2px' }}>{item.message}</div>
                      <div style={{ fontSize: '10px', color: '#8c8c8c' }}>
                        {dayjs(item.createdAt).fromNow()}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
          <Divider style={{ margin: '6px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px' }}>
            <Link to="/notifications">
              <Button type="link" size="small" style={{ padding: 0, color: 'var(--primary-color)', fontSize: '12px' }}>
                View All
              </Button>
            </Link>
            <Button 
              type="link" 
              size="small" 
              style={{ padding: 0, fontSize: '12px' }}
              onClick={handleClearAllNotifications}
            >
              Clear All
            </Button>
          </div>
        </>
      ) : (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          description="No notifications" 
          style={{ margin: '12px 0' }}
        />
      )}
    </div>
  ), [notifications, screenSize.isMobile]);

  return (
    <>
      <Header 
        className="app-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          boxShadow: scrolled ? '0 2px 8px rgba(1, 83, 130, 0.08)' : 'none',
          transition: 'box-shadow 0.3s ease',
          margin: 0,
          padding: screenSize.isMobile ? '0 16px' : screenSize.isTablet ? '0 20px' : '0 24px',
          borderBottom: 'none',
          height: screenSize.isMobile ? '56px' : '64px',
          lineHeight: 1,
        }}
      >
        {/* THREE SECTION LAYOUT */}
        <div className="header-main-container">
          {/* LEFT SECTION: Mobile Menu + Logo */}
          <div className="header-left-section">
            {screenSize.isMobile && (
              <Button
                className="mobile-menu-btn"
                icon={<MenuOutlined />}
                type="text"
                onClick={() => setDrawerVisible(true)}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  border: 'none',
                  borderRadius: '8px',
                  background: 'transparent'
                }}
              />
            )}

            <Link to={isAuthenticated ? getDashboardLink() : '/'} className="header-logo">
              <img
                src="/App-Icon-Light.png"
                alt="Thinqscribe Icon"
                style={{
                  height: screenSize.isMobile ? '24px' : '28px',
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
              {screenSize.isDesktop && (
                <img
                  src="/Thinq-Scribe.png"
                  alt="ThinqScribe"
                  style={{
                    height: '24px',
                    width: 'auto',
                    objectFit: 'contain',
                    marginLeft: '8px'
                  }}
                />
              )}
            </Link>
          </div>

          {/* CENTER SECTION: Navigation Tabs (Desktop Only) */}
          {screenSize.isDesktop && (
            <div className="header-center-section">
              <nav className="header-nav">
                {navItems.map((item) => (
                  item.external ? (
                    <a
                      key={item.key}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nav-item"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  ) : (
                    <Link
                      key={item.key}
                      to={item.path}
                      className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  )
                ))}
              </nav>
            </div>
          )}

          {/* RIGHT SECTION: User Actions */}
          <div className="header-right-section">
            {isAuthenticated ? (
              <>
                {/* Location Display - Only show on dashboard pages */}
                {(location.pathname === '/student/dashboard' || location.pathname === '/writer/dashboard') && screenSize.isDesktop && (
                  <div className="location-display-container">
                    <LocationDisplay compact={!screenSize.isDesktop} size="small" />
                  </div>
                )}

                <Space size="small" style={{ display: 'flex', alignItems: 'center' }}>
                  {/* Messages - Hide when in chat room */}
                  {!isInChatRoom && (
                    <Badge count={unreadMessageCount} overflowCount={99} size="small">
                      <Button
                        className="header-icon-btn"
                        icon={<MessageOutlined />}
                        type="text"
                        onClick={handleMessagesClick}
                        style={{
                          width: screenSize.isMobile ? '36px' : '40px',
                          height: screenSize.isMobile ? '36px' : '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          border: 'none',
                          background: 'transparent'
                        }}
                      />
                    </Badge>
                  )}
                  
                  {/* Notifications */}
                  <Popover
                    content={notificationContent}
                    title={<div style={{ fontSize: '14px', fontWeight: 500 }}>Notifications</div>}
                    trigger="click"
                    placement="bottomRight"
                    open={notificationDropdownOpen}
                    onOpenChange={setNotificationDropdownOpen}
                    overlayClassName="notification-popover"
                  >
                    <Badge count={unreadNotificationCount} overflowCount={99} size="small">
                      <Button
                        className="header-icon-btn"
                        icon={<BellOutlined />}
                        type="text"
                        onClick={handleNotificationsClick}
                        style={{
                          width: screenSize.isMobile ? '36px' : '40px',
                          height: screenSize.isMobile ? '36px' : '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          border: 'none',
                          background: 'transparent'
                        }}
                      />
                    </Badge>
                  </Popover>

                  {/* User Menu */}
                  <Dropdown
                    overlay={getUserMenu()}
                    placement="bottomRight"
                    trigger={['click']}
                    arrow
                  >
                    <Button
                      className="header-user"
                      type="text"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: screenSize.isDesktop ? '8px' : '4px',
                        padding: screenSize.isMobile ? '4px' : '6px 12px',
                        borderRadius: '24px',
                        background: screenSize.isMobile ? 'transparent' : '#f9fafb',
                        border: '1px solid transparent',
                        height: screenSize.isMobile ? '36px' : '40px'
                      }}
                    >
                      <Avatar 
                        size={screenSize.isMobile ? 20 : 24}
                        src={user?.avatar} 
                        icon={<UserOutlined />}
                        style={{
                          border: '2px solid rgba(1, 83, 130, 0.1)',
                          flexShrink: 0
                        }}
                      />
                      {screenSize.isDesktop && (
                        <>
                          <span style={{ 
                            fontSize: '14px', 
                            fontWeight: '500',
                            maxWidth: '100px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginLeft: '8px'
                          }}>
                            {user?.name}
                          </span>
                          <DownOutlined style={{ marginLeft: '4px', fontSize: '10px' }} />
                        </>
                      )}
                    </Button>
                  </Dropdown>
                </Space>
              </>
            ) : (
              <Space className="header-auth-buttons" size="small">
                <Link to="/signin">
                  <Button 
                    type="text" 
                    style={{ 
                      color: 'var(--primary-color)', 
                      fontWeight: isActive('/signin') ? '500' : 'normal',
                      height: '36px',
                      borderRadius: '8px'
                    }}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    type="primary" 
                    style={{ 
                      backgroundColor: 'var(--primary-color)',
                      borderColor: 'var(--primary-color)',
                      height: '36px',
                      borderRadius: '8px'
                    }}
                  >
                    Sign Up
                  </Button>
                </Link>
              </Space>
            )}
          </div>
        </div>
      </Header>

      {/* Mobile Drawer for Navigation */}
      <Drawer
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={300}
        headerStyle={{ display: 'none' }}
        bodyStyle={{ padding: 0, height: '100vh' }}
        maskClosable={true}
        keyboard={true}
        style={{ zIndex: 1001 }}
        className="mobile-navigation-drawer"
      >
        {mobileNavContent}
      </Drawer>
    </>
  );
};

export default memo(HeaderComponent);