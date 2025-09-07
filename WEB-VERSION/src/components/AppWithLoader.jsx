import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppLoader from './AppLoader';

const AppWithLoader = ({ children }) => {
  const [isNavigationLoading, setIsNavigationLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show loader on route change
    setIsNavigationLoading(true);
    
    // Hide loader after component has time to render
    const timer = setTimeout(() => {
      setIsNavigationLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {isNavigationLoading && (
        <AppLoader 
          fullScreen={true}
          tip="Loading..."
          size="large"
          showIcon={true}
          showTip={false}
        />
      )}
      {children}
    </>
  );
};

export default AppWithLoader; 