import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Settings,
  AlertTriangle,
  Check,
  History,
  Tag
} from "lucide-react";
import { toast } from "sonner";
import { NetworkData } from '@/hooks/useSessionNetwork';

interface NetworkNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  sessionId: string;
  sessionName: string;
  created_at: string;
}

type ConnectionType = 'maladaptive' | 'unchanged' | 'adaptive';
type MarkerType = 'arrow' | 'line' | 'circle';

interface NetworkConnection {
  id: string;
  from: string;
  to: string;
  type: ConnectionType;
  strength: number; // 1-5
  ambivalent: boolean;
  startMarker: MarkerType;
  endMarker: MarkerType;
  created_at: string;
}

interface HistoryEntry {
  id: string;
  timestamp: string;
  action: 'add_node' | 'remove_node' | 'edit_node' | 'add_connection' | 'remove_connection' | 'edit_connection';
  description: string;
  sessionId: string;
  sessionName: string;
}

interface InteractiveNetworkCanvasProps {
  networkData: NetworkData;
  onSave: (data: NetworkData, hasUnsavedChanges?: boolean) => Promise<boolean>;
  readOnly?: boolean;
  currentSessionId: string;
  currentSessionName: string;
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

export const InteractiveNetworkCanvas: React.FC<InteractiveNetworkCanvasProps> = ({
  networkData,
  onSave,
  readOnly = false,
  currentSessionId,
  currentSessionName,
  onUnsavedChanges
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [connections, setConnections] = useState<NetworkConnection[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // UI State
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [resizingNode, setResizingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Connection creation
  const [connectionMode, setConnectionMode] = useState<ConnectionType | null>(null);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [showConnectionMenu, setShowConnectionMenu] = useState<string | null>(null);
  
  // Dialogs
  const [editingNodeText, setEditingNodeText] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingConnection, setEditingConnection] = useState<NetworkConnection | null>(null);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'node' | 'connection', id: string, name: string} | null>(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  
  // New node form
  const [newNodeText, setNewNodeText] = useState('');

  // Marker options for connections
  const markerOptions: { value: MarkerType; label: string; icon: React.ReactNode }[] = [
    { value: 'line', label: 'Traço', icon: <Minus className="h-4 w-4" /> },
    { value: 'arrow', label: 'Seta', icon: <ArrowRight className="h-4 w-4" /> },
    { value: 'circle', label: 'Bola', icon: <Circle className="h-4 w-4" /> },
  ];

  // Initialize data from props
  useEffect(() => {
    const mappedNodes: NetworkNode[] = networkData.nodes.map(node => ({
      id: node.id,
      x: node.x,
      y: node.y,
      width: 200,
      height: 80,
      text: node.text,
      sessionId: node.sessionId || currentSessionId,
      sessionName: node.sessionName || currentSessionName,
      created_at: node.created_at || new Date().toISOString()
    }));

    const mappedConnections: NetworkConnection[] = networkData.connections.map(connection => ({
      id: connection.id,
      from: connection.source_node_id,
      to: connection.target_node_id,
      type: (connection.type as ConnectionType) || 'unchanged',
      strength: 3,
      ambivalent: false,
      startMarker: 'line' as MarkerType,
      endMarker: 'arrow' as MarkerType,
      created_at: connection.created_at || new Date().toISOString()
    }));

    setNodes(mappedNodes);
    setConnections(mappedConnections);
    setHasUnsavedChanges(false);
  }, [networkData, currentSessionId, currentSessionName]);

  // Notify parent about unsaved changes
  useEffect(() => {
    onUnsavedChanges?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onUnsavedChanges]);

  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  const addToHistory = useCallback((action: HistoryEntry['action'], description: string) => {
    const entry: HistoryEntry = {
      id: `hist-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      description,
      sessionId: currentSessionId,
      sessionName: currentSessionName
    };
    
    setHistory(prev => [entry, ...prev.slice(0, 49)]); // Keep only last 50 entries
    markAsChanged();
  }, [currentSessionId, currentSessionName, markAsChanged]);

  const addNode = () => {
    if (!newNodeText.trim()) {
      toast.error("Digite o texto do processo");
      return;
    }

    // Check for duplicate names
    if (nodes.some(node => node.text.toLowerCase().trim() === newNodeText.toLowerCase().trim())) {
      toast.error("Já existe um processo com este nome. Escolha um nome diferente.");
      return;
    }
    
    const node: NetworkNode = {
      id: `node-${Date.now()}`,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 200,
      height: 80,
      text: newNodeText.trim(),
      sessionId: currentSessionId,
      sessionName: currentSessionName,
      created_at: new Date().toISOString()
    };

    setNodes(prev => [...prev, node]);
    setNewNodeText('');
    addToHistory('add_node', `Processo adicionado: "${node.text}"`);
    toast.success("Processo adicionado");
  };

  const removeNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    setSelectedNode(null);
    
    addToHistory('remove_node', `Processo removido: "${node.text}"`);
    toast.success("Processo removido");
  };

  const updateNodeText = (nodeId: string, newText: string) => {
    const oldNode = nodes.find(n => n.id === nodeId);
    if (!oldNode) return;

    // Check for duplicate names (excluding the current node)
    if (nodes.some(node => 
      node.id !== nodeId && 
      node.text.toLowerCase().trim() === newText.toLowerCase().trim()
    )) {
      toast.error("Já existe um processo com este nome. Escolha um nome diferente.");
      return false;
    }

    setNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, text: newText.trim() } : n
    ));
    
    addToHistory('edit_node', `Processo editado: "${oldNode.text}" → "${newText.trim()}"`);
    toast.success("Texto do processo atualizado");
    return true;
  };

  const startConnectionFromNode = (nodeId: string, type: ConnectionType) => {
    setConnectionMode(type);
    setConnectionStart(nodeId);
    setShowConnectionMenu(null);
    const typeText = type === 'maladaptive' ? 'maladaptativa' : 
                    type === 'adaptive' ? 'adaptativa' : 'sem mudança';
    toast.info(`Selecione o processo destino para conexão ${typeText}`);
  };

  const completeConnection = (endNodeId: string) => {
    if (connectionStart && connectionStart !== endNodeId && connectionMode) {
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

      const newConnection: NetworkConnection = {
        id: `conn-${Date.now()}`,
        from: connectionStart,
        to: endNodeId,
        type: connectionMode,
        strength: 3,
        ambivalent: false,
        startMarker: defaultStartMarker,
        endMarker: defaultEndMarker,
        created_at: new Date().toISOString()
      };
      
      setConnections(prev => [...prev, newConnection]);
      
      const fromNode = nodes.find(n => n.id === connectionStart);
      const toNode = nodes.find(n => n.id === endNodeId);
      
      addToHistory('add_connection', `Conexão criada: "${fromNode?.text}" → "${toNode?.text}" (${connectionMode})`);
      toast.success("Conexão criada");
    }
    
    setConnectionMode(null);
    setConnectionStart(null);
  };

  const removeConnection = (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;

    setConnections(prev => prev.filter(c => c.id !== connectionId));
    setSelectedConnection(null);
    
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    addToHistory('remove_connection', `Conexão removida: "${fromNode?.text}" → "${toNode?.text}"`);
    toast.success("Conexão removida");
  };

  const updateConnection = (connectionId: string, updates: Partial<NetworkConnection>) => {
    const oldConnection = connections.find(c => c.id === connectionId);
    if (!oldConnection) return;

    // If ambivalent is selected, automatically set both markers as arrow
    if (updates.ambivalent) {
      updates.startMarker = 'arrow';
      updates.endMarker = 'arrow';
    }
    
    setConnections(prev => prev.map(c => 
      c.id === connectionId ? { ...c, ...updates } : c
    ));
    
    addToHistory('edit_connection', `Conexão editada entre processos`);
    toast.success("Conexão atualizada");
  };

  const showDeleteConfirmation = (type: 'node' | 'connection', id: string) => {
    if (type === 'node') {
      const node = nodes.find(n => n.id === id);
      if (node) {
        setItemToDelete({type, id, name: node.text});
        setDeleteConfirmDialog(true);
      }
    } else {
      const connection = connections.find(c => c.id === id);
      if (connection) {
        const fromNode = nodes.find(n => n.id === connection.from);
        const toNode = nodes.find(n => n.id === connection.to);
        setItemToDelete({type, id, name: `${fromNode?.text} → ${toNode?.text}`});
        setDeleteConfirmDialog(true);
      }
    }
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'node') {
        removeNode(itemToDelete.id);
      } else {
        removeConnection(itemToDelete.id);
      }
    }
    setDeleteConfirmDialog(false);
    setItemToDelete(null);
  };

  const startEditingNodeText = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNodeText(nodeId);
      setEditingText(node.text);
    }
  };

  const saveNodeText = () => {
    if (!editingNodeText || !editingText.trim()) {
      toast.error("O texto do processo não pode estar vazio");
      return;
    }

    if (updateNodeText(editingNodeText, editingText)) {
      setEditingNodeText(null);
      setEditingText('');
    }
  };

  const cancelEditingNodeText = () => {
    setEditingNodeText(null);
    setEditingText('');
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
    setSelectedConnection(null);
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
    setSelectedNode(null);
    setSelectedConnection(null);
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

      setNodes(prev => prev.map(node => 
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

      setNodes(prev => prev.map(n => 
        n.id === resizingNode 
          ? { ...n, width: newWidth, height: newHeight }
          : n
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
    setResizingNode(null);
    setIsPanning(false);
  };

  const handleSave = async () => {
    const networkData: NetworkData = {
      nodes: nodes.map(node => ({
        id: node.id,
        text: node.text,
        x: node.x,
        y: node.y,
        type: 'process',
        description: '',
        sessionId: node.sessionId,
        sessionName: node.sessionName,
        created_at: node.created_at
      })),
      connections: connections.map(connection => ({
        id: connection.id,
        source_node_id: connection.from,
        target_node_id: connection.to,
        type: connection.type,
        description: `Strength: ${connection.strength}`,
        created_at: connection.created_at
      }))
    };
    
    const success = await onSave(networkData, hasUnsavedChanges);
    if (success) {
      setHasUnsavedChanges(false);
    }
  };

  const handleConnectionClick = (connection: NetworkConnection, e: React.MouseEvent) => {
    if (readOnly) return;
    e.stopPropagation();
    setSelectedConnection(connection.id);
    setSelectedNode(null);
    setEditingConnection({ ...connection });
    setShowConnectionDialog(true);
  };

  const getConnectionPath = (connection: NetworkConnection) => {
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

  const getMarkerEnd = (connection: NetworkConnection) => {
    if (connection.endMarker === 'line') return '';
    return `url(#${connection.endMarker}-${connection.type}-end)`;
  };

  const getMarkerStart = (connection: NetworkConnection) => {
    if (connection.startMarker === 'line') return '';
    return `url(#${connection.startMarker}-${connection.type}-start)`;
  };

  const getStrokeWidth = (strength: number) => {
    return 1.5 + (strength * 0.5);
  };

  const getSessionColor = (sessionId: string) => {
    // Generate a consistent color based on session ID
    const hash = sessionId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const colors = [
      'bg-blue-100 border-blue-400',
      'bg-green-100 border-green-400',
      'bg-purple-100 border-purple-400',
      'bg-orange-100 border-orange-400',
      'bg-pink-100 border-pink-400',
      'bg-indigo-100 border-indigo-400'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <Card className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Node Creation */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Processo
              </h3>
              
              <Input
                placeholder="Descreva o processo psicológico..."
                value={newNodeText}
                onChange={(e) => setNewNodeText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addNode()}
              />
              
              <Button onClick={addNode} className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Processo
              </Button>
            </div>
            
            {/* Controls */}
            <div className="space-y-4">
              <h3 className="font-semibold">Controles</h3>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setScale(Math.min(scale * 1.2, 3))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setScale(Math.max(scale * 0.8, 0.3))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowHistoryDialog(true)}>
                  <History className="h-4 w-4" />
                </Button>
              </div>
              
              <Button onClick={handleSave} className="w-full" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Salvar Rede
                {hasUnsavedChanges && <span className="ml-2 text-yellow-300">*</span>}
              </Button>
            </div>
            
            {/* Status */}
            <div className="space-y-4">
              <h3 className="font-semibold">Status</h3>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Processos: {nodes.length}</Badge>
                <Badge variant="outline">Conexões: {connections.length}</Badge>
                {hasUnsavedChanges && <Badge variant="destructive">Não salvo</Badge>}
              </div>
              
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

      {/* Connection Edit Dialog */}
      <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Editar Conexão
            </DialogTitle>
            <DialogDescription>
              Ajuste intensidade, marcadores e propriedades da conexão.
            </DialogDescription>
          </DialogHeader>
          
          {editingConnection && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Intensidade: {editingConnection.strength}
                </Label>
                <Slider
                  value={[editingConnection.strength]}
                  onValueChange={([value]) => 
                    setEditingConnection({ ...editingConnection, strength: value })
                  }
                  min={1}
                  max={5}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Fraca (1)</span>
                  <span>Forte (5)</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Tipo de Conexão</Label>
                <Select 
                  value={editingConnection.type} 
                  onValueChange={(value) => 
                    setEditingConnection({ ...editingConnection, type: value as ConnectionType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maladaptive">Maladaptativa</SelectItem>
                    <SelectItem value="unchanged">Sem Mudança</SelectItem>
                    <SelectItem value="adaptive">Adaptativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ambivalent"
                  checked={editingConnection.ambivalent}
                  onCheckedChange={(checked) => {
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
                  Ambivalente (setas em ambos os lados)
                </Label>
              </div>
              
              {!editingConnection.ambivalent && (
                <>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Marcador Inicial</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {markerOptions.map((option) => (
                        <Button
                          key={`start-${option.value}`}
                          variant={editingConnection.startMarker === option.value ? "default" : "outline"}
                          size="sm"
                          className="p-3 h-auto flex flex-col gap-1"
                          onClick={() => setEditingConnection({ 
                            ...editingConnection, 
                            startMarker: option.value 
                          })}
                        >
                          {option.icon}
                          <span className="text-xs">{option.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Marcador Final</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {markerOptions.map((option) => (
                        <Button
                          key={`end-${option.value}`}
                          variant={editingConnection.endMarker === option.value ? "default" : "outline"}
                          size="sm"
                          className="p-3 h-auto flex flex-col gap-1"
                          onClick={() => setEditingConnection({ 
                            ...editingConnection, 
                            endMarker: option.value 
                          })}
                        >
                          {option.icon}
                          <span className="text-xs">{option.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (editingConnection) {
                  showDeleteConfirmation('connection', editingConnection.id);
                  setShowConnectionDialog(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setShowConnectionDialog(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={() => {
                if (editingConnection) {
                  updateConnection(editingConnection.id, editingConnection);
                  setShowConnectionDialog(false);
                }
              }}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico da Rede
            </DialogTitle>
            <DialogDescription>
              Últimas alterações feitas na rede de processos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma alteração registrada ainda.</p>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium">{entry.description}</span>
                    <Badge variant="outline" className="text-xs">
                      {entry.sessionName}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmDialog} onOpenChange={setDeleteConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div className="text-base">
                Tem certeza que deseja excluir este item?
              </div>
              {itemToDelete && (
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="font-medium text-gray-900">
                    {itemToDelete.type === 'node' ? 'Processo' : 'Conexão'}:
                  </span>
                  <div className="text-sm text-gray-700 mt-1 italic">
                    "{itemToDelete.name}"
                  </div>
                </div>
              )}
              <div className="text-sm text-red-600">
                ⚠️ Esta ação não pode ser desfeita.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            {/* SVG para conexões */}
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
                {/* Generate markers for all combinations */}
                {['maladaptive', 'adaptive', 'unchanged'].map(type => (
                  <g key={type}>
                    {/* Arrow markers */}
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
                    
                    {/* Circle markers */}
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
                  </g>
                ))}
              </defs>
              
              {connections.map((connection) => {
                const path = getConnectionPath(connection);
                if (!path) return null;
                
                return (
                  <g key={connection.id}>
                    <path
                      d={path}
                      className={`${getConnectionColor(connection.type)} ${selectedConnection === connection.id ? 'stroke-blue-600' : ''}`}
                      strokeWidth={getStrokeWidth(connection.strength)}
                      fill="none"
                      markerEnd={getMarkerEnd(connection)}
                      markerStart={getMarkerStart(connection)}
                      style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                      onClick={(e) => handleConnectionClick(connection, e)}
                    />
                    
                    {/* Strength label */}
                    {connection.strength > 0 && (
                      <g>
                        <circle
                          cx={(nodes.find(n => n.id === connection.from)?.x || 0) + 
                              (nodes.find(n => n.id === connection.to)?.x || 0) + 200} 
                          cy={(nodes.find(n => n.id === connection.from)?.y || 0) + 
                              (nodes.find(n => n.id === connection.to)?.y || 0) + 80}
                          r="12"
                          fill="white"
                          stroke={connection.type === 'maladaptive' ? '#ef4444' : 
                                 connection.type === 'adaptive' ? '#22c55e' : '#9ca3af'}
                          strokeWidth="2"
                          style={{ pointerEvents: 'none' }}
                        />
                        <text
                          x={(nodes.find(n => n.id === connection.from)?.x || 0) + 
                             (nodes.find(n => n.id === connection.to)?.x || 0) + 200}
                          y={(nodes.find(n => n.id === connection.from)?.y || 0) + 
                             (nodes.find(n => n.id === connection.to)?.y || 0) + 85}
                          className="text-xs font-bold"
                          textAnchor="middle"
                          style={{ 
                            pointerEvents: 'none',
                            fill: connection.type === 'maladaptive' ? '#ef4444' : 
                                  connection.type === 'adaptive' ? '#22c55e' : '#9ca3af'
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

            {/* Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode === node.id;
              const isEditing = editingNodeText === node.id;
              const sessionColors = getSessionColor(node.sessionId);
              
              return (
                <div
                  key={node.id}
                  className={`absolute border-2 rounded-lg shadow-md transition-all ${sessionColors} ${
                    isSelected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
                  }`}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: node.width,
                    height: node.height,
                    zIndex: isSelected ? 10 : 5,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '12px',
                  }}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                >
                  <div className="flex-1 flex flex-col justify-between min-h-0">
                    {/* Session marker */}
                    <div className="flex justify-between items-start mb-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                                {node.sessionName}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Criado na sessão: {node.sessionName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(node.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {/* Text content */}
                    <div className="flex-1 mb-2">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                saveNodeText();
                              } else if (e.key === 'Escape') {
                                cancelEditingNodeText();
                              }
                            }}
                            autoFocus
                            className="text-sm"
                          />
                          <div className="flex gap-1">
                            <Button size="sm" onClick={saveNodeText}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEditingNodeText}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-medium break-words leading-tight">
                          {node.text}
                        </p>
                      )}
                    </div>
                    
                    {/* Action buttons */}
                    {!readOnly && !isEditing && (
                      <div className="flex justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
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
                        
                        {isSelected && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showDeleteConfirmation('node', node.id);
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
                  
                  {/* Connection menu */}
                  {showConnectionMenu === node.id && !readOnly && (
                    <div 
                      className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg p-2 z-50 flex flex-col gap-1 min-w-[140px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => startConnectionFromNode(node.id, 'maladaptive')}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Maladaptativa
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="justify-start text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                        onClick={() => startConnectionFromNode(node.id, 'unchanged')}
                      >
                        <Minus className="h-4 w-4 mr-2" />
                        Sem mudança
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => startConnectionFromNode(node.id, 'adaptive')}
                      >
                        <Circle className="h-4 w-4 mr-2" />
                        Adaptativa
                      </Button>
                    </div>
                  )}
                  
                  {/* Resize handle */}
                  {isSelected && !readOnly && (
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
