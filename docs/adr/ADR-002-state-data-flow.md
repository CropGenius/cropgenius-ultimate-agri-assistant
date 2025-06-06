# ADR-002: App State & Data Flow Diagram

- **Status**: Proposed
- **Date**: 2025-06-05
- **Context**:
  To define a clear, consistent, and scalable approach to managing application state and data flow in CropGenius, aligning with the "Declarative React: thin UI, fat hooks/services" and "Single source of truth per concern" principles from the "CropGenius Infinity-IQ Refactor & Scaling Master-Plan". This is crucial for managing complexity as the application grows, ensuring offline capabilities, and maintaining a responsive user experience.
- **Decision**:
  We will adopt a layered approach to state management and data flow, prioritizing server state management with TanStack Query, client state with React Context/Zustand for global UI concerns, and local component state for transient UI data. Data will flow unidirectionally where possible.

- **Core Principles**:

  1.  **Server State (Primary)**:
      - Managed by `@tanstack/react-query`.
      - All data fetched from or mutated in Supabase (or other backend services) will be handled via TanStack Query hooks.
      - Provides caching, background updates, optimistic updates, and request deduplication.
      - Crucial for offline support through query persistence (Phase-2 target).
      - Data fetching logic will be encapsulated in `/core/data/<table>.ts` wrappers and exposed via feature-specific hooks (e.g., `useFields` in `/features/fields/hooks/`).
  2.  **Global Client State (Secondary)**:
      - Managed by React Context API for simple global state (e.g., theme, user preferences, network status) or Zustand for more complex global client state if needed.
      - To be used for UI state that needs to be shared across multiple, disconnected parts of the application and is not server-derived.
      - Example: `NetworkProvider` (Phase-6) exposing `isOnline` status.
  3.  **Local Component State (Tertiary)**:
      - Managed by `useState` and `useReducer` hooks within individual components.
      - Used for transient UI state, form inputs, component-specific loading/error states not covered by TanStack Query, and controlling UI elements.
  4.  **Data Flow**:
      - Primarily unidirectional: UI triggers actions (e.g., via hooks) → actions update server state (TanStack Query) or global/local client state → state changes propagate back to the UI, causing re-renders.
      - Avoid direct manipulation of DOM or state from outside the defined flow.
  5.  **Offline Handling**:
      - TanStack Query's persistence will be the primary mechanism for caching server data for offline use.
      - The `NetworkProvider` and `offlineSyncService` (Phase-6) will manage queuing of mutations made while offline and synchronizing them when connectivity is restored.

- **High-Level Data Flow Diagram**:

  ```mermaid
  graph TD
      A[User Interaction] --> B(UI Components);
      B -- Triggers Action --> C{Hooks (e.g., useSaveField, useAgent)};
      C -- Server Data Request/Mutation --> D[TanStack Query Engine];
      D -- Interacts with --> E[Supabase Client (/core/data wrappers)];
      E -- CRUD Operations --> F[(Supabase Database)];
      F -- Returns Data/Status --> E;
      E -- Returns Data/Status --> D;
      D -- Updates Cache & Provides Data/Status --> C;
      C -- Updates State --> B;

      B -- Accesses Global State --> G[Global State Provider (Context/Zustand)];
      G -- Provides Global UI State --> B;
      C -- Updates Global State --> G;

      H[Offline Sync Service] <--> D;
      I[Network Provider] -- Provides isOnline --> C;
      I -- Provides isOnline --> B;

      subgraph Feature Module (/features/<feature_name>/)
          direction LR
          B
          C
      end

      subgraph Core Modules (/core/)
          direction LR
          D
          E
          G
          H
          I
      end
  ```

  _(This Mermaid diagram illustrates the general flow. A more detailed, interactive diagram might be maintained in a tool like diagrams.net/draw.io and linked here if necessary.)_

- **Consequences**:
  - **Positive**:
    - Clear separation of concerns for different types of state.
    - Leverages TanStack Query's powerful features for server state, reducing boilerplate and improving performance/UX.
    - Provides a solid foundation for robust offline capabilities.
    - Enhances testability by isolating state logic.
    - Standardized approach improves developer onboarding and code consistency.
  - **Neutral/Risks**:
    - Requires developers to understand TanStack Query concepts.
    - Potential for over-reliance on global state if not managed carefully; local state should be preferred where possible.
    - Initial setup and refactoring effort for TanStack Query integration.
- **Next Steps**:
  - Review and approve this ADR.
  - Commit this ADR to the repository.
  - Proceed with Phase-2 (Central Data Layer & TanStack Query) and Phase-6 (Global Network / Sync Provider) based on these principles.
  - Develop ESLint rules or guidelines to encourage correct state management patterns (e.g., discouraging prop-drilling in favor of context or query hooks for appropriate state).
