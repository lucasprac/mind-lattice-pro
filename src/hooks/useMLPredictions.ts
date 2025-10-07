import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

// Types based on the Supabase schema
export interface PBATResponse {
  id: string;
  user_id: string;
  response_date: string;
  difficulty_concentrating?: number;
  difficulty_remembering?: number;
  difficulty_thinking_clearly?: number;
  difficulty_finding_words?: number;
  mental_fatigue?: number;
  physical_fatigue?: number;
  sleep_quality?: number;
  mood_state?: number;
  anxiety_level?: number;
  stress_level?: number;
  created_at: string;
  updated_at: string;
}

export interface MLModel {
  id: string;
  model_name: string;
  model_version: string;
  model_type: string;
  target_variable: string;
  accuracy?: number;
  precision_score?: number;
  recall_score?: number;
  f1_score?: number;
  auc_roc?: number;
  hyperparameters?: Record<string, any>;
  features_used?: string[];
  is_active: boolean;
  training_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface MLPrediction {
  id: string;
  user_id: string;
  model_id: string;
  prediction_date: string;
  prediction_value: number;
  prediction_label?: string;
  confidence_score?: number;
  input_features: Record<string, any>;
  risk_factors?: string[];
  recommendations?: string[];
  created_at: string;
  updated_at: string;
  model?: MLModel;
}

export interface LatestUserPrediction {
  id: string;
  user_id: string;
  model_id: string;
  model_name: string;
  target_variable: string;
  prediction_date: string;
  prediction_value: number;
  prediction_label?: string;
  confidence_score?: number;
  risk_factors?: string[];
  recommendations?: string[];
}

export interface PBATFormData {
  difficulty_concentrating: number;
  difficulty_remembering: number;
  difficulty_thinking_clearly: number;
  difficulty_finding_words: number;
  mental_fatigue: number;
  physical_fatigue: number;
  sleep_quality: number;
  mood_state: number;
  anxiety_level: number;
  stress_level: number;
}

interface UseMLPredictionsReturn {
  // PBAT responses
  pbatResponses: PBATResponse[];
  todaysPBATResponse: PBATResponse | null;
  loadingPBAT: boolean;
  
  // ML predictions
  predictions: MLPrediction[];
  latestPredictions: LatestUserPrediction[];
  loadingPredictions: boolean;
  
  // ML models
  activeModels: MLModel[];
  loadingModels: boolean;
  
  // Actions
  submitPBATResponse: (formData: PBATFormData) => Promise<boolean>;
  updatePBATResponse: (id: string, formData: Partial<PBATFormData>) => Promise<boolean>;
  deletePBATResponse: (id: string) => Promise<boolean>;
  refreshPredictions: () => Promise<void>;
  refreshPBATResponses: () => Promise<void>;
  refreshModels: () => Promise<void>;
  
  // Calculations
  calculatePBATScore: (response: PBATResponse) => number;
  getPBATTrend: (days?: number) => Array<{ date: string; score: number }>;
  
  // Error state
  error: string | null;
}

export const useMLPredictions = (): UseMLPredictionsReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [pbatResponses, setPbatResponses] = useState<PBATResponse[]>([]);
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [latestPredictions, setLatestPredictions] = useState<LatestUserPrediction[]>([]);
  const [activeModels, setActiveModels] = useState<MLModel[]>([]);
  
  const [loadingPBAT, setLoadingPBAT] = useState(false);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Computed values
  const todaysPBATResponse = pbatResponses.find(
    response => response.response_date === new Date().toISOString().split('T')[0]
  ) || null;
  
  // Helper function to calculate PBAT score
  const calculatePBATScore = useCallback((response: PBATResponse): number => {
    const fields = [
      'difficulty_concentrating',
      'difficulty_remembering', 
      'difficulty_thinking_clearly',
      'difficulty_finding_words',
      'mental_fatigue',
      'physical_fatigue',
      'sleep_quality',
      'mood_state',
      'anxiety_level',
      'stress_level'
    ] as const;
    
    return fields.reduce((sum, field) => {
      return sum + (response[field] || 0);
    }, 0);
  }, []);
  
