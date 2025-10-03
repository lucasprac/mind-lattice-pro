import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { EnhancedNetworkCanvas } from "@/components/EnhancedNetworkCanvas";

const PatientNetwork = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();

  const patient = patients.find(p => p.id === patientId);

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
        <h1 className="text-3xl font-bold mb-2">Análise da Rede - {patient.full_name}</h1>
        <p className="text-muted-foreground">
          Construa a rede de processos identificando características relevantes e suas conexões
        </p>
      </div>

      <Card className="p-6">
        <EnhancedNetworkCanvas
          networkData={{ nodes: [], connections: [] }}
          readOnly={false}
          onSave={(data) => {
            console.log("Network saved:", data);
            // TODO: Save to database
          }}
        />
      </Card>
    </div>
  );
};

export default PatientNetwork;
