import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTestImagePath, getTestImageBase64, createTestImageFile, isTestEnvironment } from '../testImageUtils';
import { existsSync, readFileSync } from 'fs';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn()
}));

// Mock path module
vi.mock('path', () => ({
  join: (...args: string[]) => args.join('/')
}));

describe('testImageUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock process.cwd
    vi.stubGlobal('process', {
      ...process,
      cwd: () => '/test/path'
    });
    
    // Mock atob for base64 decoding
    global.atob = vi.fn((str) => Buffer.from(str, 'base64').toString('binary'));
  });
  
  describe('getTestImagePath', () => {
    it('should return the path from test-assets directory if it exists', () => {
      (existsSync as any).mockImplementation((path: string) => {
        return path === '/test/path/src/test-assets/images/test.jpg';
      });
      
      const result = getTestImagePath('test.jpg');
      
      expect(existsSync).toHaveBeenCalledWith('/test/path/src/test-assets/images/test.jpg');
      expect(result).toBe('/test/path/src/test-assets/images/test.jpg');
    });
    
    it('should return the path from public directory if test-assets does not exist', () => {
      (existsSync as any).mockImplementation((path: string) => {
        return path === '/test/path/public/images/test.jpg';
      });
      
      const result = getTestImagePath('test.jpg');
      
      expect(existsSync).toHaveBeenCalledWith('/test/path/src/test-assets/images/test.jpg');
      expect(existsSync).toHaveBeenCalledWith('/test/path/public/images/test.jpg');
      expect(result).toBe('/test/path/public/images/test.jpg');
    });
    
    it('should throw an error if the image is not found', () => {
      (existsSync as any).mockReturnValue(false);
      
      expect(() => getTestImagePath('test.jpg')).toThrow('Test image not found: test.jpg');
    });
  });
  
  describe('getTestImageBase64', () => {
    it('should return base64 string for existing image', () => {
      (existsSync as any).mockReturnValue(true);
      (readFileSync as any).mockReturnValue(Buffer.from('test image data'));
      
      const result = getTestImageBase64('test.jpg');
      
      expect(readFileSync).toHaveBeenCalled();
      expect(result).toBe('dGVzdCBpbWFnZSBkYXRh');
    });
    
    it('should return fallback image for disease image if file not found', () => {
      (existsSync as any).mockReturnValue(false);
      
      const result = getTestImageBase64('sick_plant.jpg');
      
      expect(result).toBe('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    });
    
    it('should return fallback image for healthy image if file not found', () => {
      (existsSync as any).mockReturnValue(false);
      
      const result = getTestImageBase64('healthy_plant.jpg');
      
      expect(result).toBe('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    });
    
    it('should return transparent fallback image if file not found and name is generic', () => {
      (existsSync as any).mockReturnValue(false);
      
      const result = getTestImageBase64('generic.jpg');
      
      expect(result).toBe('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
    });
  });
  
  describe('createTestImageFile', () => {
    it('should create a File object from an existing image', () => {
      (existsSync as any).mockReturnValue(true);
      (readFileSync as any).mockReturnValue(Buffer.from('test image data'));
      
      const result = createTestImageFile('test.jpg');
      
      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe('test.jpg');
      expect(result.type).toBe('image/jpeg');
    });
    
    it('should create a File object with custom name', () => {
      (existsSync as any).mockReturnValue(true);
      (readFileSync as any).mockReturnValue(Buffer.from('test image data'));
      
      const result = createTestImageFile('test.jpg', 'custom.jpg');
      
      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe('custom.jpg');
    });
    
    it('should create a mock File object if image not found', () => {
      (existsSync as any).mockReturnValue(false);
      
      const result = createTestImageFile('test.jpg');
      
      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe('test.jpg');
      expect(result.type).toBe('image/png');
    });
  });
  
  describe('isTestEnvironment', () => {
    it('should return true if NODE_ENV is test', () => {
      vi.stubGlobal('process', {
        ...process,
        env: { NODE_ENV: 'test' }
      });
      
      expect(isTestEnvironment()).toBe(true);
    });
    
    it('should return true if VITEST is defined', () => {
      vi.stubGlobal('process', {
        ...process,
        env: { VITEST: 'true' }
      });
      
      expect(isTestEnvironment()).toBe(true);
    });
    
    it('should return true if JEST_WORKER_ID is defined', () => {
      vi.stubGlobal('process', {
        ...process,
        env: { JEST_WORKER_ID: '1' }
      });
      
      expect(isTestEnvironment()).toBe(true);
    });
    
    it('should return false if not in test environment', () => {
      vi.stubGlobal('process', {
        ...process,
        env: { NODE_ENV: 'development' }
      });
      
      expect(isTestEnvironment()).toBe(false);
    });
  });
});