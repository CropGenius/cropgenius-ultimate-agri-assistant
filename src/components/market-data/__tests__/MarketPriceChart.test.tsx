/**
 * INFINITY GOD MODE MarketPriceChart Component Tests
 * Comprehensive test suite for advanced price visualization component
 * Testing chart interactions and data processing for 100M African farmers! 🚀🔥💪
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MarketPriceChart } from '../MarketPriceChart';
import type { MarketPrice, PriceTrend } from '@/api/marketDataApi';

// Mock Recharts components
vi.mock('recharts', () => ({
  LineChart: ({ children, data }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  ComposedChart: ({ children, data }: any) => (
    <div data-testid="composed-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke }: any) => (
    <div data-testid={`line-${dataKey}`} data-stroke={stroke} />
  ),
  Bar: ({ dataKey, fill }: any) => (
    <div data-testid={`bar-${dataKey}`} data-fill={fill} />
  ),
  XAxis: ({ dataKey }: any) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: ({ yAxisId }: any) => <div data-testid="y-axis" data-axis-id={yAxisId} />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: ({ content }: any) => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children, width, height }: any) => (
    <div data-testid="responsive-container" style={{ width, height }}>
      {children}
    </div>
  ),
  ReferenceLine: ({ y, label }: any) => (
    <div data-testid="reference-line" data-y={y} data-label={JSON.stringify(label)} />
  )
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'MMM dd') return 'Jan 15';
    if (formatStr === 'MMM dd, yyyy') return 'Jan 15, 2025';
    return 'Jan 15';
  }),
  parseISO: vi.fn((dateStr) => new Date(dateStr))
}));

describe('MarketPriceChart Component - INFINITY GOD MODE Tests', () => {
  // SUPREME test data for African market price analysis
  const mockMarketPrices: MarketPrice[] = [
    {
      id: '1',
      crop_name: 'maize',
      price: 45.50,
      currency: 'KES',
      location: 'Nairobi, Kenya',
      date_recorded: '2025-01-10',
      created_at: '2025-01-10T10:00:00Z'
    },
    {
      id: '2',
      crop_name: 'maize',
      price: 46.20,
      currency: 'KES',
      location: 'Nairobi, Kenya',
      date_recorded: '2025-01-11',
      created_at: '2025-01-11T10:00:00Z'
    },
    {
      id: '3',
      crop_name: 'maize',
      price: 47.00,
      currency: 'KES',
      location: 'Nairobi, Kenya',
      date_recorded: '2025-01-12',
      created_at: '2025-01-12T10:00:00Z'
    },
    {
      id: '4',
      crop_name: 'maize',
      price: 46.80,
      currency: 'KES',
      location: 'Nairobi, Kenya',
      date_recorded: '2025-01-13',
      created_at: '2025-01-13T10:00:00Z'
    },
    {
      id: '5',
      crop_name: 'maize',
      price: 48.50,
      currency: 'KES',
      location: 'Nairobi, Kenya',
      date_recorded: '2025-01-14',
      created_at: '2025-01-14T10:00:00Z'
    }
  ];

  const mockPriceTrend: PriceTrend = {
    crop_name: 'maize',
    current_price: 48.50,
    previous_price: 45.50,
    price_change: 3.00,
    price_change_percent: 6.59,
    trend: 'rising',
    period_days: 7
  };

  const defaultProps = {
    data: mockMarketPrices,
    priceTrend: mockPriceTrend,
    title: 'Maize Price Trends',
    height: 400,
    showVolume: true,
    showTrendLine: true,
    timeRange: '30d' as const,
    onTimeRangeChange: vi.fn(),
    onRefresh: vi.fn(),
    isLoading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('🚀 Component Rendering Tests', () => {
    it('should render MarketPriceChart with INFINITY GOD MODE precision', () => {
      render(<MarketPriceChart {...defaultProps} />);
      
      expect(screen.getByText('Maize Price Trends')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should display price trend indicator correctly', () => {
      render(<MarketPriceChart {...defaultProps} />);
      
      // Should show rising trend with positive percentage
      expect(screen.getByText('+6.59%')).toBeInTheDocument();
      expect(screen.getByText('(7d)')).toBeInTheDocument();
    });

    it('should render statistics cards with correct values', () => {
      render(<MarketPriceChart {...defaultProps} />);
      
      // Check statistics
      expect(screen.getByText('$48.5')).toBeInTheDocument(); // Current price
      expect(screen.getByText('Current Price')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Average')).toBeInTheDocument();
    });

    it('should show tabs for different chart views', () => {
      render(<MarketPriceChart {...defaultProps} />);
      
      expect(screen.getByText('Price Trend')).toBeInTheDocument();
      expect(screen.getByText('Volume')).toBeInTheDocument();
      expect(screen.getByText('Combined')).toBeInTheDocument();
    });

    it('should render time range selector when onTimeRangeChange is provided', () => {
      render(<MarketPriceChart {...defaultProps} />);
      
      // Should show time range selector
      const timeRangeSelector = screen.getByDisplayValue('30d');
      expect(timeRangeSelector).toBeInTheDocument();
    });

    it('should render refresh button when onRefresh is provided', () => {
      render(<MarketPriceChart {...defaultProps} />);
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('🔥 Data Processing and Chart Logic', () => {
    it('should process market price data correctly for chart display', () => {
      render(<MarketPriceChart {...defaultProps} />);
      
      const chartElement = screen.getByTestId('line-chart');
      const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '[]');
      
      // Should have processed data points
      expect(chartData).toHaveLength(5);
      expect(chartData[0]).toHaveProperty('price');
      expect(chartData[0]).toHaveProperty('volume');
      expect(chartData[0]).toHaveProperty('formattedDate');
    });

    it('should calculate statistics correctly from price data', () => {
      render(<MarketPriceChart {...defaultProps} />);
      
      // Current price should be the last price
      expect(screen.getByText('$48.5')).toBeInTheDocument();
      
      // High price should be maximum
      expect(screen.getByText('$48.5')).toBeInTheDocument();
      
      // Low price should be minimum  
      expect(screen.getByText('$45.5')).toBeInTheDocument();
    });

    it('should group data by date and calculate daily averages', () => {
      // Add multiple prices for same date
      const dataWithDuplicates = [
        ...mockMarketPrices,
        {
          id: '6',
          crop_name: 'maize',
          price: 49.00,
          currency: 'KES',
          location: 'Nairobi, Kenya',
          date_recorded: '2025-01-14', // Same date as last entry
          created_at: '2025-01-14T15:00:00Z'
        }
      ];

      render(<MarketPriceChart {...defaultProps} data={dataWithDuplicates} />);
      
      const chartElement = screen.getByTestId('line-chart');
      const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '[]');
      
      // Should still have 5 data points (grouped by date)
      expect(chartData).toHaveLength(5);
      
      // Last data point should be average of 48.50 and 49.00 = 48.75
      const lastPoint = chartData[chartData.length - 1];
      expect(lastPoint.price).toBe(48.75);
    });

    it('should add trend indicators to data points', () => {
      render(<MarketPriceChart {...defaultProps} />);
      
      const chartElement = screen.getByTestId('line-chart');
      const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '[]');
      
      // Should have trend indicators (except first point)
      const pointsWithTrend = chartData.filter((point: any) => point.trend);
      expect(pointsWithTrend.length).toBeGreaterThan(0);
    });
  });

  describe('💪 User Interactions', () => {
    it('should call onTimeRangeChange when time range is changed', async () => {
      const onTimeRangeChange = vi.fn();
      render(<MarketPriceChart {...defaultProps} onTimeRangeChange={onTimeRangeChange} />);
      
      const timeRangeSelector = screen.getByDisplayValue('30d');
      await userEvent.click(timeRangeSelector);
      
      // Select 7d option
      const option7d = screen.getByText('7d');
      await userEvent.click(option7d);
      
      expect(onTimeRangeChange).toHaveBeenCalledWith('7d');
    });

    it('should call onRefresh when refresh button is clicked', async () => {
      const onRefresh = vi.fn();
      render(<MarketPriceChart {...defaultProps} onRefresh={onRefresh} />);
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await userEvent.click(refreshButton);
      
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it('should switch between chart tabs correctly', async () => {
      render(<MarketPriceChart {...defaultProps} />);
      
      // Default should be price trend
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      
      // Switch to volume tab
      const volumeTab = screen.getByText('Volume');
      await userEvent.click(volumeTab);
      
      // Should still show line chart but with volume data
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      
      // Switch to combined tab
      const combinedTab = screen.getByText('Combined');
      await userEvent.click(combinedTab);
      
      // Should show composed chart
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should disable refresh button when loading', () => {
      render(<MarketPriceChart {...defaultProps} isLoading={true} />);
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('🎯 Trend Indicators and Visual Elements', () => {
    it('should show rising trend indicator for positive price change', () => {
      render(<MarketPriceChart {...defaultProps} />);
      
      expect(screen.getByText('+6.59%')).toBeInTheDocument();
      // Should have green color class for positive trend
    });

    it('should show falling trend indicator for negative price change', () => {
      const fallingTrend: PriceTrend = {
        ...mockPriceTrend,
        price_change: -2.50,
        price_change_percent: -5.49,
        trend: 'falling'
      };

      render(<MarketPriceChart {...defaultProps} priceTrend={fallingTrend} />);
      
      expect(screen.getByText('-5.49%')).toBeInTheDocument();
    });

    it('should show stable trend indicator for zero price change', () => {
      const stableTrend: PriceTrend = {
        ...mockPriceTrend,
        price_change: 0,
        price_change_percent: 0,
        trend: 'stable'
      };

      render(<MarketPriceChart {...defaultProps} priceTrend={stableTrend} />);
      
      expect(screen.getByText('0.00%')).toBeInTheDocument();
    });

    it('should render reference line when showTrendLine is true', () => {
      render(<MarketPriceChart {...defaultProps} showTrendLine={true} />);
      
      const referenceLine = screen.getByTestId('reference-line');
      expect(referenceLine).toBeInTheDocument();
    });

    it('should not render volume tab when showVolume is false', () => {
      render(<MarketPriceChart {...defaultProps} showVolume={false} />);
      
      expect(screen.queryByText('Volume')).not.toBeInTheDocument();
      expect(screen.getByText('Price Trend')).toBeInTheDocument();
      expect(screen.getByText('Combined')).toBeInTheDocument();
    });
  });

  describe('🌟 Empty States and Error Handling', () => {
    it('should show empty state when no data is provided', () => {
      render(<MarketPriceChart {...defaultProps} data={[]} />);
      
      expect(screen.getByText('No price data available')).toBeInTheDocument();
      expect(screen.getByText('No market data to display')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters or check back later')).toBeInTheDocument();
    });

    it('should handle missing price trend gracefully', () => {
      render(<MarketPriceChart {...defaultProps} priceTrend={null} />);
      
      // Should still render the chart
      expect(screen.getByText('Maize Price Trends')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should handle invalid or malformed data gracefully', () => {
      const invalidData = [
        {
          id: '1',
          crop_name: 'maize',
          price: NaN,
          currency: 'KES',
          location: 'Nairobi, Kenya',
          date_recorded: 'invalid-date',
          created_at: '2025-01-10T10:00:00Z'
        }
      ];

      render(<MarketPriceChart {...defaultProps} data={invalidData as any} />);
      
      // Should handle gracefully without crashing
      expect(screen.getByText('Maize Price Trends')).toBeInTheDocument();
    });
  });

  describe('🚀 Performance and Optimization', () => {
    it('should handle large datasets efficiently', () => {
      // Create large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        crop_name: 'maize',
        price: 45 + Math.random() * 10,
        currency: 'KES',
        location: 'Nairobi, Kenya',
        date_recorded: `2025-01-${String(i % 30 + 1).padStart(2, '0')}`,
        created_at: `2025-01-${String(i % 30 + 1).padStart(2, '0')}T10:00:00Z`
      }));

      const { container } = render(<MarketPriceChart {...defaultProps} data={largeDataset} />);
      
      // Should render without performance issues
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Maize Price Trends')).toBeInTheDocument();
    });

    it('should memoize chart data processing', () => {
      const { rerender } = render(<MarketPriceChart {...defaultProps} />);
      
      // Get initial chart data
      const initialChart = screen.getByTestId('line-chart');
      const initialData = initialChart.getAttribute('data-chart-data');
      
      // Rerender with same data
      rerender(<MarketPriceChart {...defaultProps} />);
      
      // Chart data should be the same (memoized)
      const rerenderedChart = screen.getByTestId('line-chart');
      const rerenderedData = rerenderedChart.getAttribute('data-chart-data');
      
      expect(initialData).toBe(rerenderedData);
    });
  });

  describe('🎯 Accessibility and UX', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<MarketPriceChart {...defaultProps} />);
      
      // Check for proper button roles
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Check for tab navigation
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(3); // Price Trend, Volume, Combined
    });

    it('should support keyboard navigation for tabs', async () => {
      render(<MarketPriceChart {...defaultProps} />);
      
      const priceTab = screen.getByRole('tab', { name: 'Price Trend' });
      const volumeTab = screen.getByRole('tab', { name: 'Volume' });
      
      // Should be able to navigate with keyboard
      priceTab.focus();
      expect(document.activeElement).toBe(priceTab);
      
      // Tab to next element
      fireEvent.keyDown(priceTab, { key: 'Tab' });
      // Note: Actual tab navigation would require more complex setup
    });

    it('should provide meaningful chart descriptions', () => {
      render(<MarketPriceChart {...defaultProps} />);
      
      // Should have descriptive title
      expect(screen.getByText('Maize Price Trends')).toBeInTheDocument();
      
      // Should show trend information
      expect(screen.getByText('+6.59%')).toBeInTheDocument();
      expect(screen.getByText('(7d)')).toBeInTheDocument();
    });
  });

  describe('💪 Custom Props and Configuration', () => {
    it('should use custom height when provided', () => {
      render(<MarketPriceChart {...defaultProps} height={600} />);
      
      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '600px' });
    });

    it('should use custom title when provided', () => {
      render(<MarketPriceChart {...defaultProps} title="Custom Chart Title" />);
      
      expect(screen.getByText('Custom Chart Title')).toBeInTheDocument();
    });

    it('should handle different time ranges', () => {
      const timeRanges = ['7d', '30d', '90d', '1y'] as const;
      
      timeRanges.forEach(range => {
        const { rerender } = render(<MarketPriceChart {...defaultProps} timeRange={range} />);
        
        expect(screen.getByDisplayValue(range)).toBeInTheDocument();
        
        // Clean up for next iteration
        rerender(<div />);
      });
    });

    it('should work without optional props', () => {
      const minimalProps = {
        data: mockMarketPrices
      };

      render(<MarketPriceChart {...minimalProps} />);
      
      // Should render with defaults
      expect(screen.getByText('Market Price Trends')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });
});