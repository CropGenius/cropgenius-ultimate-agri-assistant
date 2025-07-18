// 🚀 CROPGENIUS INFINITY IQ AUTHENTICATION DEBUGGER
// Production-ready debugging system for 100M farmers - UNLEASH THE SUN! 🔥

import { supabase, SupabaseManager } from '@/integrations/supabase/client';
import { AuthErrorType, CropGeniusAuthError } from '@/services/AuthenticationService';
import { Session, User } from '@supabase/supabase-js';

// 🌟 DEBUG LEVELS
export enum DebugLevel {
  SILENT = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  VERBOSE = 5
}

// 🔥 AUTHENTICATION EVENT TYPES
export enum AuthEventType {
  INITIALIZATION = 'INITIALIZATION',
  SESSION_CHECK = 'SESSION_CHECK',
  SIGN_IN_START = 'SIGN_IN_START',
  SIGN_IN_SUCCESS = 'SIGN_IN_SUCCESS',
  SIGN_IN_ERROR = 'SIGN_IN_ERROR',
  SIGN_OUT_START = 'SIGN_OUT_START',
  SIGN_OUT_SUCCESS = 'SIGN_OUT_SUCCESS',
  SIGN_OUT_ERROR = 'SIGN_OUT_ERROR',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  PROFILE_LOAD = 'PROFILE_LOAD',
  OAUTH_REDIRECT = 'OAUTH_REDIRECT',
  OAUTH_CALLBACK = 'OAUTH_CALLBACK',
  ERROR_BOUNDARY = 'ERROR_BOUNDARY',
  HEALTH_CHECK = 'HEALTH_CHECK',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR'
}

// 💪 DEBUG EVENT INTERFACE
export interface AuthDebugEvent {
  id: string;
  timestamp: string;
  type: AuthEventType;
  level: DebugLevel;
  message: string;
  data?: any;
  error?: Error | CropGeniusAuthError;
  userId?: string;
  sessionId?: string;
  instanceId: string;
  url?: string;
  userAgent?: string;
  performance?: {
    startTime: number;
    endTime?: number;
    duration?: number;
  };
}

// 🚀 SYSTEM HEALTH METRICS
export interface AuthSystemHealth {
  status: 'healthy' | 'degraded' | 'critical' | 'unknown';
  lastCheck: string;
  metrics: {
    totalEvents: number;
    errorRate: number;
    averageResponseTime: number;
    successfulSignIns: number;
    failedSignIns: number;
    sessionRefreshes: number;
    networkErrors: number;
    configErrors: number;
  };
  environment: {
    hasValidConfig: boolean;
    supabaseUrl: string;
    hasApiKey: boolean;
    instanceId: string;
    userAgent: string;
    isOnline: boolean;
    timestamp: string;
  };
}

// 🌟 PERFORMANCE TRACKER
class PerformanceTracker {
  private operations: Map<string, number> = new Map();

  start(operationId: string): void {
    this.operations.set(operationId, performance.now());
  }

  end(operationId: string): number | null {
    const startTime = this.operations.get(operationId);
    if (!startTime) return null;
    
    const duration = performance.now() - startTime;
    this.operations.delete(operationId);
    return duration;
  }

  clear(): void {
    this.operations.clear();
  }
}

// 🔥 MAIN AUTHENTICATION DEBUGGER CLASS
export class AuthDebugger {
  private static instance: AuthDebugger | null = null;
  private events: AuthDebugEvent[] = [];
  private maxEvents = 1000; // Prevent memory leaks
  private debugLevel: DebugLevel = import.meta.env.DEV ? DebugLevel.DEBUG : DebugLevel.ERROR;
  private performanceTracker = new PerformanceTracker();
  private startTime = Date.now();
  private isEnabled = true;

  // 🌟 SINGLETON PATTERN
  static getInstance(): AuthDebugger {
    if (!AuthDebugger.instance) {
      AuthDebugger.instance = new AuthDebugger();
    }
    return AuthDebugger.instance;
  }

  // 🚀 CONFIGURATION
  configure(options: {
    debugLevel?: DebugLevel;
    maxEvents?: number;
    enabled?: boolean;
  }): void {
    if (options.debugLevel !== undefined) this.debugLevel = options.debugLevel;
    if (options.maxEvents !== undefined) this.maxEvents = options.maxEvents;
    if (options.enabled !== undefined) this.isEnabled = options.enabled;
    
    this.log(AuthEventType.INITIALIZATION, DebugLevel.INFO, 'AuthDebugger configured', options);
  }

