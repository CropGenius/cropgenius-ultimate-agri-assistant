import { vi } from 'vitest';

export const createMockSupabaseClient = () => {
  const mockFrom = vi.fn().mockReturnThis();
  const mockSelect = vi.fn().mockReturnThis();
  const mockInsert = vi.fn().mockReturnThis();
  const mockUpdate = vi.fn().mockReturnThis();
  const mockDelete = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockOrder = vi.fn().mockReturnThis();
  const mockLimit = vi.fn().mockReturnThis();
  const mockSingle = vi.fn().mockReturnThis();
  const mockMaybeSingle = vi.fn().mockReturnThis();
  const mockAuth = {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
    getSession: vi.fn(),
    getCurrentUser: vi.fn(),
  };

  const mockSupabaseClient = {
    from: mockFrom,
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    order: mockOrder,
    limit: mockLimit,
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
    auth: mockAuth,
    // Add any other Supabase client methods you need to mock
  };

  // Set up default mocks
  mockFrom.mockImplementation(() => mockSupabaseClient);
  mockSelect.mockImplementation(() => mockSupabaseClient);
  mockInsert.mockImplementation(() => mockSupabaseClient);
  mockUpdate.mockImplementation(() => mockSupabaseClient);
  mockDelete.mockImplementation(() => mockSupabaseClient);
  mockEq.mockImplementation(() => mockSupabaseClient);
  mockOrder.mockImplementation(() => mockSupabaseClient);
  mockLimit.mockImplementation(() => mockSupabaseClient);
  mockSingle.mockImplementation(() => Promise.resolve({ data: null, error: null }));
  mockMaybeSingle.mockImplementation(() => Promise.resolve({ data: null, error: null }));

  return {
    supabase: mockSupabaseClient,
    mocks: {
      from: mockFrom,
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      maybeSingle: mockMaybeSingle,
      auth: mockAuth,
    },
  };
};

// Default export for convenience
export default createMockSupabaseClient;
