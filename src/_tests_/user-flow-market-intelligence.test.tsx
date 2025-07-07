import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestUser } from './test-utils/user';
import { MarketInsightsDashboard } from '@/components/MarketInsightsDashboard';
import { supabase } from '@/services/supabaseClient';
import { useAIAgentHub } from '@/hooks/useAIAgentHub';

// Mock market listings data
const mockMarketListings: MarketListing[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    crop_type: 'Maize',
    price_per_unit: 3500.00,
    unit: 'kg',
    quantity_available: 1000,
    location_name: 'Nairobi Market',
    source: 'user_input',
    quality_rating: 4,
    harvest_date: '2025-07-01T00:00:00+03:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    location_geojson: { type: "Point", coordinates: [36.8219, -1.2921] }
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    crop_type: 'Maize',
    price_per_unit: 3400.00,
    unit: 'kg',
    quantity_available: 500,
    location_name: 'Naivasha Market',
    source: 'api_integration',
    quality_rating: 3,
    harvest_date: '2025-06-25T00:00:00+03:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    location_geojson: { type: "Point", coordinates: [36.6000, -0.9000] }
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    crop_type: 'Maize',
    price_per_unit: 3600.00,
    unit: 'kg',
    quantity_available: 2000,
    location_name: 'Eldoret Market',
    source: 'web_scraped',
    quality_rating: 5,
    harvest_date: '2025-07-05T00:00:00+03:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    location_geojson: { type: "Point", coordinates: [35.2833, 0.5167] }
  }
];

// Mock the AIAgentHub hook
vi.mock('@/hooks/useAIAgentHub', () => ({
  useAIAgentHub: vi.fn().mockReturnValue({
    getMarketInsights: vi.fn(),
    marketData: mockMarketListings,
    isLoadingMarketData: false,
    marketDataError: null
  })
}));

// Mock Supabase client
describe('Market Intelligence Flow', () => {
  let queryClient;
  let testUser;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup test data
    testUser = createTestUser();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    // Cleanup
  });

  it('should display market insights dashboard and fetch data', async () => {
    // Render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/market']}>
          <Routes>
            <Route path="/market" element={<MarketInsightsDashboard />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Verify initial state
    expect(screen.getByText('Smart Market Insights')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Maize')).toBeInTheDocument();

    // Enter crop type and submit
    const cropInput = screen.getByPlaceholderText('e.g., Maize');
    fireEvent.change(cropInput, { target: { value: 'Maize' } });
    const submitButton = screen.getByRole('button', { name: /fetch insights/i });
    fireEvent.click(submitButton);

    // Verify loading state
    await waitFor(() => screen.getByText('Fetching market insights...'));

    // Verify market listings display
    await waitFor(() => screen.getByText('Nairobi Market'));
    
    // Verify listing details
    mockMarketListings.forEach(listing => {
      expect(screen.getByText(listing.location_name!)).toBeInTheDocument();
      expect(screen.getByText(`${listing.price_per_unit} KES/${listing.unit}`)).toBeInTheDocument();
      expect(screen.getByText(`Quality: ${listing.quality_rating} stars`)).toBeInTheDocument();
      expect(screen.getByText(new Date(listing.harvest_date!).toLocaleDateString())).toBeInTheDocument();
    });

    // Verify price range display
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByText('3,400 - 3,600 KES/kg')).toBeInTheDocument();

    // Verify location map
    expect(screen.getByText('Market Locations')).toBeInTheDocument();
    expect(screen.getByAltText('Market locations map')).toBeInTheDocument();

    // Verify sorting functionality
    const sortButtons = screen.getAllByRole('button', { name: /sort by/i });
    expect(sortButtons).toHaveLength(3); // price, quality, date

    // Test price sorting
    fireEvent.click(screen.getByRole('button', { name: /sort by price/i }));
    await waitFor(() => screen.getByText('Sorted by Price: Low to High'));

    // Test quality sorting
    fireEvent.click(screen.getByRole('button', { name: /sort by quality/i }));
    await waitFor(() => screen.getByText('Sorted by Quality: High to Low'));

    // Verify filtering
    const filterButtons = screen.getAllByRole('button', { name: /filter by/i });
    expect(filterButtons).toHaveLength(2); // location, date range

    // Test location filter
    fireEvent.click(screen.getByRole('button', { name: /filter by location/i }));
    await waitFor(() => screen.getByText('Select location'));

    // Test date range filter
    fireEvent.click(screen.getByRole('button', { name: /filter by date range/i }));
    await waitFor(() => screen.getByText('Select date range'));
  });

  it('should handle error states gracefully', async () => {
    // Mock error state
    vi.mocked(useAIAgentHub).mockReturnValueOnce({
      getMarketInsights: vi.fn(),
      marketData: null,
      isLoadingMarketData: false,
      marketDataError: 'Network error while fetching market data'
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/market']}>
          <Routes>
            <Route path="/market" element={<MarketInsightsDashboard />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Enter crop type and submit
    const cropInput = screen.getByPlaceholderText('e.g., Maize');
    fireEvent.change(cropInput, { target: { value: 'Maize' } });
    const submitButton = screen.getByRole('button', { name: /fetch insights/i });
    fireEvent.click(submitButton);

    // Verify error state
    await waitFor(() => screen.getByText('Error fetching market data'));
    expect(screen.getByText('Network error while fetching market data')).toBeInTheDocument();

    // Verify retry functionality
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should handle empty results gracefully', async () => {
    // Mock empty results
    vi.mocked(useAIAgentHub).mockReturnValueOnce({
      getMarketInsights: vi.fn(),
      marketData: [],
      isLoadingMarketData: false,
      marketDataError: null
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/market']}>
          <Routes>
            <Route path="/market" element={<MarketInsightsDashboard />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Enter crop type and submit
    const cropInput = screen.getByPlaceholderText('e.g., Maize');
    fireEvent.change(cropInput, { target: { value: 'Maize' } });
    const submitButton = screen.getByRole('button', { name: /fetch insights/i });
    fireEvent.click(submitButton);

    // Verify empty state
    await waitFor(() => screen.getByText('No market listings found'));
    expect(screen.getByText('Try searching for a different crop or location')).toBeInTheDocument();
  });

  it('should save market insights to Supabase', async () => {
    // Mock Supabase insert
    vi.mocked(supabase.from).mockImplementation(() => ({
      insert: vi.fn().mockResolvedValue({ data: [], error: null }),
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    }));

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/market']}>
          <Routes>
            <Route path="/market" element={<MarketInsightsDashboard />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Enter crop type and submit
    const cropInput = screen.getByPlaceholderText('e.g., Maize');
    fireEvent.change(cropInput, { target: { value: 'Maize' } });
    const submitButton = screen.getByRole('button', { name: /fetch insights/i });
    fireEvent.click(submitButton);

    // Wait for data to load
    await waitFor(() => screen.getByText('Nairobi Market'));

    // Verify Supabase insert
    expect(supabase.from).toHaveBeenCalledWith('market_listings');
    expect(supabase.from().insert).toHaveBeenCalledWith(
      expect.arrayContaining(mockMarketListings.map(listing => ({
        ...listing,
        created_by: testUser.id
      })))
    );
  });
});
