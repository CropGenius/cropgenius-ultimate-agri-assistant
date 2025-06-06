import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useParams } from 'react-router-dom';
import FieldDetail from '@/pages/FieldDetail'; // Adjusted path
import {
  Field,
  FieldCrop,
  FieldHistory,
  Coordinates as FieldCoordinates,
} from '@/types/field';

// Mock dependencies
const mockNavigate = vi.fn();
const mockToast = { success: vi.fn(), error: vi.fn(), info: vi.fn() };
const mockDiagnosticsLogError = vi.fn();

// Mock services
const mockGetFieldById = vi.fn();
const mockDeleteField = vi.fn();
const mockGetFieldRecommendations = vi.fn();
const mockCheckFieldRisks = vi.fn();

// Mock hooks
const mockUseOfflineStatus = vi.fn();
const mockUseFarm = vi.fn();
const mockPerformCropScan = vi.fn();
const mockUseCropScanAgent = vi.fn();
const mockPredictYield = vi.fn();
const mockUseYieldPredictorAgent = vi.fn();

// Mock Supabase client
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseSingle = vi.fn();
const mockSupabaseOrder = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/hooks/useOfflineStatus', () => ({
  useOfflineStatus: mockUseOfflineStatus,
}));
vi.mock('@/hooks/useFarm', () => ({ useFarm: mockUseFarm }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockSupabaseFrom,
  },
}));

vi.mock('@/services/fieldService', () => ({
  getFieldById: mockGetFieldById,
  deleteField: mockDeleteField,
}));

vi.mock('@/services/fieldAIService', () => ({
  getFieldRecommendations: mockGetFieldRecommendations,
  checkFieldRisks: mockCheckFieldRisks,
}));

vi.mock('@/hooks/agents/useCropScanAgent', () => ({
  useCropScanAgent: mockUseCropScanAgent,
}));

vi.mock('@/hooks/agents/useYieldPredictorAgent', () => ({
  useYieldPredictorAgent: mockUseYieldPredictorAgent,
}));

vi.mock('sonner', () => ({ toast: mockToast }));
vi.mock('@/utils/diagnosticService', () => ({
  default: { logError: mockDiagnosticsLogError },
}));

// Default mock data
const mockFieldId = 'test-field-123';
const mockFieldData: Field = {
  id: mockFieldId,
  user_id: 'user-test-123',
  farm_id: 'farm-abc',
  name: 'Test Field Alpha',
  size: 10.5,
  size_unit: 'hectares',
  boundary: {
    type: 'polygon', // Lowercase as per type
    // Adjusted to match Coordinates[] where Coordinates is {lat, lng}
    coordinates: [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 1 },
      { lat: 1, lng: 1 },
      { lat: 1, lng: 0 },
      { lat: 0, lng: 0 },
    ] as FieldCoordinates[],
  },
  center: { lat: 0.5, lng: 0.5 },
  location_description: 'Located north of the old barn.',
  soil_type: 'Loamy',
  // current_crop_id: 'crop-corn', // Not in Field type, managed by FieldCrop
  // planting_date: new Date('2023-04-01').toISOString(), // Not in Field type
  irrigation_type: 'drip',
  created_at: new Date('2023-01-01T10:00:00Z').toISOString(),
  updated_at: new Date('2023-01-10T11:00:00Z').toISOString(),
  is_synced: true,
  is_shared: false,
  deleted: false,
  // Properties like ph_level, organic_matter_percentage, nutrient_levels, last_soil_test_date, notes are not directly in Field type
  // These might be part of a related entity or a more detailed soil analysis object not shown in the Field type itself.
  // For now, removing them from the direct Field mock unless they are part of 'soil_type' details or another linked entity.
};

// Mock for current_crop_id and planting_date, which are part of FieldCrop
const mockCurrentCrop: FieldCrop = {
  id: 'fc-current',
  field_id: mockFieldId,
  crop_name: 'Corn',
  variety: 'Golden Bantam',
  planting_date: new Date('2023-04-01').toISOString(),
  harvest_date: null,
  yield_amount: null,
  yield_unit: null,
  notes: 'Current active crop.',
  created_at: new Date('2023-04-01T09:00:00Z').toISOString(),
  status: 'active',
  is_synced: true,
};

const mockFarmData = { name: 'Sunrise Farm' };
const mockCropsData: FieldCrop[] = [
  mockCurrentCrop, // Include the current crop
  {
    id: 'fc-1',
    field_id: mockFieldId,
    crop_name: 'Soybean',
    planting_date: new Date('2022-05-10').toISOString(),
    harvest_date: new Date('2022-10-20').toISOString(),
    variety: 'Roundup Ready',
    notes: 'Previous season crop',
    yield_amount: 2.5,
    yield_unit: 'tons/ha',
    created_at: new Date('2022-05-10T08:00:00Z').toISOString(),
    status: 'harvested',
    is_synced: true,
  },
];
const mockHistoryData: FieldHistory[] = [
  {
    id: 'fh-1',
    field_id: mockFieldId,
    event_type: 'planting', // Lowercase as per type
    description: 'Corn planted for the season.', // 'description' field as per type
    date: new Date('2023-04-01').toISOString(), // 'date' field as per type
    notes: 'Golden Bantam variety planted.',
    created_at: new Date('2023-04-01T09:30:00Z').toISOString(),
    created_by: 'user-test-123', // 'created_by' field as per type
    is_synced: true,
  },
  {
    id: 'fh-2',
    field_id: mockFieldId,
    event_type: 'treatment',
    description: 'Pesticide application.',
    date: new Date('2023-05-15').toISOString(),
    notes: 'Applied standard pesticide mix.',
    created_at: new Date('2023-05-15T14:00:00Z').toISOString(),
    created_by: 'user-test-123',
    is_synced: true,
  },
];

