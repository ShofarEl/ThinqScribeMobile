import React from 'react';
import { useNavigationLoading } from '../context/AppLoadingContext';
import AppLoader from './AppLoader';

const GlobalLoader = () => {
  const isNavigating = useNavigationLoading();

  if (!isNavigating) return null;

  return (
    <AppLoader 
      fullScreen={true}
      tip="Loading..."
      size="large"
      showIcon={true}
      showTip={true}
    />
  );
};

export default GlobalLoader; 