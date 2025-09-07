import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  BookOpen,
  Users,
  Award,
  Zap,
  Shield,
  Clock,
  UserCheck,
  GraduationCap,
  Star,
  PenTool,
  Gift
} from 'lucide-react';
import HeaderComponent from '../components/HeaderComponent';
import { influencerApi } from '../api/influencer.js';

const SignUpPremium = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { referralCode: urlReferralCode } = useParams(); // For /ref/:referralCode routes
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    referralCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [referralInfluencer, setReferralInfluencer] = useState(null);
  const [hasReferralCode, setHasReferralCode] = useState(false);

  const { register, isAuthenticated } = useAuth();

  // Extract referral code from multiple sources
  useEffect(() => {
    const extractReferralCode = () => {
      // Priority: URL path params > URL query params > location state > localStorage
      const urlParams = new URLSearchParams(location.search);
      const queryReferralCode = urlParams.get('ref');
      const stateReferralCode = location.state?.referralCode;
      const storedReferralCode = localStorage.getItem('pending_referral_code');
      
      // Check all sources - URL path has highest priority
      const referralCode = urlReferralCode || queryReferralCode || stateReferralCode || storedReferralCode;
      
      console.log('Referral code sources:', {
        urlReferralCode,
        queryReferralCode,
        stateReferralCode,
        storedReferralCode,
        final: referralCode
      });
      
      if (referralCode) {
        const upperCode = referralCode.toUpperCase();
        setFormData(prev => ({ ...prev, referralCode: upperCode }));
        setHasReferralCode(true);
        
        // Clear from localStorage after using it
        if (storedReferralCode) {
          localStorage.removeItem('pending_referral_code');
        }
        
        // Fetch influencer info (but don't block if it fails)
        fetchInfluencerInfo(upperCode);
      }
    };

    extractReferralCode();
  }, [location.search, location.state, urlReferralCode]);

  const fetchInfluencerInfo = async (code) => {
    try {
      console.log('Fetching influencer info for code:', code);
      const response = await influencerApi.getInfluencerByReferralCode(code);
      console.log('Influencer response:', response);
      setReferralInfluencer(response.data);
    } catch (error) {
      console.error('Error fetching influencer info:', error);
      // Don't show error to user or reset referral code
      // Just proceed without influencer display name
      // The referral code is still valid for signup
      console.log('Proceeding with referral code without influencer info');
    }
  };

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

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      console.log('Submitting registration with data:', {
        ...formData,
        password: '[HIDDEN]',
        confirmPassword: '[HIDDEN]'
      });

      // Remove confirmPassword from the data sent to API
      const { confirmPassword, ...registrationData } = formData;
      
      await register(registrationData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Registration failed. Please try again.';
      setErrors({
        submit: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualReferralChange = (e) => {
    const value = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, referralCode: value }));
    
    if (value.length === 5) {
      setHasReferralCode(true);
      fetchInfluencerInfo(value);
    } else {
      setHasReferralCode(false);
      setReferralInfluencer(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <HeaderComponent />
      
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-64px)]">
        {/* Left Side - Sign Up Form */}
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
                Join ThinqScribe
              </h1>
              <p className="text-slate-600">
                Create your account and start your academic journey
              </p>
              
              {/* Referral Banner - Always show when referral code exists */}
              {hasReferralCode && formData.referralCode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Gift className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-800">
                      {referralInfluencer ? (
                        <>
                          Referred by <strong>{referralInfluencer.name}</strong>
                          {referralInfluencer.platform && (
                            <span className="text-xs text-green-600 ml-1">
                              ({referralInfluencer.platform.toUpperCase()})
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <strong>Referral Code Applied!</strong>
                          <span className="text-xs text-green-600 ml-1">
                            (Special benefits included)
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-xs text-green-600 mt-1 text-center">
                    Code: <strong className="font-mono text-sm">{formData.referralCode}</strong>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#015382] focus:border-transparent transition-colors ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
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
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
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
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#015382] focus:border-transparent transition-colors ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={formData.role === 'student'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      formData.role === 'student' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-300 hover:border-slate-400'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <GraduationCap className={`w-5 h-5 ${
                          formData.role === 'student' ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                        <div>
                          <div className={`font-medium ${
                            formData.role === 'student' ? 'text-blue-900' : 'text-slate-700'
                          }`}>
                            Student
                          </div>
                          <div className={`text-sm ${
                            formData.role === 'student' ? 'text-blue-700' : 'text-slate-500'
                          }`}>
                            Need help with assignments
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>

                  <label className="relative">
                    <input
                      type="radio"
                      name="role"
                      value="writer"
                      checked={formData.role === 'writer'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      formData.role === 'writer' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-300 hover:border-slate-400'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <PenTool className={`w-5 h-5 ${
                          formData.role === 'writer' ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                        <div>
                          <div className={`font-medium ${
                            formData.role === 'writer' ? 'text-blue-900' : 'text-slate-700'
                          }`}>
                            Writer
                          </div>
                          <div className={`text-sm ${
                            formData.role === 'writer' ? 'text-blue-700' : 'text-slate-500'
                          }`}>
                            Help students with assignments
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Manual Referral Code Input - Only show if no referral code from URL */}
              {!hasReferralCode && (
                <div>
                  <label htmlFor="manualReferralCode" className="block text-sm font-medium text-slate-700 mb-2">
                    Referral Code (Optional)
                  </label>
                  <div className="relative">
                    <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      id="manualReferralCode"
                      name="manualReferralCode"
                      maxLength={5}
                      style={{ textTransform: 'uppercase' }}
                      onChange={handleManualReferralChange}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#015382] focus:border-transparent transition-colors font-mono"
                      placeholder="Enter code (e.g. ABCDE)"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Have a referral code? Enter it here to unlock special benefits!
                  </p>
                </div>
              )}

              {/* Hidden referral code field */}
              <input
                type="hidden"
                name="referralCode"
                value={formData.referralCode}
              />

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Terms and Privacy */}
              <p className="text-xs text-slate-500 text-center">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-slate-600">
                  Already have an account?{' '}
                  <Link to="/signin" className="text-blue-600 hover:underline font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </motion.form>
          </div>
        </motion.div>

        {/* Right Side - Benefits */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white"
        >
          <div className="max-w-md">
            <h2 className="text-3xl font-bold mb-6">
              Why Choose ThinqScribe?
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Academic Excellence</h3>
                  <p className="text-blue-100">
                    Connect with expert writers who specialize in your field of study
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Fast & Reliable</h3>
                  <p className="text-blue-100">
                    Get your assignments completed on time with guaranteed quality
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
                  <p className="text-blue-100">
                    Your data is protected with bank-level security and confidentiality
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Quality Guaranteed</h3>
                  <p className="text-blue-100">
                    Satisfaction guaranteed with unlimited revisions and support
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-blue-200">Happy Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-blue-200">Expert Writers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm text-blue-200">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUpPremium;