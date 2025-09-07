import React, { useState, useEffect } from 'react';
import { Layout, Table, Typography, Tag, Space, Card, Button, Spin } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import HeaderComponent from '../components/HeaderComponent';
import moment from 'moment';
import { DollarOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;

const PaymentHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/payments/history?role=${user.role}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setPayments(data.payments || []);
      } catch (error) {
        console.error('Failed to fetch payment history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPayments();
    }
  }, [user]);

  const columns = [
    {
      title: 'Payment ID',
      dataIndex: 'paymentId',
      key: 'paymentId',
      render: (text) => <Text copyable>{text}</Text>
    },
    {
      title: 'Date',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date) => moment(date).format('MMMM DD, YYYY HH:mm')
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          success: 'green',
          pending: 'gold',
          failed: 'red'
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Project',
      dataIndex: ['project', 'title'],
      key: 'project',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/projects/${record.project._id}`)}
        >
          {text}
        </Button>
      )
    },
    {
      title: user.role === 'student' ? 'Writer' : 'Student',
      dataIndex: ['otherParty', 'name'],
      key: 'otherParty'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => navigate(`/payments/${record.paymentId}`)}
          >
            View Details
          </Button>
          {record.status === 'success' && (
            <Button 
              size="small"
              onClick={() => window.open(record.receiptUrl, '_blank')}
            >
              Download Receipt
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <Layout className="min-h-screen">
      <HeaderComponent />
      <Content className="p-6">
        <Title level={2}>Payment History</Title>
        
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Text strong>Total Payments: </Text>
              <Text>{payments.length}</Text>
            </div>
            <div>
              <Text strong>Total Amount: </Text>
              <Text>
                ${payments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
              </Text>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={payments}
            rowKey="paymentId"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} payments`
            }}
          />
        )}
      </Content>
    </Layout>
  );
};

export default PaymentHistory; 