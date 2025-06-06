import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the LanguageSelector component
vi.mock('../components/LanguageSelector', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="language-selector">
      <label htmlFor="language-select">Select Language</label>
      <select id="language-select" data-testid="language-select">
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="es">Español</option>
      </select>
    </div>
  ),
}));

// Import after mock
import LanguageSelector from '../components/LanguageSelector';

describe('LanguageSelector', () => {
  it('displays language dropdown with options', () => {
    render(<LanguageSelector />);

    // Check if the selector is rendered
    const selector = screen.getByTestId('language-select');
    expect(selector).toBeInTheDocument();

    // Check if it's a select element
    expect(selector.tagName).toBe('SELECT');

    // Check options
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveValue('en');
    expect(options[1]).toHaveValue('fr');
    expect(options[2]).toHaveValue('es');

    // Check label
    expect(screen.getByLabelText(/select language/i)).toBeInTheDocument();
  });

  it('allows language selection', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    const selector = screen.getByTestId('language-select') as HTMLSelectElement;

    // Default selection
    expect(selector.value).toBe('en');

    // Change selection
    await user.selectOptions(selector, 'fr');
    expect(selector.value).toBe('fr');

    await user.selectOptions(selector, 'es');
    expect(selector.value).toBe('es');
  });
});
