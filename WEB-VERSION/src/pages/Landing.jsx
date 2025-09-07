import React, { useState, useEffect, useRef } from 'react';
import { Card, Carousel, Statistic, Row, Col, Typography, Form, Input, Button, Collapse, Avatar, Progress } from 'antd';
import {
  StarFilled,
  CheckCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  TrophyOutlined,
  RocketOutlined,
  EditOutlined,
  BranchesOutlined,
  LinkOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  BookOutlined,
  FormOutlined,
  SyncOutlined,
  CheckCircleFilled,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
  RightOutlined,
  DollarOutlined,
  MessageOutlined,
  TeamOutlined,
  FacebookFilled,
  TwitterSquareFilled,
  LinkedinFilled,
  InstagramFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

// Footer Component
const FooterComponent = () => {
  return (
    <footer style={{ backgroundColor: '#1a202c', color: 'white', padding: '60px 24px', borderTop: '1px solid #2d3748' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={8}>
            <Title level={4} style={{ color: 'white', fontWeight: 'bold' }}>ThinqScribe</Title>
            <Paragraph style={{ color: '#a0aec0', marginTop: '16px' }}>
              Your partner in achieving academic success. We provide cutting-edge tools and expert support to help you excel.
            </Paragraph>
            <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
              <FacebookFilled style={{ fontSize: '24px', color: '#a0aec0', cursor: 'pointer' }} />
              <TwitterSquareFilled style={{ fontSize: '24px', color: '#a0aec0', cursor: 'pointer' }} />
              <LinkedinFilled style={{ fontSize: '24px', color: '#a0aec0', cursor: 'pointer' }} />
              <InstagramFilled style={{ fontSize: '24px', color: '#a0aec0', cursor: 'pointer' }} />
            </div>
          </Col>
          <Col xs={24} md={5}>
            <Title level={5} style={{ color: '#a0aec0', marginBottom: '24px', textTransform: 'uppercase' }}>Services</Title>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'white', transition: 'color 0.3s ease' }}>Academic Writing</a></li>
              <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'white', transition: 'color 0.3s ease' }}>AI Assistance</a></li>
              <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'white', transition: 'color 0.3s ease' }}>Research Support</a></li>
              <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'white', transition: 'color 0.3s ease' }}>Editing & Proofreading</a></li>
            </ul>
          </Col>
          <Col xs={24} md={5}>
            <Title level={5} style={{ color: '#a0aec0', marginBottom: '24px', textTransform: 'uppercase' }}>Company</Title>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'white', transition: 'color 0.3s ease' }}>About Us</a></li>
              <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'white', transition: 'color 0.3s ease' }}>Careers</a></li>
              <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'white', transition: 'color 0.3s ease' }}>Blog</a></li>
              <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'white', transition: 'color 0.3s ease' }}>Contact Us</a></li>
            </ul>
          </Col>
          <Col xs={24} md={6}>
            <Title level={5} style={{ color: '#a0aec0', marginBottom: '24px', textTransform: 'uppercase' }}>Legal</Title>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'white', transition: 'color 0.3s ease' }}>Terms of Service</a></li>
              <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'white', transition: 'color 0.3s ease' }}>Privacy Policy</a></li>
              <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'white', transition: 'color 0.3s ease' }}>Refund Policy</a></li>
            </ul>
          </Col>
        </Row>
        <div style={{ borderTop: '1px solid #2d3748', marginTop: '40px', paddingTop: '24px', textAlign: 'center' }}>
          <Paragraph style={{ color: '#a0aec0', margin: 0 }}>
            © {new Date().getFullYear()} ThinqScribe. All rights reserved.
          </Paragraph>
        </div>
      </div>
    </footer>
  );
};


const LandingPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  // Mouse movement effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
          y: ((e.clientY - rect.top) / rect.height) * 2 - 1
        });
      }
    };

    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Animated stats
  const [stats, setStats] = useState({
    students: 0,
    writers: 0,
    projects: 0,
    satisfaction: 0
  });

  useEffect(() => {
    const finalStats = {
      students: 15000,
      writers: 2500,
      projects: 45000,
      satisfaction: 98
    };

    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / steps, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setStats({
        students: Math.floor(finalStats.students * easeOutQuart),
        writers: Math.floor(finalStats.writers * easeOutQuart),
        projects: Math.floor(finalStats.projects * easeOutQuart),
        satisfaction: Math.floor(finalStats.satisfaction * easeOutQuart)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setStats(finalStats);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      title: 'Expert Academic Writers',
      description: 'Connect with PhD-qualified writers who specialize in your field of study.',
      icon: <TeamOutlined />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'AI-Powered Assistance',
      description: 'Advanced AI tools for research, writing enhancement, and citation management.',
      icon: <ThunderboltOutlined />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      title: 'Real-Time Collaboration',
      description: 'Work directly with your writer through our secure messaging platform.',
      icon: <MessageOutlined />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      title: 'Quality Assurance',
      description: 'Every project goes through rigorous quality checks and plagiarism screening.',
      icon: <CheckCircleOutlined />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
    {
      title: 'Affordable Excellence',
      description: 'Premium academic support at student-friendly prices with transparent billing.',
      icon: <DollarOutlined />,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
    {
      title: 'Subject Expertise',
      description: 'Comprehensive coverage across all academic disciplines and levels.',
      icon: <BookOutlined />,
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
  ];

  const FloatingShape = ({ className, size, top, left, duration, delay }) => (
    <div
      className={className}
      style={{
        position: 'absolute',
        width: size,
        height: size,
        top,
        left,
        opacity: 0.1,
        background: 'linear-gradient(45deg, #667eea, #764ba2)',
        borderRadius: '50%',
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: delay,
        transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
        transition: 'transform 0.5s ease',
      }}
    />
  );

  const ParticleSystem = () => {
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));

    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              width: particle.size,
              height: particle.size,
              top: `${particle.top}%`,
              left: `${particle.left}%`,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              animation: `twinkle ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="elegant-landing-page">
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
          }
          25% { 
            transform: translateY(-20px) rotate(5deg) scale(1.05); 
          }
          50% { 
            transform: translateY(-40px) rotate(0deg) scale(1.1); 
          }
          75% { 
            transform: translateY(-20px) rotate(-5deg) scale(1.05); 
          }
        }

        @keyframes twinkle {
          0%, 100% { 
            opacity: 0.1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.5); 
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .elegant-landing-page {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          overflow-x: hidden;
        }

        .hero-section {
          min-height: 100vh;
          position: relative;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(240, 147, 251, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(118, 75, 162, 0.3) 0%, transparent 50%);
          z-index: 1;
        }

        .hero-section::after {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          width: 100%;
          padding: 80px 24px;
        }

        .hero-text {
          animation: slideInLeft 1s ease-out;
        }

        .hero-title {
          font-size: clamp(40px, 8vw, 72px) !important;
          font-weight: 900 !important;
          line-height: 1.1 !important;
          margin-bottom: 24px !important;
          color: white !important;
          text-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
          letter-spacing: -0.02em !important;
        }

        .hero-accent {
          background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
          animation: pulse 2s ease-in-out infinite;
        }

        .hero-subtitle {
          font-size: clamp(18px, 3vw, 24px) !important;
          line-height: 1.6 !important;
          margin-bottom: 48px !important;
          color: rgba(255, 255, 255, 0.95) !important;
          max-width: 600px;
          text-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
          font-weight: 400 !important;
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
          margin-bottom: 64px;
          flex-wrap: wrap;
        }

        .primary-button {
          height: 64px !important;
          padding: 0 40px !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          border-radius: 16px !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          border: none !important;
          box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4) !important;
          color: white !important;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
          position: relative;
          overflow: hidden;
        }

        .primary-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .primary-button:hover {
          transform: translateY(-4px) scale(1.02) !important;
          box-shadow: 0 20px 60px rgba(102, 126, 234, 0.6) !important;
        }

        .primary-button:hover::before {
          opacity: 1;
        }

        .secondary-button {
          height: 64px !important;
          padding: 0 40px !important;
          font-size: 18px !important;
          font-weight: 600 !important;
          border-radius: 16px !important;
          color: white !important;
          border: 2px solid rgba(255, 255, 255, 0.3) !important;
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(20px) !important;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }

        .secondary-button:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          border-color: rgba(255, 255, 255, 0.6) !important;
          transform: translateY(-4px) !important;
          box-shadow: 0 16px 40px rgba(255, 255, 255, 0.2) !important;
        }

        .hero-visual {
          position: relative;
          height: 600px;
          animation: slideInRight 1s ease-out 0.3s both;
        }

        .floating-card {
          position: absolute;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(30px);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 280px;
          transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
        }

        .floating-card:hover {
          transform: translateY(-12px) scale(1.05);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.2);
        }

        .card-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }

        .card-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          background: inherit;
          filter: blur(10px);
          opacity: 0.3;
        }

        .card-1 .card-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .card-2 .card-icon {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .card-3 .card-icon {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .card-4 .card-icon {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        .card-content h4 {
          font-weight: 700;
          font-size: 18px;
          color: #1a202c;
          margin-bottom: 8px;
          margin: 8px 0;
        }

        .card-content p {
          font-size: 14px;
          color: #718096;
          line-height: 1.5;
          margin: 0;
        }

        .card-1 {
          top: 10%;
          left: 10%;
          animation: float 6s ease-in-out infinite;
        }

        .card-2 {
          top: 25%;
          right: 5%;
          animation: float 6s ease-in-out infinite 1.5s;
        }

        .card-3 {
          bottom: 30%;
          left: 5%;
          animation: float 6s ease-in-out infinite 3s;
        }

        .card-4 {
          bottom: 10%;
          right: 15%;
          animation: float 6s ease-in-out infinite 4.5s;
        }

        .stats-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(30px);
          border-radius: 24px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          animation: slideInUp 1s ease-out 0.6s both;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 36px !important;
          font-weight: 900 !important;
          color: white !important;
          margin-bottom: 8px !important;
          text-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
        }

        .stat-label {
          font-size: 16px !important;
          color: rgba(255, 255, 255, 0.8) !important;
          font-weight: 500 !important;
          margin: 0 !important;
        }

        .features-section {
          padding: 120px 0;
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
        }

        .section-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .section-title {
          font-size: clamp(32px, 6vw, 48px) !important;
          font-weight: 900 !important;
          color: #1a202c !important;
          margin-bottom: 24px !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-subtitle {
          font-size: 20px !important;
          color: #718096 !important;
          max-width: 600px;
          margin: 0 auto !important;
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .feature-card {
          background: white;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
          transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: var(--gradient);
          transform: scaleX(0);
          transition: transform 0.6s ease;
        }

        .feature-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .feature-card:hover::before {
          transform: scaleX(1);
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          color: white;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }

        .feature-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          background: inherit;
          filter: blur(20px);
          opacity: 0.3;
        }

        .feature-title {
          font-size: 24px !important;
          font-weight: 700 !important;
          color: #1a202c !important;
          margin-bottom: 16px !important;
        }

        .feature-description {
          font-size: 16px !important;
          color: #718096 !important;
          line-height: 1.6 !important;
          margin: 0 !important;
        }

        @media (max-width: 768px) {
          .hero-buttons {
            flex-direction: column;
            gap: 16px;
          }

          .hero-visual {
            height: 400px;
            margin-top: 40px;
          }

          .floating-card {
            min-width: 220px;
            padding: 20px;
          }

          .features-grid {
            grid-template-columns: 1fr;
            padding: 0 20px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
        }

        @media (max-width: 480px) {
          .card-1, .card-2 {
            top: 5%;
          }

          .card-3, .card-4 {
            bottom: 5%;
          }

          .card-1, .card-3 {
            left: 2%;
          }

          .card-2, .card-4 {
            right: 2%;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <ParticleSystem />
        <FloatingShape size="200px" top="10%" left="5%" duration={8} delay="0s" />
        <FloatingShape size="150px" top="60%" left="85%" duration={10} delay="2s" />
        <FloatingShape size="100px" top="30%" left="70%" duration={12} delay="4s" />
        
        <div className="hero-content">
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} lg={12}>
                <div className="hero-text">
                  <Title className="hero-title">
                    Academic Excellence <br />
                    <span className="hero-accent">Redefined</span>
                  </Title>
                  <Paragraph className="hero-subtitle">
                    Experience the future of academic support with our cutting-edge platform that combines 
                    world-class writers, advanced AI tools, and personalized learning experiences.
                  </Paragraph>
                  <div className="hero-buttons">
                    <Button 
                      className="primary-button"
                      onClick={() => navigate('/signup')}
                    >
                      Start Your Journey <ArrowRightOutlined />
                    </Button>
                    <Button 
                      className="secondary-button"
                      onClick={() => navigate('/about')}
                    >
                      Discover More
                    </Button>
                  </div>
                  
                  <div className="stats-container">
                    <div className="stats-grid">
                      <div className="stat-item">
                        <Title className="stat-number">{stats.students.toLocaleString()}+</Title>
                        <Paragraph className="stat-label">Happy Students</Paragraph>
                      </div>
                      <div className="stat-item">
                        <Title className="stat-number">{stats.writers.toLocaleString()}+</Title>
                        <Paragraph className="stat-label">Expert Writers</Paragraph>
                      </div>
                      <div className="stat-item">
                        <Title className="stat-number">{stats.projects.toLocaleString()}+</Title>
                        <Paragraph className="stat-label">Projects Completed</Paragraph>
                      </div>
                      <div className="stat-item">
                        <Title className="stat-number">{stats.satisfaction}%</Title>
                        <Paragraph className="stat-label">Satisfaction Rate</Paragraph>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} lg={12}>
                <div className="hero-visual">
                  <div className="floating-card card-1">
                    <div className="card-icon">
                      <EditOutlined />
                    </div>
                    <div className="card-content">
                      <h4>Expert Writing</h4>
                      <p>PhD-qualified writers in every field</p>
                    </div>
                  </div>
                  
                  <div className="floating-card card-2">
                    <div className="card-icon">
                      <ThunderboltOutlined />
                    </div>
                    <div className="card-content">
                      <h4>AI-Powered Tools</h4>
                      <p>Advanced research and writing assistance</p>
                    </div>
                  </div>
                  
                  <div className="floating-card card-3">
                    <div className="card-icon">
                      <CheckCircleOutlined />
                    </div>
                    <div className="card-content">
                      <h4>Quality Guaranteed</h4>
                      <p>100% original, plagiarism-free content</p>
                    </div>
                  </div>
                  
                  <div className="floating-card card-4">
                    <div className="card-icon">
                      <ClockCircleOutlined />
                    </div>
                    <div className="card-content">
                      <h4>On-Time Delivery</h4>
                      <p>Never miss a deadline again</p>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <Title className="section-title">Why Students Choose ThinqScribe</Title>
          <Paragraph className="section-subtitle">
            Discover the comprehensive suite of features that make academic success achievable for every student.
          </Paragraph>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card"
              style={{ '--gradient': feature.gradient }}
            >
              <div 
                className="feature-icon"
                style={{ background: feature.gradient }}
              >
                {feature.icon}
              </div>
              <Title className="feature-title">{feature.title}</Title>
              <Paragraph className="feature-description">
                {feature.description}
              </Paragraph>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section 
        style={{
          padding: '120px 0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          <Title 
            level={2} 
            style={{ 
              color: 'white',
              fontSize: 'clamp(32px, 6vw, 48px)',
              fontWeight: '900',
              marginBottom: '24px',
              textShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
          >
            Ready to Transform Your Academic Journey?
          </Title>
          <Paragraph style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '20px',
            marginBottom: '48px',
            lineHeight: '1.6'
          }}>
            Join thousands of students who have discovered the perfect balance between academic excellence and personal growth with ThinqScribe.
          </Paragraph>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              size="large" 
              onClick={() => navigate('/signup')}
              style={{
                background: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '16px',
                height: '64px',
                fontSize: '18px',
                fontWeight: '700',
                paddingInline: '40px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px) scale(1.05)';
                e.target.style.boxShadow = '0 20px 60px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
              }}
            >
              Get Started Today
            </Button>
            <Button 
              size="large" 
              onClick={() => navigate('/demo')}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                height: '64px',
                fontSize: '18px',
                fontWeight: '600',
                paddingInline: '40px',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.borderColor = 'rgba(255,255,255,0.6)';
                e.target.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Watch Demo
            </Button>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 10s ease-in-out infinite 2s'
        }} />
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '120px 0', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div className="section-header">
            <Title className="section-title">What Our Students Say</Title>
            <Paragraph className="section-subtitle">
              Hear from students who have transformed their academic journey with ThinqScribe.
            </Paragraph>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '32px',
            marginTop: '60px' 
          }}>
            {[
              {
                name: 'Sarah Chen',
                role: 'Graduate Student',
                university: 'Harvard University',
                content: 'ThinqScribe completely transformed my research process. The AI tools helped me find sources I never would have discovered, and my assigned writer provided invaluable guidance on structuring my thesis.',
                rating: 5,
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              },
              {
                name: 'Marcus Johnson',
                role: 'PhD Candidate',
                university: 'Stanford University',
                content: 'The quality of writing support is unmatched. My writer understood complex theoretical concepts and helped me articulate my ideas with clarity and precision.',
                rating: 5,
                gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              },
              {
                name: 'Elena Rodriguez',
                role: 'MBA Student',
                university: 'Wharton School',
                content: 'The real-time collaboration feature made working with my writer seamless. We could discuss ideas, share feedback, and refine my business case studies together.',
                rating: 5,
                gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  padding: '40px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e2e8f0',
                  position: 'relative',
                  transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: testimonial.gradient,
                  borderRadius: '24px 24px 0 0'
                }} />
                
                <div style={{ marginBottom: '24px' }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarFilled key={i} style={{ color: '#fbbf24', fontSize: '20px', marginRight: '4px' }} />
                  ))}
                </div>
                
                <Paragraph style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#4a5568',
                  fontStyle: 'italic',
                  marginBottom: '32px',
                  minHeight: '120px'
                }}>
                  "{testimonial.content}"
                </Paragraph>
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: testimonial.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px'
                  }}>
                    <UserOutlined style={{ color: 'white', fontSize: '24px' }} />
                  </div>
                  <div>
                    <Title level={5} style={{ margin: '0 0 4px 0', color: '#1a202c', fontWeight: '700' }}>
                      {testimonial.name}
                    </Title>
                    <Paragraph style={{ margin: 0, color: '#718096', fontSize: '14px' }}>
                      {testimonial.role}, {testimonial.university}
                    </Paragraph>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '120px 0', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          <div className="section-header">
            <Title className="section-title">Frequently Asked Questions</Title>
            <Paragraph className="section-subtitle">
              Everything you need to know about ThinqScribe and how it works.
            </Paragraph>
          </div>

          <div style={{ marginTop: '60px' }}>
            <Collapse 
              bordered={false}
              expandIconPosition="end"
              style={{ backgroundColor: 'transparent' }}
            >
              {[
                {
                  question: 'How do I get matched with the right writer?',
                  answer: 'Our advanced AI matching system analyzes your project requirements, subject area, academic level, and specific needs to connect you with writers who have the perfect expertise and experience for your assignment.'
                },
                {
                  question: 'What makes your AI tools different?',
                  answer: 'Our AI tools are specifically trained on academic content and designed to enhance human creativity rather than replace it. They provide intelligent suggestions, help with research, and ensure your work maintains academic integrity.'
                },
                {
                  question: 'How do you ensure quality and originality?',
                  answer: 'Every project goes through our comprehensive quality assurance process, including expert review, advanced plagiarism detection, and our satisfaction guarantee. We deliver only original, high-quality work.'
                },
                {
                  question: 'Can I communicate with my writer during the project?',
                  answer: 'Absolutely! Our platform includes real-time messaging, file sharing, and collaborative editing tools so you can work closely with your writer throughout the entire process.'
                },
                {
                  question: 'What if I need revisions?',
                  answer: 'We offer unlimited revisions within the agreed timeframe to ensure your complete satisfaction. Your writer will work with you to perfect every detail of your project.'
                }
              ].map((faq, index) => (
                <Panel
                  key={index}
                  header={
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '18px', 
                      color: '#1a202c' 
                    }}>
                      {faq.question}
                    </span>
                  }
                  style={{
                    marginBottom: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden'
                  }}
                >
                  <Paragraph style={{ 
                    color: '#4a5568', 
                    margin: 0, 
                    fontSize: '16px',
                    lineHeight: '1.6',
                    paddingTop: '8px'
                  }}>
                    {faq.answer}
                  </Paragraph>
                </Panel>
              ))}
            </Collapse>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <FooterComponent />
    </div>
  );
};

export default LandingPage;