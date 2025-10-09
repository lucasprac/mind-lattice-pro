import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Match the types from EnhancedNetworkCanvas
const EEMM_DIMENSIONS = {
  cognition: { name: "Cognição" },
  emotion: { name: "Emoção" },
  self: { name: "Self" },
  motivation: { name: "Motivação" },
  behavior: { name: "Comportamento" }
};

const EEMM_LEVELS = {
  biology: { name: "Biologia/Fisiologia" },
  psychology: { name: "Psicologia" },
  social: { name: "Social/Cultural" }
};

export interface ProcessNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  dimension: keyof typeof EEMM_DIMENSIONS;
  level: keyof typeof EEMM_LEVELS;
  intensity: number;
  frequency: number;
  sessionId?: string;  // NEW: Track which session this node was created/modified in
}

type MarkerType = 'arrow' | 'line' | 'circle';

export interface Connection {
  id: string;
  from: string;
  to: string;
  type: 'maladaptive' | 'unchanged' | 'adaptive';
  strength: number;
  ambivalent: boolean;
  startMarker: MarkerType;
  endMarker: MarkerType;
  sessionId?: string;  // NEW: Track which session this connection was created/modified in
}

export interface NetworkData {
  nodes: ProcessNode[];
  connections: Connection[];
}

export const usePatientNetwork = (patientId: string, recordId?: string, isGeneral: boolean = false) => {
  const [networkData, setNetworkData] = useState<NetworkData>({ nodes: [], connections: [] });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNetwork = async () => {
    if (!user?.id || !patientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      let query = supabase
        .from("networks")
        .select("*")
        .eq("patient_id", patientId)
        .eq("therapist_id", user.id);

      // Filter by record_id or is_general flag
      if (isGeneral) {
        query = query.eq("is_general", true);
      } else if (recordId) {
        query = query.eq("record_id", recordId);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error("Erro ao buscar rede:", error);
        toast.error("Erro ao carregar rede");
        return;
      }

      if (data) {
        const networkData = data.network_data as any as NetworkData;
        // Ensure all connections have startMarker and endMarker for backward compatibility
        const normalizedConnections = networkData.connections.map(conn => ({
          ...conn,
          startMarker: conn.startMarker || 'line' as MarkerType,
          endMarker: conn.endMarker || 'arrow' as MarkerType,
        }));
        setNetworkData({
          nodes: networkData.nodes,
          connections: normalizedConnections
        });
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveNetwork = async (data: NetworkData) => {
    if (!user?.id || !patientId) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      // Check if network exists
      let query = supabase
        .from("networks")
        .select("id")
        .eq("patient_id", patientId)
        .eq("therapist_id", user.id);

      if (isGeneral) {
        query = query.eq("is_general", true);
      } else if (recordId) {
        query = query.eq("record_id", recordId);
      }

      const { data: existing } = await query
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("networks")
          .update({
            network_data: data as any,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) {
          console.error("Erro ao atualizar rede:", error);
          toast.error("Erro ao salvar rede");
          return false;
        }
      } else {
        // Create new
        const { error } = await supabase
          .from("networks")
          .insert({
            patient_id: patientId,
            therapist_id: user.id,
            record_id: recordId || null,
            is_general: isGeneral,
            name: isGeneral ? "Rede Geral de Processos" : "Rede da Sessão",
            network_data: data as any,
          } as any);

        if (error) {
          console.error("Erro ao criar rede:", error);
          toast.error("Erro ao salvar rede");
          return false;
        }
      }

      setNetworkData(data);
      toast.success("Rede salva com sucesso");
      return true;
    } catch (err) {
      console.error("Erro inesperado:", err);
      toast.error("Erro inesperado ao salvar rede");
      return false;
    }
  };

  // NEW: Method to filter nodes by session
  const getNodesBySession = (sessionId: string): ProcessNode[] => {
    return networkData.nodes.filter(node => node.sessionId === sessionId);
  };

  // NEW: Method to filter connections by session
  const getConnectionsBySession = (sessionId: string): Connection[] => {
    return networkData.connections.filter(conn => conn.sessionId === sessionId);
  };

  // NEW: Method to get all unique session IDs from the network
  const getSessionIds = (): string[] => {
    const nodeSessionIds = networkData.nodes
      .map(node => node.sessionId)
      .filter((id): id is string => id !== undefined);
    const connectionSessionIds = networkData.connections
      .map(conn => conn.sessionId)
      .filter((id): id is string => id !== undefined);
    return Array.from(new Set([...nodeSessionIds, ...connectionSessionIds]));
  };

  // NEW: Method to get network data filtered by session
  const getNetworkBySession = (sessionId: string): NetworkData => {
    return {
      nodes: getNodesBySession(sessionId),
      connections: getConnectionsBySession(sessionId)
    };
  };

  // NEW: Method to update a node's session ID
  const updateNodeSession = async (nodeId: string, sessionId: string): Promise<boolean> => {
    const updatedNodes = networkData.nodes.map(node => 
      node.id === nodeId ? { ...node, sessionId } : node
    );
    const updatedData = { ...networkData, nodes: updatedNodes };
    const success = await saveNetwork(updatedData);
    if (success) {
      setNetworkData(updatedData);
    }
    return success;
  };

  // NEW: Method to update a connection's session ID
  const updateConnectionSession = async (connectionId: string, sessionId: string): Promise<boolean> => {
    const updatedConnections = networkData.connections.map(conn => 
      conn.id === connectionId ? { ...conn, sessionId } : conn
    );
    const updatedData = { ...networkData, connections: updatedConnections };
    const success = await saveNetwork(updatedData);
    if (success) {
      setNetworkData(updatedData);
    }
    return success;
  };

  useEffect(() => {
    fetchNetwork();
  }, [user?.id, patientId, recordId, isGeneral]);

  return {
    networkData,
    loading,
    saveNetwork,
    refetch: fetchNetwork,
    // NEW: Session-based filtering methods
    getNodesBySession,
    getConnectionsBySession,
    getSessionIds,
    getNetworkBySession,
    updateNodeSession,
    updateConnectionSession,
  };
};
