import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestUser } from './test-utils/user';
import { CropScanner } from '@/components/scanner/CropScanner';
import { analyzeCropImage } from '@/utils/cropScanService';
import { supabase } from '@/services/supabaseClient';

// Mock the crop scan service
vi.mock('@/utils/cropScanService', () => ({
  analyzeCropImage: vi.fn().mockResolvedValue({
    diseaseDetected: 'Powdery Mildew',
    confidenceLevel: 0.95,
    severity: 'low',
    affectedArea: 0.2,
    recommendedTreatments: [
      'Apply sulfur-based fungicide',
      'Improve air circulation',
      'Remove infected leaves'
    ],
    preventiveMeasures: [
      'Use resistant varieties',
      'Maintain good spacing',
      'Water at base'
    ],
    treatmentProducts: [
      {
        name: 'Sulfur Fungicide',
        price: '$15.99',
        effectiveness: 90,
        availability: 'In stock'
      }
    ],
    source: 'PlantNet + Gemini AI',
    timestamp: new Date().toISOString(),
    additionalInfo: 'Detected in early stages'
  })
}));

// Mock Supabase client
describe('Crop Scanning Flow', () => {
  let queryClient;
  let testUser;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup test data
    testUser = createTestUser();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    // Cleanup
  });

  it('should complete full crop scanning flow', async () => {
    // Render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/scan']}>
          <Routes>
            <Route path="/scan" element={<CropScanner />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // 1. Verify initial state
    expect(screen.getByText('Scan Your Crop')).toBeInTheDocument();
    expect(screen.getByText('Capture a clear photo of your crop')).toBeInTheDocument();
    expect(screen.getByText('or')).toBeInTheDocument();
    expect(screen.getByText('Upload an existing photo')).toBeInTheDocument();

    // 2. Test camera functionality
    const cameraButton = screen.getByRole('button', { name: /camera/i });
    fireEvent.click(cameraButton);
    
    // Wait for camera UI to appear
    await waitFor(() => screen.getByText('Camera Preview'));
    
    // Simulate camera capture
    const captureButton = screen.getByRole('button', { name: /capture/i });
    fireEvent.click(captureButton);

    // 3. Verify scanning state
    await waitFor(() => screen.getByText('Analyzing your crop...'));
    expect(screen.getByText('Please wait while we analyze your crop')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // 4. Verify results display
    await waitFor(() => screen.getByText('Scan Results'));
    
    // Disease detection
    expect(screen.getByText('Powdery Mildew')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 95%')).toBeInTheDocument();
    expect(screen.getByText('Severity: Low')).toBeInTheDocument();
    expect(screen.getByText('Affected Area: 20%')).toBeInTheDocument();

    // Treatment recommendations
    expect(screen.getByText('Recommended Treatments')).toBeInTheDocument();
    expect(screen.getByText('Apply sulfur-based fungicide')).toBeInTheDocument();
    expect(screen.getByText('Improve air circulation')).toBeInTheDocument();
    expect(screen.getByText('Remove infected leaves')).toBeInTheDocument();

    // Prevention measures
    expect(screen.getByText('Preventive Measures')).toBeInTheDocument();
    expect(screen.getByText('Use resistant varieties')).toBeInTheDocument();
    expect(screen.getByText('Maintain good spacing')).toBeInTheDocument();
    expect(screen.getByText('Water at base')).toBeInTheDocument();

    // Product recommendations
    expect(screen.getByText('Treatment Products')).toBeInTheDocument();
    expect(screen.getByText('Sulfur Fungicide')).toBeInTheDocument();
    expect(screen.getByText('$15.99')).toBeInTheDocument();
    expect(screen.getByText('Effectiveness: 90%')).toBeInTheDocument();
    expect(screen.getByText('In stock')).toBeInTheDocument();

    // Additional info
    expect(screen.getByText('Additional Information')).toBeInTheDocument();
    expect(screen.getByText('Detected in early stages')).toBeInTheDocument();
    expect(screen.getByText('Source: PlantNet + Gemini AI')).toBeInTheDocument();

    // Verify Supabase function call
    expect(analyzeCropImage).toHaveBeenCalledWith(
      expect.any(File), // The captured image file
      undefined, // cropId
      undefined // location
    );

    // Verify UI elements
    expect(screen.getByRole('button', { name: /share results/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start new scan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view similar cases/i })).toBeInTheDocument();
  });

  it('should handle camera permission denial', async () => {
    // Mock camera permission denial
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
    navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue(new Error('Permission denied'));

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/scan']}>
          <Routes>
            <Route path="/scan" element={<CropScanner />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Click camera button
    const cameraButton = screen.getByRole('button', { name: /camera/i });
    fireEvent.click(cameraButton);

    // Verify error message
    await waitFor(() => screen.getByText('Camera access denied'));
    expect(screen.getByText('Please grant camera permissions to use this feature')).toBeInTheDocument();

    // Cleanup
    navigator.mediaDevices.getUserMedia = originalGetUserMedia;
  });

  it('should handle image upload', async () => {
    // Create mock file
    const mockFile = new File([''], 'test-image.jpg', { type: 'image/jpeg' });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/scan']}>
          <Routes>
            <Route path="/scan" element={<CropScanner />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Find and click upload button
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);

    // Find and interact with file input
    const fileInput = screen.getByLabelText(/select image/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Verify scanning state
    await waitFor(() => screen.getByText('Analyzing your crop...'));
    
    // Verify results display (same as previous test)
    await waitFor(() => screen.getByText('Scan Results'));
    expect(screen.getByText('Powdery Mildew')).toBeInTheDocument();
  });

  it('should handle scan errors gracefully', async () => {
    // Mock error response
    vi.mocked(analyzeCropImage).mockRejectedValueOnce(new Error('Network error'));

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/scan']}>
          <Routes>
            <Route path="/scan" element={<CropScanner />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Upload mock file to trigger scan
    const mockFile = new File([''], 'test-image.jpg', { type: 'image/jpeg' });
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);
    const fileInput = screen.getByLabelText(/select image/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Verify error state
    await waitFor(() => screen.getByText('Error during scan'));
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
