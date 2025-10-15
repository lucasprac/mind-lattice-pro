import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Lock, Grid3x3, CheckCircle } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { usePatientMediators } from "@/hooks/usePatientMediators";
import { usePatientFunctionalAnalysis } from "@/hooks/usePatientFunctionalAnalysis";
import { useRecords } from "@/hooks/useRecords";

const GUIDING_QUESTIONS = { /* unchanged */ } as const;

const PatientFunctionalAnalysis = () => {
  const { patientId, recordId } = useParams<{ patientId: string; recordId: string }>();
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { records } = useRecords(patientId);
  const { mediatorProcesses, loading: mediatorsLoading } = usePatientMediators(patientId || "", recordId);
  const { analyses: savedAnalyses, saveAnalysis, getAnalysisForProcess, loading: analysisLoading } = usePatientFunctionalAnalysis(patientId || "", recordId);

  const [selectedProcessInfo, setSelectedProcessInfo] = useState<{process: string, dimension: string, mediator: string} | null>(null);
  const [selectionAnalysis, setSelectionAnalysis] = useState("");
  const [variationAnalysis, setVariationAnalysis] = useState("");
  const [retentionAnalysis, setRetentionAnalysis] = useState("");

  const patient = patients.find(p => p.id === patientId);
  const record = records.find(r => r.id === recordId);

  // Build list safely even when mediatorProcesses is empty
  const processesWithMediators: Array<{process: string, dimension: string, mediator: string}> = [];
  if (mediatorProcesses && typeof mediatorProcesses === 'object') {
    Object.entries(mediatorProcesses).forEach(([dimension, mediators]) => {
      if (mediators && typeof mediators === 'object') {
        Object.entries(mediators as Record<string, string[]>).forEach(([mediator, processes]) => {
          (processes || []).forEach(process => {
            if (process) processesWithMediators.push({ process, dimension, mediator });
          });
        });
      }
    });
  }

  useEffect(() => {
    if (selectedProcessInfo) {
      const existing = getAnalysisForProcess(selectedProcessInfo.process);
      if (existing) {
        setSelectionAnalysis(existing.selectionAnalysis || "");
        setVariationAnalysis(existing.variationAnalysis || "");
        setRetentionAnalysis(existing.retentionAnalysis || "");
      } else {
        setSelectionAnalysis("");
        setVariationAnalysis("");
        setRetentionAnalysis("");
      }
    }
  }, [selectedProcessInfo]);

  const handleSave = async () => {
    if (!selectedProcessInfo || !patientId) return;
    const existing = getAnalysisForProcess(selectedProcessInfo.process);
    const success = await saveAnalysis({
      id: existing?.id,
      processName: selectedProcessInfo.process,
      dimension: selectedProcessInfo.dimension,
      mediator: selectedProcessInfo.mediator,
      selectionAnalysis,
      variationAnalysis,
      retentionAnalysis,
    } as any);
    // optional: show toast via hook
  };

  if (!patient || !record) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {!patient ? "Paciente não encontrado" : "Sessão não encontrada"}
          </p>
          <Button className="mt-4" onClick={() => navigate("/patients")}>
            Voltar para Pacientes
          </Button>
        </Card>
      </div>
    );
  }

  const analyzedCount = savedAnalyses.length;
  const totalProcesses = processesWithMediators.length;

  return (
    <div className="space-y-6">
      {/* ... keep the rest of the JSX unchanged, now with CheckCircle imported and safe maps ... */}
    </div>
  );
};

export default PatientFunctionalAnalysis;
