import React from 'react';
import { render, screen } from '@testing-library/react';
import { HealthOrb } from '@/components/dashboard/mobile/HealthOrb';
import { useFarmHealth } from '@/hooks/useFarmHealth';

// Mock the useFarmHealth hook
jest.mock('@/hooks/useFarmHealth');
const mockUseFarmHealth = useFarmHealth as jest.MockedFunction<typeof useFarmHealth>;

describe('HealthOrb Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state correctly', () => {
    // Mock loading state
    mockUseFarmHealth.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isSuccess: false,
      status: 'loading',
    } as any);

    render(<HealthOrb farmId="farm-123" />);
    
    // Check for loading indicator
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('renders error state correctly', () => {
    // Mock error state
    mockUseFarmHealth.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load farm health'),
      isError: true,
      refetch: jest.fn(),
      isRefetching: false,
      isSuccess: false,
      status: 'error',
    } as any);

    render(<HealthOrb farmId="farm-123" />);
    
    // Check for error message
    expect(screen.getByText(/Failed to load farm health/i)).toBeInTheDocument();
  });

  test('renders success state correctly with data', () => {
    // Mock success state with data
    mockUseFarmHealth.mockReturnValue({
      data: {
        healthScore: 85,
        trend: 'improving',
        lastUpdated: '2 hours ago',
        accuracy: 95.5,
        trustIndicators: [
          { id: 'soil', name: 'Soil Health', value: 80, status: 'success' }
        ]
      },
      isLoading: false,
      error: null,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isSuccess: true,
      status: 'success',
    } as any);

    render(<HealthOrb farmId="farm-123" />);
    
    // Check for health score
    expect(screen.getByText(/85%/i)).toBeInTheDocument();
  });

  test('uses static data when provided', () => {
    // Even with a mock that would return data, static data should be used
    mockUseFarmHealth.mockReturnValue({
      data: {
        healthScore: 50,
        trend: 'declining',
        lastUpdated: '5 hours ago',
        accuracy: 90,
      },
      isLoading: false,
      error: null,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      isSuccess: true,
      status: 'success',
    } as any);

    const staticData = {
      score: 75,
      trend: 'stable',
      lastUpdated: '1 hour ago',
      accuracy: 98
    };

    render(<HealthOrb farmId="farm-123" staticData={staticData} />);
    
    // Should use static data (75%) instead of mock data (50%)
    expect(screen.getByText(/75%/i)).toBeInTheDocument();
  });
});