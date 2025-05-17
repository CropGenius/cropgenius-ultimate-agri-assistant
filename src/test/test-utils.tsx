import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import userEvent, { UserEvent } from '@testing-library/user-event';

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  route?: string;
  user?: UserEvent;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 1000 * 60 * 5, // Use cacheTime for v4 (5 minutes)
    },
  },
});

const customRender = (
  ui: ReactElement,
  { route = '/', user, ...renderOptions }: CustomRenderOptions = {}
): { user: UserEvent } & RenderResult => {
  // Set up the user event with default options
  const userEventInstance = user || userEvent.setup();
  
  // Wrap UI with providers
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );

  return {
    user: userEventInstance,
    ...render(ui, { wrapper, ...renderOptions }),
  };
};

// Re-export everything from @testing-library/react
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';

// Override the render method with our custom implementation
export { customRender as render };

export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 1000 * 60 * 5, // Use cacheTime for v4 (5 minutes)
      },
    },
  });
};

export const createWrapper = () => {
  const testQueryClient = createTestQueryClient();
  
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
};
