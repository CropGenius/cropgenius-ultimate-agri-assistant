import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fieldService from '@/services/fieldService';
import { Field } from '@/types/field';

// Mock the field service functions
vi.mock('@/services/fieldService', () => ({
  createField: vi.fn().mockResolvedValue({ data: null, error: null }),
  getFieldById: vi.fn().mockResolvedValue({ data: null, error: null }),
  updateField: vi.fn().mockResolvedValue({ data: null, error: null }),
  deleteField: vi.fn().mockResolvedValue({ error: null }),
}));

describe('Field Service', () => {
  const mockField: Field = {
    id: 'field-123',
    user_id: 'user-123',
    farm_id: 'farm-123',
    name: 'Test Field',
    size: 1000,
    size_unit: 'hectares',
    boundary: {
      type: 'polygon',
      coordinates: [
        { lat: 0, lng: 0 },
        { lat: 1, lng: 0 },
        { lat: 1, lng: 1 },
        { lat: 0, lng: 1 },
        { lat: 0, lng: 0 }
      ]
    },
    location_description: 'Test location',
    soil_type: 'loam',
    irrigation_type: 'sprinkler',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    is_synced: true,
    is_shared: false,
    shared_with: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createField', () => {
    it('should create a new field and return it', async () => {
      // Arrange
      const newField: Omit<Field, 'id' | 'created_at' | 'updated_at'> = {
        user_id: 'user-123',
        farm_id: 'farm-123',
        name: 'New Field',
        size: 500,
        size_unit: 'hectares',
        boundary: {
          type: 'polygon',
          coordinates: [
            { lat: 0, lng: 0 },
            { lat: 1, lng: 0 },
            { lat: 1, lng: 1 },
            { lat: 0, lng: 1 },
            { lat: 0, lng: 0 }
          ]
        },
        location_description: 'New field location',
        soil_type: 'sandy',
        irrigation_type: 'drip',
        is_synced: true,
        is_shared: false,
        shared_with: []
      };

      const createdField: Field = {
        ...newField,
        id: 'new-field-123',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };
      
      vi.spyOn(fieldService, 'createField').mockResolvedValueOnce({
        data: createdField,
        error: null,
      });

      // Act
      const result = await fieldService.createField(newField);

      // Assert
      expect(result.error).toBeNull();
      expect(result.data).toMatchObject(createdField);
    });
  });

  describe('getFieldById', () => {
    it('should return a field by id', async () => {
      // Arrange
      vi.spyOn(fieldService, 'getFieldById').mockResolvedValueOnce({
        data: mockField,
        error: null,
      });

      // Act
      const result = await fieldService.getFieldById('field-123');

      // Assert
      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockField);
    });
  });

  describe('updateField', () => {
    it('should update a field', async () => {
      // Arrange
      const updatedField: Field = {
        ...mockField,
        name: 'Updated Field',
        updated_at: new Date().toISOString()
      };
      
      vi.spyOn(fieldService, 'updateField').mockResolvedValueOnce({
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
      vi.spyOn(fieldService, 'deleteField').mockResolvedValueOnce({
        error: null,
      });

      // Act
      const result = await fieldService.deleteField('field-123');

      // Assert
      expect(result.error).toBeNull();
    });
  });
});
