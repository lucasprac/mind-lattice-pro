import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Patient, PatientFormData } from '@/types';
import { PatientFormSchema } from '@/schemas';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// ===========================
// QUERY KEYS
// ===========================

const PATIENTS_QUERY_KEY = ['patients'] as const;
const PATIENT_QUERY_KEY = (id: string) => ['patients', id] as const;
const PATIENT_SESSIONS_KEY = (id: string) => ['patients', id, 'sessions'] as const;

// ===========================
// API FUNCTIONS
// ===========================

const fetchPatients = async (therapistId: string): Promise<Patient[]> => {
  const { data, error } = await supabase
    .from('patients')
    .select(`
      *,
      sessions:sessions(count),
      latest_session:sessions(
        id,
        title,
        session_date,
        created_at
      )
    `)
    .eq('therapist_id', therapistId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(patient => ({
    ...patient,
    sessionCount: patient.sessions?.[0]?.count || 0,
    lastSession: patient.latest_session?.[0] || null,
  }));
};

const fetchPatientById = async (id: string): Promise<Patient> => {
  const { data, error } = await supabase
    .from('patients')
    .select(`
      *,
      sessions:sessions(
        id,
        title,
        session_date,
        session_type,
        status,
        created_at
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    ...data,
    sessionCount: data.sessions?.length || 0,
    lastSession: data.sessions?.[0] || null,
  };
};

const createPatient = async (data: PatientFormData, therapistId: string): Promise<Patient> => {
  const validatedData = PatientFormSchema.parse(data);
  
  const { data: newPatient, error } = await supabase
    .from('patients')
    .insert([{ ...validatedData, therapist_id: therapistId }])
    .select()
    .single();

  if (error) throw error;

  return {
    ...newPatient,
    sessionCount: 0,
    lastSession: null,
  };
};

const updatePatient = async (id: string, data: Partial<PatientFormData>): Promise<Patient> => {
  const { data: updatedPatient, error } = await supabase
    .from('patients')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    ...updatedPatient,
    sessionCount: 0, // Will be updated by cache invalidation
    lastSession: null,
  };
};

const deletePatient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ===========================
// HOOKS
// ===========================

/**
 * Hook principal para gerenciar pacientes com cache otimizado
 */
export const usePatients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: patients = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: PATIENTS_QUERY_KEY,
    queryFn: () => fetchPatients(user?.id || ''),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
    refetchOnWindowFocus: false,
  });

  const addPatientMutation = useMutation({
    mutationFn: (data: PatientFormData) => createPatient(data, user?.id || ''),
    onSuccess: (newPatient) => {
      queryClient.setQueryData(PATIENTS_QUERY_KEY, (old: Patient[] = []) => [
        newPatient,
        ...old,
      ]);
      toast({
        title: 'Sucesso!',
        description: 'Paciente adicionado com sucesso.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o paciente.',
        variant: 'destructive',
      });
      console.error('Erro ao adicionar paciente:', error);
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PatientFormData> }) =>
      updatePatient(id, data),
    onSuccess: (updatedPatient) => {
      // Atualiza lista de pacientes
      queryClient.setQueryData(PATIENTS_QUERY_KEY, (old: Patient[] = []) =>
        old.map(patient => 
          patient.id === updatedPatient.id ? updatedPatient : patient
        )
      );
      // Atualiza cache individual
      queryClient.setQueryData(PATIENT_QUERY_KEY(updatedPatient.id), updatedPatient);
      
      toast({
        title: 'Sucesso!',
        description: 'Paciente atualizado com sucesso.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o paciente.',
        variant: 'destructive',
      });
      console.error('Erro ao atualizar paciente:', error);
    },
  });

  const deletePatientMutation = useMutation({
    mutationFn: deletePatient,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(PATIENTS_QUERY_KEY, (old: Patient[] = []) =>
        old.filter(patient => patient.id !== deletedId)
      );
      // Remove do cache individual
      queryClient.removeQueries({ queryKey: PATIENT_QUERY_KEY(deletedId) });
      queryClient.removeQueries({ queryKey: PATIENT_SESSIONS_KEY(deletedId) });
      
      toast({
        title: 'Sucesso!',
        description: 'Paciente removido com sucesso.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o paciente.',
        variant: 'destructive',
      });
      console.error('Erro ao remover paciente:', error);
    },
  });

  return {
    patients,
    isLoading,
    error,
    refetch,
    addPatient: addPatientMutation.mutate,
    updatePatient: updatePatientMutation.mutate,
    deletePatient: deletePatientMutation.mutate,
    isAddingPatient: addPatientMutation.isPending,
    isUpdatingPatient: updatePatientMutation.isPending,
    isDeletingPatient: deletePatientMutation.isPending,
  };
};

/**
 * Hook para obter um paciente específico
 */
export const usePatient = (id: string) => {
  const {
    data: patient,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: PATIENT_QUERY_KEY(id),
    queryFn: () => fetchPatientById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    patient,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para pré-carregar um paciente (prefetch)
 */
export const usePrefetchPatient = () => {
  const queryClient = useQueryClient();

  const prefetchPatient = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: PATIENT_QUERY_KEY(id),
      queryFn: () => fetchPatientById(id),
      staleTime: 2 * 60 * 1000,
    });
  };

  return prefetchPatient;
};

/**
 * Hook para invalidar caches relacionados a pacientes
 */
export const useInvalidatePatients = () => {
  const queryClient = useQueryClient();

  const invalidatePatients = () => {
    queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY });
  };

  const invalidatePatient = (id: string) => {
    queryClient.invalidateQueries({ queryKey: PATIENT_QUERY_KEY(id) });
  };

  const invalidatePatientSessions = (id: string) => {
    queryClient.invalidateQueries({ queryKey: PATIENT_SESSIONS_KEY(id) });
  };

  return {
    invalidatePatients,
    invalidatePatient,
    invalidatePatientSessions,
  };
};
