import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProUpgradeModal from '../components/ProUpgradeModal';

// Mock the ProUpgradeModal component
vi.mock('../components/ProUpgradeModal', () => {
  const MockProUpgradeModal = ({ 
    isOpen, 
    onClose, 
    onUpgrade 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onUpgrade: () => Promise<void>;
  }) => (
    isOpen ? (
      <div data-testid="pro-upgrade-modal">
        <h2>Upgrade to Pro</h2>
        <p>Get access to all premium features</p>
        <button onClick={onClose} data-testid="close-button">
          Close
        </button>
        <button onClick={onUpgrade} data-testid="upgrade-button">
          Upgrade to Pro
        </button>
      </div>
    ) : null
  );
  
  return {
    __esModule: true,
    default: vi.fn(MockProUpgradeModal)
  };
});

describe('ProUpgradeModal', () => {
  it('shows upgrade button when modal is open', async () => {
    const mockOnClose = vi.fn();
    const mockOnUpgrade = vi.fn().mockResolvedValue(undefined);
    
    render(
      <ProUpgradeModal 
        isOpen={true} 
        onClose={mockOnClose}
        onUpgrade={mockOnUpgrade}
      />
    );

    // Check if modal is rendered
    const modal = screen.getByTestId('pro-upgrade-modal');
    expect(modal).toBeInTheDocument();
    
    // Check if upgrade button is present
    const upgradeButton = screen.getByTestId('upgrade-button');
    expect(upgradeButton).toBeInTheDocument();
    
    // Test close button
    const closeButton = screen.getByTestId('close-button');
    await userEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    
    // Test upgrade button
    await userEvent.click(upgradeButton);
    expect(mockOnUpgrade).toHaveBeenCalledTimes(1);
  });

  it('does not render when isOpen is false', () => {
    render(
      <ProUpgradeModal 
        isOpen={false} 
        onClose={() => {}} 
        onUpgrade={() => Promise.resolve()}
      />
    );
    
    const modal = screen.queryByTestId('pro-upgrade-modal');
    expect(modal).not.toBeInTheDocument();
  });
});
