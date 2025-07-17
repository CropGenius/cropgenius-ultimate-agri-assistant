# Design Document

## Overview

The Market Data UI Improvements feature will enhance CropGenius's market intelligence capabilities through four key components: MarketListings for browsing active crop listings, PriceTrends for visualizing market patterns, DemandIndicator for market condition analysis, and comprehensive testing coverage. The design leverages existing Supabase infrastructure, React Query for data management, and the established shadcn/ui design system to create a cohesive, production-ready market intelligence platform.

## Architecture

### Component Architecture

```
MarketDataPage (Container)
├── MarketListings Component
│   ├── Search & Filter Controls
│   ├── Grid/List View Toggle
│   ├── Listing Cards/Rows
│   └── Listing Detail Modal
├── PriceTrends Component
│   ├── Interactive Charts (Recharts)
│   ├── Time Range Selector
│   ├── Statistics Cards
│   └── Trend Indicators
├── DemandIndicator Component
│   ├── Market Health Score
│   ├── Demand/Supply Badges
│   ├── Metrics Dashboard
│   └── Recommendations Panel
└── Real-time Monitoring
    ├── Price Alerts System
    ├── Notification Manager
    └── Auto-refresh Logic
```

### Data Flow Architecture

```
User Interaction → Component State → React Query → API Layer → Supabase → Database
                                  ↓
                            Cache Management
                                  ↓
                            Real-time Updates
                                  ↓
                            UI State Updates
```

### Integration Points

- **Supabase Integration**: Leverages existing `market_listings` table and real-time subscriptions
- **React Query**: Provides caching, background updates, and optimistic updates
- **Location Services**: Integrates with user profile location for distance calculations
- **Notification System**: Uses existing toast system for alerts and feedback
- **Authentication**: Integrates with existing AuthProvider for user context

## Components and Interfaces

### MarketListings Component

**Purpose**: Display and manage active crop listings with advanced filtering and interaction capabilities.

**Props Interface**:
```typescript
interface MarketListingsProps {
  listings?: MarketListing[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onCreateListing?: () => void;
  onContactSeller?: (listing: MarketListing) => void;
  onViewDetails?: (listing: MarketListing) => void;
  onSaveListing?: (listing: MarketListing) => void;
  userLocation?: { lat: number; lng: number };
  className?: string;
}
```

**Key Features**:
- **Search & Filtering**: Real-time search by crop name, location, seller
- **Sorting Options**: By date, price, distance, demand level
- **View Modes**: Grid cards for visual browsing, list rows for detailed comparison
- **Distance Calculation**: Shows proximity to user location with sorting
- **Interactive Actions**: Contact seller, save listing, share, view details
- **Quality Indicators**: Visual quality grades (A/B/C) with star ratings

**State Management**:
- Local state for filters, search, sorting, view mode
- React Query for data fetching and caching
- Optimistic updates for user interactions

### PriceTrends Component

**Purpose**: Visualize price movements and market trends with interactive charts and analytics.

**Props Interface**:
```typescript
interface MarketPriceChartProps {
  data: MarketPrice[];
  priceTrend?: PriceTrend | null;
  title?: string;
  height?: number;
  showVolume?: boolean;
  showTrendLine?: boolean;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}
```

**Chart Types**:
- **Line Charts**: Price trends over time with smooth curves
- **Combined Charts**: Price + volume overlay for comprehensive analysis
- **Bar Charts**: Volume and market activity visualization
- **Reference Lines**: Average price indicators and trend lines

**Interactive Features**:
- **Time Range Selection**: 7d, 30d, 90d, 1y with dynamic data loading
- **Hover Tooltips**: Detailed information on data points
- **Zoom & Pan**: Chart interaction for detailed analysis
- **Statistics Cards**: Current, high, low, average prices with change indicators

### DemandIndicator Component

**Purpose**: Analyze and display market demand conditions with actionable insights.

**Props Interface**:
```typescript
interface DemandIndicatorProps {
  data: DemandIndicator;
  showRecommendation?: boolean;
  showDetails?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}
```

**Analysis Features**:
- **Market Health Score**: 0-100 calculated from demand, supply, activity, volatility
- **Demand Levels**: Low, Medium, High, Critical with color-coded badges
- **Supply Analysis**: Low, Medium, High, Oversupply with impact indicators
- **Metrics Dashboard**: Activity, volatility, seasonal factors with progress bars
- **AI Recommendations**: Context-aware advice based on market conditions

**Visual Design**:
- **Color System**: Green (good), Amber (caution), Red (urgent), Blue (info)
- **Progress Indicators**: Visual representation of metric levels
- **Badge System**: Consistent status indicators across components
- **Tooltip Integration**: Detailed explanations for complex metrics

### Real-time Monitoring System

**Purpose**: Provide automated market monitoring with intelligent alerts.

