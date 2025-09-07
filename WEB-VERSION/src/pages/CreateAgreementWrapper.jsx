import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { notification } from 'antd';
import CreateAgreementModal from '../components/CreateAgreementModal';
import { agreementApi } from '../api/agreement';

const CreateAgreementWrapper = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const writerId = searchParams.get('writerId');
  const chatId = searchParams.get('chatId');

  const handleClose = () => {
    navigate(-1);
  };

  const handleSubmit = async (agreementData) => {
    try {
      const formatted = {
        ...agreementData,
        writerId: writerId,
        chatId: chatId,
      };
      const res = await agreementApi.createAgreement(formatted);
      notification.success({
        message: 'Agreement Created',
        description: 'Agreement has been created and sent to the writer.',
        placement: 'bottomRight',
      });
      // Navigate to agreement page if id returned; otherwise back
      const newId = res?.agreement?._id || res?._id;
      if (newId) {
        navigate(`/agreements/${newId}`);
      } else {
        navigate(-1);
        
      }
    } catch (error) {
      notification.error({
        message: 'Agreement Creation Failed',
        description: error?.response?.data?.message || 'Failed to create agreement. Please try again.',
        placement: 'bottomRight',
      });
    }
  };

  // Provide minimal writer object using writerId so modal validation passes
  const writer = writerId ? { _id: writerId } : null;

  return (
    <CreateAgreementModal
      visible={true}
      onClose={handleClose}
      onSubmit={handleSubmit}
      loading={false}
      writer={writer}
    />
  );
};

export default CreateAgreementWrapper;


