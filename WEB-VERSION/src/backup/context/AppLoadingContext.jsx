import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Create a global loading context
export const AppLoadingContext = createContext();

export const useAppLoading = () => {
  const context = useContext(AppLoadingContext);
  if (!context) {
    throw new Error('useAppLoading must be used within an AppLoadingProvider');
  }
  return context;
};

// Navigation loading hook
export const useNavigationLoading = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsNavigating(true);
    
    // Hide loader after page has time to render
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return isNavigating;
};

// App loading provider component
export const AppLoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isNavigationLoading, setIsNavigationLoading] = useState(false);

  return (
    <AppLoadingContext.Provider 
      value={{ 
        isLoading, 
        setIsLoading, 
        progress: loadingProgress, 
        setProgress: setLoadingProgress,
        isNavigationLoading,
        setIsNavigationLoading
      }}
    >
      {children}
    </AppLoadingContext.Provider>
  );
}; 