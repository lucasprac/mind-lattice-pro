import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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

export const usePatientFunctionalAnalysis = (patientId: string) => {
  const [analyses, setAnalyses] = useState<FunctionalAnalysisData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAnalyses = async () => {
    if (!user?.id || !patientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("functional_analysis")
        .select("*")
        .eq("patient_id", patientId)
        .eq("therapist_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar análises:", error);
        toast.error("Erro ao carregar análises");
        return;
      }

      const mapped = data?.map((item: any) => ({
        id: item.id,
        processName: item.process_name,
        dimension: item.dimension,
        selectionAnalysis: item.selection_analysis || "",
        variationAnalysis: item.variation_analysis || "",
        retentionAnalysis: item.retention_analysis || "",
        biofisiologicoSelection: item.biofisiologico_selection || "",
        biofisiologicoVariation: item.biofisiologico_variation || "",
        biofisiologicoRetention: item.biofisiologico_retention || "",
        socioculturalSelection: item.sociocultural_selection || "",
        socioculturalVariation: item.sociocultural_variation || "",
        socioculturalRetention: item.sociocultural_retention || "",
      })) || [];

      setAnalyses(mapped);
    } catch (err) {
      console.error("Erro inesperado:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveAnalysis = async (analysis: FunctionalAnalysisData) => {
    if (!user?.id || !patientId) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      const dbData = {
        patient_id: patientId,
        therapist_id: user.id,
        process_name: analysis.processName,
        dimension: analysis.dimension,
        selection_analysis: analysis.selectionAnalysis,
        variation_analysis: analysis.variationAnalysis,
        retention_analysis: analysis.retentionAnalysis,
        biofisiologico_selection: analysis.biofisiologicoSelection,
        biofisiologico_variation: analysis.biofisiologicoVariation,
        biofisiologico_retention: analysis.biofisiologicoRetention,
        sociocultural_selection: analysis.socioculturalSelection,
        sociocultural_variation: analysis.socioculturalVariation,
        sociocultural_retention: analysis.socioculturalRetention,
      };

      if (analysis.id) {
        // Update existing
        const { error } = await supabase
          .from("functional_analysis")
          .update(dbData)
          .eq("id", analysis.id);

        if (error) {
          console.error("Erro ao atualizar análise:", error);
          toast.error("Erro ao salvar análise");
          return false;
        }
      } else {
        // Create new
        const { data, error } = await supabase
          .from("functional_analysis")
          .insert(dbData)
          .select()
          .single();

        if (error) {
          console.error("Erro ao criar análise:", error);
          toast.error("Erro ao salvar análise");
          return false;
        }

        // Add to local state
        setAnalyses(prev => [{
          ...analysis,
          id: data.id,
        }, ...prev]);
      }

      toast.success("Análise salva com sucesso");
      await fetchAnalyses(); // Refresh
      return true;
    } catch (err) {
      console.error("Erro inesperado:", err);
      toast.error("Erro inesperado ao salvar análise");
      return false;
    }
  };

  const getAnalysisForProcess = (processName: string): FunctionalAnalysisData | undefined => {
    return analyses.find(a => a.processName === processName);
  };

  useEffect(() => {
    fetchAnalyses();
  }, [user?.id, patientId]);

  return {
    analyses,
    loading,
    saveAnalysis,
    getAnalysisForProcess,
    refetch: fetchAnalyses,
  };
};
