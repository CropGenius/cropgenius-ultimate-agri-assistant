# PRD Section 8: Code Structure Spec

This document defines the strictly enforced directory layout, file naming standards, and import/export strategies for the CropGenius codebase.

## 1. Root Directory Structure

-   **`/src`**: Contains all frontend application source code.
-   **`/public`**: Static assets that are publicly accessible (e.g., `favicon.ico`, `robots.txt`).
-   **`/supabase`**: All database-related files, including migrations and function definitions.
-   **`/prd`**: Contains all Production Requirement Document files.
-   **`package.json`**: Project dependencies and scripts.
-   **`vite.config.ts`**: Vite build and development server configuration.
-   **`tailwind.config.ts`**: Tailwind CSS theme and plugin configuration.
-   **`tsconfig.json`**: TypeScript compiler configuration, including path aliases.

## 2. `/src` Directory Layout

A feature-based modular architecture will be used.

-   **`/agents`**: Contains TypeScript classes or modules that encapsulate complex business logic, often interacting with external APIs or orchestrating multiple services (e.g., `AIFarmPlanAgent.ts`, `CropScanAgent.ts`).

-   **`/components`**: For globally reusable, purely presentational UI components.
    -   **`/ui`**: Unstyled, primitive components, typically from a library like ShadCN/Radix (e.g., `Button.tsx`, `Dialog.tsx`, `Card.tsx`).
    -   **`/shared`**: Application-specific shared components that may have some styling but no business logic (e.g., `PageLayout.tsx`, `LoadingSpinner.tsx`).

-   **`/features`**: The core of the application. Each folder represents a distinct feature and is self-contained.
    -   **`/auth`**
        -   `index.ts` (exports feature components)
        -   `LoginScreen.tsx`
        -   `SignupScreen.tsx`
        -   `useAuth.ts` (hook for auth logic)
        -   `authService.ts` (functions for Supabase calls)
        -   `components/LoginForm.tsx`

-   **`/hooks`**: Common, reusable React hooks that are not specific to any single feature (e.g., `useDebounce.ts`, `useMediaQuery.ts`).

-   **`/lib`**: Utility functions and third-party library initializations.
    -   `supabase.ts` (Supabase client instance)
    -   `utils.ts` (General utility functions)
    -   `queryClient.ts` (TanStack Query client instance)

-   **`/providers`**: Global React context providers (e.g., `AuthProvider.tsx`, `QueryProvider.tsx`).

-   **`/routes`**: Routing configuration.
    -   `index.tsx` (Defines all application routes using `react-router-dom`).

-   **`/types`**: Global TypeScript type definitions.
    -   `database.types.ts` (Auto-generated from Supabase schema)
    -   `api.ts` (Zod schemas and types for API contracts)

## 3. File Naming Conventions

-   **Components:** `PascalCase.tsx` (e.g., `UserProfile.tsx`)
-   **Hooks:** `useCamelCase.ts` (e.g., `useAuth.ts`)
-   **Services, Agents, Libs:** `camelCase.ts` (e.g., `authService.ts`)
-   **Tests:** `*.test.ts` or `*.test.tsx` (e.g., `UserProfile.test.tsx`)

## 4. Import/Export Strategy

-   **Absolute Imports:** Always use absolute path aliases defined in `tsconfig.json` (e.g., `import { Button } from '@/components/ui/button'`). This avoids long relative paths (`../../..`).
-   **Barrel Exports:** Use `index.ts` files within feature and component directories to create a clean public API for that module, simplifying imports from other parts of the app.
