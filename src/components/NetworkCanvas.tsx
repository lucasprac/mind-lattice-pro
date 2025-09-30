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
  Link, 
  Move, 
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Grid,
  Info
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
  type: 'causal' | 'functional' | 'bidirectional';
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

export const NetworkCanvas: React.FC<NetworkCanvasProps> = ({
  networkData,
  onSave,
  readOnly = false
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<ProcessNode[]>(networkData?.nodes || []);
  const [connections, setConnections] = useState<Connection[]>(networkData?.connections || []);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [history, setHistory] = useState<{ nodes: ProcessNode[], connections: Connection[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
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
      width: 200,
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

  // Delete node
  const deleteNode = (nodeId: string) => {
    saveToHistory();
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
    setSelectedNode(null);
    toast.success("Processo removido");
  };

  // Start creating connection
  const startConnection = (nodeId: string) => {
    setIsCreatingConnection(true);
    setConnectionStart(nodeId);
  };

  // Complete connection
  const completeConnection = (endNodeId: string) => {
    if (connectionStart && connectionStart !== endNodeId) {
      const connection: Connection = {
        id: `conn-${Date.now()}`,
        from: connectionStart,
        to: endNodeId,
        type: 'functional',
        strength: 3,
      };
      
      saveToHistory();
      setConnections([...connections, connection]);
      toast.success("Conexão criada");
    }
    
    setIsCreatingConnection(false);
    setConnectionStart(null);
  };

  // Mouse handlers for dragging
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (readOnly) return;
    
    if (isCreatingConnection) {
      completeConnection(nodeId);
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setDraggedNode(nodeId);
    setDragOffset({
      x: (e.clientX - rect.left) / scale - node.x,
      y: (e.clientY - rect.top) / scale - node.y,
    });
    setSelectedNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNode || readOnly) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / scale - dragOffset.x;
    const y = (e.clientY - rect.top) / scale - dragOffset.y;

    setNodes(nodes.map(node => 
      node.id === draggedNode 
        ? { ...node, x: Math.max(0, x), y: Math.max(0, y) }
        : node
    ));
  };

  const handleMouseUp = () => {
    if (draggedNode) {
      saveToHistory();
      setDraggedNode(null);
    }
  };

  // Save network
  const handleSave = () => {
    if (onSave) {
      onSave({ nodes, connections });
      toast.success("Rede salva com sucesso");
    }
  };

  // Get connection path
  const getConnectionPath = (connection: Connection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return '';

    const fromX = fromNode.x + fromNode.width / 2;
    const fromY = fromNode.y + fromNode.height / 2;
    const toX = toNode.x + toNode.width / 2;
    const toY = toNode.y + toNode.height / 2;

    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  };

  // Initialize history on first render
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ nodes: [...nodes], connections: [...connections] }]);
      setHistoryIndex(0);
    }
  }, []);

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
            
            {/* Controls */}
            <div className="space-y-4">
              <h3 className="font-semibold">Controles</h3>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={undo} disabled={historyIndex <= 0}>
                  <Undo className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1}>
                  <Redo className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setScale(scale * 1.2)}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setScale(scale * 0.8)}>
                  <ZoomOut className="h-4 w-4" />
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
              
              {isCreatingConnection && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Link className="h-4 w-4 inline mr-1" />
                    Clique no processo de destino para criar conexão
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* EEMM Legend */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4" />
          <h3 className="font-semibold">Modelo EEMM - Dimensões e Níveis</h3>
        </div>
        
        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-medium mb-1">Dimensões:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(EEMM_DIMENSIONS).map(([key, dim]) => (
                <TooltipProvider key={key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className={dim.color}>
                        {dim.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {dim.description}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Níveis:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(EEMM_LEVELS).map(([key, level]) => (
                <TooltipProvider key={key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline">
                        {level.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {level.description}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Canvas */}
      <Card className="relative overflow-hidden" style={{ height: '600px' }}>
        <div
          ref={canvasRef}
          className="w-full h-full relative cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}
        >
          {/* Grid */}
          {showGrid && (
            <div className="absolute inset-0 opacity-20">
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
            {connections.map(connection => {
              const path = getConnectionPath(connection);
              return (
                <g key={connection.id}>
                  <path
                    d={path}
                    stroke={selectedConnection === connection.id ? "#3b82f6" : "#6b7280"}
                    strokeWidth={connection.strength}
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="pointer-events-auto cursor-pointer"
                    onClick={() => setSelectedConnection(connection.id)}
                  />
                </g>
              );
            })}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>
          </svg>
          
          {/* Nodes */}
          {nodes.map(node => {
            const dimension = EEMM_DIMENSIONS[node.dimension];
            return (
              <div
                key={node.id}
                className={`absolute border-2 rounded-lg p-3 cursor-pointer select-none transition-all ${
                  dimension.color
                } ${
                  selectedNode === node.id ? 'ring-2 ring-blue-500' : ''
                } hover:shadow-lg`}
                style={{
                  left: node.x,
                  top: node.y,
                  width: node.width,
                  minHeight: node.height,
                  opacity: draggedNode === node.id ? 0.7 : 1,
                }}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
              >
                <div className="text-xs font-medium mb-1">
                  {dimension.name} | {EEMM_LEVELS[node.level].name}
                </div>
                <div className="text-sm font-medium mb-2">{node.text}</div>
                <div className="flex justify-between items-center text-xs">
                  <span>I:{node.intensity} F:{node.frequency}</span>
                  {!readOnly && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          startConnection(node.id);
                        }}
                      >
                        <Link className="h-3 w-3" />
                      </Button>
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
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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