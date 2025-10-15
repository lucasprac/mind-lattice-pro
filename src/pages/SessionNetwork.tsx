import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Network as NetworkIcon, History } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useRecords } from "@/hooks/useRecords";
import { usePatientNetwork } from "@/hooks/usePatientNetwork";
import { OptimizedNetworkCanvas } from "@/components/OptimizedNetworkCanvas";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

const SessionNetwork = () => {
  const { patientId, recordId } = useParams<{ patientId: string; recordId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { records } = useRecords(patientId);
  
  // Always use general network (record_id = null) but pass current session for process tracking
  const { networkData, loading, saveNetwork, getProcessesFromSession } = usePatientNetwork(
    patientId || "",
    recordId, // Pass recordId for process session tracking
    true // Always use general network
  );
  
  const patient = patients.find(p => p.id === patientId);
  const record = records.find(r => r.id === recordId);

  const [historyOpen, setHistoryOpen] = useState(false);

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

  // Build a simple in-memory history view grouped by session using session tracking fields
  const buildHistory = () => {
    const sessionMap: Record<string, { added: string[]; connections: number; }> = {};
    networkData.nodes.forEach(n => {
      const sid = n.created_in_session || 'desconhecida';
      if (!sessionMap[sid]) sessionMap[sid] = { added: [], connections: 0 };
      sessionMap[sid].added.push(n.text);
    });
    networkData.connections.forEach(c => {
      const sid = c.created_in_session || 'desconhecida';
      if (!sessionMap[sid]) sessionMap[sid] = { added: [], connections: 0 };
      sessionMap[sid].connections += 1;
    });
    return sessionMap;
  };

  const historyData = buildHistory();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setHistoryOpen(true)}>
            <History className="h-4 w-4 mr-2" />
            Histórico
          </Button>
        </div>
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
            currentSessionId={recordId} // session tracking
          />
        )}
      </Card>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Histórico da Rede</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-auto">
            {Object.keys(historyData).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem histórico disponível.</p>
            ) : (
              Object.entries(historyData).map(([sid, info]) => (
                <Card key={sid} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Sessão</Badge>
                      <span className="text-sm font-medium">{sid}</span>
                    </div>
                    <Badge variant="secondary">{info.added.length} processos, {info.connections} conexões</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {info.added.map((t, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionNetwork;
