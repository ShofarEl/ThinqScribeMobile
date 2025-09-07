import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import Button from './Button';

const Modal = ({
  open = false,
  onClose,
  title,
  children,
  footer,
  width = 'md',
  closable = true,
  maskClosable = true,
  centered = true,
  className,
  bodyClassName,
  loading = false,
  ...props
}) => {
  const widthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full',
  };

  // Handle escape key
  useEffect(() => {
    if (!open || !closable) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closable, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  const handleMaskClick = (e) => {
    if (maskClosable && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleMaskClick}
      {...props}
    >
      <div 
        className={clsx(
          'flex min-h-full items-center justify-center p-4',
          centered ? 'items-center' : 'items-start pt-16'
        )}
      >
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/25 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />

        {/* Modal Content */}
        <div 
          className={clsx(
            'relative w-full bg-white rounded-xl shadow-premium transform transition-all animate-slideUp',
            widthClasses[width],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || closable) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              
              {closable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="ml-auto"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  }
                />
              )}
            </div>
          )}

          {/* Body */}
          <div className={clsx('p-6', bodyClassName)}>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-3">
                  <svg className="animate-spin w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span className="text-gray-600">Loading...</span>
                </div>
              </div>
            ) : (
              children
            )}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmModal = ({
  open = false,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  loading = false,
  ...props
}) => {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      width="sm"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
      {...props}
    >
      <p className="text-gray-700">{message}</p>
    </Modal>
  );
};

// Drawer Component (for mobile sidebar)
const Drawer = ({
  open = false,
  onClose,
  title,
  children,
  placement = 'left',
  width = '300px',
  closable = true,
  maskClosable = true,
  className,
  ...props
}) => {
  const placementClasses = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full',
  };

  const animationClasses = {
    left: open ? 'translate-x-0' : '-translate-x-full',
    right: open ? 'translate-x-0' : 'translate-x-full',
    top: open ? 'translate-y-0' : '-translate-y-full',
    bottom: open ? 'translate-y-0' : 'translate-y-full',
  };

  // Handle escape key
  useEffect(() => {
    if (!open || !closable) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closable, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleMaskClick = (e) => {
    if (maskClosable && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div 
      className={clsx(
        'fixed inset-0 z-50 transition-opacity duration-300',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      onClick={handleMaskClick}
      {...props}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/25 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div 
        className={clsx(
          'absolute bg-white shadow-premium transform transition-transform duration-300 ease-out',
          placementClasses[placement],
          animationClasses[placement],
          className
        )}
        style={{
          width: (placement === 'left' || placement === 'right') ? width : 'auto',
          height: (placement === 'top' || placement === 'bottom') ? width : 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || closable) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            )}
            
            {closable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-auto"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              />
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.Confirm = ConfirmModal;
Modal.Drawer = Drawer;

export default Modal;
export { ConfirmModal, Drawer }; 