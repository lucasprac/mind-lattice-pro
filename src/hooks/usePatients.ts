import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

// Preferir tipos gerados para evitar drift com o schema
export type Patient = Tables<'patients'>;

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPatients = async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      setLoading(true); setError(null);
      const { data, error: fetchError } = await supabase
        .from('patients')
        .select('*')
        .eq('therapist_id', user.id)
        .order('created_at', { ascending: false });
      if (fetchError) { setError(fetchError.message); toast.error('Erro ao carregar pacientes'); return; }
      setPatients((data as Patient[]) || []);
    } catch {
      setError('Erro inesperado ao carregar pacientes'); toast.error('Erro inesperado ao carregar pacientes');
    } finally { setLoading(false); }
  };

  const deletePatient = async (patientId: string) => {
    if (!user?.id) { toast.error('Usuário não autenticado'); return false; }
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId)
      .eq('therapist_id', user.id);
    if (error) { toast.error('Erro ao deletar paciente'); return false; }
    toast.success('Paciente deletado com sucesso');
    setPatients(prev => prev.filter(p => p.id !== patientId));
    return true;
  };

  const updatePatient = async (patientId: string, updates: Partial<Patient>) => {
    if (!user?.id) { toast.error('Usuário não autenticado'); return false; }
    const { id, created_at, updated_at, ...safeUpdates } = updates;
    const { data, error } = await supabase
      .from('patients')
      .update(safeUpdates)
      .eq('id', patientId)
      .eq('therapist_id', user.id)
      .select()
      .single();
    if (error) { toast.error('Erro ao atualizar paciente'); return false; }
    toast.success('Paciente atualizado com sucesso');
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, ...(data as Patient) } : p));
    return true;
  };

  const searchPatients = (term: string) => {
    const t = term.trim().toLowerCase();
    if (!t) return patients;
    return patients.filter(p =>
      p.full_name.toLowerCase().includes(t) ||
      p.email?.toLowerCase().includes(t) ||
      p.phone?.includes(t) ||
      p.notes?.toLowerCase().includes(t)
    );
  };

  const getPatientsByStatus = (status: NonNullable<Patient['status']>) => patients.filter(p => p.status === status);

  const getPatientStats = () => {
    const total = patients.length;
    const active = patients.filter(p => p.status === 'active').length;
    const inactive = patients.filter(p => p.status === 'inactive').length;
    const discharged = patients.filter(p => p.status === 'discharged').length;
    return { total, active, inactive, discharged };
  };

  useEffect(() => { fetchPatients(); }, [user?.id]);

  return { patients, loading, error, fetchPatients, deletePatient, updatePatient, searchPatients, getPatientsByStatus, getPatientStats, refetch: fetchPatients };
};
