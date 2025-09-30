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
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, X, Tag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePatients, Patient } from "@/hooks/usePatients";

interface RecordDialogProps {
  onRecordAdded?: () => void;
  trigger?: React.ReactNode;
  selectedPatient?: Patient;
}

// Lista de palavras-chave pré-definidas baseadas na PBT
const PREDEFINED_KEYWORDS = [
  "Cognição", "Emoção", "Self", "Motivação", "Comportamento Explícito",
  "Ansiedade", "Depressão", "Evitação", "Fusão Cognitiva", "Regulação Emocional",
  "Autoestima", "Valores", "Aceitação", "Mindfulness", "Relacionamentos",
  "Assertividade", "Autoeficácia", "Resiliência", "Autocompaixão", "Flexibilidade Psicológica",
  "Ruminação", "Catastrofização", "Pensamento Dicotômico", "Perfeccionismo", "Controle",
  "Experiencial", "Contextual", "Funcional", "Processo", "Mudança",
  "Trauma", "Luto", "Raiva", "Medo", "Culpa", "Vergonha", "Esperança"
];

export const RecordDialog = ({ onRecordAdded, trigger, selectedPatient }: RecordDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { patients } = usePatients();
  
  const [formData, setFormData] = useState({
    patient_id: selectedPatient?.id || "",
    session_number: 1,
    description: "",
    keywords: [] as string[],
    observations: "",
  });

  const [customKeyword, setCustomKeyword] = useState("");

  const resetForm = () => {
    setFormData({
      patient_id: selectedPatient?.id || "",
      session_number: 1,
      description: "",
      keywords: [],
      observations: "",
    });
    setCustomKeyword("");
  };

  const addKeyword = (keyword: string) => {
    if (keyword && !formData.keywords.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keywordToRemove)
    }));
  };

  const addCustomKeyword = () => {
    if (customKeyword.trim()) {
      addKeyword(customKeyword.trim());
      setCustomKeyword("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }

    if (!formData.patient_id) {
      toast.error("Selecione um paciente");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Descrição da consulta é obrigatória");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("records").insert({
        therapist_id: user.id,
        patient_id: formData.patient_id,
        session_number: formData.session_number,
        description: formData.description.trim(),
        keywords: formData.keywords,
        observations: formData.observations.trim() || null,
      });

      if (error) {
        console.error("Erro ao criar registro:", error);
        toast.error("Erro ao registrar consulta: " + error.message);
        return;
      }

      toast.success("Consulta registrada com sucesso!");
      resetForm();
      setOpen(false);
      onRecordAdded?.();
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast.error("Erro inesperado ao registrar consulta");
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button size="lg" className="gap-2">
      <Plus className="h-5 w-5" />
      Nova Consulta
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Registrar Nova Consulta
          </DialogTitle>
          <DialogDescription>
            Documente a sessão com descrição detalhada e palavras-chave para análise posterior.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
            
            <div>
              <Label htmlFor="session_number">Número da Sessão</Label>
              <Input
                id="session_number"
                type="number"
                min="1"
                value={formData.session_number}
                onChange={(e) => setFormData({ ...formData, session_number: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Descrição da Consulta *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva detalhadamente o que aconteceu durante a consulta, temas abordados, técnicas utilizadas, reações do paciente, insights obtidos..."
              rows={8}
              className="resize-none"
              required
            />
          </div>
          
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4" />
              Palavras-chave
            </Label>
            
            {/* Palavras-chave selecionadas */}
            {formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 p-3 bg-muted/50 rounded-lg">
                {formData.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="gap-2">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Palavras-chave pré-definidas */}
            <div className="mb-3">
              <Label className="text-sm text-muted-foreground mb-2 block">
                Palavras-chave sugeridas (clique para adicionar):
              </Label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_KEYWORDS
                  .filter(keyword => !formData.keywords.includes(keyword))
                  .map((keyword) => (
                    <Badge 
                      key={keyword} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => addKeyword(keyword)}
                    >
                      {keyword}
                    </Badge>
                  ))
                }
              </div>
            </div>
            
            {/* Adicionar palavra-chave personalizada */}
            <div className="flex gap-2">
              <Input
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                placeholder="Digite uma palavra-chave personalizada..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomKeyword();
                  }
                }}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addCustomKeyword}
                disabled={!customKeyword.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="observations">Observações Adicionais</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Observações sobre o estado geral do paciente, mudanças percebidas, próximos passos..."
              rows={3}
            />
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
              {loading ? "Registrando..." : "Registrar Consulta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};