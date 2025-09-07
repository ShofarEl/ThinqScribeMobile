# Contributing to ThinqScribe Mobile

Thank you for your interest in contributing to ThinqScribe Mobile! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Git
- A code editor (VS Code recommended)

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/ThinqScribeMobile.git
   cd ThinqScribeMobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

## 📋 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Use the bug report template
3. Include:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/videos if applicable
   - Device/OS information

### Suggesting Features

1. Check if the feature has already been suggested
2. Use the feature request template
3. Include:
   - Clear description
   - Use case and motivation
   - Mockups/wireframes if applicable
   - Additional context

### Code Contributions

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards
   - Write tests for new features
   - Update documentation

3. **Test your changes**
   ```bash
   npm run lint
   npm test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Standards

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use meaningful variable and function names
- Write self-documenting code
- Add comments for complex logic

### Component Guidelines

- Use functional components with hooks
- Follow React Native best practices
- Use the design system components
- Maintain consistent styling

### File Organization

- Use descriptive file names
- Group related files in folders
- Follow the established project structure
- Keep components small and focused

## 🎨 Design Guidelines

### UI/UX

- Follow the ThinqScribe design system
- Maintain consistency with existing screens
- Use proper spacing and typography
- Ensure accessibility compliance

### Typography

- Use the defined font system
- Maintain proper hierarchy
- Ensure readability on all devices

### Colors

- Use the ThinqScribe brand colors
- Maintain proper contrast ratios
- Follow accessibility guidelines

## 🧪 Testing

### Writing Tests

- Write unit tests for utility functions
- Write component tests for UI components
- Test edge cases and error conditions
- Maintain good test coverage

### Running Tests

```bash
npm test
```

## 📚 Documentation

### Code Documentation

- Document complex functions
- Use JSDoc for function documentation
- Keep README files updated
- Document API changes

### Commit Messages

Use conventional commit format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Build process or auxiliary tool changes

## 🔄 Pull Request Process

1. **Ensure your PR is ready**
   - All tests pass
   - Code follows style guidelines
   - Documentation is updated
   - No merge conflicts

2. **Create a descriptive PR**
   - Clear title and description
   - Link related issues
   - Include screenshots for UI changes
   - List breaking changes if any

3. **Respond to feedback**
   - Address review comments
   - Make requested changes
   - Keep discussions constructive

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority issues
- `priority: low` - Low priority issues

## 📞 Getting Help

- Check existing issues and discussions
- Join our Slack channel
- Email: dev@thinqscribe.com
- Create a new issue for questions

## 🎉 Recognition

Contributors will be recognized in:
- README contributors section
- Release notes
- Team announcements

Thank you for contributing to ThinqScribe Mobile! 🚀
