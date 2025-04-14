/**
 * CropGenius Diagnostic Service
 * Provides error tracking, health monitoring, and debugging tools
 */

// Types
interface ErrorLogEntry {
  timestamp: string;
  message: string;
  stack?: string;
  component?: string;
  context?: Record<string, any>;
}

interface ComponentHealth {
  component: string;
  status: 'healthy' | 'degraded' | 'error';
  lastChecked: string;
  error?: string;
}

interface OperationLog {
  operation: string;
  status: 'success' | 'error';
  timestamp: string;
  payload?: any;
  error?: string;
  duration?: number;
}

// Singleton instance
class DiagnosticService {
  private static instance: DiagnosticService;
  private errorLog: ErrorLogEntry[] = [];
  private componentHealth: Map<string, ComponentHealth> = new Map();
  private operationLog: OperationLog[] = [];
  private devMode: boolean = import.meta.env.DEV || localStorage.getItem('DEV_MODE') === 'true';

  private constructor() {
    // Load persisted error log if available
    try {
      const savedLog = localStorage.getItem('cropgenius_error_log');
      if (savedLog) {
        this.errorLog = JSON.parse(savedLog);
      }
    } catch (e) {
      console.error('Failed to load error log from storage');
    }

    // Report service initialized
    console.log('✅ [DiagnosticService] Initialized');
  }

  public static getInstance(): DiagnosticService {
    if (!DiagnosticService.instance) {
      DiagnosticService.instance = new DiagnosticService();
    }
    return DiagnosticService.instance;
  }

  // ------------- ERROR TRACKING -------------

  public logError(error: Error, context?: Record<string, any>): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context
    };

    this.errorLog.push(entry);
    
    // Keep log size reasonable
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }

    // Persist to localStorage
    this.persistErrorLog();

    // Log to console in dev mode
    if (this.devMode) {
      console.error(`❌ [DiagnosticService] Error logged:`, error);
    }
  }

  private persistErrorLog(): void {
    try {
      // Only keep 10 most recent errors in localStorage
      const recentErrors = this.errorLog.slice(-10);
      localStorage.setItem('cropgenius_error_log', JSON.stringify(recentErrors));
    } catch (e) {
      // Silent catch
    }
  }

  public getErrorLog(): ErrorLogEntry[] {
    return [...this.errorLog];
  }

  public clearErrorLog(): void {
    this.errorLog = [];
    localStorage.removeItem('cropgenius_error_log');
  }

  // ------------- COMPONENT HEALTH -------------

  public reportComponentMount(component: string): void {
    this.componentHealth.set(component, {
      component,
      status: 'healthy',
      lastChecked: new Date().toISOString()
    });

    if (this.devMode) {
      console.log(`✅ [${component}] Component mounted successfully`);
    }
  }

  public reportComponentError(component: string, error: Error | string): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    this.componentHealth.set(component, {
      component,
      status: 'error',
      lastChecked: new Date().toISOString(),
      error: errorMessage
    });

    console.error(`❌ [${component}] Error:`, error);
  }

  public getComponentHealth(): ComponentHealth[] {
    return Array.from(this.componentHealth.values());
  }

  // ------------- OPERATION LOGGING -------------

  public logOperation(
    operation: string, 
    status: 'success' | 'error', 
    details: { payload?: any, error?: string, duration?: number } = {}
  ): void {
    const entry: OperationLog = {
      operation,
      status,
      timestamp: new Date().toISOString(),
      ...details
    };

    this.operationLog.push(entry);
    
    // Keep log size reasonable
    if (this.operationLog.length > 100) {
      this.operationLog.shift();
    }

    // Log to console in dev mode
    if (this.devMode) {
      if (status === 'success') {
        console.log(`✅ [Operation] ${operation} completed successfully`, details.payload || '');
      } else {
        console.error(`❌ [Operation] ${operation} failed:`, details.error || '');
      }
    }
  }

  public getOperationLog(): OperationLog[] {
    return [...this.operationLog];
  }

  public clearOperationLog(): void {
    this.operationLog = [];
  }

  // ------------- HEALTH CHECK -------------
  
  public runSystemHealthCheck(): Record<string, any> {
    console.log('🔍 [DiagnosticService] Running system health check...');
    
    const report = {
      timestamp: new Date().toISOString(),
      session: {
        active: !!localStorage.getItem('sb-supabase-auth-token'),
        userAgent: navigator.userAgent,
      },
      storage: {
        localStorageAvailable: this.checkLocalStorage(),
        indexedDBAvailable: this.checkIndexedDB(),
      },
      network: {
        online: navigator.onLine,
      },
      errors: {
        count: this.errorLog.length,
        recent: this.errorLog.slice(-3)
      },
      components: {
        total: this.componentHealth.size,
        errorCount: Array.from(this.componentHealth.values())
          .filter(c => c.status === 'error').length
      }
    };
    
    console.log('✅ [DiagnosticService] Health check complete:', report);
    
    return report;
  }

  private checkLocalStorage(): boolean {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }

  private checkIndexedDB(): boolean {
    return !!window.indexedDB;
  }

  // ------------- DEVELOPMENT HELPERS -------------

  public enableDevMode(): void {
    this.devMode = true;
    localStorage.setItem('DEV_MODE', 'true');
    console.log('🔧 [DiagnosticService] Developer mode enabled');
  }

  public disableDevMode(): void {
    this.devMode = false;
    localStorage.removeItem('DEV_MODE');
    console.log('🔧 [DiagnosticService] Developer mode disabled');
  }

  public isDevMode(): boolean {
    return this.devMode;
  }
}

// Export singleton instance
export const diagnostics = DiagnosticService.getInstance();

// Attach to window for debugging
declare global {
  interface Window {
    debug: () => Record<string, any>;
    diagnostics: typeof diagnostics;
  }
}

// Add global debug methods
window.debug = () => diagnostics.runSystemHealthCheck();
window.diagnostics = diagnostics;

export default diagnostics;
