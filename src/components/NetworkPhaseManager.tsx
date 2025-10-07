import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Network, 
  GitBranch, 
  Target, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { OptimizedNetworkCanvas } from './OptimizedNetworkCanvas';
import { useNetworkSync } from '@/hooks/useNetworkSync';
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

interface ProcessMediatorLink {
  processId: string;
  mediatorId: string;
  strength: number;
}

interface NetworkPhaseManagerProps {
  patientId: string;
  sessionId: string;
}

export const NetworkPhaseManager: React.FC<NetworkPhaseManagerProps> = ({
  patientId,
  sessionId
}) => {
  const [currentPhase, setCurrentPhase] = useState<'network' | 'mediators' | 'functional'>('network');
  const [isGeneralView, setIsGeneralView] = useState(false);
  const [processMediatorLinks, setProcessMediatorLinks] = useState<ProcessMediatorLink[]>([]);
  const [availableMediators] = useState([
    { id: 'med-1', name: 'Terapia Cognitivo-Comportamental (TCC)' },
    { id: 'med-2', name: 'Mindfulness' },
    { id: 'med-3', name: 'Exposição Gradual' },
    { id: 'med-4', name: 'Reestruturação Cognitiva' },
    { id: 'med-5', name: 'Relaxamento Progressivo' },
    { id: 'med-6', name: 'Técnicas de Respiração' }
  ]);

  const {
    sessionNetwork,
    generalNetwork,
    isLoadingSession,
    isLoadingGeneral,
    error,
    saveSessionNetwork,
    saveGeneralNetwork,
    copySessionToGeneral,
    switchToGeneral,
    switchToSession,
    checkDuplicateName
  } = useNetworkSync({ patientId, sessionId });

  const currentNetwork = isGeneralView ? generalNetwork : sessionNetwork;
  const isLoading = isGeneralView ? isLoadingGeneral : isLoadingSession;

  // Handle network switching with bug fixes
  const handleNetworkToggle = async () => {
    if (isGeneralView) {
      // Switching from General to Session
      setIsGeneralView(false);
      switchToSession();
      toast.info('Alternado para rede da sessão');
    } else {
      // Switching from Session to General
      setIsGeneralView(true);
      switchToGeneral();
      toast.info('Alternado para rede geral');
    }
  };

  // Copy session processes to general network
  const handleCopyToGeneral = async () => {
    const success = await copySessionToGeneral();
    if (success) {
      // Refresh general network to show updated data
      switchToGeneral();
    }
  };

  // Save current network
  const handleSaveNetwork = async (networkData: { nodes: ProcessNode[]; connections: Connection[] }) => {
    // Check for duplicate names before saving
    const duplicateNames = new Set<string>();
    const processNames = networkData.nodes.map(node => node.text.toLowerCase().trim());
    
    processNames.forEach((name, index) => {
      if (processNames.indexOf(name) !== index) {
        duplicateNames.add(networkData.nodes[index].text);
      }
    });

    if (duplicateNames.size > 0) {
      toast.error(`Processos com nomes duplicados encontrados: ${Array.from(duplicateNames).join(', ')}`);
      return;
    }

    if (isGeneralView) {
      await saveGeneralNetwork(networkData);
    } else {
      await saveSessionNetwork(networkData);
    }
  };

  // Add mediator link
  const addMediatorLink = (processId: string, mediatorId: string, strength: number) => {
    const existingLink = processMediatorLinks.find(
      link => link.processId === processId && link.mediatorId === mediatorId
    );
    
    if (existingLink) {
      // Update existing link
      setProcessMediatorLinks(links => 
        links.map(link => 
          link.processId === processId && link.mediatorId === mediatorId
            ? { ...link, strength }
            : link
        )
      );
    } else {
      // Add new link
      setProcessMediatorLinks(links => [...links, { processId, mediatorId, strength }]);
    }
    
    toast.success('Ligação processo-mediador atualizada');
  };

  // Remove mediator link
  const removeMediatorLink = (processId: string, mediatorId: string) => {
    setProcessMediatorLinks(links => 
      links.filter(link => !(link.processId === processId && link.mediatorId === mediatorId))
    );
    toast.success('Ligação removida');
  };

  // Get linked mediators for a process
  const getProcessMediators = (processId: string) => {
    return processMediatorLinks
      .filter(link => link.processId === processId)
      .map(link => ({
        ...availableMediators.find(med => med.id === link.mediatorId)!,
        strength: link.strength
      }));
  };

  // Get phase completion status
  const getPhaseStatus = () => {
    const hasProcesses = currentNetwork.nodes.length > 0;
    const hasConnections = currentNetwork.connections.length > 0;
    const hasMediatoLinks = processMediatorLinks.length > 0;
    
    return {
      network: hasProcesses && hasConnections,
      mediators: hasProcesses && hasMediatoLinks,
      functional: hasProcesses && hasMediatoLinks
    };
  };

  const phaseStatus = getPhaseStatus();

  return (
    <div className="space-y-6">
      {/* Phase Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Fases da Análise</h2>
          <div className="flex items-center gap-2">
            <Badge variant={phaseStatus.network ? "default" : "secondary"}>
              Fase 1: {phaseStatus.network ? 'Completa' : 'Pendente'}
            </Badge>
            <Badge variant={phaseStatus.mediators ? "default" : "secondary"}>
              Fase 2: {phaseStatus.mediators ? 'Completa' : 'Pendente'}
            </Badge>
            <Badge variant={phaseStatus.functional ? "default" : "secondary"}>
              Fase 3: {phaseStatus.functional ? 'Completa' : 'Pendente'}
            </Badge>
          </div>
        </div>
        
        <Tabs value={currentPhase} onValueChange={(value) => setCurrentPhase(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              2. Análise de Rede
              {phaseStatus.network && <CheckCircle className="h-4 w-4 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger 
              value="mediators" 
              className="flex items-center gap-2"
              disabled={!phaseStatus.network}
            >
              <GitBranch className="h-4 w-4" />
              3. Análise de Mediadores
              {phaseStatus.mediators && <CheckCircle className="h-4 w-4 text-green-500" />}
              {!phaseStatus.network && <AlertCircle className="h-4 w-4 text-orange-500" />}
            </TabsTrigger>
            <TabsTrigger 
              value="functional" 
              className="flex items-center gap-2"
              disabled={!phaseStatus.mediators}
            >
              <BarChart3 className="h-4 w-4" />
              4. Análise Funcional
              {phaseStatus.functional && <CheckCircle className="h-4 w-4 text-green-500" />}
              {!phaseStatus.mediators && <AlertCircle className="h-4 w-4 text-orange-500" />}
            </TabsTrigger>
          </TabsList>
          
          {/* Phase 1: Network Analysis */}
          <TabsContent value="network" className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Análise de Rede</h3>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNetworkToggle}
                    disabled={isLoading}
                  >
                    {isGeneralView ? 'Alternar para Sessão' : 'Alternar para Geral'}
                  </Button>
                  
                  {!isGeneralView && sessionNetwork.nodes.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCopyToGeneral}
                    >
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Copiar para Geral
                    </Button>
                  )}
                  
                  <Badge variant={isGeneralView ? "default" : "secondary"}>
                    {isGeneralView ? 'Rede Geral' : 'Rede da Sessão'}
                  </Badge>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  {error}
                </div>
              )}
              
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p><strong>Fase 2 - Análise de Rede:</strong></p>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li>Crie e conecte processos psicológicos</li>
                      <li>A rede da sessão contém processos específicos desta sessão</li>
                      <li>A rede geral accumula processos de todas as sessões</li>
                      <li>Não é possível ter dois processos com o mesmo nome</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <OptimizedNetworkCanvas
                networkData={{
                  nodes: currentNetwork.nodes.map(node => ({
                    ...node,
                    x: node.x ?? 100,
                    y: node.y ?? 100,
                    width: node.width ?? 150,
                    height: node.height ?? 60,
                    dimension: node.dimension as any,
                    level: node.level as any
                  })),
                  connections: currentNetwork.connections
                }}
                onSave={handleSaveNetwork}
                readOnly={isLoading}
              />
            </Card>
          </TabsContent>
          
          {/* Phase 2: Mediator Analysis */}
          <TabsContent value="mediators" className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <GitBranch className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold">Análise de Mediadores</h3>
              </div>
              
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p><strong>Fase 3 - Análise de Mediadores:</strong></p>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li><strong>NÃO é possível adicionar novos processos</strong> - apenas usar os já criados</li>
                      <li>Vincule mediadores aos processos existentes da rede da sessão</li>
                      <li>Defina a força da relação entre processo e mediador (0-10)</li>
                      <li>Esta fase prepara os dados para a Análise Funcional</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {sessionNetwork.nodes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Complete a Fase 2 (Análise de Rede) antes de continuar.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-semibold">Processos da Sessão Atual:</h4>
                  {sessionNetwork.nodes.map((process) => {
                    const linkedMediators = getProcessMediators(process.id);
                    
                    return (
                      <Card key={process.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-medium text-gray-900">{process.text}</h5>
                            <p className="text-sm text-gray-500">
                              {process.dimension} • {process.level}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {linkedMediators.length} mediador(es)
                          </Badge>
                        </div>
                        
                        {linkedMediators.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Mediadores Vinculados:</p>
                            <div className="space-y-2">
                              {linkedMediators.map((mediator) => (
                                <div key={mediator.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                  <span className="text-sm">{mediator.name}</span>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                      Força: {mediator.strength}/10
                                    </Badge>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => removeMediatorLink(process.id, mediator.id)}
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    >
                                      ×
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Adicionar Mediador:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {availableMediators
                              .filter(med => !linkedMediators.some(linked => linked.id === med.id))
                              .map((mediator) => (
                                <Button
                                  key={mediator.id}
                                  size="sm"
                                  variant="outline"
                                  className="justify-start text-xs"
                                  onClick={() => addMediatorLink(process.id, mediator.id, 5)}
                                >
                                  + {mediator.name}
                                </Button>
                              ))}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          </TabsContent>
          
          {/* Phase 3: Functional Analysis */}
          <TabsContent value="functional" className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold">Análise Funcional</h3>
              </div>
              
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div className="text-sm text-purple-800">
                    <p><strong>Fase 4 - Análise Funcional:</strong></p>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li><strong>Apenas escolher o processo</strong> - mediadores já estão vinculados</li>
                      <li>Os mediadores foram definidos na fase anterior</li>
                      <li>Não é possível alterar vinculações processo-mediador aqui</li>
                      <li>Foque na análise funcional dos processos selecionados</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {processMediatorLinks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Complete a Fase 3 (Análise de Mediadores) antes de continuar.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-semibold">Processos com Mediadores Definidos:</h4>
                  
                  {sessionNetwork.nodes
                    .filter(process => processMediatorLinks.some(link => link.processId === process.id))
                    .map((process) => {
                      const linkedMediators = getProcessMediators(process.id);
                      
                      return (
                        <Card key={process.id} className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 mb-2">{process.text}</h5>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="text-xs">
                                  {process.dimension}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {process.level}
                                </Badge>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Mediadores Vinculados ({linkedMediators.length}):
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {linkedMediators.map((mediator) => (
                                    <Badge key={mediator.id} variant="secondary" className="text-xs">
                                      {mediator.name} (Força: {mediator.strength})
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <Button size="sm" className="ml-4">
                              Analisar
                            </Button>
                          </div>
                        </Card>
                      );
                    })
                  }
                  
                  {sessionNetwork.nodes.filter(process => 
                    processMediatorLinks.some(link => link.processId === process.id)
                  ).length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <p>Nenhum processo possui mediadores vinculados ainda.</p>
                      <p className="text-sm mt-1">Complete a Fase 3 para continuar.</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};