import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  message, 
  Popconfirm,
  Tag,
  Statistic,
  Row,
  Col,
  Space,
  Tooltip,
  Badge,
  Alert,
  Drawer,
  List,
  Avatar,
  Divider,
  Typography,
  Collapse
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  UserOutlined,
  DollarOutlined,
  TrophyOutlined,
  LinkOutlined,
  CopyOutlined,
  ReloadOutlined,
  MenuOutlined,
  MoreOutlined,
  TeamOutlined,
  MailOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { influencerApi } from '../api/influencer.js';
import HeaderComponent from '../components/HeaderComponent';

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;
const { Panel } = Collapse;

const InfluencerDashboard = () => {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [referralDetailsModal, setReferralDetailsModal] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [referralUsers, setReferralUsers] = useState([]);
  const [loadingReferralUsers, setLoadingReferralUsers] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchInfluencers();
    fetchAnalytics();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchInfluencers = async () => {
    setLoading(true);
    try {
      console.log('Fetching influencers from dashboard...');
      const response = await influencerApi.getInfluencers();
      console.log('Influencers response:', response);
      
      const influencerData = response.data || response || [];
      setInfluencers(influencerData);
      
      if (influencerData.length === 0) {
        message.info('No influencers found. Create your first influencer!');
      }
    } catch (error) {
      message.error(`Failed to fetch influencers: ${error.message}`);
      console.error('Error fetching influencers:', error);
      setInfluencers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      console.log('Fetching analytics...');
      const response = await influencerApi.getInfluencerAnalytics();
      console.log('Analytics response:', response);
      setAnalytics(response.data || response);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      message.warning('Failed to load analytics data');
    }
  };

  // Fetch referral users for a specific influencer
  const fetchReferralUsers = async (influencerId) => {
    setLoadingReferralUsers(true);
    try {
      console.log('Fetching referral users for influencer:', influencerId);
      const response = await influencerApi.getInfluencerDashboard(influencerId);
      console.log('Referral users response:', response);
      
      const data = response.data || response;
      setReferralUsers(data.referredUsers || []);
      setSelectedInfluencer(data.influencer || null);
    } catch (error) {
      console.error('Error fetching referral users:', error);
      message.error('Failed to load referral users');
      setReferralUsers([]);
    } finally {
      setLoadingReferralUsers(false);
    }
  };

  const handleViewReferralUsers = async (influencer) => {
    setReferralDetailsModal(true);
    setSelectedInfluencer(influencer);
    await fetchReferralUsers(influencer._id);
  };

  const handleCreate = () => {
    setEditingInfluencer(null);
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
      commission: 10,
      followers: 0
    });
    setModalVisible(true);
  };

  const handleEdit = (influencer) => {
    setEditingInfluencer(influencer);
    form.setFieldsValue({
      name: influencer.name,
      email: influencer.email,
      referralCode: influencer.referralCode,
      platform: influencer.platform,
      followers: influencer.followers,
      commission: influencer.commission,
      notes: influencer.notes,
      isActive: influencer.isActive
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await influencerApi.deleteInfluencer(id);
      message.success('Influencer deleted successfully');
      fetchInfluencers();
      fetchAnalytics();
    } catch (error) {
      message.error(`Failed to delete influencer: ${error.message}`);
    }
  };

  const handleSubmit = async (values) => {
    try {
      console.log('Submitting influencer data:', values);
      
      if (editingInfluencer) {
        await influencerApi.updateInfluencer(editingInfluencer._id, values);
        message.success('Influencer updated successfully');
      } else {
        await influencerApi.createInfluencer(values);
        message.success('Influencer created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      fetchInfluencers();
      fetchAnalytics();
    } catch (error) {
      console.error('Error saving influencer:', error);
      message.error(`Failed to save influencer: ${error.message}`);
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

  // Mobile Card Component for Influencers with referral users preview
  const InfluencerCard = ({ influencer }) => (
    <Card 
      className="mb-4 shadow-sm hover:shadow-md transition-shadow"
      size="small"
    >
      <div className="space-y-3">
        {/* Header with name and status */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base truncate">{influencer.name}</div>
            <div className="text-sm text-gray-500 truncate">{influencer.email}</div>
          </div>
          <Badge 
            status={influencer.isActive ? 'success' : 'default'} 
            text={influencer.isActive ? 'Active' : 'Inactive'} 
          />
        </div>
        
        {/* Platform and followers */}
        <div className="flex items-center gap-2">
          <Tag color={
            influencer.platform === 'youtube' ? 'red' :
            influencer.platform === 'instagram' ? 'pink' :
            influencer.platform === 'tiktok' ? 'black' :
            influencer.platform === 'twitter' ? 'blue' :
            influencer.platform === 'linkedin' ? 'blue' : 'default'
          }>
            {influencer.platform ? influencer.platform.toUpperCase() : 'OTHER'}
          </Tag>
          <span className="text-sm text-gray-600">
            {(influencer.followers || 0).toLocaleString()} followers
          </span>
        </div>

        {/* Referral code */}
        <div className="flex items-center gap-2">
          <Tag color="green" className="font-mono text-sm">
            {influencer.referralCode}
          </Tag>
          <Button 
            type="text" 
            size="small" 
            icon={<CopyOutlined />}
            onClick={() => copyReferralLink(influencer.referralCode)}
          />
        </div>

        {/* Stats */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-center">
            <div className="text-xl font-semibold text-blue-600">
              {influencer.stats?.totalSignups || 0}
            </div>
            <div className="text-sm text-gray-500">Total Signups</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-1">
          <Button 
            type="text" 
            size="small"
            icon={<TeamOutlined />}
            onClick={() => handleViewReferralUsers(influencer)}
            title="View Referral Users"
          />
          <Button 
            type="text" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/admin/influencers/${influencer._id}`, '_blank')}
          />
          <Button 
            type="text" 
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(influencer)}
          />
          <Popconfirm
            title="Delete this influencer?"
            onConfirm={() => handleDelete(influencer._id)}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <Button 
              type="text" 
              size="small"
              danger 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </div>
      </div>
    </Card>
  );

  // Desktop table columns with referral users
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
        </div>
      )
    },
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform) => (
        <Tag color={
          platform === 'youtube' ? 'red' :
          platform === 'instagram' ? 'pink' :
          platform === 'tiktok' ? 'black' :
          platform === 'twitter' ? 'blue' :
          platform === 'linkedin' ? 'blue' : 'default'
        }>
          {platform ? platform.toUpperCase() : 'OTHER'}
        </Tag>
      )
    },
    {
      title: 'Referral Code',
      dataIndex: 'referralCode',
      key: 'referralCode',
      render: (code) => (
        <Space>
          <Tag color="green" style={{ fontFamily: 'monospace', fontSize: '14px' }}>
            {code}
          </Tag>
          <Tooltip title="Copy referral link">
            <Button 
              type="text" 
              size="small" 
              icon={<CopyOutlined />}
              onClick={() => copyReferralLink(code)}
            />
          </Tooltip>
        </Space>
      )
    },
    {
      title: 'Followers',
      dataIndex: 'followers',
      key: 'followers',
      render: (followers) => (
        <span>{followers?.toLocaleString() || 0}</span>
      )
    },
    {
      title: 'Stats',
      key: 'stats',
      render: (_, record) => (
        <div>
          <div>Signups: <strong>{record.stats?.totalSignups || 0}</strong></div>
          <div>Revenue: <strong>${record.stats?.totalRevenue || 0}</strong></div>
          <div>Commission: <strong>${record.stats?.totalCommission || 0}</strong></div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Badge 
          status={isActive ? 'success' : 'default'} 
          text={isActive ? 'Active' : 'Inactive'} 
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Referral Users">
            <Button 
              type="text" 
              icon={<TeamOutlined />}
              onClick={() => handleViewReferralUsers(record)}
            />
          </Tooltip>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => window.open(`/admin/influencers/${record._id}`, '_blank')}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this influencer?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Columns for referral users table
  const referralUsersColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div className="flex items-center">
          <Avatar icon={<UserOutlined />} size="small" className="mr-2" />
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                Influencer Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage influencer referral codes and track their performance
              </p>
            </div>
            
            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex gap-2">
              <Button 
                type="default"
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchInfluencers();
                  fetchAnalytics();
                }}
                className="flex items-center"
              >
                Refresh
              </Button>
              <button 
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <PlusOutlined />
                Add Influencer
              </button>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex sm:hidden gap-2">
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchInfluencers();
                  fetchAnalytics();
                }}
                className="flex-1"
              />
              <button 
                onClick={handleCreate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
              >
                <PlusOutlined />
                Add Influencer
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Overview - Responsive Grid */}
        {analytics?.overview && (
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto lg:max-w-none">
              <Card className="text-center">
                <Statistic
                  title={<span className="text-xs sm:text-sm">Total Influencers</span>}
                  value={analytics.overview.totalInfluencers || 0}
                  prefix={<UserOutlined className="text-blue-500" />}
                  valueStyle={{ fontSize: isMobile ? '18px' : '24px' }}
                />
              </Card>
              <Card className="text-center">
                <Statistic
                  title={<span className="text-xs sm:text-sm">Total Signups</span>}
                  value={analytics.overview.totalSignups || 0}
                  prefix={<UserOutlined className="text-green-500" />}
                  valueStyle={{ fontSize: isMobile ? '18px' : '24px' }}
                />
              </Card>
            </div>
          </div>
        )}

        {/* Top Performers - Mobile Responsive */}
        {analytics?.topInfluencers && analytics.topInfluencers.length > 0 && (
          <Card title="Top Performing Influencers" className="mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {analytics.topInfluencers.slice(0, 3).map((influencer, index) => (
                <Card size="small" key={influencer._id} className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{influencer.name}</div>
                      <div className="text-sm text-gray-600">
                        {influencer.stats?.totalSignups || 0} signups
                      </div>
                    </div>
                    <TrophyOutlined 
                      className={`text-2xl ${
                        index === 0 ? 'text-yellow-500' : 
                        index === 1 ? 'text-gray-400' : 'text-yellow-600'
                      }`}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* No Data State */}
        {influencers.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col items-center text-center">
              <UserOutlined className="text-3xl sm:text-4xl text-blue-400 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Influencers Found</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">Start by creating your first influencer to begin tracking referrals.</p>
              <button 
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg flex items-center gap-2 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                <PlusOutlined />
                Create Your First Influencer
              </button>
            </div>
          </div>
        )}

        {/* Influencers List - Mobile Cards / Desktop Table */}
        {influencers.length > 0 && (
          <>
            {/* Mobile View - Cards */}
            <div className="block sm:hidden">
              <div className="flex justify-between items-center mb-4">
                <Title level={4} className="!mb-0">
                  Influencers ({influencers.length})
                </Title>
                <Button 
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  Add
                </Button>
              </div>
              
              {loading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <Card key={i} loading={true} />
                  ))}
                </div>
              ) : (
                <div>
                  {influencers.map(influencer => (
                    <InfluencerCard key={influencer._id} influencer={influencer} />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden sm:block">
              <Card
                title={
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      Influencers ({influencers.length})
                    </span>
                    <button 
                      onClick={handleCreate}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center gap-2 transition-colors shadow-sm hover:shadow-md text-sm"
                    >
                      <PlusOutlined />
                      Add New
                    </button>
                  </div>
                }
                className="shadow-sm"
              >
                <Table
                  columns={columns}
                  dataSource={influencers}
                  rowKey="_id"
                  loading={loading}
                  scroll={{ x: 800 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} of ${total} influencers`,
                    responsive: true
                  }}
                />
              </Card>
            </div>
          </>
        )}

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-4 z-50 sm:hidden">
          <button 
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          >
            <PlusOutlined className="text-xl" />
          </button>
        </div>

        {/* Create/Edit Modal - Mobile Responsive */}
        <Modal
          title={editingInfluencer ? 'Edit Influencer' : 'Add New Influencer'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={isMobile ? '95%' : 600}
          centered
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="pt-4"
          >
            <Row gutter={isMobile ? 8 : 16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[{ required: true, message: 'Please enter name' }]}
                >
                  <Input placeholder="Enter influencer name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter valid email' }
                  ]}
                >
                  <Input placeholder="influencer@example.com" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={isMobile ? 8 : 16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="referralCode"
                  label="Referral Code"
                  rules={[
                    { required: true, message: 'Please enter referral code' },
                    { pattern: /^[A-Z]{5}$/, message: 'Must be exactly 5 uppercase letters' }
                  ]}
                >
                  <Input 
                    maxLength={5}
                    style={{ textTransform: 'uppercase' }}
                    placeholder="ABCDE"
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="platform"
                  label="Platform"
                  rules={[{ required: true, message: 'Please select platform' }]}
                >
                  <Select placeholder="Select platform">
                    <Option value="youtube">YouTube</Option>
                    <Option value="instagram">Instagram</Option>
                    <Option value="tiktok">TikTok</Option>
                    <Option value="twitter">Twitter</Option>
                    <Option value="linkedin">LinkedIn</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={isMobile ? 8 : 16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="followers"
                  label="Followers"
                  rules={[{ required: true, message: 'Please enter follower count' }]}
                >
                  <InputNumber 
                    min={0}
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="0"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="commission"
                  label="Commission (%)"
                  rules={[{ required: true, message: 'Please enter commission' }]}
                >
                  <InputNumber 
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                    formatter={value => `${value}%`}
                    parser={value => value.replace('%', '')}
                    placeholder="10"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="notes"
              label="Notes"
            >
              <TextArea rows={3} placeholder="Optional notes about this influencer..." />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Status"
              initialValue={true}
            >
              <Select>
                <Option value={true}>Active</Option>
                <Option value={false}>Inactive</Option>
              </Select>
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  type="submit"
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 sm:py-2 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading && <span className="animate-spin">⏳</span>}
                  {editingInfluencer ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalVisible(false);
                    form.resetFields();
                  }}
                  className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 sm:py-2 px-6 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* Referral Users Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <TeamOutlined />
              <span>Referral Users - {selectedInfluencer?.name}</span>
            </div>
          }
          open={referralDetailsModal}
          onCancel={() => {
            setReferralDetailsModal(false);
            setSelectedInfluencer(null);
            setReferralUsers([]);
          }}
          footer={null}
          width={isMobile ? '95%' : 800}
          centered
        >
          <div className="pt-4">
            {/* Influencer Summary */}
            {selectedInfluencer && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedInfluencer.name}</h3>
                    <p className="text-gray-600">{selectedInfluencer.email}</p>
                  </div>
                  <Tag color="green" className="font-mono text-sm">
                    {selectedInfluencer.referralCode}
                  </Tag>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedInfluencer.stats?.totalSignups || 0}
                    </div>
                    <div className="text-sm text-gray-500">Total Signups</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      ${selectedInfluencer.stats?.totalRevenue || 0}
                    </div>
                    <div className="text-sm text-gray-500">Revenue</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      ${selectedInfluencer.stats?.totalCommission || 0}
                    </div>
                    <div className="text-sm text-gray-500">Commission</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedInfluencer.followers?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-gray-500">Followers</div>
                  </div>
                </div>
              </div>
            )}

            {/* Referral Users List */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MailOutlined />
                Referred Users ({referralUsers.length})
              </h4>
              
              {loadingReferralUsers ? (
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
                      dataSource={referralUsers}
                      renderItem={(user) => (
                        <List.Item className="px-0">
                          <div className="w-full p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center flex-1 min-w-0">
                                <Avatar icon={<UserOutlined />} size="small" className="mr-3" />
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium truncate">{user.name}</div>
                                  <div className="text-sm text-gray-500 truncate">{user.email}</div>
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
                      <Tag color="green" className="font-mono">
                        https://www.thinqscribe.com/signup/ref/{selectedInfluencer?.referralCode}
                      </Tag>
                      <Button
                        size="small"
                        type="link"
                        icon={<CopyOutlined />}
                        onClick={() => copyReferralLink(selectedInfluencer?.referralCode)}
                      >
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Export Options */}
            {referralUsers.length > 0 && (
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => {
                    const csvContent = [
                      ['Name', 'Email', 'Role', 'Signup Date'],
                      ...referralUsers.map(user => [
                        user.name,
                        user.email,
                        user.role || 'user',
                        new Date(user.createdAt).toLocaleDateString()
                      ])
                    ].map(row => row.join(',')).join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.setAttribute('hidden', '');
                    a.setAttribute('href', url);
                    a.setAttribute('download', `${selectedInfluencer?.name}-referrals.csv`);
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    message.success('CSV exported successfully');
                  }}
                >
                  Export CSV
                </Button>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default InfluencerDashboard;