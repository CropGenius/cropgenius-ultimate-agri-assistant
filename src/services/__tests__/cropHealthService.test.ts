import { CropHealthService, CropHealthAnalysis } from '../cropHealthService';

describe('CropHealthService', () => {
  let service: CropHealthService;

  beforeEach(() => {
    service = CropHealthService.getInstance();
  });

  describe('validateImage', () => {
    it('should throw error for invalid image format', () => {
      const invalidImage = 'invalid-base64-data';
      expect(() => {
        // @ts-ignore - accessing private method for testing
        service.validateImage(invalidImage);
      }).toThrow('Invalid image format');
    });

    it('should throw error for unsupported image type', () => {
      const unsupportedImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      expect(() => {
        // @ts-ignore - accessing private method for testing
        service.validateImage(unsupportedImage);
      }).toThrow('Unsupported image type');
    });

    it('should throw error for image exceeding size limit', () => {
      // Create a large base64 string
      const largeImage = 'data:image/jpeg;base64,' + 'A'.repeat(7 * 1024 * 1024);
      expect(() => {
        // @ts-ignore - accessing private method for testing
        service.validateImage(largeImage);
      }).toThrow('Image size exceeds the maximum limit');
    });

    it('should accept valid image data', () => {
      const validImage = 'data:image/jpeg;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      expect(() => {
        // @ts-ignore - accessing private method for testing
        service.validateImage(validImage);
      }).not.toThrow();
    });
  });

  describe('processImage', () => {
    it('should extract base64 data from image string', async () => {
      const imageData = 'data:image/jpeg;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      // @ts-ignore - accessing private method for testing
      const result = await service.processImage(imageData);
      expect(result).toBe('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    });

    it('should throw error for invalid image data', async () => {
      const invalidImage = 'invalid-data';
      await expect(async () => {
        // @ts-ignore - accessing private method for testing
        await service.processImage(invalidImage);
      }).rejects.toThrow('Failed to process image');
    });
  });

  describe('buildPrompt', () => {
    it('should build prompt with context', () => {
      const context = {
        region: 'Northern Ghana',
        crop: 'Maize',
        season: 'Rainy',
        symptoms: 'Brown lesions on leaves'
      };
      // @ts-ignore - accessing private method for testing
      const prompt = service.buildPrompt(context);
      expect(prompt).toContain('Northern Ghana');
      expect(prompt).toContain('Maize');
      expect(prompt).toContain('Rainy');
      expect(prompt).toContain('Brown lesions on leaves');
    });

    it('should build prompt without context', () => {
      // @ts-ignore - accessing private method for testing
      const prompt = service.buildPrompt({});
      expect(prompt).toContain('You are a crop health AI');
    });
  });

  describe('validateAndFormatResponse', () => {
    it('should validate and return correct response', () => {
      const validResponse = {
        crop: 'Maize',
        diagnosis: 'Northern Leaf Blight',
        confidence: 'High',
        organic_remedy: 'Apply neem oil solution',
        inorganic_remedy: 'Use fungicide X',
        farmer_explanation: 'Your maize has a common fungal disease',
        alternatives: [
          {
            issue: 'Southern Rust',
            confidence: 'Low'
          }
        ]
      };
      // @ts-ignore - accessing private method for testing
      const result = service.validateAndFormatResponse(validResponse);
      expect(result).toEqual(validResponse);
    });

    it('should throw error for missing required fields', () => {
      const invalidResponse = {
        crop: 'Maize',
        // Missing other required fields
      };
      expect(() => {
        // @ts-ignore - accessing private method for testing
        service.validateAndFormatResponse(invalidResponse);
      }).toThrow('Missing required field');
    });

    it('should throw error for invalid confidence value', () => {
      const invalidResponse = {
        crop: 'Maize',
        diagnosis: 'Northern Leaf Blight',
        confidence: 'Invalid',
        organic_remedy: 'Apply neem oil solution',
        inorganic_remedy: 'Use fungicide X',
        farmer_explanation: 'Your maize has a common fungal disease',
        alternatives: [
          {
            issue: 'Southern Rust',
            confidence: 'Low'
          }
        ]
      };
      expect(() => {
        // @ts-ignore - accessing private method for testing
        service.validateAndFormatResponse(invalidResponse);
      }).toThrow('Invalid confidence value');
    });
  });

  describe('analyzeCropHealth', () => {
    it('should analyze crop health with valid input', async () => {
      const imageData = 'data:image/jpeg;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      const context = {
        region: 'Northern Ghana',
        crop: 'Maize',
        season: 'Rainy',
        symptoms: 'Brown lesions on leaves'
      };

      // Mock the client response
      const mockResponse = {
        text: JSON.stringify({
          crop: 'Maize',
          diagnosis: 'Northern Leaf Blight',
          confidence: 'High',
          organic_remedy: 'Apply neem oil solution',
          inorganic_remedy: 'Use fungicide X',
          farmer_explanation: 'Your maize has a common fungal disease',
          alternatives: [
            {
              issue: 'Southern Rust',
              confidence: 'Low'
            }
          ]
        })
      };

      // @ts-ignore - mocking client
      service.client = {
        models: {
          generateContent: jest.fn().mockResolvedValue(mockResponse)
        }
      };

      const result = await service.analyzeCropHealth(imageData, context);
      expect(result).toEqual(JSON.parse(mockResponse.text));
    });

    it('should throw error for invalid image data', async () => {
      const invalidImage = 'invalid-data';
      await expect(service.analyzeCropHealth(invalidImage)).rejects.toThrow('Invalid image format');
    });
  });
}); 