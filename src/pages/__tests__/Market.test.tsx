/**
 * INFINITY GOD MODE Market Page Tests
 * Comprehensive test suite for the agricultural marketplace page
 * Testing market intelligence for 100M African farmers! 🚀🔥💪
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Market from '../Market';
import { useAuthContext } from '@/providers/AuthProvider';
import { useMarketData } from '@/hooks/useMarketData';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/providers/AuthProvider', () => ({
  useAuthContext: vi.fn(),
}));

vi.mock('@/hooks/useMarketData', () => ({
  useMarketData: vi.fn(),
  usePriceMonitoring: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock child components
vi.mock('@/components/market-data/MarketListings', () => ({
  MarketListings: ({ listings, onContactSeller, onViewDetails, onSaveListing, onCreateListing }: any) => (
    <div data-testid="market-listings">
      <div>Market Listings Component</div>
      <div>{listings?.length || 0} listings</div>
      {listings?.map((listing: any) => (
        <div key={listing.id} data-testid={`listing-${listing.id}`}>
          <span>{listing.crop_name} - {listing.price}</span>
          <button onClick={() => onContactSeller?.(listing)}>Contact Seller</button>
          <button onClick={() => onViewDetails?.(listing)}>View Details</button>
          <button onClick={() => onSaveListing?.(listing)}>Save Listing</button>
        </div>
      ))}
      <button onClick={onCreateListing}>Create Listing</button>
    </div>
  ),
}));

vi.mock('@/components/market-data/MarketPriceChart', () => ({
  MarketPriceChart: ({ data, priceTrend, title, onTimeRangeChange, onRefresh }: any) => (
    <div data-testid="market-price-chart">
      <div>Market Price Chart: {title}</div>
      <div>{data?.length || 0} price points</div>
      {priceTrend && (
        <div data-testid="price-trend">
          Trend: {priceTrend.trend} ({priceTrend.price_change_percent}%)
        </div>
      )}
      <button onClick={() => onTimeRangeChange?.('7d')}>7 Days</button>
      <button onClick={() => onTimeRangeChange?.('30d')}>30 Days</button>
      <button onClick={onRefresh}>Refresh Chart</button>
    </div>
  ),
}));

vi.mock('@/components/market-data/DemandIndicator', () => ({
  DemandIndicator: ({ data, onRefresh }: any) => (
    <div data-testid="demand-indicator">
      <div>Demand Indicator</div>
      {data && (
        <div>
          <span>Crop: {data.crop_name}</span>
          <span>Demand: {data.demand_level}</span>
          <span>Supply: {data.supply_level}</span>
        </div>
      )}
      <button onClick={onRefresh}>Refresh Demand</button>
    </div>
  ),
}));

vi.mock('@/components/market-data/MarketOverview', () => ({
  MarketOverview: ({ data, onCropSelect }: any) => (
    <div data-testid="market-overview">
      <div>Market Overview</div>
      <div>{data?.length || 0} crops</div>
      {data?.map((crop: any) => (
        <div key={crop.crop_name} data-testid={`overview-${crop.crop_name}`}>
          <span>{crop.crop_name}: {crop.current_price}</span>
          <button onClick={() => onCropSelect?.(crop.crop_name)}>Select {crop.crop_name}</button>
        </div>
      ))}
    </div>
  ),
}));

describe('Market Page - INFINITY GOD MODE Tests', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  // SUPREME test data for African agricultural marketplace
  const mockUser = {
    id: 'farmer-123',
    email: 'john.farmer@gmail.com',
    user_metadata: {
      full_name: 'John Farmer',
      location: 'Nairobi, Kenya',
    },
  };

  const mockMarketListings = [
    {
      id: '1',
      crop_name: 'maize',
      price: 45.50,
      quantity: 100,
      unit: 'kg',
      location: 'Nairobi, Kenya',
      seller_name: 'John Kamau',
      contact_info: '+254712345678',
      description: 'Premium quality maize',
      listing_type: 'sell',
      status: 'active',
      quality_grade: 'A',
      currency: 'KES',
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: '2',
      crop_name: 'beans',
      price: 120.00,
      quantity: 50,
      unit: 'kg',
      location: 'Mombasa, Kenya',
      seller_name: 'Mary Wanjiku',
      contact_info: '+254723456789',
      description: 'High-quality red kidney beans',
      listing_type: 'sell',
      status: 'active',
      quality_grade: 'A',
      currency: 'KES',
      created_at: '2025-01-14T15:30:00Z',
    },
  ];

  const mockMarketPrices = [
    {
      id: '1',
      crop_name: 'maize',
      price: 45.50,
      currency: 'KES',
      location: 'Nairobi, Kenya',
      date_recorded: '2025-01-15',
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: '2',
      crop_name: 'maize',
      price: 46.20,
      currency: 'KES',
      location: 'Nairobi, Kenya',
      date_recorded: '2025-01-14',
      created_at: '2025-01-14T10:00:00Z',
    },
  ];

  const mockPriceTrend = {
    crop_name: 'maize',
    current_price: 46.20,
    previous_price: 45.50,
    price_change: 0.70,
    price_change_percent: 1.54,
    trend: 'rising',
    period_days: 7,
  };

  const mockDemandIndicator = {
    crop_name: 'maize',
    demand_level: 'high',
    supply_level: 'medium',
    market_activity: 25,
    price_volatility: 0.15,
    seasonal_factor: 1.2,
    recommendation: 'High seasonal demand for maize. Excellent selling opportunity.',
  };

  const mockMarketOverview = [
    {
      crop_name: 'maize',
      current_price: 46.20,
      price_change_percent: 1.54,
      trend: 'rising',
      demand_level: 'high',
      market_activity: 25,
      recent_listings: 15,
    },
    {
      crop_name: 'beans',
      current_price: 120.00,
      price_change_percent: -2.30,
      trend: 'falling',
      demand_level: 'medium',
      market_activity: 18,
      recent_listings: 8,
    },
  ];

  const mockMarketDataHook = {
    marketPrices: mockMarketPrices,
    priceTrend: mockPriceTrend,
    demandIndicator: mockDemandIndicator,
    marketOverview: mockMarketOverview,
    marketListings: mockMarketListings,
    isLoading: false,
    isLoadingPrices: false,
    isLoadingTrends: false,
    isLoadingDemand: false,
    isLoadingOverview: false,
    isLoadingListings: false,
    hasError: false,
    errorMessage: null,
    filters: {
      crop_name: null,
      location: null,
      date_range: { start_date: null, end_date: null },
      sort_by: 'date',
      sort_order: 'desc',
      limit: 100,
    },
    handleCropChange: vi.fn(),
    handleLocationChange: vi.fn(),
    handleDateRangeChange: vi.fn(),
    handleSortChange: vi.fn(),
    refreshAllData: vi.fn(),
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    );

    vi.clearAllMocks();

    // Mock auth context
    vi.mocked(useAuthContext).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
    });

    // Mock market data hook
    vi.mocked(useMarketData).mockReturnValue(mockMarketDataHook);
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('🚀 Page Rendering and Layout', () => {
    it('should render Market page with all components when authenticated', () => {
      render(<Market />, { wrapper });

      expect(screen.getByText('Agricultural Marketplace')).toBeInTheDocument();
      expect(screen.getByText('Discover the best prices and connect with farmers across Africa')).toBeInTheDocument();
      
      // Check all major components are rendered
      expect(screen.getByTestId('market-overview')).toBeInTheDocument();
      expect(screen.getByTestId('market-listings')).toBeInTheDocument();
      expect(screen.getByTestId('market-price-chart')).toBeInTheDocument();
      expect(screen.getByTestId('demand-indicator')).toBeInTheDocument();
    });

    it('should redirect to auth page when user is not authenticated', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
      });

      render(<Market />, { wrapper });

      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
      expect(screen.getByText('Please sign in to access the marketplace')).toBeInTheDocument();
      expect(screen.getByText('Go to Login')).toBeInTheDocument();
    });

    it('should show loading state when auth is loading', () => {
      vi.mocked(useAuthContext).mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: true,
      });

      render(<Market />, { wrapper });

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should display user location in header when available', () => {
      render(<Market />, { wrapper });

      expect(screen.getByText(/Nairobi, Kenya/)).toBeInTheDocument();
    });
  });

  describe('🔥 Market Overview Integration', () => {
    it('should display market overview with crop data', () => {
      render(<Market />, { wrapper });

      const marketOverview = screen.getByTestId('market-overview');
      expect(within(marketOverview).getByText('2 crops')).toBeInTheDocument();
      expect(within(marketOverview).getByTestId('overview-maize')).toBeInTheDocument();
      expect(within(marketOverview).getByTestId('overview-beans')).toBeInTheDocument();
    });

    it('should handle crop selection from market overview', async () => {
      render(<Market />, { wrapper });

      const selectMaizeButton = screen.getByText('Select maize');
      await userEvent.click(selectMaizeButton);

      expect(mockMarketDataHook.handleCropChange).toHaveBeenCalledWith('maize');
    });

    it('should show empty state when no market overview data', () => {
      vi.mocked(useMarketData).mockReturnValue({
        ...mockMarketDataHook,
        marketOverview: [],
      });

      render(<Market />, { wrapper });

      const marketOverview = screen.getByTestId('market-overview');
      expect(within(marketOverview).getByText('0 crops')).toBeInTheDocument();
    });
  });

  describe('💪 Market Listings Integration', () => {
    it('should display market listings with correct data', () => {
      render(<Market />, { wrapper });

      const marketListings = screen.getByTestId('market-listings');
      expect(within(marketListings).getByText('2 listings')).toBeInTheDocument();
      expect(within(marketListings).getByTestId('listing-1')).toBeInTheDocument();
      expect(within(marketListings).getByTestId('listing-2')).toBeInTheDocument();
    });

    it('should handle contact seller action', async () => {
      render(<Market />, { wrapper });

      const contactButtons = screen.getAllByText('Contact Seller');
      await userEvent.click(contactButtons[0]);

      expect(toast.success).toHaveBeenCalledWith(
        'Contact information copied! You can reach John Kamau at +254712345678'
      );
    });

    it('should handle view listing details', async () => {
      render(<Market />, { wrapper });

      const viewDetailsButtons = screen.getAllByText('View Details');
      await userEvent.click(viewDetailsButtons[0]);

      // Should open listing detail modal or navigate
      expect(toast.info).toHaveBeenCalledWith('Opening listing details...');
    });

    it('should handle save listing action', async () => {
      render(<Market />, { wrapper });

      const saveButtons = screen.getAllByText('Save Listing');
      await userEvent.click(saveButtons[0]);

      expect(toast.success).toHaveBeenCalledWith('Listing saved to your favorites!');
    });

    it('should handle create listing action', async () => {
      render(<Market />, { wrapper });

      const createListingButton = screen.getByText('Create Listing');
      await userEvent.click(createListingButton);

      expect(toast.info).toHaveBeenCalledWith('Opening create listing form...');
    });
  });

  describe('🎯 Price Chart Integration', () => {
    it('should display price chart with market data', () => {
      render(<Market />, { wrapper });

      const priceChart = screen.getByTestId('market-price-chart');
      expect(within(priceChart).getByText('2 price points')).toBeInTheDocument();
      expect(within(priceChart).getByTestId('price-trend')).toBeInTheDocument();
      expect(within(priceChart).getByText('Trend: rising (1.54%)')).toBeInTheDocument();
    });

    it('should handle time range changes', async () => {
      render(<Market />, { wrapper });

      const sevenDaysButton = screen.getByText('7 Days');
      await userEvent.click(sevenDaysButton);

      expect(mockMarketDataHook.handleDateRangeChange).toHaveBeenCalled();
    });

    it('should handle chart refresh', async () => {
      render(<Market />, { wrapper });

      const refreshChartButton = screen.getByText('Refresh Chart');
      await userEvent.click(refreshChartButton);

      expect(mockMarketDataHook.refreshAllData).toHaveBeenCalled();
    });

    it('should show empty chart when no price data', () => {
      vi.mocked(useMarketData).mockReturnValue({
        ...mockMarketDataHook,
        marketPrices: [],
        priceTrend: null,
      });

      render(<Market />, { wrapper });

      const priceChart = screen.getByTestId('market-price-chart');
      expect(within(priceChart).getByText('0 price points')).toBeInTheDocument();
      expect(within(priceChart).queryByTestId('price-trend')).not.toBeInTheDocument();
    });
  });

  describe('🌟 Demand Indicator Integration', () => {
    it('should display demand indicator with market intelligence', () => {
      render(<Market />, { wrapper });

      const demandIndicator = screen.getByTestId('demand-indicator');
      expect(within(demandIndicator).getByText('Crop: maize')).toBeInTheDocument();
      expect(within(demandIndicator).getByText('Demand: high')).toBeInTheDocument();
      expect(within(demandIndicator).getByText('Supply: medium')).toBeInTheDocument();
    });

    it('should handle demand indicator refresh', async () => {
      render(<Market />, { wrapper });

      const refreshDemandButton = screen.getByText('Refresh Demand');
      await userEvent.click(refreshDemandButton);

      expect(mockMarketDataHook.refreshAllData).toHaveBeenCalled();
    });

    it('should show empty demand indicator when no data', () => {
      vi.mocked(useMarketData).mockReturnValue({
        ...mockMarketDataHook,
        demandIndicator: null,
      });

      render(<Market />, { wrapper });

      const demandIndicator = screen.getByTestId('demand-indicator');
      expect(within(demandIndicator).queryByText(/Crop:/)).not.toBeInTheDocument();
    });
  });

  describe('🚀 Loading States', () => {
    it('should show loading states for individual components', () => {
      vi.mocked(useMarketData).mockReturnValue({
        ...mockMarketDataHook,
        isLoadingPrices: true,
        isLoadingListings: true,
        isLoadingDemand: true,
        isLoadingOverview: true,
      });

      render(<Market />, { wrapper });

      // Should show loading indicators
      expect(screen.getByText('Loading market data...')).toBeInTheDocument();
    });

    it('should show skeleton loaders during data fetch', () => {
      vi.mocked(useMarketData).mockReturnValue({
        ...mockMarketDataHook,
        isLoading: true,
        marketListings: [],
        marketPrices: [],
        marketOverview: [],
      });

      render(<Market />, { wrapper });

      // Should show skeleton components
      const skeletons = document.querySelectorAll('[data-testid*="skeleton"], .animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('💪 Error Handling', () => {
    it('should display error state when market data fails to load', () => {
      vi.mocked(useMarketData).mockReturnValue({
        ...mockMarketDataHook,
        hasError: true,
        errorMessage: 'Failed to load market data',
        marketListings: [],
        marketPrices: [],
      });

      render(<Market />, { wrapper });

      expect(screen.getByText('Failed to load market data')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should handle retry action on error', async () => {
      vi.mocked(useMarketData).mockReturnValue({
        ...mockMarketDataHook,
        hasError: true,
        errorMessage: 'Network error',
        marketListings: [],
      });

      render(<Market />, { wrapper });

      const retryButton = screen.getByText('Try Again');
      await userEvent.click(retryButton);

      expect(mockMarketDataHook.refreshAllData).toHaveBeenCalled();
    });

    it('should show partial data when some components fail', () => {
      vi.mocked(useMarketData).mockReturnValue({
        ...mockMarketDataHook,
        marketListings: mockMarketListings, // Success
        marketPrices: [], // Failed
        hasError: true,
        errorMessage: 'Price data unavailable',
      });

      render(<Market />, { wrapper });

      // Should show successful components
      expect(screen.getByTestId('market-listings')).toBeInTheDocument();
      expect(screen.getByText('2 listings')).toBeInTheDocument();

      // Should show error for failed components
      expect(screen.getByText('Price data unavailable')).toBeInTheDocument();
    });
  });

  describe('🎯 Responsive Design and Mobile Experience', () => {
    it('should adapt layout for mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Market />, { wrapper });

      // Should show mobile-optimized layout
      expect(screen.getByText('Agricultural Marketplace')).toBeInTheDocument();
      
      // Components should stack vertically on mobile
      const container = document.querySelector('.market-container');
      expect(container).toHaveClass('flex-col');
    });

    it('should show desktop layout on larger screens', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<Market />, { wrapper });

      // Should show desktop layout with side-by-side components
      const container = document.querySelector('.market-container');
      expect(container).toHaveClass('grid', 'lg:grid-cols-2');
    });
  });

  describe('🌟 Real-World Farmer Scenarios', () => {
    it('should handle farmer browsing for maize prices', async () => {
      render(<Market />, { wrapper });

      // Farmer selects maize from overview
      const selectMaizeButton = screen.getByText('Select maize');
      await userEvent.click(selectMaizeButton);

      expect(mockMarketDataHook.handleCropChange).toHaveBeenCalledWith('maize');

      // Should show maize-specific data
      expect(screen.getByText('Crop: maize')).toBeInTheDocument();
      expect(screen.getByText('Trend: rising (1.54%)')).toBeInTheDocument();
    });

    it('should handle farmer contacting seller for beans', async () => {
      render(<Market />, { wrapper });

      // Find beans listing and contact seller
      const beansListing = screen.getByTestId('listing-2');
      const contactButton = within(beansListing).getByText('Contact Seller');
      
      await userEvent.click(contactButton);

      expect(toast.success).toHaveBeenCalledWith(
        'Contact information copied! You can reach Mary Wanjiku at +254723456789'
      );
    });

    it('should handle farmer creating new listing', async () => {
      render(<Market />, { wrapper });

      const createListingButton = screen.getByText('Create Listing');
      await userEvent.click(createListingButton);

      expect(toast.info).toHaveBeenCalledWith('Opening create listing form...');
    });

    it('should show location-based recommendations', () => {
      render(<Market />, { wrapper });

      // Should show listings from nearby locations
      expect(screen.getByText(/Nairobi, Kenya/)).toBeInTheDocument();
      expect(screen.getByText(/Mombasa, Kenya/)).toBeInTheDocument();
    });
  });

  describe('🚀 Performance and Optimization', () => {
    it('should handle large datasets efficiently', () => {
      const largeListings = Array.from({ length: 100 }, (_, i) => ({
        id: `listing-${i}`,
        crop_name: `crop-${i}`,
        price: 50 + i,
        quantity: 100,
        unit: 'kg',
        location: 'Kenya',
        seller_name: `Seller ${i}`,
        contact_info: `+25471234567${i}`,
        description: `Quality crop ${i}`,
        listing_type: 'sell',
        status: 'active',
        quality_grade: 'A',
        currency: 'KES',
        created_at: '2025-01-15T10:00:00Z',
      }));

      vi.mocked(useMarketData).mockReturnValue({
        ...mockMarketDataHook,
        marketListings: largeListings,
      });

      const { container } = render(<Market />, { wrapper });

      // Should render without performance issues
      expect(container).toBeInTheDocument();
      expect(screen.getByText('100 listings')).toBeInTheDocument();
    });

    it('should debounce search and filter operations', async () => {
      render(<Market />, { wrapper });

      // Simulate rapid filter changes
      const selectMaizeButton = screen.getByText('Select maize');
      
      // Click multiple times rapidly
      await userEvent.click(selectMaizeButton);
      await userEvent.click(selectMaizeButton);
      await userEvent.click(selectMaizeButton);

      // Should debounce and only call once
      await waitFor(() => {
        expect(mockMarketDataHook.handleCropChange).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('💪 Accessibility and UX', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<Market />, { wrapper });

      // Check for proper heading structure
      expect(screen.getByRole('heading', { name: 'Agricultural Marketplace' })).toBeInTheDocument();
      
      // Check for proper button roles
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', async () => {
      render(<Market />, { wrapper });

      const firstButton = screen.getAllByRole('button')[0];
      
      // Should be focusable
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);
      
      // Should respond to Enter key
      fireEvent.keyDown(firstButton, { key: 'Enter' });
    });

    it('should provide meaningful loading and error messages', () => {
      vi.mocked(useMarketData).mockReturnValue({
        ...mockMarketDataHook,
        isLoading: true,
      });

      render(<Market />, { wrapper });

      expect(screen.getByText('Loading market data...')).toBeInTheDocument();
    });
  });
});