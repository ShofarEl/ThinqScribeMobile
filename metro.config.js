const { getDefaultConfig } = require('expo/metro-config');

// Get the default Expo Metro config
const config = getDefaultConfig(__dirname);

// Force Expo Router to use the correct app directory
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure the config handles TypeScript and JavaScript files properly
config.resolver.sourceExts.push('mjs');

// Configure for better builds
config.transformer.minifierConfig = {
  mangle: {
    keep_fnames: true,
  },
};

// Add font file extensions to asset extensions
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2');

module.exports = config;

