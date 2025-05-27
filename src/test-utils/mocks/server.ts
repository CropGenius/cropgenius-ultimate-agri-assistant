import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock API responses
export const handlers = [
  // Auth endpoints
  http.post('/api/auth/signin', () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' },
      },
      session: {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
      },
    }, { status: 200 });
  }),

  // Fields endpoints
  http.get('/api/fields', () => {
    return HttpResponse.json([
      {
        id: 'field-1',
        name: 'North Field',
        area: 10.5,
        cropType: 'Maize',
        coordinates: [],
      },
    ], { status: 200 });
  }),

  // Weather endpoints
  http.get('/api/weather/forecast', () => {
    return HttpResponse.json({
      daily: [
        {
          dt: Math.floor(Date.now() / 1000),
          temp: { max: 25, min: 15 },
          weather: [{ id: 800, main: 'Clear', description: 'clear sky' }],
          pop: 0,
        },
      ],
    }, { status: 200 });
  }),

  // AI suggestions endpoints
  http.post('/api/ai/suggestions', () => {
    return HttpResponse.json({
      suggestions: [
        {
          id: 'suggestion-1',
          type: 'irrigation',
          message: 'Consider irrigating your field due to low soil moisture levels.',
          priority: 'high',
          timestamp: new Date().toISOString(),
        },
      ],
    }, { status: 200 });
  }),
];

// Create server with the given request handlers
export const server = setupServer(...handlers);

export default server;

// Export the handlers for use in tests
export { http };
