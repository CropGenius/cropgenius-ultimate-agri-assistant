import '@testing-library/jest-dom';
import '@testing-library/user-event';

vi.stubGlobal('navigator', {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
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
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
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
