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
  // Removed: dimension and level - these are now handled in Mediators step
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
}

export interface NetworkData {
  nodes: ProcessNode[];
  connections: Connection[];
}

export const usePatientNetwork = (patientId: string, recordId?: string | null, isGeneral = false) => {
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
      
      // Determine which network to load
      const isSessionSpecific = recordId && !isGeneral;
      
      let query = supabase
        .from("patient_networks")
        .select("*")
        .eq("patient_id", patientId)
        .eq("therapist_id", user.id);

      if (isSessionSpecific) {
        query = query.eq("record_id", recordId);
      } else {
        query = query.is("record_id", null); // General network
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error("Erro ao buscar rede:", error);
        return;
      }

      if (data) {
        // Clean and adapt existing data to new interface
        const nodes = data.nodes?.map((node: any) => ({
          id: node.id,
          x: node.x || 0,
          y: node.y || 0,
          width: node.width || 200,
          height: node.height || 80,
          text: node.text || ''
          // Removed: dimension, level, intensity, frequency - moved to Mediators
        })) || [];
        
        const connections = data.connections || [];
        
        setNetworkData({ nodes, connections });
      } else {
        // Initialize with empty network
        setNetworkData({ nodes: [], connections: [] });
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
      const isSessionSpecific = recordId && !isGeneral;
      const saveData = {
        patient_id: patientId,
        therapist_id: user.id,
        record_id: isSessionSpecific ? recordId : null,
        nodes: data.nodes,
        connections: data.connections,
      };

      // Check if network already exists
      let query = supabase
        .from("patient_networks")
        .select("id")
        .eq("patient_id", patientId)
        .eq("therapist_id", user.id);

      if (isSessionSpecific) {
        query = query.eq("record_id", recordId);
      } else {
        query = query.is("record_id", null);
      }

      const { data: existingData } = await query.single();

      if (existingData) {
        // Update existing network
        const { error } = await supabase
          .from("patient_networks")
          .update(saveData)
          .eq("id", existingData.id);

        if (error) {
          console.error("Erro ao atualizar rede:", error);
          toast.error("Erro ao salvar rede");
          return false;
        }
      } else {
        // Create new network
        const { error } = await supabase
          .from("patient_networks")
          .insert([saveData]);

        if (error) {
          console.error("Erro ao criar rede:", error);
          toast.error("Erro ao salvar rede");
          return false;
        }
      }

      toast.success(isGeneral ? "Rede geral salva" : "Rede da sessão salva");
      await fetchNetwork();
      return true;
    } catch (err) {
      console.error("Erro inesperado:", err);
      toast.error("Erro inesperado ao salvar rede");
      return false;
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, [user?.id, patientId, recordId, isGeneral]);

  return {
    networkData,
    loading,
    saveNetwork,
    refetch: fetchNetwork,
  };
};