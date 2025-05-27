import { http, HttpResponse, delay } from 'msw';

interface MarketDataParams {
  crop: string;
  location: string;
  currency?: string;
  mode?: 'retail' | 'wholesale';
  language?: string;
}

const MOCK_CROPS = [
  'Maize',
  'Wheat',
  'Rice',
  'Soybeans',
  'Potatoes',
  'Tomatoes',
  'Onions',
  'Beans',
  'Sorghum',
  'Millet'
];

export const handlers = [
  // Mock market data endpoint
  http.get('/api/market-data', async ({ request }) => {
    const url = new URL(request.url);
    const crop = url.searchParams.get('crop');
    const location = url.searchParams.get('location');
    const currency = url.searchParams.get('currency') || 'USD';
    const mode = (url.searchParams.get('mode') as 'retail' | 'wholesale') || 'retail';
    
    if (!crop || !location) {
      return HttpResponse.json(
        { error: 'Missing required parameters: crop and location' },
        { status: 400 }
      );
    }

    // Simulate network delay
    await delay(150);

    // Mock response data
    return HttpResponse.json({
      crop,
      location,
      price: Math.random() * 100 + 50, // Random price between 50-150
      currency,
      unit: 'kg',
      lastUpdated: new Date().toISOString(),
      source: 'Mock Data',
      trend: Math.random() > 0.5 ? 'rising' : 'falling',
      change: (Math.random() * 10).toFixed(2),
      mode
    });
  }),

  // Mock market trends endpoint
  http.get('/api/market-trends', async ({ request }) => {
    const url = new URL(request.url);
    const crop = url.searchParams.get('crop');
    const location = url.searchParams.get('location');
    
    if (!crop || !location) {
      return HttpResponse.json(
        { error: 'Missing required parameters: crop and location' },
        { status: 400 }
      );
    }

    // Simulate network delay
    await delay(200);

    // Generate mock trend data
    const trends = Array.from({ length: 12 }, (_, i) => ({
      date: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: Math.random() * 100 + 50,
      volume: Math.floor(Math.random() * 1000) + 100
    }));

    return HttpResponse.json({
      crop,
      location,
      trends,
      lastUpdated: new Date().toISOString()
    });
  }),

  // Mock crop suggestions endpoint
  http.get('/api/crop-suggestions', async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    
    // Simulate network delay
    await delay(100);
    
    const suggestions = MOCK_CROPS.filter(crop => 
      crop.toLowerCase().includes(query.toLowerCase())
    );

    return HttpResponse.json(suggestions);
  })
];