const defaultSupabaseMockImplementation = () => {
  // Reset and re-chain mocks for Supabase to ensure clean state for each call group
  mockSupabaseFrom.mockReset().mockReturnValue({
    select: mockSupabaseSelect.mockReset().mockReturnValue({
      eq: mockSupabaseEq.mockReset().mockReturnValue({
        single: mockSupabaseSingle.mockReset(),
        order: mockSupabaseOrder.mockReset(),
      }),
    }),
  });

  // Mock sequence for loadField: Farm -> Crops -> History
  mockSupabaseSingle.mockResolvedValueOnce({ data: mockFarmData, error: null }); // Farm name
  mockSupabaseOrder.mockResolvedValueOnce({ data: mockCropsData, error: null }); // Crops
  mockSupabaseOrder.mockResolvedValueOnce({
    data: mockHistoryData,
    error: null,
  }); // History
};

describe('FieldDetail Component', () => {
  beforeEach(() => {
    vi.resetAllMocks(); // Ensures mocks are clean for each test

    // Default successful mock implementations for useParams, useOfflineStatus, useFarm
    (vi.mocked(useParams) as Mock).mockReturnValue({ id: mockFieldId });
    mockUseOfflineStatus.mockReturnValue(false); // Online by default
    mockUseFarm.mockReturnValue({
      selectedFarm: { id: 'farm-abc', name: 'Test Farm', user_id: 'user-test' },
    });

    // Mock service calls
    mockGetFieldById.mockResolvedValue({ data: mockFieldData, error: null });
    mockGetFieldRecommendations.mockResolvedValue([
      'AI Recommendation 1: Consider crop rotation.',
      'AI Recommendation 2: Check soil moisture.',
    ]);
    mockCheckFieldRisks.mockResolvedValue({ hasRisks: false, risks: [] });

    // Set up Supabase mocks for the typical loadField sequence
    defaultSupabaseMockImplementation();

    // Mock agent hooks
    mockUseCropScanAgent.mockReturnValue({
      performCropScan: mockPerformCropScan,
      scanResult: null,
      isLoading: false,
      error: null,
      recentScans: [],
    });
    mockPerformCropScan.mockResolvedValue({
      success: true,
      data: { analysis: 'Crop appears healthy, no immediate concerns.' },
    });

    mockUseYieldPredictorAgent.mockReturnValue({
      predictYield: mockPredictYield,
      prediction: null,
      isLoading: false,
      error: null,
      saveYieldPrediction: vi.fn().mockResolvedValue({ success: true }),
    });
    mockPredictYield.mockResolvedValue({
      success: true,
      data: { predictedYield: 5.5, unit: 'tons/ha', confidence: 0.85 },
    });
  });

  afterEach(() => {
    // vi.clearAllMocks(); // Not strictly necessary due to resetAllMocks in beforeEach, but good for belt-and-suspenders
  });

  it('should render loading state initially then display field details correctly', async () => {
    render(
      <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
        <Routes>
          <Route path="/field/:id" element={<FieldDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Check for a generic loading indicator first (could be text or a spinner icon)
    // Using a more generic query that might match a Loader2 icon or text
    expect(
      screen.getByRole('status', { name: /loading/i })
    ).toBeInTheDocument();

    // Wait for data to load and loading state to disappear
    await waitFor(
      () => {
        expect(
          screen.queryByRole('status', { name: /loading/i })
        ).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    ); // Increased timeout for potentially slower CI environments or complex renders

    // Assert that primary field data is displayed
    expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();
    expect(screen.getByText(mockFarmData.name)).toBeInTheDocument(); // Farm name from Supabase mock
    expect(
      screen.getByText(mockFieldData.soil_type as string)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${mockFieldData.size} ${mockFieldData.size_unit}`)
    ).toBeInTheDocument();

    // Assert that crop information is displayed (from Supabase mock)
    expect(screen.getByText(mockCropsData[0].crop_name)).toBeInTheDocument();
    expect(
      screen.getByText(mockCropsData[0].variety as string)
    ).toBeInTheDocument();

    // Assert that history information is displayed (from Supabase mock)
    // This might be in a 'History' tab or section
    // For now, let's assume it's visible or becomes visible after load
    // Click on 'History' tab if it exists and is not active
    const historyTab = screen.queryByRole('tab', { name: /history/i });
    if (
      historyTab &&
      !historyTab.getAttribute('aria-selected')?.includes('true')
    ) {
      await userEvent.click(historyTab);
    }
    expect(
      await screen.findByText(mockHistoryData[0].description)
    ).toBeInTheDocument();
    expect(
      screen.getByText(mockHistoryData[0].notes as string)
    ).toBeInTheDocument();

    // Check for AI Insights section (assuming it loads by default)
    expect(
      await screen.findByText(/AI Recommendation 1: Consider crop rotation./i)
    ).toBeInTheDocument();
  });

  // TODO: Add more tests:
  // - Offline state and disabled actions
  // - Error loading field details (primary getFieldById failure)
  // - Error loading supplemental data (e.g., farm name, crops, history from Supabase)
  // - Crop Scan: UI before scan, image selection, perform scan, display results/errors, offline behavior
  // - Yield Prediction: UI before prediction, perform prediction, display results/errors, offline behavior
  // - AI Insights and Risks display (specific checks for content and loading/error states)
  // - Delete field functionality (dialog trigger, confirm, cancel, success/error toasts)
  // - Navigation to edit page
  // - Error boundary checks (simulating errors in children to see if boundaries catch them)

  it('should handle offline state correctly for actions', async () => {
    mockUseOfflineStatus.mockReturnValue(true); // Set to offline

    render(
      <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
        <Routes>
          <Route path="/field/:id" element={<FieldDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for initial data to load and display
    expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();

    // --- Test Crop Scan when offline ---
    // Find the crop scan tab/section and ensure it's visible
    const cropScanTab = screen.getByRole('tab', { name: /crop scan/i });
    await userEvent.click(cropScanTab);

    // Simulate file selection
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(
      /upload crop image/i
    ) as HTMLInputElement;
    await userEvent.upload(fileInput, file);

    // Attempt to perform crop scan
    const scanButton = screen.getByRole('button', {
      name: /scan crop health/i,
    });
    await userEvent.click(scanButton);

    // Check for offline toast and no agent call
    expect(mockToast.info).toHaveBeenCalledWith(
      'Crop scan requires an internet connection.'
    );
    expect(mockPerformCropScan).not.toHaveBeenCalled();

    // --- Test Yield Prediction when offline ---
    // Find the yield prediction tab/section and ensure it's visible
    const yieldPredictionTab = screen.getByRole('tab', {
      name: /yield prediction/i,
    });
    await userEvent.click(yieldPredictionTab);

    // Attempt to predict yield
    const predictButton = screen.getByRole('button', {
      name: /predict yield/i,
    });
    await userEvent.click(predictButton);

    // Check for offline toast and no agent call
    expect(mockToast.info).toHaveBeenCalledWith(
      'Yield prediction requires an internet connection.'
    );
    expect(mockPredictYield).not.toHaveBeenCalled();
  });

  it('should handle error when loading initial field details fails', async () => {
    // Simulate getFieldById failure
    const errorMessage = 'Network Error: Failed to fetch field data.';
    mockGetFieldById.mockResolvedValue({
      data: null,
      error: { message: errorMessage, details: '...' },
    });

    render(
      <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
        <Routes>
          <Route path="/field/:id" element={<FieldDetail />} />
          <Route path="/fields" element={<div>Fields List Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for error handling to occur
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Error', {
        description: expect.stringContaining(errorMessage),
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/fields');
    });

    // Ensure field specific content is not rendered
    expect(screen.queryByText(mockFieldData.name)).not.toBeInTheDocument();
    // Check if we landed on the fallback page (optional, but good to confirm navigation target)
    // expect(screen.getByText('Fields List Page')).toBeInTheDocument(); // This depends on how you want to assert navigation
  });

  describe('Crop Scan Functionality', () => {
    it('should allow image upload, perform scan, and display results on success', async () => {
      const user = userEvent.setup();
      // Mock a specific crop type for the current field if not already covered by mockFieldData
      // For this test, we assume mockFieldData and associated mockCurrentCrop provide necessary crop_name for cropType
      const expectedCropType = mockCropsData[0].crop_name; // e.g., 'Corn'
      const mockScanResultData = {
        analysis: 'Excellent crop health, minimal pest activity detected.',
      };
      mockPerformCropScan.mockResolvedValue({
        success: true,
        data: mockScanResultData,
      });

      // Update the hook to return the new mock function for this specific test if needed, or ensure beforeEach is sufficient
      // For this test, we'll rely on beforeEach and the specific mockResolvedValue above.
      // If scanResult were to update through the hook's state, we'd need to mock the hook's return value evolution.
      // However, the component re-fetches or relies on the hook's internal state update which triggers re-render.
      // Let's refine the mock for useCropScanAgent to simulate state update for scanResult.

      let currentScanResult = null;
      mockUseCropScanAgent.mockImplementation(() => ({
        performCropScan: (...args) => {
          // Simulate the hook's behavior of updating its internal state
          return mockPerformCropScan(...args).then((response) => {
            if (response.success) {
              currentScanResult = response.data; // Simulate the hook updating its state
            }
            return response;
          });
        },
        scanResult: currentScanResult, // This will be updated by the mockPerformCropScan call
        isLoading: false,
        error: null,
        recentScans: [],
      }));

      render(
        <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
          <Routes>
            <Route path="/field/:id" element={<FieldDetail />} />
          </Routes>
        </MemoryRouter>
      );

      // Wait for initial field data to load
      expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();

      // Navigate to Crop Scan tab
      const cropScanTab = screen.getByRole('tab', { name: /crop scan/i });
      await user.click(cropScanTab);

      // Check for initial UI elements
      const fileInput = screen.getByLabelText(
        /upload crop image/i
      ) as HTMLInputElement;
      const scanButton = screen.getByRole('button', {
        name: /scan crop health/i,
      });
      expect(fileInput).toBeInTheDocument();
      expect(scanButton).toBeInTheDocument();
      // Optionally, check for a 'no scan data' message if applicable
      // expect(screen.getByText(/no scan data available/i)).toBeInTheDocument();

      // Simulate file upload
      const imageFile = new File(['(⌐□_□)'], 'testimage.png', {
        type: 'image/png',
      });
      await user.upload(fileInput, imageFile);
      expect(fileInput.files?.[0]).toBe(imageFile);
      expect(fileInput.files?.length).toBe(1);

      // Click scan button
      await user.click(scanButton);

      // Assert performCropScan was called correctly
      await waitFor(() => {
        expect(mockPerformCropScan).toHaveBeenCalledWith({
          imageFile: imageFile,
          fieldId: mockFieldId,
          // cropType is no longer passed as it's not part of CropScanInput
        });
      });

      // Assert success toast
      expect(mockToast.success).toHaveBeenCalledWith('Crop scan successful!');

      // Assert scan results are displayed
      // The component re-renders with new scanResult from the hook
      // We need to re-query for the mockUseCropScanAgent to get the updated scanResult
      // This is tricky because the hook's state is internal. A better way is to check the DOM for the result.
      await waitFor(() => {
        // The text might be part of a larger element, so using a regex or stringContaining
        expect(
          screen.getByText(new RegExp(mockScanResultData.analysis, 'i'))
        ).toBeInTheDocument();
      });
    });

    it('should handle errors during crop scan and display an error toast', async () => {
      const user = userEvent.setup();
      const cropScanErrorMessage =
        'Failed to analyze crop image due to server error.';
      mockPerformCropScan.mockResolvedValue({
        success: false,
        error: { message: cropScanErrorMessage },
      });
      // The component uses `err instanceof Error ? err : new Error('Crop scan UI error')`
      // So the mock error should ideally be an Error instance or have a message property.

      let currentCropScanError: { message: string } | null = null;
      mockUseCropScanAgent.mockImplementation(() => ({
        performCropScan: (...args) => {
          return mockPerformCropScan(...args).then((response) => {
            if (!response.success) {
              currentCropScanError = response.error as { message: string };
            }
            return response;
          });
        },
        scanResult: null,
        isLoading: false,
        error: currentCropScanError,
        recentScans: [],
      }));

      render(
        <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
          <Routes>
            <Route path="/field/:id" element={<FieldDetail />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();
      const cropScanTab = screen.getByRole('tab', { name: /crop scan/i });
      await user.click(cropScanTab);

      const fileInput = screen.getByLabelText(
        /upload crop image/i
      ) as HTMLInputElement;
      const scanButton = screen.getByRole('button', {
        name: /scan crop health/i,
      });
      const imageFile = new File(['(ಠ_ಠ)'], 'errorimage.png', {
        type: 'image/png',
      });
      await user.upload(fileInput, imageFile);
      await user.click(scanButton);

      await waitFor(() => {
        expect(mockPerformCropScan).toHaveBeenCalled();
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        'An error occurred during crop scan.'
      );
      // The component logs the specific error via diagnostics
      // The actual error passed to diagnostics.logError in the component is `err instanceof Error ? err : new Error('Crop scan UI error')`
      // and the original error (cropScanErrorMessage) is part of the context.
      // We can check if logError was called, and optionally inspect its arguments if needed for more specific tests.
      expect(mockDiagnosticsLogError).toHaveBeenCalled();

      // Ensure no success message is shown or old results are cleared / error message is shown in place
      expect(
        screen.queryByText(/Excellent crop health/i)
      ).not.toBeInTheDocument(); // From previous success test
      // Depending on implementation, an error message might be displayed in the UI directly
      // For now, we confirm the toast and lack of success data.
    });
  });

  describe('Yield Prediction Functionality', () => {
    it('should perform yield prediction and display results on success', async () => {
      const user = userEvent.setup();
      const expectedCropType = mockCropsData[0].crop_name; // e.g., 'Corn'
      const expectedPlantingDate = mockCropsData[0].planting_date as string;
      const mockPredictionResultData = {
        predictedYield: 6.2,
        unit: 'tons/ha',
        confidence: 0.9,
      };

      mockPredictYield.mockResolvedValue({
        success: true,
        data: mockPredictionResultData,
      });

      // Similar to crop scan, simulate hook state update for prediction
      let currentPrediction = null;
      mockUseYieldPredictorAgent.mockImplementation(() => ({
        predictYield: (...args) => {
          return mockPredictYield(...args).then((response) => {
            if (response.success) {
              currentPrediction = response.data;
            }
            return response;
          });
        },
        prediction: currentPrediction,
        isLoading: false,
        error: null,
        saveYieldPrediction: vi.fn().mockResolvedValue({ success: true }),
      }));

      render(
        <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
          <Routes>
            <Route path="/field/:id" element={<FieldDetail />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();

      const yieldPredictionTab = screen.getByRole('tab', {
        name: /yield prediction/i,
      });
      await user.click(yieldPredictionTab);

      const predictButton = screen.getByRole('button', {
        name: /predict yield/i,
      });
      expect(predictButton).toBeInTheDocument();
      // Optionally, check for a 'no prediction data' message

      await user.click(predictButton);

      await waitFor(() => {
        expect(mockPredictYield).toHaveBeenCalledWith({
          fieldId: mockFieldId,
          cropType: expectedCropType,
          plantingDate: new Date(expectedPlantingDate), // Date object, not string
          weatherData: {
            current: null,
            forecast: null,
          },
          soilData: mockFieldData.soil_type ? { ph: undefined } : null,
        });
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        'Yield prediction generated!'
      );

      await waitFor(() => {
        // Example: "Predicted Yield: 6.2 tons/ha (Confidence: 90%)"
        expect(
          screen.getByText(
            new RegExp(
              `${mockPredictionResultData.predictedYield}\s*${mockPredictionResultData.unit}`,
              'i'
            )
          )
        ).toBeInTheDocument();
        if (mockPredictionResultData.confidence) {
          expect(
            screen.getByText(
              new RegExp(
                `Confidence: ${mockPredictionResultData.confidence * 100}%`,
                'i'
              )
            )
          ).toBeInTheDocument();
        }
      });
    });

    it('should handle errors during yield prediction and display an error toast', async () => {
      const user = userEvent.setup();
      const yieldPredictionErrorMessage = 'Yield prediction model unavailable.';
      mockPredictYield.mockResolvedValue({
        success: false,
        error: { message: yieldPredictionErrorMessage },
      });

      let currentYieldPredictionError: { message: string } | null = null;
      mockUseYieldPredictorAgent.mockImplementation(() => ({
        predictYield: (...args) => {
          return mockPredictYield(...args).then((response) => {
            if (!response.success) {
              currentYieldPredictionError = response.error as {
                message: string;
              };
            }
            return response;
          });
        },
        prediction: null,
        isLoading: false,
        error: currentYieldPredictionError,
        saveYieldPrediction: vi.fn(),
      }));

      render(
        <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
          <Routes>
            <Route path="/field/:id" element={<FieldDetail />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();
      const yieldPredictionTab = screen.getByRole('tab', {
        name: /yield prediction/i,
      });
      await user.click(yieldPredictionTab);

      const predictButton = screen.getByRole('button', {
        name: /predict yield/i,
      });
      await user.click(predictButton);

      await waitFor(() => {
        expect(mockPredictYield).toHaveBeenCalled();
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        'An error occurred during yield prediction.'
      );
      expect(mockDiagnosticsLogError).toHaveBeenCalled();

      expect(screen.queryByText(/Predicted Yield/i)).not.toBeInTheDocument();
    });
  });

  describe('AI Insights and Risks', () => {
    const mockRecs = [
      'Consider adding nitrogen.',
      'Optimize irrigation schedule.',
    ];
    const mockRisks = [
      'Risk of fungal infection.',
      'Potential pest activity noted.',
    ];

    it('should display AI recommendations and risks successfully', async () => {
      mockGetFieldRecommendations.mockResolvedValue(mockRecs);
      mockCheckFieldRisks.mockResolvedValue(mockRisks);

      render(
        <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
          <Routes>
            <Route path="/field/:id" element={<FieldDetail />} />
          </Routes>
        </MemoryRouter>
      );

      // Wait for initial field data and then for AI insights
      expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();

      // Check for Recommendations
      expect(await screen.findByText('AI Recommendations')).toBeInTheDocument();
      for (const rec of mockRecs) {
        expect(screen.getByText(rec)).toBeInTheDocument();
      }

      // Check for Risks
      expect(
        await screen.findByText('Potential Field Risks')
      ).toBeInTheDocument(); // Assuming this title from component
      for (const risk of mockRisks) {
        expect(screen.getByText(risk)).toBeInTheDocument();
      }

      // Ensure loading states are gone
      expect(
        screen.queryByText(/Loading recommendations.../i)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/Loading risks.../i)).not.toBeInTheDocument();
    });

    it('should display loading states for recommendations and risks', async () => {
      // Use promises that don't resolve immediately
      let resolveRecs: (value: string[]) => void;
      let resolveRisks: (value: string[]) => void;
      mockGetFieldRecommendations.mockReturnValue(
        new Promise((resolve) => {
          resolveRecs = resolve;
        })
      );
      mockCheckFieldRisks.mockReturnValue(
        new Promise((resolve) => {
          resolveRisks = resolve;
        })
      );

      render(
        <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
          <Routes>
            <Route path="/field/:id" element={<FieldDetail />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();
      // Check for loading indicators immediately after component mounts and useEffects run
      // Need to wait for the initial field data to load first, then these sections try to load.
      await waitFor(() => {
        expect(
          screen.getByText(/Loading recommendations.../i)
        ).toBeInTheDocument();
        expect(screen.getByText(/Loading risks.../i)).toBeInTheDocument();
      });

      // Resolve promises to allow test to complete and avoid warnings
      // @ts-ignore
      resolveRecs(mockRecs);
      // @ts-ignore
      resolveRisks(mockRisks);

      // Wait for loading states to disappear
      await waitFor(() => {
        expect(
          screen.queryByText(/Loading recommendations.../i)
        ).not.toBeInTheDocument();
        expect(screen.queryByText(/Loading risks.../i)).not.toBeInTheDocument();
      });
    });

    it('should handle error when fetching recommendations but display risks', async () => {
      const recErrorMessage = 'Failed to fetch recommendations.';
      mockGetFieldRecommendations.mockRejectedValue(new Error(recErrorMessage));
      mockCheckFieldRisks.mockResolvedValue(mockRisks);

      render(
        <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
          <Routes>
            <Route path="/field/:id" element={<FieldDetail />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Error fetching AI recommendations',
          { description: recErrorMessage }
        );
      });
      expect(screen.queryByText(mockRecs[0])).not.toBeInTheDocument(); // Recommendations not shown
      expect(screen.getByText('Potential Field Risks')).toBeInTheDocument(); // Risks title shown
      for (const risk of mockRisks) {
        expect(screen.getByText(risk)).toBeInTheDocument(); // Risks are shown
      }
      expect(mockDiagnosticsLogError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.stringContaining(recErrorMessage)
      );
    });

    it('should handle error when fetching risks but display recommendations', async () => {
      const riskErrorMessage = 'Failed to fetch field risks.';
      mockGetFieldRecommendations.mockResolvedValue(mockRecs);
      mockCheckFieldRisks.mockRejectedValue(new Error(riskErrorMessage));

      render(
        <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
          <Routes>
            <Route path="/field/:id" element={<FieldDetail />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Error fetching field risks',
          { description: riskErrorMessage }
        );
      });
      expect(screen.getByText('AI Recommendations')).toBeInTheDocument(); // Recommendations title shown
      for (const rec of mockRecs) {
        expect(screen.getByText(rec)).toBeInTheDocument(); // Recommendations are shown
      }
      expect(screen.queryByText(mockRisks[0])).not.toBeInTheDocument(); // Risks not shown
      expect(mockDiagnosticsLogError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.stringContaining(riskErrorMessage)
      );
    });
  });

  describe('Delete Field Functionality', () => {
    it('should allow deleting a field with confirmation, show success toast, and navigate', async () => {
      const user = userEvent.setup();
      mockDeleteField.mockResolvedValue({ success: true, error: null });

      render(
        <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
          <Routes>
            <Route path="/field/:id" element={<FieldDetail />} />
            <Route path="/fields" element={<div>Fields List Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();

      // Find and click the delete button
      // Assuming the delete button has a distinct label or role
      const deleteButton = screen.getByRole('button', {
        name: /delete field/i,
      });
      await user.click(deleteButton);

      // Confirmation dialog should appear
      // Assuming dialog has a title and confirm/cancel buttons
      // The dialog might be an Alert Dialog pattern
      expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
      expect(
        screen.getByText(/are you sure you want to delete this field/i)
      ).toBeInTheDocument();

      const confirmDeleteButton = screen.getByRole('button', {
        name: /confirm delete/i,
      }); // Or just 'Delete' or 'Yes'
      await user.click(confirmDeleteButton);

      await waitFor(() => {
        expect(mockDeleteField).toHaveBeenCalledWith(mockFieldId);
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        'Field deleted successfully'
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/fields');
      });
    });

    it('should not delete field if confirmation is canceled', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
          <Routes>
            <Route path="/field/:id" element={<FieldDetail />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();

      const deleteButton = screen.getByRole('button', {
        name: /delete field/i,
      });
      await user.click(deleteButton);

      expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockDeleteField).not.toHaveBeenCalled();
      expect(mockToast.success).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalledWith('/fields');
      // Ensure dialog is closed
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('should show an error toast if field deletion fails', async () => {
      const user = userEvent.setup();
      const deleteErrorMessage = 'Server error: Could not delete field.';
      mockDeleteField.mockResolvedValue({
        success: false,
        error: { message: deleteErrorMessage },
      });

      render(
        <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
          <Routes>
            <Route path="/field/:id" element={<FieldDetail />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();

      const deleteButton = screen.getByRole('button', {
        name: /delete field/i,
      });
      await user.click(deleteButton);

      expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
      const confirmDeleteButton = screen.getByRole('button', {
        name: /confirm delete/i,
      });
      await user.click(confirmDeleteButton);

      await waitFor(() => {
        expect(mockDeleteField).toHaveBeenCalledWith(mockFieldId);
      });

      expect(mockToast.error).toHaveBeenCalledWith('Failed to delete field', {
        description: deleteErrorMessage,
      });
      expect(mockDiagnosticsLogError).toHaveBeenCalledWith(
        expect.objectContaining({ message: deleteErrorMessage }),
        'Field Deletion Error'
      );
      expect(mockNavigate).not.toHaveBeenCalledWith('/fields');
      // Dialog might close or stay open depending on UX choice for errors
      // Assuming it closes for now:
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate to the edit page when "Edit Field" button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
          <Routes>
            <Route path="/field/:id" element={<FieldDetail />} />
            <Route
              path="/fields/:id/edit"
              element={<div>Edit Field Page</div>}
            />
          </Routes>
        </MemoryRouter>
      );

      // Wait for initial field data to load
      expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();

      // Find and click the edit button
      // Assuming the edit button has a distinct label or role, e.g., "Edit Field"
      const editButton = screen.getByRole('button', { name: /edit field/i });
      expect(editButton).toBeInTheDocument();
      await user.click(editButton);

      // Assert navigation to the edit page
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          `/fields/${mockFieldId}/edit`
        );
      });
      // Optionally, verify the new page content if you render a placeholder for it
      // expect(screen.getByText('Edit Field Page')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Handling', () => {
    it('should display FieldDetailErrorBoundary fallback UI when a child component throws an error', async () => {
      const errorMessage = 'Simulated error from useFarm hook';
      // Mock useFarm to throw an error
      mockUseFarm.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      // Suppress console.error output from React for this expected error
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
          <Routes>
            <Route path="/field/:id" element={<FieldDetail />} />
          </Routes>
        </MemoryRouter>
      );

      // Check for the ErrorBoundary's fallback UI
      // The exact text depends on the ErrorBoundary's implementation.
      // Assuming a generic message for FieldDetailErrorBoundary's fallback.
      expect(
        await screen.findByText(/an unexpected error occurred on this page/i)
      ).toBeInTheDocument();

      // Check that normal content is not rendered
      expect(screen.queryByText(mockFieldData.name)).not.toBeInTheDocument();
      expect(screen.queryByText(mockFarmData.name)).not.toBeInTheDocument();

      // Check if diagnostic service was called
      // The error boundary should log the error.
      expect(mockDiagnosticsLogError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.stringContaining('FieldDetailErrorBoundary')
      );
      // More specific check for the error message if possible/needed:
      const loggedError = mockDiagnosticsLogError.mock.calls[0][0] as Error;
      expect(loggedError.message).toBe(errorMessage);

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    it('should display CropScanErrorBoundary fallback UI when crop scan section throws an error', async () => {
      const user = userEvent.setup();
      const cropScanErrorMessage =
        'Simulated error from useCropScanAgent during render';

      // Initial mock for successful main page load
      mockUseCropScanAgent.mockReturnValue({
        performCropScan: mockPerformCropScan,
        scanResult: null,
        isLoading: false,
        error: null,
        recentScans: [],
      });

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
          <Routes>
            <Route path="/field/:id" element={<FieldDetail />} />
          </Routes>
        </MemoryRouter>
      );

      // Wait for initial field data to load
      expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();
      expect(screen.getByText(mockFarmData.name)).toBeInTheDocument(); // Main content visible

      // Now, make the hook throw an error when its UI is about to be rendered
      mockUseCropScanAgent.mockImplementation(() => {
        throw new Error(cropScanErrorMessage);
      });

      // Navigate to Crop Scan tab to trigger the error
      const cropScanTab = screen.getByRole('tab', { name: /crop scan/i });
      await user.click(cropScanTab);

      // Check for the CropScanErrorBoundary's fallback UI
      // The exact text depends on the ErrorBoundary's implementation.
      expect(
        await screen.findByText(/error in crop scan section/i)
      ).toBeInTheDocument(); // Adjusted expected text

      // Check that main content is still rendered
      expect(screen.getByText(mockFieldData.name)).toBeInTheDocument();
      expect(screen.getByText(mockFarmData.name)).toBeInTheDocument();
      // Ensure crop scan specific UI (like the upload button) is not there
      expect(
        screen.queryByLabelText(/upload crop image/i)
      ).not.toBeInTheDocument();

      // Check if diagnostic service was called by the error boundary
      expect(mockDiagnosticsLogError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.stringContaining('CropScanErrorBoundary')
      );
      const loggedError = mockDiagnosticsLogError.mock.calls.find((call) =>
        call[1].includes('CropScanErrorBoundary')
      )?.[0] as Error;
      expect(loggedError?.message).toBe(cropScanErrorMessage);

      consoleErrorSpy.mockRestore();
    });

    it('should display YieldPredictionErrorBoundary fallback UI when yield prediction section throws an error', async () => {
      const user = userEvent.setup();
      const yieldErrorMessage =
        'Simulated error from useYieldPredictorAgent during render';

      // Initial mock for successful main page load
      mockUseYieldPredictorAgent.mockReturnValue({
        predictYield: mockPredictYield,
        prediction: null,
        isLoading: false,
        error: null,
        saveYieldPrediction: vi.fn(),
      });

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
          <Routes>
            <Route path="/field/:id" element={<FieldDetail />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();
      expect(screen.getByText(mockFarmData.name)).toBeInTheDocument(); // Main content visible

      // Now, make the hook throw an error when its UI is about to be rendered
      mockUseYieldPredictorAgent.mockImplementation(() => {
        throw new Error(yieldErrorMessage);
      });

      const yieldPredictionTab = screen.getByRole('tab', {
        name: /yield prediction/i,
      });
      await user.click(yieldPredictionTab);

      expect(
        await screen.findByText(/error in yield prediction section/i)
      ).toBeInTheDocument(); // Adjusted expected text

      expect(screen.getByText(mockFieldData.name)).toBeInTheDocument();
      expect(screen.getByText(mockFarmData.name)).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /predict yield/i })
      ).not.toBeInTheDocument();

      expect(mockDiagnosticsLogError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.stringContaining('YieldPredictionErrorBoundary')
      );
      const loggedError = mockDiagnosticsLogError.mock.calls.find((call) =>
        call[1].includes('YieldPredictionErrorBoundary')
      )?.[0] as Error;
      expect(loggedError?.message).toBe(yieldErrorMessage);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Supplemental Data Loading', () => {
    it('should display an error toast if loading field_crops fails', async () => {
      const cropsErrorMessage =
        'Database error: Unable to retrieve crop records.';
      // Adjust Supabase mock to make only field_crops fail
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'fields') {
          return {
            // Successful main field data load
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi
              .fn()
              .mockResolvedValue({ data: mockFieldData, error: null }),
          };
        }
        if (table === 'field_crops') {
          return {
            // Failed crops load
            select: vi.fn().mockReturnThis(),
            eq: vi
              .fn()
              .mockResolvedValue({
                data: null,
                error: { message: cropsErrorMessage },
              }),
          };
        }
        if (table === 'field_history') {
          return {
            // Successful history load
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi
              .fn()
              .mockResolvedValue({ data: mockHistoryData, error: null }),
          };
        }
        return { select: vi.fn().mockReturnThis() }; // Default for other tables
      });

      render(
        <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
          <Routes>
            <Route path="/field/:id" element={<FieldDetail />} />
          </Routes>
        </MemoryRouter>
      );

      // Wait for initial field data to load
      expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();

      // Check for crop loading error toast
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Error loading crop data',
          {
            description: cropsErrorMessage,
          }
        );
      });

      // Check diagnostics log
      expect(mockDiagnosticsLogError).toHaveBeenCalledWith(
        expect.objectContaining({ message: cropsErrorMessage }),
        'FieldDetail: Supabase crops fetch'
      );

      // Optionally, check UI state for crops (e.g., empty list or message)
      // For now, the toast and log are the primary assertions for this failure.
    });

    it('should display an error toast if loading field_history fails', async () => {
      const historyErrorMessage =
        'Database error: Unable to retrieve field history.';
      // Adjust Supabase mock to make only field_history fail
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'fields') {
          return {
            // Successful main field data load
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi
              .fn()
              .mockResolvedValue({ data: mockFieldData, error: null }),
          };
        }
        if (table === 'field_crops') {
          return {
            // Successful crops load
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: mockCropsData, error: null }),
          };
        }
        if (table === 'field_history') {
          return {
            // Failed history load
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi
              .fn()
              .mockResolvedValue({
                data: null,
                error: { message: historyErrorMessage },
              }),
          };
        }
        return { select: vi.fn().mockReturnThis() }; // Default for other tables
      });

      render(
        <MemoryRouter initialEntries={[`/field/${mockFieldId}`]}>
          <Routes>
            <Route path="/field/:id" element={<FieldDetail />} />
          </Routes>
        </MemoryRouter>
      );

      // Wait for initial field data and crops to load
      expect(await screen.findByText(mockFieldData.name)).toBeInTheDocument();
      // Ensure crops data is processed (e.g., by checking for a crop name if displayed, or just that no crop error toast appeared)
      // For simplicity, we'll assume the absence of a crop error toast means crops loaded.
      await waitFor(() => {
        expect(mockToast.error).not.toHaveBeenCalledWith(
          'Error loading crop data',
          expect.anything()
        );
      });

      // Check for history loading error toast
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Error loading field history',
          {
            description: historyErrorMessage,
          }
        );
      });

      // Check diagnostics log
      expect(mockDiagnosticsLogError).toHaveBeenCalledWith(
        expect.objectContaining({ message: historyErrorMessage }),
        'FieldDetail: Supabase history fetch'
      );

      // Main field data and crop data should still be accessible/rendered
      expect(screen.getByText(mockFarmData.name)).toBeInTheDocument();
      // If FieldCropsList renders something specific from mockCropsData, we could check that too.
      // For instance, if the first crop name is displayed:
      // expect(screen.getByText(mockCropsData[0].crop_name)).toBeInTheDocument();
    });
  });
});
