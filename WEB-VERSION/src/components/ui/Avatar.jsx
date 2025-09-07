import React from 'react';
import { clsx } from 'clsx';

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  fallback, 
  className,
  online = null,
  onClick,
  children,
  ...props 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm', 
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const onlineIndicatorSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5', 
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  const baseClasses = clsx(
    'premium-avatar relative inline-flex items-center justify-center font-medium text-white bg-gradient-primary border-2 border-white shadow-message transition-all duration-200',
    sizeClasses[size],
    onClick && 'cursor-pointer hover:shadow-button-hover hover:scale-105',
    className
  );

  const renderContent = () => {
    if (src) {
      return (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling?.classList.remove('hidden');
          }}
        />
      );
    }
    
    if (children) {
      return children;
    }
    
    if (fallback) {
      return (
        <span className="font-semibold">
          {typeof fallback === 'string' ? fallback.slice(0, 2).toUpperCase() : fallback}
        </span>
      );
    }
    
    return (
      <svg className="w-1/2 h-1/2 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className={baseClasses} onClick={onClick} {...props}>
      {renderContent()}
      {!src && fallback && (
        <span className="hidden font-semibold">
          {typeof fallback === 'string' ? fallback.slice(0, 2).toUpperCase() : fallback}
        </span>
      )}
      
      {/* Online status indicator */}
      {online !== null && (
        <div
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-2 border-white shadow-sm',
            onlineIndicatorSizes[size],
            online ? 'bg-accent-green' : 'bg-gray-400'
          )}
          title={online ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};

export default Avatar; 