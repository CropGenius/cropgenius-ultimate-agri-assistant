import { vi } from 'vitest';

export const mockSupabase = () => ({
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockResolvedValue({ data: null, error: null }),
  select: vi.fn().mockResolvedValue({ data: [], error: null }),
  rpc: vi.fn().mockResolvedValue({ data: { response: 'mock response' }, error: null }),
});
