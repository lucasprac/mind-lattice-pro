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
  FileText, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Calendar,
  User,
  Hash,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Record } from "@/hooks/useRecords";

interface RecordCardProps {
  record: Record;
  onEdit?: (record: Record) => void;
  onDelete?: (record: Record) => void;
  onView?: (record: Record) => void;
  showPatientName?: boolean;
}

export const RecordCard = ({ 
  record, 
  onEdit, 
  onDelete, 
  onView,
  showPatientName = true 
}: RecordCardProps) => {
  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {showPatientName && record.patient && (
                  <h3 className="font-semibold text-lg">{record.patient.full_name}</h3>
                )}
                {record.session_number && (
                  <Badge variant="outline" className="gap-1">
                    <Hash className="h-3 w-3" />
                    Sessão {record.session_number}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(record.session_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
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
              <DropdownMenuItem onClick={() => onView?.(record)}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(record)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(record)}
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
          {/* Descrição */}
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {truncateText(record.description)}
            </p>
          </div>
          
          {/* Palavras-chave */}
          {record.keywords && record.keywords.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Palavras-chave:</h4>
              <div className="flex flex-wrap gap-1">
                {record.keywords.slice(0, 6).map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
                {record.keywords.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{record.keywords.length - 6} mais
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Observações */}
          {record.observations && (
            <div>
              <h4 className="text-sm font-medium mb-2">Observações:</h4>
              <p className="text-sm text-muted-foreground italic">
                {truncateText(record.observations, 100)}
              </p>
            </div>
          )}
          
          {/* Data de criação */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Registrado em {format(new Date(record.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </span>
              {record.updated_at !== record.created_at && (
                <span>
                  Atualizado em {format(new Date(record.updated_at), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Ações rápidas */}
        <div className="flex gap-2 mt-4">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onView?.(record)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onEdit?.(record)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};