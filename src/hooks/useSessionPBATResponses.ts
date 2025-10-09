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
  // PBAT Questions (1-23)
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  q5?: number;
  q6?: number;
  q7?: number;
  q8?: number;
  q9?: number;
  q10?: number;
  q11?: number;
  q12?: number;
  q13?: number;
  q14?: number;
  q15?: number;
  q16?: number;
  q17?: number;
  q18?: number;
  q19?: number;
  q20?: number;
  q21?: number;
  q22?: number;
  q23?: number;
  // Outcome Questions (24-28)
  q24?: number;
  q25?: number;
  q26?: number;
  q27?: number;
  q28?: number;
  // Health Status (29) - stored as string
  q29?: string;
  // Vitality Questions (30-34)
  q30?: number;
  q31?: number;
  q32?: number;
  q33?: number;
  q34?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PBATStatistics {
  pbat_score: number;
  outcome_score: number;
  vitality_score: number;
  health_status: string;
  scores_by_category: {
    pbat: number;
    outcome: number;
    vitality: number;
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
        // PBAT Questions (1-23)
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
        q11: data.q11,
        q12: data.q12,
        q13: data.q13,
        q14: data.q14,
        q15: data.q15,
        q16: data.q16,
        q17: data.q17,
        q18: data.q18,
        q19: data.q19,
        q20: data.q20,
        q21: data.q21,
        q22: data.q22,
        q23: data.q23,
        // Outcome Questions (24-28)
        q24: data.q24,
        q25: data.q25,
        q26: data.q26,
        q27: data.q27,
        q28: data.q28,
        // Health Status (29)
        q29: data.q29,
        // Vitality Questions (30-34)
        q30: data.q30,
        q31: data.q31,
        q32: data.q32,
        q33: data.q33,
        q34: data.q34,
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
   * Calculate PBAT score (questions 1-23)
   * Score range: 0-100 (average of all PBAT questions)
   */
  const calculatePBATScore = (pbatResponse?: SessionPBATResponse | null): number => {
    if (!pbatResponse) return 0;
    
    let total = 0;
    let count = 0;
    for (let i = 1; i <= 23; i++) {
      const value = pbatResponse[`q${i}` as keyof SessionPBATResponse];
      if (typeof value === 'number') {
        total += value;
        count++;
      }
    }
    
    return count > 0 ? total / count : 0;
  };

  /**
   * Calculate Outcome score (questions 24-28)
   * Score range: 0-100 (average of all outcome questions)
   */
  const calculateOutcomeScore = (pbatResponse?: SessionPBATResponse | null): number => {
    if (!pbatResponse) return 0;
    
    let total = 0;
    let count = 0;
    for (let i = 24; i <= 28; i++) {
      const value = pbatResponse[`q${i}` as keyof SessionPBATResponse];
      if (typeof value === 'number') {
        total += value;
        count++;
      }
    }
    
    return count > 0 ? total / count : 0;
  };

  /**
   * Calculate Vitality score (questions 30-34)
   * Score range: 0-100 (average, with Q34 reverse scored)
   */
  const calculateVitalityScore = (pbatResponse?: SessionPBATResponse | null): number => {
    if (!pbatResponse) return 0;
    
    let total = 0;
    let count = 0;
    
    // Questions 30-33 are positive
    for (let i = 30; i <= 33; i++) {
      const value = pbatResponse[`q${i}` as keyof SessionPBATResponse];
      if (typeof value === 'number') {
        total += value;
        count++;
      }
    }
    
    // Question 34 is reverse scored
    if (typeof pbatResponse.q34 === 'number') {
      total += (100 - pbatResponse.q34);
      count++;
    }
    
    return count > 0 ? total / count : 0;
  };

  /**
   * Get comprehensive statistics for the response
   */
  const getStatistics = (pbatResponse?: SessionPBATResponse | null): PBATStatistics => {
    if (!pbatResponse) {
      return {
        pbat_score: 0,
        outcome_score: 0,
        vitality_score: 0,
        health_status: '',
        scores_by_category: {
          pbat: 0,
          outcome: 0,
          vitality: 0,
        },
      };
    }

    return {
      pbat_score: calculatePBATScore(pbatResponse),
      outcome_score: calculateOutcomeScore(pbatResponse),
      vitality_score: calculateVitalityScore(pbatResponse),
      health_status: (pbatResponse.q29 as string) || '',
      scores_by_category: {
        pbat: calculatePBATScore(pbatResponse),
        outcome: calculateOutcomeScore(pbatResponse),
        vitality: calculateVitalityScore(pbatResponse),
      },
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
    calculatePBATScore: () => calculatePBATScore(response),
    calculateOutcomeScore: () => calculateOutcomeScore(response),
    calculateVitalityScore: () => calculateVitalityScore(response),
    getStatistics: () => getStatistics(response),
    hasResponse,
    
    // Current session scores
    currentScore: calculatePBATScore(response),
    outcomeScore: calculateOutcomeScore(response),
    vitalityScore: calculateVitalityScore(response),
  };
};
