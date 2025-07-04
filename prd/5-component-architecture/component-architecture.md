# PRD Section 5: Component Architecture Map

This document outlines the hierarchical structure and responsibilities of the React components in the CropGenius application.

## 1. Root & Providers

-   **`main.tsx`**: Application entry point. Renders the root `App` component and wraps it with necessary context providers.
-   **`App.tsx`**: Root component. Initializes global providers:
    -   `SupabaseAuthProvider`: Manages user session and authentication state.
    -   `QueryClientProvider`: For data fetching and caching via TanStack Query.
    -   `ThemeProvider`: For styling and theme management.
    -   `BrowserRouter`: For client-side routing.

## 2. Routing

-   **`AppRoutes.tsx`**: Defines all application routes.
    -   **`AuthGuard.tsx`**: A higher-order component that protects routes requiring authentication. Redirects to `/login` if the user is not authenticated.
    -   **`Public Routes`**: `/login`, `/signup`.
    -   **`Protected Routes`**: `/`, `/dashboard`, `/scan`, `/market`, `/my-farm`, `/profile`, `/chat`.

## 3. Component Hierarchy

### 3.1 Container / View Components (Logic & Data)

| Component | Responsibility | Props | State & Hooks |
| :--- | :--- | :--- | :--- |
| **`Login.tsx`** | Handles user login form submission and authentication logic. | `onLoginSuccess: () => void` | `useState` for form fields, `useMutation` to call `authService.login`. |
| **`Signup.tsx`** | Handles new user registration. | `onSignupSuccess: () => void` | `useState` for form fields, `useMutation` to call `authService.signup`. |
| **`Onboarding.tsx`** | Manages the multi-step onboarding wizard. | N/A | `useState` for current step and form data, `useMutation` to call `onboardingService.complete`. |
| **`Dashboard.tsx`** | Fetches and displays aggregated data for the user's farm. | N/A | `useQuery` to fetch weather, NDVI, market, and farm plan data. |
| **`CropScan.tsx`** | Manages the crop scanning workflow, including image upload and result display. | N/A | `useState` for image file and scan result, `useMutation` to call `cropScanService.scan`. |
| **`Marketplace.tsx`** | Fetches and displays market price trends and supplier data. | N/A | `useQuery` to fetch market data based on user's region and crops. |
| **`AIChatWidget.tsx`** | Manages the state and interactions for the AI chatbot. | N/A | `useState` for chat history and user input, `useMutation` to call `aiChatService.sendMessage`. |

### 3.2 Presentational / UI Components (View Only)

| Component | Responsibility | Props |
| :--- | :--- | :--- |
| **`BottomNav.tsx`** | Renders the main application navigation bar. | `activeRoute: string` |
| **`WeatherCard.tsx`** | Displays weather forecast data. | `data: WeatherData` |
| **`NDVICard.tsx`** | Displays satellite NDVI imagery. | `imageUrl: string`, `date: string` |
| **`ScanResult.tsx`** | Displays the results of a crop scan. | `result: ScanResultData` |
| **`PriceChart.tsx`** | Renders a chart of historical price data for a crop. | `data: PriceHistory[]` |
| **`Button.tsx`** | A reusable, styled button component. | `onClick`, `children`, `variant`, `isLoading` |
| **`Input.tsx`** | A reusable, styled input field. | `value`, `onChange`, `placeholder`, `type` |
| **`Card.tsx`** | A reusable container component with glassmorphism styling. | `children`, `className` |
