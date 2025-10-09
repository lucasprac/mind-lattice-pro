import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ClipboardList,
  Network,
  Grid3x3,
  FileText,
  Target,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronRight
} from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { usePatientAssessments } from "@/hooks/usePatientAssessments";

const ROADMAP_STEPS = [
  {
    id: 1,
    title: "Avaliação Inicial",
    description: "Escala PBAT (Process-Based Assessment Tool)",
    icon: ClipboardList,
    color: "bg-blue-500",
    status: "active",
    path: "/assessment"
  },
  {
    id: 2,
    title: "Análise da Rede",
    description: "Construção da rede de processos com conexões",
    icon: Network,
    color: "bg-green-500",
    status: "active",
    path: "/network"
  },
  {
    id: 3,
    title: "Análise de Mediadores",
    description: "Linkagem de processos aos mediadores por dimensão",
    icon: Grid3x3,
    color: "bg-purple-500",
    status: "active",
    path: "/mediators"
  },
  {
    id: 4,
    title: "Análise Funcional",
    description: "Análise de Seleção, Variação e Retenção",
    icon: FileText,
    color: "bg-orange-500",
    status: "active",
    path: "/functional"
  },
  {
    id: 5,
    title: "Intervenções",
    description: "Seleção e planejamento de intervenções",
    icon: Target,
    color: "bg-red-500",
    status: "development",
    path: "/interventions"
  }
];

const PatientRoadmap = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { assessments } = usePatientAssessments(patientId || "");

  const [currentStep, setCurrentStep] = useState(1);

  const patient = patients.find(p => p.id === patientId);

  // Determina o progresso baseado nas assessments e outras condições
  useEffect(() => {
    if (assessments && assessments.length > 0) {
      // Se tem assessment, pode ir para o próximo passo
      setCurrentStep(2);
    }
    // Aqui você pode adicionar outras verificações para os próximos passos
  }, [assessments]);

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

  const handleStepClick = (step: typeof ROADMAP_STEPS[0]) => {
    if (step.status === "development") return;
    setCurrentStep(step.id);
    navigate(`/patients/${patientId}${step.path}`);
  };

  const getNextStep = () => {
    const availableSteps = ROADMAP_STEPS.filter(step => step.status !== "development");
    const currentIndex = availableSteps.findIndex(step => step.id === currentStep);
    return currentIndex < availableSteps.length - 1 ? availableSteps[currentIndex + 1] : null;
  };

  const handleNextStep = () => {
    const nextStep = getNextStep();
    if (nextStep) {
      handleStepClick(nextStep);
    }
  };

  const nextStep = getNextStep();
  const completedSteps = assessments && assessments.length > 0 ? 1 : 0;
  const progress = (completedSteps / ROADMAP_STEPS.filter(s => s.status !== "development").length) * 100;

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
            Roadmap de Intervenção Baseada em Processos
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="h-fit">
            {patient.status === "active" ? "Ativo" : patient.status === "inactive" ? "Inativo" : "Finalizado"}
          </Badge>

          {/* Botão de Avançar no canto superior direito */}
          {nextStep && (
            <Button onClick={handleNextStep} className="bg-primary hover:bg-primary/90">
              Avançar para {nextStep.title}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progresso do Roadmap</span>
          <span className="text-sm text-muted-foreground">{completedSteps}/{ROADMAP_STEPS.filter(s => s.status !== "development").length} etapas</span>
        </div>
        <Progress value={progress} className="h-2" />
      </Card>

      {/* Guia Principal */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <h2 className="text-xl font-bold mb-3">Guia Principal de Intervenções</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Este roadmap segue o modelo EEMM (Extended Evolutionary Meta-Model) para diagnóstico 
          baseado em processos, focando na análise idiográfica e intervenção contextualmente sensível.
          Cada etapa constrói sobre a anterior para uma compreensão completa da rede de processos do paciente.
        </p>
      </Card>

      {/* Roadmap Steps */}
      <div className="space-y-4">
        {ROADMAP_STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id && step.status !== "development";
          const isDevelopment = step.status === "development";
          const isAccessible = step.id <= currentStep || isCompleted;
          const IconComponent = step.icon;

          return (
            <Card
              key={step.id}
              className={`p-6 transition-all relative ${
                isActive
                  ? "border-primary shadow-lg"
                  : isCompleted
                  ? "border-green-200 bg-green-50/50"
                  : isDevelopment
                  ? "opacity-60 cursor-not-allowed"
                  : isAccessible
                  ? "hover:shadow-md cursor-pointer"
                  : "opacity-50"
              }`}
              onClick={() => isAccessible && !isDevelopment && handleStepClick(step)}
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
                    <div className="flex items-center gap-2">
                      {isDevelopment && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                          Em Desenvolvimento
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          Concluída
                        </Badge>
                      )}
                      {isActive && !isDevelopment && (
                        <Badge className="bg-primary text-primary-foreground">
                          Atual
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">{step.description}</p>

                  {isAccessible && !isDevelopment && (
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

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/patients/${patientId}/records`)}
            className="h-auto p-4 flex flex-col items-start"
          >
            <FileText className="h-5 w-5 mb-2" />
            <span className="font-medium">Ver Prontuário</span>
            <span className="text-sm text-muted-foreground">Histórico completo do paciente</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(`/patients/${patientId}/network`)}
            className="h-auto p-4 flex flex-col items-start"
          >
            <Network className="h-5 w-5 mb-2" />
            <span className="font-medium">Visualizar Rede</span>
            <span className="text-sm text-muted-foreground">Mapa completo de processos</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(`/patients/${patientId}/assessment`)}
            className="h-auto p-4 flex flex-col items-start"
          >
            <ClipboardList className="h-5 w-5 mb-2" />
            <span className="font-medium">Nova Avaliação</span>
            <span className="text-sm text-muted-foreground">Aplicar PBAT novamente</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PatientRoadmap;
