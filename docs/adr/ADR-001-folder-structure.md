# ADR-001: Folder Structure Specification

- **Status**: Proposed
- **Date**: 2025-06-05
- **Context**:
  To establish a clear, scalable, and maintainable folder structure for the CropGenius Infinity-IQ project, aligning with the "Domain-first, feature-centric" guiding principle. This structure will support independent feature development, reduce cognitive load, and improve developer onboarding, as outlined in the "CropGenius Infinity-IQ Refactor & Scaling Master-Plan".
- **Decision**:
  We will adopt a feature-based directory structure. Core, shared functionalities will reside in a `/core` directory. Feature-specific code will be organized under `/features`. All new development and refactoring will adhere to this structure.
- **Proposed Structure**:
  ```
  cropgenius-ultimate-agri-assistant/
  ├── public/                     # Static assets (icons, manifest.json, offline.html, service-worker.js etc.)
  ├── src/                        # Application source code
  │   ├── core/                   # Core, shared modules, framework-level concerns
  │   │   ├── auth/               # Authentication services, hooks, UI components (e.g., LoginPage, AuthProvider)
  │   │   ├── data/               # Central data access layer (TanStack Query wrappers for Supabase tables)
  │   │   ├── error/              # Global error handling (e.g., AppErrorBoundary, error logging service)
  │   │   ├── layout/             # Global layout components (e.g., MainLayout, Navbar, Sidebar)
  │   │   ├── network/            # Network status provider, offline synchronization service integration
  │   │   ├── ui/                 # Common, reusable UI components (e.g., Button, Input, Card - Storybook candidates)
  │   │   └── utils/              # Shared utility functions (e.g., date formatters, string manipulation)
  │   │
  │   ├── features/               # Feature-specific modules, organized by domain
  │   │   ├── <feature_name>/     # e.g., fields, market-insights, farm-planning, weather, chat
  │   │   │   ├── agents/         # AI agent logic specific to this feature (e.g., CropScanAgent, YieldPredictorAgent)
  │   │   │   ├── api/            # Feature-specific API client/service integrations (if not part of agents)
  │   │   │   ├── components/     # UI components specific and local to this feature
  │   │   │   ├── hooks/          # React hooks specific to this feature (e.g., useFeatureData, useFeatureActions)
  │   │   │   ├── pages/          # Top-level page components for this feature (entry points for routes)
  │   │   │   ├── services/       # Business logic services (non-agent, e.g., data transformation, complex state management)
  │   │   │   ├── tests/          # Unit, integration, E2E tests for this feature (e.g., *.test.ts, *.spec.ts)
  │   │   │   ├── types/          # TypeScript interfaces and types specific to this feature
  │   │   │   └── index.ts        # Barrel file exporting public APIs of the feature
  │   │   │
  │   │   └── ...                 # Other features (e.g., alerts, user-profile)
  │   │
  │   ├── agents/                 # (To be consolidated into /features/<feature_name>/agents/)
  │   │   └── prompts/            # Centralized agent prompts (multilingual keys, to be used by feature agents)
  │   │
  │   ├── App.tsx                 # Main application component (routing, global providers)
  │   ├── main.tsx                # Application entry point (renders App)
  │   ├── router.tsx              # Application routing configuration
  │   ├── vite-env.d.ts           # Vite environment type definitions
  │   └── types/                  # Global domain types and interfaces
  │       ├── domain/             # All shared domain interfaces (e.g., User, Farm, Field) - Phase-7 target
  │       │   └── index.ts        # Barrel file for domain types
  │       └── supabase.ts         # Auto-generated Supabase types (if applicable)
  │
  ├── docs/                       # Project documentation
  │   └── adr/                    # Architecture Decision Records
  │       ├── ADR-001-folder-structure.md
  │       └── ...
  │
  ├── netlify/                    # Netlify serverless functions (e.g., whatsapp-webhook.js)
  ├── supabase/                   # Supabase local development setup (migrations, seed data, config)
  ├── tests/                      # Global E2E tests setup, Playwright configurations
  ├── .github/                    # GitHub specific files (e.g., PR templates, workflow actions)
  │   └── PULL_REQUEST_TEMPLATE.md
  │
  ├── .env.example                # Environment variable template
  ├── .eslint.config.js           # ESLint configuration
  ├── .gitignore
  ├── .prettierrc.json            # Prettier configuration
  ├── .husky/                     # Husky Git hooks configuration
  ├── lint-staged.config.js       # Lint-staged configuration
  ├── netlify.toml                # Netlify deployment configuration
  ├── package.json
  ├── tsconfig.json               # TypeScript base configuration
  ├── vite.config.ts              # Vite configuration
  └── README.md
  ```
- **Consequences**:
  - **Positive**:
    - Improved modularity and clear separation of concerns.
    - Easier navigation and understanding of the codebase for existing and new developers.
    - Facilitates parallel development by different teams/individuals on separate features.
    - Scoped contexts: Each feature can manage its own state, logic, and UI components with minimal unintended side-effects.
    - Better code ownership and accountability.
  - **Neutral/Risks**:
    - Requires discipline to maintain consistency across features.
    - Initial effort to migrate existing code to the new structure.
    - Barrel exports (`index.ts`) will be crucial to manage import paths and avoid deep relative imports; overuse can also lead to large bundles if not tree-shaken properly.
    - Care must be taken to identify and promote genuinely shared components/logic to `/core` to avoid duplication.
- **Next Steps**:
  - Review and approve this ADR.
  - Commit this ADR to the repository.
  - Proceed with Phase-1 (Feature Directory Migration) based on this specification.
  - Develop ESLint rules to help enforce aspects of this structure (e.g., preventing direct imports between features except via barrel files or core modules).
