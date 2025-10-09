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

export const useSessionNetwork = (patientId: string, recordId?: string) => {
  const { user } = useAuth();
  const [allNetworkData, setAllNetworkData] = useState<NetworkData>({
    nodes: [],
    connections: []
  });
  const [filteredBySession, setFilteredBySession] = useState(false);
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
      let networkQuery = supabase
        .from('patient_networks')
        .select('*')
        .eq('patient_id', patientId)
        .eq('therapist_id', user.id)
        .eq('is_general', true);

      const { data: networkData, error: networkError } = await networkQuery.single();

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

      // Carrega nodes com informação de sessão
      const { data: nodes, error: nodesError } = await supabase
        .from('network_nodes')
        .select(`
          *,
          session:session_id(id, name)
        `)
        .eq('network_id', network.id);

      if (nodesError) throw nodesError;

      // Carrega connections com informação de sessão  
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
        text: node.name,
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

      setAllNetworkData({
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

  // Obtém os dados filtrados ou todos os dados
  const getNetworkData = useCallback((): NetworkData => {
    if (!filteredBySession || !recordId) {
      return allNetworkData;
    }

    // Filtra apenas processos da sessão atual
    const sessionNodes = allNetworkData.nodes.filter(node => node.sessionId === recordId);
    const sessionNodeIds = new Set(sessionNodes.map(node => node.id));
    const sessionConnections = allNetworkData.connections.filter(connection => 
      sessionNodeIds.has(connection.source_node_id) && 
      sessionNodeIds.has(connection.target_node_id)
    );

    return {
      nodes: sessionNodes,
      connections: sessionConnections
    };
  }, [allNetworkData, filteredBySession, recordId]);

  // Salva mudanças na rede geral
  const saveNetwork = useCallback(async (updatedData: NetworkData) => {
    if (!patientId || !user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      // Busca a rede geral
      const { data: network, error: networkError } = await supabase
        .from('patient_networks')
        .select('*')
        .eq('patient_id', patientId)
        .eq('therapist_id', user.id)
        .eq('is_general', true)
        .single();

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
          name: node.text,
          x: node.x,
          y: node.y,
          type: 'process',
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

      // Recarrega os dados
      await loadNetwork();
      toast.success('Rede salva com sucesso');
      return true;

    } catch (err) {
      console.error('Error saving network:', err);
      toast.error('Erro ao salvar rede');
      return false;
    }
  }, [patientId, recordId, user, loadNetwork]);

  // Toggle para filtrar por sessão
  const toggleSessionFilter = useCallback(() => {
    setFilteredBySession(!filteredBySession);
  }, [filteredBySession]);

  useEffect(() => {
    loadNetwork();
  }, [loadNetwork]);

  return {
    networkData: getNetworkData(),
    allNetworkData,
    filteredBySession,
    loading,
    error,
    saveNetwork,
    toggleSessionFilter,
    reloadNetwork: loadNetwork
  };
};