# ThinqScribe Mobile App

A modern, professional mobile application for academic writing services, built with React Native and Expo.

## 🚀 Features

- **Modern UI/UX**: Clean, professional design with custom typography
- **Cross-Platform**: Works seamlessly on iOS and Android
- **Authentication**: Secure sign-in/sign-up with biometric support
- **Real-time Chat**: Live communication between students and writers
- **Payment Integration**: Secure payment processing
- **Push Notifications**: Real-time updates and alerts
- **Professional Typography**: Custom font system with Avenir (iOS) and Roboto (Android)

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **UI Components**: React Native Paper
- **State Management**: Zustand
- **Authentication**: Custom auth system with biometric support
- **Real-time**: Socket.io
- **Styling**: Custom design system with professional typography
- **Animations**: React Native Reanimated

## 📱 Screenshots

*Coming soon...*

## 🏗️ Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ThinqScribeMobile.git
   cd ThinqScribeMobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - Scan the QR code with Expo Go app (Android/iOS)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser

## 🎨 Design System

The app uses a comprehensive design system with:

- **Colors**: ThinqScribe brand colors (#015382 primary)
- **Typography**: Platform-optimized fonts (Avenir for iOS, Roboto for Android)
- **Components**: Reusable UI components
- **Spacing**: Consistent 8pt grid system
- **Shadows**: Professional depth system

## 📁 Project Structure

```
ThinqScribeMobile/
├── app/                    # Expo Router pages
│   ├── signin.tsx         # Sign in screen
│   ├── signup.tsx         # Sign up screen
│   ├── index.tsx          # Landing screen
│   └── (tabs)/            # Tab navigation
├── src/
│   ├── components/        # Reusable components
│   ├── context/          # React contexts
│   ├── screens/          # Screen components
│   ├── styles/           # Design system & themes
│   ├── api/              # API services
│   └── utils/            # Utility functions
├── assets/
│   ├── fonts/            # Custom fonts
│   └── images/           # Images and logos
└── docs/                 # Documentation
```

## 🔧 Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run lint` - Run ESLint

### Code Style

- ESLint configuration for code quality
- TypeScript for type safety
- Consistent naming conventions
- Component-based architecture

## 🚀 Deployment

### Building for Production

1. **Configure EAS Build**
   ```bash
   npx eas build:configure
   ```

2. **Build for iOS**
   ```bash
   npx eas build --platform ios
   ```

3. **Build for Android**
   ```bash
   npx eas build --platform android
   ```

### App Store Deployment

- Follow Expo's deployment guide
- Configure app store credentials
- Submit for review

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development**: ThinqScribe Development Team
- **Design**: ThinqScribe Design Team
- **Product**: ThinqScribe Product Team

## 📞 Support

For support, email support@thinqscribe.com or join our Slack channel.

## 🔗 Links

- [Website](https://thinqscribe.com)
- [Documentation](https://docs.thinqscribe.com)
- [API Documentation](https://api.thinqscribe.com/docs)

---

**Built with ❤️ by the ThinqScribe Team**