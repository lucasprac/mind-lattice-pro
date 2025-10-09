import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Patient {
  id: string;
  full_name: string;
  birth_date?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: "active" | "inactive" | "discharged";
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  medical_history?: string;
  current_medications?: string;
  therapy_goals?: string;
  session_frequency?: string;
  therapist_id: string;
  created_at: string;
  updated_at: string;
}

export const usePatients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('patients')
        .select('*')
        .eq('therapist_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setPatients(data || []);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addPatient = useCallback(async (patientData: Omit<Patient, 'id' | 'therapist_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert({
          ...patientData,
          therapist_id: user.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setPatients(prev => [data, ...prev]);
      return true;
    } catch (err) {
      console.error('Error adding patient:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar paciente');
      return false;
    }
  }, [user]);

  const updatePatient = useCallback(async (patientId: string, patientData: Partial<Omit<Patient, 'id' | 'therapist_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('patients')
        .update({
          ...patientData,
          updated_at: new Date().toISOString()
        })
        .eq('id', patientId)
        .eq('therapist_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setPatients(prev => prev.map(patient => 
        patient.id === patientId ? data : patient
      ));
      return true;
    } catch (err) {
      console.error('Error updating patient:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar paciente');
      return false;
    }
  }, [user]);

  const deletePatient = useCallback(async (patientId: string) => {
    if (!user) return false;

    try {
      // Primeiro, vamos deletar todos os dados relacionados ao paciente

      // 1. Deletar avaliações do paciente
      const { error: assessmentsError } = await supabase
        .from('patient_assessments')
        .delete()
        .eq('patient_id', patientId);

      if (assessmentsError) {
        console.warn('Error deleting assessments:', assessmentsError);
      }

      // 2. Deletar conexões das redes do paciente
      const { data: networks } = await supabase
        .from('patient_networks')
        .select('id')
        .eq('patient_id', patientId);

      if (networks && networks.length > 0) {
        const networkIds = networks.map(n => n.id);

        // Deletar conexões
        const { error: connectionsError } = await supabase
          .from('network_connections')
          .delete()
          .in('network_id', networkIds);

        if (connectionsError) {
          console.warn('Error deleting connections:', connectionsError);
        }

        // Deletar nós
        const { error: nodesError } = await supabase
          .from('network_nodes')
          .delete()
          .in('network_id', networkIds);

        if (nodesError) {
          console.warn('Error deleting nodes:', nodesError);
        }

        // Deletar redes
        const { error: networksError } = await supabase
          .from('patient_networks')
          .delete()
          .eq('patient_id', patientId);

        if (networksError) {
          console.warn('Error deleting networks:', networksError);
        }
      }

      // 3. Deletar mediadores do paciente
      const { error: mediatorsError } = await supabase
        .from('patient_mediators')
        .delete()
        .eq('patient_id', patientId);

      if (mediatorsError) {
        console.warn('Error deleting mediators:', mediatorsError);
      }

      // 4. Deletar análises funcionais do paciente
      const { error: functionalAnalysisError } = await supabase
        .from('patient_functional_analysis')
        .delete()
        .eq('patient_id', patientId);

      if (functionalAnalysisError) {
        console.warn('Error deleting functional analysis:', functionalAnalysisError);
      }

      // 5. Deletar sessões do paciente
      const { error: sessionsError } = await supabase
        .from('patient_sessions')
        .delete()
        .eq('patient_id', patientId);

      if (sessionsError) {
        console.warn('Error deleting sessions:', sessionsError);
      }

      // 6. Deletar registros do paciente
      const { error: recordsError } = await supabase
        .from('patient_records')
        .delete()
        .eq('patient_id', patientId);

      if (recordsError) {
        console.warn('Error deleting records:', recordsError);
      }

      // 7. Finalmente, deletar o paciente
      const { error: patientError } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId)
        .eq('therapist_id', user.id);

      if (patientError) {
        throw patientError;
      }

      // Remove o paciente do estado local
      setPatients(prev => prev.filter(patient => patient.id !== patientId));
      return true;
    } catch (err) {
      console.error('Error deleting patient:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir paciente');
      return false;
    }
  }, [user]);

  const getPatientById = useCallback((patientId: string): Patient | undefined => {
    return patients.find(patient => patient.id === patientId);
  }, [patients]);

  const getActivePatients = useCallback((): Patient[] => {
    return patients.filter(patient => patient.status === 'active');
  }, [patients]);

  const getInactivePatients = useCallback((): Patient[] => {
    return patients.filter(patient => patient.status === 'inactive');
  }, [patients]);

  const getDischargedPatients = useCallback((): Patient[] => {
    return patients.filter(patient => patient.status === 'discharged');
  }, [patients]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  return {
    patients,
    loading,
    error,
    addPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    getActivePatients,
    getInactivePatients,
    getDischargedPatients,
    reloadPatients: loadPatients
  };
};
