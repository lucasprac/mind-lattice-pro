import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type EEMMProcess = Tables<'eemm_processes'>;

type CreateEEMMProcessData = {
  patient_id?: string;
  dimension: EEMMProcess['dimension'];
  evolutionary_process: EEMMProcess['evolutionary_process'];
  analysis_level: EEMMProcess['analysis_level'];
  process_name: string;
  intensity?: number;
  evidence?: string;
  intervention?: string;
};

export const useEEMMProcesses = () => {
  const [processes, setProcesses] = useState<EEMMProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProcesses = async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      setLoading(true); setError(null);
      const { data, error: fetchError } = await supabase
        .from('eemm_processes')
        .select(`*, patient:patients(id, full_name)`) // depends on FK
        .eq('therapist_id', user.id)
        .eq('process_context', 'matrix')
        .order('created_at', { ascending: false });
      if (fetchError) { setError(fetchError.message); toast.error('Erro ao carregar processos EEMM: ' + fetchError.message); return; }
      setProcesses((data as any) || []);
    } catch {
      setError('Erro inesperado ao carregar processos EEMM'); toast.error('Erro inesperado ao carregar processos EEMM');
    } finally { setLoading(false); }
  };

  const createProcess = async (processData: CreateEEMMProcessData) => {
    if (!user?.id) { toast.error('Usuário não autenticado'); return false; }
    try {
      const insertData: Partial<EEMMProcess> = {
        therapist_id: user.id,
        patient_id: processData.patient_id ?? null,
        dimension: processData.dimension,
        evolutionary_process: processData.evolutionary_process,
        analysis_level: processData.analysis_level,
        process_name: processData.process_name,
        intensity: processData.intensity ?? 3,
        evidence: processData.evidence ?? null,
        intervention: processData.intervention ?? null,
        status: 'active',
        process_context: 'matrix',
      };
      const { error } = await supabase.from('eemm_processes').insert(insertData as any);
      if (error) { toast.error(`Erro ao criar processo EEMM: ${error.message}`); return false; }
      toast.success('Processo EEMM criado com sucesso'); await fetchProcesses(); return true;
    } catch { toast.error('Erro inesperado ao criar processo EEMM'); return false; }
  };

  const updateProcess = async (processId: string, updates: Partial<EEMMProcess>) => {
    if (!user?.id) { toast.error('Usuário não autenticado'); return false; }
    const { id, therapist_id, created_at, updated_at, ...updateData } = updates;
    const { error } = await supabase
      .from('eemm_processes')
      .update(updateData)
      .eq('id', processId)
      .eq('therapist_id', user.id)
      .eq('process_context', 'matrix');
    if (error) { toast.error(`Erro ao atualizar processo EEMM: ${error.message}`); return false; }
    toast.success('Processo EEMM atualizado com sucesso'); await fetchProcesses(); return true;
  };

  const deleteProcess = async (processId: string) => {
    if (!user?.id) { toast.error('Usuário não autenticado'); return false; }
    const { error } = await supabase
      .from('eemm_processes')
      .delete()
      .eq('id', processId)
      .eq('therapist_id', user.id)
      .eq('process_context', 'matrix');
    if (error) { toast.error(`Erro ao deletar processo EEMM: ${error.message}`); return false; }
    toast.success('Processo EEMM deletado com sucesso'); await fetchProcesses(); return true;
  };

  const getProcessesByPatient = (patientId: string) => processes.filter(p => p.patient_id === patientId);
  const getProcessesByDimension = (dimension: EEMMProcess['dimension']) => processes.filter(p => p.dimension === dimension);
  const getProcessesForCell = (dimension: EEMMProcess['dimension'], evolutionaryProcess: EEMMProcess['evolutionary_process']) => processes.filter(p => p.dimension === dimension && p.evolutionary_process === evolutionaryProcess);

  const getProcessStats = () => {
    const total = processes.length;
    const active = processes.filter(p => p.status === 'active').length;
    const completed = processes.filter(p => p.status === 'completed').length;
    const byDimension = {
      afeto: processes.filter(p => p.dimension === 'afeto').length,
      cognicao: processes.filter(p => p.dimension === 'cognicao').length,
      atencao: processes.filter(p => p.dimension === 'atencao').length,
      self: processes.filter(p => p.dimension === 'self').length,
      motivacao: processes.filter(p => p.dimension === 'motivacao').length,
      comportamento: processes.filter(p => p.dimension === 'comportamento').length,
    };
    const byAnalysisLevel = {
      biofisiologico: processes.filter(p => p.analysis_level === 'biofisiologico').length,
      sociocultural: processes.filter(p => p.analysis_level === 'sociocultural').length,
      psicologico: processes.filter(p => p.analysis_level === 'psicologico').length,
    };
    const highIntensity = processes.filter(p => (p.intensity || 0) >= 4).length;
    return { total, active, completed, byDimension, byAnalysisLevel, highIntensity };
  };

  useEffect(() => { fetchProcesses(); }, [user?.id]);

  return { processes, loading, error, createProcess, updateProcess, deleteProcess, getProcessesByPatient, getProcessesByDimension, getProcessesForCell, getProcessStats, fetchProcesses, refetch: fetchProcesses };
};