  // 💪 MAIN LOGGING METHOD
  log(
    type: AuthEventType,
    level: DebugLevel,
    message: string,
    data?: any,
    error?: Error | CropGeniusAuthError,
    performanceId?: string
  ): void {
    if (!this.isEnabled || level > this.debugLevel) return;

    const event: AuthDebugEvent = {
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      type,
      level,
      message,
      data: this.sanitizeData(data),
      error: error ? this.sanitizeError(error) : undefined,
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      instanceId: SupabaseManager.getInstanceId(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      performance: performanceId ? {
        startTime: Date.now(),
        duration: this.performanceTracker.end(performanceId) || undefined
      } : undefined
    };

    // Add to events array
    this.events.push(event);
    
    // Trim events if needed
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Console output with beautiful formatting
    this.outputToConsole(event);

    // Store in localStorage for persistence (development only)
    if (import.meta.env.DEV) {
      this.persistEvent(event);
    }
  }

  // 🎨 BEAUTIFUL CONSOLE OUTPUT
  private outputToConsole(event: AuthDebugEvent): void {
    const emoji = this.getEventEmoji(event.type);
    const levelColor = this.getLevelColor(event.level);
    const prefix = `${emoji} [AUTH DEBUG]`;
    
    const style = `color: ${levelColor}; font-weight: bold;`;
    const timeStyle = 'color: #666; font-size: 0.9em;';
    const dataStyle = 'color: #333;';

    console.groupCollapsed(`%c${prefix} %c${event.timestamp} %c${event.message}`, style, timeStyle, dataStyle);
    
    if (event.data) {
      console.log('📊 Data:', event.data);
    }
    
    if (event.error) {
      console.error('🚨 Error:', event.error);
    }
    
    if (event.performance?.duration) {
      console.log(`⚡ Performance: ${event.performance.duration.toFixed(2)}ms`);
    }
    
    console.log('🔍 Event Details:', {
      id: event.id,
      type: event.type,
      level: DebugLevel[event.level],
      userId: event.userId,
      sessionId: event.sessionId?.slice(0, 8),
      instanceId: event.instanceId.slice(0, 8),
      url: event.url
    });
    
    console.groupEnd();
  }

  // 🌟 CONVENIENCE METHODS
  info(type: AuthEventType, message: string, data?: any): void {
    this.log(type, DebugLevel.INFO, message, data);
  }

  warn(type: AuthEventType, message: string, data?: any, error?: Error): void {
    this.log(type, DebugLevel.WARN, message, data, error);
  }

  error(type: AuthEventType, message: string, data?: any, error?: Error): void {
    this.log(type, DebugLevel.ERROR, message, data, error);
  }

  debug(type: AuthEventType, message: string, data?: any): void {
    this.log(type, DebugLevel.DEBUG, message, data);
  }

  // 🚀 PERFORMANCE TRACKING
  startPerformanceTracking(operationId: string, type: AuthEventType, message: string): void {
    this.performanceTracker.start(operationId);
    this.log(type, DebugLevel.DEBUG, `${message} - Started`, { operationId });
  }

  endPerformanceTracking(operationId: string, type: AuthEventType, message: string, data?: any): void {
    const duration = this.performanceTracker.end(operationId);
    this.log(type, DebugLevel.DEBUG, `${message} - Completed`, { 
      ...data, 
      operationId, 
      duration: duration ? `${duration.toFixed(2)}ms` : 'unknown' 
    });
  }

  // 🔥 SYSTEM HEALTH CHECK
  async getSystemHealth(): Promise<AuthSystemHealth> {
    const now = new Date().toISOString();
    const recentEvents = this.events.filter(e => 
      Date.now() - new Date(e.timestamp).getTime() < 300000 // Last 5 minutes
    );

    const errorEvents = recentEvents.filter(e => e.level === DebugLevel.ERROR);
    const signInEvents = recentEvents.filter(e => 
      e.type === AuthEventType.SIGN_IN_SUCCESS || e.type === AuthEventType.SIGN_IN_ERROR
    );

    const health: AuthSystemHealth = {
      status: this.calculateHealthStatus(errorEvents.length, recentEvents.length),
      lastCheck: now,
      metrics: {
        totalEvents: this.events.length,
        errorRate: recentEvents.length > 0 ? (errorEvents.length / recentEvents.length) * 100 : 0,
        averageResponseTime: this.calculateAverageResponseTime(),
        successfulSignIns: recentEvents.filter(e => e.type === AuthEventType.SIGN_IN_SUCCESS).length,
        failedSignIns: recentEvents.filter(e => e.type === AuthEventType.SIGN_IN_ERROR).length,
        sessionRefreshes: recentEvents.filter(e => e.type === AuthEventType.TOKEN_REFRESH).length,
        networkErrors: recentEvents.filter(e => e.type === AuthEventType.NETWORK_ERROR).length,
        configErrors: recentEvents.filter(e => e.type === AuthEventType.CONFIG_ERROR).length
      },
      environment: {
        hasValidConfig: await this.checkConfigurationHealth(),
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'NOT_SET',
        hasApiKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        instanceId: SupabaseManager.getInstanceId(),
        userAgent: navigator.userAgent,
        isOnline: navigator.onLine,
        timestamp: now
      }
    };

    this.log(AuthEventType.HEALTH_CHECK, DebugLevel.INFO, 'System health check completed', health);
    return health;
  }

  // 📊 EXPORT DEBUG DATA
  exportDebugData(): {
    events: AuthDebugEvent[];
    health: Promise<AuthSystemHealth>;
    summary: {
      totalEvents: number;
      timespan: string;
      instanceId: string;
      exportTime: string;
    };
  } {
    return {
      events: [...this.events],
      health: this.getSystemHealth(),
      summary: {
        totalEvents: this.events.length,
        timespan: `${Math.round((Date.now() - this.startTime) / 1000)}s`,
        instanceId: SupabaseManager.getInstanceId(),
        exportTime: new Date().toISOString()
      }
    };
  }

  // 🧹 CLEAR DEBUG DATA
  clear(): void {
    this.events = [];
    this.performanceTracker.clear();
    this.log(AuthEventType.INITIALIZATION, DebugLevel.INFO, 'Debug data cleared');
  }

  // 🔍 SEARCH AND FILTER
  getEvents(filter?: {
    type?: AuthEventType;
    level?: DebugLevel;
    userId?: string;
    since?: Date;
    limit?: number;
  }): AuthDebugEvent[] {
    let filtered = [...this.events];

    if (filter?.type) {
      filtered = filtered.filter(e => e.type === filter.type);
    }

    if (filter?.level !== undefined) {
      filtered = filtered.filter(e => e.level >= filter.level!);
    }

    if (filter?.userId) {
      filtered = filtered.filter(e => e.userId === filter.userId);
    }

    if (filter?.since) {
      filtered = filtered.filter(e => new Date(e.timestamp) >= filter.since!);
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  // 🛠️ PRIVATE HELPER METHODS
  private generateEventId(): string {
    return `auth_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    
    // Remove sensitive information
    const sanitized = JSON.parse(JSON.stringify(data));
    
    // Remove passwords, tokens, keys
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth'];
    
    const removeSensitive = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      for (const key in obj) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          obj[key] = removeSensitive(obj[key]);
        }
      }
      
      return obj;
    };
    
    return removeSensitive(sanitized);
  }

  private sanitizeError(error: Error | CropGeniusAuthError): any {
    return {
      name: error.name,
      message: error.message,
      stack: import.meta.env.DEV ? error.stack : undefined,
      ...(error instanceof CropGeniusAuthError ? {
        type: error.type,
        code: error.code,
        userMessage: error.userMessage,
        retryable: error.retryable
      } : {})
    };
  }

  private getCurrentUserId(): string | undefined {
    try {
      return supabase.auth.getUser().then(({ data }) => data.user?.id);
    } catch {
      return undefined;
    }
  }

  private getCurrentSessionId(): string | undefined {
    try {
      return supabase.auth.getSession().then(({ data }) => data.session?.access_token?.slice(0, 16));
    } catch {
      return undefined;
    }
  }

  private getEventEmoji(type: AuthEventType): string {
    const emojiMap: Record<AuthEventType, string> = {
      [AuthEventType.INITIALIZATION]: '🚀',
      [AuthEventType.SESSION_CHECK]: '🔍',
      [AuthEventType.SIGN_IN_START]: '🔑',
      [AuthEventType.SIGN_IN_SUCCESS]: '✅',
      [AuthEventType.SIGN_IN_ERROR]: '🚨',
      [AuthEventType.SIGN_OUT_START]: '🚪',
      [AuthEventType.SIGN_OUT_SUCCESS]: '👋',
      [AuthEventType.SIGN_OUT_ERROR]: '⚠️',
      [AuthEventType.TOKEN_REFRESH]: '🔄',
      [AuthEventType.SESSION_EXPIRED]: '⏰',
      [AuthEventType.PROFILE_LOAD]: '👤',
      [AuthEventType.OAUTH_REDIRECT]: '🔀',
      [AuthEventType.OAUTH_CALLBACK]: '🔙',
      [AuthEventType.ERROR_BOUNDARY]: '🛡️',
      [AuthEventType.HEALTH_CHECK]: '🏥',
      [AuthEventType.NETWORK_ERROR]: '🌐',
      [AuthEventType.CONFIG_ERROR]: '⚙️'
    };
    
    return emojiMap[type] || '📝';
  }

  private getLevelColor(level: DebugLevel): string {
    const colorMap: Record<DebugLevel, string> = {
      [DebugLevel.SILENT]: '#999',
      [DebugLevel.ERROR]: '#ff4444',
      [DebugLevel.WARN]: '#ff8800',
      [DebugLevel.INFO]: '#0088ff',
      [DebugLevel.DEBUG]: '#00aa00',
      [DebugLevel.VERBOSE]: '#8800ff'
    };
    
    return colorMap[level] || '#333';
  }

  private calculateHealthStatus(errorCount: number, totalCount: number): 'healthy' | 'degraded' | 'critical' | 'unknown' {
    if (totalCount === 0) return 'unknown';
    
    const errorRate = (errorCount / totalCount) * 100;
    
    if (errorRate === 0) return 'healthy';
    if (errorRate < 10) return 'degraded';
    return 'critical';
  }

  private calculateAverageResponseTime(): number {
    const performanceEvents = this.events.filter(e => e.performance?.duration);
    if (performanceEvents.length === 0) return 0;
    
    const totalTime = performanceEvents.reduce((sum, e) => sum + (e.performance?.duration || 0), 0);
    return totalTime / performanceEvents.length;
  }

  private async checkConfigurationHealth(): Promise<boolean> {
    try {
      const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
      const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!hasUrl || !hasKey) return false;
      
      // Test basic connectivity
      const { error } = await supabase.from('profiles').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  private persistEvent(event: AuthDebugEvent): void {
    try {
      const key = 'cropgenius_auth_debug_events';
      const stored = localStorage.getItem(key);
      const events = stored ? JSON.parse(stored) : [];
      
      events.push(event);
      
      // Keep only last 100 events in localStorage
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem(key, JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to persist debug event:', error);
    }
  }
}

// 🌟 GLOBAL DEBUGGER INSTANCE
export const authDebugger = AuthDebugger.getInstance();

// 🚀 CONVENIENCE FUNCTIONS FOR EASY USAGE
export const logAuthEvent = (
  type: AuthEventType,
  message: string,
  data?: any,
  error?: Error
): void => {
  authDebugger.info(type, message, data);
  if (error) authDebugger.error(type, `${message} - Error`, data, error);
};

export const logAuthError = (
  type: AuthEventType,
  message: string,
  error: Error,
  data?: any
): void => {
  authDebugger.error(type, message, data, error);
};

export const startAuthPerformance = (operationId: string, operation: string): void => {
  authDebugger.startPerformanceTracking(operationId, AuthEventType.INITIALIZATION, operation);
};

export const endAuthPerformance = (operationId: string, operation: string, data?: any): void => {
  authDebugger.endPerformanceTracking(operationId, AuthEventType.INITIALIZATION, operation, data);
};

// 🔥 INITIALIZE DEBUGGER
if (import.meta.env.DEV) {
  authDebugger.configure({
    debugLevel: DebugLevel.DEBUG,
    maxEvents: 1000,
    enabled: true
  });
  
  // Add to window for debugging
  (window as any).authDebugger = authDebugger;
  
  console.log('🚀 [AUTH DEBUGGER] INFINITY IQ Authentication Debugger initialized!');
  console.log('💡 Use window.authDebugger to access debugging tools');
}