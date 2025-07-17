import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CropDiseaseDetectionPage from '../CropDiseaseDetectionPage';
import { useAuthContext } from '@/providers/AuthProvider';
import { handleCropDiseaseDetectionUpload } from '@/api/cropDiseaseApi';
import { useToast } from '@/components/ui/use-toast';

// Mock dependencies
vi.mock('@/providers/AuthProvider', () => ({
  useAuthContext: vi.fn()
}));

vi.mock('@/api/cropDiseaseApi', () => ({
  handleCropDiseaseDetectionUpload: vi.fn()
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn()
}));

vi.mock('@/components/crop-disease/DiseaseDetectionResult', () => ({
  DiseaseDetectionResult: ({ result }: any) => (
    <div data-testid="disease-detection-result">
      Disease: {result.disease_name} - Confidence: {result.confidence}%
    </div>
  )
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate
  };
});

describe('CropDiseaseDetectionPage', () => {
  const mockToast = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    (useToast as any).mockReturnValue({
      toast: mockToast
    });
  });
  
  it('should redirect to auth page if user is not logged in', () => {
    (useAuthContext as any).mockReturnValue({
      user: null
    });
    
    render(
      <MemoryRouter>
        <CropDiseaseDetectionPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.getByText('Go to Login')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Go to Login'));
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });
  
  it('should render the disease detection form when user is logged in', () => {
    (useAuthContext as any).mockReturnValue({
      user: { id: 'user123' }
    });
    
    render(
      <MemoryRouter>
        <CropDiseaseDetectionPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Crop Disease Detection')).toBeInTheDocument();
    expect(screen.getByText('Disease Detection')).toBeInTheDocument();
    expect(screen.getByText('Select your crop type')).toBeInTheDocument();
    expect(screen.getByLabelText('Plant Image')).toBeInTheDocument();
  });
  
  it('should handle file selection', () => {
    (useAuthContext as any).mockReturnValue({
      user: { id: 'user123' }
    });
    
    render(
      <MemoryRouter>
        <CropDiseaseDetectionPage />
      </MemoryRouter>
    );
    
    const fileInput = screen.getByLabelText('Plant Image');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Should show preview
    expect(screen.getByAltText('Preview')).toBeInTheDocument();
  });
  
  it('should show error for invalid file type', () => {
    (useAuthContext as any).mockReturnValue({
      user: { id: 'user123' }
    });
    
    render(
      <MemoryRouter>
        <CropDiseaseDetectionPage />
      </MemoryRouter>
    );
    
    const fileInput = screen.getByLabelText('Plant Image');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText('Please select an image file')).toBeInTheDocument();
  });
  
  it('should show error for large file size', () => {
    (useAuthContext as any).mockReturnValue({
      user: { id: 'user123' }
    });
    
    render(
      <MemoryRouter>
        <CropDiseaseDetectionPage />
      </MemoryRouter>
    );
    
    const fileInput = screen.getByLabelText('Plant Image');
    // Create a file larger than 10MB
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    
    expect(screen.getByText('Image size should be less than 10MB')).toBeInTheDocument();
  });
  
  it('should handle successful disease detection', async () => {
    (useAuthContext as any).mockReturnValue({
      user: { id: 'user123' }
    });
    
    const mockResult = {
      disease_name: 'Leaf Spot',
      confidence: 92,
      severity: 'high',
      symptoms: ['Yellow spots'],
      immediate_actions: ['Remove affected leaves']
    };
    
    (handleCropDiseaseDetectionUpload as any).mockResolvedValue({
      success: true,
      data: mockResult
    });
    
    render(
      <MemoryRouter>
        <CropDiseaseDetectionPage />
      </MemoryRouter>
    );
    
    // Select crop type
    const cropSelect = screen.getByRole('combobox');
    fireEvent.click(cropSelect);
    fireEvent.click(screen.getByText('Maize (Corn)'));
    
    // Upload file
    const fileInput = screen.getByLabelText('Plant Image');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Submit form
    const submitButton = screen.getByText('Detect Disease');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(handleCropDiseaseDetectionUpload).toHaveBeenCalledWith(file, 'maize');
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('disease-detection-result')).toBeInTheDocument();
      expect(screen.getByText('Disease: Leaf Spot - Confidence: 92%')).toBeInTheDocument();
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Disease Detection Complete',
      description: 'Detected: Leaf Spot with 92% confidence'
    });
  });
  
  it('should handle detection failure', async () => {
    (useAuthContext as any).mockReturnValue({
      user: { id: 'user123' }
    });
    
    (handleCropDiseaseDetectionUpload as any).mockResolvedValue({
      success: false,
      error: 'Detection failed'
    });
    
    render(
      <MemoryRouter>
        <CropDiseaseDetectionPage />
      </MemoryRouter>
    );
    
    // Select crop type
    const cropSelect = screen.getByRole('combobox');
    fireEvent.click(cropSelect);
    fireEvent.click(screen.getByText('Maize (Corn)'));
    
    // Upload file
    const fileInput = screen.getByLabelText('Plant Image');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Submit form
    const submitButton = screen.getByText('Detect Disease');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Detection failed')).toBeInTheDocument();
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Detection Failed',
      description: 'Detection failed',
      variant: 'destructive'
    });
  });
  
  it('should validate form inputs before submission', () => {
    (useAuthContext as any).mockReturnValue({
      user: { id: 'user123' }
    });
    
    render(
      <MemoryRouter>
        <CropDiseaseDetectionPage />
      </MemoryRouter>
    );
    
    // Try to submit without selecting crop type
    const submitButton = screen.getByText('Detect Disease');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Please select a crop type')).toBeInTheDocument();
    
    // Select crop type but no file
    const cropSelect = screen.getByRole('combobox');
    fireEvent.click(cropSelect);
    fireEvent.click(screen.getByText('Maize (Corn)'));
    
    fireEvent.click(submitButton);
    expect(screen.getByText('Please select an image')).toBeInTheDocument();
  });
  
  it('should reset form when reset button is clicked', () => {
    (useAuthContext as any).mockReturnValue({
      user: { id: 'user123' }
    });
    
    render(
      <MemoryRouter>
        <CropDiseaseDetectionPage />
      </MemoryRouter>
    );
    
    // Select crop type and upload file
    const cropSelect = screen.getByRole('combobox');
    fireEvent.click(cropSelect);
    fireEvent.click(screen.getByText('Maize (Corn)'));
    
    const fileInput = screen.getByLabelText('Plant Image');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Reset form
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    // Form should be cleared
    expect(screen.getByText('Select your crop type')).toBeInTheDocument();
    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
  });
});