import React from 'react';
import { Layout, Typography, Row, Col, Card, Button, Timeline, Statistic } from 'antd';
import { 
  BookOutlined, 
  UserOutlined, 
  TrophyOutlined, 
  TeamOutlined,
  CheckCircleOutlined,
  StarOutlined,
  HeartOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import HeaderComponent from '../components/HeaderComponent';
import './About.css';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const About = () => {
  const stats = [
    { title: '10,000+', subtitle: 'Students Helped', icon: <UserOutlined /> },
    { title: '500+', subtitle: 'Expert Writers', icon: <TeamOutlined /> },
    { title: '25,000+', subtitle: 'Projects Completed', icon: <BookOutlined /> },
    { title: '98%', subtitle: 'Satisfaction Rate', icon: <StarOutlined /> },
  ];

  const features = [
    {
      icon: <CheckCircleOutlined />,
      title: 'Quality Assurance',
      description: 'Every project goes through rigorous quality checks to ensure excellence.'
    },
    {
      icon: <TeamOutlined />,
      title: 'Expert Writers',
      description: 'Our team consists of verified professionals with advanced degrees.'
    },
    {
      icon: <GlobalOutlined />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist you whenever you need help.'
    },
    {
      icon: <TrophyOutlined />,
      title: 'Proven Results',
      description: 'Track record of helping students achieve their academic goals.'
    }
  ];

  const timeline = [
    {
      dot: <BookOutlined className="timeline-icon" />,
      children: (
        <div>
          <h4>2019 - Foundation</h4>
          <p>Thinqscribe was founded with a mission to bridge the gap between students and academic excellence.</p>
        </div>
      )
    },
    {
      dot: <UserOutlined className="timeline-icon" />,
      children: (
        <div>
          <h4>2020 - Growth</h4>
          <p>Expanded our team to include 100+ verified academic writers across various disciplines.</p>
        </div>
      )
    },
    {
      dot: <GlobalOutlined className="timeline-icon" />,
      children: (
        <div>
          <h4>2021 - Innovation</h4>
          <p>Launched our AI-powered matching system to connect students with the perfect writers.</p>
        </div>
      )
    },
    {
      dot: <TrophyOutlined className="timeline-icon" />,
      children: (
        <div>
          <h4>2022 - Recognition</h4>
          <p>Achieved 98% customer satisfaction rate and helped over 10,000 students succeed.</p>
        </div>
      )
    },
    {
      dot: <HeartOutlined className="timeline-icon" />,
      children: (
        <div>
          <h4>2023 - Present</h4>
          <p>Continuing to evolve and innovate in the academic assistance space with cutting-edge technology.</p>
        </div>
      )
    }
  ];

  return (
    <Layout className="about-layout">
      <HeaderComponent />
      
      <Content className="about-content">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="container">
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} lg={12}>
                <div className="hero-text">
                  <Title level={1} className="hero-title">
                    Empowering Academic
                    <span className="gradient-text"> Excellence</span>
                  </Title>
                  <Paragraph className="hero-subtitle">
                    At Thinqscribe, we believe every student deserves access to quality academic support. 
                    Our platform connects students with expert writers to achieve their educational goals.
                  </Paragraph>
                  <div className="hero-buttons">
                    <Button type="primary" size="large" className="cta-button">
                      <Link to="/signup">Join Our Community</Link>
                    </Button>
                    <Button size="large" className="secondary-button">
                      <Link to="/">Learn More</Link>
                    </Button>
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <div className="hero-visual">
                  <div className="visual-card">
                    <BookOutlined className="visual-icon" />
                    <h3>Academic Excellence</h3>
                    <p>Connecting students with expert writers worldwide</p>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="container">
            <Row gutter={[32, 32]}>
              {stats.map((stat, index) => (
                <Col xs={12} sm={6} key={index}>
                  <Card className="stat-card" bordered={false}>
                    <div className="stat-icon">{stat.icon}</div>
                    <Statistic 
                      title={stat.subtitle}
                      value={stat.title}
                      valueStyle={{ 
                        color: '#015382',
                        fontSize: '2rem',
                        fontWeight: 'bold'
                      }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mission-section">
          <div className="container">
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} lg={12}>
                <div className="mission-content">
                  <Title level={2} className="section-title">Our Mission</Title>
                  <Paragraph className="section-text">
                    To democratize access to quality academic assistance and empower students 
                    to achieve their educational aspirations through innovative technology and 
                    expert guidance.
                  </Paragraph>
                  <Paragraph className="section-text">
                    We envision a world where every student, regardless of their background or 
                    circumstances, has access to the support they need to excel academically.
                  </Paragraph>
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <div className="features-grid">
                  {features.map((feature, index) => (
                    <Card key={index} className="feature-card" bordered={false}>
                      <div className="feature-icon">{feature.icon}</div>
                      <h4 className="feature-title">{feature.title}</h4>
                      <p className="feature-description">{feature.description}</p>
                    </Card>
                  ))}
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="timeline-section">
          <div className="container">
            <div className="section-header">
              <Title level={2} className="section-title">Our Journey</Title>
              <Paragraph className="section-subtitle">
                Discover how Thinqscribe has evolved to become a trusted partner in academic success
              </Paragraph>
            </div>
            
            <div className="timeline-container">
              <Timeline mode="alternate" className="custom-timeline">
                {timeline.map((item, index) => (
                  <Timeline.Item key={index} dot={item.dot}>
                    <Card className="timeline-card" bordered={false}>
                      {item.children}
                    </Card>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="values-section">
          <div className="container">
            <div className="section-header">
              <Title level={2} className="section-title">Our Core Values</Title>
              <Paragraph className="section-subtitle">
                The principles that guide everything we do
              </Paragraph>
            </div>
            
            <Row gutter={[32, 32]}>
              <Col xs={24} md={8}>
                <Card className="value-card" bordered={false}>
                  <CheckCircleOutlined className="value-icon" />
                  <h3>Integrity</h3>
                  <p>We maintain the highest ethical standards in all our interactions and deliverables.</p>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="value-card" bordered={false}>
                  <StarOutlined className="value-icon" />
                  <h3>Excellence</h3>
                  <p>We strive for perfection in every project, ensuring quality that exceeds expectations.</p>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="value-card" bordered={false}>
                  <HeartOutlined className="value-icon" />
                  <h3>Empathy</h3>
                  <p>We understand student challenges and provide compassionate, personalized support.</p>
                </Card>
              </Col>
            </Row>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <Title level={2} className="cta-title">Ready to Begin Your Journey?</Title>
              <Paragraph className="cta-subtitle">
                Join thousands of students who have achieved academic success with Thinqscribe
              </Paragraph>
              <div className="cta-buttons">
                <Button type="primary" size="large" className="cta-button">
                  <Link to="/signup">Get Started Today</Link>
                </Button>
                <Button size="large" className="secondary-button">
                  <Link to="/">Explore Services</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Content>
    </Layout>
  );
};

export default About;