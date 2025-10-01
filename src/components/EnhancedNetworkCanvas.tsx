import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Plus, 
  Trash2, 
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Grid,
  Info,
  Move,
  RotateCw,
  MousePointer,
  ArrowRight,
  CornerDownRight,
  Minus
} from "lucide-react";
import { toast } from "sonner";

// Dimensões e Níveis do EEMM conforme especificação
const EEMM_DIMENSIONS = {
  cognition: {
    name: "Cognição",
    color: "bg-blue-100 border-blue-300 text-blue-800",
    description: "Processos de pensamento, crenças e percepções"
  },
  emotion: {
    name: "Emoção",
    color: "bg-red-100 border-red-300 text-red-800",
    description: "Estados emocionais e regulação afetiva"
  },
  self: {
    name: "Self",
    color: "bg-green-100 border-green-300 text-green-800",
    description: "Identidade, autoconceito e autoestima"
  },
  motivation: {
    name: "Motivação",
    color: "bg-yellow-100 border-yellow-300 text-yellow-800",
    description: "Valores, objetivos e direcionamento comportamental"
  },
  behavior: {
    name: "Comportamento Explícito",
    color: "bg-purple-100 border-purple-300 text-purple-800",
    description: "Ações observáveis e padrões comportamentais"
  }
};

const EEMM_LEVELS = {
  biology: {
    name: "Biologia/Fisiologia",
    description: "Processos biológicos, genéticos e fisiológicos"
  },
  psychology: {
    name: "Psicologia",
    description: "Processos psicológicos individuais"
  },
  social: {
    name: "Relacionamentos Sociais/Cultura",
    description: "Contexto social, cultural e interpessoal"
  }
};

// Tipos de conexão conforme imagem anexa
const CONNECTION_TYPES = {
  maladaptive: {
    name: "Maladaptativa",
    strokeStyle: "solid",
    color: "#ef4444",
    dashArray: "",
    description: "Relação prejudicial ou disfuncional"
  },
  unchanged: {
    name: "Sem mudança",
    strokeStyle: "dotted",
    color: "#6b7280",
    dashArray: "2,2",
    description: "Relação estável sem alteração"
  },
  adaptive: {
    name: "Adaptativa",
    strokeStyle: "solid",
    color: "#10b981",
    dashArray: "",
    description: "Relação benéfica ou funcional"
  }
};

interface ProcessNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  dimension: keyof typeof EEMM_DIMENSIONS;
  level: keyof typeof EEMM_LEVELS;
  intensity: number; // 1-5
  frequency: number; // 1-5
}

interface Connection {
  id: string;
  from: string;
  to: string;
  type: keyof typeof CONNECTION_TYPES;
  strength: number; // 1-5
  description?: string;
}

interface NetworkCanvasProps {
  networkData?: {
    nodes: ProcessNode[];
    connections: Connection[];
  };
  onSave?: (data: { nodes: ProcessNode[]; connections: Connection[] }) => void;
  readOnly?: boolean;
}

type ToolMode = 'select' | 'connect_maladaptive' | 'connect_unchanged' | 'connect_adaptive';

