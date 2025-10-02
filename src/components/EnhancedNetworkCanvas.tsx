import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  ArrowRight,
  Minus,
  Circle,
  X,
  Link2
} from "lucide-react";
import { toast } from "sonner";

// EEMM Dimensions and Levels
const EEMM_DIMENSIONS = {
  cognition: {
    name: "Cognição",
    color: "bg-blue-100 border-blue-400 text-blue-900",
  },
  emotion: {
    name: "Emoção",
    color: "bg-red-100 border-red-400 text-red-900",
  },
  self: {
    name: "Self",
    color: "bg-green-100 border-green-400 text-green-900",
  },
  motivation: {
    name: "Motivação",
    color: "bg-yellow-100 border-yellow-400 text-yellow-900",
  },
  behavior: {
    name: "Comportamento",
    color: "bg-purple-100 border-purple-400 text-purple-900",
  }
};

const EEMM_LEVELS = {
  biology: { name: "Biologia/Fisiologia" },
  psychology: { name: "Psicologia" },
  social: { name: "Social/Cultural" }
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
  intensity: number;
  frequency: number;
}

type ConnectionType = 'maladaptive' | 'unchanged' | 'adaptive';

interface Connection {
  id: string;
  from: string;
  to: string;
  type: ConnectionType;
  strength: number;
}

interface NetworkCanvasProps {
  networkData?: {
    nodes: ProcessNode[];
    connections: Connection[];
  };
  onSave?: (data: { nodes: ProcessNode[]; connections: Connection[] }) => void;
  readOnly?: boolean;
}

