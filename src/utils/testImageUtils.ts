/**
 * Test Image Utilities
 * Provides utilities for working with test images
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Base64 encoded 1x1 pixel images for fallback
const FALLBACK_IMAGES = {
  // 1x1 transparent pixel
  transparent: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  // 1x1 red pixel (for disease simulation)
  disease: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  // 1x1 green pixel (for healthy plant simulation)
  healthy: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
};

/**
 * Get the path to a test image
 * @param imageName The name of the image file
 * @returns The path to the image file
 */
export const getTestImagePath = (imageName: string): string => {
  // Check if running in Node.js environment
  if (typeof process !== 'undefined' && process.cwd) {
    // Try to find the image in the test-assets directory
    const testAssetsPath = join(process.cwd(), 'src', 'test-assets', 'images', imageName);
    if (existsSync(testAssetsPath)) {
      return testAssetsPath;
    }
    
    // Try to find the image in the public directory
    const publicPath = join(process.cwd(), 'public', 'images', imageName);
    if (existsSync(publicPath)) {
      return publicPath;
    }
  }
  
  // If we can't find the image, throw an error
  throw new Error(`Test image not found: ${imageName}`);
};

/**
 * Get a test image as a base64 string
 * @param imageName The name of the image file
 * @returns The image as a base64 string
 */
export const getTestImageBase64 = (imageName: string): string => {
  try {
    // Try to get the image from the file system
    const imagePath = getTestImagePath(imageName);
    const imageBuffer = readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.warn(`Failed to load test image ${imageName}, using fallback image`);
    
    // Use fallback image based on name
    if (imageName.includes('disease') || imageName.includes('sick')) {
      return FALLBACK_IMAGES.disease;
    } else if (imageName.includes('healthy')) {
      return FALLBACK_IMAGES.healthy;
    } else {
      return FALLBACK_IMAGES.transparent;
    }
  }
};

/**
 * Create a mock File object from a test image
 * @param imageName The name of the image file
 * @param fileName Optional file name to use (defaults to imageName)
 * @returns A File object containing the image
 */
export const createTestImageFile = (imageName: string, fileName?: string): File => {
  try {
    // Try to get the image from the file system
    const imagePath = getTestImagePath(imageName);
    const imageBuffer = readFileSync(imagePath);
    
    // Create a Blob from the buffer
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    
    // Create a File from the Blob
    return new File([blob], fileName || imageName, { type: 'image/jpeg' });
  } catch (error) {
    console.warn(`Failed to load test image ${imageName}, creating mock image file`);
    
    // Create a mock image based on name
    let base64Data: string;
    if (imageName.includes('disease') || imageName.includes('sick')) {
      base64Data = FALLBACK_IMAGES.disease;
    } else if (imageName.includes('healthy')) {
      base64Data = FALLBACK_IMAGES.healthy;
    } else {
      base64Data = FALLBACK_IMAGES.transparent;
    }
    
    // Convert base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create a Blob from the binary data
    const blob = new Blob([bytes], { type: 'image/png' });
    
    // Create a File from the Blob
    return new File([blob], fileName || imageName, { type: 'image/png' });
  }
};

/**
 * Check if we're in a test environment
 */
export const isTestEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'test' || 
         process.env.VITEST !== undefined || 
         process.env.JEST_WORKER_ID !== undefined;
};