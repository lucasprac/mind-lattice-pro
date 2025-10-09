import React from 'react';
import { OptimizedNetworkCanvas } from './OptimizedNetworkCanvas';
import { NetworkData } from '@/hooks/useSessionNetwork';

// EEMM Dimensions mapping
const EEMM_DIMENSIONS = {
  cognition: 'cognition',
  emotion: 'emotion', 
  attention: 'attention',
  self: 'self',
  motivation: 'motivation',
  behavior: 'behavior'
} as const;

const EEMM_LEVELS = {
  biology: 'biology',
  psychology: 'psychology', 
  social: 'social'
} as const;

type EEMMDimension = keyof typeof EEMM_DIMENSIONS;
type EEMMLevel = keyof typeof EEMM_LEVELS;

// Interface que o OptimizedNetworkCanvas espera
interface ProcessNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  dimension: EEMMDimension;
  level: EEMMLevel;
  intensity: number;
  frequency: number;
}

type ConnectionType = 'maladaptive' | 'unchanged' | 'adaptive';
type MarkerType = 'arrow' | 'line' | 'circle';

interface Connection {
  id: string;
  from: string;
  to: string;
  type: ConnectionType;
  strength: number;
  ambivalent: boolean;
  startMarker: MarkerType;
  endMarker: MarkerType;
}

interface NetworkCanvasAdapterProps {
  networkData: NetworkData;
  onSave: (data: NetworkData) => void;
  readOnly?: boolean;
}

// Função para mapear os dados do hook para o formato esperado pelo componente
const mapNetworkDataToCanvas = (networkData: NetworkData): {
  nodes: ProcessNode[];
  connections: Connection[];
} => {
  // Mapeia os nodes
  const mappedNodes: ProcessNode[] = networkData.nodes.map(node => ({
    id: node.id,
    x: node.x,
    y: node.y,
    width: 220, // Valor padrão
    height: 120, // Valor padrão
    text: node.text,
    dimension: 'cognition' as EEMMDimension, // Valor padrão
    level: 'psychology' as EEMMLevel, // Valor padrão
    intensity: 3, // Valor padrão
    frequency: 3, // Valor padrão
  }));

  // Mapeia as connections
  const mappedConnections: Connection[] = networkData.connections.map(connection => ({
    id: connection.id,
    from: connection.source_node_id,
    to: connection.target_node_id,
    type: 'unchanged' as ConnectionType, // Valor padrão
    strength: 3, // Valor padrão
    ambivalent: false,
    startMarker: 'line' as MarkerType,
    endMarker: 'arrow' as MarkerType,
  }));

  return {
    nodes: mappedNodes,
    connections: mappedConnections
  };
};

// Função para mapear os dados do componente de volta para o formato do hook
const mapCanvasDataToNetwork = (canvasData: {
  nodes: ProcessNode[];
  connections: Connection[];
}): NetworkData => {
  // Mapeia os nodes de volta
  const mappedNodes = canvasData.nodes.map(node => ({
    id: node.id,
    text: node.text,
    x: node.x,
    y: node.y,
    type: 'process', // Valor padrão
    description: '',
  }));

  // Mapeia as connections de volta
  const mappedConnections = canvasData.connections.map(connection => ({
    id: connection.id,
    source_node_id: connection.from,
    target_node_id: connection.to,
    type: connection.type,
    description: `Strength: ${connection.strength}`,
  }));

  return {
    nodes: mappedNodes,
    connections: mappedConnections
  };
};

export const NetworkCanvasAdapter: React.FC<NetworkCanvasAdapterProps> = ({
  networkData,
  onSave,
  readOnly = false
}) => {
  const canvasData = mapNetworkDataToCanvas(networkData);

  const handleSave = (updatedCanvasData: { nodes: ProcessNode[]; connections: Connection[] }) => {
    const networkData = mapCanvasDataToNetwork(updatedCanvasData);
    onSave(networkData);
  };

  return (
    <OptimizedNetworkCanvas
      networkData={canvasData}
      onSave={handleSave}
      readOnly={readOnly}
    />
  );
};
