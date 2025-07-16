/**
 * Authentication Logger Utility
 * Provides structured logging for authentication events, errors, and debugging
 */

export interface AuthLogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  event: string;
  userId?: string;
  sessionId?: string;
  context: {
    url: string;
    userAgent: string;
    redirectCount?: number;
    errorCode?: string;
    retryAttempt?: number;
    [key: string]: any;
  };
}

export interface AuthError {
  code: string;
  message: string;
  userMessage: string;
  context: Record<string, any>;
  timestamp: number;
  retryable: boolean;
}

export class AuthLogger {
  private static instance: AuthLogger;
  private logs: AuthLogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 log entries
  private isDevelopment = import.meta.env.DEV;

  private constructor() {}

  static getInstance(): AuthLogger {
    if (!AuthLogger.instance) {
      AuthLogger.instance = new AuthLogger();
    }
    return AuthLogger.instance;
  }

  /**
   * Log a general authentication event
   */
  logAuthEvent(
    event: string, 
    level: AuthLogEntry['level'] = 'info',
    context: Partial<AuthLogEntry['context']> = {}
  ): void {
    const entry: AuthLogEntry = {
      timestamp: Date.now(),
      level,
      event,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      }
    };

    this.addLogEntry(entry);
    
    // Console logging in development
    if (this.isDevelopment) {
      const logMethod = level === 'error' ? console.error : 
                      level === 'warn' ? console.warn : 
                      level === 'debug' ? console.debug : console.log;
      
      logMethod(`[Auth ${level.toUpperCase()}] ${event}`, entry.context);
    }
  }

  /**
   * Log authentication errors with structured data
   */
  logAuthError(error: AuthError): void {
    const entry: AuthLogEntry = {
      timestamp: error.timestamp,
      level: 'error',
      event: `AUTH_ERROR: ${error.code}`,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        errorCode: error.code,
        message: error.message,
        userMessage: error.userMessage,
        retryable: error.retryable,
        ...error.context
      }
    };

    this.addLogEntry(entry);
    
    if (this.isDevelopment) {
      console.error(`[Auth ERROR] ${error.code}: ${error.message}`, {
        userMessage: error.userMessage,
        retryable: error.retryable,
        context: error.context
      });
    }
  }

  /**
   * Log redirect loop detection
   */
  logRedirectLoop(redirectCount: number, originalPath: string): void {
    this.logAuthEvent(
      'REDIRECT_LOOP_DETECTED',
      'error',
      {
        redirectCount,
        originalPath,
        action: 'Breaking redirect loop'
      }
    );
  }

  /**
   * Log OAuth callback processing
   */
  logOAuthCallback(
    provider: string,
    success: boolean,
    error?: string,
    retryAttempt?: number
  ): void {
    this.logAuthEvent(
      `OAUTH_CALLBACK_${success ? 'SUCCESS' : 'FAILURE'}`,
      success ? 'info' : 'error',
      {
        provider,
        error,
        retryAttempt
      }
    );
  }

  /**
   * Log session operations
   */
  logSessionOperation(
    operation: 'CREATE' | 'REFRESH' | 'VALIDATE' | 'DESTROY',
    success: boolean,
    userId?: string,
    error?: string
  ): void {
    this.logAuthEvent(
      `SESSION_${operation}_${success ? 'SUCCESS' : 'FAILURE'}`,
      success ? 'info' : 'warn',
      {
        operation,
        userId,
        error
      }
    );
  }

  /**
   * Log development bypass usage
   */
  logDevBypass(enabled: boolean, reason?: string): void {
    this.logAuthEvent(
      'DEV_BYPASS_USED',
      'warn',
      {
        enabled,
        reason,
        environment: import.meta.env.MODE
      }
    );
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(count: number = 50): AuthLogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: AuthLogEntry['level']): AuthLogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  private addLogEntry(entry: AuthLogEntry): void {
    this.logs.push(entry);
    
    // Trim logs if we exceed max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }
}

// Export singleton instance
export const authLogger = AuthLogger.getInstance();