# Pricing Intelligence Service API

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Get Market Data](#get-market-data)
  - [Get Supported Crops](#get-supported-crops)
  - [Get Supported Locations](#get-supported-locations)
  - [Get Exchange Rates](#get-exchange-rates)
- [Response Formats](#response-formats)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Webhooks](#webhooks)
- [SDKs](#sdks)
- [Changelog](#changelog)

## Overview
The Pricing Intelligence Service provides real-time and historical crop price data, market analysis, and actionable insights for farmers and agribusinesses across Africa. The API is RESTful and returns JSON responses.

## Authentication
All API requests require an API key for authentication. Include your API key in the `Authorization` header of each request:

```
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Get Market Data
Retrieve market data for a specific crop and location.

```
GET /v1/market-data
```

#### Query Parameters
| Parameter  | Type   | Required | Description |
|------------|--------|----------|-------------|
| crop       | string | Yes      | Name of the crop (e.g., 'maize', 'wheat') |
| location   | string | Yes      | Name of the location (e.g., 'Nairobi', 'Kampala') |
| currency   | string | No       | Target currency code (default: 'USD') |
| mode       | string | No       | Output mode: 'dashboard', 'sms', 'pro_api', 'logistics' (default: 'dashboard') |
| language   | string | No       | Language code: 'en', 'fr', 'sw', 'yo' (default: 'en') |
| start_date | string | No       | Start date in YYYY-MM-DD format (max 90 days range) |
| end_date   | string | No       | End date in YYYY-MM-DD format (default: today) |

#### Example Request
```http
GET /v1/market-data?crop=maize&location=Nairobi&currency=KES&mode=dashboard&language=sw
```

#### Example Response (200 OK)
```json
{
  "crop": "maize",
  "location": "Nairobi, Kenya",
  "price_today": 38.5,
  "currency": "KES",
  "price_last_week": 40.0,
  "change_pct": -3.75,
  "trend": "falling",
  "volatility_score": 0.15,
  "anomaly_flag": false,
  "advice": {
    "en": "Maize prices are decreasing (3.75% this week). Consider waiting for better prices if storage is an option.",
    "sw": "Bei ya mahindi inapungua (3.75% wiki hii). Fikiria kusubiri bei nzuri zaidi ikiwa una uwezo wa kuhifadhi."
  },
  "source": "WFP DataBridges",
  "updated_at": "2025-05-25T12:00:00Z",
  "metadata": {
    "min_price": 36.2,
    "max_price": 42.1,
    "price_history": [
      {
        "date": "2025-05-25",
        "price": 38.5,
        "source": "WFP"
      },
      {
        "date": "2025-05-18",
        "price": 40.0,
        "source": "WFP"
      }
    ],
    "confidence_indicators": {
      "data_freshness": 0.95,
      "source_reliability": 0.9,
      "data_consistency": 0.92
    }
  }
}
```

### Get Supported Crops
Retrieve a list of supported crops.

```
GET /v1/crops
```

#### Example Response (200 OK)
```json
{
  "crops": [
    {
      "id": "maize",
      "name": "Maize",
      "scientific_name": "Zea mays",
      "description": "Staple cereal crop widely grown in Africa",
      "image_url": "https://example.com/images/maize.jpg"
    },
    {
      "id": "wheat",
      "name": "Wheat",
      "scientific_name": "Triticum aestivum",
      "description": "Important cereal crop for bread and pasta",
      "image_url": "https://example.com/images/wheat.jpg"
    }
  ]
}
```

### Get Supported Locations
Retrieve a list of supported locations.

```
GET /v1/locations
```

#### Query Parameters
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| country   | string | No       | Filter by country code (e.g., 'KE', 'NG') |
| region    | string | No       | Filter by region name |

#### Example Response (200 OK)
```json
{
  "locations": [
    {
      "id": "nairobi",
      "name": "Nairobi",
      "region": "Nairobi",
      "country": "Kenya",
      "country_code": "KE",
      "coordinates": {
        "lat": -1.286389,
        "lng": 36.817223
      },
      "timezone": "Africa/Nairobi"
    },
    {
      "id": "kampala",
      "name": "Kampala",
      "region": "Central",
      "country": "Uganda",
      "country_code": "UG",
      "coordinates": {
        "lat": 0.313611,
        "lng": 32.581111
      },
      "timezone": "Africa/Kampala"
    }
  ]
}
```

### Get Exchange Rates
Get the latest exchange rates.

```
GET /v1/exchange-rates
```

#### Query Parameters
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| base      | string | No       | Base currency (default: 'USD') |
| symbols   | string | No       | Comma-separated list of currency codes to filter |

#### Example Response (200 OK)
```json
{
  "base": "USD",
  "rates": {
    "KES": 150.25,
    "UGX": 3700.5,
    "NGN": 450.75,
    "GHS": 11.25,
    "XOF": 550.3,
    "ZAR": 18.5
  },
  "date": "2025-05-25"
}
```

## Response Formats

The API supports different response formats based on the `Accept` header:

- `application/json` (default)
- `application/xml`
- `text/csv`

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "invalid_parameter",
    "message": "Invalid parameter: crop is required",
    "details": {
      "parameter": "crop",
      "expected": "string",
      "received": null
    },
    "request_id": "req_1234567890",
    "timestamp": "2025-05-25T12:34:56Z"
  }
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | invalid_parameter | Invalid or missing parameter |
| 401 | unauthorized | Invalid or missing API key |
| 403 | forbidden | Insufficient permissions |
| 404 | not_found | Resource not found |
| 422 | validation_error | Request validation failed |
| 429 | rate_limit_exceeded | Too many requests |
| 500 | internal_error | Internal server error |
| 502 | bad_gateway | Upstream service unavailable |
| 503 | service_unavailable | Service temporarily unavailable |

## Rate Limiting

- **Free Tier**: 100 requests/hour
- **Starter**: 1,000 requests/hour
- **Business**: 10,000 requests/hour
- **Enterprise**: Custom

Rate limits are tracked by API key. Exceeding the limit will result in a 429 status code.

## Webhooks

Set up webhooks to receive real-time price updates.

### Webhook Events
- `price.update`: Triggered when a price changes significantly
- `trend.change`: Triggered when market trend changes
- `anomaly.detected`: Triggered when unusual price movement is detected

### Webhook Payload
```json
{
  "event": "price.update",
  "data": {
    "crop": "maize",
    "location": "Nairobi",
    "price": 38.5,
    "currency": "KES",
    "change_pct": -3.75,
    "timestamp": "2025-05-25T12:00:00Z"
  },
  "webhook_id": "wh_1234567890",
  "created_at": "2025-05-25T12:00:01Z"
}
```

## SDKs

Official SDKs are available for:

- **JavaScript/TypeScript**: `npm install @cropgenius/pricing-intelligence`
- **Python**: `pip install cropgenius-pricing`
- **Java**: Maven Central `com.cropgenius:pricing-client`
- **PHP**: `composer require cropgenius/pricing`

## Changelog

### v1.0.0 (2025-05-25)
- Initial release
- Basic market data endpoints
- Multi-currency support
- Localized advice in 4 languages

### v1.1.0 (Planned)
- Historical data endpoints
- Advanced analytics
- Bulk operations
- Enhanced webhook support
