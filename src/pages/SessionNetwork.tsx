import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Network as NetworkIcon } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useRecords } from "@/hooks/useRecords";
import { usePatientNetwork } from "@/hooks/usePatientNetwork";
import { OptimizedNetworkCanvas } from "@/components/OptimizedNetworkCanvas";

const SessionNetwork = () => {
  const { patientId, recordId } = useParams<{ patientId: string; recordId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { records } = useRecords(patientId);
  
  // Always use general network (record_id = null) but pass current session for process tracking
  const { networkData, loading, saveNetwork } = usePatientNetwork(
    patientId || "",
    recordId, // Pass recordId for process session tracking
    true // Always use general network
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
        <h1 className="text-3xl font-bold mb-2">Análise da Rede - {patient.full_name}</h1>
        <p className="text-muted-foreground">
          Construa a rede de processos identificando características relevantes e suas conexões
        </p>
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
              <span className="text-muted-foreground">Processos Criados:</span>
              <Badge variant="outline" className="bg-white">{networkData.nodes.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Conexões:</span>
              <Badge variant="outline" className="bg-white">{networkData.connections.length}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Network Info Card - Simplified */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center gap-3">
          <NetworkIcon className="h-5 w-5 text-purple-600" />
          <div>
            <h3 className="font-semibold text-sm">
              Rede do Paciente
            </h3>
            <p className="text-xs text-muted-foreground">
              Esta é a rede unificada do paciente. Processos criados aqui estarão disponíveis para análise em todas as sessões.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-muted-foreground">Carregando rede...</p>
          </div>
        ) : (
          <OptimizedNetworkCanvas
            networkData={networkData}
            readOnly={false}
            onSave={saveNetwork}
            currentSessionId={recordId} // Pass current session for process tracking
          />
        )}
      </Card>
    </div>
  );
};

export default SessionNetwork;