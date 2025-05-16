import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock process.env
const originalEnv = { ...import.meta.env };

beforeEach(() => {
  // Clear all mocks and reset env
  vi.resetModules();
  // @ts-ignore - We're intentionally modifying read-only properties for testing
  Object.defineProperty(import.meta, 'env', {
    value: { ...originalEnv },
    writable: true,
  });
});

describe('Environment Validation', () => {
  it('should validate correct environment variables', () => {
    // Arrange
    const testEnv = {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
      VITE_SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      VITE_MAPBOX_ACCESS_TOKEN: 'test-mapbox-token',
      VITE_APP_URL: 'http://localhost:5173',
      VITE_SUPABASE_REDIRECT_URL: 'http://localhost:5173/auth/callback',
    };

    // @ts-ignore - We're intentionally modifying read-only properties for testing
    Object.assign(import.meta.env, testEnv);

    // Act & Assert
    expect(() => {
      // Re-import to get fresh module with new env vars
      const { env } = require('@/lib/env');
      expect(env.VITE_SUPABASE_URL).toBe(testEnv.VITE_SUPABASE_URL);
      expect(env.VITE_ENABLE_OFFLINE).toBe(true);
    }).not.toThrow();
  });

  it('should throw error for missing required variables', () => {
    // Arrange
    const testEnv = {
      // Missing required VITE_SUPABASE_URL
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
      VITE_MAPBOX_ACCESS_TOKEN: 'test-mapbox-token',
    };

    // @ts-ignore - We're intentionally modifying read-only properties for testing
    Object.assign(import.meta.env, testEnv);

    // Act & Assert
    expect(() => {
      // Re-import to trigger validation
      require('@/lib/env');
    }).toThrow(/Invalid environment variables/);
  });

  it('should use default values for optional variables', () => {
    // Arrange
    const testEnv = {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
      VITE_SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      VITE_MAPBOX_ACCESS_TOKEN: 'test-mapbox-token',
      VITE_APP_URL: 'http://localhost:5173',
      VITE_SUPABASE_REDIRECT_URL: 'http://localhost:5173/auth/callback',
    };

    // @ts-ignore - We're intentionally modifying read-only properties for testing
    Object.assign(import.meta.env, testEnv);

    // Act
    const { env } = require('@/lib/env');

    // Assert
    expect(env.VITE_ENABLE_OFFLINE).toBe(true);
    expect(env.VITE_ENABLE_ANALYTICS).toBe(false);
    expect(env.VITE_API_RATE_LIMIT).toBe(100);
  });
});