export const EnhancedNetworkCanvas: React.FC<NetworkCanvasProps> = ({
  networkData,
  onSave,
  readOnly = false
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<ProcessNode[]>(networkData?.nodes || []);
  const [connections, setConnections] = useState<Connection[]>(networkData?.connections || []);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [resizingNode, setResizingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<{ nodes: ProcessNode[], connections: Connection[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Connection creation state
  const [connectionMode, setConnectionMode] = useState<ConnectionType | null>(null);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [showConnectionMenu, setShowConnectionMenu] = useState<string | null>(null);
  
  // New node form
  const [newNode, setNewNode] = useState({
    text: '',
    dimension: 'cognition' as keyof typeof EEMM_DIMENSIONS,
    level: 'psychology' as keyof typeof EEMM_LEVELS,
    intensity: 3,
    frequency: 3,
  });

  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], connections: [...connections] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, connections, history, historyIndex]);

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

  const addNode = () => {
    if (!newNode.text.trim()) {
      toast.error("Digite o texto do processo");
      return;
    }

    const node: ProcessNode = {
      id: `node-${Date.now()}`,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 220,
      height: 80,
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

  const deleteNode = (nodeId: string) => {
    saveToHistory();
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
    setSelectedNode(null);
    toast.success("Processo removido");
  };

  const startConnectionFromNode = (nodeId: string, type: ConnectionType) => {
    setConnectionMode(type);
    setConnectionStart(nodeId);
    setShowConnectionMenu(null);
    toast.info(`Selecione o processo destino para conexão ${type === 'maladaptive' ? 'mal adaptativa' : type === 'adaptive' ? 'adaptativa' : 'sem mudança'}`);
  };

  const completeConnection = (endNodeId: string) => {
    if (connectionStart && connectionStart !== endNodeId && connectionMode) {
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        from: connectionStart,
        to: endNodeId,
        type: connectionMode,
        strength: 3,
      };
      
      saveToHistory();
      // Force immediate update
      setConnections(prevConnections => [...prevConnections, newConnection]);
      toast.success("Conexão criada");
    }
    
    setConnectionMode(null);
    setConnectionStart(null);
  };

  const deleteConnection = (connId: string) => {
    saveToHistory();
    setConnections(connections.filter(c => c.id !== connId));
    toast.success("Conexão removida");
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (readOnly) return;
    
    if (connectionMode && connectionStart) {
      completeConnection(nodeId);
      return;
    }

    e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setDraggedNode(nodeId);
    setDragOffset({
      x: (e.clientX - rect.left - pan.x) / scale - node.x,
      y: (e.clientY - rect.top - pan.y) / scale - node.y,
    });
    setSelectedNode(nodeId);
  };

  const handleResizeStart = (e: React.MouseEvent, nodeId: string) => {
    if (readOnly) return;
    e.stopPropagation();
    setResizingNode(nodeId);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !draggedNode && !resizingNode) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (readOnly) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggedNode) {
      const x = (e.clientX - rect.left - pan.x) / scale - dragOffset.x;
      const y = (e.clientY - rect.top - pan.y) / scale - dragOffset.y;

      setNodes(nodes.map(node => 
        node.id === draggedNode 
          ? { ...node, x: Math.max(0, x), y: Math.max(0, y) }
          : node
      ));
    }

    if (resizingNode) {
      const node = nodes.find(n => n.id === resizingNode);
      if (!node) return;

      const mouseX = (e.clientX - rect.left - pan.x) / scale;
      const mouseY = (e.clientY - rect.top - pan.y) / scale;

      const newWidth = Math.max(150, mouseX - node.x);
      const newHeight = Math.max(60, mouseY - node.y);

      setNodes(nodes.map(n => 
        n.id === resizingNode 
          ? { ...n, width: newWidth, height: newHeight }
          : n
      ));
    }
  };

  const handleMouseUp = () => {
    if (draggedNode || resizingNode) {
      saveToHistory();
    }
    setDraggedNode(null);
    setResizingNode(null);
    setIsPanning(false);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ nodes, connections });
      toast.success("Rede salva com sucesso");
    }
  };

  const getConnectionPath = (connection: Connection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return '';

    // Calculate center points
    const fromCenterX = fromNode.x + fromNode.width / 2;
    const fromCenterY = fromNode.y + fromNode.height / 2;
    const toCenterX = toNode.x + toNode.width / 2;
    const toCenterY = toNode.y + toNode.height / 2;

    // Calculate angle between centers
    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;
    const angle = Math.atan2(dy, dx);

    // Calculate edge points (where line intersects the box borders)
    // For 'from' node
    const fromEdgeX = fromCenterX + Math.cos(angle) * (fromNode.width / 2);
    const fromEdgeY = fromCenterY + Math.sin(angle) * (fromNode.height / 2);

    // For 'to' node (opposite direction, with offset for arrow visibility)
    const arrowOffset = 15; // Offset to ensure arrow is visible outside the box
    const toEdgeX = toCenterX - Math.cos(angle) * (toNode.width / 2 + arrowOffset);
    const toEdgeY = toCenterY - Math.sin(angle) * (toNode.height / 2 + arrowOffset);

    return `M ${fromEdgeX} ${fromEdgeY} L ${toEdgeX} ${toEdgeY}`;
  };

  const getConnectionColor = (type: ConnectionType) => {
    switch (type) {
      case 'maladaptive': return 'stroke-red-500';
      case 'adaptive': return 'stroke-green-500';
      case 'unchanged': return 'stroke-gray-400';
    }
  };

  const getConnectionStyle = (type: ConnectionType) => {
    return type === 'unchanged' ? '5,5' : '0';
  };

  const getMarkerEnd = (type: ConnectionType) => {
    switch (type) {
      case 'maladaptive': return 'url(#arrow-maladaptive)';
      case 'adaptive': return 'url(#arrow-adaptive)';
      case 'unchanged': return 'url(#arrow-unchanged)';
    }
  };

  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ nodes: [...nodes], connections: [...connections] }]);
      setHistoryIndex(0);
    }
  }, []);

  return (
    <div className="space-y-4">
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
              
              <Button onClick={addNode} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Processo
              </Button>
            </div>
            
            {/* Controls */}
            <div className="space-y-4">
              <h3 className="font-semibold">Controles</h3>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                  <Undo className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
                  <Redo className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setScale(Math.min(scale * 1.2, 3))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setScale(Math.max(scale * 0.8, 0.3))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
              
              <Button onClick={handleSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Rede
              </Button>
              
              {connectionMode && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-800">
                      <Link2 className="h-4 w-4 inline mr-1" />
                      Clique no processo destino
                    </p>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setConnectionMode(null);
                        setConnectionStart(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Connection Types Legend */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Tipos de Conexão</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <svg width="40" height="2">
              <line x1="0" y1="1" x2="40" y2="1" className="stroke-red-500" strokeWidth="2" />
            </svg>
            <ArrowRight className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">Maladaptativa</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="40" height="2">
              <line x1="0" y1="1" x2="40" y2="1" className="stroke-gray-400" strokeWidth="2" strokeDasharray="3,3" />
            </svg>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">Sem mudança</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="40" height="2">
              <line x1="0" y1="1" x2="40" y2="1" className="stroke-green-500" strokeWidth="2" />
            </svg>
            <Circle className="h-4 w-4 text-green-500 fill-green-500" />
            <span className="text-sm font-medium">Adaptativa</span>
          </div>
        </div>
      </Card>

      {/* Canvas */}
      <Card className="relative overflow-hidden bg-gray-50" style={{ height: '700px' }}>
        <div
          ref={canvasRef}
          className="w-full h-full relative cursor-move"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              width: '3000px',
              height: '3000px',
              position: 'absolute',
            }}
          >
            {/* SVG for connections */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <defs>
                <marker
                  id="arrow-maladaptive"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
                </marker>
                <marker
                  id="arrow-adaptive"
                  markerWidth="10"
                  markerHeight="10"
                  refX="5"
                  refY="5"
                  orient="auto"
                >
                  <circle cx="5" cy="5" r="4" fill="#22c55e" />
                </marker>
                <marker
                  id="arrow-unchanged"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L9,3 z" fill="#9ca3af" />
                </marker>
              </defs>
              
              {connections.map((connection) => {
                const path = getConnectionPath(connection);
                if (!path) return null;
                
                return (
                  <g key={connection.id}>
                    <path
                      d={path}
                      className={getConnectionColor(connection.type)}
                      strokeWidth={2.5}
                      fill="none"
                      strokeDasharray={getConnectionStyle(connection.type)}
                      markerEnd={getMarkerEnd(connection.type)}
                      style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                      onClick={() => !readOnly && deleteConnection(connection.id)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => {
              const dimensionStyles = EEMM_DIMENSIONS[node.dimension];
              const isSelected = selectedNode === node.id;
              
              return (
                <div
                  key={node.id}
                  className={`absolute border-2 rounded-lg p-3 cursor-move shadow-md transition-all ${dimensionStyles.color} ${
                    isSelected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
                  }`}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: node.width,
                    height: node.height,
                    zIndex: isSelected ? 10 : 5,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                >
                  <div className="flex items-start justify-between gap-2 h-full">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium break-words">{node.text}</p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {EEMM_LEVELS[node.level].name}
                        </Badge>
                      </div>
                    </div>
                    
                    {!readOnly && (
                      <div className="flex flex-col gap-1 shrink-0">
                        {/* Connection button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowConnectionMenu(showConnectionMenu === node.id ? null : node.id);
                                }}
                              >
                                <Link2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Criar Conexão</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        {/* Delete button */}
                        {isSelected && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNode(node.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Connection menu */}
                  {showConnectionMenu === node.id && !readOnly && (
                    <div 
                      className="absolute top-full left-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg p-2 z-50 flex flex-col gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => startConnectionFromNode(node.id, 'maladaptive')}
                      >
                        <ArrowRight className="h-3 w-3 mr-2" />
                        Maladaptativa
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="justify-start text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                        onClick={() => startConnectionFromNode(node.id, 'unchanged')}
                      >
                        <Minus className="h-3 w-3 mr-2" />
                        Sem mudança
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => startConnectionFromNode(node.id, 'adaptive')}
                      >
                        <Circle className="h-3 w-3 mr-2" />
                        Adaptativa
                      </Button>
                    </div>
                  )}
                  
                  {/* Resize handle */}
                  {isSelected && !readOnly && (
                    <div
                      className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-tl cursor-nwse-resize"
                      onMouseDown={(e) => handleResizeStart(e, node.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};
