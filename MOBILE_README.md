# ThinqScribe Mobile App

A sophisticated React Native mobile application for ThinqScribe - the premier academic writing services platform. This mobile app provides a complete, production-ready experience optimized for iOS and Android devices.

## 🚀 Features

### 📱 Core Mobile Features
- **Biometric Authentication** - Touch ID/Face ID support for secure login
- **Real-time Chat System** - Instant messaging with file sharing and voice messages
- **Push Notifications** - Stay updated with project progress and messages
- **Offline Support** - Access key features even without internet connection
- **Professional UI/UX** - Material Design 3 with smooth animations

### 👥 User Roles
- **Students** - Find writers, create agreements, manage projects
- **Writers** - Accept projects, communicate with students, track earnings

### 💰 Payment System
- **Multi-currency Support** - Auto-detected based on user location
- **Flexible Payment Options** - Full payment or installments
- **Secure Processing** - Industry-standard encryption
- **Payment History** - Detailed transaction records

### 🔒 Security & Privacy
- **End-to-end Encryption** - Secure data transmission
- **Biometric Authentication** - Enhanced security options
- **Privacy Controls** - Granular notification preferences
- **Data Protection** - GDPR compliant privacy practices

## 🛠 Tech Stack

### Framework & Core
- **React Native** 0.79.5 - Cross-platform mobile development
- **Expo** ~53.0.22 - Development and deployment platform
- **TypeScript** ~5.8.3 - Type-safe development
- **Expo Router** ~5.1.5 - File-based navigation system

### UI & Design
- **React Native Paper** ^5.12.3 - Material Design components
- **React Native Reanimated** ^3.16.1 - Smooth animations
- **React Native Gesture Handler** ^2.20.2 - Touch interactions
- **Expo Linear Gradient** ^14.1.5 - Beautiful gradients

### Real-time Features
- **Socket.io Client** ^4.8.1 - Real-time communication
- **Expo AV** ~15.1.7 - Audio/video recording and playback
- **React Native Voice** - Voice message support

### Storage & Security
- **Expo Secure Store** - Secure credential storage
- **AsyncStorage** - Local data persistence
- **Expo Local Authentication** - Biometric authentication
- **Expo Crypto** - Cryptographic functions

### Media & Files
- **Expo Image Picker** ~16.1.4 - Photo/video selection
- **Expo Document Picker** ^13.1.6 - File selection
- **Expo Image** ~2.4.0 - Optimized image component
- **React Native Vector Icons** - Icon library

### Development & Build
- **EAS Build** - Cloud-based builds
- **EAS Submit** - App store submissions
- **Expo Dev Client** - Custom development builds
- **TypeScript ESLint** - Code quality

## 📁 Project Structure

```
ThinqScribeMobile/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx            # Dashboard
│   │   ├── messages.tsx         # Messages list
│   │   ├── explore.tsx          # Explore writers
│   │   └── profile.tsx          # User profile
│   ├── chat/[chatId].tsx        # Real-time chat
│   ├── writers.tsx              # Writer selection
│   ├── create-agreement.tsx     # Agreement creation
│   ├── profile-settings.tsx     # Profile management
│   ├── audio-call.tsx           # Voice calls
│   ├── notifications.tsx        # Notifications
│   ├── signin.tsx               # Authentication
│   ├── signup.tsx               # User registration
│   ├── privacy.tsx              # Privacy policy
│   ├── terms.tsx                # Terms of service
│   └── support.tsx              # Help & support
├── src/                         # Source code
│   ├── api/                     # API integration
│   ├── components/              # Reusable components
│   ├── context/                 # React contexts
│   │   └── MobileAuthContext.tsx # Authentication
│   ├── hooks/                   # Custom hooks
│   ├── styles/                  # Styling system
│   │   └── mobileTheme.ts       # Theme configuration
│   ├── types/                   # TypeScript definitions
│   └── utils/                   # Utility functions
├── assets/                      # Static assets
├── eas.json                     # EAS configuration
├── app.json                     # Expo configuration
└── package.json                 # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (Mac) or Android Studio
- EAS CLI: `npm install -g eas-cli`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ThinqScribeMobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   ```bash
   # iOS
   npx expo run:ios
   
   # Android
   npx expo run:android
   ```

### Environment Setup

Create `.env` file in root directory:
```env
EXPO_PUBLIC_API_URL=https://your-api-url.com
EXPO_PUBLIC_SOCKET_URL=https://your-socket-url.com
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🔧 Configuration

### EAS Build Configuration

The app is configured for EAS Build with different build profiles:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### App Configuration

Key app.json settings:
- **Permissions**: Camera, microphone, notifications
- **Splash Screen**: Custom branding
- **Icons**: Adaptive icons for all platforms
- **Deep Links**: Custom URL scheme
- **Push Notifications**: FCM configuration

## 📱 Features Deep Dive

### Authentication System
- **Biometric Login** - Touch ID/Face ID integration
- **Secure Storage** - Encrypted credential storage
- **Auto-login** - Remember me functionality
- **Social Login** - Google/Apple sign-in ready

### Real-time Chat
- **Instant Messaging** - Socket.io powered
- **File Sharing** - Documents, images, videos
- **Voice Messages** - Record and playback
- **Message Status** - Sent, delivered, read indicators
- **Typing Indicators** - Real-time typing status

### Payment Integration
- **Multi-currency** - Auto-detection by location
- **Stripe Integration** - Secure card processing
- **Installment Plans** - Flexible payment options
- **Payment History** - Detailed transaction records

### Notification System
- **Push Notifications** - Firebase Cloud Messaging
- **In-app Notifications** - Real-time updates
- **Notification Categories** - Organized by type
- **Preferences** - Granular control settings

## 🏗 Building & Deployment

### Development Build
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Production Build
```bash
eas build --profile production --platform all
```

### App Store Submission
```bash
eas submit --platform ios
eas submit --platform android
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Testing
```bash
npm run test:e2e
```

### Performance Testing
```bash
npm run test:performance
```

## 📊 Performance Optimizations

- **Image Optimization** - Expo Image with caching
- **Bundle Splitting** - Dynamic imports for large screens
- **Memory Management** - Proper cleanup of resources
- **Network Optimization** - Request caching and retry logic
- **Animation Performance** - Native driver usage

## 🔐 Security Features

- **Biometric Authentication** - Touch ID/Face ID
- **Secure Storage** - Encrypted local storage
- **Certificate Pinning** - Network security
- **Data Encryption** - End-to-end encryption
- **Privacy Controls** - GDPR compliant

## 🌍 Internationalization

- **Multi-language Support** - i18n ready
- **RTL Support** - Right-to-left languages
- **Currency Localization** - Regional currency formats
- **Date/Time Formatting** - Locale-specific formats

## 📈 Analytics & Monitoring

- **Crash Reporting** - Sentry integration ready
- **Performance Monitoring** - Real-time metrics
- **User Analytics** - Usage tracking
- **Error Logging** - Comprehensive error tracking

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: [Link to docs]
- **Issues**: [GitHub Issues]
- **Email**: support@thinqscribe.com
- **Discord**: [Community Discord]

## 🎯 Roadmap

- [ ] Offline mode improvements
- [ ] Video calling feature
- [ ] Advanced search filters
- [ ] Writer portfolio showcase
- [ ] AI-powered recommendations
- [ ] Multi-language support
- [ ] Desktop companion app

---

**ThinqScribe Mobile** - Empowering academic success through technology 🎓📱
