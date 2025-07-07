import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestUser } from './test-utils/user';
import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { supabase } from '@/services/supabaseClient';

// Mock data structure to match WeatherWidget component
const mockWeatherData = {
  temperature: 25,
  humidity: 75,
  windSpeed: 2.5,
  forecast: [
    {
      date: new Date().toISOString(),
      conditions: 'scattered clouds',
      temperature: {
        max: 28,
        min: 22
      }
    },
    {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      conditions: 'clear sky',
      temperature: {
        max: 24,
        min: 20
      }
    },
    {
      date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      conditions: 'few clouds',
      temperature: {
        max: 26,
        min: 21
      }
    },
    {
      date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      conditions: 'light rain',
      temperature: {
        max: 28,
        min: 23
      }
    }
  ]
};

// Mock the weather hook
vi.mock('@/hooks/useOpenWeather', () => ({
  useOpenWeather: vi.fn().mockReturnValue({
    data: mockWeatherData,
    loading: false,
    error: null
  })
}));

import { getCurrentWeather, getWeatherForecast } from '@/agents/WeatherAgent';

// Mock the weather agent functions
vi.mock('@/agents/WeatherAgent', () => ({
  getCurrentWeather: vi.fn().mockResolvedValue(mockCurrentWeather),
  getWeatherForecast: vi.fn().mockResolvedValue(mockWeatherForecast)
}));

// Mock Supabase client
describe('Weather Forecasting Flow', () => {
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

  it('should display current weather and forecast', async () => {
    // Render the component with Nairobi coordinates
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/weather']}>
          <Routes>
            <Route path="/weather" element={<WeatherWidget lat={-1.2921} lon={36.8219} />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Verify current weather display
    await waitFor(() => screen.getByText('25°C'));
    
    // Current weather details
    expect(screen.getByText('scattered clouds')).toBeInTheDocument();
    expect(screen.getByText('Humidity: 75%')).toBeInTheDocument();
    expect(screen.getByText('Wind: 9 km/h')).toBeInTheDocument(); // 2.5 m/s converted to km/h

    // Verify forecast display
    await waitFor(() => screen.getByText('Sun'));
    
    // Forecast details
    expect(screen.getByText('clear sky')).toBeInTheDocument();
    expect(screen.getByText('few clouds')).toBeInTheDocument();
    expect(screen.getByText('light rain')).toBeInTheDocument();
    
    // Temperature ranges
    expect(screen.getByText('28°C')).toBeInTheDocument();
    expect(screen.getByText('24°C')).toBeInTheDocument();
    expect(screen.getByText('26°C')).toBeInTheDocument();
    expect(screen.getByText('28°C')).toBeInTheDocument();
  });

  it('should handle error states gracefully', async () => {
    // Mock error state
    vi.mocked(useOpenWeather).mockReturnValueOnce({
      data: null,
      loading: false,
      error: 'Network error'
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/weather']}>
          <Routes>
            <Route path="/weather" element={<WeatherWidget lat={-1.2921} lon={36.8219} />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Verify error state
    await waitFor(() => screen.getByText('Unable to load weather data'));
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });
  });

  it('should display loading state', async () => {
    // Mock loading state
    vi.mocked(useOpenWeather).mockReturnValueOnce({
      data: null,
      loading: true,
      error: null
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/weather']}>
          <Routes>
            <Route path="/weather" element={<WeatherWidget lat={-1.2921} lon={36.8219} />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Verify loading state
    await waitFor(() => screen.getByRole('skeleton'));
    expect(screen.getAllByRole('skeleton')).toHaveLength(3);
  });
  });

  it('should save weather data to Supabase', async () => {
    // Mock Supabase insert
    vi.mocked(supabase.from).mockImplementation(() => ({
      insert: vi.fn().mockResolvedValue({ data: [], error: null }),
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    }));

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/weather']}>
          <Routes>
            <Route path="/weather" element={<WeatherWidget lat={-1.2921} lon={36.8219} />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Wait for weather data to load
    await waitFor(() => screen.getByText('25°C'));

    // Verify Supabase insert
    expect(supabase.from).toHaveBeenCalledWith('weather_data');
    expect(supabase.from().insert).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: -1.2921,
        longitude: 36.8219,
        temperature_celsius: 25,
        recorded_at: expect.any(Date),
        data_type: 'current'
      })
    );
  });

  it('should handle location permission denial', async () => {
    // Mock Geolocation API
    const originalGeolocation = navigator.geolocation;
    navigator.geolocation = {
      getCurrentPosition: vi.fn().mockRejectedValue(new Error('Permission denied'))
    } as any;

    // Render with location-based weather
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/weather']}>
          <Routes>
            <Route path="/weather" element={<WeatherWidget lat={null} lon={null} />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Verify permission denied message
    await waitFor(() => screen.getByText('Location access denied'));
    expect(screen.getByText('Please grant location permission to view local weather')).toBeInTheDocument();

    // Cleanup
    navigator.geolocation = originalGeolocation;
  });
});
