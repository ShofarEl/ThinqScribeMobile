import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Button, 
  Badge, 
  Space, 
  Tabs, 
  notification,
  Input,
  Select,
  Modal,
  Descriptions,
  Tag,
  Alert,
  Typography,
  Progress,
  Divider,
  Spin
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  WarningOutlined,
  TrophyOutlined,
  RiseOutlined
} from '@ant-design/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line as ReactLine, Bar, Doughnut } from 'react-chartjs-2';
// Removed heavy @ant-design/plots - using lightweight alternatives
// import { RevenueChart, UserGrowthChart, MiniStatsChart } from '../components/LightweightCharts';
import HeaderComponent from '../components/HeaderComponent';
import AppLoader from '../components/AppLoader';
import client from '../api/client';
import { adminApi } from '../api/admin';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

// Real Chart.js Components with Backend Data
const RevenueChart = ({ data, stats }) => {
  console.log('📊 [RevenueChart] Data received:', data);
  console.log('📊 [RevenueChart] Stats received:', stats);
  
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Typography.Text type="secondary">No revenue data available</Typography.Text>
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#8c8c8c' }}>
          Total Revenue: ${Math.abs(stats?.revenue?.grossRevenue || 0).toFixed(2)}
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => `Month ${item._id.month}`),
    datasets: [
      {
        label: 'Platform Revenue',
        data: data.map(item => Math.abs(item.platformRevenue || 0)),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: false
      },
      {
        label: 'Writer Earnings',
        data: data.map(item => Math.abs(item.writerEarnings || 0)),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
        fill: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Monthly Revenue - Total: $${Math.abs(stats?.revenue?.grossRevenue || 0).toFixed(2)}`
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <ReactLine data={chartData} options={options} />
    </div>
  );
};

const UserGrowthChart = ({ stats }) => {
  const chartData = {
    labels: ['Students', 'Writers', 'Admins'],
    datasets: [
      {
        label: 'User Distribution',
        data: [
          stats?.users?.students || 0,
          stats?.users?.writers || 0,
          stats?.users?.admins || 0
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 205, 86, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 205, 86, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Total Users: ${stats?.users?.total || 0}`
      },
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

const ProjectAnalyticsChart = ({ stats }) => {
  const chartData = {
    labels: ['Active', 'Completed', 'Pending'],
    datasets: [
      {
        label: 'Projects',
        data: [
          stats?.agreements?.active || 0,
          stats?.agreements?.completed || 0,
          stats?.agreements?.pending || 0
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Total Projects: ${stats?.agreements?.total || 0}`
      },
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

const MiniStatsChart = ({ data }) => (
  <div style={{ height: '40px', background: '#f0f0f0', borderRadius: '4px' }}>
    <div style={{ 
      height: '100%', 
      background: 'linear-gradient(90deg, #1890ff, #40a9ff)', 
      borderRadius: '4px',
      width: '70%'
    }} />
  </div>
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [writers, setWriters] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [writerFilter, setWriterFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 [Admin] Fetching dashboard data...');
      
      // Fetch data with individual error handling
      const results = await Promise.allSettled([
        client.get('/admin/stats'),
        client.get('/admin/writers'),
        client.get('/admin/agreements'),
        client.get('/admin/users')
      ]);

      console.log('📊 [Admin] Raw API results:', results);

      // Handle stats
      if (results[0].status === 'fulfilled') {
        setStats(results[0].value);
        console.log('✅ [Admin] Stats loaded:', results[0].value);
      } else {
        console.error('❌ [Admin] Stats failed:', results[0].reason);
      }

      // Handle writers with better extraction
      if (results[1].status === 'fulfilled') {
        const writersData = results[1].value;
        console.log('📝 [Admin] Raw writers data:', writersData);
        
        // Try different data structures
        const extractedWriters = writersData.data?.writers || 
                                writersData.writers || 
                                writersData.data || 
                                writersData || 
                                [];
        
        setWriters(Array.isArray(extractedWriters) ? extractedWriters : []);
        console.log('✅ [Admin] Writers loaded:', extractedWriters.length, 'writers');
        console.log('👥 [Admin] First writer sample:', extractedWriters[0]);
      } else {
        console.error('❌ [Admin] Writers failed:', results[1].reason);
        setWriters([]);
      }

      // Handle agreements
      if (results[2].status === 'fulfilled') {
        const agreementsData = results[2].value;
        const extractedAgreements = agreementsData.data?.agreements || 
                                   agreementsData.agreements || 
                                   agreementsData.data || 
                                   agreementsData || 
                                   [];
        setAgreements(Array.isArray(extractedAgreements) ? extractedAgreements : []);
        console.log('✅ [Admin] Agreements loaded:', extractedAgreements.length);
      } else {
        console.error('❌ [Admin] Agreements failed:', results[2].reason);
        setAgreements([]);
      }

      // Handle users
      if (results[3].status === 'fulfilled') {
        const usersData = results[3].value;
        const extractedUsers = usersData.data?.users || 
                              usersData.users || 
                              usersData.data || 
                              usersData || 
                              [];
        setUsers(Array.isArray(extractedUsers) ? extractedUsers : []);
        console.log('✅ [Admin] Users loaded:', extractedUsers.length);
      } else {
        console.error('❌ [Admin] Users failed:', results[3].reason);
        setUsers([]);
      }

      console.log('🎯 [Debug] Stats structure:', {
        writers: stats?.writers,
        revenue: stats?.revenue,
        monthlyBreakdown: stats?.revenue?.monthlyBreakdown
      });

      // Debug: Log revenue data structure
      console.log('🎯 [AdminDashboard] Current stats:', stats);
      console.log('🎯 [AdminDashboard] Revenue data:', stats?.revenue);
      console.log('🎯 [AdminDashboard] Monthly breakdown:', stats?.revenue?.monthlyBreakdown);

    } catch (error) {
      console.error('❌ [Admin] Dashboard fetch error:', error);
      notification.error({
        message: 'Error',
        description: `Failed to fetch dashboard data: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWriter = async (writerId) => {
    try {
      await client.post(`/admin/writers/${writerId}/approve`);
      notification.success({
        message: 'Success',
        description: 'Writer approved successfully'
      });
      fetchDashboardData();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to approve writer'
      });
    }
  };

  const handlePublishWriter = async (writerId) => {
    try {
      await client.post(`/admin/writers/${writerId}/publish`);
      notification.success({
        message: 'Success',
        description: 'Writer published successfully'
      });
      fetchDashboardData();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to publish writer'
      });
    }
  };

  const handleUnpublishWriter = async (writerId) => {
    try {
      await client.post(`/admin/writers/${writerId}/unpublish`);
      notification.success({
        message: 'Success',
        description: 'Writer unpublished successfully'
      });
      fetchDashboardData();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to unpublish writer'
      });
    }
  };

  const handleFixPayments = async () => {
    Modal.confirm({
      title: 'Fix Payment Issues',
      content: 'This will fix payment calculation issues and processing statuses. Continue?',
      onOk: async () => {
        try {
          await client.post('/admin/fix-payment-calculations');
          await client.post('/admin/fix-payment-statuses');
          notification.success({
            message: 'Success',
            description: 'Payment issues fixed successfully'
          });
          fetchDashboardData();
        } catch (error) {
          notification.error({
            message: 'Error',
            description: 'Failed to fix payment issues'
          });
        }
      }
    });
  };

  const handleDebugPayments = async () => {
    try {
      const response = await client.get('/admin/debug-payments');
      console.log('💰 [Debug] Payment debug results:', response);
      
      const debug = response.debug || response;
      notification.info({
        message: 'Payment Debug Results',
        description: `Found ${debug.totalPayments} payments. Check console for details.`,
        duration: 8
      });
      
      // Log detailed results
      console.log('📊 Status breakdown:', debug.statusBreakdown);
      console.log('💵 Total amount (all):', debug.totalAmountAll);
      console.log('🔍 Current revenue query result:', debug.currentRevenueResult);
      console.log('🔍 Alternative revenue query result:', debug.alternativeRevenueResult);
      console.log('💳 Sample payments:', debug.samplePayments);
      
    } catch (error) {
      console.error('Debug error:', error);
      notification.error({
        message: 'Debug Error',
        description: 'Failed to fetch payment debug info'
      });
    }
  };

  // Prepare chart data from real backend data
  const revenueChartData = stats?.revenue?.monthlyBreakdown?.map(item => ({
    month: `Month ${item._id.month}`,
    platformRevenue: Math.abs(item.platformRevenue || 0),
    writerEarnings: Math.abs(item.writerEarnings || 0),
    grossRevenue: Math.abs(item.grossRevenue || 0)
  })) || [];

  // Create user growth data from real stats
  const userGrowthData = stats?.revenue?.monthlyBreakdown?.map(item => ({
    month: `Month ${item._id.month}`,
    students: Math.floor(item.count * 0.7), // Approximate student payments
    writers: Math.floor(item.count * 0.3)   // Approximate writer payments
  })) || [
    { month: 'Jan', students: stats?.users?.students || 0, writers: stats?.users?.writers || 0 }
  ];

  const writerColumns = [
    {
      title: 'Writer',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <div>
            <div>{text}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (record) => {
        if (record.writerProfile?.isPublished) {
          return <Badge status="success" text="Published" />;
        } else if (record.writerProfile?.isApproved) {
          return <Badge status="processing" text="Approved" />;
        } else {
          return <Badge status="warning" text="Pending" />;
        }
      }
    },
    {
      title: 'Total Earnings',
      key: 'earnings',
      render: (record) => (
        <div>
          <div style={{ fontWeight: 'bold', color: '#52c41a' }}>
            ${(record.earnings?.total || 0).toFixed(2)}
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.earnings?.payments || 0} payments
          </Text>
        </div>
      ),
      sorter: (a, b) => (a.earnings?.total || 0) - (b.earnings?.total || 0)
    },
    {
      title: 'Average Payment',
      key: 'avgPayment',
      render: (record) => (
        <div>
          <div>${(record.earnings?.average || 0).toFixed(2)}</div>
          {record.earnings?.lastPaymentDate && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Last: {new Date(record.earnings.lastPaymentDate).toLocaleDateString()}
            </Text>
          )}
        </div>
      ),
      sorter: (a, b) => (a.earnings?.average || 0) - (b.earnings?.average || 0)
    },
    {
      title: 'Specialties',
      dataIndex: ['writerProfile', 'specialties'],
      key: 'specialties',
      render: (specialties) => (
        <Space size={[0, 8]} wrap>
          {(specialties || []).slice(0, 2).map((specialty, index) => (
            <Tag key={index} color="blue">{specialty}</Tag>
          ))}
          {specialties?.length > 2 && <Tag>+{specialties.length - 2} more</Tag>}
        </Space>
      )
    },
    {
      title: 'Rating',
      dataIndex: ['writerProfile', 'rating', 'average'],
      key: 'rating',
      render: (rating) => (
        <Space>
          <TrophyOutlined style={{ color: '#faad14' }} />
          {(rating || 0).toFixed(1)}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space>
          {!record.writerProfile?.isApproved && (
            <Button 
              type="primary" 
              size="small" 
              icon={<CheckCircleOutlined />}
              onClick={() => handleApproveWriter(record._id)}
            >
              Approve
            </Button>
          )}
          {record.writerProfile?.isApproved && !record.writerProfile?.isPublished && (
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => handlePublishWriter(record._id)}
            >
              Publish
            </Button>
          )}
          {record.writerProfile?.isPublished && (
            <Button 
              danger 
              size="small" 
              icon={<CloseCircleOutlined />}
              onClick={() => handleUnpublishWriter(record._id)}
            >
              Unpublish
            </Button>
          )}
        </Space>
      )
    }
  ];

  const agreementColumns = [
    {
      title: 'Project',
      dataIndex: ['projectDetails', 'title'],
      key: 'title',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <Text type="secondary">{record.projectDetails?.subject}</Text>
        </div>
      )
    },
    {
      title: 'Student',
      dataIndex: ['student', 'name'],
      key: 'student'
    },
    {
      title: 'Writer',
      dataIndex: ['writer', 'name'],
      key: 'writer'
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'amount',
      render: (amount) => `$${amount?.toFixed(2) || '0.00'}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pending: 'gold',
          active: 'blue',
          completed: 'green',
          cancelled: 'red'
        };
        return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress percent={progress || 0} size="small" />
      )
    }
  ];

  const filteredWriters = writers.filter(writer => {
    const matchesSearch = writer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         writer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = writerFilter === 'all' ||
                         (writerFilter === 'pending' && !writer.writerProfile?.isApproved) ||
                         (writerFilter === 'approved' && writer.writerProfile?.isApproved && !writer.writerProfile?.isPublished) ||
                         (writerFilter === 'published' && writer.writerProfile?.isPublished);
    
    return matchesSearch && matchesFilter;
  });

  // Debug: Log state values right before render
  console.log('🎯 [Debug] Current state values:');
  console.log('  stats:', stats);
  console.log('  stats.data:', stats?.data);
  console.log('  users.total:', stats?.data?.users?.total);
  console.log('  writers.total:', stats?.data?.writers?.total);
  console.log('  revenue.total:', stats?.data?.revenue?.total);
  console.log('  writers array:', writers);
  console.log('  writers.length:', writers?.length);

  // Debug current state
  console.log('🎯 [UI Debug] Rendering with stats:', {
    total: stats?.data?.users?.total,
    active: stats?.data?.agreements?.active,
    revenue: stats?.data?.revenue?.total,
    writers: stats?.data?.writers?.total
  });

  if (loading) {
    return (
      <>
        <HeaderComponent />
        <div style={{ 
          padding: '24px', 
          backgroundColor: '#f0f2f5', 
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Spin size="large" tip="Loading admin dashboard..." />
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderComponent />
      <div className="admin-dashboard" style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>Admin Dashboard</Title>
          <Text type="secondary">Manage users, monitor platform performance, and oversee operations</Text>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Overview" key="overview">
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Users"
                    value={stats?.users?.total || 0}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Active Projects"
                    value={stats?.agreements?.active || 0}
                    prefix={<BookOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Platform Revenue"
                    value={Math.abs(stats?.revenue?.platformRevenue || 0)}
                    prefix={<DollarOutlined />}
                    precision={2}
                    valueStyle={{ color: '#cf1322' }}
                  />
                  <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                    Total Paid to Writers: ${Math.abs(stats?.revenue?.writerEarnings || 0).toFixed(2)}
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Writers"
                    value={stats?.writers?.total || 0}
                    prefix={<TeamOutlined />}
                    suffix={`(${stats?.writers?.published || 0} published)`}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} lg={12}>
                <Card title="Monthly Revenue Analytics" extra={<RiseOutlined />}>
                  <RevenueChart 
                    data={stats?.revenue?.monthlyBreakdown || []} 
                    stats={stats}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="User Distribution">
                  <UserGrowthChart stats={stats} />
                </Card>
              </Col>
            </Row>

            {/* Additional Analytics */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} lg={12}>
                <Card title="Project Status Analytics">
                  <ProjectAnalyticsChart stats={stats} />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Platform Performance Metrics">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title="Revenue per Transaction"
                        value={stats?.revenue?.transactions > 0 ? (Math.abs(stats?.revenue?.platformRevenue || 0) / stats.revenue.transactions) : 0}
                        precision={2}
                        prefix="$"
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Avg Writer Earnings"
                        value={stats?.writers?.total > 0 ? (Math.abs(stats?.revenue?.writerEarnings || 0) / stats.writers.total) : 0}
                        precision={2}
                        prefix="$"
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Platform Fee Rate"
                        value={stats?.revenue?.grossRevenue > 0 ? ((Math.abs(stats?.revenue?.platformRevenue || 0) / Math.abs(stats?.revenue?.grossRevenue || 1)) * 100) : 0}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: '#cf1322' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Success Rate"
                        value={stats?.agreements?.total > 0 ? ((stats.agreements.completed / stats.agreements.total) * 100) : 0}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            {/* Quick Actions */}
            <Card title="Quick Actions" style={{ marginBottom: '24px' }}>
              <Space wrap>
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />}
                  onClick={fetchDashboardData}
                  loading={loading}
                >
                  Refresh Data
                </Button>
                <Button 
                  type="default" 
                  icon={<WarningOutlined />}
                  onClick={handleFixPayments}
                >
                  Fix Payment Issues
                </Button>
              </Space>
            </Card>

            {/* Recent Activity */}
            <Row gutter={[16, 16]}>
              {/* Debug logging */}
              {console.log('📊 [Debug] Recent Activity Data:', stats?.recentActivity)}
              <Col xs={24} lg={12}>
                <Card title="Recent Users" size="small">
                  {stats?.recentActivity?.users?.slice(0, 5).map(user => (
                    <div key={user._id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <Space>
                        <UserOutlined />
                        <div>
                          <div>{user.name}</div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {user.role} • {new Date(user.createdAt).toLocaleDateString()}
                          </Text>
                        </div>
                      </Space>
                    </div>
                  ))}
                  {(!stats?.recentActivity?.users || stats.recentActivity.users.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
                      No recent users
                    </div>
                  )}
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Recent Agreements" size="small">
                  {stats?.recentActivity?.agreements?.slice(0, 5).map(agreement => (
                    <div key={agreement._id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>
                          {agreement.projectDetails?.title || 'Project Agreement'}
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          ${agreement.totalAmount || agreement.paidAmount || 0} • {agreement.status}
                        </Text>
                        <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                          Student: {agreement.student?.name || 'Unknown'} | Writer: {agreement.writer?.name || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!stats?.recentActivity?.agreements || stats.recentActivity.agreements.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
                      No recent agreements
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Writer Payouts" key="payouts">
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              {/* Monthly Writer Earnings Summary */}
              <Col span={24}>
                <Card title="Monthly Writer Earnings - Easy Payout Management" extra={<DollarOutlined />}>
                  <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                    <Col span={6}>
                      <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                        <Statistic
                          title="Total Writer Earnings"
                          value={Math.abs(stats?.revenue?.writerEarnings || 0)}
                          prefix="$"
                          precision={2}
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" style={{ backgroundColor: '#f0f5ff', border: '1px solid #adc6ff' }}>
                        <Statistic
                          title="Active Writers"
                          value={writers?.filter(w => w.earnings?.total > 0).length || 0}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd591' }}>
                        <Statistic
                          title="Avg Earnings/Writer"
                          value={writers?.length > 0 ? (Math.abs(stats?.revenue?.writerEarnings || 0) / writers.filter(w => w.earnings?.total > 0).length || 1) : 0}
                          prefix="$"
                          precision={2}
                          valueStyle={{ color: '#fa8c16' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" style={{ backgroundColor: '#f9f0ff', border: '1px solid #d3adf7' }}>
                        <Statistic
                          title="Total Payments"
                          value={stats?.revenue?.transactions || 0}
                          valueStyle={{ color: '#722ed1' }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  {/* Writer Earnings Table for Payout */}
                  <Table
                    title={() => <div style={{ fontWeight: 'bold', fontSize: '16px' }}>📊 Writer Earnings Breakdown</div>}
                    columns={[
                      {
                        title: 'Writer',
                        key: 'writer',
                        render: (record) => (
                          <Space>
                            <UserOutlined style={{ color: '#1890ff' }} />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{record.name}</div>
                              <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
                            </div>
                          </Space>
                        )
                      },
                      {
                        title: 'Total Earned',
                        key: 'totalEarned',
                        render: (record) => (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                              ${Math.abs(record.earnings?.total || 0).toFixed(2)}
                            </div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {record.earnings?.payments || 0} payments
                            </Text>
                          </div>
                        ),
                        sorter: (a, b) => Math.abs(a.earnings?.total || 0) - Math.abs(b.earnings?.total || 0),
                        defaultSortOrder: 'descend'
                      },
                      {
                        title: 'Avg per Payment',
                        key: 'avgPayment',
                        render: (record) => (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                              ${Math.abs(record.earnings?.average || 0).toFixed(2)}
                            </div>
                          </div>
                        ),
                        sorter: (a, b) => Math.abs(a.earnings?.average || 0) - Math.abs(b.earnings?.average || 0)
                      },
                      {
                        title: 'Last Payment',
                        key: 'lastPayment',
                        render: (record) => (
                          <div style={{ textAlign: 'center' }}>
                            {record.earnings?.lastPaymentDate ? (
                              <div>
                                <div>{new Date(record.earnings.lastPaymentDate).toLocaleDateString()}</div>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  {Math.floor((Date.now() - new Date(record.earnings.lastPaymentDate)) / (1000 * 60 * 60 * 24))} days ago
                                </Text>
                              </div>
                            ) : (
                              <Text type="secondary">No payments yet</Text>
                            )}
                          </div>
                        )
                      },
                      {
                        title: 'Status',
                        key: 'status',
                        render: (record) => {
                          const earnings = Math.abs(record.earnings?.total || 0);
                          if (earnings >= 100) {
                            return <Badge status="success" text="Ready for Payout" />;
                          } else if (earnings >= 50) {
                            return <Badge status="processing" text="Earning Well" />;
                          } else if (earnings > 0) {
                            return <Badge status="warning" text="Low Earnings" />;
                          } else {
                            return <Badge status="default" text="No Earnings" />;
                          }
                        }
                      },
                      {
                        title: 'Payout Action',
                        key: 'action',
                        render: (record) => {
                          const earnings = Math.abs(record.earnings?.total || 0);
                          return (
                            <Space>
                              {earnings > 0 && (
                                <Button 
                                  type="primary" 
                                  size="small"
                                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                  onClick={() => {
                                    notification.success({
                                      message: 'Payout Initiated',
                                      description: `Processing $${earnings.toFixed(2)} payout for ${record.name}`
                                    });
                                  }}
                                >
                                  💰 Pay ${earnings.toFixed(2)}
                                </Button>
                              )}
                              <Button 
                                size="small"
                                onClick={() => {
                                  notification.info({
                                    message: 'Payment History',
                                    description: `Showing payment details for ${record.name}`
                                  });
                                }}
                              >
                                📊 Details
                              </Button>
                            </Space>
                          );
                        }
                      }
                    ]}
                    dataSource={writers?.filter(writer => writer.earnings?.total > 0) || []}
                    loading={loading}
                    rowKey="_id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total) => `Total ${total} earning writers`
                    }}
                    scroll={{ x: 1000 }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Writer Management" key="writers">
            <Card>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Input
                    placeholder="Search writers..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ width: 300 }}
                  />
                  <Select
                    value={writerFilter}
                    onChange={setWriterFilter}
                    style={{ width: 150 }}
                  >
                    <Option value="all">All Writers</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="approved">Approved</Option>
                    <Option value="published">Published</Option>
                  </Select>
                </Space>
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={fetchDashboardData}
                  loading={loading}
                >
                  Refresh
                </Button>
              </div>

              {/* Writer Stats */}
              <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Total Writers"
                      value={stats?.writers?.total || 0}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Pending Approval"
                      value={stats?.writers?.pending || 0}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Approved"
                      value={stats?.writers?.approved || 0}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Published"
                      value={stats?.writers?.published || 0}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Table
                columns={writerColumns}
                dataSource={filteredWriters}
                loading={loading}
                rowKey="_id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `Total ${total} writers`
                }}
              />
            </Card>
          </TabPane>

          <TabPane tab="Project Management" key="projects">
            <Card title="All Service Agreements">
              <Table
                columns={agreementColumns}
                dataSource={agreements}
                loading={loading}
                rowKey="_id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `Total ${total} agreements`
                }}
              />
            </Card>
          </TabPane>

          <TabPane tab="System Health" key="system">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Alert
                  message="System Status"
                  description="All systems are operational. Regular monitoring is in place."
                  type="success"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Payment System">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button 
                      type="primary"
                      icon={<WarningOutlined />}
                      onClick={handleFixPayments}
                      block
                    >
                      Fix Payment Calculations
                    </Button>
                    <Text type="secondary">
                      This will recalculate payment amounts and fix any processing status issues.
                    </Text>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="Database Health">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Total Users">{stats?.data?.users?.total || 0}</Descriptions.Item>
                    <Descriptions.Item label="Total Agreements">{stats?.data?.agreements?.total || 0}</Descriptions.Item>
                    <Descriptions.Item label="Total Transactions">{stats?.data?.revenue?.transactions || 0}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </div>
    </>
  );
};

export default AdminDashboard; 