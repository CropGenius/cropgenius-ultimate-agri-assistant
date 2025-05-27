# Pricing Intelligence Service

The Pricing Intelligence Service is a core component of the CropGenius platform, providing real-time crop pricing data, market analysis, and actionable insights to farmers across Africa.

## Features

- **Multi-source Data Aggregation**: Fetches data from WFP DataBridges (primary) with fallback to Trading Economics
- **Real-time Currency Conversion**: Supports multiple African currencies with automatic conversion
- **Advanced Analytics**: Trend analysis, volatility scoring, and anomaly detection
- **Localized Advice**: Contextual recommendations in multiple languages
- **Intelligent Caching**: Reduces API calls and improves performance
- **Robust Error Handling**: Graceful degradation when services are unavailable

## Architecture

```
pricing-intelligence/
├── analytics/           # Price analysis and trend detection
├── cache/               # Caching layer implementation
├── data-sources/        # Data source integrations (WFP, Trading Economics)
├── models/              # TypeScript types and interfaces
├── services/            # Core services (exchange rates, advice generation)
└── README.md            # This file
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- API keys for:
  - WFP DataBridges
  - Trading Economics (optional, used as fallback)
  - Open Exchange Rates (for currency conversion)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (create a `.env` file):
   ```env
   WFP_API_KEY=your_wfp_api_key
   TRADING_ECONOMICS_API_KEY=your_te_api_key
   OPEN_EXCHANGE_RATES_APP_ID=your_oxr_app_id
   ```

## Usage

### Basic Usage

```typescript
import { PricingIntelligenceService } from './services/pricing-intelligence';

// Get the service instance
const pricingService = PricingIntelligenceService.getInstance();

// Get market data for a crop and location
const marketData = await pricingService.getMarketData(
  'maize',      // crop
  'Nairobi',     // location
  'KES',         // currency (optional, defaults to USD)
  'dashboard',   // output mode: 'dashboard' | 'sms' | 'pro_api' | 'logistics'
  'en'          // language (optional, defaults to 'en')
);

console.log(marketData);
```

### Example Response

```json
{
  "crop": "maize",
  "location": "Nairobi, Kenya",
  "price_today": 38.50,
  "currency": "KES",
  "price_last_week": 40.00,
  "change_pct": -3.75,
  "trend": "falling",
  "volatility_score": 0.15,
  "anomaly_flag": false,
  "advice": {
    "en": "Maize prices are decreasing (3.75% this week). Consider waiting for better prices if storage is an option.",
    "sw": "Bei ya mahindi inapungua (3.75% wiki hii). Fikiria kusubiri bei nzuri zaidi ikiwa una uwezo wa kuhifadhi."
  },
  "source": "WFP DataBridges",
  "updated_at": "2025-05-25T12:00:00Z"
}
```

## API Reference

### `PricingIntelligenceService`

#### `getInstance(): PricingIntelligenceService`
Get the singleton instance of the service.

#### `getMarketData(crop: string, location: string, currency?: string, mode?: OutputMode, language?: Language): Promise<MarketDataResponse>`
Get market data for a specific crop and location.

- `crop`: The crop name (e.g., 'maize', 'wheat')
- `location`: The location (city, region, or country)
- `currency`: Target currency (default: 'USD')
- `mode`: Output format ('dashboard', 'sms', 'pro_api', 'logistics')
- `language`: Language for advice ('en', 'sw', 'fr', 'yo')

#### `clearCache(): Promise<void>`
Clear all cached data (useful for testing or emergency updates).

## Data Sources

### Primary: WFP DataBridges
- Provides localized crop price data across Africa
- Updated weekly
- High accuracy for major crops and markets

### Fallback: Trading Economics
- Global commodity prices
- Used when WFP data is unavailable
- Less granular but more comprehensive coverage

## Caching Strategy

- **In-memory cache**: For fast access to frequently requested data
- **Persistent cache**: For offline access and reduced API calls
- **TTL**: 30 minutes for price data, 1 hour for exchange rates
- **Auto-invalidation**: On data updates and errors

## Error Handling

The service implements robust error handling with:
- Automatic retries with exponential backoff
- Graceful degradation when services are unavailable
- Meaningful error messages and status codes
- Fallback to cached data when possible

## Testing

Run the test suite:

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact the development team at [support@cropgenius.africa](mailto:support@cropgenius.africa).
