import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';

// Mock the dependencies
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock the console.error
console.error = vi.fn();

// Import the actual implementation
import { getCropRecommendations } from '../src/services/fieldAIService';

describe('AI Crop Recommendations', () => {
  const fieldId = 'test-field-123';
  const mockCropRecommendations = {
    crops: [
      {
        name: 'Maize',
        confidence: 0.87,
        description: 'Well-suited to your soil type and climate conditions.',
        rotationBenefit: 'Good rotation option after legumes.'
      },
      {
        name: 'Cassava',
        confidence: 0.81,
        description: 'Highly tolerant to drought conditions in your area.',
        rotationBenefit: 'Can grow in poorer soils after other crops.'
      },
      {
        name: 'Sweet Potatoes',
        confidence: 0.75,
        description: 'Good fit for your sandy loam soil type.',
        rotationBenefit: 'Excellent after grains or maize.'
      },
      {
        name: 'Groundnuts',
        confidence: 0.69,
        description: 'Will improve soil nitrogen for subsequent crops.',
        rotationBenefit: 'Plant before cereal crops for nitrogen benefits.'
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return crop recommendations successfully', async () => {
    // Call the function directly since it's a pure function
    const result = await getCropRecommendations('test-field-123');
    
    // Check the structure of the response
    expect(result).toHaveProperty('crops');
    expect(Array.isArray(result.crops)).toBe(true);
    
    // Check each crop has required properties
    result.crops.forEach(crop => {
      expect(crop).toHaveProperty('name');
      expect(crop).toHaveProperty('confidence');
      expect(crop).toHaveProperty('description');
      expect(crop).toHaveProperty('rotationBenefit');
      
      // Check types
      expect(typeof crop.name).toBe('string');
      expect(typeof crop.confidence).toBe('number');
      expect(crop.confidence).toBeGreaterThan(0);
      expect(crop.confidence).toBeLessThanOrEqual(1);
      expect(typeof crop.description).toBe('string');
      expect(typeof crop.rotationBenefit).toBe('string');
    });
    
    // Check that crops are sorted by confidence (highest first)
    const confidences = result.crops.map(c => c.confidence);
    const sortedConfidences = [...confidences].sort((a, b) => b - a);
    expect(confidences).toEqual(sortedConfidences);
  });

  it('should return the expected number of crop recommendations', async () => {
    const result = await getCropRecommendations('test-field-123');
    expect(result.crops.length).toBeGreaterThan(0);
    expect(result.crops.length).toBeLessThan(10); // Reasonable upper limit
  });
  
  it('should handle errors gracefully', async () => {
    // Save the original implementation
    const originalImplementation = getCropRecommendations;
    
    try {
      // Mock the implementation to throw an error
      vi.spyOn(global, 'setTimeout').mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      
      // Call the function and expect it to handle the error
      const result = await getCropRecommendations('test-field-123');
      
      // Should return empty crops array on error
      expect(result).toEqual({ crops: [] });
      
      // Verify the error was logged
      expect(console.error).toHaveBeenCalledWith('Error getting crop recommendations:', expect.any(Error));
    } finally {
      // Restore the original implementation
      vi.restoreAllMocks();
    }
  });
});
