/**
 * Hook para gerenciar pacientes
 * Atualizado para usar apenas campos que existem no schema atual
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { handleError, withRetry } from "@/lib/error-handler";
import type { Tables } from "@/integrations/supabase/types";

// Usar tipos gerados para evitar drift com o schema
export type Patient = Tables<'patients'>;

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPatients = async () => {
    if (!user?.id) { 
      setLoading(false); 
      return; 
    }
    
    try {
      setLoading(true); 
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('patients')
        .select('*')
        .eq('therapist_id', user.id)
        .order('created_at', { ascending: false });
        
      if (fetchError) {
        console.error('Erro ao buscar pacientes:', fetchError);
        throw fetchError;
      }
      
      console.log('Pacientes carregados:', data?.length || 0);
      setPatients((data as Patient[]) || []);
    } catch (err: any) {
      console.error('Erro inesperado ao carregar pacientes:', err);
      const appError = handleError(err, {
        context: 'usePatients.fetchPatients',
        userId: user?.id
      });
      setError(appError.message);
    } finally { 
      setLoading(false); 
    }
  };

  const deletePatient = async (patientId: string) => {
    if (!user?.id) { 
      toast.error('Usuário não autenticado'); 
      return false; 
    }
    
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId)
        .eq('therapist_id', user.id);
        
      if (error) {
        console.error('Erro ao deletar paciente:', error);
        throw error;
      }
      
      toast.success('Paciente deletado com sucesso');
      setPatients(prev => prev.filter(p => p.id !== patientId));
      return true;
    } catch (err: any) {
      handleError(err, {
        context: 'usePatients.deletePatient',
        patientId,
        userId: user?.id
      });
      return false;
    }
  };

  const updatePatient = async (patientId: string, updates: Partial<Patient>) => {
    if (!user?.id) { 
      toast.error('Usuário não autenticado'); 
      return false; 
    }
    
    try {
      // Remove campos que não devem ser atualizados
      const { id, created_at, updated_at, ...safeUpdates } = updates;
      
      console.log('Atualizando paciente:', patientId, 'com dados:', safeUpdates);
      
      const { data, error } = await supabase
        .from('patients')
        .update(safeUpdates)
        .eq('id', patientId)
        .eq('therapist_id', user.id)
        .select()
        .single();
        
      if (error) { 
        console.error('Erro ao atualizar paciente:', error);
        throw error;
      }
      
      console.log('Paciente atualizado com sucesso:', data);
      toast.success('Paciente atualizado com sucesso');
      setPatients(prev => prev.map(p => p.id === patientId ? { ...p, ...(data as Patient) } : p));
      return true;
    } catch (err: any) {
      handleError(err, {
        context: 'usePatients.updatePatient',
        patientId,
        updates,
        userId: user?.id
      });
      return false;
    }
  };

  const createPatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return null;
    }
    
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
        console.error('Erro ao criar paciente:', error);
        throw error;
      }
      
      console.log('Paciente criado com sucesso:', data);
      toast.success('Paciente criado com sucesso');
      setPatients(prev => [data as Patient, ...prev]);
      return data as Patient;
    } catch (err: any) {
      handleError(err, {
        context: 'usePatients.createPatient',
        patientData: { ...patientData, full_name: '[REDACTED]' },
        userId: user?.id
      });
      return null;
    }
  };

  // Utilitários de filtragem e busca
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

  const getPatientsByStatus = (status: NonNullable<Patient['status']>) => 
    patients.filter(p => p.status === status);

  const getPatientStats = () => {
    const total = patients.length;
    const active = patients.filter(p => p.status === 'active').length;
    const inactive = patients.filter(p => p.status === 'inactive').length;
    const discharged = patients.filter(p => p.status === 'discharged').length;
    const withoutStatus = patients.filter(p => !p.status).length;
    
    return { 
      total, 
      active, 
      inactive, 
      discharged, 
      withoutStatus 
    };
  };

  // Função para validar dados do paciente
  const validatePatientData = (data: Partial<Patient>) => {
    const errors: string[] = [];
    
    if (!data.full_name?.trim()) {
      errors.push('Nome completo é obrigatório');
    }
    
    if (data.full_name && data.full_name.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }
    
    if (data.email && data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email inválido');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  useEffect(() => { 
    fetchPatients(); 
  }, [user?.id]);

  return { 
    patients, 
    loading, 
    error, 
    fetchPatients, 
    createPatient,
    deletePatient, 
    updatePatient, 
    searchPatients, 
    getPatientsByStatus, 
    getPatientStats,
    validatePatientData,
    refetch: fetchPatients 
  };
};