import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface NetworkNode {
  id: string;
  name: string;
  x: number;
  y: number;
  type: string;
  description?: string;
  sessionId?: string; // Marca em qual sessão o processo foi criado
  sessionName?: string;
  created_at?: string;
}

export interface NetworkConnection {
  id: string;
  source_node_id: string;
  target_node_id: string;
  type: string;
  description?: string;
  sessionId?: string; // Marca em qual sessão a conexão foi criada
  sessionName?: string;
  created_at?: string;
}

export interface NetworkData {
  id: string;
  name: string;
  description?: string;
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  patient_id: string;
  therapist_id: string;
  is_general: boolean; // Sempre true para a rede principal
  session_id?: string; // Pode ser null para a rede geral
  created_at: string;
  updated_at: string;
}

export const usePatientNetwork = (patientId: string) => {
  const { user } = useAuth();
  const [network, setNetwork] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredSessionId, setFilteredSessionId] = useState<string | null>(null);

  // Carrega sempre a rede geral (única)
  const loadNetwork = useCallback(async () => {
    if (!patientId || !user) return;

    setLoading(true);
    setError(null);

    try {
      // Busca sempre pela rede geral (is_general = true)
      const { data: networkData, error: networkError } = await supabase
        .from('patient_networks')
        .select('*')
        .eq('patient_id', patientId)
        .eq('therapist_id', user.id)
        .eq('is_general', true) // Sempre busca a rede geral
        .single();

      if (networkError && networkError.code !== 'PGRST116') {
        throw networkError;
      }

      if (!networkData) {
        // Cria a rede geral se não existir
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
        setNetwork({ ...createdNetwork, nodes: [], connections: [] });
        return;
      }

      // Carrega nodes com informação de sessão
      const { data: nodes, error: nodesError } = await supabase
        .from('network_nodes')
        .select(`
          *,
          session:session_id(id, name)
        `)
        .eq('network_id', networkData.id);

      if (nodesError) throw nodesError;

      // Carrega connections com informação de sessão  
      const { data: connections, error: connectionsError } = await supabase
        .from('network_connections')
        .select(`
          *,
          session:session_id(id, name)
        `)
        .eq('network_id', networkData.id);

      if (connectionsError) throw connectionsError;

      // Adiciona informação de sessão aos nodes e connections
      const enrichedNodes = (nodes || []).map(node => ({
        ...node,
        sessionId: node.session_id,
        sessionName: node.session?.name || 'Sessão não identificada'
      }));

      const enrichedConnections = (connections || []).map(connection => ({
        ...connection,
        sessionId: connection.session_id,
        sessionName: connection.session?.name || 'Sessão não identificada'
      }));

      setNetwork({
        ...networkData,
        nodes: enrichedNodes,
        connections: enrichedConnections
      });

    } catch (err) {
      console.error('Error loading network:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar rede');
    } finally {
      setLoading(false);
    }
  }, [patientId, user]);

  // Adiciona um novo nó sempre na rede geral, mas marca a sessão
  const addNode = useCallback(async (
    node: Omit<NetworkNode, 'id' | 'created_at'>,
    sessionId?: string
  ) => {
    if (!network || !user) return false;

    try {
      const nodeToInsert = {
        ...node,
        network_id: network.id,
        session_id: sessionId || null
      };

      const { data, error } = await supabase
        .from('network_nodes')
        .insert(nodeToInsert)
        .select()
        .single();

      if (error) throw error;

      // Adiciona informação de sessão se disponível
      let sessionName = 'Sessão não identificada';
      if (sessionId) {
        const { data: sessionData } = await supabase
          .from('patient_sessions')
          .select('name')
          .eq('id', sessionId)
          .single();

        if (sessionData) sessionName = sessionData.name;
      }

      const enrichedNode = {
        ...data,
        sessionId,
        sessionName
      };

      setNetwork(prev => prev ? {
        ...prev,
        nodes: [...prev.nodes, enrichedNode]
      } : null);

      return true;
    } catch (err) {
      console.error('Error adding node:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar nó');
      return false;
    }
  }, [network, user]);

  // Adiciona uma nova conexão sempre na rede geral, mas marca a sessão
  const addConnection = useCallback(async (
    connection: Omit<NetworkConnection, 'id' | 'created_at'>,
    sessionId?: string
  ) => {
    if (!network || !user) return false;

    try {
      const connectionToInsert = {
        ...connection,
        network_id: network.id,
        session_id: sessionId || null
      };

      const { data, error } = await supabase
        .from('network_connections')
        .insert(connectionToInsert)
        .select()
        .single();

      if (error) throw error;

      // Adiciona informação de sessão se disponível
      let sessionName = 'Sessão não identificada';
      if (sessionId) {
        const { data: sessionData } = await supabase
          .from('patient_sessions')
          .select('name')
          .eq('id', sessionId)
          .single();

        if (sessionData) sessionName = sessionData.name;
      }

      const enrichedConnection = {
        ...data,
        sessionId,
        sessionName
      };

      setNetwork(prev => prev ? {
        ...prev,
        connections: [...prev.connections, enrichedConnection]
      } : null);

      return true;
    } catch (err) {
      console.error('Error adding connection:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar conexão');
      return false;
    }
  }, [network, user]);

  // Remove um nó da rede
  const removeNode = useCallback(async (nodeId: string) => {
    if (!network) return false;

    try {
      const { error } = await supabase
        .from('network_nodes')
        .delete()
        .eq('id', nodeId);

      if (error) throw error;

      setNetwork(prev => prev ? {
        ...prev,
        nodes: prev.nodes.filter(node => node.id !== nodeId),
        connections: prev.connections.filter(
          conn => conn.source_node_id !== nodeId && conn.target_node_id !== nodeId
        )
      } : null);

      return true;
    } catch (err) {
      console.error('Error removing node:', err);
      setError(err instanceof Error ? err.message : 'Erro ao remover nó');
      return false;
    }
  }, [network]);

  // Remove uma conexão da rede
  const removeConnection = useCallback(async (connectionId: string) => {
    if (!network) return false;

    try {
      const { error } = await supabase
        .from('network_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      setNetwork(prev => prev ? {
        ...prev,
        connections: prev.connections.filter(conn => conn.id !== connectionId)
      } : null);

      return true;
    } catch (err) {
      console.error('Error removing connection:', err);
      setError(err instanceof Error ? err.message : 'Erro ao remover conexão');
      return false;
    }
  }, [network]);

  // Atualiza a posição dos nós
  const updateNodePositions = useCallback(async (nodes: NetworkNode[]) => {
    if (!network) return false;

    try {
      const updates = nodes.map(node => ({
        id: node.id,
        x: node.x,
        y: node.y
      }));

      for (const update of updates) {
        await supabase
          .from('network_nodes')
          .update({ x: update.x, y: update.y })
          .eq('id', update.id);
      }

      setNetwork(prev => prev ? {
        ...prev,
        nodes: prev.nodes.map(node => {
          const update = updates.find(u => u.id === node.id);
          return update ? { ...node, x: update.x, y: update.y } : node;
        })
      } : null);

      return true;
    } catch (err) {
      console.error('Error updating node positions:', err);
      return false;
    }
  }, [network]);

  // Filtra a rede por sessão (apenas visual, não cria nova rede)
  const filterBySession = useCallback((sessionId: string | null) => {
    setFilteredSessionId(sessionId);
  }, []);

  // Obtém os dados filtrados por sessão
  const getFilteredNetworkData = useCallback(() => {
    if (!network) return null;

    if (!filteredSessionId) {
      // Retorna toda a rede
      return network;
    }

    // Filtra nodes e connections pela sessão
    const filteredNodes = network.nodes.filter(node => node.sessionId === filteredSessionId);
    const filteredNodeIds = new Set(filteredNodes.map(node => node.id));
    const filteredConnections = network.connections.filter(connection => 
      connection.sessionId === filteredSessionId &&
      filteredNodeIds.has(connection.source_node_id) &&
      filteredNodeIds.has(connection.target_node_id)
    );

    return {
      ...network,
      nodes: filteredNodes,
      connections: filteredConnections
    };
  }, [network, filteredSessionId]);

  // Lista todas as sessões que têm processos na rede
  const getAvailableSessions = useCallback(() => {
    if (!network) return [];

    const sessions = new Map<string, { id: string; name: string; count: number }>();

    // Conta processos por sessão
    network.nodes.forEach(node => {
      if (node.sessionId && node.sessionName) {
        const existing = sessions.get(node.sessionId);
        if (existing) {
          existing.count++;
        } else {
          sessions.set(node.sessionId, {
            id: node.sessionId,
            name: node.sessionName,
            count: 1
          });
        }
      }
    });

    return Array.from(sessions.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [network]);

  useEffect(() => {
    loadNetwork();
  }, [loadNetwork]);

  return {
    network: getFilteredNetworkData(),
    allNetwork: network, // Rede completa sem filtro
    loading,
    error,
    filteredSessionId,
    addNode,
    addConnection,
    removeNode,
    removeConnection,
    updateNodePositions,
    filterBySession,
    getAvailableSessions,
    reloadNetwork: loadNetwork
  };
};
