import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface MediatorData {
  [dimension: string]: { [mediator: string]: string[] };
}

export const usePatientMediators = (patientId: string, recordId?: string) => {
  const [mediatorProcesses, setMediatorProcesses] = useState<MediatorData>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMediators = async () => {
    if (!user?.id || !patientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from("patient_mediators")
        .select("*")
        .eq("patient_id", patientId)
        .eq("therapist_id", user.id);

      // Always filter by record_id for session-specific mediators
      if (recordId) {
        query = query.eq("record_id", recordId);
      } else {
        query = query.is("record_id", null);
      }

      const { data, error } = await query;

      if (error && error.code !== 'PGRST116') {
        console.error("Erro ao buscar mediadores:", error);
        return;
      }

      // Convert array to nested object structure
      const organized: MediatorData = {};
      data?.forEach((item: any) => {
        if (!organized[item.dimension]) {
          organized[item.dimension] = {};
        }
        organized[item.dimension][item.mediator] = item.processes || [];
      });

      setMediatorProcesses(organized);
    } catch (err) {
      console.error("Erro inesperado ao buscar mediadores:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveMediators = async (data: MediatorData) => {
    if (!user?.id || !patientId) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      // Delete existing mediators for this patient and session
      let deleteQuery = supabase
        .from("patient_mediators")
        .delete()
        .eq("patient_id", patientId)
        .eq("therapist_id", user.id);

      if (recordId) {
        deleteQuery = deleteQuery.eq("record_id", recordId);
      } else {
        deleteQuery = deleteQuery.is("record_id", null);
      }

      await deleteQuery;

      // Insert new data
      const insertData: any[] = [];
      Object.entries(data).forEach(([dimension, mediators]) => {
        Object.entries(mediators).forEach(([mediator, processes]) => {
          if (processes.length > 0) {
            insertData.push({
              patient_id: patientId,
              therapist_id: user.id,
              record_id: recordId || null,
              dimension,
              mediator,
              processes,
            });
          }
        });
      });

      if (insertData.length > 0) {
        const { error } = await supabase
          .from("patient_mediators")
          .insert(insertData);

        if (error) {
          console.error("Erro ao salvar mediadores:", error);
          toast.error("Erro ao salvar mediadores");
          return false;
        }
      }

      setMediatorProcesses(data);
      toast.success("Mediadores salvos com sucesso");
      return true;
    } catch (err) {
      console.error("Erro inesperado:", err);
      toast.error("Erro inesperado ao salvar mediadores");
      return false;
    }
  };

  const getAllProcesses = (): string[] => {
    const processes: string[] = [];
    Object.values(mediatorProcesses).forEach((mediators) => {
      Object.values(mediators).forEach((processList) => {
        processes.push(...processList);
      });
    });
    return [...new Set(processes)]; // Remove duplicates
  };

  // Get processes with their dimension and mediator info for step 4
  const getProcessesWithMediators = (): Array<{process: string, dimension: string, mediator: string}> => {
    const processesWithInfo: Array<{process: string, dimension: string, mediator: string}> = [];
    
    Object.entries(mediatorProcesses).forEach(([dimension, mediators]) => {
      Object.entries(mediators).forEach(([mediator, processes]) => {
        processes.forEach(process => {
          processesWithInfo.push({ process, dimension, mediator });
        });
      });
    });
    
    return processesWithInfo;
  };

  useEffect(() => {
    fetchMediators();
  }, [user?.id, patientId, recordId]);

  return {
    mediatorProcesses,
    loading,
    saveMediators,
    getAllProcesses,
    getProcessesWithMediators,
    refetch: fetchMediators,
  };
};