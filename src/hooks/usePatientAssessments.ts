import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type AssessmentRow = Tables<'patient_assessments'>;

export const usePatientAssessments = (patientId: string, recordId?: string) => {
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAssessments = async () => {
    if (!user?.id || !patientId) { setLoading(false); return; }
    try {
      setLoading(true);
      let query = supabase.from('patient_assessments').select('*').eq('patient_id', patientId).eq('therapist_id', user.id).order('assessment_date', { ascending: false });
      if (recordId) query = query.eq('record_id', recordId);
      const { data } = await query; setAssessments((data as AssessmentRow[] | null) || []);
    } finally { setLoading(false); }
  };

  const saveAssessment = async (data: Partial<AssessmentRow>) => {
    if (!user?.id || !patientId) { toast.error('Usuário não autenticado'); return false; }
    if (data.id) {
      const { error } = await supabase.from('patient_assessments').update(data).eq('id', data.id).eq('therapist_id', user.id);
      if (error) { toast.error('Erro ao salvar avaliação'); return false; }
    } else {
      const { error } = await supabase.from('patient_assessments').insert({ ...data, patient_id: patientId, therapist_id: user.id, record_id: recordId || null });
      if (error) { toast.error('Erro ao salvar avaliação'); return false; }
    }
    toast.success('Avaliação salva com sucesso'); await fetchAssessments(); return true;
  };

  const getLatestAssessment = () => assessments.length > 0 ? assessments[0] : null;

  useEffect(() => { fetchAssessments(); }, [user?.id, patientId, recordId]);

  return { assessments, loading, saveAssessment, getLatestAssessment, refetch: fetchAssessments };
};
