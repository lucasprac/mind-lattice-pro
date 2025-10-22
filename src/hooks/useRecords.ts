import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type RecordRow = Tables<'records'>;

export const useRecords = (patientId?: string) => {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRecords = async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      setLoading(true); setError(null);
      let query = supabase
        .from('records')
        .select(`*, patient:patients(id, full_name)`) // FK join
        .eq('therapist_id', user.id)
        .order('created_at', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);
      const { data, error: fetchError } = await query;
      if (fetchError) { setError(fetchError.message); toast.error('Erro ao carregar registros'); return; }
      setRecords((data as any) || []);
    } catch { setError('Erro inesperado ao carregar registros'); toast.error('Erro inesperado ao carregar registros'); }
    finally { setLoading(false); }
  };

  const deleteRecord = async (recordId: string) => {
    if (!user?.id) { toast.error('Usuário não autenticado'); return false; }
    const { error } = await supabase.from('records').delete().eq('id', recordId).eq('therapist_id', user.id);
    if (error) { toast.error('Erro ao deletar registro'); return false; }
    toast.success('Registro deletado com sucesso'); setRecords(prev => prev.filter(r => r.id !== recordId)); return true;
  };

  const updateRecord = async (recordId: string, updates: Partial<RecordRow>) => {
    if (!user?.id) { toast.error('Usuário não autenticado'); return false; }
    const { id, created_at, updated_at, ...safe } = updates as any;
    const { data, error } = await supabase
      .from('records')
      .update(safe)
      .eq('id', recordId)
      .eq('therapist_id', user.id)
      .select(`*, patient:patients(id, full_name)`).single();
    if (error) { toast.error('Erro ao atualizar registro'); return false; }
    toast.success('Registro atualizado com sucesso');
    setRecords(prev => prev.map(r => r.id === recordId ? { ...r, ...(data as any) } : r));
    return true;
  };

  const searchRecords = (searchTerm: string) => {
    const term = searchTerm.trim().toLowerCase(); if (!term) return records;
    return records.filter(r =>
      r.description.toLowerCase().includes(term) ||
      r.observations?.toLowerCase().includes(term) ||
      (r.keywords || []).some(k => k.toLowerCase().includes(term)) ||
      (r as any).patient?.full_name.toLowerCase().includes(term)
    );
  };

  const getRecordsByKeyword = (keyword: string) => records.filter(r => (r.keywords || []).some(k => k.toLowerCase().includes(keyword.toLowerCase())));
  const getRecordsByPatient = (pid: string) => records.filter(r => r.patient_id === pid);
  const getAllKeywords = () => Array.from(new Set(records.flatMap(r => r.keywords || []))).sort();
  const getKeywordFrequency = () => Object.entries(records.flatMap(r => r.keywords || []).reduce((acc: Record<string, number>, k) => ({...acc, [k]: (acc[k]||0)+1}), {})).map(([keyword, count]) => ({ keyword, count: count as number})).sort((a,b)=>b.count-a.count);
  const getRecordStats = () => {
    const total = records.length; const uniquePatients = new Set(records.map(r => r.patient_id)).size;
    const totalKeywords = getAllKeywords().length; const avg = total ? records.reduce((s,r)=>s + (r.keywords?.length||0),0)/total : 0;
    return { total, uniquePatients, totalKeywords, avgKeywordsPerRecord: Math.round(avg*10)/10 };
  };

  useEffect(() => { fetchRecords(); }, [user?.id, patientId]);

  return { records, loading, error, fetchRecords, deleteRecord, updateRecord, searchRecords, getRecordsByKeyword, getRecordsByPatient, getAllKeywords, getKeywordFrequency, getRecordStats, refetch: fetchRecords };
};
