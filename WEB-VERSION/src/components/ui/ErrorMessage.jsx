import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const ErrorMessage = ({ 
  message, 
  type = 'error', 
  className = '', 
  onClose,
  showIcon = true,
  animated = true,
  dismissible = false
}) => {
  if (!message) return null;

  const getIcon = () => {
    if (!showIcon) return null;
    
    const iconProps = { 
      size: 18, 
      className: 'flex-shrink-0',
      'aria-hidden': 'true'
    };
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'warning':
        return <AlertTriangle {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
      default:
        return <AlertCircle {...iconProps} />;
    }
  };

  const getMessageClass = () => {
    const baseClass = `auth-${type}`;
    const animationClass = animated ? 'animate-slide-in' : '';
    const dismissibleClass = dismissible ? 'pr-12' : '';
    return `${baseClass} ${animationClass} ${dismissibleClass} ${className}`.trim();
  };

  return (
    <div 
      className={getMessageClass()}
      role="alert"
      aria-live="polite"
    >
      {getIcon()}
      <div className="flex-1">
        <p className="m-0 font-medium">{message}</p>
      </div>
      {(onClose || dismissible) && (
        <button
          onClick={onClose}
          className="ml-2 text-current opacity-60 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-black/5"
          aria-label="Close message"
          type="button"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage; 