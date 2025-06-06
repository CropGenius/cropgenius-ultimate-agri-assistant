import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { diagnostics } from '@/core/services/diagnosticService';

interface Props {
  children: ReactNode;
  fieldId?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class FieldErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our error tracking service
    console.error('FieldErrorBoundary caught an error:', error, errorInfo);

    // Log to error tracking service
    diagnostics.logError(error, {
      component: 'FieldErrorBoundary',
      fieldId: this.props.fieldId,
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
    });

    this.setState({ error, errorInfo });
  }

  handleRetry = (): void => {
    if (this.props.onRetry) {
      this.props.onRetry();
    }

    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>
                An error occurred while loading this field's data. Please try
                again.
              </p>
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleRetry}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer font-medium">
                    Error details
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded overflow-auto text-xs">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

// Helper component for function components
export const withFieldErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: { fieldId?: string } = {}
): React.FC<P> => {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithErrorBoundary: React.FC<P> = (props) => (
    <FieldErrorBoundary fieldId={options.fieldId}>
      <WrappedComponent {...props} />
    </FieldErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withFieldErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
};

export default FieldErrorBoundary;
