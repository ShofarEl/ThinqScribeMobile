import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button } from 'antd'; // Removed message from antd
import { MailOutlined } from '@ant-design/icons';
import AuthLayout from "../Authlayout";
import { requestPasswordReset } from '../api/auth';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await requestPasswordReset(values.email);
      navigate('/signin');
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your email to receive a password reset link"
      footerText="Remember your password?"
      footerLink="/signin"
      footerLinkText="Sign in"
    >
      <Form
        name="forgot_password"
        onFinish={onFinish}
        layout="vertical"
        className="auth-form"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-[#415A77]" />}
            placeholder="Email address"
            size="large"
            className="rounded-lg border-[#415A77] hover:border-[#E0B13A] focus:border-[#E0B13A]"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full bg-[#E0B13A] hover:bg-[#F0C14B] border-none rounded-lg h-12 font-semibold text-lg shadow-md transition-all duration-300 hover:scale-[1.02]"
          >
            Send Reset Link
          </Button>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
};

export default ForgotPassword;