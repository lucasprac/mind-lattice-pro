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
import { Plus, Network } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePatients, Patient } from "@/hooks/usePatients";
import { NetworkCanvas } from "./NetworkCanvas";

interface NetworkDialogProps {
  onNetworkAdded?: () => void;
  trigger?: React.ReactNode;
  selectedPatient?: Patient;
}

export const NetworkDialog = ({ onNetworkAdded, trigger, selectedPatient }: NetworkDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'canvas'>('info');
  const { user } = useAuth();
  const { patients } = usePatients();
  
  const [formData, setFormData] = useState({
    patient_id: selectedPatient?.id || "",
    name: "",
    description: "",
    version: 1,
  });

  const [networkData, setNetworkData] = useState({
    nodes: [],
    connections: [],
  });

  const resetForm = () => {
    setFormData({
      patient_id: selectedPatient?.id || "",
      name: "",
      description: "",
      version: 1,
    });
    setNetworkData({
      nodes: [],
      connections: [],
    });
    setStep('info');
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient_id) {
      toast.error("Selecione um paciente");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Nome da rede é obrigatório");
      return;
    }

    setStep('canvas');
  };

  const handleNetworkSave = async (data: { nodes: any[]; connections: any[] }) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }

    if (data.nodes.length === 0) {
      toast.error("Adicione pelo menos um processo à rede");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("networks").insert({
        therapist_id: user.id,
        patient_id: formData.patient_id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        network_data: {
          nodes: data.nodes,
          connections: data.connections,
          metadata: {
            created_at: new Date().toISOString(),
            total_nodes: data.nodes.length,
            total_connections: data.connections.length,
            dimensions_used: [...new Set(data.nodes.map((n: any) => n.dimension))],
            levels_used: [...new Set(data.nodes.map((n: any) => n.level))],
          }
        },
        version: formData.version,
      });

      if (error) {
        console.error("Erro ao criar rede:", error);
        toast.error("Erro ao criar rede: " + error.message);
        return;
      }

      toast.success("Rede criada com sucesso!");
      resetForm();
      setOpen(false);
      onNetworkAdded?.();
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast.error("Erro inesperado ao criar rede");
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button size="lg" className="gap-2">
      <Plus className="h-5 w-5" />
      Nova Rede
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[95vw] sm:max-h-[95vh] overflow-hidden">
        {step === 'info' ? (
          // Step 1: Network Information
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Criar Nova Rede de Processos
              </DialogTitle>
              <DialogDescription>
                Configure as informações básicas da rede antes de iniciar a edição visual.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleInfoSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="patient_id">Paciente *</Label>
                  <Select 
                    value={formData.patient_id} 
                    onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                    disabled={!!selectedPatient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients
                        .filter(p => p.status === 'active')
                        .map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.full_name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="name">Nome da Rede *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Rede de Ansiedade Social - Sessão 1"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o contexto e objetivo desta rede de processos..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="version">Versão</Label>
                  <Input
                    id="version"
                    type="number"
                    min="1"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Continuar para Editor
                </Button>
              </DialogFooter>
            </form>
            
            {/* Information about EEMM */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Sobre o Modelo EEMM</h4>
              <p className="text-sm text-muted-foreground mb-2">
                O editor permite criar redes de processos baseadas no Modelo Meta-evolutivo Estendido (EEMM),
                organizando processos psicológicos em 5 dimensões e 3 níveis.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Dimensões:</strong> Cognição, Emoção, Self, Motivação, Comportamento Explícito</li>
                <li>• <strong>Níveis:</strong> Biologia/Fisiologia, Psicologia, Relacionamentos Sociais/Cultura</li>
                <li>• <strong>Editor:</strong> Interface drag-and-drop com conexões interativas entre processos</li>
              </ul>
            </div>
          </>
        ) : (
          // Step 2: Network Canvas Editor
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Editor de Rede: {formData.name}
              </DialogTitle>
              <DialogDescription>
                Use o editor visual para criar processos e conexões. Arraste os elementos, conecte processos e organize sua rede.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-auto max-h-[70vh]">
              <NetworkCanvas
                networkData={networkData}
                onSave={handleNetworkSave}
              />
            </div>
            
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('info')}
                disabled={loading}
              >
                Voltar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleNetworkSave(networkData)}
                disabled={loading}
                className="hidden" // Will be triggered by NetworkCanvas save button
              >
                {loading ? "Salvando..." : "Salvar Rede"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};