import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, X, Save, Network, Info } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useRecords } from "@/hooks/useRecords";
import { usePatientNetwork } from "@/hooks/usePatientNetwork";
import { usePatientMediators } from "@/hooks/usePatientMediators";

const EEMM_DIMENSIONS = {
  cognition: {
    name: "Cognição",
    color: "bg-blue-50 border-blue-200",
    textColor: "text-blue-900",
    mediators: ["Atenção", "Memória", "Resolução de Problemas", "Metacognição", "Aprendizado"]
  },
  emotion: {
    name: "Emoção",
    color: "bg-red-50 border-red-200",
    textColor: "text-red-900",
    mediators: ["Regulação Emocional", "Discriminação", "Expressão", "Empatia", "Awareness"]
  },
  attention: {
    name: "Atenção & Consciencia",
    color: "bg-yellow-50 border-yellow-200",
    textColor: "text-yellow-900",
    mediators: ["Atenção Focada", "Atenção Sustentada", "Flexibilidade", "Orientação", "Vigilância"]
  },
  self: {
    name: "Self",
    color: "bg-purple-50 border-purple-200",
    textColor: "text-purple-900",
    mediators: ["Autocompaixão", "Autoconsciência", "Identidade", "Autoeficácia", "Coerência"]
  },
  motivation: {
    name: "Motivação",
    color: "bg-green-50 border-green-200",
    textColor: "text-green-900",
    mediators: ["Valores", "Propósito", "Objetivos", "Aspirações", "Engajamento"]
  },
  behavior: {
    name: "Comportamento",
    color: "bg-orange-50 border-orange-200",
    textColor: "text-orange-900",
    mediators: ["Hábitos", "Habilidades Sociais", "Comunicação", "Ação Comprometida", "Repertório"]
  }
};

const SessionMediators = () => {
  const { patientId, recordId } = useParams<{ patientId: string; recordId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { records } = useRecords(patientId);
  
  // Get network data and filter processes from this session
  const { getProcessesFromSession } = usePatientNetwork(patientId || "", recordId, true);
  const { mediatorProcesses, loading, saveMediators } = usePatientMediators(
    patientId || "",
    recordId
  );
  
  const [localMediators, setLocalMediators] = useState(mediatorProcesses);
  const [selectedMediator, setSelectedMediator] = useState<{ dimension: string; mediator: string } | null>(null);
  
  const patient = patients.find(p => p.id === patientId);
  const record = records.find(r => r.id === recordId);
  
  // Get ONLY processes created in this session
  const sessionProcesses = getProcessesFromSession(recordId || "");
  console.log("Processos desta sessão:", sessionProcesses);

  // Update local state when mediator processes load
  useEffect(() => {
    setLocalMediators(mediatorProcesses);
  }, [mediatorProcesses]);

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

  const addProcessToMediator = (dimension: string, mediator: string, process: string) => {
    setLocalMediators(prev => {
      const updated = { ...prev };
      if (!updated[dimension]) updated[dimension] = {};
      if (!updated[dimension][mediator]) updated[dimension][mediator] = [];
      if (!updated[dimension][mediator].includes(process)) {
        updated[dimension][mediator] = [...updated[dimension][mediator], process];
      }
      return updated;
    });
    setSelectedMediator(null);
  };

  const removeProcess = (dimension: string, mediator: string, process: string) => {
    setLocalMediators(prev => {
      const updated = { ...prev };
      if (updated[dimension]?.[mediator]) {
        updated[dimension][mediator] = updated[dimension][mediator].filter(p => p !== process);
      }
      return updated;
    });
  };

  const handleSave = async () => {
    await saveMediators(localMediators);
  };

  const totalProcessesInMediators = Object.values(localMediators).reduce(
    (sum, mediators) => sum + Object.values(mediators).reduce((s, processes) => s + processes.length, 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate(`/patients/${patientId}/session/${recordId}/roadmap`)}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Roadmap
        </Button>
        <h1 className="text-3xl font-bold mb-2">Análise de Mediadores - {patient.full_name}</h1>
        <p className="text-muted-foreground">
          Organize os processos da rede em mediadores específicos por dimensão EEMM
        </p>
      </div>

      {/* Journey Progress Card */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                Etapa 3 de 5
              </Badge>
              <span className="text-sm font-medium">Jornada de Análise</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Processos desta Sessão:</span>
              <Badge variant="outline" className="bg-white">{sessionProcesses.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Organizados em Mediadores:</span>
              <Badge variant="outline" className="bg-white">{totalProcessesInMediators}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Session Processes Info */}
      {sessionProcesses.length > 0 ? (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Network className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Processos Criados na Etapa 2 (desta sessão)</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {sessionProcesses.map((process, i) => (
              <Badge
                key={i}
                variant="outline"
                className={`cursor-pointer transition-colors ${
                  selectedMediator 
                    ? "hover:bg-primary hover:text-primary-foreground" 
                    : "cursor-default"
                }`}
                onClick={() => {
                  if (selectedMediator) {
                    addProcessToMediator(selectedMediator.dimension, selectedMediator.mediator, process.text);
                  }
                }}
              >
                {process.text}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedMediator 
              ? `Clique em um processo para adicionar ao mediador "${selectedMediator.mediator}" na dimensão ${EEMM_DIMENSIONS[selectedMediator.dimension as keyof typeof EEMM_DIMENSIONS].name}` 
              : "Selecione um mediador abaixo para começar a organizar os processos"}
          </p>
        </Card>
      ) : (
        <Card className="p-6 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-800">Nenhum Processo Encontrado</h3>
              <p className="text-sm text-amber-700">
                Não foram encontrados processos criados na Etapa 2 (Análise de Rede) desta sessão.
                Volte à etapa anterior para criar processos na rede.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/patients/${patientId}/session/${recordId}/network`)}
              className="gap-2"
            >
              <Network className="h-4 w-4" />
              Ir para Análise de Rede
            </Button>
          </div>
        </Card>
      )}

      {/* EEMM Dimensions */}
      <div className="space-y-6">
        {Object.entries(EEMM_DIMENSIONS).map(([dimensionKey, dimension]) => (
          <Card key={dimensionKey} className={`p-6 ${dimension.color}`}>
            <h2 className={`text-2xl font-bold mb-4 ${dimension.textColor}`}>{dimension.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dimension.mediators.map((mediator) => {
                const processes = localMediators[dimensionKey]?.[mediator] || [];
                const isSelected = selectedMediator?.dimension === dimensionKey && selectedMediator?.mediator === mediator;
                
                return (
                  <Card
                    key={mediator}
                    className={`p-4 bg-white cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-primary shadow-lg" : ""
                    }`}
                    onClick={() => setSelectedMediator(
                      isSelected ? null : { dimension: dimensionKey, mediator }
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm">{mediator}</h3>
                      <Badge variant="secondary">{processes.length}</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {processes.map((process, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                          <span className="flex-1 truncate">{process}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeProcess(dimensionKey, mediator, process);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      
                      {processes.length === 0 && (
                        <p className="text-xs text-muted-foreground italic p-2">
                          Nenhum processo atribuído
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Salvar Organização de Mediadores</h3>
            <p className="text-sm text-muted-foreground">
              Os mediadores definidos aqui serão utilizados na Etapa 4 (Análise Funcional)
            </p>
          </div>
          <Button size="lg" onClick={handleSave} disabled={loading} className="gap-2">
            <Save className="h-5 w-5" />
            Salvar e Continuar
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SessionMediators;