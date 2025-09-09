export default function Sitemap() {
  return [
    // Main pages
    '',
    'about',
    'signin',
    'signup',
    
    // Tab pages
    '(tabs)',
    '(tabs)/explore',
    '(tabs)/messages', 
    '(tabs)/profile',
    
    // Feature pages
    'audio-call',
    'create-agreement',
    'writers',
    
    // Agreement pages
    'agreement/[agreementId]',
    
    // Chat pages
    'chat/[chatId]',
    
    // Payment pages
    'payment-failed',
    'payment-history', 
    'payment-success',
    
    // Settings and info pages
    'profile-settings',
    'notifications',
    'support',
    'privacy',
    'terms'
  ];
}
