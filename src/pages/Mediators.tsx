import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid3x3 } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { PatientCard } from "@/components/PatientCard";

const Mediators = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { patients, loading } = usePatients();

  const filteredPatients = patients.filter(p => 
    p.status === 'active' &&
    (p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Análise de Mediadores</h1>
        <p className="text-muted-foreground">
          Selecione um paciente para organizar os processos em mediadores
        </p>
      </div>

      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex gap-3">
          <Grid3x3 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1 text-blue-900">Organização por Mediadores</h3>
            <p className="text-sm text-blue-800">
              Organize os processos identificados na rede em mediadores específicos de cada dimensão EEMM
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando pacientes...</p>
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onViewRoadmap={(p) => navigate(`/patients/${p.id}/mediators`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum paciente ativo encontrado</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Mediators;
