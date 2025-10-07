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
  predicted_value: number;
  prediction_confidence?: number;
  prediction_details?: Record<string, any>;
  created_at: string;
}

export interface PBATFormData {
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
}

export const useMLPredictions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for PBAT responses
  const [pbatResponses, setPbatResponses] = useState<PBATResponse[]>([]);
  const [loadingPBAT, setLoadingPBAT] = useState(false);
  
  // State for ML predictions
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  
  // State for ML models
  const [activeModels, setActiveModels] = useState<MLModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch PBAT responses from Supabase
  const refreshPBATResponses = useCallback(async () => {
    if (!user?.id) return;
    
    setLoadingPBAT(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('pbat_responses')
        .select('*')
        .eq('user_id', user.id)
        .order('response_date', { ascending: false });
      
      if (fetchError) throw fetchError;
      setPbatResponses((data || []) as PBATResponse[]);
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

  // Fetch ML predictions from Supabase
  const refreshPredictions = useCallback(async () => {
    if (!user?.id) return;
    
    setLoadingPredictions(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('ml_predictions')
        .select('*')
        .eq('user_id', user.id)
        .order('prediction_date', { ascending: false });
      
      if (fetchError) throw fetchError;
      setPredictions((data || []) as MLPrediction[]);
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
      const { data, error: fetchError } = await supabase
        .from('ml_models')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setActiveModels((data || []) as MLModel[]);
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

  // Get today's PBAT response
  const todaysPBATResponse = pbatResponses.find(
    response => response.response_date === new Date().toISOString().split('T')[0]
  );

  // Get latest predictions (last 7 days)
  const latestPredictions = predictions.slice(0, 7);

  // Calculate average PBAT score
  const calculatePBATScore = useCallback((response: PBATResponse): number => {
    const fields = [
      response.difficulty_concentrating,
      response.difficulty_remembering,
      response.difficulty_thinking_clearly,
      response.difficulty_finding_words,
      response.mental_fatigue,
      response.physical_fatigue,
      response.sleep_quality,
      response.mood_state,
      response.anxiety_level,
      response.stress_level
    ];
    
    const validFields = fields.filter(f => f !== undefined && f !== null) as number[];
    if (validFields.length === 0) return 0;
    
    const sum = validFields.reduce((acc, val) => acc + val, 0);
    return sum / validFields.length;
  }, []);

  // Get PBAT trend (comparing last two responses)
  const getPBATTrend = useCallback((): 'improving' | 'declining' | 'stable' | null => {
    if (pbatResponses.length < 2) return null;
    
    const latest = calculatePBATScore(pbatResponses[0]);
    const previous = calculatePBATScore(pbatResponses[1]);
    
    const difference = latest - previous;
    
    if (Math.abs(difference) < 0.5) return 'stable';
    return difference < 0 ? 'improving' : 'declining';
  }, [pbatResponses, calculatePBATScore]);

  // Submit a new PBAT response
  const submitPBATResponse = useCallback(async (formData: PBATFormData): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a response',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const { error: insertError } = await supabase
        .from('pbat_responses')
        .insert([{
          user_id: user.id,
          response_date: new Date().toISOString().split('T')[0],
          ...formData
        }]);
      
      if (insertError) throw insertError;
      
      toast({
        title: 'Success',
        description: 'PBAT response submitted successfully'
      });
      
      await refreshPBATResponses();
      await refreshPredictions();
      
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
  }, [user?.id, toast, refreshPBATResponses, refreshPredictions]);

  // Update an existing PBAT response
  const updatePBATResponse = useCallback(async (
    responseId: string, 
    formData: Partial<PBATFormData>
  ): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update a response',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const { error: updateError } = await supabase
        .from('pbat_responses')
        .update(formData)
        .eq('id', responseId)
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
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
  }, [user?.id, toast, refreshPBATResponses]);

  // Delete a PBAT response
  const deletePBATResponse = useCallback(async (responseId: string): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to delete a response',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const { error: deleteError } = await supabase
        .from('pbat_responses')
        .delete()
        .eq('id', responseId)
        .eq('user_id', user.id);
      
      if (deleteError) throw deleteError;
      
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
  }, [user?.id, toast, refreshPBATResponses]);

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
