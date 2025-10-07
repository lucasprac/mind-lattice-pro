import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProcessNode {
  id: string;
  text: string;
  dimension: string;
  level: string;
  intensity: number;
  frequency: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  type: 'maladaptive' | 'unchanged' | 'adaptive';
  strength: number;
  ambivalent: boolean;
  startMarker: 'arrow' | 'line' | 'circle';
  endMarker: 'arrow' | 'line' | 'circle';
}

interface NetworkData {
  nodes: ProcessNode[];
  connections: Connection[];
}

interface UseNetworkSyncProps {
  patientId: string;
  sessionId?: string;
}

export const useNetworkSync = ({ patientId, sessionId }: UseNetworkSyncProps) => {
  const [sessionNetwork, setSessionNetwork] = useState<NetworkData>({ nodes: [], connections: [] });
  const [generalNetwork, setGeneralNetwork] = useState<NetworkData>({ nodes: [], connections: [] });
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingGeneral, setIsLoadingGeneral] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for duplicate process names across both networks
  const checkDuplicateName = useCallback((text: string, excludeId?: string, networkType?: 'session' | 'general'): boolean => {
    const normalizedText = text.toLowerCase().trim();
    
    // Check session network
    const sessionDuplicate = sessionNetwork.nodes.some(node => 
      node.text.toLowerCase().trim() === normalizedText && 
      node.id !== excludeId
    );
    
    // Check general network
    const generalDuplicate = generalNetwork.nodes.some(node => 
      node.text.toLowerCase().trim() === normalizedText && 
      node.id !== excludeId
    );
    
    return sessionDuplicate || generalDuplicate;
  }, [sessionNetwork.nodes, generalNetwork.nodes]);

  // Load session network
  const loadSessionNetwork = useCallback(async () => {
    if (!sessionId) return;
    
    setIsLoadingSession(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('networks')
        .select('network_data')
        .eq('patient_id', patientId)
        .eq('record_id', sessionId)
        .eq('is_general', false)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      
      if (data?.network_data) {
        const networkData = data.network_data as any;
        setSessionNetwork({
          nodes: networkData.nodes || [],
          connections: networkData.connections || []
        });
      } else {
        setSessionNetwork({ nodes: [], connections: [] });
      }
    } catch (err) {
      console.error('Error loading session network:', err);
      setError('Erro ao carregar rede da sessão');
      toast.error('Erro ao carregar rede da sessão');
    } finally {
      setIsLoadingSession(false);
    }
  }, [patientId, sessionId]);

  // Load general network
  const loadGeneralNetwork = useCallback(async () => {
    setIsLoadingGeneral(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('networks')
        .select('network_data')
        .eq('patient_id', patientId)
        .eq('is_general', true)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data?.network_data) {
        const networkData = data.network_data as any;
        setGeneralNetwork({
          nodes: networkData.nodes || [],
          connections: networkData.connections || []
        });
      } else {
        setGeneralNetwork({ nodes: [], connections: [] });
      }
    } catch (err) {
      console.error('Error loading general network:', err);
      setError('Erro ao carregar rede geral');
      toast.error('Erro ao carregar rede geral');
    } finally {
      setIsLoadingGeneral(false);
    }
  }, [patientId]);

  // Save session network
  const saveSessionNetwork = useCallback(async (networkData: NetworkData) => {
    if (!sessionId) {
      toast.error('ID da sessão não encontrado');
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('networks')
        .upsert({
          patient_id: patientId,
          therapist_id: user.id,
          record_id: sessionId,
          is_general: false,
          name: `Sessão ${sessionId}`,
          network_data: networkData as any,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setSessionNetwork(networkData);
      toast.success('Rede da sessão salva com sucesso');
      return true;
    } catch (err) {
      console.error('Error saving session network:', err);
      toast.error('Erro ao salvar rede da sessão');
      return false;
    }
  }, [patientId, sessionId]);

  // Save general network
  const saveGeneralNetwork = useCallback(async (networkData: NetworkData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('networks')
        .upsert({
          patient_id: patientId,
          therapist_id: user.id,
          is_general: true,
          name: 'Rede Geral',
          network_data: networkData as any,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setGeneralNetwork(networkData);
      toast.success('Rede geral salva com sucesso');
      return true;
    } catch (err) {
      console.error('Error saving general network:', err);
      toast.error('Erro ao salvar rede geral');
      return false;
    }
  }, [patientId]);

  // Copy processes from session to general network
  const copySessionToGeneral = useCallback(async () => {
    if (sessionNetwork.nodes.length === 0) {
      toast.error('Não há processos na rede da sessão para copiar');
      return false;
    }

    try {
      // Get existing general network processes to avoid duplicates
      const existingGeneralNames = generalNetwork.nodes.map(node => node.text.toLowerCase().trim());
      
      // Filter session processes that don't already exist in general network
      const newProcesses = sessionNetwork.nodes.filter(sessionNode => 
        !existingGeneralNames.includes(sessionNode.text.toLowerCase().trim())
      );
      
      if (newProcesses.length === 0) {
        toast.info('Todos os processos da sessão já existem na rede geral');
        return true;
      }

      // Create new general network with existing + new processes
      const updatedGeneralNetwork: NetworkData = {
        nodes: [
          ...generalNetwork.nodes,
          ...newProcesses.map(node => ({
            ...node,
            id: `general-${Date.now()}-${Math.random()}`, // New ID for general network
            x: (node.x || 0) + 50, // Offset position to avoid overlap
            y: (node.y || 0) + 50
          }))
        ],
        connections: generalNetwork.connections // Keep existing connections
      };

      const success = await saveGeneralNetwork(updatedGeneralNetwork);
      
      if (success) {
        toast.success(`${newProcesses.length} processo(s) copiado(s) para a rede geral`);
      }
      
      return success;
    } catch (err) {
      console.error('Error copying session to general:', err);
      toast.error('Erro ao copiar processos para rede geral');
      return false;
    }
  }, [sessionNetwork, generalNetwork, saveGeneralNetwork]);

  // Switch between networks with proper state management
  const switchToGeneral = useCallback(() => {
    loadGeneralNetwork();
  }, [loadGeneralNetwork]);

  const switchToSession = useCallback(() => {
    if (sessionId) {
      loadSessionNetwork();
    }
  }, [loadSessionNetwork, sessionId]);

  // Initial load
  useEffect(() => {
    loadGeneralNetwork();
    if (sessionId) {
      loadSessionNetwork();
    }
  }, [patientId, sessionId, loadGeneralNetwork, loadSessionNetwork]);

  return {
    // State
    sessionNetwork,
    generalNetwork,
    isLoadingSession,
    isLoadingGeneral,
    error,
    
    // Actions
    saveSessionNetwork,
    saveGeneralNetwork,
    copySessionToGeneral,
    switchToGeneral,
    switchToSession,
    checkDuplicateName,
    
    // Utilities
    loadSessionNetwork,
    loadGeneralNetwork
  };
};