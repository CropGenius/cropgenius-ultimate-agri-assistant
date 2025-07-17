import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleCropDiseaseDetectionUpload } from '../cropDiseaseApi';
import { createTestImageFile } from '@/utils/testImageUtils';

// Mock dependencies
vi.mock('../cropDiseaseApi', () => ({
  handleCropDiseaseDetectionUpload: vi.fn()
}));

vi.mock('@/utils/testImageUtils', () => ({
  createTestImageFile: vi.fn()
}));

// Mock fetch
global.fetch = vi.fn();

describe('cropDiseaseEndpoint', () => {
  const mockLocation = {
    lat: -1.2921,
    lng: 36.8219,
    country: 'Kenya',
    region: 'Nairobi'
  };
  
  const mockDetectionResult = {
    disease_name: 'Maize Leaf Spot',
    scientific_name: 'Cercospora zeae-maydis',
    confidence: 92,
    confidence_score: '92%',
    severity: 'high',
    symptoms: ['Leaf spots', 'Yellowing'],
    immediate_actions: ['Remove affected leaves'],
    treatment_recommendations: ['Apply fungicide', 'Improve air circulation'],
    source_api: 'plantnet',
    timestamp: new Date().toISOString()
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock handleCropDiseaseDetectionUpload
    (handleCropDiseaseDetectionUpload as any).mockResolvedValue({
      success: true,
      data: mockDetectionResult,
      status: 200
    });
    
    // Mock createTestImageFile
    (createTestImageFile as any).mockReturnValue(new File(['test'], 'test.jpg', { type: 'image/jpeg' }));
    
    // Mock fetch
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockDetectionResult,
        status: 200
      })
    });
  });
  
  it('should return proper JSON response for successful detection', async () => {
    // Create form data with test image
    const formData = new FormData();
    formData.append('image', createTestImageFile('test_image.jpg'));
    formData.append('cropType', 'maize');
    formData.append('lat', mockLocation.lat.toString());
    formData.append('lng', mockLocation.lng.toString());
    
    // Make request to endpoint
    const response = await fetch('https://cropgenius.africa/crop-disease-detection', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    expect(response.ok).toBe(true);
    
    const result = await response.json();
    
    expect(result).toEqual({
      success: true,
      data: mockDetectionResult,
      status: 200
    });
  });
  
  it('should handle error responses with proper JSON format', async () => {
    // Mock error response
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: 'Invalid input parameters',
        status: 400
      })
    });
    
    // Make request to endpoint
    const response = await fetch('https://cropgenius.africa/crop-disease-detection', {
      method: 'POST',
      body: new FormData(),
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    expect(response.ok).toBe(false);
    
    const result = await response.json();
    
    expect(result).toEqual({
      success: false,
      error: 'Invalid input parameters',
      status: 400
    });
  });
  
  it('should handle server errors with proper JSON format', async () => {
    // Mock server error
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        error: 'Internal server error',
        status: 500
      })
    });
    
    // Make request to endpoint
    const response = await fetch('https://cropgenius.africa/crop-disease-detection', {
      method: 'POST',
      body: new FormData(),
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    expect(response.ok).toBe(false);
    
    const result = await response.json();
    
    expect(result).toEqual({
      success: false,
      error: 'Internal server error',
      status: 500
    });
  });
  
  it('should handle authentication errors with proper JSON format', async () => {
    // Mock authentication error
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        error: 'Authentication required',
        status: 401
      })
    });
    
    // Make request to endpoint without auth header
    const response = await fetch('https://cropgenius.africa/crop-disease-detection', {
      method: 'POST',
      body: new FormData()
    });
    
    expect(response.ok).toBe(false);
    
    const result = await response.json();
    
    expect(result).toEqual({
      success: false,
      error: 'Authentication required',
      status: 401
    });
  });
});