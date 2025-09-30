import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Network, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Calendar,
  User,
  Eye,
  Copy,
  Download,
  BarChart3,
  Zap,
  GitBranch
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Network as NetworkType } from "@/hooks/useNetworks";

interface NetworkCardProps {
  network: NetworkType;
  onEdit?: (network: NetworkType) => void;
  onDelete?: (network: NetworkType) => void;
  onView?: (network: NetworkType) => void;
  onDuplicate?: (network: NetworkType) => void;
  onExport?: (network: NetworkType) => void;
  showPatientName?: boolean;
}

const DIMENSION_COLORS: { [key: string]: string } = {
  cognition: "bg-blue-100 text-blue-800",
  emotion: "bg-red-100 text-red-800",
  self: "bg-green-100 text-green-800",
  motivation: "bg-yellow-100 text-yellow-800",
  behavior: "bg-purple-100 text-purple-800",
};

const DIMENSION_NAMES: { [key: string]: string } = {
  cognition: "Cognição",
  emotion: "Emoção", 
  self: "Self",
  motivation: "Motivação",
  behavior: "Comportamento",
};

export const NetworkCard = ({ 
  network, 
  onEdit, 
  onDelete, 
  onView,
  onDuplicate,
  onExport,
  showPatientName = true 
}: NetworkCardProps) => {
  const nodes = network.network_data.nodes || [];
  const connections = network.network_data.connections || [];
  const metadata = network.network_data.metadata;
  
  // Calculate network metrics
  const dimensionsUsed = new Set(nodes.map((n: any) => n.dimension));
  const levelsUsed = new Set(nodes.map((n: any) => n.level));
  const avgIntensity = nodes.length > 0 
    ? nodes.reduce((sum: number, n: any) => sum + (n.intensity || 0), 0) / nodes.length
    : 0;
  const avgFrequency = nodes.length > 0 
    ? nodes.reduce((sum: number, n: any) => sum + (n.frequency || 0), 0) / nodes.length
    : 0;
  
  // Calculate network density
  const maxConnections = nodes.length * (nodes.length - 1);
  const density = maxConnections > 0 ? (connections.length / maxConnections) * 100 : 0;

  const getComplexityLevel = () => {
    const complexityScore = nodes.length * 0.3 + connections.length * 0.4 + dimensionsUsed.size * 0.2 + density * 0.1;
    
    if (complexityScore <= 5) return { label: "Simples", color: "bg-green-100 text-green-800" };
    if (complexityScore <= 15) return { label: "Médio", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Complexo", color: "bg-red-100 text-red-800" };
  };

  const complexity = getComplexityLevel();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Network className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{network.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {showPatientName && network.patient && (
                  <Badge variant="outline" className="gap-1">
                    <User className="h-3 w-3" />
                    {network.patient.full_name}
                  </Badge>
                )}
                <Badge className={complexity.color}>
                  {complexity.label}
                </Badge>
                <Badge variant="outline">
                  v{network.version}
                </Badge>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(network)}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(network)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate?.(network)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.(network)}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(network)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Description */}
          {network.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {network.description}
            </p>
          )}
          
          {/* Network Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{nodes.length} processos</div>
                <div className="text-xs text-muted-foreground">{connections.length} conexões</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Int: {avgIntensity.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Freq: {avgFrequency.toFixed(1)}</div>
              </div>
            </div>
          </div>
          
          {/* Dimensions Used */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Dimensões ({dimensionsUsed.size}/5):</h4>
            <div className="flex flex-wrap gap-1">
              {Array.from(dimensionsUsed).map((dimension: any) => (
                <Badge 
                  key={dimension} 
                  className={`text-xs ${DIMENSION_COLORS[dimension] || 'bg-gray-100 text-gray-800'}`}
                >
                  {DIMENSION_NAMES[dimension] || dimension}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Network Density */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Densidade da Rede</span>
              <span className="font-medium">{density.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2 transition-all" 
                style={{ width: `${Math.min(density, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Creation Date */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(new Date(network.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
              {network.updated_at !== network.created_at && (
                <span>
                  Editado: {format(new Date(network.updated_at), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onView?.(network)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onEdit?.(network)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};