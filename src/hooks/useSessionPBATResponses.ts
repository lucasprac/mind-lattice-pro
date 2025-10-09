import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface SessionPBATResponse {
  id?: string;
  patient_id: string;
  session_id: string;
  therapist_id: string;
  assessment_date: string;
  q1?: number; // difficulty_concentrating
  q2?: number; // difficulty_remembering
  q3?: number; // difficulty_thinking_clearly
  q4?: number; // difficulty_finding_words
  q5?: number; // mental_fatigue
  q6?: number; // physical_fatigue
  q7?: number; // sleep_quality
  q8?: number; // mood_state
  q9?: number; // anxiety_level
  q10?: number; // stress_level
  created_at?: string;
  updated_at?: string;
}

export interface PBATStatistics {
  total_responses: number;
  average_score: number;
  min_score: number;
  max_score: number;
  trend: 'improving' | 'declining' | 'stable';
  scores_by_category: {
    cognitive: number;
    fatigue: number;
    sleep: number;
    emotional: number;
  };
}

const SESSION_PBAT_QUERY_KEY = 'session-pbat-responses';

/**
 * Custom hook to manage PBAT responses specific to a patient session
 * Each session has its own individual PBAT assessment
 */
export const useSessionPBATResponses = (patientId: string, recordId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch PBAT response for this specific session
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [SESSION_PBAT_QUERY_KEY, patientId, recordId],
    queryFn: async () => {
      if (!patientId || !recordId || !user?.id) {
        throw new Error('Patient ID, Record ID and User ID are required');
      }

      const { data, error } = await supabase
        .from('patient_assessments')
        .select('*')
        .eq('patient_id', patientId)
        .eq('session_id', recordId)
        .eq('therapist_id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid error when no record exists

      if (error) {
        console.error('Error fetching session PBAT response:', error);
        throw error;
      }

      return data as SessionPBATResponse | null;
    },
    enabled: !!patientId && !!recordId && !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Create or update PBAT response for this session
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<SessionPBATResponse>) => {
      if (!patientId || !recordId || !user?.id) {
        throw new Error('Patient ID, Record ID and User ID are required');
      }

      const assessmentData = {
        patient_id: patientId,
        session_id: recordId,
        therapist_id: user.id,
        assessment_date: data.assessment_date || new Date().toISOString().split('T')[0],
        q1: data.q1,
        q2: data.q2,
        q3: data.q3,
        q4: data.q4,
        q5: data.q5,
        q6: data.q6,
        q7: data.q7,
        q8: data.q8,
        q9: data.q9,
        q10: data.q10,
      };

      if (response?.id) {
        // Update existing response
        const { data: updated, error } = await supabase
          .from('patient_assessments')
          .update(assessmentData)
          .eq('id', response.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating session PBAT response:', error);
          throw error;
        }

        return updated as SessionPBATResponse;
      } else {
        // Create new response
        const { data: created, error } = await supabase
          .from('patient_assessments')
          .insert(assessmentData)
          .select()
          .single();

        if (error) {
          console.error('Error creating session PBAT response:', error);
          throw error;
        }

        return created as SessionPBATResponse;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SESSION_PBAT_QUERY_KEY, patientId, recordId] });
      toast.success('Avaliação PBAT salva com sucesso');
    },
    onError: (error: Error) => {
      console.error('Error saving session PBAT response:', error);
      toast.error('Erro ao salvar avaliação PBAT');
    },
  });

  // Delete PBAT response for this session
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!response?.id) {
        throw new Error('No response to delete');
      }

      const { error } = await supabase
        .from('patient_assessments')
        .delete()
        .eq('id', response.id);

      if (error) {
        console.error('Error deleting session PBAT response:', error);
        throw error;
      }

      return response.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SESSION_PBAT_QUERY_KEY, patientId, recordId] });
      toast.success('Avaliação PBAT removida com sucesso');
    },
    onError: (error: Error) => {
      console.error('Error deleting session PBAT response:', error);
      toast.error('Erro ao remover avaliação PBAT');
    },
  });

  /**
   * Calculate PBAT score for the response
   * Score range: 0-50 (10 questions × 5 points each)
   */
  const calculateScore = (pbatResponse?: SessionPBATResponse | null): number => {
    if (!pbatResponse) return 0;
    
    return (
      (pbatResponse.q1 || 0) +
      (pbatResponse.q2 || 0) +
      (pbatResponse.q3 || 0) +
      (pbatResponse.q4 || 0) +
      (pbatResponse.q5 || 0) +
      (pbatResponse.q6 || 0) +
      (pbatResponse.q7 || 0) +
      (pbatResponse.q8 || 0) +
      (pbatResponse.q9 || 0) +
      (pbatResponse.q10 || 0)
    );
  };

  /**
   * Get category scores for the response
   */
  const getCategoryScores = (pbatResponse?: SessionPBATResponse | null) => {
    if (!pbatResponse) {
      return {
        cognitive: 0,
        fatigue: 0,
        sleep: 0,
        emotional: 0,
      };
    }

    return {
      cognitive: ((pbatResponse.q1 || 0) + (pbatResponse.q2 || 0) + (pbatResponse.q3 || 0) + (pbatResponse.q4 || 0)) / 4,
      fatigue: ((pbatResponse.q5 || 0) + (pbatResponse.q6 || 0)) / 2,
      sleep: pbatResponse.q7 || 0,
      emotional: ((pbatResponse.q8 || 0) + (pbatResponse.q9 || 0) + (pbatResponse.q10 || 0)) / 3,
    };
  };

  /**
   * Check if there is a response for this session
   */
  const hasResponse = (): boolean => {
    return !!response;
  };

  return {
    // Data
    response,
    isLoading,
    error,

    // Mutations
    saveResponse: saveMutation.mutate,
    saveResponseAsync: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,

    deleteResponse: deleteMutation.mutate,
    deleteResponseAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    // Utilities
    refetch,
    calculateScore: () => calculateScore(response),
    getCategoryScores: () => getCategoryScores(response),
    hasResponse,
    
    // Current session score
    currentScore: calculateScore(response),
  };
};
