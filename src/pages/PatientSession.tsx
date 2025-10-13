import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, FileText, Calendar } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useRecords } from "@/hooks/useRecords";
import { toast } from "sonner";

const PatientSession = () => {
  const { patientId, recordId } = useParams<{ patientId: string; recordId?: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { records, createRecord, updateRecord } = useRecords(patientId);
  
  const patient = patients.find(p => p.id === patientId);
  const existingRecord = recordId ? records.find(r => r.id === recordId) : null;
  
  const [sessionDate, setSessionDate] = useState(
    existingRecord?.session_date 
      ? new Date(existingRecord.session_date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState(existingRecord?.description || "");
  const [observations, setObservations] = useState(existingRecord?.observations || "");
  const [keywords, setKeywords] = useState(existingRecord?.keywords.join(", ") || "");
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    if (!description.trim()) {
      toast.error("Por favor, adicione uma descrição da sessão");
      return;
    }

    setSaving(true);
    try {
      const keywordsArray = keywords
        .split(",")
        .map(k => k.trim())
        .filter(k => k.length > 0);

      if (recordId && updateRecord) {
        // Update existing record
        const success = await updateRecord(recordId, {
          session_date: new Date(sessionDate).toISOString(),
          description: description.trim(),
          observations: observations.trim() || undefined,
          keywords: keywordsArray,
        });

        if (success) {
          navigate(`/patients/${patientId}/session/${recordId}/roadmap`);
        }
      } else if (createRecord) {
        // Create new record
        const sessionNumber = records.length + 1;
        
        const newRecord = await createRecord({
          patient_id: patientId!,
          session_date: new Date(sessionDate).toISOString(),
          session_number: sessionNumber,
          description: description.trim(),
          observations: observations.trim() || undefined,
          keywords: keywordsArray,
        });

        if (newRecord) {
          navigate(`/patients/${patientId}/session/${newRecord.id}/roadmap`);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar prontuário:", error);
      toast.error("Erro ao salvar prontuário");
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-3xl font-bold mb-2">
          {recordId ? "Editar Prontuário" : "Nova Sessão"} - {patient.full_name}
        </h1>
        <p className="text-muted-foreground">
          {recordId 
            ? "Atualize as informações da sessão" 
            : "Registre os dados da consulta para iniciar a análise"}
        </p>
      </div>

      {/* Journey Progress Card */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-purple-600" />
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                Etapa 1 de 5
              </Badge>
              <span className="text-sm font-medium">Prontuário da Sessão</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="session-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data da Sessão
            </Label>
            <Input
              id="session-date"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descrição da Consulta <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva o que foi trabalhado nesta sessão..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">
              Palavras-chave
            </Label>
            <Input
              id="keywords"
              placeholder="Separar por vírgulas (ex: ansiedade, evitação, trabalho)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Palavras-chave facilitam a busca e organização dos prontuários
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">
              Observações Adicionais
            </Label>
            <Textarea
              id="observations"
              placeholder="Notas, observações comportamentais, homework, etc..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/patients/${patientId}`)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : recordId ? "Salvar Alterações" : "Criar e Continuar"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PatientSession;