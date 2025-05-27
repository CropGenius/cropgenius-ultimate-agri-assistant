import { vi } from 'vitest';

export const createMockAnalytics = () => {
  return {
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
    // Add other analytics methods as needed
    trackEvent: vi.fn(),
    trackError: vi.fn(),
    trackPageView: vi.fn(),
    setUserProperties: vi.fn(),
  };
};

// Default export for convenience
export default createMockAnalytics;
