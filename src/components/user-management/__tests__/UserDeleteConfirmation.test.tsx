import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserDeleteConfirmation } from '../UserDeleteConfirmation';
import { User } from '../UserTable';

describe('UserDeleteConfirmation', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    full_name: 'Test User',
    phone_number: '+1234567890',
    role: 'farmer',
    created_at: '2023-01-01T00:00:00Z',
    last_sign_in_at: '2023-12-01T00:00:00Z',
    onboarding_completed: true,
    ai_usage_count: 25
  };

  const mockAdminUser: User = {
    id: '2',
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'admin',
    created_at: '2023-01-01T00:00:00Z',
    last_sign_in_at: '2023-12-01T00:00:00Z',
    onboarding_completed: true,
    ai_usage_count: 100
  };

  const defaultProps = {
    user: mockUser,
    isOpen: true,
    isDeleting: false,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    requireConfirmation: true,
    showUserDetails: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render delete confirmation dialog', () => {
    render(<UserDeleteConfirmation {...defaultProps} />);

    expect(screen.getByText('Delete User Account')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone. The user account and all associated data will be permanently deleted.')).toBeInTheDocument();
  });

  it('should display user information', () => {
    render(<UserDeleteConfirmation {...defaultProps} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('farmer')).toBeInTheDocument();
  });

  it('should display user statistics', () => {
    render(<UserDeleteConfirmation {...defaultProps} />);

    expect(screen.getByText('Jan 1, 2023')).toBeInTheDocument(); // Joined date
    expect(screen.getByText('Dec 1, 2023')).toBeInTheDocument(); // Last active
    expect(screen.getByText('25 interactions')).toBeInTheDocument(); // AI usage
    expect(screen.getByText('Active')).toBeInTheDocument(); // Status
  });

  it('should show admin warning for admin users', () => {
    render(<UserDeleteConfirmation {...defaultProps} user={mockAdminUser} />);

    expect(screen.getByText('Admin User Deletion')).toBeInTheDocument();
    expect(screen.getByText('This user has administrative privileges. Deleting this account will remove all admin access.')).toBeInTheDocument();
  });

  it('should show activity warning for users with AI usage', () => {
    render(<UserDeleteConfirmation {...defaultProps} />);

    expect(screen.getByText('User Has Activity')).toBeInTheDocument();
    expect(screen.getByText('This user has 25 AI interactions. All associated data will be permanently deleted.')).toBeInTheDocument();
  });

  it('should show active user warning for completed onboarding', () => {
    render(<UserDeleteConfirmation {...defaultProps} />);

    expect(screen.getByText('Active User Account')).toBeInTheDocument();
    expect(screen.getByText('This is an active user account with completed onboarding. Consider deactivating instead of deleting.')).toBeInTheDocument();
  });

  it('should require acknowledgment checkboxes', () => {
    render(<UserDeleteConfirmation {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete user/i });
    expect(deleteButton).toBeDisabled();

    // Check first acknowledgment
    const warningsCheckbox = screen.getByLabelText(/understand the warnings/i);
    fireEvent.click(warningsCheckbox);
    expect(deleteButton).toBeDisabled();

    // Check second acknowledgment
    const dataLossCheckbox = screen.getByLabelText(/acknowledge that all user data/i);
    fireEvent.click(dataLossCheckbox);
    expect(deleteButton).toBeDisabled(); // Still disabled due to confirmation text

    // Enter confirmation text
    const confirmationInput = screen.getByPlaceholderText(/DELETE test@example.com/i);
    fireEvent.change(confirmationInput, { target: { value: 'DELETE test@example.com' } });
    
    expect(deleteButton).not.toBeDisabled();
  });

  it('should validate confirmation text', () => {
    render(<UserDeleteConfirmation {...defaultProps} />);

    const confirmationInput = screen.getByPlaceholderText(/DELETE test@example.com/i);
    const deleteButton = screen.getByRole('button', { name: /delete user/i });

    // Check acknowledgments first
    const warningsCheckbox = screen.getByLabelText(/understand the warnings/i);
    const dataLossCheckbox = screen.getByLabelText(/acknowledge that all user data/i);
    fireEvent.click(warningsCheckbox);
    fireEvent.click(dataLossCheckbox);

    // Wrong confirmation text
    fireEvent.change(confirmationInput, { target: { value: 'wrong text' } });
    expect(deleteButton).toBeDisabled();

    // Correct confirmation text
    fireEvent.change(confirmationInput, { target: { value: 'DELETE test@example.com' } });
    expect(deleteButton).not.toBeDisabled();
  });

  it('should handle confirmation without text requirement', () => {
    render(<UserDeleteConfirmation {...defaultProps} requireConfirmation={false} />);

    const deleteButton = screen.getByRole('button', { name: /delete user/i });
    
    // Should still be disabled due to acknowledgments
    expect(deleteButton).toBeDisabled();

    // Check acknowledgments
    const warningsCheckbox = screen.getByLabelText(/understand the warnings/i);
    const dataLossCheckbox = screen.getByLabelText(/acknowledge that all user data/i);
    fireEvent.click(warningsCheckbox);
    fireEvent.click(dataLossCheckbox);

    // Should be enabled without confirmation text
    expect(deleteButton).not.toBeDisabled();
  });

  it('should call onConfirm when delete button is clicked', () => {
    render(<UserDeleteConfirmation {...defaultProps} />);

    // Complete all requirements
    const warningsCheckbox = screen.getByLabelText(/understand the warnings/i);
    const dataLossCheckbox = screen.getByLabelText(/acknowledge that all user data/i);
    const confirmationInput = screen.getByPlaceholderText(/DELETE test@example.com/i);
    
    fireEvent.click(warningsCheckbox);
    fireEvent.click(dataLossCheckbox);
    fireEvent.change(confirmationInput, { target: { value: 'DELETE test@example.com' } });

    const deleteButton = screen.getByRole('button', { name: /delete user/i });
    fireEvent.click(deleteButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledWith('1');
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<UserDeleteConfirmation {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should show loading state when deleting', () => {
    render(<UserDeleteConfirmation {...defaultProps} isDeleting={true} />);

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    
    const deleteButton = screen.getByRole('button', { name: /deleting/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    
    expect(deleteButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('should not render when user is null', () => {
    render(<UserDeleteConfirmation {...defaultProps} user={null} />);

    expect(screen.queryByText('Delete User Account')).not.toBeInTheDocument();
  });

  it('should not render when dialog is closed', () => {
    render(<UserDeleteConfirmation {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Delete User Account')).not.toBeInTheDocument();
  });

  it('should reset state when dialog opens', () => {
    const { rerender } = render(<UserDeleteConfirmation {...defaultProps} isOpen={false} />);

    // Reopen dialog
    rerender(<UserDeleteConfirmation {...defaultProps} isOpen={true} />);

    const confirmationInput = screen.getByPlaceholderText(/DELETE test@example.com/i);
    const warningsCheckbox = screen.getByLabelText(/understand the warnings/i);
    const dataLossCheckbox = screen.getByLabelText(/acknowledge that all user data/i);

    expect(confirmationInput).toHaveValue('');
    expect(warningsCheckbox).not.toBeChecked();
    expect(dataLossCheckbox).not.toBeChecked();
  });

  it('should handle user without optional fields', () => {
    const minimalUser: User = {
      id: '3',
      email: 'minimal@example.com'
    };

    render(<UserDeleteConfirmation {...defaultProps} user={minimalUser} />);

    expect(screen.getByText('Unnamed User')).toBeInTheDocument();
    expect(screen.getByText('minimal@example.com')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument(); // Join date
    expect(screen.getByText('Never')).toBeInTheDocument(); // Last active
    expect(screen.getByText('0 interactions')).toBeInTheDocument(); // AI usage
  });

  it('should hide user details when showUserDetails is false', () => {
    render(<UserDeleteConfirmation {...defaultProps} showUserDetails={false} />);

    // User details should not be shown
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    expect(screen.queryByText('Joined')).not.toBeInTheDocument();
    
    // But dialog should still be present
    expect(screen.getByText('Delete User Account')).toBeInTheDocument();
  });

  it('should use fallback confirmation text for users without email', () => {
    const userWithoutEmail: User = {
      id: '4',
      full_name: 'No Email User'
    };

    render(<UserDeleteConfirmation {...defaultProps} user={userWithoutEmail} />);

    expect(screen.getByPlaceholderText('DELETE No Email User')).toBeInTheDocument();
  });

  it('should use user ID as fallback for confirmation text', () => {
    const userWithoutEmailOrName: User = {
      id: '5'
    };

    render(<UserDeleteConfirmation {...defaultProps} user={userWithoutEmailOrName} />);

    expect(screen.getByPlaceholderText('DELETE 5')).toBeInTheDocument();
  });
});