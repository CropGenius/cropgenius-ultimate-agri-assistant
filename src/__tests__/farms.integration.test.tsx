import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FarmsList } from '@/components/farms/FarmsList';

// Mock Supabase
vi.mock('@/services/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: [
              {
                id: '1',
                name: 'Test Farm',
                size: 10,
                size_unit: 'hectares',
                location: 'Test Location',
                user_id: 'user-1',
                created_at: '2024-01-01',
                updated_at: '2024-01-01'
              }
            ],
            error: null
          }))
        }))
      }))
    }))
  }
}));

// Mock Auth Context
vi.mock('@/providers/AuthProvider', () => ({
  useAuthContext: () => ({
    user: { id: 'user-1', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false
  })
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Farms Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('FarmsList Component', () => {
    it('should load and display farms', async () => {
      render(
        <TestWrapper>
          <FarmsList />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Farm')).toBeInTheDocument();
      });
    });

    it('should handle farm selection', async () => {
      const onFarmSelect = vi.fn();
      
      render(
        <TestWrapper>
          <FarmsList onFarmSelect={onFarmSelect} />
        </TestWrapper>
      );

      await waitFor(() => {
        const farmCard = screen.getByText('Test Farm');
        fireEvent.click(farmCard);
        expect(onFarmSelect).toHaveBeenCalled();
      });
    });
  });
});