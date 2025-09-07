import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  BookOpen,
  Users,
  Award,
  Zap,
  Star,
  GraduationCap
} from 'lucide-react';
import HeaderComponent from '../components/HeaderComponent';

const SignInPremium = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (error) {
      const errorMessage = error.response?.data?.userFriendlyMessage || 
                          error.userFriendlyMessage || 
                          error.message || 
                          'Sign in failed. Please check your credentials and try again.';
      setErrors({
        submit: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <HeaderComponent />
      
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-64px)]">
        {/* Left Side - Sign In Form */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-12"
        >
          <div className="max-w-md mx-auto w-full">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome back to ThinqScribe
              </h1>
              <p className="text-slate-600">
                Sign in to access your academic workspace
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Submit Error */}
              {errors.submit && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{errors.submit}</span>
                </motion.div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#015382] focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#015382] focus:border-transparent transition-colors ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-[#015382] hover:text-[#014361] font-medium"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#015382] hover:bg-[#014361] disabled:bg-[#015382]/60 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-[#015382] hover:text-[#014361] font-semibold">
                    Create one now
                  </Link>
                </p>
              </div>
            </motion.form>

            {/* Security Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center justify-center gap-2 mt-8 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Your data is protected with enterprise-grade security</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Testimonial/Benefits */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative bg-gradient-to-br from-[#015382] to-[#014361] flex items-center justify-center p-6 sm:p-12"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-white rounded-full"></div>
            <div className="absolute bottom-20 left-20 w-12 h-12 bg-white rounded-full"></div>
            <div className="absolute bottom-40 right-10 w-24 h-24 bg-white rounded-full"></div>
          </div>

          {/* Content */}
          <div className="relative max-w-md">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-6"
            >
              <Star className="w-4 h-4" />
              Join 50,000+ Successful Students
            </motion.div>

            {/* Main Message */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-3xl font-bold text-white mb-6"
            >
              Your Academic Success Starts Here
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-white/80 mb-8 leading-relaxed"
            >
              Access expert academic writers, AI-powered tools, and comprehensive support to excel in your educational journey.
            </motion.p>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="space-y-4"
            >
              {[
                { icon: <GraduationCap className="w-5 h-5" />, text: "Expert Academic Writers" },
                { icon: <Zap className="w-5 h-5" />, text: "AI-Powered Writing Tools" },
                { icon: <Award className="w-5 h-5" />, text: "Quality Guaranteed" },
                { icon: <Users className="w-5 h-5" />, text: "24/7 Support" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                  className="flex items-center gap-3 text-white"
                >
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-lg">
                    {feature.icon}
                  </div>
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-6 -right-6 bg-yellow-500 text-white p-3 rounded-full shadow-lg"
            >
              <BookOpen className="w-6 h-6" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignInPremium;