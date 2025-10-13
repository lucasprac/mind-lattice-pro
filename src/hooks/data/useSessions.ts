import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Session, SessionFormData } from '@/types';
import { SessionFormSchema } from '@/schemas';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// ===========================
// QUERY KEYS
// ===========================

const SESSIONS_QUERY_KEY = ['sessions'] as const;
const SESSION_QUERY_KEY = (id: string) => ['sessions', id] as const;
const PATIENT_SESSIONS_KEY = (patientId: string) => ['sessions', 'patient', patientId] as const;
const SESSION_PBAT_KEY = (sessionId: string) => ['sessions', sessionId, 'pbat'] as const;
const SESSION_NETWORKS_KEY = (sessionId: string) => ['sessions', sessionId, 'networks'] as const;

// ===========================
// API FUNCTIONS
// ===========================

const fetchSessions = async (therapistId: string): Promise<Session[]> => {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      patient:patients(id, name, email),
      pbat_responses(id, total_score, created_at),
      networks(id, name, updated_at)
    `)
    .eq('therapist_id', therapistId)
    .order('session_date', { ascending: false });

  if (error) throw error;
  return data || [];
};

const fetchSessionsByPatient = async (patientId: string): Promise<Session[]> => {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      pbat_responses(id, total_score, created_at),
      networks(id, name, updated_at)
    `)
    .eq('patient_id', patientId)
    .order('session_date', { ascending: false });

  if (error) throw error;
  return data || [];
};

const fetchSessionById = async (id: string): Promise<Session> => {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      patient:patients(id, name, email),
      pbat_responses(id, total_score, domain_scores, created_at),
      networks(
        id,
        name,
        nodes,
        edges,
        updated_at
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

const createSession = async (data: SessionFormData, therapistId: string): Promise<Session> => {
  const validatedData = SessionFormSchema.parse(data);
  
  const { data: newSession, error } = await supabase
    .from('sessions')
    .insert([{ 
      ...validatedData, 
      therapist_id: therapistId,
      status: 'scheduled'
    }])
    .select(`
      *,
      patient:patients(id, name, email)
    `)
    .single();

  if (error) throw error;
  return newSession;
};

const updateSession = async (id: string, data: Partial<SessionFormData>): Promise<Session> => {
  const { data: updatedSession, error } = await supabase
    .from('sessions')
    .update(data)
    .eq('id', id)
    .select(`
      *,
      patient:patients(id, name, email)
    `)
    .single();

  if (error) throw error;
  return updatedSession;
};

const deleteSession = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ===========================
// HOOKS
// ===========================

/**
 * Hook principal para gerenciar sessões com cache otimizado
 */
export const useSessions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: sessions = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: () => fetchSessions(user?.id || ''),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });

  const addSessionMutation = useMutation({
    mutationFn: (data: SessionFormData) => createSession(data, user?.id || ''),
    onSuccess: (newSession) => {
      // Atualiza lista geral
      queryClient.setQueryData(SESSIONS_QUERY_KEY, (old: Session[] = []) => [
        newSession,
        ...old,
      ]);
      
      // Atualiza lista do paciente
      queryClient.setQueryData(
        PATIENT_SESSIONS_KEY(newSession.patient_id),
        (old: Session[] = []) => [newSession, ...old]
      );
      
      // Invalida cache de pacientes para atualizar contador
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      
      toast({
        title: 'Sucesso!',
        description: 'Sessão criada com sucesso.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a sessão.',
        variant: 'destructive',
      });
      console.error('Erro ao criar sessão:', error);
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SessionFormData> }) =>
      updateSession(id, data),
    onSuccess: (updatedSession) => {
      // Atualiza lista geral
      queryClient.setQueryData(SESSIONS_QUERY_KEY, (old: Session[] = []) =>
        old.map(session => 
          session.id === updatedSession.id ? updatedSession : session
        )
      );
      
      // Atualiza lista do paciente
      queryClient.setQueryData(
        PATIENT_SESSIONS_KEY(updatedSession.patient_id),
        (old: Session[] = []) =>
          old.map(session => 
            session.id === updatedSession.id ? updatedSession : session
          )
      );
      
      // Atualiza cache individual
      queryClient.setQueryData(SESSION_QUERY_KEY(updatedSession.id), updatedSession);
      
      toast({
        title: 'Sucesso!',
        description: 'Sessão atualizada com sucesso.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a sessão.',
        variant: 'destructive',
      });
      console.error('Erro ao atualizar sessão:', error);
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: (_, deletedId) => {
      // Remove da lista geral
      queryClient.setQueryData(SESSIONS_QUERY_KEY, (old: Session[] = []) =>
        old.filter(session => session.id !== deletedId)
      );
      
      // Remove caches relacionados
      queryClient.removeQueries({ queryKey: SESSION_QUERY_KEY(deletedId) });
      queryClient.removeQueries({ queryKey: SESSION_PBAT_KEY(deletedId) });
      queryClient.removeQueries({ queryKey: SESSION_NETWORKS_KEY(deletedId) });
      
      // Invalida cache de pacientes para atualizar contador
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      
      toast({
        title: 'Sucesso!',
        description: 'Sessão removida com sucesso.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a sessão.',
        variant: 'destructive',
      });
      console.error('Erro ao remover sessão:', error);
    },
  });

  return {
    sessions,
    isLoading,
    error,
    refetch,
    addSession: addSessionMutation.mutate,
    updateSession: updateSessionMutation.mutate,
    deleteSession: deleteSessionMutation.mutate,
    isAddingSession: addSessionMutation.isPending,
    isUpdatingSession: updateSessionMutation.isPending,
    isDeletingSession: deleteSessionMutation.isPending,
  };
};

/**
 * Hook para obter sessões de um paciente específico
 */
export const usePatientSessions = (patientId: string) => {
  const {
    data: sessions = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: PATIENT_SESSIONS_KEY(patientId),
    queryFn: () => fetchSessionsByPatient(patientId),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    sessions,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para obter uma sessão específica
 */
export const useSession = (id: string) => {
  const {
    data: session,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: SESSION_QUERY_KEY(id),
    queryFn: () => fetchSessionById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    session,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para pré-carregar uma sessão (prefetch)
 */
export const usePrefetchSession = () => {
  const queryClient = useQueryClient();

  const prefetchSession = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: SESSION_QUERY_KEY(id),
      queryFn: () => fetchSessionById(id),
      staleTime: 2 * 60 * 1000,
    });
  };

  return prefetchSession;
};

/**
 * Hook para invalidar caches relacionados a sessões
 */
export const useInvalidateSessions = () => {
  const queryClient = useQueryClient();

  const invalidateSessions = () => {
    queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
  };

  const invalidateSession = (id: string) => {
    queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY(id) });
  };

  const invalidatePatientSessions = (patientId: string) => {
    queryClient.invalidateQueries({ queryKey: PATIENT_SESSIONS_KEY(patientId) });
  };

  return {
    invalidateSessions,
    invalidateSession,
    invalidatePatientSessions,
  };
};