export const EnhancedNetworkCanvas: React.FC<NetworkCanvasProps> = ({
  networkData,
  onSave,
  readOnly = false
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<ProcessNode[]>(networkData?.nodes || []);
  const [connections, setConnections] = useState<Connection[]>(networkData?.connections || []);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [resizingNode, setResizingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [history, setHistory] = useState<{ nodes: ProcessNode[], connections: Connection[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
  // Node creation form
  const [newNode, setNewNode] = useState({
    text: '',
    dimension: 'cognition' as keyof typeof EEMM_DIMENSIONS,
    level: 'psychology' as keyof typeof EEMM_LEVELS,
    intensity: 3,
    frequency: 3,
  });

  // Save state to history
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], connections: [...connections] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, connections, history, historyIndex]);

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setConnections(prevState.connections);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setConnections(nextState.connections);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Add new node
  const addNode = () => {
    if (!newNode.text.trim()) {
      toast.error("Digite o texto do processo");
      return;
    }

    const node: ProcessNode = {
      id: `node-${Date.now()}`,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 180,
      height: 100,
      text: newNode.text,
      dimension: newNode.dimension,
      level: newNode.level,
      intensity: newNode.intensity,
      frequency: newNode.frequency,
    };

    saveToHistory();
    setNodes([...nodes, node]);
    setNewNode({ ...newNode, text: '' });
    toast.success("Processo adicionado");
  };

  // Delete node
  const deleteNode = (nodeId: string) => {
    saveToHistory();
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
    setSelectedNode(null);
    toast.success("Processo removido");
  };

  // Start creating connection
  const startConnection = (nodeId: string, type: keyof typeof CONNECTION_TYPES) => {
    setToolMode(`connect_${type}` as ToolMode);
    setConnectionStart(nodeId);
  };

  // Complete connection
  const completeConnection = (endNodeId: string) => {
    if (connectionStart && connectionStart !== endNodeId) {
      const connectionType = toolMode.replace('connect_', '') as keyof typeof CONNECTION_TYPES;
      const connection: Connection = {
        id: `conn-${Date.now()}`,
        from: connectionStart,
        to: endNodeId,
        type: connectionType,
        strength: 3,
      };
      
      saveToHistory();
      setConnections([...connections, connection]);
      toast.success("Conexão criada");
    }
    
    setToolMode('select');
    setConnectionStart(null);
  };

  // Get connection coordinates
  const getConnectionCoordinates = (connection: Connection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return null;

    // Calculate connection points on node edges
    const fromCenterX = fromNode.x + fromNode.width / 2;
    const fromCenterY = fromNode.y + fromNode.height / 2;
    const toCenterX = toNode.x + toNode.width / 2;
    const toCenterY = toNode.y + toNode.height / 2;

    // Calculate angle and edge points
    const angle = Math.atan2(toCenterY - fromCenterY, toCenterX - fromCenterX);
    
    const fromX = fromCenterX + Math.cos(angle) * (fromNode.width / 2);
    const fromY = fromCenterY + Math.sin(angle) * (fromNode.height / 2);
    const toX = toCenterX - Math.cos(angle) * (toNode.width / 2);
    const toY = toCenterY - Math.sin(angle) * (toNode.height / 2);

    return { fromX, fromY, toX, toY };
  };

  // Get arrow marker for connection type
  const getArrowMarker = (type: keyof typeof CONNECTION_TYPES) => {
    const connectionConfig = CONNECTION_TYPES[type];
    return `url(#arrow-${type})`;
  };

  // Mouse handlers for dragging and resizing
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (readOnly) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = (e.clientX - rect.left - pan.x) / scale;
    const clickY = (e.clientY - rect.top - pan.y) / scale;
    
    if (toolMode !== 'select') {
      if (toolMode.startsWith('connect_')) {
        completeConnection(nodeId);
        return;
      }
    }

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Check if clicking on resize handle
    const rightEdge = node.x + node.width;
    const bottomEdge = node.y + node.height;
    const handleSize = 8;
    
    if (clickX >= rightEdge - handleSize && clickX <= rightEdge + handleSize &&
        clickY >= bottomEdge - handleSize && clickY <= bottomEdge + handleSize) {
      setResizingNode(nodeId);
      setResizeHandle('bottom-right');
      return;
    }

    // Start dragging
    setDraggedNode(nodeId);
    setDragOffset({
      x: clickX - node.x,
      y: clickY - node.y,
    });
    setSelectedNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (readOnly) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = (e.clientX - rect.left - pan.x) / scale;
    const currentY = (e.clientY - rect.top - pan.y) / scale;

    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (resizingNode) {
      const node = nodes.find(n => n.id === resizingNode);
      if (node) {
        const newWidth = Math.max(120, currentX - node.x);
        const newHeight = Math.max(60, currentY - node.y);
        
        setNodes(nodes.map(n => 
          n.id === resizingNode 
            ? { ...n, width: newWidth, height: newHeight }
            : n
        ));
      }
      return;
    }

    if (draggedNode) {
      const x = Math.max(0, currentX - dragOffset.x);
      const y = Math.max(0, currentY - dragOffset.y);

      setNodes(nodes.map(node => 
        node.id === draggedNode 
          ? { ...node, x, y }
          : node
      ));
    }
  };

  const handleMouseUp = () => {
    if (draggedNode || resizingNode) {
      saveToHistory();
      setDraggedNode(null);
      setResizingNode(null);
      setResizeHandle(null);
    }
    
    if (isPanning) {
      setIsPanning(false);
    }
  };

  // Canvas panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-background')) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      setSelectedNode(null);
      setSelectedConnection(null);
    }
  };

  // Delete connection
  const deleteConnection = (connectionId: string) => {
    saveToHistory();
    setConnections(connections.filter(c => c.id !== connectionId));
    setSelectedConnection(null);
    toast.success("Conexão removida");
  };

  // Save network
  const handleSave = () => {
    if (onSave) {
      onSave({ nodes, connections });
      toast.success("Rede salva com sucesso");
    }
  };

  // Zoom functions
  const zoomIn = () => setScale(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev * 0.8, 0.3));
  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  // Initialize history on first render
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ nodes: [...nodes], connections: [...connections] }]);
      setHistoryIndex(0);
    }
  }, []);

  // Memoized arrow markers
  const arrowMarkers = useMemo(() => (
    <defs>
      {Object.entries(CONNECTION_TYPES).map(([key, config]) => (
        <marker
          key={key}
          id={`arrow-${key}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon 
            points="0 0, 10 3.5, 0 7" 
            fill={config.color}
          />
        </marker>
      ))}
    </defs>
  ), []);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {!readOnly && (
        <Card className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Node Creation */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Processo
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Dimensão</Label>
                  <Select 
                    value={newNode.dimension} 
                    onValueChange={(value) => setNewNode({ ...newNode, dimension: value as keyof typeof EEMM_DIMENSIONS })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EEMM_DIMENSIONS).map(([key, dim]) => (
                        <SelectItem key={key} value={key}>
                          {dim.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Nível</Label>
                  <Select 
                    value={newNode.level} 
                    onValueChange={(value) => setNewNode({ ...newNode, level: value as keyof typeof EEMM_LEVELS })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EEMM_LEVELS).map(([key, level]) => (
                        <SelectItem key={key} value={key}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Input
                placeholder="Descreva o processo psicológico..."
                value={newNode.text}
                onChange={(e) => setNewNode({ ...newNode, text: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && addNode()}
              />
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Intensidade: {newNode.intensity}</Label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={newNode.intensity}
                    onChange={(e) => setNewNode({ ...newNode, intensity: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>Frequência: {newNode.frequency}</Label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={newNode.frequency}
                    onChange={(e) => setNewNode({ ...newNode, frequency: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
              
              <Button onClick={addNode} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Processo
              </Button>
            </div>
            
            {/* Tools and Controls */}
            <div className="space-y-4">
              <h3 className="font-semibold">Ferramentas</h3>
              
              {/* Tool Selection */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={toolMode === 'select' ? 'default' : 'outline'}
                  onClick={() => setToolMode('select')}
                  className="flex items-center gap-2"
                >
                  <MousePointer className="h-4 w-4" />
                  Selecionar
                </Button>
                <Button
                  variant={toolMode === 'connect_maladaptive' ? 'default' : 'outline'}
                  onClick={() => setToolMode('connect_maladaptive')}
                  className="flex items-center gap-2 text-red-600"
                >
                  <ArrowRight className="h-4 w-4" />
                  Maladaptativa
                </Button>
                <Button
                  variant={toolMode === 'connect_unchanged' ? 'default' : 'outline'}
                  onClick={() => setToolMode('connect_unchanged')}
                  className="flex items-center gap-2 text-gray-600"
                >
                  <Minus className="h-4 w-4" />
                  Sem mudança
                </Button>
                <Button
                  variant={toolMode === 'connect_adaptive' ? 'default' : 'outline'}
                  onClick={() => setToolMode('connect_adaptive')}
                  className="flex items-center gap-2 text-green-600"
                >
                  <CornerDownRight className="h-4 w-4" />
                  Adaptativa
                </Button>
              </div>
              
              {/* View Controls */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={undo} disabled={historyIndex <= 0}>
                  <Undo className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1}>
                  <Redo className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={resetView}>
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button 
                  variant={showGrid ? "default" : "outline"} 
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
              
              <Button onClick={handleSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Rede
              </Button>
              
              {toolMode.startsWith('connect_') && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <ArrowRight className="h-4 w-4 inline mr-1" />
                    Clique no processo de destino para criar conexão {CONNECTION_TYPES[toolMode.replace('connect_', '') as keyof typeof CONNECTION_TYPES].name.toLowerCase()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Connection Types Legend */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4" />
          <h3 className="font-semibold">Tipos de Conexão</h3>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {Object.entries(CONNECTION_TYPES).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="flex items-center">
                <div 
                  className="w-8 h-0.5" 
                  style={{ 
                    backgroundColor: config.color,
                    borderStyle: config.strokeStyle === 'dotted' ? 'dotted' : 'solid',
                    borderWidth: config.strokeStyle === 'dotted' ? '1px 0' : '0'
                  }}
                />
                <div 
                  className="w-0 h-0 ml-1"
                  style={{
                    borderLeft: `4px solid ${config.color}`,
                    borderTop: '3px solid transparent',
                    borderBottom: '3px solid transparent'
                  }}
                />
              </div>
              <span className="text-sm font-medium">{config.name}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Canvas */}
      <Card className="relative overflow-hidden" style={{ height: '700px' }}>
        <div
          ref={canvasRef}
          className="w-full h-full relative cursor-crosshair canvas-background"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseDown={handleCanvasMouseDown}
          style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Grid */}
          {showGrid && (
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ccc" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          )}
          
          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {arrowMarkers}
            {connections.map(connection => {
              const coords = getConnectionCoordinates(connection);
              if (!coords) return null;
              
              const config = CONNECTION_TYPES[connection.type];
              
              return (
                <g key={connection.id}>
                  <line
                    x1={coords.fromX}
                    y1={coords.fromY}
                    x2={coords.toX}
                    y2={coords.toY}
                    stroke={config.color}
                    strokeWidth={connection.strength}
                    strokeDasharray={config.dashArray}
                    fill="none"
                    markerEnd={getArrowMarker(connection.type)}
                    className="pointer-events-auto cursor-pointer"
                    onClick={() => setSelectedConnection(connection.id)}
                  />
                  {selectedConnection === connection.id && !readOnly && (
                    <circle
                      cx={(coords.fromX + coords.toX) / 2}
                      cy={(coords.fromY + coords.toY) / 2}
                      r="8"
                      fill="red"
                      className="pointer-events-auto cursor-pointer"
                      onClick={() => deleteConnection(connection.id)}
                    >
                      <title>Clique para excluir conexão</title>
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>
          
          {/* Nodes */}
          {nodes.map(node => {
            const dimension = EEMM_DIMENSIONS[node.dimension];
            const isSelected = selectedNode === node.id;
            const isDragging = draggedNode === node.id;
            
            return (
              <div
                key={node.id}
                className={`absolute border-2 rounded-lg p-3 cursor-pointer select-none transition-all ${
                  dimension.color
                } ${
                  isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
                }`}
                style={{
                  left: node.x,
                  top: node.y,
                  width: node.width,
                  height: node.height,
                  opacity: isDragging ? 0.7 : 1,
                  zIndex: isSelected ? 10 : 1,
                }}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
              >
                <div className="text-xs font-medium mb-1 text-center">
                  {dimension.name} | {EEMM_LEVELS[node.level].name}
                </div>
                <div 
                  className="text-sm font-medium mb-2 overflow-hidden text-center"
                  style={{ 
                    height: `${node.height - 60}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {node.text}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>I:{node.intensity} F:{node.frequency}</span>
                  {!readOnly && isSelected && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                {/* Resize handle */}
                {!readOnly && isSelected && (
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-tl cursor-nw-resize"
                    style={{ transform: 'translate(50%, 50%)' }}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Zoom indicator */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
          {Math.round(scale * 100)}%
        </div>
      </Card>
      
      {/* Stats */}
      {nodes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-3">
            <div className="text-lg font-bold">{nodes.length}</div>
            <div className="text-sm text-muted-foreground">Processos</div>
          </Card>
          <Card className="p-3">
            <div className="text-lg font-bold">{connections.length}</div>
            <div className="text-sm text-muted-foreground">Conexões</div>
          </Card>
          <Card className="p-3">
            <div className="text-lg font-bold">
              {(nodes.reduce((sum, node) => sum + node.intensity, 0) / nodes.length).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Intensidade Média</div>
          </Card>
          <Card className="p-3">
            <div className="text-lg font-bold">
              {new Set(nodes.map(n => n.dimension)).size}/5
            </div>
            <div className="text-sm text-muted-foreground">Dimensões Ativas</div>
          </Card>
        </div>
      )}
    </div>
  );
};