import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Drawer, Menu } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

const LandingHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const headerClass = scrolled 
    ? 'fixed w-full bg-white shadow-md transition-all duration-300 z-50' 
    : 'fixed w-full bg-transparent transition-all duration-300 z-50';
  
  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="ThinqScribe Logo" className="h-10 mr-2" />
            <span className="text-xl font-bold text-blue-900">ThinqScribe</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/services" className="text-gray-700 hover:text-blue-600 font-medium">Services</Link>
          <Link to="/how-it-works" className="text-gray-700 hover:text-blue-600 font-medium">How It Works</Link>
          <Link to="/pricing" className="text-gray-700 hover:text-blue-600 font-medium">Pricing</Link>
          <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium">About Us</Link>
          <Link to="/signin">
            <Button type="text" className="text-gray-700 hover:text-blue-600 font-medium">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button type="primary" className="bg-blue-600 hover:bg-blue-700 border-none">
              Get Started
            </Button>
          </Link>
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button 
            type="text" 
            icon={<MenuOutlined />} 
            onClick={toggleMobileMenu}
            className="text-xl"
          />
        </div>
      </div>
      
      {/* Mobile Menu Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={toggleMobileMenu}
        open={mobileMenuOpen}
        width={280}
      >
        <Menu mode="vertical" className="border-r-0">
          <Menu.Item key="services">
            <Link to="/services" onClick={toggleMobileMenu}>Services</Link>
          </Menu.Item>
          <Menu.Item key="how-it-works">
            <Link to="/how-it-works" onClick={toggleMobileMenu}>How It Works</Link>
          </Menu.Item>
          <Menu.Item key="pricing">
            <Link to="/pricing" onClick={toggleMobileMenu}>Pricing</Link>
          </Menu.Item>
          <Menu.Item key="about">
            <Link to="/about" onClick={toggleMobileMenu}>About Us</Link>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="signin">
            <Link to="/signin" onClick={toggleMobileMenu}>Sign In</Link>
          </Menu.Item>
          <Menu.Item key="signup">
            <Link to="/signup" onClick={toggleMobileMenu}>
              <Button type="primary" block className="bg-blue-600 hover:bg-blue-700 border-none">
                Get Started
              </Button>
            </Link>
          </Menu.Item>
        </Menu>
      </Drawer>
    </header>
  );
};

export default LandingHeader; 