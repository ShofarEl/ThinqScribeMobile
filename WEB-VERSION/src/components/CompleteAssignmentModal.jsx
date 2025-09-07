import React from 'react';
import { Modal, Button, notification } from 'antd';
import { CheckCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';

const CompleteAssignmentModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  projectTitle = "this assignment",
  loading = false 
}) => {
  
  const handleOk = async () => {
    console.log('🎯 [Modal] User confirmed completion');
    if (onConfirm) {
      await onConfirm();
    }
  };

  const handleCancel = () => {
    console.log('❌ [Modal] User cancelled completion');
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />
          <span style={{ fontSize: '18px', fontWeight: '600' }}>Complete Assignment</span>
        </div>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={520}
      centered
      maskClosable={false}
      confirmLoading={loading}
      okText="✓ Yes, Complete Assignment"
      cancelText="Cancel"
      okButtonProps={{
        size: 'large',
        style: { 
          height: '44px',
          background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
        }
      }}
      cancelButtonProps={{
        size: 'large',
        style: { 
          height: '44px',
          borderRadius: '8px',
          fontWeight: '600'
        }
      }}
      styles={{
        body: { padding: '24px' },
        header: { borderBottom: '1px solid #f0f0f0', marginBottom: '16px' }
      }}
    >
      <div style={{ padding: '8px 0' }}>
        <p style={{ fontSize: '16px', marginBottom: '16px', lineHeight: '1.5' }}>
          Are you sure you want to mark <strong>"{projectTitle}"</strong> as completed?
        </p>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9e7 100%)', 
          border: '1px solid #b7eb8f', 
          borderRadius: '12px', 
          padding: '16px', 
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(82, 196, 26, 0.1)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
            <strong style={{ color: '#389e0d', fontSize: '15px' }}>What happens next:</strong>
          </div>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '24px', 
            color: '#389e0d',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <li>Assignment will be marked as completed</li>
            <li>Payment will be processed automatically</li>
            <li>Student will be notified immediately</li>
            <li>Project will move to completed section</li>
          </ul>
        </div>
        
        <div style={{ 
          background: '#fff7e6', 
          border: '1px solid #ffd591', 
          borderRadius: '8px', 
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ThunderboltOutlined style={{ color: '#fa8c16', fontSize: '16px' }} />
          <p style={{ color: '#d46b08', fontSize: '14px', margin: 0, fontWeight: '500' }}>
            <strong>Note:</strong> This action cannot be undone.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default CompleteAssignmentModal;