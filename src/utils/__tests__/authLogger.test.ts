/**
 * Unit tests for AuthLogger utility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthLogger, authLogger, AuthError } from '../authLogger';

// Mock environment
vi.mock('../../env', () => ({
  env: {
    DEV: true
  }
}));

describe('AuthLogger', () => {
  let logger: AuthLogger;

  beforeEach(() => {
    logger = AuthLogger.getInstance();
    logger.clearLogs();
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AuthLogger.getInstance();
      const instance2 = AuthLogger.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should use the exported singleton', () => {
      expect(authLogger).toBe(AuthLogger.getInstance());
    });
  });

  describe('logAuthEvent', () => {
    it('should log authentication events with correct structure', () => {
      const event = 'TEST_EVENT';
      const context = { testKey: 'testValue' };

      logger.logAuthEvent(event, 'info', context);

      const logs = logger.getRecentLogs(1);
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        event,
        level: 'info',
        context: expect.objectContaining({
          testKey: 'testValue',
          url: expect.any(String),
          userAgent: expect.any(String)
        })
      });
      expect(logs[0].timestamp).toBeTypeOf('number');
    });

    it('should default to info level', () => {
      logger.logAuthEvent('TEST_EVENT');
      
      const logs = logger.getRecentLogs(1);
      expect(logs[0].level).toBe('info');
    });

    it('should include URL and user agent in context', () => {
      logger.logAuthEvent('TEST_EVENT');
      
      const logs = logger.getRecentLogs(1);
      expect(logs[0].context.url).toBeDefined();
      expect(logs[0].context.userAgent).toBeDefined();
    });
  });

  describe('logAuthError', () => {
    it('should log authentication errors with structured data', () => {
      const authError: AuthError = {
        code: 'TEST_ERROR',
        message: 'Test error message',
        userMessage: 'User-friendly message',
        context: { errorDetail: 'detail' },
        timestamp: Date.now(),
        retryable: true
      };

      logger.logAuthError(authError);

      const logs = logger.getRecentLogs(1);
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        event: 'AUTH_ERROR: TEST_ERROR',
        level: 'error',
        context: expect.objectContaining({
          errorCode: 'TEST_ERROR',
          message: 'Test error message',
          userMessage: 'User-friendly message',
          retryable: true,
          errorDetail: 'detail'
        })
      });
    });
  });

  describe('logRedirectLoop', () => {
    it('should log redirect loop detection', () => {
      const redirectCount = 5;
      const originalPath = '/dashboard';

      logger.logRedirectLoop(redirectCount, originalPath);

      const logs = logger.getRecentLogs(1);
      expect(logs[0]).toMatchObject({
        event: 'REDIRECT_LOOP_DETECTED',
        level: 'error',
        context: expect.objectContaining({
          redirectCount,
          originalPath,
          action: 'Breaking redirect loop'
        })
      });
    });
  });

  describe('logOAuthCallback', () => {
    it('should log successful OAuth callback', () => {
      logger.logOAuthCallback('google', true);

      const logs = logger.getRecentLogs(1);
      expect(logs[0]).toMatchObject({
        event: 'OAUTH_CALLBACK_SUCCESS',
        level: 'info',
        context: expect.objectContaining({
          provider: 'google'
        })
      });
    });

    it('should log failed OAuth callback with error', () => {
      logger.logOAuthCallback('google', false, 'Access denied', 2);

      const logs = logger.getRecentLogs(1);
      expect(logs[0]).toMatchObject({
        event: 'OAUTH_CALLBACK_FAILURE',
        level: 'error',
        context: expect.objectContaining({
          provider: 'google',
          error: 'Access denied',
          retryAttempt: 2
        })
      });
    });
  });

  describe('logSessionOperation', () => {
    it('should log successful session operations', () => {
      logger.logSessionOperation('CREATE', true, 'user123');

      const logs = logger.getRecentLogs(1);
      expect(logs[0]).toMatchObject({
        event: 'SESSION_CREATE_SUCCESS',
        level: 'info',
        context: expect.objectContaining({
          operation: 'CREATE',
          userId: 'user123'
        })
      });
    });

    it('should log failed session operations', () => {
      logger.logSessionOperation('REFRESH', false, 'user123', 'Token expired');

      const logs = logger.getRecentLogs(1);
      expect(logs[0]).toMatchObject({
        event: 'SESSION_REFRESH_FAILURE',
        level: 'warn',
        context: expect.objectContaining({
          operation: 'REFRESH',
          userId: 'user123',
          error: 'Token expired'
        })
      });
    });
  });

  describe('logDevBypass', () => {
    it('should log development bypass usage', () => {
      logger.logDevBypass(true, 'Testing authentication flow');

      const logs = logger.getRecentLogs(1);
      expect(logs[0]).toMatchObject({
        event: 'DEV_BYPASS_USED',
        level: 'warn',
        context: expect.objectContaining({
          enabled: true,
          reason: 'Testing authentication flow'
        })
      });
    });
  });

  describe('Log Management', () => {
    it('should return recent logs', () => {
      logger.logAuthEvent('EVENT_1');
      logger.logAuthEvent('EVENT_2');
      logger.logAuthEvent('EVENT_3');

      const recentLogs = logger.getRecentLogs(2);
      expect(recentLogs).toHaveLength(2);
      expect(recentLogs[0].event).toBe('EVENT_2');
      expect(recentLogs[1].event).toBe('EVENT_3');
    });

    it('should filter logs by level', () => {
      logger.logAuthEvent('INFO_EVENT', 'info');
      logger.logAuthEvent('ERROR_EVENT', 'error');
      logger.logAuthEvent('WARN_EVENT', 'warn');

      const errorLogs = logger.getLogsByLevel('error');
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].event).toBe('ERROR_EVENT');
    });

    it('should clear all logs', () => {
      logger.logAuthEvent('EVENT_1');
      logger.logAuthEvent('EVENT_2');
      
      expect(logger.getRecentLogs().length).toBeGreaterThan(0);
      
      logger.clearLogs();
      expect(logger.getRecentLogs()).toHaveLength(0);
    });

    it('should export logs as JSON string', () => {
      logger.logAuthEvent('TEST_EVENT');
      
      const exported = logger.exportLogs();
      expect(() => JSON.parse(exported)).not.toThrow();
      
      const parsed = JSON.parse(exported);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].event).toBe('TEST_EVENT');
    });

    it('should limit log storage to maxLogs', () => {
      // Create logger with small max logs for testing
      const testLogger = new (AuthLogger as any)();
      testLogger.maxLogs = 3;

      // Add more logs than the limit
      for (let i = 0; i < 5; i++) {
        testLogger.logAuthEvent(`EVENT_${i}`);
      }

      const logs = testLogger.getRecentLogs();
      expect(logs).toHaveLength(3);
      expect(logs[0].event).toBe('EVENT_2'); // Should keep last 3
      expect(logs[2].event).toBe('EVENT_4');
    });
  });
});