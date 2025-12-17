# Contributing to MapleKids Website

Thank you for considering contributing to the MapleKids Website! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing Guidelines](#testing-guidelines)

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards other contributors

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Git
- Firebase account (for backend features)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/maplekids-website.git
   cd maplekids-website
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file (copy from `.env.example` if available)

5. Start development server:
   ```bash
   npm start
   ```

## 🔄 Development Workflow

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes** following our coding standards

3. **Test your changes** thoroughly

4. **Commit your changes** with meaningful messages

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** to the main repository

## 🔀 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**: `npm test`
4. **Ensure code compiles**: `npm run build`
5. **Fill out the PR template** completely
6. **Request review** from maintainers
7. **Address feedback** promptly

### PR Naming Convention
- `feat: Add user authentication`
- `fix: Resolve dashboard loading issue`
- `refactor: Restructure React components`
- `docs: Update README with setup instructions`
- `test: Add tests for attendance module`

## 💻 Coding Standards

### File Structure
```
src/
├── features/          # Feature-based modules
│   ├── auth/
│   ├── attendance/
│   └── ...
├── components/
│   ├── common/        # Reusable components
│   └── layout/        # Layout components
├── pages/             # Page components
├── styles/            # Global styles
└── utils/             # Utility functions
```

### TypeScript
- Use TypeScript for all new files
- Define proper types/interfaces
- Avoid `any` type when possible
- Use strict mode

### React
- Use functional components with hooks
- Follow React best practices
- Use proper prop types
- Implement error boundaries for critical features

### Styling
- Use CSS modules or styled-components
- Follow BEM naming convention for CSS classes
- Ensure responsive design (mobile-first)
- Use CSS variables for theming

### Imports
- Use barrel exports (index.ts)
- Group imports logically:
  ```typescript
  // 1. External libraries
  import React from 'react';
  import { BrowserRouter } from 'react-router-dom';
  
  // 2. Internal modules
  import { AuthContext } from '../../auth/AuthContext';
  
  // 3. Components
  import { Button, Modal } from '../../../components/common';
  
  // 4. Styles
  import './MyComponent.css';
  ```

## 📝 Commit Message Guidelines

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples
```
feat(auth): Add password reset functionality

Implement password reset feature using Firebase authentication.
Users can now request a password reset link via email.

Closes #123
```

```
fix(attendance): Resolve date picker timezone issue

Fixed bug where date picker was showing incorrect dates
due to timezone conversion issues.

Fixes #456
```

## 🧪 Testing Guidelines

### Writing Tests
- Write tests for all new features
- Update tests when modifying existing code
- Aim for high code coverage (>80%)

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure
```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interaction', () => {
    // Test implementation
  });
});
```

## 📚 Documentation

- Update README.md for major changes
- Add JSDoc comments for complex functions
- Document API changes
- Update migration guides for breaking changes

## 🐛 Bug Reports

Use the bug report template when creating issues:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

## ✨ Feature Requests

Use the feature request template:
- Problem statement
- Proposed solution
- Benefits
- User impact

## 🔍 Code Review

### For Reviewers
- Be constructive and respectful
- Focus on code quality and maintainability
- Check for security issues
- Verify tests are adequate

### For Contributors
- Respond to feedback promptly
- Don't take feedback personally
- Ask questions if unclear
- Update PR based on feedback

## 📞 Getting Help

- Check existing issues and documentation
- Ask in discussions
- Reach out to maintainers

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

---

Thank you for contributing! 🙏
