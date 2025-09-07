// ResetPassword.jsx
import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Row, Col, Typography, Space } from 'antd';
import toast from "react-hot-toast"; // Already imported
import { LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { resetPassword } from '../api/auth';

const { Title, Text } = Typography;

const ResetPassword = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await resetPassword(token, values.password);
      toast.success('Password reset successfully!'); // Changed from message.success
      navigate('/signin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed'); // Changed from message.error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Row justify="center" style={{ width: '100%', maxWidth: '1200px' }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Card
            style={{
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: 'none',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '40px 32px' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px auto'
                }}>
                  <SafetyCertificateOutlined style={{ fontSize: '40px', color: 'white' }} />
                </div>
                <Title 
                  level={2} 
                  style={{ 
                    color: '#1e293b',
                    marginBottom: '8px',
                    fontSize: '28px',
                    fontWeight: '700'
                  }}
                >
                  Reset Your Password
                </Title>
                <Text style={{ 
                  color: '#64748b',
                  fontSize: '16px',
                  lineHeight: '1.5'
                }}>
                  Create a new password for your account
                </Text>
              </div>

              {/* Form */}
              <Form
                name="reset_password"
                onFinish={onFinish}
                layout="vertical"
                className="auth-form"
              >
                <Form.Item
                  name="password"
                  label={<span style={{ fontWeight: '600', color: '#374151' }}>New Password</span>}
                  rules={[
                    { required: true, message: 'Please input your new password!' },
                    { min: 8, message: 'Password must be at least 8 characters' }
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                    placeholder="New password"
                    size="large"
                    style={{
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      padding: '12px 16px',
                      fontSize: '16px'
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="confirm"
                  label={<span style={{ fontWeight: '600', color: '#374151' }}>Confirm Password</span>}
                  dependencies={['password']}
                  hasFeedback
                  rules={[
                    { required: true, message: 'Please confirm your password!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords do not match!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                    placeholder="Confirm new password"
                    size="large"
                    style={{
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      padding: '12px 16px',
                      fontSize: '16px'
                    }}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: '24px' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      height: '52px',
                      fontSize: '16px',
                      fontWeight: '600',
                      boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    Reset Password
                  </Button>
                </Form.Item>
              </Form>

              {/* Footer */}
              <div style={{ textAlign: 'center', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                <Text style={{ color: '#64748b' }}>
                  Remember your password?{' '}
                  <Link 
                    to="/signin" 
                    style={{ 
                      color: '#1e3a8a',
                      fontWeight: '600',
                      textDecoration: 'none'
                    }}
                  >
                    Sign in
                  </Link>
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ResetPassword;