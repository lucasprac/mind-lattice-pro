import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type FunctionalAnalysisRow = Tables<'functional_analysis'>;

export interface FunctionalAnalysisData {
  id?: string;
  processName: string;
  dimension: string;
  selectionAnalysis: string;
  variationAnalysis: string;
  retentionAnalysis: string;
  biofisiologicoSelection: string;
  biofisiologicoVariation: string;
  biofisiologicoRetention: string;
  socioculturalSelection: string;
  socioculturalVariation: string;
  socioculturalRetention: string;
}

export const usePatientFunctionalAnalysis = (patientId: string, recordId?: string) => {
  const [analyses, setAnalyses] = useState<FunctionalAnalysisData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAnalyses = async () => {
    if (!user?.id || !patientId) { setLoading(false); return; }
    try {
      setLoading(true);
      let query = supabase.from('functional_analysis').select('*').eq('patient_id', patientId).eq('therapist_id', user.id).order('created_at', { ascending: false });
      if (recordId) query = query.eq('record_id', recordId);
      const { data, error } = await query;
      if (error) { toast.error('Erro ao carregar análises'); return; }
      const mapped = (data as FunctionalAnalysisRow[] | null)?.map(item => ({
        id: item.id,
        processName: item.process_name,
        dimension: item.dimension,
        selectionAnalysis: item.selection_analysis || '',
        variationAnalysis: item.variation_analysis || '',
        retentionAnalysis: item.retention_analysis || '',
        biofisiologicoSelection: item.biofisiologico_selection || '',
        biofisiologicoVariation: item.biofisiologico_variation || '',
        biofisiologicoRetention: item.biofisiologico_retention || '',
        socioculturalSelection: item.sociocultural_selection || '',
        socioculturalVariation: item.sociocultural_variation || '',
        socioculturalRetention: item.sociocultural_retention || '',
      })) || [];
      setAnalyses(mapped);
    } finally { setLoading(false); }
  };

  const saveAnalysis = async (analysis: FunctionalAnalysisData) => {
    if (!user?.id || !patientId) { toast.error('Usuário não autenticado'); return false; }
    const dbData: Partial<FunctionalAnalysisRow> = {
      patient_id: patientId,
      therapist_id: user.id,
      record_id: recordId || null,
      process_name: analysis.processName,
      dimension: analysis.dimension,
      selection_analysis: analysis.selectionAnalysis || null,
      variation_analysis: analysis.variationAnalysis || null,
      retention_analysis: analysis.retentionAnalysis || null,
      biofisiologico_selection: analysis.biofisiologicoSelection || null,
      biofisiologico_variation: analysis.biofisiologicoVariation || null,
      biofisiologico_retention: analysis.biofisiologicoRetention || null,
      sociocultural_selection: analysis.socioculturalSelection || null,
      sociocultural_variation: analysis.socioculturalVariation || null,
      sociocultural_retention: analysis.socioculturalRetention || null,
    };
    if (analysis.id) {
      const { error } = await supabase.from('functional_analysis').update(dbData).eq('id', analysis.id).eq('therapist_id', user.id);
      if (error) { toast.error('Erro ao salvar análise'); return false; }
    } else {
      const { data, error } = await supabase.from('functional_analysis').insert(dbData).select('id').single();
      if (error) { toast.error('Erro ao salvar análise'); return false; }
      setAnalyses(prev => [{ ...analysis, id: (data as any).id }, ...prev]);
    }
    toast.success('Análise salva com sucesso'); await fetchAnalyses(); return true;
  };

  const getAnalysisForProcess = (processName: string) => analyses.find(a => a.processName === processName);

  useEffect(() => { fetchAnalyses(); }, [user?.id, patientId, recordId]);

  return { analyses, loading, saveAnalysis, getAnalysisForProcess, refetch: fetchAnalyses };
};
