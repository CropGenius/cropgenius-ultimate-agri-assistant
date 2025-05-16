import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fieldService } from '@/services/fieldService';
import { supabase } from '@/lib/supabase';

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Field Service', () => {
  const mockField = {
    id: 'field-123',
    name: 'Test Field',
    area: 1000,
    boundary: {
      type: 'Polygon',
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
    },
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore - Mocking the supabase chain
    supabase.from.mockReturnThis();
  });

  describe('createField', () => {
    it('should create a new field and return it', async () => {
      // Arrange
      const newField = {
        name: 'New Field',
        area: 500,
        boundary: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        },
      };

      // Mock successful response
      // @ts-ignore - Mocking the supabase chain
      supabase.from().insert().select().single.mockResolvedValueOnce({
        data: { ...newField, id: 'new-field-123' },
        error: null,
      });

      // Act
      const result = await fieldService.createField(newField);

      // Assert
      expect(result.error).toBeNull();
      expect(result.data).toMatchObject({
        ...newField,
        id: 'new-field-123',
      });
    });

    it('should handle offline mode by saving to localStorage', async () => {
      // Arrange
      const newField = {
        name: 'Offline Field',
        area: 300,
        boundary: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        },
      };

      // Mock offline error
      const error = new Error('Network error');
      // @ts-ignore - Mocking the supabase chain
      supabase.from().insert().select().single.mockRejectedValueOnce(error);

      // Mock online status
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

      // Act
      const result = await fieldService.createField(newField);

      // Assert
      expect(result.error).toBeNull();
      expect(result.data).toMatchObject({
        ...newField,
        id: expect.any(String),
      });

      // Verify offline storage
      const offlineFields = JSON.parse(localStorage.setItem.mock.calls[0][1]);
      expect(offlineFields[0]).toMatchObject({
        ...newField,
        id: expect.any(String),
        is_offline: true,
      });
    });
  });

  describe('getFieldById', () => {
    it('should return a field by id', async () => {
      // Arrange
      // @ts-ignore - Mocking the supabase chain
      supabase.from().select().eq().single.mockResolvedValueOnce({
        data: mockField,
        error: null,
      });

      // Act
      const result = await fieldService.getFieldById('field-123');

      // Assert
      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockField);
      expect(supabase.from).toHaveBeenCalledWith('fields');
      expect(supabase.from().select).toHaveBeenCalledWith('*');
      expect(supabase.from().select().eq).toHaveBeenCalledWith('id', 'field-123');
    });
  });

  describe('updateField', () => {
    it('should update a field', async () => {
      // Arrange
      const updatedField = { ...mockField, name: 'Updated Field' };
      
      // @ts-ignore - Mocking the supabase chain
      supabase.from().update().eq().select().single.mockResolvedValueOnce({
        data: updatedField,
        error: null,
      });

      // Act
      const result = await fieldService.updateField(updatedField);

      // Assert
      expect(result.error).toBeNull();
      expect(result.data).toEqual(updatedField);
    });
  });

  describe('deleteField', () => {
    it('should delete a field', async () => {
      // Arrange
      // @ts-ignore - Mocking the supabase chain
      supabase.from().delete().eq().then.mockResolvedValueOnce({
        error: null,
      });

      // Act
      const result = await fieldService.deleteField('field-123');

      // Assert
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('fields');
      expect(supabase.from('fields').delete).toHaveBeenCalled();
      expect(supabase.from('fields').delete().eq).toHaveBeenCalledWith('id', 'field-123');
    });
  });
});
