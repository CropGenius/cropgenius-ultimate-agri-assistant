# CropGenius Technology Stack

## Frontend Stack
- **React 18** with TypeScript and strict mode
- **Vite** for development and optimized production builds
- **Tailwind CSS** with custom design system and glassmorphism effects
- **Framer Motion** for premium animations and micro-interactions
- **React Query (@tanstack/react-query)** for server state management and caching
- **React Router v6** with lazy loading and code splitting
- **shadcn/ui** component library with Radix UI primitives

## Backend & Database
- **Supabase** as Backend-as-a-Service
  - PostgreSQL database with Row Level Security (RLS)
  - Real-time subscriptions for live updates
  - Edge Functions for serverless AI processing
  - Authentication with Google OAuth
  - File storage for images and documents

## AI & External Integrations
- **Google Gemini AI** - Treatment recommendations and chat responses
- **PlantNet API** - Plant identification and disease detection
- **OpenWeatherMap API** - Weather data and forecasts
- **Sentinel Hub API** - Satellite imagery and NDVI analysis
- **WhatsApp Business API** - Farmer communication

## Build System & Tools
- **TypeScript** with path aliases (`@/*` → `./src/*`)
- **ESLint + Prettier** for code quality and formatting
- **Vitest** for unit testing with React Testing Library
- **Jest** for integration testing
- **PWA** with service worker for offline capabilities

## Common Commands

### Development
```bash
npm run dev          # Start development server (port 8080)
npm run build        # Production build with PWA assets
npm run build:dev    # Development build
npm run preview      # Preview production build
```

### Database Operations
```bash
npm run db:setup     # Setup database schema
npm run db:migrate   # Run database migrations
npm run db:reset     # Reset database (Supabase)
npm run db:seed      # Seed test data
npm run db:all       # Migrate and seed
```

### Testing
```bash
npm run test                    # Run unit tests (Vitest)
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report
npm run test:onboarding        # Integration tests (Jest)
npm run test:onboarding:watch  # Watch integration tests
```

### Code Quality
```bash
npm run lint         # ESLint checking
npm run generate-pwa-assets  # Generate PWA icons and manifests
```

## Environment Configuration
- 15+ API keys required (see `.env.example`)
- Supabase URL and anon key for database access
- AI service keys (Gemini, PlantNet)
- Weather and satellite imagery APIs
- WhatsApp Business API credentials

## Architecture Patterns
- **Feature-based folder structure** in `src/features/`
- **Agent pattern** for AI services in `src/agents/`
- **Service layer** for API clients in `src/services/`
- **Custom hooks** for reusable logic in `src/hooks/`
- **Provider pattern** for global state (Auth, Growth Engine)
- **Offline-first** with React Query and service worker