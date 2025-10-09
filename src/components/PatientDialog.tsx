import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Patient {
  id?: string;
  full_name: string;
  birth_date?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: "active" | "inactive" | "discharged";
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  medical_history?: string;
  current_medications?: string;
  therapy_goals?: string;
  session_frequency?: string;
  created_at?: string;
  updated_at?: string;
}

interface PatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
  onSave: (patient: Omit<Patient, "id" | "created_at" | "updated_at">) => void;
  mode: "create" | "edit";
}

export const PatientDialog = ({
  open,
  onOpenChange,
  patient,
  onSave,
  mode
}: PatientDialogProps) => {
  const [formData, setFormData] = useState<Omit<Patient, "id" | "created_at" | "updated_at">>({
    full_name: "",
    birth_date: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    medical_history: "",
    current_medications: "",
    therapy_goals: "",
    session_frequency: ""
  });

  const [birthDate, setBirthDate] = useState<Date>();

  useEffect(() => {
    if (patient && mode === "edit") {
      setFormData({
        full_name: patient.full_name || "",
        birth_date: patient.birth_date || "",
        email: patient.email || "",
        phone: patient.phone || "",
        address: patient.address || "",
        status: patient.status || "active",
        emergency_contact_name: patient.emergency_contact_name || "",
        emergency_contact_phone: patient.emergency_contact_phone || "",
        emergency_contact_relationship: patient.emergency_contact_relationship || "",
        medical_history: patient.medical_history || "",
        current_medications: patient.current_medications || "",
        therapy_goals: patient.therapy_goals || "",
        session_frequency: patient.session_frequency || ""
      });

      if (patient.birth_date) {
        setBirthDate(new Date(patient.birth_date));
      }
    } else {
      // Reset form for create mode
      setFormData({
        full_name: "",
        birth_date: "",
        email: "",
        phone: "",
        address: "",
        status: "active",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relationship: "",
        medical_history: "",
        current_medications: "",
        therapy_goals: "",
        session_frequency: ""
      });
      setBirthDate(undefined);
    }
  }, [patient, mode, open]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBirthDateChange = (date: Date | undefined) => {
    setBirthDate(date);
    setFormData(prev => ({
      ...prev,
      birth_date: date ? date.toISOString().split('T')[0] : ""
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      alert("O nome completo é obrigatório.");
      return;
    }

    onSave(formData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Adicionar Novo Paciente" : "Editar Paciente"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Preencha os dados do novo paciente. Campos marcados com * são obrigatórios."
              : "Atualize os dados do paciente. Campos marcados com * são obrigatórios."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Pessoais</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="Nome completo do paciente"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !birthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthDate ? (
                        format(birthDate, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        "Selecione a data"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      onSelect={handleBirthDateChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Endereço completo"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: "active" | "inactive" | "discharged") => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="discharged">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contato de Emergência */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contato de Emergência</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Nome</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
                  placeholder="Nome do contato de emergência"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Telefone</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_relationship">Parentesco/Relação</Label>
              <Input
                id="emergency_contact_relationship"
                value={formData.emergency_contact_relationship}
                onChange={(e) => handleInputChange("emergency_contact_relationship", e.target.value)}
                placeholder="Ex: Mãe, Cônjuge, Irmão"
              />
            </div>
          </div>

          {/* Informações Clínicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Clínicas</h3>

            <div className="space-y-2">
              <Label htmlFor="medical_history">Histórico Médico</Label>
              <Textarea
                id="medical_history"
                value={formData.medical_history}
                onChange={(e) => handleInputChange("medical_history", e.target.value)}
                placeholder="Histórico médico relevante, condições pré-existentes, etc."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_medications">Medicações Atuais</Label>
              <Textarea
                id="current_medications"
                value={formData.current_medications}
                onChange={(e) => handleInputChange("current_medications", e.target.value)}
                placeholder="Lista de medicações em uso"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="therapy_goals">Objetivos Terapêuticos</Label>
              <Textarea
                id="therapy_goals"
                value={formData.therapy_goals}
                onChange={(e) => handleInputChange("therapy_goals", e.target.value)}
                placeholder="Objetivos e metas para o tratamento"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="session_frequency">Frequência das Sessões</Label>
              <Select value={formData.session_frequency} onValueChange={(value) => handleInputChange("session_frequency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="quinzenal">Quinzenal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="sob_demanda">Sob demanda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === "create" ? "Adicionar Paciente" : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
