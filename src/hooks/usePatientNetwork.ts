import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Simplified interface without EEMM fields - moved to Mediators step
export interface ProcessNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  // Internal session tracking - not displayed to user but used for Mediators and Functional Analysis
  session_id?: string;
  created_in_session?: string;
}

type ConnectionType = 'maladaptive' | 'unchanged' | 'adaptive';
type MarkerType = 'arrow' | 'line' | 'circle';

export interface Connection {
  id: string;
  from: string;
  to: string;
  type: ConnectionType;
  strength: number;
  ambivalent: boolean;
  startMarker: MarkerType;
  endMarker: MarkerType;
  // Internal session tracking
  session_id?: string;
  created_in_session?: string;
}

export interface NetworkData {
  nodes: ProcessNode[];
  connections: Connection[];
}

export const usePatientNetwork = (patientId: string, currentSessionId?: string | null, isGeneral = false) => {
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
      
      // Always fetch general network (record_id = null)
      const { data, error } = await supabase
        .from("patient_networks")
        .select("*")
        .eq("patient_id", patientId)
        .eq("therapist_id", user.id)
        .is("record_id", null) // Always general network
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error("Erro ao buscar rede:", error);
        return;
      }

      if (data) {
        // Clean and adapt existing data to new interface with session tracking
        const nodes = data.nodes?.map((node: any) => ({
          id: node.id,
          x: node.x || 0,
          y: node.y || 0,
          width: node.width || 200,
          height: node.height || 80,
          text: node.text || '',
          // Preserve session tracking info if it exists
          session_id: node.session_id,
          created_in_session: node.created_in_session
        })) || [];
        
        const connections = data.connections?.map((conn: any) => ({
          ...conn,
          // Preserve session tracking info if it exists
          session_id: conn.session_id,
          created_in_session: conn.created_in_session
        })) || [];
        
        setNetworkData({ nodes, connections });
      } else {
        // Initialize with empty network
        setNetworkData({ nodes: [], connections: [] });
      }
    } catch (err) {
      console.error("Erro inesperado ao buscar rede:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveNetwork = async (data: NetworkData) => {
    if (!user?.id || !patientId) {
      console.error("User or patient ID missing:", { userId: user?.id, patientId });
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      // Add session tracking to new nodes and connections
      const nodesWithSessionTracking = data.nodes.map(node => ({
        ...node,
        // Add session tracking for new nodes (those without existing session_id)
        session_id: node.session_id || currentSessionId,
        created_in_session: node.created_in_session || currentSessionId
      }));

      const connectionsWithSessionTracking = data.connections.map(conn => ({
        ...conn,
        // Add session tracking for new connections (those without existing session_id)
        session_id: conn.session_id || currentSessionId,
        created_in_session: conn.created_in_session || currentSessionId
      }));

      const saveData = {
        patient_id: patientId,
        therapist_id: user.id,
        record_id: null, // Always save to general network
        nodes: nodesWithSessionTracking,
        connections: connectionsWithSessionTracking,
      };

      console.log("Tentando salvar rede com dados:", { 
        patientId, 
        therapistId: user.id, 
        nodesCount: nodesWithSessionTracking.length, 
        connectionsCount: connectionsWithSessionTracking.length 
      });

      // Check if general network already exists
      const { data: existingData, error: checkError } = await supabase
        .from("patient_networks")
        .select("id")
        .eq("patient_id", patientId)
        .eq("therapist_id", user.id)
        .is("record_id", null)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Erro ao verificar rede existente:", checkError);
        toast.error(`Erro ao verificar rede: ${checkError.message}`);
        return false;
      }

      if (existingData) {
        // Update existing general network
        console.log("Atualizando rede existente com ID:", existingData.id);
        const { error: updateError } = await supabase
          .from("patient_networks")
          .update(saveData)
          .eq("id", existingData.id);

        if (updateError) {
          console.error("Erro ao atualizar rede:", updateError);
          toast.error(`Erro ao atualizar rede: ${updateError.message}`);
          return false;
        }
        console.log("Rede atualizada com sucesso!");
      } else {
        // Create new general network
        console.log("Criando nova rede");
        const { error: insertError, data: insertData } = await supabase
          .from("patient_networks")
          .insert([saveData])
          .select();

        if (insertError) {
          console.error("Erro ao criar rede:", insertError);
          toast.error(`Erro ao criar rede: ${insertError.message}`);
          return false;
        }
        console.log("Rede criada com sucesso:", insertData);
      }

      toast.success("Rede do paciente salva com sucesso");
      await fetchNetwork();
      return true;
    } catch (err) {
      console.error("Erro inesperado ao salvar rede:", err);
      toast.error(`Erro inesperado: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      return false;
    }
  };

  // Helper function to get processes from current session (for Mediators and Functional Analysis)
  const getProcessesFromSession = (sessionId: string) => {
    return networkData.nodes.filter(node => 
      node.created_in_session === sessionId || node.session_id === sessionId
    );
  };

  // Helper function to get all processes (for general use)
  const getAllProcesses = () => {
    return networkData.nodes;
  };

  useEffect(() => {
    fetchNetwork();
  }, [user?.id, patientId]);

  return {
    networkData,
    loading,
    saveNetwork,
    refetch: fetchNetwork,
    getProcessesFromSession,
    getAllProcesses,
  };
};