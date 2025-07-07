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
  backoff: boolean;
  createdAt: Date;
  lastAttempt: Date | null;
}

class NetworkManager {
  private state: NetworkState = {
    isOnline: navigator.onLine,
    isSlowConnection: false,
    lastConnectedAt: navigator.onLine ? new Date() : null,
    connectionType: 'unknown',
  };

  private currentAuthToken: string | null = null;

  private listeners: ((state: NetworkState) => void)[] = [];
  private operationQueue: QueuedOperation[] = [];
  private isProcessingQueue = false;

  // Public methods to get queue status
  public getQueueStatus(): { pending: number; processing: boolean } {
    return {
      pending: this.operationQueue.length,
      processing: this.isProcessingQueue
    };
  }

  // Public method to get current auth token
  public getCurrentAuthToken(): string | null {
    return this.currentAuthToken;
  }

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

  public notifyAuthChange(newToken: string): void {
    this.currentAuthToken = newToken;
    // Notify all listeners about auth token change
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

  public async executeWithRetry(operation: () => Promise<any>, options: {
    retries?: number;
    priority?: 'low' | 'medium' | 'high';
    offlineQueue?: boolean;
    backoff?: boolean;
  } = {}): Promise<any> {
    const id = crypto.randomUUID();
    const maxRetries = options.retries || 3;
    const priority = options.priority || 'medium';
    const offlineQueue = options.offlineQueue || false;
    const useBackoff = options.backoff || false;

    if (!this.state.isOnline && !offlineQueue) {
      throw new AppError(
        ErrorCode.NETWORK_OFFLINE,
        'Cannot execute operation while offline',
        'Please check your internet connection',
        { id, priority },
        true
      );
    }

    const queuedOperation: QueuedOperation = {
      id,
      operation,
      retries: 0,
      maxRetries,
      priority,
      backoff: useBackoff,
      createdAt: new Date(),
      lastAttempt: null,
    };

    if (!this.state.isOnline) {
      this.operationQueue.push(queuedOperation);
      return new Promise((resolve, reject) => {
        const unsubscribe = this.subscribe((state) => {
          if (state.isOnline) {
            unsubscribe();
            this.processQueue()
              .then(resolve)
              .catch(reject);
          }
        });
      });
    }

    return this.processOperation(queuedOperation);
  }

  private async processOperation(operation: QueuedOperation): Promise<any> {
    try {
      // Get the original operation function
      const originalOperation = operation.operation;
      
      // Add auth token to headers
      const headers = new Headers();
      if (this.currentAuthToken) {
        headers.set('Authorization', `Bearer ${this.currentAuthToken}`);
      }

      // Execute operation with headers
      const result = await originalOperation({ headers });
      return result;
    } catch (error) {
      if (operation.retries >= operation.maxRetries) {
        throw error;
      }

      operation.retries++;
      operation.lastAttempt = new Date();

      // Calculate backoff delay if enabled
      const delay = operation.backoff 
        ? Math.min(1000 * Math.pow(2, operation.retries), 30000) // Max 30s delay
        : 0;

      // Add operation back to queue with delay
      setTimeout(() => {
        this.operationQueue.push(operation);
        this.processQueue();
      }, delay);

      throw error;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.operationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      while (this.operationQueue.length > 0) {
        const operation = this.operationQueue.shift();
        if (!operation) {
          break;
        }

        try {
          await this.processOperation(operation);
        } catch (error) {
          reportError(new AppError(
            ErrorCode.NETWORK_FAILED,
            `Queued operation failed after ${operation.maxRetries} retries`,
            'Some changes could not be synced. Please try again later.',
            { operationId: operation.id, error }
          ));
        }
      }
    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      this.isProcessingQueue = false;
      this.notifyListeners();
    }
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

export const useNetworkQueue = (): {
  pending: number;
  processing: boolean;
} => {
  const [status, setStatus] = React.useState({
    pending: 0 as number,
    processing: false as boolean
  });

  React.useEffect(() => {
    const unsubscribe = networkManager.subscribe(() => {
      const queueStatus = networkManager.getQueueStatus();
      setStatus(queueStatus);
    });
    return unsubscribe;
  }, []);

  return status;
};