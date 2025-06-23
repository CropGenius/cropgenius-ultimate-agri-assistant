import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FarmVitalsStep } from '../FarmVitalsStep';
import { mockOnboardingData } from '@/test-utils/onboarding-test-utils';

// Mock the form context
const mockRegister = jest.fn();
const mockSetValue = jest.fn();
const mockTrigger = jest.fn();
const mockWatch = jest.fn();
const mockGetValues = jest.fn();

// Default form state
const defaultFormState = {
  errors: {},
  isSubmitting: false,
};

// Mock the form context
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useFormContext: () => ({
    register: mockRegister,
    setValue: mockSetValue,
    trigger: mockTrigger,
    watch: mockWatch,
    getValues: mockGetValues,
    formState: defaultFormState,
  }),
}));

describe('FarmVitalsStep', () => {
  const defaultProps = {
    onNext: jest.fn(),
    onBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the watch function to return test values
    mockWatch.mockImplementation((name) => {
      const values = {
        farmName: mockOnboardingData.farmName,
        totalArea: mockOnboardingData.totalArea,
        location: mockOnboardingData.location,
        farmSize: mockOnboardingData.farmSize,
        soilType: mockOnboardingData.soilType,
        experienceLevel: mockOnboardingData.experienceLevel,
      };
      return values[name];
    });
    
    // Mock getValues to return the full form data
    mockGetValues.mockReturnValue(mockOnboardingData);
  });

  it('renders all form fields', () => {
    render(<FarmVitalsStep {...defaultProps} />);
    
    // Check that all form fields are rendered
    expect(screen.getByLabelText(/farm name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total area/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/farm size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/soil type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/experience level/i)).toBeInTheDocument();
  });

  it('calls onNext when the form is submitted with valid data', async () => {
    render(<FarmVitalsStep {...defaultProps} />);
    
    // Mock form validation to pass
    mockTrigger.mockResolvedValue(true);
    
    // Click the next button
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Verify onNext was called
    expect(defaultProps.onNext).toHaveBeenCalled();
  });

  it('shows validation errors when the form is submitted with invalid data', async () => {
    // Mock form validation to fail
    mockTrigger.mockResolvedValue(false);
    
    // Mock form state with errors
    const errorMessage = 'Farm name is required';
    const formStateWithErrors = {
      errors: {
        farmName: { message: errorMessage },
      },
      isSubmitting: false,
    };
    
    // Mock the useFormContext hook to return the form state with errors
    jest.requireMock('react-hook-form').useFormContext = () => ({
      register: mockRegister,
      setValue: mockSetValue,
      trigger: mockTrigger,
      watch: mockWatch,
      getValues: mockGetValues,
      formState: formStateWithErrors,
    });
    
    render(<FarmVitalsStep {...defaultProps} />);
    
    // Click the next button
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Verify the error message is displayed
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    
    // Verify onNext was not called
    expect(defaultProps.onNext).not.toHaveBeenCalled();
  });

  it('updates form values when inputs change', () => {
    render(<FarmVitalsStep {...defaultProps} />);
    
    const farmNameInput = screen.getByLabelText(/farm name/i);
    const newFarmName = 'New Farm Name';
    
    // Simulate typing in the farm name input
    fireEvent.change(farmNameInput, { target: { value: newFarmName } });
    
    // Verify setValue was called with the new value
    expect(mockSetValue).toHaveBeenCalledWith('farmName', newFarmName, {
      shouldValidate: true,
    });
  });

  it('calls onBack when the back button is clicked', () => {
    render(<FarmVitalsStep {...defaultProps} />);
    
    // Click the back button
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    
    // Verify onBack was called
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it('disables the next button when isSubmitting is true', () => {
    // Mock form state with isSubmitting true
    const formStateSubmitting = {
      errors: {},
      isSubmitting: true,
    };
    
    // Mock the useFormContext hook to return the form state with isSubmitting true
    jest.requireMock('react-hook-form').useFormContext = () => ({
      register: mockRegister,
      setValue: mockSetValue,
      trigger: mockTrigger,
      watch: mockWatch,
      getValues: mockGetValues,
      formState: formStateSubmitting,
    });
    
    render(<FarmVitalsStep {...defaultProps} />);
    
    // Verify the next button is disabled
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('shows a loading spinner when isSubmitting is true', () => {
    // Mock form state with isSubmitting true
    const formStateSubmitting = {
      errors: {},
      isSubmitting: true,
    };
    
    // Mock the useFormContext hook to return the form state with isSubmitting true
    jest.requireMock('react-hook-form').useFormContext = () => ({
      register: mockRegister,
      setValue: mockSetValue,
      trigger: mockTrigger,
      watch: mockWatch,
      getValues: mockGetValues,
      formState: formStateSubmitting,
    });
    
    render(<FarmVitalsStep {...defaultProps} />);
    
    // Verify the loading spinner is shown
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('matches the snapshot', () => {
    const { container } = render(<FarmVitalsStep {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });
});
