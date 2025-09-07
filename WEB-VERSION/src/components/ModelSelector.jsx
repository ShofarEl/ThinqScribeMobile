import React, { useState, useEffect } from 'react';
import { 
  Select, 
  Card, 
  Badge, 
  Tooltip, 
  Row, 
  Col, 
  Slider, 
  Switch, 
  Typography, 
  Space,
  Collapse,
  Tag,
  Progress,
  Divider
} from 'antd';
import {
  ThunderboltOutlined,
  BulbOutlined,
  StarFilled,
  SettingOutlined,
  FileTextOutlined,
  SearchOutlined,
  BranchesOutlined,
  BookOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { getModelCapabilities, getResearchDepthInfo } from '../api/aiChat';

const { Option } = Select;
const { Text, Title } = Typography;
const { Panel } = Collapse;

const ModelSelector = ({ 
  selectedModel, 
  onModelChange, 
  models = [], 
  settings = {}, 
  onSettingsChange,
  showAdvanced = false,
  disabled = false 
}) => {
  const [localSettings, setLocalSettings] = useState({
    temperature: 0.9,
    maxTokens: 40000,
    deepResearch: false,
    researchDepth: 'moderate',
    streaming: true,
    ...settings
  });

  useEffect(() => {
    setLocalSettings(prev => ({ ...prev, ...settings }));
  }, [settings]);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const getModelIcon = (modelId) => {
    const icons = {
      genius_pro: <StarFilled style={{ color: '#1890ff' }} />,
      lightning_think: <ThunderboltOutlined style={{ color: '#722ed1' }} />,
      smart_assistant: <BulbOutlined style={{ color: '#52c41a' }} />
    };
    return icons[modelId] || <FileTextOutlined />;
  };

  const getModelColor = (modelId) => {
    const colors = {
      genius_pro: 'blue',
      lightning_think: 'purple', 
      smart_assistant: 'green'
    };
    return colors[modelId] || 'default';
  };

  const getCurrentModel = () => {
    return models.find(m => m.id === selectedModel) || models[0];
  };

  const currentModel = getCurrentModel();
  const capabilities = currentModel ? getModelCapabilities(currentModel) : {};
  const researchInfo = getResearchDepthInfo(localSettings.researchDepth);

  const temperatureMarks = {
    0: '🎯 Focused',
    0.5: '⚖️ Balanced', 
    1: '🎨 Creative',
    1.5: '🚀 Innovative',
    2: '🌟 Wild'
  };

  const tokenMarks = {
    1000: '1K',
    10000: '10K',
    20000: '20K',
    40000: '40K'
  };

  return (
    <Card 
      title={
        <Space>
          <SettingOutlined />
          <span>AI Model & Settings</span>
        </Space>
      }
      size="small"
      style={{ marginBottom: 16 }}
    >
      {/* Model Selection */}
      <div style={{ marginBottom: 16 }}>
        <Text strong>Model Selection</Text>
        <Select
          value={selectedModel}
          onChange={onModelChange}
          style={{ width: '100%', marginTop: 8 }}
          disabled={disabled}
          placeholder="Select AI Model"
        >
          {models.map(model => (
            <Option key={model.id} value={model.id}>
              <Space>
                {getModelIcon(model.id)}
                <span>{model.name}</span>
                <Badge 
                  count={capabilities.supportsFiles ? 'Files' : null} 
                  size="small" 
                  color="blue" 
                />
                <Badge 
                  count={capabilities.supportsResearch ? 'Research' : null} 
                  size="small" 
                  color="green" 
                />
              </Space>
            </Option>
          ))}
        </Select>
        
        {/* Model Info */}
        {currentModel && (
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {currentModel.description}
            </Text>
            <div style={{ marginTop: 4 }}>
              <Space size={4}>
                {capabilities.supportsFiles && (
                  <Tag color="blue" size="small">
                    <FileTextOutlined /> Files
                  </Tag>
                )}
                {capabilities.supportsResearch && (
                  <Tag color="green" size="small">
                    <SearchOutlined /> Research
                  </Tag>
                )}
                {capabilities.supportsStreaming && (
                  <Tag color="orange" size="small">
                    <ThunderboltOutlined /> Streaming
                  </Tag>
                )}
                {capabilities.supportsReasoning && (
                  <Tag color="purple" size="small">
                    <BranchesOutlined /> Reasoning
                  </Tag>
                )}
              </Space>
            </div>
          </div>
        )}
      </div>

      {/* Research Settings */}
      {capabilities.supportsResearch && (
        <div style={{ marginBottom: 16 }}>
          <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text strong>Deep Research</Text>
            <Switch
              checked={localSettings.deepResearch}
              onChange={(checked) => handleSettingChange('deepResearch', checked)}
              disabled={disabled}
            />
          </Space>
          
          {localSettings.deepResearch && (
            <div style={{ marginTop: 12 }}>
              <Text>Research Depth</Text>
              <Select
                value={localSettings.researchDepth}
                onChange={(value) => handleSettingChange('researchDepth', value)}
                style={{ width: '100%', marginTop: 4 }}
                disabled={disabled}
              >
                {['light', 'moderate', 'deep'].map(depth => {
                  const info = getResearchDepthInfo(depth);
                  return (
                    <Option key={depth} value={depth}>
                      <Space>
                        <span>{info.icon}</span>
                        <span>{info.name}</span>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          ({info.estimatedTime})
                        </Text>
                      </Space>
                    </Option>
                  );
                })}
              </Select>
              
              <div style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                <Space direction="vertical" size={0} style={{ width: '100%' }}>
                  <Text style={{ fontSize: '12px' }}>
                    <strong>{researchInfo.name}:</strong> {researchInfo.description}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    Est. time: {researchInfo.estimatedTime} | Tokens: {researchInfo.tokenRange}
                  </Text>
                </Space>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Settings */}
      {showAdvanced && (
        <Collapse ghost>
          <Panel header="Advanced Settings" key="advanced">
            {/* Temperature */}
            <div style={{ marginBottom: 16 }}>
              <Text strong>Creativity Level (Temperature: {localSettings.temperature})</Text>
              <Slider
                min={0}
                max={2}
                step={0.1}
                value={localSettings.temperature}
                onChange={(value) => handleSettingChange('temperature', value)}
                marks={temperatureMarks}
                disabled={disabled}
                style={{ marginTop: 8 }}
              />
            </div>

            {/* Max Tokens */}
            <div style={{ marginBottom: 16 }}>
              <Text strong>Response Length (Max Tokens: {localSettings.maxTokens.toLocaleString()})</Text>
              <Slider
                min={1000}
                max={capabilities.maxTokens || 40000}
                step={1000}
                value={localSettings.maxTokens}
                onChange={(value) => handleSettingChange('maxTokens', value)}
                marks={tokenMarks}
                disabled={disabled}
                style={{ marginTop: 8 }}
              />
              <Progress 
                percent={(localSettings.maxTokens / (capabilities.maxTokens || 40000)) * 100}
                size="small"
                showInfo={false}
                strokeColor={getModelColor(selectedModel)}
              />
            </div>

            {/* Streaming */}
            {capabilities.supportsStreaming && (
              <div style={{ marginBottom: 16 }}>
                <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space>
                    <Text strong>Real-time Streaming</Text>
                    <Tooltip title="Show response as it's generated">
                      <ThunderboltOutlined style={{ color: '#1890ff' }} />
                    </Tooltip>
                  </Space>
                  <Switch
                    checked={localSettings.streaming}
                    onChange={(checked) => handleSettingChange('streaming', checked)}
                    disabled={disabled}
                  />
                </Space>
              </div>
            )}
          </Panel>
        </Collapse>
      )}

      {/* Model Statistics */}
      {currentModel && (
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
          <Row gutter={8}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: '11px' }}>Max Tokens</Text>
                <div>
                  <Text strong style={{ fontSize: '12px' }}>
                    {(capabilities.maxTokens || 40000).toLocaleString()}
                  </Text>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: '11px' }}>File Support</Text>
                <div>
                  <Text strong style={{ fontSize: '12px' }}>
                    {capabilities.supportsFiles ? '✅' : '❌'}
                  </Text>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: '11px' }}>Research</Text>
                <div>
                  <Text strong style={{ fontSize: '12px' }}>
                    {capabilities.supportsResearch ? '🔬' : '❌'}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </Card>
  );
};

export default ModelSelector; 