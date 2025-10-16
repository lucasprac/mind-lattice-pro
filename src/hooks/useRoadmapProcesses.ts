import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface RoadmapProcess {
  id: string;
  therapist_id: string;
  patient_id?: string;
  record_id?: string;
  process_type: string;
  category?: string;
  name: string;
  description?: string;
  target_area?: string;
  methodology?: string;
  expected_outcomes?: string;
  actual_outcomes?: string;
  notes?: string;
  priority: number;
  progress_percentage: number;
  start_date?: string;
  end_date?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    full_name: string;
  };
  record?: {
    id: string;
    session_number: number;
    session_date: string;
  };
}

export interface CreateRoadmapProcessData {
  patient_id?: string;
  record_id?: string;
  process_type: string;
  category?: string;
  name: string;
  description?: string;
  target_area?: string;
  methodology?: string;
  expected_outcomes?: string;
  priority?: number;
  start_date?: string;
  end_date?: string;
}

export const useRoadmapProcesses = () => {
  const [processes, setProcesses] = useState<RoadmapProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProcesses = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("roadmap_processes")
        .select(`
          *,
          patient:patients(
            id,
            full_name
          ),
          record:records(
            id,
            session_number,
            session_date
          )
        `)
        .eq("therapist_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Erro ao buscar processos do roadmap:", fetchError);
        setError(fetchError.message);
        toast.error("Erro ao carregar processos do roadmap");
        return;
      }

      setProcesses((data as any) || []);
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado ao carregar processos do roadmap");
      toast.error("Erro inesperado ao carregar processos do roadmap");
    } finally {
      setLoading(false);
    }
  };

  const createProcess = async (processData: CreateRoadmapProcessData) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      const { error } = await supabase
        .from("roadmap_processes")
        .insert({
          therapist_id: user.id,
          patient_id: processData.patient_id,
          record_id: processData.record_id,
          process_type: processData.process_type,
          category: processData.category,
          name: processData.name,
          description: processData.description,
          target_area: processData.target_area,
          methodology: processData.methodology,
          expected_outcomes: processData.expected_outcomes,
          priority: processData.priority || 3,
          progress_percentage: 0,
          start_date: processData.start_date,
          end_date: processData.end_date,
          status: "planned"
        });

      if (error) {
        console.error("Erro ao criar processo do roadmap:", error);
        toast.error("Erro ao criar processo do roadmap");
        return false;
      }

      toast.success("Processo do roadmap criado com sucesso");
      await fetchProcesses();
      return true;
    } catch (err) {
      console.error("Erro inesperado ao criar processo do roadmap:", err);
      toast.error("Erro inesperado ao criar processo do roadmap");
      return false;
    }
  };

  const updateProcess = async (processId: string, updates: Partial<RoadmapProcess>) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      const { error } = await supabase
        .from("roadmap_processes")
        .update(updates)
        .eq("id", processId)
        .eq("therapist_id", user.id);

      if (error) {
        console.error("Erro ao atualizar processo do roadmap:", error);
        toast.error("Erro ao atualizar processo do roadmap");
        return false;
      }

      toast.success("Processo do roadmap atualizado com sucesso");
      await fetchProcesses();
      return true;
    } catch (err) {
      console.error("Erro inesperado ao atualizar processo do roadmap:", err);
      toast.error("Erro inesperado ao atualizar processo do roadmap");
      return false;
    }
  };

  const deleteProcess = async (processId: string) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      const { error } = await supabase
        .from("roadmap_processes")
        .delete()
        .eq("id", processId)
        .eq("therapist_id", user.id);

      if (error) {
        console.error("Erro ao deletar processo do roadmap:", error);
        toast.error("Erro ao deletar processo do roadmap");
        return false;
      }

      toast.success("Processo do roadmap deletado com sucesso");
      await fetchProcesses();
      return true;
    } catch (err) {
      console.error("Erro inesperado ao deletar processo do roadmap:", err);
      toast.error("Erro inesperado ao deletar processo do roadmap");
      return false;
    }
  };

  const getProcessesByPatient = (patientId: string) => {
    return processes.filter(process => process.patient_id === patientId);
  };

  const getProcessesByRecord = (recordId: string) => {
    return processes.filter(process => process.record_id === recordId);
  };

  const getProcessesByType = (processType: string) => {
    return processes.filter(process => process.process_type === processType);
  };

  const getProcessesByStatus = (status: RoadmapProcess['status']) => {
    return processes.filter(process => process.status === status);
  };

  const getProcessesByPriority = (minPriority: number) => {
    return processes.filter(process => process.priority >= minPriority);
  };

  const getProcessStats = () => {
    const total = processes.length;
    const byStatus = {
      planned: processes.filter(p => p.status === 'planned').length,
      in_progress: processes.filter(p => p.status === 'in_progress').length,
      completed: processes.filter(p => p.status === 'completed').length,
      paused: processes.filter(p => p.status === 'paused').length,
      cancelled: processes.filter(p => p.status === 'cancelled').length,
    };
    const byPriority = {
      high: processes.filter(p => p.priority >= 4).length,
      medium: processes.filter(p => p.priority === 3).length,
      low: processes.filter(p => p.priority <= 2).length,
    };
    const averageProgress = processes.length > 0 
      ? Math.round(processes.reduce((sum, p) => sum + p.progress_percentage, 0) / processes.length)
      : 0;
    const overdue = processes.filter(p => 
      p.end_date && 
      new Date(p.end_date) < new Date() && 
      p.status !== 'completed' && 
      p.status !== 'cancelled'
    ).length;

    return {
      total,
      byStatus,
      byPriority,
      averageProgress,
      overdue,
    };
  };

  useEffect(() => {
    fetchProcesses();
  }, [user?.id]);

  return {
    processes,
    loading,
    error,
    createProcess,
    updateProcess,
    deleteProcess,
    getProcessesByPatient,
    getProcessesByRecord,
    getProcessesByType,
    getProcessesByStatus,
    getProcessesByPriority,
    getProcessStats,
    fetchProcesses,
    refetch: fetchProcesses,
  };
};