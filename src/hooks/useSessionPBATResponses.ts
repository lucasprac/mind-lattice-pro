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
        console.log('Missing required IDs:', { patientId, recordId, userId: user?.id });
        return null;
      }

      console.log('Fetching PBAT for:', { patientId, recordId, therapistId: user.id });

      const { data, error } = await supabase
        .from('patient_assessments')
        .select('*')
        .eq('patient_id', patientId)
        .eq('session_id', recordId)
        .eq('therapist_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching session PBAT response:', error);
        throw error;
      }

      console.log('Fetched PBAT response:', data);
      return data as SessionPBATResponse | null;
    },
    enabled: !!patientId && !!recordId && !!user?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Create or update PBAT response for this session
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<SessionPBATResponse>) => {
      if (!patientId || !recordId || !user?.id) {
        throw new Error('Patient ID, Record ID and User ID are required');
      }

      console.log('Saving PBAT data:', data);
      console.log('IDs:', { patientId, recordId, therapistId: user.id });

      const assessmentData = {
        patient_id: patientId,
        session_id: recordId,
        therapist_id: user.id,
        assessment_date: data.assessment_date || new Date().toISOString(),
        q1: data.q1 || 0,
        q2: data.q2 || 0,
        q3: data.q3 || 0,
        q4: data.q4 || 0,
        q5: data.q5 || 0,
        q6: data.q6 || 0,
        q7: data.q7 || 0,
        q8: data.q8 || 0,
        q9: data.q9 || 0,
        q10: data.q10 || 0,
        q11: data.q11 || 0,
        q12: data.q12 || 0,
        q13: data.q13 || 0,
        q14: data.q14 || 0,
        q15: data.q15 || 0,
        q16: data.q16 || 0,
        q17: data.q17 || 0,
        q18: data.q18 || 0,
        q19: data.q19 || 0,
        q20: data.q20 || 0,
        q21: data.q21 || 0,
        q22: data.q22 || 0,
        q23: data.q23 || 0,
        q24: data.q24 || 0,
        q25: data.q25 || 0,
        q26: data.q26 || 0,
        q27: data.q27 || 0,
        q28: data.q28 || 0,
        q29: data.q29 || 'boa',
        q30: data.q30 || 0,
        q31: data.q31 || 0,
        q32: data.q32 || 0,
        q33: data.q33 || 0,
        q34: data.q34 || 0,
      };

      console.log('Assessment data to save:', assessmentData);

      if (response?.id) {
        // Update existing response
        console.log('Updating existing response with ID:', response.id);
        
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

        console.log('Updated response:', updated);
        return updated as SessionPBATResponse;
      } else {
        // Create new response
        console.log('Creating new response');
        
        const { data: created, error } = await supabase
          .from('patient_assessments')
          .insert(assessmentData)
          .select()
          .single();

        if (error) {
          console.error('Error creating session PBAT response:', error);
          throw error;
        }

        console.log('Created response:', created);
        return created as SessionPBATResponse;
      }
    },
    onSuccess: (savedData) => {
      console.log('PBAT save successful:', savedData);
      queryClient.invalidateQueries({ queryKey: [SESSION_PBAT_QUERY_KEY, patientId, recordId] });
      toast.success('Avaliação PBAT salva com sucesso');
    },
    onError: (error: Error) => {
      console.error('Error saving session PBAT response:', error);
      toast.error(`Erro ao salvar avaliação PBAT: ${error.message}`);
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
   */
  const calculateVitalityScore = (pbatResponse?: SessionPBATResponse | null): number => {
    if (!pbatResponse) return 0;
    
    let total = 0;
    let count = 0;
    
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

    // Utilities
    refetch,
    calculatePBATScore: () => calculatePBATScore(response),
    calculateOutcomeScore: () => calculateOutcomeScore(response),
    calculateVitalityScore: () => calculateVitalityScore(response),
    hasResponse,
    
    // Current session scores
    currentScore: calculatePBATScore(response),
    outcomeScore: calculateOutcomeScore(response),
    vitalityScore: calculateVitalityScore(response),
  };
};
