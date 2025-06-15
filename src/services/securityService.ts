import { supabase } from '../integrations/supabase/client';
import { systemMonitor } from './systemMonitoringService';
import { analytics } from '../integrations/analytics';
import { performance } from 'perf_hooks';

export interface SecurityConfig {
  maxRequestsPerIp: number;
  requestWindow: number;
  csrfTokenLifetime: number;
  maxMemoryLimit: number;
  rateLimitExponentialBackoff: boolean;
}

export class SecurityService {
  private static instance: SecurityService;
  private rateLimiter: Map<string, { count: number; timestamp: number }>;
  private csrfTokens: Map<string, { token: string; timestamp: number }>;
  private readonly config: SecurityConfig;

  private constructor() {
    this.rateLimiter = new Map();
    this.csrfTokens = new Map();
    this.config = {
      maxRequestsPerIp: 100,
      requestWindow: 60000, // 1 minute
      csrfTokenLifetime: 3600000, // 1 hour
      maxMemoryLimit: 50 * 1024 * 1024, // 50MB
      rateLimitExponentialBackoff: true
    };

    this.initializeSecurity();
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  private initializeSecurity(): void {
    // Start monitoring memory usage
    this.startMemoryMonitoring();
    
    // Start rate limiting monitoring
    this.startRateLimitMonitoring();
  }

  private startMemoryMonitoring(): void {
    setInterval(() => {
      const usage = (performance as any).memory?.usedJSHeapSize;
      if (usage > this.config.maxMemoryLimit) {
        systemMonitor.trackPerformance('memory_exhaustion_warning', {
          usage,
          timestamp: Date.now()
        });
        this.triggerMemoryCleanup();
      }
    }, 5000); // Check every 5 seconds
  }

  private startRateLimitMonitoring(): void {
    setInterval(() => {
      const now = Date.now();
      const expiredTokens = Array.from(this.csrfTokens.entries())
        .filter(([_, { timestamp }]) => timestamp < now - this.config.csrfTokenLifetime)
        .map(([key]) => key);
      
      expiredTokens.forEach(token => this.csrfTokens.delete(token));
    }, 60000); // Clean up every minute
  }

  public validateRequest(
    req: Request,
    ip: string,
    operation: string
  ): { isValid: boolean; error?: string } {
    const validation = {
      rateLimit: this.checkRateLimit(ip),
      csrf: this.validateCSRF(req),
      memory: this.checkMemoryUsage(),
      sql: this.sanitizeSQL(req.body),
      xss: this.preventXSS(req.body)
    };

    const errors = Object.entries(validation)
      .filter(([_, result]) => !result.isValid)
      .map(([key, result]) => result.error);

    if (errors.length > 0) {
      analytics.track('security_violation', {
        operation,
        violations: errors,
        timestamp: Date.now()
      });
      return { isValid: false, error: errors.join(', ') };
    }

    return { isValid: true };
  }

  private checkRateLimit(ip: string): { isValid: boolean; error?: string } {
    const now = Date.now();
    const entry = this.rateLimiter.get(ip);

    if (!entry) {
      this.rateLimiter.set(ip, { count: 1, timestamp: now });
      return { isValid: true };
    }

    if (now - entry.timestamp > this.config.requestWindow) {
      this.rateLimiter.set(ip, { count: 1, timestamp: now });
      return { isValid: true };
    }

    if (entry.count >= this.config.maxRequestsPerIp) {
      const delay = this.config.rateLimitExponentialBackoff
        ? Math.pow(2, Math.floor(entry.count / 10)) * 1000
        : 1000;

      setTimeout(() => {
        const current = this.rateLimiter.get(ip);
        if (current) {
          current.count = Math.max(0, current.count - 1);
        }
      }, delay);

      return {
        isValid: false,
        error: `Rate limit exceeded. Please wait ${delay/1000} seconds.`
      };
    }

    this.rateLimiter.set(ip, { 
      count: entry.count + 1, 
      timestamp: entry.timestamp 
    });
    return { isValid: true };
  }

  private generateCSRFToken(sessionId: string): string {
    const token = crypto.randomUUID();
    this.csrfTokens.set(token, {
      token,
      timestamp: Date.now()
    });
    return token;
  }

  private validateCSRF(req: Request): { isValid: boolean; error?: string } {
    const token = req.headers.get('x-csrf-token');
    if (!token) {
      return {
        isValid: false,
        error: 'CSRF token missing'
      };
    }

    const stored = this.csrfTokens.get(token);
    if (!stored) {
      return {
        isValid: false,
        error: 'Invalid CSRF token'
      };
    }

    return { isValid: true };
  }

  private checkMemoryUsage(): { isValid: boolean; error?: string } {
    const usage = (performance as any).memory?.usedJSHeapSize;
    if (usage > this.config.maxMemoryLimit) {
      return {
        isValid: false,
        error: `Memory usage above threshold: ${usage} bytes`
      };
    }
    return { isValid: true };
  }

  private sanitizeSQL(body: any): { isValid: boolean; error?: string } {
    if (!body) return { isValid: true };

    const stringValues = Object.values(body)
      .filter(v => typeof v === 'string')
      .join(' ');

    const sqlPattern = /['";\-\+\*\/\(\)]/g;
    if (sqlPattern.test(stringValues)) {
      return {
        isValid: false,
        error: 'SQL injection attempt detected'
      };
    }

    return { isValid: true };
  }

  private preventXSS(body: any): { isValid: boolean; error?: string } {
    if (!body) return { isValid: true };

    const stringValues = Object.values(body)
      .filter(v => typeof v === 'string')
      .join(' ');

    const xssPattern = /<script|onload|eval\(|javascript:/gi;
    if (xssPattern.test(stringValues)) {
      return {
        isValid: false,
        error: 'XSS attack attempt detected'
      };
    }

    return { isValid: true };
  }

  private triggerMemoryCleanup(): void {
    if (typeof window !== 'undefined') {
      // Force garbage collection
      window.gc?.();
      
      // Clear caches
      localStorage.clear();
      sessionStorage.clear();
    }
  }

  public async validatePaymentFlow(
    userId: string,
    amount: number,
    currency: string
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Validate user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return {
          isValid: false,
          error: 'Invalid user'
        };
      }

      // Validate amount
      if (amount <= 0) {
        return {
          isValid: false,
          error: 'Invalid amount'
        };
      }

      // Validate currency
      const validCurrencies = ['USD', 'EUR', 'GBP'];
      if (!validCurrencies.includes(currency)) {
        return {
          isValid: false,
          error: 'Invalid currency'
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Payment validation failed:', error);
      return {
        isValid: false,
        error: 'Payment validation failed'
      };
    }
  }
}

export const security = SecurityService.getInstance();
