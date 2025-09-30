import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, Search, Filter } from "lucide-react";
import { PatientDialog } from "@/components/PatientDialog";
import { PatientCard } from "@/components/PatientCard";
import { usePatients, Patient } from "@/hooks/usePatients";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Patient["status"]>("all");
  const navigate = useNavigate();
  
  const { 
    patients, 
    loading, 
    error, 
    refetch, 
    deletePatient, 
    searchPatients, 
    getPatientsByStatus,
    getPatientStats 
  } = usePatients();

  const stats = getPatientStats();

  // Filter and search patients
  const getFilteredAndSearchedPatients = () => {
    let filtered = patients;
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = getPatientsByStatus(statusFilter);
    }
    
    // Apply search
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.full_name.toLowerCase().includes(searchTermLower) ||
        patient.email?.toLowerCase().includes(searchTermLower) ||
        patient.phone?.includes(searchTerm) ||
        patient.notes?.toLowerCase().includes(searchTermLower)
      );
    }
    
    return filtered;
  };

  const filteredPatients = getFilteredAndSearchedPatients();

  const handleEditPatient = (patient: Patient) => {
    // TODO: Implement edit patient functionality
    toast.info("Funcionalidade de edição será implementada em breve");
  };

  const handleViewRecords = (patient: Patient) => {
    // Navigate to records page with patient filter
    navigate("/records", { state: { patientId: patient.id } });
  };

  const handleViewNetwork = (patient: Patient) => {
    // Navigate to networks page with patient filter
    navigate("/networks", { state: { patientId: patient.id } });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestão de Pacientes</h1>
            <p className="text-muted-foreground">
              Gerencie os pacientes e seus prontuários
            </p>
          </div>
        </div>
        
        <Card className="p-6">
          <div className="text-center py-16">
            <p className="text-red-600">Erro ao carregar pacientes: {error}</p>
            <Button onClick={refetch} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie os pacientes e seus prontuários
          </p>
        </div>
        <PatientDialog onPatientAdded={refetch} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total de Pacientes</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-muted-foreground">Ativos</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.inactive}</div>
          <div className="text-sm text-muted-foreground">Inativos</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.discharged}</div>
          <div className="text-sm text-muted-foreground">Alta</div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, telefone ou observações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
                <SelectItem value="discharged">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onEdit={handleEditPatient}
                onViewRecords={handleViewRecords}
                onViewNetwork={handleViewNetwork}
              />
            ))}
          </div>
        ) : searchTerm || statusFilter !== "all" ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Não encontramos pacientes que correspondam aos seus critérios de busca.
              Tente ajustar os filtros ou o termo de busca.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum paciente cadastrado</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Comece adicionando seu primeiro paciente para iniciar o gerenciamento 
              de prontuários e redes de processos.
            </p>
            <PatientDialog 
              onPatientAdded={refetch}
              trigger={
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Adicionar Primeiro Paciente
                </Button>
              }
            />
          </div>
        ) : null}
      </Card>
    </div>
  );
};

export default Patients;