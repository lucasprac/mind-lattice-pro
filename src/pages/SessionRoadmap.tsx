import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ClipboardList,
  Network,
  Grid3x3,
  FileText,
  Target,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Edit,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Plus,
  SlidersHorizontal,
  Filter,
  Trash2,
} from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useRecords } from "@/hooks/useRecords";
import { useRoadmapProcesses, type CreateRoadmapProcessData } from "@/hooks/useRoadmapProcesses";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const ROADMAP_STEPS = [
  { id: 1, title: "Avaliação Inicial", description: "Escala PBAT (Process-Based Assessment Tool)", icon: ClipboardList, color: "bg-blue-500", path: "/assessment" },
  { id: 2, title: "Análise da Rede", description: "Construção da rede de processos com conexões", icon: Network, color: "bg-green-500", path: "/network" },
  { id: 3, title: "Análise de Mediadores", description: "Linkagem de processos aos mediadores por dimensão", icon: Grid3x3, color: "bg-purple-500", path: "/mediators" },
  { id: 4, title: "Análise Funcional", description: "Análise de Seleção, Variação e Retenção", icon: FileText, color: "bg-orange-500", path: "/functional" },
  { id: 5, title: "Intervenções", description: "Seleção e planejamento de intervenções", icon: Target, color: "bg-red-500", path: "/interventions", status: "development" },
];

