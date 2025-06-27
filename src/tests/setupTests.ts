require('@testing-library/jest-dom');
require('@testing-library/user-event');

// Mock Supabase client
vi.mock('@/services/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    rpc: vi.fn().mockReturnThis(),
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
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
