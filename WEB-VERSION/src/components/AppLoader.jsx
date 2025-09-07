import React from 'react';
import '../styles/AppLoader.css';

const AppLoader = ({ 
  size = 'large', 
  tip = 'Loading...', 
  fullScreen = false,
  showIcon = true,
  showTip = true 
}) => {
  const getSizeClass = () => {
    switch(size) {
      case 'small': return 'app-loader-small';
      case 'large': return 'app-loader-large';
      default: return 'app-loader-default';
    }
  };

  const loaderContent = (
    <div className={`app-loader-content ${getSizeClass()}`}>
      {showIcon && (
        <div className="app-icon-container">
          <img 
            src="/App-Icon-Light.png" 
            alt="ThinqScribe" 
            className="app-icon-loader"
          />
        </div>
      )}
      <div className="loader-spinner">
        <div className="spinner-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
      {showTip && tip && <div className="loader-text">{tip}</div>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="app-loader-fullscreen">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="app-loader-inline">
      {loaderContent}
    </div>
  );
};

export default AppLoader; 