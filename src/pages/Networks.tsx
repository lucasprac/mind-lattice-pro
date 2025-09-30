import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Network, Plus, Search, Filter, Info, BarChart3, Zap, GitBranch } from "lucide-react";
import { NetworkDialog } from "@/components/NetworkDialog";
import { NetworkCard } from "@/components/NetworkCard";
import { NetworkCanvas } from "@/components/NetworkCanvas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNetworks, Network as NetworkType } from "@/hooks/useNetworks";
import { usePatients } from "@/hooks/usePatients";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

const Networks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string>("all");
  const [viewNetwork, setViewNetwork] = useState<NetworkType | null>(null);
  const [editNetwork, setEditNetwork] = useState<NetworkType | null>(null);
  
  const location = useLocation();
  const patientIdFromState = location.state?.patientId;
  
  const { patients } = usePatients();
  const { 
    networks, 
    loading, 
    error, 
    refetch, 
    deleteNetwork, 
    updateNetwork,
    duplicateNetwork,
    searchNetworks, 
    getNetworksByPatient,
    getNetworkStats,
    getComplexityAnalysis,
    exportNetwork
  } = useNetworks();

  const stats = getNetworkStats();
  const complexityAnalysis = getComplexityAnalysis();

  // Filter and search networks
  const getFilteredAndSearchedNetworks = () => {
    let filtered = networks;
    
    // Apply patient filter
    if (selectedPatient !== "all") {
      filtered = getNetworksByPatient(selectedPatient);
    }
    
    // Apply search
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(network => 
        network.name.toLowerCase().includes(searchTermLower) ||
        network.description?.toLowerCase().includes(searchTermLower) ||
        network.patient?.full_name.toLowerCase().includes(searchTermLower)
      );
    }
    
    return filtered;
  };

  const filteredNetworks = getFilteredAndSearchedNetworks();

  const handleEditNetwork = (network: NetworkType) => {
    setEditNetwork(network);
  };

  const handleViewNetwork = (network: NetworkType) => {
    setViewNetwork(network);
  };

  const handleDeleteNetwork = async (network: NetworkType) => {
    if (confirm("Tem certeza que deseja excluir esta rede? Esta ação não pode ser desfeita.")) {
      await deleteNetwork(network.id);
    }
  };

  const handleDuplicateNetwork = async (network: NetworkType) => {
    const newName = prompt("Nome para a cópia da rede:", `${network.name} (Cópia)`);
    if (newName && newName.trim()) {
      await duplicateNetwork(network, newName.trim());
    }
  };

  const handleExportNetwork = (network: NetworkType) => {
    exportNetwork(network);
  };

  const handleNetworkSave = async (networkData: any) => {
    if (!editNetwork) return;
    
    const success = await updateNetwork(editNetwork.id, {
      network_data: {
        ...networkData,
        metadata: {
          ...editNetwork.network_data.metadata,
          updated_at: new Date().toISOString(),
          total_nodes: networkData.nodes.length,
          total_connections: networkData.connections.length,
          dimensions_used: [...new Set(networkData.nodes.map((n: any) => n.dimension))],
          levels_used: [...new Set(networkData.nodes.map((n: any) => n.level))],
        }
      }
    });
    
    if (success) {
      setEditNetwork(null);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Redes de Processos</h1>
            <p className="text-muted-foreground">
              Visualize e edite as redes de processos psicológicos dos pacientes
            </p>
          </div>
        </div>
        
        <Card className="p-6">
          <div className="text-center py-16">
            <p className="text-red-600">Erro ao carregar redes: {error}</p>
            <Button onClick={refetch} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Redes de Processos</h1>
          <p className="text-muted-foreground">
            Visualize e edite as redes de processos psicológicos dos pacientes
          </p>
        </div>
        <NetworkDialog 
          onNetworkAdded={refetch}
          selectedPatient={patientIdFromState ? patients.find(p => p.id === patientIdFromState) : undefined}
        />
      </div>

      {/* Info Card about EEMM */}
      <Card className="p-6 bg-accent/30 border-accent">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1 text-accent-foreground">Editor de Rede Interativo - Modelo EEMM</h3>
            <p className="text-sm text-accent-foreground/80 mb-2">
              Use o editor visual estilo Miro para criar e modificar conexões entre processos baseados no 
              <strong> Modelo Meta-evolutivo Estendido (EEMM)</strong>. 
              Você pode arrastar elementos, conectar caixas de texto e visualizar as relações 
              causais e funcionais entre diferentes dimensões psicológicas.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                5 Dimensões: Cognição, Emoção, Self, Motivação, Comportamento
              </Badge>
              <Badge variant="secondary" className="text-xs">
                3 Níveis: Biologia, Psicologia, Social/Cultural
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total de Redes</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.uniquePatients}</div>
          <div className="text-sm text-muted-foreground">Pacientes com Redes</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.avgNodesPerNetwork}</div>
          <div className="text-sm text-muted-foreground">Média Processos/Rede</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.dimensionsUsed}/5</div>
          <div className="text-sm text-muted-foreground">Dimensões Utilizadas</div>
        </Card>
      </div>

      {/* Complexity Analysis */}
      {complexityAnalysis.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5" />
            <h3 className="font-semibold">Análise de Complexidade das Redes</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complexityAnalysis.slice(0, 6).map((analysis) => (
              <div key={analysis.networkId} className="p-3 border rounded-lg bg-muted/50">
                <div className="font-medium text-sm mb-1">{analysis.networkName}</div>
                <div className="text-xs text-muted-foreground mb-2">{analysis.patientName}</div>
                <div className="flex items-center justify-between text-xs">
                  <span>{analysis.complexity.nodes} processos</span>
                  <span>{analysis.complexity.connections} conexões</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Densidade: {(analysis.complexity.density * 100).toFixed(1)}%</span>
                  <span>{analysis.complexity.dimensionsUsed}/5 dimensões</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Search and Filter */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome da rede, descrição ou paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Pacientes</SelectItem>
                {patients
                  .filter(p => p.status === 'active')
                  .map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.full_name}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredNetworks.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredNetworks.map((network) => (
              <NetworkCard
                key={network.id}
                network={network}
                onEdit={handleEditNetwork}
                onDelete={handleDeleteNetwork}
                onView={handleViewNetwork}
                onDuplicate={handleDuplicateNetwork}
                onExport={handleExportNetwork}
                showPatientName={selectedPatient === "all"}
              />
            ))}
          </div>
        ) : searchTerm || selectedPatient !== "all" ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Não encontramos redes que correspondam aos seus critérios de busca.
              Tente ajustar os filtros ou o termo de busca.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedPatient("all");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        ) : networks.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-6">
              <Network className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma rede criada</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Crie sua primeira rede de processos para um paciente. O editor visual 
              permite mapear relações complexas entre processos psicológicos baseadas no modelo EEMM.
            </p>
            <NetworkDialog 
              onNetworkAdded={refetch}
              trigger={
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Criar Primeira Rede
                </Button>
              }
            />
          </div>
        ) : null}
      </Card>

      {/* View Network Dialog */}
      <Dialog open={!!viewNetwork} onOpenChange={() => setViewNetwork(null)}>
        <DialogContent className="sm:max-w-[95vw] sm:max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              {viewNetwork?.name}
            </DialogTitle>
            <DialogDescription>
              Visualização da rede de processos do paciente {viewNetwork?.patient?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          {viewNetwork && (
            <div className="flex-1 overflow-auto max-h-[70vh]">
              <NetworkCanvas
                networkData={viewNetwork.network_data}
                readOnly={true}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Network Dialog */}
      <Dialog open={!!editNetwork} onOpenChange={() => setEditNetwork(null)}>
        <DialogContent className="sm:max-w-[95vw] sm:max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Editando: {editNetwork?.name}
            </DialogTitle>
            <DialogDescription>
              Edite a rede de processos do paciente {editNetwork?.patient?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          {editNetwork && (
            <div className="flex-1 overflow-auto max-h-[70vh]">
              <NetworkCanvas
                networkData={editNetwork.network_data}
                onSave={handleNetworkSave}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Networks;