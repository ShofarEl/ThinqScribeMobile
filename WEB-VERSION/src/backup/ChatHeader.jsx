// src/components/ChatHeader.jsx

import React, { useState } from 'react';
import {
  Avatar,
  Input,
  Menu,
  Space,
  Typography,
  Button,
  Drawer,
  Dropdown,
  Badge,
  Tooltip
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
  BookOutlined,
  WalletOutlined,
  FileTextOutlined,
  SearchOutlined,
  MenuOutlined,
  BellOutlined,
  MessageOutlined,
  StarFilled,
  CrownOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Text } = Typography;

const ChatHeader = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setDrawerVisible(false);
    }
  };

  // Enhanced user dropdown menu with premium styling
  const userMenu = (
    <Menu className="w-80 rounded-2xl border-none shadow-2xl p-4 bg-white/95 backdrop-blur-sm">
      {/* User Profile Section */}
      <div className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl mb-4 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <Avatar
              size={64}
              src={user?.avatar || ''}
              icon={!user?.avatar && <UserOutlined />}
              className="border-4 border-white/30 shadow-xl backdrop-blur-sm"
            />
            {user?.role === 'writer' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <CrownOutlined className="text-xs text-yellow-800" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <Text className="font-bold text-white text-lg block leading-tight">
              {user?.name}
            </Text>
            <div className="flex items-center gap-2 mt-1">
              <Text className="text-blue-100 text-sm font-medium">
                {user?.role === 'student' ? '🎓 Student' : '✍️ Professional Writer'}
              </Text>
              {user?.role === 'writer' && (
                <Badge count={<StarFilled className="text-yellow-400 text-xs" />} />
              )}
            </div>
            <Text className="text-blue-200 text-xs mt-1 opacity-90">
              {user?.email}
            </Text>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      {user?.role === 'student' && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <Text className="text-green-600 font-bold text-lg block">12</Text>
            <Text className="text-green-700 text-xs">Completed</Text>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <Text className="text-blue-600 font-bold text-lg block">$245</Text>
            <Text className="text-blue-700 text-xs">Credits</Text>
          </div>
        </div>
      )}
      
      {/* Menu Items */}
      <div className="space-y-1">
        <Menu.Item key="profile" className="rounded-xl my-1 p-3 hover:bg-blue-50 transition-all duration-200">
          <Link to="/profile" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 no-underline">
            <UserOutlined className="text-lg" />
            <span className="font-medium">Profile Settings</span>
          </Link>
        </Menu.Item>
        
        <Menu.Item key="messages" className="rounded-xl my-1 p-3 hover:bg-purple-50 transition-all duration-200">
          <Link to="/messages" className="flex items-center gap-3 text-gray-700 hover:text-purple-600 no-underline">
            <Badge count={3} size="small">
              <MessageOutlined className="text-lg" />
            </Badge>
            <span className="font-medium">Messages</span>
          </Link>
        </Menu.Item>
        
        <Menu.Item key="settings" className="rounded-xl my-1 p-3 hover:bg-gray-50 transition-all duration-200">
          <Link to="/settings" className="flex items-center gap-3 text-gray-700 hover:text-gray-600 no-underline">
            <SettingOutlined className="text-lg" />
            <span className="font-medium">Account Settings</span>
          </Link>
        </Menu.Item>
      </div>
      
      <div className="border-t border-gray-100 mt-4 pt-4">
        <Menu.Item 
          key="logout" 
          onClick={handleLogout} 
          className="rounded-xl p-3 text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <LogoutOutlined className="text-lg" />
            <span className="font-semibold">Sign Out</span>
          </div>
        </Menu.Item>
      </div>
    </Menu>
  );

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/';
    return user.role === 'student' ? '/student/dashboard' : '/writer/dashboard';
  };

  // Enhanced navigation items
  const getNavItems = () => {
    const commonItems = [
      { key: 'home', label: 'Home', path: '/', icon: <HomeOutlined />, color: 'blue' },
      { key: 'about', label: 'About', path: '/about', icon: <BookOutlined />, color: 'green' },
      { key: 'pricing', label: 'Pricing', path: '/pricing', icon: <CrownOutlined />, color: 'yellow' },
    ];

    if (!isAuthenticated) {
      return commonItems;
    }

    if (user?.role === 'student') {
      return [
        {
          key: 'dashboard',
          label: 'Dashboard',
          path: '/student/dashboard',
          icon: <DashboardOutlined />,
          color: 'blue'
        },
        {
          key: 'assignments',
          label: 'Assignments',
          path: '/student/assignments',
          icon: <BookOutlined />,
          color: 'green'
        },
        {
          key: 'wallet',
          label: 'Wallet',
          path: '/wallet',
          icon: <WalletOutlined />,
          color: 'purple'
        },
        {
          key: 'ai-chat',
          label: 'AI Assistant',
          path: '/ai-chat',
          icon: <MessageOutlined />,
          color: 'indigo'
        },
      ];
    } else if (user?.role === 'writer') {
      return [
        {
          key: 'dashboard',
          label: 'Dashboard',
          path: '/writer/dashboard',
          icon: <DashboardOutlined />,
          color: 'blue'
        },
        {
          key: 'available',
          label: 'Available Jobs',
          path: '/writer/available',
          icon: <FileTextOutlined />,
          color: 'green'
        },
        {
          key: 'earnings',
          label: 'Earnings',
          path: '/writer/earnings',
          icon: <WalletOutlined />,
          color: 'yellow'
        },
        {
          key: 'ai-chat',
          label: 'AI Assistant',
          path: '/ai-chat',
          icon: <MessageOutlined />,
          color: 'indigo'
        },
      ];
    }

    return commonItems;
  };

  return (
    <header className="fixed w-full top-0 bg-white/90 backdrop-blur-md border-b border-gray-200/60 transition-all duration-300 z-50 h-20 shadow-sm">
      <div className="h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Enhanced Logo Section */}
          <div className="flex items-center">
            <Link to={getDashboardLink()} className="flex items-center no-underline group">
              <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="relative">
                  <img 
                    src="/App-Icon-Light.png" 
                    alt="App Icon" 
                    className="w-12 h-12 object-contain transition-transform duration-300 group-hover:rotate-6"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                </div>
                <img 
                  src="/Thinq-Scribe.png" 
                  alt="ThinkScribe" 
                  className="h-9 object-contain transition-all duration-300 group-hover:brightness-110"
                />
              </div>
            </Link>
          </div>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {getNavItems().map((item) => (
              <Tooltip key={item.key} title={item.label} placement="bottom">
                <Link
                  to={item.path}
                  className={`relative text-gray-700 font-medium no-underline transition-all duration-300 flex items-center gap-3 px-4 py-3 rounded-xl hover:shadow-md hover:-translate-y-0.5 group ${
                    location.pathname === item.path 
                      ? `text-${item.color}-600 bg-${item.color}-50 shadow-md` 
                      : `hover:text-${item.color}-600 hover:bg-${item.color}-50`
                  }`}
                >
                  <span className={`text-lg transition-all duration-300 group-hover:scale-110 ${
                    location.pathname === item.path ? `text-${item.color}-600` : ''
                  }`}>
                    {item.icon}
                  </span>
                  <span className="font-semibold">{item.label}</span>
                  {location.pathname === item.path && (
                    <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-${item.color}-500 rounded-full`}></div>
                  )}
                </Link>
              </Tooltip>
            ))}
          </div>

          {/* Enhanced Right Section */}
          <div className="flex items-center gap-4">
            {/* Enhanced Search */}
            {isAuthenticated && (
              <div className="hidden lg:block">
                <div className="relative">
                  <Input
                    placeholder="Search conversations..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearch}
                    className="w-64 rounded-xl border-gray-300 h-11 shadow-sm hover:shadow-md transition-all duration-300 focus:shadow-lg"
                    style={{ 
                      fontSize: '14px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <Tooltip title="Notifications" placement="bottom">
                <Button
                  type="text"
                  className="w-12 h-12 rounded-xl hover:bg-blue-50 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-md"
                >
                  <Badge count={5} size="small">
                    <BellOutlined className="text-xl text-gray-600 hover:text-blue-600 transition-colors duration-300" />
                  </Badge>
                </Button>
              </Tooltip>
            )}

            {/* Enhanced User Section */}
            {isAuthenticated && user ? (
              <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
                <div className="flex items-center gap-3 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group">
                  <div className="relative">
                    <Avatar
                      size={40}
                      src={user.avatar || ''}
                      icon={!user.avatar && <UserOutlined />}
                      className="border-3 border-blue-200 shadow-lg transition-all duration-300 group-hover:border-blue-300 group-hover:shadow-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <Text className="text-sm font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                      {user.name}
                    </Text>
                    <Text className="text-xs text-blue-600 leading-tight font-semibold">
                      {user.role === 'student' ? '🎓 Student' : '✍️ Writer'}
                    </Text>
                  </div>
                </div>
              </Dropdown>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  type="text"
                  className="text-gray-700 hover:text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  onClick={() => navigate('/signin')}
                >
                  Sign In
                </Button>
                <Button
                  type="primary"
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 border-none rounded-xl font-bold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Enhanced Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                type="text"
                icon={<MenuOutlined className="text-xl" />}
                onClick={() => setDrawerVisible(true)}
                className="w-12 h-12 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Drawer */}
        <Drawer
          title={
            <div className="flex items-center gap-3">
              <img 
                src="/App-Icon-Light.png" 
                alt="App Icon" 
                className="w-10 h-10 object-contain"
              />
              <img 
                src="/Thinq-Scribe.png" 
                alt="ThinkScribe" 
                className="h-7 object-contain"
              />
            </div>
          }
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          bodyStyle={{ padding: 0 }}
          width={320}
          className="[&_.ant-drawer-header]:bg-gradient-to-r [&_.ant-drawer-header]:from-blue-50 [&_.ant-drawer-header]:via-indigo-50 [&_.ant-drawer-header]:to-purple-50 [&_.ant-drawer-header]:backdrop-blur-sm"
        >
          {/* Enhanced Mobile User Info */}
          {isAuthenticated && user && (
            <div className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center gap-4">
                <Avatar
                  size={56}
                  src={user?.avatar || ''}
                  icon={!user?.avatar && <UserOutlined />}
                  className="border-4 border-white/30 shadow-xl"
                />
                <div className="flex-1">
                  <Text className="font-bold text-white text-lg">{user.name}</Text>
                  <Text className="text-blue-100 text-sm font-medium block">
                    {user.role === 'student' ? '🎓 Student' : '✍️ Writer'}
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Mobile Search */}
          {isAuthenticated && (
            <div className="p-5 bg-gray-50/50 border-b border-gray-200">
              <Input
                placeholder="Search conversations..."
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                className="rounded-xl shadow-sm"
              />
            </div>
          )}

          {/* Enhanced Mobile Navigation Items */}
          <div className="py-2">
            {getNavItems().map((item) => (
              <div
                key={item.key}
                className={`mx-3 my-1 px-4 py-4 cursor-pointer rounded-xl text-gray-700 flex items-center gap-4 transition-all duration-300 font-semibold ${
                  location.pathname === item.path 
                    ? `text-${item.color}-600 bg-${item.color}-50` 
                    : `hover:text-${item.color}-600 hover:bg-${item.color}-50`
                }`}
                onClick={() => {
                  navigate(item.path);
                  setDrawerVisible(false);
                }}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </div>
            ))}

            {isAuthenticated && (
              <>
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div
                    className="mx-3 my-1 px-4 py-4 cursor-pointer rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-4 transition-all duration-300 font-semibold"
                    onClick={() => {
                      navigate('/profile');
                      setDrawerVisible(false);
                    }}
                  >
                    <UserOutlined className="text-lg" />
                    Profile
                  </div>
                  <div
                    className="mx-3 my-1 px-4 py-4 cursor-pointer rounded-xl text-gray-700 hover:text-gray-600 hover:bg-gray-50 flex items-center gap-4 transition-all duration-300 font-semibold"
                    onClick={() => {
                      navigate('/settings');
                      setDrawerVisible(false);
                    }}
                  >
                    <SettingOutlined className="text-lg" />
                    Settings
                  </div>
                </div>
                
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div
                    className="mx-3 my-1 px-4 py-4 cursor-pointer rounded-xl text-red-600 hover:bg-red-50 flex items-center gap-4 transition-all duration-300 font-semibold"
                    onClick={() => {
                      handleLogout();
                      setDrawerVisible(false);
                    }}
                  >
                    <LogoutOutlined className="text-lg" />
                    Sign Out
                  </div>
                </div>
              </>
            )}

            {!isAuthenticated && (
              <div className="border-t border-gray-200 mt-4 pt-4 px-5 space-y-3">
                <Button
                  type="text"
                  block
                  className="text-left justify-start text-gray-700 hover:text-blue-600 font-semibold rounded-xl h-12"
                  onClick={() => {
                    navigate('/signin');
                    setDrawerVisible(false);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  type="primary"
                  block
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none rounded-xl font-bold shadow-lg h-12"
                  onClick={() => {
                    navigate('/signup');
                    setDrawerVisible(false);
                  }}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </Drawer>
      </div>
    </header>
  );
};

export default ChatHeader;
