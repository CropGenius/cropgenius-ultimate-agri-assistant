import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  LoadingSkeleton,
  LoadingIndicator,
  RetryButton,
  ErrorBoundary
} from '@/components/ui/loading/loadingUtils';

// Mock utilities
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div className={className}>Skeleton</div>
  )
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

describe('Loading Components', () => {
  let originalTimeout: number;

  beforeEach(() => {
    originalTimeout = global.setTimeout as unknown as number;
    global.setTimeout = vi.fn();
  });

  afterEach(() => {
    global.setTimeout = originalTimeout;
    vi.clearAllMocks();
  });

  describe('LoadingSkeleton', () => {
    it('renders card variant with correct structure', () => {
      render(<LoadingSkeleton variant="card" count={1} />);
      
      expect(screen.getAllByText('Skeleton')).toHaveLength(3);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('renders list variant with correct count', () => {
      render(<LoadingSkeleton variant="list" count={2} />);
      
      const skeletons = screen.getAllByText('Skeleton');
      expect(skeletons).toHaveLength(6); // 2 items x 3 elements each
    });

    it('applies custom className', () => {
      render(<LoadingSkeleton className="custom-class" count={1} />);
      
      const skeleton = screen.getByText('Skeleton');
      expect(skeleton.parentElement).toHaveClass('custom-class');
    });

    it('animates correctly', () => {
      render(<LoadingSkeleton count={1} />);
      
      const skeleton = screen.getByText('Skeleton');
      expect(skeleton.parentElement).toHaveClass('animate-pulse');
    });
  });

  describe('LoadingIndicator', () => {
    it('renders with default message', () => {
      render(<LoadingIndicator />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders custom message', () => {
      render(<LoadingIndicator message="Fetching data..." />);
      
      expect(screen.getByText('Fetching data...')).toBeInTheDocument();
    });

    it('renders spinner', () => {
      render(<LoadingIndicator />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('applies custom className', () => {
      render(<LoadingIndicator className="custom-class" />);
      
      const spinner = screen.getByRole('status');
      expect(spinner.parentElement).toHaveClass('custom-class');
    });
  });

  describe('RetryButton', () => {
    it('renders correctly', () => {
      const onRetry = vi.fn();
      render(<RetryButton onRetry={onRetry} />);
      
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('calls onRetry when clicked', () => {
      const onRetry = vi.fn();
      render(<RetryButton onRetry={onRetry} />);
      
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(onRetry).toHaveBeenCalled();
    });

    it('applies custom className', () => {
      const onRetry = vi.fn();
      render(<RetryButton className="custom-class" onRetry={onRetry} />);
      
      const button = screen.getByRole('button', { name: /retry/i });
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('ErrorBoundary', () => {
    it('renders children when no error', () => {
      render(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders fallback when error occurs', () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
        return null;
      };

      render(
        <ErrorBoundary fallback={<div>Error Fallback</div>}>
          <ErrorComponent />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Error Fallback')).toBeInTheDocument();
    });

    it('handles error event', () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
        return null;
      };

      const errorSpy = vi.spyOn(window, 'addEventListener');
      
      render(
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>
      );
      
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
