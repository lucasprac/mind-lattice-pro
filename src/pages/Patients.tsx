import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PatientCard } from "@/components/PatientCard";
import { PatientDialog } from "@/components/PatientDialog";
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
import { usePatients } from "@/hooks/usePatients";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Users } from "lucide-react";

interface Patient {
  id: string;
  full_name: string;
  birth_date?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: "active" | "inactive" | "discharged";
  created_at: string;
  updated_at?: string;
}

const Patients = () => {
  const navigate = useNavigate();
  const { patients, addPatient, updatePatient, deletePatient, loading } = usePatients();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  );

  const handleAddPatient = () => {
    setEditingPatient(null);
    setDialogOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setDialogOpen(true);
  };

  const handleDeletePatient = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePatient = async () => {
    if (!patientToDelete) return;

    try {
      const success = await deletePatient(patientToDelete.id);
      if (success) {
        toast({
          title: "Paciente excluído",
          description: `${patientToDelete.full_name} foi removido com sucesso.`,
        });
      } else {
        throw new Error("Falha ao excluir paciente");
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir paciente",
        description: "Não foi possível excluir o paciente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  };

  const handleSavePatient = async (patientData: Omit<Patient, "id" | "created_at" | "updated_at">) => {
    try {
      let success;

      if (editingPatient) {
        // Atualizar paciente existente
        success = await updatePatient(editingPatient.id, patientData);
        if (success) {
          toast({
            title: "Paciente atualizado",
            description: "Os dados do paciente foram atualizados com sucesso.",
          });
        }
      } else {
        // Adicionar novo paciente
        success = await addPatient(patientData);
        if (success) {
          toast({
            title: "Paciente adicionado",
            description: "Novo paciente foi adicionado com sucesso.",
          });
        }
      }

      if (!success) {
        throw new Error("Falha ao salvar paciente");
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar paciente",
        description: "Não foi possível salvar os dados do paciente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleViewRoadmap = (patient: Patient) => {
    navigate(`/patients/${patient.id}`);
  };

  const handleViewRecords = (patient: Patient) => {
    navigate(`/patients/${patient.id}/records`);
  };

  const handleViewNetwork = (patient: Patient) => {
    navigate(`/patients/${patient.id}/network`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus pacientes e acompanhe o progresso terapêutico
          </p>
        </div>
        <Button onClick={handleAddPatient}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Card className="px-4 py-2 flex items-center gap-2 bg-muted/50">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{patients.length} pacientes</span>
        </Card>
      </div>

      {/* Patients Grid */}
      {filteredPatients.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? "Tente ajustar os termos de busca ou limpar o filtro." 
              : "Comece adicionando seu primeiro paciente para iniciar o acompanhamento terapêutico."
            }
          </p>
          {!searchTerm && (
            <Button onClick={handleAddPatient}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Paciente
            </Button>
          )}
          {searchTerm && (
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Limpar Busca
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onEdit={handleEditPatient}
              onDelete={handleDeletePatient}
              onViewRecords={handleViewRecords}
              onViewNetwork={handleViewNetwork}
              onViewRoadmap={handleViewRoadmap}
            />
          ))}
        </div>
      )}

      {/* Patient Dialog */}
      <PatientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        patient={editingPatient}
        onSave={handleSavePatient}
        mode={editingPatient ? "edit" : "create"}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o paciente <strong>{patientToDelete?.full_name}</strong>?
              <br /><br />
              <span className="text-destructive font-medium">
                ⚠️ Esta ação não pode ser desfeita. Todos os dados do paciente, incluindo avaliações, 
                redes de processos e histórico terapêutico serão permanentemente removidos.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePatient}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Paciente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Patients;
