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
}

export interface NetworkData {
  nodes: ProcessNode[];
  connections: Connection[];
}

export const usePatientNetwork = (patientId: string) => {
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
      const { data, error } = await supabase
        .from("networks")
        .select("*")
        .eq("patient_id", patientId)
        .eq("therapist_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

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
      const { data: existing } = await supabase
        .from("networks")
        .select("id")
        .eq("patient_id", patientId)
        .eq("therapist_id", user.id)
        .single();

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
            name: "Rede de Processos",
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

  useEffect(() => {
    fetchNetwork();
  }, [user?.id, patientId]);

  return {
    networkData,
    loading,
    saveNetwork,
    refetch: fetchNetwork,
  };
};
