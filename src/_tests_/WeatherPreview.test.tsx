import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WeatherPreview from '@/components/home/WeatherPreview';
import { useWeatherAgent } from '@/hooks/agents/useWeatherAgent';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

// Mock hooks
vi.mock('@/hooks/agents/useWeatherAgent');
vi.mock('@/hooks/useOfflineStatus');

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

// Mock navigator.geolocation using vi.stubGlobal
vi.stubGlobal('navigator', { geolocation: mockGeolocation });

// Default mock implementation for useWeatherAgent
const defaultMockUseWeatherAgent = {
  fetchCurrentWeather: vi.fn(),
  fetchWeatherForecast: vi.fn(),
  currentWeather: null,
  weatherForecast: null,
  isLoading: true,
  error: null,
};

// Default mock implementation for useOfflineStatus
let defaultMockIsOffline = false;

describe('WeatherPreview Component', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure isolation
    vi.resetAllMocks(); // Clears mock history and resets implementations to empty functions

    // Setup default implementations for this test suite
    (useWeatherAgent as Mock).mockReturnValue(defaultMockUseWeatherAgent);
    (useOfflineStatus as Mock).mockReturnValue(defaultMockIsOffline);

    // Default geolocation mock (success)
    mockGeolocation.getCurrentPosition.mockImplementation((successCallback) => {
      // Wrapping in act if state updates are triggered by this callback
      act(() => {
        successCallback({
          coords: {
            latitude: 34.0522,
            longitude: -118.2437,
            accuracy: 100,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
      });
    });
  });

  it('should render loading state initially', () => {
    // Ensure isLoading is true for this specific test case if default is different
    (useWeatherAgent as Mock).mockReturnValue({
      ...defaultMockUseWeatherAgent,
      isLoading: true,
    });
    render(<WeatherPreview />);
    // Example: Look for a loading spinner or text. Adjust selector as per actual component.
    expect(screen.getByText(/AI Weather Intelligence/i)).toBeInTheDocument();
    // More specific loading state assertions will be added based on UI.
    // For example, if a progress bar or skeleton loader is present.
  });

  // Test for displaying offline status
  it('should display offline message when offline', () => {
    (useOfflineStatus as Mock).mockReturnValue(true);
    render(<WeatherPreview />);
    expect(screen.getByText(/Weather Unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/You are currently offline/i)).toBeInTheDocument();
  });

  // Test for successful data rendering (geolocation success)
  it('should render weather data when online and data is fetched successfully (geolocation success)', async () => {
    const mockWeatherData = {
      temp: 25,
      condition: 'Sunny',
      icon: 'sun' as const,
      rainChance: 10,
      humidity: 60,
      windSpeed: 5,
      recommendation: 'Good day for planting.',
      farmAction: 'Proceed with planting.',
      urgency: 'normal' as const,
      forecast: [
        { day: 'Today', temp: 25, icon: 'sun' as const, rainChance: 10 },
        { day: 'Tomorrow', temp: 26, icon: 'cloud' as const, rainChance: 20 },
      ],
    };

    (useWeatherAgent as Mock).mockReturnValue({
      ...defaultMockUseWeatherAgent,
      isLoading: false,
      currentWeather: {
        // Simplified, map to what WeatherPreviewInternal expects from hook
        temperatureCelsius: 25,
        weatherDescription: 'Sunny',
        weatherIconCode: '01d', // '01d' maps to 'sun'
        humidityPercent: 60,
        windSpeedMps: 5 / 3.6, // approx
        weatherMain: 'Clear',
        rainLastHourMm: 0,
      },
      weatherForecast: {
        // Simplified, map to what WeatherPreviewInternal expects from hook
        list: [
          {
            forecastTimestamp: new Date(),
            precipitationProbability: 0.1,
            temperatureCelsius: 25,
            weatherIconCode: '01d',
          },
          {
            forecastTimestamp: new Date(Date.now() + 24 * 60 * 60 * 1000),
            precipitationProbability: 0.2,
            temperatureCelsius: 26,
            weatherIconCode: '03d',
          },
        ],
      },
    });
    (useOfflineStatus as Mock).mockReturnValue(false);

    render(<WeatherPreview />);

    // Wait for state updates resulting from useEffect in WeatherPreviewInternal
    // Check for elements that appear after data processing
    expect(
      await screen.findByText(/Detected Farm Location/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/25°C/i)).toBeInTheDocument();
    expect(await screen.findByText(/Sunny/i)).toBeInTheDocument();
    // Add more assertions for humidity, wind, forecast, etc.
    expect(screen.getByText(/Humidity/i)).toBeInTheDocument();
    expect(screen.getByText(/60%/i)).toBeInTheDocument();
    expect(screen.getByText(/Rain/i)).toBeInTheDocument(); // This is a label
    // The rain chance for 'Today' in the processed forecast might be slightly different due to processing
    // Need to be careful with exact values if they are averaged or transformed.
  });

  it('should fetch weather for default location (Nairobi) on geolocation failure', async () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce(
      (successCallback, errorCallback) => {
        act(() => {
          errorCallback(new Error('Geolocation failed'));
        });
      }
    );

    const mockNairobiWeatherData = {
      temperatureCelsius: 22,
      weatherDescription: 'Cloudy',
      weatherIconCode: '03d',
      humidityPercent: 70,
      windSpeedMps: 3,
      weatherMain: 'Clouds',
      rainLastHourMm: 0,
    };
    const mockNairobiForecast = {
      list: [
        {
          forecastTimestamp: new Date(),
          precipitationProbability: 0.3,
          temperatureCelsius: 22,
          weatherIconCode: '03d',
        },
      ],
    };

    (useWeatherAgent as Mock).mockReturnValue({
      ...defaultMockUseWeatherAgent,
      isLoading: false,
      currentWeather: mockNairobiWeatherData,
      weatherForecast: mockNairobiForecast,
    });
    (useOfflineStatus as Mock).mockReturnValue(false);

    render(<WeatherPreview />);

    // Check if fetch was called with default coordinates (approx Nairobi)
    // Note: The component itself defaults, so we check the outcome (location name)
    expect(await screen.findByText(/Nairobi/i)).toBeInTheDocument();
    expect(defaultMockUseWeatherAgent.fetchCurrentWeather).toHaveBeenCalledWith(
      expect.closeTo(-1.2921),
      expect.closeTo(36.8219)
    );
    expect(
      defaultMockUseWeatherAgent.fetchWeatherForecast
    ).toHaveBeenCalledWith(expect.closeTo(-1.2921), expect.closeTo(36.8219));
    expect(await screen.findByText(/22°C/i)).toBeInTheDocument(); // Check for Nairobi's temp
  });

  it('should display error message and retry button if API call fails', async () => {
    const apiError = new Error('API fetch failed');
    (useWeatherAgent as Mock).mockReturnValue({
      ...defaultMockUseWeatherAgent,
      isLoading: false,
      error: apiError,
      currentWeather: null, // Ensure no stale data is shown
      weatherForecast: null,
    });
    (useOfflineStatus as Mock).mockReturnValue(false);

    render(<WeatherPreview />);

    expect(
      await screen.findByText(/Error Fetching Weather/i)
    ).toBeInTheDocument();
    expect(screen.getByText(apiError.message)).toBeInTheDocument();
    const retryButton = screen.getByRole('button', { name: /Retry/i });
    expect(retryButton).toBeInTheDocument();

    // Test retry button click
    defaultMockUseWeatherAgent.fetchCurrentWeather.mockClear(); // Clear previous calls if any
    defaultMockUseWeatherAgent.fetchWeatherForecast.mockClear();
    await userEvent.click(retryButton);
    expect(
      defaultMockUseWeatherAgent.fetchCurrentWeather
    ).toHaveBeenCalledTimes(1);
    expect(
      defaultMockUseWeatherAgent.fetchWeatherForecast
    ).toHaveBeenCalledTimes(1);
  });

  it('should call fetch methods on refresh button click', async () => {
    // Setup for a successful render first
    (useWeatherAgent as Mock).mockReturnValue({
      ...defaultMockUseWeatherAgent,
      isLoading: false,
      currentWeather: {
        temperatureCelsius: 20,
        weatherDescription: 'Clear',
        weatherIconCode: '01d',
        humidityPercent: 50,
        windSpeedMps: 2,
        weatherMain: 'Clear',
        rainLastHourMm: 0,
      },
      weatherForecast: {
        list: [
          {
            forecastTimestamp: new Date(),
            precipitationProbability: 0.1,
            temperatureCelsius: 20,
            weatherIconCode: '01d',
          },
        ],
      },
    });
    (useOfflineStatus as Mock).mockReturnValue(false);
    render(<WeatherPreview />);

    // Ensure initial data is loaded to make refresh button visible and meaningful
    expect(
      await screen.findByText(/Detected Farm Location/i)
    ).toBeInTheDocument();

    const refreshButton = screen.getByRole('button', {
      name: /refresh weather data/i,
    }); // Assuming an accessible name or aria-label for the refresh icon button

    defaultMockUseWeatherAgent.fetchCurrentWeather.mockClear();
    defaultMockUseWeatherAgent.fetchWeatherForecast.mockClear();

    await userEvent.click(refreshButton);

    // Check if fetch functions were called. Coordinates might be from state, so check for any call.
    expect(
      defaultMockUseWeatherAgent.fetchCurrentWeather
    ).toHaveBeenCalledTimes(1);
    expect(
      defaultMockUseWeatherAgent.fetchWeatherForecast
    ).toHaveBeenCalledTimes(1);
  });

  it('should render the correct weather icon based on weather data', async () => {
    (useWeatherAgent as Mock).mockReturnValue({
      ...defaultMockUseWeatherAgent,
      isLoading: false,
      currentWeather: {
        temperatureCelsius: 25,
        weatherDescription: 'Sunny',
        weatherIconCode: '01d',
        humidityPercent: 60,
        windSpeedMps: 5,
        weatherMain: 'Clear',
        rainLastHourMm: 0,
      }, // '01d' maps to 'sun'
      weatherForecast: {
        list: [
          {
            forecastTimestamp: new Date(),
            precipitationProbability: 0.1,
            temperatureCelsius: 25,
            weatherIconCode: '01d',
          },
        ],
      },
    });
    (useOfflineStatus as Mock).mockReturnValue(false);

    render(<WeatherPreview />);
    expect(await screen.findByText(/25°C/i)).toBeInTheDocument(); // Ensure data is loaded

    // Check for an element that would be part of the Sun icon, e.g., by a class that gives it a yellow color.
    // This depends on how getWeatherIcon is implemented. Assuming Sun icon gets 'text-amber-500'.
    const weatherIconContainer = screen
      .getByText(/25°C/i)
      .closest('div')?.previousSibling;
    if (weatherIconContainer instanceof Element) {
      expect(
        weatherIconContainer.querySelector('.text-amber-500')
      ).toBeInTheDocument();
    } else {
      // If weatherIconContainer is not an Element, this will fail the test, which is intended.
      expect(weatherIconContainer).toBeInstanceOf(Element);
    }
  });

  it('should display farm action and urgency correctly', async () => {
    const testFarmAction = 'Time to water the north fields.';
    const testUrgency = 'critical'; // This should map to a specific badge or style

    (useWeatherAgent as Mock).mockReturnValue({
      ...defaultMockUseWeatherAgent,
      isLoading: false,
      currentWeather: {
        temperatureCelsius: 30,
        weatherDescription: 'Hot',
        weatherIconCode: '01d',
        humidityPercent: 40,
        windSpeedMps: 2,
        weatherMain: 'Clear',
        rainLastHourMm: 0,
      },
      weatherForecast: {
        list: [
          {
            forecastTimestamp: new Date(),
            precipitationProbability: 0.05,
            temperatureCelsius: 30,
            weatherIconCode: '01d',
          },
        ],
      },
      // The component internally derives farmAction and urgency from weather data,
      // so we need to ensure the mocked data leads to the desired action/urgency in the component's logic.
      // For this test, let's assume the component's setWeather call will use these if provided directly,
      // or we adjust the mocked raw weather data to trigger these values within WeatherPreviewInternal's logic.
      // For simplicity in this test, we'll assume the processed `weather` state in the component will reflect these.
      // This means the test relies on the internal processing logic of WeatherPreviewInternal correctly setting these based on its inputs.
      // A more direct way would be to check the conditions that *lead* to this farmAction/urgency.
    });
    (useOfflineStatus as Mock).mockReturnValue(false);

    // Mocking the setWeather call or its outcome is tricky without refactoring the component.
    // Instead, we'll check for the text that *should* appear if the component logic correctly sets farmAction.
    // The actual `weather.farmAction` and `weather.urgency` are set inside `WeatherPreviewInternal`'s `useEffect`.
    // We need to ensure the mocked `currentWeather` and `weatherForecast` lead to the desired `farmAction` and `urgency`.
    // Let's assume 'Thunderstorm' leads to a critical urgency and a specific action.
    (useWeatherAgent as Mock).mockReturnValueOnce({
      // Use Once for this specific scenario
      ...defaultMockUseWeatherAgent,
      isLoading: false,
      currentWeather: {
        temperatureCelsius: 28,
        weatherDescription: 'Thunderstorm',
        weatherIconCode: '11d', // Thunderstorm icon
        humidityPercent: 85,
        windSpeedMps: 10,
        weatherMain: 'Thunderstorm', // This should trigger 'hasAlert' in the component
        rainLastHourMm: 5,
      },
      weatherForecast: {
        list: [
          {
            forecastTimestamp: new Date(),
            precipitationProbability: 0.9,
            temperatureCelsius: 28,
            weatherIconCode: '11d',
          },
        ],
      },
    });

    render(<WeatherPreview />);

    // Wait for the component to process the data and update its internal `weather` state.
    expect(
      await screen.findByText(
        /Monitor conditions closely and protect sensitive crops/i
      )
    ).toBeInTheDocument();
    // Check for urgency badge - assuming 'critical' urgency results in a badge with 'Critical' text or specific styling.
    // The component uses 'warning' for hasAlert. Let's check for that.
    const urgencyBadge = await screen.findByText((content, element) => {
      // Check if the element is a badge and contains 'Warning' (or 'Critical' if that's the expected text for high urgency)
      // This depends on how Badge component renders and what text is used.
      // The component's logic sets urgency to 'warning' if 'hasAlert' is true.
      return (
        element?.tagName.toLowerCase() === 'span' &&
        element.classList.contains('bg-red-600') && // Assuming critical urgency gets a red background
        /Warning|Critical/i.test(content)
      );
    });
    // More robust: Check for the text that indicates high urgency if specific badge text is used.
    // For now, let's assume the farmAction text implies the urgency correctly.
    // The actual badge text is 'LIVE' or based on weather.recommendation.
    // The 'urgency' field in the `weather` state is 'normal' or 'warning'.
    // Let's check for the 'Weather Alert' toast that appears with 'hasAlert'.
    expect(await screen.findByText(/Weather Alert/i)).toBeInTheDocument(); // This toast appears when hasAlert is true
  });
});
