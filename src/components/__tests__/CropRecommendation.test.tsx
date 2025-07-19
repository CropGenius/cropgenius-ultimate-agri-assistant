/**
 * 🌾 CROPGENIUS – CROP RECOMMENDATION COMPONENT TESTS
 * -------------------------------------------------------------
 * BILLIONAIRE-GRADE Test Suite for AI-Powered Crop Recommendations
 * - Tests AI integration and data flow
 * - Validates loading, error, and success states
 * - Ensures proper user interactions and accessibility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CropRecommendation from '../CropRecommendation';
import { useCropRecommendations } from '@/hooks/useCropRecommendations';
import type { FarmContext, EnhancedCropRecommendation } from '@/hooks/useCropRecommendations';

// Mock the hook
vi.mock('@/hooks/useCropRecommendations', () => ({
  useCropRecommendations: vi.fn(),
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h3 className={className} {...props}>
      {children}
    </h3>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, ...props }: any) => (
    <span className={className} {...props}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: any) => (
    <div className={`skeleton ${className}`} {...props} />
  ),
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, className, ...props }: any) => (
    <div className={className} role="alert" {...props}>
      {children}
    </div>
  ),
  AlertDescription: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

describe('CropRecommendation', () => {
  let queryClient: QueryClient;
  let mockUseCropRecommendations: any;

  const mockFarmContext: FarmContext = {
    location: { lat: -1.2921, lng: 36.8219, country: 'Kenya' },
    soilType: 'loamy',
    currentSeason: 'rainy',
    userId: 'test-user-id',
    farmId: 'test-farm-id',
    currentCrops: ['maize'],
    climateZone: 'tropical',
  };

  const mockRecommendations: EnhancedCropRecommendation[] = [
    {
      id: 'test-field-maize-0',
      name: 'Maize',
      confidence: 87,
      description: 'Well-suited to your soil type and climate conditions.',
      rotationBenefit: 'Good rotation option after legumes.',
      waterNeeds: 'Medium',
      sunExposure: 'Full Sun',
      temperature: '18-30°C',
      growingSeason: ['Rainy Season', 'Long Rains'],
      compatibility: ['Beans', 'Squash', 'Groundnuts'],
      diseaseRisk: {
        level: 'medium',
        commonDiseases: ['Fall Armyworm', 'Maize Streak Virus'],
      },
      marketOutlook: {
        currentPrice: 0.35,
        pricetrend: 'stable',
        demandLevel: 'high',
      },
      aiReasoning: 'Maize shows 87% suitability for your field conditions. Compatible with your loamy soil type. Well-suited for Kenya climate.',
      plantingWindow: {
        start: 'March',
        end: 'May',
        optimal: 'April',
      },
      expectedYield: {
        min: 2000,
        max: 4000,
        unit: 'kg/ha',
      },
      economicViability: {
        profitabilityScore: 75,
        investmentRequired: 200,
        expectedRevenue: 1050,
      },
    },
    {
      id: 'test-field-cassava-1',
      name: 'Cassava',
      confidence: 81,
      description: 'Highly tolerant to drought conditions in your area.',
      rotationBenefit: 'Can grow in poorer soils after other crops.',
      waterNeeds: 'Low',
      sunExposure: 'Full Sun',
      temperature: '20-35°C',
      growingSeason: ['Year Round'],
      compatibility: ['Maize', 'Yam', 'Plantain'],
      diseaseRisk: {
        level: 'low',
        commonDiseases: ['Cassava Mosaic Disease'],
      },
      marketOutlook: {
        currentPrice: 0.25,
        pricetrend: 'rising',
        demandLevel: 'medium',
      },
      aiReasoning: 'Cassava shows 81% suitability for your field conditions. Compatible with your loamy soil type.',
      plantingWindow: {
        start: 'March',
        end: 'June',
        optimal: 'April',
      },
      expectedYield: {
        min: 8000,
        max: 15000,
        unit: 'kg/ha',
      },
      economicViability: {
        profitabilityScore: 60,
        investmentRequired: 150,
        expectedRevenue: 2875,
      },
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseCropRecommendations = vi.mocked(useCropRecommendations);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      fieldId: 'test-field-id',
      farmContext: mockFarmContext,
      onSelectCrop: vi.fn(),
      ...props,
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <CropRecommendation {...defaultProps} />
      </QueryClientProvider>
    );
  };

  describe('Loading State', () => {
    it('should display loading skeleton when fetching recommendations', () => {
      mockUseCropRecommendations.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      });

      renderComponent();

      expect(screen.getByTestId('crop-recommendation-skeleton')).toBeInTheDocument();
      // Check for skeleton elements instead of generic roles
      const skeletons = document.querySelectorAll('.skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show proper loading skeleton structure', () => {
      mockUseCropRecommendations.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      });

      renderComponent();

      const skeletons = document.querySelectorAll('.skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should display error message when fetching fails', () => {
      const mockError = new Error('Failed to fetch recommendations');
      mockUseCropRecommendations.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
        refetch: vi.fn(),
        isRefetching: false,
      });

      renderComponent();

      expect(screen.getByTestId('crop-recommendation-error')).toBeInTheDocument();
      expect(screen.getByText(/Failed to generate crop recommendations/)).toBeInTheDocument();
      expect(screen.getByText(/Unable to analyze your field conditions/)).toBeInTheDocument();
    });

    it('should allow retry when error occurs', async () => {
      const mockRefetch = vi.fn();
      mockUseCropRecommendations.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: mockRefetch,
        isRefetching: false,
      });

      renderComponent();

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await userEvent.click(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('should disable retry button when refetching', () => {
      mockUseCropRecommendations.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: vi.fn(),
        isRefetching: true,
      });

      renderComponent();

      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeDisabled();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no recommendations available', () => {
      mockUseCropRecommendations.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      });

      renderComponent();

      expect(screen.getByTestId('crop-recommendation-empty')).toBeInTheDocument();
      expect(screen.getByText(/No Crop Recommendations Available/)).toBeInTheDocument();
      expect(screen.getByText(/We couldn't generate recommendations for this field/)).toBeInTheDocument();
    });

    it('should allow retry from empty state', async () => {
      const mockRefetch = vi.fn();
      mockUseCropRecommendations.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      renderComponent();

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await userEvent.click(tryAgainButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      mockUseCropRecommendations.mockReturnValue({
        data: mockRecommendations,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      });
    });

    it('should display AI-powered recommendations successfully', () => {
      renderComponent();

      expect(screen.getByTestId('crop-recommendation')).toBeInTheDocument();
      expect(screen.getByText(/AI-Powered Crop Recommendations/)).toBeInTheDocument();
      expect(screen.getByText(/2 recommendations/)).toBeInTheDocument();
    });

    it('should display all crop recommendations', () => {
      renderComponent();

      expect(screen.getByTestId('crop-card-test-field-maize-0')).toBeInTheDocument();
      expect(screen.getByTestId('crop-card-test-field-cassava-1')).toBeInTheDocument();
      // Use more specific selectors to avoid conflicts with companion plant badges
      expect(screen.getByRole('heading', { name: 'Maize' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Cassava' })).toBeInTheDocument();
    });

    it('should display confidence scores correctly', () => {
      renderComponent();

      expect(screen.getByText('87% match')).toBeInTheDocument();
      expect(screen.getByText('81% match')).toBeInTheDocument();
    });

    it('should display AI reasoning for each crop', () => {
      renderComponent();

      expect(screen.getByText(/Maize shows 87% suitability for your field conditions/)).toBeInTheDocument();
      expect(screen.getByText(/Cassava shows 81% suitability for your field conditions/)).toBeInTheDocument();
    });

    it('should display market data when enabled', () => {
      renderComponent({ showMarketData: true });

      expect(screen.getAllByText(/Market Outlook/)).toHaveLength(2);
      expect(screen.getByText(/\$0\.35\/kg/)).toBeInTheDocument();
      expect(screen.getByText(/high/)).toBeInTheDocument();
    });

    it('should display disease risk information when enabled', () => {
      renderComponent({ showDiseaseRisk: true });

      expect(screen.getByText(/Disease Risk: medium/)).toBeInTheDocument();
      expect(screen.getByText(/Disease Risk: low/)).toBeInTheDocument();
      expect(screen.getByText(/Fall Armyworm, Maize Streak Virus/)).toBeInTheDocument();
    });

    it('should display economic viability when enabled', () => {
      renderComponent({ showEconomicViability: true });

      expect(screen.getByText(/75%/)).toBeInTheDocument();
      expect(screen.getByText(/60%/)).toBeInTheDocument();
    });

    it('should display expected yield information', () => {
      renderComponent();

      expect(screen.getAllByText(/Expected Yield/)).toHaveLength(2);
      expect(screen.getByText(/2000-4000 kg\/ha/)).toBeInTheDocument();
      expect(screen.getByText(/8000-15000 kg\/ha/)).toBeInTheDocument();
    });

    it('should display companion plants', () => {
      renderComponent();

      expect(screen.getAllByText(/Companion Plants:/)).toHaveLength(2);
      expect(screen.getByText('Beans')).toBeInTheDocument();
      expect(screen.getByText('Squash')).toBeInTheDocument();
      expect(screen.getByText('Groundnuts')).toBeInTheDocument();
    });

    it('should display planting window information', () => {
      renderComponent();

      expect(screen.getAllByText(/Best planting:/)).toHaveLength(2);
      expect(screen.getAllByText('April')).toHaveLength(2);
    });

    it('should handle crop selection correctly', async () => {
      const mockOnSelectCrop = vi.fn();
      renderComponent({ onSelectCrop: mockOnSelectCrop });

      const selectButton = screen.getByTestId('select-crop-test-field-maize-0');
      await userEvent.click(selectButton);

      expect(mockOnSelectCrop).toHaveBeenCalledWith(
        'test-field-maize-0',
        87,
        'Maize shows 87% suitability for your field conditions. Compatible with your loamy soil type. Well-suited for Kenya climate.'
      );
    });

    it('should highlight selected crop', async () => {
      renderComponent();

      const selectButton = screen.getByTestId('select-crop-test-field-maize-0');
      await userEvent.click(selectButton);

      const cropCard = screen.getByTestId('crop-card-test-field-maize-0');
      expect(cropCard).toHaveClass('ring-2', 'ring-green-500');
    });

    it('should allow refreshing recommendations', async () => {
      const mockRefetch = vi.fn();
      mockUseCropRecommendations.mockReturnValue({
        data: mockRecommendations,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isRefetching: false,
      });

      renderComponent();

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await userEvent.click(refreshButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('should disable refresh button when refetching', () => {
      mockUseCropRecommendations.mockReturnValue({
        data: mockRecommendations,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: true,
      });

      renderComponent();

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Feature Toggles', () => {
    beforeEach(() => {
      mockUseCropRecommendations.mockReturnValue({
        data: mockRecommendations,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      });
    });

    it('should hide market data when showMarketData is false', () => {
      renderComponent({ showMarketData: false });

      expect(screen.queryByText(/Market Outlook/)).not.toBeInTheDocument();
    });

    it('should hide disease risk when showDiseaseRisk is false', () => {
      renderComponent({ showDiseaseRisk: false });

      expect(screen.queryByText(/Disease Risk:/)).not.toBeInTheDocument();
    });

    it('should hide economic viability when showEconomicViability is false', () => {
      renderComponent({ showEconomicViability: false });

      // Check that profitability score badges are not shown
      const badges = screen.queryAllByText(/75%|60%/);
      const profitabilityBadges = badges.filter(badge => 
        badge.closest('[class*="text-xs"]') && badge.textContent?.includes('%')
      );
      expect(profitabilityBadges).toHaveLength(0);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseCropRecommendations.mockReturnValue({
        data: mockRecommendations,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      });
    });

    it('should have proper ARIA labels and roles', () => {
      renderComponent();

      expect(screen.getByTestId('crop-recommendation')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(3); // Refresh + 2 Select buttons
    });

    it('should have accessible error alerts', () => {
      mockUseCropRecommendations.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Test error'),
        refetch: vi.fn(),
        isRefetching: false,
      });

      renderComponent();

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Integration with useCropRecommendations Hook', () => {
    it('should pass correct parameters to the hook', () => {
      renderComponent();

      expect(mockUseCropRecommendations).toHaveBeenCalledWith(
        'test-field-id',
        mockFarmContext,
        {
          enabled: true,
          staleTime: 1000 * 60 * 30,
          refetchInterval: 1000 * 60 * 60,
        }
      );
    });

    it('should disable hook when fieldId is missing', () => {
      renderComponent({ fieldId: '' });

      expect(mockUseCropRecommendations).toHaveBeenCalledWith(
        '',
        mockFarmContext,
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it('should disable hook when userId is missing', () => {
      const contextWithoutUserId = { ...mockFarmContext, userId: '' };
      renderComponent({ farmContext: contextWithoutUserId });

      expect(mockUseCropRecommendations).toHaveBeenCalledWith(
        'test-field-id',
        contextWithoutUserId,
        expect.objectContaining({
          enabled: false,
        })
      );
    });
  });
});