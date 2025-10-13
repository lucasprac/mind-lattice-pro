import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, Network as NetworkIcon, ArrowRight, AlertTriangle } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useRecords } from "@/hooks/useRecords";
import { useSessionNetwork } from "@/hooks/useSessionNetwork";
import { InteractiveNetworkCanvas } from "@/components/InteractiveNetworkCanvas";
import { toast } from "sonner";

const SessionNetwork = () => {
  const { patientId, recordId } = useParams<{ patientId: string; recordId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { records } = useRecords(patientId);
  
  const { 
    networkData, 
    loading, 
    saveNetwork
  } = useSessionNetwork(patientId || "");
  
  // State for unsaved changes warning
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  const patient = patients.find(p => p.id === patientId);
  const record = records.find(r => r.id === recordId);

  // Handle navigation with unsaved changes warning
  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowUnsavedDialog(true);
    } else {
      navigate(path);
    }
  };

  // Confirm navigation without saving
  const confirmNavigation = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  // Cancel navigation
  const cancelNavigation = () => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  // Save and then navigate
  const saveAndNavigate = async () => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

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

  const navigateToNextStep = () => {
    handleNavigation(`/patients/${patientId}/session/${recordId}/mediators`);
  };

  const navigateToRoadmap = () => {
    handleNavigation(`/patients/${patientId}/session/${recordId}/roadmap`);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Button
              variant="ghost"
              onClick={navigateToRoadmap}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Roadmap
            </Button>
            <h1 className="text-3xl font-bold mb-2">Análise da Rede - {patient.full_name}</h1>
            <p className="text-muted-foreground">
              Construa e edite a rede geral de processos do paciente
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
                <span className="text-muted-foreground">Sessão Atual:</span>
                <Badge variant="outline" className="bg-white">{record.name}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Processos:</span>
                <Badge variant="outline" className="bg-white">{networkData.nodes.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Conexões:</span>
                <Badge variant="outline" className="bg-white">{networkData.connections.length}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Network Info Card */}
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center gap-3">
            <NetworkIcon className="h-5 w-5 text-purple-600" />
            <div>
              <h3 className="font-semibold text-sm text-purple-900">
                Rede Geral do Paciente
              </h3>
              <p className="text-xs text-purple-800">
                Esta é a rede principal de {patient.full_name}. Todas as alterações são salvas diretamente na rede geral.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                📌 Os processos criados nesta sessão ficarão disponíveis em todas as etapas futuras.
              </p>
            </div>
          </div>
        </Card>

        {/* Interactive Canvas */}
        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Carregando rede...</p>
          </Card>
        ) : (
          <InteractiveNetworkCanvas
            networkData={networkData}
            onSave={saveNetwork}
            readOnly={false}
            currentSessionId={recordId || ''}
            currentSessionName={record?.name || 'Sessão Atual'}
            onUnsavedChanges={setHasUnsavedChanges}
          />
        )}
      </div>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Alterações Não Salvas
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                Você tem alterações não salvas na rede. O que deseja fazer?
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  ⚠️ Se sair sem salvar, as alterações serão perdidas.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel onClick={cancelNavigation}>
              Continuar Editando
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={confirmNavigation}
            >
              Sair Sem Salvar
            </Button>
            <AlertDialogAction onClick={saveAndNavigate}>
              Salvar e Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SessionNetwork;
