import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Network {
  id: string;
  patient_id: string;
  therapist_id: string;
  name: string;
  description?: string;
  network_data: {
    nodes: any[];
    connections: any[];
    metadata?: {
      created_at: string;
      total_nodes: number;
      total_connections: number;
      dimensions_used: string[];
      levels_used: string[];
    };
  };
  version: number;
  created_at: string;
  updated_at: string;
  // Joined data
  patient?: {
    id: string;
    full_name: string;
  };
}

export const useNetworks = (patientId?: string) => {
  const [networks, setNetworks] = useState<Network[]>([]);
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
        .from("networks")
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
        console.error("Erro ao buscar redes:", fetchError);
        setError(fetchError.message);
        toast.error("Erro ao carregar redes");
        return;
      }

      setNetworks(data || []);
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado ao carregar redes");
      toast.error("Erro inesperado ao carregar redes");
    } finally {
      setLoading(false);
    }
  };

  const deleteNetwork = async (networkId: string) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      const { error } = await supabase
        .from("networks")
        .delete()
        .eq("id", networkId)
        .eq("therapist_id", user.id);

      if (error) {
        console.error("Erro ao deletar rede:", error);
        toast.error("Erro ao deletar rede");
        return false;
      }

      toast.success("Rede deletada com sucesso");
      // Remove network from local state
      setNetworks(prev => prev.filter(n => n.id !== networkId));
      return true;
    } catch (err) {
      console.error("Erro inesperado ao deletar:", err);
      toast.error("Erro inesperado ao deletar rede");
      return false;
    }
  };

  const updateNetwork = async (networkId: string, updates: Partial<Network>) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("networks")
        .update(updates)
        .eq("id", networkId)
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
        console.error("Erro ao atualizar rede:", error);
        toast.error("Erro ao atualizar rede");
        return false;
      }

      toast.success("Rede atualizada com sucesso");
      // Update network in local state
      setNetworks(prev => prev.map(n => n.id === networkId ? { ...n, ...data } : n));
      return true;
    } catch (err) {
      console.error("Erro inesperado ao atualizar:", err);
      toast.error("Erro inesperado ao atualizar rede");
      return false;
    }
  };

  const duplicateNetwork = async (network: Network, newName?: string) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      const { error } = await supabase.from("networks").insert({
        therapist_id: user.id,
        patient_id: network.patient_id,
        name: newName || `${network.name} (Cópia)`,
        description: network.description,
        network_data: network.network_data,
        version: 1,
      });

      if (error) {
        console.error("Erro ao duplicar rede:", error);
        toast.error("Erro ao duplicar rede");
        return false;
      }

      toast.success("Rede duplicada com sucesso");
      fetchNetworks(); // Refresh the list
      return true;
    } catch (err) {
      console.error("Erro inesperado ao duplicar:", err);
      toast.error("Erro inesperado ao duplicar rede");
      return false;
    }
  };

  const searchNetworks = (searchTerm: string): Network[] => {
    if (!searchTerm.trim()) {
      return networks;
    }

    const term = searchTerm.toLowerCase();
    return networks.filter(network => 
      network.name.toLowerCase().includes(term) ||
      network.description?.toLowerCase().includes(term) ||
      network.patient?.full_name.toLowerCase().includes(term)
    );
  };

  const getNetworksByPatient = (patientId: string): Network[] => {
    return networks.filter(network => network.patient_id === patientId);
  };

  const getNetworksByVersion = (version: number): Network[] => {
    return networks.filter(network => network.version === version);
  };

  const getNetworkStats = () => {
    const total = networks.length;
    const uniquePatients = new Set(networks.map(n => n.patient_id)).size;
    const totalNodes = networks.reduce((sum, n) => sum + (n.network_data.nodes?.length || 0), 0);
    const totalConnections = networks.reduce((sum, n) => sum + (n.network_data.connections?.length || 0), 0);
    const avgNodesPerNetwork = total > 0 ? totalNodes / total : 0;
    const avgConnectionsPerNetwork = total > 0 ? totalConnections / total : 0;

    // Get all dimensions used across networks
    const allDimensions = new Set<string>();
    const allLevels = new Set<string>();
    
    networks.forEach(network => {
      network.network_data.nodes?.forEach((node: any) => {
        if (node.dimension) allDimensions.add(node.dimension);
        if (node.level) allLevels.add(node.level);
      });
    });

    return {
      total,
      uniquePatients,
      totalNodes,
      totalConnections,
      avgNodesPerNetwork: Math.round(avgNodesPerNetwork * 10) / 10,
      avgConnectionsPerNetwork: Math.round(avgConnectionsPerNetwork * 10) / 10,
      dimensionsUsed: allDimensions.size,
      levelsUsed: allLevels.size,
    };
  };

  const getComplexityAnalysis = () => {
    return networks.map(network => {
      const nodes = network.network_data.nodes || [];
      const connections = network.network_data.connections || [];
      
      const dimensionsUsed = new Set(nodes.map((n: any) => n.dimension)).size;
      const levelsUsed = new Set(nodes.map((n: any) => n.level)).size;
      const avgIntensity = nodes.length > 0 
        ? nodes.reduce((sum: number, n: any) => sum + (n.intensity || 0), 0) / nodes.length
        : 0;
      const avgFrequency = nodes.length > 0 
        ? nodes.reduce((sum: number, n: any) => sum + (n.frequency || 0), 0) / nodes.length
        : 0;
      
      // Calculate network density (connections / possible connections)
      const maxPossibleConnections = nodes.length * (nodes.length - 1);
      const density = maxPossibleConnections > 0 ? connections.length / maxPossibleConnections : 0;

      return {
        networkId: network.id,
        networkName: network.name,
        patientName: network.patient?.full_name,
        complexity: {
          nodes: nodes.length,
          connections: connections.length,
          density: Math.round(density * 100) / 100,
          dimensionsUsed,
          levelsUsed,
          avgIntensity: Math.round(avgIntensity * 10) / 10,
          avgFrequency: Math.round(avgFrequency * 10) / 10,
        }
      };
    });
  };

  const exportNetwork = (network: Network) => {
    const exportData = {
      network_info: {
        name: network.name,
        description: network.description,
        patient: network.patient?.full_name,
        version: network.version,
        created_at: network.created_at,
      },
      network_data: network.network_data,
      metadata: {
        exported_at: new Date().toISOString(),
        exported_by: user?.email,
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${network.name.replace(/[^a-zA-Z0-9]/g, '_')}_network.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Rede exportada com sucesso");
  };

  // Fetch networks when user or patientId changes
  useEffect(() => {
    fetchNetworks();
  }, [user?.id, patientId]);

  return {
    networks,
    loading,
    error,
    fetchNetworks,
    deleteNetwork,
    updateNetwork,
    duplicateNetwork,
    searchNetworks,
    getNetworksByPatient,
    getNetworksByVersion,
    getNetworkStats,
    getComplexityAnalysis,
    exportNetwork,
    refetch: fetchNetworks,
  };
};