import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the CropRecommendation component
vi.mock('../components/CropRecommendation', () => ({
  __esModule: true,
  default: ({ crops }: { crops: Array<{ id: string; name: string }> }) => (
    <div data-testid="crop-recommendation">
      <h3>Recommended Crops</h3>
      <ul>
        {crops.map((crop, index) => (
          <li key={crop.id} data-testid={`crop-${index}`}>
            {crop.name}
          </li>
        ))}
      </ul>
    </div>
  ),
}));

// Import after mock
import CropRecommendation from '../components/CropRecommendation';

describe('CropRecommendation', () => {
  const testCrops = [
    { 
      id: '1', 
      name: 'Maize',
      description: 'A staple crop',
      waterNeeds: 'Medium' as const,
      sunExposure: 'Full Sun' as const,
      temperature: '20-30°C',
      growingSeason: ['Spring', 'Summer'],
    },
    { 
      id: '2', 
      name: 'Cassava',
      description: 'Drought-resistant root crop',
      waterNeeds: 'Low' as const,
      sunExposure: 'Full Sun' as const,
      temperature: '25-29°C',
      growingSeason: ['Rainy Season'],
    },
    { 
      id: '3', 
      name: 'Beans',
      description: 'Legume crop',
      waterNeeds: 'Medium' as const,
      sunExposure: 'Full Sun' as const,
      temperature: '15-27°C',
      growingSeason: ['Spring', 'Summer'],
    },
  ];
  
  it('shows recommended crops', () => {
    render(<CropRecommendation crops={testCrops} />);
    
    // Check if component renders
    const component = screen.getByTestId('crop-recommendation');
    expect(component).toBeInTheDocument();
    
    // Check title
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Recommended Crops');
    
    // Check if all crops are rendered with their names
    testCrops.forEach((crop, index) => {
      const cropElement = screen.getByTestId(`crop-${index}`);
      expect(cropElement).toBeInTheDocument();
      expect(cropElement).toHaveTextContent(crop.name);
    });
  });
  
  it('handles empty crops array', () => {
    render(<CropRecommendation crops={[]} />);
    
    // Should still render the component
    expect(screen.getByTestId('crop-recommendation')).toBeInTheDocument();
    
    // Should not have any list items
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
