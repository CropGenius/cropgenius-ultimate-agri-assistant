# Field Detail Module

This module provides a comprehensive view of a single field, including its details, crops, history, and analytics.

## Features

- **Field Details**: Display and manage field information
- **Crop Management**: View current and past crops
- **Activity History**: Track all field activities and changes
- **AI-Powered Analytics**:
  - Crop scan analysis
  - Yield prediction
  - AI-generated insights
  - Risk assessment

## Hooks

### `useCropScan`

Manages crop scan functionality including image upload and analysis.

### `useFieldInsights`

Fetches and manages AI-generated insights for the field.

### `useFieldRisks`

Handles risk assessment for the field.

### `useYieldPrediction`

Manages yield prediction functionality.

## Components

### `FieldDetailsSection`

Displays the main field information.

### `CropsSection`

Shows current and past crops for the field.

### `HistorySection`

Displays the activity history for the field.

### `AnalyticsSection`

Contains all analytics features including crop scan, yield prediction, insights, and risk assessment.

## Usage

```tsx
import { FieldDetailPage } from '@/pages/FieldDetail';

// In your router:
{
  path: '/fields/:id',
  element: <FieldDetailPage />,
}
```

## Offline Support

All data mutations are queued when offline and automatically retried when connectivity is restored. The UI provides appropriate feedback for offline states.

## Error Handling

The module includes comprehensive error handling with user-friendly error messages and automatic retry logic for failed operations.
