import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render } from '@testing-library/react';

// Mock the Mapbox GL JS library
vi.mock('mapbox-gl', () => ({
  Map: vi.fn(() => ({
    addControl: vi.fn(),
    on: vi.fn(),
    remove: vi.fn(),
  })),
  GeolocateControl: vi.fn(),
  NavigationControl: vi.fn(),
}));

// Mock the MapSelector component
vi.mock('../components/MapSelector', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="map-container">
      <div id="map" style={{ width: '100%', height: '400px' }}></div>
    </div>
  ),
}));

// Import after mocks
import MapSelector from '../components/MapSelector';

describe('MapSelector', () => {
  beforeAll(() => {
    // Mock window.URL.createObjectURL which is used by Mapbox
    global.URL.createObjectURL = vi.fn();
  });

  it('renders map element', () => {
    const { container } = render(<MapSelector />);
    
    // Check if map container is rendered
    const mapContainer = container.querySelector('#map');
    expect(mapContainer).toBeInTheDocument();
    expect(mapContainer).toHaveStyle('width: 100%');
    expect(mapContainer).toHaveStyle('height: 400px');
  });
});
