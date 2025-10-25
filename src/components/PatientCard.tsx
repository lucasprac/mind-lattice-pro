/**
 * PatientCard - Componente para exibir cards de pacientes
 * Atualizado para usar apenas campos que existem no schema
 */

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
  User, 
  Phone, 
  Mail, 
  MoreHorizontal, 
  Edit, 
  FileText, 
  Network,
  Calendar,
  ArrowRight,
  MessageCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Patient } from "@/hooks/usePatients";

interface PatientCardProps {
  patient: Patient;
  onEdit?: (patient: Patient) => void;
  onViewRecords?: (patient: Patient) => void;
  onViewNetwork?: (patient: Patient) => void;
  onViewRoadmap?: (patient: Patient) => void;
}

const statusConfig = {
  active: { 
    label: "Ativo", 
    variant: "default" as const, 
    color: "bg-green-100 text-green-800 border-green-200" 
  },
  inactive: { 
    label: "Inativo", 
    variant: "secondary" as const, 
    color: "bg-gray-100 text-gray-800 border-gray-200" 
  },
  discharged: { 
    label: "Alta", 
    variant: "outline" as const, 
    color: "bg-blue-100 text-blue-800 border-blue-200" 
  },
};

export const PatientCard = ({ 
  patient, 
  onEdit, 
  onViewRecords, 
  onViewNetwork,
  onViewRoadmap
}: PatientCardProps) => {
  // Usar 'active' como padrão se status for null/undefined
  const status = patient.status || 'active';
  const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
  
  // Função para verificar se tem informações de contato
  const hasContactInfo = Boolean(patient.email || patient.phone);
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight mb-2 truncate">
                {patient.full_name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewRoadmap?.(patient)}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Roadmap de Intervenção
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(patient)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewRecords?.(patient)}>
                <FileText className="h-4 w-4 mr-2" />
                Prontuário
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewNetwork?.(patient)}>
                <Network className="h-4 w-4 mr-2" />
                Rede de Processos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Seção de Informações de Contato */}
        {hasContactInfo && (
          <div className="space-y-3 pb-4 mb-4 border-b border-border/50">
            {patient.email && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-foreground truncate" title={patient.email}>
                  {patient.email}
                </span>
              </div>
            )}
            
            {patient.phone && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-foreground">{patient.phone}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Seção de Observações */}
        {patient.notes && (
          <div className="mb-4 pb-4 border-b border-border/50">
            <div className="flex items-start gap-3 text-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground line-clamp-2" title={patient.notes}>
                  {patient.notes}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Seção de Metadados */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            Criado em {format(new Date(patient.created_at), "dd/MM/yyyy", { locale: ptBR })}
          </span>
        </div>
        
        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => onViewRoadmap?.(patient)}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Roadmap
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full"
            onClick={() => onViewRecords?.(patient)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Prontuário
          </Button>
        </div>
        
        {/* Informações de debug em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-50 rounded text-xs font-mono">
            <div>ID: {patient.id.slice(0, 8)}...</div>
            <div>Status: {status}</div>
            {patient.updated_at !== patient.created_at && (
              <div>Atualizado: {format(new Date(patient.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};