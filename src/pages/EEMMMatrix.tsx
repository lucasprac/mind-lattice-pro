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
  User,
  Edit,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { usePatients } from "@/hooks/usePatients";
import { useNavigate } from "react-router-dom";

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
  psicologico: {
    name: "Psicológico",
    description: "Processos cognitivos, emocionais e comportamentais",
    color: "bg-blue-100"
  },
  sociocultural: {
    name: "Sociocultural",
    description: "Influências sociais, culturais e interpessoais",
    color: "bg-stone-100"
  }
};

interface ProcessEntry {
  id: string;
  dimensao: string;
  processo: string;
  nivel: string;
  intensidade: number;
  evidencia: string;
  titulo: string;
  intervencao?: string;
}

const EEMMMatrix = () => {
  const navigate = useNavigate();
  const { patients } = usePatients();
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [processes, setProcesses] = useState<ProcessEntry[]>([]);
  const [selectedCell, setSelectedCell] = useState<{dimensao: string, processo: string} | null>(null);
  const [showAddProcess, setShowAddProcess] = useState(false);
  const [editingProcess, setEditingProcess] = useState<ProcessEntry | null>(null);
  const [activeTab, setActiveTab] = useState("intro");
  
  // Form states for adding processes
  const [newProcess, setNewProcess] = useState({
    titulo: '',
    nivel: 'psicologico', // Default to psychological level
    intensidade: 3,
    evidencia: ''
  });

  const addProcess = () => {
    if (!selectedCell || !newProcess.titulo.trim()) {
      toast.error("Preencha o título do processo");
      return;
    }

    if (!selectedPatient) {
      toast.error("Selecione um paciente primeiro");
      return;
    }

    const processEntry: ProcessEntry = {
      id: editingProcess?.id || `process-${Date.now()}`,
      dimensao: selectedCell.dimensao,
      processo: selectedCell.processo,
      titulo: newProcess.titulo.trim(),
      nivel: newProcess.nivel,
      intensidade: newProcess.intensidade,
      evidencia: newProcess.evidencia.trim()
    };

    if (editingProcess) {
      setProcesses(prev => prev.map(p => p.id === editingProcess.id ? processEntry : p));
      toast.success("Processo atualizado com sucesso!");
    } else {
      setProcesses(prev => [...prev, processEntry]);
      toast.success("Processo adicionado com sucesso!");
    }
    
    setNewProcess({ titulo: '', nivel: 'psicologico', intensidade: 3, evidencia: '' });
    setShowAddProcess(false);
    setSelectedCell(null);
    setEditingProcess(null);
  };

  const editProcess = (process: ProcessEntry) => {
    setEditingProcess(process);
    setSelectedCell({ dimensao: process.dimensao, processo: process.processo });
    setNewProcess({
      titulo: process.titulo,
      nivel: process.nivel,
      intensidade: process.intensidade,
      evidencia: process.evidencia
    });
    setShowAddProcess(true);
  };

  const getProcessesForCell = (dimensao: string, processo: string) => {
    return processes.filter(p => p.dimensao === dimensao && p.processo === processo);
  };

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-3">
          Matriz EEMM
        </h1>
        <p className="text-lg text-muted-foreground">
          Extended Evolutionary Meta-Model - Framework unificador para compreensão e intervenção em processos de mudança psicológica
        </p>
      </div>

      {/* Introduction Card */}
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <Info className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-2xl text-blue-900 mb-3">O que é a Matriz EEMM?</h3>
              <p className="text-blue-800 leading-relaxed mb-4">
                O <strong>Extended Evolutionary Meta-Model (EEMM)</strong> é uma estrutura unificadora que permite aos clínicos 
                compreender e intervir em processos de mudança psicológica de forma idiográfica e contextualmente sensível. 
                A matriz organiza os processos psicológicos em <strong>6 dimensões</strong> cruzadas com <strong>3 processos evolutivos</strong>, 
                permitindo análise precisa em múltiplos níveis.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Como usar:</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span><strong>1.</strong> Selecione um paciente para trabalhar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span><strong>2.</strong> Use a Matriz Interativa para mapear processos específicos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span><strong>3.</strong> Analise padrões e planeje intervenções baseadas em evidências</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Patient Selection */}
      <Card className="p-6 border-2 border-primary/20">
        <div className="flex items-center gap-4 mb-4">
          <User className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-xl font-semibold">Seleção do Paciente</h3>
            <p className="text-sm text-muted-foreground">Escolha um paciente para trabalhar com a Matriz EEMM</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Selecione o Paciente *</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um paciente..." />
              </SelectTrigger>
              <SelectContent>
                {patients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {patient.full_name}
                      <Badge variant="outline" className="text-xs">
                        {patient.status === 'active' ? 'Ativo' : patient.status === 'inactive' ? 'Inativo' : 'Alta'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedPatientData && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="font-medium">{selectedPatientData.full_name}</div>
              <div className="text-sm text-muted-foreground">
                {selectedPatientData.email && <div>📧 {selectedPatientData.email}</div>}
                {selectedPatientData.phone && <div>📱 {selectedPatientData.phone}</div>}
              </div>
            </div>
          )}
        </div>
        
        {!selectedPatient && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Selecione um paciente para continuar com a análise EEMM</span>
            </div>
          </div>
        )}
      </Card>

      {/* Only show EEMM functionality if patient is selected */}
      {selectedPatient ? (
        <>
          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="matrix" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Matriz Interativa
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Análise de Dados
              </TabsTrigger>
            </TabsList>

            {/* Matrix Tab */}
            <TabsContent value="matrix" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Matriz EEMM Interativa</h2>
                    <p className="text-muted-foreground">
                      6 Dimensões × 3 Processos Evolutivos × 3 Níveis de Análise
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{processes.length}</span> processos mapeados para <strong>{selectedPatientData?.full_name}</strong>
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
                            const cellProcesses = getProcessesForCell(dimKey, procKey);
                            const hasProcesses = cellProcesses.length > 0;
                            
                            return (
                              <Card 
                                key={`${dimKey}-${procKey}`}
                                className={`p-3 min-h-[100px] cursor-pointer transition-all hover:shadow-md border-2 ${
                                  hasProcesses ? 'border-primary/30 bg-primary/5' : 'border-dashed hover:border-primary/50'
                                }`}
                                onClick={() => {
                                  setSelectedCell({ dimensao: dimKey, processo: procKey });
                                  setEditingProcess(null);
                                  setNewProcess({ titulo: '', nivel: 'psicologico', intensidade: 3, evidencia: '' });
                                  setShowAddProcess(true);
                                }}
                              >
                                <div className="h-full flex flex-col justify-between">
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="text-xs">
                                      {cellProcesses.length}
                                    </Badge>
                                    {hasProcesses && (
                                      <div className="flex gap-1">
                                        {cellProcesses.slice(0, 3).map((_, i) => (
                                          <div key={i} className="w-2 h-2 bg-primary rounded-full"></div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Show processes in cell */}
                                  {hasProcesses ? (
                                    <div className="space-y-1">
                                      {cellProcesses.slice(0, 2).map(process => (
                                        <div key={process.id} className="group">
                                          <div className="text-xs font-medium truncate bg-white p-1 rounded border">
                                            {process.titulo}
                                          </div>
                                          <div className="flex gap-1 mt-1">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                editProcess(process);
                                              }}
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                      {cellProcesses.length > 2 && (
                                        <div className="text-xs text-muted-foreground">
                                          +{cellProcesses.length - 2} mais
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-center">
                                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                        <Plus className="h-3 w-3" />
                                        Adicionar Processo
                                      </div>
                                    </div>
                                  )}
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
                    {Object.entries(ANALYSIS_LEVELS).map(([key, level]) => {
                      const processCount = processes.filter(p => p.nivel === key).length;
                      return (
                        <div key={key} className={`p-4 rounded-lg border ${level.color} relative`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{level.name}</h4>
                            <Badge variant="outline">{processCount}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{level.description}</p>
                          {key === 'psicologico' && (
                            <div className="absolute -top-1 -right-1">
                              <Badge className="text-xs bg-primary">Padrão</Badge>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Análise de Dados - {selectedPatientData?.full_name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{processes.length}</div>
                    <div className="text-sm text-muted-foreground">Processos Mapeados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {Object.keys(EEMM_DIMENSIONS).filter(dim => 
                        processes.some(p => p.dimensao === dim)
                      ).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Dimensões Ativas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {processes.filter(p => p.intensidade >= 4).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Alta Intensidade</div>
                  </div>
                </div>
                
                {processes.length > 0 ? (
                  <>
                    {/* Distribution Analysis */}
                    <div className="mb-8">
                      <h3 className="font-semibold mb-4">Distribuição por Dimensão</h3>
                      <div className="space-y-3">
                        {Object.entries(EEMM_DIMENSIONS).map(([key, dim]) => {
                          const dimProcesses = processes.filter(p => p.dimensao === key);
                          const percentage = processes.length > 0 ? (dimProcesses.length / processes.length) * 100 : 0;
                          
                          return (
                            <div key={key}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center gap-2">
                                  <dim.icon className="h-4 w-4" />
                                  {dim.name}
                                </span>
                                <span>{dimProcesses.length} processos</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Process List */}
                    <div>
                      <h3 className="font-semibold mb-4">Processos Catalogados</h3>
                      <div className="space-y-2">
                        {processes.map(process => {
                          const dimension = EEMM_DIMENSIONS[process.dimensao as keyof typeof EEMM_DIMENSIONS];
                          const evolutionaryProcess = EVOLUTIONARY_PROCESSES[process.processo as keyof typeof EVOLUTIONARY_PROCESSES];
                          const level = ANALYSIS_LEVELS[process.nivel as keyof typeof ANALYSIS_LEVELS];
                          
                          return (
                            <div key={process.id} className="p-4 bg-muted/50 rounded-lg flex items-center justify-between hover:bg-muted transition-colors">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium">{process.titulo}</span>
                                  <Badge variant="outline" className="text-xs">
                                    Intensidade {process.intensidade}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <dimension.icon className="h-3 w-3" />
                                    {dimension.name}
                                  </span>
                                  <span>→</span>
                                  <span>{evolutionaryProcess.name}</span>
                                  <span>→</span>
                                  <span>{level.name}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => editProcess(process)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Brain className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg mb-2">Nenhum processo mapeado ainda</p>
                    <p className="text-sm">Comece adicionando processos na Matriz Interativa.</p>
                    <Button 
                      className="mt-4" 
                      variant="outline"
                      onClick={() => setActiveTab('matrix')}
                    >
                      Ir para Matriz Interativa
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add/Edit Process Dialog */}
          <Dialog open={showAddProcess} onOpenChange={setShowAddProcess}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingProcess ? 'Editar Processo' : 'Adicionar Processo'}</DialogTitle>
                <DialogDescription>
                  {selectedCell && (
                    <span>
                      <strong>{EEMM_DIMENSIONS[selectedCell.dimensao as keyof typeof EEMM_DIMENSIONS]?.name}</strong> × <strong>{EVOLUTIONARY_PROCESSES[selectedCell.processo as keyof typeof EVOLUTIONARY_PROCESSES]?.name}</strong>
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título do Processo *</Label>
                  <Input
                    id="titulo"
                    placeholder="Ex: Ruminação sobre falhas pessoais"
                    value={newProcess.titulo}
                    onChange={(e) => setNewProcess(prev => ({ ...prev, titulo: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="nivel">Nível de Análise</Label>
                  <Select value={newProcess.nivel} onValueChange={(value) => setNewProcess(prev => ({ ...prev, nivel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ANALYSIS_LEVELS).map(([key, level]) => (
                        <SelectItem key={key} value={key}>
                          {level.name}
                          {key === 'psicologico' && <span className="text-xs text-muted-foreground ml-2">(Padrão)</span>}
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
                      value={newProcess.intensidade}
                      onChange={(e) => setNewProcess(prev => ({ ...prev, intensidade: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="min-w-[2rem] justify-center">{newProcess.intensidade}</Badge>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="evidencia">Evidência/Observação</Label>
                  <Textarea
                    id="evidencia"
                    placeholder="Descreva as evidências ou observações que suportam este processo..."
                    value={newProcess.evidencia}
                    onChange={(e) => setNewProcess(prev => ({ ...prev, evidencia: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddProcess(false);
                      setEditingProcess(null);
                    }} 
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={addProcess} className="flex-1">
                    {editingProcess ? 'Salvar Alterações' : 'Adicionar Processo'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Card className="p-12 text-center border-2 border-dashed">
          <User className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-semibold mb-2">Selecione um Paciente</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Para começar a trabalhar com a Matriz EEMM, você precisa selecionar um paciente.
            A análise será específica para o contexto e características do paciente escolhido.
          </p>
          {patients.length === 0 && (
            <Button onClick={() => navigate('/patients')} className="gap-2">
              <Plus className="h-4 w-4" />
              Cadastrar Primeiro Paciente
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default EEMMMatrix;