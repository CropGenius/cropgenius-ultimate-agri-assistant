# PRD Section 7: Testing & Validation Blueprint

This document outlines the comprehensive testing strategy for the CropGenius application, ensuring reliability, correctness, and performance.

## 1. Testing Frameworks & Libraries

-   **Test Runner:** Vitest (primary), Jest (for specific legacy tests if needed).
-   **Component Testing:** React Testing Library.
-   **API Mocking:** Mock Service Worker (MSW).
-   **Assertion Library:** Vitest (`expect`).
-   **End-to-End (E2E) Testing:** Playwright (to be added).

## 2. Testing Pyramid

### 2.1 Unit Tests (`*.test.ts`, `*.test.tsx`)

-   **Scope:** Individual functions, hooks, and presentational components in isolation.
-   **Goal:** Verify that each unit of code works as expected.
-   **Examples:**
    -   Test a utility function that formats dates.
    -   Test a `useForm` hook's validation logic.
    -   Test that a `Button` component renders correctly with different props (e.g., `isLoading`, `variant`).

### 2.2 Integration Tests (`*.test.tsx`)

-   **Scope:** Multiple components working together, including interactions with mocked APIs and services.
-   **Goal:** Verify that features work as a whole from the user's perspective.
-   **Examples:**
    -   **Authentication:** A user can fill out the login form, click submit, and see the dashboard. All Supabase Auth calls will be mocked with MSW.
    -   **Onboarding:** A user can complete the multi-step wizard, and the final `complete_onboarding` RPC call is made with the correct data.
    -   **Crop Scan:** A user can upload an image, and the `ScanResult` component correctly displays the mocked API response.

### 2.3 End-to-End (E2E) Tests

-   **Scope:** Full user flows in a real browser against a staging or test environment.
-   **Goal:** Verify that the entire system works together seamlessly from the user's perspective.
-   **Tool:** Playwright.
-   **Examples:**
    -   **Full Onboarding Flow:** A new user signs up, completes the entire onboarding process, and successfully lands on the dashboard.
    -   **Full Scan Flow:** A user logs in, navigates to the scan page, uploads a real image, and verifies that a valid result is displayed.

## 3. Feature-Specific Validation Checklist

| Feature | Test Type | Validation Criteria |
| :--- | :--- | :--- |
| **Authentication** | Integration | - User can sign up with a valid email/password.<br>- User cannot sign up with an invalid email.<br>- User can log in with correct credentials.<br>- User sees an error with incorrect credentials.<br>- Protected routes are inaccessible to unauthenticated users. |
| **Onboarding** | Integration | - Each step's form validation works correctly.<br>- Data persists between steps.<br>- `complete_onboarding` RPC is called with the aggregated data on the final step. |
| **Dashboard** | Integration | - All data cards (Weather, NDVI, etc.) display a loading state initially.<br>- Cards correctly render mocked data upon successful API calls.<br>- Cards display a user-friendly error state if an API call fails. |
| **Crop Scan** | Integration | - User can select and upload an image file.<br>- A loading indicator is shown during the (mocked) scan process.<br>- The `ScanResult` component correctly renders the mocked disease information. |
| **AI Farm Plan** | Integration | - The `FarmPlanner` component correctly renders a mocked farm plan.<br>- Collapsible sections expand and collapse on user interaction. |

## 4. Performance & Auditing

-   **Tool:** Lighthouse.
-   **Checklist:**
    -   [ ] Run Lighthouse audit before and after major feature implementations.
    -   [ ] First Meaningful Paint (FMP) must be < 2s.
    -   [ ] Overall Lighthouse score must be > 95 for Performance, Accessibility, Best Practices, and SEO.
