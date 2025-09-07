import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, InputNumber, Button, Space, Typography } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { AgreementFormData, Installment } from '../types/agreement';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title } = Typography;

interface CreateAgreementModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: AgreementFormData) => void;
  loading: boolean;
}

const CreateAgreementModal: React.FC<CreateAgreementModalProps> = ({
  visible,
  onClose,
  onSubmit,
  loading,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedData: AgreementFormData = {
        projectDetails: {
          title: values.title,
          description: values.description,
          subject: values.subject,
          deadline: values.deadline.toDate(),
        },
        installments: values.installments.map((i: any) => ({
          amount: i.amount,
          dueDate: i.dueDate.toDate(),
        })),
      };
      onSubmit(formattedData);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title="Create Service Agreement"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ installments: [{ amount: 0, dueDate: null }] }}
      >
        <Title level={4}>Project Details</Title>
        <Form.Item
          name="title"
          label="Assignment Title"
          rules={[{ required: true, message: 'Please enter the assignment title' }]}
        >
          <Input placeholder="Enter assignment title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Detailed Description"
          rules={[{ required: true, message: 'Please provide a detailed description' }]}
        >
          <TextArea rows={4} placeholder="Enter detailed description" />
        </Form.Item>

        <Form.Item
          name="subject"
          label="Subject Area"
          rules={[{ required: true, message: 'Please specify the subject area' }]}
        >
          <Input placeholder="Enter subject area" />
        </Form.Item>

        <Form.Item
          name="deadline"
          label="Deadline"
          rules={[
            { required: true, message: 'Please select a deadline' },
            {
              validator: (_, value) => {
                if (value && value.isBefore(dayjs())) {
                  return Promise.reject('Deadline must be in the future');
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm" />
        </Form.Item>

        <Title level={4}>Payment Installments</Title>
        <Form.List name="installments">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'amount']}
                    rules={[{ required: true, message: 'Amount is required' }]}
                  >
                    <InputNumber
                      prefix="$"
                      placeholder="Amount"
                      min={0}
                      step={0.01}
                      precision={2}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'dueDate']}
                    rules={[{ required: true, message: 'Due date is required' }]}
                  >
                    <DatePicker format="YYYY-MM-DD" />
                  </Form.Item>
                  {fields.length > 1 && (
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  )}
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Installment
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Agreement
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateAgreementModal; 