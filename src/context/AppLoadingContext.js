// ThinqScribe/src/context/AppLoadingContext.js
import React, { createContext, useState, useContext } from 'react';

// Create a global loading context
export const AppLoadingContext = createContext();

export const useAppLoading = () => {
  const context = useContext(AppLoadingContext);
  if (!context) {
    throw new Error('useAppLoading must be used within an AppLoadingProvider');
  }
  return context;
};

// App loading provider component
export const AppLoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isNavigationLoading, setIsNavigationLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  return (
    <AppLoadingContext.Provider 
      value={{ 
        isLoading, 
        setIsLoading, 
        progress: loadingProgress, 
        setProgress: setLoadingProgress,
        isNavigationLoading,
        setIsNavigationLoading,
        loadingMessage,
        setLoadingMessage
      }}
    >
      {children}
    </AppLoadingContext.Provider>
  );
};