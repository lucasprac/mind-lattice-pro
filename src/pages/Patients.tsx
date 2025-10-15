import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Network, MoreHorizontal } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useRecords } from "@/hooks/useRecords";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Patients = () => {
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { records } = useRecords();

  const goToRoadmap = (patientId: string) => navigate(`/patients/${patientId}`);
  const goToNetwork = (patientId: string) => navigate(`/patients/${patientId}/session/new/network`);

  return (
    <div className="space-y-6">
      {/* ... existing header and stats ... */}

      {/* Example patient card layout with Roadmap and Rede buttons inline */}
      {patients.map((p) => (
        <Card key={p.id} className="p-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{p.full_name}</div>
            <div className="text-xs text-muted-foreground">Criado em {/* date here */}</div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => goToRoadmap(p.id)}>
              <FileText className="h-4 w-4 mr-2" />
              Roadmap
            </Button>
            <Button variant="outline" onClick={() => goToNetwork(p.id)}>
              <Network className="h-4 w-4 mr-2" />
              Rede
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Patients;
