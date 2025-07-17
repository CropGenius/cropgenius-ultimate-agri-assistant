import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminGuard from '../AdminGuard';
import { useAuthContext } from '@/providers/AuthProvider';

// Mock the auth context
vi.mock('@/providers/AuthProvider', () => ({
  useAuthContext: vi.fn()
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  }
}));

// Import the mocked supabase client
import { supabase } from '@/integrations/supabase/client';

describe('AdminGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should show loading state while checking admin status', () => {
    // Mock auth context with a user
    (useAuthContext as any).mockReturnValue({
      user: { id: 'user123' }
    });
    
    // Mock Supabase response that hasn't resolved yet
    (supabase.single as any).mockReturnValue(new Promise(() => {}));
    
    render(
      <MemoryRouter>
        <AdminGuard>
          <div>Admin Content</div>
        </AdminGuard>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Checking admin permissions...')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
  
  it('should render children for admin users', async () => {
    // Mock auth context with a user
    (useAuthContext as any).mockReturnValue({
      user: { id: 'admin123' }
    });
    
    // Mock Supabase response with admin role
    (supabase.single as any).mockResolvedValue({
      data: { role: 'admin' },
      error: null
    });
    
    render(
      <MemoryRouter>
        <AdminGuard>
          <div>Admin Content</div>
        </AdminGuard>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });
  
  it('should redirect non-admin users', async () => {
    // Mock auth context with a user
    (useAuthContext as any).mockReturnValue({
      user: { id: 'user123' }
    });
    
    // Mock Supabase response with non-admin role
    (supabase.single as any).mockResolvedValue({
      data: { role: 'farmer' },
      error: null
    });
    
    // Set up routes to test navigation
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <AdminGuard fallbackPath="/">
              <div>Admin Content</div>
            </AdminGuard>
          } />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });
  
  it('should redirect unauthenticated users', async () => {
    // Mock auth context with no user
    (useAuthContext as any).mockReturnValue({
      user: null
    });
    
    // Set up routes to test navigation
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <AdminGuard fallbackPath="/">
              <div>Admin Content</div>
            </AdminGuard>
          } />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });
  
  it('should show error state if admin check fails', async () => {
    // Mock auth context with a user
    (useAuthContext as any).mockReturnValue({
      user: { id: 'user123' }
    });
    
    // Mock Supabase response with error
    (supabase.single as any).mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    });
    
    render(
      <MemoryRouter>
        <AdminGuard>
          <div>Admin Content</div>
        </AdminGuard>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Access Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to verify admin permissions')).toBeInTheDocument();
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });
});