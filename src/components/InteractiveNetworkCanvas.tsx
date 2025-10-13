import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { NetworkData } from '@/hooks/useSessionNetwork';
import {
  Plus, 
  Trash2, 
  Save,
  ZoomIn,
  ZoomOut,
  ArrowRight,
  Minus,
  Circle,
  X,
  Link2,
  Edit,
  AlertTriangle,
  Check,
  History,
  Tag,
  RefreshCw
} from "lucide-react";

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

interface NetworkConnection {
  id: string;
  from: string;
  to: string;
  type: ConnectionType;
  strength: number; // 1-5
  created_at: string;
}

interface InteractiveNetworkCanvasProps {
  networkData: NetworkData;
  onSave: (data: NetworkData) => Promise<boolean>;
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // UI State
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Connection creation
  const [connectionMode, setConnectionMode] = useState<ConnectionType | null>(null);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [showConnectionMenu, setShowConnectionMenu] = useState<string | null>(null);
  
  // Text editing
  const [editingNodeText, setEditingNodeText] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  
  // New node form
  const [newNodeText, setNewNodeText] = useState('');

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

  const addNode = () => {
    if (!newNodeText.trim()) {
      toast.error("Digite o texto do processo");
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
    markAsChanged();
    toast.success("Processo adicionado");
  };

  const removeNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    setSelectedNode(null);
    markAsChanged();
    toast.success("Processo removido");
  };

  const updateNodeText = (nodeId: string, newText: string) => {
    setNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, text: newText.trim() } : n
    ));
    markAsChanged();
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

      const newConnection: NetworkConnection = {
        id: `conn-${Date.now()}`,
        from: connectionStart,
        to: endNodeId,
        type: connectionMode,
        strength: 3,
        created_at: new Date().toISOString()
      };
      
      setConnections(prev => [...prev, newConnection]);
      markAsChanged();
      toast.success("Conexão criada");
    }
    
    setConnectionMode(null);
    setConnectionStart(null);
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
    setSelectedNode(null);
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
  };

  const handleMouseUp = () => {
    if (draggedNode) {
      markAsChanged();
    }
    setDraggedNode(null);
    setIsPanning(false);
  };

  const handleSave = async () => {
    try {
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
      
      const success = await onSave(networkData);
      if (success) {
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error saving network:', error);
      toast.error('Erro ao salvar rede');
    }
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

  const getConnectionPath = (connection: NetworkConnection) => {
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

  const getSessionColor = (sessionId: string) => {
    if (sessionId === currentSessionId) {
      return 'bg-blue-100 border-blue-400'; // Current session
    }
    
    const hash = sessionId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const colors = [
      'bg-green-100 border-green-400',
      'bg-purple-100 border-purple-400',
      'bg-orange-100 border-orange-400',
      'bg-pink-100 border-pink-400'
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
                <Button variant="outline" size="sm" onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }}>
                  <RefreshCw className="h-4 w-4" />
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
                {hasUnsavedChanges ? (
                  <Badge variant="destructive">Não salvo</Badge>
                ) : (
                  <Badge className="bg-green-600">Salvo</Badge>
                )}
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
                    strokeWidth={2 + (connection.strength * 0.5)}
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
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {node.sessionName}
                        </span>
                      </div>
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
                        
                        {isSelected && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNode(node.id);
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
