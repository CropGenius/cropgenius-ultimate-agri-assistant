import React from 'react';
import { Skeleton } from '../skeleton';

export interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'table' | 'grid';
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  count = 3,
  className = ''
}) => {
  const variants = {
    card: (
      <div className={`space-y-4 ${className}`} role="status">
        <Skeleton className="h-4 w-1/3" role="img" aria-label="Loading" />
        <Skeleton className="h-6 w-3/4" role="img" aria-label="Loading" />
        <Skeleton className="h-8 w-full" role="img" aria-label="Loading" />
      </div>
    ),
    list: (
      <div className={`space-y-2 ${className}`} role="status">
        <Skeleton className="h-8 w-full" role="img" aria-label="Loading" />
        <Skeleton className="h-8 w-full" role="img" aria-label="Loading" />
        <Skeleton className="h-8 w-full" role="img" aria-label="Loading" />
      </div>
    ),
    table: (
      <div className={`space-y-2 ${className}`} role="status">
        <Skeleton className="h-12 w-full" role="img" aria-label="Loading" />
        <Skeleton className="h-12 w-full" role="img" aria-label="Loading" />
        <Skeleton className="h-12 w-full" role="img" aria-label="Loading" />
      </div>
    ),
    grid: (
      <div className={`grid grid-cols-2 gap-4 ${className}`} role="status">
        <Skeleton className="h-24 w-full" role="img" aria-label="Loading" />
        <Skeleton className="h-24 w-full" role="img" aria-label="Loading" />
        <Skeleton className="h-24 w-full" role="img" aria-label="Loading" />
        <Skeleton className="h-24 w-full" role="img" aria-label="Loading" />
      </div>
    )
  };

  return (
    <div className="space-y-4" role="status">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse">
          {variants[variant]}
        </div>
      ))}
    </div>
  );
};

export interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Loading...',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`} role="status">
      <div 
        className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" 
        role="img" 
        aria-label="Loading"
      />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

export interface RetryButtonProps {
  onRetry: () => void;
  className?: string;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  className = ''
}) => {
  return (
    <button
      onClick={onRetry}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${className}`}
    >
      Retry
    </button>
  );
};

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback = <div>Error occurred</div>
}) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = () => {
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return fallback;
  }

  return <>{children}</>;
};
