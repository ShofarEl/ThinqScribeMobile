import React from 'react';
import { Tag } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  SyncOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons';

/**
 * Component to display payment status with appropriate styling
 * 
 * @param {Object} props
 * @param {string} props.status - The payment status (paid, processing, pending, failed)
 * @param {string} props.paymentDate - Optional payment date to check if payment was made
 * @param {boolean} props.isPaid - Optional flag to indicate if payment was made
 */
const PaymentStatusTag = ({ status, paymentDate, isPaid }) => {
  // If we have a payment date or isPaid is true, consider it PAID regardless of status
  const effectiveStatus = (paymentDate || isPaid) ? 'paid' : status?.toLowerCase();

  // Map status to display configuration
  const statusConfig = {
    paid: {
      color: 'success',
      icon: <CheckCircleOutlined />,
      text: 'PAID'
    },
    processing: {
      color: 'processing',
      icon: <SyncOutlined spin />,
      text: 'PROCESSING'
    },
    pending: {
      color: 'warning',
      icon: <ClockCircleOutlined />,
      text: 'PENDING'
    },
    failed: {
      color: 'error',
      icon: <CloseCircleOutlined />,
      text: 'FAILED'
    }
  };

  // Get config for current status or default to pending
  const config = statusConfig[effectiveStatus] || statusConfig.pending;

  return (
    <Tag
      color={config.color}
      icon={config.icon}
      style={{ 
        fontWeight: 'bold',
        padding: '0 8px',
        fontSize: '12px'
      }}
    >
      {config.text}
    </Tag>
  );
};

export default PaymentStatusTag;