const SessionRoadmap = () => {
  const { patientId, recordId } = useParams<{ patientId: string; recordId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { records } = useRecords(patientId);
  const { processes, createProcess, updateProcess, deleteProcess, getProcessesByRecord, getProcessesByStatus, getProcessesByPriority } = useRoadmapProcesses();
  const [currentStep, setCurrentStep] = useState(1);

  const patient = patients.find(p => p.id === patientId);
  const record = records.find(r => r.id === recordId);

  // Estado do modal e formulário de novo processo
  const [showNewProcess, setShowNewProcess] = useState(false);
  const [newProcess, setNewProcess] = useState<CreateRoadmapProcessData>({
    process_type: "assessment",
    name: "",
    description: "",
    category: "",
    target_area: "",
    methodology: "",
    expected_outcomes: "",
    priority: 3,
    start_date: undefined,
    end_date: undefined,
  });

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const recordProcesses = useMemo(() => getProcessesByRecord(recordId || ""), [processes, recordId]);

  // Detect current step based on URL
  useState(() => {
    const path = window.location.pathname;
    const step = ROADMAP_STEPS.find(s => path.includes(s.path.substring(1)));
    if (step) setCurrentStep(step.id);
  });

  if (!patient || !record) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">{!patient ? "Paciente não encontrado" : "Sessão não encontrada"}</p>
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

  const navigateToStep = (stepId: number) => {
    const step = ROADMAP_STEPS.find(s => s.id === stepId);
    if (step && step.status !== "development") handleStepClick(step);
  };

  const filteredProcesses = recordProcesses.filter(p => {
    const statusOk = filterStatus === "all" ? true : p.status === filterStatus;
    const priorityOk = filterPriority === "all" ? true : (
      filterPriority === "high" ? p.priority >= 4 : filterPriority === "medium" ? p.priority === 3 : p.priority <= 2
    );
    return statusOk && priorityOk;
  });

  const handleCreateProcess = async () => {
    if (!newProcess.name.trim()) {
      toast.error("Nome do processo é obrigatório");
      return;
    }

    const ok = await createProcess({
      ...newProcess,
      patient_id: patientId,
      record_id: recordId,
    });

    if (ok) {
      setShowNewProcess(false);
      setNewProcess({ process_type: "assessment", name: "", description: "", category: "", target_area: "", methodology: "", expected_outcomes: "", priority: 3 });
    }
  };

  const canGoToPrevious = currentStep > 1;
  const canGoToNext = currentStep < ROADMAP_STEPS.length && ROADMAP_STEPS[currentStep]?.status !== "development";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate(`/patients/${patientId}`)} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Sessões
          </Button>
          <h1 className="text-3xl font-bold">{patient.full_name}</h1>
          <p className="text-muted-foreground">
            Roadmap da Sessão #{record.session_number} - {format(new Date(record.session_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Navigation className="h-3 w-3" />
            Etapa {currentStep} de {ROADMAP_STEPS.length}
          </Badge>
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button variant="ghost" size="sm" onClick={() => navigateToStep(currentStep - 1)} disabled={!canGoToPrevious} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigateToStep(currentStep + 1)} disabled={!canGoToNext} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/patients/${patientId}/session/${recordId}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Prontuário
          </Button>
        </div>
      </div>

      {/* Session Info */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <h3 className="font-semibold mb-2">Descrição da Sessão</h3>
        <p className="text-sm text-muted-foreground">{record.description}</p>
        {record.keywords && record.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {record.keywords.map((keyword, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{keyword}</Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Roadmap Processes Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Processos do Roadmap</h2>
            <p className="text-sm text-muted-foreground">Acompanhe processos vinculados a esta sessão</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="planned">Planejado</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Prioridade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="high">Alta (4-5)</SelectItem>
                <SelectItem value="medium">Média (3)</SelectItem>
                <SelectItem value="low">Baixa (1-2)</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={showNewProcess} onOpenChange={setShowNewProcess}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-2" />Novo Processo</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Novo Processo do Roadmap</DialogTitle>
                  <DialogDescription>Preencha as informações para criar um processo vinculado a esta sessão</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Nome *</Label>
                    <Input value={newProcess.name} onChange={(e) => setNewProcess(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select value={newProcess.process_type} onValueChange={(v) => setNewProcess(p => ({ ...p, process_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assessment">Avaliação</SelectItem>
                        <SelectItem value="intervention">Intervenção</SelectItem>
                        <SelectItem value="monitoring">Monitoramento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Input value={newProcess.category} onChange={(e) => setNewProcess(p => ({ ...p, category: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea rows={3} value={newProcess.description} onChange={(e) => setNewProcess(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Área Alvo</Label>
                      <Input value={newProcess.target_area} onChange={(e) => setNewProcess(p => ({ ...p, target_area: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Metodologia</Label>
                      <Input value={newProcess.methodology} onChange={(e) => setNewProcess(p => ({ ...p, methodology: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label>Resultados Esperados</Label>
                    <Textarea rows={2} value={newProcess.expected_outcomes} onChange={(e) => setNewProcess(p => ({ ...p, expected_outcomes: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Prioridade (1-5)</Label>
                      <Input type="number" min={1} max={5} value={newProcess.priority} onChange={(e) => setNewProcess(p => ({ ...p, priority: parseInt(e.target.value) || 3 }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Início</Label>
                        <Input type="date" onChange={(e) => setNewProcess(p => ({ ...p, start_date: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Fim</Label>
                        <Input type="date" onChange={(e) => setNewProcess(p => ({ ...p, end_date: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => setShowNewProcess(false)} className="flex-1">Cancelar</Button>
                    <Button onClick={handleCreateProcess} className="flex-1">Criar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {filteredProcesses.length > 0 ? (
          <div className="space-y-2">
            {filteredProcesses.map(proc => (
              <Card key={proc.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{proc.process_type}</Badge>
                      <span className="font-medium">{proc.name}</span>
                    </div>
                    {proc.description && <p className="text-sm text-muted-foreground mt-1">{proc.description}</p>}
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                      {proc.category && <Badge variant="secondary">{proc.category}</Badge>}
                      {proc.target_area && <span>Alvo: {proc.target_area}</span>}
                      {proc.methodology && <span>Metodologia: {proc.methodology}</span>}
                      <span>Prioridade: {proc.priority}</span>
                      <span>Status: {proc.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={async () => {
                      const ok = await updateProcess(proc.id, { status: proc.status === 'completed' ? 'in_progress' : 'completed' });
                      if (ok) toast.success('Status atualizado');
                    }}>Marcar {proc.status === 'completed' ? 'Em andamento' : 'Concluído'}</Button>
                    <Button size="sm" variant="destructive" onClick={async () => {
                      const ok = await deleteProcess(proc.id);
                      if (ok) toast.success('Processo removido');
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum processo vinculado a esta sessão ainda.</p>
          </div>
        )}
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
                isActive ? "border-primary shadow-lg" : isCompleted ? "border-green-200 bg-green-50/50" : isDevelopment ? "opacity-60 cursor-not-allowed" : "hover:shadow-md"
              }`}
              onClick={() => !isDevelopment && handleStepClick(step)}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center ${isCompleted ? "bg-green-500 text-white" : isActive ? step.color + " text-white" : "bg-muted text-muted-foreground"}`}>
                  {isCompleted ? <CheckCircle2 className="h-7 w-7" /> : <IconComponent className="h-7 w-7" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">{step.id}. {step.title}</h3>
                    {isDevelopment && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">Em Desenvolvimento</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">{step.description}</p>
                  {!isDevelopment && (
                    <Button variant={isActive ? "default" : "outline"} size="sm" onClick={(e) => { e.stopPropagation(); handleStepClick(step); }}>
                      {isActive ? "Continuar" : isCompleted ? "Revisar" : "Iniciar"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
                {index < ROADMAP_STEPS.length - 1 && <div className="absolute left-10 -bottom-4 w-0.5 h-4 bg-border"></div>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SessionRoadmap;
