import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Tables, Json } from "@/integrations/supabase/types";

type NetworkRow = Tables<'networks'> & { patient?: { id: string; full_name: string } };

export const useNetworks = (patientId?: string) => {
  const [networks, setNetworks] = useState<NetworkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNetworks = async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      setLoading(true); setError(null);
      let query = supabase
        .from('networks')
        .select(`*, patient:patients(id, full_name)`) // FK join
        .eq('therapist_id', user.id)
        .order('created_at', { ascending: false });
      if (patientId) query = query.eq('patient_id', patientId);
      const { data, error: fetchError } = await query;
      if (fetchError) { setError(fetchError.message); toast.error('Erro ao carregar redes'); return; }
      setNetworks((data as any) || []);
    } catch { setError('Erro inesperado ao carregar redes'); toast.error('Erro inesperado ao carregar redes'); }
    finally { setLoading(false); }
  };

  const deleteNetwork = async (networkId: string) => {
    if (!user?.id) { toast.error('Usuário não autenticado'); return false; }
    const { error } = await supabase.from('networks').delete().eq('id', networkId).eq('therapist_id', user.id);
    if (error) { toast.error('Erro ao deletar rede'); return false; }
    toast.success('Rede deletada com sucesso'); setNetworks(prev => prev.filter(n => n.id !== networkId)); return true;
  };

  const updateNetwork = async (networkId: string, updates: Partial<NetworkRow>) => {
    if (!user?.id) { toast.error('Usuário não autenticado'); return false; }
    const { id, created_at, updated_at, patient, ...safe } = updates as any;
    const { data, error } = await supabase
      .from('networks')
      .update(safe)
      .eq('id', networkId)
      .eq('therapist_id', user.id)
      .select(`*, patient:patients(id, full_name)`).single();
    if (error) { toast.error('Erro ao atualizar rede'); return false; }
    toast.success('Rede atualizada com sucesso'); setNetworks(prev => prev.map(n => n.id === networkId ? { ...n, ...(data as any) } : n)); return true;
  };

  const duplicateNetwork = async (network: NetworkRow, newName?: string) => {
    if (!user?.id) { toast.error('Usuário não autenticado'); return false; }
    const { error } = await supabase.from('networks').insert({
      therapist_id: user.id,
      patient_id: network.patient_id,
      name: newName || `${network.name} (Cópia)`,
      description: network.description ?? null,
      network_data: (network.network_data as Json) ?? {},
      version: 1,
    } as any);
    if (error) { toast.error('Erro ao duplicar rede'); return false; }
    toast.success('Rede duplicada com sucesso'); fetchNetworks(); return true;
  };

  const searchNetworks = (searchTerm: string) => {
    const term = searchTerm.trim().toLowerCase(); if (!term) return networks;
    return networks.filter(n => n.name.toLowerCase().includes(term) || n.description?.toLowerCase().includes(term) || n.patient?.full_name.toLowerCase().includes(term));
  };

  const getNetworksByPatient = (pid: string) => networks.filter(n => n.patient_id === pid);
  const getNetworksByVersion = (version: number) => networks.filter(n => n.version === version);
  const getNetworkStats = () => {
    const total = networks.length; const uniquePatients = new Set(networks.map(n => n.patient_id)).size;
    const totalNodes = networks.reduce((s, n: any) => s + ((n.network_data?.nodes || []).length), 0);
    const totalConnections = networks.reduce((s, n: any) => s + ((n.network_data?.connections || []).length), 0);
    const avgNodesPerNetwork = total ? totalNodes / total : 0; const avgConnectionsPerNetwork = total ? totalConnections / total : 0;
    const allDimensions = new Set<string>(); const allLevels = new Set<string>();
    networks.forEach((n: any) => {
      (n.network_data?.nodes || []).forEach((node: any) => { if (node.dimension) allDimensions.add(node.dimension); if (node.level) allLevels.add(node.level); });
    });
    return { total, uniquePatients, totalNodes, totalConnections, avgNodesPerNetwork: Math.round(avgNodesPerNetwork*10)/10, avgConnectionsPerNetwork: Math.round(avgConnectionsPerNetwork*10)/10, dimensionsUsed: allDimensions.size, levelsUsed: allLevels.size };
  };

  const getComplexityAnalysis = () => networks.map((n: any) => {
    const nodes = n.network_data?.nodes || []; const connections = n.network_data?.connections || [];
    const dimensionsUsed = new Set(nodes.map((x: any) => x.dimension)).size;
    const levelsUsed = new Set(nodes.map((x: any) => x.level)).size;
    const avgIntensity = nodes.length ? nodes.reduce((sum: number, x: any) => sum + (x.intensity || 0), 0) / nodes.length : 0;
    const avgFrequency = nodes.length ? nodes.reduce((sum: number, x: any) => sum + (x.frequency || 0), 0) / nodes.length : 0;
    const maxPossibleConnections = nodes.length * (nodes.length - 1); const density = maxPossibleConnections ? connections.length / maxPossibleConnections : 0;
    return { networkId: n.id, networkName: n.name, patientName: n.patient?.full_name, complexity: { nodes: nodes.length, connections: connections.length, density: Math.round(density*100)/100, dimensionsUsed, levelsUsed, avgIntensity: Math.round(avgIntensity*10)/10, avgFrequency: Math.round(avgFrequency*10)/10 } };
  });

  const exportNetwork = (n: any) => {
    const exportData = { network_info: { name: n.name, description: n.description, patient: n.patient?.full_name, version: n.version, created_at: n.created_at }, network_data: n.network_data, metadata: { exported_at: new Date().toISOString(), exported_by: user?.email } };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${n.name.replace(/[^a-zA-Z0-9]/g, '_')}_network.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast.success('Rede exportada com sucesso');
  };

  useEffect(() => { fetchNetworks(); }, [user?.id, patientId]);

  return { networks, loading, error, fetchNetworks, deleteNetwork, updateNetwork, duplicateNetwork, searchNetworks, getNetworksByPatient, getNetworksByVersion, getNetworkStats, getComplexityAnalysis, exportNetwork, refetch: fetchNetworks };
};
