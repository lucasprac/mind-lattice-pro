import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

// Types
export interface MLPrediction {
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

export interface MLModel {
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

export interface PredictionRequest {
  patientId: string;
  modelId: string;
  features: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface TrendAnalysis {
  patientId: string;
  modelId: string;
  predictions: MLPrediction[];
  trend: 'improving' | 'stable' | 'declining';
  changeRate: number;
  confidenceAvg: number;
  timeRange: {
    start: string;
    end: string;
  };
}

interface UseMLPredictionsOptions {
  patientId?: string;
  modelId?: string;
  enabled?: boolean;
  refetchInterval?: number;
}

// API Base URL configuration based on environment
const getApiBaseUrl = (): string => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return process.env.REACT_APP_ML_API_URL_PROD || '/api/ml';
    case 'test':
      return process.env.REACT_APP_ML_API_URL_TEST || '/api/ml';
    default:
      return process.env.REACT_APP_ML_API_URL_DEV || '/api/ml';
  }
};

const API_BASE_URL = getApiBaseUrl();

// API Functions
const fetchPatientPredictions = async (patientId: string): Promise<MLPrediction[]> => {
  const response = await fetch(`${API_BASE_URL}/predictions/patient/${patientId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch predictions: ${response.statusText}`);
  }
  
  return response.json();
};

const fetchAvailableModels = async (): Promise<MLModel[]> => {
  const response = await fetch(`${API_BASE_URL}/models`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }
  
  return response.json();
};

const requestNewPrediction = async (request: PredictionRequest): Promise<MLPrediction> => {
  const response = await fetch(`${API_BASE_URL}/predictions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to request prediction: ${response.statusText}`);
  }
  
  return response.json();
};

const fetchLatestPredictions = async (limit: number = 10): Promise<MLPrediction[]> => {
  const response = await fetch(`${API_BASE_URL}/predictions/latest?limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch latest predictions: ${response.statusText}`);
  }
  
  return response.json();
};

const analyzeTrends = async (
  patientId: string,
  modelId: string,
  days: number = 30
): Promise<TrendAnalysis> => {
  const response = await fetch(
    `${API_BASE_URL}/predictions/trends?patientId=${patientId}&modelId=${modelId}&days=${days}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to analyze trends: ${response.statusText}`);
  }
  
  return response.json();
};

// Main Hook
export const useMLPredictions = (options: UseMLPredictionsOptions = {}) => {
  const { patientId, modelId, enabled = true, refetchInterval } = options;
  const queryClient = useQueryClient();
  const [selectedModel, setSelectedModel] = useState<string | undefined>(modelId);

  // Query: Fetch patient predictions
  const {
    data: patientPredictions,
    isLoading: isLoadingPredictions,
    error: predictionsError,
    refetch: refetchPredictions,
  } = useQuery({
    queryKey: ['mlPredictions', 'patient', patientId],
    queryFn: () => fetchPatientPredictions(patientId!),
    enabled: enabled && !!patientId,
    refetchInterval,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query: Fetch available models
  const {
    data: availableModels,
    isLoading: isLoadingModels,
    error: modelsError,
  } = useQuery({
    queryKey: ['mlModels'],
    queryFn: fetchAvailableModels,
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Query: Fetch latest predictions
  const {
    data: latestPredictions,
    isLoading: isLoadingLatest,
    error: latestError,
  } = useQuery({
    queryKey: ['mlPredictions', 'latest'],
    queryFn: () => fetchLatestPredictions(),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Query: Analyze trends
  const {
    data: trendsData,
    isLoading: isLoadingTrends,
    error: trendsError,
    refetch: refetchTrends,
  } = useQuery({
    queryKey: ['mlPredictions', 'trends', patientId, selectedModel],
    queryFn: () => analyzeTrends(patientId!, selectedModel!),
    enabled: enabled && !!patientId && !!selectedModel,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation: Request new prediction
  const requestPredictionMutation = useMutation({
    mutationFn: requestNewPrediction,
    onSuccess: (data) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['mlPredictions', 'patient', data.patientId] });
      queryClient.invalidateQueries({ queryKey: ['mlPredictions', 'latest'] });
      
      // Optionally update cache directly for immediate UI update
      queryClient.setQueryData<MLPrediction[]>(
        ['mlPredictions', 'patient', data.patientId],
        (old) => (old ? [data, ...old] : [data])
      );
    },
  });

  // Helper function to request prediction
  const requestPrediction = useCallback(
    async (request: PredictionRequest) => {
      return requestPredictionMutation.mutateAsync(request);
    },
    [requestPredictionMutation]
  );

  // Helper function to get prediction by ID
  const getPredictionById = useCallback(
    (predictionId: string): MLPrediction | undefined => {
      return patientPredictions?.find((p) => p.id === predictionId);
    },
    [patientPredictions]
  );

  // Helper function to filter predictions by model
  const getPredictionsByModel = useCallback(
    (modelId: string): MLPrediction[] => {
      return patientPredictions?.filter((p) => p.modelId === modelId) || [];
    },
    [patientPredictions]
  );

  // Helper function to get active models
  const getActiveModels = useCallback((): MLModel[] => {
    return availableModels?.filter((m) => m.isActive) || [];
  }, [availableModels]);

  // Helper function to analyze trends with custom date range
  const analyzeTrendsCustom = useCallback(
    async (days: number = 30) => {
      if (!patientId || !selectedModel) {
        throw new Error('Patient ID and Model ID are required for trend analysis');
      }
      return analyzeTrends(patientId, selectedModel, days);
    },
    [patientId, selectedModel]
  );

  return {
    // Data
    patientPredictions,
    availableModels,
    latestPredictions,
    trendsData,
    selectedModel,
    
    // Loading states
    isLoadingPredictions,
    isLoadingModels,
    isLoadingLatest,
    isLoadingTrends,
    isLoading: isLoadingPredictions || isLoadingModels,
    
    // Error states
    predictionsError,
    modelsError,
    latestError,
    trendsError,
    error: predictionsError || modelsError || latestError || trendsError,
    
    // Mutation states
    isRequestingPrediction: requestPredictionMutation.isPending,
    requestPredictionError: requestPredictionMutation.error,
    
    // Actions
    requestPrediction,
    refetchPredictions,
    refetchTrends,
    setSelectedModel,
    analyzeTrendsCustom,
    
    // Helper functions
    getPredictionById,
    getPredictionsByModel,
    getActiveModels,
  };
};

export default useMLPredictions;
