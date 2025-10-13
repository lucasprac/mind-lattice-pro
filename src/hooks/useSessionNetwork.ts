import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface NetworkNode {
  id: string;
  text: string;
  x: number;
  y: number;
  type: string;
  description?: string;
  created_at?: string;
}

export interface NetworkConnection {
  id: string;
  source_node_id: string;
  target_node_id: string;
  type: string;
  description?: string;
  created_at?: string;
}

export interface NetworkData {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
}

export const useSessionNetwork = (patientId: string, recordId?: string) => {
  const { user } = useAuth();
  const [networkData, setNetworkData] = useState<NetworkData>({
    nodes: [],
    connections: []
  });
  const [networkId, setNetworkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega sempre a rede geral (única rede principal)
  const loadNetwork = useCallback(async () => {
    if (!patientId || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Busca sempre a rede geral (is_general = true)
      let { data: networkData, error: networkError } = await supabase
        .from('patient_networks')
        .select('*')
        .eq('patient_id', patientId)
        .eq('therapist_id', user.id)
        .eq('is_general', true)
        .maybeSingle();

      if (networkError && networkError.code !== 'PGRST116') {
        throw networkError;
      }

      let network = networkData;

      // Se não encontrou a rede geral, cria uma nova
      if (!network) {
        const newNetwork = {
          name: 'Rede de Processos Principal',
          description: 'Rede geral que contempla todos os processos de todas as sessões',
          patient_id: patientId,
          therapist_id: user.id,
          is_general: true,
          session_id: null
        };

        const { data: createdNetwork, error: createError } = await supabase
          .from('patient_networks')
          .insert(newNetwork)
          .select()
          .single();

        if (createError) throw createError;
        network = createdNetwork;
      }

      setNetworkId(network.id);

      // Carrega nodes
      const { data: nodes, error: nodesError } = await supabase
        .from('network_nodes')
        .select('*')
        .eq('network_id', network.id)
        .order('created_at', { ascending: true });

      if (nodesError) throw nodesError;

      // Carrega connections
      const { data: connections, error: connectionsError } = await supabase
        .from('network_connections')
        .select('*')
        .eq('network_id', network.id)
        .order('created_at', { ascending: true });

      if (connectionsError) throw connectionsError;

      // Mapeia os dados para o formato esperado pelos componentes
      const mappedNodes: NetworkNode[] = (nodes || []).map(node => ({
        id: node.id,
        text: node.name,
        x: node.x || 100,
        y: node.y || 100,
        type: node.type || 'process',
        description: node.description,
        created_at: node.created_at
      }));

      const mappedConnections: NetworkConnection[] = (connections || []).map(connection => ({
        id: connection.id,
        source_node_id: connection.source_node_id,
        target_node_id: connection.target_node_id,
        type: connection.type || 'unchanged',
        description: connection.description,
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
  }, [patientId, user]);

  // Salva mudanças na rede geral
  const saveNetwork = useCallback(async (updatedData: NetworkData) => {
    if (!patientId || !user || !networkId) {
      toast.error('Erro: dados da rede não carregados');
      return false;
    }

    try {
      console.log('Saving network data:', updatedData);

      // Remove todos os nodes e connections existentes da rede
      await supabase
        .from('network_connections')
        .delete()
        .eq('network_id', networkId);

      await supabase
        .from('network_nodes')
        .delete()
        .eq('network_id', networkId);

      // Insere os novos nodes
      if (updatedData.nodes.length > 0) {
        const nodesToInsert = updatedData.nodes.map(node => ({
          id: node.id,
          network_id: networkId,
          name: node.text,
          x: node.x,
          y: node.y,
          type: node.type || 'process',
          description: node.description || ''
        }));

        const { error: nodesError } = await supabase
          .from('network_nodes')
          .insert(nodesToInsert);

        if (nodesError) throw nodesError;
      }

      // Insere as novas connections
      if (updatedData.connections.length > 0) {
        const connectionsToInsert = updatedData.connections.map(connection => ({
          id: connection.id,
          network_id: networkId,
          source_node_id: connection.source_node_id,
          target_node_id: connection.target_node_id,
          type: connection.type || 'unchanged',
          description: connection.description || ''
        }));

        const { error: connectionsError } = await supabase
          .from('network_connections')
          .insert(connectionsToInsert);

        if (connectionsError) throw connectionsError;
      }

      // Recarrega os dados
      await loadNetwork();
      toast.success('Rede salva com sucesso');
      return true;

    } catch (err) {
      console.error('Error saving network:', err);
      toast.error('Erro ao salvar rede: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
      return false;
    }
  }, [patientId, user, networkId, loadNetwork]);

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
