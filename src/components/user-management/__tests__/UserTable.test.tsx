import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserTable, User, PaginationInfo } from '../UserTable';

describe('UserTable', () => {
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@example.com',
      full_name: 'Admin User',
      phone_number: '+1234567890',
      role: 'admin',
      created_at: '2023-01-01T00:00:00Z',
      last_sign_in_at: '2023-12-01T00:00:00Z',
      onboarding_completed: true,
      ai_usage_count: 50
    },
    {
      id: '2',
      email: 'farmer@example.com',
      full_name: 'John Farmer',
      role: 'farmer',
      created_at: '2023-06-01T00:00:00Z',
      last_sign_in_at: '2023-11-15T00:00:00Z',
      onboarding_completed: true,
      ai_usage_count: 25
    },
    {
      id: '3',
      email: 'viewer@example.com',
      full_name: 'Jane Viewer',
      role: 'viewer',
      created_at: '2023-08-01T00:00:00Z',
      onboarding_completed: false,
      ai_usage_count: 0
    }
  ];

  const mockPagination: PaginationInfo = {
    total: 3,
    totalPages: 1,
    currentPage: 1,
    hasNext: false,
    hasPrev: false
  };

  const defaultProps = {
    users: mockUsers,
    pagination: mockPagination,
    isLoading: false,
    searchQuery: '',
    sortBy: 'created_at',
    sortOrder: 'desc' as const,
    roleFilter: 'all'
  };

  const mockHandlers = {
    onSearchChange: vi.fn(),
    onSortChange: vi.fn(),
    onRoleFilterChange: vi.fn(),
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    onEditUser: vi.fn(),
    onDeleteUser: vi.fn(),
    onViewUser: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render user table with data', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} />);

    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('John Farmer')).toBeInTheDocument();
    expect(screen.getByText('Jane Viewer')).toBeInTheDocument();
    
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('farmer@example.com')).toBeInTheDocument();
    expect(screen.getByText('viewer@example.com')).toBeInTheDocument();
  });

  it('should display role badges correctly', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Farmer')).toBeInTheDocument();
    expect(screen.getByText('Viewer')).toBeInTheDocument();
  });

  it('should display user status correctly', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} />);

    const activeStatuses = screen.getAllByText('Active');
    const pendingStatus = screen.getByText('Pending');
    
    expect(activeStatuses).toHaveLength(2); // Admin and Farmer
    expect(pendingStatus).toBeInTheDocument(); // Viewer
  });

  it('should display AI usage counts', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} />);

    expect(screen.getByText('50 AI uses')).toBeInTheDocument();
    expect(screen.getByText('25 AI uses')).toBeInTheDocument();
    expect(screen.getByText('0 AI uses')).toBeInTheDocument();
  });

  it('should handle search input', async () => {
    render(<UserTable {...defaultProps} {...mockHandlers} />);

    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'admin' } });

    await waitFor(() => {
      expect(mockHandlers.onSearchChange).toHaveBeenCalledWith('admin');
    }, { timeout: 500 });
  });

  it('should handle role filter change', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} />);

    const roleFilter = screen.getByRole('combobox');
    fireEvent.click(roleFilter);
    
    const adminOption = screen.getByText('Admin');
    fireEvent.click(adminOption);

    expect(mockHandlers.onRoleFilterChange).toHaveBeenCalledWith('admin');
  });

  it('should handle column sorting', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} />);

    const nameHeader = screen.getByText('Name').closest('th');
    fireEvent.click(nameHeader!);

    expect(mockHandlers.onSortChange).toHaveBeenCalledWith('full_name', 'asc');
  });

  it('should handle sort order toggle', () => {
    const propsWithSort = {
      ...defaultProps,
      sortBy: 'full_name',
      sortOrder: 'asc' as const
    };

    render(<UserTable {...propsWithSort} {...mockHandlers} />);

    const nameHeader = screen.getByText('Name').closest('th');
    fireEvent.click(nameHeader!);

    expect(mockHandlers.onSortChange).toHaveBeenCalledWith('full_name', 'desc');
  });

  it('should display loading skeleton when loading', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} isLoading={true} />);

    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display empty state when no users', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} users={[]} />);

    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('should display filtered empty state', () => {
    render(
      <UserTable 
        {...defaultProps} 
        {...mockHandlers} 
        users={[]} 
        searchQuery="nonexistent"
      />
    );

    expect(screen.getByText('No users found matching your criteria')).toBeInTheDocument();
  });

  it('should handle pagination controls', () => {
    const paginationProps = {
      ...defaultProps,
      pagination: {
        total: 100,
        totalPages: 10,
        currentPage: 5,
        hasNext: true,
        hasPrev: true
      }
    };

    render(<UserTable {...paginationProps} {...mockHandlers} />);

    expect(screen.getByText('Page 5 of 10')).toBeInTheDocument();
    expect(screen.getByText('Showing 41-50 of 100 users')).toBeInTheDocument();

    // Test pagination buttons
    const nextButton = screen.getByRole('button', { name: /next/i });
    const prevButton = screen.getByRole('button', { name: /previous/i });

    fireEvent.click(nextButton);
    expect(mockHandlers.onPageChange).toHaveBeenCalledWith(6);

    fireEvent.click(prevButton);
    expect(mockHandlers.onPageChange).toHaveBeenCalledWith(4);
  });

  it('should handle page size change', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} />);

    const pageSizeSelect = screen.getByDisplayValue('10');
    fireEvent.click(pageSizeSelect);
    
    const option25 = screen.getByText('25');
    fireEvent.click(option25);

    expect(mockHandlers.onPageSizeChange).toHaveBeenCalledWith(25);
  });

  it('should handle user actions from dropdown menu', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} />);

    // Click on the first user's action menu
    const actionButtons = screen.getAllByRole('button');
    const firstActionButton = actionButtons.find(button => 
      button.querySelector('svg')?.classList.contains('lucide-more-horizontal')
    );
    
    fireEvent.click(firstActionButton!);

    // Test view action
    const viewButton = screen.getByText('View Details');
    fireEvent.click(viewButton);
    expect(mockHandlers.onViewUser).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('should handle edit user action', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} />);

    const actionButtons = screen.getAllByRole('button');
    const firstActionButton = actionButtons.find(button => 
      button.querySelector('svg')?.classList.contains('lucide-more-horizontal')
    );
    
    fireEvent.click(firstActionButton!);

    const editButton = screen.getByText('Edit Role');
    fireEvent.click(editButton);
    expect(mockHandlers.onEditUser).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('should handle delete user action', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} />);

    const actionButtons = screen.getAllByRole('button');
    const firstActionButton = actionButtons.find(button => 
      button.querySelector('svg')?.classList.contains('lucide-more-horizontal')
    );
    
    fireEvent.click(firstActionButton!);

    const deleteButton = screen.getByText('Delete User');
    fireEvent.click(deleteButton);
    expect(mockHandlers.onDeleteUser).toHaveBeenCalledWith(mockUsers[0].id);
  });

  it('should format dates correctly', () => {
    render(<UserTable {...defaultProps} {...mockHandlers} />);

    expect(screen.getByText('Jan 1, 2023')).toBeInTheDocument(); // Admin created date
    expect(screen.getByText('Jun 1, 2023')).toBeInTheDocument(); // Farmer created date
    expect(screen.getByText('Dec 1, 2023')).toBeInTheDocument(); // Admin last login
  });

  it('should handle users without optional fields', () => {
    const incompleteUser: User = {
      id: '4',
      email: 'incomplete@example.com'
    };

    render(
      <UserTable 
        {...defaultProps} 
        {...mockHandlers} 
        users={[incompleteUser]} 
      />
    );

    expect(screen.getByText('Unnamed User')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument(); // Role badge
    expect(screen.getByText('Never')).toBeInTheDocument(); // Last login
  });

  it('should disable pagination buttons appropriately', () => {
    const singlePageProps = {
      ...defaultProps,
      pagination: {
        total: 5,
        totalPages: 1,
        currentPage: 1,
        hasNext: false,
        hasPrev: false
      }
    };

    render(<UserTable {...singlePageProps} {...mockHandlers} />);

    const prevButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-chevron-left')
    );
    const nextButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-chevron-right')
    );

    prevButtons.forEach(btn => expect(btn).toBeDisabled());
    nextButtons.forEach(btn => expect(btn).toBeDisabled());
  });
});