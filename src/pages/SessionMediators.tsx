import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, X, Save } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useRecords } from "@/hooks/useRecords";
import { usePatientNetwork } from "@/hooks/usePatientNetwork";
import { usePatientMediators } from "@/hooks/usePatientMediators";

const EEMM_STRUCTURE = {
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
    name: "Atenção",
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
  
  // Get network data from this session only
  const { networkData } = usePatientNetwork(patientId || "", recordId, false);
  const { mediatorProcesses, loading, saveMediators } = usePatientMediators(
    patientId || "",
    recordId
  );
  
  const [localMediators, setLocalMediators] = useState(mediatorProcesses);
  const [newProcess, setNewProcess] = useState("");
  const [selectedMediator, setSelectedMediator] = useState<{ dimension: string; mediator: string } | null>(null);
  
  const patient = patients.find(p => p.id === patientId);
  const record = records.find(r => r.id === recordId);
  
  // Get available processes from this session's network
  const availableProcesses = networkData.nodes.map(node => node.text);

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
    setNewProcess("");
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
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
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
              <span className="text-muted-foreground">Processos da Rede:</span>
              <Badge variant="outline" className="bg-white">{availableProcesses.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Organizados em Mediadores:</span>
              <Badge variant="outline" className="bg-white">{totalProcessesInMediators}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Available Processes */}
      {availableProcesses.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Processos Disponíveis da Rede</h3>
          <div className="flex flex-wrap gap-2">
            {availableProcesses.map((process, i) => (
              <Badge
                key={i}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => {
                  if (selectedMediator) {
                    addProcessToMediator(selectedMediator.dimension, selectedMediator.mediator, process);
                  }
                }}
              >
                {process}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {selectedMediator 
              ? `Clique em um processo para adicionar ao mediador "${selectedMediator.mediator}"` 
              : "Selecione um mediador abaixo para adicionar processos"}
          </p>
        </Card>
      )}

      {/* EEMM Dimensions */}
      <div className="space-y-6">
        {Object.entries(EEMM_STRUCTURE).map(([dimensionKey, dimension]) => (
          <Card key={dimensionKey} className={`p-6 ${dimension.color}`}>
            <h2 className={`text-2xl font-bold mb-4 ${dimension.textColor}`}>{dimension.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dimension.mediators.map((mediator) => {
                const processes = localMediators[dimensionKey]?.[mediator] || [];
                const isSelected = selectedMediator?.dimension === dimensionKey && selectedMediator?.mediator === mediator;
                
                return (
                  <Card
                    key={mediator}
                    className={`p-4 bg-white cursor-pointer transition-all ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedMediator({ dimension: dimensionKey, mediator })}
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
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeProcess(dimensionKey, mediator, process);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      
                      {isSelected && (
                        <div className="flex gap-2 mt-3">
                          <Input
                            placeholder="Novo processo..."
                            value={newProcess}
                            onChange={(e) => setNewProcess(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && newProcess.trim()) {
                                addProcessToMediator(dimensionKey, mediator, newProcess.trim());
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              if (newProcess.trim()) {
                                addProcessToMediator(dimensionKey, mediator, newProcess.trim());
                              }
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
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
        <Button size="lg" className="w-full" onClick={handleSave} disabled={loading}>
          <Save className="h-5 w-5 mr-2" />
          Salvar Mediadores
        </Button>
      </Card>
    </div>
  );
};

export default SessionMediators;
