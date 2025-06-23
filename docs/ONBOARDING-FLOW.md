# CropGenius Onboarding Flow

This document outlines the onboarding flow for new users in the CropGenius application.

## Overview

The onboarding flow consists of 6 steps that collect essential information from farmers to set up their profiles and farms in the system. The flow is designed to be user-friendly and collect all necessary information efficiently.

## Flow Steps

1. **Farm Vitals**
   - Farm name
   - Total farm area
   - Location (optional)

2. **Crop Selection**
   - Select crops being grown
   - Planting and harvest dates
   - Field sizes (if multiple crops)

3. **Farm Infrastructure**
   - Irrigation availability
   - Machinery ownership
   - Soil test status

4. **Goals & Challenges**
   - Primary farming goal
   - Main challenges faced
   - Budget constraints

5. **Personal Details**
   - Contact information
   - Preferred language
   - Communication preferences

6. **Genius Plan**
   - Summary of information
   - Confirmation
   - Initial recommendations

## Technical Implementation

### Frontend Components

- **OnboardingWizard**: Main container component that manages the multi-step flow
- **Step Components**: Individual components for each step (StepOneFarmVitals through StepSixGeniusPlan)
- **Hooks**:
  - `useOnboarding`: Manages form state and submission logic
  - `useFormNavigation`: Handles step navigation and validation

### Backend Integration

- **RPC Function**: `complete_onboarding` - Handles the entire onboarding process in a single transaction
- **Tables Affected**:
  - `profiles`: Updates user profile with farm information
  - `farms`: Creates a new farm record
  - `crop_types`: Ensures all crop types exist
  - `fields`: Creates field entries for each crop
  - `user_preferences`: Saves user preferences and settings

### Data Flow

1. User fills out the multi-step form
2. On final submission, form data is validated and formatted
3. Data is sent to the `complete_onboarding` RPC function
4. Backend processes the data in a single transaction
5. Success/failure response is returned to the frontend
6. On success, user is redirected to the dashboard

## Testing

### Unit Tests

Run the test suite with:

```bash
npm test
```

### Manual Testing

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Navigate to the onboarding flow
3. Complete each step with test data
4. Verify data is saved correctly in the database

### Automated Testing

Run the end-to-end test script:

```bash
# Install test dependencies
npm install -D @faker-js/faker @supabase/supabase-js

# Run the test script
npx ts-node scripts/test-onboarding.ts
```

## Error Handling

### Common Issues

1. **Missing Required Fields**
   - Frontend validation should prevent submission
   - Backend validates all required fields

2. **Invalid Data Formats**
   - Dates must be valid ISO strings
   - Numbers must be valid numeric values
   - Arrays must be properly formatted JSON

3. **Database Constraints**
   - Unique constraints on email, farm names, etc.
   - Foreign key relationships

### Error Responses

All errors include:
- `message`: Human-readable error message
- `code`: Error code for programmatic handling
- `details`: Additional error details (if available)

## Deployment

### Database Migrations

Apply the latest migrations:

```bash
supabase db push
```

### Environment Variables

Ensure these environment variables are set:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Monitoring

### Logs

Check Supabase logs for any issues:

```bash
supabase logs
```

### Analytics

Track onboarding completion rates and drop-off points to identify areas for improvement.

## Future Improvements

1. **Progressive Profiling**
   - Allow users to complete onboarding in multiple sessions
   - Save progress automatically

2. **Enhanced Validation**
   - More robust client-side validation
   - Real-time feedback on input fields

3. **Multi-language Support**
   - Support for additional languages
   - Localized content and validation messages

4. **Integration Testing**
   - Add more comprehensive test coverage
   - Test edge cases and error conditions
