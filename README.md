
# CROPGenius - AI-Powered Farming Intelligence System

## Overview
CROPGenius is an advanced AI-powered farming intelligence system designed specifically for farmers in Africa. The platform provides real-time insights, alerts, and recommendations to optimize farm operations, increase yields, and maximize profits.

## Key Features
- 🌱 AI Crop Scanner: Instant disease detection with AI-prescribed treatment plans
- 🌦️ AI Weather Engine: Hyperlocal weather forecasts with smart farming advisories
- 📈 AI Smart Market: Real-time crop pricing and AI-driven sales strategies
- 🚜 AI Farm Plan: Daily AI-generated task list optimized for local conditions
- 💬 AI Chat Expert: 24/7 AI farming assistant with instant, expert-level answers
- 📊 AI Yield Predictor: Analyzes farm data to predict harvest size and optimal selling time

## Technologies
This project is built with:
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (backend)
- PostHog (analytics)
- Playwright (E2E testing)
- Vitest (unit testing)

## Mobile-First Approach
CROPGenius is designed with a mobile-first approach, optimized for the devices and connectivity conditions prevalent across Africa:
- Responsive design that works on all screen sizes
- Offline capabilities for areas with limited connectivity
- Low data usage optimizations
- Touch-friendly interface for field use

## Analytics & Monitoring

CROPGenius uses PostHog for product analytics and monitoring. This helps us understand how users interact with the application and identify areas for improvement.

Key metrics tracked:
- User behavior and feature usage
- Error tracking and debugging
- Performance metrics
- Conversion funnels

## Testing

### Unit Testing
Run unit tests with Vitest:
```bash
npm run test:unit
```

Run tests in watch mode:
```bash
npm run test:unit:watch
```

Generate test coverage report:
```bash
npm run test:unit:coverage
```

### End-to-End Testing
Run E2E tests with Playwright:
```bash
# Run all tests
npm run test:e2e

# Run tests in UI mode
npm run test:e2e:ui

# Debug tests
npm run test:e2e:debug

# Update snapshots
npm run test:e2e:update-snapshots
```

### Running All Tests
Run both unit and E2E tests:
```bash
npm run test:all
```

## Future Development
- Multi-language support for various African regions
- Integration with IoT sensors for automated data collection
- Expanded marketplace for connecting farmers with buyers
- Community features for knowledge sharing between farmers

## License
CROPGenius is licensed under the MIT License. See the LICENSE file for details.