  // Get PBAT trend over time
  const getPBATTrend = useCallback((days: number = 30) => {
    const now = new Date();
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    return pbatResponses
      .filter(response => new Date(response.response_date) >= startDate)
      .map(response => ({
        date: response.response_date,
        score: calculatePBATScore(response)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [pbatResponses, calculatePBATScore]);
  
  // Fetch PBAT responses
  const refreshPBATResponses = useCallback(async () => {
    if (!user?.id) return;
    
    setLoadingPBAT(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('pbat_responses')
        .select('*')
        .eq('user_id', user.id)
        .order('response_date', { ascending: false });
      
      if (error) throw error;
      
      setPbatResponses(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch PBAT responses';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoadingPBAT(false);
    }
  }, [user?.id, toast]);
  
  // Fetch ML predictions
  const refreshPredictions = useCallback(async () => {
    if (!user?.id) return;
    
    setLoadingPredictions(true);
    setError(null);
    
    try {
      // Fetch all predictions with model data
      const { data: predictionsData, error: predictionsError } = await supabase
        .from('ml_predictions')
        .select(`
          *,
          model:ml_models(*)
        `)
        .eq('user_id', user.id)
        .order('prediction_date', { ascending: false });
      
      if (predictionsError) throw predictionsError;
      
      setPredictions(predictionsData || []);
      
      // Fetch latest predictions view
      const { data: latestData, error: latestError } = await supabase
        .from('latest_user_predictions')
        .select('*')
        .eq('user_id', user.id);
      
      if (latestError) throw latestError;
      
      setLatestPredictions(latestData || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch predictions';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoadingPredictions(false);
    }
  }, [user?.id, toast]);
  
  // Fetch active ML models
  const refreshModels = useCallback(async () => {
    setLoadingModels(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('ml_models')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setActiveModels(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch models';
      setError(message);
      toast({
        title: 'Error', 
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoadingModels(false);
    }
  }, [toast]);
  
  // Submit PBAT response
  const submitPBATResponse = useCallback(async (formData: PBATFormData): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a PBAT response',
        variant: 'destructive'
      });
      return false;
    }
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('pbat_responses')
        .insert({
          user_id: user.id,
          response_date: today,
          ...formData
        });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'PBAT response submitted successfully'
      });
      
      await refreshPBATResponses();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit PBAT response';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
      return false;
    }
  }, [user?.id, toast, refreshPBATResponses]);
  
  // Update PBAT response
  const updatePBATResponse = useCallback(async (id: string, formData: Partial<PBATFormData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pbat_responses')
        .update(formData)
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'PBAT response updated successfully'
      });
      
      await refreshPBATResponses();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update PBAT response';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
      return false;
    }
  }, [toast, refreshPBATResponses]);
  
  // Delete PBAT response
  const deletePBATResponse = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pbat_responses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'PBAT response deleted successfully'
      });
      
      await refreshPBATResponses();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete PBAT response';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
      return false;
    }
  }, [toast, refreshPBATResponses]);
  
  // Initialize data on mount
  useEffect(() => {
    if (user?.id) {
      refreshPBATResponses();
      refreshPredictions();
      refreshModels();
    }
  }, [user?.id, refreshPBATResponses, refreshPredictions, refreshModels]);
  
  return {
    // PBAT responses
    pbatResponses,
    todaysPBATResponse,
    loadingPBAT,
    
    // ML predictions
    predictions,
    latestPredictions,
    loadingPredictions,
    
    // ML models
    activeModels,
    loadingModels,
    
    // Actions
    submitPBATResponse,
    updatePBATResponse,
    deletePBATResponse,
    refreshPredictions,
    refreshPBATResponses,
    refreshModels,
    
    // Calculations
    calculatePBATScore,
    getPBATTrend,
    
    // Error state
    error
  };
};
