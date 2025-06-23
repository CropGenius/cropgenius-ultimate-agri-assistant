import React from 'react';
import { render, screen } from '@testing-library/react';
import { YieldBadge } from '../YieldBadge';

describe('YieldBadge', () => {
  it('renders the yield value and unit correctly', () => {
    render(<YieldBadge value={75} unit="kg" />);
    
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();
  });

  it('applies the correct variant class based on yield value', () => {
    // Test low yield (0-40)
    const { rerender } = render(<YieldBadge value={25} unit="kg" />);
    expect(screen.getByText('25').closest('div')).toHaveClass('bg-red-100');
    expect(screen.getByText('25').closest('div')).toHaveClass('text-red-800');

    // Test medium yield (41-70)
    rerender(<YieldBadge value={55} unit="kg" />);
    expect(screen.getByText('55').closest('div')).toHaveClass('bg-yellow-100');
    expect(screen.getByText('55').closest('div')).toHaveClass('text-yellow-800');

    // Test high yield (71-100)
    rerender(<YieldBadge value={85} unit="kg" />);
    expect(screen.getByText('85').closest('div')).toHaveClass('bg-green-100');
    expect(screen.getByText('85').closest('div')).toHaveClass('text-green-800');
  });

  it('handles custom class names', () => {
    const customClass = 'custom-yield-badge';
    render(<YieldBadge value={50} unit="kg" className={customClass} />);
    
    expect(screen.getByText('50').closest('div')).toHaveClass(customClass);
  });

  it('handles different units', () => {
    render(<YieldBadge value={100} unit="tons" />);
    
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('tons')).toBeInTheDocument();
  });

  it('handles edge cases for yield values', () => {
    // Test minimum value (0)
    const { rerender } = render(<YieldBadge value={0} unit="kg" />);
    expect(screen.getByText('0').closest('div')).toHaveClass('bg-red-100');

    // Test maximum value (100)
    rerender(<YieldBadge value={100} unit="kg" />);
    expect(screen.getByText('100').closest('div')).toHaveClass('bg-green-100');

    // Test boundary between low and medium (40)
    rerender(<YieldBadge value={40} unit="kg" />);
    expect(screen.getByText('40').closest('div')).toHaveClass('bg-yellow-100');

    // Test boundary between medium and high (70)
    rerender(<YieldBadge value={70} unit="kg" />);
    expect(screen.getByText('70').closest('div')).toHaveClass('bg-green-100');
  });

  it('applies correct accessibility attributes', () => {
    render(<YieldBadge value={75} unit="kg" aria-label="Yield indicator" />);
    
    const badge = screen.getByText('75').closest('div');
    expect(badge).toHaveAttribute('aria-label', 'Yield indicator');
    expect(badge).toHaveAttribute('role', 'status');
  });

  it('renders the correct icon based on yield level', () => {
    // Low yield should show a down arrow
    const { rerender } = render(<YieldBadge value={30} unit="kg" showTrend />);
    expect(screen.getByTestId('trend-down-icon')).toBeInTheDocument();

    // Medium yield should show a right arrow
    rerender(<YieldBadge value={55} unit="kg" showTrend />);
    expect(screen.getByTestId('trend-right-icon')).toBeInTheDocument();

    // High yield should show an up arrow
    rerender(<YieldBadge value={80} unit="kg" showTrend />);
    expect(screen.getByTestId('trend-up-icon')).toBeInTheDocument();
  });

  it('hides the trend icon when showTrend is false', () => {
    render(<YieldBadge value={75} unit="kg" showTrend={false} />);
    
    expect(screen.queryByTestId('trend-up-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('trend-right-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('trend-down-icon')).not.toBeInTheDocument();
  });
});
