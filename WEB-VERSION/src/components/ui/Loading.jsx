import React from 'react';
import { clsx } from 'clsx';

const LoadingSpinner = ({ size = 'md', className }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <svg 
      className={clsx('animate-spin', sizeClasses[size], className)}
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

const LoadingDots = ({ size = 'md', className }) => {
  const sizeClasses = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  return (
    <div className={clsx('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={clsx(
            'bg-current rounded-full animate-pulse',
            sizeClasses[size]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s',
          }}
        />
      ))}
    </div>
  );
};

const LoadingWave = ({ size = 'md', className }) => {
  const sizeClasses = {
    xs: 'w-1 h-3',
    sm: 'w-1 h-4',
    md: 'w-1.5 h-6',
    lg: 'w-2 h-8',
    xl: 'w-3 h-12',
  };

  return (
    <div className={clsx('flex items-end space-x-1', className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={clsx(
            'bg-current rounded-sm animate-pulse',
            sizeClasses[size]
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s',
            transform: 'scaleY(0.4)',
          }}
        />
      ))}
    </div>
  );
};

const TypingIndicator = ({ className }) => {
  return (
    <div className={clsx('flex items-center space-x-1 px-3 py-2', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full animate-typing"
          style={{
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
};

const FullScreenLoading = ({ 
  message = 'Loading...', 
  showSpinner = true,
  backdrop = true,
  className 
}) => {
  return (
    <div className={clsx(
      'fixed inset-0 z-50 flex items-center justify-center',
      backdrop && 'bg-black/20 backdrop-blur-sm',
      className
    )}>
      <div className="bg-white rounded-xl shadow-premium p-8 flex flex-col items-center space-y-4 max-w-sm mx-4">
        {showSpinner && (
          <LoadingSpinner size="xl" className="text-primary-600" />
        )}
        <p className="text-gray-700 text-center font-medium">{message}</p>
      </div>
    </div>
  );
};

const InlineLoading = ({ 
  message = 'Loading...', 
  size = 'md',
  variant = 'spinner',
  className 
}) => {
  const LoadingComponent = {
    spinner: LoadingSpinner,
    dots: LoadingDots,
    wave: LoadingWave,
  }[variant];

  return (
    <div className={clsx('flex items-center space-x-3', className)}>
      <LoadingComponent size={size} className="text-primary-600" />
      {message && (
        <span className="text-gray-600 text-sm font-medium">{message}</span>
      )}
    </div>
  );
};

const PageLoading = ({ message = 'Loading page...' }) => {
  return (
    <div className="min-h-screen-minus-header flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" className="text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600 text-lg font-medium">{message}</p>
        <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
      </div>
    </div>
  );
};

const ChatLoading = ({ message = 'Loading messages...' }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <LoadingDots size="lg" className="text-primary-600 justify-center mb-4" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

const ButtonLoading = ({ size = 'md' }) => {
  return <LoadingSpinner size={size} className="text-current" />;
};

// Skeleton loading components
const SkeletonLine = ({ width = 'full', className }) => {
  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/4': 'w-1/4',
    '1/3': 'w-1/3',
    '2/3': 'w-2/3',
  };

  return (
    <div 
      className={clsx(
        'h-4 bg-gray-200 rounded animate-pulse',
        widthClasses[width] || width,
        className
      )} 
    />
  );
};

const SkeletonAvatar = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div 
      className={clsx(
        'bg-gray-200 rounded-full animate-pulse',
        sizeClasses[size]
      )} 
    />
  );
};

const SkeletonMessage = () => {
  return (
    <div className="flex space-x-3 p-4">
      <SkeletonAvatar size="md" />
      <div className="flex-1 space-y-2">
        <SkeletonLine width="1/4" />
        <SkeletonLine width="3/4" />
        <SkeletonLine width="1/2" />
      </div>
    </div>
  );
};

const SkeletonChatList = () => {
  return (
    <div className="space-y-2 p-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex space-x-3 p-3">
          <SkeletonAvatar size="md" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <SkeletonLine width="1/3" />
              <SkeletonLine width="1/4" />
            </div>
            <SkeletonLine width="2/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Export all components
export {
  LoadingSpinner,
  LoadingDots,
  LoadingWave,
  TypingIndicator,
  FullScreenLoading,
  InlineLoading,
  PageLoading,
  ChatLoading,
  ButtonLoading,
  SkeletonLine,
  SkeletonAvatar,
  SkeletonMessage,
  SkeletonChatList,
};

// Default export for convenience
export default {
  Spinner: LoadingSpinner,
  Dots: LoadingDots,
  Wave: LoadingWave,
  Typing: TypingIndicator,
  FullScreen: FullScreenLoading,
  Inline: InlineLoading,
  Page: PageLoading,
  Chat: ChatLoading,
  Button: ButtonLoading,
  Skeleton: {
    Line: SkeletonLine,
    Avatar: SkeletonAvatar,
    Message: SkeletonMessage,
    ChatList: SkeletonChatList,
  },
}; 