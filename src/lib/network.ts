import { AppError, ErrorCode, reportError, reportInfo } from './errors';
import { APP_CONFIG } from './config';

export interface NetworkState {
  isOnline: boolean;
  isSlowConnection: boolean;
  lastConnectedAt: Date | null;
  connectionType: 'wifi' | '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
}

export interface QueuedOperation {
  id: string;
  operation: () => Promise<any>;
  retries: number;
  maxRetries: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

class NetworkManager {
  private state: NetworkState = {
    isOnline: navigator.onLine,
    isSlowConnection: false,
    lastConnectedAt: navigator.onLine ? new Date() : null,
    connectionType: 'unknown',
  };

  private listeners: ((state: NetworkState) => void)[] = [];
  private operationQueue: QueuedOperation[] = [];
  private isProcessingQueue = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Monitor online/offline status
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Monitor connection speed
    this.detectConnectionSpeed();
    
    // Process queue periodically
    setInterval(() => {
      if (this.state.isOnline && !this.isProcessingQueue) {
        this.processQueue();
      }
    }, 5000);
  }

  private handleOnline = (): void => {
    this.state = {
      ...this.state,
      isOnline: true,
      lastConnectedAt: new Date(),
    };
    reportInfo('Network connection restored');
    this.notifyListeners();
    this.processQueue();
  };

  private handleOffline = (): void => {
    this.state = {
      ...this.state,
      isOnline: false,
    };
    reportInfo('Network connection lost - entering offline mode');
    this.notifyListeners();
  };

  private detectConnectionSpeed(): void {
    // Properly typed NetworkInformation interface
    interface NetworkInformation extends EventTarget {
      effectiveType: '4g' | '3g' | '2g' | 'slow-2g';
      downlink: number;
      rtt: number;
      addEventListener(type: 'change', listener: () => void): void;
    }
    
    interface NavigatorWithConnection extends Navigator {
      connection?: NetworkInformation;
      mozConnection?: NetworkInformation;
      webkitConnection?: NetworkInformation;
    }
    
    const connection = (navigator as NavigatorWithConnection).connection || 
                      (navigator as NavigatorWithConnection).mozConnection || 
                      (navigator as NavigatorWithConnection).webkitConnection;
    
    if (connection) {
      const updateConnectionInfo = () => {
        const effectiveType = connection.effectiveType;
        this.state = {
          ...this.state,
          connectionType: effectiveType || 'unknown',
          isSlowConnection: ['slow-2g', '2g'].includes(effectiveType),
        };
        this.notifyListeners();
      };

      connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  public subscribe(listener: (state: NetworkState) => void): () => void {
    this.listeners.push(listener);
    // Immediately notify with current state
    listener(this.state);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getState(): NetworkState {
    return { ...this.state };
  }

  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: {
      retries?: number;
      priority?: 'low' | 'medium' | 'high';
      offlineQueue?: boolean;
    } = {}
  ): Promise<T> {
    const {
      retries = APP_CONFIG.performance.maxRetries,
      priority = 'medium',
      offlineQueue = true,
    } = options;

    if (!this.state.isOnline) {
      if (offlineQueue) {
        return this.queueOperation(operation, retries, priority);
      } else {
        throw new AppError(
          ErrorCode.NETWORK_OFFLINE,
          'Operation requires internet connection',
          'You are offline. Please check your internet connection.',
          { offlineQueue },
          true
        );
      }
    }

    return this.executeWithRetryLogic(operation, retries);
  }

  private async executeWithRetryLogic<T>(
    operation: () => Promise<T>,
    retriesLeft: number
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retriesLeft > 0) {
        const delay = APP_CONFIG.performance.retryDelay * (APP_CONFIG.performance.maxRetries - retriesLeft + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetryLogic(operation, retriesLeft - 1);
      }
      
      const appError = error instanceof AppError 
        ? error 
        : AppError.fromError(error as Error, ErrorCode.NETWORK_FAILED);
      
      reportError(appError);
      throw appError;
    }
  }

  private queueOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number,
    priority: 'low' | 'medium' | 'high'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const queuedOp: QueuedOperation = {
        id: crypto.randomUUID(),
        operation: async () => {
          try {
            const result = await operation();
            resolve(result);
            return result;
          } catch (error) {
            reject(error);
            throw error;
          }
        },
        retries: 0,
        maxRetries,
        priority,
        createdAt: new Date(),
      };

      // Insert based on priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const insertIndex = this.operationQueue.findIndex(
        op => priorityOrder[op.priority] > priorityOrder[priority]
      );
      
      if (insertIndex === -1) {
        this.operationQueue.push(queuedOp);
      } else {
        this.operationQueue.splice(insertIndex, 0, queuedOp);
      }

      reportInfo(`Operation queued for offline execution (${this.operationQueue.length} pending)`);
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.operationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    reportInfo(`Processing ${this.operationQueue.length} queued operations`);

    while (this.operationQueue.length > 0 && this.state.isOnline) {
      const operation = this.operationQueue.shift()!;
      
      try {
        await operation.operation();
        reportInfo(`Queued operation completed: ${operation.id}`);
      } catch (error) {
        operation.retries++;
        
        if (operation.retries < operation.maxRetries) {
          // Re-queue with exponential backoff
          this.operationQueue.unshift(operation);
          await new Promise(resolve => 
            setTimeout(resolve, 1000 * Math.pow(2, operation.retries))
          );
        } else {
          reportError(new AppError(
            ErrorCode.NETWORK_FAILED,
            `Queued operation failed after ${operation.maxRetries} retries`,
            'Some changes could not be synced. Please try again later.',
            { operationId: operation.id, error }
          ));
        }
      }
    }

    this.isProcessingQueue = false;
  }

  public getQueueStatus(): { pending: number; processing: boolean } {
    return {
      pending: this.operationQueue.length,
      processing: this.isProcessingQueue,
    };
  }
}

export const networkManager = new NetworkManager();

// React hooks for easy integration
import React from 'react';

export const useNetworkState = (): NetworkState => {
  const [state, setState] = React.useState<NetworkState>(networkManager.getState());

  React.useEffect(() => {
    return networkManager.subscribe(setState);
  }, []);

  return state;
};