**Features**:
- **Price Change Alerts**: Configurable thresholds for price movements
- **Demand Spike Detection**: Automatic detection of high/critical demand
- **Supply Shortage Warnings**: Alerts for low supply conditions
- **Seasonal Notifications**: Timing-based recommendations
- **Custom Thresholds**: User-configurable alert parameters

**Alert Management**:
- **Severity Levels**: Low, Medium, High, Critical with appropriate styling
- **Notification Types**: Toast messages, in-app alerts, badge counters
- **Alert History**: Persistent storage of recent alerts
- **Dismissal System**: Individual and bulk alert management

## Data Models

### Enhanced MarketListing Interface

```typescript
interface MarketListing {
  id: string;
  created_at: string;
  crop_name: string;
  price: number;
  quantity?: number;
  unit?: string;
  location?: string;
  seller_id?: string;
  seller_name?: string;
  contact_info?: string;
  description?: string;
  listing_type?: 'sell' | 'buy' | 'trade';
  status?: 'active' | 'pending' | 'completed' | 'expired';
  expiry_date?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  quality_grade?: 'A' | 'B' | 'C' | 'unknown';
  currency?: string;
}
```

### Chart Data Processing

```typescript
interface ChartDataPoint {
  date: string;
  price: number;
  volume: number;
  formattedDate: string;
  trend?: 'up' | 'down' | 'stable';
}
```

### Alert System Data

```typescript
interface MarketAlert {
  id: string;
  crop_name: string;
  type: 'price_spike' | 'price_drop' | 'high_demand' | 'low_supply';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  threshold_value?: number;
  current_value?: number;
}
```

## Error Handling

### Component-Level Error Handling

- **Loading States**: Skeleton components during data fetching
- **Empty States**: Informative messages when no data is available
- **Error Boundaries**: Graceful degradation for component failures
- **Retry Mechanisms**: User-initiated and automatic retry options
- **Fallback Content**: Default values and placeholder data

### API Error Handling

- **Network Errors**: Offline detection and retry logic
- **Authentication Errors**: Redirect to login with context preservation
- **Rate Limiting**: Exponential backoff and user feedback
- **Data Validation**: Client-side validation before API calls
- **Error Reporting**: Structured error logging for debugging

### User Experience Error Handling

- **Toast Notifications**: Non-intrusive error messages
- **Inline Validation**: Real-time feedback for user inputs
- **Progressive Enhancement**: Core functionality without JavaScript
- **Accessibility**: Screen reader compatible error messages
- **Recovery Actions**: Clear paths to resolve error conditions

## Testing Strategy

### Unit Testing Approach

**Component Testing**:
- **Rendering Tests**: Verify components render with correct props
- **Interaction Tests**: User event simulation and state changes
- **Data Processing**: Chart data transformation and calculations
- **Filter Logic**: Search, sort, and filter functionality
- **Error States**: Loading, empty, and error condition handling

**Hook Testing**:
- **Data Fetching**: API integration and caching behavior
- **State Management**: Filter updates and data synchronization
- **Alert System**: Threshold detection and notification logic
- **Real-time Updates**: Auto-refresh and subscription handling

### Integration Testing

**User Flow Testing**:
- **Market Browsing**: Search → Filter → View → Contact flow
- **Price Analysis**: Chart interaction → Time range → Export data
- **Demand Analysis**: Metric viewing → Recommendation → Action
- **Alert Management**: Setup → Trigger → Dismiss → History

**API Integration Testing**:
- **Data Consistency**: Verify data integrity across components
- **Error Scenarios**: Network failures, invalid responses
- **Performance**: Load testing with large datasets
- **Real-time Features**: WebSocket connections and updates

### End-to-End Testing

**Critical User Journeys**:
- **Farmer Market Research**: Complete market analysis workflow
- **Selling Decision**: Price comparison → Demand analysis → Decision
- **Alert Response**: Alert trigger → User action → Market response
- **Mobile Experience**: Touch interactions and responsive behavior

**Cross-browser Testing**:
- **Desktop Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Android Chrome
- **Accessibility**: Screen readers and keyboard navigation
- **Performance**: Loading times and interaction responsiveness

## Performance Considerations

### Data Optimization

- **Query Optimization**: Efficient database queries with proper indexing
- **Caching Strategy**: React Query with stale-while-revalidate pattern
- **Data Pagination**: Lazy loading for large datasets
- **Image Optimization**: Compressed images with lazy loading
- **Bundle Splitting**: Code splitting for market data components

### Real-time Performance

- **WebSocket Management**: Efficient connection handling and cleanup
- **Update Batching**: Grouped updates to prevent UI thrashing
- **Memory Management**: Proper cleanup of subscriptions and timers
- **Background Processing**: Web Workers for heavy calculations
- **Offline Support**: Service worker caching for core functionality

### Mobile Optimization

- **Touch Interactions**: Optimized for finger navigation
- **Network Awareness**: Adaptive loading based on connection quality
- **Battery Efficiency**: Reduced polling and background activity
- **Storage Management**: Efficient local storage usage
- **Progressive Loading**: Critical content first approach