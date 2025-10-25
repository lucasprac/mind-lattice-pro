/**
 * Hook para gerenciar redes de processos dos pacientes
 * Corrigido para usar a tabela patient_networks do schema atual
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { handleError, withRetry } from "@/lib/error-handler";
import type { Tables, Json } from "@/integrations/supabase/types";

// Tipo baseado na tabela patient_networks existente
type NetworkRow = Tables<'patient_networks'> & { 
  patient?: { 
    id: string; 
    full_name: string; 
  } 
};

export type Network = NetworkRow;

export const useNetworks = (patientId?: string) => {
  const [networks, setNetworks] = useState<NetworkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNetworks = async () => {
    if (!user?.id) { 
      setLoading(false); 
      return; 
    }
    
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('patient_networks')
        .select(`
          *,
          patient:patients(
            id,
            full_name
          )
        `)
        .eq('therapist_id', user.id)
        .order('created_at', { ascending: false });
        
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        throw fetchError;
      }
      
      console.log('Redes carregadas:', data?.length || 0);
      setNetworks((data as any) || []);
    } catch (err) {
      const appError = handleError(err, {
        context: 'useNetworks.fetchNetworks',
        userId: user?.id,
        patientId
      });
      setError(appError.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteNetwork = async (networkId: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('patient_networks')
        .delete()
        .eq('id', networkId)
        .eq('therapist_id', user.id);
        
      if (error) {
        throw error;
      }
      
      toast.success('Rede deletada com sucesso');
      setNetworks(prev => prev.filter(n => n.id !== networkId));
      return true;
    } catch (err) {
      handleError(err, {
        context: 'useNetworks.deleteNetwork',
        networkId,
        userId: user?.id
      });
      return false;
    }
  };

  const updateNetwork = async (networkId: string, updates: Partial<NetworkRow>): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }
    
    try {
      // Remove campos que não devem ser atualizados
      const { id, created_at, updated_at, patient, ...safeUpdates } = updates as any;
      
      const { data, error } = await supabase
        .from('patient_networks')
        .update(safeUpdates)
        .eq('id', networkId)
        .eq('therapist_id', user.id)
        .select(`
          *,
          patient:patients(
            id,
            full_name
          )
        `)
        .single();
        
      if (error) {
        throw error;
      }
      
      toast.success('Rede atualizada com sucesso');
      setNetworks(prev => prev.map(n => n.id === networkId ? { ...n, ...(data as any) } : n));
      return true;
    } catch (err) {
      handleError(err, {
        context: 'useNetworks.updateNetwork',
        networkId,
        updates,
        userId: user?.id
      });
      return false;
    }
  };

  const duplicateNetwork = async (network: NetworkRow, newName?: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('patient_networks')
        .insert({
          therapist_id: user.id,
          patient_id: network.patient_id,
          network_data: network.network_data,
          analysis_date: new Date().toISOString(),
          notes: `Cópia de: ${network.notes || 'Sem observações'}\n\nNome da rede: ${newName || `${network.notes} (Cópia)`}`
        });
        
      if (error) {
        throw error;
      }
      
      toast.success('Rede duplicada com sucesso');
      await fetchNetworks();
      return true;
    } catch (err) {
      handleError(err, {
        context: 'useNetworks.duplicateNetwork',
        network: { id: network.id, patient_id: network.patient_id },
        newName,
        userId: user?.id
      });
      return false;
    }
  };

  const createNetwork = async (networkData: {
    patient_id: string;
    network_data: Json;
    notes?: string;
  }): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('patient_networks')
        .insert({
          therapist_id: user.id,
          patient_id: networkData.patient_id,
          network_data: networkData.network_data,
          analysis_date: new Date().toISOString(),
          notes: networkData.notes || null
        });
        
      if (error) {
        throw error;
      }
      
      toast.success('Rede criada com sucesso!');
      await fetchNetworks();
      return true;
    } catch (err) {
      handleError(err, {
        context: 'useNetworks.createNetwork',
        networkData,
        userId: user?.id
      });
      return false;
    }
  };

  // Utilitários de filtragem e busca
  const searchNetworks = (searchTerm: string) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return networks;
    
    return networks.filter(n => 
      n.notes?.toLowerCase().includes(term) ||
      n.patient?.full_name.toLowerCase().includes(term)
    );
  };

  const getNetworksByPatient = (pid: string) => 
    networks.filter(n => n.patient_id === pid);

  const getNetworkStats = () => {
    const total = networks.length;
    const uniquePatients = new Set(networks.map(n => n.patient_id)).size;
    
    let totalNodes = 0;
    let totalConnections = 0;
    const allDimensions = new Set<string>();
    const allLevels = new Set<string>();
    
    networks.forEach((network: any) => {
      const networkData = network.network_data || {};
      const nodes = networkData.nodes || [];
      const connections = networkData.connections || [];
      
      totalNodes += nodes.length;
      totalConnections += connections.length;
      
      nodes.forEach((node: any) => {
        if (node.dimension) allDimensions.add(node.dimension);
        if (node.level) allLevels.add(node.level);
      });
    });
    
    const avgNodesPerNetwork = total ? Math.round((totalNodes / total) * 10) / 10 : 0;
    const avgConnectionsPerNetwork = total ? Math.round((totalConnections / total) * 10) / 10 : 0;
    
    return {
      total,
      uniquePatients,
      totalNodes,
      totalConnections,
      avgNodesPerNetwork,
      avgConnectionsPerNetwork,
      dimensionsUsed: allDimensions.size,
      levelsUsed: allLevels.size
    };
  };

  const getComplexityAnalysis = () => {
    return networks.map((network: any) => {
      const networkData = network.network_data || {};
      const nodes = networkData.nodes || [];
      const connections = networkData.connections || [];
      
      const dimensionsUsed = new Set(nodes.map((n: any) => n.dimension)).size;
      const levelsUsed = new Set(nodes.map((n: any) => n.level)).size;
      
      const avgIntensity = nodes.length ? 
        nodes.reduce((sum: number, node: any) => sum + (node.intensity || 0), 0) / nodes.length : 0;
      
      const avgFrequency = nodes.length ? 
        nodes.reduce((sum: number, node: any) => sum + (node.frequency || 0), 0) / nodes.length : 0;
      
      const maxPossibleConnections = nodes.length * (nodes.length - 1);
      const density = maxPossibleConnections ? connections.length / maxPossibleConnections : 0;
      
      return {
        networkId: network.id,
        networkName: network.notes || 'Rede sem nome',
        patientName: network.patient?.full_name || 'Paciente não encontrado',
        complexity: {
          nodes: nodes.length,
          connections: connections.length,
          density: Math.round(density * 100) / 100,
          dimensionsUsed,
          levelsUsed,
          avgIntensity: Math.round(avgIntensity * 10) / 10,
          avgFrequency: Math.round(avgFrequency * 10) / 10
        }
      };
    });
  };

  const exportNetwork = (network: any) => {
    const exportData = {
      network_info: {
        id: network.id,
        patient: network.patient?.full_name,
        analysis_date: network.analysis_date,
        notes: network.notes,
        created_at: network.created_at
      },
      network_data: network.network_data,
      metadata: {
        exported_at: new Date().toISOString(),
        exported_by: user?.email,
        version: '1.0'
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rede_${network.patient?.full_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown'}_${network.id}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Rede exportada com sucesso');
  };

  useEffect(() => {
    fetchNetworks();
  }, [user?.id, patientId]);

  return {
    networks,
    loading,
    error,
    fetchNetworks,
    createNetwork,
    deleteNetwork,
    updateNetwork,
    duplicateNetwork,
    searchNetworks,
    getNetworksByPatient,
    getNetworkStats,
    getComplexityAnalysis,
    exportNetwork,
    refetch: fetchNetworks
  };
};