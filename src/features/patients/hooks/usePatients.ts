/**
 * Hook refatorado para gestão de pacientes
 * Utiliza a camada de serviços para separação de responsabilidades
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { patientsService, Patient, PatientStats } from '../services/patients.service';
import { PatientCreateInput, PatientUpdateInput, PatientsSearchInput } from '@/shared/schemas/validation.schemas';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, PATIENT_STATUS } from '@/shared/constants/app.constants';

// Query keys para cache
export const PATIENTS_QUERY_KEYS = {
  all: ['patients'] as const,
  lists: () => [...PATIENTS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: PatientsSearchInput) => [...PATIENTS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...PATIENTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PATIENTS_QUERY_KEYS.details(), id] as const,
  stats: () => [...PATIENTS_QUERY_KEYS.all, 'stats'] as const,
  recent: (days: number) => [...PATIENTS_QUERY_KEYS.all, 'recent', days] as const,
};

interface UsePatientsOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
}

export const usePatients = (filters: PatientsSearchInput = {}, options: UsePatientsOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { enabled = true, refetchOnMount = true } = options;

  // Query para listar pacientes
  const {
    data: patientsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: PATIENTS_QUERY_KEYS.list(filters),
    queryFn: async () => {
      if (!user?.id) throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      const result = await patientsService.getPatients(user.id, filters);
      if (!result.success) throw new Error(result.error || ERROR_MESSAGES.SERVER_ERROR);
      return result;
    },
    enabled: enabled && !!user?.id,
    refetchOnMount
  });

  const patients = patientsData?.data || [];
  const stats = patientsData?.stats;
  const hasMore = patientsData?.hasMore || false;
  const totalCount = patientsData?.count || 0;

  // Mutation para criar paciente
  const createPatientMutation = useMutation({
    mutationFn: async (data: PatientCreateInput) => {
      if (!user?.id) throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      const result = await patientsService.createPatient(data, user.id);
      if (!result.success) throw new Error(result.error || ERROR_MESSAGES.SERVER_ERROR);
      return result.data;
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.CREATED);
      queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Mutation para atualizar paciente
  const updatePatientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PatientUpdateInput }) => {
      if (!user?.id) throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      const result = await patientsService.updatePatient(id, data, user.id);
      if (!result.success) throw new Error(result.error || ERROR_MESSAGES.SERVER_ERROR);
      return result.data;
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.UPDATED);
      queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Mutation para deletar paciente
  const deletePatientMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      const result = await patientsService.deletePatient(id, user.id);
      if (!result.success) throw new Error(result.error || ERROR_MESSAGES.SERVER_ERROR);
      return id;
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.DELETED);
      queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Mutation para alterar status
  const changeStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: keyof typeof PATIENT_STATUS }) => {
      if (!user?.id) throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      const result = await patientsService.changePatientStatus(id, status, user.id);
      if (!result.success) throw new Error(result.error || ERROR_MESSAGES.SERVER_ERROR);
      return result.data;
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.UPDATED);
      queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Funções de conveniência
  const createPatient = useCallback((data: PatientCreateInput) => {
    return createPatientMutation.mutateAsync(data);
  }, [createPatientMutation]);

  const updatePatient = useCallback((id: string, data: PatientUpdateInput) => {
    return updatePatientMutation.mutateAsync({ id, data });
  }, [updatePatientMutation]);

  const deletePatient = useCallback((id: string) => {
    return deletePatientMutation.mutateAsync(id);
  }, [deletePatientMutation]);

  const changePatientStatus = useCallback((id: string, status: keyof typeof PATIENT_STATUS) => {
    return changeStatusMutation.mutateAsync({ id, status });
  }, [changeStatusMutation]);

  // Funções de busca local (para evitar requisições desnecessárias)
  const searchPatients = useCallback((term: string): Patient[] => {
    if (!term.trim()) return patients;
    const searchTerm = term.toLowerCase();
    return patients.filter(patient =>
      patient.full_name.toLowerCase().includes(searchTerm) ||
      patient.email?.toLowerCase().includes(searchTerm) ||
      patient.phone?.includes(searchTerm) ||
      patient.notes?.toLowerCase().includes(searchTerm)
    );
  }, [patients]);

  const getPatientsByStatus = useCallback((status: keyof typeof PATIENT_STATUS): Patient[] => {
    const statusValue = PATIENT_STATUS[status];
    return patients.filter(patient => patient.status === statusValue);
  }, [patients]);

  // Estados de loading das mutações
  const isCreating = createPatientMutation.isPending;
  const isUpdating = updatePatientMutation.isPending;
  const isDeleting = deletePatientMutation.isPending;
  const isChangingStatus = changeStatusMutation.isPending;
  const isMutating = isCreating || isUpdating || isDeleting || isChangingStatus;

  return {
    // Dados
    patients,
    stats,
    totalCount,
    hasMore,
    
    // Estados
    isLoading,
    error: error?.message || null,
    isCreating,
    isUpdating,
    isDeleting,
    isChangingStatus,
    isMutating,
    
    // Ações
    createPatient,
    updatePatient,
    deletePatient,
    changePatientStatus,
    refetch,
    
    // Utilitários
    searchPatients,
    getPatientsByStatus,
    
    // Shortcuts para refetch
    refetchPatients: refetch
  };
};

// Hook para buscar um paciente específico
export const usePatient = (patientId: string, options: UsePatientsOptions = {}) => {
  const { user } = useAuth();
  const { enabled = true } = options;

  return useQuery({
    queryKey: PATIENTS_QUERY_KEYS.detail(patientId),
    queryFn: async () => {
      if (!user?.id) throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      const result = await patientsService.getPatient(patientId, user.id);
      if (!result.success) throw new Error(result.error || ERROR_MESSAGES.SERVER_ERROR);
      return result.data;
    },
    enabled: enabled && !!user?.id && !!patientId
  });
};

// Hook para pacientes recentes
export const useRecentPatients = (days: number = 30, limit: number = 5) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: PATIENTS_QUERY_KEYS.recent(days),
    queryFn: async () => {
      if (!user?.id) throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      const result = await patientsService.getRecentPatients(user.id, days, limit);
      if (!result.success) throw new Error(result.error || ERROR_MESSAGES.SERVER_ERROR);
      return result.data || [];
    },
    enabled: !!user?.id
  });
};

// Hook para estatísticas dos pacientes
export const usePatientsStats = () => {
  const { stats, isLoading } = usePatients({}, { enabled: true });
  
  return {
    stats,
    isLoading
  };
};

// Tipos exportados
export type { Patient, PatientStats };