/**
 * INFINITY GOD MODE ConfidenceScore Component Tests
 * Comprehensive test suite for AI confidence visualization component
 * Testing disease detection confidence for 100M African farmers! 🚀🔥💪
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfidenceScore } from '../ConfidenceScore';

// Mock UI components
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => children,
  TooltipContent: ({ children }: any) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }: any) => children,
  TooltipTrigger: ({ children }: any) => children
}));

describe('ConfidenceScore Component - INFINITY GOD MODE Tests', () => {
  const defaultProps = {
    confidence: 85.5,
    disease: 'Corn Leaf Blight',
    showDetails: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('🚀 Component Rendering Tests', () => {
    it('should render ConfidenceScore with INFINITY GOD MODE precision', () => {
      render(<ConfidenceScore {...defaultProps} />);
      
      expect(screen.getByText('AI Confidence')).toBeInTheDocument();
      expect(screen.getByText('85.5%')).toBeInTheDocument();
      expect(screen.getByText('Corn Leaf Blight')).toBeInTheDocument();
    });

    it('should display confidence percentage correctly', () => {
      render(<ConfidenceScore confidence={92.3} disease="Tomato Blight" />);
      
      expect(screen.getByText('92.3%')).toBeInTheDocument();
    });

    it('should handle zero confidence gracefully', () => {
      render(<ConfidenceScore confidence={0} disease="Unknown Disease" />);
      
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('should handle 100% confidence correctly', () => {
      render(<ConfidenceScore confidence={100} disease="Perfect Match" />);
      
      expect(screen.getByText('100.0%')).toBeInTheDocument();
    });

    it('should round confidence to one decimal place', () => {
      render(<ConfidenceScore confidence={85.567} disease="Test Disease" />);
      
      expect(screen.getByText('85.6%')).toBeInTheDocument();
    });
  });

  describe('🔥 Confidence Level Indicators', () => {
    it('should show high confidence styling for 80%+', () => {
      render(<ConfidenceScore confidence={90} disease="High Confidence Disease" />);
      
      const confidenceElement = screen.getByText('90.0%');
      expect(confidenceElement).toHaveClass('text-green-600');
      expect(screen.getByText('High Confidence')).toBeInTheDocument();
    });

    it('should show medium confidence styling for 60-79%', () => {
      render(<ConfidenceScore confidence={70} disease="Medium Confidence Disease" />);
      
      const confidenceElement = screen.getByText('70.0%');
      expect(confidenceElement).toHaveClass('text-yellow-600');
      expect(screen.getByText('Medium Confidence')).toBeInTheDocument();
    });

    it('should show low confidence styling for below 60%', () => {
      render(<ConfidenceScore confidence={45} disease="Low Confidence Disease" />);
      
      const confidenceElement = screen.getByText('45.0%');
      expect(confidenceElement).toHaveClass('text-red-600');
      expect(screen.getByText('Low Confidence')).toBeInTheDocument();
    });

    it('should show appropriate confidence badges', () => {
      const { rerender } = render(<ConfidenceScore confidence={95} disease="Test" />);
      expect(screen.getByText('Excellent')).toBeInTheDocument();

      rerender(<ConfidenceScore confidence={75} disease="Test" />);
      expect(screen.getByText('Good')).toBeInTheDocument();

      rerender(<ConfidenceScore confidence={50} disease="Test" />);
      expect(screen.getByText('Uncertain')).toBeInTheDocument();
    });
  });

  describe('💪 Progress Bar Visualization', () => {
    it('should render progress bar with correct width', () => {
      render(<ConfidenceScore confidence={75} disease="Test Disease" />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should show correct progress bar color for different confidence levels', () => {
      const { rerender } = render(<ConfidenceScore confidence={90} disease="Test" />);
      let progressFill = document.querySelector('[data-testid="progress-fill"]');
      expect(progressFill).toHaveClass('bg-green-500');

      rerender(<ConfidenceScore confidence={70} disease="Test" />);
      progressFill = document.querySelector('[data-testid="progress-fill"]');
      expect(progressFill).toHaveClass('bg-yellow-500');

      rerender(<ConfidenceScore confidence={40} disease="Test" />);
      progressFill = document.querySelector('[data-testid="progress-fill"]');
      expect(progressFill).toHaveClass('bg-red-500');
    });

    it('should animate progress bar on mount', () => {
      render(<ConfidenceScore confidence={85} disease="Test Disease" />);
      
      const progressFill = document.querySelector('[data-testid="progress-fill"]');
      expect(progressFill).toHaveClass('transition-all', 'duration-1000');
    });
  });

  describe('🎯 Detailed Information Display', () => {
    it('should show detailed information when showDetails is true', () => {
      render(<ConfidenceScore {...defaultProps} showDetails={true} />);
      
      expect(screen.getByText('Disease Identified')).toBeInTheDocument();
      expect(screen.getByText('Confidence Level')).toBeInTheDocument();
      expect(screen.getByText('AI Analysis')).toBeInTheDocument();
    });

    it('should hide detailed information when showDetails is false', () => {
      render(<ConfidenceScore {...defaultProps} showDetails={false} />);
      
      expect(screen.queryByText('Disease Identified')).not.toBeInTheDocument();
      expect(screen.queryByText('Confidence Level')).not.toBeInTheDocument();
    });

    it('should show confidence interpretation text', () => {
      const { rerender } = render(<ConfidenceScore confidence={95} disease="Test" showDetails={true} />);
      expect(screen.getByText(/very confident/i)).toBeInTheDocument();

      rerender(<ConfidenceScore confidence={70} disease="Test" showDetails={true} />);
      expect(screen.getByText(/moderately confident/i)).toBeInTheDocument();

      rerender(<ConfidenceScore confidence={40} disease="Test" showDetails={true} />);
      expect(screen.getByText(/uncertain/i)).toBeInTheDocument();
    });
  });

  describe('🌟 Tooltip Functionality', () => {
    it('should show tooltip with confidence explanation on hover', async () => {
      render(<ConfidenceScore confidence={85} disease="Test Disease" />);
      
      const confidenceElement = screen.getByText('85.0%');
      await userEvent.hover(confidenceElement);
      
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    });

    it('should show different tooltip content based on confidence level', async () => {
      const { rerender } = render(<ConfidenceScore confidence={95} disease="Test" />);
      
      const confidenceElement = screen.getByText('95.0%');
      await userEvent.hover(confidenceElement);
      
      expect(screen.getByText(/highly accurate/i)).toBeInTheDocument();

      rerender(<ConfidenceScore confidence={50} disease="Test" />);
      const lowConfidenceElement = screen.getByText('50.0%');
      await userEvent.hover(lowConfidenceElement);
      
      expect(screen.getByText(/consider additional analysis/i)).toBeInTheDocument();
    });
  });

  describe('🚀 Interactive Features', () => {
    it('should handle click events on confidence score', async () => {
      const handleClick = vi.fn();
      render(<ConfidenceScore {...defaultProps} onClick={handleClick} />);
      
      const confidenceElement = screen.getByText('85.5%');
      await userEvent.click(confidenceElement);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should show more details button when available', () => {
      render(<ConfidenceScore {...defaultProps} showMoreDetails={true} />);
      
      expect(screen.getByText('View Analysis Details')).toBeInTheDocument();
    });

    it('should handle more details button click', async () => {
      const handleMoreDetails = vi.fn();
      render(<ConfidenceScore {...defaultProps} onMoreDetails={handleMoreDetails} />);
      
      const moreDetailsButton = screen.getByText('View Analysis Details');
      await userEvent.click(moreDetailsButton);
      
      expect(handleMoreDetails).toHaveBeenCalledTimes(1);
    });
  });

  describe('💪 Edge Cases and Error Handling', () => {
    it('should handle negative confidence values', () => {
      render(<ConfidenceScore confidence={-10} disease="Invalid Disease" />);
      
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('should handle confidence values over 100', () => {
      render(<ConfidenceScore confidence={150} disease="Over Confident" />);
      
      expect(screen.getByText('100.0%')).toBeInTheDocument();
    });

    it('should handle undefined disease name', () => {
      render(<ConfidenceScore confidence={85} disease={undefined as any} />);
      
      expect(screen.getByText('Unknown Disease')).toBeInTheDocument();
    });

    it('should handle empty disease name', () => {
      render(<ConfidenceScore confidence={85} disease="" />);
      
      expect(screen.getByText('Unknown Disease')).toBeInTheDocument();
    });

    it('should handle very long disease names', () => {
      const longDiseaseName = 'Very Long Disease Name That Should Be Truncated Properly For Better User Experience';
      render(<ConfidenceScore confidence={85} disease={longDiseaseName} />);
      
      expect(screen.getByText(longDiseaseName)).toBeInTheDocument();
    });
  });

  describe('🎯 Accessibility and UX', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<ConfidenceScore confidence={85} disease="Test Disease" />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'AI confidence level');
      expect(progressBar).toHaveAttribute('aria-describedby');
    });

    it('should support keyboard navigation', async () => {
      const handleClick = vi.fn();
      render(<ConfidenceScore {...defaultProps} onClick={handleClick} />);
      
      const confidenceElement = screen.getByText('85.5%');
      confidenceElement.focus();
      
      expect(document.activeElement).toBe(confidenceElement);
      
      fireEvent.keyDown(confidenceElement, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should provide screen reader friendly descriptions', () => {
      render(<ConfidenceScore confidence={85} disease="Corn Leaf Blight" />);
      
      expect(screen.getByText('AI is 85.5% confident this is Corn Leaf Blight')).toBeInTheDocument();
    });
  });

  describe('🌟 Real-World Farmer Scenarios', () => {
    it('should handle high confidence maize disease detection', () => {
      render(<ConfidenceScore confidence={94.2} disease="Maize Streak Virus" showDetails={true} />);
      
      expect(screen.getByText('94.2%')).toBeInTheDocument();
      expect(screen.getByText('Maize Streak Virus')).toBeInTheDocument();
      expect(screen.getByText('Excellent')).toBeInTheDocument();
      expect(screen.getByText(/very confident/i)).toBeInTheDocument();
    });

    it('should handle uncertain tomato disease detection', () => {
      render(<ConfidenceScore confidence={45.8} disease="Tomato Late Blight" showDetails={true} />);
      
      expect(screen.getByText('45.8%')).toBeInTheDocument();
      expect(screen.getByText('Tomato Late Blight')).toBeInTheDocument();
      expect(screen.getByText('Uncertain')).toBeInTheDocument();
      expect(screen.getByText(/uncertain/i)).toBeInTheDocument();
    });

    it('should handle beans disease with medium confidence', () => {
      render(<ConfidenceScore confidence={72.1} disease="Bean Common Mosaic" showDetails={true} />);
      
      expect(screen.getByText('72.1%')).toBeInTheDocument();
      expect(screen.getByText('Bean Common Mosaic')).toBeInTheDocument();
      expect(screen.getByText('Good')).toBeInTheDocument();
      expect(screen.getByText(/moderately confident/i)).toBeInTheDocument();
    });

    it('should show recommendation based on confidence level', () => {
      const { rerender } = render(<ConfidenceScore confidence={95} disease="Test" showDetails={true} />);
      expect(screen.getByText(/proceed with recommended treatment/i)).toBeInTheDocument();

      rerender(<ConfidenceScore confidence={70} disease="Test" showDetails={true} />);
      expect(screen.getByText(/consider consulting an expert/i)).toBeInTheDocument();

      rerender(<ConfidenceScore confidence={40} disease="Test" showDetails={true} />);
      expect(screen.getByText(/seek professional diagnosis/i)).toBeInTheDocument();
    });
  });

  describe('🚀 Performance and Optimization', () => {
    it('should render quickly for farmer interactions', () => {
      const startTime = performance.now();
      render(<ConfidenceScore confidence={85} disease="Test Disease" />);
      const endTime = performance.now();
      
      // Should render in under 16ms (60fps)
      expect(endTime - startTime).toBeLessThan(16);
    });

    it('should handle rapid confidence updates efficiently', () => {
      const { rerender } = render(<ConfidenceScore confidence={50} disease="Test" />);
      
      // Rapidly update confidence
      for (let i = 50; i <= 90; i += 10) {
        rerender(<ConfidenceScore confidence={i} disease="Test" />);
        expect(screen.getByText(`${i.toFixed(1)}%`)).toBeInTheDocument();
      }
    });
  });

  describe('💪 Custom Styling and Theming', () => {
    it('should apply custom className when provided', () => {
      const { container } = render(
        <ConfidenceScore {...defaultProps} className="custom-confidence-score" />
      );
      
      expect(container.firstChild).toHaveClass('custom-confidence-score');
    });

    it('should support custom color schemes', () => {
      render(
        <ConfidenceScore 
          confidence={85} 
          disease="Test" 
          colorScheme="custom"
          customColors={{
            high: 'bg-blue-500',
            medium: 'bg-purple-500',
            low: 'bg-orange-500'
          }}
        />
      );
      
      const progressFill = document.querySelector('[data-testid="progress-fill"]');
      expect(progressFill).toHaveClass('bg-blue-500');
    });

    it('should support different size variants', () => {
      const { rerender } = render(<ConfidenceScore confidence={85} disease="Test" size="sm" />);
      expect(screen.getByText('85.0%')).toHaveClass('text-sm');

      rerender(<ConfidenceScore confidence={85} disease="Test" size="lg" />);
      expect(screen.getByText('85.0%')).toHaveClass('text-lg');
    });
  });
});