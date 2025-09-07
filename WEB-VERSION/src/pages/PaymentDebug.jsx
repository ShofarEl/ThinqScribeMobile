import React from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Card, Typography, Tag, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const PaymentDebug = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const allParams = {};
  for (let [key, value] of searchParams.entries()) {
    allParams[key] = value;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>Payment URL Debug Information</Title>
        
        <div style={{ marginBottom: '20px' }}>
          <Text strong>Full URL:</Text>
          <Paragraph code>{window.location.href}</Paragraph>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Text strong>Pathname:</Text>
          <Tag>{location.pathname}</Tag>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Text strong>URL Parameters:</Text>
          <div style={{ marginTop: '10px' }}>
            {Object.keys(allParams).length > 0 ? (
              Object.entries(allParams).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '5px' }}>
                  <Text strong>{key}:</Text> <Tag color="blue">{value}</Tag>
                </div>
              ))
            ) : (
              <Text type="secondary">No URL parameters found</Text>
            )}
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <Button 
            type="primary" 
            onClick={() => navigate('/payment/success?reference=test123&status=success&agreement=507f1f77bcf86cd799439011')}
            style={{ marginRight: '10px' }}
          >
            Test Success URL
          </Button>
          <Button 
            onClick={() => navigate('/payment/failed?reference=test123&status=failed')}
            style={{ marginRight: '10px' }}
          >
            Test Failed URL
          </Button>
          <Button 
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentDebug; 