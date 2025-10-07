import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface PBATResponse {
  id?: string;
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

const PBAT_QUERY_KEY = 'pbat-responses';

/**
 * Custom hook to manage PBAT (Patient-Based Assessment Tool) responses
 * Provides functionality for fetching, creating, updating responses and calculating statistics
 */
export const usePBATResponses = (patientId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = patientId || user?.id;

  // Fetch all PBAT responses for a user
  const {
    data: responses = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [PBAT_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('patient_assessments')
        .select('*')
        .eq('therapist_id', userId)
        .order('assessment_date', { ascending: false });

      if (error) {
        console.error('Error fetching PBAT responses:', error);
        throw error;
      }

      // Transform patient_assessments to PBATResponse format
      return ((data || []) as any[]).map(item => ({
        id: item.id,
        user_id: item.therapist_id,
        response_date: item.assessment_date,
        difficulty_concentrating: item.q1,
        difficulty_remembering: item.q2,
        difficulty_thinking_clearly: item.q3,
        difficulty_finding_words: item.q4,
        mental_fatigue: item.q5,
        physical_fatigue: item.q6,
        sleep_quality: item.q7,
        mood_state: item.q8,
        anxiety_level: item.q9,
        stress_level: item.q10,
        created_at: item.created_at,
        updated_at: item.updated_at,
      } as PBATResponse));
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Create or update PBAT response
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<PBATResponse>) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Transform PBATResponse format to patient_assessments format
      const assessmentData = {
        therapist_id: userId,
        assessment_date: data.response_date || new Date().toISOString().split('T')[0],
        q1: data.difficulty_concentrating,
        q2: data.difficulty_remembering,
        q3: data.difficulty_thinking_clearly,
        q4: data.difficulty_finding_words,
        q5: data.mental_fatigue,
        q6: data.physical_fatigue,
        q7: data.sleep_quality,
        q8: data.mood_state,
        q9: data.anxiety_level,
        q10: data.stress_level,
      };

      if (data.id) {
        // Update existing response
        const { data: updated, error } = await supabase
          .from('patient_assessments')
          .update(assessmentData)
          .eq('id', data.id)
          .eq('therapist_id', userId)
          .select()
          .single();

        if (error) {
          console.error('Error updating PBAT response:', error);
          throw error;
        }

        return {
          id: updated.id,
          user_id: updated.therapist_id,
          response_date: updated.assessment_date,
          difficulty_concentrating: updated.q1,
          difficulty_remembering: updated.q2,
          difficulty_thinking_clearly: updated.q3,
          difficulty_finding_words: updated.q4,
          mental_fatigue: updated.q5,
          physical_fatigue: updated.q6,
          sleep_quality: updated.q7,
          mood_state: updated.q8,
          anxiety_level: updated.q9,
          stress_level: updated.q10,
          created_at: updated.created_at,
          updated_at: updated.updated_at,
        } as PBATResponse;
      } else {
        // Create new response
        const { data: created, error } = await supabase
          .from('patient_assessments')
          .insert({
            ...assessmentData,
            patient_id: userId, // Using therapist as patient for now
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating PBAT response:', error);
          throw error;
        }

        return {
          id: created.id,
          user_id: created.therapist_id,
          response_date: created.assessment_date,
          difficulty_concentrating: created.q1,
          difficulty_remembering: created.q2,
          difficulty_thinking_clearly: created.q3,
          difficulty_finding_words: created.q4,
          mental_fatigue: created.q5,
          physical_fatigue: created.q6,
          sleep_quality: created.q7,
          mood_state: created.q8,
          anxiety_level: created.q9,
          stress_level: created.q10,
          created_at: created.created_at,
          updated_at: created.updated_at,
        } as PBATResponse;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [PBAT_QUERY_KEY, userId] });
      
      if (variables.id) {
        toast.success('Resposta PBAT atualizada com sucesso');
      } else {
        toast.success('Resposta PBAT salva com sucesso');
      }
    },
    onError: (error: Error) => {
      console.error('Error saving PBAT response:', error);
      toast.error('Erro ao salvar resposta PBAT');
    },
  });

  // Delete PBAT response
  const deleteMutation = useMutation({
    mutationFn: async (responseId: string) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { error } = await supabase
        .from('patient_assessments')
        .delete()
        .eq('id', responseId)
        .eq('therapist_id', userId);

      if (error) {
        console.error('Error deleting PBAT response:', error);
        throw error;
      }

      return responseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PBAT_QUERY_KEY, userId] });
      toast.success('Resposta PBAT deletada com sucesso');
    },
    onError: (error: Error) => {
      console.error('Error deleting PBAT response:', error);
      toast.error('Erro ao deletar resposta PBAT');
    },
  });

  /**
   * Calculate PBAT score for a single response
   * Score range: 0-50 (10 questions × 5 points each)
   */
  const calculateScore = (response: PBATResponse): number => {
    return (
      (response.difficulty_concentrating || 0) +
      (response.difficulty_remembering || 0) +
      (response.difficulty_thinking_clearly || 0) +
      (response.difficulty_finding_words || 0) +
      (response.mental_fatigue || 0) +
      (response.physical_fatigue || 0) +
      (response.sleep_quality || 0) +
      (response.mood_state || 0) +
      (response.anxiety_level || 0) +
      (response.stress_level || 0)
    );
  };

  /**
   * Calculate statistical metrics from all responses
   */
  const calculateStatistics = (): PBATStatistics | null => {
    if (responses.length === 0) {
      return null;
    }

    const scores = responses.map(calculateScore);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / scores.length;
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    // Calculate trend (comparing first half to second half)
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (responses.length >= 4) {
      const halfPoint = Math.floor(responses.length / 2);
      const recentScores = scores.slice(0, halfPoint);
      const olderScores = scores.slice(halfPoint);
      
      const recentAvg = recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length;
      const olderAvg = olderScores.reduce((sum, s) => sum + s, 0) / olderScores.length;
      
      const difference = recentAvg - olderAvg;
      
      // Lower scores are better (less symptoms)
      if (difference < -2) {
        trend = 'improving';
      } else if (difference > 2) {
        trend = 'declining';
      }
    }

    // Calculate category averages
    const cognitiveQuestions = responses.map(r => 
      ((r.difficulty_concentrating || 0) + 
       (r.difficulty_remembering || 0) + 
       (r.difficulty_thinking_clearly || 0) + 
       (r.difficulty_finding_words || 0)) / 4
    );
    
    const fatigueQuestions = responses.map(r => 
      ((r.mental_fatigue || 0) + (r.physical_fatigue || 0)) / 2
    );
    
    const sleepQuestions = responses.map(r => r.sleep_quality || 0);
    
    const emotionalQuestions = responses.map(r => 
      ((r.mood_state || 0) + (r.anxiety_level || 0) + (r.stress_level || 0)) / 3
    );

    return {
      total_responses: responses.length,
      average_score: parseFloat(averageScore.toFixed(2)),
      min_score: minScore,
      max_score: maxScore,
      trend,
      scores_by_category: {
        cognitive: parseFloat(
          (cognitiveQuestions.reduce((sum, s) => sum + s, 0) / cognitiveQuestions.length).toFixed(2)
        ),
        fatigue: parseFloat(
          (fatigueQuestions.reduce((sum, s) => sum + s, 0) / fatigueQuestions.length).toFixed(2)
        ),
        sleep: parseFloat(
          (sleepQuestions.reduce((sum, s) => sum + s, 0) / sleepQuestions.length).toFixed(2)
        ),
        emotional: parseFloat(
          (emotionalQuestions.reduce((sum, s) => sum + s, 0) / emotionalQuestions.length).toFixed(2)
        ),
      },
    };
  };

  /**
   * Check if there is already a response for today
   */
  const hasResponseForToday = (): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return responses.some(response => response.response_date === today);
  };

  /**
   * Get response for a specific date
   */
  const getResponseByDate = (date: string): PBATResponse | null => {
    return responses.find(response => response.response_date === date) || null;
  };

  /**
   * Get today's response if it exists
   */
  const getTodayResponse = (): PBATResponse | null => {
    const today = new Date().toISOString().split('T')[0];
    return getResponseByDate(today);
  };

  /**
   * Get the most recent response
   */
  const getLatestResponse = (): PBATResponse | null => {
    return responses.length > 0 ? responses[0] : null;
  };

  /**
   * Get responses within a date range
   */
  const getResponsesByDateRange = (startDate: string, endDate: string): PBATResponse[] => {
    return responses.filter(response => {
      const responseDate = new Date(response.response_date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return responseDate >= start && responseDate <= end;
    });
  };

  return {
    // Data
    responses,
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
    calculateScore,
    calculateStatistics,
    hasResponseForToday,
    getResponseByDate,
    getTodayResponse,
    getLatestResponse,
    getResponsesByDateRange,
  };
};
