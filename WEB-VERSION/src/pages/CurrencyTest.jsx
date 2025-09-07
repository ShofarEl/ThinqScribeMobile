import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Typography, Space, Tag, Alert, Divider } from 'antd';
import { ReloadOutlined, GlobalOutlined, DollarOutlined } from '@ant-design/icons';
import { useCurrency } from '../hooks/useCurrency';
import { getUserLocationAndCurrency } from '../utils/currencyUtils';
import LocationDisplay from '../components/LocationDisplay';

const { Title, Text, Paragraph } = Typography;

const CurrencyTest = () => {
  const { 
    currency, 
    symbol, 
    location, 
    exchangeRate, 
    loading, 
    error, 
    format,
    formatLocalAsync,
    testRefresh,
    isNGN,
    countryName,
    flag
  } = useCurrency();

  const [testResults, setTestResults] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const addTestResult = (test, result, status = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { test, result, status, timestamp }]);
  };

  const runLocationTest = async () => {
    try {
      addTestResult('Location Detection', 'Testing location detection...', 'info');
      const locationData = await getUserLocationAndCurrency();
      addTestResult('Location Detection', `Success: ${JSON.stringify(locationData)}`, 'success');
    } catch (error) {
      addTestResult('Location Detection', `Error: ${error.message}`, 'error');
    }
  };

  const runCurrencyTest = () => {
    addTestResult('Currency Format Test', 'Testing currency formatting...', 'info');
    
    try {
      const testAmounts = [100, 1500, 25000, 150000];
      testAmounts.forEach(amount => {
        const formatted = format(amount);
        addTestResult(`Format ${amount}`, `${formatted}`, 'success');
      });
      
      addTestResult('Currency Format Test', 'All formatting tests completed successfully', 'success');
    } catch (error) {
      addTestResult('Currency Format Test', `Error: ${error.message}`, 'error');
    }
  };

  const runFullRefresh = async () => {
    setRefreshing(true);
    try {
      addTestResult('Full Refresh', 'Refreshing currency system...', 'info');
      await testRefresh();
      addTestResult('Full Refresh', 'Currency system refreshed successfully', 'success');
    } catch (error) {
      addTestResult('Full Refresh', `Error: ${error.message}`, 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  useEffect(() => {
    // Auto-run initial tests
    runLocationTest();
    runCurrencyTest();
  }, []);

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={2}>🧪 Currency & Location Detection Test</Title>
        
        {/* Current State Display */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} md={12}>
            <Card title="Current Currency State" style={{ height: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Loading: </Text>
                  <Tag color={loading ? 'blue' : 'green'}>{loading ? 'True' : 'False'}</Tag>
                </div>
                <div>
                  <Text strong>Currency: </Text>
                  <Tag color={isNGN ? 'green' : 'blue'}>{currency?.toUpperCase()}</Tag>
                </div>
                <div>
                  <Text strong>Symbol: </Text>
                  <Tag>{symbol}</Tag>
                </div>
                <div>
                  <Text strong>Exchange Rate: </Text>
                  <Tag color="orange">{exchangeRate}</Tag>
                </div>
                <div>
                  <Text strong>Is Nigerian: </Text>
                  <Tag color={isNGN ? 'green' : 'red'}>{isNGN ? 'Yes' : 'No'}</Tag>
                </div>
                {error && (
                  <Alert message="Error" description={error} type="error" showIcon />
                )}
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Location Information" style={{ height: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Country: </Text>
                  <Text>{flag} {countryName}</Text>
                </div>
                <div>
                  <Text strong>City: </Text>
                  <Text>{location?.city || 'Unknown'}</Text>
                </div>
                <div>
                  <Text strong>Country Code: </Text>
                  <Tag>{location?.countryCode?.toUpperCase()}</Tag>
                </div>
                <div>
                  <Text strong>IP: </Text>
                  <Text code>{location?.ip || 'Unknown'}</Text>
                </div>
                <Divider />
                <LocationDisplay />
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Test Controls */}
        <Card title="Test Controls" style={{ marginBottom: '24px' }}>
          <Space wrap>
            <Button 
              type="primary" 
              icon={<GlobalOutlined />}
              onClick={runLocationTest}
            >
              Test Location
            </Button>
            <Button 
              type="default" 
              icon={<DollarOutlined />}
              onClick={runCurrencyTest}
            >
              Test Currency Format
            </Button>
            <Button 
              type="dashed" 
              icon={<ReloadOutlined />}
              onClick={runFullRefresh}
              loading={refreshing}
            >
              Full Refresh
            </Button>
            <Button onClick={clearResults}>
              Clear Results
            </Button>
          </Space>
        </Card>

        {/* Test Results */}
        <Card title="Test Results" style={{ marginBottom: '24px' }}>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {testResults.length === 0 ? (
              <Text type="secondary">No test results yet. Run some tests above.</Text>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }}>
                {testResults.map((result, index) => (
                  <Alert
                    key={index}
                    message={`[${result.timestamp}] ${result.test}`}
                    description={result.result}
                    type={result.status}
                    showIcon
                    style={{ marginBottom: '8px' }}
                  />
                ))}
              </Space>
            )}
          </div>
        </Card>

        {/* Debug Information */}
        <Card title="Debug Information">
          <Paragraph>
            <Text strong>Expected for Nigeria:</Text>
            <ul>
              <li>Currency: NGN</li>
              <li>Symbol: ₦</li>
              <li>Country Code: ng</li>
              <li>Location should show Nigerian flag 🇳🇬</li>
            </ul>
          </Paragraph>
          
          <Paragraph>
            <Text strong>Raw Location Object:</Text>
            <pre style={{ background: '#f5f5f5', padding: '8px', fontSize: '12px' }}>
              {JSON.stringify(location, null, 2)}
            </pre>
          </Paragraph>
        </Card>
      </div>
    </div>
  );
};

export default CurrencyTest; 