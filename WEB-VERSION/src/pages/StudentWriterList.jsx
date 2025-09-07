// src/components/StudentWriterList.jsx

import React, { useEffect, useState } from 'react';
import './StudentWriterList.css';
import { 
  Card, 
  Avatar, 
  Spin, 
  Alert, 
  Button, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Rate, 
  Tag, 
  Badge,
  Pagination,
  Select,
  Input,
  Divider,
  Tooltip,
  Statistic,
  Layout
} from 'antd';
import { 
  MessageOutlined, 
  StarOutlined, 
  BookOutlined, 
  ClockCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  SearchOutlined,
  FilterOutlined,
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  FireOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import HeaderComponent from '../components/HeaderComponent';
import { getRecommendedWriters } from '../api/user';
import { startChat } from '../api/chat';
import { useNotifications } from '../context/NotificationContext';
import { PREDEFINED_SPECIALTIES } from '../utils/specialties';
import { useWriterStore } from '../store/writerStore';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { Option } = Select;

const StudentWriterList = () => {
  const [writers, setWriters] = useState([]);
  const [filteredWriters, setFilteredWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const { socket } = useNotifications();
  const navigate = useNavigate();
  const { processWriterData, updateWriterProfileData } = useWriterStore();
  

  useEffect(() => {
    const fetchWriters = async () => {
      try {
        const writersData = await getRecommendedWriters();
        // Use Zustand store to process writers with persistent display data
        const realWriters = processWriterData(writersData);
        setWriters(realWriters);
        setFilteredWriters(realWriters);
      } catch (err) {
        setError(err.message || 'Failed to load writers');
      } finally {
        setLoading(false);
      }
    };
    fetchWriters();
  }, []);

  // Socket listener for real-time writer profile updates
  useEffect(() => {
    if (!socket) return;

    const handleWriterProfileUpdate = (data) => {
      const updateWriter = (writer) => 
        writer._id === data.writerId 
          ? {
              ...writer,
              name: data.updatedFields.name || writer.name,
              avatar: data.updatedFields.avatar || writer.avatar,
              responseTime: data.updatedFields.responseTime !== undefined ? data.updatedFields.responseTime : writer.responseTime,
              writerProfile: {
                ...writer.writerProfile,
                bio: data.updatedFields.bio !== undefined ? data.updatedFields.bio : writer.writerProfile?.bio,
                specialties: data.updatedFields.specialties !== undefined ? data.updatedFields.specialties : writer.writerProfile?.specialties,
                responseTime: data.updatedFields.responseTime !== undefined ? data.updatedFields.responseTime : writer.writerProfile?.responseTime
              }
            }
          : writer;

      // Update both state arrays
      setWriters(prevWriters => prevWriters.map(updateWriter));
      setFilteredWriters(prevFiltered => prevFiltered.map(updateWriter));
      
      // Persist profile changes in Zustand store for refresh persistence
      updateWriterProfileData(data.writerId, {
        name: data.updatedFields.name,
        avatar: data.updatedFields.avatar,
        bio: data.updatedFields.bio,
        specialties: data.updatedFields.specialties,
        responseTime: data.updatedFields.responseTime
      });
    };

    socket.on('writerProfileUpdated', handleWriterProfileUpdate);

    return () => {
      socket.off('writerProfileUpdated', handleWriterProfileUpdate);
    };
  }, [socket, updateWriterProfileData]);

  useEffect(() => {
    const fullTitle = "Connect with Expert Academic Writers";
    let i = 0;
    
    const typingInterval = setInterval(() => {
      if (i < fullTitle.length) {
        setTitle(fullTitle.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        setTypingComplete(true);
      }
    }, 80);

    return () => clearInterval(typingInterval);
  }, []);

  // Filter and sort writers
  useEffect(() => {
    let filtered = (writers || []).filter(writer => {
      const matchesSearch = writer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (writer.writerProfile?.specialties || []).some(spec => 
                             spec.toLowerCase().includes(searchTerm.toLowerCase())
                           );
      
      const matchesSpecialty = selectedSpecialty === 'all' ||
                              (writer.writerProfile?.specialties || []).includes(selectedSpecialty);
      
      return matchesSearch && matchesSpecialty;
    });

    // Sort writers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'projects':
          return (b.projectsCompleted || 0) - (a.projectsCompleted || 0);
        case 'response':
          return (a.responseTime || 0) - (b.responseTime || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });

    setFilteredWriters(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [writers, searchTerm, selectedSpecialty, sortBy]);

  const handleChat = async (writerId) => {
    try {
      const chat = await startChat(writerId);
      if (chat && chat._id) {
        navigate(`/chat/student/${chat._id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Get unique specialties for filter
  const specialties = [...new Set(
    (writers || []).flatMap(writer => (writer.writerProfile?.specialties || []))
  )];

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentWriters = filteredWriters.slice(startIndex, endIndex);

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
              Finding expert writers for you...
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
              message="Unable to Load Writers"
              description={error}
              type="error"
              showIcon
              style={{ 
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(220, 38, 38, 0.1)'
              }}
            />
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <HeaderComponent />
      <Content>
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #015382 0%, #014361 50%, #012a3e 100%)',
          padding: '80px 0',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)',
            pointerEvents: 'none'
          }}></div>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} lg={14}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Title 
                    level={1} 
                    style={{ 
                      color: 'white',
                      fontSize: 'clamp(32px, 6vw, 56px)',
                      fontWeight: '800',
                      marginBottom: '20px',
                      textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                      letterSpacing: '-1px'
                    }}
                  >
                    {title}
                    {!typingComplete && <span style={{ color: '#fbbf24', animation: 'blink 1s infinite' }}>|</span>}
                  </Title>
                  <Paragraph style={{ 
                    color: 'rgba(255,255,255,0.95)',
                    fontSize: '22px',
                    marginBottom: '40px',
                    lineHeight: '1.7',
                    fontWeight: '400',
                    maxWidth: '600px'
                  }}>
                    Discover elite academic writers who will transform your ideas into scholarly excellence. 
                    Connect with verified experts tailored to your unique academic journey.
                  </Paragraph>
                  
                  {/* Enhanced Stats */}
                  <Row gutter={[32, 20]}>
                    <Col xs={12} sm={8}>
                      <div style={{ 
                          textAlign: 'center',
                          background: 'rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(25px)',
                          borderRadius: '20px',
                          padding: '24px 20px',
                          border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease'
                      }}>
                        <div style={{ 
                          fontSize: '32px', 
                          fontWeight: '800', 
                          color: 'white',
                          marginBottom: '4px',
                          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                          {writers.length}+
                        </div>
                        <div style={{ 
                          fontSize: '14px', 
                          color: 'rgba(255,255,255,0.9)',
                          fontWeight: '500',
                          letterSpacing: '0.5px'
                        }}>
                          Elite Writers
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} sm={8}>
                      <div style={{ 
                          textAlign: 'center',
                          background: 'rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(25px)',
                          borderRadius: '20px',
                          padding: '24px 20px',
                          border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease'
                      }}>
                        <div style={{ 
                          fontSize: '32px', 
                          fontWeight: '800', 
                          color: 'white',
                          marginBottom: '4px',
                          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                          4.8★
                        </div>
                        <div style={{ 
                          fontSize: '14px', 
                          color: 'rgba(255,255,255,0.9)',
                          fontWeight: '500',
                          letterSpacing: '0.5px'
                        }}>
                          Excellence Rating
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} sm={8}>
                      <div style={{ 
                          textAlign: 'center',
                          background: 'rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(25px)',
                          borderRadius: '20px',
                          padding: '24px 20px',
                          border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease'
                      }}>
                        <div style={{ 
                          fontSize: '32px', 
                          fontWeight: '800', 
                          color: 'white',
                          marginBottom: '4px',
                          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                          24/7
                        </div>
                        <div style={{ 
                          fontSize: '14px', 
                          color: 'rgba(255,255,255,0.9)',
                          fontWeight: '500',
                          letterSpacing: '0.5px'
                        }}>
                          Expert Support
                        </div>
                      </div>
                    </Col>
                  </Row>
                </motion.div>
              </Col>
              <Col xs={24} lg={10}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(30px)',
                    borderRadius: '24px',
                    padding: '40px 32px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                      zIndex: 1
                    }}></div>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <TeamOutlined style={{ 
                          fontSize: '90px', 
                          color: 'white', 
                          marginBottom: '20px',
                        textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                        transition: 'transform 0.3s ease'
                        }} />
                      <Title level={3} style={{ 
                        color: 'white', 
                        marginBottom: '12px',
                        fontSize: '24px',
                        fontWeight: '700',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        Ready to Excel?
                      </Title>
                      <Text style={{ 
                        color: 'rgba(255,255,255,0.9)', 
                        fontSize: '17px',
                        fontWeight: '400',
                        lineHeight: '1.5'
                      }}>
                        Discover the perfect academic partner for your scholarly success
                      </Text>
                    </div>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
          padding: '32px 0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          position: 'relative'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8} md={6}>
                <Input
                  placeholder="Search brilliant minds..."
                  prefix={<SearchOutlined style={{ color: '#64748b' }} />}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ 
                    borderRadius: '16px',
                    height: '52px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    fontSize: '16px'
                  }}
                  size="large"
                />
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Select
                  placeholder="Choose expertise..."
                  value={selectedSpecialty}
                  onChange={setSelectedSpecialty}
                  style={{ 
                    width: '100%', 
                    borderRadius: '16px',
                    fontSize: '16px'
                  }}
                  size="large"
                >
                  <Option value="all">All Expertise Areas</Option>
                  {specialties.map(specialty => (
                    <Option key={specialty} value={specialty}>{specialty}</Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Select
                  placeholder="Sort by excellence..."
                  value={sortBy}
                  onChange={setSortBy}
                  style={{ 
                    width: '100%', 
                    borderRadius: '16px',
                    fontSize: '16px'
                  }}
                  size="large"
                >
                  <Option value="rating">⭐ Highest Rated</Option>
                  <Option value="projects">🏆 Most Projects</Option>
                  <Option value="response">⚡ Fastest Response</Option>
                  <Option value="name">🔤 Name (A-Z)</Option>
                </Select>
              </Col>
              <Col xs={24} sm={24} md={6}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #015382 0%, #014361 100%)',
                    color: 'white',
                    padding: '14px 24px',
                    borderRadius: '20px',
                    fontSize: '15px',
                    fontWeight: '700',
                    boxShadow: '0 6px 20px rgba(1, 83, 130, 0.3)',
                    display: 'inline-block',
                    letterSpacing: '0.3px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    ✨ {filteredWriters.length} exceptional minds
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Writers Grid */}
        <div style={{ padding: '40px 0' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
            {currentWriters.length > 0 ? (
              <>
                <Row gutter={[24, 24]}>
                  {currentWriters.map((writer, index) => (
                    <Col xs={24} sm={12} lg={8} xl={6} key={writer._id}>
                      <div style={{ height: '100%' }}>
                        <Card
                          hoverable
                          className="writer-card-modern"
                          style={{
                            height: '100%',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            transition: 'all 0.2s ease',
                            overflow: 'hidden',
                            background: 'white',
                            cursor: 'pointer'
                          }}
                          bodyStyle={{ padding: '20px' }}
                          onClick={() => navigate(`/writers/${writer._id}`)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                        >
                          {/* Clean Header */}
                          <div style={{
                            textAlign: 'center', 
                            borderBottom: '1px solid #f1f5f9',
                            paddingBottom: '16px',
                            marginBottom: '16px'
                          }}>
                            <div style={{ position: 'relative', marginBottom: '12px' }}>
                              {writer.isOnline && (
                            <div style={{
                              position: 'absolute',
                                  top: '-2px',
                                  right: '-2px',
                                  width: '12px',
                                  height: '12px',
                                  backgroundColor: '#10b981',
                                  borderRadius: '50%',
                                  border: '2px solid white',
                              zIndex: 1
                            }}></div>
                              )}
                                <Avatar
                                size={64}
                                  src={writer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${writer.name}`}
                                  style={{
                                  backgroundColor: '#015382',
                                  border: '2px solid #f8fafc'
                                  }}
                                />
                                {writer.verified && (
                                  <div style={{
                                    position: 'absolute',
                                  bottom: '-4px',
                                  right: '50%',
                                  transform: 'translateX(50%)',
                                  backgroundColor: '#10b981',
                                    borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  border: '2px solid white'
                                  }}>
                                  <CheckCircleOutlined style={{ color: 'white', fontSize: '12px' }} />
                                  </div>
                                )}
                              </div>
                            <Title level={5} style={{ 
                              margin: '0 0 4px 0', 
                              fontSize: '16px',
                              color: '#1e293b',
                              fontWeight: '600'
                              }}>
                                {writer.name}
                              </Title>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
                              <Rate 
                                disabled 
                                value={writer.rating || 0} 
                                style={{ fontSize: '12px' }}
                              />
                              <Text style={{ 
                                fontSize: '12px', 
                                color: '#64748b',
                                fontWeight: '500'
                              }}>
                                ({writer.rating ? writer.rating.toFixed(1) : 'New'})
                              </Text>
                            </div>
                            <Text style={{ 
                              fontSize: '12px', 
                              color: '#64748b'
                            }}>
                              {writer.reviewCount || 0} reviews • {writer.projectsCompleted > 0 ? `${writer.projectsCompleted}+ projects` : 'New writer'}
                            </Text>
                          </div>

                          {/* Content */}
                          <div>
                            {/* Writer Bio */}
                            <div style={{ marginBottom: '16px' }}>
                              <Text style={{ 
                                fontSize: '13px', 
                                color: writer.writerProfile?.bio ? '#475569' : '#94a3b8',
                                lineHeight: '1.4',
                                display: 'block',
                                fontStyle: writer.writerProfile?.bio ? 'normal' : 'italic'
                              }}>
                                {writer.writerProfile?.bio ? (
                                  (writer.writerProfile.bio.length > 80
                                    ? `${writer.writerProfile.bio.substring(0, 80)}...`
                                    : writer.writerProfile.bio
                                  )
                                ) : (
                                  'Professional bio not available yet'
                                )}
                              </Text>
                            </div>

                            {/* Specialties */}
                            <div style={{ marginBottom: '16px' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {(writer.writerProfile?.specialties || []).length > 0 ? (
                                  <>
                                    {writer.writerProfile.specialties.slice(0, 3).map((specialty, idx) => (
                                      <span 
                                        key={idx} 
                                        style={{ 
                                          fontSize: '11px', 
                                          backgroundColor: '#f1f5f9',
                                          color: '#475569',
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          fontWeight: '500'
                                        }}
                                      >
                                        {specialty}
                                      </span>
                                    ))}
                                    {writer.writerProfile.specialties.length > 3 && (
                                      <span style={{ 
                                        fontSize: '11px', 
                                        backgroundColor: '#e2e8f0',
                                        color: '#64748b',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontWeight: '500'
                                      }}>
                                        +{writer.writerProfile.specialties.length - 3}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span style={{ 
                                    fontSize: '11px', 
                                    backgroundColor: '#fef2f2',
                                    color: '#94a3b8',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontWeight: '500',
                                    fontStyle: 'italic'
                                  }}>
                                    No specialties listed
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Stats Row */}
                            <div style={{ 
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '12px 0',
                              borderTop: '1px solid #f1f5f9',
                              marginBottom: '16px'
                            }}>
                              <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ 
                                  fontSize: '14px', 
                                  fontWeight: '600', 
                                  color: writer.projectsCompleted > 0 ? '#015382' : '#94a3b8'
                                }}>
                                  {writer.projectsCompleted > 0 ? `${writer.projectsCompleted}+` : 'New'}
                                </div>
                                <div style={{ 
                                  fontSize: '11px', 
                                  color: '#64748b'
                                }}>
                                  Projects
                                </div>
                              </div>
                              <div style={{ width: '1px', background: '#e2e8f0', margin: '0 8px' }}></div>
                              <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ 
                                  fontSize: '14px', 
                                  fontWeight: '600', 
                                  color: writer.responseTime <= 4 ? '#10b981' : writer.responseTime <= 24 ? '#3b82f6' : '#f59e0b'
                                }}>
                                  {writer.responseTime <= 1 ? '1h' :
                                   writer.responseTime <= 4 ? `${writer.responseTime}h` :
                                   writer.responseTime <= 24 ? `${writer.responseTime}h` :
                                   writer.responseTime <= 48 ? '2d' : '3d+'
                                  }
                                </div>
                                <div style={{ 
                                  fontSize: '11px', 
                                  color: '#64748b'
                                }}>
                                  Response
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <Button
                              type="primary"
                              icon={<MessageOutlined />}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click
                                handleChat(writer._id);
                              }}
                              block
                              style={{
                                backgroundColor: '#015382',
                                border: 'none',
                                borderRadius: '8px',
                                height: '36px',
                                fontSize: '14px',
                                fontWeight: '500'
                              }}
                            >
                              Start Chat
                            </Button>
                          </div>
                        </Card>
                      </div>
                    </Col>
                  ))}
                </Row>

                {/* Pagination */}
                <div style={{ textAlign: 'center', marginTop: '48px' }}>
                  <Pagination
                    current={currentPage}
                    total={filteredWriters.length}
                    pageSize={pageSize}
                    onChange={setCurrentPage}
                    onShowSizeChange={(current, size) => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total, range) => 
                      `${range[0]}-${range[1]} of ${total} writers`
                    }
                    style={{
                      '& .ant-pagination-item': {
                        borderRadius: '8px'
                      },
                      '& .ant-pagination-item-active': {
                        background: '#1e3a8a',
                        borderColor: '#1e3a8a'
                      }
                    }}
                  />
                </div>
              </>
            ) : (
              // Empty State
              <div style={{ 
                textAlign: 'center', 
                padding: '80px 20px',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}>
                <UserOutlined style={{ fontSize: '80px', color: '#d1d5db', marginBottom: '24px' }} />
                <Title level={3} style={{ color: '#6b7280', marginBottom: '16px' }}>
                  No Writers Found
                </Title>
                <Text style={{ color: '#9ca3af', fontSize: '16px', marginBottom: '24px' }}>
                  Try adjusting your search criteria or browse all writers
                </Text>
                <Button 
                  type="primary"
                  size="large"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecialty('all');
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    height: '48px',
                    paddingInline: '32px'
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default StudentWriterList;