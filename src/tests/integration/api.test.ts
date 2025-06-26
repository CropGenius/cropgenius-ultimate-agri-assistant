import { describe, it, expect, beforeEach } from 'vitest';
import { vi } from 'vitest';
import { useGemini } from '@/hooks/useGemini';
import { useChatHistory } from '@/hooks/useChatHistory';
import { usePlantNet } from '@/hooks/usePlantNet';
import { EnhancedSupabaseClient } from '@/services/supabaseClient';

// Mock Supabase client
const mockFrom = vi.fn().mockReturnThis();
const mockInsert = vi.fn().mockReturnThis();
const mockSelect = vi.fn().mockReturnThis();
const mockRpc = vi.fn().mockReturnThis();

vi.mock('@/services/supabaseClient', () => {
  const mockClient = {
    from: mockFrom,
    insert: mockInsert,
    select: mockSelect,
    rpc: mockRpc,
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
    clearOfflineCache: vi.fn()
  } as EnhancedSupabaseClient;

  return {
    supabase: mockClient,
    EnhancedSupabaseClient: class {
      constructor() {
        return mockClient;
      }
    }
  };
});

describe('API Integration Tests', () => {
  const mockUserId = 'test-user-id';
  const mockImageUrl = 'https://example.com/test-image.jpg';
  const mockCrop = 'maize';
  const mockRegion = 'East Africa';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should analyze plant disease', async () => {
    const { analyzePlant } = usePlantNet();
    const result = await analyzePlant(mockImageUrl, mockUserId);
    expect(result).toBeDefined();
  });

  it('should generate treatment advice', async () => {
    const { generateTreatmentAdvice } = useGemini();
    const advice = await generateTreatmentAdvice(mockCrop, 'leaf blight');
    expect(advice).toBeDefined();
  });

  it('should generate market advice', async () => {
    const { generateMarketAdvice } = useGemini();
    const advice = await generateMarketAdvice(mockCrop, mockRegion);
    expect(advice).toBeDefined();
  });

  it('should save chat message', async () => {
    const { saveChatMessage } = useChatHistory();
    const mockMessage = 'test message';
    const mockResponse = 'test response';

    await saveChatMessage(mockMessage, mockResponse, mockUserId);

    expect(mockFrom).toHaveBeenCalledWith('chat_history');
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: mockUserId,
      message: mockMessage,
      response: mockResponse,
      created_at: expect.any(String)
    });
  });

  it('should get chat history', async () => {
    const { getChatHistory } = useChatHistory();
    const mockChatHistory = {
      user_id: mockUserId,
      message: 'test message',
      response: 'test response',
      created_at: new Date().toISOString()
    };

    mockSelect.mockResolvedValueOnce({ data: [mockChatHistory] });

    const result = await getChatHistory(mockUserId);

    expect(mockFrom).toHaveBeenCalledWith('chat_history');
    expect(mockSelect).toHaveBeenCalledWith({
      user_id: mockUserId
    });
    expect(result).toEqual([mockChatHistory]);
  });
});
