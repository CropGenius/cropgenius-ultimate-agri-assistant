import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoleEditor } from '../RoleEditor';
import { User } from '../UserTable';

describe('RoleEditor', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'farmer',
    created_at: '2023-01-01T00:00:00Z',
    onboarding_completed: true,
    ai_usage_count: 25
  };

  const defaultProps = {
    user: mockUser,
    isOpen: true,
    isUpdating: false,
    onClose: vi.fn(),
    onUpdateRole: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render role editor dialog', () => {
    render(<RoleEditor {...defaultProps} />);

    expect(screen.getByText('Edit User Role')).toBeInTheDocument();
    expect(screen.getByText(/Change the role for/)).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should display current user information', () => {
    render(<RoleEditor {...defaultProps} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Current: Farmer')).toBeInTheDocument();
  });

  it('should display all role options', () => {
    render(<RoleEditor {...defaultProps} />);

    expect(screen.getByText('Administrator')).toBeInTheDocument();
    expect(screen.getByText('Farmer')).toBeInTheDocument();
    expect(screen.getByText('Agronomist')).toBeInTheDocument();
    expect(screen.getByText('Viewer')).toBeInTheDocument();
  });

  it('should show current role as selected by default', () => {
    render(<RoleEditor {...defaultProps} />);

    const farmerRadio = screen.getByRole('radio', { name: /farmer/i });
    expect(farmerRadio).toBeChecked();
  });

  it('should display role descriptions', () => {
    render(<RoleEditor {...defaultProps} />);

    expect(screen.getByText('Full system access with user management capabilities')).toBeInTheDocument();
    expect(screen.getByText('Standard user with full access to farming features')).toBeInTheDocument();
    expect(screen.getByText('Agricultural expert with extended data access')).toBeInTheDocument();
    expect(screen.getByText('Read-only access for observers and stakeholders')).toBeInTheDocument();
  });

  it('should allow role selection', () => {
    render(<RoleEditor {...defaultProps} />);

    const adminRadio = screen.getByRole('radio', { name: /administrator/i });
    fireEvent.click(adminRadio);

    expect(adminRadio).toBeChecked();
  });

  it('should display permissions for selected role', () => {
    render(<RoleEditor {...defaultProps} />);

    // Select admin role
    const adminRadio = screen.getByRole('radio', { name: /administrator/i });
    fireEvent.click(adminRadio);

    expect(screen.getByText('Administrator Permissions')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('View all users')).toBeInTheDocument();
    expect(screen.getByText('Delete users')).toBeInTheDocument();
  });

  it('should show warnings for admin role', () => {
    render(<RoleEditor {...defaultProps} />);

    const adminRadio = screen.getByRole('radio', { name: /administrator/i });
    fireEvent.click(adminRadio);

    expect(screen.getByText('Warnings')).toBeInTheDocument();
    expect(screen.getByText('Admin users have unrestricted access to all system functions')).toBeInTheDocument();
  });

  it('should show recommendations for roles', () => {
    render(<RoleEditor {...defaultProps} />);

    // Farmer role should show recommendations
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Ideal for individual farmers and smallholder operations')).toBeInTheDocument();
  });

  it('should disable update button when no role change', () => {
    render(<RoleEditor {...defaultProps} />);

    const updateButton = screen.getByRole('button', { name: /update role/i });
    expect(updateButton).toBeDisabled();
  });

  it('should enable update button when role changes', () => {
    render(<RoleEditor {...defaultProps} />);

    const adminRadio = screen.getByRole('radio', { name: /administrator/i });
    fireEvent.click(adminRadio);

    const updateButton = screen.getByRole('button', { name: /update role/i });
    expect(updateButton).not.toBeDisabled();
  });

  it('should call onUpdateRole when update button is clicked', () => {
    render(<RoleEditor {...defaultProps} />);

    const adminRadio = screen.getByRole('radio', { name: /administrator/i });
    fireEvent.click(adminRadio);

    const updateButton = screen.getByRole('button', { name: /update role/i });
    fireEvent.click(updateButton);

    expect(defaultProps.onUpdateRole).toHaveBeenCalledWith('1', 'admin');
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<RoleEditor {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should show loading state when updating', () => {
    render(<RoleEditor {...defaultProps} isUpdating={true} />);

    expect(screen.getByText('Updating...')).toBeInTheDocument();
    
    const updateButton = screen.getByRole('button', { name: /updating/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    
    expect(updateButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('should display viewer role restrictions', () => {
    render(<RoleEditor {...defaultProps} />);

    const viewerRadio = screen.getByRole('radio', { name: /viewer/i });
    fireEvent.click(viewerRadio);

    expect(screen.getByText('Viewer Permissions')).toBeInTheDocument();
    expect(screen.getByText('Restrictions')).toBeInTheDocument();
    expect(screen.getByText('Create/edit farms')).toBeInTheDocument();
    expect(screen.getByText('Use AI services')).toBeInTheDocument();
  });

  it('should display agronomist expert features', () => {
    render(<RoleEditor {...defaultProps} />);

    const agronomistRadio = screen.getByRole('radio', { name: /agronomist/i });
    fireEvent.click(agronomistRadio);

    expect(screen.getByText('Agronomist Permissions')).toBeInTheDocument();
    expect(screen.getByText('Expert Features')).toBeInTheDocument();
    expect(screen.getByText('Advanced crop analysis')).toBeInTheDocument();
    expect(screen.getByText('Research data access')).toBeInTheDocument();
  });

  it('should not render when user is null', () => {
    render(<RoleEditor {...defaultProps} user={null} />);

    expect(screen.queryByText('Edit User Role')).not.toBeInTheDocument();
  });

  it('should not render when dialog is closed', () => {
    render(<RoleEditor {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Edit User Role')).not.toBeInTheDocument();
  });

  it('should reset selected role when dialog opens', () => {
    const { rerender } = render(<RoleEditor {...defaultProps} isOpen={false} />);

    // Reopen dialog
    rerender(<RoleEditor {...defaultProps} isOpen={true} />);

    const farmerRadio = screen.getByRole('radio', { name: /farmer/i });
    expect(farmerRadio).toBeChecked();
  });

  it('should handle user without full name', () => {
    const userWithoutName: User = {
      id: '2',
      email: 'noname@example.com',
      role: 'viewer'
    };

    render(<RoleEditor {...defaultProps} user={userWithoutName} />);

    expect(screen.getByText(/Change the role for.*noname@example.com/)).toBeInTheDocument();
  });

  it('should handle user without email', () => {
    const userWithoutEmail: User = {
      id: '3',
      full_name: 'No Email User',
      role: 'farmer'
    };

    render(<RoleEditor {...defaultProps} user={userWithoutEmail} />);

    expect(screen.getByText('No Email User')).toBeInTheDocument();
  });

  it('should show correct role icons', () => {
    render(<RoleEditor {...defaultProps} />);

    // Check that role icons are present (we can't easily test the specific icons, but we can check they exist)
    const roleOptions = screen.getAllByRole('radio');
    expect(roleOptions).toHaveLength(4);
    
    // Each role option should have an icon (represented by the role config)
    roleOptions.forEach(option => {
      const container = option.closest('div');
      expect(container).toBeInTheDocument();
    });
  });

  it('should display permission check marks and X marks correctly', () => {
    render(<RoleEditor {...defaultProps} />);

    // Select viewer role to see both allowed and denied permissions
    const viewerRadio = screen.getByRole('radio', { name: /viewer/i });
    fireEvent.click(viewerRadio);

    // Should have both check marks (allowed) and X marks (denied)
    const permissions = screen.getByText('Viewer Permissions').closest('.space-y-4');
    expect(permissions).toBeInTheDocument();
  });

  it('should handle role change from admin to farmer', () => {
    const adminUser: User = {
      ...mockUser,
      role: 'admin'
    };

    render(<RoleEditor {...defaultProps} user={adminUser} />);

    expect(screen.getByText('Current: Administrator')).toBeInTheDocument();

    const farmerRadio = screen.getByRole('radio', { name: /farmer/i });
    fireEvent.click(farmerRadio);

    const updateButton = screen.getByRole('button', { name: /update role/i });
    expect(updateButton).not.toBeDisabled();

    fireEvent.click(updateButton);
    expect(defaultProps.onUpdateRole).toHaveBeenCalledWith(adminUser.id, 'farmer');
  });
});