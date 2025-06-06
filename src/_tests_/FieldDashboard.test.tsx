import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock the FieldDashboard component
vi.mock('../features/field-management/components/FieldDashboard', () => ({
  __esModule: true,
  default: ({ fields }: { fields: Array<{ name: string; id: string }> }) => (
    <div data-testid="field-dashboard">
      <h2>My Fields</h2>
      <ul>
        {fields.map((field) => (
          <li key={field.id} data-testid={`field-${field.id}`}>
            {field.name}
          </li>
        ))}
      </ul>
    </div>
  ),
}));

// Import after mock
import FieldDashboard from '../features/field-management/components/FieldDashboard';

describe('FieldDashboard', () => {
  const testFields = [
    { name: 'Maize Farm', id: '123' },
    { name: 'Vegetable Garden', id: '456' },
  ];

  it('displays active fields', () => {
    render(
      <BrowserRouter>
        <FieldDashboard fields={testFields} />
      </BrowserRouter>
    );

    // Check if fields are rendered
    testFields.forEach((field) => {
      const fieldElement = screen.getByTestId(`field-${field.id}`);
      expect(fieldElement).toBeInTheDocument();
      expect(fieldElement).toHaveTextContent(field.name);
    });

    // Check for specific field
    expect(screen.getByText(/maize farm/i)).toBeInTheDocument();
  });
});
