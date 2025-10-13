import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Record {
  id: string;
  patient_id: string;
  therapist_id: string;
  session_date: string;
  session_number?: number;
  description: string;
  keywords: string[];
  observations?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  patient?: {
    id: string;
    full_name: string;
  };
}

export const useRecords = (patientId?: string) => {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRecords = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from("records")
        .select(`
          *,
          patient:patients(
            id,
            full_name
          )
        `)
        .eq("therapist_id", user.id)
        .order("created_at", { ascending: false });

      // Filter by patient if specified
      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error("Erro ao buscar registros:", fetchError);
        setError(fetchError.message);
        toast.error("Erro ao carregar registros");
        return;
      }

      setRecords(data || []);
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado ao carregar registros");
      toast.error("Erro inesperado ao carregar registros");
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (recordId: string) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      // First, delete related assessments
      const { error: assessmentError } = await supabase
        .from("patient_assessments")
        .delete()
        .eq("session_id", recordId);

      if (assessmentError) {
        console.error("Erro ao deletar avaliações da sessão:", assessmentError);
        // Continue anyway, as assessments might not exist
      }

      // Delete the record
      const { error } = await supabase
        .from("records")
        .delete()
        .eq("id", recordId)
        .eq("therapist_id", user.id);

      if (error) {
        console.error("Erro ao deletar sessão:", error);
        toast.error("Erro ao deletar sessão");
        return false;
      }

      toast.success("Sessão deletada com sucesso");
      // Remove record from local state
      setRecords(prev => prev.filter(r => r.id !== recordId));
      return true;
    } catch (err) {
      console.error("Erro inesperado ao deletar sessão:", err);
      toast.error("Erro inesperado ao deletar sessão");
      return false;
    }
  };

  const updateRecord = async (recordId: string, updates: Partial<Record>) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("records")
        .update(updates)
        .eq("id", recordId)
        .eq("therapist_id", user.id)
        .select(`
          *,
          patient:patients(
            id,
            full_name
          )
        `)
        .single();

      if (error) {
        console.error("Erro ao atualizar registro:", error);
        toast.error("Erro ao atualizar registro");
        return false;
      }

      toast.success("Registro atualizado com sucesso");
      // Update record in local state
      setRecords(prev => prev.map(r => r.id === recordId ? { ...r, ...data } : r));
      return true;
    } catch (err) {
      console.error("Erro inesperado ao atualizar:", err);
      toast.error("Erro inesperado ao atualizar registro");
      return false;
    }
  };

  const createRecord = async (recordData: Omit<Record, 'id' | 'therapist_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("records")
        .insert({
          ...recordData,
          therapist_id: user.id
        })
        .select(`
          *,
          patient:patients(
            id,
            full_name
          )
        `)
        .single();

      if (error) {
        console.error("Erro ao criar registro:", error);
        toast.error("Erro ao criar registro");
        return null;
      }

      toast.success("Registro criado com sucesso");
      // Add record to local state
      setRecords(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error("Erro inesperado ao criar registro:", err);
      toast.error("Erro inesperado ao criar registro");
      return null;
    }
  };

  const searchRecords = (searchTerm: string): Record[] => {
    if (!searchTerm.trim()) {
      return records;
    }

    const term = searchTerm.toLowerCase();
    return records.filter(record => 
      record.description.toLowerCase().includes(term) ||
      record.observations?.toLowerCase().includes(term) ||
      record.keywords.some(keyword => keyword.toLowerCase().includes(term)) ||
      record.patient?.full_name.toLowerCase().includes(term)
    );
  };

  const getRecordsByKeyword = (keyword: string): Record[] => {
    return records.filter(record => 
      record.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
    );
  };

  const getRecordsByPatient = (patientId: string): Record[] => {
    return records.filter(record => record.patient_id === patientId);
  };

  const getAllKeywords = (): string[] => {
    const keywordSet = new Set<string>();
    records.forEach(record => {
      record.keywords.forEach(keyword => keywordSet.add(keyword));
    });
    return Array.from(keywordSet).sort();
  };

  const getKeywordFrequency = (): { keyword: string; count: number }[] => {
    const frequency: { [key: string]: number } = {};
    
    records.forEach(record => {
      record.keywords.forEach(keyword => {
        frequency[keyword] = (frequency[keyword] || 0) + 1;
      });
    });

    return Object.entries(frequency)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count);
  };

  const getRecordStats = () => {
    const total = records.length;
    const uniquePatients = new Set(records.map(r => r.patient_id)).size;
    const totalKeywords = getAllKeywords().length;
    const avgKeywordsPerRecord = total > 0 ? records.reduce((sum, r) => sum + r.keywords.length, 0) / total : 0;

    return {
      total,
      uniquePatients,
      totalKeywords,
      avgKeywordsPerRecord: Math.round(avgKeywordsPerRecord * 10) / 10,
    };
  };

  // Fetch records when user or patientId changes
  useEffect(() => {
    fetchRecords();
  }, [user?.id, patientId]);

  return {
    records,
    loading,
    error,
    fetchRecords,
    createRecord,
    deleteRecord,
    updateRecord,
    searchRecords,
    getRecordsByKeyword,
    getRecordsByPatient,
    getAllKeywords,
    getKeywordFrequency,
    getRecordStats,
    refetch: fetchRecords,
  };
};