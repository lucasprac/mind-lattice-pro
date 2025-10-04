import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, X, Save } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { usePatientMediators } from "@/hooks/usePatientMediators";
import { usePatientNetwork } from "@/hooks/usePatientNetwork";

// EEMM Dimensions and their mediators
const EEMM_STRUCTURE = {
  cognition: {
    name: "Cognição",
    color: "bg-blue-100 border-blue-300 text-blue-800",
    mediators: ["Crenças", "Esquemas", "Atenção Seletiva", "Viés Cognitivo"]
  },
  emotion: {
    name: "Afeto",
    color: "bg-red-100 border-red-300 text-red-800",
    mediators: ["Regulação Emocional", "Expressão Emocional", "Consciência Emocional"]
  },
  attention: {
    name: "Atenção",
    color: "bg-yellow-100 border-yellow-300 text-yellow-800",
    mediators: ["Foco Atencional", "Flexibilidade Atencional", "Consciência Plena"]
  },
  self: {
    name: "Self",
    color: "bg-green-100 border-green-300 text-green-800",
    mediators: ["Autoconceito", "Identidade", "Autoconsciência"]
  },
  motivation: {
    name: "Motivação",
    color: "bg-purple-100 border-purple-300 text-purple-800",
    mediators: ["Valores", "Objetivos", "Comprometimento"]
  },
  behavior: {
    name: "Comportamento",
    color: "bg-orange-100 border-orange-300 text-orange-800",
    mediators: ["Padrões de Ação", "Persistência", "Evitação"]
  }
};

const PatientMediators = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { networkData, loading: networkLoading } = usePatientNetwork(patientId || "");
  const { mediatorProcesses, loading: mediatorsLoading, saveMediators } = usePatientMediators(patientId || "");
  
  // State for new process input
  const [newProcess, setNewProcess] = useState("");
  const [selectedMediator, setSelectedMediator] = useState<{
    dimension: string;
    mediator: string;
  } | null>(null);

  const patient = patients.find(p => p.id === patientId);

  // Get all processes from the network
  const availableProcesses = networkData.nodes.map(node => node.text);

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

  const addProcessToMediator = (process: string) => {
    if (!selectedMediator || !process.trim()) return;

    const dimension = selectedMediator.dimension;
    const mediator = selectedMediator.mediator;
    
    const updated = {
      ...mediatorProcesses,
      [dimension]: {
        ...(mediatorProcesses[dimension] || {}),
        [mediator]: [...(mediatorProcesses[dimension]?.[mediator] || []), process.trim()]
      }
    };

    saveMediators(updated);
    setNewProcess("");
    setSelectedMediator(null);
  };

  const removeProcess = (dimension: string, mediator: string, processIndex: number) => {
    const processes = mediatorProcesses[dimension]?.[mediator] || [];
    const updated = {
      ...mediatorProcesses,
      [dimension]: {
        ...mediatorProcesses[dimension],
        [mediator]: processes.filter((_, i) => i !== processIndex)
      }
    };
    saveMediators(updated);
  };

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
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate(`/patients/${patientId}`)}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Roadmap
        </Button>
        <h1 className="text-3xl font-bold mb-2">Análise de Mediadores - {patient.full_name}</h1>
        <p className="text-muted-foreground">
          Organize os processos identificados dentro dos mediadores de cada dimensão do EEMM
        </p>
      </div>

      {/* Instructions */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <h3 className="font-semibold mb-2">Como usar:</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Selecione os processos identificados na Análise da Rede e organize-os dentro dos mediadores apropriados de cada dimensão do EEMM.
        </p>
        {networkLoading ? (
          <p className="text-sm text-muted-foreground">Carregando processos da rede...</p>
        ) : availableProcesses.length === 0 ? (
          <p className="text-sm text-amber-600">
            ⚠️ Nenhum processo encontrado na Análise da Rede. Complete a etapa anterior primeiro.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-sm font-medium">Processos disponíveis:</span>
            {availableProcesses.map((process, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedMediator) {
                    addProcessToMediator(process);
                  }
                }}
                disabled={!selectedMediator}
                className="text-xs"
              >
                {process}
              </Button>
            ))}
          </div>
        )}
      </Card>

      {/* EEMM Dimensions with Mediators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(EEMM_STRUCTURE).map(([dimensionKey, dimension]) => (
          <Card key={dimensionKey} className="p-6">
            <div className={`inline-block px-4 py-2 rounded-lg mb-4 ${dimension.color}`}>
              <h3 className="font-bold text-lg">{dimension.name}</h3>
            </div>

            <div className="space-y-4">
              {dimension.mediators.map(mediator => {
                const processes = mediatorProcesses[dimensionKey]?.[mediator] || [];
                const isSelected = selectedMediator?.dimension === dimensionKey && 
                                 selectedMediator?.mediator === mediator;

                return (
                  <div
                    key={mediator}
                    className={`border rounded-lg p-4 transition-all ${
                      isSelected ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{mediator}</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedMediator({ dimension: dimensionKey, mediator })}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Processes list */}
                    <div className="space-y-2">
                      {processes.map((process, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-white border rounded px-3 py-2"
                        >
                          <span className="text-sm">{process}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => removeProcess(dimensionKey, mediator, idx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Add process input */}
                    {isSelected && (
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={newProcess}
                            onChange={(e) => setNewProcess(e.target.value)}
                            placeholder="Digite um processo personalizado..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newProcess.trim()) {
                                addProcessToMediator(newProcess);
                              }
                              if (e.key === "Escape") setSelectedMediator(null);
                            }}
                            autoFocus
                          />
                          <Button 
                            onClick={() => addProcessToMediator(newProcess)} 
                            size="sm"
                            disabled={!newProcess.trim()}
                          >
                            Adicionar
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Ou clique em um processo disponível acima
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PatientMediators;
