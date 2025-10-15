import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Link2,
  Edit,
  Settings
} from "lucide-react";
import { toast } from "sonner";

// **OTIMIZAÇÃO 1: Apenas 3 diferentes tipos de marcadores**
type MarkerType = 'arrow' | 'line' | 'circle';

// Simplified ProcessNode without EEMM dimensions and levels - moved to Mediators step
interface ProcessNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  // Internal session tracking - not displayed to user
  session_id?: string;
  created_in_session?: string;
}

type ConnectionType = 'maladaptive' | 'unchanged' | 'adaptive';

interface Connection {
  id: string;
  from: string;
  to: string;
  type: ConnectionType;
  strength: number;
  ambivalent: boolean;
  startMarker: MarkerType;
  endMarker: MarkerType;
  // Internal session tracking
  session_id?: string;
  created_in_session?: string;
}

interface NetworkCanvasProps {
  networkData?: {
    nodes: ProcessNode[];
    connections: Connection[];
  };
  onSave?: (data: { nodes: ProcessNode[]; connections: Connection[] }) => void;
  readOnly?: boolean;
  currentSessionId?: string; // For session tracking
}

export const OptimizedNetworkCanvas: React.FC<NetworkCanvasProps> = ({
  networkData,
  onSave,
  readOnly = false,
  currentSessionId
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
  
  // Connection editing
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [connectionEditDialog, setConnectionEditDialog] = useState(false);
  
  // **OTIMIZAÇÃO 2: Text editing melhorado - só editável ao clicar no ícone**
  const [editingNodeText, setEditingNodeText] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  
  // **OTIMIZAÇÃO 3: Dialog de confirmação para exclusão**
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [processNameToDelete, setProcessNameToDelete] = useState('');
  
  // Simplified new node form - only text input
  const [newProcessText, setNewProcessText] = useState('');

  // **OTIMIZAÇÃO 1: Apenas 3 opções de marcadores**
  const markerOptions: { value: MarkerType; label: string; icon: React.ReactNode }[] = [
    { value: 'line', label: 'Traço', icon: <Minus className="h-4 w-4" /> },
    { value: 'arrow', label: 'Seta', icon: <ArrowRight className="h-4 w-4" /> },
    { value: 'circle', label: 'Círculo', icon: <Circle className="h-4 w-4" /> },
  ];

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

  // Calculate optimal process size based on content
  const calculateOptimalSize = (text: string, hasButtons: boolean = true) => {
    const baseWidth = 200;
    const baseHeight = 80;
    
    // Calculate text width (rough estimation)
    const textWidth = Math.max(baseWidth, text.length * 8 + 40);
    
    // Add space for buttons when needed
    const buttonSpace = hasButtons ? 60 : 20; // Space for edit and connection buttons
    const width = Math.min(textWidth + buttonSpace, 320); // Max width
    
    // Calculate height based on text wrapping - simplified without dimension/level badges
    const estimatedLines = Math.ceil(textWidth / (width - 60));
    const height = Math.max(baseHeight, estimatedLines * 20 + 60); // Reduced height
    
    return { width, height };
  };

  const addNode = () => {
    if (!newProcessText.trim()) {
      toast.error("Digite o texto do processo");
      return;
    }

    const optimalSize = calculateOptimalSize(newProcessText, true);
    
    const node: ProcessNode = {
      id: `node-${Date.now()}`,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: optimalSize.width,
      height: optimalSize.height,
      text: newProcessText,
      // Add session tracking for new nodes
      session_id: currentSessionId,
      created_in_session: currentSessionId,
    };

    saveToHistory();
    setNodes([...nodes, node]);
    setNewProcessText('');
    toast.success("Processo adicionado");
  };

  // **OTIMIZAÇÃO 3: Mostrar dialog de confirmação com nome do processo**
  const showDeleteConfirmation = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setNodeToDelete(nodeId);
      setProcessNameToDelete(node.text);
      setDeleteConfirmDialog(true);
    }
  };

  // **OTIMIZAÇÃO 3: Confirmar exclusão com segunda etapa**
  const confirmDeleteNode = () => {
    if (nodeToDelete) {
      saveToHistory();
      setNodes(nodes.filter(n => n.id !== nodeToDelete));
      setConnections(connections.filter(c => c.from !== nodeToDelete && c.to !== nodeToDelete));
      setSelectedNode(null);
      toast.success("Processo removido");
    }
    setDeleteConfirmDialog(false);
    setNodeToDelete(null);
    setProcessNameToDelete('');
  };

  const startConnectionFromNode = (nodeId: string, type: ConnectionType) => {
    setConnectionMode(type);
    setConnectionStart(nodeId);
    setShowConnectionMenu(null);
    toast.info(`Selecione o processo destino para conexão ${type === 'maladaptive' ? 'mal adaptativa' : type === 'adaptive' ? 'adaptativa' : 'sem mudança'}`);
  };

  const completeConnection = (endNodeId: string) => {
    if (connectionStart && connectionStart !== endNodeId && connectionMode) {
      // Check if connection already exists
      const existingConnection = connections.find(
        c => (c.from === connectionStart && c.to === endNodeId) ||
             (c.from === endNodeId && c.to === connectionStart)
      );
      
      if (existingConnection) {
        toast.error("Conexão já existe entre estes processos");
        setConnectionMode(null);
        setConnectionStart(null);
        return;
      }

      // Set default markers based on connection type
      let defaultStartMarker: MarkerType = 'line';
      let defaultEndMarker: MarkerType = 'arrow';
      
      if (connectionMode === 'adaptive') {
        defaultEndMarker = 'circle';
      } else if (connectionMode === 'unchanged') {
        defaultEndMarker = 'line';
      }

      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        from: connectionStart,
        to: endNodeId,
        type: connectionMode,
        strength: 3,
        ambivalent: false,
        startMarker: defaultStartMarker,
        endMarker: defaultEndMarker,
        // Add session tracking for new connections
        session_id: currentSessionId,
        created_in_session: currentSessionId,
      };
      
      saveToHistory();
      setConnections(prevConnections => [...prevConnections, newConnection]);
      toast.success("Conexão criada");
    }
    
    setConnectionMode(null);
    setConnectionStart(null);
  };

  const deleteConnection = (connId: string) => {
    saveToHistory();
    setConnections(connections.filter(c => c.id !== connId));
    setEditingConnection(null);
    setConnectionEditDialog(false);
    toast.success("Conexão removida");
  };

  // **OTIMIZAÇÃO 1: Ambivalente automaticamente coloca seta em cada ponta**
  const updateConnection = (connectionId: string, updates: Partial<Connection>) => {
    saveToHistory();
    // Se ambivalente for selecionado, automaticamente define ambos marcadores como seta
    if (updates.ambivalent) {
      updates.startMarker = 'arrow';
      updates.endMarker = 'arrow';
    }
    
    setConnections(connections.map(c => 
      c.id === connectionId ? { ...c, ...updates } : c
    ));
    toast.success("Conexão atualizada");
  };

  // **OTIMIZAÇÃO 2: Editar texto apenas ao clicar no ícone de editar**
  const startEditingNodeText = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNodeText(nodeId);
      setEditingText(node.text);
    }
  };

  const saveNodeText = () => {
    if (editingNodeText && editingText.trim()) {
      saveToHistory();
      setNodes(nodes.map(n => {
        if (n.id === editingNodeText) {
          // Recalculate optimal size for updated text
          const optimalSize = calculateOptimalSize(editingText.trim(), true);
          return { 
            ...n, 
            text: editingText.trim(),
            width: optimalSize.width,
            height: optimalSize.height
          };
        }
        return n;
      }));
      toast.success("Texto do processo atualizado");
    }
    setEditingNodeText(null);
    setEditingText('');
  };

  const cancelEditingNodeText = () => {
    setEditingNodeText(null);
    setEditingText('');
  };

  // Calculate optimal position for intensity label
  const getIntensityLabelPosition = (connection: Connection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return { x: 0, y: 0, angle: 0 };

    const fromCenterX = fromNode.x + fromNode.width / 2;
    const fromCenterY = fromNode.y + fromNode.height / 2;
    const toCenterX = toNode.x + toNode.width / 2;
    const toCenterY = toNode.y + toNode.height / 2;

    // Calculate midpoint
    const midX = (fromCenterX + toCenterX) / 2;
    const midY = (fromCenterY + toCenterY) / 2;

    // Calculate angle
    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    // Offset the label perpendicular to the line to avoid overlap
    const offsetDistance = 25;
    const offsetAngle = angle + 90; // Perpendicular
    const offsetX = Math.cos(offsetAngle * Math.PI / 180) * offsetDistance;
    const offsetY = Math.sin(offsetAngle * Math.PI / 180) * offsetDistance;

    // Adjust position based on angle to ensure readability
    let finalX = midX + offsetX;
    let finalY = midY + offsetY;

    // For near-vertical lines, position to the right
    if (Math.abs(angle) > 75 && Math.abs(angle) < 105) {
      finalX = midX + 20;
      finalY = midY;
    }
    // For near-horizontal lines, position above
    else if (Math.abs(angle) < 15 || Math.abs(angle) > 165) {
      finalX = midX;
      finalY = midY - 20;
    }

    return { x: finalX, y: finalY, angle };
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
    setShowConnectionMenu(null);
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
      const newHeight = Math.max(80, mouseY - node.y);

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

  const handleConnectionClick = (connection: Connection, e: React.MouseEvent) => {
    if (readOnly) return;
    e.stopPropagation();
    setEditingConnection(connection);
    setConnectionEditDialog(true);
  };

  const getConnectionPath = (connection: Connection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return '';

    const fromCenterX = fromNode.x + fromNode.width / 2;
    const fromCenterY = fromNode.y + fromNode.height / 2;
    const toCenterX = toNode.x + toNode.width / 2;
    const toCenterY = toNode.y + toNode.height / 2;

    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;
    const angle = Math.atan2(dy, dx);

    const fromEdgeX = fromCenterX + Math.cos(angle) * (fromNode.width / 2);
    const fromEdgeY = fromCenterY + Math.sin(angle) * (fromNode.height / 2);

    const arrowOffset = 15;
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

  const getMarkerEnd = (connection: Connection) => {
    if (connection.endMarker === 'line') return '';
    return `url(#${connection.endMarker}-${connection.type}-end)`;
  };

  const getMarkerStart = (connection: Connection) => {
    if (connection.startMarker === 'line') return '';
    return `url(#${connection.startMarker}-${connection.type}-start)`;
  };

  const getStrokeWidth = (strength: number) => {
    return 1.5 + (strength * 0.5);
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
            {/* Simplified Node Creation - Only text input */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Processo
              </h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 mb-2">
                  💡 <strong>Foco na Análise de Rede:</strong> Adicione apenas o texto dos processos psicológicos. 
                  As classificações de dimensão e nível serão feitas na próxima etapa (Análise de Mediadores).
                </p>
              </div>
              
              <Input
                placeholder="Descreva o processo psicológico..."
                value={newProcessText}
                onChange={(e) => setNewProcessText(e.target.value)}
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

      {/* **OTIMIZAÇÃO 3: Dialog de confirmação de exclusão melhorado** */}
      <AlertDialog open={deleteConfirmDialog} onOpenChange={setDeleteConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Confirmar Exclusão do Processo
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div className="text-base">
                Tem certeza que deseja excluir esse processo?
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <span className="font-medium text-gray-900">Processo:</span>
                <div className="text-sm text-gray-700 mt-1 italic">
                  "{processNameToDelete}"
                </div>
              </div>
              <div className="text-sm text-red-600">
                ⚠️ Esta ação não pode ser desfeita e todas as conexões relacionadas também serão removidas.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteNode} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sim, Excluir Processo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* **OTIMIZAÇÃO 1: Dialog de edição de conexão com apenas 3 marcadores** */}
      <Dialog open={connectionEditDialog} onOpenChange={setConnectionEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Editar Conexão
            </DialogTitle>
            <DialogDescription>
              Ajuste a intensidade, marcadores e propriedades da conexão.
            </DialogDescription>
          </DialogHeader>
          
          {editingConnection && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Intensidade: {editingConnection.strength}</Label>
                <Slider
                  value={[editingConnection.strength]}
                  onValueChange={([value]) => 
                    setEditingConnection({ ...editingConnection, strength: value })
                  }
                  min={0}
                  max={5}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Fraca (0)</span>
                  <span>Forte (5)</span>
                </div>
              </div>
              
              {/* **OTIMIZAÇÃO 1: Seleção de marcador inicial - apenas 3 opções** */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Marcador Inicial</Label>
                <div className="grid grid-cols-3 gap-2">
                  {markerOptions.map((option) => (
                    <Button
                      key={`start-${option.value}`}
                      variant={editingConnection.startMarker === option.value ? "default" : "outline"}
                      size="sm"
                      className="p-2 h-auto"
                      onClick={() => setEditingConnection({ 
                        ...editingConnection, 
                        startMarker: option.value 
                      })}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {option.icon}
                        <span className="text-xs">{option.label}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* **OTIMIZAÇÃO 1: Seleção de marcador final - apenas 3 opções** */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Marcador Final</Label>
                <div className="grid grid-cols-3 gap-2">
                  {markerOptions.map((option) => (
                    <Button
                      key={`end-${option.value}`}
                      variant={editingConnection.endMarker === option.value ? "default" : "outline"}
                      size="sm"
                      className="p-2 h-auto"
                      onClick={() => setEditingConnection({ 
                        ...editingConnection, 
                        endMarker: option.value 
                      })}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {option.icon}
                        <span className="text-xs">{option.label}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* **OTIMIZAÇÃO 1: Checkbox ambivalente que automaticamente define setas em ambos os lados** */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ambivalent"
                  checked={editingConnection.ambivalent}
                  onCheckedChange={(checked) => {
                    // Quando ambivalente é selecionado, automaticamente define ambos marcadores como seta
                    if (checked) {
                      setEditingConnection({ 
                        ...editingConnection, 
                        ambivalent: checked as boolean,
                        startMarker: 'arrow',
                        endMarker: 'arrow'
                      });
                    } else {
                      setEditingConnection({ 
                        ...editingConnection, 
                        ambivalent: checked as boolean
                      });
                    }
                  }}
                />
                <Label htmlFor="ambivalent" className="text-sm">
                  Ambivalente (automaticamente fica com seta em cada ponta)
                </Label>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="destructive"
                  onClick={() => deleteConnection(editingConnection.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConnectionEditDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      updateConnection(editingConnection.id, {
                        strength: editingConnection.strength,
                        ambivalent: editingConnection.ambivalent,
                        startMarker: editingConnection.startMarker,
                        endMarker: editingConnection.endMarker
                      });
                      setConnectionEditDialog(false);
                    }}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            {/* **OTIMIZAÇÃO 1: SVG para conexões com apenas 3 tipos de marcadores** */}
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
                {/* Gerar marcadores para todas combinações dos 3 tipos */}
                {['maladaptive', 'adaptive', 'unchanged'].map(type => (
                  <g key={type}>
                    {/* Marcadores de seta */}
                    <marker
                      id={`arrow-${type}-end`}
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path 
                        d="M0,0 L0,6 L9,3 z" 
                        fill={type === 'maladaptive' ? '#ef4444' : type === 'adaptive' ? '#22c55e' : '#9ca3af'} 
                      />
                    </marker>
                    <marker
                      id={`arrow-${type}-start`}
                      markerWidth="10"
                      markerHeight="10"
                      refX="1"
                      refY="3"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path 
                        d="M9,0 L9,6 L0,3 z" 
                        fill={type === 'maladaptive' ? '#ef4444' : type === 'adaptive' ? '#22c55e' : '#9ca3af'} 
                      />
                    </marker>
                    
                    {/* Marcadores de círculo */}
                    <marker
                      id={`circle-${type}-end`}
                      markerWidth="10"
                      markerHeight="10"
                      refX="5"
                      refY="5"
                      orient="auto"
                    >
                      <circle 
                        cx="5" 
                        cy="5" 
                        r="4" 
                        fill={type === 'maladaptive' ? '#ef4444' : type === 'adaptive' ? '#22c55e' : '#9ca3af'} 
                      />
                    </marker>
                    <marker
                      id={`circle-${type}-start`}
                      markerWidth="10"
                      markerHeight="10"
                      refX="5"
                      refY="5"
                      orient="auto"
                    >
                      <circle 
                        cx="5" 
                        cy="5" 
                        r="4" 
                        fill={type === 'maladaptive' ? '#ef4444' : type === 'adaptive' ? '#22c55e' : '#9ca3af'} 
                      />
                    </marker>
                    
                    {/* Marcadores de linha (sem marcador visual, apenas para referência) */}
                    <marker
                      id={`line-${type}-end`}
                      markerWidth="0"
                      markerHeight="0"
                      refX="0"
                      refY="0"
                    >
                    </marker>
                    <marker
                      id={`line-${type}-start`}
                      markerWidth="0"
                      markerHeight="0"
                      refX="0"
                      refY="0"
                    >
                    </marker>
                  </g>
                ))}
              </defs>
              
              {connections.map((connection) => {
                const path = getConnectionPath(connection);
                if (!path) return null;
                
                const labelPos = getIntensityLabelPosition(connection);
                
                return (
                  <g key={connection.id}>
                    <path
                      d={path}
                      className={getConnectionColor(connection.type)}
                      strokeWidth={getStrokeWidth(connection.strength)}
                      fill="none"
                      strokeDasharray={getConnectionStyle(connection.type)}
                      markerEnd={getMarkerEnd(connection)}
                      markerStart={getMarkerStart(connection)}
                      style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                      onClick={(e) => handleConnectionClick(connection, e)}
                    />
                    
                    {/* Label de intensidade otimizado */}
                    {connection.strength > 0 && (
                      <g>
                        {/* Badge de fundo */}
                        <rect
                          x={labelPos.x - 12}
                          y={labelPos.y - 12}
                          width="24"
                          height="24"
                          rx="12"
                          fill="white"
                          stroke={connection.type === 'maladaptive' ? '#ef4444' : connection.type === 'adaptive' ? '#22c55e' : '#9ca3af'}
                          strokeWidth="2"
                          style={{ pointerEvents: 'none' }}
                        />
                        {/* Número da intensidade */}
                        <text
                          x={labelPos.x}
                          y={labelPos.y + 4}
                          className="text-xs font-bold fill-current"
                          textAnchor="middle"
                          style={{ 
                            pointerEvents: 'none',
                            fill: connection.type === 'maladaptive' ? '#ef4444' : connection.type === 'adaptive' ? '#22c55e' : '#9ca3af'
                          }}
                        >
                          {connection.strength}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* **OTIMIZAÇÃO 2: Nós simplificados sem dimensões e níveis** */}
            {nodes.map((node) => {
              const isSelected = selectedNode === node.id;
              const isEditing = editingNodeText === node.id;
              
              return (
                <div
                  key={node.id}
                  className={`absolute border-2 rounded-lg shadow-md transition-all bg-white border-gray-300 ${
                    isSelected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
                  }`}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: node.width,
                    height: node.height,
                    zIndex: isSelected ? 10 : 5,
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                >
                  {/* **OTIMIZAÇÃO 2: Área de conteúdo com layout simplificado** */}
                  <div className="flex-1 flex flex-col justify-between min-h-0">
                    {/* **OTIMIZAÇÃO 2: Conteúdo de texto simplificado** */}
                    <div className="flex-1 min-h-0">
                      {isEditing ? (
                        <div className="space-y-3 h-full" onClick={(e) => e.stopPropagation()}>
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                e.preventDefault();
                                saveNodeText();
                              } else if (e.key === 'Escape') {
                                cancelEditingNodeText();
                              }
                            }}
                            autoFocus
                            className="w-full h-20 text-sm p-2 border rounded resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            placeholder="Digite o texto do processo..."
                          />
                          <div className="flex gap-2 mt-2">
                            <Button 
                              size="sm" 
                              onClick={saveNodeText} 
                              className="h-8 text-xs px-3 flex-1"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Salvar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={cancelEditingNodeText} 
                              className="h-8 text-xs px-3 flex-1"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p 
                          className="text-sm font-medium break-words leading-tight cursor-default"
                        >
                          {node.text}
                        </p>
                      )}
                    </div>
                    
                    {/* **OTIMIZAÇÃO 2: Linha inferior simplificada - apenas botões** */}
                    {!isEditing && (
                      <div className="flex items-center justify-end mt-3 pt-2 border-t border-opacity-30 border-gray-400">
                        {!readOnly && (
                          <div className="flex gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 hover:bg-gray-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditingNodeText(node.id);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar Texto</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 hover:bg-gray-100"
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
                            
                            {isSelected && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        showDeleteConfirmation(node.id);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Excluir Processo</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Menu de conexão */}
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
                  
                  {/* Handle de redimensionamento */}
                  {isSelected && !readOnly && !isEditing && (
                    <div
                      className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-tl cursor-nwse-resize opacity-75 hover:opacity-100"
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