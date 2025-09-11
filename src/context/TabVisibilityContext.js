import { createContext, useContext, useState } from 'react';

const TabVisibilityContext = createContext();

export const useTabVisibility = () => {
  const context = useContext(TabVisibilityContext);
  if (!context) {
    throw new Error('useTabVisibility must be used within a TabVisibilityProvider');
  }
  return context;
};

export const TabVisibilityProvider = ({ children }) => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);

  const hideTabBar = () => {
    console.log('🔧 [TabVisibility] Hiding tab bar globally');
    setIsTabBarVisible(false);
  };

  const showTabBar = () => {
    console.log('🔧 [TabVisibility] Showing tab bar globally');
    setIsTabBarVisible(true);
  };

  const value = {
    isTabBarVisible,
    hideTabBar,
    showTabBar,
  };

  return (
    <TabVisibilityContext.Provider value={value}>
      {children}
    </TabVisibilityContext.Provider>
  );
};
