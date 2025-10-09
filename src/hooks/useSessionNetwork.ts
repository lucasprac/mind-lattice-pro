import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface NetworkNode {
  id: string;
  text: string; // Changed from 'name' to 'text' for compatibility
  x: number;
  y: number;
  type: string;
  description?: string;
  sessionId?: string;
  sessionName?: string;
  created_at?: string;
}

export interface NetworkConnection {
  id: string;
  source_node_id: string;
  target_node_id: string;
  type: string;
  description?: string;
  sessionId?: string;
  sessionName?: string;
  created_at?: string;
}

export interface NetworkData {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
}

export const useSessionNetwork = (patientId: string, recordId?: string, isGeneral: boolean = false) => {
  const { user } = useAuth();
  const [networkData, setNetworkData] = useState<NetworkData>({
    nodes: [],
    connections: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega a rede - geral ou da sessão específica
  const loadNetwork = useCallback(async () => {
    if (!patientId || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Busca a rede apropriada
      let networkQuery = supabase
        .from('patient_networks')
        .select('*')
        .eq('patient_id', patientId)
        .eq('therapist_id', user.id);

      if (isGeneral) {
        networkQuery = networkQuery.eq('is_general', true);
      } else {
        networkQuery = networkQuery.eq('session_id', recordId);
      }

      const { data: networkData, error: networkError } = await networkQuery.single();

      if (networkError && networkError.code !== 'PGRST116') {
        throw networkError;
      }

      let network = networkData;

      // Se não encontrou a rede, cria uma nova
      if (!network) {
        const newNetwork = {
          name: isGeneral ? 'Rede de Processos Principal' : `Rede da Sessão`,
          description: isGeneral ? 
            'Rede geral que contempla todos os processos de todas as sessões' : 
            'Rede específica desta sessão',
          patient_id: patientId,
          therapist_id: user.id,
          is_general: isGeneral,
          session_id: isGeneral ? null : recordId
        };

        const { data: createdNetwork, error: createError } = await supabase
          .from('patient_networks')
          .insert(newNetwork)
          .select()
          .single();

        if (createError) throw createError;
        network = createdNetwork;
      }

      // Carrega nodes
      const { data: nodes, error: nodesError } = await supabase
        .from('network_nodes')
        .select(`
          *,
          session:session_id(id, name)
        `)
        .eq('network_id', network.id);

      if (nodesError) throw nodesError;

      // Carrega connections  
      const { data: connections, error: connectionsError } = await supabase
        .from('network_connections')
        .select(`
          *,
          session:session_id(id, name)
        `)
        .eq('network_id', network.id);

      if (connectionsError) throw connectionsError;

      // Mapeia os dados para o formato esperado pelos componentes
      const mappedNodes: NetworkNode[] = (nodes || []).map(node => ({
        id: node.id,
        text: node.name, // Mapeia 'name' para 'text'
        x: node.x,
        y: node.y,
        type: node.type,
        description: node.description,
        sessionId: node.session_id,
        sessionName: node.session?.name || 'Sessão não identificada',
        created_at: node.created_at
      }));

      const mappedConnections: NetworkConnection[] = (connections || []).map(connection => ({
        id: connection.id,
        source_node_id: connection.source_node_id,
        target_node_id: connection.target_node_id,
        type: connection.type,
        description: connection.description,
        sessionId: connection.session_id,
        sessionName: connection.session?.name || 'Sessão não identificada',
        created_at: connection.created_at
      }));

      setNetworkData({
        nodes: mappedNodes,
        connections: mappedConnections
      });

    } catch (err) {
      console.error('Error loading network:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar rede');
      toast.error('Erro ao carregar rede');
    } finally {
      setLoading(false);
    }
  }, [patientId, recordId, isGeneral, user]);

  // Salva mudanças na rede
  const saveNetwork = useCallback(async (updatedData: NetworkData) => {
    if (!patientId || !user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      // Busca a rede apropriada
      let networkQuery = supabase
        .from('patient_networks')
        .select('*')
        .eq('patient_id', patientId)
        .eq('therapist_id', user.id);

      if (isGeneral) {
        networkQuery = networkQuery.eq('is_general', true);
      } else {
        networkQuery = networkQuery.eq('session_id', recordId);
      }

      const { data: network, error: networkError } = await networkQuery.single();

      if (networkError) {
        throw networkError;
      }

      // Remove todos os nodes e connections existentes
      await supabase
        .from('network_nodes')
        .delete()
        .eq('network_id', network.id);

      await supabase
        .from('network_connections')
        .delete()
        .eq('network_id', network.id);

      // Insere os novos nodes
      if (updatedData.nodes.length > 0) {
        const nodesToInsert = updatedData.nodes.map(node => ({
          network_id: network.id,
          name: node.text, // Mapeia 'text' de volta para 'name'
          x: node.x,
          y: node.y,
          type: node.type,
          description: node.description,
          session_id: recordId || null
        }));

        const { error: nodesError } = await supabase
          .from('network_nodes')
          .insert(nodesToInsert);

        if (nodesError) throw nodesError;
      }

      // Insere as novas connections
      if (updatedData.connections.length > 0) {
        const connectionsToInsert = updatedData.connections.map(connection => ({
          network_id: network.id,
          source_node_id: connection.source_node_id,
          target_node_id: connection.target_node_id,
          type: connection.type,
          description: connection.description,
          session_id: recordId || null
        }));

        const { error: connectionsError } = await supabase
          .from('network_connections')
          .insert(connectionsToInsert);

        if (connectionsError) throw connectionsError;
      }

      setNetworkData(updatedData);
      toast.success('Rede salva com sucesso');
      return true;

    } catch (err) {
      console.error('Error saving network:', err);
      toast.error('Erro ao salvar rede');
      return false;
    }
  }, [patientId, recordId, isGeneral, user]);

  useEffect(() => {
    loadNetwork();
  }, [loadNetwork]);

  return {
    networkData,
    loading,
    error,
    saveNetwork,
    reloadNetwork: loadNetwork
  };
};
