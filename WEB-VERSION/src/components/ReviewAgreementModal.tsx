import React from 'react';
import { Modal, Typography, Descriptions, Button, Space, Tag } from 'antd';
import { Agreement } from '../types/agreement';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface ReviewAgreementModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  agreement: Agreement | null;
  loading: boolean;
}

const ReviewAgreementModal: React.FC<ReviewAgreementModalProps> = ({
  visible,
  onClose,
  onAccept,
  agreement,
  loading,
}) => {
  if (!agreement) return null;

  return (
    <Modal
      title="Review Service Agreement"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Assignment Title">
          <Text strong>{agreement.projectDetails.title}</Text>
        </Descriptions.Item>
        
        <Descriptions.Item label="Subject Area">
          <Tag color="blue">{agreement.projectDetails.subject}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Description">
          <Text>{agreement.projectDetails.description}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="Deadline">
          <Text type="danger">
            {dayjs(agreement.projectDetails.deadline).format('MMMM D, YYYY h:mm A')}
          </Text>
        </Descriptions.Item>

        <Descriptions.Item label="Total Amount">
          <Text strong style={{ color: '#52c41a' }}>
            ${agreement.totalAmount.toFixed(2)}
          </Text>
        </Descriptions.Item>

        <Descriptions.Item label="Payment Installments">
          {agreement.installments.map((installment, index) => (
            <div key={index} style={{ marginBottom: 8 }}>
              <Text>
                Installment {index + 1}: ${installment.amount.toFixed(2)} due{' '}
                {dayjs(installment.dueDate).format('MMMM D, YYYY')}
              </Text>
            </div>
          ))}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          <Button onClick={onClose}>Close</Button>
          <Button type="primary" onClick={onAccept} loading={loading}>
            Accept Agreement
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default ReviewAgreementModal; 