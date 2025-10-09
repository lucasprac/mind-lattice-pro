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
  updated_at?: string;
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
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
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
              <DropdownMenuItem 
                onClick={() => onDelete?.(patient)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Paciente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Contact Information Section */}
        {(patient.email || patient.phone || patient.address) && (
          <div className="space-y-3 pb-4 mb-4 border-b">
            {patient.email && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-foreground">{patient.email}</span>
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

            {patient.address && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-foreground line-clamp-2">{patient.address}</span>
              </div>
            )}
          </div>
        )}

        {/* Metadata Section */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            Criado em {format(new Date(patient.created_at), "dd/MM/yyyy", { locale: ptBR })}
          </span>
        </div>

        {/* Action Buttons */}
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
      </CardContent>
    </Card>
  );
};
