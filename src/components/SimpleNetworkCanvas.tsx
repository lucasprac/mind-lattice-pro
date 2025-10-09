import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertTriangle,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { NetworkData } from '@/hooks/useSessionNetwork';

interface ProcessNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

type ConnectionType = 'maladaptive' | 'unchanged' | 'adaptive';

interface Connection {
  id: string;
  from: string;
  to: string;
  type: ConnectionType;
}

interface SimpleNetworkCanvasProps {
  networkData: NetworkData;
  onSave: (data: NetworkData) => void;
  readOnly?: boolean;
}

export const SimpleNetworkCanvas: React.FC<SimpleNetworkCanvasProps> = ({
  networkData,
  onSave,
  readOnly = false
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<ProcessNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
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
  
  // Text editing
  const [editingNodeText, setEditingNodeText] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  
  // Delete confirmation
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [processNameToDelete, setProcessNameToDelete] = useState('');
  
  // New node form
  const [newNodeText, setNewNodeText] = useState('');

  // Initialize data from props
  useEffect(() => {
    const mappedNodes: ProcessNode[] = networkData.nodes.map(node => ({
      id: node.id,
      x: node.x,
      y: node.y,
      width: 220,
      height: 100,
      text: node.text
    }));

    const mappedConnections: Connection[] = networkData.connections.map(connection => ({
      id: connection.id,
      from: connection.source_node_id,
      to: connection.target_node_id,
      type: 'unchanged' as ConnectionType
    }));

    setNodes(mappedNodes);
    setConnections(mappedConnections);
  }, [networkData]);

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
    if (!newNodeText.trim()) {
      toast.error("Digite o texto do processo");
      return;
    }

    // Check for duplicate names
    if (nodes.some(node => node.text.toLowerCase().trim() === newNodeText.toLowerCase().trim())) {
      toast.error("Já existe um processo com este nome. Escolha um nome diferente.");
      return;
    }
    
    const node: ProcessNode = {
      id: `node-${Date.now()}`,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 220,
      height: 100,
      text: newNodeText.trim(),
    };

    saveToHistory();
    setNodes([...nodes, node]);
    setNewNodeText('');
    toast.success("Processo adicionado");
  };

  const showDeleteConfirmation = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setNodeToDelete(nodeId);
      setProcessNameToDelete(node.text);
      setDeleteConfirmDialog(true);
    }
  };

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

      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        from: connectionStart,
        to: endNodeId,
        type: connectionMode
      };
      
      saveToHistory();
      setConnections(prevConnections => [...prevConnections, newConnection]);
      toast.success("Conexão criada");
    }
    
    setConnectionMode(null);
    setConnectionStart(null);
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

    // Check for duplicate names (excluding the current node being edited)
    if (nodes.some(node => 
      node.id !== editingNodeText && 
      node.text.toLowerCase().trim() === editingText.toLowerCase().trim()
    )) {
      toast.error("Já existe um processo com este nome. Escolha um nome diferente.");
      return;
    }

    saveToHistory();
    setNodes(nodes.map(n => 
      n.id === editingNodeText ? { ...n, text: editingText.trim() } : n
    ));
    
    setEditingNodeText(null);
    setEditingText('');
    toast.success("Texto do processo atualizado");
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
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !draggedNode) {
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
  };

  const handleMouseUp = () => {
    if (draggedNode) {
      saveToHistory();
    }
    setDraggedNode(null);
    setIsPanning(false);
  };

  const handleSave = () => {
    const networkData: NetworkData = {
      nodes: nodes.map(node => ({
        id: node.id,
        text: node.text,
        x: node.x,
        y: node.y,
        type: 'process',
        description: ''
      })),
      connections: connections.map(connection => ({
        id: connection.id,
        source_node_id: connection.from,
        target_node_id: connection.to,
        type: connection.type,
        description: ''
      }))
    };
    
    onSave(networkData);
  };

  const getConnectionPath = (connection: Connection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return '';

    const fromCenterX = fromNode.x + fromNode.width / 2;
    const fromCenterY = fromNode.y + fromNode.height / 2;
    const toCenterX = toNode.x + toNode.width / 2;
    const toCenterY = toNode.y + toNode.height / 2;

    return `M ${fromCenterX} ${fromCenterY} L ${toCenterX} ${toCenterY}`;
  };

  const getConnectionColor = (type: ConnectionType) => {
    switch (type) {
      case 'maladaptive': return 'stroke-red-500';
      case 'adaptive': return 'stroke-green-500';
      case 'unchanged': return 'stroke-gray-400';
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
              
              <Input
                placeholder="Descreva o processo psicológico..."
                value={newNodeText}
                onChange={(e) => setNewNodeText(e.target.value)}
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmDialog} onOpenChange={setDeleteConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
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
                <marker
                  id="arrow-end"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L9,3 z" fill="#6b7280" />
                </marker>
              </defs>
              
              {connections.map((connection) => {
                const path = getConnectionPath(connection);
                if (!path) return null;
                
                return (
                  <path
                    key={connection.id}
                    d={path}
                    className={getConnectionColor(connection.type)}
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrow-end)"
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode === node.id;
              const isEditing = editingNodeText === node.id;
              
              return (
                <div
                  key={node.id}
                  className={`absolute border-2 rounded-lg shadow-md transition-all bg-white ${
                    isSelected ? 'ring-4 ring-blue-400 ring-opacity-50 border-blue-400' : 'border-gray-300'
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
                    {/* Área de texto */}
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
                    
                    {/* Botões de ação */}
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
                  
                  {/* Menu de conexão */}
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
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};