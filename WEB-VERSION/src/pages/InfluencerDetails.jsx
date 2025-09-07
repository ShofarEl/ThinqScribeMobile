import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  message, 
  Popconfirm,
  Tag,
  Statistic,
  Row,
  Col,
  Space,
  Tooltip,
  Badge,
  Descriptions,
  Divider,
  Typography,
  List,
  Avatar,
  Timeline,
  Progress,
  Empty,
  Drawer,
  Dropdown,
  Table,
  Modal
} from 'antd';
import { 
  ArrowLeftOutlined,
  EditOutlined, 
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  LinkOutlined,
  CopyOutlined,
  ReloadOutlined,
  TrophyOutlined,
  CalendarOutlined,
  TeamOutlined,
  BarChartOutlined,
  MoreOutlined,
  MenuOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { influencerApi } from '../api/influencer.js';
import HeaderComponent from '../components/HeaderComponent';

const { Text, Title, Paragraph } = Typography;

const InfluencerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [referralUsers, setReferralUsers] = useState([]);
  const [referralUsersLoading, setReferralUsersLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);

  useEffect(() => {
    fetchInfluencerDetails();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [id]);

  const fetchInfluencerDetails = async () => {
    setLoading(true);
    try {
      // Use the dashboard endpoint to get both influencer and referred users
      const response = await influencerApi.getInfluencerDashboard(id);
      console.log('Influencer dashboard response:', response);
      
      const data = response.data || response;
      setInfluencer(data.influencer);
      setReferralUsers(data.referredUsers || []);
    } catch (error) {
      message.error(`Failed to fetch influencer details: ${error.message}`);
      console.error('Error fetching influencer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await influencerApi.deleteInfluencer(id);
      message.success('Influencer deleted successfully');
      navigate('/admin/influencers');
    } catch (error) {
      message.error(`Failed to delete influencer: ${error.message}`);
    }
  };

  const copyReferralLink = (code) => {
    const link = `https://www.thinqscribe.com/signup/ref/${code}`;
    navigator.clipboard.writeText(link).then(() => {
      message.success('Referral link copied to clipboard');
    }).catch(() => {
      message.error('Failed to copy link');
    });
  };

  const exportReferralUsers = () => {
    if (referralUsers.length === 0) {
      message.warning('No users to export');
      return;
    }

    const csvContent = [
      ['Name', 'Email', 'Role', 'Signup Date'],
      ...referralUsers.map(user => [
        user.name || 'N/A',
        user.email || 'N/A',
        user.role || 'user',
        new Date(user.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${influencer?.name}-referrals.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    message.success('CSV exported successfully');
  };

  const getPlatformColor = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'youtube': return 'red';
      case 'instagram': return 'pink';
      case 'tiktok': return 'black';
      case 'twitter': return 'blue';
      case 'linkedin': return 'blue';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const mobileActionItems = [
    {
      key: 'refresh',
      label: 'Refresh',
      icon: <ReloadOutlined />,
      onClick: () => {
        fetchInfluencerDetails();
        setShowMobileActions(false);
      }
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: () => {
        navigate(`/admin/influencers/${id}/edit`);
        setShowMobileActions(false);
      }
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => setShowMobileActions(false)
    }
  ];

  // Table columns for referral users
  const referralUsersColumns = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar icon={<UserOutlined />} size="small" className="mr-3" />
          <div>
            <div className="font-medium">{record.name || 'Unknown User'}</div>
            <div className="text-sm text-gray-500 break-all">{record.email || 'No email'}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'student' ? 'blue' : role === 'writer' ? 'green' : 'default'}>
          {role ? role.toUpperCase() : 'USER'}
        </Tag>
      )
    },
    {
      title: 'Signup Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <div className="flex items-center">
          <CalendarOutlined className="mr-1 text-gray-400" />
          <span className="text-sm">
            {new Date(date).toLocaleDateString()}
          </span>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderComponent />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <Card loading={true} />
        </div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderComponent />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <Empty description="Influencer not found" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Mobile Header */}
        <div className="block sm:hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/admin/influencers')}
              size="large"
            />
            <Dropdown
              menu={{
                items: mobileActionItems,
                onClick: ({ key }) => {
                  const item = mobileActionItems.find(i => i.key === key);
                  if (item?.onClick && key !== 'delete') {
                    item.onClick();
                  }
                }
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button icon={<MoreOutlined />} size="large" />
            </Dropdown>
          </div>
          
          {/* Mobile Profile Header */}
          <div className="text-center mb-4">
            <Avatar 
              size={64} 
              icon={<UserOutlined />}
              className="mb-3"
            />
            <Title level={3} className="!mb-2">
              {influencer.name}
            </Title>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge 
                status={influencer.isActive ? 'success' : 'default'} 
                text={influencer.isActive ? 'Active' : 'Inactive'} 
              />
              <Tag color={getPlatformColor(influencer.platform)}>
                {influencer.platform?.toUpperCase() || 'OTHER'}
              </Tag>
            </div>
            <Text type="secondary" className="text-sm">
              {influencer.email}
            </Text>
          </div>

          {/* Mobile Referral Code */}
          <Card size="small" className="mb-4">
            <div className="text-center">
              <Text strong className="block mb-2">Referral Code</Text>
              <div className="flex items-center justify-center gap-2">
                <Tag color="green" className="font-mono text-lg px-3 py-1">
                  {influencer.referralCode}
                </Tag>
                <Button 
                  type="text" 
                  icon={<CopyOutlined />}
                  onClick={() => copyReferralLink(influencer.referralCode)}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:block mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/admin/influencers')}
              className="flex items-center"
            >
              Back to Influencers
            </Button>
            <div className="flex-1">
              <Title level={2} className="!mb-1">
                {influencer.name}
              </Title>
              <Text type="secondary">
                Influencer Details & Performance
              </Text>
            </div>
            <Space wrap>
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchInfluencerDetails}
              >
                {isMobile ? '' : 'Refresh'}
              </Button>
              <Button 
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/admin/influencers/${id}/edit`)}
              >
                {isMobile ? '' : 'Edit'}
              </Button>
              <Popconfirm
                title="Delete this influencer?"
                description="This action cannot be undone."
                onConfirm={handleDelete}
                okText="Yes, Delete"
                cancelText="Cancel"
                placement="topRight"
              >
                <Button 
                  danger 
                  icon={<DeleteOutlined />}
                >
                  {isMobile ? '' : 'Delete'}
                </Button>
              </Popconfirm>
            </Space>
          </div>
        </div>

        <Row gutter={[isMobile ? 12 : 24, isMobile ? 16 : 24]}>
          {/* Profile Information - Desktop Only */}
          <Col xs={0} sm={0} lg={8}>
            <Card title="Profile Information" className="h-fit">
              <div className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="text-center">
                  <Avatar 
                    size={80} 
                    icon={<UserOutlined />}
                    className="mb-4"
                  />
                  <Title level={4} className="!mb-2">
                    {influencer.name}
                  </Title>
                  <Badge 
                    status={influencer.isActive ? 'success' : 'default'} 
                    text={influencer.isActive ? 'Active' : 'Inactive'} 
                  />
                </div>

                <Divider />

                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MailOutlined className="text-gray-400" />
                    <div>
                      <Text strong>Email</Text>
                      <br />
                      <Text type="secondary" className="break-all">
                        {influencer.email}
                      </Text>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <LinkOutlined className="text-gray-400" />
                    <div>
                      <Text strong>Platform</Text>
                      <br />
                      <Tag color={getPlatformColor(influencer.platform)}>
                        {influencer.platform?.toUpperCase() || 'OTHER'}
                      </Tag>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <TeamOutlined className="text-gray-400" />
                    <div>
                      <Text strong>Followers</Text>
                      <br />
                      <Text type="secondary">
                        {(influencer.followers || 0).toLocaleString()}
                      </Text>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Referral Code */}
                <div>
                  <Text strong>Referral Code</Text>
                  <div className="mt-2 flex items-center gap-2">
                    <Tag color="green" className="font-mono text-base">
                      {influencer.referralCode}
                    </Tag>
                    <Tooltip title="Copy referral link">
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<CopyOutlined />}
                        onClick={() => copyReferralLink(influencer.referralCode)}
                      />
                    </Tooltip>
                  </div>
                  <div className="mt-2">
                    <Text type="secondary" className="text-sm break-all">
                      https://www.thinqscribe.com/signup/ref/{influencer.referralCode}
                    </Text>
                  </div>
                </div>

                {influencer.notes && (
                  <>
                    <Divider />
                    <div>
                      <Text strong>Notes</Text>
                      <Paragraph className="mt-2">
                        {influencer.notes}
                      </Paragraph>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </Col>

          {/* Performance Metrics */}
          <Col xs={24} lg={16}>
            <Row gutter={[isMobile ? 12 : 16, isMobile ? 16 : 16]}>
              {/* Key Statistics */}
              <Col xs={24}>
                <Card title="Performance Overview">
                  <Row gutter={[8, 16]}>
                    <Col xs={12} sm={6}>
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold text-blue-500 mb-1">
                          {influencer.stats?.totalSignups || referralUsers.length}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          <UserOutlined className="mr-1" />
                          Total Signups
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold text-green-500 mb-1">
                          {influencer.stats?.monthlySignups || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          <CalendarOutlined className="mr-1" />
                          This Month
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold text-purple-500 mb-1">
                          {influencer.stats?.conversionRate || 0}%
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          <BarChartOutlined className="mr-1" />
                          Conversion Rate
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-bold text-orange-500 mb-1">
                          ${influencer.stats?.totalRevenue || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          <BarChartOutlined className="mr-1" />
                          Revenue
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* Mobile Contact Info */}
              <Col xs={24} sm={0} lg={0}>
                <Card title="Contact Information" size="small">
                  <div className="space-y-3">
                    <div>
                      <Text strong className="block">Email</Text>
                      <Text type="secondary" className="break-all text-sm">
                        {influencer.email}
                      </Text>
                    </div>
                    <div>
                      <Text strong className="block">Followers</Text>
                      <Text type="secondary" className="text-sm">
                        {(influencer.followers || 0).toLocaleString()}
                      </Text>
                    </div>
                    {influencer.notes && (
                      <div>
                        <Text strong className="block">Notes</Text>
                        <Text type="secondary" className="text-sm">
                          {influencer.notes}
                        </Text>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>

              {/* Referral Users */}
              <Col xs={24}>
                <Card 
                  title={
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base flex items-center gap-2">
                        <TeamOutlined />
                        Referred Users ({referralUsers.length})
                      </span>
                      <Space>
                        {referralUsers.length > 0 && (
                          <Button 
                            size="small" 
                            icon={<DownloadOutlined />}
                            onClick={exportReferralUsers}
                          >
                            {isMobile ? '' : 'Export CSV'}
                          </Button>
                        )}
                        <Button 
                          size="small" 
                          icon={<ReloadOutlined />}
                          onClick={fetchInfluencerDetails}
                        >
                          {isMobile ? '' : 'Refresh'}
                        </Button>
                      </Space>
                    </div>
                  }
                  size={isMobile ? "small" : "default"}
                >
                  {referralUsersLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-gray-600">Loading referral users...</p>
                    </div>
                  ) : referralUsers.length > 0 ? (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden sm:block">
                        <Table
                          columns={referralUsersColumns}
                          dataSource={referralUsers}
                          rowKey="_id"
                          pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total, range) => 
                              `${range[0]}-${range[1]} of ${total} users`
                          }}
                        />
                      </div>

                      {/* Mobile List View */}
                      <div className="block sm:hidden">
                        <List
                          dataSource={referralUsers.slice(0, showAllUsers ? undefined : 5)}
                          renderItem={(user) => (
                            <List.Item className="px-0">
                              <div className="w-full p-3 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center flex-1 min-w-0">
                                    <Avatar icon={<UserOutlined />} size="small" className="mr-3" />
                                    <div className="min-w-0 flex-1">
                                      <div className="font-medium truncate">{user.name || 'Unknown User'}</div>
                                      <div className="text-sm text-gray-500 truncate">{user.email || 'No email'}</div>
                                    </div>
                                  </div>
                                  <Tag color={user.role === 'student' ? 'blue' : user.role === 'writer' ? 'green' : 'default'}>
                                    {user.role?.toUpperCase() || 'USER'}
                                  </Tag>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <CalendarOutlined className="mr-1" />
                                  Joined {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </List.Item>
                          )}
                        />
                        
                        {referralUsers.length > 5 && !showAllUsers && (
                          <div className="text-center mt-4">
                            <Button type="link" onClick={() => setShowAllUsers(true)}>
                              Show all {referralUsers.length} users
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <UserOutlined className="text-4xl text-gray-300 mb-3" />
                      <p className="text-gray-500">No users have signed up through this referral code yet.</p>
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          Share the referral link to start getting signups!
                        </p>
                        <div className="mt-2">
                          <Tag color="green" className="font-mono break-all">
                            https://www.thinqscribe.com/signup/ref/{influencer.referralCode}
                          </Tag>
                          <Button
                            size="small"
                            type="link"
                            icon={<CopyOutlined />}
                            onClick={() => copyReferralLink(influencer.referralCode)}
                          >
                            Copy Link
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </Col>

              {/* Performance Timeline */}
              <Col xs={24}>
                <Card 
                  title={<span className="text-sm sm:text-base">Performance Timeline</span>}
                  size={isMobile ? "small" : "default"}
                >
                  <Timeline size={isMobile ? "small" : "default"}>
                    <Timeline.Item color="green">
                      <div>
                        <Text strong className={isMobile ? "text-sm" : ""}>
                          Account Created
                        </Text>
                        <br />
                        <Text type="secondary" className={isMobile ? "text-xs" : ""}>
                          {formatDate(influencer.createdAt)}
                        </Text>
                      </div>
                    </Timeline.Item>
                    {referralUsers.length > 0 && (
                      <Timeline.Item color="blue">
                        <div>
                          <Text strong className={isMobile ? "text-sm" : ""}>
                            First Signup
                          </Text>
                          <br />
                          <Text type="secondary" className={isMobile ? "text-xs" : ""}>
                            {formatDate(referralUsers[referralUsers.length - 1]?.createdAt)}
                          </Text>
                          <br />
                          <Text type="secondary" className={isMobile ? "text-xs" : ""}>
                            {referralUsers[referralUsers.length - 1]?.name} ({referralUsers[referralUsers.length - 1]?.email})
                          </Text>
                        </div>
                      </Timeline.Item>
                    )}
                    {referralUsers.length > 1 && (
                      <Timeline.Item color="purple">
                        <div>
                          <Text strong className={isMobile ? "text-sm" : ""}>
                            Latest Signup
                          </Text>
                          <br />
                          <Text type="secondary" className={isMobile ? "text-xs" : ""}>
                            {formatDate(referralUsers[0]?.createdAt)}
                          </Text>
                          <br />
                          <Text type="secondary" className={isMobile ? "text-xs" : ""}>
                            {referralUsers[0]?.name} ({referralUsers[0]?.email})
                          </Text>
                        </div>
                      </Timeline.Item>
                    )}
                  </Timeline>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Mobile Delete Confirmation */}
        <div className="block sm:hidden">
          {showMobileActions && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
              <div className="bg-white w-full rounded-t-lg p-4">
                <div className="space-y-3">
                  <Popconfirm
                    title="Delete this influencer?"
                    description="This action cannot be undone."
                    onConfirm={handleDelete}
                    okText="Yes, Delete"
                    cancelText="Cancel"
                    placement="top"
                  >
                    <Button 
                      danger 
                      icon={<DeleteOutlined />}
                      block
                      size="large"
                    >
                      Delete Influencer
                    </Button>
                  </Popconfirm>
                  <Button 
                    block 
                    size="large"
                    onClick={() => setShowMobileActions(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfluencerDetails;