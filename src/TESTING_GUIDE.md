# CropGenius Testing Guide

This guide outlines the testing strategies, patterns, and best practices adopted for the CropGenius platform. Our goal is to ensure robust, maintainable, and production-grade code through comprehensive testing.

## Table of Contents

1.  [Overall Testing Philosophy](#overall-testing-philosophy)
2.  [Setting up Test Files](#setting-up-test-files)
3.  [Mocking Dependencies](#mocking-dependencies)
    - [React Router Hooks](#react-router-hooks)
    - [Custom Hooks](#custom-hooks)
    - [Supabase Client](#supabase-client)
    - [Service Layer](#service-layer)
    - [Toast Notifications (Sonner)](#toast-notifications-sonner)
    - [Diagnostic Service](#diagnostic-service)
4.  [Structuring Tests](#structuring-tests)
    - [`describe` Blocks](#describe-blocks)
    - [`it` Test Cases](#it-test-cases)
    - [`beforeEach` / `afterEach`](#beforeeach--aftereach)
5.  [Writing Assertions](#writing-assertions)
    - [React Testing Library Queries](#react-testing-library-queries)
    - [Asynchronous Operations (`waitFor`)](#asynchronous-operations-waitfor)
    - [Asserting UI States, Mock Calls, Navigation, Toasts](#asserting-ui-states-mock-calls-navigation-toasts)
6.  [Testing Specific Scenarios](#testing-specific-scenarios)
    - [Loading States](#loading-states)
    - [Error States](#error-states)
    - [Offline Behavior](#offline-behavior)
    - [User Interactions](#user-interactions)
    - [Error Boundaries](#error-boundaries)
7.  [Mock Data](#mock-data)
    - [Type Safety](#type-safety)
    - [Structure and Realism](#structure-and-realism)

---

## 1. Overall Testing Philosophy

- **Comprehensive Coverage:** Aim to cover all critical user flows, UI states (loading, success, error, empty, offline), and business logic within components.
- **Production-Grade Quality:** Tests should be reliable, maintainable, and provide high confidence in the stability of the application.
- **Isolation:** Unit and integration tests should isolate the component or module under test by thoroughly mocking external dependencies.
- **Readability:** Tests should be easy to understand, clearly stating their intent and assertions.

---

## 2. Setting up Test Files

- **Naming Convention:** Test files should be co-located with the component they are testing or placed in a relevant `__tests__` or `_tests_` directory (e.g., `src/_tests_/MyComponent.test.tsx`).
- **Core Imports:** Standard imports include:
  ```typescript
  import { render, screen, waitFor } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';
  import { vi } from 'vitest';
  import { MemoryRouter, Routes, Route } from 'react-router-dom';
  // Component to test
  import MyComponent from '../components/MyComponent';
  ```
- **Vitest Configuration:** Ensure Vitest is configured correctly in `vite.config.ts` or `vitest.config.ts` for the React environment, including `jsdom` for the test environment.

---

## 3. Mocking Dependencies

Effective mocking is crucial for isolating components. We use `vi.mock()` from Vitest.

### React Router Hooks

Mock `useParams`, `useNavigate`, `useLocation` as needed.

```typescript
const mockNavigate = vi.fn();
const mockParams = { id: 'test-field-123' };

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});
```

### Custom Hooks

Mock custom hooks to control their return values and behavior during tests.

```typescript
const mockUseOfflineStatus = vi.fn();
const mockUseFarm = vi.fn();
// ... other custom hook mocks

vi.mock('@/hooks/useOfflineStatus', () => ({ default: mockUseOfflineStatus }));
vi.mock('@/hooks/useFarm', () => ({ default: mockUseFarm }));

// In beforeEach or specific tests:
mockUseOfflineStatus.mockReturnValue(false); // Online by default
mockUseFarm.mockReturnValue({
  farmData: mockFarmData,
  isLoading: false,
  error: null,
});
```

### Supabase Client

Mock the Supabase client's fluent API chain (`from().select().eq().single().order()`, etc.).

```typescript
const mockSupabaseFrom = vi.fn().mockReturnThis();
const mockSupabaseSelect = vi.fn().mockReturnThis();
const mockSupabaseEq = vi.fn().mockReturnThis();
const mockSupabaseSingle = vi.fn();
const mockSupabaseOrder = vi.fn();
// ... other Supabase function mocks

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: mockSupabaseFrom,
    // Mock other Supabase client direct methods if used
  },
}));

// Chain the mocks in beforeEach or specific tests:
mockSupabaseFrom.mockImplementation((tableName: string) => {
  // Return specific mocks based on tableName if needed
  return {
    select: mockSupabaseSelect.mockReturnThis(),
    eq: mockSupabaseEq.mockReturnThis(),
    single: mockSupabaseSingle.mockResolvedValue({
      data: mockFieldData,
      error: null,
    }),
    order: mockSupabaseOrder.mockResolvedValue({
      data: mockHistoryData,
      error: null,
    }),
    // ... other chained methods
  };
});
```

### Service Layer

Mock service functions that interact with APIs or perform business logic.

```typescript
const mockGetFieldById = vi.fn();
const mockDeleteField = vi.fn();

vi.mock('@/services/fieldService', () => ({
  getFieldById: mockGetFieldById,
  deleteField: mockDeleteField,
}));

// In beforeEach or specific tests:
mockGetFieldById.mockResolvedValue({ data: mockFieldData, error: null });
mockDeleteField.mockResolvedValue({ success: true, error: null });
```

### Toast Notifications (Sonner)

Mock the `toast` object from `sonner`.

```typescript
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
const mockToastInfo = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
    info: mockToastInfo,
    // Add other toast types if used (e.g., warning, loading)
  },
}));
```

### Diagnostic Service

Mock the diagnostic service for logging errors.

```typescript
const mockDiagnosticsLogError = vi.fn();

vi.mock('@/services/diagnosticService', () => ({
  default: {
    logError: mockDiagnosticsLogError,
    // Mock other diagnostic methods if used
  },
}));
```

---

## 4. Structuring Tests

### `describe` Blocks

Use `describe` blocks to group related tests. This improves organization and readability, especially for components with multiple features or states.

```typescript
describe('FieldDetail Component', () => {
  describe('Initial Data Loading', () => {
    /* ... */
  });
  describe('Offline Behavior', () => {
    /* ... */
  });
  describe('Crop Scan Functionality', () => {
    /* ... */
  });
  // ... etc.
});
```

### `it` Test Cases

Each `it` block should test a single, specific behavior or scenario. The description should clearly state what is being tested (e.g., `it('should display field name after successful data load')`).

### `beforeEach` / `afterEach`

- **`beforeEach`:** Use to reset mocks and set up default successful states for dependencies before each test run. This ensures tests are isolated and don't interfere with each other.
  ```typescript
  beforeEach(() => {
    vi.resetAllMocks(); // Or vi.clearAllMocks();
    // Setup default successful mock implementations
    mockGetFieldById.mockResolvedValue({ data: mockFieldData, error: null });
    mockUseOfflineStatus.mockReturnValue(false);
    // ... other default mocks
  });
  ```
- **`afterEach`:** Use for cleanup if necessary, though `resetAllMocks` in `beforeEach` often covers this.

---

## 5. Writing Assertions

### React Testing Library Queries

- Prefer semantic queries (e.g., `getByRole`, `getByLabelText`, `getByText`) over `getByTestId` where possible.
- Use `queryBy` variants when asserting an element is _not_ present.
- Use `findBy` variants for asynchronous elements that will appear after some time.

### Asynchronous Operations (`waitFor`)

Use `waitFor` to handle assertions for UI changes that occur asynchronously (e.g., after data fetching or state updates).

```typescript
await user.click(screen.getByRole('button', { name: /submit/i }));
await waitFor(() => {
  expect(mockSubmitFunction).toHaveBeenCalled();
  expect(screen.getByText(/success message/i)).toBeInTheDocument();
});
```

### Asserting UI States, Mock Calls, Navigation, Toasts

- **UI State:** Assert that the correct text, elements, or attributes are present/absent based on the component's state.
- **Mock Calls:** Use `toHaveBeenCalled()`, `toHaveBeenCalledWith()`, `toHaveBeenCalledTimes()` to verify interactions with mocked functions.
- **Navigation:** Assert `mockNavigate` was called with the expected path.
- **Toasts:** Assert `mockToast` functions were called with the correct messages and options.

---

## 6. Testing Specific Scenarios

### Loading States

Verify that loading indicators (spinners, text) are displayed while asynchronous operations are in progress and disappear upon completion/failure.

### Error States

- **API/Service Errors:** Simulate errors from mocked services/hooks and verify that appropriate error messages, toasts, or UI changes occur. Check that `diagnosticService.logError` is called.
- **Internal Errors:** Test how the component handles unexpected internal errors, often in conjunction with Error Boundaries.

### Offline Behavior

Use a mocked `useOfflineStatus` hook to simulate online/offline states. Verify that UI elements are disabled/enabled, alternative UI is shown, and specific actions (like API calls) are prevented when offline.

### User Interactions

Use `userEvent` from `@testing-library/user-event` to simulate realistic user interactions like clicks, typing, file uploads, and tab navigation.

### Error Boundaries

- Test that specific error boundaries catch errors from their child components and display the correct fallback UI.
- Test that the main component error boundary catches unhandled errors.
- Simulate errors by making mocked hooks or child components throw errors during render or interaction.
- Remember to spy on `console.error` and mock its implementation to suppress expected error boundary logs during these tests, then restore it.

---

## 7. Mock Data

### Type Safety

Ensure mock data strictly adheres to the TypeScript type definitions used by the component. This prevents type-related errors in tests and ensures mocks are realistic.

### Structure and Realism

Mock data should be as realistic as possible, containing all necessary fields that the component might interact with. This helps uncover issues related to missing data or unexpected data structures.

```typescript
// Example: src/types/field.ts
// export interface Field { id: string; name: string; /* ... */ }

// In test file:
import { Field } from '@/types/field';

const mockFieldData: Field = {
  id: 'test-field-123',
  name: 'My Test Field',
  // ... other required properties
};
```

---

This guide is a living document and should be updated as our testing strategies evolve or new patterns emerge.
