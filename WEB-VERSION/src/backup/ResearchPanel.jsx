import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Select,
  Typography,
  Space,
  Tooltip,
  Tag,
  Progress,
  Alert,
  Divider,
  Row,
  Col,
  Upload,
  message,
  Input,
  Slider,
  Switch,
  Badge,
  Timeline,
  Collapse,
  Steps
} from 'antd';
import {
  SearchOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  ClockCircleOutlined,
  BulbOutlined,
  BookOutlined,
  BarChartOutlined,
  PaperClipOutlined,
  DeleteOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  SettingOutlined,
  StarOutlined,
  FireOutlined,
  TrophyOutlined,
  RadarChartOutlined,
  SecurityScanOutlined,
  CloudOutlined
} from '@ant-design/icons';
import { getResearchDepthInfo, getModelCapabilities } from '../api/aiChat';

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;
const { Step } = Steps;

const ResearchPanel = ({
  onStartResearch,
  isLoading = false,
  selectedModel,
  models = [],
  uploadedFiles = [],
  onFileUpload,
  onFileRemove,
  researchProgress = null
}) => {
  const [researchType, setResearchType] = useState('general');
  const [researchDepth, setResearchDepth] = useState('moderate');
  const [customQuery, setCustomQuery] = useState('');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(40000);
  const [enableStreaming, setEnableStreaming] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const currentModel = models.find(m => m.id === selectedModel) || models[0];
  const capabilities = currentModel ? getModelCapabilities(currentModel) : {};
  const depthInfo = getResearchDepthInfo(researchDepth);

  const researchTypes = [
    {
      value: 'general',
      label: 'Comprehensive Research',
      description: 'Multi-perspective analysis with deep insights',
      icon: <SearchOutlined />,
      color: '#1890ff',
      premium: false,
      prompt: 'Conduct comprehensive research with multiple perspectives, evidence-based analysis, and actionable insights.'
    },
    {
      value: 'academic',
      label: 'Academic Research',
      description: 'Scholarly analysis with citations and methodology',
      icon: <BookOutlined />,
      color: '#722ed1',
      premium: true,
      prompt: 'Provide rigorous academic analysis with scholarly sources, methodological framework, and peer-reviewed evidence.'
    },
    {
      value: 'market',
      label: 'Market Intelligence',
      description: 'Strategic business insights and trend analysis',
      icon: <BarChartOutlined />,
      color: '#13c2c2',
      premium: true,
      prompt: 'Analyze market dynamics, competitive landscape, opportunities, and provide strategic recommendations with data-driven insights.'
    },
    {
      value: 'technical',
      label: 'Technical Deep Dive',
      description: 'Advanced technical exploration with implementations',
      icon: <ExperimentOutlined />,
      color: '#52c41a',
      premium: true,
      prompt: 'Provide detailed technical analysis including architecture, implementation strategies, best practices, and expert recommendations.'
    },
    {
      value: 'competitive',
      label: 'Competitive Analysis',
      description: 'Compare solutions and alternatives systematically',
      icon: <RadarChartOutlined />,
      color: '#fa8c16',
      premium: true,
      prompt: 'Conduct systematic competitive analysis with feature comparison, pros/cons, market positioning, and strategic recommendations.'
    },
    {
      value: 'trend',
      label: 'Trend Analysis',
      description: 'Future predictions and emerging patterns',
      icon: <RocketOutlined />,
      color: '#f5222d',
      premium: true,
      prompt: 'Analyze current trends, predict future developments, identify emerging patterns, and provide forward-looking insights.'
    }
  ];

  const researchSteps = [
    { title: 'Query Analysis', description: 'Understanding your research needs' },
    { title: 'Source Gathering', description: 'Collecting relevant information' },
    { title: 'Deep Analysis', description: 'Processing and analyzing data' },
    { title: 'Synthesis', description: 'Generating comprehensive insights' },
    { title: 'Validation', description: 'Ensuring accuracy and completeness' }
  ];

  useEffect(() => {
    if (isLoading && researchProgress) {
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < 4) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setCurrentStep(0);
    }
  }, [isLoading, researchProgress]);

  const handleStartResearch = (query = null) => {
    const selectedType = researchTypes.find(t => t.value === researchType);
    const finalQuery = query || customQuery;
    
    if (!finalQuery.trim()) {
      message.warning('Please enter a research query');
      return;
    }

    const enhancedQuery = `${selectedType.prompt}\n\nResearch Query: ${finalQuery}`;
    
    onStartResearch({
      message: enhancedQuery,
      researchDepth,
      researchType,
      settings: {
        deepResearch: true,
        researchDepth,
        temperature: advancedMode ? temperature : (researchType === 'academic' ? 0.3 : 0.7),
        maxTokens: advancedMode ? maxTokens : 40000,
        streaming: enableStreaming
      }
    });
  };

  const getEstimatedCost = () => {
    const baseCost = researchDepth === 'light' ? 1 : researchDepth === 'moderate' ? 2 : 3;
    const typeCost = researchTypes.find(t => t.value === researchType)?.premium ? 1 : 0;
    const fileCost = uploadedFiles.length > 0 ? 1 : 0;
    return baseCost + typeCost + fileCost;
  };

  const quickTemplates = [
    { label: 'AI & Machine Learning Trends', query: 'Latest developments in artificial intelligence and machine learning technologies, their applications, and future implications' },
    { label: 'Sustainable Technology Solutions', query: 'Innovative sustainable technologies addressing climate change and environmental challenges' },
    { label: 'Quantum Computing Advances', query: 'Current state of quantum computing, breakthrough developments, and potential applications across industries' },
    { label: 'Blockchain & Web3 Evolution', query: 'Evolution of blockchain technology, decentralized systems, and the future of Web3' },
    { label: 'Healthcare Innovation', query: 'Emerging healthcare technologies, digital health solutions, and personalized medicine advances' },
    { label: 'Space Technology & Exploration', query: 'Recent advances in space technology, commercial space industry, and exploration missions' }
  ];

  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', padding: '1px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <BulbOutlined style={{ color: 'white', fontSize: '18px' }} />
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600' }}>AI Research Assistant</span>
              <Badge count="Premium" style={{ backgroundColor: '#722ed1' }} />
            </Space>
            <Tag color="gold" icon={<TrophyOutlined />}>Pro</Tag>
          </div>
        }
        style={{ 
          background: 'white', 
          borderRadius: '16px',
          border: 'none',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        {/* Research Progress Steps */}
        {isLoading && (
          <div style={{ marginBottom: '24px' }}>
            <Card 
              size="small" 
              style={{ 
                background: 'linear-gradient(135deg, #f6f9fc 0%, #e9f4ff 100%)',
                border: '1px solid #e6f3ff',
                borderRadius: '12px'
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>
                  <ThunderboltOutlined /> Research in Progress
                </Text>
              </div>
              <Steps 
                current={currentStep}
                size="small"
                style={{ marginBottom: '16px' }}
              >
                {researchSteps.map((step, index) => (
                  <Step key={index} title={step.title} description={step.description} />
                ))}
              </Steps>
              <Progress 
                percent={Math.min(((currentStep + 1) / researchSteps.length) * 100, 100)}
                status="active"
                strokeColor={{
                  '0%': '#667eea',
                  '100%': '#764ba2',
                }}
                trailColor="#f0f0f0"
                strokeWidth={8}
                style={{ marginBottom: '8px' }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <FireOutlined /> Performing {depthInfo.name} analysis with {selectedModel}
              </Text>
            </Card>
          </div>
        )}

        {/* Research Query Input */}
        <div style={{ marginBottom: '20px' }}>
          <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            Research Query
          </Text>
          <TextArea
            placeholder="Enter your research question or topic for comprehensive analysis..."
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            rows={3}
            style={{
              borderRadius: '8px',
              border: '2px solid #f0f0f0',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#f0f0f0';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Research Type Selection */}
        <div style={{ marginBottom: '20px' }}>
          <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '12px' }}>
            Research Type
          </Text>
          <Row gutter={[12, 12]}>
            {researchTypes.map(type => (
              <Col span={8} key={type.value}>
                <Card
                  size="small"
                  hoverable
                  style={{
                    border: researchType === type.value ? `2px solid ${type.color}` : '1px solid #f0f0f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: researchType === type.value ? `${type.color}10` : 'white'
                  }}
                  onClick={() => setResearchType(type.value)}
                  bodyStyle={{ padding: '12px' }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      color: type.color, 
                      fontSize: '20px', 
                      marginBottom: '8px' 
                    }}>
                      {type.icon}
                    </div>
                    <Text strong style={{ fontSize: '12px', display: 'block' }}>
                      {type.label}
                    </Text>
                    {type.premium && (
                      <Tag size="small" color="gold" style={{ marginTop: '4px' }}>
                        Premium
                      </Tag>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
            {researchTypes.find(t => t.value === researchType)?.description}
          </Text>
        </div>

        {/* Research Depth & Settings */}
        <Row gutter={16} style={{ marginBottom: '20px' }}>
          <Col span={12}>
            <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              Research Depth
            </Text>
            <Select
              value={researchDepth}
              onChange={setResearchDepth}
              style={{ width: '100%' }}
              size="large"
            >
              {['light', 'moderate', 'deep'].map(depth => {
                const info = getResearchDepthInfo(depth);
                return (
                  <Option key={depth} value={depth}>
                    <Space>
                      <span style={{ fontSize: '16px' }}>{info.icon}</span>
                      <div>
                        <div>{info.name}</div>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {info.estimatedTime}
                        </Text>
                      </div>
                    </Space>
                  </Option>
                );
              })}
            </Select>
          </Col>
          <Col span={12}>
            <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              Quick Settings
            </Text>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: '12px' }}>Advanced Mode</Text>
                <Switch 
                  size="small" 
                  checked={advancedMode}
                  onChange={setAdvancedMode}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: '12px' }}>Real-time Streaming</Text>
                <Switch 
                  size="small" 
                  checked={enableStreaming}
                  onChange={setEnableStreaming}
                />
              </div>
            </Space>
          </Col>
        </Row>

        {/* Advanced Settings Panel */}
        {advancedMode && (
          <Collapse 
            size="small" 
            style={{ marginBottom: '20px' }}
            ghost
          >
            <Panel 
              header={
                <Space>
                  <SettingOutlined />
                  <Text strong>Advanced Research Settings</Text>
                </Space>
              } 
              key="1"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                    Creativity Level: {temperature}
                  </Text>
                  <Slider
                    min={0.1}
                    max={2.0}
                    step={0.1}
                    value={temperature}
                    onChange={setTemperature}
                    marks={{
                      0.1: 'Precise',
                      1.0: 'Balanced',
                      2.0: 'Creative'
                    }}
                  />
                </Col>
                <Col span={12}>
                  <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                    Max Tokens: {maxTokens}
                  </Text>
                  <Slider
                    min={10000}
                    max={40000}
                    step={5000}
                    value={maxTokens}
                    onChange={setMaxTokens}
                    marks={{
                      10000: '10K',
                      25000: '25K',
                      40000: '40K'
                    }}
                  />
                </Col>
              </Row>
            </Panel>
          </Collapse>
        )}

        {/* Research Stats */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f6f9fc 0%, #e9f4ff 100%)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <Row gutter={16}>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <ClockCircleOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
                <Text style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                  {depthInfo.estimatedTime}
                </Text>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <DatabaseOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                <Text style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                  {depthInfo.tokenRange}
                </Text>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <StarOutlined style={{ fontSize: '16px', color: '#fa8c16' }} />
                <Text style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                  {getEstimatedCost()} Credits
                </Text>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <PaperClipOutlined style={{ fontSize: '16px', color: '#722ed1' }} />
                <Text style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                  {uploadedFiles.length} Files
                </Text>
              </div>
            </Col>
          </Row>
        </div>

        {/* File Upload */}
        {capabilities.supportsFiles && (
          <div style={{ marginBottom: '20px' }}>
            <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              Research Documents
            </Text>
            <Upload.Dragger
              multiple
              maxCount={10}
              beforeUpload={() => false}
              onChange={(info) => onFileUpload?.(info.fileList)}
              style={{ 
                borderRadius: '8px',
                border: '2px dashed #d9d9d9',
                background: '#fafafa'
              }}
              disabled={isLoading}
            >
              <p className="ant-upload-drag-icon">
                <CloudOutlined style={{ color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">Drop files here or click to upload</p>
              <p className="ant-upload-hint">
                Support PDF, DOC, TXT, and more research documents
              </p>
            </Upload.Dragger>
          </div>
        )}

        {/* Action Buttons */}
        <Row gutter={12} style={{ marginBottom: '20px' }}>
          <Col span={16}>
            <Button
              type="primary"
              size="large"
              block
              onClick={() => handleStartResearch()}
              loading={isLoading}
              disabled={!customQuery.trim()}
              style={{
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              {isLoading ? 'Researching...' : 'Start Research'}
            </Button>
          </Col>
          <Col span={8}>
            <Button
              size="large"
              block
              style={{
                height: '48px',
                borderRadius: '12px',
                border: '2px solid #667eea',
                color: '#667eea',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onClick={() => setCustomQuery('')}
            >
              Clear
            </Button>
          </Col>
        </Row>

        {/* Quick Templates */}
        <div>
          <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '12px' }}>
            <RocketOutlined /> Quick Research Templates
          </Text>
          <Row gutter={[8, 8]}>
            {quickTemplates.map((template, index) => (
              <Col span={12} key={index}>
                <Button
                  size="small"
                  block
                  onClick={() => {
                    setCustomQuery(template.query);
                    handleStartResearch(template.query);
                  }}
                  disabled={isLoading}
                  style={{
                    textAlign: 'left',
                    height: 'auto',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                    fontSize: '12px',
                    whiteSpace: 'normal'
                  }}
                >
                  {template.label}
                </Button>
              </Col>
            ))}
          </Row>
        </div>

        {/* Premium Features Notice */}
        <Alert
          message="Premium Research Features"
          description={
            <div>
              <Paragraph style={{ fontSize: '12px', margin: 0 }}>
                • Advanced research types with specialized analysis
                • Multi-source data synthesis and validation
                • Real-time progress tracking and streaming
                • Custom research parameters and fine-tuning
                • Document analysis and knowledge integration
              </Paragraph>
            </div>
          }
          type="info"
          showIcon
          icon={<TrophyOutlined />}
          style={{ 
            marginTop: '16px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #f6f9fc 0%, #e9f4ff 100%)',
            border: '1px solid #e6f3ff'
          }}
        />
      </Card>
    </div>
  );
};

export default ResearchPanel; 