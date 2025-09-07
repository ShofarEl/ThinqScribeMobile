// Enhanced auth.js middleware with comprehensive debugging
import dotenv from "dotenv"
dotenv.config()
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  console.log('=== AUTH MIDDLEWARE DEBUG START ===');
  console.log('Request URL:', req.originalUrl);
  console.log('Request Method:', req.method);
  console.log('All Headers:', JSON.stringify(req.headers, null, 2));
  
  let token;
  
  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('✅ Token found in Authorization header');
    console.log('Token (first 20 chars):', token?.substring(0, 20) + '...');
  } else {
    console.log('❌ No Authorization header or invalid format');
    console.log('Authorization header:', req.headers.authorization);
  }

  // Also check cookies as fallback
  if (!token && req.cookies?.edusage_auth_token) {
    token = req.cookies.edusage_auth_token;
    console.log('✅ Token found in cookies');
  }

  if (!token) {
    console.log('❌ NO TOKEN FOUND - Sending 401');
    console.log('=== AUTH MIDDLEWARE DEBUG END ===');
    return res.status(401).json({ 
      message: 'Not authorized - No token provided',
      debug: {
        hasAuthHeader: !!req.headers.authorization,
        authHeaderValue: req.headers.authorization,
        hasCookies: !!req.cookies,
        cookies: req.cookies
      }
    });
  }

  try {
    console.log('🔍 Attempting to verify token...');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified successfully');
    console.log('Decoded payload:', JSON.stringify(decoded, null, 2));
    
    // Find user
    console.log('🔍 Looking up user with ID:', decoded.id);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({ 
        message: 'Not authorized - User not found',
        debug: { userId: decoded.id }
      });
    }
    
    console.log('✅ User found:', {
      id: user._id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    });
    
    req.user = user;
    console.log('✅ Auth middleware passed - proceeding to next()');
    console.log('=== AUTH MIDDLEWARE DEBUG END ===');
    next();
    
  } catch (err) {
    console.log('❌ TOKEN VERIFICATION FAILED');
    console.error('JWT Error:', err.message);
    console.error('JWT Error Name:', err.name);
    console.error('Full error:', err);
    
    let errorMessage = 'Not authorized - Invalid token';
    
    if (err.name === 'TokenExpiredError') {
      errorMessage = 'Not authorized - Token expired';
    } else if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Not authorized - Malformed token';
    }
    
    console.log('=== AUTH MIDDLEWARE DEBUG END ===');
    return res.status(401).json({ 
      message: errorMessage,
      debug: {
        errorName: err.name,
        errorMessage: err.message,
        tokenLength: token?.length
      }
    });
  }
};