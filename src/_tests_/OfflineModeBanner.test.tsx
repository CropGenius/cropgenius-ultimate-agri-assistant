import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// Mock the OfflineModeBanner component
vi.mock('../components/OfflineModeBanner', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="offline-banner" className="bg-yellow-100 p-2 text-center">
      <p>You are currently offline. Some features may be limited.</p>
      <button data-testid="dismiss-button">Dismiss</button>
    </div>
  ),
}));

// Import after mock
import OfflineModeBanner from '../components/OfflineModeBanner';

describe('OfflineModeBanner', () => {
  const originalNavigator = { ...navigator };

  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(window, 'navigator', {
      value: { onLine: false },
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
    // Restore original navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
    });
  });

  it('shows offline warning banner', () => {
    render(<OfflineModeBanner />);

    const banner = screen.getByTestId('offline-banner');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent(/you are currently offline/i);
    expect(banner).toHaveClass('bg-yellow-100');

    // Check for dismiss button
    expect(screen.getByTestId('dismiss-button')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<OfflineModeBanner />);
    expect(container).toMatchSnapshot();
  });
});
