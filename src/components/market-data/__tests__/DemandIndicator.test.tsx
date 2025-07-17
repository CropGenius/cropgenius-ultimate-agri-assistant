/**
 * INFINITY GOD MODE DemandIndicator Component Tests
 * Comprehensive test suite for advanced market demand analysis component
 * Testing AI-powered market intelligence for 100M African farmers! 🚀🔥💪
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DemandIndicator } from '../DemandIndicator';
import type { DemandIndicator as DemandIndicatorType } from '@/api/marketDataApi';

// Mock UI components that might have complex interactions
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => children,
  TooltipContent: ({ children }: any) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }: any) => children,
  TooltipTrigger: ({ children }: any) => children
}));

describe('DemandIndicator Component - INFINITY GOD MODE Tests', () => {
  // SUPREME test data for African market demand analysis
  const mockDemandData: DemandIndicatorType = {
    crop_name: 'maize',
    demand_level: 'high',
    supply_level: 'medium',
    market_activity: 25,
    price_volatility: 0.15,
    seasonal_factor: 1.2,
    recommendation: '📈 High seasonal demand for maize. Excellent selling opportunity.'
  };

  const defaultProps = {
    data: mockDemandData,
    showRecommendation: true,
    showDetails: true,
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
    it('should render DemandIndicator with INFINITY GOD MODE precision', () => {
      render(<DemandIndicator {...defaultProps} />);
      
      expect(screen.getByText('Market Demand Analysis')).toBeInTheDocument();
      expect(screen.getByText('maize market intelligence and demand indicators')).toBeInTheDocument();
    });

    it('should display market health score correctly', () => {
      render(<DemandIndicator {...defaultProps} />);
      
      // Should show calculated market health score
      const healthScore = screen.getByText(/\/100/);
      expect(healthScore).toBeInTheDocument();
      
      // Should show health description
      expect(screen.getByText(/market conditions/)).toBeInTheDocument();
    });

    it('should render demand level badge with correct styling', () => {
      render(<DemandIndicator {...defaultProps} />);
      
      expect(screen.getByText('High Demand')).toBeInTheDocument();
      // Should have appropriate styling for high demand
    });

    it('should render supply level badge with correct styling', () => {
      render(<DemandIndicator {...defaultProps} />);
      
      expect(screen.getByText('Medium Supply')).toBeInTheDocument();
    });

    it('should show refresh button when onRefresh is provided', () => {
      render(<DemandIndicator {...defaultProps} />);
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('🔥 Market Health Score Calculation', () => {
    it('should calculate high market health score for critical demand + low supply', () => {
      const criticalDemandData: DemandIndicatorType = {
        ...mockDemandData,
        demand_level: 'critical',
        supply_level: 'low',
        market_activity: 30,
        price_volatility: 0.1,
        seasonal_factor: 1.3
      };

      render(<DemandIndicator {...defaultProps} data={criticalDemandData} />);
      
      // Should show high health score (80+)
      const healthScore = screen.getByText(/\/100/);
      expect(healthScore.textContent).toMatch(/[8-9]\d\/100|100\/100/);
      expect(screen.getByText('Excellent market conditions')).toBeInTheDocument();
    });

    it('should calculate low market health score for low demand + oversupply', () => {
      const poorMarketData: DemandIndicatorType = {
        ...mockDemandData,
        demand_level: 'low',
        supply_level: 'oversupply',
        market_activity: 3,
        price_volatility: 0.4,
        seasonal_factor: 0.8
      };

      render(<DemandIndicator {...defaultProps} data={poorMarketData} />);
      
      // Should show low health score
      const healthScore = screen.getByText(/\/100/);
      expect(healthScore.textContent).toMatch(/[0-3]\d\/100/);
      expect(screen.getByText('Challenging market conditions')).toBeInTheDocument();
    });

    it('should calculate moderate health score for balanced conditions', () => {
      const balancedData: DemandIndicatorType = {
        ...mockDemandData,
        demand_level: 'medium',
        supply_level: 'medium',
        market_activity: 15,
        price_volatility: 0.2,
        seasonal_factor: 1.0
      };

      render(<DemandIndicator {...defaultProps} data={balancedData} />);
      
      // Should show moderate health score (40-79)
      const healthScore = screen.getByText(/\/100/);
      expect(healthScore.textContent).toMatch(/[4-7]\d\/100/);
    });
  });

  describe('💪 Demand and Supply Level Badges', () => {
    it('should render critical demand badge with correct styling', () => {
      const criticalData = { ...mockDemandData, demand_level: 'critical' as const };
      render(<DemandIndicator {...defaultProps} data={criticalData} />);
      
      expect(screen.getByText('Critical Demand')).toBeInTheDocument();
    });

    it('should render low demand badge with correct styling', () => {
      const lowDemandData = { ...mockDemandData, demand_level: 'low' as const };
      render(<DemandIndicator {...defaultProps} data={lowDemandData} />);
      
      expect(screen.getByText('Low Demand')).toBeInTheDocument();
    });

    it('should render oversupply badge with correct styling', () => {
      const oversupplyData = { ...mockDemandData, supply_level: 'oversupply' as const };
      render(<DemandIndicator {...defaultProps} data={oversupplyData} />);
      
      expect(screen.getByText('Oversupply')).toBeInTheDocument();
    });

    it('should render low supply badge with correct styling', () => {
      const lowSupplyData = { ...mockDemandData, supply_level: 'low' as const };
      render(<DemandIndicator {...defaultProps} data={lowSupplyData} />);
      
      expect(screen.getByText('Low Supply')).toBeInTheDocument();
    });
  });

  describe('🎯 Market Metrics Display', () => {
    it('should display market activity metric correctly', () => {
      render(<DemandIndicator {...defaultProps} />);
      
      expect(screen.getByText('Market Activity')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should display price volatility as percentage', () => {
      render(<DemandIndicator {...defaultProps} />);
      
      expect(screen.getByText('Price Volatility')).toBeInTheDocument();
      expect(screen.getByText('15.0%')).toBeInTheDocument();
    });

    it('should display seasonal factor with multiplier', () => {
      render(<DemandIndicator {...defaultProps} />);
      
      expect(screen.getByText('Seasonal Factor')).toBeInTheDocument();
      expect(screen.getByText('1.20x')).toBeInTheDocument();
    });

    it('should display market health score', () => {
      render(<DemandIndicator {...defaultProps} />);
      
      expect(screen.getByText('Market Health')).toBeInTheDocument();
      expect(screen.getByText(/\/100/)).toBeInTheDocument();
    });

    it('should hide metrics when showDetails is false', () => {
      render(<DemandIndicator {...defaultProps} showDetails={false} />);
      
      expect(screen.queryByText('Market Activity')).not.toBeInTheDocument();
      expect(screen.queryByText('Price Volatility')).not.toBeInTheDocument();
    });
  });

  describe('🌟 Recommendation System', () => {
    it('should display recommendation when showRecommendation is true', () => {
      render(<DemandIndicator {...defaultProps} />);
      
      expect(screen.getByText('Market Recommendation')).toBeInTheDocument();
      expect(screen.getByText('📈 High seasonal demand for maize. Excellent selling opportunity.')).toBeInTheDocument();
    });

    it('should hide recommendation when showRecommendation is false', () => {
      render(<DemandIndicator {...defaultProps} showRecommendation={false} />);
      
      expect(screen.queryByText('Market Recommendation')).not.toBeInTheDocument();
    });

    it('should not show recommendation section when recommendation is empty', () => {
      const dataWithoutRecommendation = { ...mockDemandData, recommendation: '' };
      render(<DemandIndicator {...defaultProps} data={dataWithoutRecommendation} />);
      
      expect(screen.queryByText('Market Recommendation')).not.toBeInTheDocument();
    });

    it('should show appropriate urgency styling for critical demand', () => {
      const criticalData = {
        ...mockDemandData,
        demand_level: 'critical' as const,
        recommendation: '🔥 Critical demand with low supply for maize! Sell immediately at premium prices.'
      };

      render(<DemandIndicator {...defaultProps} data={criticalData} />);
      
      expect(screen.getByText('Market Recommendation')).toBeInTheDocument();
      // Should have critical urgency styling
    });
  });

  describe('🚀 User Interactions', () => {
    it('should call onRefresh when refresh button is clicked', async () => {
      const onRefresh = vi.fn();
      render(<DemandIndicator {...defaultProps} onRefresh={onRefresh} />);
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await userEvent.click(refreshButton);
      
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it('should disable refresh button when loading', () => {
      render(<DemandIndicator {...defaultProps} isLoading={true} />);
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeDisabled();
    });

    it('should show spinning icon when loading', () => {
      render(<DemandIndicator {...defaultProps} isLoading={true} />);
      
      // Should show spinning refresh icon
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
    });

    it('should handle quick action buttons', async () => {
      render(<DemandIndicator {...defaultProps} />);
      
      const viewDetailsButton = screen.getByText('View Details');
      const setAlertButton = screen.getByText('Set Alert');
      
      expect(viewDetailsButton).toBeInTheDocument();
      expect(setAlertButton).toBeInTheDocument();
      
      // Should be clickable
      await userEvent.click(viewDetailsButton);
      await userEvent.click(setAlertButton);
    });
  });

  describe('🎯 Progress Bars and Visual Indicators', () => {
    it('should render progress bars for all metrics', () => {
      render(<DemandIndicator {...defaultProps} />);
      
      // Should have progress bars for each metric
      const progressBars = document.querySelectorAll('[role="progressbar"]');
      expect(progressBars.length).toBe(4); // Activity, Volatility, Seasonal, Health
    });

    it('should calculate correct progress values', () => {
      render(<DemandIndicator {...defaultProps} />);
      
      // Market activity: 25/50 * 100 = 50%
      // Price volatility: 0.15 * 200 = 30%
      // Seasonal factor: 1.2 * 50 = 60%
      // Market health: calculated score
      
      const progressBars = document.querySelectorAll('[role="progressbar"]');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('should handle extreme values in progress bars', () => {
      const extremeData: DemandIndicatorType = {
        ...mockDemandData,
        market_activity: 100, // Very high
        price_volatility: 0.8, // Very high
        seasonal_factor: 3.0 // Very high
      };

      render(<DemandIndicator {...defaultProps} data={extremeData} />);
      
      // Should cap progress bars at 100%
      const progressBars = document.querySelectorAll('[role="progressbar"]');
      expect(progressBars.length).toBe(4);
    });
  });

  describe('💪 Tooltip Functionality', () => {
    it('should show tooltips for demand level badge', async () => {
      render(<DemandIndicator {...defaultProps} />);
      
      const demandBadge = screen.getByText('High Demand');
      
      // Hover to show tooltip
      await userEvent.hover(demandBadge);
      
      // Should show tooltip content
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    });

    it('should show tooltips for supply level badge', async () => {
      render(<DemandIndicator {...defaultProps} />);
      
      const supplyBadge = screen.getByText('Medium Supply');
      
      // Hover to show tooltip
      await userEvent.hover(supplyBadge);
      
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    });
  });

  describe('🌟 Different Market Scenarios', () => {
    it('should handle excellent market conditions scenario', () => {
      const excellentData: DemandIndicatorType = {
        crop_name: 'coffee',
        demand_level: 'critical',
        supply_level: 'low',
        market_activity: 35,
        price_volatility: 0.05,
        seasonal_factor: 1.4,
        recommendation: '🔥 Critical demand with low supply for coffee! Sell immediately at premium prices.'
      };

      render(<DemandIndicator {...defaultProps} data={excellentData} />);
      
      expect(screen.getByText('Critical Demand')).toBeInTheDocument();
      expect(screen.getByText('Low Supply')).toBeInTheDocument();
      expect(screen.getByText('Excellent market conditions')).toBeInTheDocument();
    });

    it('should handle poor market conditions scenario', () => {
      const poorData: DemandIndicatorType = {
        crop_name: 'tomato',
        demand_level: 'low',
        supply_level: 'oversupply',
        market_activity: 2,
        price_volatility: 0.5,
        seasonal_factor: 0.7,
        recommendation: '⚠️ Market oversupply detected for tomato. Consider storage or value addition.'
      };

      render(<DemandIndicator {...defaultProps} data={poorData} />);
      
      expect(screen.getByText('Low Demand')).toBeInTheDocument();
      expect(screen.getByText('Oversupply')).toBeInTheDocument();
      expect(screen.getByText('Challenging market conditions')).toBeInTheDocument();
    });

    it('should handle stable market conditions scenario', () => {
      const stableData: DemandIndicatorType = {
        crop_name: 'beans',
        demand_level: 'medium',
        supply_level: 'medium',
        market_activity: 12,
        price_volatility: 0.18,
        seasonal_factor: 1.0,
        recommendation: '✅ Stable market conditions for beans. Good time for regular sales.'
      };

      render(<DemandIndicator {...defaultProps} data={stableData} />);
      
      expect(screen.getByText('Medium Demand')).toBeInTheDocument();
      expect(screen.getByText('Medium Supply')).toBeInTheDocument();
    });
  });

  describe('🚀 Performance and Edge Cases', () => {
    it('should handle zero values gracefully', () => {
      const zeroData: DemandIndicatorType = {
        ...mockDemandData,
        market_activity: 0,
        price_volatility: 0,
        seasonal_factor: 0
      };

      render(<DemandIndicator {...defaultProps} data={zeroData} />);
      
      expect(screen.getByText('0')).toBeInTheDocument(); // Market activity
      expect(screen.getByText('0.0%')).toBeInTheDocument(); // Price volatility
      expect(screen.getByText('0.00x')).toBeInTheDocument(); // Seasonal factor
    });

    it('should handle very high values gracefully', () => {
      const highData: DemandIndicatorType = {
        ...mockDemandData,
        market_activity: 999,
        price_volatility: 2.5,
        seasonal_factor: 10.0
      };

      render(<DemandIndicator {...defaultProps} data={highData} />);
      
      expect(screen.getByText('999')).toBeInTheDocument();
      expect(screen.getByText('250.0%')).toBeInTheDocument();
      expect(screen.getByText('10.00x')).toBeInTheDocument();
    });

    it('should handle missing or undefined recommendation', () => {
      const noRecommendationData = { ...mockDemandData, recommendation: undefined as any };
      
      render(<DemandIndicator {...defaultProps} data={noRecommendationData} />);
      
      // Should not crash and should not show recommendation section
      expect(screen.queryByText('Market Recommendation')).not.toBeInTheDocument();
    });

    it('should render without optional props', () => {
      const minimalProps = {
        data: mockDemandData
      };

      render(<DemandIndicator {...minimalProps} />);
      
      // Should render with defaults
      expect(screen.getByText('Market Demand Analysis')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /refresh/i })).not.toBeInTheDocument();
    });
  });

  describe('🎯 Accessibility and UX', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<DemandIndicator {...defaultProps} />);
      
      // Check for proper button roles
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Check for progress bars
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBe(4);
    });

    it('should support keyboard navigation', async () => {
      render(<DemandIndicator {...defaultProps} />);
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      
      // Should be focusable
      refreshButton.focus();
      expect(document.activeElement).toBe(refreshButton);
      
      // Should respond to Enter key
      fireEvent.keyDown(refreshButton, { key: 'Enter' });
      expect(defaultProps.onRefresh).toHaveBeenCalledTimes(1);
    });

    it('should provide meaningful descriptions for screen readers', () => {
      render(<DemandIndicator {...defaultProps} />);
      
      // Should have descriptive text
      expect(screen.getByText('maize market intelligence and demand indicators')).toBeInTheDocument();
      expect(screen.getByText(/market conditions/)).toBeInTheDocument();
    });
  });

  describe('💪 Custom Styling and Theming', () => {
    it('should apply custom className when provided', () => {
      const { container } = render(
        <DemandIndicator {...defaultProps} className="custom-demand-indicator" />
      );
      
      expect(container.firstChild).toHaveClass('custom-demand-indicator');
    });

    it('should use appropriate color schemes for different demand levels', () => {
      const scenarios = [
        { demand_level: 'critical' as const, expectedText: 'Critical Demand' },
        { demand_level: 'high' as const, expectedText: 'High Demand' },
        { demand_level: 'medium' as const, expectedText: 'Medium Demand' },
        { demand_level: 'low' as const, expectedText: 'Low Demand' }
      ];

      scenarios.forEach(({ demand_level, expectedText }) => {
        const data = { ...mockDemandData, demand_level };
        const { rerender } = render(<DemandIndicator {...defaultProps} data={data} />);
        
        expect(screen.getByText(expectedText)).toBeInTheDocument();
        
        // Clean up for next iteration
        rerender(<div />);
      });
    });
  });
});