import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import FieldMap from '@/components/fields/FieldMap';
import { Boundary } from '@/types/field';

// Mock the canvas methods
class MockCanvasRenderingContext2D {
  clearRect() {}
  beginPath() {}
  moveTo() {}
  lineTo() {}
  stroke() {}
  fill() {}
  closePath() {}
  setLineDash() {}
  arc() {}
  strokeStyle = '';
  fillStyle = '';
  lineWidth = 1;
  fillRect() {}
  rect() {}
}

// Mock the HTMLCanvasElement
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => new MockCanvasRenderingContext2D() as any);

global.HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
  top: 0,
  left: 0,
  width: 500,
  height: 500,
  right: 500,
  bottom: 500,
  x: 0,
  y: 0,
  toJSON: () => {},
}));

// Mock geolocation API
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
};

global.navigator.geolocation = mockGeolocation as any;

describe('FieldMap Component', () => {
  const mockOnBoundaryChange = vi.fn();
  const defaultProps = {
    initialBoundary: null,
    onBoundaryChange: mockOnBoundaryChange,
    readOnly: false,
  };
  
  const mockBoundary: Boundary = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
          [0, 0],
        ],
      ],
    },
  };
  
  // Mock the canvas dimensions
  Object.defineProperties(global.HTMLElement.prototype, {
    offsetWidth: {
      get: () => 500,
    },
    offsetHeight: {
      get: () => 500,
    },
  });
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the canvas mock
    (global.HTMLCanvasElement.prototype.getContext as any).mockClear();
  });

  it('renders the map container', () => {
    render(<FieldMap {...defaultProps} />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveClass('w-full', 'h-full', 'cursor-default');
  });

  it('displays initial boundary when provided', () => {
    render(<FieldMap {...defaultProps} initialBoundary={mockBoundary} />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('calls onBoundaryChange when boundary is updated', async () => {
    render(<FieldMap {...defaultProps} />);
    
    // The canvas is rendered inside a Card component
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      throw new Error('Canvas not found');
    }
    
    // First, click the draw button to enable drawing mode
    const drawButton = screen.getByText('Draw Field');
    fireEvent.click(drawButton);
    
    // Simulate clicking on the canvas to draw a point
    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.mouseUp(canvas);
    
    // Verify the callback was called
    await waitFor(() => {
      expect(mockOnBoundaryChange).toHaveBeenCalled();
    });
  });

  it('disables drawing in readOnly mode', () => {
    render(<FieldMap {...defaultProps} readOnly={true} />);
    
    // The canvas is rendered inside a Card component
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      throw new Error('Canvas not found');
    }
    
    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.mouseUp(canvas);
    
    // Should not call the callback in readOnly mode
    expect(mockOnBoundaryChange).not.toHaveBeenCalled();
  });
  
  it('handles geolocation when available', async () => {
    // Mock successful geolocation
    const mockCoords = {
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 1,
    };
    
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) =>
      (success as any)({
        coords: mockCoords,
        timestamp: Date.now(),
      })
    );
    
    render(<FieldMap {...defaultProps} />);
    
    // Verify geolocation was requested
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });
  
  it('handles geolocation error', async () => {
    // Mock geolocation error
    mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error) => {
      if (error) {
        error({
          code: 1,
          message: 'User denied Geolocation',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as any);
      }
    });
    
    // Mock console.error to avoid test output pollution
    const originalError = console.error;
    console.error = vi.fn();
    
    render(<FieldMap {...defaultProps} />);
    
    // Verify error handling (we're just checking that it doesn't throw)
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalError;
  });
  
  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(<FieldMap {...defaultProps} />);
    
    // Get the window and spy on removeEventListener
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    // Unmount the component
    unmount();
    
    // Verify window event listeners were removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    
    // Clean up
    removeEventListenerSpy.mockRestore();
  });
});
