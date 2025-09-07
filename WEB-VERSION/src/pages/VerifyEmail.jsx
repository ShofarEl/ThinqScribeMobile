/*import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin, message, Form, Input } from 'antd';
import { CheckCircleOutlined, LoadingOutlined, MailOutlined } from '@ant-design/icons';
import AuthLayout from '../Authlayout';
import { verifyEmail, resendVerificationEmail } from '../api/auth';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const hasVerified = useRef(false); // Prevent multiple API calls

  useEffect(() => {
    const verifyToken = async () => {
      // Prevent multiple calls
      if (hasVerified.current) return;
      
      // Mark as attempting verification
      hasVerified.current = true;
      
      try {
        await verifyEmail(token);
        setStatus('success');
        // Don't show message here as it's already handled by the interceptor
      } catch (error) {
        setStatus('error');
        if (error.response?.data?.code === 'TOKEN_EXPIRED') {
          message.error('Verification link has expired');
          setShowResendForm(true);
        } else {
          // Error message is already handled by the axios interceptor
          console.error('Verification failed:', error);
        }
      }
    };

    if (token && !hasVerified.current) {
      verifyToken();
    }
  }, [token]); // Only depend on token

  const handleResend = async (values) => {
    setResendLoading(true);
    try {
      await resendVerificationEmail(values.email);
      // Success message handled by interceptor
      setShowResendForm(false);
    } catch (error) {
      // Error message handled by interceptor
      console.error('Resend failed:', error);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Email Verification"
      subtitle={status === 'verifying' ? 'Verifying your email...' : ''}
      hideFooter
    >
      <div className="text-center">
        {status === 'verifying' && (
          <div className="py-12">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} />} />
            <p className="mt-6 text-[#415A77]">Please wait while we verify your email</p>
          </div>
        )}

        {status === 'success' && (
          <Result
            icon={<CheckCircleOutlined className="text-[#52c41a]" />}
            title="Email Verified Successfully!"
            subTitle="Your email address has been confirmed. You can now sign in to your account."
            extra={[
              <Button
                type="primary"
                key="signin"
                className="bg-[#E0B13A] hover:bg-[#F0C14B] border-none rounded-lg h-12 font-semibold text-lg shadow-md"
                onClick={() => navigate('/signin')}
              >
                Sign In Now
              </Button>,
            ]}
          />
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <Result
              status="error"
              title="Verification Failed"
              subTitle="The verification link is invalid or has expired."
            />

            {showResendForm ? (
              <div className="max-w-md mx-auto">
                <Form
                  name="resend_verification"
                  onFinish={handleResend}
                  layout="vertical"
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
                      placeholder="Your email address"
                      size="large"
                      className="rounded-lg border-[#415A77] hover:border-[#E0B13A] focus:border-[#E0B13A]"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={resendLoading}
                      className="w-full bg-[#E0B13A] hover:bg-[#F0C14B] border-none rounded-lg h-12 font-semibold text-lg shadow-md"
                    >
                      Resend Verification Email
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            ) : (
              <Button
                type="primary"
                className="bg-[#E0B13A] hover:bg-[#F0C14B] border-none rounded-lg h-12 font-semibold text-lg shadow-md"
                onClick={() => navigate('/signin')}
              >
                Return to Sign In
              </Button>
            )}
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;*/