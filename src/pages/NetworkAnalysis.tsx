import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Network as NetworkIcon, 
  Plus, 
  Filter,
  Users,
  Target,
  Zap,
  ChevronRight,
  Eye,
  EyeOff
} from "lucide-react";
import { OptimizedNetworkCanvas } from "@/components/OptimizedNetworkCanvas";
import { usePatients } from "@/hooks/usePatients";
import { usePatientNetwork } from "@/hooks/usePatientNetwork";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const NetworkAnalysis = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { 
    network, 
    loading, 
    error, 
    addNode, 
    addConnection, 
    removeNode, 
    removeConnection,
    updateNodePositions,
    filterBySession,
    getAvailableSessions,
    filteredSessionId,
    allNetwork
  } = usePatientNetwork(patientId || "");
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("network");
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<string>("all");

  const patient = patients.find(p => p.id === patientId);
  const availableSessions = getAvailableSessions();

  useEffect(() => {
    if (selectedSessionFilter === "all") {
      filterBySession(null);
    } else {
      filterBySession(selectedSessionFilter);
    }
  }, [selectedSessionFilter, filterBySession]);

  if (!patient) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Paciente não encontrado</p>
          <Button className="mt-4" onClick={() => navigate("/patients")}>
            Voltar para Pacientes
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando rede de processos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <p className="text-destructive mb-4">Erro: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </Card>
      </div>
    );
  }

  const handleAddProcess = async (processData: any) => {
    const success = await addNode({
      name: processData.name,
      type: processData.type,
      description: processData.description,
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 100
    });

    if (success) {
      toast({
        title: "Processo adicionado",
        description: "Novo processo foi adicionado à rede.",
      });
    }
  };

  const handleAddConnection = async (sourceId: string, targetId: string, type: string) => {
    const success = await addConnection({
      source_node_id: sourceId,
      target_node_id: targetId,
      type: type,
      description: ""
    });

    if (success) {
      toast({
        title: "Conexão criada",
        description: "Nova conexão foi estabelecida entre os processos.",
      });
    }
  };

  const handleRemoveProcess = async (nodeId: string) => {
    const success = await removeNode(nodeId);
    if (success) {
      toast({
        title: "Processo removido",
        description: "O processo foi removido da rede.",
      });
    }
  };

  const handleRemoveConnection = async (connectionId: string) => {
    const success = await removeConnection(connectionId);
    if (success) {
      toast({
        title: "Conexão removida",
        description: "A conexão foi removida da rede.",
      });
    }
  };

  const networkStats = {
    totalNodes: allNetwork?.nodes.length || 0,
    totalConnections: allNetwork?.connections.length || 0,
    visibleNodes: network?.nodes.length || 0,
    visibleConnections: network?.connections.length || 0,
    totalSessions: availableSessions.length
  };

  const nextStep = () => {
    navigate(`/patients/${patientId}/mediators`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate(`/patients/${patientId}`)}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Roadmap
          </Button>
          <h1 className="text-3xl font-bold mb-2">Análise da Rede - {patient.full_name}</h1>
          <p className="text-muted-foreground">
            Rede principal de processos psicológicos com marcação de sessões
          </p>
        </div>

        <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">
          Avançar para Análise de Mediadores
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <NetworkIcon className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{networkStats.visibleNodes}</p>
                <p className="text-xs text-muted-foreground">
                  Processos {selectedSessionFilter !== "all" ? "na sessão" : "totais"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{networkStats.visibleConnections}</p>
                <p className="text-xs text-muted-foreground">
                  Conexões {selectedSessionFilter !== "all" ? "na sessão" : "totais"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{networkStats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">Sessões com processos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {networkStats.visibleConnections > 0 ? (networkStats.visibleConnections / Math.max(networkStats.visibleNodes, 1)).toFixed(1) : "0"}
                </p>
                <p className="text-xs text-muted-foreground">Densidade da rede</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtro por Sessão:</span>
            </div>

            <Select value={selectedSessionFilter} onValueChange={setSelectedSessionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Todas as Sessões
                  </div>
                </SelectItem>
                {availableSessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    <div className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4" />
                      {session.name} ({session.count} processos)
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {selectedSessionFilter !== "all" && (
              <Badge variant="secondary">
                Mostrando apenas: {availableSessions.find(s => s.id === selectedSessionFilter)?.name}
              </Badge>
            )}

            <Badge variant="outline">
              Rede Principal Unificada
            </Badge>
          </div>
        </div>
      </Card>

      {/* Network Visualization */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="network">Visualização da Rede</TabsTrigger>
          <TabsTrigger value="analysis">Análise Estrutural</TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <NetworkIcon className="h-5 w-5" />
                Rede de Processos Psicológicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {network && (
                <div className="border rounded-lg bg-white">
                  <OptimizedNetworkCanvas
                    nodes={network.nodes}
                    connections={network.connections}
                    onNodePositionChange={updateNodePositions}
                    onAddConnection={handleAddConnection}
                    onRemoveNode={handleRemoveProcess}
                    onRemoveConnection={handleRemoveConnection}
                    height={600}
                    width="100%"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise dos Processos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <strong>Total de Processos:</strong> {networkStats.totalNodes}
                  </div>
                  <div className="text-sm">
                    <strong>Processos Visíveis:</strong> {networkStats.visibleNodes}
                  </div>
                  <div className="text-sm">
                    <strong>Sessões com Processos:</strong> {networkStats.totalSessions}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análise das Conexões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <strong>Total de Conexões:</strong> {networkStats.totalConnections}
                  </div>
                  <div className="text-sm">
                    <strong>Conexões Visíveis:</strong> {networkStats.visibleConnections}
                  </div>
                  <div className="text-sm">
                    <strong>Densidade da Rede:</strong> {networkStats.visibleConnections > 0 ? (networkStats.visibleConnections / Math.max(networkStats.visibleNodes, 1)).toFixed(2) : "0"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <NetworkIcon className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Sobre a Rede Principal</h3>
            <p className="text-sm text-blue-800">
              Esta é a rede principal unificada que contempla todos os processos criados em todas as sessões. 
              Cada processo mantém a marca da sessão em que foi criado, permitindo filtrar a visualização 
              por sessão específica. Use o filtro "Alterar para Sessão" para focar nos processos de uma sessão específica.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NetworkAnalysis;
