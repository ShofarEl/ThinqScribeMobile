import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Progress, 
  Typography, 
  Timeline, 
  Tag, 
  Space, 
  Divider,
  Row,
  Col,
  Badge,
  Spin,
  Alert
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExperimentOutlined,
  BulbOutlined,
  SearchOutlined,
  FileSearchOutlined,
  BarChartOutlined,
  BookOutlined,
  RocketOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  SecurityScanOutlined,
  GlobalOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const ResearchProgress = ({ 
  isActive = false, 
  researchType = 'comprehensive',
  researchDepth = 'moderate',
  model = 'genius_pro',
  estimatedTime = '20-40s',
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('initializing');

  const researchSteps = [
    {
      title: 'Query Analysis',
      description: 'Understanding research parameters and objectives',
      icon: <SearchOutlined />,
      duration: 15,
      status: 'process'
    },
    {
      title: 'Knowledge Retrieval',
      description: 'Accessing domain expertise and data sources',
      icon: <DatabaseOutlined />,
      duration: 20,
      status: 'wait'
    },
    {
      title: 'Multi-Perspective Analysis',
      description: 'Analyzing from multiple expert viewpoints',
      icon: <ExperimentOutlined />,
      duration: 25,
      status: 'wait'
    },
    {
      title: 'Evidence Synthesis',
      description: 'Integrating findings and validating insights',
      icon: <BookOutlined />,
      duration: 20,
      status: 'wait'
    },
    {
      title: 'Strategic Formulation',
      description: 'Generating recommendations and action plans',
      icon: <RocketOutlined />,
      duration: 15,
      status: 'wait'
    },
    {
      title: 'Quality Validation',
      description: 'Ensuring premium output standards',
      icon: <SecurityScanOutlined />,
      duration: 5,
      status: 'wait'
    }
  ];

  const phaseMessages = {
    initializing: {
      text: 'Initializing premium research engine...',
      icon: <BulbOutlined spin />,
      color: '#1890ff'
    },
    analyzing: {
      text: 'Performing deep analytical processing...',
      icon: <ExperimentOutlined spin />,
      color: '#52c41a'
    },
    synthesizing: {
      text: 'Synthesizing insights and evidence...',
      icon: <DatabaseOutlined spin />,
      color: '#722ed1'
    },
    finalizing: {
      text: 'Finalizing premium research output...',
      icon: <CheckCircleOutlined spin />,
      color: '#fa8c16'
    }
  };

  const getDepthInfo = (depth) => {
    const configs = {
      light: { name: 'Quick Analysis', color: '#1890ff', complexity: 'Simple' },
      moderate: { name: 'Comprehensive Research', color: '#722ed1', complexity: 'Advanced' },
      deep: { name: 'Expert Analysis', color: '#f5222d', complexity: 'Premium' }
    };
    return configs[depth] || configs.moderate;
  };

  const getTypeInfo = (type) => {
    const configs = {
      general: { name: 'Comprehensive', icon: <SearchOutlined />, color: '#1890ff' },
      academic: { name: 'Academic', icon: <BookOutlined />, color: '#722ed1' },
      market: { name: 'Market Intelligence', icon: <BarChartOutlined />, color: '#13c2c2' },
      technical: { name: 'Technical Deep Dive', icon: <ExperimentOutlined />, color: '#52c41a' },
      competitive: { name: 'Competitive Analysis', icon: <GlobalOutlined />, color: '#fa8c16' },
      trend: { name: 'Trend Analysis', icon: <RocketOutlined />, color: '#f5222d' }
    };
    return configs[type] || configs.general;
  };

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0);
      setProgress(0);
      setElapsedTime(0);
      setCurrentPhase('initializing');
      return;
    }

    const startTime = Date.now();
    const totalDuration = researchSteps.reduce((sum, step) => sum + step.duration, 0) * 1000;
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const elapsedSeconds = Math.floor(elapsed / 1000);
      setElapsedTime(elapsedSeconds);

      const progressPercentage = Math.min((elapsed / totalDuration) * 100, 95);
      setProgress(progressPercentage);

      // Update current step
      let cumulativeDuration = 0;
      let newStep = 0;
      for (let i = 0; i < researchSteps.length; i++) {
        cumulativeDuration += researchSteps[i].duration * 1000;
        if (elapsed < cumulativeDuration) {
          newStep = i;
          break;
        }
        newStep = i + 1;
      }
      setCurrentStep(newStep);

      // Update phase
      if (elapsed < totalDuration * 0.2) {
        setCurrentPhase('initializing');
      } else if (elapsed < totalDuration * 0.7) {
        setCurrentPhase('analyzing');
      } else if (elapsed < totalDuration * 0.9) {
        setCurrentPhase('synthesizing');
      } else {
        setCurrentPhase('finalizing');
      }

      if (elapsed >= totalDuration) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, onComplete]);

  const depthInfo = getDepthInfo(researchDepth);
  const typeInfo = getTypeInfo(researchType);
  const currentPhaseInfo = phaseMessages[currentPhase];

  if (!isActive) return null;

  return (
    <Card
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '1px',
        marginBottom: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={16}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <BulbOutlined style={{ color: 'white', fontSize: '20px' }} />
                </div>
                <div>
                  <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                    Premium Research in Progress
                  </Title>
                  <Text type="secondary">
                    {typeInfo.name} • {depthInfo.name} • {model}
                  </Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                <Tag color={depthInfo.color} style={{ fontSize: '12px', padding: '4px 8px' }}>
                  {depthInfo.complexity}
                </Tag>
                <Badge 
                  count={`${elapsedTime}s`} 
                  style={{ backgroundColor: '#52c41a' }}
                />
              </Space>
            </Col>
          </Row>
        </div>

        {/* Current Phase Status */}
        <Alert
          message={
            <Space>
              <span style={{ color: currentPhaseInfo.color }}>
                {currentPhaseInfo.icon}
              </span>
              <Text strong>{currentPhaseInfo.text}</Text>
            </Space>
          }
          type="info"
          style={{
            marginBottom: '20px',
            border: `1px solid ${currentPhaseInfo.color}20`,
            background: `${currentPhaseInfo.color}08`,
            borderRadius: '8px'
          }}
          showIcon={false}
        />

        {/* Progress Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <Text strong>Research Progress</Text>
            <Text type="secondary">{Math.round(progress)}% Complete</Text>
          </div>
          <Progress
            percent={progress}
            status="active"
            strokeColor={{
              '0%': '#667eea',
              '50%': '#764ba2',
              '100%': '#52c41a',
            }}
            trailColor="#f0f0f0"
            strokeWidth={12}
            style={{ marginBottom: '8px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: '12px', color: '#666' }}>
              <ClockCircleOutlined /> Est. Time: {estimatedTime}
            </Text>
            <Text style={{ fontSize: '12px', color: '#666' }}>
              <ThunderboltOutlined /> High Performance Mode
            </Text>
          </div>
        </div>

        {/* Research Steps Timeline */}
        <Card 
          size="small" 
          title={
            <Space>
              <RocketOutlined style={{ color: '#fa8c16' }} />
              <Text strong>Research Pipeline</Text>
            </Space>
          }
          style={{ 
            background: '#fafafa',
            border: '1px solid #f0f0f0'
          }}
        >
          <Timeline mode="left" style={{ margin: '12px 0' }}>
            {researchSteps.map((step, index) => {
              let status = 'wait';
              if (index < currentStep) status = 'finish';
              else if (index === currentStep) status = 'process';

              return (
                <Timeline.Item
                  key={index}
                  dot={
                    status === 'finish' ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : status === 'process' ? (
                      <Spin size="small" indicator={step.icon} />
                    ) : (
                      <div style={{ color: '#d9d9d9' }}>{step.icon}</div>
                    )
                  }
                  color={status === 'finish' ? 'green' : status === 'process' ? 'blue' : 'gray'}
                >
                  <div>
                    <Text 
                      strong={status !== 'wait'} 
                      style={{ 
                        color: status === 'finish' ? '#52c41a' : 
                               status === 'process' ? '#1890ff' : '#999' 
                      }}
                    >
                      {step.title}
                    </Text>
                    <br />
                    <Text 
                      type="secondary" 
                      style={{ fontSize: '12px' }}
                    >
                      {step.description}
                    </Text>
                  </div>
                </Timeline.Item>
              );
            })}
          </Timeline>
        </Card>

        {/* Research Metrics */}
        <Row gutter={16} style={{ marginTop: '16px' }}>
          <Col span={6}>
            <div style={{ textAlign: 'center', padding: '8px' }}>
              <div style={{ fontSize: '20px', color: '#1890ff' }}>
                <DatabaseOutlined />
              </div>
              <Text style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                Knowledge Sources
              </Text>
              <Text strong style={{ fontSize: '14px' }}>
                {currentStep * 250}+
              </Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center', padding: '8px' }}>
              <div style={{ fontSize: '20px', color: '#52c41a' }}>
                <ExperimentOutlined />
              </div>
              <Text style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                Analysis Depth
              </Text>
              <Text strong style={{ fontSize: '14px' }}>
                {depthInfo.complexity}
              </Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center', padding: '8px' }}>
              <div style={{ fontSize: '20px', color: '#722ed1' }}>
                <EyeOutlined />
              </div>
              <Text style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                Perspectives
              </Text>
              <Text strong style={{ fontSize: '14px' }}>
                {currentStep + 1}/6
              </Text>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center', padding: '8px' }}>
              <div style={{ fontSize: '20px', color: '#fa8c16' }}>
                <RocketOutlined />
              </div>
              <Text style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                Quality Level
              </Text>
              <Text strong style={{ fontSize: '14px' }}>
                Premium
              </Text>
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default ResearchProgress; 