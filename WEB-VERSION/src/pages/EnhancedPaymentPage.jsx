import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EnhancedPaymentModal from '../components/EnhancedPaymentModal';

const EnhancedPaymentPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const amount = parseFloat(params.get('amount') || '0');
  const currency = (params.get('currency') || 'ngn').toLowerCase();
  const agreementId = params.get('agreementId') || null;

  return (
    <EnhancedPaymentModal
      asPage={true}
      onCancel={() => navigate(-1)}
      onPaymentSuccess={() => navigate('/payment-success')}
      amount={amount}
      currency={currency.toUpperCase()}
      title={params.get('title') || 'Complete Payment'}
      description={params.get('desc') || ''}
      agreementId={agreementId}
    />
  );
};

export default EnhancedPaymentPage;


