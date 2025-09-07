import React, { useState } from 'react';
import { Modal, Form, Radio, InputNumber, DatePicker, Button, Alert, Typography, Space, Divider } from 'antd';
import { DollarOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const PaymentOptionsModal = ({ visible, onClose, onSubmit, totalAmount, loading }) => {
  const [form] = Form.useForm();
  const [paymentType, setPaymentType] = useState('full');

  const handlePaymentTypeChange = (e) => {
    setPaymentType(e.target.value);
    form.setFieldsValue({ installments: [{ amount: totalAmount / 2, dueDate: null }] });
  };

  const handleSubmit = async (values) => {
    const paymentPlan = {
      type: values.paymentType,
      installments: values.paymentType === 'installments' ? values.installments : [{
        amount: totalAmount,
        dueDate: dayjs().add(1, 'day').toDate()
      }]
    };
    onSubmit(paymentPlan);
  };

  return (
    <Modal
      title={<Title level={4}>Payment Options</Title>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      maskClosable={!loading}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          paymentType: 'full',
          installments: [{ amount: totalAmount / 2, dueDate: null }]
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            message="Choose Your Payment Plan"
            description="Select how you would like to pay for this service."
            type="info"
            showIcon
          />

          <Form.Item name="paymentType">
            <Radio.Group onChange={handlePaymentTypeChange} value={paymentType}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Radio value="full" style={{ width: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Full Payment</Text>
                    <Text type="secondary">Pay the entire amount now</Text>
                    <Text type="success" strong>${totalAmount.toFixed(2)}</Text>
                  </Space>
                </Radio>
                <Radio value="installments" style={{ width: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Installment Plan</Text>
                    <Text type="secondary">Split your payment into multiple installments</Text>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          {paymentType === 'installments' && (
            <>
              <Divider />
              <Title level={5}>Installment Schedule</Title>
              <Form.List name="installments">
                {(fields, { add, remove }) => (
                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                    {fields.map((field, index) => (
                      <Space key={field.key} align="baseline">
                        <Form.Item
                          {...field}
                          label={`Installment ${index + 1} Amount`}
                          name={[field.name, 'amount']}
                          rules={[
                            { required: true, message: 'Please enter amount' },
                            {
                              validator: (_, value) => {
                                const values = form.getFieldValue('installments');
                                const total = values.reduce((sum, i) => sum + (i?.amount || 0), 0);
                                return total <= totalAmount
                                  ? Promise.resolve()
                                  : Promise.reject('Total installments exceed agreement amount');
                              }
                            }
                          ]}
                        >
                          <InputNumber
                            prefix={<DollarOutlined />}
                            min={1}
                            max={totalAmount}
                            style={{ width: 150 }}
                          />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          label="Due Date"
                          name={[field.name, 'dueDate']}
                          rules={[
                            { required: true, message: 'Please select due date' },
                            {
                              validator: (_, value) => {
                                return value && value.isAfter(dayjs())
                                  ? Promise.resolve()
                                  : Promise.reject('Due date must be in the future');
                              }
                            }
                          ]}
                        >
                          <DatePicker
                            style={{ width: 150 }}
                            format="YYYY-MM-DD"
                            disabledDate={d => !d || d.isBefore(dayjs())}
                          />
                        </Form.Item>
                        {fields.length > 1 && (
                          <Button type="link" danger onClick={() => remove(field.name)}>
                            Remove
                          </Button>
                        )}
                      </Space>
                    ))}
                    {fields.length < 4 && (
                      <Button
                        type="dashed"
                        onClick={() => add({ amount: 0, dueDate: null })}
                        block
                        icon={<CalendarOutlined />}
                      >
                        Add Installment
                      </Button>
                    )}
                  </Space>
                )}
              </Form.List>
            </>
          )}

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Proceed to Payment
            </Button>
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
};

export default PaymentOptionsModal; 