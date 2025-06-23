import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingSuccess } from '../OnboardingSuccess';
import { MemoryRouter, useNavigate } from 'react-router-dom';

// Mock the useNavigate hook
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the useOnboarding hook
const mockResetOnboarding = jest.fn();

jest.mock('../../hooks/useOnboarding', () => ({
  useOnboarding: () => ({
    resetOnboarding: mockResetOnboarding,
  }),
}));

describe('OnboardingSuccess', () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <OnboardingSuccess />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the success message and icon', () => {
    renderComponent();
    
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    expect(screen.getByText('Onboarding Complete!')).toBeInTheDocument();
    expect(screen.getByText(/Thank you for completing your profile/i)).toBeInTheDocument();
  });

  it('renders the recommended actions section', () => {
    renderComponent();
    
    expect(screen.getByText('Recommended Next Steps')).toBeInTheDocument();
    
    // Check for action cards
    expect(screen.getByText('Set up your first field')).toBeInTheDocument();
    expect(screen.getByText('Explore crop insights')).toBeInTheDocument();
    expect(screen.getByText('Check weather forecasts')).toBeInTheDocument();
  });

  it('navigates to dashboard when the dashboard button is clicked', () => {
    renderComponent();
    
    const dashboardButton = screen.getByRole('button', { name: /go to dashboard/i });
    fireEvent.click(dashboardButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    expect(mockResetOnboarding).toHaveBeenCalled();
  });

  it('calls resetOnboarding when the component unmounts', () => {
    const { unmount } = renderComponent();
    
    unmount();
    
    expect(mockResetOnboarding).toHaveBeenCalled();
  });

  it('applies custom class names', () => {
    const customClass = 'custom-success-screen';
    
    render(
      <MemoryRouter>
        <OnboardingSuccess className={customClass} />
      </MemoryRouter>
    );
    
    const container = screen.getByTestId('onboarding-success');
    expect(container).toHaveClass(customClass);
  });

  it('displays the correct number of action cards', () => {
    renderComponent();
    
    const actionCards = screen.getAllByTestId('action-card');
    expect(actionCards).toHaveLength(3);
  });

  it('navigates to the correct routes when action cards are clicked', () => {
    renderComponent();
    
    // Test first action card
    const setupFieldButton = screen.getByText('Set up your first field');
    fireEvent.click(setupFieldButton);
    expect(mockNavigate).toHaveBeenCalledWith('/fields/new');
    
    // Reset mock for next test
    mockNavigate.mockClear();
    
    // Test second action card
    const exploreInsightsButton = screen.getByText('Explore crop insights');
    fireEvent.click(exploreInsightsButton);
    expect(mockNavigate).toHaveBeenCalledWith('/insights');
    
    // Reset mock for next test
    mockNavigate.mockClear();
    
    // Test third action card
    const checkWeatherButton = screen.getByText('Check weather forecasts');
    fireEvent.click(checkWeatherButton);
    expect(mockNavigate).toHaveBeenCalledWith('/weather');
  });

  it('matches the snapshot', () => {
    const { container } = renderComponent();
    expect(container).toMatchSnapshot();
  });
});
