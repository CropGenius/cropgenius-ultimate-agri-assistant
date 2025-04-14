
import { useEffect } from "react";
import { toast } from "sonner";
import { diagnostics } from "@/utils/diagnosticService";

/**
 * Custom hook for component error logging and health reporting
 * Tracks component lifecycle and logs errors automatically
 */
export const useErrorLogging = (
  componentName: string, 
  options: {
    showToasts?: boolean;
    criticalComponent?: boolean;
  } = {}
) => {
  const { showToasts = false, criticalComponent = false } = options;

  useEffect(() => {
    // Log component mount
    diagnostics.reportComponentMount(componentName);
    console.log(`✅ [${componentName}] loaded successfully`);

    // Return cleanup function
    return () => {
      console.log(`🔄 [${componentName}] unmounted`);
    };
  }, [componentName]);

  // Error logging function
  const logError = (error: Error | string, context?: Record<string, any>) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Report to diagnostic service
    diagnostics.reportComponentError(componentName, error);
    
    // Create error object if string was passed
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    // Add additional context
    diagnostics.logError(errorObj, {
      component: componentName,
      ...context
    });

    // Show toast if enabled
    if (showToasts) {
      toast.error(`${componentName} Error`, {
        description: errorMessage.substring(0, 100) // Truncate long messages
      });
    }
    
    // Console log for development
    console.error(`❌ [${componentName}] failed:`, error);
  };

  // Success logging
  const logSuccess = (operation: string, details?: any) => {
    console.log(`✅ [${componentName}] ${operation} successful`, details || '');
    
    diagnostics.logOperation(
      `${componentName}.${operation}`,
      'success',
      { payload: details }
    );
  };

  // Operation tracking
  const trackOperation = <T extends (...args: any[]) => Promise<any>>(
    operationName: string,
    operation: T
  ): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>) => {
    return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
      const startTime = performance.now();
      try {
        const result = await operation(...args);
        const duration = performance.now() - startTime;
        
        logSuccess(operationName, { duration });
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        logError(error as Error, { 
          operation: operationName, 
          duration, 
          args: args.map(arg => 
            typeof arg === 'object' ? 
              (arg === null ? null : Object.keys(arg)) : 
              typeof arg
          )
        });
        throw error;
      }
    };
  };

  return {
    logError,
    logSuccess,
    trackOperation
  };
};
