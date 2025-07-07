import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoadingSkeleton, LoadingIndicator, RetryButton, ErrorBoundary } from '@/components/ui/loading';
import { performanceService } from '@/services/performance';

// Mock performance service
vi.mock('@/services/performance', () => ({
  performanceService: {
    retry: vi.fn().mockResolvedValue(true),
    getErrorDetails: vi.fn().mockReturnValue('Network error'),
    clearError: vi.fn()
  }
}));

describe('Loading Components', () => {
  describe('LoadingSkeleton', () => {
    it('renders card variant with correct structure', () => {
      render(<LoadingSkeleton variant="card" />);
      expect(screen.getByRole('img', { name: /loading/i })).toBeInTheDocument();
      expect(screen.getAllByRole('img', { name: /loading/i })).toHaveLength(3);
    });

    it('renders list variant with correct number of items', () => {
      render(<LoadingSkeleton variant="list" count={4} />);
      expect(screen.getAllByRole('img', { name: /loading/i })).toHaveLength(4);
    });

    it('renders table variant with correct structure', () => {
      render(<LoadingSkeleton variant="table" />);
      expect(screen.getAllByRole('img', { name: /loading/i })).toHaveLength(3);
    });

    it('renders grid variant with correct layout', () => {
      render(<LoadingSkeleton variant="grid" />);
      expect(screen.getAllByRole('img', { name: /loading/i })).toHaveLength(4);
    });

    it('handles invalid variant gracefully', () => {
      render(<LoadingSkeleton variant="invalid" />);
      expect(screen.getByRole('img', { name: /loading/i })).toBeInTheDocument();
    });

    it('supports custom className', () => {
      render(<LoadingSkeleton variant="card" className="mt-4" />);
      expect(screen.getByRole('img', { name: /loading/i })).toHaveClass('mt-4');
    });

    it('supports custom skeleton size', () => {
      render(<LoadingSkeleton variant="card" skeletonSize="lg" />);
      expect(screen.getByRole('img', { name: /loading/i })).toHaveClass('h-12');
    });
  });

  describe('LoadingIndicator', () => {
    it('renders with default message', () => {
      render(<LoadingIndicator />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('accepts custom message', () => {
      render(<LoadingIndicator message="Fetching data..." />);
      expect(screen.getByText('Fetching data...')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      render(<LoadingIndicator className="mt-4" />);
      expect(screen.getByRole('status')).toHaveClass('mt-4');
    });

    it('supports different sizes', () => {
      render(<LoadingIndicator size="lg" />);
      expect(screen.getByRole('status')).toHaveClass('h-12');
    });

    it('supports different colors', () => {
      render(<LoadingIndicator color="secondary" />);
      expect(screen.getByRole('status')).toHaveClass('border-secondary');
    });
  });

  describe('RetryButton', () => {
    it('renders with correct text', () => {
      render(<RetryButton />);
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('calls retry function on click', async () => {
      const retryFn = vi.fn();
      render(<RetryButton retry={retryFn} />);
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(retryFn).toHaveBeenCalled();
    });

    it('shows loading state during retry', async () => {
      const retryFn = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      render(<RetryButton retry={retryFn} />);
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(screen.getByRole('button', { name: /retrying/i })).toBeInTheDocument();
    });

    it('handles retry errors gracefully', async () => {
      const retryFn = vi.fn().mockRejectedValue(new Error('Retry failed'));
      render(<RetryButton retry={retryFn} />);
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(screen.getByText('Retry failed')).toBeInTheDocument();
    });

    it('supports custom retry text', () => {
      render(<RetryButton retryText="Try again" />);
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe('ErrorBoundary', () => {
    it('renders children when no error', () => {
      const TestComponent = () => <div>Test</div>;
      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('shows error UI when error occurs', () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
        return null;
      };
      render(
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>
      );
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('shows retry button when error occurs', () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
        return null;
      };
      render(
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>
      );
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('calls retry function when retry button is clicked', async () => {
      const retryFn = vi.fn();
      const ErrorComponent = () => {
        throw new Error('Test error');
        return null;
      };
      render(
        <ErrorBoundary onRetry={retryFn}>
          <ErrorComponent />
        </ErrorBoundary>
      );
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(retryFn).toHaveBeenCalled();
    });

    it('shows custom error message when provided', () => {
      const ErrorComponent = () => {
        throw new Error('Custom error');
        return null;
      };
      render(
        <ErrorBoundary errorText="Something unexpected happened">
          <ErrorComponent />
        </ErrorBoundary>
      );
      expect(screen.getByText('Something unexpected happened')).toBeInTheDocument();
    });

    it('handles multiple nested errors', () => {
      const ErrorComponent = () => {
        throw new Error('Nested error');
        return null;
      };
      render(
        <ErrorBoundary>
          <ErrorBoundary>
            <ErrorComponent />
          </ErrorBoundary>
        </ErrorBoundary>
      );
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('resets error state after successful retry', async () => {
      const retryFn = vi.fn().mockResolvedValue(true);
      const ErrorComponent = () => {
        throw new Error('Test error');
        return null;
      };
      render(
        <ErrorBoundary onRetry={retryFn}>
          <ErrorComponent />
        </ErrorBoundary>
      );
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      await waitFor(() => {
        expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
      });
    });
  });
});
