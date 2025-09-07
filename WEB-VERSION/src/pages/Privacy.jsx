import React from 'react';
import { Typography, Layout, Breadcrumb, Card, Row, Col, Space, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { SafetyCertificateOutlined, FileProtectOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import HeaderComponent from '../components/HeaderComponent';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const Privacy = () => {
  const sections = [
    {
      id: 'introduction',
      title: '1. Introduction',
      icon: <FileProtectOutlined />,
      content: 'At EDU-SAGE, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.'
    },
    {
      id: 'information-collection',
      title: '2. Information We Collect',
      icon: <UserOutlined />,
      content: null,
      subsections: [
        {
          title: '2.1 Personal Information',
          content: 'We may collect personal information that you voluntarily provide to us when you register for an account, express interest in obtaining information about us or our products and services, or otherwise contact us.',
          list: ['Name', 'Email address', 'Password', 'Educational background', 'Payment information', 'Communication preferences']
        },
        {
          title: '2.2 Automatically Collected Information',
          content: 'When you visit our website, our servers may automatically log standard data provided by your web browser. This may include your device\'s IP address, browser type and version, pages you visit, time and date of your visit, time spent on each page, and other details about your visit.'
        },
        {
          title: '2.3 Cookies and Similar Technologies',
          content: 'We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.'
        }
      ]
    },
    {
      id: 'information-use',
      title: '3. How We Use Your Information',
      icon: <LockOutlined />,
      content: 'We use the information we collect for various purposes, including:',
      list: [
        'To provide and maintain our services',
        'To notify you about changes to our services',
        'To allow you to participate in interactive features of our services',
        'To provide customer support',
        'To gather analysis or valuable information so that we can improve our services',
        'To monitor the usage of our services',
        'To detect, prevent, and address technical issues',
        'To process payments and prevent fraud'
      ]
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <HeaderComponent />
      <Content style={{ padding: '0', marginTop: '64px' }}>
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          padding: '80px 0',
          color: 'white'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <Row justify="center">
              <Col xs={24} md={20} lg={16}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px auto'
                  }}>
                    <SafetyCertificateOutlined style={{ fontSize: '40px', color: 'white' }} />
                  </div>
                  <Title 
                    level={1} 
                    style={{ 
                      color: 'white',
                      fontSize: 'clamp(32px, 6vw, 48px)',
                      fontWeight: '800',
                      marginBottom: '16px'
                    }}
                  >
                    Privacy Policy
                  </Title>
                  <Text style={{ 
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '18px',
                    lineHeight: '1.6'
                  }}>
                    Your privacy and data protection are our top priorities
                  </Text>
                  <div style={{ marginTop: '24px' }}>
                    <Text style={{ 
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '16px'
                    }}>
                      Last Updated: {new Date().toLocaleDateString()}
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Breadcrumb */}
        <div style={{ background: 'white', padding: '16px 0', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <Breadcrumb>
              <Breadcrumb.Item><Link to="/" style={{ color: '#1e3a8a' }}>Home</Link></Breadcrumb.Item>
              <Breadcrumb.Item style={{ color: '#64748b' }}>Privacy Policy</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
        
        {/* Content */}
        <div style={{ padding: '80px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <Row justify="center">
              <Col xs={24} lg={20}>
                <Card 
                  style={{ 
                    borderRadius: '20px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                    border: 'none'
                  }}
                >
                  <div style={{ padding: '40px' }}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      
                      {/* Introduction */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <FileProtectOutlined style={{ color: 'white', fontSize: '20px' }} />
                          </div>
                          <Title level={2} style={{ margin: 0, color: '#1e293b', fontSize: '24px', fontWeight: '700' }}>
                            1. Introduction
                          </Title>
                        </div>
                        <Paragraph style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.7' }}>
                          At EDU-SAGE, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                        </Paragraph>
                      </div>

                      <Divider style={{ margin: '32px 0' }} />
                      
                      {/* Information We Collect */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <UserOutlined style={{ color: 'white', fontSize: '20px' }} />
                          </div>
                          <Title level={2} style={{ margin: 0, color: '#1e293b', fontSize: '24px', fontWeight: '700' }}>
                            2. Information We Collect
                          </Title>
                        </div>
                        
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                          <div>
                            <Title level={4} style={{ color: '#374151', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                              2.1 Personal Information
                            </Title>
                            <Paragraph style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.7', marginBottom: '16px' }}>
                              We may collect personal information that you voluntarily provide to us when you register for an account, express interest in obtaining information about us or our products and services, or otherwise contact us. The personal information we collect may include:
                            </Paragraph>
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '8px', color: '#64748b' }}>Name</li>
                                <li style={{ marginBottom: '8px', color: '#64748b' }}>Email address</li>
                                <li style={{ marginBottom: '8px', color: '#64748b' }}>Password</li>
                                <li style={{ marginBottom: '8px', color: '#64748b' }}>Educational background</li>
                                <li style={{ marginBottom: '8px', color: '#64748b' }}>Payment information</li>
                                <li style={{ marginBottom: '0', color: '#64748b' }}>Communication preferences</li>
                              </ul>
                            </div>
                          </div>

                          <div>
                            <Title level={4} style={{ color: '#374151', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                              2.2 Automatically Collected Information
                            </Title>
                            <Paragraph style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.7' }}>
                              When you visit our website, our servers may automatically log standard data provided by your web browser. This may include your device's IP address, browser type and version, pages you visit, time and date of your visit, time spent on each page, and other details about your visit.
                            </Paragraph>
                          </div>

                          <div>
                            <Title level={4} style={{ color: '#374151', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                              2.3 Cookies and Similar Technologies
                            </Title>
                            <Paragraph style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.7' }}>
                              We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
                            </Paragraph>
                          </div>
                        </Space>
                      </div>

                      <Divider style={{ margin: '32px 0' }} />
                      
                      {/* How We Use Your Information */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <LockOutlined style={{ color: 'white', fontSize: '20px' }} />
                          </div>
                          <Title level={2} style={{ margin: 0, color: '#1e293b', fontSize: '24px', fontWeight: '700' }}>
                            3. How We Use Your Information
                          </Title>
                        </div>
                        <Paragraph style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.7', marginBottom: '16px' }}>
                          We use the information we collect for various purposes, including:
                        </Paragraph>
                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            <li style={{ marginBottom: '8px', color: '#64748b' }}>To provide and maintain our services</li>
                            <li style={{ marginBottom: '8px', color: '#64748b' }}>To notify you about changes to our services</li>
                            <li style={{ marginBottom: '8px', color: '#64748b' }}>To allow you to participate in interactive features of our services</li>
                            <li style={{ marginBottom: '8px', color: '#64748b' }}>To provide customer support</li>
                            <li style={{ marginBottom: '8px', color: '#64748b' }}>To gather analysis or valuable information so that we can improve our services</li>
                            <li style={{ marginBottom: '8px', color: '#64748b' }}>To monitor the usage of our services</li>
                            <li style={{ marginBottom: '8px', color: '#64748b' }}>To detect, prevent, and address technical issues</li>
                            <li style={{ marginBottom: '0', color: '#64748b' }}>To process payments and prevent fraud</li>
                          </ul>
                        </div>
                      </div>

                      <Divider style={{ margin: '32px 0' }} />

                      {/* Additional sections would continue with the same pattern... */}
                      <div style={{ 
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        padding: '32px',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        textAlign: 'center'
                      }}>
                        <Title level={3} style={{ color: '#1e293b', marginBottom: '16px' }}>
                          Questions About Our Privacy Policy?
                        </Title>
                        <Paragraph style={{ color: '#64748b', fontSize: '16px', marginBottom: '24px' }}>
                          If you have any questions about this Privacy Policy, please contact us at privacy@edu-sage.com
                        </Paragraph>
                        <div style={{ 
                          background: 'white',
                          padding: '16px 24px',
                          borderRadius: '12px',
                          display: 'inline-block'
                        }}>
                          <Text style={{ 
                            color: '#1e3a8a',
                            fontSize: '16px',
                            fontWeight: '600'
                          }}>
                            privacy@edu-sage.com
                          </Text>
                        </div>
                      </div>
                    </Space>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default Privacy;