# CropGenius Architecture & Development Standards

## Project Structure Philosophy
CropGenius follows a feature-driven architecture optimized for scalability and maintainability at enterprise scale.

```
src/
├── agents/           # AI intelligence layer - autonomous farming experts
├── components/       # Reusable UI components with atomic design
├── features/         # Feature modules (auth, onboarding, fields, etc.)
├── services/         # API clients and data access layer
├── hooks/           # Custom React hooks for business logic
├── providers/       # Global state management (Auth, Growth Engine)
├── utils/           # Pure utility functions
├── types/           # TypeScript definitions and interfaces
└── styles/          # Global CSS and design tokens
```

## Code Quality Standards

### TypeScript Usage
- Strict mode disabled for rapid development but maintain type safety
- Use interfaces over types for object shapes
- Leverage path aliases: `@/components`, `@/services`, `@/types`
- No `any` types in production code

### Component Architecture
- Functional components with hooks exclusively
- Props interfaces defined inline or in separate types file
- Use `React.memo()` for expensive renders
- Implement proper error boundaries

### State Management Patterns
- **Server State**: React Query for API data, caching, and synchronization
- **Client State**: useState for local component state
- **Global State**: Context providers (Auth, Growth Engine)
- **Form State**: React Hook Form with Zod validation

### API Integration Standards
- All external APIs wrapped in service layer (`src/services/`)
- Error handling with exponential backoff
- Offline-first approach with React Query
- Rate limiting and request deduplication

## AI Agent Architecture
Each agent follows a consistent interface:
```typescript
interface AIAgent {
  process(input: any): Promise<AgentResponse>
  validate(input: any): boolean
  getConfidence(): number
}
```

### Agent Responsibilities
- **CropDiseaseOracle**: Visual disease identification + treatment
- **WeatherAgent**: Agricultural weather intelligence
- **FieldBrainAgent**: Satellite field analysis
- **SmartMarketAgent**: Market price optimization
- **WhatsAppFarmingBot**: Natural language farming assistance

## Database Patterns
- Row Level Security (RLS) on all user data tables
- Real-time subscriptions for live updates
- Edge Functions for AI processing
- Optimistic updates with React Query

### Key Tables
- `profiles` - User information and preferences
- `farms` - Farm metadata and ownership
- `fields` - Field boundaries and crop data
- `tasks` - Farm management activities
- `weather_data` - Historical and forecast data

## Performance Optimization
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle analysis with rollup-plugin-visualizer
- Service worker for offline capabilities
- React Query for intelligent caching

## Mobile-First Design Principles
- Touch-friendly interfaces (44px minimum touch targets)
- Thumb-zone navigation patterns
- Glassmorphism UI with backdrop blur
- Haptic feedback integration
- One-handed operation optimization

## Testing Strategy
- Unit tests for utilities and hooks
- Component tests with React Testing Library
- Integration tests for user flows
- E2E tests for critical paths (planned)
- API mocking with MSW

## Security Considerations
- API keys in environment variables only
- Supabase RLS for data access control
- Input validation on all user inputs
- HTTPS enforcement in production
- Content Security Policy headers

## Development Workflow
1. Feature branch from main
2. Implement with tests
3. Code review and approval
4. Merge to main triggers deployment
5. Monitor performance and errors

## Common Patterns to Follow

### Error Handling
```typescript
try {
  const result = await apiCall()
  return { success: true, data: result }
} catch (error) {
  console.error('Operation failed:', error)
  return { success: false, error: error.message }
}
```

### Component Structure
```typescript
interface ComponentProps {
  // Props definition
}

export const Component: React.FC<ComponentProps> = ({ prop }) => {
  // Hooks at top
  // Event handlers
  // Render logic
  return <div>...</div>
}
```

### Service Layer
```typescript
export class ServiceName {
  private static instance: ServiceName
  
  static getInstance(): ServiceName {
    if (!this.instance) {
      this.instance = new ServiceName()
    }
    return this.instance
  }
  
  async method(): Promise<Result> {
    // Implementation
  }
}
```

This architecture supports CropGenius's mission to serve 100M+ African farmers with enterprise-grade reliability and performance.