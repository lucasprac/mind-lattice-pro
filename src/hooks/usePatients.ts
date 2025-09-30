import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Patient {
  id: string;
  therapist_id: string;
  full_name: string;
  birth_date?: string;
  email?: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
  status: "active" | "inactive" | "discharged";
  created_at: string;
  updated_at: string;
}

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
        .from("patients")
        .select("*")
        .eq("therapist_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Erro ao buscar pacientes:", fetchError);
        setError(fetchError.message);
        toast.error("Erro ao carregar pacientes");
        return;
      }

      setPatients(data || []);
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado ao carregar pacientes");
      toast.error("Erro inesperado ao carregar pacientes");
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async (patientId: string) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      const { error } = await supabase
        .from("patients")
        .delete()
        .eq("id", patientId)
        .eq("therapist_id", user.id);

      if (error) {
        console.error("Erro ao deletar paciente:", error);
        toast.error("Erro ao deletar paciente");
        return false;
      }

      toast.success("Paciente deletado com sucesso");
      // Remove patient from local state
      setPatients(prev => prev.filter(p => p.id !== patientId));
      return true;
    } catch (err) {
      console.error("Erro inesperado ao deletar:", err);
      toast.error("Erro inesperado ao deletar paciente");
      return false;
    }
  };

  const updatePatient = async (patientId: string, updates: Partial<Patient>) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("patients")
        .update(updates)
        .eq("id", patientId)
        .eq("therapist_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar paciente:", error);
        toast.error("Erro ao atualizar paciente");
        return false;
      }

      toast.success("Paciente atualizado com sucesso");
      // Update patient in local state
      setPatients(prev => prev.map(p => p.id === patientId ? { ...p, ...data } : p));
      return true;
    } catch (err) {
      console.error("Erro inesperado ao atualizar:", err);
      toast.error("Erro inesperado ao atualizar paciente");
      return false;
    }
  };

  const searchPatients = (searchTerm: string): Patient[] => {
    if (!searchTerm.trim()) {
      return patients;
    }

    const term = searchTerm.toLowerCase();
    return patients.filter(patient => 
      patient.full_name.toLowerCase().includes(term) ||
      patient.email?.toLowerCase().includes(term) ||
      patient.phone?.includes(term) ||
      patient.notes?.toLowerCase().includes(term)
    );
  };

  const getPatientsByStatus = (status: Patient['status']): Patient[] => {
    return patients.filter(patient => patient.status === status);
  };

  const getPatientStats = () => {
    const total = patients.length;
    const active = patients.filter(p => p.status === 'active').length;
    const inactive = patients.filter(p => p.status === 'inactive').length;
    const discharged = patients.filter(p => p.status === 'discharged').length;

    return {
      total,
      active,
      inactive,
      discharged,
    };
  };

  // Fetch patients when user changes
  useEffect(() => {
    fetchPatients();
  }, [user?.id]);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    deletePatient,
    updatePatient,
    searchPatients,
    getPatientsByStatus,
    getPatientStats,
    refetch: fetchPatients,
  };
};