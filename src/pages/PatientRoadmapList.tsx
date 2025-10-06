import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Calendar, FileText, ArrowRight } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useRecords } from "@/hooks/useRecords";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PatientRoadmapList = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { records, loading } = useRecords(patientId);

  const patient = patients.find(p => p.id === patientId);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/patients")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Pacientes
          </Button>
          <h1 className="text-3xl font-bold">{patient.full_name}</h1>
          <p className="text-muted-foreground">
            Sessões e Roadmaps de Intervenção
          </p>
        </div>
        <Badge variant="secondary" className="h-fit">
          {patient.status === "active" ? "Ativo" : patient.status === "inactive" ? "Inativo" : "Finalizado"}
        </Badge>
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <h2 className="text-xl font-bold mb-3">Análise por Sessão</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Cada sessão possui seu próprio roadmap de análise seguindo o modelo EEMM. 
          Crie uma nova sessão para iniciar um novo ciclo de análise ou revise sessões anteriores.
        </p>
      </Card>

      {/* New Session Button */}
      <Card className="p-6">
        <Button 
          size="lg" 
          className="w-full"
          onClick={() => navigate(`/patients/${patientId}/session/new`)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Sessão
        </Button>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Sessões Anteriores</h2>
        
        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Carregando sessões...</p>
          </Card>
        ) : records.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Nenhuma sessão registrada ainda</p>
            <Button onClick={() => navigate(`/patients/${patientId}/session/new`)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Sessão
            </Button>
          </Card>
        ) : (
          records.map((record) => (
            <Card
              key={record.id}
              className="p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(`/patients/${patientId}/session/${record.id}/roadmap`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="outline" className="text-sm">
                      Sessão #{record.session_number}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(record.session_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3">{record.description}</p>
                  
                  {record.keywords && record.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {record.keywords.slice(0, 5).map((keyword, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {record.keywords.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{record.keywords.length - 5} mais
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientRoadmapList;
