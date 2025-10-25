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
import { handleError } from "@/lib/error-handler";

interface PatientDialogProps {
  onPatientAdded?: () => void;
  trigger?: React.ReactNode;
}

export const PatientDialog = ({ onPatientAdded, trigger }: PatientDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // Formulário simplificado com apenas campos garantidos
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    notes: "",
    status: "active" as "active" | "inactive" | "discharged",
  });

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      notes: "",
      status: "active",
    });
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast.error("Nome completo é obrigatório");
      return false;
    }

    if (formData.full_name.trim().length < 2) {
      toast.error("Nome deve ter pelo menos 2 caracteres");
      return false;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      toast.error("Email inválido");
      return false;
    }

    return true;
  };

  // Função simples para validar email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função para formatar telefone
  const formatPhone = (phone: string): string => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    return phone;
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
      // Dados mínimos garantidos para funcionar
      const patientData = {
        therapist_id: user.id,
        full_name: formData.full_name.trim(),
        // Campos opcionais apenas se tiverem valor
        ...(formData.email?.trim() && { email: formData.email.trim() }),
        ...(formData.phone?.trim() && { phone: formatPhone(formData.phone) }),
        ...(formData.notes?.trim() && { notes: formData.notes.trim() }),
        ...(formData.status && { status: formData.status })
      };

      console.log('Dados a serem enviados:', patientData);

      const { data, error } = await supabase
        .from("patients")
        .insert(patientData)
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado do Supabase:', error);
        throw error;
      }

      console.log('Paciente criado com sucesso:', data);
      toast.success("Paciente criado com sucesso!");
      resetForm();
      setOpen(false);
      onPatientAdded?.();
    } catch (error: any) {
      console.error('Erro ao criar paciente:', error);
      
      // Tratamento mais específico dos erros
      if (error?.message?.includes('column')) {
        toast.error(`Erro no banco de dados: ${error.message}`);
      } else if (error?.code === '23505') {
        toast.error('Já existe um paciente com essas informações');
      } else {
        toast.error(`Erro ao criar paciente: ${error.message || 'Erro desconhecido'}`);
      }
      
      handleError(error, {
        context: 'PatientDialog.handleSubmit',
        userId: user?.id,
        formData: { ...formData, full_name: '[REDACTED]' }
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Adicionar Novo Paciente
          </DialogTitle>
          <DialogDescription>
            Preencha as informações básicas do paciente.
            Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Nome Completo - Obrigatório */}
            <div>
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Digite o nome completo do paciente"
                required
                maxLength={100}
                className="mt-1"
              />
            </div>
            
            {/* Email - Opcional */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                className="mt-1"
              />
            </div>
            
            {/* Telefone - Opcional */}
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setFormData({ ...formData, phone: formatted });
                }}
                placeholder="(11) 99999-9999"
                maxLength={15}
                className="mt-1"
              />
            </div>
            
            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  status: value as "active" | "inactive" | "discharged" 
                })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="discharged">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Observações - Opcional */}
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações sobre o paciente..."
                rows={3}
                maxLength={500}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
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
        
        {/* Debug info em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <strong>Debug:</strong>
            <pre className="mt-1">{JSON.stringify(formData, null, 2)}</pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};