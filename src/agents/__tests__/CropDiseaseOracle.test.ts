import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CropDiseaseOracle, GeoLocation } from '../CropDiseaseOracle';
import { getTestImageBase64 } from '@/utils/testImageUtils';

// Mock fetch
global.fetch = vi.fn();

// Mock environment variables
vi.stubGlobal('process', {
  ...process,
  env: { NODE_ENV: 'test' }
});

describe('CropDiseaseOracle', () => {
  let cropDiseaseOracle: CropDiseaseOracle;
  const mockLocation: GeoLocation = {
    lat: -1.2921,
    lng: 36.8219,
    country: 'Kenya',
    region: 'Nairobi'
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    cropDiseaseOracle = new CropDiseaseOracle();
    
    // Mock fetch for base64 to blob conversion
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.startsWith('data:image/jpeg;base64')) {
        return Promise.resolve({
          blob: () => new Blob(['mock image data'], { type: 'image/jpeg' })
        });
      }
      return Promise.reject(new Error('Unexpected fetch call'));
    });
  });
  
  describe('diagnoseFromImage', () => {
    it('should return fallback analysis when PlantNet API key is not available', async () => {
      // Mock environment without API key
      vi.stubGlobal('import.meta', {
        env: { VITE_PLANTNET_API_KEY: '', VITE_GEMINI_API_KEY: '' }
      });
      
      const imageBase64 = getTestImageBase64('sample_image.jpg');
      const result = await cropDiseaseOracle.diagnoseFromImage(imageBase64, 'maize', mockLocation);
      
      expect(result.disease_name).toBe('General Plant Health Issue');
      expect(result.source_api).toBe('fallback');
      expect(result.symptoms).toHaveLength(2);
      expect(result.immediate_actions).toHaveLength(3);
    });
    
    it('should use test mode response in test environment', async () => {
      const imageBase64 = getTestImageBase64('sick_plant.jpg');
      const result = await cropDiseaseOracle.diagnoseFromImage(imageBase64, 'maize', mockLocation);
      
      expect(result.disease_name).toBe('maize Leaf Spot');
      expect(result.scientific_name).toBe('Cercospora sp.');
      expect(result.confidence).toBe(92);
      expect(result.severity).toBe('critical');
      expect(result.symptoms).toBeDefined();
      expect(result.immediate_actions).toBeDefined();
      expect(result.organic_solutions).toBeDefined();
      expect(result.inorganic_solutions).toBeDefined();
    });
    
    it('should detect healthy plants in test environment', async () => {
      const imageBase64 = getTestImageBase64('healthy_plant.jpg');
      const result = await cropDiseaseOracle.diagnoseFromImage(imageBase64, 'maize', mockLocation);
      
      expect(result.disease_name).toBe('Healthy Plant');
      expect(result.scientific_name).toBe('Healthy specimen');
      expect(result.confidence).toBe(85);
      expect(result.severity).toBe('high');
    });
    
    it('should calculate economic impact based on confidence', async () => {
      const imageBase64 = getTestImageBase64('sick_plant.jpg');
      const result = await cropDiseaseOracle.diagnoseFromImage(imageBase64, 'maize', mockLocation, 5000, 0.5);
      
      expect(result.economic_impact.yield_loss_percentage).toBe(40);
      expect(result.economic_impact.revenue_loss_usd).toBe(1000);
      expect(result.economic_impact.treatment_cost_usd).toBe(25);
    });
    
    it('should provide local suppliers based on location', async () => {
      const imageBase64 = getTestImageBase64('sick_plant.jpg');
      const result = await cropDiseaseOracle.diagnoseFromImage(imageBase64, 'maize', mockLocation);
      
      expect(result.local_suppliers).toHaveLength(2);
      expect(result.local_suppliers[0].location).toBe('Kenya');
      expect(result.local_suppliers[0].products_available.length).toBeGreaterThan(0);
    });
    
    it('should calculate spread risk based on crop type and confidence', async () => {
      // High risk crop with high confidence
      const imageBase64 = getTestImageBase64('sick_plant.jpg');
      const result1 = await cropDiseaseOracle.diagnoseFromImage(imageBase64, 'tomato', mockLocation);
      expect(result1.spread_risk).toBe('high');
      
      // Non-high risk crop with high confidence
      const result2 = await cropDiseaseOracle.diagnoseFromImage(imageBase64, 'wheat', mockLocation);
      expect(result2.spread_risk).toBe('medium');
    });
  });
});