import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  Panel,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useDebounce } from 'use-debounce';
import { NetworkNode, NetworkEdge, Network } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Save, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Plus,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CanvasErrorBoundary } from '@/components/ErrorBoundary';

// ===========================
// TYPES
// ===========================

interface OptimizedNetworkCanvasProps {
  network?: Network;
  onSave?: (networkData: Partial<Network>) => void;
  onNodeAdd?: (position: { x: number; y: number }) => void;
  onNodeEdit?: (nodeId: string, data: Partial<NetworkNode>) => void;
  onEdgeAdd?: (connection: Connection) => void;
  onEdgeEdit?: (edgeId: string, data: Partial<NetworkEdge>) => void;
  readonly?: boolean;
  className?: string;
}

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  history: { nodes: Node[]; edges: Edge[] }[];
  historyIndex: number;
}

interface NodeData {
  label: string;
  intensity?: number;
  type?: 'positive' | 'negative' | 'neutral';
  editable?: boolean;
}

// ===========================
// NODE TYPES
// ===========================

const CustomNode = memo(({ data, selected }: { data: NodeData; selected: boolean }) => {
  const getNodeColor = (type?: string, intensity?: number) => {
    const baseColors = {
      positive: 'bg-green-500',
      negative: 'bg-red-500',
      neutral: 'bg-gray-500',
    };
    
    const color = baseColors[type as keyof typeof baseColors] || baseColors.neutral;
    const opacity = intensity ? Math.max(0.3, intensity / 5) : 0.7;
    
    return { backgroundColor: color.replace('bg-', ''), opacity };
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'px-3 py-2 shadow-md rounded-lg border-2 bg-white min-w-[100px] text-center',
              selected && 'ring-2 ring-blue-500',
              !data.editable && 'opacity-75'
            )}
            style={{
              borderColor: selected ? '#3b82f6' : '#d1d5db',
            }}
          >
            <div className="text-sm font-medium text-gray-800 truncate">
              {data.label}
            </div>
            
            {data.intensity && (
              <div className="mt-1">
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={getNodeColor(data.type, data.intensity)}
                >
                  {data.intensity}/5
                </Badge>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <div><strong>Texto:</strong> {data.label}</div>
            {data.intensity && <div><strong>Intensidade:</strong> {data.intensity}/5</div>}
            {data.type && <div><strong>Tipo:</strong> {data.type}</div>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

const nodeTypes = {
  custom: CustomNode,
};

// ===========================
// UTILS
// ===========================

const convertNetworkToReactFlow = (network?: Network) => {
  if (!network) return { nodes: [], edges: [] };

  const nodes: Node[] = network.nodes.map(node => ({
    id: node.id,
    type: 'custom',
    position: node.position,
    data: {
      label: node.text,
      intensity: node.data?.intensity,
      type: node.data?.color === 'green' ? 'positive' : 
             node.data?.color === 'red' ? 'negative' : 'neutral',
      editable: true,
    } as NodeData,
    draggable: true,
  }));

  const edges: Edge[] = network.edges.map(edge => ({
    id: edge.id,
    source: edge.from,
    target: edge.to,
    type: 'smoothstep',
    animated: edge.type === 'adaptive',
    style: {
      stroke: edge.type === 'adaptive' ? '#10b981' : 
              edge.type === 'maladaptive' ? '#ef4444' : '#6b7280',
      strokeWidth: Math.max(1, (edge.intensity || 1) * 2),
    },
    data: {
      intensity: edge.intensity,
      type: edge.type,
      bidirectional: edge.bidirectional,
    },
  }));

  return { nodes, edges };
};

const convertReactFlowToNetwork = (nodes: Node[], edges: Edge[]): Partial<Network> => {
  const networkNodes: NetworkNode[] = nodes.map(node => ({
    id: node.id,
    text: node.data.label,
    position: node.position,
    data: {
      label: node.data.label,
      intensity: node.data.intensity,
      color: node.data.type === 'positive' ? 'green' : 
             node.data.type === 'negative' ? 'red' : 'gray',
    },
  }));

  const networkEdges: NetworkEdge[] = edges.map(edge => ({
    id: edge.id,
    from: edge.source,
    to: edge.target,
    type: edge.data?.type || 'neutral',
    intensity: edge.data?.intensity || 1,
    bidirectional: edge.data?.bidirectional || false,
  }));

  return {
    nodes: networkNodes,
    edges: networkEdges,
  };
};

// ===========================
// MAIN COMPONENT
// ===========================

export const OptimizedNetworkCanvas: React.FC<OptimizedNetworkCanvasProps> = memo(({
  network,
  onSave,
  onNodeAdd,
  onNodeEdit,
  onEdgeAdd,
  onEdgeEdit,
  readonly = false,
  className,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  // Estado inicial do canvas
  const initialFlow = useMemo(() => convertNetworkToReactFlow(network), [network]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);
  
  // Estado da UI
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [isModified, setIsModified] = useState(false);
  
  // Histórico para undo/redo
  const [history, setHistory] = useState<CanvasState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Debounced save
  const [debouncedNodes] = useDebounce(nodes, 2000);
  const [debouncedEdges] = useDebounce(edges, 2000);
  
  // Auto-save com debounce
  React.useEffect(() => {
    if (autoSave && !readonly && isModified && onSave) {
      const networkData = convertReactFlowToNetwork(debouncedNodes, debouncedEdges);
      onSave(networkData);
      setIsModified(false);
    }
  }, [debouncedNodes, debouncedEdges, autoSave, readonly, isModified, onSave]);
  
  // Salvar no histórico
  const saveToHistory = useCallback(() => {
    const newState: CanvasState = {
      nodes: [...nodes],
      edges: [...edges],
      history: [],
      historyIndex: 0,
    };
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, newState].slice(-50); // Limite de 50 estados
    });
    setHistoryIndex(prev => prev + 1);
  }, [nodes, edges, historyIndex]);
  
  // Handlers de modificação
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    setIsModified(true);
    
    // Salvar histórico apenas para mudanças significativas
    if (changes.some(change => change.type === 'position' && !change.dragging)) {
      saveToHistory();
    }
  }, [onNodesChange, saveToHistory]);
  
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);
    setIsModified(true);
    saveToHistory();
  }, [onEdgesChange, saveToHistory]);
  
  // Adicionar conexão
  const onConnect = useCallback((params: Connection) => {
    const newEdge = {
      ...params,
      id: `edge-${Date.now()}`,
      type: 'smoothstep',
      data: { intensity: 3, type: 'neutral' },
    };
    
    setEdges(eds => addEdge(newEdge as Edge, eds));
    setIsModified(true);
    saveToHistory();
    
    if (onEdgeAdd) {
      onEdgeAdd(params);
    }
  }, [setEdges, saveToHistory, onEdgeAdd]);
  
  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);
  
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);
  
  // Adicionar nó
  const addNode = useCallback((event?: React.MouseEvent) => {
    if (!reactFlowInstance || readonly) return;
    
    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds) return;
    
    const position = reactFlowInstance.project({
      x: (event?.clientX || bounds.width / 2) - bounds.left,
      y: (event?.clientY || bounds.height / 2) - bounds.top,
    });
    
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position,
      data: {
        label: 'Novo nó',
        intensity: 3,
        type: 'neutral',
        editable: true,
      } as NodeData,
    };
    
    setNodes(nds => [...nds, newNode]);
    setIsModified(true);
    saveToHistory();
    
    if (onNodeAdd) {
      onNodeAdd(position);
    }
  }, [reactFlowInstance, readonly, setNodes, saveToHistory, onNodeAdd]);
  
  // Save manual
  const handleManualSave = useCallback(() => {
    if (onSave && !readonly) {
      const networkData = convertReactFlowToNetwork(nodes, edges);
      onSave(networkData);
      setIsModified(false);
    }
  }, [nodes, edges, onSave, readonly]);
  
  // Reset view
  const resetView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  }, [reactFlowInstance]);
  
  return (
    <CanvasErrorBoundary onError={() => console.error('Erro no canvas de rede')}>
      <Card className={cn('h-full flex flex-col', className)}>
        <CardContent className="flex-1 p-0 relative">
          {/* Toolbar */}
          <Panel position="top-left" className="m-2">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
              {!readonly && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addNode}
                    title="Adicionar nó"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    title="Desfazer"
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    title="Refazer"
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant={isModified ? "default" : "outline"}
                    onClick={handleManualSave}
                    disabled={!isModified}
                    title="Salvar"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={resetView}
                title="Resetar visão"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowMiniMap(!showMiniMap)}
                title="Toggle minimapa"
              >
                {showMiniMap ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </Panel>
          
          {/* Status */}
          {isModified && !readonly && (
            <Panel position="top-right" className="m-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Não salvo
              </Badge>
            </Panel>
          )}
          
          {/* React Flow */}
          <div ref={reactFlowWrapper} className="h-full w-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              attributionPosition="bottom-left"
              maxZoom={2}
              minZoom={0.1}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              deleteKeyCode="Delete"
              multiSelectionKeyCode="Shift"
              panOnScroll
              selectionOnDrag
              panOnDrag={[1, 2]}
              selectionMode="partial"
            >
              <Background 
                variant={BackgroundVariant.Dots} 
                gap={20} 
                size={1} 
                color="#e5e7eb"
              />
              
              <Controls 
                position="bottom-left"
                showInteractive={false}
              />
              
              {showMiniMap && (
                <MiniMap
                  position="bottom-right"
                  nodeColor="#e5e7eb"
                  maskColor="rgba(0,0,0,0.1)"
                  pannable
                  zoomable
                />
              )}
            </ReactFlow>
          </div>
        </CardContent>
      </Card>
    </CanvasErrorBoundary>
  );
});

OptimizedNetworkCanvas.displayName = 'OptimizedNetworkCanvas';
