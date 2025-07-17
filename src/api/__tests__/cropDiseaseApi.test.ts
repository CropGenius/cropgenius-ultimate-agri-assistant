import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processCropDiseaseDetection, handleCropDiseaseDetectionUpload } from '../cropDiseaseApi';
import { cropDiseaseOracle } from '@/agents/CropDiseaseOracle';
import { getTestImageBase64, isTestEnvironment } from '@/utils/testImageUtils';
import { ApiResponseHandler } from '@/utils/apiResponse';

// Mock dependencies
vi.mock('@/agents/CropDiseaseOracle', () => ({
  cropDiseaseOracle: {
    diagnoseFromImage: vi.fn()
  }
}));

vi.mock('@/utils/testImageUtils', () => ({
  getTestImageBase64: vi.fn(),
  isTestEnvironment: vi.fn()
}));

vi.mock('@/utils/apiResponse', () => ({
  ApiResponseHandler: {
    success: vi.fn((data) => ({
      success: true,
      data,
      status: 200,
      timestamp: expect.any(String)
    })),
    error: vi.fn((message, status) => ({
      success: false,
      error: message,
      status: status || 500,
      timestamp: expect.any(String)
    }))
  }
}));

describe('cropDiseaseApi', () => {
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
    severity: 'high',
    symptoms: ['Leaf spots', 'Yellowing'],
    immediate_actions: ['Remove affected leaves'],
    source_api: 'plantnet',
    timestamp: new Date().toISOString()
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock cropDiseaseOracle.diagnoseFromImage
    (cropDiseaseOracle.diagnoseFromImage as any).mockResolvedValue(mockDetectionResult);
    
    // Mock getTestImageBase64
    (getTestImageBase64 as any).mockReturnValue('test-image-base64');
    
    // Mock isTestEnvironment
    (isTestEnvironment as any).mockReturnValue(true);
  });
  
  describe('processCropDiseaseDetection', () => {
    it('should return error if image data is missing', async () => {
      const result = await processCropDiseaseDetection('', 'maize', mockLocation);
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Image data is required', 400);
      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
    
    it('should return error if crop type is missing', async () => {
      const result = await processCropDiseaseDetection('base64-image', '', mockLocation);
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Crop type is required', 400);
      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
    
    it('should return error if location is invalid', async () => {
      const result = await processCropDiseaseDetection('base64-image', 'maize', {} as any);
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Valid location coordinates are required', 400);
      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
    
    it('should process image and return detection result', async () => {
      const result = await processCropDiseaseDetection('base64-image', 'maize', mockLocation, 3500, 0.35);
      
      expect(cropDiseaseOracle.diagnoseFromImage).toHaveBeenCalledWith(
        'base64-image',
        'maize',
        mockLocation,
        3500,
        0.35
      );
      
      expect(ApiResponseHandler.success).toHaveBeenCalledWith(mockDetectionResult);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDetectionResult);
    });
    
    it('should handle errors during processing', async () => {
      const error = new Error('API error');
      (cropDiseaseOracle.diagnoseFromImage as any).mockRejectedValue(error);
      
      const result = await processCropDiseaseDetection('base64-image', 'maize', mockLocation);
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('API error', 500);
      expect(result.success).toBe(false);
      expect(result.status).toBe(500);
    });
  });
  
  describe('handleCropDiseaseDetectionUpload', () => {
    it('should use test image in test environment when file is missing', async () => {
      const result = await handleCropDiseaseDetectionUpload(null, 'maize', mockLocation);
      
      expect(isTestEnvironment).toHaveBeenCalled();
      expect(getTestImageBase64).toHaveBeenCalledWith('sick_plant.jpg');
      expect(cropDiseaseOracle.diagnoseFromImage).toHaveBeenCalledWith(
        'test-image-base64',
        'maize',
        mockLocation,
        undefined,
        undefined
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDetectionResult);
    });
    
    it('should return error if file is missing in production environment', async () => {
      (isTestEnvironment as any).mockReturnValue(false);
      
      const result = await handleCropDiseaseDetectionUpload(null, 'maize', mockLocation);
      
      expect(ApiResponseHandler.error).toHaveBeenCalledWith('Image file is required', 400);
      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
    
    it('should process file upload and return detection result', async () => {
      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: 'data:image/jpeg;base64,test-file-base64'
      };
      
      global.FileReader = vi.fn(() => mockFileReader) as any;
      
      // Create a mock file
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Start the process
      const resultPromise = handleCropDiseaseDetectionUpload(mockFile, 'maize', mockLocation);
      
      // Simulate FileReader onload
      mockFileReader.onload();
      
      // Wait for the result
      const result = await resultPromise;
      
      expect(cropDiseaseOracle.diagnoseFromImage).toHaveBeenCalledWith(
        'test-file-base64',
        'maize',
        mockLocation,
        undefined,
        undefined
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDetectionResult);
    });
    
    it('should handle file reading errors', async () => {
      // Mock FileReader with error
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onload: null as any,
        onerror: null as any
      };
      
      global.FileReader = vi.fn(() => mockFileReader) as any;
      
      // Create a mock file
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Start the process
      const resultPromise = handleCropDiseaseDetectionUpload(mockFile, 'maize', mockLocation);
      
      // Simulate FileReader onerror
      mockFileReader.onerror(new Error('File read error'));
      
      try {
        await resultPromise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(ApiResponseHandler.error).toHaveBeenCalledWith('Failed to read file', 500);
      }
    });
  });
});