# CropGenius Infinity-IQ Refactor & Scaling Master-Plan

**Version:** 1.0
**Date:** 2025-06-06

## 0. Guiding Principles

1.  **Domain-first, feature-centric structure:** Code organized by what it does for the user.
2.  **Thin UI, fat hooks/services (declarative React):** UI components focus on presentation; logic resides in hooks and services.
3.  **Single source of truth per concern:** Centralized management for data, agents, types, and error handling.
4.  **Offline-first by design:** Application remains functional and resilient without network connectivity.
5.  **“Red→Green→Refactor” with exhaustive automated tests:** Ensure stability and maintainability through rigorous testing.
6.  **Ship in vertical slices—always keep main branch deployable:** Incremental delivery of value without breaking the main application.

## 1. Phases & Timeline

### Phase-0 ‑ Alignment & Safety Net (Week 0 - Current)

- **Goal:** Create shared mental model & protect development velocity.
- **Deliverables:**
  - ADR-001: Folder structure specification (`docs/decisions/ADR-001-folder-structure.md`).
  - ADR-002: State-flow diagram & strategy (`docs/decisions/ADR-002-state-flow.md`).
  - This Roadmap document (`docs/ROADMAP.md`).
  - ESLint/Prettier/Husky configuration committed & CI blocking on violations.
- **KPIs:** All Pull Requests auto-linting; 100% team sign-off on ADRs.
- **Risks / Mitigation:** Documentation ignored → Mandatory PR template linking to ADRs; CI gate for linting.

### Phase-1 ‑ Feature-Based Directory Migration (Week 1)

- **Goal:** Restructure codebase into feature-centric modules.
- **Tasks:**
  1.  Scaffold `/src/features/{fields,market,planner,…}/{ui,hooks,agents,services,types,tests}` and `/src/core/...` directories.
  2.  Incrementally move existing files using `git mv` to preserve history (start with one feature, e.g., 'fields').
  3.  Add barrel exports (`index.ts`) for each new module to simplify imports.
  4.  Ensure build passes and core E2E smoke tests pass after each feature migration.
- **KPIs:** At least one major feature (e.g., 'fields') fully migrated; build green.

### Phase-2 ‑ Central Data Layer & React-Query (Weeks 1-2, overlaps with Phase 1)

- **Goal:** Standardize data fetching and state management for server interactions.
- **Tasks:**
  1.  Install and configure TanStack Query (React Query) if not already present.
  2.  Create `/src/core/data/<table>.ts` wrappers for Supabase interactions (e.g., `getFieldById`, `updateField`).
  3.  Refactor the first migrated feature (e.g., 'fields') to use TanStack Query hooks (`useQuery`, `useMutation`) instead of direct Supabase calls in UI components.
  4.  Implement basic offline caching strategy using TanStack Query's persistence features.
  5.  Document the data fetching pattern; consider an ESLint rule to disallow direct Supabase calls from UI components.
- **Success Metric:** Zero direct Supabase calls in `/src/features/<migrated_feature>/ui/`.

### Phase-3 ‑ Agent-Hook Unification (Week 2)

- **Goal:** Consolidate AI agent interaction patterns.
- **Tasks:**
  1.  Move agent logic (e.g., `CropScanAgent.ts`) into its respective feature directory (e.g., `/src/features/field/agents/CropScanAgent.ts`).
  2.  Create/refine custom hooks (e.g., `useCropScanAgent`) that use TanStack Query (`useMutation` or `useQuery`) to call the agent service.
  3.  Remove duplicate or legacy service helpers (e.g., `fieldAIService` if its functionality is covered by new agent hooks).
  4.  Add comprehensive unit tests for one pilot agent service and its hook (aim for high branch coverage as a template).
- **KPIs:** Pilot agent refactored and tested; clear pattern established.

### Phase-4 ‑ Component Decomposition (Weeks 3-4)

- **Goal:** Improve maintainability of large UI components.
- **Tasks:**
  1.  Identify oversized components (e.g., `FieldDetail.tsx`, `FarmPlanner.tsx`).
  2.  Split them into smaller, focused sub-components/views within their feature's `ui` directory (e.g., `FieldOverview`, `CropScanPanel`).
  3.  Ensure parent orchestrator components handle routing and layout primarily, delegating feature logic to sub-components and hooks.
- **KPIs:** Target components refactored; no UI file > ~250-300 LOC (guideline); SonarQube/Lizard cognitive complexity within acceptable limits.

### Phase-5 ‑ Unified Error Boundary & Telemetry (Week 4)

- **Goal:** Standardize error handling and reporting.
- **Tasks:**
  1.  Create/refine a generic `<AppErrorBoundary>` component in `/src/core/error/`.
  2.  Ensure it can accept `fallbackRender` props for feature-specific error UIs or use error type discrimination.
  3.  Integrate a central logger (e.g., to Supabase `error_logs` table, Sentry for production).
  4.  Replace redundant feature-specific error boundaries with the unified solution.
  5.  Update `App.tsx` or main layout to use the `AppErrorBoundary` at appropriate levels.
- **KPIs:** Single error boundary pattern adopted; error logging verified.

### Phase-6 ‑ Global Network / Sync Provider (Week 5)

- **Goal:** Centralize offline detection and sync management.
- **Tasks:**
  1.  Create/refine `/src/core/network/NetworkProvider.tsx` (or similar) exposing `isOnline` status and potentially `enqueueRequest` for offline queueing if not fully handled by TanStack Query.
  2.  Integrate existing `offlineSyncService.ts` to work seamlessly with TanStack Query's offline capabilities or as a standalone queue processor.
  3.  Refactor components to use the global network provider/hook instead of manual `isOffline` checks.
  4.  Implement a user-facing sync status indicator (e.g., toast, badge).
- **KPIs:** Centralized offline handling; manual checks removed from components.

### Phase-7 ‑ Types Consolidation & Prompt Extraction (Week 5)

- **Goal:** Improve type safety and maintainability of AI prompts.
- **Tasks:**
  1.  Consolidate shared TypeScript interfaces and types into `/src/core/types/` or feature-specific `/src/features/<feature>/types/` if not shared.
  2.  Use barrel exports for types.
  3.  Extract AI agent prompts from code into a structured format (e.g., `/src/features/<feature>/agents/prompts.ts` or JSON files) to support easier iteration and potential i18n.
  4.  Consider using Zod for runtime schema validation of AI responses and other external data.
- **KPIs:** Reduced type duplication; prompts managed centrally.

### Phase-8 ‑ Testing & CI Fortification (Weeks 5-6)

- **Goal:** Increase test coverage and CI reliability.
- **Tasks:**
  1.  Write unit tests (Vitest/Jest) for the new data layer, agent services, hooks, and critical utility functions.
  2.  Add Playwright/Cypress E2E tests for key user journeys (e.g., login, field creation, crop scan, offline data sync).
  3.  Integrate with a code coverage tool (e.g., Codecov) and set a target coverage gate in CI (e.g., ≥70%).
- **KPIs:** Test coverage increased by a target percentage; key E2E flows automated.

### Phase-9 ‑ Cleanup & Consistency (Week 6)

- **Goal:** Remove dead code and enforce coding standards.
- **Tasks:**
  1.  Identify and purge deprecated/backup files and unused code (`*-DESKTOP-*.tsx`, `node_modules.old`, etc.). Consider moving to a temporary `legacy/` branch before deletion.
  2.  Run `eslint --fix` and `prettier --write` across the codebase.
  3.  If necessary, use scripts or manual effort to enforce consistent file naming conventions (e.g., PascalCase for components, camelCase for hooks/services).
- **KPIs:** Codebase free of identified legacy files; linting and formatting consistency.

### Phase-10 ‑ Optional Excellence Tracks (Post-Week 6 / Ongoing)

- **Storybook:** Implement Storybook for UI atoms and reusable components to improve design consistency and component discoverability.
- **Monorepo (pnpm workspaces):** If the project grows significantly (e.g., separate mobile app, more complex edge functions), consider migrating to a pnpm monorepo structure.
- **Bundle Optimisation:** Regularly analyze the Vite bundle; leverage dynamic `import()` for code-splitting dashboards or less frequently used features.
- **End-to-End Tests Expansion:** Continuously add E2E tests for new features and critical paths.
- **Internationalization (i18n):** Expand i18n capabilities, leveraging extracted prompts.
- **Performance Monitoring:** Integrate performance monitoring tools.

## 2. Milestone Timeline (Gantt-style Overview)

| Phase                                | Week 0 | Week 1 | Week 2 | Week 3 | Week 4 | Week 5 | Week 6  |
| :----------------------------------- | :----- | :----- | :----- | :----- | :----- | :----- | :------ |
| **P0: Alignment & Safety Net**       | ✅     |        |        |        |        |        |         |
| **P1: Feature Directory Migration**  |        | ✅     |        |        |        |        |         |
| **P2: Data Layer & React-Query**     |        | ✅     | ✅     |        |        |        |         |
| **P3: Agent-Hook Unification**       |        |        | ✅     |        |        |        |         |
| **P4: Component Decomposition**      |        |        |        | ✅     | ✅     |        |         |
| **P5: Unified Error Boundary**       |        |        |        |        | ✅     |        |         |
| **P6: Global Network/Sync Provider** |        |        |        |        |        | ✅     |         |
| **P7: Types & Prompt Consolidation** |        |        |        |        |        | ✅     |         |
| **P8: Testing & CI Fortification**   |        |        |        |        |        | ✅     | ✅      |
| **P9: Cleanup & Consistency**        |        |        |        |        |        |        | ✅      |
| **P10: Optional Excellence**         |        |        |        |        |        |        | Ongoing |

_(✅ indicates primary focus for the week. Phases can overlap.)_

## 3. Ownership Matrix (Example - adjust as per team structure)

| Area                        | Lead          | Review/Support        |
| :-------------------------- | :------------ | :-------------------- |
| Overall & Folder Migration  | CTO/Tech Lead | Eng. Team             |
| Data Layer & TanStack Query | Backend Lead  | Frontend Lead, AI Eng |
| Agent Refactor              | AI Engineer   | Backend Lead          |
| Component Decomposition     | Frontend Lead | UX Lead               |
| Error Handling & Logging    | Platform Eng  | CTO/Tech Lead         |
| Network & Offline Sync      | PWA Expert    | Frontend Lead, QA     |
| Types & Prompts             | AI Engineer   | Tech Writer, QA       |
| Testing & CI                | QA Lead       | All Leads             |
| Documentation & ADRs        | Tech Lead     | All                   |

## 4. Exit Criteria (End of 6-Week Core Refactor)

- **Code Quality:** ≤0 ESLint critical errors; all Prettier checks passing.
- **Testing:** All core unit tests green; CI pipeline stable; target code coverage met (e.g., 70% for new/refactored modules).
- **Performance:** Lighthouse PWA score ≥90 (or maintained if already high).
- **Data Access:** `git grep "supabase.from" src/features/*/ui | wc -l` → 0 (or very close, with justifications for exceptions).
- **Developer Experience:** Onboarding a new developer to a feature area requires significantly less time (e.g., target ≤1-2 hours to understand a feature's structure and make a small change).
- **Stability:** Main branch remains deployable throughout the refactor; no major regressions in core functionality.

---

_This is a living document and will be updated as the project progresses._
