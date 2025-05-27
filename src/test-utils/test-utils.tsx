import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { vi } from 'vitest';

// Create a QueryClient instance for testing
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });
};

type AllTheProvidersProps = {
  children: React.ReactNode;
};

// Wrap app with all necessary providers
const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

// Custom render function with all providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything from RTL
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
// Override render method
export { customRender as render };

// Helper functions
export const mockWindowProperty = <T extends keyof Window>(
  property: T,
  value: Window[T]
) => {
  const originalProperty = window[property];
  
  beforeAll(() => {
    // @ts-ignore - We know what we're doing here
    window[property] = value;
  });
  
  afterAll(() => {
    // @ts-ignore - We know what we're doing here
    window[property] = originalProperty;
  });
};

// Mock the analytics module
export const mockAnalytics = () => {
  return {
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
    // Add other PostHog methods as needed
  };
};

// Mock the Supabase client
export const mockSupabase = () => ({
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockReturnThis(),
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
    getSession: vi.fn(),
    getCurrentUser: vi.fn(),
  },
});
