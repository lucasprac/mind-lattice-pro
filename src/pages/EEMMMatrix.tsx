import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity,
  Brain,
  Heart,
  Target,
  Users,
  TrendingUp,
  Search,
  Network,
  Zap,
  BarChart3,
  Plus,
  Info,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  FileText,
  Lightbulb,
  Edit,
  Trash2,
  Eye,
  User,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { usePatients } from "@/hooks/usePatients";
import { useEEMMProcesses, type CreateEEMMProcessData } from "@/hooks/useEEMMProcesses";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// EEMM Framework Structure
const EEMM_DIMENSIONS = {
  afeto: { 
    name: "Afeto", 
    icon: Heart, 
    color: "bg-red-100 border-red-300 text-red-800",
    description: "Estados emocionais e regulação emocional"
  },
  cognicao: { 
    name: "Cognição", 
    icon: Brain, 
    color: "bg-blue-100 border-blue-300 text-blue-800",
    description: "Processos de pensamento, resolução de problemas e atitudes"
  },
  atencao: { 
    name: "Atenção", 
    icon: Target, 
    color: "bg-yellow-100 border-yellow-300 text-yellow-800",
    description: "Controle atencional e consciência presente"
  },
  self: { 
    name: "Self", 
    icon: Users, 
    color: "bg-green-100 border-green-300 text-green-800",
    description: "Conceito de self e identidade"
  },
  motivacao: { 
    name: "Motivação", 
    icon: TrendingUp, 
    color: "bg-purple-100 border-purple-300 text-purple-800",
    description: "Valores, comprometimento e direcionamento comportamental"
  },
  comportamento: { 
    name: "Comportamento Manifesto", 
    icon: Activity, 
    color: "bg-orange-100 border-orange-300 text-orange-800",
    description: "Ações observáveis e persistência na busca de objetivos"
  }
};

const EVOLUTIONARY_PROCESSES = {
  variacao: {
    name: "Variação",
    description: "Geração de alternativas comportamentais, cognitivas e emocionais",
    color: "bg-emerald-50 border-emerald-200"
  },
  selecao: {
    name: "Seleção",
    description: "Escolha de respostas adaptativas baseadas no contexto e objetivos",
    color: "bg-amber-50 border-amber-200"
  },
  retencao: {
    name: "Retenção",
    description: "Manutenção e consolidação de padrões funcionais",
    color: "bg-violet-50 border-violet-200"
  }
};

const ANALYSIS_LEVELS = {
  biofisiologico: {
    name: "Biofisiológico",
    description: "Processos neurobiológicos e fisiológicos",
    color: "bg-slate-100"
  },
  sociocultural: {
    name: "Sociocultural",
    description: "Influências sociais, culturais e interpessoais",
    color: "bg-stone-100"
  },
  psicologico: {
    name: "Psicológico",
    description: "Processos psicológicos, cognitivos e emocionais",
    color: "bg-indigo-100"
  }
};

// Roadmap Steps
const ROADMAP_STEPS = [
  {
    id: 1,
    title: "Avaliação Inicial",
    description: "Coleta de dados intensivos e identificação de variáveis-chave",
    icon: Search,
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "Análise de Rede Idiográfica",
    description: "Mapeamento de conexões e identificação de pontos de alavancagem",
    icon: Network,
    color: "bg-green-500"
  },
  {
    id: 3,
    title: "Seleção de Intervenções",
    description: "Escolha de kernels de intervenção baseados em evidências",
    icon: Zap,
    color: "bg-orange-500"
  },
  {
    id: 4,
    title: "Monitoramento e Ajuste",
    description: "Avaliação contínua e reformulação dinâmica",
    icon: BarChart3,
    color: "bg-purple-500"
  }
];

