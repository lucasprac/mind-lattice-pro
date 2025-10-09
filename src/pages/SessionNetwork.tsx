import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Network as NetworkIcon, RefreshCw, ArrowRight } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useRecords } from "@/hooks/useRecords";
import { useSessionNetwork } from "@/hooks/useSessionNetwork";
import { SimpleNetworkCanvas } from "@/components/SimpleNetworkCanvas";
import { toast } from "sonner";

const SessionNetwork = () => {
  const { patientId, recordId } = useParams<{ patientId: string; recordId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { records } = useRecords(patientId);
  
  const { networkData, allNetworkData, filteredBySession, loading, saveNetwork, toggleSessionFilter } = useSessionNetwork(
    patientId || "",
    recordId
  );
  
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

  const handleToggleFilter = () => {
    toggleSessionFilter();
    toast.info(
      !filteredBySession 
        ? "Visualizando apenas processos desta sessão" 
        : "Visualizando todos os processos da rede geral"
    );
  };

  // Função para navegar para a próxima etapa
  const navigateToNextStep = () => {
    navigate(`/patients/${patientId}/session/${recordId}/mediators`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate(`/patients/${patientId}/session/${recordId}/roadmap`)}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Roadmap
          </Button>
          <h1 className="text-3xl font-bold mb-2">Análise da Rede - {patient.full_name}</h1>
          <p className="text-muted-foreground">
            Construa a rede de processos identificando características relevantes e suas conexões
          </p>
        </div>
        
        {/* Botão para avançar etapa */}
        <Button onClick={navigateToNextStep} className="mt-8">
          Próxima Etapa
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Journey Progress Card */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                Etapa 2 de 5
              </Badge>
              <span className="text-sm font-medium">Jornada de Análise</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Processos Total:</span>
              <Badge variant="outline" className="bg-white">{allNetworkData.nodes.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Visualizando:</span>
              <Badge variant="outline" className="bg-white">{networkData.nodes.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Conexões:</span>
              <Badge variant="outline" className="bg-white">{networkData.connections.length}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Network Filter Toggle */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NetworkIcon className="h-5 w-5 text-purple-600" />
            <div>
              <h3 className="font-semibold text-sm">
                {filteredBySession ? "Visualização: Apenas desta Sessão" : "Visualização: Rede Geral Completa"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {filteredBySession 
                  ? "Mostrando apenas processos criados nesta sessão" 
                  : "Mostrando todos os processos de todas as sessões"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFilter}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {filteredBySession ? "Ver Rede Completa" : "Ver Apenas Esta Sessão"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-muted-foreground">Carregando rede...</p>
          </div>
        ) : (
          <SimpleNetworkCanvas
            networkData={networkData}
            onSave={saveNetwork}
            readOnly={false}
          />
        )}
      </Card>
    </div>
  );
};

export default SessionNetwork;
