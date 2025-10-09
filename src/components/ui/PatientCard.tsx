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
  MapPin, 
  MoreHorizontal, 
  Edit, 
  FileText, 
  Network,
  Calendar,
  ArrowRight,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Patient {
  id: string;
  full_name: string;
  birth_date?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: "active" | "inactive" | "discharged";
  created_at: string;
  updated_at: string;
}

interface PatientCardProps {
  patient: Patient;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
  onViewRecords?: (patient: Patient) => void;
  onViewNetwork?: (patient: Patient) => void;
  onViewRoadmap?: (patient: Patient) => void;
}

const statusConfig = {
  active: { label: "Ativo", variant: "default" as const, color: "bg-green-100 text-green-800" },
  inactive: { label: "Inativo", variant: "secondary" as const, color: "bg-gray-100 text-gray-800" },
  discharged: { label: "Alta", variant: "outline" as const, color: "bg-blue-100 text-blue-800" },
};

const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const PatientCard = ({ 
  patient, 
  onEdit, 
  onDelete,
  onViewRecords, 
  onViewNetwork,
  onViewRoadmap
}: PatientCardProps) => {
  const statusInfo = statusConfig[patient.status];
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{patient.full_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
                {patient.birth_date && (
                  <span className="text-sm text-muted-foreground">
                    {calculateAge(patient.birth_date)} anos
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Botão primário - Roadmap */}
            <Button
              size="sm"
              onClick={() => onViewRoadmap?.(patient)}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              Roadmap
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            {/* Menu dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(patient)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Paciente
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewRecords?.(patient)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Prontuário
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewNetwork?.(patient)}>
                  <Network className="w-4 h-4 mr-2" />
                  Rede de Processos
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(patient)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Paciente
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Contact Information Section */}
        {(patient.email || patient.phone || patient.address) && (
          <div className="space-y-2">
            {patient.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{patient.email}</span>
              </div>
            )}
            
            {patient.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{patient.phone}</span>
              </div>
            )}
            
            {patient.address && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{patient.address}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Metadata Section */}
        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Criado em {format(new Date(patient.created_at), "dd/MM/yyyy", { locale: ptBR })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
