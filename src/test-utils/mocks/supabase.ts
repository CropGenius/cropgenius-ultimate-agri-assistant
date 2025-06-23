import { vi } from 'vitest';

export const createMockSupabaseClient = () => {
  return {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockImplementation((callback) => {
        // Simulate auth state change
        callback({ event: 'SIGNED_IN', session: { user: { id: 'test-user-id' } } });
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
};

export const mockSupabaseClient = createMockSupabaseClient();

// Mock the supabase client module
export const setupSupabaseMocks = () => {
  vi.mock('@/lib/supabase', () => ({
    supabase: mockSupabaseClient,
  }));
};

// Helper to mock successful RPC responses
export const mockRpcSuccess = (data: any) => {
  mockSupabaseClient.rpc.mockResolvedValueOnce({
    data,
    error: null,
  });
};

// Helper to mock failed RPC responses
export const mockRpcError = (error: any) => {
  mockSupabaseClient.rpc.mockResolvedValueOnce({
    data: null,
    error,
  });
};

// Helper to mock successful query responses
export const mockQuerySuccess = (table: string, data: any) => {
  const mock = vi.fn().mockReturnThis();
  mock.from.mockReturnValueOnce({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValueOnce({
      data,
      error: null,
    }),
  });
  return mock;
};

// Helper to mock failed query responses
export const mockQueryError = (table: string, error: any) => {
  const mock = vi.fn().mockReturnThis();
  mock.from.mockReturnValueOnce({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValueOnce({
      data: null,
      error,
    }),
  });
  return mock;
};
