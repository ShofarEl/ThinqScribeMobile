import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EnhancedPaymentModal from '../components/EnhancedPaymentModal';

const EnhancedPaymentPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const amount = parseFloat(params.get('amount') || '0');
  const currency = (params.get('currency') || 'ngn').toLowerCase();
  const agreementId = params.get('agreementId') || null;
  const agreementCurrency = (params.get('agreementCurrency') || currency).toLowerCase();

  // 🔧 CRITICAL: Validate amount before rendering
  if (amount < 0.002) {
    console.error('❌ Invalid payment amount:', { amount, currency, agreementId });
    return (
      <div style={{ 
        maxWidth: 600, 
        margin: '24px auto', 
        padding: '24px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#ff4d4f' }}>Invalid Payment Amount</h2>
        <p>The payment amount ({amount}) is too small to process.</p>
        <p>Minimum amount is $0.002. Please contact support or try again.</p>
        <button 
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px',
            background: '#015382',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <EnhancedPaymentModal
      asPage={true}
      onCancel={() => navigate(-1)}
      onPaymentSuccess={() => navigate('/payment-success')}
      amount={amount}
      currency={currency.toUpperCase()}
      agreementCurrency={agreementCurrency.toUpperCase()} // 🆕 Pass agreement currency
      title={params.get('title') || 'Complete Payment'}
      description={params.get('desc') || ''}
      agreementId={agreementId}
    />
  );
};

export default EnhancedPaymentPage;


