# Machine Learning Predictions Guide

## Overview

The ML Predictions feature provides advanced predictive analytics for patient care using machine learning algorithms. This system analyzes clinical data to generate predictions about patient outcomes, treatment responses, and potential risks.

## Components

### 1. MLPredictionsDashboard Component
**Location**: `src/components/MLPredictionsDashboard.tsx`

A comprehensive dashboard component that displays ML predictions for a specific patient.

#### Features:
- **Interactive Prediction Cards**: Display multiple prediction types with risk levels and confidence scores
- **Trend Analysis**: Historical visualization using Recharts library
- **Confidence Indicators**: Visual representation of model confidence levels
- **Risk Factor Display**: Detailed breakdown of identified risk factors
- **Natural Language Explanations**: User-friendly explanations of predictions
- **Quick Actions**: Buttons for requesting new predictions

#### Props:
```typescript
interface MLPredictionsDashboardProps {
  patientId: string;
}
```

#### Usage Example:
```tsx
import MLPredictionsDashboard from './components/MLPredictionsDashboard';

<MLPredictionsDashboard patientId={patientId} />
```

### 2. MLPredictions Page
**Location**: `src/pages/MLPredictions.tsx`

A full-page wrapper that provides navigation and context for the ML Predictions dashboard.

#### Features:
- Full page layout with header and navigation
- Information panel about ML models
- Patient selection handling
- Educational content about model interpretation
- Back navigation to patient details

### 3. useMLPredictions Hook
**Location**: `src/hooks/useMLPredictions.ts`

Custom React hook that manages ML predictions data and API interactions.

#### API Functions:
- `fetchPatientPredictions`: Retrieve all predictions for a patient
- `fetchAvailableModels`: Get list of available ML models
- `requestNewPrediction`: Request a new prediction
- `fetchLatestPredictions`: Get recent predictions across all patients
- `analyzeTrends`: Analyze prediction trends over time

#### Hook Interface:
```typescript
const {
  // Data
  patientPredictions,
  availableModels,
  latestPredictions,
  trendsData,
  selectedModel,
  
  // Loading states
  isLoadingPredictions,
  isLoadingModels,
  isLoading,
  
  // Error states
  error,
  
  // Actions
  requestPrediction,
  refetchPredictions,
  setSelectedModel,
  
  // Helper functions
  getPredictionById,
  getPredictionsByModel,
  getActiveModels,
} = useMLPredictions({ patientId });
```

#### Environment Configuration:
The hook supports different environments (dev, test, prod) through environment variables:
- `REACT_APP_ML_API_URL_DEV`: Development API URL
- `REACT_APP_ML_API_URL_TEST`: Test API URL
- `REACT_APP_ML_API_URL_PROD`: Production API URL

## Data Types

### MLPrediction
```typescript
interface MLPrediction {
  id: string;
  patientId: string;
  modelId: string;
  modelName: string;
  predictionType: string;
  result: {
    value: number;
    confidence: number;
    risk_level?: 'low' | 'medium' | 'high';
    metadata?: Record<string, any>;
  };
  features: Record<string, any>;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}
```

### MLModel
```typescript
interface MLModel {
  id: string;
  name: string;
  description: string;
  version: string;
  type: string;
  accuracy?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Routing

### Available Routes:
1. **Patient-Specific Predictions**: `/patients/:patientId/predictions`
2. **General ML Predictions**: `/ml-predictions`

Both routes are protected and require authentication.

## Design System Integration

The ML Predictions feature follows the existing design system:
- **shadcn/ui components**: Card, Button, Badge, Alert
- **Tailwind CSS**: For styling and responsive design
- **Lucide React**: For icons
- **Recharts**: For data visualization

### Color Coding:
- **Green**: Low risk / High confidence
- **Yellow**: Medium risk / Moderate confidence
- **Red**: High risk / Low confidence

## Backend Integration

### Database Tables (Supabase):
1. **ml_models**: Stores ML model metadata
2. **ml_predictions**: Stores prediction results
3. **ml_model_features**: Stores feature definitions
4. **ml_training_logs**: Tracks model training history

### Views:
- **latest_user_predictions**: Optimized view for retrieving latest predictions per user

### Row Level Security:
All tables include RLS policies to ensure users can only access their own predictions.

## Prediction Types

### 1. Readmission Risk
- Predicts probability of hospital readmission
- Key factors: Previous admissions, comorbidities, treatment compliance

### 2. Complication Risk
- Identifies potential treatment complications
- Key factors: Medical history, current medications, vital signs

### 3. Treatment Response
- Predicts response to specific interventions
- Key factors: Patient characteristics, treatment history, biomarkers

## Best Practices

### For Developers:
1. **Error Handling**: Always handle loading and error states
2. **Data Validation**: Validate prediction data before displaying
3. **Environment Variables**: Use appropriate API endpoints per environment
4. **Caching**: Leverage React Query's caching for performance
5. **Type Safety**: Use TypeScript interfaces consistently

### For Clinicians:
1. **Interpretation**: Predictions are decision support tools, not replacements for clinical judgment
2. **Confidence Levels**: Always review confidence scores before acting on predictions
3. **Risk Factors**: Examine identified risk factors for clinical relevance
4. **Updates**: Predictions should be refreshed when new clinical data is available

## Testing

### Unit Tests:
- Test hook functions with mock data
- Test component rendering with various prediction states
- Test error handling scenarios

### Integration Tests:
- Test API interactions
- Test data flow from hook to component
- Test user interactions (requesting predictions, filtering, etc.)

## Performance Considerations

1. **Query Caching**: Predictions are cached for 5 minutes
2. **Lazy Loading**: Large datasets are paginated
3. **Debouncing**: User inputs are debounced to reduce API calls
4. **Optimistic Updates**: UI updates immediately when requesting predictions

## Future Enhancements

1. **Model Comparison**: Side-by-side comparison of different models
2. **Custom Alerts**: Configurable thresholds for prediction alerts
3. **Export Functionality**: Export predictions to PDF/CSV
4. **Real-time Updates**: WebSocket integration for live predictions
5. **Explainable AI**: Enhanced explanations using SHAP values
6. **Mobile Optimization**: Native mobile app support

## Troubleshooting

### Common Issues:

#### Predictions Not Loading
- Check API endpoint configuration
- Verify authentication token
- Check network connectivity
- Review browser console for errors

#### Low Confidence Scores
- Ensure sufficient training data
- Verify data quality
- Check for missing features
- Consider model retraining

#### Performance Issues
- Review query caching settings
- Check pagination implementation
- Optimize component re-renders
- Monitor API response times

## Support

For technical issues or questions:
- Review this documentation
- Check existing issues on GitHub
- Contact the development team

## References

- [React Query Documentation](https://tanstack.com/query/latest)
- [Recharts Documentation](https://recharts.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**Last Updated**: October 7, 2025
**Version**: 1.0.0
