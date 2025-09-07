import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  size = 'md',
  prefix,
  suffix,
  className,
  wrapperClassName,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const baseClasses = clsx(
    'premium-input block w-full rounded-lg border transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
    sizeClasses[size],
    error 
      ? 'border-accent-red focus:border-accent-red focus:ring-red-500/20' 
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20',
    prefix && 'pl-10',
    suffix && 'pr-10',
    className
  );

  const wrapperClasses = clsx(
    'relative',
    wrapperClassName
  );

  return (
    <div className={wrapperClasses}>
      {prefix && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400 text-sm">
            {prefix}
          </span>
        </div>
      )}
      
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={onFocus}
        onBlur={onBlur}
        className={baseClasses}
        {...props}
      />
      
      {suffix && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {suffix}
        </div>
      )}
    </div>
  );
});

const TextArea = forwardRef(({
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  rows = 3,
  className,
  resize = true,
  ...props
}, ref) => {
  const baseClasses = clsx(
    'premium-input block w-full rounded-lg border transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 text-sm',
    error 
      ? 'border-accent-red focus:border-accent-red focus:ring-red-500/20' 
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20',
    !resize && 'resize-none',
    className
  );

  return (
    <textarea
      ref={ref}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      rows={rows}
      className={baseClasses}
      {...props}
    />
  );
});

const Search = forwardRef(({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  allowClear = false,
  loading = false,
  className,
  ...props
}, ref) => {
  const handleClear = () => {
    if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <Input
      ref={ref}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyPress={handleKeyPress}
      className={className}
      prefix={
        loading ? (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )
      }
      suffix={
        allowClear && value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )
      }
      {...props}
    />
  );
});

Input.TextArea = TextArea;
Input.Search = Search;

Input.displayName = 'Input';
TextArea.displayName = 'TextArea';
Search.displayName = 'Search';

export default Input; 