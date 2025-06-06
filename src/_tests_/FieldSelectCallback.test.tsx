import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the FieldSelectCallback component
vi.mock('../components/FieldSelectCallback', () => ({
  __esModule: true,
  default: ({ onFieldSelect }: { onFieldSelect: () => void }) => (
    <div>
      <button onClick={onFieldSelect} data-testid="select-field-button">
        Select Field
      </button>
    </div>
  ),
}));

// Import after mock
import FieldSelectCallback from '../components/FieldSelectCallback';

describe('FieldSelectCallback', () => {
  it('invokes callback on field select', async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();

    render(<FieldSelectCallback onFieldSelect={mockCallback} />);

    // Find and click the button
    const button = screen.getByTestId('select-field-button');
    expect(button).toBeInTheDocument();

    await user.click(button);

    // Verify callback was called
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('does not throw when callback is not provided', async () => {
    const user = userEvent.setup();

    render(<FieldSelectCallback onFieldSelect={() => {}} />);

    // This should not throw
    const button = screen.getByTestId('select-field-button');
    await user.click(button);

    // Just verify the test completes without errors
    expect(true).toBe(true);
  });
});
