import { http, HttpResponse } from 'msw';
import { mockMarketData } from './data/marketData';
import { mockUserData } from './data/userData';
import { mockCropDiseaseData } from './data/cropDiseaseData';
import { mockWeatherData } from './data/weatherData';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://test.supabase.co';

export const handlers = [
  // Authentication endpoints
  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: mockUserData.authenticatedUser,
    });
  }),

  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json({
      user: mockUserData.authenticatedUser,
    });
  }),

  // User profile endpoints
  http.get(`${SUPABASE_URL}/rest/v1/profiles`, () => {
    return HttpResponse.json([mockUserData.userProfile]);
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/profiles`, () => {
    return HttpResponse.json(mockUserData.userProfile);
  }),

  // Market data endpoints
  http.get(`${SUPABASE_URL}/rest/v1/market_listings`, ({ request }) => {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    const crop = url.searchParams.get('crop_name');
    
    let listings = mockMarketData.listings;
    
    if (crop) {
      listings = listings.filter(listing => 
        listing.crop_name.toLowerCase().includes(crop.toLowerCase())
      );
    }
    
    if (limit) {
      listings = listings.slice(0, parseInt(limit));
    }
    
    return HttpResponse.json(listings);
  }),

  http.get(`${SUPABASE_URL}/rest/v1/market_prices`, ({ request }) => {
    const url = new URL(request.url);
    const crop = url.searchParams.get('crop_name');
    
    let prices = mockMarketData.prices;
    
    if (crop) {
      prices = prices.filter(price => 
        price.crop_name.toLowerCase().includes(crop.toLowerCase())
      );
    }
    
    return HttpResponse.json(prices);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/market_listings`, () => {
    return HttpResponse.json({
      ...mockMarketData.listings[0],
      id: 'new-listing-id',
      created_at: new Date().toISOString(),
    });
  }),

  // Crop disease detection endpoints
  http.post(`${SUPABASE_URL}/rest/v1/rpc/detect_crop_disease`, () => {
    return HttpResponse.json(mockCropDiseaseData.detectionResult);
  }),

  http.get(`${SUPABASE_URL}/rest/v1/disease_detections`, () => {
    return HttpResponse.json(mockCropDiseaseData.detectionHistory);
  }),

  // Weather data endpoints
  http.get(`${SUPABASE_URL}/rest/v1/weather_data`, () => {
    return HttpResponse.json(mockWeatherData.currentWeather);
  }),

  http.get(`${SUPABASE_URL}/rest/v1/weather_forecasts`, () => {
    return HttpResponse.json(mockWeatherData.forecast);
  }),

  // Farm management endpoints
  http.get(`${SUPABASE_URL}/rest/v1/farms`, () => {
    return HttpResponse.json(mockUserData.farms);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/farms`, () => {
    return HttpResponse.json({
      id: 'new-farm-id',
      name: 'New Test Farm',
      location: 'Test Location',
      size_hectares: 5,
      created_at: new Date().toISOString(),
      user_id: mockUserData.authenticatedUser.id,
    });
  }),

  http.get(`${SUPABASE_URL}/rest/v1/fields`, () => {
    return HttpResponse.json(mockUserData.fields);
  }),

  // Storage endpoints
  http.post(`${SUPABASE_URL}/storage/v1/object/crop-images/*`, () => {
    return HttpResponse.json({
      Key: 'crop-images/test-image.jpg',
      ETag: 'mock-etag',
    });
  }),

  http.get(`${SUPABASE_URL}/storage/v1/object/public/crop-images/*`, () => {
    return HttpResponse.json({
      publicUrl: 'https://example.com/test-image.jpg',
    });
  }),

  // Real-time subscriptions (WebSocket mocking)
  http.get(`${SUPABASE_URL}/realtime/v1/websocket`, () => {
    return new HttpResponse(null, { status: 101 });
  }),

  // External API mocks
  
  // OpenWeatherMap API
  http.get('https://api.openweathermap.org/data/2.5/weather', () => {
    return HttpResponse.json(mockWeatherData.openWeatherResponse);
  }),

  http.get('https://api.openweathermap.org/data/2.5/forecast', () => {
    return HttpResponse.json(mockWeatherData.openWeatherForecast);
  }),

  // PlantNet API (for crop disease detection)
  http.post('https://my-api.plantnet.org/v1/identify/*', () => {
    return HttpResponse.json(mockCropDiseaseData.plantNetResponse);
  }),

  // Google Gemini AI API
  http.post('https://generativelanguage.googleapis.com/v1beta/models/*', () => {
    return HttpResponse.json(mockCropDiseaseData.geminiResponse);
  }),

  // Sentinel Hub API (for satellite imagery)
  http.post('https://services.sentinel-hub.com/api/v1/process', () => {
    return HttpResponse.arrayBuffer(new ArrayBuffer(1024)); // Mock image data
  }),

  // Error simulation handlers
  http.get(`${SUPABASE_URL}/rest/v1/error-test`, () => {
    return HttpResponse.json(
      { error: 'Test error message' },
      { status: 500 }
    );
  }),

  http.get(`${SUPABASE_URL}/rest/v1/timeout-test`, async () => {
    // Simulate timeout
    await new Promise(resolve => setTimeout(resolve, 10000));
    return HttpResponse.json({ data: 'This should timeout' });
  }),

  // Rate limiting simulation
  http.get(`${SUPABASE_URL}/rest/v1/rate-limit-test`, () => {
    return HttpResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }),
];

// Helper function to add custom handlers for specific tests
export function addTestHandlers(customHandlers: any[]) {
  return [...handlers, ...customHandlers];
}