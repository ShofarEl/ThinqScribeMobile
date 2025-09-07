// frontend/src/constants.js
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  PAID: 'PAID',
  DISPUTED: 'DISPUTED',
  REFUNDED: 'REFUNDED'
};

export const WRITER_SPECIALTIES = {
  THESIS: 'Thesis Writing',
  RESEARCH: 'Research Papers',
  ESSAY: 'Essays',
  REVIEW: 'Literature Reviews',
  STEM: 'STEM Papers',
  BUSINESS: 'Business & Economics',
  LAW: 'Law & Legal Studies'
};

export const CITATION_STYLES = {
  APA: 'APA',
  MLA: 'MLA',
  CHICAGO: 'Chicago',
  HARVARD: 'Harvard',
  IEEE: 'IEEE',
  VANCOUVER: 'Vancouver'
};

export const FRONTEND_URL = 'https://thinqscribe.com';

// API Base URLs
export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api' 
  : 'https://thinkscribe-xk1e.onrender.com/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email'
  },

  // User Management
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
    DELETE_ACCOUNT: '/user/delete-account'
  },

  // Location Services
  LOCATION: {
    DETECT: '/location/detect',
    SUMMARY: '/location/summary',
    CURRENCY: '/location/currency',
    EXTERNAL_IP: '/location/external-ip',
    BY_IP: '/location/ip',
    IS_AFRICAN: '/location/is-african',
    CACHE_STATS: '/location/cache-stats',
    CLEAR_CACHE: '/location/cache'
  },

  // Payment Services
  PAYMENT: {
    // Legacy endpoints
    CREATE_CHECKOUT_SESSION: '/payment/create-checkout-session',
    WEBHOOK: '/payment/webhook',
    STATS: '/payment/stats',
    HISTORY: '/payment/history',
    METHODS: '/payment/methods',
    SESSION: '/payment/session',
    
    // Enhanced endpoints
    GATEWAY_RECOMMENDATION: '/payment/gateway-recommendation',
    CREATE_ENHANCED_CHECKOUT: '/payment/enhanced-checkout',
    ENHANCED_WEBHOOK: '/payment/enhanced-webhook',
    CURRENCY_RATE: '/payment/currency-rate',
    CURRENCIES: '/payment/currencies'
  },

  // Agreement Services
  AGREEMENT: {
    CREATE: '/agreements',
    LIST: '/agreements',
    GET: '/agreements',
    UPDATE: '/agreements',
    DELETE: '/agreements',
    ACCEPT: '/agreements/accept',
    REJECT: '/agreements/reject',
    COMPLETE: '/agreements/complete',
    PAYMENT: '/agreements/payment'
  },

  // Chat Services
  CHAT: {
    CONVERSATIONS: '/chat/conversations',
    MESSAGES: '/chat/messages',
    SEND_MESSAGE: '/chat/send',
    MARK_READ: '/chat/mark-read'
  },

  // AI Services
  AI: {
    CHAT: '/ai/chat',
    UPLOAD: '/ai/upload',
    HISTORY: '/ai/history',
    CLEAR_HISTORY: '/ai/clear-history'
  },

  // Writer Services
  WRITER: {
    PROFILE: '/writer/profile',
    DASHBOARD: '/writer/dashboard',
    ASSIGNMENTS: '/writer/assignments',
    EARNINGS: '/writer/earnings',
    REVIEWS: '/writer/reviews'
  },

  // Admin Services
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    WRITERS: '/admin/writers',
    PAYMENTS: '/admin/payments',
    STATS: '/admin/stats',
    SETTINGS: '/admin/settings'
  },

  // Support Services
  SUPPORT: {
    TICKETS: '/support/tickets',
    CREATE_TICKET: '/support/tickets',
    UPDATE_TICKET: '/support/tickets',
    MESSAGES: '/support/messages'
  },

  // Notification Services
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/mark-read',
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: '/notifications',
    SETTINGS: '/notifications/settings'
  }
};

// Payment Gateway Constants
export const PAYMENT_GATEWAYS = {
  STRIPE: 'stripe',
  PAYSTACK: 'paystack'
};

// Currency Constants
export const CURRENCIES = {
  USD: 'usd',
  EUR: 'eur',
  GBP: 'gbp',
  NGN: 'ngn',
  GHS: 'ghs',
  KES: 'kes',
  ZAR: 'zar',
  UGX: 'ugx',
  TZS: 'tzs',
  RWF: 'rwf',
  ZMW: 'zmw',
  EGP: 'egp',
  MAD: 'mad',
  INR: 'inr',
  CNY: 'cny',
  JPY: 'jpy',
  CAD: 'cad',
  AUD: 'aud'
};

// Payment Methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  MOBILE_MONEY: 'mobile_money',
  USSD: 'ussd',
  QR: 'qr',
  PAYPAL: 'paypal',
  SEPA_DEBIT: 'sepa_debit',
  ALIPAY: 'alipay',
  WECHAT_PAY: 'wechat_pay'
};

// Location Constants
export const AFRICAN_COUNTRIES = [
  'dz', 'ao', 'bj', 'bw', 'bf', 'bi', 'cm', 'cv', 'cf', 'td', 'km', 'cd', 'cg', 'ci', 'dj', 'eg', 'gq', 'er', 'et', 'ga', 'gm', 'gh', 'gn', 'gw', 'ke', 'ls', 'lr', 'ly', 'mg', 'mw', 'ml', 'mr', 'mu', 'ma', 'mz', 'na', 'ne', 'ng', 'rw', 'st', 'sn', 'sc', 'sl', 'so', 'za', 'ss', 'sd', 'sz', 'tz', 'tg', 'tn', 'ug', 'zm', 'zw'
];

// API Response Status
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
  IDLE: 'idle'
};

// WebSocket Events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
  PAYMENT_SUCCESS: 'paymentSuccess',
  PAYMENT_RECEIVED: 'paymentReceived',
  NOTIFICATION: 'notification',
  TYPING: 'typing',
  STOP_TYPING: 'stopTyping'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  LOCATION_DATA: 'location_data',
  CURRENCY_PREFERENCE: 'currency_preference',
  GATEWAY_PREFERENCE: 'gateway_preference',
  CHAT_HISTORY: 'chat_history',
  THEME: 'theme',
  LANGUAGE: 'language'
};