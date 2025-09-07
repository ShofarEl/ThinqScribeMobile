import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Result, Button, Card, Typography, Spin } from 'antd';
import { CloseCircleFilled, LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNotifications } from '../context/NotificationContext';
import client from '../api/client';

const { Title, Text, Paragraph } = Typography;

const PaymentFailed = () => {
  const { agreementId } = useParams();
  const navigate = useNavigate();
  const { socket } = useNotifications();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const response = await client.get(`/agreements/${agreementId}`);
        setAgreement(response);
      } catch (error) {
        console.error('Error fetching agreement:', error);
        setError(error.response?.data?.message || 'Failed to load agreement details');
      } finally {
        setLoading(false);
      }
    };

    fetchAgreement();
  }, [agreementId]);

  useEffect(() => {
    if (socket && agreement) {
      socket.emit('paymentFailed', {
        agreementId,
        error: 'Payment processing failed'
      });
    }
  }, [socket, agreement, agreementId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Result
          status="error"
          icon={<CloseCircleFilled className="text-red-500 text-6xl" />}
          title={
            <Title level={2} className="text-red-700 mb-4">
              Payment Failed
            </Title>
          }
          subTitle={
            <Text className="text-gray-600 text-lg">
              We were unable to process your payment. Please try again or contact support if the problem persists.
            </Text>
          }
        />

        <Card className="mt-8 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationCircleOutlined className="text-red-500 mt-1 mr-3" />
                <div>
                  <Text strong className="text-red-700 block mb-1">
                    Common reasons for payment failure:
                  </Text>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Insufficient funds</li>
                    <li>Card declined by issuer</li>
                    <li>Incorrect card information</li>
                    <li>Network or connection issues</li>
                  </ul>
                </div>
              </div>
            </div>

            {agreement && (
              <div className="space-y-4">
                <Paragraph>
                  <Text type="secondary">Attempted payment for:</Text>
                  <div className="text-lg font-medium mt-1">
                    {agreement.projectDetails?.title}
                  </div>
                </Paragraph>
                <div className="flex justify-between items-center">
                  <Text strong>Amount</Text>
                  <Text strong className="text-xl">
                    ${agreement.totalAmount?.toFixed(2)}
                  </Text>
                </div>
              </div>
            )}

            <div className="space-y-4 mt-8">
              <Button 
                type="primary" 
                danger
                size="large"
                block
                onClick={() => navigate(`/payment/${agreementId}`)}
              >
                Try Payment Again
              </Button>
              
              <div className="flex justify-between gap-4">
                <Link to={`/agreements/${agreementId}`} className="flex-1">
                  <Button size="large" block>
                    View Agreement
                  </Button>
                </Link>
                <Button 
                  size="large" 
                  onClick={() => navigate('/support')}
                  className="flex-1"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentFailed; 