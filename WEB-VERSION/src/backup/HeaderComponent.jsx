// src/components/HeaderComponent.jsx

import React, { useState, useEffect } from 'react';
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
  Tooltip,
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
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const { Text } = Typography;

const HeaderComponent = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // Initial check
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

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
    setDrawerVisible(false);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setDrawerVisible(false);
    }
  };

  // Get message count from notifications (filter for message-type notifications)
  const messageNotifications = notifications.filter(n => 
    n.type === 'message' || n.title?.toLowerCase().includes('message') || n.content?.toLowerCase().includes('message')
  );
  const unreadMessageCount = messageNotifications.filter(n => !n.read).length;

  // Get general notification count (excluding messages)
  const generalNotifications = notifications.filter(n => 
    n.type !== 'message' && !n.title?.toLowerCase().includes('message') && !n.content?.toLowerCase().includes('message')
  );
  const unreadNotificationCount = generalNotifications.filter(n => !n.read).length;

  const handleMessagesClick = () => {
    // Mark all message notifications as read
    messageNotifications.forEach(notif => {
      if (!notif.read) {
        markNotificationAsRead(notif._id);
      }
    });
    
    // Navigate to messages based on user role
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
    // Mark all general notifications as read when dropdown opens
    generalNotifications.forEach(notif => {
      if (!notif.read) {
        markNotificationAsRead(notif._id);
      }
    });
  };

  const userMenu = (
    <Menu className={`${isMobile ? 'w-80' : 'w-72'} rounded-xl border-none shadow-xl p-3 bg-white`}>
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl mb-3">
        <Avatar
          size={isMobile ? 40 : 52}
          src={user?.avatar || ''}
          icon={!user?.avatar && <UserOutlined />}
          className="border-3 border-blue-200 shadow-sm"
        />
        <div className="flex flex-col">
          <Text className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : 'text-base'}`}>{user?.name}</Text>
          <Text className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-600 font-medium`}>
            {user?.role === 'student' ? 'Student' : 'Professional Writer'}
          </Text>
          <Text className="text-xs text-gray-500">
            {user?.email}
          </Text>
        </div>
      </div>
      
      <Menu.Item key="profile" icon={<UserOutlined />} className="rounded-lg my-1 p-3">
        <Link to="/profile" className="text-gray-700 hover:text-blue-600">Profile Settings</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />} className="rounded-lg my-1 p-3">
        <Link to="/settings" className="text-gray-700 hover:text-blue-600">Account Settings</Link>
      </Menu.Item>
      <Menu.Divider className="my-3" />
      <Menu.Item 
        key="logout" 
        icon={<LogoutOutlined />} 
        onClick={handleLogout} 
        className="rounded-lg my-1 p-3 text-red-600 hover:bg-red-50"
      >
        <span className="font-medium">Logout</span>
      </Menu.Item>
    </Menu>
  );

  const notificationMenu = (
    <Menu className={`${isMobile ? 'w-80 max-h-[400px]' : 'w-96 max-h-[500px]'} overflow-hidden rounded-xl border-none shadow-xl p-0 bg-white`}>
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BellOutlined className="text-blue-600 text-lg" />
          <Text className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : 'text-base'}`}>Notifications</Text>
        </div>
        <Button
          type="link"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            clearAllNotifications();
          }}
          className="text-blue-600 hover:text-blue-800 font-medium text-xs"
        >
          Clear all
        </Button>
      </div>

      {generalNotifications.length === 0 ? (
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <BellOutlined className="text-xl text-gray-400" />
          </div>
          <div>
            <Text className="text-gray-500 font-medium text-sm">No new notifications</Text>
            <Text className="text-gray-400 text-xs block mt-1">You're all caught up!</Text>
          </div>
        </div>
      ) : (
        <div className={`${isMobile ? 'max-h-72' : 'max-h-80'} overflow-y-auto`}>
          {generalNotifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => {
                navigate(notif.link || '/notifications');
                if (!notif.read) markNotificationAsRead(notif._id);
              }}
              className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-blue-25 transition-all duration-200 ${
                !notif.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-start justify-between">
                  <Text className={`font-semibold text-gray-900 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {notif.title}
                  </Text>
                  <Text className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </Text>
                </div>
                <Text className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {notif.content?.substring(0, 80)}
                  {notif.content?.length > 80 ? '...' : ''}
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </Menu>
  );

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    return user.role === 'student' ? '/dashboard/student' : '/dashboard/writer';
  };

  const getNavItems = () => {
    if (!user) return [];

    const commonItems = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined className={isMobile ? 'text-lg' : 'text-xl'} />,
        label: 'Dashboard',
        path: getDashboardLink(),
      },
      {
        key: 'ai-chat',
        icon: <CommentOutlined className={isMobile ? 'text-lg' : 'text-xl'} />,
        label: 'AI Chat',
        path: '/ai-chat',
      },
    ];

    if (user.role === 'student') {
      return [
        ...commonItems,
        {
          key: 'assignments',
          icon: <FileTextOutlined className={isMobile ? 'text-lg' : 'text-xl'} />,
          label: 'Assignments',
          path: '/assignments',
        },
        {
          key: 'writers',
          icon: <BookOutlined className={isMobile ? 'text-lg' : 'text-xl'} />,
          label: 'Writers',
          path: '/writers',
        },
        {
          key: 'payments',
          icon: <WalletOutlined className={isMobile ? 'text-lg' : 'text-xl'} />,
          label: 'Payments',
          path: '/payments',
        },
      ];
    } else if (user.role === 'writer') {
      return [
        ...commonItems,
        {
          key: 'orders',
          icon: <FileTextOutlined className={isMobile ? 'text-lg' : 'text-xl'} />,
          label: 'Orders',
          path: '/orders',
        },
        {
          key: 'earnings',
          icon: <WalletOutlined className={isMobile ? 'text-lg' : 'text-xl'} />,
          label: 'Earnings',
          path: '/earnings',
        },
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();
  const isActive = (path) => location.pathname === path;

  // Mobile navigation drawer content
  const mobileNavContent = (
    <div className="flex flex-col h-full">
      {/* Mobile header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img
            src="/App-Icon-Light.png"
            alt="App Icon"
            className="w-8 h-8"
          />
          <img
            src="/Thinq-Scribe.png"
            alt="ThinkScribe"
            className="h-6"
          />
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => setDrawerVisible(false)}
          className="text-gray-500"
        />
      </div>

      {/* Search bar */}
      {isAuthenticated && (
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder="Search conversations..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearch}
            className="rounded-xl border-gray-200"
            size="large"
          />
        </div>
      )}

      {/* Navigation items */}
      {isAuthenticated && (
        <div className="flex-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              onClick={() => setDrawerVisible(false)}
              className={`flex items-center gap-4 p-4 rounded-xl mb-2 transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              <Text className={`font-medium ${isActive(item.path) ? 'text-blue-600' : 'text-gray-700'}`}>
                {item.label}
              </Text>
            </Link>
          ))}

          {/* Messages link */}
          <button
            onClick={handleMessagesClick}
            className={`w-full flex items-center gap-4 p-4 rounded-xl mb-2 transition-all duration-200 ${
              location.pathname.includes('/chat')
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Badge count={unreadMessageCount} size="small">
              <MessageOutlined className="text-lg" />
            </Badge>
            <Text className={`font-medium ${location.pathname.includes('/chat') ? 'text-blue-600' : 'text-gray-700'}`}>
              Messages
            </Text>
          </button>
        </div>
      )}

      {/* User info */}
      {isAuthenticated && user && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Avatar
              size={40}
              src={user?.avatar || ''}
              icon={!user?.avatar && <UserOutlined />}
              className="border-2 border-blue-200"
            />
            <div className="flex-1 min-w-0">
              <Text className="font-semibold text-gray-900 text-sm block truncate">{user?.name}</Text>
              <Text className="text-xs text-blue-600 font-medium">
                {user?.role === 'student' ? 'Student' : 'Professional Writer'}
              </Text>
            </div>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="text-red-500 hover:bg-red-50"
              size="small"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
            : 'bg-white/90 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              {isAuthenticated && isMobile && (
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setDrawerVisible(true)}
                  className="text-gray-600 hover:text-blue-600 mr-2"
                  size="large"
                />
              )}
              
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/App-Icon-Light.png"
                  alt="App Icon"
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
                <img
                  src="/Thinq-Scribe.png"
                  alt="ThinkScribe"
                  className="h-5 sm:h-6"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            {isAuthenticated && !isMobile && (
              <div className="hidden md:flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    {item.icon}
                    <Text className={`font-medium ${isActive(item.path) ? 'text-blue-600' : 'text-gray-700'}`}>
                      {item.label}
                    </Text>
                  </Link>
                ))}
              </div>
            )}

            {/* Desktop Search Bar */}
            {isAuthenticated && !isMobile && (
              <div className="hidden lg:block flex-1 max-w-md mx-8">
                <Input
                  placeholder="Search conversations..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearch}
                  className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
                  size="large"
                />
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {isAuthenticated ? (
                <>
                  {/* Messages - Desktop */}
                  {!isMobile && (
                    <Tooltip title="Messages">
                      <Button
                        type="text"
                        onClick={handleMessagesClick}
                        className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                      >
                        <Badge count={unreadMessageCount} size="small">
                          <MessageOutlined className="text-xl" />
                        </Badge>
                      </Button>
                    </Tooltip>
                  )}

                  {/* Notifications */}
                  <Tooltip title="Notifications">
                    <Dropdown
                      overlay={notificationMenu}
                      trigger={['click']}
                      placement="bottomRight"
                      onClick={handleNotificationsClick}
                    >
                      <Button
                        type="text"
                        className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                      >
                        <Badge count={unreadNotificationCount} size="small">
                          <BellOutlined className={isMobile ? 'text-lg' : 'text-xl'} />
                        </Badge>
                      </Button>
                    </Dropdown>
                  </Tooltip>

                  {/* User Avatar - Desktop */}
                  {!isMobile && (
                    <Dropdown
                      overlay={userMenu}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        className="flex items-center gap-2 h-auto p-2 rounded-xl hover:bg-blue-50"
                      >
                        <Avatar
                          size={32}
                          src={user?.avatar || ''}
                          icon={!user?.avatar && <UserOutlined />}
                          className="border-2 border-blue-200"
                        />
                        <div className="hidden xl:block text-left">
                          <Text className="font-semibold text-gray-900 text-sm block">{user?.name}</Text>
                          <Text className="text-xs text-blue-600">
                            {user?.role === 'student' ? 'Student' : 'Writer'}
                          </Text>
                        </div>
                      </Button>
                    </Dropdown>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/signin">
                    <Button
                      type="default"
                      className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
                      size={isMobile ? 'middle' : 'large'}
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button
                      type="primary"
                      className="bg-blue-500 hover:bg-blue-600 border-none rounded-xl"
                      size={isMobile ? 'middle' : 'large'}
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <Drawer
        title={null}
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        className="mobile-nav-drawer"
        bodyStyle={{ padding: 0 }}
        width={320}
      >
        {mobileNavContent}
      </Drawer>
    </>
  );
};

export default HeaderComponent;
