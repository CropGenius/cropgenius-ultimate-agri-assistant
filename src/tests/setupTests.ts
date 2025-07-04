import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock user-event
vi.mock('@testing-library/user-event', () => ({
  default: {
    setup: () => ({}),
  },
}));

// Polyfill for requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
  return 0;
};

// Mock the global objects
vi.stubGlobal('navigator', {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve('')),
  },
  onLine: true,
  userAgent: 'Test Agent',
});

vi.stubGlobal('window', {
  location: {
    hash: '',
    search: '',
    href: 'http://localhost/',
    origin: 'http://localhost',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  history: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  matchMedia: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  document: {
    execCommand: vi.fn(),
  },
});

// Mock Supabase client
vi.mock('@/services/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    rpc: vi.fn().mockReturnThis(),
    auth: {
      getSession: vi.fn(),
      exchangeCodeForSession: vi.fn(),
      refreshSession: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: '123' } } }))
    },
    storage: {},
    functions: {},
    healthCheck: vi.fn().mockResolvedValue(true),
    getConnectionStatus: vi.fn().mockReturnValue({
      isHealthy: true,
      lastError: null
    }),
    options: {
      enableRetries: true,
      enableOfflineQueue: true,
      maxRetries: 3,
      retryDelay: 1000
    },
    enhancedFetch: vi.fn(),
    getOperationPriority: vi.fn(),
    retry: vi.fn(),
    queueOperation: vi.fn(),
    processQueue: vi.fn(),
    handleNetworkError: vi.fn(),
    setupAuthMonitoring: vi.fn(),
    clearOfflineCache: vi.fn(),
    client: {} as any
  }
}));

// Clean up after each test
afterEach(() => {
  cleanup();
});