const EEMMMatrix = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedCell, setSelectedCell] = useState<{dimensao: string, processo: string} | null>(null);
  const [showAddProcess, setShowAddProcess] = useState(false);
  const [showProcessDetail, setShowProcessDetail] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [showDeleteProcess, setShowDeleteProcess] = useState(false);
  const [activeTab, setActiveTab] = useState("roadmap");
  
  // Hooks
  const { patients } = usePatients();
  const { 
    processes, 
    createProcess, 
    updateProcess, 
    deleteProcess,
    getProcessesByPatient,
    getProcessesForCell 
  } = useEEMMProcesses();
  
  // Form states for adding processes
  const [newProcess, setNewProcess] = useState({
    process_name: '',
    analysis_level: 'psicologico' as 'biofisiologico' | 'sociocultural' | 'psicologico',
    intensity: 3,
    evidence: '',
    intervention: ''
  });

  const selectedPatientProcesses = selectedPatient ? getProcessesByPatient(selectedPatient) : [];

  const addProcess = async () => {
    if (!selectedCell || !newProcess.process_name.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!selectedPatient) {
      toast.error("Selecione um paciente");
      return;
    }

    const processData: CreateEEMMProcessData = {
      patient_id: selectedPatient,
      dimension: selectedCell.dimensao as any,
      evolutionary_process: selectedCell.processo as any,
      analysis_level: newProcess.analysis_level,
      process_name: newProcess.process_name.trim(),
      intensity: newProcess.intensity,
      evidence: newProcess.evidence.trim() || undefined,
      intervention: newProcess.intervention.trim() || undefined
    };

    const success = await createProcess(processData);
    if (success) {
      setNewProcess({ 
        process_name: '', 
        analysis_level: 'psicologico', 
        intensity: 3, 
        evidence: '', 
        intervention: '' 
      });
      setShowAddProcess(false);
      setSelectedCell(null);
    }
  };

  const handleUpdateProcess = async () => {
    if (!selectedProcess) return;

    const success = await updateProcess(selectedProcess.id, {
      process_name: selectedProcess.process_name,
      analysis_level: selectedProcess.analysis_level,
      intensity: selectedProcess.intensity,
      evidence: selectedProcess.evidence,
      intervention: selectedProcess.intervention
    });

    if (success) {
      setShowProcessDetail(false);
      setSelectedProcess(null);
    }
  };

  const handleDeleteProcess = async () => {
    if (!selectedProcess) return;

    const success = await deleteProcess(selectedProcess.id);
    if (success) {
      setShowDeleteProcess(false);
      setShowProcessDetail(false);
      setSelectedProcess(null);
    }
  };

  const getCellProcesses = (dimensao: string, processo: string) => {
    return selectedPatientProcesses.filter(p => 
      p.dimension === dimensao && p.evolutionary_process === processo
    );
  };

  const getStepProgress = (step: number) => {
    const totalCells = Object.keys(EEMM_DIMENSIONS).length * Object.keys(EVOLUTIONARY_PROCESSES).length;
    const completedCells = selectedPatientProcesses.length;
    
    switch (step) {
      case 1: return Math.min((completedCells / totalCells) * 100, 100);
      case 2: return completedCells >= 5 ? 100 : (completedCells / 5) * 100;
      case 3: return selectedPatientProcesses.some(p => p.intervention) ? 100 : 0;
      case 4: return 0; // Seria baseado em dados de monitoramento
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Matriz EEMM</h1>
        <p className="text-muted-foreground">
          Extended Evolutionary Meta-Model - Framework unificador para compreensão e intervenção em processos de mudança psicológica
        </p>
      </div>

      {/* About EEMM */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-lg text-blue-900 mb-2">O que é a Matriz EEMM?</h3>
              <p className="text-blue-800 leading-relaxed">
                A Matriz EEMM (Extended Evolutionary Meta-Model) é um framework científico que organiza os processos psicológicos 
                em seis dimensões principais (Afeto, Cognição, Atenção, Self, Motivação e Comportamento) cruzadas com três processos 
                evolutivos (Variação, Seleção e Retenção). Ela permite uma análise idiográfica e contextualmente sensível para 
                intervenções baseadas em processos.
              </p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800">Antes de começar:</p>
                  <p className="text-amber-700 text-sm mt-1">
                    Para utilizar as funcionalidades da Matriz EEMM, você deve primeiro selecionar um paciente. 
                    Cada análise de processo deve ser específica para um indivíduo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Patient Selection */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Seleção de Paciente</h3>
            <p className="text-sm text-muted-foreground">Escolha o paciente para análise da matriz EEMM</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="patient-select">Paciente</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um paciente..." />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      {patient.full_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedPatient && (
            <div className="flex flex-col justify-end">
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium text-primary mb-1">
                  {patients.find(p => p.id === selectedPatient)?.full_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedPatientProcesses.length} processo{selectedPatientProcesses.length !== 1 ? 's' : ''} mapeado{selectedPatientProcesses.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Only show tabs if patient is selected */}
      {selectedPatient ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roadmap" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Roadmap de Intervenção
            </TabsTrigger>
            <TabsTrigger value="matrix" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Matriz Interativa
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Análise de Dados
            </TabsTrigger>
          </TabsList>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Roadmap de Intervenção com EEMM</h2>
              <p className="text-muted-foreground mb-6">
                Siga este processo estruturado para uma intervenção baseada na matriz EEMM para <strong>{patients.find(p => p.id === selectedPatient)?.full_name}</strong>:
              </p>
              
              <div className="space-y-6">
                {ROADMAP_STEPS.map((step, index) => {
                  const progress = getStepProgress(step.id);
                  const isActive = currentStep === step.id;
                  const isCompleted = progress === 100;
                  const IconComponent = step.icon;
                  
                  return (
                    <div 
                      key={step.id} 
                      className={`relative p-6 rounded-lg border-2 transition-all cursor-pointer ${
                        isActive 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : isCompleted 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => setCurrentStep(step.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isActive 
                            ? step.color + ' text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6" />
                          ) : (
                            <IconComponent className="h-6 w-6" />
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {step.id}. {step.title}
                            </h3>
                            <p className="text-muted-foreground">{step.description}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progresso</span>
                              <span className={`font-medium ${
                                isCompleted ? 'text-green-600' : isActive ? 'text-primary' : 'text-gray-500'
                              }`}>
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                          
                          {/* Step-specific content */}
                          {isActive && (
                            <div className="mt-4 p-4 bg-white rounded-md border">
                              {step.id === 1 && (
                                <div className="space-y-3">
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Ferramentas sugeridas:</strong> PBAT (Process-Based Assessment Tool), 
                                    avaliação clínica estruturada, medidas de densidade temporal alta.
                                  </p>
                                  <Button 
                                    onClick={() => setActiveTab('matrix')}
                                    className="w-full"
                                  >
                                    Começar Avaliação na Matriz
                                  </Button>
                                </div>
                              )}
                              {step.id === 2 && (
                                <div className="space-y-3">
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Próximo passo:</strong> Criar diagramas de rede mostrando como diferentes 
                                    processos se relacionam para este indivíduo específico.
                                  </p>
                                  <Button disabled className="w-full">
                                    Gerar Análise de Rede (Em desenvolvimento)
                                  </Button>
                                </div>
                              )}
                              {step.id === 3 && (
                                <div className="space-y-3">
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Kernels de intervenção:</strong> Escolha técnicas baseadas em evidências 
                                    que visem os processos identificados como centrais.
                                  </p>
                                  <Button disabled className="w-full">
                                    Biblioteca de Intervenções (Em desenvolvimento)
                                  </Button>
                                </div>
                              )}
                              {step.id === 4 && (
                                <div className="space-y-3">
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Monitoramento:</strong> Colete dados regularmente para monitorar mudanças 
                                    na rede de processos e ajuste as intervenções.
                                  </p>
                                  <Button disabled className="w-full">
                                    Ferramentas de Monitoramento (Em desenvolvimento)
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Connection line */}
                        {index < ROADMAP_STEPS.length - 1 && (
                          <div className="absolute left-10 -bottom-6 w-0.5 h-6 bg-gray-300"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Matrix Tab */}
          <TabsContent value="matrix" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Matriz EEMM Interativa</h2>
                  <p className="text-muted-foreground">
                    6 Dimensões × 3 Processos Evolutivos × 3 Níveis de Análise para <strong>{patients.find(p => p.id === selectedPatient)?.full_name}</strong>
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{selectedPatientProcesses.length}</span> processos mapeados
                </div>
              </div>

              {/* Evolutionary Processes Legend */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Processos Evolutivos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(EVOLUTIONARY_PROCESSES).map(([key, process]) => (
                    <div key={key} className={`p-3 rounded-lg border ${process.color}`}>
                      <h4 className="font-medium">{process.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{process.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matrix Grid */}
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header */}
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <div></div>
                    {Object.entries(EVOLUTIONARY_PROCESSES).map(([key, process]) => (
                      <div key={key} className={`p-3 rounded-lg text-center font-medium ${process.color}`}>
                        {process.name}
                      </div>
                    ))}
                  </div>

                  {/* Dimension Rows */}
                  {Object.entries(EEMM_DIMENSIONS).map(([dimKey, dimension]) => {
                    const IconComponent = dimension.icon;
                    return (
                      <div key={dimKey} className="grid grid-cols-4 gap-2 mb-2">
                        {/* Dimension Header */}
                        <div className={`p-4 rounded-lg ${dimension.color} flex items-center gap-3`}>
                          <IconComponent className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{dimension.name}</div>
                            <div className="text-xs opacity-75">{dimension.description}</div>
                          </div>
                        </div>
                        
                        {/* Process Cells */}
                        {Object.entries(EVOLUTIONARY_PROCESSES).map(([procKey, process]) => {
                          const cellProcesses = getCellProcesses(dimKey, procKey);
                          const hasProcesses = cellProcesses.length > 0;
                          
                          return (
                            <Card 
                              key={`${dimKey}-${procKey}`}
                              className={`p-3 min-h-[100px] cursor-pointer transition-all hover:shadow-md border-2 ${
                                hasProcesses ? 'border-primary/30 bg-primary/5' : 'border-dashed hover:border-primary/50'
                              }`}
                              onClick={() => {
                                setSelectedCell({ dimensao: dimKey, processo: procKey });
                                setShowAddProcess(true);
                              }}
                            >
                              <div className="h-full flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    {cellProcesses.length}
                                  </Badge>
                                  {hasProcesses ? (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Plus className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                
                                <div className="space-y-1 flex-1">
                                  {cellProcesses.slice(0, 2).map((proc) => (
                                    <div 
                                      key={proc.id}
                                      className="text-xs p-2 bg-white border rounded truncate cursor-pointer hover:bg-accent"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedProcess(proc);
                                        setShowProcessDetail(true);
                                      }}
                                      title={proc.process_name}
                                    >
                                      <div className="font-medium">{proc.process_name}</div>
                                      <div className="text-muted-foreground">
                                        {ANALYSIS_LEVELS[proc.analysis_level].name} • Intensidade {proc.intensity}
                                      </div>
                                    </div>
                                  ))}
                                  {cellProcesses.length > 2 && (
                                    <div className="text-xs text-muted-foreground text-center py-1">
                                      +{cellProcesses.length - 2} mais
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-center mt-2">
                                  {hasProcesses ? (
                                    <div className="text-xs text-muted-foreground">
                                      {cellProcesses.length} processo{cellProcesses.length !== 1 ? 's' : ''}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                      <Plus className="h-3 w-3" />
                                      Adicionar
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Analysis Levels */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-semibold mb-3">Níveis de Análise</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(ANALYSIS_LEVELS).map(([key, level]) => (
                    <div key={key} className={`p-4 rounded-lg border ${level.color}`}>
                      <h4 className="font-medium">{level.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{level.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                Análise de Dados - {patients.find(p => p.id === selectedPatient)?.full_name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{selectedPatientProcesses.length}</div>
                  <div className="text-sm text-muted-foreground">Processos Mapeados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Object.keys(EEMM_DIMENSIONS).filter(dim => 
                      selectedPatientProcesses.some(p => p.dimension === dim)
                    ).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Dimensões Ativas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {selectedPatientProcesses.filter(p => (p.intensity || 0) >= 4).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Alta Intensidade</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {selectedPatientProcesses.filter(p => p.intervention).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Com Intervenção</div>
                </div>
              </div>
              
              {selectedPatientProcesses.length > 0 ? (
                <div className="mt-8 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Distribuição por Dimensão</h3>
                    <div className="space-y-3">
                      {Object.entries(EEMM_DIMENSIONS).map(([key, dim]) => {
                        const dimProcesses = selectedPatientProcesses.filter(p => p.dimension === key);
                        const percentage = selectedPatientProcesses.length > 0 
                          ? (dimProcesses.length / selectedPatientProcesses.length) * 100 
                          : 0;
                        
                        return (
                          <div key={key}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{dim.name}</span>
                              <span>{dimProcesses.length} processos</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">Distribuição por Nível de Análise</h3>
                    <div className="space-y-3">
                      {Object.entries(ANALYSIS_LEVELS).map(([key, level]) => {
                        const levelProcesses = selectedPatientProcesses.filter(p => p.analysis_level === key);
                        const percentage = selectedPatientProcesses.length > 0 
                          ? (levelProcesses.length / selectedPatientProcesses.length) * 100 
                          : 0;
                        
                        return (
                          <div key={key}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{level.name}</span>
                              <span>{levelProcesses.length} processos</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum processo mapeado ainda para este paciente.</p>
                  <p className="text-sm">Comece adicionando processos na Matriz Interativa.</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Selecione um Paciente</h3>
            <p>Para começar a trabalhar com a Matriz EEMM, você precisa primeiro selecionar um paciente.</p>
            <p className="text-sm mt-2">Cada análise de processo deve ser específica para um indivíduo.</p>
          </div>
        </Card>
      )}

      {/* Add Process Dialog */}
      <Dialog open={showAddProcess} onOpenChange={setShowAddProcess}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Processo</DialogTitle>
            <DialogDescription>
              {selectedCell && (
                <span>
                  Dimensão: <strong>{EEMM_DIMENSIONS[selectedCell.dimensao as keyof typeof EEMM_DIMENSIONS]?.name}</strong> | 
                  Processo: <strong>{EVOLUTIONARY_PROCESSES[selectedCell.processo as keyof typeof EVOLUTIONARY_PROCESSES]?.name}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="processo">Nome do Processo *</Label>
              <Input
                id="processo"
                placeholder="Ex: Ruminação cognitiva, Regulação emocional..."
                value={newProcess.process_name}
                onChange={(e) => setNewProcess(prev => ({ ...prev, process_name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="nivel">Nível de Análise</Label>
              <Select 
                value={newProcess.analysis_level} 
                onValueChange={(value: any) => setNewProcess(prev => ({ ...prev, analysis_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ANALYSIS_LEVELS).map(([key, level]) => (
                    <SelectItem key={key} value={key}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="intensidade">Intensidade (1-5)</Label>
              <div className="flex items-center gap-4 mt-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newProcess.intensity}
                  onChange={(e) => setNewProcess(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <Badge variant="outline">{newProcess.intensity}</Badge>
              </div>
            </div>
            
            <div>
              <Label htmlFor="evidencia">Evidência/Observação</Label>
              <Textarea
                id="evidencia"
                placeholder="Descreva as evidências ou observações que suportam este processo..."
                value={newProcess.evidence}
                onChange={(e) => setNewProcess(prev => ({ ...prev, evidence: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="intervencao">Intervenção (Opcional)</Label>
              <Textarea
                id="intervencao"
                placeholder="Descreva intervenções ou técnicas específicas para este processo..."
                value={newProcess.intervention}
                onChange={(e) => setNewProcess(prev => ({ ...prev, intervention: e.target.value }))}
                rows={2}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddProcess(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={addProcess} className="flex-1">
                Adicionar Processo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Process Detail Dialog */}
      <Dialog open={showProcessDetail} onOpenChange={setShowProcessDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Processo</DialogTitle>
            <DialogDescription>
              {selectedProcess && (
                <span>
                  {EEMM_DIMENSIONS[selectedProcess.dimension as keyof typeof EEMM_DIMENSIONS]?.name} • 
                  {EVOLUTIONARY_PROCESSES[selectedProcess.evolutionary_process as keyof typeof EVOLUTIONARY_PROCESSES]?.name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProcess && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-processo">Nome do Processo</Label>
                <Input
                  id="edit-processo"
                  value={selectedProcess.process_name || ''}
                  onChange={(e) => setSelectedProcess(prev => ({ ...prev, process_name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-nivel">Nível de Análise</Label>
                <Select 
                  value={selectedProcess.analysis_level || 'psicologico'} 
                  onValueChange={(value: any) => setSelectedProcess(prev => ({ ...prev, analysis_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ANALYSIS_LEVELS).map(([key, level]) => (
                      <SelectItem key={key} value={key}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-intensidade">Intensidade (1-5)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={selectedProcess.intensity || 3}
                    onChange={(e) => setSelectedProcess(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <Badge variant="outline">{selectedProcess.intensity || 3}</Badge>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-evidencia">Evidência/Observação</Label>
                <Textarea
                  id="edit-evidencia"
                  value={selectedProcess.evidence || ''}
                  onChange={(e) => setSelectedProcess(prev => ({ ...prev, evidence: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-intervencao">Intervenção</Label>
                <Textarea
                  id="edit-intervencao"
                  value={selectedProcess.intervention || ''}
                  onChange={(e) => setSelectedProcess(prev => ({ ...prev, intervention: e.target.value }))}
                  rows={2}
                />
              </div>
              
              <div className="text-xs text-muted-foreground">
                Criado em: {format(new Date(selectedProcess.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteProcess(true)}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
                <Button onClick={handleUpdateProcess} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Process Dialog */}
      <AlertDialog open={showDeleteProcess} onOpenChange={setShowDeleteProcess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Processo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir este processo? Esta ação não pode ser desfeita.
              <br /><br />
              <strong>Processo:</strong> {selectedProcess?.process_name}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProcess} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EEMMMatrix;