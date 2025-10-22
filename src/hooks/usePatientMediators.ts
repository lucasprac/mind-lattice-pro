import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type PatientMediatorRow = Tables<'patient_mediators'>;

export interface MediatorData { [dimension: string]: { [mediator: string]: string[] } }

export const usePatientMediators = (patientId: string, recordId?: string) => {
  const [mediatorProcesses, setMediatorProcesses] = useState<MediatorData>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMediators = async () => {
    if (!user?.id || !patientId) { setLoading(false); return; }
    try {
      setLoading(true);
      let query = supabase.from('patient_mediators').select('*').eq('patient_id', patientId).eq('therapist_id', user.id);
      query = recordId ? query.eq('record_id', recordId) : query.is('record_id', null);
      const { data, error } = await query;
      if (error && error.code !== 'PGRST116') return; // no rows
      const organized: MediatorData = {};
      (data as PatientMediatorRow[] | null)?.forEach((item) => {
        if (!organized[item.dimension]) organized[item.dimension] = {};
        organized[item.dimension][item.mediator] = item.processes || [];
      });
      setMediatorProcesses(organized);
    } finally { setLoading(false); }
  };

  const saveMediators = async (data: MediatorData) => {
    if (!user?.id || !patientId) { toast.error('Usuário não autenticado'); return false; }
    let del = supabase.from('patient_mediators').delete().eq('patient_id', patientId).eq('therapist_id', user.id);
    del = recordId ? del.eq('record_id', recordId) : del.is('record_id', null); await del;
    const insertData: PatientMediatorRow[] = [] as any;
    Object.entries(data).forEach(([dimension, mediators]) => {
      Object.entries(mediators).forEach(([mediator, processes]) => {
        if (processes.length > 0) insertData.push({ patient_id: patientId, therapist_id: user.id, record_id: recordId || null, dimension, mediator, processes } as any);
      });
    });
    if (insertData.length > 0) {
      const { error } = await supabase.from('patient_mediators').insert(insertData as any);
      if (error) { toast.error('Erro ao salvar mediadores'); return false; }
    }
    setMediatorProcesses(data); toast.success('Mediadores salvos com sucesso'); return true;
  };

  const getAllProcesses = () => Array.from(new Set(Object.values(mediatorProcesses).flatMap(m => Object.values(m).flat())));
  const getProcessesWithMediators = () => {
    const list: Array<{process: string, dimension: string, mediator: string}> = [];
    Object.entries(mediatorProcesses).forEach(([dimension, mediators]) => {
      Object.entries(mediators).forEach(([mediator, processes]) => { processes.forEach(process => list.push({ process, dimension, mediator })); });
    });
    return list;
  };

  useEffect(() => { fetchMediators(); }, [user?.id, patientId, recordId]);

  return { mediatorProcesses, loading, saveMediators, getAllProcesses, getProcessesWithMediators, refetch: fetchMediators };
};
