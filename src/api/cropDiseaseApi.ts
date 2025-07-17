/**
 * Crop Disease API
 * Handles API requests for crop disease detection
 */

import { cropDiseaseOracle, DiseaseDetectionResult, GeoLocation } from '@/agents/CropDiseaseOracle';
import { ApiResponseHandler } from '@/utils/apiResponse';
import { getTestImageBase64, isTestEnvironment } from '@/utils/testImageUtils';

/**
 * Process a crop disease detection request
 * @param imageBase64 Base64 encoded image data
 * @param cropType Type of crop
 * @param location Geographic location
 * @param expectedYield Expected yield in kg/ha
 * @param commodityPrice Price per kg in USD
 */
export const processCropDiseaseDetection = async (
  imageBase64: string,
  cropType: string,
  location: GeoLocation,
  expectedYield?: number,
  commodityPrice?: number
): Promise<{ success: boolean; data?: DiseaseDetectionResult; error?: string; status: number }> => {
  try {
    // Validate inputs
    if (!imageBase64) {
      return ApiResponseHandler.error('Image data is required', 400);
    }
    
    if (!cropType) {
      return ApiResponseHandler.error('Crop type is required', 400);
    }
    
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return ApiResponseHandler.error('Valid location coordinates are required', 400);
    }
    
    // Process the image with the CropDiseaseOracle
    const result = await cropDiseaseOracle.diagnoseFromImage(
      imageBase64,
      cropType,
      location,
      expectedYield,
      commodityPrice
    );
    
    // Return the result
    return ApiResponseHandler.success(result);
  } catch (error) {
    console.error('Error in processCropDiseaseDetection:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};

/**
 * Handle a crop disease detection request from a file upload
 * @param file The uploaded image file
 * @param cropType Type of crop
 * @param location Geographic location
 * @param expectedYield Expected yield in kg/ha
 * @param commodityPrice Price per kg in USD
 */
export const handleCropDiseaseDetectionUpload = async (
  file: File | null,
  cropType: string,
  location: GeoLocation,
  expectedYield?: number,
  commodityPrice?: number
): Promise<{ success: boolean; data?: DiseaseDetectionResult; error?: string; status: number }> => {
  try {
    // Handle missing file
    if (!file) {
      // In test environment, use a test image
      if (isTestEnvironment()) {
        console.log('Using test image for crop disease detection');
        const testImageBase64 = getTestImageBase64('sick_plant.jpg');
        return processCropDiseaseDetection(testImageBase64, cropType, location, expectedYield, commodityPrice);
      }
      
      return ApiResponseHandler.error('Image file is required', 400);
    }
    
    // Convert file to base64
    const imageBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1]; // Remove data URL prefix
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
    
    // Process the image
    return processCropDiseaseDetection(imageBase64, cropType, location, expectedYield, commodityPrice);
  } catch (error) {
    console.error('Error in handleCropDiseaseDetectionUpload:', error);
    return ApiResponseHandler.error(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500
    );
  }
};