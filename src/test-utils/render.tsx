import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { vi } from 'vitest';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  });

type AllTheProvidersProps = {
  children: React.ReactNode;
};

// Wrap app with all necessary providers
const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

// Custom render function with all providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Reset all mocks before each test
  vi.clearAllMocks();
  
  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything from RTL
export * from '@testing-library/react';
// Override render method
export { customRender as render };

// Helper function to create a test wrapper with custom providers
export const createWrapper = () => {
  const queryClient = createTestQueryClient();
  
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>{children}</BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    );
  };
};

// Helper to wait for all queries to complete
export const waitForQueries = async (timeout = 0) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};
