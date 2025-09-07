import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Avatar, 
  Spin, 
  Alert, 
  Button, 
  Row, 
  Col, 
  Typography, 
  Rate, 
  Tag, 
  Divider,
  Statistic,
  Layout,
  Badge
} from 'antd';
import { 
  MessageOutlined, 
  StarOutlined, 
  BookOutlined, 
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  FireOutlined,
  ThunderboltOutlined,
  ArrowLeftOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import HeaderComponent from '../components/HeaderComponent';
import { startChat } from '../api/chat';
import { getRecommendedWriters } from '../api/user';
import { useNotifications } from '../context/NotificationContext';
import { useWriterStore } from '../store/writerStore';
import './WriterProfile.css';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const WriterProfile = () => {
  const { writerId } = useParams();
  const navigate = useNavigate();
  const { socket } = useNotifications();
  const { processWriterData } = useWriterStore();
  const [writer, setWriter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate fallback avatar URL
  const getFallbackAvatar = (name) => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${name || 'Writer'}&backgroundColor=015382&textColor=ffffff`;
  };

  useEffect(() => {
    const fetchWriterProfile = async () => {
      try {
        // Fetch from the recommended writers API and process with Zustand store
        const writersData = await getRecommendedWriters();
        const processedWriters = processWriterData(writersData);
        const foundWriter = processedWriters.find(w => w._id === writerId);
        
        if (!foundWriter) {
          throw new Error('Writer not found');
        }
        
        setWriter(foundWriter);
      } catch (err) {
        setError(err.message || 'Failed to load writer profile');
      } finally {
        setLoading(false);
      }
    };

    if (writerId) {
      fetchWriterProfile();
    }
  }, [writerId, processWriterData]);

  // Socket listener for real-time writer profile updates
  useEffect(() => {
    if (!socket || !writer) return;

    const handleWriterProfileUpdate = (data) => {
      if (data.writerId === writer._id) {
        setWriter(prevWriter => ({
          ...prevWriter,
          name: data.updatedFields.name || prevWriter.name,
          avatar: data.updatedFields.avatar || prevWriter.avatar,
          writerProfile: {
            ...prevWriter.writerProfile,
            bio: data.updatedFields.bio !== undefined ? data.updatedFields.bio : prevWriter.writerProfile?.bio,
            specialties: data.updatedFields.specialties !== undefined ? data.updatedFields.specialties : prevWriter.writerProfile?.specialties,
            responseTime: data.updatedFields.responseTime !== undefined ? data.updatedFields.responseTime : prevWriter.writerProfile?.responseTime
          }
        }));
      }
    };

    socket.on('writerProfileUpdated', handleWriterProfileUpdate);

    return () => {
      socket.off('writerProfileUpdated', handleWriterProfileUpdate);
    };
  }, [socket, writer]);

  const handleStartChat = async () => {
    if (!writer) return;
    
    setChatLoading(true);
    try {
      const chat = await startChat(writer._id);
      if (chat && chat._id) {
        navigate(`/chat/student/${chat._id}`);
      }
    } catch (err) {
      console.error('Error starting chat:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/writers');
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <HeaderComponent />
        <Content style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh'
        }}>
          <Card style={{ 
            borderRadius: '20px', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            textAlign: 'center',
            padding: '40px'
          }}>
            <Spin 
              size="large" 
              indicator={<ThunderboltOutlined style={{ fontSize: '48px', color: '#1e3a8a' }} spin />}
            />
            <div style={{ marginTop: '20px', fontSize: '18px', color: '#6b7280', fontWeight: '500' }}>
              Loading writer profile...
            </div>
          </Card>
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <HeaderComponent />
        <Content style={{ padding: '40px 20px' }}>
          <div style={{ maxWidth: '600px', margin: '40px auto' }}>
            <Alert
              message="Unable to Load Writer Profile"
              description={error}
              type="error"
              showIcon
              style={{ 
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(220, 38, 38, 0.1)',
                marginBottom: '20px'
              }}
            />
            <Button 
              type="primary" 
              onClick={handleGoBack}
              icon={<ArrowLeftOutlined />}
              style={{
                background: 'linear-gradient(135deg, #015382 0%, #014361 100%)',
                border: 'none',
                borderRadius: '12px',
                height: '48px',
                paddingInline: '32px'
              }}
            >
              Back to Writers
            </Button>
          </div>
        </Content>
      </Layout>
    );
  }

  if (!writer) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <HeaderComponent />
        <Content style={{ padding: '40px 20px' }}>
          <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
            <Title level={3}>Writer Not Found</Title>
            <Button 
              type="primary" 
              onClick={handleGoBack}
              icon={<ArrowLeftOutlined />}
            >
              Back to Writers
            </Button>
          </div>
        </Content>
      </Layout>
    );
  }

  const responseTimeColor = writer.responseTime <= 4 ? '#10b981' : 
                           writer.responseTime <= 24 ? '#3b82f6' : '#f59e0b';

  const responseTimeText = writer.responseTime <= 1 ? '1 hour' :
                          writer.responseTime <= 4 ? `${writer.responseTime} hours` :
                          writer.responseTime <= 24 ? `${writer.responseTime} hours` :
                          writer.responseTime <= 48 ? '2 days' : '3+ days';

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <HeaderComponent />
      <Content>
        {/* Back Button */}
        <div style={{ padding: '20px 0', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <Button 
              type="text" 
              onClick={handleGoBack}
              icon={<ArrowLeftOutlined />}
              style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#64748b',
                padding: '8px 16px',
                height: 'auto'
              }}
            >
              Back to Writers
            </Button>
          </div>
        </div>

        {/* Profile Content */}
        <div style={{ padding: '20px 0 40px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
            <Row gutter={[16, 24]}>
              {/* Left Column - Profile Card */}
              <Col xs={24} md={24} lg={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card
                    className="writer-profile-card"
                    style={{
                      borderRadius: '16px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden',
                      position: windowWidth >= 992 ? 'sticky' : 'static',
                      top: windowWidth >= 992 ? '100px' : 'auto'
                    }}
                  >
                    {/* Profile Header */}
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <div style={{ position: 'relative', marginBottom: '20px' }}>
                        {writer.isOnline && (
                          <Badge 
                            status="success" 
                            style={{
                              position: 'absolute',
                              top: '5px',
                              right: '5px',
                              zIndex: 1
                            }}
                          />
                        )}
                        <Avatar
                          size={windowWidth < 768 ? 100 : 120}
                          src={writer.avatar || getFallbackAvatar(writer.name)}
                          style={{
                            backgroundColor: '#015382',
                            border: '4px solid white',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                          }}
                        />
                        {writer.writerProfile?.verified && (
                          <div style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '50%',
                            transform: 'translateX(50%)',
                            backgroundColor: '#10b981',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px solid white'
                          }}>
                            <CheckCircleOutlined style={{ color: 'white', fontSize: '16px' }} />
                          </div>
                        )}
                      </div>

                      <Title level={2} style={{ 
                        margin: '0 0 8px 0', 
                        color: '#1e293b',
                        fontSize: windowWidth < 768 ? '20px' : '24px'
                      }}>
                        {writer.name}
                      </Title>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Rate 
                          disabled 
                          value={writer.writerProfile?.rating?.average || 0} 
                          style={{ fontSize: '18px' }}
                        />
                        <Text style={{ fontSize: '16px', color: '#64748b', fontWeight: '500' }}>
                          ({writer.writerProfile?.rating?.average ? writer.writerProfile.rating.average.toFixed(1) : 'New'})
                        </Text>
                      </div>

                      <Text style={{ fontSize: '14px', color: '#64748b' }}>
                        {writer.writerProfile?.rating?.count || 0} reviews • {writer.writerProfile?.completedProjects > 0 ? `${writer.writerProfile.completedProjects}+ projects` : 'New writer'}
                      </Text>
                    </div>

                    <Divider />

                    {/* Quick Stats */}
                    <Row gutter={[12, 12]} style={{ marginBottom: '20px' }}>
                      <Col span={12}>
                        <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
                            <TrophyOutlined style={{ color: '#f59e0b', fontSize: '16px' }} />
                            <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Projects</Text>
                          </div>
                          <Text style={{ color: '#015382', fontSize: '18px', fontWeight: '700', display: 'block' }}>
                            {writer.writerProfile?.completedProjects || 0}
                          </Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
                            <ClockCircleOutlined style={{ color: responseTimeColor, fontSize: '16px' }} />
                            <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Response</Text>
                          </div>
                          <Text style={{ color: responseTimeColor, fontSize: '14px', fontWeight: '600', display: 'block' }}>
                            {responseTimeText}
                          </Text>
                        </div>
                      </Col>
                    </Row>

                    {/* Action Button */}
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<MessageOutlined />}
                      onClick={handleStartChat}
                      loading={chatLoading}
                      style={{
                        background: 'linear-gradient(135deg, #015382 0%, #014361 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        height: '52px',
                        fontSize: '16px',
                        fontWeight: '600',
                        boxShadow: '0 4px 16px rgba(1, 83, 130, 0.3)'
                      }}
                    >
                      Start Conversation
                    </Button>
                  </Card>
                </motion.div>
              </Col>

              {/* Right Column - Details */}
              <Col xs={24} md={24} lg={16}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {/* Bio Section */}
                  <Card
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserOutlined style={{ color: '#015382', fontSize: windowWidth < 768 ? '16px' : '20px' }} />
                        <span style={{ fontSize: windowWidth < 768 ? '16px' : '20px', fontWeight: '700' }}>
                          About {writer.name}
                        </span>
                      </div>
                    }
                    style={{
                      borderRadius: '12px',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                      border: '1px solid #e2e8f0',
                      marginBottom: '16px'
                    }}
                  >
                    <Paragraph style={{ 
                      fontSize: windowWidth < 768 ? '14px' : '16px', 
                      lineHeight: '1.6',
                      color: '#475569',
                      margin: 0
                    }}>
                      {writer.writerProfile?.bio || 'This writer hasn\'t added a bio yet, but they\'re ready to help you with your academic needs!'}
                    </Paragraph>
                  </Card>

                  {/* Specialties Section */}
                  <Card
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOutlined style={{ color: '#015382', fontSize: windowWidth < 768 ? '16px' : '20px' }} />
                        <span style={{ fontSize: windowWidth < 768 ? '16px' : '20px', fontWeight: '700' }}>
                          Expertise & Specialties
                        </span>
                      </div>
                    }
                    style={{
                      borderRadius: '12px',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                      border: '1px solid #e2e8f0',
                      marginBottom: '16px'
                    }}
                  >
                    {writer.writerProfile?.specialties && writer.writerProfile.specialties.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: windowWidth < 768 ? '8px' : '12px' }}>
                        {writer.writerProfile.specialties.map((specialty, index) => (
                          <Tag
                            key={index}
                            style={{
                              fontSize: windowWidth < 768 ? '12px' : '14px',
                              padding: windowWidth < 768 ? '6px 12px' : '8px 16px',
                              borderRadius: '16px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#f8fafc',
                              color: '#475569',
                              fontWeight: '500',
                              margin: 0
                            }}
                          >
                            {specialty}
                          </Tag>
                        ))}
                      </div>
                    ) : (
                      <Text style={{ 
                        color: '#94a3b8', 
                        fontStyle: 'italic',
                        fontSize: windowWidth < 768 ? '14px' : '16px'
                      }}>
                        This writer hasn't specified their specialties yet, but they're available to help with various academic topics.
                      </Text>
                    )}
                  </Card>

                  {/* Additional Info */}
                  <Card
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FireOutlined style={{ color: '#015382', fontSize: windowWidth < 768 ? '16px' : '20px' }} />
                        <span style={{ fontSize: windowWidth < 768 ? '16px' : '20px', fontWeight: '700' }}>
                          Writer Details
                        </span>
                      </div>
                    }
                    style={{
                      borderRadius: '12px',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <Row gutter={[12, 12]}>
                      <Col xs={24} sm={12}>
                        <div style={{ 
                          padding: windowWidth < 768 ? '12px' : '16px', 
                          backgroundColor: '#f8fafc', 
                          borderRadius: '12px' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <ClockCircleOutlined style={{ color: responseTimeColor, fontSize: '16px' }} />
                            <Text strong style={{ fontSize: windowWidth < 768 ? '13px' : '14px' }}>
                              Response Time
                            </Text>
                          </div>
                          <Text style={{ 
                            color: responseTimeColor, 
                            fontSize: windowWidth < 768 ? '14px' : '16px', 
                            fontWeight: '600' 
                          }}>
                            Within {responseTimeText}
                          </Text>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div style={{ 
                          padding: windowWidth < 768 ? '12px' : '16px', 
                          backgroundColor: '#f8fafc', 
                          borderRadius: '12px' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <CalendarOutlined style={{ color: '#64748b', fontSize: '16px' }} />
                            <Text strong style={{ fontSize: windowWidth < 768 ? '13px' : '14px' }}>
                              Availability
                            </Text>
                          </div>
                          <Text style={{ 
                            color: '#10b981', 
                            fontSize: windowWidth < 768 ? '14px' : '16px', 
                            fontWeight: '600' 
                          }}>
                            {writer.writerProfile?.availability === 'available' ? 'Available Now' : 
                             writer.writerProfile?.availability === 'busy' ? 'Busy' : 'Not Available'}
                          </Text>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default WriterProfile;
