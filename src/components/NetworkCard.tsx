/**
 * NetworkCard - Componente para exibir cards de redes de processos
 * Adaptado para usar a tabela patient_networks
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Network,
  Eye,
  Edit,
  Trash2,
  Copy,
  Download,
  MoreVertical,
  Calendar,
  User,
  GitBranch,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Network as NetworkType } from "@/hooks/useNetworks";

interface NetworkCardProps {
  network: NetworkType;
  onEdit: (network: NetworkType) => void;
  onDelete: (network: NetworkType) => void;
  onView: (network: NetworkType) => void;
  onDuplicate: (network: NetworkType) => void;
  onExport: (network: NetworkType) => void;
  showPatientName?: boolean;
}

export const NetworkCard = ({
  network,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  onExport,
  showPatientName = false,
}: NetworkCardProps) => {
  // Extrair dados da rede
  const networkData = network.network_data || {};
  const nodes = (networkData as any)?.nodes || [];
  const connections = (networkData as any)?.connections || [];
  const metadata = (networkData as any)?.metadata || {};
  
  // Nome da rede (extrair do metadata ou usar notes)
  const networkName = metadata.name || 
                     (network.notes?.split('\n')?.[0]?.replace('Rede: ', '')) || 
                     'Rede sem nome';
  
  // Descrição da rede (extrair do metadata ou notes)
  const networkDescription = metadata.description || 
                             (network.notes?.includes('Descrição:') ? 
                              network.notes.split('Descrição: ')[1]?.split('\n')[0] : 
                              null);
  
  // Estatísticas da rede
  const stats = {
    nodes: nodes.length,
    connections: connections.length,
    dimensions: new Set(nodes.map((n: any) => n.dimension)).size,
    levels: new Set(nodes.map((n: any) => n.level)).size
  };
  
  // Densidade da rede
  const maxConnections = stats.nodes * (stats.nodes - 1);
  const density = maxConnections > 0 ? (stats.connections / maxConnections) * 100 : 0;
  
  // Formatar data
  const createdDate = network.created_at ? 
    format(new Date(network.created_at), "dd MMM yyyy", { locale: ptBR }) : 
    'Data não disponível';
  
  const analysisDate = network.analysis_date ? 
    format(new Date(network.analysis_date), "dd MMM yyyy", { locale: ptBR }) : 
    null;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Network className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight mb-1 truncate">
                {networkName}
              </h3>
              {showPatientName && network.patient && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <User className="h-3 w-3" />
                  <span className="truncate">{network.patient.full_name}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Criado: {createdDate}</span>
              </div>
              {analysisDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  <span>Análise: {analysisDate}</span>
                </div>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(network)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(network)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDuplicate(network)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport(network)}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(network)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {networkDescription && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {networkDescription}
          </p>
        )}
        
        {/* Estatísticas da rede */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{stats.nodes}</div>
            <div className="text-xs text-blue-600">Processos</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{stats.connections}</div>
            <div className="text-xs text-green-600">Conexões</div>
          </div>
        </div>
        
        {/* Badges de informações */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            {stats.dimensions}/5 Dimensões
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {stats.levels}/3 Níveis
          </Badge>
          {density > 0 && (
            <Badge variant="outline" className="text-xs">
              {density.toFixed(1)}% Densidade
            </Badge>
          )}
          {metadata.optimization_version && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              ✨ Otimizado
            </Badge>
          )}
        </div>
        
        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView(network)}
            className="flex-1"
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onEdit(network)}
            className="flex-1"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
        
        {/* Informações adicionais em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
            <div className="font-mono">
              ID: {network.id.slice(0, 8)}...
            </div>
            <div>
              Dados: {JSON.stringify(networkData).length} chars
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};