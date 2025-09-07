import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Modal, Form, Input, DatePicker, InputNumber, Button, Space, Typography, Tag, Alert, Row, Col, Steps, notification } from 'antd';
import { PlusOutlined, MinusCircleOutlined, InfoCircleOutlined, FileTextOutlined, DollarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
// Constants
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const INITIAL_FORM_STATE = {
  title: '',
  description: '',
  subject: '',
  deadline: dayjs().add(1, 'day'),
  totalAmount: 0,
  installments: [{
    amount: 0,
    dueDate: dayjs().add(1, 'day')
  }]
};

const STEPS = [
  {
    title: 'Project Details',
    icon: <FileTextOutlined />,
    fields: ['title', 'description', 'subject', 'deadline']
  },
  {
    title: 'Payment Details',
    icon: <DollarOutlined />,
    fields: ['totalAmount', 'installments']
  },
  {
    title: 'Review',
    icon: <InfoCircleOutlined />
  }
];

// Form Components
const ProjectDetailsForm = () => (
  <>
    <Title level={5} style={{ color: 'var(--primary-color)', marginBottom: '16px' }}>Project Details</Title>
    <Form.Item
      name="title"
      label="Assignment Title"
      rules={[
        { required: true, message: 'Please enter the assignment title' },
        { transform: (value) => value?.trim() },
        { type: 'string', min: 1, message: 'Title cannot be empty' }
      ]}
    >
      <Input placeholder="e.g., Research Paper on Climate Change" />
    </Form.Item>

    <Form.Item
      name="subject"
      label="Subject Area"
      rules={[
        { required: true, message: 'Please specify the subject area' },
        { transform: (value) => value?.trim() },
        { type: 'string', min: 1, message: 'Subject cannot be empty' }
      ]}
    >
      <Input placeholder="e.g., Environmental Science" />
    </Form.Item>

    <Form.Item
      name="description"
      label="Detailed Description"
      rules={[
        { required: true, message: 'Please provide a detailed description' },
        { transform: (value) => value?.trim() },
        { type: 'string', min: 1, message: 'Description cannot be empty' }
      ]}
    >
      <TextArea 
        rows={4} 
        placeholder="Include all requirements, formatting guidelines, and specific instructions"
      />
    </Form.Item>

    <Form.Item
      name="deadline"
      label="Final Deadline"
      rules={[
        { required: true, message: 'Please select a deadline' },
        {
          validator: (_, value) => {
            if (!value) {
              return Promise.reject('Deadline is required');
            }
            if (!value.isValid()) {
              return Promise.reject('Please select a valid date');
            }
            if (value.isBefore(dayjs())) {
              return Promise.reject('Deadline must be in the future');
            }
            return Promise.resolve();
          }
        }
      ]}
    >
      <DatePicker 
        showTime 
        format="YYYY-MM-DD HH:mm"
        style={{ width: '100%' }}
        disabledDate={d => !d || d.isBefore(dayjs())}
      />
    </Form.Item>
  </>
);

const PaymentDetailsForm = ({ totalAmount, sumOfInstallments }) => {
  const [form] = Form.useForm();

  return (
    <>
      <Title level={5} style={{ color: 'var(--primary-color)', marginBottom: '16px' }}>Payment Structure</Title>
      
      <Form.Item
        name="totalAmount"
        label="Total Project Amount"
        rules={[
          { required: true, message: 'Please enter the total amount' },
          { type: 'number', min: 1, message: 'Amount must be greater than 0' }
        ]}
      >
        <InputNumber
          prefix="$"
          style={{ width: '100%' }}
          min={1}
          step={0.01}
          precision={2}
        />
      </Form.Item>

      <Alert
        message="Installment Payment Setup"
        description="Break down the total amount into installments. The sum of all installments must equal the total project amount. These will be the future pending payments for this project."
        type="info"
        showIcon
        style={{ marginBottom: '16px', borderColor: 'var(--primary-color)', backgroundColor: 'rgba(1, 83, 130, 0.05)' }}
      />

      <Form.List
        name="installments"
        rules={[
          {
            validator: async (_, installments) => {
              if (!installments || installments.length < 1) {
                return Promise.reject('At least one installment is required');
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }) => {
          // Ensure there's always at least one installment
          if (fields.length === 0) {
            setTimeout(() => {
              add({ amount: 0, dueDate: dayjs().add(1, 'day') });
            }, 0);
          }
          
          return (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'amount']}
                    rules={[
                      { required: true, message: 'Amount is required' },
                      { type: 'number', min: 0.01, message: 'Amount must be greater than 0' }
                    ]}
                    validateTrigger={['onChange', 'onBlur']}
                  >
                    <InputNumber
                      prefix="$"
                      placeholder="Amount"
                      min={0.01}
                      step={0.01}
                      precision={2}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'dueDate']}
                    rules={[
                      { required: true, message: 'Due date is required' },
                      {
                        validator: (_, value) => {
                          if (!value) {
                            return Promise.reject('Due date is required');
                          }
                          const date = dayjs(value);
                          if (!date.isValid()) {
                            return Promise.reject('Please select a valid date');
                          }
                          if (date.isBefore(dayjs())) {
                            return Promise.reject('Due date must be in the future');
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                    validateTrigger={['onChange', 'onBlur']}
                  >
                    <DatePicker 
                      format="YYYY-MM-DD"
                      disabledDate={d => !d || d.isBefore(dayjs())}
                    />
                  </Form.Item>
                  {fields.length > 1 && (
                    <MinusCircleOutlined 
                      style={{ color: '#ff4d4f', cursor: 'pointer' }}
                      onClick={() => remove(name)} 
                    />
                  )}
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add({ amount: 0, dueDate: dayjs().add(1, 'day') })}
                  block
                  icon={<PlusOutlined />}
                  style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                >
                  Add Installment
                </Button>
              </Form.Item>
            </>
          );
        }}
      </Form.List>

      <div style={{ backgroundColor: 'var(--light-gray)', padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Text strong>Total Amount: ${totalAmount.toFixed(2)}</Text>
          </Col>
          <Col>
            <Text strong>Sum of Installments: </Text>
            <Tag color={Math.abs(totalAmount - sumOfInstallments) > 0.01 ? 'error' : 'success'}>
              ${sumOfInstallments.toFixed(2)}
            </Tag>
          </Col>
        </Row>
        {Math.abs(totalAmount - sumOfInstallments) > 0.01 && (
          <Text type="danger" style={{ display: 'block', marginTop: '8px' }}>
            The sum of installments must equal the total amount
          </Text>
        )}
      </div>
    </>
  );
};

const ReviewForm = ({ form }) => {
  const values = form.getFieldsValue(true);
  const { title, subject, description, deadline, totalAmount, installments } = values;

  return (
    <>
      <Title level={5} style={{ color: 'var(--primary-color)', marginBottom: '16px' }}>Review Your Agreement</Title>
      
      <div style={{ backgroundColor: 'var(--light-gray)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
        <Title level={5}>Project Details</Title>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text strong>Title: </Text>
            <Text>{title}</Text>
          </Col>
          <Col span={24}>
            <Text strong>Subject: </Text>
            <Text>{subject}</Text>
          </Col>
          <Col span={24}>
            <Text strong>Deadline: </Text>
            <Text>{deadline?.format('YYYY-MM-DD HH:mm')}</Text>
          </Col>
          <Col span={24}>
            <Text strong>Description: </Text>
            <Paragraph style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{description}</Paragraph>
          </Col>
        </Row>
      </div>
      
      <div style={{ backgroundColor: 'var(--light-gray)', padding: '16px', borderRadius: '8px' }}>
        <Title level={5}>Payment Details</Title>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text strong>Total Amount: </Text>
            <Text>${totalAmount?.toFixed(2)}</Text>
          </Col>
          <Col span={24}>
            <Text strong>Payment Schedule:</Text>
            <div style={{ marginTop: '8px' }}>
              {installments?.map((installment, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text>Installment {index + 1}:</Text>
                  <Space>
                    <Text>${installment.amount?.toFixed(2)}</Text>
                    <Text>due on {installment.dueDate?.format('YYYY-MM-DD')}</Text>
                  </Space>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </div>

      <Alert
        message="Ready to Create Agreement"
        description="By submitting this form, you'll create a service agreement with the writer. The writer will need to accept the agreement before work begins."
        type="info"
        showIcon
        style={{ marginTop: '16px', borderColor: 'var(--primary-color)', backgroundColor: 'rgba(1, 83, 130, 0.05)' }}
      />
    </>
  );
};

// Main Component
const CreateAgreementModal = forwardRef(({
  visible,
  onClose,
  onSubmit,
  loading,
  writer
}, ref) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [sumOfInstallments, setSumOfInstallments] = useState(0);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    open: () => {
      setVisible(true);
      setCurrentStep(0);
      form.resetFields();
      form.setFieldsValue(INITIAL_FORM_STATE);
    }
  }));

  const validateWriter = () => {
    if (!writer) {
      notification.error({
        message: 'Writer Not Selected',
        description: 'Please select a writer before creating an agreement',
      });
      onClose();
      return false;
    }
    return true;
  };

  const validateInstallments = async () => {
    try {
      const values = await form.validateFields(['totalAmount', 'installments']);
      const { totalAmount, installments } = values;
      
      // Calculate sum of installment amounts
      const sum = installments.reduce((total, installment) => total + (installment.amount || 0), 0);
      
      // Check if sum matches total
      if (Math.abs(totalAmount - sum) > 0.01) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    if (visible) {
      validateWriter();
    }
  }, [visible]);

  // Update total amount and sum of installments when form values change
  useEffect(() => {
    const values = form.getFieldsValue(['totalAmount', 'installments']);
    const total = values.totalAmount || 0;
    setTotalAmount(total);
    
    const installments = values.installments || [];
    const sum = installments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    setSumOfInstallments(sum);
  }, [form.getFieldValue('totalAmount'), form.getFieldValue('installments')]);

  const handleValuesChange = (changedValues, allValues) => {
    if (changedValues.totalAmount !== undefined) {
      setTotalAmount(changedValues.totalAmount || 0);
    }
    
    if (changedValues.installments) {
      const sum = allValues.installments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      setSumOfInstallments(sum);
    }
  };

  const handleNext = async () => {
    try {
      const currentFields = STEPS[currentStep].fields || [];
      await form.validateFields(currentFields);
      
      if (currentStep === 1) {
        const isValid = await validateInstallments();
        if (!isValid) {
          notification.warning({
            message: 'Payment Validation',
            description: 'The sum of installments must equal the total amount.',
          });
          return;
        }
      }
      
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Format dates for API
      const formattedValues = {
        ...values,
        writerId: writer?.id, // Assuming writer object has an 'id' property
        deadline: values.deadline.toISOString(),
        installments: values.installments.map(inst => ({
          ...inst,
          dueDate: inst.dueDate.toISOString()
        }))
      };
      
      if (onSubmit) {
        await onSubmit(formattedValues);
      }
      
      onClose();
      form.resetFields();
      
    } catch (error) {
      console.error('Submit error:', error);
      notification.error({
        message: 'Submission Failed',
        description: 'There was an error creating the agreement. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <ProjectDetailsForm />;
      case 1:
        return <PaymentDetailsForm totalAmount={totalAmount} sumOfInstallments={sumOfInstallments} />;
      case 2:
        return <ReviewForm form={form} />;
      default:
        return null;
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FileTextOutlined style={{ color: 'var(--primary-color)', marginRight: '8px' }} />
          <span>Create Service Agreement</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={700}
      footer={null}
      maskClosable={false}
      destroyOnClose
      bodyStyle={{ padding: '24px' }}
    >
      <Steps
        current={currentStep}
        style={{ marginBottom: '24px' }}
        items={STEPS.map(step => ({
          title: step.title,
          icon: step.icon
        }))}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={INITIAL_FORM_STATE}
        onValuesChange={handleValuesChange}
        requiredMark="optional"
      >
        <div style={{ minHeight: '300px', marginTop: '24px' }}>
          {renderStepContent()}
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
          {currentStep > 0 && (
            <Button onClick={handlePrev}>
              Back
            </Button>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <Button onClick={handleCancel} style={{ marginRight: '8px' }}>
              Cancel
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button type="primary" onClick={handleNext} style={{ backgroundColor: 'var(--primary-color)' }}>
                Next
              </Button>
            ) : (
              <Button 
                type="primary" 
                onClick={handleSubmit} 
                loading={loading}
                icon={<CheckCircleOutlined />}
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                Create Agreement
              </Button>
            )}
          </div>
        </div>
      </Form>
    </Modal>
  );
});

export default CreateAgreementModal;
