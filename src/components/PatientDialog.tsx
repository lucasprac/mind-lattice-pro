import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { validationUtils } from "@/lib/validation";
import { handleError } from "@/lib/error-handler";

interface PatientDialogProps {
  onPatientAdded?: () => void;
  trigger?: React.ReactNode;
}

export const PatientDialog = ({ onPatientAdded, trigger }: PatientDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    email: "",
    phone: "",
    gender: "" as "male" | "female" | "other" | "prefer_not_to_say" | "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    notes: "",
    status: "active" as "active" | "inactive" | "discharged",
  });

  const resetForm = () => {
    setFormData({
      full_name: "",
      birth_date: "",
      email: "",
      phone: "",
      gender: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      notes: "",
      status: "active",
    });
  };

  const validateForm = () => {
    if (!validationUtils.isNotEmpty(formData.full_name)) {
      toast.error("Nome completo é obrigatório");
      return false;
    }

    if (formData.email && !validationUtils.isValidEmail(formData.email)) {
      toast.error("Email inválido");
      return false;
    }

    if (formData.phone && !validationUtils.isValidPhone(formData.phone)) {
      toast.error("Telefone deve estar no formato (XX) XXXXX-XXXX");
      return false;
    }

    if (formData.birth_date && !validationUtils.isValidBirthDate(formData.birth_date)) {
      toast.error("Data de nascimento inválida");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Sanitizar dados antes de enviar
      const sanitizedData = {
        therapist_id: user.id,
        full_name: validationUtils.sanitizeString(formData.full_name),
        birth_date: formData.birth_date || null,
        email: formData.email?.trim() || null,
        phone: formData.phone ? validationUtils.formatPhone(formData.phone) : null,
        gender: formData.gender || null,
        emergency_contact_name: formData.emergency_contact_name?.trim() || null,
        emergency_contact_phone: formData.emergency_contact_phone ? 
          validationUtils.formatPhone(formData.emergency_contact_phone) : null,
        notes: formData.notes?.trim() || null,
        status: formData.status,
      };

      const { error } = await supabase
        .from("patients")
        .insert(sanitizedData);

      if (error) {
        throw error;
      }

      toast.success("Paciente criado com sucesso!");
      resetForm();
      setOpen(false);
      onPatientAdded?.();
    } catch (error) {
      handleError(error, {
        context: 'PatientDialog.handleSubmit',
        userId: user?.id,
        formData: { ...formData, full_name: '[REDACTED]' } // Não logar dados sensíveis
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button size="lg" className="gap-2">
      <Plus className="h-5 w-5" />
      Novo Paciente
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Adicionar Novo Paciente
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do paciente para criar o prontuário.
            Os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Digite o nome completo"
                required
                maxLength={100}
              />
            </div>
            
            <div>
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                max={new Date().toISOString().split('T')[0]} // Não permitir datas futuras
              />
            </div>
            
            <div>
              <Label htmlFor="gender">Gênero</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  gender: value as "male" | "female" | "other" | "prefer_not_to_say" 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefiro não dizer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => {
                  // Auto-formatação do telefone durante digitação
                  const formatted = validationUtils.formatPhone(e.target.value);
                  setFormData({ ...formData, phone: formatted });
                }}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  status: value as "active" | "inactive" | "discharged" 
                })}
              >
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
            
            <div>
              <Label htmlFor="emergency_contact_name">Contato de Emergência</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                placeholder="Nome do contato"
                maxLength={100}
              />
            </div>
            
            <div>
              <Label htmlFor="emergency_contact_phone">Telefone de Emergência</Label>
              <Input
                id="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={(e) => {
                  const formatted = validationUtils.formatPhone(e.target.value);
                  setFormData({ ...formData, emergency_contact_phone: formatted });
                }}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações sobre o paciente..."
                rows={3}
                maxLength={1000}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Paciente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};