import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography, Space } from 'antd';
import { MessageOutlined, TeamOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text } = Typography;

const ChatWriterPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isDismissed) return;

    const timer = setInterval(() => {
      setIsVisible(true);
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(timer);
  }, [isDismissed]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  const handleChatWriter = () => {
    setIsVisible(false);
    navigate('/writers');
  };

  const handleAfterClose = () => {
    if (!isDismissed) {
      // Auto-show again after 30 minutes if not permanently dismissed
      setTimeout(() => {
        setIsVisible(true);
      }, 30 * 60 * 1000); // 30 minutes
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <Modal
          open={isVisible}
          onCancel={handleClose}
          footer={null}
          closable={false}
          width={400}
          centered
          className="chat-writer-popup"
          afterClose={handleAfterClose}
          styles={{
            mask: {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(4px)'
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              borderRadius: '20px',
              padding: '32px',
              color: 'white',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            {/* Close button */}
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={handleDismiss}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                color: 'rgba(255,255,255,0.7)',
                border: 'none',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />

            <div style={{ marginBottom: '24px' }}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ display: 'inline-block', marginBottom: '16px' }}
              >
                <MessageOutlined style={{ fontSize: '48px', color: 'white' }} />
              </motion.div>
              
              <Title level={2} style={{ color: 'white', marginBottom: '8px', fontWeight: 'bold' }}>
                Need Academic Help? 💡
              </Title>
              
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', lineHeight: '1.5' }}>
                Connect with expert writers who can help you excel in your studies!
              </Text>
            </div>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Button
                type="primary"
                size="large"
                icon={<TeamOutlined />}
                onClick={handleChatWriter}
                style={{
                  background: 'white',
                  color: '#1e3a8a',
                  border: 'none',
                  borderRadius: '12px',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '600',
                  width: '100%',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                Chat a Writer Now
              </Button>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>500+</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>Expert Writers</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>24/7</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>Support</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>98%</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>Satisfaction</div>
                </div>
              </div>
            </Space>

            <div style={{ marginTop: '20px' }}>
              <Button
                type="text"
                onClick={handleClose}
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '14px',
                  padding: '4px 8px'
                }}
              >
                Maybe later
              </Button>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default ChatWriterPopup; 