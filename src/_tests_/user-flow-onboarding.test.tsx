import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestUser } from './test-utils/user';
import { SignupPage } from '@/features/auth/components/SignupPage';
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard';
import EnhancedDashboard from '@/components/dashboard/EnhancedDashboard';

// Mock Supabase client for testing
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })
    },
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    select: vi.fn().mockResolvedValue({ data: [{ id: 'test-farm-id' }] })
  }
}));

describe('New User Onboarding Flow', () => {
  let browser;
  let context;
  let page;

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Test123!',
    phone: '+254700000000',
    farmName: 'Test Farm',
    totalArea: '10',
    location: {
      latitude: -1.2921,
      longitude: 36.8219,
      country: 'Kenya',
      region: 'Nairobi'
    }
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
  });

  it('should complete full onboarding flow', async () => {
    // Setup test data
    const testUser = createTestUser();
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Render the app with router
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/signup']}>
          <Routes>
            <Route path="/signup" element={<SignupPage onToggle={() => {}} />} />
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="/dashboard" element={<EnhancedDashboard />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // 1. Verify initial page state
    expect(screen.getByText('Email address')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('Create account')).toBeInTheDocument();

    // 2. Fill signup form
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: testUser.email } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: testUser.password } });
    fireEvent.click(screen.getByText('Create account'));

    // 3. Wait for onboarding
    await waitFor(() => screen.getByText('Farm Vitals'));

    // 4. Complete onboarding steps
    // Farm Vitals
    fireEvent.change(screen.getByLabelText(/farm name/i), { target: { value: testUser.farmName } });
    fireEvent.change(screen.getByLabelText(/total area/i), { target: { value: testUser.totalArea } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Crop Seasons
    await waitFor(() => screen.getByText('Crop Seasons'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Goals
    await waitFor(() => screen.getByText('Goals'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Resources
    await waitFor(() => screen.getByText('Resources'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Profile
    await waitFor(() => screen.getByText('Profile'));
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: testUser.phone } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Genius Plan
    await waitFor(() => screen.getByText('Genius Plan'));
    fireEvent.click(screen.getByRole('button', { name: /complete/i }));

    // 5. Verify dashboard load
    await waitFor(() => screen.getByText('Welcome to CropGenius'));

    // 6. Verify UI elements
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Farm Overview')).toBeInTheDocument();
    expect(screen.getByText('Weather Forecast')).toBeInTheDocument();
    expect(screen.getByText('Crop Health')).toBeInTheDocument();

    // 7. Verify Supabase data
    const { supabase } = require('@/lib/supabase');
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: testUser.email,
      password: testUser.password
    });
    expect(supabase.insert).toHaveBeenCalledWith('profiles', {
      user_id: 'test-user-id',
      phone: testUser.phone,
      farm_name: testUser.farmName,
      total_area: testUser.totalArea,
      latitude: testUser.location.latitude,
      longitude: testUser.location.longitude,
      country: testUser.location.country,
      region: testUser.location.region
    });
    // 1. Navigate to signup page
    await page.goto('http://localhost:5173/signup');
    await page.waitForLoadState('networkidle');

    // 2. Fill signup form
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.click('button[type="submit"]');

    // 3. Wait for onboarding
    await page.waitForURL('/onboarding');
    
    // 4. Complete onboarding steps
    // Phone verification
    await page.fill('input[name="phone"]', testUser.phone);
    await page.click('button[type="submit"]');

    // Farm details
    await page.fill('input[name="farmName"]', testUser.farmName);
    await page.fill('input[name="totalArea"]', testUser.totalArea);
    await page.click('button[type="submit"]');

    // Location
    await page.fill('input[name="latitude"]', testUser.location.latitude.toString());
    await page.fill('input[name="longitude"]', testUser.location.longitude.toString());
    await page.fill('input[name="country"]', testUser.location.country);
    await page.fill('input[name="region"]', testUser.location.region);
    await page.click('button[type="submit"]');

    // 5. Verify dashboard load
    await page.waitForURL('/dashboard');
    
    // 6. Verify UI elements
    await expect(page).toHaveTitle(/CropGenius/);
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text="Welcome to CropGenius"')).toBeVisible();

    // 7. Take screenshot for documentation
    await page.screenshot({ path: 'test-results/onboarding-complete.png' });
  });
});
