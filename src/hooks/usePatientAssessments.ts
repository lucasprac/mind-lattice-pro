import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface AssessmentData {
  id?: string;
  patient_id: string;
  therapist_id: string;
  assessment_date: string;
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
  q24?: number;
  q25?: number;
  q26?: number;
  q27?: number;
  q28?: number;
  q29?: 'muito_ruim' | 'ruim' | 'boa' | 'muito_boa' | 'excelente';
  q30?: number;
  q31?: number;
  q32?: number;
  q33?: number;
  q34?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const usePatientAssessments = (patientId: string) => {
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAssessments = async () => {
    if (!user?.id || !patientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("patient_assessments")
        .select("*")
        .eq("patient_id", patientId)
        .eq("therapist_id", user.id)
        .order("assessment_date", { ascending: false });

      if (error) {
        console.error("Erro ao buscar avaliações:", error);
        toast.error("Erro ao carregar avaliações");
        return;
      }

      setAssessments((data || []) as AssessmentData[]);
    } catch (err) {
      console.error("Erro inesperado:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveAssessment = async (data: Partial<AssessmentData>) => {
    if (!user?.id || !patientId) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      if (data.id) {
        // Update existing
        const { error } = await supabase
          .from("patient_assessments")
          .update(data)
          .eq("id", data.id);

        if (error) {
          console.error("Erro ao atualizar avaliação:", error);
          toast.error("Erro ao salvar avaliação");
          return false;
        }
      } else {
        // Create new
        const { error } = await supabase
          .from("patient_assessments")
          .insert({
            ...data,
            patient_id: patientId,
            therapist_id: user.id,
          });

        if (error) {
          console.error("Erro ao criar avaliação:", error);
          toast.error("Erro ao salvar avaliação");
          return false;
        }
      }

      toast.success("Avaliação salva com sucesso");
      await fetchAssessments();
      return true;
    } catch (err) {
      console.error("Erro inesperado:", err);
      toast.error("Erro inesperado ao salvar avaliação");
      return false;
    }
  };

  const getLatestAssessment = () => {
    return assessments.length > 0 ? assessments[0] : null;
  };

  useEffect(() => {
    fetchAssessments();
  }, [user?.id, patientId]);

  return {
    assessments,
    loading,
    saveAssessment,
    getLatestAssessment,
    refetch: fetchAssessments,
  };
};
