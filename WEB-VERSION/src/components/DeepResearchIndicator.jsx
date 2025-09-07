import React, { useState, useEffect } from 'react';
import { Card, Progress, Typography, Space, Tag, Badge, Timeline, Spin } from 'antd';
import {
  BulbOutlined,
  ExperimentOutlined,
  SearchOutlined,
  DatabaseOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  FireOutlined,
  StarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const DeepResearchIndicator = ({ 
  isActive = false, 
  researchDepth = 'moderate',
  researchType = 'comprehensive',
  progress = 0,
  currentPhase = 'initializing',
  elapsedTime = 0
}) => {
  const [pulseAnimation, setPulseAnimation] = useState(0);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setPulseAnimation(prev => (prev + 1) % 3);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  const getDepthConfig = (depth) => {
    const configs = {
      light: {
        name: 'Quick Analysis',
        color: '#1890ff',
        gradient: 'linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)',
        complexity: 'Standard',
        icon: <SearchOutlined />
      },
      moderate: {
        name: 'Comprehensive Research',
        color: '#722ed1',
        gradient: 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)',
        complexity: 'Advanced',
        icon: <ExperimentOutlined />
      },
      deep: {
        name: 'Expert Deep Analysis',
        color: '#f5222d',
        gradient: 'linear-gradient(135deg, #f5222d 0%, #ff7875 100%)',
        complexity: 'Premium',
        icon: <BulbOutlined />
      }
    };
    return configs[depth] || configs.moderate;
  };

  const getPhaseInfo = (phase) => {
    const phases = {
      initializing: { text: 'Initializing AI Research Engine', icon: <BulbOutlined />, color: '#1890ff' },
      analyzing: { text: 'Performing Deep Analysis', icon: <ExperimentOutlined />, color: '#52c41a' },
      synthesizing: { text: 'Synthesizing Insights', icon: <DatabaseOutlined />, color: '#722ed1' },
      finalizing: { text: 'Finalizing Premium Output', icon: <CheckCircleOutlined />, color: '#fa8c16' }
    };
    return phases[phase] || phases.initializing;
  };

  const depthConfig = getDepthConfig(researchDepth);
  const phaseInfo = getPhaseInfo(currentPhase);

  if (!isActive) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease-in-out'
    }}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .research-pulse {
            animation: pulse 2s infinite;
          }
          .research-spin {
            animation: spin 2s linear infinite;
          }
        `}
      </style>

      <Card
        style={{
          width: '400px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: 'none',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Animated Header */}
        <div style={{
          background: depthConfig.gradient,
          padding: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at ${30 + pulseAnimation * 20}% ${30 + pulseAnimation * 15}%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
            transition: 'all 1s ease-in-out'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <div className="research-pulse" style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div className="research-spin" style={{ color: 'white', fontSize: '24px' }}>
                    {depthConfig.icon}
                  </div>
                </div>
                <div>
                  <Text strong style={{ color: 'white', fontSize: '16px', display: 'block' }}>
                    {depthConfig.name}
                  </Text>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
                    {researchType.charAt(0).toUpperCase() + researchType.slice(1)} Research Mode
                  </Text>
                </div>
              </Space>
              <Badge 
                count={depthConfig.complexity} 
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.3)'
                }}
              />
            </Space>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Current Phase */}
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <Space direction="vertical" align="center" size={8}>
              <div style={{ 
                color: phaseInfo.color, 
                fontSize: '20px',
                animation: 'pulse 1.5s infinite'
              }}>
                {phaseInfo.icon}
              </div>
              <Text strong style={{ fontSize: '14px' }}>
                {phaseInfo.text}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Processing with advanced AI algorithms
              </Text>
            </Space>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '20px' }}>
            <Progress
              percent={progress}
              status="active"
              strokeColor={{
                '0%': depthConfig.color,
                '100%': '#52c41a'
              }}
              trailColor="#f0f0f0"
              strokeWidth={8}
              showInfo={false}
              style={{ marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: '12px', color: '#666' }}>
                <ClockCircleOutlined /> {elapsedTime}s elapsed
              </Text>
              <Text style={{ fontSize: '12px', color: '#666' }}>
                <ThunderboltOutlined /> Premium Mode
              </Text>
            </div>
          </div>

          {/* Research Timeline */}
          <div style={{ 
            background: '#f9f9f9', 
            borderRadius: '12px', 
            padding: '16px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '12px' }}>
              <FireOutlined style={{ color: '#fa8c16', marginRight: '4px' }} />
              Research Pipeline
            </Text>
            
            <Timeline size="small">
              <Timeline.Item
                dot={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                color="green"
              >
                <Text style={{ fontSize: '11px' }}>Query Analysis Complete</Text>
              </Timeline.Item>
              <Timeline.Item
                dot={<Spin size="small" indicator={<DatabaseOutlined />} />}
                color="blue"
              >
                <Text style={{ fontSize: '11px' }}>Knowledge Retrieval Active</Text>
              </Timeline.Item>
              <Timeline.Item color="gray">
                <Text style={{ fontSize: '11px', color: '#999' }}>Multi-Perspective Analysis</Text>
              </Timeline.Item>
              <Timeline.Item color="gray">
                <Text style={{ fontSize: '11px', color: '#999' }}>Evidence Synthesis</Text>
              </Timeline.Item>
              <Timeline.Item color="gray">
                <Text style={{ fontSize: '11px', color: '#999' }}>Premium Output Generation</Text>
              </Timeline.Item>
            </Timeline>
          </div>

          {/* Research Stats */}
          <div style={{ 
            marginTop: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '12px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '16px', color: '#1890ff' }}>
                <DatabaseOutlined />
              </div>
              <Text style={{ fontSize: '10px', display: 'block', marginTop: '4px' }}>
                Sources
              </Text>
              <Text strong style={{ fontSize: '12px' }}>
                500+
              </Text>
            </div>
            <div>
              <div style={{ fontSize: '16px', color: '#52c41a' }}>
                <ExperimentOutlined />
              </div>
              <Text style={{ fontSize: '10px', display: 'block', marginTop: '4px' }}>
                Quality
              </Text>
              <Text strong style={{ fontSize: '12px' }}>
                Premium
              </Text>
            </div>
            <div>
              <div style={{ fontSize: '16px', color: '#722ed1' }}>
                <StarOutlined />
              </div>
              <Text style={{ fontSize: '10px', display: 'block', marginTop: '4px' }}>
                Depth
              </Text>
              <Text strong style={{ fontSize: '12px' }}>
                Expert
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Background Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(4px)',
        zIndex: -1
      }} />
    </div>
  );
};

export default DeepResearchIndicator; 