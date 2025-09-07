// AuthLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const AuthLayout = ({ children, title, subtitle, footerText, footerLink, footerLinkText }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 200);

    // Set a timer to complete loading
    const timer = setTimeout(() => {
      clearInterval(interval);
      setLoadingProgress(100);
      setTimeout(() => setIsLoading(false), 500); // Short delay after reaching 100%
    }, 1800);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f2f5] to-[#dfe3e8] flex flex-col">
      {/* Enhanced Preloader Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#2C3E50] flex flex-col items-center justify-center z-50 transition-opacity duration-500 opacity-100">
          <div className="text-center flex flex-col items-center">
            <div className="relative mb-6">
              {/* Main app icon with pulsing animation */}
              <img 
                src="/App-Icon-Light.png"
                alt="ThinqScribe Icon" 
                className="h-24 w-24 object-contain animate-pulse"
              />
              
              {/* Rotating loading indicator around the icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-t-4 border-b-4 border-blue-400 animate-spin opacity-70"></div>
              </div>
            </div>
            
            {/* Logo text below the icon */}
            <img 
              src="/Think-Scribee.png"
              alt="ThinqScribe Logo" 
              className="h-10 mb-8"
            />
            
            {/* Progress bar */}
            <div className="w-64 h-1 bg-gray-700 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            
            <p className="text-lg text-[#ECF0F1] font-serif">
              {loadingProgress < 100 ? 'Loading your workspace...' : 'Ready!'}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`py-6 px-8 relative z-10 ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-500 delay-300'}`}>
        <Link to="/" className="flex items-center space-x-3">
          <img 
            src="/Think-Scribee.png"
            alt="ThinqScribe Logo" 
            className="h-8"
          />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className={`flex-grow flex items-center justify-center px-4 py-12 relative z-10 ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-500 delay-300'}`}>
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[#2C3E50] mb-3 font-serif tracking-tight">{title}</h1>
            <p className="text-[#7F8C8D] text-lg font-light">{subtitle}</p>
          </div>

          {/* Form content wrapper with academic paper styling */}
          <div className="bg-white p-10 rounded-lg shadow-xl relative z-10 border border-[#ECF0F1]">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#BDC3C7] to-[#34495E] opacity-15 blur-sm"></div>
            {children}
          </div>

          <div className="mt-8 text-center relative z-10">
            <span className="text-[#7F8C8D]">{footerText} </span>
            <Link to={footerLink} className="text-[#3498DB] font-medium hover:underline hover:text-[#2980B9] transition-colors">
              {footerLinkText}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`py-6 text-center text-[#7F8C8D] text-sm relative z-10 ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-500 delay-300'}`}>
        © {new Date().getFullYear()} ThinqScribe. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;