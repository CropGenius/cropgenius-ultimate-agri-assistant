import { test } from 'playwright/test';
import { expect } from '@playwright/test';
import { security } from './src/services/securityService';

// Security test suite
const securityTestSuite = {
  testCases: [
    // SQL Injection Tests
    {
      name: 'SQL Injection Protection',
      payload: "' OR '1'='1",
      expected: 'SQL injection attempt detected'
    },
    
    // XSS Tests
    {
      name: 'XSS Prevention',
      payload: '<script>alert("XSS")</script>',
      expected: 'XSS attack attempt detected'
    },
    
    // CSRF Tests
    {
      name: 'CSRF Token Validation',
      payload: { 'x-csrf-token': 'invalid-token' },
      expected: 'Invalid CSRF token'
    },
    
    // Rate Limiting Tests
    {
      name: 'Rate Limiting Protection',
      payload: { ip: '127.0.0.1' },
      expected: 'Rate limit exceeded'
    },
    
    // Memory Protection Tests
    {
      name: 'Memory Usage Protection',
      payload: { memory: '1GB' },
      expected: 'Memory usage above threshold'
    }
  ]
};

test.describe('Security Tests', () => {
  for (const testCase of securityTestSuite.testCases) {
    test(testCase.name, async ({ page }) => {
      const result = await security.validateRequest(
        new Request('http://localhost'),
        testCase.payload.ip || '127.0.0.1',
        testCase.name
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain(testCase.expected);
    });
  }
});

// API Security Tests
test('API Security Headers', async ({ page }) => {
  const response = await page.request.get('/api/health');
  const headers = response.headers();

  // Check for security headers
  expect(headers['content-security-policy']).toBeDefined();
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['strict-transport-security']).toBeDefined();
  expect(headers['x-xss-protection']).toBe('1; mode=block');
});

// Session Security Tests
test('Session Security', async ({ page }) => {
  // Test session hijacking prevention
  await page.goto('/auth');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Verify session token is secure
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name === 'session');
  expect(sessionCookie).toBeDefined();
  expect(sessionCookie.httpOnly).toBe(true);
  expect(sessionCookie.secure).toBe(true);
  expect(sessionCookie.sameSite).toBe('Strict');
});
