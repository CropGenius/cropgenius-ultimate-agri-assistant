# Loading Components

## Overview

The loading components provide a consistent and accessible way to handle loading states, errors, and retry mechanisms across the application. They are designed to be reusable, customizable, and follow accessibility best practices.

## Components

### LoadingSkeleton

A skeleton loading component that provides visual feedback during data loading states. It supports multiple variants for different UI layouts.

#### Props

```typescript
interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'table' | 'grid';
  count?: number;
  className?: string;
  skeletonSize?: 'sm' | 'md' | 'lg' | 'xl';
}
```

#### Usage Examples

```tsx
// Card variant
<LoadingSkeleton variant="card" />

// List variant with custom count
<LoadingSkeleton variant="list" count={4} />

// With custom className
<LoadingSkeleton variant="card" className="mt-4" />
```

### LoadingIndicator

A loading spinner component with customizable message and styling.

#### Props

```typescript
interface LoadingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'error';
  className?: string;
}
```

#### Usage Examples

```tsx
// Default loading indicator
<LoadingIndicator />

// With custom message
<LoadingIndicator message="Fetching data..." />

// With custom styling
<LoadingIndicator size="lg" color="secondary" className="mt-4" />
```

### RetryButton

A button component that handles retry logic for failed operations.

#### Props

```typescript
interface RetryButtonProps {
  retry: () => Promise<boolean>;
  retryText?: string;
  loadingText?: string;
  className?: string;
}
```

#### Usage Examples

```tsx
// Basic usage
<RetryButton retry={handleRetry} />

// With custom text
<RetryButton retry={handleRetry} retryText="Try again" />

// With custom styling
<RetryButton retry={handleRetry} className="mt-4" />
```

### ErrorBoundary

A React Error Boundary component that catches errors and provides a consistent error UI with retry functionality.

#### Props

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  errorText?: string;
  onRetry?: () => Promise<boolean>;
  className?: string;
}
```

#### Usage Examples

```tsx
// Basic usage
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom error message
<ErrorBoundary errorText="Something unexpected happened">
  <YourComponent />
</ErrorBoundary>

// With retry handler
<ErrorBoundary onRetry={handleRetry}>
  <YourComponent />
</ErrorBoundary>
```

## Best Practices

1. **Accessibility**
   - All loading components use proper ARIA roles and labels
   - Loading states are announced to screen readers
   - Error messages are properly labeled

2. **Performance**
   - Use skeleton loading for initial data fetches
   - Implement retry mechanisms with exponential backoff
   - Cache loading states when appropriate

3. **Error Handling**
   - Wrap critical components with ErrorBoundary
   - Provide clear error messages to users
   - Implement graceful fallbacks

4. **Customization**
   - Use className prop for custom styling
   - Customize loading messages for context
   - Adjust skeleton sizes based on content

## Error States

The ErrorBoundary component supports multiple error states:

1. **Initial Error**
   - Shows error message and retry button
   - Maintains consistent UI
   - Provides feedback during retry

2. **Retry Errors**
   - Shows retry failure message
   - Allows multiple retry attempts
   - Handles network errors gracefully

3. **Nested Errors**
   - Handles multiple nested ErrorBoundaries
   - Prevents error propagation
   - Maintains consistent error UI

## Performance Considerations

1. **Skeleton Loading**
   - Use skeleton loading for initial data fetches
   - Limit skeleton variants to necessary cases
   - Cache skeleton templates when possible

2. **Error Handling**
   - Implement retry with exponential backoff
   - Cache error states to prevent repeated failures
   - Use ErrorBoundary sparingly to avoid unnecessary re-renders

3. **Loading States**
   - Use LoadingIndicator for short operations
   - Implement loading skeletons for longer operations
   - Cache loading states when appropriate

## Troubleshooting

1. **Missing Loading States**
   - Ensure all async operations are wrapped with loading states
   - Use ErrorBoundary for critical components
   - Add loading indicators for user feedback

2. **Stuck Loading States**
   - Implement timeout for loading states
   - Add retry mechanisms
   - Provide clear error messages

3. **Accessibility Issues**
   - Ensure proper ARIA roles and labels
   - Test with screen readers
   - Follow WCAG guidelines

## Migration Guide

When upgrading from previous versions:

1. **Skeleton Loading**
   - Update to use new variant system
   - Add proper ARIA roles
   - Implement loading indicators

2. **Error Handling**
   - Wrap components with ErrorBoundary
   - Implement retry mechanisms
   - Add error messages

3. **Loading States**
   - Use LoadingIndicator for spinners
   - Implement skeleton loading
   - Add proper loading states

## Examples

### Basic Usage

```tsx
// Component with loading state
const MyComponent = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const result = await fetch('/api/data');
      setData(result);
    } catch (err) {
      setError(err);
    }
  };

  if (error) {
    return (
      <ErrorBoundary errorText="Failed to load data" onRetry={fetchData}>
        <div>Failed to load data</div>
      </ErrorBoundary>
    );
  }

  if (!data) {
    return <LoadingSkeleton variant="card" />;
  }

  return (
    <div>
      <LoadingIndicator message="Loading data..." />
      {/* Your content */}
    </div>
  );
};
```

### Advanced Usage

```tsx
// Component with error boundary and retry
const AdvancedComponent = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await fetch('/api/data');
      // Process data
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary errorText="Failed to load data" onRetry={fetchData}>
      {loading ? (
        <LoadingSkeleton variant="list" count={3} />
      ) : error ? (
        <div>Failed to load data</div>
      ) : (
        <div>Your content</div>
      )}
    </ErrorBoundary>
  );
};
``
