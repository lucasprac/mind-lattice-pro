import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Network,
  Grid3x3,
  FileText,
  Target,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Edit
} from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useRecords } from "@/hooks/useRecords";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ROADMAP_STEPS = [
  {
    id: 1,
    title: "Avaliação Inicial",
    description: "Escala PBAT (Process-Based Assessment Tool)",
    icon: ClipboardList,
    color: "bg-blue-500",
    path: "/assessment"
  },
  {
    id: 2,
    title: "Análise da Rede",
    description: "Construção da rede de processos com conexões",
    icon: Network,
    color: "bg-green-500",
    path: "/network"
  },
  {
    id: 3,
    title: "Análise de Mediadores",
    description: "Linkagem de processos aos mediadores por dimensão",
    icon: Grid3x3,
    color: "bg-purple-500",
    path: "/mediators"
  },
  {
    id: 4,
    title: "Análise Funcional",
    description: "Análise de Seleção, Variação e Retenção",
    icon: FileText,
    color: "bg-orange-500",
    path: "/functional"
  },
  {
    id: 5,
    title: "Intervenções",
    description: "Seleção e planejamento de intervenções",
    icon: Target,
    color: "bg-red-500",
    path: "/interventions",
    status: "development"
  }
];

const SessionRoadmap = () => {
  const { patientId, recordId } = useParams<{ patientId: string; recordId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { records } = useRecords(patientId);
  const [currentStep, setCurrentStep] = useState(1);

  const patient = patients.find(p => p.id === patientId);
  const record = records.find(r => r.id === recordId);

  if (!patient || !record) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {!patient ? "Paciente não encontrado" : "Sessão não encontrada"}
          </p>
          <Button className="mt-4" onClick={() => navigate("/patients")}>
            Voltar para Pacientes
          </Button>
        </Card>
      </div>
    );
  }

  const handleStepClick = (step: typeof ROADMAP_STEPS[0]) => {
    if (step.status === "development") return;
    setCurrentStep(step.id);
    navigate(`/patients/${patientId}/session/${recordId}${step.path}`);
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
            Voltar para Sessões
          </Button>
          <h1 className="text-3xl font-bold">{patient.full_name}</h1>
          <p className="text-muted-foreground">
            Roadmap da Sessão #{record.session_number} - {format(new Date(record.session_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/patients/${patientId}/session/${recordId}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Prontuário
          </Button>
          <Badge variant="secondary" className="h-fit">
            Sessão {record.session_number}
          </Badge>
        </div>
      </div>

      {/* Session Info Card */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <h3 className="font-semibold mb-2">Descrição da Sessão</h3>
        <p className="text-sm text-muted-foreground">{record.description}</p>
        {record.keywords && record.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {record.keywords.map((keyword, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Guia Principal */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <h2 className="text-xl font-bold mb-3">Guia de Análise da Sessão</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Siga as etapas do modelo EEMM para análise idiográfica desta sessão específica.
          Cada etapa constrói sobre a anterior para uma compreensão dos processos trabalhados nesta consulta.
        </p>
      </Card>

      {/* Roadmap Steps */}
      <div className="space-y-4">
        {ROADMAP_STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isDevelopment = step.status === "development";
          const IconComponent = step.icon;

          return (
            <Card
              key={step.id}
              className={`p-6 cursor-pointer transition-all ${
                isActive
                  ? "border-primary shadow-lg"
                  : isCompleted
                  ? "border-green-200 bg-green-50/50"
                  : isDevelopment
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:shadow-md"
              }`}
              onClick={() => !isDevelopment && handleStepClick(step)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                      ? step.color + " text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-7 w-7" />
                  ) : (
                    <IconComponent className="h-7 w-7" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">
                      {step.id}. {step.title}
                    </h3>
                    {isDevelopment && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                        Em Desenvolvimento
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">{step.description}</p>

                  {!isDevelopment && (
                    <Button
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStepClick(step);
                      }}
                    >
                      {isActive ? "Continuar" : isCompleted ? "Revisar" : "Iniciar"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>

                {/* Connection line */}
                {index < ROADMAP_STEPS.length - 1 && (
                  <div className="absolute left-10 -bottom-4 w-0.5 h-4 bg-border"></div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SessionRoadmap;
